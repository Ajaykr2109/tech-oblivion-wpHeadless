<?php
// Smoke test FE Analytics endpoints and print JSON responses
$root = dirname(__DIR__, 3); // points to /home/ajay/web/techoblivion.in/public_html
$wp_load = $root . '/wp-load.php';
if (!file_exists($wp_load)) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'wp-load.php not found', 'path' => $wp_load]);
    exit(1);
}
require_once $wp_load;

if (!did_action('rest_api_init')) {
    do_action('rest_api_init');
}

function call_endpoint($method, $path, $params = []) {
    $req = new WP_REST_Request($method, $path);
    foreach ($params as $k => $v) { $req->set_param($k, $v); }
    $resp = rest_do_request($req);
    $code = $resp instanceof WP_REST_Response ? $resp->get_status() : (is_object($resp) && method_exists($resp, 'get_error_code') ? 400 : 200);
    $data = $resp instanceof WP_REST_Response ? $resp->get_data() : $resp;
    return [ 'status' => $code, 'data' => $data ];
}

$results = [
    'views_week'  => call_endpoint('GET', '/fe-analytics/v1/views', ['period' => 'week']),
    'devices'     => call_endpoint('GET', '/fe-analytics/v1/devices'),
    'countries'   => call_endpoint('GET', '/fe-analytics/v1/countries'),
    'referers'    => call_endpoint('GET', '/fe-analytics/v1/referers'),
    'top_posts'   => call_endpoint('GET', '/fe-analytics/v1/top-posts', ['period' => 'month']),
    'summary'     => call_endpoint('GET', '/fe-analytics/v1/summary'),
];

header('Content-Type: application/json');
echo json_encode($results, JSON_PRETTY_PRINT);
