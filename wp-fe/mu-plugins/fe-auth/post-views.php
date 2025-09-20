<?php
if (!defined('ABSPATH')) { exit; }

add_action('rest_api_init', function () {
  $ns = 'fe-auth/v1';

  register_rest_route($ns, '/post-views/(?P<post_id>\d+)', [
    'methods'  => 'GET',
    'permission_callback' => '__return_true',
    'args' => [
      'post_id' => [
        'required' => true,
        'type' => 'integer',
        'validate_callback' => fn($v) => is_numeric($v) && $v > 0,
      ],
    ],
    'callback' => function (WP_REST_Request $req) {
      $post_id = (int)$req->get_param('post_id');
      $post = get_post($post_id);
      
      if (!$post || $post->post_status !== 'publish') {
        return new WP_REST_Response([ 'error' => 'invalid_post' ], 400);
      }

      // Get total views from post meta
      $total_views = (int)get_post_meta($post_id, '_views_total', true);
      
      return [
        'post_id' => $post_id,
        'views_total' => $total_views,
        'timestamp' => current_time('c')
      ];
    },
  ]);
});