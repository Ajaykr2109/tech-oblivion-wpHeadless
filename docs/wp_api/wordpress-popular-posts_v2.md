# `wordpress-popular-posts/v2`

_Generated: 2025-09-04T04:22:04.881769Z_

**Base**: `https://techoblivion.in/wp-json`  
**Endpoints**: 3

---

## `/wordpress-popular-posts/v2`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `namespace` | `any` | no |  |
| `context` | `any` | no |  |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wordpress-popular-posts/v2' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wordpress-popular-posts/v2/views/(?P<id>[\d]+)`

**Methods**: `GET, POST`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `integer` | no |  |
| `range` | `string` | no |  |
| `time_unit` | `string` | no |  |
| `time_quantity` | `integer` | no |  |
| `include_views_text` | `integer` | no |  |

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
  'https://techoblivion.in/wp-json/wordpress-popular-posts/v2/views/(?P<id>[\d]+)' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wordpress-popular-posts/v2/widget`

**Methods**: `POST`

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `is_single` | `integer` | no |  |
| `lang` | `string` | no |  |

### Example
```bash
curl -X POST \
  'https://techoblivion.in/wp-json/wordpress-popular-posts/v2/widget' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---
