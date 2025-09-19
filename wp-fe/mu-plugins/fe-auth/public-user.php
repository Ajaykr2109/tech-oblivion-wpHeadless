<?php
if (!defined('ABSPATH')) { exit; }

add_action('rest_api_init', function () {
  $ns = 'fe-auth/v1';

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
});
