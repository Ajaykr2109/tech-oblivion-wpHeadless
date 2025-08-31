<?php
/**
 * Plugin Name: FE Auth Users Bulk Delete (MU)
 * Description: Adds custom REST endpoint to bulk delete users.
 * Author: Headless FE
 */

add_action('rest_api_init', function () {
  register_rest_route('fe-auth/v1', '/users/bulk-delete', [
    'methods' => 'POST',
    'callback' => function (WP_REST_Request $request) {
      if (!current_user_can('delete_users')) {
        return new WP_Error('forbidden', 'You are not allowed to delete users', ['status' => 403]);
      }
      $params = $request->get_json_params();
      $ids = isset($params['ids']) && is_array($params['ids']) ? array_map('intval', $params['ids']) : [];
      if (empty($ids)) {
        return new WP_Error('bad_request', 'No user IDs provided', ['status' => 400]);
      }
      $results = [];
      foreach ($ids as $id) {
        $deleted = wp_delete_user($id);
        $results[$id] = (bool) $deleted;
      }
      return rest_ensure_response(['ok' => true, 'results' => $results]);
    },
    'permission_callback' => function () {
      return current_user_can('delete_users');
    },
  ]);
});
