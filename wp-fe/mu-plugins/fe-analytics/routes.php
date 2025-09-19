<?php
if (!defined('ABSPATH')) exit;
if (defined('FE_ANALYTICS_ROUTES_LOADED')) return; define('FE_ANALYTICS_ROUTES_LOADED', true);

add_action('rest_api_init', function () {
    $ns = 'fe-analytics/v1';

    // check
    register_rest_route($ns, '/check', [
        'methods'  => 'GET',
        'permission_callback' => function () { return current_user_can('manage_options'); },
        'callback' => function () {
            global $wpdb;
            $prefix = $wpdb->prefix;
            $tables = [ 'post_views', 'post_view_meta', 'post_view_sessions', 'post_views_daily' ];
            $results = [];
            foreach ($tables as $tbl) {
                $tbl  = sanitize_key($tbl);
                $full = $prefix . $tbl;
                $exists = $wpdb->get_var($wpdb->prepare('SHOW TABLES LIKE %s', $full));
                if ($exists) {
                    $count = $wpdb->get_var("SELECT COUNT(*) FROM `{$full}`");
                    $results[$tbl] = [ 'exists' => true, 'rows' => is_numeric($count) ? (int)$count : 0, 'error' => $wpdb->last_error ?: null ];
                } else {
                    $results[$tbl] = [ 'exists' => false, 'rows' => null, 'error' => null ];
                }
            }
            return [ 'status' => 'ok', 'checked' => current_time('mysql'), 'tables' => $results ];
        }
    ]);

    // views (with optional from/to)
    register_rest_route($ns, '/views', [
        'methods'  => 'GET',
        'permission_callback' => '__return_true',
        'callback' => function (WP_REST_Request $req) {
            global $wpdb;
            $prefix = $wpdb->prefix;
            $period = $req->get_param('period') ?: 'month';
            $from   = $req->get_param('from');
            $to     = $req->get_param('to');

            $interval = match ($period) {
                'day'   => '1 DAY',
                'week'  => '7 DAY',
                'month' => '30 DAY',
                default => '30 DAY',
            };
            $where = '1=1';
            if ($from && preg_match('/^\d{4}-\d{2}-\d{2}$/', $from)) {
                $where .= $wpdb->prepare(' AND v.viewed_at >= %s', $from . ' 00:00:00');
            } else {
                $where .= " AND v.viewed_at >= (NOW() - INTERVAL $interval)";
            }
            if ($to && preg_match('/^\d{4}-\d{2}-\d{2}$/', $to)) {
                $where .= $wpdb->prepare(' AND v.viewed_at <= %s', $to . ' 23:59:59');
            }

        $sql = "SELECT DATE(v.viewed_at) as day, COUNT(*) as views
            FROM {$prefix}post_views v
            WHERE $where
            GROUP BY day
            ORDER BY day ASC";
        $rows = $wpdb->get_results($sql);
        if ($wpdb->last_error) error_log('FE Analytics /views SQL error: ' . $wpdb->last_error);
        return $rows ?: [];
        }
    ]);

    // devices
    register_rest_route($ns, '/devices', [
        'methods'  => 'GET',
        'permission_callback' => '__return_true',
        'callback' => function (WP_REST_Request $req) {
            global $wpdb; $prefix = $wpdb->prefix;
            $limit = max(1, min(50, absint($req->get_param('limit') ?: 10)));
            $sql = $wpdb->prepare("SELECT m.device_type as device, COUNT(*) as views
                                   FROM {$prefix}post_view_meta m
                                   GROUP BY m.device_type
                                   ORDER BY views DESC
                                   LIMIT %d", $limit);
            $rows = $wpdb->get_results($sql);
            if ($wpdb->last_error) error_log('FE Analytics /devices SQL error: ' . $wpdb->last_error);
            return $rows ?: [];
        }
    ]);

    // countries
    register_rest_route($ns, '/countries', [
        'methods'  => 'GET',
        'permission_callback' => '__return_true',
        'callback' => function (WP_REST_Request $req) {
            global $wpdb; $prefix = $wpdb->prefix;
            $limit = max(1, min(100, absint($req->get_param('limit') ?: 50)));
            
            // Enhanced query to include city and country names
            $sql = $wpdb->prepare("SELECT 
                                        COALESCE(m.country_name, m.country_code) as country,
                                        m.country_code,
                                        m.city_name,
                                        m.region_name,
                                        COUNT(*) as views
                                   FROM {$prefix}post_view_meta m
                                   WHERE (m.country_code IS NOT NULL AND m.country_code <> '') 
                                      OR (m.country_name IS NOT NULL AND m.country_name <> '')
                                   GROUP BY m.country_code, m.country_name, m.city_name, m.region_name
                                   ORDER BY views DESC
                                   LIMIT %d", $limit);
            $rows = $wpdb->get_results($sql);
            if ($wpdb->last_error) error_log('FE Analytics /countries SQL error: ' . $wpdb->last_error);
            return $rows ?: [];
        }
    ]);

    // cities - New endpoint for city-level analytics
    register_rest_route($ns, '/cities', [
        'methods'  => 'GET',
        'permission_callback' => '__return_true',
        'callback' => function (WP_REST_Request $req) {
            global $wpdb; $prefix = $wpdb->prefix;
            $limit = max(1, min(100, absint($req->get_param('limit') ?: 50)));
            $country = $req->get_param('country'); // Optional filter by country
            
            $where_clause = "WHERE m.city_name IS NOT NULL AND m.city_name <> ''";
            $params = [$limit];
            
            if ($country) {
                $where_clause .= " AND m.country_code = %s";
                array_unshift($params, $country);
            }
            
            $sql = $wpdb->prepare("SELECT 
                                        m.city_name as city,
                                        m.region_name as region,
                                        COALESCE(m.country_name, m.country_code) as country,
                                        m.country_code,
                                        COUNT(*) as views
                                   FROM {$prefix}post_view_meta m
                                   $where_clause
                                   GROUP BY m.city_name, m.region_name, m.country_code, m.country_name
                                   ORDER BY views DESC
                                   LIMIT %d", ...$params);
            $rows = $wpdb->get_results($sql);
            if ($wpdb->last_error) error_log('FE Analytics /cities SQL error: ' . $wpdb->last_error);
            return $rows ?: [];
        }
    ]);

    // referers
    register_rest_route($ns, '/referers', [
        'methods'  => 'GET',
        'permission_callback' => '__return_true',
        'callback' => function (WP_REST_Request $req) {
            global $wpdb; $prefix = $wpdb->prefix;
            $limit = max(1, min(100, absint($req->get_param('limit') ?: 50)));
            $sql = $wpdb->prepare("SELECT m.referer, COUNT(*) as views
                                   FROM {$prefix}post_view_meta m
                                   WHERE m.referer IS NOT NULL AND m.referer <> ''
                                   GROUP BY m.referer
                                   ORDER BY views DESC
                                   LIMIT %d", $limit);
            $rows = $wpdb->get_results($sql);
            if ($wpdb->last_error) error_log('FE Analytics /referers SQL error: ' . $wpdb->last_error);
            return $rows ?: [];
        }
    ]);

    // sessions (basic list)
    register_rest_route($ns, '/sessions', [
        'methods'  => 'GET',
        'permission_callback' => '__return_true',
        'callback' => function (WP_REST_Request $req) {
            global $wpdb; $prefix = $wpdb->prefix;
            $limit = absint($req->get_param('limit')) ?: 50;
            $days  = absint($req->get_param('days')) ?: 30;
            $tbl = $prefix . 'post_view_sessions';
            $exists = $wpdb->get_var($wpdb->prepare('SHOW TABLES LIKE %s', $tbl));
            if (!$exists) return [];
            $sql = $wpdb->prepare("SELECT s.id, s.session_hash, s.user_id, s.first_seen, s.last_seen, s.total_views
                                    FROM {$prefix}post_view_sessions s
                                    WHERE s.last_seen >= (NOW() - INTERVAL %d DAY)
                                    ORDER BY s.last_seen DESC
                                    LIMIT %d", $days, $limit);
            return rest_ensure_response($wpdb->get_results($sql) ?: []);
        }
    ]);

    // sessions/summary
    register_rest_route($ns, '/sessions/summary', [
        'methods'  => 'GET',
        'permission_callback' => '__return_true',
        'callback' => function () {
            global $wpdb; $prefix = $wpdb->prefix;
            $tbl = $prefix . 'post_view_sessions';
            $exists = $wpdb->get_var($wpdb->prepare('SHOW TABLES LIKE %s', $tbl));
            if (!$exists) return ['totalSessions' => 0, 'activeSessions' => 0];
            
            $total = $wpdb->get_var("SELECT COUNT(*) FROM {$prefix}post_view_sessions");
            $active = $wpdb->get_var("SELECT COUNT(*) FROM {$prefix}post_view_sessions WHERE last_seen >= (NOW() - INTERVAL 1 HOUR)");
            
            return [
                'totalSessions' => (int)$total,
                'activeSessions' => (int)$active,
                'timestamp' => current_time('mysql')
            ];
        }
    ]);

    // sessions/timeseries
    register_rest_route($ns, '/sessions/timeseries', [
        'methods'  => 'GET',
        'permission_callback' => '__return_true',
        'callback' => function (WP_REST_Request $req) {
            global $wpdb; $prefix = $wpdb->prefix;
            $days = absint($req->get_param('days')) ?: 7;
            $tbl = $prefix . 'post_view_sessions';
            $exists = $wpdb->get_var($wpdb->prepare('SHOW TABLES LIKE %s', $tbl));
            if (!$exists) return [];
            
            $sql = $wpdb->prepare("
                SELECT DATE(first_seen) as date, COUNT(*) as sessions
                FROM {$prefix}post_view_sessions 
                WHERE first_seen >= (NOW() - INTERVAL %d DAY)
                GROUP BY DATE(first_seen)
                ORDER BY date ASC
            ", $days);
            
            $rows = $wpdb->get_results($sql);
            return $rows ?: [];
        }
    ]);

    // stream (Server-Sent Events for real-time analytics)
    register_rest_route($ns, '/stream', [
        'methods'  => 'GET',
        'permission_callback' => function () { return current_user_can('read'); },
        'callback' => function () {
            // Set headers for SSE
            header('Content-Type: text/event-stream');
            header('Cache-Control: no-cache');
            header('Connection: keep-alive');
            
            global $wpdb; $prefix = $wpdb->prefix;
            
            // Send initial data
            $sessions = $wpdb->get_var("SELECT COUNT(*) FROM {$prefix}post_view_sessions WHERE last_seen >= (NOW() - INTERVAL 1 HOUR)") ?: 0;
            
            $data = [
                'sessions' => ['sessionsNow' => (int)$sessions, 'timestamp' => current_time('c')],
                'presence' => [] // Could be enhanced with actual user presence data
            ];
            
            echo "data: " . json_encode($data) . "\n\n";
            
            // Keep connection alive for SSE
            if (ob_get_level()) {
                ob_end_flush();
            }
            flush();
            
            // Exit after sending initial data (for basic implementation)
            exit;
        }
    ]);

    // Real-time analytics endpoint
    register_rest_route($ns, '/realtime', [
        'methods'  => 'GET',
        'permission_callback' => '__return_true',
        'callback' => function (WP_REST_Request $req) {
            global $wpdb;
            $prefix = $wpdb->prefix;
            
            // Active users (last 5 minutes)
            $active_users = $wpdb->get_var($wpdb->prepare(
                "SELECT COUNT(DISTINCT s.session_hash) 
                 FROM {$prefix}page_view_sessions s 
                 WHERE s.last_seen >= %s",
                date('Y-m-d H:i:s', time() - 300)
            )) ?: 0;
            
            // Recent activity (last 50 page views)
            $recent_activity = $wpdb->get_results($wpdb->prepare(
                "SELECT v.path, v.page_title, v.viewed_at, m.country_code, m.device_type, m.city_name
                 FROM {$prefix}page_views v
                 LEFT JOIN {$prefix}page_view_meta m ON v.meta_id = m.id
                 ORDER BY v.viewed_at DESC
                 LIMIT %d",
                50
            ));
            
            // Top active pages (last hour)
            $top_active_pages = $wpdb->get_results($wpdb->prepare(
                "SELECT v.path, v.page_title, COUNT(*) as active_users
                 FROM {$prefix}page_views v
                 WHERE v.viewed_at >= %s
                 GROUP BY v.path, v.page_title
                 ORDER BY active_users DESC
                 LIMIT 10",
                date('Y-m-d H:i:s', time() - 3600)
            ));
            
            return [
                'activeUsers' => (int)$active_users,
                'recentActivity' => $recent_activity ?: [],
                'topActivePages' => $top_active_pages ?: [],
                'timestamp' => current_time('c')
            ];
        }
    ]);

    // Performance metrics endpoint
    register_rest_route($ns, '/performance', [
        'methods'  => 'GET',
        'permission_callback' => '__return_true',
        'callback' => function (WP_REST_Request $req) {
            global $wpdb;
            $prefix = $wpdb->prefix;
            $period = $req->get_param('period') ?: 'week';
            
            $interval = match ($period) {
                'day'   => '1 DAY',
                'week'  => '7 DAY',
                'month' => '30 DAY',
                default => '7 DAY',
            };
            
            // Get performance data from metadata
            $performance_data = $wpdb->get_results($wpdb->prepare(
                "SELECT v.path, v.page_title, 
                        AVG(v.time_on_page) as avg_time_on_page,
                        AVG(m.scroll_depth) as avg_scroll_depth,
                        COUNT(*) as page_views,
                        SUM(v.is_exit) as exits
                 FROM {$prefix}page_views v
                 LEFT JOIN {$prefix}page_view_meta m ON v.meta_id = m.id
                 WHERE v.viewed_at >= (NOW() - INTERVAL $interval)
                 GROUP BY v.path, v.page_title
                 ORDER BY page_views DESC
                 LIMIT 20"
            ));
            
            // Calculate bounce rates
            $bounce_rates = [];
            foreach ($performance_data as $page) {
                $bounce_rate = $page->page_views > 0 ? ($page->exits / $page->page_views) * 100 : 0;
                $bounce_rates[] = [
                    'path' => $page->path,
                    'title' => $page->page_title,
                    'avg_time_on_page' => round($page->avg_time_on_page ?: 0),
                    'avg_scroll_depth' => round($page->avg_scroll_depth ?: 0, 2),
                    'page_views' => (int)$page->page_views,
                    'bounce_rate' => round($bounce_rate, 2)
                ];
            }
            
            return $bounce_rates;
        }
    ]);

    // top-posts
    register_rest_route($ns, '/top-posts', [
        'methods'  => 'GET',
        'permission_callback' => '__return_true',
        'callback' => function (WP_REST_Request $req) {
            global $wpdb; $prefix = $wpdb->prefix;
            $period = $req->get_param('period') ?: 'month';
            $interval = match ($period) {
                'day'   => '1 DAY',
                'week'  => '7 DAY',
                'month' => '30 DAY',
                default => '30 DAY',
            };
                        $sql = $wpdb->prepare("SELECT p.ID as id, p.post_title as title, p.post_name as slug, COUNT(v.id) as views
                                                                        FROM {$prefix}posts p
                                                                        JOIN {$prefix}post_views v ON v.post_id = p.ID
                                                                        WHERE v.viewed_at >= (NOW() - INTERVAL $interval)
                                                                            AND p.post_status = 'publish'
                                                                        GROUP BY p.ID
                                                                        ORDER BY views DESC
                                                                        LIMIT 10");
                        $rows = $wpdb->get_results($sql);
                        if ($wpdb->last_error) error_log('FE Analytics /top-posts SQL error: ' . $wpdb->last_error);
                        return $rows ?: [];
        }
    ]);

    // summary
    register_rest_route($ns, '/summary', [
        'methods'  => 'GET',
        'permission_callback' => '__return_true',
        'callback' => function () {
            $viewsReq = rest_do_request(new WP_REST_Request('GET', '/fe-analytics/v1/views'));
            $devicesReq = rest_do_request(new WP_REST_Request('GET', '/fe-analytics/v1/devices'));
            $countriesReq = rest_do_request(new WP_REST_Request('GET', '/fe-analytics/v1/countries'));
            $referersReq = rest_do_request(new WP_REST_Request('GET', '/fe-analytics/v1/referers'));
            $views    = $viewsReq instanceof WP_REST_Response ? $viewsReq->get_data() : [];
            $devices  = $devicesReq instanceof WP_REST_Response ? $devicesReq->get_data() : [];
            $countries= $countriesReq instanceof WP_REST_Response ? $countriesReq->get_data() : [];
            $referers = $referersReq instanceof WP_REST_Response ? $referersReq->get_data() : [];
            return compact('views','devices','countries','referers');
        }
    ]);
});
