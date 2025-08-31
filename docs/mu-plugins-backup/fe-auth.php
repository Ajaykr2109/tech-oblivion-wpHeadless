<?php
/**
 * Plugin Name: FE Auth Bridge (Unified)
 * Description: Consolidated plugin with auth bridge, proxy, user public profile, view tracking (with DB), bookmarks API, and meta extensions.
 * Version: 1.2.0
 * Author: Tech Oblivion
 */

if (!defined('ABSPATH')) { exit; }

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------
function fe_auth_normalize_url($u) {
  if (!$u) return null;
  if (is_array($u) || is_object($u)) return null;
  $s = trim((string)$u);
  if ($s === '') return null;
  if (preg_match('#^https?://#i', $s)) return $s;
  return 'https://' . ltrim($s);
}

// -----------------------------------------------------------------------------
// Create post views table on activation
// -----------------------------------------------------------------------------
register_activation_hook(__FILE__, 'fe_create_post_views_table');
function fe_create_post_views_table() {
    global $wpdb;

    $table_name = $wpdb->prefix . 'post_views';
    $charset_collate = $wpdb->get_charset_collate();

    $sql = "CREATE TABLE $table_name (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        post_id BIGINT UNSIGNED NOT NULL,
        user_id BIGINT UNSIGNED DEFAULT NULL,
        ip_address VARBINARY(16) DEFAULT NULL,
        user_agent TEXT,
        viewed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY post_id (post_id),
        KEY viewed_at (viewed_at)
    ) $charset_collate;";

    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql);
}

// -----------------------------------------------------------------------------
// API Endpoints
// -----------------------------------------------------------------------------
add_action('rest_api_init', function () {
  $ns = 'fe-auth/v1';

  // ---------------------------------------------------------------------------
  // Health check
  // ---------------------------------------------------------------------------
  register_rest_route($ns, '/ping', [
    'methods'  => 'GET',
    'callback' => fn() => ['ok' => true, 'ts' => time()],
    'permission_callback' => '__return_true',
  ]);

  // ---------------------------------------------------------------------------
  // Track view
  // ---------------------------------------------------------------------------
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

      // --- Update meta totals ---
      $total = (int)get_post_meta($post_id, '_views_total', true);
      $total++;
      update_post_meta($post_id, '_views_total', $total);

      // --- Per-user meta ---
      $user_id = get_current_user_id();
      $user_views_for_post = null;
      if ($user_id) {
        $raw = get_user_meta($user_id, '_views_by_user', true);
        $map = is_array($raw) ? $raw : (is_string($raw) && $raw ? json_decode($raw, true) : []);
        if (!is_array($map)) $map = [];
        $current = isset($map[$post_id]) ? (int)$map[$post_id] : 0;
        $current++;
        $map[$post_id] = $current;
        update_user_meta($user_id, '_views_by_user', wp_json_encode($map));
        $user_views_for_post = $current;
      }

      // --- Insert into SQL table ---
      $wpdb->insert(
        $wpdb->prefix . 'post_views',
        [
          'post_id'   => $post_id,
          'user_id'   => $user_id ?: null,
          'ip_address'=> isset($_SERVER['REMOTE_ADDR']) ? inet_pton($_SERVER['REMOTE_ADDR']) : null,
          'user_agent'=> $_SERVER['HTTP_USER_AGENT'] ?? '',
          'viewed_at' => current_time('mysql'),
        ],
        ['%d','%d','%s','%s','%s']
      );

      return [
        'post_id'     => $post_id,
        'views_total' => $total,
        'user_views'  => $user_views_for_post,
      ];
    },
  ]);

  // ---------------------------------------------------------------------------
  // Public user
  // ---------------------------------------------------------------------------
  register_rest_route($ns, '/public-user/(?P<slug>[a-z0-9_-]+)', [
    'methods'  => 'GET',
    'permission_callback' => '__return_true',
    'callback' => function (WP_REST_Request $req) {
      $slug = sanitize_title_for_query($req['slug']);

      $user = get_user_by('slug', $slug) ?: get_user_by('login', $slug);
      if (!$user) {
        $users = get_users([
          'search' => $slug,
          'search_columns' => ['user_nicename','user_login','display_name'],
          'number' => 1,
        ]);
        if (!empty($users)) $user = $users[0];
      }
      if (!$user) return new WP_REST_Response(null, 404);

      $base = [
        'id'            => (int)$user->ID,
        'slug'          => $user->user_nicename,
        'display_name'  => $user->display_name,
        'avatar_urls'   => rest_get_avatar_urls($user->ID),
        'url'           => $user->user_url,
        'description'   => get_user_meta($user->ID, 'description', true) ?: '',
        'profile_fields'=> get_user_meta($user->ID, 'profile_fields', true) ?: null,
        'social'        => [
          'twitter'  => fe_auth_normalize_url(get_user_meta($user->ID, 'twitter_url', true)),
          'linkedin' => fe_auth_normalize_url(get_user_meta($user->ID, 'linkedin_url', true)),
          'github'   => fe_auth_normalize_url(get_user_meta($user->ID, 'github_url', true)),
        ],
      ];

      $posts = get_posts([
        'author'         => $user->ID,
        'post_type'      => 'post',
        'post_status'    => 'publish',
        'orderby'        => 'date',
        'order'          => 'DESC',
        'posts_per_page' => 5,
      ]);
      $recent_posts = array_map(fn($p) => [
        'id'               => (int)$p->ID,
        'title'            => get_the_title($p),
        'slug'             => $p->post_name,
        'date'             => $p->post_date_gmt ?: $p->post_date,
        'link'             => get_permalink($p),
        'content_raw'      => $p->post_content,
        'content_rendered' => apply_filters('the_content', $p->post_content),
      ], $posts);

      $comments = get_comments([
        'user_id'   => $user->ID,
        'status'    => 'approve',
        'number'    => 5,
        'orderby'   => 'comment_date_gmt',
        'order'     => 'DESC',
      ]);
      $recent_comments = array_map(fn($c) => [
        'id'               => (int)$c->comment_ID,
        'post'             => (int)$c->comment_post_ID,
        'date'             => $c->comment_date_gmt ?: $c->comment_date,
        'link'             => get_comment_link($c),
        'content_raw'      => $c->comment_content,
        'content_rendered' => apply_filters('comment_text', $c->comment_content, $c),
      ], $comments);

      return array_merge($base, [
        'recent_posts'    => $recent_posts,
        'recent_comments' => $recent_comments,
      ]);
    },
  ]);

  // ---------------------------------------------------------------------------
  // Bookmarks
  // ---------------------------------------------------------------------------
  register_rest_route($ns, '/bookmarks', [
    'methods' => 'GET',
    'permission_callback' => fn() => is_user_logged_in(),
    'callback' => function (WP_REST_Request $req) {
      $user_id = get_current_user_id();
      $ids = get_user_meta($user_id, '_bookmarked_posts', true);
      if (!is_array($ids)) $ids = [];
      $ids = array_values(array_unique(array_map('intval', $ids)));

      if ($req->get_param('expand')) {
        $items = [];
        foreach ($ids as $pid) {
          $p = get_post($pid);
          if ($p && $p->post_status === 'publish') {
            $items[] = [
              'id' => $p->ID,
              'title' => get_the_title($p),
              'slug' => $p->post_name,
              'link' => get_permalink($p),
              'date' => get_post_time('c', true, $p),
              'count' => (int) get_post_meta($p->ID, '_bookmark_count', true),
            ];
          }
        }
        return [ 'items' => $items ];
      }
      return [ 'ids' => $ids ];
    },
  ]);

  register_rest_route($ns, '/bookmarks/check', [
    'methods' => 'GET',
    'permission_callback' => fn() => is_user_logged_in(),
    'callback' => function (WP_REST_Request $req) {
      $user_id = get_current_user_id();
      $post_id = absint($req->get_param('post_id'));
      if (!$post_id) return new WP_REST_Response([ 'error' => 'post_id required' ], 400);

      $ids = get_user_meta($user_id, '_bookmarked_posts', true);
      if (!is_array($ids)) $ids = [];
      $ids = array_values(array_unique(array_map('intval', $ids)));

      $bookmarked = in_array($post_id, $ids, true);
      $count = (int) get_post_meta($post_id, '_bookmark_count', true);
      return [ 'post_id' => $post_id, 'bookmarked' => $bookmarked, 'count' => $count ];
    },
  ]);

  register_rest_route($ns, '/bookmarks/toggle', [
    'methods' => 'POST',
    'permission_callback' => fn() => is_user_logged_in(),
    'callback' => function (WP_REST_Request $req) {
      $user_id = get_current_user_id();
      $params = $req->get_json_params();
      $post_id = absint($params['post_id'] ?? 0);
      if (!$post_id || get_post_status($post_id) !== 'publish') {
        return new WP_REST_Response([ 'error' => 'invalid post_id' ], 400);
      }

      $ids = get_user_meta($user_id, '_bookmarked_posts', true);
      if (!is_array($ids)) $ids = [];
      $ids = array_values(array_unique(array_map('intval', $ids)));

      $had = in_array($post_id, $ids, true);
      if ($had) {
        $ids = array_values(array_filter($ids, fn($v) => (int)$v !== (int)$post_id));
        update_user_meta($user_id, '_bookmarked_posts', $ids);
        $count = max(0, (int) get_post_meta($post_id, '_bookmark_count', true) - 1);
        update_post_meta($post_id, '_bookmark_count', $count);
        return [ 'post_id' => $post_id, 'bookmarked' => false, 'count' => $count ];
      } else {
        $ids[] = $post_id;
        $ids = array_values(array_unique(array_map('intval', $ids)));
        update_user_meta($user_id, '_bookmarked_posts', $ids);
        $count = (int) get_post_meta($post_id, '_bookmark_count', true) + 1;
        if ($count < 1) $count = 1;
        update_post_meta($post_id, '_bookmark_count', $count);
        return [ 'post_id' => $post_id, 'bookmarked' => true, 'count' => $count ];
      }
    },
  ]);
});

// -----------------------------------------------------------------------------
// Extend WP core user REST fields (profile_fields + social)
// -----------------------------------------------------------------------------
add_action('rest_api_init', function() {
  register_rest_field('user', 'profile_fields', [
    'get_callback' => fn($user) => (get_user_meta($user['id'], 'profile_fields', true)
      ? json_decode(get_user_meta($user['id'], 'profile_fields', true), true)
      : new stdClass()),
    'update_callback' => function($value, $user) {
      if (is_array($value)) update_user_meta($user->ID, 'profile_fields', wp_json_encode($value));
    },
    'schema' => [
      'description' => 'Custom user profile fields stored as JSON',
      'type'        => 'object',
      'context'     => ['view','edit'],
    ],
  ]);

  register_rest_field('user', 'social', [
    'get_callback' => fn($user) => [
      'twitter'  => fe_auth_normalize_url(get_user_meta($user['id'], 'twitter_url', true)),
      'linkedin' => fe_auth_normalize_url(get_user_meta($user['id'], 'linkedin_url', true)),
      'github'   => fe_auth_normalize_url(get_user_meta($user['id'], 'github_url', true)),
    ],
    'schema' => [
      'description' => 'User social meta URLs',
      'type'        => 'object',
      'context'     => ['view','edit'],
    ],
  ]);
});

// -----------------------------------------------------------------------------
// Limit public user fields
// -----------------------------------------------------------------------------
add_filter('rest_prepare_user', function($response, $user, $request) {
  if ($request['context'] === 'view') {
    $data = $response->get_data();
    $public = [
      'id'            => $data['id'],
      'name'          => $data['name'],
      'slug'          => $data['slug'],
      'description'   => $data['description'],
      'avatar_urls'   => $data['avatar_urls'],
      'profile_fields'=> $data['profile_fields'] ?? new stdClass(),
      'social'        => $data['social'] ?? new stdClass(),
    ];
    $response->set_data($public);
  }
  return $response;
}, 10, 3);

// -----------------------------------------------------------------------------
// Allow filtering comments by user_id
// -----------------------------------------------------------------------------
add_filter('rest_comment_query', function ($args, $request) {
  if (isset($request['user_id'])) $args['user_id'] = intval($request['user_id']);
  return $args;
}, 10, 2);

// -----------------------------------------------------------------------------
// Expose raw content fields
// -----------------------------------------------------------------------------
add_action('rest_api_init', function () {
  register_rest_field('post', 'content_raw', [
    'get_callback' => fn($post_arr) => (get_post($post_arr['id'])->post_content ?? ''),
    'schema' => [
      'description' => 'Raw post content',
      'type'        => 'string',
      'context'     => ['view','edit'],
    ],
  ]);

  register_rest_field('comment', 'content_raw', [
    'get_callback' => fn($comment_arr) => (get_comment($comment_arr['id'])->comment_content ?? ''),
    'schema' => [
      'description' => 'Raw comment content',
      'type'        => 'string',
      'context'     => ['view','edit'],
    ],
  ]);
});

