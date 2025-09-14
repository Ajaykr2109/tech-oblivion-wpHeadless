<?php
/*
Plugin Name: FE Auth Bridge (Unified)
Description: Loader for FE Auth modules (proxy, public user, bookmarks, fields, track view).
Version: 1.3.0
Author: Tech Oblivion
*/

if (!defined('ABSPATH')) { exit; }

if (!function_exists('fe_auth_normalize_url')) {
  function fe_auth_normalize_url($u) {
    if (!$u) return null;
    if (is_array($u) || is_object($u)) return null;
    $s = trim((string)$u);
    if ($s === '') return null;
    if (preg_match('#^https?://#i', $s)) return $s;
    return 'https://' . ltrim($s);
  }
}

add_action('rest_api_init', function () {
  register_rest_route('fe-auth/v1', '/ping', [
    'methods'  => 'GET',
    'callback' => fn() => ['ok' => true, 'ts' => time()],
    'permission_callback' => '__return_true',
  ]);
});

require_once __DIR__ . '/fe-auth/index.php';

