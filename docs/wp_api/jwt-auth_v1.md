# `jwt-auth/v1`

_Generated: 2025-09-04T04:22:04.879874Z_

**Base**: `https://techoblivion.in/wp-json`  
**Endpoints**: 11

---

## `/jwt-auth/v1`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `namespace` | `any` | no |  |
| `context` | `any` | no |  |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/jwt-auth/v1' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/jwt-auth/v1/admin/dashboard`

**Methods**: `GET`

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/jwt-auth/v1/admin/dashboard' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/jwt-auth/v1/admin/notices/dismiss`

**Methods**: `POST`

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `notice_id` | `string` | yes | The ID of the notice to dismiss |

### Example
```bash
curl -X POST \
  'https://techoblivion.in/wp-json/jwt-auth/v1/admin/notices/dismiss' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/jwt-auth/v1/admin/settings`

**Methods**: `GET, POST`

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/jwt-auth/v1/admin/settings' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/jwt-auth/v1/admin/status`

**Methods**: `GET`

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/jwt-auth/v1/admin/status' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/jwt-auth/v1/admin/survey`

**Methods**: `POST`

### Example
```bash
curl -X POST \
  'https://techoblivion.in/wp-json/jwt-auth/v1/admin/survey' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/jwt-auth/v1/admin/survey/complete`

**Methods**: `POST`

### Example
```bash
curl -X POST \
  'https://techoblivion.in/wp-json/jwt-auth/v1/admin/survey/complete' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/jwt-auth/v1/admin/survey/dismissal`

**Methods**: `GET, POST`

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/jwt-auth/v1/admin/survey/dismissal' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/jwt-auth/v1/admin/survey/status`

**Methods**: `GET`

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/jwt-auth/v1/admin/survey/status' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/jwt-auth/v1/token`

**Methods**: `POST`

### Example
```bash
curl -X POST \
  'https://techoblivion.in/wp-json/jwt-auth/v1/token' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/jwt-auth/v1/token/validate`

**Methods**: `POST`

### Example
```bash
curl -X POST \
  'https://techoblivion.in/wp-json/jwt-auth/v1/token/validate' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---
