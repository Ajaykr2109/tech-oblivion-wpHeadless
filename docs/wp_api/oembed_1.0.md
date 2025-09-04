# `oembed/1.0`

_Generated: 2025-09-04T04:22:04.880243Z_

**Base**: `https://techoblivion.in/wp-json`  
**Endpoints**: 3

---

## `/oembed/1.0`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `namespace` | `any` | no |  |
| `context` | `any` | no |  |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/oembed/1.0' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/oembed/1.0/embed`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `url` | `string` | yes | The URL of the resource for which to fetch oEmbed data. |
| `format` | `any` | no |  |
| `maxwidth` | `any` | no |  |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/oembed/1.0/embed' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/oembed/1.0/proxy`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `url` | `string` | yes | The URL of the resource for which to fetch oEmbed data. |
| `format` | `string` | no | The oEmbed format to use. |
| `maxwidth` | `integer` | no | The maximum width of the embed frame in pixels. |
| `maxheight` | `integer` | no | The maximum height of the embed frame in pixels. |
| `discover` | `boolean` | no | Whether to perform an oEmbed discovery request for unsanctioned providers. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/oembed/1.0/proxy' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---
