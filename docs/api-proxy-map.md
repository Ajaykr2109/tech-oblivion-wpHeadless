# API Proxy Map (generated)

> Do not edit manually. Generated from app/api and src/app/api by scripts/generateApiMap.ts

| Endpoint | Methods | Upstream WP Endpoint(s) |
| --- | --- | --- |
| `/api/_debug` | GET | _n/a_ |
| `/api/admin` | GET | _n/a_ |
| `/api/analytics/check` | GET | `{WP}/wp-json/fe-analytics/v1/check` |
| `/api/analytics/countries` | GET | `{WP}/wp-json/fe-analytics/v1/countries` |
| `/api/analytics/devices` | GET | `{WP}/wp-json/fe-analytics/v1/devices` |
| `/api/analytics/export` | GET | _n/a_ |
| `/api/analytics/referers` | GET | `{WP}/wp-json/fe-analytics/v1/referers` |
| `/api/analytics/sessions` | GET | `{WP}/wp-json/fe-analytics/v1/sessions` |
| `/api/analytics/summary` | GET | `{WP}/wp-json/fe-analytics/v1/views`<br/>`{WP}/wp-json/fe-analytics/v1/devices`<br/>`{WP}/wp-json/fe-analytics/v1/countries`<br/>`{WP}/wp-json/fe-analytics/v1/referers`<br/>`{WP}/wp-json/fe-analytics/v1/summary` |
| `/api/analytics/top-posts` | GET | `{WP}/wp-json/fe-analytics/v1/top-posts` |
| `/api/analytics/views` | GET | `{WP}/wp-json/fe-analytics/v1/views` |
| `/api/auth/login` | POST | _n/a_ |
| `/api/auth/login` | GET | _n/a_ |
| `/api/auth/logout` | POST, GET | _n/a_ |
| `/api/auth/logout` | GET | _n/a_ |
| `/api/auth/me` | GET | `{WP}/wp-json/wp/v2/users/me` |
| `/api/auth/me` | GET | _n/a_ |
| `/api/auth/register` | POST | _n/a_ |
| `/api/csrf` | GET | _n/a_ |
| `/api/media-cache` | GET | _n/a_ |
| `/api/media-cache` | GET | _n/a_ |
| `/api/media-cache/image` | GET | _n/a_ |
| `/api/media-cache/image` | GET | _n/a_ |
| `/api/revalidate` | POST | _n/a_ |
| `/api/test` | GET | _n/a_ |
| `/api/test-wp` | GET | _n/a_ |
| `/api/wp/bookmarks` | GET, POST | _n/a_ |
| `/api/wp/categories` | GET, POST | `{WP}/wp-json/wp/v2/categories` |
| `/api/wp/comments` | GET, POST | _n/a_ |
| `/api/wp/comments` | GET, POST | `{WP}/wp-json/fe-auth/v1/proxy`<br/>`{WP}/wp-json/wp/v2/comments` |
| `/api/wp/media/_debug` | GET | _n/a_ |
| `/api/wp/media/[...path]` | GET | _n/a_ |
| `/api/wp/media/[...slug]` | GET | _n/a_ |
| `/api/wp/media/[...slug]` | GET | _n/a_ |
| `/api/wp/media/list` | GET | `{WP}/wp-json/wp/v2/media` |
| `/api/wp/popular` | GET | `{WP}/wp-json/wordpress-popular-posts`<br/>`{WP}/wp-json/wp/v2/posts` |
| `/api/wp/posts` | GET, POST, PATCH | _n/a_ |
| `/api/wp/posts` | GET, POST, PATCH | `{WP}/wp-json/fe-auth/v1/proxy`<br/>`{WP}/wp-json/wp/v2/posts` |
| `/api/wp/related` | GET | `{WP}/wp-json/wp/v2/posts` |
| `/api/wp/related` | GET | `{WP}/wp-json/wp/v2/posts` |
| `/api/wp/search` | GET | `{WP}/wp-json/wp/v2/posts` |
| `/api/wp/tags` | GET, POST | `{WP}/wp-json/wp/v2/tags` |
| `/api/wp/tags/resolve` | POST | `{WP}/wp-json/wp/v2/tags` |
| `/api/wp/track-view` | POST | `{WP}/wp-json/fe-auth/v1/track-view` |
| `/api/wp/users` | GET | `{WP}/wp-json/wp/v2/users`<br/>`{WP}/wp-json/fe-auth/v1/proxy` |
| `/api/wp/users/[slug]` | GET | _n/a_ |
| `/api/wp/users/avatar` | POST | `{WP}/wp-json/wp/v2/media`<br/>`{WP}/wp-json/wp/v2/users/me` |
| `/api/wp/users/me` | GET, POST, PUT | `{WP}/wp-json/fe-auth/v1/proxy`<br/>`{WP}/wp-json/wp/v2/users/me` |
| `/api/wp/users/me` | GET | `{WP}/wp-json/wp/v2/users/me` |

_Note: This is best-effort static analysis. Dynamic endpoints or function-based apiMap entries may not be fully resolved._