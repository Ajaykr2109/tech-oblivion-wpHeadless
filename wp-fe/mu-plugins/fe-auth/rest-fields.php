<?php
if (!defined('ABSPATH')) { exit; }

// Extend WP core user REST fields (profile_fields + social)
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

// Limit public user fields
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

// Allow filtering comments by user_id and enhance post filtering
add_filter('rest_comment_query', function ($args, $request) {
  // Debug logging
  error_log('[FE Auth Rest Fields] Comment query filter called with request: ' . json_encode($request->get_params()));
  
  if (isset($request['user_id'])) $args['user_id'] = intval($request['user_id']);
  
  // Enhance author parameter handling for comments
  if (isset($request['author'])) {
    if (is_array($request['author'])) {
      $args['user_id__in'] = array_map('intval', $request['author']);
      error_log('[FE Auth Rest Fields] Set user_id__in: ' . json_encode($args['user_id__in']));
    } else {
      $args['user_id'] = intval($request['author']);
      error_log('[FE Auth Rest Fields] Set user_id: ' . $args['user_id']);
    }
  }
  
  // Enhanced post parameter filtering - this is the critical part for comment filtering
  if (isset($request['post'])) {
    if (is_array($request['post'])) {
      $post_ids = array_map('intval', $request['post']);
      $args['post__in'] = $post_ids;
      error_log('[FE Auth Rest Fields] Set post__in: ' . json_encode($post_ids));
    } else {
      $post_id = intval($request['post']);
      $args['post_id'] = $post_id;
      error_log('[FE Auth Rest Fields] Set post_id: ' . $post_id);
    }
  }
  
  error_log('[FE Auth Rest Fields] Final comment args: ' . json_encode($args));
  return $args;
}, 10, 2);

// Enhance posts query filtering
add_filter('rest_post_query', function ($query_vars, $request) {
  // Ensure author parameter works correctly for posts
  if (isset($request['author'])) {
    if (is_array($request['author'])) {
      $query_vars['author__in'] = array_map('intval', $request['author']);
    } else {
      $query_vars['author'] = intval($request['author']);
    }
  }
  
  return $query_vars;
}, 10, 2);

// Expose raw content fields
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
