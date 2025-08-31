<?php
/**
 * FE Analytics: Admin Check + Analytics Endpoints
 */

// ====================
// Admin Check Endpoint
// ====================
add_action('rest_api_init', function () {
    register_rest_route('fe-analytics/v1', '/check', [
        'methods'  => 'GET',
        'permission_callback' => function () {
            // Restrict to admins (or swap capability if needed)
            return current_user_can('manage_options'); 
        },
        'callback' => function () {
            global $wpdb;

            $prefix  = $wpdb->prefix;
            $tables  = [
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

            $env = [
                'db_version'   => $wpdb->db_version(),
                'php_version'  => PHP_VERSION,
                'wp_version'   => get_bloginfo('version'),
                'site_url'     => site_url(),
                'home_url'     => home_url(),
            ];

            return new WP_REST_Response([
                'status'  => 'ok',
                'checked' => current_time('mysql'),
                'prefix'  => $prefix,
                'tables'  => $results,
                'env'     => $env,
            ], 200);
        }
    ]);
});


// ====================
// Top Posts Endpoint
// ====================
add_action('rest_api_init', function () {
    register_rest_route('fe-analytics/v1', '/top-posts', [
        'methods'  => 'GET',
        'permission_callback' => '__return_true',
        'callback' => function (WP_REST_Request $request) {
            global $wpdb;
            $prefix = $wpdb->prefix;

            // Handle ?period=day|week|month
            $period = $request->get_param('period') ?: 'month';
            $interval = match ($period) {
                'day'   => '1 DAY',
                'week'  => '7 DAY',
                'month' => '30 DAY',
                default => '30 DAY',
            };

            // Join posts with views, filter by timeframe
            $sql = $wpdb->prepare("
                SELECT p.ID as id,
                       p.post_title as title,
                       p.post_name as slug,
                       COUNT(v.id) as views
                FROM {$prefix}posts p
                JOIN {$prefix}post_views v ON v.post_id = p.ID
                WHERE v.viewed_at >= (NOW() - INTERVAL $interval)
                  AND p.post_status = 'publish'
                GROUP BY p.ID
                ORDER BY views DESC
                LIMIT 10
            ");

            $results = $wpdb->get_results($sql);

            // In case of DB error, return structured response
            if ($wpdb->last_error) {
                return new WP_REST_Response([
                    'error'   => 'db_error',
                    'message' => $wpdb->last_error,
                ], 500);
            }

            return rest_ensure_response($results);
        },
    ]);
});

