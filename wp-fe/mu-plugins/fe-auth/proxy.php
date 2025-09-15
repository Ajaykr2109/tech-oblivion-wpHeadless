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
      
      // Forward all query parameters from the original request
      $query_params = [];
      foreach ($req->get_params() as $key => $value) {
        if ($key !== 'path') { // Skip the 'path' parameter used by proxy
          if (strpos($key, 'query[') === 0 && substr($key, -1) === ']') {
            // Handle query[param] format from Next.js proxy
            $param_name = substr($key, 6, -1);
            $query_params[$param_name] = $value;
          } else {
            $query_params[$key] = $value;
          }
        }
      }
      
      // Special handling for WordPress array parameters based on endpoint
      // Comments endpoint expects 'post' (singular) not 'post[]'
      // Posts endpoint can use 'post[]' for multiple post filtering
      $is_comments_endpoint = strpos($path, '/wp/v2/comments') === 0;
      
      if (!$is_comments_endpoint) {
        // Convert single 'post' parameter to array format for non-comments endpoints
        if (isset($query_params['post']) && !isset($query_params['post[]'])) {
          $query_params['post[]'] = $query_params['post'];
          unset($query_params['post']);
          error_log('[FE Auth Proxy] Converted post parameter to array format: ' . $query_params['post[]']);
        }
      } else {
        // For comments endpoint, keep 'post' parameter as singular
        error_log('[FE Auth Proxy] Comments endpoint detected, keeping post parameter as singular: ' . ($query_params['post'] ?? 'not set'));
      }
      
      // Convert single 'author' parameter to array format for non-comments endpoints  
      if (!$is_comments_endpoint) {
        if (isset($query_params['author']) && !isset($query_params['author[]'])) {
          $query_params['author[]'] = $query_params['author'];
          unset($query_params['author']);
          error_log('[FE Auth Proxy] Converted author parameter to array format: ' . $query_params['author[]']);
        }
      } else {
        // For comments endpoint, keep 'author' parameter as singular
        error_log('[FE Auth Proxy] Comments endpoint detected, keeping author parameter as singular: ' . ($query_params['author'] ?? 'not set'));
      }
      
      // Add query parameters to URL
      if (!empty($query_params)) {
        $url_parts = wp_parse_url($url);
        $existing_query = [];
        if (isset($url_parts['query'])) {
          parse_str($url_parts['query'], $existing_query);
        }
        $all_params = array_merge($existing_query, $query_params);
        $url = add_query_arg($all_params, $url);
      }
      
      error_log('[FE Auth Proxy] Final URL: ' . $url);

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
