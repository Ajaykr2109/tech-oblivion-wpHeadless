# `yoast/v1`

_Generated: 2025-09-04T04:22:04.884462Z_

**Base**: `https://techoblivion.in/wp-json`  
**Endpoints**: 48

---

## `/yoast/v1`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `namespace` | `any` | no |  |
| `context` | `any` | no |  |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/yoast/v1' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/yoast/v1/ai/free_sparks`

**Methods**: `POST`

### Example
```bash
curl -X POST \
  'https://techoblivion.in/wp-json/yoast/v1/ai/free_sparks' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/yoast/v1/ai_generator/bust_subscription_cache`

**Methods**: `POST`

### Example
```bash
curl -X POST \
  'https://techoblivion.in/wp-json/yoast/v1/ai_generator/bust_subscription_cache' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/yoast/v1/ai_generator/callback`

**Methods**: `POST`

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `access_jwt` | `string` | yes | The access JWT. |
| `refresh_jwt` | `string` | yes | The JWT to be used when the access JWT needs to be refreshed. |
| `code_challenge` | `string` | yes | The SHA266 of the verification code used to check the authenticity of a callback call. |
| `user_id` | `integer` | yes | The id of the user associated to the code verifier. |

### Example
```bash
curl -X POST \
  'https://techoblivion.in/wp-json/yoast/v1/ai_generator/callback' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/yoast/v1/ai_generator/consent`

**Methods**: `POST`

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `consent` | `boolean` | yes | Whether the consent to use AI-based services has been given by the user. |

### Example
```bash
curl -X POST \
  'https://techoblivion.in/wp-json/yoast/v1/ai_generator/consent' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/yoast/v1/ai_generator/get_suggestions`

**Methods**: `POST`

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `type` | `string` | yes | The type of suggestion requested. |
| `prompt_content` | `string` | yes | The content needed by the prompt to ask for suggestions. |
| `focus_keyphrase` | `string` | yes | The focus keyphrase associated to the post. |
| `language` | `string` | yes | The language the post is written in. |
| `platform` | `string` | yes | The platform the post is intended for. |
| `editor` | `string` | yes | The current editor. |

### Example
```bash
curl -X POST \
  'https://techoblivion.in/wp-json/yoast/v1/ai_generator/get_suggestions' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/yoast/v1/ai_generator/get_usage`

**Methods**: `POST`

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `is_woo_product_entity` | `boolean` | no |  |

### Example
```bash
curl -X POST \
  'https://techoblivion.in/wp-json/yoast/v1/ai_generator/get_usage' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/yoast/v1/ai_generator/refresh_callback`

**Methods**: `POST`

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `access_jwt` | `string` | yes | The access JWT. |
| `refresh_jwt` | `string` | yes | The JWT to be used when the access JWT needs to be refreshed. |
| `code_challenge` | `string` | yes | The SHA266 of the verification code used to check the authenticity of a callback call. |
| `user_id` | `integer` | yes | The id of the user associated to the code verifier. |

### Example
```bash
curl -X POST \
  'https://techoblivion.in/wp-json/yoast/v1/ai_generator/refresh_callback' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/yoast/v1/alerts/dismiss`

**Methods**: `POST`

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `key` | `any` | yes |  |

### Example
```bash
curl -X POST \
  'https://techoblivion.in/wp-json/yoast/v1/alerts/dismiss' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/yoast/v1/available_posts`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `search` | `string` | no |  |
| `postType` | `string` | no |  |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/yoast/v1/available_posts' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/yoast/v1/configuration/check_capability`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `user_id` | `any` | yes |  |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/yoast/v1/configuration/check_capability' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/yoast/v1/configuration/enable_tracking`

**Methods**: `POST`

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `tracking` | `boolean` | yes |  |

### Example
```bash
curl -X POST \
  'https://techoblivion.in/wp-json/yoast/v1/configuration/enable_tracking' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/yoast/v1/configuration/get_configuration_state`

**Methods**: `GET`

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/yoast/v1/configuration/get_configuration_state' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/yoast/v1/configuration/save_configuration_state`

**Methods**: `POST`

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `finishedSteps` | `array` | yes |  |

### Example
```bash
curl -X POST \
  'https://techoblivion.in/wp-json/yoast/v1/configuration/save_configuration_state' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/yoast/v1/configuration/site_representation`

**Methods**: `POST`

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `company_or_person` | `string` | yes |  |
| `company_name` | `string` | no |  |
| `company_logo` | `string` | no |  |
| `company_logo_id` | `integer` | no |  |
| `person_logo` | `string` | no |  |
| `person_logo_id` | `integer` | no |  |
| `company_or_person_user_id` | `integer` | no |  |
| `description` | `string` | no |  |

### Example
```bash
curl -X POST \
  'https://techoblivion.in/wp-json/yoast/v1/configuration/site_representation' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/yoast/v1/configuration/social_profiles`

**Methods**: `POST`

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `facebook_site` | `string` | no |  |
| `twitter_site` | `string` | no |  |
| `other_social_urls` | `array` | no |  |

### Example
```bash
curl -X POST \
  'https://techoblivion.in/wp-json/yoast/v1/configuration/social_profiles' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/yoast/v1/file_size`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `url` | `string` | yes | The url to retrieve |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/yoast/v1/file_size' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/yoast/v1/get_head`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `url` | `any` | yes |  |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/yoast/v1/get_head' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/yoast/v1/import/(?P<plugin>[\w-]+)/(?P<type>[\w-]+)`

**Methods**: `POST`

### Example
```bash
curl -X POST \
  'https://techoblivion.in/wp-json/yoast/v1/import/(?P<plugin>[\w-]+)/(?P<type>[\w-]+)' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/yoast/v1/indexing/complete`

**Methods**: `POST`

### Example
```bash
curl -X POST \
  'https://techoblivion.in/wp-json/yoast/v1/indexing/complete' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/yoast/v1/indexing/general`

**Methods**: `POST`

### Example
```bash
curl -X POST \
  'https://techoblivion.in/wp-json/yoast/v1/indexing/general' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/yoast/v1/indexing/indexables-complete`

**Methods**: `POST`

### Example
```bash
curl -X POST \
  'https://techoblivion.in/wp-json/yoast/v1/indexing/indexables-complete' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/yoast/v1/indexing/post-type-archives`

**Methods**: `POST`

### Example
```bash
curl -X POST \
  'https://techoblivion.in/wp-json/yoast/v1/indexing/post-type-archives' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/yoast/v1/indexing/posts`

**Methods**: `POST`

### Example
```bash
curl -X POST \
  'https://techoblivion.in/wp-json/yoast/v1/indexing/posts' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/yoast/v1/indexing/prepare`

**Methods**: `POST`

### Example
```bash
curl -X POST \
  'https://techoblivion.in/wp-json/yoast/v1/indexing/prepare' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/yoast/v1/indexing/terms`

**Methods**: `POST`

### Example
```bash
curl -X POST \
  'https://techoblivion.in/wp-json/yoast/v1/indexing/terms' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/yoast/v1/integrations/set_active`

**Methods**: `POST`

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `active` | `boolean` | yes |  |
| `integration` | `string` | yes |  |

### Example
```bash
curl -X POST \
  'https://techoblivion.in/wp-json/yoast/v1/integrations/set_active' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/yoast/v1/introductions/(?P<introduction_id>[\w-]+)/seen`

**Methods**: `POST`

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `introduction_id` | `string` | yes |  |
| `is_seen` | `bool` | no |  |

### Example
```bash
curl -X POST \
  'https://techoblivion.in/wp-json/yoast/v1/introductions/(?P<introduction_id>[\w-]+)/seen' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/yoast/v1/link-indexing/posts`

**Methods**: `POST`

### Example
```bash
curl -X POST \
  'https://techoblivion.in/wp-json/yoast/v1/link-indexing/posts' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/yoast/v1/link-indexing/terms`

**Methods**: `POST`

### Example
```bash
curl -X POST \
  'https://techoblivion.in/wp-json/yoast/v1/link-indexing/terms' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/yoast/v1/meta/search`

**Methods**: `GET`

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/yoast/v1/meta/search' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/yoast/v1/new-content-type-visibility/dismiss-post-type`

**Methods**: `POST`

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `postTypeName` | `any` | no |  |

### Example
```bash
curl -X POST \
  'https://techoblivion.in/wp-json/yoast/v1/new-content-type-visibility/dismiss-post-type' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/yoast/v1/new-content-type-visibility/dismiss-taxonomy`

**Methods**: `POST`

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `taxonomyName` | `any` | no |  |

### Example
```bash
curl -X POST \
  'https://techoblivion.in/wp-json/yoast/v1/new-content-type-visibility/dismiss-taxonomy' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/yoast/v1/readability_scores`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `contentType` | `string` | yes |  |
| `taxonomy` | `string` | no |  |
| `term` | `integer` | no |  |
| `troubleshooting` | `bool` | no |  |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/yoast/v1/readability_scores' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/yoast/v1/semrush/authenticate`

**Methods**: `POST`

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `code` | `any` | yes |  |

### Example
```bash
curl -X POST \
  'https://techoblivion.in/wp-json/yoast/v1/semrush/authenticate' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/yoast/v1/semrush/country_code`

**Methods**: `POST`

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `country_code` | `any` | yes |  |

### Example
```bash
curl -X POST \
  'https://techoblivion.in/wp-json/yoast/v1/semrush/country_code' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/yoast/v1/semrush/related_keyphrases`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `keyphrase` | `any` | yes |  |
| `country_code` | `any` | yes |  |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/yoast/v1/semrush/related_keyphrases' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/yoast/v1/seo_scores`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `contentType` | `string` | yes |  |
| `taxonomy` | `string` | no |  |
| `term` | `integer` | no |  |
| `troubleshooting` | `bool` | no |  |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/yoast/v1/seo_scores' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/yoast/v1/statistics`

**Methods**: `GET`

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/yoast/v1/statistics' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/yoast/v1/wincher/account/limit`

**Methods**: `GET`

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/yoast/v1/wincher/account/limit' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/yoast/v1/wincher/account/upgrade-campaign`

**Methods**: `GET`

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/yoast/v1/wincher/account/upgrade-campaign' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/yoast/v1/wincher/authenticate`

**Methods**: `POST`

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `code` | `any` | yes |  |
| `websiteId` | `any` | yes |  |

### Example
```bash
curl -X POST \
  'https://techoblivion.in/wp-json/yoast/v1/wincher/authenticate' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/yoast/v1/wincher/authorization-url`

**Methods**: `GET`

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/yoast/v1/wincher/authorization-url' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/yoast/v1/wincher/keyphrases`

**Methods**: `POST`

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `keyphrases` | `any` | no |  |
| `permalink` | `any` | no |  |
| `startAt` | `any` | no |  |

### Example
```bash
curl -X POST \
  'https://techoblivion.in/wp-json/yoast/v1/wincher/keyphrases' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/yoast/v1/wincher/keyphrases/track`

**Methods**: `POST`

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `keyphrases` | `any` | yes |  |

### Example
```bash
curl -X POST \
  'https://techoblivion.in/wp-json/yoast/v1/wincher/keyphrases/track' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/yoast/v1/wincher/keyphrases/untrack`

**Methods**: `DELETE`

### Example
```bash
curl -X DELETE \
  'https://techoblivion.in/wp-json/yoast/v1/wincher/keyphrases/untrack' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/yoast/v1/wistia_embed_permission`

**Methods**: `GET, POST`

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `value` | `bool` | no |  |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/yoast/v1/wistia_embed_permission' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/yoast/v1/workouts`

**Methods**: `GET, POST`

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/yoast/v1/workouts' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---
