# `to/v1`

_Generated: 2025-09-04T04:22:04.880971Z_

**Base**: `https://techoblivion.in/wp-json`  
**Endpoints**: 2

---

## `/to/v1`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `namespace` | `any` | no |  |
| `context` | `any` | no |  |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/to/v1' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/to/v1/search`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `q` | `string` | yes |  |
| `types` | `string` | no |  |
| `per_page` | `integer` | no |  |
| `page` | `integer` | no |  |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/to/v1/search' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---
