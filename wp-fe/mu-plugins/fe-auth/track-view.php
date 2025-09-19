<?php
if (!defined('ABSPATH')) { exit; }

// Load the geolocation service
require_once __DIR__ . '/geolocation.php';

add_action('rest_api_init', function () {
  $ns = 'fe-auth/v1';

  register_rest_route($ns, '/track-view', [
    'methods'  => 'POST',
    'permission_callback' => '__return_true',
    'args' => [
      'post_id' => [
        'required' => true,
        'type' => 'integer',
        'validate_callback' => fn($v) => is_numeric($v) && $v > 0,
      ],
    ],
    'callback' => function (WP_REST_Request $req) {
      global $wpdb;

      $post_id = (int)$req->get_param('post_id');
      $post = get_post($post_id);
      if (!$post || $post->post_status !== 'publish') {
        return new WP_REST_Response([ 'error' => 'invalid_post' ], 400);
      }

      // Legacy counters
      $total = (int)get_post_meta($post_id, '_views_total', true);
      update_post_meta($post_id, '_views_total', ++$total);

      $user_id = get_current_user_id();
      $user_views_for_post = null;
      if ($user_id) {
        $raw = get_user_meta($user_id, '_views_by_user', true);
        $map = is_array($raw) ? $raw : (is_string($raw) && $raw ? json_decode($raw, true) : []);
        if (!is_array($map)) $map = [];
        $current = isset($map[$post_id]) ? (int)$map[$post_id] : 0;
        $map[$post_id] = ++$current;
        update_user_meta($user_id, '_views_by_user', wp_json_encode($map));
        $user_views_for_post = $current;
      }

      // Analytics tables per schema with enhanced geolocation
      $ip_raw = FE_Geolocation_Service::get_client_ip();
      $ip_bin = $ip_raw ? @inet_pton($ip_raw) : null;
      $referer = isset($_SERVER['HTTP_REFERER']) ? substr((string)$_SERVER['HTTP_REFERER'], 0, 255) : null;
      $ua = substr((string)($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 65535);
      
      // Get comprehensive geolocation data
      $geo_data = FE_Geolocation_Service::get_location_data($ip_raw);
      $cc = $geo_data['country_code'] ?? ($_SERVER['CF-IPCountry'] ?? ($_SERVER['GEOIP_COUNTRY_CODE'] ?? null));

      $ua_lc = strtolower($ua);
      $device = 'unknown';
      if ($ua_lc) {
        if (strpos($ua_lc, 'tablet') !== false || strpos($ua_lc, 'ipad') !== false) {
          $device = 'tablet';
        } elseif (strpos($ua_lc, 'mobi') !== false || strpos($ua_lc, 'android') !== false || strpos($ua_lc, 'iphone') !== false) {
          $device = 'mobile';
        } else {
          $device = 'desktop';
        }
      }

      $meta_id = null;
      $wpdb->insert(
        $wpdb->prefix . 'post_view_meta',
        [
          'ip_address' => $ip_bin,
          'referer' => $referer,
          'user_agent' => $ua,
          'device_type' => $device,
          'country_code' => $cc ? substr($cc, 0, 2) : null,
          'country_name' => $geo_data['country_name'] ? substr($geo_data['country_name'], 0, 100) : null,
          'city_name' => $geo_data['city_name'] ? substr($geo_data['city_name'], 0, 100) : null,
          'region_name' => $geo_data['region_name'] ? substr($geo_data['region_name'], 0, 100) : null,
          'latitude' => $geo_data['latitude'],
          'longitude' => $geo_data['longitude'],
        ],
        ['%s','%s','%s','%s','%s','%s','%s','%s','%f','%f']
      );
      if (!$wpdb->last_error) {
        $meta_id = (int)$wpdb->insert_id;
      } else {
        error_log('FE Auth track-view meta insert error: ' . $wpdb->last_error . ' | ip=' . ($ip_raw ?: '') . ' referer=' . ($referer ?: '') . ' device=' . $device . ' cc=' . ($cc ?: ''));
      }

      $wpdb->insert(
        $wpdb->prefix . 'post_views',
        [
          'post_id'   => $post_id,
          'user_id'   => $user_id ?: null,
          'meta_id'   => $meta_id ?: null,
          'viewed_at' => current_time('mysql'),
        ],
        ['%d','%d','%d','%s']
      );
      if ($wpdb->last_error) {
        error_log('FE Auth track-view insert error: ' . $wpdb->last_error . ' | post_id=' . $post_id . ' user_id=' . ($user_id ?: 0) . ' meta_id=' . ($meta_id ?: 0));
      }

      return [
        'post_id'     => $post_id,
        'views_total' => $total,
        'user_views'  => $user_views_for_post,
      ];
    },
  ]);
});
