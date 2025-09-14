<?php
// Invoke the FE Auth track-view REST endpoint for a sample published post
$root = dirname(__DIR__, 3); // points to /home/ajay/web/techoblivion.in/public_html
$wp_load = $root . '/wp-load.php';
if (!file_exists($wp_load)) {
    fwrite(STDERR, "wp-load.php not found at $wp_load\n");
    exit(1);
}
require_once $wp_load;

// Find a published post
$post = get_posts([
    'post_type' => 'post',
    'posts_per_page' => 1,
    'post_status' => 'publish',
    'orderby' => 'date',
    'order' => 'DESC',
]);
if (!$post) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'no_published_posts_found']);
    exit(0);
}
$post_id = $post[0]->ID;

// Simulate request environment
$_SERVER['REMOTE_ADDR'] = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
$_SERVER['HTTP_USER_AGENT'] = $_SERVER['HTTP_USER_AGENT'] ?? 'cli-test-agent';
$_SERVER['HTTP_REFERER'] = $_SERVER['HTTP_REFERER'] ?? home_url('/');

// Ensure routes are registered
if (!did_action('rest_api_init')) {
    do_action('rest_api_init');
}

$request = new WP_REST_Request('POST', '/fe-auth/v1/track-view');
$request->set_param('post_id', $post_id);

$response = rest_do_request($request);
$data = null;
$status = null;
if ($response instanceof WP_REST_Response) {
    $data = $response->get_data();
    $status = $response->get_status();
} else {
    $data = $response; // might be WP_Error or array
    $status = is_object($response) && method_exists($response, 'get_error_code') ? 400 : 200;
}

header('Content-Type: application/json');
// include last error if any
global $wpdb;
$last_error = isset($wpdb) ? ($wpdb->last_error ?: null) : null;
echo json_encode([
    'status' => $status,
    'post_id' => $post_id,
    'response' => $data,
    'wpdb_last_error' => $last_error,
]);
