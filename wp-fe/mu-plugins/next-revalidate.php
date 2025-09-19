<?php
/**
 * Plugin Name: Next.js Revalidate Hook (MU)
 * Description: On publish/update, POSTs the WP post slug to Next.js /api/revalidate with a shared secret.
 */

add_action('transition_post_status', function ($new_status, $old_status, $post) {
  // Only fire on publish/update transitions for public posts
  if ($new_status !== 'publish') return;
  if (!in_array(get_post_type($post), ['post', 'page'], true)) return; // add CPTs if needed

  $slug = $post->post_name;
  if (empty($slug)) return;

  $endpoint = getenv('NEXT_REVALIDATE_URL');   // e.g. https://your-fe.com/api/revalidate
  $secret   = getenv('NEXT_REVALIDATE_SECRET'); // same as in .env.local

  if (!$endpoint || !$secret) return;

  $body = wp_json_encode(['slug' => $slug, 'all' => false, 'secret' => $secret]);
  $resp = wp_remote_post($endpoint, [
    'headers' => ['Content-Type' => 'application/json'],
    'timeout' => 5,
    'body'    => $body,
  ]);

  // Optional: log failures
  if (is_wp_error($resp) || wp_remote_retrieve_response_code($resp) >= 400) {
    error_log('[Next Revalidate] Failed for slug '.$slug.': '.(is_wp_error($resp) ? $resp->get_error_message() : wp_remote_retrieve_body($resp)));
  }
}, 10, 3);
