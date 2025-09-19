<?php
// Quick DB check for analytics tables using WordPress $wpdb
// Outputs JSON to stdout

$root = dirname(__DIR__, 3); // points to /home/ajay/web/techoblivion.in/public_html
$wp_load = $root . '/wp-load.php';
if (!file_exists($wp_load)) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(["error" => "wp-load.php not found at $wp_load"]);
    exit(1);
}

require_once $wp_load; // brings in $wpdb

header('Content-Type: application/json');

if (!isset($wpdb)) {
    echo json_encode(["error" => "wpdb not initialized"]);
    exit(1);
}

$prefix = $wpdb->prefix;
$tables = [
    'post_views' => $prefix . 'post_views',
    'post_view_meta' => $prefix . 'post_view_meta',
    'post_view_sessions' => $prefix . 'post_view_sessions',
    'post_views_daily' => $prefix . 'post_views_daily',
];

$exists = [];
foreach ($tables as $key => $tbl) {
    $exists[$key] = (bool) $wpdb->get_var($wpdb->prepare("SHOW TABLES LIKE %s", $tbl));
}

$counts = [];
foreach ($tables as $key => $tbl) {
    if ($exists[$key]) {
        $counts[$key] = (int) $wpdb->get_var("SELECT COUNT(*) FROM `$tbl`");
    } else {
        $counts[$key] = null;
    }
}

$schema_views = null;
if ($exists['post_views']) {
    $schema_views = $wpdb->get_row("SHOW CREATE TABLE `{$tables['post_views']}`", ARRAY_A);
}

$topPosts = [];
if ($exists['post_views']) {
    $sql = "SELECT post_id, COUNT(*) AS views FROM `{$tables['post_views']}` GROUP BY post_id ORDER BY views DESC LIMIT 20";
    $topPosts = $wpdb->get_results($sql, ARRAY_A) ?: [];
}

$recent = [];
if ($exists['post_views'] && $exists['post_view_meta']) {
    $sql = "SELECT v.id, v.post_id, v.user_id, v.meta_id, v.viewed_at, m.ip_address, m.referer, m.user_agent, m.device_type, m.country_code
            FROM `{$tables['post_views']}` v
            LEFT JOIN `{$tables['post_view_meta']}` m ON v.meta_id = m.id
            ORDER BY v.viewed_at DESC, v.id DESC
            LIMIT 10";
    $recent = $wpdb->get_results($sql, ARRAY_A) ?: [];
}

$devices = [];
if ($exists['post_view_meta']) {
    $sql = "SELECT device_type, COUNT(*) AS c FROM `{$tables['post_view_meta']}` GROUP BY device_type ORDER BY c DESC LIMIT 10";
    $devices = $wpdb->get_results($sql, ARRAY_A) ?: [];
}

$countries = [];
if ($exists['post_view_meta']) {
    $sql = "SELECT country_code, COUNT(*) AS c FROM `{$tables['post_view_meta']}` GROUP BY country_code ORDER BY c DESC LIMIT 10";
    $countries = $wpdb->get_results($sql, ARRAY_A) ?: [];
}

$out = [
    'prefix' => $prefix,
    'tables_exist' => $exists,
    'counts' => $counts,
    'show_create_post_views' => $schema_views,
    'top_posts' => $topPosts,
    'recent_views_sample' => $recent,
    'devices' => $devices,
    'countries' => $countries,
];

echo json_encode($out, JSON_PRETTY_PRINT);
