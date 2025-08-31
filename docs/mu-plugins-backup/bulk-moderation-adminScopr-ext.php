<?php
/**
 * MU Plugin: FE Analytics API Endpoints
 * Description: Implements analytics endpoints (views, devices, countries, referers, summary, top-posts, check).
 */

if (!defined('ABSPATH')) exit;

add_action('rest_api_init', function () {

    $ns = 'fe-analytics/v1';

    // ====================
    // /check (already exists, kept here for completeness)
    // ====================
    register_rest_route($ns, '/check', [
        'methods'  => 'GET',
        'permission_callback' => function () {
            return current_user_can('manage_options');
        },
        'callback' => function () {
            global $wpdb;
            $prefix = $wpdb->prefix;
            $tables = [
                'post_views',
                'post_view_meta',
                'post_view_sessions',
                'post_views_daily',
            ];
            $results = [];
            foreach ($tables as $tbl) {
                $tbl     = sanitize_key($tbl);
                $full    = $prefix . $tbl;
                $exists  = $wpdb->get_var($wpdb->prepare("SHOW TABLES LIKE %s", $full));
                if ($exists) {
                    $count = $wpdb->get_var("SELECT COUNT(*) FROM `{$full}`");
                    $results[$tbl] = [
                        'exists' => true,
                        'rows'   => is_numeric($count) ? intval($count) : 0,
                        'error'  => $wpdb->last_error ?: null,
                    ];
                } else {
                    $results[$tbl] = [
                        'exists' => false,
                        'rows'   => null,
                        'error'  => null,
                    ];
                }
            }
            return [
                'status' => 'ok',
                'checked' => current_time('mysql'),
                'tables' => $results,
            ];
        }
    ]);

    // ====================
    // /views
    // ====================
    register_rest_route($ns, '/views', [
        'methods'  => 'GET',
        'permission_callback' => '__return_true',
        'callback' => function (WP_REST_Request $req) {
            global $wpdb;
            $prefix = $wpdb->prefix;
            $period = $req->get_param('period') ?: 'month';
            $interval = match ($period) {
                'day'   => '1 DAY',
                'week'  => '7 DAY',
                'month' => '30 DAY',
                default => '30 DAY',
            };
            $sql = $wpdb->prepare("
                SELECT DATE(v.viewed_at) as day, COUNT(*) as views
                FROM {$prefix}post_views v
                WHERE v.viewed_at >= (NOW() - INTERVAL $interval)
                GROUP BY day
                ORDER BY day ASC
            ");
            return $wpdb->get_results($sql);
        }
    ]);

    // ====================
    // /devices
    // ====================
    register_rest_route($ns, '/devices', [
        'methods'  => 'GET',
        'permission_callback' => '__return_true',
        'callback' => function (WP_REST_Request $req) {
            global $wpdb;
            $prefix = $wpdb->prefix;
            $sql = "
                SELECT m.device_type as device, COUNT(*) as views
                FROM {$prefix}post_view_meta m
                GROUP BY m.device_type
                ORDER BY views DESC
            ";
            return $wpdb->get_results($sql);
        }
    ]);

    // ====================
    // /countries
    // ====================
    register_rest_route($ns, '/countries', [
        'methods'  => 'GET',
        'permission_callback' => '__return_true',
        'callback' => function (WP_REST_Request $req) {
            global $wpdb;
            $prefix = $wpdb->prefix;
            $sql = "
                SELECT m.country_code as country, COUNT(*) as views
                FROM {$prefix}post_view_meta m
                WHERE m.country_code IS NOT NULL AND m.country_code <> ''
                GROUP BY m.country_code
                ORDER BY views DESC
                LIMIT 50
            ";
            return $wpdb->get_results($sql);
        }
    ]);

    // ====================
    // /referers
    // ====================
    register_rest_route($ns, '/referers', [
        'methods'  => 'GET',
        'permission_callback' => '__return_true',
        'callback' => function (WP_REST_Request $req) {
            global $wpdb;
            $prefix = $wpdb->prefix;
            $sql = "
                SELECT m.referer, COUNT(*) as views
                FROM {$prefix}post_view_meta m
                WHERE m.referer IS NOT NULL AND m.referer <> ''
                GROUP BY m.referer
                ORDER BY views DESC
                LIMIT 50
            ";
            return $wpdb->get_results($sql);
        }
    ]);

    // ====================
    // /top-posts
    // ====================
    register_rest_route($ns, '/top-posts', [
        'methods'  => 'GET',
        'permission_callback' => '__return_true',
        'callback' => function (WP_REST_Request $req) {
            global $wpdb;
            $prefix = $wpdb->prefix;
            $period = $req->get_param('period') ?: 'month';
            $interval = match ($period) {
                'day'   => '1 DAY',
                'week'  => '7 DAY',
                'month' => '30 DAY',
                default => '30 DAY',
            };
            $sql = $wpdb->prepare("
                SELECT p.ID as id, p.post_title as title, p.post_name as slug,
                       COUNT(v.id) as views
                FROM {$prefix}posts p
                JOIN {$prefix}post_views v ON v.post_id = p.ID
                WHERE v.viewed_at >= (NOW() - INTERVAL $interval)
                  AND p.post_status = 'publish'
                GROUP BY p.ID
                ORDER BY views DESC
                LIMIT 10
            ");
            return $wpdb->get_results($sql);
        }
    ]);

    // ====================
    // /summary (aggregates others)
    // ====================
    register_rest_route($ns, '/summary', [
        'methods'  => 'GET',
        'permission_callback' => '__return_true',
        'callback' => function (WP_REST_Request $req) {
            $request = new WP_REST_Request('GET', '/fe-analytics/v1/views');
            $views = rest_do_request($request)->get_data();

            $request = new WP_REST_Request('GET', '/fe-analytics/v1/devices');
            $devices = rest_do_request($request)->get_data();

            $request = new WP_REST_Request('GET', '/fe-analytics/v1/countries');
            $countries = rest_do_request($request)->get_data();

            $request = new WP_REST_Request('GET', '/fe-analytics/v1/referers');
            $referers = rest_do_request($request)->get_data();

            return [
                'views'     => $views,
                'devices'   => $devices,
                'countries' => $countries,
                'referers'  => $referers,
            ];
        }
    ]);

});
