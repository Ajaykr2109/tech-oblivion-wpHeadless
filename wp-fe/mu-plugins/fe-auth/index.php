<?php
/**
 * FE Auth Bridge Loader
 * Loads submodules: proxy, public user, bookmarks, fields, track view.
 */
if (!defined('ABSPATH')) { exit; }

// Load geolocation service
require_once __DIR__ . '/geolocation.php';

require_once __DIR__ . '/track-view.php';
require_once __DIR__ . '/track-page.php';
require_once __DIR__ . '/proxy.php';
require_once __DIR__ . '/public-user.php';
require_once __DIR__ . '/bookmarks.php';
require_once __DIR__ . '/rest-fields.php';
