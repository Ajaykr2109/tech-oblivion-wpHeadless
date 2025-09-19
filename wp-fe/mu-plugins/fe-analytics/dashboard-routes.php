<?php
if (!defined('ABSPATH')) exit;

add_action('rest_api_init', function () {
    $ns = 'fe-analytics/v1';

    // Dashboard Overview
    register_rest_route($ns, '/dashboard-overview', [
        'methods'  => 'GET',
        'permission_callback' => '__return_true',
        'callback' => function (WP_REST_Request $req) {
            global $wpdb;
            $prefix = $wpdb->prefix;
            $days = max(1, min(365, absint($req->get_param('days') ?: 7)));
            $since = date('Y-m-d H:i:s', strtotime("-{$days} days"));

            // Total views (from both page_views and post_views for compatibility)
            $total_views = 0;
            $page_views_table = $prefix . 'page_views';
            $post_views_table = $prefix . 'post_views';
            
            if ($wpdb->get_var("SHOW TABLES LIKE '$page_views_table'")) {
                $page_views = (int)$wpdb->get_var($wpdb->prepare(
                    "SELECT COUNT(*) FROM $page_views_table WHERE viewed_at >= %s", $since
                ));
                $total_views += $page_views;
            }
            
            if ($wpdb->get_var("SHOW TABLES LIKE '$post_views_table'")) {
                $post_views = (int)$wpdb->get_var($wpdb->prepare(
                    "SELECT COUNT(*) FROM $post_views_table WHERE viewed_at >= %s", $since
                ));
                $total_views += $post_views;
            }

            // Unique visitors (sessions)
            $sessions_table = $prefix . 'page_view_sessions';
            $unique_visitors = 0;
            if ($wpdb->get_var("SHOW TABLES LIKE '$sessions_table'")) {
                $unique_visitors = (int)$wpdb->get_var($wpdb->prepare(
                    "SELECT COUNT(DISTINCT session_hash) FROM $sessions_table WHERE last_seen >= %s", $since
                ));
            }

            // Average session duration
            $avg_session_duration = 0;
            if ($wpdb->get_var("SHOW TABLES LIKE '$sessions_table'")) {
                $avg_duration = $wpdb->get_var($wpdb->prepare(
                    "SELECT AVG(TIMESTAMPDIFF(SECOND, first_seen, last_seen)) FROM $sessions_table WHERE last_seen >= %s", $since
                ));
                $avg_session_duration = $avg_duration ? (int)$avg_duration : 0;
            }

            // Bounce rate (sessions with only 1 page view)
            $bounce_rate = 0;
            if ($wpdb->get_var("SHOW TABLES LIKE '$sessions_table'")) {
                $total_sessions = (int)$wpdb->get_var($wpdb->prepare(
                    "SELECT COUNT(*) FROM $sessions_table WHERE last_seen >= %s", $since
                ));
                $single_page_sessions = (int)$wpdb->get_var($wpdb->prepare(
                    "SELECT COUNT(*) FROM $sessions_table WHERE last_seen >= %s AND total_views = 1", $since
                ));
                $bounce_rate = $total_sessions > 0 ? round(($single_page_sessions / $total_sessions) * 100) : 0;
            }

            // Top countries
            $top_countries = [];
            $meta_table = $prefix . 'page_view_meta';
            if ($wpdb->get_var("SHOW TABLES LIKE '$meta_table'")) {
                $countries_sql = $wpdb->prepare("
                    SELECT m.country_code as country, COUNT(*) as count
                    FROM $meta_table m
                    JOIN $page_views_table pv ON pv.meta_id = m.id
                    WHERE pv.viewed_at >= %s AND m.country_code IS NOT NULL
                    GROUP BY m.country_code
                    ORDER BY count DESC
                    LIMIT 10
                ", $since);
                $top_countries = $wpdb->get_results($countries_sql, ARRAY_A) ?: [];
            }

            // Top devices
            $top_devices = [];
            if ($wpdb->get_var("SHOW TABLES LIKE '$meta_table'")) {
                $devices_sql = $wpdb->prepare("
                    SELECT m.device_type as device, COUNT(*) as count
                    FROM $meta_table m
                    JOIN $page_views_table pv ON pv.meta_id = m.id
                    WHERE pv.viewed_at >= %s
                    GROUP BY m.device_type
                    ORDER BY count DESC
                    LIMIT 10
                ", $since);
                $top_devices = $wpdb->get_results($devices_sql, ARRAY_A) ?: [];
            }

            // Top pages
            $top_pages = [];
            if ($wpdb->get_var("SHOW TABLES LIKE '$page_views_table'")) {
                $pages_sql = $wpdb->prepare("
                    SELECT path, page_title as title, COUNT(*) as views
                    FROM $page_views_table
                    WHERE viewed_at >= %s
                    GROUP BY path, page_title
                    ORDER BY views DESC
                    LIMIT 10
                ", $since);
                $top_pages = $wpdb->get_results($pages_sql, ARRAY_A) ?: [];
            }

            return [
                'totalViews' => $total_views,
                'uniqueVisitors' => $unique_visitors,
                'pageViews' => $total_views, // Same as total views for now
                'avgSessionDuration' => $avg_session_duration,
                'bounceRate' => $bounce_rate,
                'topCountries' => $top_countries,
                'topDevices' => $top_devices,
                'topPages' => $top_pages,
            ];
        }
    ]);

    // Dashboard Timeline
    register_rest_route($ns, '/dashboard-timeline', [
        'methods'  => 'GET',
        'permission_callback' => '__return_true',
        'callback' => function (WP_REST_Request $req) {
            global $wpdb;
            $prefix = $wpdb->prefix;
            $days = max(1, min(365, absint($req->get_param('days') ?: 7)));
            $page_views_table = $prefix . 'page_views';
            $sessions_table = $prefix . 'page_view_sessions';

            $timeline = [];
            if ($wpdb->get_var("SHOW TABLES LIKE '$page_views_table'")) {
                $timeline_sql = $wpdb->prepare("
                    SELECT 
                        DATE(pv.viewed_at) as date,
                        COUNT(*) as views,
                        COUNT(DISTINCT pv.session_id) as visitors,
                        COUNT(DISTINCT pv.session_id) as sessions
                    FROM $page_views_table pv
                    WHERE pv.viewed_at >= DATE_SUB(NOW(), INTERVAL %d DAY)
                    GROUP BY DATE(pv.viewed_at)
                    ORDER BY date ASC
                ", $days);
                $timeline = $wpdb->get_results($timeline_sql, ARRAY_A) ?: [];
            }

            return $timeline;
        }
    ]);

    // Dashboard Real-time
    register_rest_route($ns, '/dashboard-realtime', [
        'methods'  => 'GET',
        'permission_callback' => '__return_true',
        'callback' => function () {
            global $wpdb;
            $prefix = $wpdb->prefix;
            $page_views_table = $prefix . 'page_views';
            $meta_table = $prefix . 'page_view_meta';

            // Active users (last 5 minutes)
            $active_users = 0;
            if ($wpdb->get_var("SHOW TABLES LIKE '$page_views_table'")) {
                $active_users = (int)$wpdb->get_var("
                    SELECT COUNT(DISTINCT session_id) 
                    FROM $page_views_table 
                    WHERE viewed_at >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
                ");
            }

            // Most recent page
            $current_page = '/';
            if ($wpdb->get_var("SHOW TABLES LIKE '$page_views_table'")) {
                $latest_page = $wpdb->get_var("
                    SELECT path 
                    FROM $page_views_table 
                    ORDER BY viewed_at DESC 
                    LIMIT 1
                ");
                if ($latest_page) $current_page = $latest_page;
            }

            // Recent actions (last 10 minutes)
            $recent_actions = [];
            if ($wpdb->get_var("SHOW TABLES LIKE '$page_views_table'") && 
                $wpdb->get_var("SHOW TABLES LIKE '$meta_table'")) {
                $actions_sql = "
                    SELECT 
                        pv.path,
                        pv.viewed_at as timestamp,
                        m.country_code as country,
                        m.device_type as device,
                        'page_view' as type
                    FROM $page_views_table pv
                    LEFT JOIN $meta_table m ON pv.meta_id = m.id
                    WHERE pv.viewed_at >= DATE_SUB(NOW(), INTERVAL 10 MINUTE)
                    ORDER BY pv.viewed_at DESC
                    LIMIT 20
                ";
                $recent_actions = $wpdb->get_results($actions_sql, ARRAY_A) ?: [];
            }

            return [
                'activeUsers' => $active_users,
                'currentPage' => $current_page,
                'recentActions' => $recent_actions,
            ];
        }
    ]);
});