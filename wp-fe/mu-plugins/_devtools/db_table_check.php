<?php
/**
 * Debug script to check database tables for analytics
 * Run this script to verify that analytics tables exist and are properly structured
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

header('Content-Type: application/json');

$prefix = $wpdb->prefix;
$required_tables = [
    'page_views' => $prefix . 'page_views',
    'page_view_meta' => $prefix . 'page_view_meta', 
    'page_view_sessions' => $prefix . 'page_view_sessions',
    'post_views' => $prefix . 'post_views',
    'post_view_meta' => $prefix . 'post_view_meta',
];

$results = [
    'database_name' => $wpdb->dbname,
    'table_prefix' => $prefix,
    'tables' => [],
    'errors' => []
];

foreach ($required_tables as $key => $table_name) {
    $exists = $wpdb->get_var($wpdb->prepare("SHOW TABLES LIKE %s", $table_name));
    $results['tables'][$key] = [
        'name' => $table_name,
        'exists' => (bool)$exists,
        'row_count' => null,
        'structure' => null
    ];
    
    if ($exists) {
        // Get row count
        $count = $wpdb->get_var("SELECT COUNT(*) FROM `$table_name`");
        $results['tables'][$key]['row_count'] = (int)$count;
        
        // Get table structure
        $columns = $wpdb->get_results("DESCRIBE `$table_name`", ARRAY_A);
        $results['tables'][$key]['structure'] = $columns;
    }
    
    if ($wpdb->last_error) {
        $results['errors'][] = "Error checking $table_name: " . $wpdb->last_error;
    }
}

// Test a simple insert to page_view_meta to see if it works
if ($results['tables']['page_view_meta']['exists']) {
    $test_insert = $wpdb->insert(
        $prefix . 'page_view_meta',
        [
            'ip_address' => inet_pton('127.0.0.1'),
            'user_agent' => 'test-agent',
            'device_type' => 'desktop',
            'language' => 'en'
        ],
        ['%s', '%s', '%s', '%s']
    );
    
    if ($test_insert) {
        $insert_id = $wpdb->insert_id;
        // Clean up test data
        $wpdb->delete($prefix . 'page_view_meta', ['id' => $insert_id], ['%d']);
        $results['test_insert'] = 'success';
    } else {
        $results['test_insert'] = 'failed';
        $results['errors'][] = 'Test insert error: ' . $wpdb->last_error;
    }
}

echo json_encode($results, JSON_PRETTY_PRINT);