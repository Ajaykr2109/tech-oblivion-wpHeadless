<?php
/**
 * MU Plugin: FE Analytics Schema
 * Creates and maintains custom analytics tables (no REST routes here).
 */

if (!defined('ABSPATH')) { exit; }

function fe_ensure_analytics_tables() {
    global $wpdb;
    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');

    $charset_collate = $wpdb->get_charset_collate();

    try {
        // Enhanced metadata table (used by both page_views and post_views)
        $table_meta = $wpdb->prefix . 'page_view_meta';
        $sql_meta = "CREATE TABLE $table_meta (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            ip_address VARBINARY(16) DEFAULT NULL,
            referer VARCHAR(255) DEFAULT NULL,
            user_agent TEXT,
            device_type ENUM('mobile','tablet','desktop','unknown') DEFAULT 'unknown',
            country_code CHAR(2) DEFAULT NULL,
            screen_resolution VARCHAR(20) DEFAULT NULL,
            timezone VARCHAR(50) DEFAULT NULL,
            language VARCHAR(10) DEFAULT 'en',
            PRIMARY KEY (id),
            KEY device_type (device_type),
            KEY country_code (country_code)
        ) $charset_collate;";

        // Page Views (universal tracking)
        $table_page_views = $wpdb->prefix . 'page_views';
        $sql_page_views = "CREATE TABLE $table_page_views (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            path VARCHAR(255) NOT NULL,
            page_type ENUM('home','post','page','category','tag','author','static','other') DEFAULT 'other',
            page_identifier VARCHAR(255) DEFAULT NULL,
            post_id BIGINT UNSIGNED DEFAULT NULL,
            user_id BIGINT UNSIGNED DEFAULT NULL,
            session_id BIGINT UNSIGNED DEFAULT NULL,
            meta_id BIGINT UNSIGNED DEFAULT NULL,
            page_title VARCHAR(255) DEFAULT NULL,
            viewed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY path (path),
            KEY page_type (page_type),
            KEY page_identifier (page_identifier),
            KEY post_id (post_id),
            KEY viewed_at (viewed_at),
            KEY session_id (session_id),
            KEY meta_id (meta_id)
        ) $charset_collate;";

        // Sessions
        $table_sessions = $wpdb->prefix . 'page_view_sessions';
        $sql_sessions = "CREATE TABLE $table_sessions (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            session_hash CHAR(64) NOT NULL,
            user_id BIGINT UNSIGNED DEFAULT NULL,
            first_seen DATETIME NOT NULL,
            last_seen DATETIME NOT NULL,
            total_views INT UNSIGNED DEFAULT 0,
            PRIMARY KEY (id),
            UNIQUE KEY session_hash (session_hash),
            KEY user_id (user_id),
            KEY last_seen (last_seen)
        ) $charset_collate;";

        // Legacy post_views table (for backward compatibility)
        $table_post_views = $wpdb->prefix . 'post_views';
        $sql_post_views = "CREATE TABLE $table_post_views (
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

        // Legacy metadata table (keeping for compatibility)
        $table_legacy_meta = $wpdb->prefix . 'post_view_meta';
        $sql_legacy_meta = "CREATE TABLE $table_legacy_meta (
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

        // Daily Rollups (keeping for backward compatibility)
        $table_daily = $wpdb->prefix . 'post_views_daily';
        $sql_daily = "CREATE TABLE $table_daily (
            post_id BIGINT UNSIGNED NOT NULL,
            day DATE NOT NULL,
            views INT UNSIGNED NOT NULL,
            unique_visitors INT UNSIGNED DEFAULT 0,
            PRIMARY KEY (post_id, day)
        ) $charset_collate;";

        // Create/Update tables
        dbDelta($sql_meta);
        dbDelta($sql_page_views);
        dbDelta($sql_sessions);
        dbDelta($sql_post_views);
        dbDelta($sql_legacy_meta);
        dbDelta($sql_daily);

        // Cleanup: if older runs created multiple indexes on session_hash due to inline UNIQUE,
        // drop all duplicates keeping only the named one we just declared.
        try {
            $dupes = $wpdb->get_col($wpdb->prepare(
                "SELECT DISTINCT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = %s AND COLUMN_NAME = 'session_hash'",
                $table_sessions
            ));
            if ($dupes && is_array($dupes)) {
                foreach ($dupes as $idx) {
                    if ($idx !== 'session_hash' && $idx !== 'PRIMARY') {
                        // Best-effort drop; ignore failures
                        $wpdb->query("ALTER TABLE `$table_sessions` DROP INDEX `" . esc_sql($idx) . "`");
                    }
                }
            }
        } catch (Exception $e) {
            // ignore
        }

    } catch (Exception $e) {
        error_log('FE Analytics table creation failed: ' . $e->getMessage());
    }
}

// Run once on load (idempotent)
add_action('plugins_loaded', 'fe_ensure_analytics_tables');

