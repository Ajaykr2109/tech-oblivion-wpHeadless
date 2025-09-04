# `wordpress-popular-posts/v1`

_Generated: 2025-09-04T04:22:04.881319Z_

**Base**: `https://techoblivion.in/wp-json`  
**Endpoints**: 5

---

## `/wordpress-popular-posts/v1`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `namespace` | `any` | no |  |
| `context` | `any` | no |  |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wordpress-popular-posts/v1' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wordpress-popular-posts/v1/popular-posts`

**Methods**: `GET, POST`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `post_type` | `string` | no | Return popular posts from specified custom post type(s). |
| `limit` | `integer` | no | The maximum number of popular posts to return. |
| `freshness` | `string` | no | Retrieve the most popular entries published within the specified time range. |
| `offset` | `integer` | no | An offset point for the collection. |
| `order_by` | `string` | no | Set the sorting option of the popular posts. |
| `range` | `string` | no | Return popular posts from a specified time range. |
| `time_unit` | `string` | no | Specifies the time unit of the custom time range. |
| `time_quantity` | `integer` | no | Specifies the number of time units of the custom time range. |
| `pid` | `string` | no | Post IDs to exclude from the listing. |
| `exclude` | `string` | no | Post IDs to exclude from the listing. |
| `taxonomy` | `string` | no | Include posts in a specified taxonomy. |
| `term_id` | `string` | no | Taxonomy IDs, separated by comma (prefix a minus sign to exclude). |
| `author` | `string` | no | Include popular posts from author ID(s). |

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `wpp_id` | `integer` | no | The post / page ID. |
| `id` | `integer` | no |  |
| `sampling` | `integer` | no | Enables Data Sampling. |
| `sampling_rate` | `integer` | no | Sets the Sampling Rate. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wordpress-popular-posts/v1/popular-posts' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wordpress-popular-posts/v1/taxonomies`

**Methods**: `GET`

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wordpress-popular-posts/v1/taxonomies' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wordpress-popular-posts/v1/themes`

**Methods**: `GET`

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wordpress-popular-posts/v1/themes' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wordpress-popular-posts/v1/thumbnails`

**Methods**: `GET`

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wordpress-popular-posts/v1/thumbnails' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---
