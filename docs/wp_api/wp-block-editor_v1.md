# `wp-block-editor/v1`

_Generated: 2025-09-04T04:22:04.882243Z_

**Base**: `https://techoblivion.in/wp-json`  
**Endpoints**: 4

---

## `/wp-block-editor/v1`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `namespace` | `any` | no |  |
| `context` | `any` | no |  |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp-block-editor/v1' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp-block-editor/v1/export`

**Methods**: `GET`

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp-block-editor/v1/export' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp-block-editor/v1/navigation-fallback`

**Methods**: `GET`

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp-block-editor/v1/navigation-fallback' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp-block-editor/v1/url-details`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `url` | `string` | yes | The URL to process. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp-block-editor/v1/url-details' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---
