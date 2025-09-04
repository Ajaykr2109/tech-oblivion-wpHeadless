# `root`

_Generated: 2025-09-04T04:22:04.880619Z_

**Base**: `https://techoblivion.in/wp-json`  
**Endpoints**: 2

---

## `/`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `context` | `any` | no |  |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/batch/v1`

**Methods**: `POST`

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `validation` | `string` | no |  |
| `requests` | `array` | yes |  |

### Example
```bash
curl -X POST \
  'https://techoblivion.in/wp-json/batch/v1' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---
