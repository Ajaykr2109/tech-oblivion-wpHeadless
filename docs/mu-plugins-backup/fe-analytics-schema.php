<?php
/**
 * MU Plugin: FE Analytics Schema + API
 * Description: Creates and maintains custom analytics tables and exposes admin API.
 */

/**
 * REST API endpoint for checking analytics tables.
 */
add_action('rest_api_init', function () {
    register_rest_route('fe-analytics/v1', '/check', [
        'methods'  => 'GET',
        'permission_callback' => function () {
            // Only allow admins (or adjust capability for specific roles)
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

            try {
                foreach ($tables as $tbl) {
                    $tbl  = sanitize_key($tbl); // harden
                    $full = $prefix . $tbl;

                    $exists = $wpdb->get_var(
                        $wpdb->prepare("SHOW TABLES LIKE %s", $full)
                    );

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

            } catch (Exception $e) {
                return new WP_REST_Response([
                    'status'  => 'error',
                    'message' => $e->getMessage(),
                    'trace'   => WP_DEBUG ? $e->getTraceAsString() : null,
                ], 500);
            }
        }
    ]);
});


/**
 * Ensure analytics tables exist (idempotent).
 */
function fe_ensure_analytics_tables() {
    global $wpdb;
    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');

    $charset_collate = $wpdb->get_charset_collate();

    try {
        // Raw Events
        $table_events = $wpdb->prefix . 'post_views';
        $sql_events = "CREATE TABLE $table_events (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            post_id BIGINT UNSIGNED NOT NULL,
            user_id BIGINT UNSIGNED DEFAULT NULL,
            session_id BIGINT UNSIGNED DEFAULT NULL,
            meta_id BIGINT UNSIGNED DEFAULT NULL,
            viewed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY post_id (post_id),
            KEY viewed_at (viewed_at),
            KEY session_id (session_id),
            KEY meta_id (meta_id)
        ) $charset_collate;";

        // Metadata
        $table_meta = $wpdb->prefix . 'post_view_meta';
        $sql_meta = "CREATE TABLE $table_meta (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            ip_address VARBINARY(16) DEFAULT NULL,
            referer VARCHAR(255) DEFAULT NULL,
            user_agent TEXT,
            device_type ENUM('mobile','tablet','desktop','unknown') DEFAULT 'unknown',
            country_code CHAR(2) DEFAULT NULL,
            PRIMARY KEY (id),
            KEY device_type (device_type),
            KEY country_code (country_code)
        ) $charset_collate;";

        // Sessions
        $table_sessions = $wpdb->prefix . 'post_view_sessions';
        $sql_sessions = "CREATE TABLE $table_sessions (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            session_hash CHAR(64) NOT NULL UNIQUE,
            user_id BIGINT UNSIGNED DEFAULT NULL,
            first_seen DATETIME NOT NULL,
            last_seen DATETIME NOT NULL,
            total_views INT UNSIGNED DEFAULT 0,
            PRIMARY KEY (id),
            KEY user_id (user_id),
            KEY last_seen (last_seen)
        ) $charset_collate;";

        // Daily Rollups
        $table_daily = $wpdb->prefix . 'post_views_daily';
        $sql_daily = "CREATE TABLE $table_daily (
            post_id BIGINT UNSIGNED NOT NULL,
            day DATE NOT NULL,
            views INT UNSIGNED NOT NULL,
            unique_visitors INT UNSIGNED DEFAULT 0,
            PRIMARY KEY (post_id, day)
        ) $charset_collate;";

        // Create/Update tables
        dbDelta($sql_events);
        dbDelta($sql_meta);
        dbDelta($sql_sessions);
        dbDelta($sql_daily);

    } catch (Exception $e) {
        error_log('FE Analytics table creation failed: ' . $e->getMessage());
    }
}
// Run once on load (idempotent)
add_action('plugins_loaded', 'fe_ensure_analytics_tables');

