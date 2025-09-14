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

// Allow filtering comments by user_id
add_filter('rest_comment_query', function ($args, $request) {
  if (isset($request['user_id'])) $args['user_id'] = intval($request['user_id']);
  return $args;
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
