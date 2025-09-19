<?php
/**
 * Analytics Database Diagnostic and Repair Tool
 * Diagnoses and fixes database issues causing tracking failures
 */

// This should be placed in wp-fe/mu-plugins/_devtools/ directory
$root = dirname(__DIR__, 3);
$wp_load = $root . '/wp-load.php';

if (!file_exists($wp_load)) {
    echo json_encode(['error' => "wp-load.php not found at $wp_load"]);
    exit(1);
}

require_once $wp_load;

if (!isset($wpdb)) {
    echo json_encode(['error' => 'wpdb not initialized']);
    exit(1);
}

require_once(ABSPATH . 'wp-admin/includes/upgrade.php');

header('Content-Type: application/json');

$charset_collate = $wpdb->get_charset_collate();
$prefix = $wpdb->prefix;

$results = [
    'action' => 'database_diagnostic_and_repair',
    'timestamp' => current_time('mysql'),
    'database_name' => $wpdb->dbname,
    'table_prefix' => $prefix,
    'operations' => [],
    'errors' => [],
    'success' => true
];

// Required tables with their schemas
$required_tables = [
    'page_view_meta' => "CREATE TABLE {$prefix}page_view_meta (
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
    ) $charset_collate;",
    
    'page_views' => "CREATE TABLE {$prefix}page_views (
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
    ) $charset_collate;",
    
    'page_view_sessions' => "CREATE TABLE {$prefix}page_view_sessions (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        session_hash VARCHAR(64) NOT NULL,
        user_id BIGINT UNSIGNED DEFAULT NULL,
        first_seen DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        last_seen DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        total_views INT UNSIGNED DEFAULT 1,
        PRIMARY KEY (id),
        UNIQUE KEY session_hash (session_hash),
        KEY user_id (user_id),
        KEY last_seen (last_seen)
    ) $charset_collate;",
    
    'post_views' => "CREATE TABLE {$prefix}post_views (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        post_id BIGINT UNSIGNED NOT NULL,
        user_id BIGINT UNSIGNED DEFAULT NULL,
        meta_id BIGINT UNSIGNED DEFAULT NULL,
        viewed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY post_id (post_id),
        KEY user_id (user_id),
        KEY viewed_at (viewed_at),
        KEY meta_id (meta_id)
    ) $charset_collate;",
    
    'post_view_meta' => "CREATE TABLE {$prefix}post_view_meta (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        ip_address VARBINARY(16) DEFAULT NULL,
        referer VARCHAR(255) DEFAULT NULL,
        user_agent TEXT,
        device_type ENUM('mobile','tablet','desktop','unknown') DEFAULT 'unknown',
        country_code CHAR(2) DEFAULT NULL,
        PRIMARY KEY (id),
        KEY device_type (device_type),
        KEY country_code (country_code)
    ) $charset_collate;",
    
    'post_views_daily' => "CREATE TABLE {$prefix}post_views_daily (
        post_id BIGINT UNSIGNED NOT NULL,
        day DATE NOT NULL,
        views INT UNSIGNED NOT NULL,
        unique_visitors INT UNSIGNED DEFAULT 0,
        PRIMARY KEY (post_id, day)
    ) $charset_collate;"
];

// Check and create/repair each table
foreach ($required_tables as $table_name => $schema) {
    $full_table_name = $prefix . $table_name;
    
    // Check if table exists
    $exists = $wpdb->get_var($wpdb->prepare("SHOW TABLES LIKE %s", $full_table_name));
    
    if (!$exists) {
        // Table doesn't exist, create it
        $results['operations'][] = [
            'table' => $table_name,
            'action' => 'create',
            'status' => 'attempting'
        ];
        
        $creation_result = dbDelta($schema);
        
        if ($wpdb->last_error) {
            $results['errors'][] = "Failed to create table $table_name: " . $wpdb->last_error;
            $results['success'] = false;
            $results['operations'][count($results['operations']) - 1]['status'] = 'failed';
            $results['operations'][count($results['operations']) - 1]['error'] = $wpdb->last_error;
        } else {
            $results['operations'][count($results['operations']) - 1]['status'] = 'success';
            $results['operations'][count($results['operations']) - 1]['result'] = $creation_result;
        }
    } else {
        // Table exists, verify structure and repair if needed
        $results['operations'][] = [
            'table' => $table_name,
            'action' => 'verify_structure',
            'status' => 'attempting'
        ];
        
        // Run dbDelta to ensure structure is correct
        $delta_result = dbDelta($schema);
        
        if ($wpdb->last_error) {
            $results['errors'][] = "Failed to verify/repair table $table_name: " . $wpdb->last_error;
            $results['success'] = false;
            $results['operations'][count($results['operations']) - 1]['status'] = 'failed';
            $results['operations'][count($results['operations']) - 1]['error'] = $wpdb->last_error;
        } else {
            $results['operations'][count($results['operations']) - 1]['status'] = 'success';
            if (!empty($delta_result)) {
                $results['operations'][count($results['operations']) - 1]['changes'] = $delta_result;
            }
        }
    }
}

// Test database operations with a sample insert/delete
if ($results['success']) {
    $results['operations'][] = [
        'table' => 'page_view_meta',
        'action' => 'test_insert',
        'status' => 'attempting'
    ];
    
    $test_insert = $wpdb->insert(
        $prefix . 'page_view_meta',
        [
            'ip_address' => inet_pton('127.0.0.1'),
            'user_agent' => 'db-repair-test-agent',
            'device_type' => 'desktop',
            'language' => 'en'
        ],
        ['%s', '%s', '%s', '%s']
    );
    
    if ($test_insert && !$wpdb->last_error) {
        $insert_id = $wpdb->insert_id;
        
        // Clean up test data
        $wpdb->delete($prefix . 'page_view_meta', ['id' => $insert_id], ['%d']);
        
        $results['operations'][count($results['operations']) - 1]['status'] = 'success';
        $results['operations'][count($results['operations']) - 1]['test_insert_id'] = $insert_id;
    } else {
        $results['errors'][] = 'Test insert failed: ' . $wpdb->last_error;
        $results['success'] = false;
        $results['operations'][count($results['operations']) - 1]['status'] = 'failed';
        $results['operations'][count($results['operations']) - 1]['error'] = $wpdb->last_error;
    }
}

// Final verification - check all tables exist and get counts
$final_check = [];
foreach (array_keys($required_tables) as $table_name) {
    $full_table_name = $prefix . $table_name;
    $exists = $wpdb->get_var($wpdb->prepare("SHOW TABLES LIKE %s", $full_table_name));
    $count = $exists ? $wpdb->get_var("SELECT COUNT(*) FROM `$full_table_name`") : null;
    
    $final_check[$table_name] = [
        'exists' => (bool)$exists,
        'row_count' => $count ? (int)$count : 0
    ];
}

$results['final_status'] = $final_check;
$results['summary'] = $results['success'] ? 'All analytics tables verified/created successfully' : 'Some operations failed - check errors';

echo json_encode($results, JSON_PRETTY_PRINT);