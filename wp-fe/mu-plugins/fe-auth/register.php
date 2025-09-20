<?php
/**
 * User Registration endpoint for FE Auth Bridge
 * Handles user registration with additional profile fields
 */
if (!defined('ABSPATH')) { exit; }

add_action('rest_api_init', function () {
  $ns = 'fe-auth/v1';

  register_rest_route($ns, '/register', [
    'methods'  => 'POST',
    'permission_callback' => '__return_true',
    'callback' => function (WP_REST_Request $req) {
      // Check if user registration is enabled
      if (!get_option('users_can_register')) {
        return new WP_REST_Response([
          'error' => 'registration_disabled',
          'message' => 'User registration is currently disabled.'
        ], 403);
      }

      $params = $req->get_json_params();
      
      // Required fields
      $email = sanitize_email($params['email'] ?? '');
      $password = $params['password'] ?? '';
      $username = sanitize_user($params['username'] ?? '');
      
      // Optional fields  
      $display_name = sanitize_text_field($params['display_name'] ?? '');
      $gender = sanitize_text_field($params['gender'] ?? '');
      $date_of_birth = sanitize_text_field($params['date_of_birth'] ?? '');

      // Validation
      if (empty($email) || !is_email($email)) {
        return new WP_REST_Response([
          'error' => 'invalid_email',
          'message' => 'A valid email address is required.'
        ], 400);
      }

      if (empty($password) || strlen($password) < 6) {
        return new WP_REST_Response([
          'error' => 'weak_password',
          'message' => 'Password must be at least 6 characters long.'
        ], 400);
      }

      if (empty($username)) {
        // Generate username from email if not provided
        $username = sanitize_user(explode('@', $email)[0]);
        // Ensure username is unique
        $base_username = $username;
        $counter = 1;
        while (username_exists($username)) {
          $username = $base_username . $counter;
          $counter++;
        }
      }

      // Validate username
      if (!validate_username($username)) {
        return new WP_REST_Response([
          'error' => 'invalid_username',
          'message' => 'Username contains invalid characters.'
        ], 400);
      }

      if (username_exists($username)) {
        return new WP_REST_Response([
          'error' => 'username_exists',
          'message' => 'Username already exists. Please choose a different one.'
        ], 400);
      }

      if (email_exists($email)) {
        return new WP_REST_Response([
          'error' => 'email_exists',
          'message' => 'An account with this email already exists.'
        ], 400);
      }

      // Validate age (must be 13+)
      if (!empty($date_of_birth)) {
        $dob = DateTime::createFromFormat('Y-m-d', $date_of_birth);
        if (!$dob) {
          return new WP_REST_Response([
            'error' => 'invalid_date',
            'message' => 'Invalid date of birth format. Use YYYY-MM-DD.'
          ], 400);
        }
        
        $today = new DateTime();
        $age = $today->diff($dob)->y;
        if ($age < 13) {
          return new WP_REST_Response([
            'error' => 'age_restriction',
            'message' => 'You must be at least 13 years old to register.'
          ], 400);
        }
      }

      // Create the user
      $user_data = [
        'user_login' => $username,
        'user_email' => $email,
        'user_pass' => $password,
        'display_name' => $display_name ?: $username,
        'role' => 'subscriber'
      ];

      $user_id = wp_insert_user($user_data);

      if (is_wp_error($user_id)) {
        return new WP_REST_Response([
          'error' => 'registration_failed',
          'message' => $user_id->get_error_message()
        ], 400);
      }

      // Add custom profile fields
      if (!empty($gender)) {
        update_user_meta($user_id, 'gender', $gender);
      }
      
      if (!empty($date_of_birth)) {
        update_user_meta($user_id, 'date_of_birth', $date_of_birth);
      }

      // Mark email as verified if auto-verification is enabled
      // In production, you might want to send verification emails
      $auto_verify = apply_filters('fe_auth_auto_verify_email', true);
      if ($auto_verify) {
        update_user_meta($user_id, 'email_verified', true);
      }

      // Get the created user
      $user = get_user_by('id', $user_id);
      if (!$user) {
        return new WP_REST_Response([
          'error' => 'user_not_found',
          'message' => 'User was created but could not be retrieved.'
        ], 500);
      }

      // Return user data (excluding sensitive info)
      $user_data = [
        'id' => $user->ID,
        'username' => $user->user_login,
        'email' => $user->user_email,
        'display_name' => $user->display_name,
        'roles' => $user->roles,
        'avatar_urls' => rest_get_avatar_urls($user->user_email),
        'profile_fields' => [
          'gender' => get_user_meta($user_id, 'gender', true),
          'date_of_birth' => get_user_meta($user_id, 'date_of_birth', true),
        ]
      ];

      // Log successful registration
      error_log('[FE Auth Register] User registered successfully: ' . $username);

      return new WP_REST_Response([
        'success' => true,
        'message' => 'Registration successful. Welcome!',
        'user' => $user_data
      ], 201);
    }
  ]);
});