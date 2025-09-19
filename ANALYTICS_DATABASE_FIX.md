# WordPress Analytics Tracking Database Error - Fix Guide

## Problem
Your Next.js application is receiving "database_error" 500 responses when trying to track page views via the WordPress analytics system. This indicates that the required database tables are missing or have structural issues.

## Root Cause
The analytics tracking system requires specific database tables to be present in your WordPress database:
- `wp_page_views` - Universal page tracking
- `wp_page_view_meta` - Enhanced metadata (IP, user agent, device, etc.)
- `wp_page_view_sessions` - Session tracking
- `wp_post_views` - Legacy post view tracking
- `wp_post_view_meta` - Legacy post metadata

## Solution Steps

### Step 1: Verify WordPress MU Plugins are Active
1. Check that these files exist in your WordPress `wp-content/mu-plugins/` directory:
   - `fe-analytics-schema.php`
   - `fe-auth/track-page.php`
   - `fe-analytics/routes.php`

### Step 2: Force Database Table Creation
1. Access your WordPress server via SSH or FTP
2. Navigate to `wp-content/mu-plugins/_devtools/`
3. Run the database repair script:
   ```bash
   php fix_analytics_db.php
   ```
   
   Or if PHP CLI is not available, access it via web browser:
   ```
   https://techoblivion.in/wp-content/mu-plugins/_devtools/fix_analytics_db.php
   ```

### Step 3: Manual Database Creation (If Step 2 Fails)
If the automated repair doesn't work, manually create the tables using phpMyAdmin or MySQL CLI:

```sql
-- Enhanced metadata table
CREATE TABLE wp_page_view_meta (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    ip_address VARBINARY(16) DEFAULT NULL,
    referer VARCHAR(255) DEFAULT NULL,
    user_agent TEXT,
    device_type ENUM('mobile','tablet','desktop','unknown') DEFAULT 'unknown',
    country_code CHAR(2) DEFAULT NULL,
    screen_resolution VARCHAR(20) DEFAULT NULL,
    timezone VARCHAR(50) DEFAULT NULL,
    language VARCHAR(10) DEFAULT 'en',
    PRIMARY KEY (id),
    KEY device_type (device_type),
    KEY country_code (country_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Universal page views
CREATE TABLE wp_page_views (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    path VARCHAR(255) NOT NULL,
    page_type ENUM('home','post','page','category','tag','author','static','other') DEFAULT 'other',
    page_identifier VARCHAR(255) DEFAULT NULL,
    post_id BIGINT UNSIGNED DEFAULT NULL,
    user_id BIGINT UNSIGNED DEFAULT NULL,
    session_id BIGINT UNSIGNED DEFAULT NULL,
    meta_id BIGINT UNSIGNED DEFAULT NULL,
    page_title VARCHAR(255) DEFAULT NULL,
    viewed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY path (path),
    KEY page_type (page_type),
    KEY page_identifier (page_identifier),
    KEY post_id (post_id),
    KEY viewed_at (viewed_at),
    KEY session_id (session_id),
    KEY meta_id (meta_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sessions
CREATE TABLE wp_page_view_sessions (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    session_hash CHAR(64) NOT NULL,
    user_id BIGINT UNSIGNED DEFAULT NULL,
    first_seen DATETIME NOT NULL,
    last_seen DATETIME NOT NULL,
    total_views INT UNSIGNED DEFAULT 0,
    PRIMARY KEY (id),
    UNIQUE KEY session_hash (session_hash),
    KEY user_id (user_id),
    KEY last_seen (last_seen)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Legacy post views (backward compatibility)
CREATE TABLE wp_post_views (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    post_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED DEFAULT NULL,
    session_id BIGINT UNSIGNED DEFAULT NULL,
    meta_id BIGINT UNSIGNED DEFAULT NULL,
    viewed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY post_id (post_id),
    KEY viewed_at (viewed_at),
    KEY session_id (session_id),
    KEY meta_id (meta_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Legacy metadata (backward compatibility)
CREATE TABLE wp_post_view_meta (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    ip_address VARBINARY(16) DEFAULT NULL,
    referer VARCHAR(255) DEFAULT NULL,
    user_agent TEXT,
    device_type ENUM('mobile','tablet','desktop','unknown') DEFAULT 'unknown',
    country_code CHAR(2) DEFAULT NULL,
    PRIMARY KEY (id),
    KEY device_type (device_type),
    KEY country_code (country_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Daily rollups (backward compatibility)
CREATE TABLE wp_post_views_daily (
    post_id BIGINT UNSIGNED NOT NULL,
    day DATE NOT NULL,
    views INT UNSIGNED NOT NULL,
    unique_visitors INT UNSIGNED DEFAULT 0,
    PRIMARY KEY (post_id, day)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Note:** Replace `wp_` with your actual WordPress table prefix if different.

### Step 4: Verify the Fix
1. Test the tracking system:
   ```bash
   php test_analytics_tracking.php
   ```
   
   Or via web browser:
   ```
   https://techoblivion.in/wp-content/mu-plugins/_devtools/test_analytics_tracking.php
   ```

2. Check that all tables exist:
   ```bash
   php db_table_check.php
   ```

### Step 5: Alternative Quick Fix - Force Table Creation
If you have WordPress admin access, add this temporary code to your theme's `functions.php`:

```php
// Temporary: Force analytics table creation
add_action('admin_init', function() {
    if (current_user_can('manage_options') && isset($_GET['create_analytics_tables'])) {
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        
        // Call the table creation function
        if (function_exists('fe_ensure_analytics_tables')) {
            fe_ensure_analytics_tables();
            wp_die('Analytics tables created/updated. Remove this code from functions.php and refresh your site.');
        }
    }
});
```

Then visit: `https://techoblivion.in/wp-admin/?create_analytics_tables=1`

### Step 6: Verify WordPress Error Logs
Check your WordPress error logs at:
- `wp-content/debug.log`
- Server error logs (usually in cPanel or server admin panel)

Look for any related error messages that might provide more clues.

## Testing After Fix
1. Restart your Next.js application: `npm run start`
2. Visit a few pages on your site
3. Check the browser console - the "WordPress tracking failed" errors should be gone
4. Visit `/admin/analytics/auto` to see if the dashboard loads with data

## Prevention
To prevent this issue in the future:
1. Ensure all MU plugins are properly uploaded to WordPress
2. Monitor WordPress error logs regularly
3. Test analytics functionality after any WordPress updates

## If Problem Persists
If you continue to see database errors after following these steps:
1. Check WordPress database user permissions
2. Verify database connectivity
3. Check if WordPress is accessible from your Next.js server
4. Review the WP_URL environment variable configuration