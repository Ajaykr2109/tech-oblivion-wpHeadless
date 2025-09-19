<?php
/**
 * FE Comment Settings Module
 * Provides REST endpoints for comment moderation settings
 */
if (!defined('ABSPATH')) { exit; }

add_action('rest_api_init', function () {
  $ns = 'fe-auth/v1';

  // Comment settings endpoint
  register_rest_route($ns, '/comment-settings', [
    'methods' => ['GET', 'POST'],
    'permission_callback' => function() {
      return current_user_can('manage_options');
    },
    'callback' => function (WP_REST_Request $request) {
      if ($request->get_method() === 'GET') {
        // Get current comment settings
        $settings = [
          // Auto-approve when comment_moderation is disabled (0)
          'autoApprove' => get_option('comment_moderation') === '0',
          'moderationRequired' => get_option('comment_moderation') === '1',
          'requireName' => get_option('require_name_email') === '1',
          'requireEmail' => get_option('require_name_email') === '1',
        ];
        
        return new WP_REST_Response($settings, 200);
      } else {
        // Update comment settings
        $data = $request->get_json_params();
  $auto_approve = isset($data['autoApprove']) ? (bool)$data['autoApprove'] : false;
        
  // Update WordPress options
  // default_comment_status controls open/closed for posts, not moderation state
  // Auto-approve is governed by comment_moderation (0 = auto-approve, 1 = require approval)
  update_option('comment_moderation', $auto_approve ? '0' : '1');
        
        // Return updated settings
        $updated_settings = [
          'success' => true,
          'autoApprove' => get_option('comment_moderation') === '0',
          'moderationRequired' => get_option('comment_moderation') === '1',
        ];
        
        return new WP_REST_Response($updated_settings, 200);
      }
    }
  ]);

  // Bulk comment actions endpoint
  register_rest_route($ns, '/comments/bulk', [
    'methods' => ['POST'],
    'permission_callback' => function() {
      return current_user_can('moderate_comments');
    },
    'callback' => function (WP_REST_Request $request) {
      $data = $request->get_json_params();
      $comment_ids = isset($data['comment_ids']) ? (array)$data['comment_ids'] : [];
      $action = isset($data['action']) ? sanitize_text_field($data['action']) : '';
      
      if (empty($comment_ids) || empty($action)) {
        return new WP_REST_Response(['error' => 'Missing comment_ids or action'], 400);
      }
      
      $results = [];
      // Map incoming actions to wp_set_comment_status() values
      // wp_set_comment_status expects: 'hold', 'approve', 'spam', 'trash', or use wp_delete_comment for permanent deletion
      $action_map = [
        'approve' => 'approve',
        'unapprove' => 'hold',
        'spam' => 'spam',
        'unspam' => 'approve',
        'trash' => 'trash',
        'restore' => 'approve',
        'delete' => 'delete'
      ];
      
      $status = isset($action_map[$action]) ? $action_map[$action] : null;
      if (!$status) {
        return new WP_REST_Response(['error' => 'Invalid action'], 400);
      }
      
      foreach ($comment_ids as $comment_id) {
        $comment_id = intval($comment_id);
        if ($action === 'delete') {
          $result = wp_delete_comment($comment_id, true);
        } else {
          $result = wp_set_comment_status($comment_id, $status);
        }
        $results[$comment_id] = $result;
      }
      
      return new WP_REST_Response([
        'success' => true,
        'action' => $action,
        'processed' => count($comment_ids),
        'results' => $results
      ], 200);
    }
  ]);
});