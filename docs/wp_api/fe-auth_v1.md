# `fe-auth/v1`

_Generated: 2025-09-04T04:22:04.878900Z_

**Base**: `https://techoblivion.in/wp-json`  
**Endpoints**: 8

---

## `/fe-auth/v1`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `namespace` | `any` | no |  |
| `context` | `any` | no |  |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/fe-auth/v1' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/fe-auth/v1/bookmarks`

**Methods**: `GET`

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/fe-auth/v1/bookmarks' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/fe-auth/v1/bookmarks/check`

**Methods**: `GET`

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/fe-auth/v1/bookmarks/check' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/fe-auth/v1/bookmarks/toggle`

**Methods**: `POST`

### Example
```bash
curl -X POST \
  'https://techoblivion.in/wp-json/fe-auth/v1/bookmarks/toggle' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/fe-auth/v1/ping`

**Methods**: `GET`

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/fe-auth/v1/ping' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/fe-auth/v1/proxy`

**Methods**: `DELETE, GET, PATCH, POST, PUT`

### Args for methods: `GET, POST, PUT, PATCH, DELETE`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `path` | `string` | yes |  |

### Example
```bash
curl -X DELETE \
  'https://techoblivion.in/wp-json/fe-auth/v1/proxy' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/fe-auth/v1/public-user/(?P<slug>[a-z0-9_-]+)`

**Methods**: `GET`

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/fe-auth/v1/public-user/(?P<slug>[a-z0-9_-]+)' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/fe-auth/v1/track-view`

**Methods**: `POST`

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `post_id` | `integer` | yes |  |

### Example
```bash
curl -X POST \
  'https://techoblivion.in/wp-json/fe-auth/v1/track-view' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---
