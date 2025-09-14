<?php
if (!defined('ABSPATH')) { exit; }

add_action('rest_api_init', function () {
  $ns = 'fe-auth/v1';

  register_rest_route($ns, '/proxy', [
    'methods'  => ['GET','POST','PUT','PATCH','DELETE'],
    'permission_callback' => '__return_true',
    'args' => [
      'path' => [ 'type' => 'string', 'required' => true ],
    ],
    'callback' => function (WP_REST_Request $req) {
      $allowed_prefixes = [
        '/wp/v2/posts',
        '/wp/v2/comments',
        '/wp/v2/users',
        '/wp/v2/media',
        '/wp/v2/tags',
        '/wp/v2/categories',
      ];

      $path = '/' . ltrim((string)$req->get_param('path'), '/');
      $ok = false;
      foreach ($allowed_prefixes as $p) {
        if (strpos($path, $p) === 0) { $ok = true; break; }
      }
      if (!$ok) {
        return new WP_REST_Response([ 'error' => 'path_not_allowed' ], 400);
      }

      $method = $req->get_method();
      $url = rest_url(ltrim($path, '/'));

      $headers = [];
      $auth = $req->get_header('authorization');
      if ($auth) { $headers['Authorization'] = $auth; }

      $body = in_array($method, ['POST','PUT','PATCH','DELETE'], true) ? wp_json_encode($req->get_json_params()) : null;

      $resp = wp_remote_request($url, [
        'method'  => $method,
        'headers' => array_merge([ 'Content-Type' => 'application/json' ], $headers),
        'body'    => $body,
        'timeout' => 15,
      ]);

      if (is_wp_error($resp)) {
        error_log('[FE Auth Proxy] WP_Error: ' . $resp->get_error_message() . ' for ' . $method . ' ' . $path);
        return new WP_REST_Response([ 'error' => 'proxy_error', 'message' => $resp->get_error_message() ], 502);
      }

      $code = wp_remote_retrieve_response_code($resp) ?: 200;
      $body = wp_remote_retrieve_body($resp);
      $data = json_decode($body, true);
      if ($code >= 400) {
        error_log('[FE Auth Proxy] HTTP ' . $code . ' for ' . $method . ' ' . $path . ' body: ' . (is_string($body) ? substr($body, 0, 500) : '')); 
      }
      if ($data === null && $body !== 'null') {
        return new WP_REST_Response($body, $code);
      }
      return new WP_REST_Response($data, $code);
    }
  ]);
});
