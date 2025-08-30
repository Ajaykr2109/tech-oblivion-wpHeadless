<?php
/*
Plugin Name: FE Auth Bridge – Bookmarks API
Description: Adds bookmarks endpoints under /wp-json/fe-auth/v1 for logged-in users. Stores state in user meta and counts in post meta.
Version: 0.1.0
Author: Tech Oblivion
*/

if (!defined('ABSPATH')) { exit; }

add_action('rest_api_init', function () {
  $ns = 'fe-auth/v1';

  // GET /bookmarks -> list current user's bookmarks
  register_rest_route($ns, '/bookmarks', [
    'methods' => 'GET',
    'permission_callback' => function () { return is_user_logged_in(); },
    'callback' => function (WP_REST_Request $req) {
      $user_id = get_current_user_id();
      $ids = get_user_meta($user_id, '_bookmarked_posts', true);
      if (!is_array($ids)) { $ids = []; }
      $ids = array_values(array_unique(array_map('intval', $ids)));

      $expand = $req->get_param('expand');
      if ($expand) {
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
        return rest_ensure_response([ 'items' => $items ]);
      }
      return rest_ensure_response([ 'ids' => $ids ]);
    },
  ]);

  // GET /bookmarks/check?post_id=123 -> state for this post
  register_rest_route($ns, '/bookmarks/check', [
    'methods' => 'GET',
    'permission_callback' => function () { return is_user_logged_in(); },
    'callback' => function (WP_REST_Request $req) {
      $user_id = get_current_user_id();
      $post_id = absint($req->get_param('post_id'));
      if (!$post_id) {
        return new WP_REST_Response([ 'error' => 'post_id required' ], 400);
      }
      $ids = get_user_meta($user_id, '_bookmarked_posts', true);
      if (!is_array($ids)) { $ids = []; }
      $ids = array_values(array_unique(array_map('intval', $ids)));
      $bookmarked = in_array($post_id, $ids, true);
      $count = (int) get_post_meta($post_id, '_bookmark_count', true);
      return rest_ensure_response([ 'post_id' => $post_id, 'bookmarked' => $bookmarked, 'count' => $count ]);
    },
  ]);

  // POST /bookmarks/toggle { post_id }
  register_rest_route($ns, '/bookmarks/toggle', [
    'methods' => 'POST',
    'permission_callback' => function () { return is_user_logged_in(); },
    'callback' => function (WP_REST_Request $req) {
      $user_id = get_current_user_id();
      $params = $req->get_json_params();
      $post_id = absint($params['post_id'] ?? 0);
      if (!$post_id || get_post_status($post_id) !== 'publish') {
        return new WP_REST_Response([ 'error' => 'invalid post_id' ], 400);
      }

      $ids = get_user_meta($user_id, '_bookmarked_posts', true);
      if (!is_array($ids)) { $ids = []; }
      $ids = array_values(array_unique(array_map('intval', $ids)));

      $had = in_array($post_id, $ids, true);
      if ($had) {
        // remove
        $ids = array_values(array_filter($ids, function($v) use ($post_id) { return (int)$v !== (int)$post_id; }));
        update_user_meta($user_id, '_bookmarked_posts', $ids);
        $count = max(0, (int) get_post_meta($post_id, '_bookmark_count', true) - 1);
        update_post_meta($post_id, '_bookmark_count', $count);
        return rest_ensure_response([ 'post_id' => $post_id, 'bookmarked' => false, 'count' => $count ]);
      } else {
        // add
        $ids[] = $post_id;
        $ids = array_values(array_unique(array_map('intval', $ids)));
        update_user_meta($user_id, '_bookmarked_posts', $ids);
        $count = (int) get_post_meta($post_id, '_bookmark_count', true) + 1;
        if ($count < 1) { $count = 1; }
        update_post_meta($post_id, '_bookmark_count', $count);
        return rest_ensure_response([ 'post_id' => $post_id, 'bookmarked' => true, 'count' => $count ]);
      }
    },
  ]);
});
