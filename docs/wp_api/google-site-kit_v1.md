# `google-site-kit/v1`

_Generated: 2025-09-04T04:22:04.879307Z_

**Base**: `https://techoblivion.in/wp-json`  
**Endpoints**: 49

---

## `/google-site-kit/v1`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `namespace` | `any` | no |  |
| `context` | `any` | no |  |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/google-site-kit/v1' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/google-site-kit/v1/core/modules/data/activation`

**Methods**: `PATCH, POST, PUT`

### Args for methods: `POST, PUT, PATCH`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `data` | `object` | yes |  |

### Example
```bash
curl -X PATCH \
  'https://techoblivion.in/wp-json/google-site-kit/v1/core/modules/data/activation' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/google-site-kit/v1/core/modules/data/check-access`

**Methods**: `PATCH, POST, PUT`

### Args for methods: `POST, PUT, PATCH`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `slug` | `string` | no | Identifier for the module. |

### Example
```bash
curl -X PATCH \
  'https://techoblivion.in/wp-json/google-site-kit/v1/core/modules/data/check-access' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/google-site-kit/v1/core/modules/data/info`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `slug` | `string` | no | Identifier for the module. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/google-site-kit/v1/core/modules/data/info' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/google-site-kit/v1/core/modules/data/list`

**Methods**: `GET`

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/google-site-kit/v1/core/modules/data/list' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/google-site-kit/v1/core/modules/data/recover-modules`

**Methods**: `PATCH, POST, PUT`

### Example
```bash
curl -X PATCH \
  'https://techoblivion.in/wp-json/google-site-kit/v1/core/modules/data/recover-modules' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/google-site-kit/v1/core/modules/data/sharing-settings`

**Methods**: `DELETE, PATCH, POST, PUT`

### Args for methods: `POST, PUT, PATCH`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `data` | `object` | yes |  |

### Example
```bash
curl -X DELETE \
  'https://techoblivion.in/wp-json/google-site-kit/v1/core/modules/data/sharing-settings' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/google-site-kit/v1/core/search/data/entity-search`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `query` | `string` | yes | Text content to search for. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/google-site-kit/v1/core/search/data/entity-search' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/google-site-kit/v1/core/site/data/admin-bar-settings`

**Methods**: `GET, POST`

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `data` | `object` | yes |  |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/google-site-kit/v1/core/site/data/admin-bar-settings' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/google-site-kit/v1/core/site/data/ads-measurement-status`

**Methods**: `GET`

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/google-site-kit/v1/core/site/data/ads-measurement-status' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/google-site-kit/v1/core/site/data/connection`

**Methods**: `GET`

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/google-site-kit/v1/core/site/data/connection' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/google-site-kit/v1/core/site/data/consent-api-activate`

**Methods**: `PATCH, POST, PUT`

### Example
```bash
curl -X PATCH \
  'https://techoblivion.in/wp-json/google-site-kit/v1/core/site/data/consent-api-activate' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/google-site-kit/v1/core/site/data/consent-api-info`

**Methods**: `GET`

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/google-site-kit/v1/core/site/data/consent-api-info' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/google-site-kit/v1/core/site/data/consent-mode`

**Methods**: `GET, PATCH, POST, PUT`

### Args for methods: `POST, PUT, PATCH`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `data` | `object` | yes |  |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/google-site-kit/v1/core/site/data/consent-mode' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/google-site-kit/v1/core/site/data/conversion-tracking`

**Methods**: `GET, PATCH, POST, PUT`

### Args for methods: `POST, PUT, PATCH`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `data` | `object` | yes |  |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/google-site-kit/v1/core/site/data/conversion-tracking' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/google-site-kit/v1/core/site/data/developer-plugin`

**Methods**: `GET`

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/google-site-kit/v1/core/site/data/developer-plugin' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/google-site-kit/v1/core/site/data/health-checks`

**Methods**: `GET`

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/google-site-kit/v1/core/site/data/health-checks' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/google-site-kit/v1/core/site/data/mark-notification`

**Methods**: `PATCH, POST, PUT`

### Args for methods: `POST, PUT, PATCH`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `data` | `object` | yes |  |

### Example
```bash
curl -X PATCH \
  'https://techoblivion.in/wp-json/google-site-kit/v1/core/site/data/mark-notification' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/google-site-kit/v1/core/site/data/notifications`

**Methods**: `GET`

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/google-site-kit/v1/core/site/data/notifications' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/google-site-kit/v1/core/site/data/reset`

**Methods**: `PATCH, POST, PUT`

### Example
```bash
curl -X PATCH \
  'https://techoblivion.in/wp-json/google-site-kit/v1/core/site/data/reset' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/google-site-kit/v1/core/site/data/reset-persistent`

**Methods**: `PATCH, POST, PUT`

### Example
```bash
curl -X PATCH \
  'https://techoblivion.in/wp-json/google-site-kit/v1/core/site/data/reset-persistent' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/google-site-kit/v1/core/site/data/setup-tag`

**Methods**: `PATCH, POST, PUT`

### Example
```bash
curl -X PATCH \
  'https://techoblivion.in/wp-json/google-site-kit/v1/core/site/data/setup-tag' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/google-site-kit/v1/core/site/data/site-health-tag-placement-test`

**Methods**: `GET`

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/google-site-kit/v1/core/site/data/site-health-tag-placement-test' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/google-site-kit/v1/core/user/data/audience-settings`

**Methods**: `GET, PATCH, POST, PUT`

### Args for methods: `POST, PUT, PATCH`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `data` | `object` | yes |  |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/google-site-kit/v1/core/user/data/audience-settings' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/google-site-kit/v1/core/user/data/authentication`

**Methods**: `GET`

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/google-site-kit/v1/core/user/data/authentication' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/google-site-kit/v1/core/user/data/conversion-reporting-settings`

**Methods**: `GET, PATCH, POST, PUT`

### Args for methods: `POST, PUT, PATCH`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `data` | `object` | yes |  |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/google-site-kit/v1/core/user/data/conversion-reporting-settings' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/google-site-kit/v1/core/user/data/disconnect`

**Methods**: `PATCH, POST, PUT`

### Example
```bash
curl -X PATCH \
  'https://techoblivion.in/wp-json/google-site-kit/v1/core/user/data/disconnect' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/google-site-kit/v1/core/user/data/dismiss-item`

**Methods**: `POST`

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `data` | `object` | yes |  |

### Example
```bash
curl -X POST \
  'https://techoblivion.in/wp-json/google-site-kit/v1/core/user/data/dismiss-item' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/google-site-kit/v1/core/user/data/dismiss-prompt`

**Methods**: `POST`

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `data` | `object` | yes |  |

### Example
```bash
curl -X POST \
  'https://techoblivion.in/wp-json/google-site-kit/v1/core/user/data/dismiss-prompt' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/google-site-kit/v1/core/user/data/dismiss-tour`

**Methods**: `POST`

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `data` | `object` | yes |  |

### Example
```bash
curl -X POST \
  'https://techoblivion.in/wp-json/google-site-kit/v1/core/user/data/dismiss-tour' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/google-site-kit/v1/core/user/data/dismissed-items`

**Methods**: `DELETE, GET`

### Args for methods: `DELETE`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `data` | `object` | yes |  |

### Example
```bash
curl -X DELETE \
  'https://techoblivion.in/wp-json/google-site-kit/v1/core/user/data/dismissed-items' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/google-site-kit/v1/core/user/data/dismissed-prompts`

**Methods**: `GET`

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/google-site-kit/v1/core/user/data/dismissed-prompts' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/google-site-kit/v1/core/user/data/dismissed-tours`

**Methods**: `GET`

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/google-site-kit/v1/core/user/data/dismissed-tours' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/google-site-kit/v1/core/user/data/expirable-items`

**Methods**: `GET`

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/google-site-kit/v1/core/user/data/expirable-items' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/google-site-kit/v1/core/user/data/get-token`

**Methods**: `POST`

### Example
```bash
curl -X POST \
  'https://techoblivion.in/wp-json/google-site-kit/v1/core/user/data/get-token' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/google-site-kit/v1/core/user/data/key-metrics`

**Methods**: `GET, POST`

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `data` | `object` | yes |  |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/google-site-kit/v1/core/user/data/key-metrics' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/google-site-kit/v1/core/user/data/nonces`

**Methods**: `GET`

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/google-site-kit/v1/core/user/data/nonces' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/google-site-kit/v1/core/user/data/permissions`

**Methods**: `GET`

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/google-site-kit/v1/core/user/data/permissions' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/google-site-kit/v1/core/user/data/set-expirable-item-timers`

**Methods**: `POST`

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `data` | `array` | yes |  |

### Example
```bash
curl -X POST \
  'https://techoblivion.in/wp-json/google-site-kit/v1/core/user/data/set-expirable-item-timers' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/google-site-kit/v1/core/user/data/survey`

**Methods**: `GET`

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/google-site-kit/v1/core/user/data/survey' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/google-site-kit/v1/core/user/data/survey-event`

**Methods**: `POST`

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `data` | `object` | yes |  |

### Example
```bash
curl -X POST \
  'https://techoblivion.in/wp-json/google-site-kit/v1/core/user/data/survey-event' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/google-site-kit/v1/core/user/data/survey-timeouts`

**Methods**: `GET`

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/google-site-kit/v1/core/user/data/survey-timeouts' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/google-site-kit/v1/core/user/data/survey-trigger`

**Methods**: `POST`

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `data` | `object` | yes |  |

### Example
```bash
curl -X POST \
  'https://techoblivion.in/wp-json/google-site-kit/v1/core/user/data/survey-trigger' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/google-site-kit/v1/core/user/data/tracking`

**Methods**: `GET, POST`

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `data` | `object` | yes |  |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/google-site-kit/v1/core/user/data/tracking' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/google-site-kit/v1/core/user/data/user-input-settings`

**Methods**: `GET, POST`

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `data` | `object` | yes |  |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/google-site-kit/v1/core/user/data/user-input-settings' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/google-site-kit/v1/modules/(?P<slug>[a-z0-9\-]+)/data/(?P<datapoint>[a-z\-]+)`

**Methods**: `GET, PATCH, POST, PUT`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `slug` | `string` | no | Identifier for the module. |
| `datapoint` | `string` | no | Module data point to address. |

### Args for methods: `POST, PUT, PATCH`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `slug` | `string` | no | Identifier for the module. |
| `datapoint` | `string` | no | Module data point to address. |
| `data` | `object` | no | Data to set. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/google-site-kit/v1/modules/(?P<slug>[a-z0-9\-]+)/data/(?P<datapoint>[a-z\-]+)' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/google-site-kit/v1/modules/(?P<slug>[a-z0-9\-]+)/data/data-available`

**Methods**: `POST`

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `slug` | `string` | no | Identifier for the module. |

### Example
```bash
curl -X POST \
  'https://techoblivion.in/wp-json/google-site-kit/v1/modules/(?P<slug>[a-z0-9\-]+)/data/data-available' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/google-site-kit/v1/modules/(?P<slug>[a-z0-9\-]+)/data/notifications`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `slug` | `string` | no | Identifier for the module. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/google-site-kit/v1/modules/(?P<slug>[a-z0-9\-]+)/data/notifications' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/google-site-kit/v1/modules/(?P<slug>[a-z0-9\-]+)/data/settings`

**Methods**: `GET, PATCH, POST, PUT`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `slug` | `string` | no | Identifier for the module. |

### Args for methods: `POST, PUT, PATCH`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `slug` | `string` | no | Identifier for the module. |
| `data` | `object` | no | Settings to set. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/google-site-kit/v1/modules/(?P<slug>[a-z0-9\-]+)/data/settings' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---
