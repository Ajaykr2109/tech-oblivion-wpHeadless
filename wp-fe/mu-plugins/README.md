# Tech Oblivion MU Plugins

This directory contains must-use plugins that support the Frontend (Next.js) integration.

- fe-auth.php + fe-auth/…
  - Auth Bridge exposing REST endpoints for public user data, bookmarks, proxying select core endpoints, and track-view.
  - Endpoints (namespace fe-auth/v1):
    - GET /ping — health check
    - GET /public-user/{slug}
    - GET /bookmarks, GET /bookmarks/check, POST /bookmarks/toggle
    - ALL /proxy?path=/wp/v2/... (whitelisted paths only)
    - POST /track-view — records a post view

- fe-analytics.php + fe-analytics/…
  - Analytics REST endpoints for charts and aggregates.
  - Endpoints (namespace fe-analytics/v1):
    - GET /check — table existence + row counts (admin only)
    - GET /views?period=day|week|month&from=YYYY-MM-DD&to=YYYY-MM-DD
    - GET /devices
    - GET /countries
    - GET /referers
    - GET /sessions (placeholder; may be empty until sessionization lands)
    - GET /top-posts?period=day|week|month
    - GET /summary — returns { views, devices, countries, referers }

- fe-analytics-schema.php
  - Creates and maintains custom tables. Runs idempotently on plugins_loaded via dbDelta.

## Table schema

Tables use the WordPress DB prefix (e.g. wp_):

- wp_post_views
  - id BIGINT PK
  - post_id BIGINT NOT NULL
  - user_id BIGINT NULL
  - session_id BIGINT NULL (reserved)
  - meta_id BIGINT NULL (FK to wp_post_view_meta.id)
  - viewed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP

- wp_post_view_meta
  - id BIGINT PK
  - ip_address VARBINARY(16) NULL
  - referer VARCHAR(255) NULL
  - user_agent TEXT
  - device_type ENUM('mobile','tablet','desktop','unknown') DEFAULT 'unknown'
  - country_code CHAR(2) NULL

- wp_post_view_sessions (planned)
  - id BIGINT PK
  - session_hash CHAR(64) UNIQUE
  - user_id BIGINT NULL
  - first_seen DATETIME NOT NULL
  - last_seen DATETIME NOT NULL
  - total_views INT DEFAULT 0

- wp_post_views_daily (planned)
  - post_id BIGINT NOT NULL
  - day DATE NOT NULL
  - views INT NOT NULL
  - unique_visitors INT DEFAULT 0
  - PRIMARY KEY (post_id, day)

Note: We separate raw events (wp_post_views) from request metadata (wp_post_view_meta). Inserts create a meta row first, then reference it from the view row.

## FE integration

- On post load, the frontend should call POST /api/wp/track-view with credentials: 'include' and JSON { post_id }.
- The Next.js API route should proxy to WP /fe-auth/v1/track-view and log errors (console.error) if non-2xx.

Example (Next.js):

fetch('/api/wp/track-view', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ post_id }),
}).catch(err => console.error('track-view failed', err));

## Dev tools

Helper scripts live under wp-content/mu-plugins/_devtools/ so they can be downloaded and won’t affect prod plugins:

- db_check.php — verifies tables exist and prints counts, samples, and SHOW CREATE TABLE for wp_post_views.
- track_view_test.php — executes the track-view endpoint for a recent published post.
- rest_smoke.php — calls analytics endpoints and prints their JSON.

These scripts can be removed after verification.

## Notes

- Sessionization and daily rollups are planned later; endpoints may return empty until implemented.
- Endpoints log DB errors to error_log via $wpdb->last_error for easier debugging.
