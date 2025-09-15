<?php
if (!defined('ABSPATH')) { exit; }

add_action('rest_api_init', function () {
  $ns = 'fe-auth/v1';

  register_rest_route($ns, '/track-page', [
    'methods'  => 'POST',
    'permission_callback' => '__return_true',
    'args' => [
      'path' => [
        'required' => true,
        'type' => 'string',
        'validate_callback' => fn($v) => is_string($v) && strlen($v) > 0,
      ],
      'title' => [
        'required' => false,
        'type' => 'string',
        'default' => '',
      ],
      'referrer' => [
        'required' => false,
        'type' => 'string',
        'default' => '',
      ],
      'session_id' => [
        'required' => false,
        'type' => 'string',
        'default' => '',
      ],
      'screen_resolution' => [
        'required' => false,
        'type' => 'string',
        'default' => '',
      ],
      'timezone' => [
        'required' => false,
        'type' => 'string',
        'default' => '',
      ],
      'language' => [
        'required' => false,
        'type' => 'string',
        'default' => 'en',
      ],
    ],
    'callback' => function (WP_REST_Request $req) {
      global $wpdb;

      $path = sanitize_text_field($req->get_param('path'));
      $title = sanitize_text_field($req->get_param('title') ?: '');
      $referrer = sanitize_text_field($req->get_param('referrer') ?: '');
      $session_id = sanitize_text_field($req->get_param('session_id') ?: '');
      $screen_resolution = sanitize_text_field($req->get_param('screen_resolution') ?: '');
      $timezone = sanitize_text_field($req->get_param('timezone') ?: '');
      $language = sanitize_text_field($req->get_param('language') ?: 'en');

      // Determine page type and extract IDs where possible
      $page_type = 'page';
      $post_id = null;
      $page_identifier = $path;

      if (preg_match('#^/blog/([^/?]+)#', $path, $matches)) {
        $page_type = 'post';
        $slug = $matches[1];
        // Try to find the post ID by slug
        $post = get_page_by_path($slug, OBJECT, 'post');
        if ($post) {
          $post_id = $post->ID;
          $page_identifier = "post:{$post_id}";
        } else {
          $page_identifier = "post_slug:{$slug}";
        }
      } elseif (preg_match('#^/categories/([^/?]+)#', $path, $matches)) {
        $page_type = 'category';
        $page_identifier = "category:{$matches[1]}";
      } elseif (preg_match('#^/tags/([^/?]+)#', $path, $matches)) {
        $page_type = 'tag';
        $page_identifier = "tag:{$matches[1]}";
      } elseif ($path === '/') {
        $page_type = 'home';
        $page_identifier = 'home';
      } elseif (preg_match('#^/author/([^/?]+)#', $path, $matches)) {
        $page_type = 'author';
        $page_identifier = "author:{$matches[1]}";
      } elseif (preg_match('#^/(about|contact|privacy|terms)/?$#', $path, $matches)) {
        $page_type = 'static';
        $page_identifier = "static:{$matches[1]}";
      }

      // Get or create session
      $session_record_id = null;
      if ($session_id) {
        $session_hash = hash('sha256', $session_id);
        $user_id = get_current_user_id() ?: null;
        
        // Check if session exists
        $existing_session = $wpdb->get_row($wpdb->prepare(
          "SELECT id FROM {$wpdb->prefix}page_view_sessions WHERE session_hash = %s",
          $session_hash
        ));
        
        if ($existing_session) {
          $session_record_id = $existing_session->id;
          // Update last_seen
          $wpdb->update(
            $wpdb->prefix . 'page_view_sessions',
            ['last_seen' => current_time('mysql')],
            ['id' => $session_record_id],
            ['%s'],
            ['%d']
          );
        } else {
          // Create new session
          $wpdb->insert(
            $wpdb->prefix . 'page_view_sessions',
            [
              'session_hash' => $session_hash,
              'user_id' => $user_id,
              'first_seen' => current_time('mysql'),
              'last_seen' => current_time('mysql'),
              'total_views' => 1,
            ],
            ['%s', '%d', '%s', '%s', '%d']
          );
          $session_record_id = $wpdb->insert_id;
        }
      }

      // Gather metadata
      $ip_raw = $_SERVER['REMOTE_ADDR'] ?? null;
      $ip_bin = $ip_raw ? @inet_pton($ip_raw) : null;
      $ua = substr((string)($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 65535);
      $cc = $_SERVER['CF-IPCountry'] ?? ($_SERVER['GEOIP_COUNTRY_CODE'] ?? null);

      // Enhanced device detection
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

      // Insert metadata
      $meta_id = null;
      $wpdb->insert(
        $wpdb->prefix . 'page_view_meta',
        [
          'ip_address' => $ip_bin,
          'referer' => substr($referrer, 0, 255),
          'user_agent' => $ua,
          'device_type' => $device,
          'country_code' => $cc ? substr($cc, 0, 2) : null,
          'screen_resolution' => substr($screen_resolution, 0, 20),
          'timezone' => substr($timezone, 0, 50),
          'language' => substr($language, 0, 10),
        ],
        ['%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s']
      );
      
      if (!$wpdb->last_error) {
        $meta_id = (int)$wpdb->insert_id;
      } else {
        error_log('FE Auth page-track meta insert error: ' . $wpdb->last_error);
      }

      // Insert page view
      $user_id = get_current_user_id() ?: null;
      $wpdb->insert(
        $wpdb->prefix . 'page_views',
        [
          'path' => substr($path, 0, 255),
          'page_type' => $page_type,
          'page_identifier' => substr($page_identifier, 0, 255),
          'post_id' => $post_id,
          'user_id' => $user_id,
          'session_id' => $session_record_id,
          'meta_id' => $meta_id,
          'page_title' => substr($title, 0, 255),
          'viewed_at' => current_time('mysql'),
        ],
        ['%s', '%s', '%s', '%d', '%d', '%d', '%d', '%s', '%s']
      );

      if ($wpdb->last_error) {
        error_log('FE Auth page-track insert error: ' . $wpdb->last_error . ' | SQL: INSERT INTO page_views');
        error_log('FE Auth page-track insert values: path=' . $path . ' | page_type=' . $page_type . ' | user_id=' . $user_id . ' | session_id=' . $session_record_id . ' | meta_id=' . $meta_id);
        return new WP_REST_Response(['success' => false, 'error' => 'database_error', 'details' => $wpdb->last_error], 500);
      }

      // Update session view count
      if ($session_record_id) {
        $wpdb->query($wpdb->prepare(
          "UPDATE {$wpdb->prefix}page_view_sessions SET total_views = total_views + 1 WHERE id = %d",
          $session_record_id
        ));
      }

      // Legacy: also track as post view if it's a blog post
      if ($page_type === 'post' && $post_id) {
        $total = (int)get_post_meta($post_id, '_views_total', true);
        update_post_meta($post_id, '_views_total', ++$total);
        
        if ($user_id) {
          $raw = get_user_meta($user_id, '_views_by_user', true);
          $map = is_array($raw) ? $raw : (is_string($raw) && $raw ? json_decode($raw, true) : []);
          if (!is_array($map)) $map = [];
          $current = isset($map[$post_id]) ? (int)$map[$post_id] : 0;
          $map[$post_id] = ++$current;
          update_user_meta($user_id, '_views_by_user', wp_json_encode($map));
        }
      }

      return [
        'success' => true,
        'page_id' => $wpdb->insert_id,
        'session_id' => $session_id,
        'page_type' => $page_type,
        'views_total' => $page_type === 'post' && $post_id ? get_post_meta($post_id, '_views_total', true) : null,
      ];
    },
  ]);
});