<?php
/**
 * Analytics Tracking Test Tool
 * Tests the tracking functionality after database repair
 */

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

// Simulate request environment for testing
$_SERVER['REMOTE_ADDR'] = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
$_SERVER['HTTP_USER_AGENT'] = $_SERVER['HTTP_USER_AGENT'] ?? 'analytics-test-agent';
$_SERVER['HTTP_REFERER'] = $_SERVER['HTTP_REFERER'] ?? home_url('/');

$results = [
    'test_type' => 'analytics_tracking_test',
    'timestamp' => current_time('mysql'),
    'tests' => [],
    'success' => true,
    'summary' => ''
];

// Test 1: Page tracking endpoint
$results['tests']['page_tracking'] = [
    'name' => 'Page Tracking Test',
    'status' => 'running'
];

try {
    // Ensure REST API routes are registered
    if (!did_action('rest_api_init')) {
        do_action('rest_api_init');
    }
    
    $request = new WP_REST_Request('POST', '/fe-auth/v1/track-page');
    $request->set_param('path', '/test-page');
    $request->set_param('title', 'Test Page Title');
    $request->set_param('referrer', 'https://test.com');
    $request->set_param('session_id', 'test-session-123');
    $request->set_param('screen_resolution', '1920x1080');
    $request->set_param('timezone', 'America/New_York');
    $request->set_param('language', 'en');
    
    $response = rest_do_request($request);
    
    if ($response instanceof WP_REST_Response) {
        $data = $response->get_data();
        $status = $response->get_status();
        
        if ($status === 200 && !isset($data['error'])) {
            $results['tests']['page_tracking']['status'] = 'success';
            $results['tests']['page_tracking']['response'] = $data;
        } else {
            $results['tests']['page_tracking']['status'] = 'failed';
            $results['tests']['page_tracking']['error'] = $data;
            $results['success'] = false;
        }
    } else {
        $results['tests']['page_tracking']['status'] = 'failed';
        $results['tests']['page_tracking']['error'] = 'Invalid response type';
        $results['success'] = false;
    }
    
    if ($wpdb->last_error) {
        $results['tests']['page_tracking']['wpdb_error'] = $wpdb->last_error;
    }
    
} catch (Exception $e) {
    $results['tests']['page_tracking']['status'] = 'failed';
    $results['tests']['page_tracking']['error'] = $e->getMessage();
    $results['success'] = false;
}

// Test 2: Post view tracking (if posts exist)
$results['tests']['post_tracking'] = [
    'name' => 'Post View Tracking Test',
    'status' => 'running'
];

try {
    $post = get_posts([
        'post_type' => 'post',
        'posts_per_page' => 1,
        'post_status' => 'publish',
        'orderby' => 'date',
        'order' => 'DESC',
    ]);
    
    if ($post) {
        $post_id = $post[0]->ID;
        
        $request = new WP_REST_Request('POST', '/fe-auth/v1/track-view');
        $request->set_param('post_id', $post_id);
        
        $response = rest_do_request($request);
        
        if ($response instanceof WP_REST_Response) {
            $data = $response->get_data();
            $status = $response->get_status();
            
            if ($status === 200 && !isset($data['error'])) {
                $results['tests']['post_tracking']['status'] = 'success';
                $results['tests']['post_tracking']['response'] = $data;
                $results['tests']['post_tracking']['post_id'] = $post_id;
            } else {
                $results['tests']['post_tracking']['status'] = 'failed';
                $results['tests']['post_tracking']['error'] = $data;
                $results['success'] = false;
            }
        } else {
            $results['tests']['post_tracking']['status'] = 'failed';
            $results['tests']['post_tracking']['error'] = 'Invalid response type';
            $results['success'] = false;
        }
    } else {
        $results['tests']['post_tracking']['status'] = 'skipped';
        $results['tests']['post_tracking']['reason'] = 'No published posts found';
    }
    
    if ($wpdb->last_error) {
        $results['tests']['post_tracking']['wpdb_error'] = $wpdb->last_error;
    }
    
} catch (Exception $e) {
    $results['tests']['post_tracking']['status'] = 'failed';
    $results['tests']['post_tracking']['error'] = $e->getMessage();
    $results['success'] = false;
}

// Test 3: Database table verification
$results['tests']['database_verification'] = [
    'name' => 'Database Tables Verification',
    'status' => 'running'
];

$prefix = $wpdb->prefix;
$required_tables = [
    'page_views',
    'page_view_meta',
    'page_view_sessions',
    'post_views',
    'post_view_meta'
];

$missing_tables = [];
$table_counts = [];

foreach ($required_tables as $table) {
    $full_table_name = $prefix . $table;
    $exists = $wpdb->get_var($wpdb->prepare("SHOW TABLES LIKE %s", $full_table_name));
    
    if (!$exists) {
        $missing_tables[] = $table;
    } else {
        $count = $wpdb->get_var("SELECT COUNT(*) FROM `$full_table_name`");
        $table_counts[$table] = (int)$count;
    }
}

if (empty($missing_tables)) {
    $results['tests']['database_verification']['status'] = 'success';
    $results['tests']['database_verification']['table_counts'] = $table_counts;
} else {
    $results['tests']['database_verification']['status'] = 'failed';
    $results['tests']['database_verification']['missing_tables'] = $missing_tables;
    $results['success'] = false;
}

// Test 4: Analytics endpoints check
$results['tests']['analytics_endpoints'] = [
    'name' => 'Analytics Endpoints Check',
    'status' => 'running'
];

try {
    $request = new WP_REST_Request('GET', '/fe-analytics/v1/check');
    $response = rest_do_request($request);
    
    if ($response instanceof WP_REST_Response) {
        $data = $response->get_data();
        $status = $response->get_status();
        
        if ($status === 200) {
            $results['tests']['analytics_endpoints']['status'] = 'success';
            $results['tests']['analytics_endpoints']['response'] = $data;
        } else {
            $results['tests']['analytics_endpoints']['status'] = 'failed';
            $results['tests']['analytics_endpoints']['error'] = $data;
            $results['success'] = false;
        }
    } else {
        $results['tests']['analytics_endpoints']['status'] = 'failed';
        $results['tests']['analytics_endpoints']['error'] = 'Analytics endpoints not available';
        $results['success'] = false;
    }
    
} catch (Exception $e) {
    $results['tests']['analytics_endpoints']['status'] = 'failed';
    $results['tests']['analytics_endpoints']['error'] = $e->getMessage();
    $results['success'] = false;
}

// Generate summary
$total_tests = count($results['tests']);
$successful_tests = 0;
$failed_tests = 0;
$skipped_tests = 0;

foreach ($results['tests'] as $test) {
    switch ($test['status']) {
        case 'success':
            $successful_tests++;
            break;
        case 'failed':
            $failed_tests++;
            break;
        case 'skipped':
            $skipped_tests++;
            break;
    }
}

$results['summary'] = [
    'total_tests' => $total_tests,
    'successful' => $successful_tests,
    'failed' => $failed_tests,
    'skipped' => $skipped_tests,
    'overall_status' => $results['success'] ? 'PASS' : 'FAIL'
];

echo json_encode($results, JSON_PRETTY_PRINT);