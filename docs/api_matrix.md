# API Role Matrix (Next.js → WordPress REST)

✅ = allowed
❌ = not allowed / hidden


| Endpoint                                         | Public (no auth) | Subscriber | Contributor     | Author         | Editor        | SEO Editor | SEO Manager | Administrator |
| ------------------------------------------------ | ---------------- | ---------- | --------------- | -------------- | ------------- | ---------- | ----------- | ------------- |
| **Auth**                                         |                  |            |                 |                |               |            |             |               |
| `/api/auth/login`                                | ✅               | ✅         | ✅              | ✅             | ✅            | ✅         | ✅          | ✅            |
| `/api/auth/logout`                               | ✅               | ✅         | ✅              | ✅             | ✅            | ✅         | ✅          | ✅            |
| `/api/auth/me`                                   | ❌               | ✅         | ✅              | ✅             | ✅            | ✅         | ✅          | ✅            |
| `/api/auth/register`                             | ✅               | ✅         | ✅              | ✅             | ✅            | ✅         | ✅          | ✅            |
| **Users**                                        |                  |            |                 |                |               |            |             |               |
| `/api/wp/users`(list)                            | ❌               | ❌         | ❌              | ❌             | ❌            | ❌         | ❌          | ✅            |
| `/api/wp/users/[slug]`                           | ✅               | ✅         | ✅              | ✅             | ✅            | ✅         | ✅          | ✅            |
| `/api/wp/users/me`                               | ❌               | ✅         | ✅              | ✅             | ✅            | ✅         | ✅          | ✅            |
| `/api/wp/users/avatar`                           | ✅               | ✅         | ✅              | ✅             | ✅            | ✅         | ✅          | ✅            |
| Create/Update/Delete users                       | ❌               | ❌         | ❌              | ❌             | ❌            | ❌         | ❌          | ✅            |
| **Posts**                                        |                  |            |                 |                |               |            |             |               |
| `GET /api/wp/posts`                              | ✅               | ✅         | ✅              | ✅             | ✅            | ✅         | ✅          | ✅            |
| `POST /api/wp/posts`                             | ❌               | ❌         | ✅ (draft only) | ✅             | ✅            | ✅         | ✅          | ✅            |
| `PATCH /api/wp/posts/[id]`                       | ❌               | ❌         | ❌              | ✅ (own posts) | ✅            | ✅         | ✅          | ✅            |
| `DELETE /api/wp/posts/[id]`                      | ❌               | ❌         | ❌              | ❌             | ❌            | ❌         | ❌          | ✅            |
| `GET /api/wp/posts/[id]/revisions`               | ❌               | ❌         | ❌              | ❌             | ✅            | ✅         | ✅          | ✅            |
| **Comments**                                     |                  |            |                 |                |               |            |             |               |
| `GET /api/wp/comments`                           | ✅               | ✅         | ✅              | ✅             | ✅            | ✅         | ✅          | ✅            |
| `POST /api/wp/comments`                          | ❌               | ✅         | ✅              | ✅             | ✅            | ✅         | ✅          | ✅            |
| `PATCH /api/wp/comments/[id]`                    | ❌               | ❌         | ❌              | ❌             | ✅ (moderate) | ❌         | ❌          | ✅            |
| `DELETE /api/wp/comments/[id]`                   | ❌               | ❌         | ❌              | ❌             | ❌            | ❌         | ❌          | ✅            |
| **Media**                                        |                  |            |                 |                |               |            |             |               |
| `GET /api/wp/media/list`                         | ✅               | ✅         | ✅              | ✅             | ✅            | ✅         | ✅          | ✅            |
| `POST /api/wp/media`(upload)                     | ❌               | ❌         | ❌              | ✅             | ✅            | ✅         | ✅          | ✅            |
| `PATCH /api/wp/media/[id]`                       | ❌               | ❌         | ❌              | ✅ (own)       | ✅            | ✅         | ✅          | ✅            |
| `DELETE /api/wp/media/[id]`                      | ❌               | ❌         | ❌              | ❌             | ❌            | ❌         | ❌          | ✅            |
| **Taxonomies**                                   |                  |            |                 |                |               |            |             |               |
| `GET /api/wp/categories`/`tags`                  | ✅               | ✅         | ✅              | ✅             | ✅            | ✅         | ✅          | ✅            |
| Create/Update/Delete taxonomies                  | ❌               | ❌         | ❌              | ❌             | ❌            | ❌         | ❌          | ✅            |
| **Admin / Site Settings**                        |                  |            |                 |                |               |            |             |               |
| `GET /api/wp/settings`                           | ❌               | ❌         | ❌              | ❌             | ❌            | ❌         | ❌          | ✅            |
| `PATCH /api/wp/settings`                         | ❌               | ❌         | ❌              | ❌             | ❌            | ❌         | ❌          | ✅            |
| **Plugins & Themes**                             |                  |            |                 |                |               |            |             |               |
| `GET /api/wp/themes`                             | ❌               | ❌         | ❌              | ❌             | ❌            | ❌         | ❌          | ✅            |
| `GET /api/wp/plugins`                            | ❌               | ❌         | ❌              | ❌             | ❌            | ❌         | ❌          | ✅            |
| `POST /api/wp/plugins/[id]`(activate/deactivate) | ❌               | ❌         | ❌              | ❌             | ❌            | ❌         | ❌          | ✅            |
| **Site Health**                                  |                  |            |                 |                |               |            |             |               |
| `GET /api/wp/site-health/background-updates`     | ❌               | ❌         | ❌              | ❌             | ❌            | ❌         | ❌          | ✅            |
| `GET /api/wp/site-health/directory-sizes`        | ❌               | ❌         | ❌              | ❌             | ❌            | ❌         | ❌          | ✅            |
| **SEO Tools (Yoast, Site Kit)**                  |                  |            |                 |                |               |            |             |               |
| `GET /yoast/v1/get_head`                         | ✅               | ✅         | ✅              | ✅             | ✅            | ✅         | ✅          | ✅            |
| `GET /yoast/v1/semrush/related_keyphrases`       | ❌               | ❌         | ❌              | ❌             | ❌            | ✅         | ✅          | ✅            |
| `POST /yoast/v1/indexing/posts`                  | ❌               | ❌         | ❌              | ❌             | ❌            | ❌         | ✅          | ✅            |
| `GET /google-site-kit/v1/...`                    | ❌               | ❌         | ❌              | ❌             | ❌            | ❌         | ✅          | ✅            |
| **Misc (MU)**                                    |                  |            |                 |                |               |            |             |               |
| `POST /api/wp/track-view`                        | ❌               | ✅         | ✅              | ✅             | ✅            | ✅         | ✅          | ✅            |
| `GET /api/wp/bookmarks`                          | ❌               | ✅         | ✅              | ✅             | ✅            | ✅         | ✅          | ✅            |
| `POST /api/wp/bookmarks`                         | ❌               | ✅         | ✅              | ✅             | ✅            | ✅         | ✅          | ✅            |
| **Site Utilities**                               |                  |            |                 |                |               |            |             |               |
| `/robots.txt`                                    | ✅               | ✅         | ✅              | ✅             | ✅            | ✅         | ✅          | ✅            |
| `/sitemap.xml`                                   | ✅               | ✅         | ✅              | ✅             | ✅            | ✅         | ✅          | ✅            |
