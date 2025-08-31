# API Roles Matrix (generated)

> Do not edit manually. Source of truth: `src/config/apiRolesMatrix.ts`

| Endpoint | Method | Public | Subscriber | Contributor | Author | Editor | SEO Editor | SEO Manager | Administrator |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/api/auth/login` | POST | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/auth/logout` | POST | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/auth/logout` | GET | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/auth/me` | GET | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/auth/register` | POST | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/wp/users` | GET | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `/api/wp/users/[slug]` | GET | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/wp/users/me` | GET | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/wp/users/avatar` | GET | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/wp/posts` | GET | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/wp/posts` | POST | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/wp/posts` | PATCH | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/wp/posts/[id]` | DELETE | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `/api/wp/posts/[id]/revisions` | GET | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| `/api/wp/comments` | GET | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/wp/comments` | POST | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/wp/comments/[id]` | PATCH | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| `/api/wp/comments/[id]` | DELETE | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `/api/wp/media/list` | GET | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/wp/media` | POST | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/wp/media/[id]` | PATCH | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/wp/media/[id]` | DELETE | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `/api/wp/categories` | GET | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/wp/categories` | POST | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| `/api/wp/tags` | GET | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/wp/tags` | POST | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| `/api/wp/tags/resolve` | POST | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| `/api/admin` | GET | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `/api/wp/settings` | GET | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `/api/wp/settings` | PATCH | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `/api/csrf` | GET | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/media-cache` | GET | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/media-cache/image` | GET | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/revalidate` | POST | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `/api/test-wp` | GET | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `/api/wp/search` | GET | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/wp/related` | GET | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/wp/popular` | GET | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/wp/media/[...slug]` | GET | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/wp/users/avatar` | POST | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/wp/users/me` | POST | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/wp/users/me` | PUT | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/analytics/check` | GET | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| `/api/analytics/countries` | GET | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| `/api/analytics/devices` | GET | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| `/api/analytics/export` | GET | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| `/api/analytics/referers` | GET | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| `/api/analytics/sessions` | GET | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| `/api/analytics/summary` | GET | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| `/api/analytics/top-posts` | GET | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| `/api/analytics/views` | GET | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| `/api/wp/themes` | GET | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `/api/wp/plugins` | GET | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `/api/wp/plugins/[id]` | POST | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `/api/wp/site-health/background-updates` | GET | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `/api/wp/site-health/directory-sizes` | GET | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `/yoast/v1/get_head` | GET | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/yoast/v1/semrush/related_keyphrases` | GET | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| `/yoast/v1/indexing/posts` | POST | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| `/google-site-kit/v1/...` | GET | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| `/api/wp/track-view` | POST | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/wp/bookmarks` | GET | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/wp/bookmarks` | POST | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/robots.txt` | GET | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/sitemap.xml` | GET | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/_debug` | GET | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `/api/test` | GET | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

_Legend: ✅ allowed (any of read/write/delete/moderate), ❌ disallowed_