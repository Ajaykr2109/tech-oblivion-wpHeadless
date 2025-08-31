<?php
/*
Plugin Name: FE Analytics (Summary Endpoint)
Description: Provides a single normalized analytics endpoint `/wp-json/fe-analytics/v1/summary` aggregating devices, countries, and traffic trends. Uses transients for caching; admin-only by default.
Version: 0.1.0
Author: Headless FE
*/

if (!defined('ABSPATH')) { exit; }

add_action('rest_api_init', function() {
  $ns = 'fe-analytics/v1';
  register_rest_route($ns, '/summary', array(
    'methods' => WP_REST_Server::READABLE,
    'permission_callback' => function() {
      // Admin-only for now
      return current_user_can('manage_options');
    },
    'args' => array(
      'period' => array('type' => 'string', 'required' => false, 'default' => 'month'),
      'refresh' => array('type' => 'boolean', 'required' => false, 'default' => false),
    ),
    'callback' => function(WP_REST_Request $req) {
      $period = $req->get_param('period') ?: 'month';
      $refresh = filter_var($req->get_param('refresh'), FILTER_VALIDATE_BOOLEAN);

      $key = 'fe_analytics_summary_' . sanitize_key($period);
      if ($refresh) {
        delete_transient($key);
      }
      $cached = get_transient($key);
      if ($cached && is_array($cached)) {
        return rest_ensure_response($cached);
      }

      // Collect runtime data. Replace these with your real sources.
      $devices = fea_collect_devices($period);
      $countries = fea_collect_countries($period);
      $trends = fea_collect_trends($period);
      $referers = fea_collect_referers($period);
      $sessions = fea_collect_sessions($period);

      $payload = array(
        'period' => $period,
        'generated_at' => gmdate('c'),
        'devices' => $devices,
        'countries' => $countries,
        'trends' => $trends,
        'referers' => $referers,
        'sessions' => $sessions,
      );

      // Cache for 5 minutes by default
      set_transient($key, $payload, 5 * MINUTE_IN_SECONDS);
      return rest_ensure_response($payload);
    }
  ));
});

function fea_collect_devices($period) {
  global $wpdb;
  // Example: aggregate from a hypothetical table `wp_post_view_meta` with device column
  // Fallback to zeros when table is missing.
  $table = $wpdb->prefix . 'post_view_meta';
  if ($wpdb->get_var($wpdb->prepare('SHOW TABLES LIKE %s', $table)) !== $table) {
    return array();
  }
  $sql = "SELECT device_type, COUNT(*) as count FROM {$table} GROUP BY device_type";
  $rows = $wpdb->get_results($sql, ARRAY_A) ?: array();
  // Normalize keys
  return array_map(function($r){
    return array(
      'device_type' => isset($r['device_type']) ? strtolower($r['device_type']) : 'other',
      'count' => intval($r['count'] ?? 0),
    );
  }, $rows);
}

function fea_collect_countries($period) {
  global $wpdb;
  $table = $wpdb->prefix . 'post_view_meta';
  if ($wpdb->get_var($wpdb->prepare('SHOW TABLES LIKE %s', $table)) !== $table) {
    return array();
  }
  $sql = "SELECT country_code, COUNT(*) as count FROM {$table} WHERE country_code IS NOT NULL AND country_code <> '' GROUP BY country_code ORDER BY count DESC";
  $rows = $wpdb->get_results($sql, ARRAY_A) ?: array();
  return array_map(function($r){
    return array(
      'country_code' => strtoupper($r['country_code'] ?? 'XX'),
      'count' => intval($r['count'] ?? 0),
    );
  }, $rows);
}

function fea_collect_trends($period) {
  global $wpdb;
  $table = $wpdb->prefix . 'post_views_daily';
  if ($wpdb->get_var($wpdb->prepare('SHOW TABLES LIKE %s', $table)) !== $table) {
    return array('series' => array());
  }
  // Very basic range filter by period
  $days = 30;
  if ($period === 'week') $days = 7;
  if ($period === 'quarter') $days = 90;
  if ($period === 'year') $days = 365;
  $sql = $wpdb->prepare("SELECT date, SUM(views) as views FROM {$table} WHERE date >= DATE_SUB(CURDATE(), INTERVAL %d DAY) GROUP BY date ORDER BY date ASC", $days);
  $rows = $wpdb->get_results($sql, ARRAY_A) ?: array();
  $series = array_map(function($r){
    return array('date' => $r['date'], 'views' => intval($r['views'] ?? 0));
  }, $rows);
  return array('series' => $series);
}

function fea_collect_referers($period) {
  global $wpdb;
  $table = $wpdb->prefix . 'post_view_meta';
  if ($wpdb->get_var($wpdb->prepare('SHOW TABLES LIKE %s', $table)) !== $table) {
    return array();
  }
  $sql = "SELECT referer_source as source, COUNT(*) as count FROM {$table} WHERE referer_source IS NOT NULL AND referer_source <> '' GROUP BY referer_source ORDER BY count DESC LIMIT 100";
  $rows = $wpdb->get_results($sql, ARRAY_A) ?: array();
  return array_map(function($r){
    return array(
      'source' => $r['source'] ?? 'other',
      'count' => intval($r['count'] ?? 0),
    );
  }, $rows);
}

function fea_collect_sessions($period) {
  // Optional placeholder: reuse trends as sessions for now if no dedicated table.
  $trends = fea_collect_trends($period);
  $series = array_map(function($p){ return array('date' => $p['date'], 'sessions' => intval($p['views'])); }, $trends['series']);
  return array('data' => $series);
}
