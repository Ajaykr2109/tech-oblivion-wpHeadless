# `wp/v2`

_Generated: 2025-09-04T04:22:04.883026Z_

**Base**: `https://techoblivion.in/wp-json`  
**Endpoints**: 104

---

## `/wp/v2`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `namespace` | `any` | no |  |
| `context` | `any` | no |  |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/block-directory/search`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |
| `page` | `integer` | no | Current page of the collection. |
| `per_page` | `integer` | no | Maximum number of items to be returned in result set. |
| `term` | `string` | yes | Limit result set to blocks matching the search term. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/block-directory/search' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/block-patterns/categories`

**Methods**: `GET`

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/block-patterns/categories' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/block-patterns/patterns`

**Methods**: `GET`

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/block-patterns/patterns' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/block-renderer/(?P<name>[a-z0-9-]+/[a-z0-9-]+)`

**Methods**: `GET, POST`

### Args for methods: `GET, POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `name` | `string` | no | Unique registered name for the block. |
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |
| `attributes` | `object` | no | Attributes for the block. |
| `post_id` | `integer` | no | ID of the post context. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/block-renderer/(?P<name>[a-z0-9-]+/[a-z0-9-]+)' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/block-types`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |
| `namespace` | `string` | no | Block namespace. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/block-types' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/block-types/(?P<namespace>[a-zA-Z0-9_-]+)`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |
| `namespace` | `string` | no | Block namespace. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/block-types/(?P<namespace>[a-zA-Z0-9_-]+)' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/block-types/(?P<namespace>[a-zA-Z0-9_-]+)/(?P<name>[a-zA-Z0-9_-]+)`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `name` | `string` | no | Block name. |
| `namespace` | `string` | no | Block namespace. |
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/block-types/(?P<namespace>[a-zA-Z0-9_-]+)/(?P<name>[a-zA-Z0-9_-]+)' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/blocks`

**Methods**: `GET, POST`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |
| `page` | `integer` | no | Current page of the collection. |
| `per_page` | `integer` | no | Maximum number of items to be returned in result set. |
| `search` | `string` | no | Limit results to those matching a string. |
| `after` | `string` | no | Limit response to posts published after a given ISO8601 compliant date. |
| `modified_after` | `string` | no | Limit response to posts modified after a given ISO8601 compliant date. |
| `before` | `string` | no | Limit response to posts published before a given ISO8601 compliant date. |
| `modified_before` | `string` | no | Limit response to posts modified before a given ISO8601 compliant date. |
| `exclude` | `array` | no | Ensure result set excludes specific IDs. |
| `include` | `array` | no | Limit result set to specific IDs. |
| `search_semantics` | `string` | no | How to interpret the search input. |
| `offset` | `integer` | no | Offset the result set by a specific number of items. |
| `order` | `string` | no | Order sort attribute ascending or descending. |
| `orderby` | `string` | no | Sort collection by post attribute. |
| `search_columns` | `array` | no | Array of column names to be searched. |
| `slug` | `array` | no | Limit result set to posts with one or more specific slugs. |
| `status` | `array` | no | Limit result set to posts assigned one or more statuses. |
| `tax_relation` | `string` | no | Limit result set based on relationship between multiple taxonomies. |
| `wp_pattern_category` | `object / array` | no | Limit result set to items with specific terms assigned in the wp_pattern_category taxonomy. |
| `wp_pattern_category_exclude` | `object / array` | no | Limit result set to items except those with specific terms assigned in the wp_pattern_category taxonomy. |

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `date` | `string / null` | no | The date the post was published, in the site's timezone. |
| `date_gmt` | `string / null` | no | The date the post was published, as GMT. |
| `slug` | `string` | no | An alphanumeric identifier for the post unique to its type. |
| `status` | `string` | no | A named status for the post. |
| `password` | `string` | no | A password to protect access to the content and excerpt. |
| `title` | `object` | no | The title for the post. |
| `content` | `object` | no | The content for the post. |
| `excerpt` | `object` | no | The excerpt for the post. |
| `meta` | `object` | no | Meta fields. |
| `template` | `string` | no | The theme file to use to display the post. |
| `wp_pattern_category` | `array` | no | The terms assigned to the post in the wp_pattern_category taxonomy. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/blocks' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/blocks/(?P<id>[\d]+)`

**Methods**: `DELETE, GET, PATCH, POST, PUT`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `integer` | no | Unique identifier for the post. |
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |
| `excerpt_length` | `integer` | no | Override the default excerpt length. |
| `password` | `string` | no | The password for the post if it is password protected. |

### Args for methods: `POST, PUT, PATCH`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `integer` | no | Unique identifier for the post. |
| `date` | `string / null` | no | The date the post was published, in the site's timezone. |
| `date_gmt` | `string / null` | no | The date the post was published, as GMT. |
| `slug` | `string` | no | An alphanumeric identifier for the post unique to its type. |
| `status` | `string` | no | A named status for the post. |
| `password` | `string` | no | A password to protect access to the content and excerpt. |
| `title` | `object` | no | The title for the post. |
| `content` | `object` | no | The content for the post. |
| `excerpt` | `object` | no | The excerpt for the post. |
| `meta` | `object` | no | Meta fields. |
| `template` | `string` | no | The theme file to use to display the post. |
| `wp_pattern_category` | `array` | no | The terms assigned to the post in the wp_pattern_category taxonomy. |

### Args for methods: `DELETE`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `integer` | no | Unique identifier for the post. |
| `force` | `boolean` | no | Whether to bypass Trash and force deletion. |

### Example
```bash
curl -X DELETE \
  'https://techoblivion.in/wp-json/wp/v2/blocks/(?P<id>[\d]+)' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/blocks/(?P<id>[\d]+)/autosaves`

**Methods**: `GET, POST`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `parent` | `integer` | no | The ID for the parent of the autosave. |
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `parent` | `integer` | no | The ID for the parent of the autosave. |
| `date` | `string / null` | no | The date the post was published, in the site's timezone. |
| `date_gmt` | `string / null` | no | The date the post was published, as GMT. |
| `slug` | `string` | no | An alphanumeric identifier for the post unique to its type. |
| `status` | `string` | no | A named status for the post. |
| `password` | `string` | no | A password to protect access to the content and excerpt. |
| `title` | `object` | no | The title for the post. |
| `content` | `object` | no | The content for the post. |
| `excerpt` | `object` | no | The excerpt for the post. |
| `meta` | `object` | no | Meta fields. |
| `template` | `string` | no | The theme file to use to display the post. |
| `wp_pattern_category` | `array` | no | The terms assigned to the post in the wp_pattern_category taxonomy. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/blocks/(?P<id>[\d]+)/autosaves' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/blocks/(?P<parent>[\d]+)/autosaves/(?P<id>[\d]+)`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `parent` | `integer` | no | The ID for the parent of the autosave. |
| `id` | `integer` | no | The ID for the autosave. |
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/blocks/(?P<parent>[\d]+)/autosaves/(?P<id>[\d]+)' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/blocks/(?P<parent>[\d]+)/revisions`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `parent` | `integer` | no | The ID for the parent of the revision. |
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |
| `page` | `integer` | no | Current page of the collection. |
| `per_page` | `integer` | no | Maximum number of items to be returned in result set. |
| `search` | `string` | no | Limit results to those matching a string. |
| `exclude` | `array` | no | Ensure result set excludes specific IDs. |
| `include` | `array` | no | Limit result set to specific IDs. |
| `offset` | `integer` | no | Offset the result set by a specific number of items. |
| `order` | `string` | no | Order sort attribute ascending or descending. |
| `orderby` | `string` | no | Sort collection by object attribute. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/blocks/(?P<parent>[\d]+)/revisions' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/blocks/(?P<parent>[\d]+)/revisions/(?P<id>[\d]+)`

**Methods**: `DELETE, GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `parent` | `integer` | no | The ID for the parent of the revision. |
| `id` | `integer` | no | Unique identifier for the revision. |
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |

### Args for methods: `DELETE`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `parent` | `integer` | no | The ID for the parent of the revision. |
| `id` | `integer` | no | Unique identifier for the revision. |
| `force` | `boolean` | no | Required to be true, as revisions do not support trashing. |

### Example
```bash
curl -X DELETE \
  'https://techoblivion.in/wp-json/wp/v2/blocks/(?P<parent>[\d]+)/revisions/(?P<id>[\d]+)' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/categories`

**Methods**: `GET, POST`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |
| `page` | `integer` | no | Current page of the collection. |
| `per_page` | `integer` | no | Maximum number of items to be returned in result set. |
| `search` | `string` | no | Limit results to those matching a string. |
| `exclude` | `array` | no | Ensure result set excludes specific IDs. |
| `include` | `array` | no | Limit result set to specific IDs. |
| `order` | `string` | no | Order sort attribute ascending or descending. |
| `orderby` | `string` | no | Sort collection by term attribute. |
| `hide_empty` | `boolean` | no | Whether to hide terms not assigned to any posts. |
| `parent` | `integer` | no | Limit result set to terms assigned to a specific parent. |
| `post` | `integer` | no | Limit result set to terms assigned to a specific post. |
| `slug` | `array` | no | Limit result set to terms with one or more specific slugs. |

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `description` | `string` | no | HTML description of the term. |
| `name` | `string` | yes | HTML title for the term. |
| `slug` | `string` | no | An alphanumeric identifier for the term unique to its type. |
| `parent` | `integer` | no | The parent term ID. |
| `meta` | `object` | no | Meta fields. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/categories' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/categories/(?P<id>[\d]+)`

**Methods**: `DELETE, GET, PATCH, POST, PUT`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `integer` | no | Unique identifier for the term. |
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |

### Args for methods: `POST, PUT, PATCH`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `integer` | no | Unique identifier for the term. |
| `description` | `string` | no | HTML description of the term. |
| `name` | `string` | no | HTML title for the term. |
| `slug` | `string` | no | An alphanumeric identifier for the term unique to its type. |
| `parent` | `integer` | no | The parent term ID. |
| `meta` | `object` | no | Meta fields. |

### Args for methods: `DELETE`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `integer` | no | Unique identifier for the term. |
| `force` | `boolean` | no | Required to be true, as terms do not support trashing. |

### Example
```bash
curl -X DELETE \
  'https://techoblivion.in/wp-json/wp/v2/categories/(?P<id>[\d]+)' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/comments`

**Methods**: `GET, POST`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |
| `page` | `integer` | no | Current page of the collection. |
| `per_page` | `integer` | no | Maximum number of items to be returned in result set. |
| `search` | `string` | no | Limit results to those matching a string. |
| `after` | `string` | no | Limit response to comments published after a given ISO8601 compliant date. |
| `author` | `array` | no | Limit result set to comments assigned to specific user IDs. Requires authorization. |
| `author_exclude` | `array` | no | Ensure result set excludes comments assigned to specific user IDs. Requires authorization. |
| `author_email` | `string` | no | Limit result set to that from a specific author email. Requires authorization. |
| `before` | `string` | no | Limit response to comments published before a given ISO8601 compliant date. |
| `exclude` | `array` | no | Ensure result set excludes specific IDs. |
| `include` | `array` | no | Limit result set to specific IDs. |
| `offset` | `integer` | no | Offset the result set by a specific number of items. |
| `order` | `string` | no | Order sort attribute ascending or descending. |
| `orderby` | `string` | no | Sort collection by comment attribute. |
| `parent` | `array` | no | Limit result set to comments of specific parent IDs. |
| `parent_exclude` | `array` | no | Ensure result set excludes specific parent IDs. |
| `post` | `array` | no | Limit result set to comments assigned to specific post IDs. |
| `status` | `string` | no | Limit result set to comments assigned a specific status. Requires authorization. |
| `type` | `string` | no | Limit result set to comments assigned a specific type. Requires authorization. |
| `password` | `string` | no | The password for the post if it is password protected. |

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `author` | `integer` | no | The ID of the user object, if author was a user. |
| `author_email` | `string` | no | Email address for the comment author. |
| `author_ip` | `string` | no | IP address for the comment author. |
| `author_name` | `string` | no | Display name for the comment author. |
| `author_url` | `string` | no | URL for the comment author. |
| `author_user_agent` | `string` | no | User agent for the comment author. |
| `content` | `object` | no | The content for the comment. |
| `date` | `string` | no | The date the comment was published, in the site's timezone. |
| `date_gmt` | `string` | no | The date the comment was published, as GMT. |
| `parent` | `integer` | no | The ID for the parent of the comment. |
| `post` | `integer` | no | The ID of the associated post object. |
| `status` | `string` | no | State of the comment. |
| `meta` | `object` | no | Meta fields. |
| `content_raw` | `string` | no | Raw comment content |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/comments' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/comments/(?P<id>[\d]+)`

**Methods**: `DELETE, GET, PATCH, POST, PUT`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `integer` | no | Unique identifier for the comment. |
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |
| `password` | `string` | no | The password for the parent post of the comment (if the post is password protected). |

### Args for methods: `POST, PUT, PATCH`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `integer` | no | Unique identifier for the comment. |
| `author` | `integer` | no | The ID of the user object, if author was a user. |
| `author_email` | `string` | no | Email address for the comment author. |
| `author_ip` | `string` | no | IP address for the comment author. |
| `author_name` | `string` | no | Display name for the comment author. |
| `author_url` | `string` | no | URL for the comment author. |
| `author_user_agent` | `string` | no | User agent for the comment author. |
| `content` | `object` | no | The content for the comment. |
| `date` | `string` | no | The date the comment was published, in the site's timezone. |
| `date_gmt` | `string` | no | The date the comment was published, as GMT. |
| `parent` | `integer` | no | The ID for the parent of the comment. |
| `post` | `integer` | no | The ID of the associated post object. |
| `status` | `string` | no | State of the comment. |
| `meta` | `object` | no | Meta fields. |
| `content_raw` | `string` | no | Raw comment content |

### Args for methods: `DELETE`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `integer` | no | Unique identifier for the comment. |
| `force` | `boolean` | no | Whether to bypass Trash and force deletion. |
| `password` | `string` | no | The password for the parent post of the comment (if the post is password protected). |

### Example
```bash
curl -X DELETE \
  'https://techoblivion.in/wp-json/wp/v2/comments/(?P<id>[\d]+)' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/font-collections`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |
| `page` | `integer` | no | Current page of the collection. |
| `per_page` | `integer` | no | Maximum number of items to be returned in result set. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/font-collections' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/font-collections/(?P<slug>[\/\w-]+)`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/font-collections/(?P<slug>[\/\w-]+)' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/font-families`

**Methods**: `GET, POST`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |
| `page` | `integer` | no | Current page of the collection. |
| `per_page` | `integer` | no | Maximum number of items to be returned in result set. |
| `exclude` | `array` | no | Ensure result set excludes specific IDs. |
| `include` | `array` | no | Limit result set to specific IDs. |
| `search_semantics` | `string` | no | How to interpret the search input. |
| `offset` | `integer` | no | Offset the result set by a specific number of items. |
| `order` | `string` | no | Order sort attribute ascending or descending. |
| `orderby` | `string` | no | Sort collection by post attribute. |
| `slug` | `array` | no | Limit result set to posts with one or more specific slugs. |

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `theme_json_version` | `integer` | no | Version of the theme.json schema used for the typography settings. |
| `font_family_settings` | `string` | yes | font-family declaration in theme.json format, encoded as a string. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/font-families' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/font-families/(?P<font_family_id>[\d]+)/font-faces`

**Methods**: `GET, POST`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `font_family_id` | `integer` | yes | The ID for the parent font family of the font face. |
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |
| `page` | `integer` | no | Current page of the collection. |
| `per_page` | `integer` | no | Maximum number of items to be returned in result set. |
| `exclude` | `array` | no | Ensure result set excludes specific IDs. |
| `include` | `array` | no | Limit result set to specific IDs. |
| `search_semantics` | `string` | no | How to interpret the search input. |
| `offset` | `integer` | no | Offset the result set by a specific number of items. |
| `order` | `string` | no | Order sort attribute ascending or descending. |
| `orderby` | `string` | no | Sort collection by post attribute. |

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `font_family_id` | `integer` | yes | The ID for the parent font family of the font face. |
| `theme_json_version` | `integer` | no | Version of the theme.json schema used for the typography settings. |
| `font_face_settings` | `string` | yes | font-face declaration in theme.json format, encoded as a string. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/font-families/(?P<font_family_id>[\d]+)/font-faces' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/font-families/(?P<font_family_id>[\d]+)/font-faces/(?P<id>[\d]+)`

**Methods**: `DELETE, GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `font_family_id` | `integer` | yes | The ID for the parent font family of the font face. |
| `id` | `integer` | yes | Unique identifier for the font face. |
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |

### Args for methods: `DELETE`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `font_family_id` | `integer` | yes | The ID for the parent font family of the font face. |
| `id` | `integer` | yes | Unique identifier for the font face. |
| `force` | `boolean` | no | Whether to bypass Trash and force deletion. |

### Example
```bash
curl -X DELETE \
  'https://techoblivion.in/wp-json/wp/v2/font-families/(?P<font_family_id>[\d]+)/font-faces/(?P<id>[\d]+)' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/font-families/(?P<id>[\d]+)`

**Methods**: `DELETE, GET, PATCH, POST, PUT`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `integer` | no | Unique identifier for the post. |
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |

### Args for methods: `POST, PUT, PATCH`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `integer` | no | Unique identifier for the post. |
| `theme_json_version` | `integer` | no | Version of the theme.json schema used for the typography settings. |
| `font_family_settings` | `string` | yes | font-family declaration in theme.json format, encoded as a string. |

### Args for methods: `DELETE`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `integer` | no | Unique identifier for the post. |
| `force` | `boolean` | no | Whether to bypass Trash and force deletion. |

### Example
```bash
curl -X DELETE \
  'https://techoblivion.in/wp-json/wp/v2/font-families/(?P<id>[\d]+)' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/global-styles/(?P<id>[\/\w-]+)`

**Methods**: `GET, PATCH, POST, PUT`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `string` | no | The id of a template |

### Args for methods: `POST, PUT, PATCH`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `styles` | `object` | no | Global styles. |
| `settings` | `object` | no | Global settings. |
| `title` | `object / string` | no | Title of the global styles variation. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/global-styles/(?P<id>[\/\w-]+)' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/global-styles/(?P<parent>[\d]+)/revisions`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `parent` | `integer` | no | The ID for the parent of the revision. |
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |
| `page` | `integer` | no | Current page of the collection. |
| `per_page` | `integer` | no | Maximum number of items to be returned in result set. |
| `offset` | `integer` | no | Offset the result set by a specific number of items. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/global-styles/(?P<parent>[\d]+)/revisions' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/global-styles/(?P<parent>[\d]+)/revisions/(?P<id>[\d]+)`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `parent` | `integer` | no | The ID for the parent of the global styles revision. |
| `id` | `integer` | no | Unique identifier for the global styles revision. |
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/global-styles/(?P<parent>[\d]+)/revisions/(?P<id>[\d]+)' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/global-styles/themes/(?P<stylesheet>[\/\s%\w\.\(\)\[\]\@_\-]+)/variations`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `stylesheet` | `string` | no | The theme identifier |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/global-styles/themes/(?P<stylesheet>[\/\s%\w\.\(\)\[\]\@_\-]+)/variations' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/global-styles/themes/(?P<stylesheet>[^\/:<>\*\?"\|]+(?:\/[^\/:<>\*\?"\|]+)?)`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `stylesheet` | `string` | no | The theme identifier |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/global-styles/themes/(?P<stylesheet>[^\/:<>\*\?"\|]+(?:\/[^\/:<>\*\?"\|]+)?)' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/media`

**Methods**: `GET, POST`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |
| `page` | `integer` | no | Current page of the collection. |
| `per_page` | `integer` | no | Maximum number of items to be returned in result set. |
| `search` | `string` | no | Limit results to those matching a string. |
| `after` | `string` | no | Limit response to posts published after a given ISO8601 compliant date. |
| `modified_after` | `string` | no | Limit response to posts modified after a given ISO8601 compliant date. |
| `author` | `array` | no | Limit result set to posts assigned to specific authors. |
| `author_exclude` | `array` | no | Ensure result set excludes posts assigned to specific authors. |
| `before` | `string` | no | Limit response to posts published before a given ISO8601 compliant date. |
| `modified_before` | `string` | no | Limit response to posts modified before a given ISO8601 compliant date. |
| `exclude` | `array` | no | Ensure result set excludes specific IDs. |
| `include` | `array` | no | Limit result set to specific IDs. |
| `search_semantics` | `string` | no | How to interpret the search input. |
| `offset` | `integer` | no | Offset the result set by a specific number of items. |
| `order` | `string` | no | Order sort attribute ascending or descending. |
| `orderby` | `string` | no | Sort collection by post attribute. |
| `parent` | `array` | no | Limit result set to items with particular parent IDs. |
| `parent_exclude` | `array` | no | Limit result set to all items except those of a particular parent ID. |
| `search_columns` | `array` | no | Array of column names to be searched. |
| `slug` | `array` | no | Limit result set to posts with one or more specific slugs. |
| `status` | `array` | no | Limit result set to posts assigned one or more statuses. |
| `media_type` | `string` | no | Limit result set to attachments of a particular media type. |
| `mime_type` | `string` | no | Limit result set to attachments of a particular MIME type. |

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `date` | `string / null` | no | The date the post was published, in the site's timezone. |
| `date_gmt` | `string / null` | no | The date the post was published, as GMT. |
| `slug` | `string` | no | An alphanumeric identifier for the post unique to its type. |
| `status` | `string` | no | A named status for the post. |
| `title` | `object` | no | The title for the post. |
| `author` | `integer` | no | The ID for the author of the post. |
| `featured_media` | `integer` | no | The ID of the featured media for the post. |
| `comment_status` | `string` | no | Whether or not comments are open on the post. |
| `ping_status` | `string` | no | Whether or not the post can be pinged. |
| `meta` | `object` | no | Meta fields. |
| `template` | `string` | no | The theme file to use to display the post. |
| `alt_text` | `string` | no | Alternative text to display when attachment is not displayed. |
| `caption` | `object` | no | The attachment caption. |
| `description` | `object` | no | The attachment description. |
| `post` | `integer` | no | The ID for the associated post of the attachment. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/media' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/media/(?P<id>[\d]+)`

**Methods**: `DELETE, GET, PATCH, POST, PUT`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `integer` | no | Unique identifier for the post. |
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |

### Args for methods: `POST, PUT, PATCH`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `integer` | no | Unique identifier for the post. |
| `date` | `string / null` | no | The date the post was published, in the site's timezone. |
| `date_gmt` | `string / null` | no | The date the post was published, as GMT. |
| `slug` | `string` | no | An alphanumeric identifier for the post unique to its type. |
| `status` | `string` | no | A named status for the post. |
| `title` | `object` | no | The title for the post. |
| `author` | `integer` | no | The ID for the author of the post. |
| `featured_media` | `integer` | no | The ID of the featured media for the post. |
| `comment_status` | `string` | no | Whether or not comments are open on the post. |
| `ping_status` | `string` | no | Whether or not the post can be pinged. |
| `meta` | `object` | no | Meta fields. |
| `template` | `string` | no | The theme file to use to display the post. |
| `alt_text` | `string` | no | Alternative text to display when attachment is not displayed. |
| `caption` | `object` | no | The attachment caption. |
| `description` | `object` | no | The attachment description. |
| `post` | `integer` | no | The ID for the associated post of the attachment. |

### Args for methods: `DELETE`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `integer` | no | Unique identifier for the post. |
| `force` | `boolean` | no | Whether to bypass Trash and force deletion. |

### Example
```bash
curl -X DELETE \
  'https://techoblivion.in/wp-json/wp/v2/media/(?P<id>[\d]+)' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/media/(?P<id>[\d]+)/edit`

**Methods**: `POST`

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `src` | `string` | yes | URL to the edited image file. |
| `modifiers` | `array` | no | Array of image edits. |
| `rotation` | `integer` | no | The amount to rotate the image clockwise in degrees. DEPRECATED: Use `modifiers` instead. |
| `x` | `number` | no | As a percentage of the image, the x position to start the crop from. DEPRECATED: Use `modifiers` instead. |
| `y` | `number` | no | As a percentage of the image, the y position to start the crop from. DEPRECATED: Use `modifiers` instead. |
| `width` | `number` | no | As a percentage of the image, the width to crop the image to. DEPRECATED: Use `modifiers` instead. |
| `height` | `number` | no | As a percentage of the image, the height to crop the image to. DEPRECATED: Use `modifiers` instead. |

### Example
```bash
curl -X POST \
  'https://techoblivion.in/wp-json/wp/v2/media/(?P<id>[\d]+)/edit' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/media/(?P<id>[\d]+)/post-process`

**Methods**: `POST`

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `integer` | no | Unique identifier for the attachment. |
| `action` | `string` | yes |  |

### Example
```bash
curl -X POST \
  'https://techoblivion.in/wp-json/wp/v2/media/(?P<id>[\d]+)/post-process' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/menu-items`

**Methods**: `GET, POST`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |
| `page` | `integer` | no | Current page of the collection. |
| `per_page` | `integer` | no | Maximum number of items to be returned in result set. |
| `search` | `string` | no | Limit results to those matching a string. |
| `after` | `string` | no | Limit response to posts published after a given ISO8601 compliant date. |
| `modified_after` | `string` | no | Limit response to posts modified after a given ISO8601 compliant date. |
| `before` | `string` | no | Limit response to posts published before a given ISO8601 compliant date. |
| `modified_before` | `string` | no | Limit response to posts modified before a given ISO8601 compliant date. |
| `exclude` | `array` | no | Ensure result set excludes specific IDs. |
| `include` | `array` | no | Limit result set to specific IDs. |
| `search_semantics` | `string` | no | How to interpret the search input. |
| `offset` | `integer` | no | Offset the result set by a specific number of items. |
| `order` | `string` | no | Order sort attribute ascending or descending. |
| `orderby` | `string` | no | Sort collection by object attribute. |
| `search_columns` | `array` | no | Array of column names to be searched. |
| `slug` | `array` | no | Limit result set to posts with one or more specific slugs. |
| `status` | `array` | no | Limit result set to posts assigned one or more statuses. |
| `tax_relation` | `string` | no | Limit result set based on relationship between multiple taxonomies. |
| `menus` | `object / array` | no | Limit result set to items with specific terms assigned in the menus taxonomy. |
| `menus_exclude` | `object / array` | no | Limit result set to items except those with specific terms assigned in the menus taxonomy. |
| `menu_order` | `integer` | no | Limit result set to posts with a specific menu_order value. |

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `title` | `string / object` | no | The title for the object. |
| `type` | `string` | no | The family of objects originally represented, such as "post_type" or "taxonomy". |
| `status` | `string` | no | A named status for the object. |
| `parent` | `integer` | no | The ID for the parent of the object. |
| `attr_title` | `string` | no | Text for the title attribute of the link element for this menu item. |
| `classes` | `array` | no | Class names for the link element of this menu item. |
| `description` | `string` | no | The description of this menu item. |
| `menu_order` | `integer` | no | The DB ID of the nav_menu_item that is this item's menu parent, if any, otherwise 0. |
| `object` | `string` | no | The type of object originally represented, such as "category", "post", or "attachment". |
| `object_id` | `integer` | no | The database ID of the original object this menu item represents, for example the ID for posts or the term_id for categories. |
| `target` | `string` | no | The target attribute of the link element for this menu item. |
| `url` | `string` | no | The URL to which this menu item points. |
| `xfn` | `array` | no | The XFN relationship expressed in the link of this menu item. |
| `menus` | `integer` | no | The terms assigned to the object in the nav_menu taxonomy. |
| `meta` | `object` | no | Meta fields. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/menu-items' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/menu-items/(?P<id>[\d]+)`

**Methods**: `DELETE, GET, PATCH, POST, PUT`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `integer` | no | Unique identifier for the post. |
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |

### Args for methods: `POST, PUT, PATCH`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `integer` | no | Unique identifier for the post. |
| `title` | `string / object` | no | The title for the object. |
| `type` | `string` | no | The family of objects originally represented, such as "post_type" or "taxonomy". |
| `status` | `string` | no | A named status for the object. |
| `parent` | `integer` | no | The ID for the parent of the object. |
| `attr_title` | `string` | no | Text for the title attribute of the link element for this menu item. |
| `classes` | `array` | no | Class names for the link element of this menu item. |
| `description` | `string` | no | The description of this menu item. |
| `menu_order` | `integer` | no | The DB ID of the nav_menu_item that is this item's menu parent, if any, otherwise 0. |
| `object` | `string` | no | The type of object originally represented, such as "category", "post", or "attachment". |
| `object_id` | `integer` | no | The database ID of the original object this menu item represents, for example the ID for posts or the term_id for categories. |
| `target` | `string` | no | The target attribute of the link element for this menu item. |
| `url` | `string` | no | The URL to which this menu item points. |
| `xfn` | `array` | no | The XFN relationship expressed in the link of this menu item. |
| `menus` | `integer` | no | The terms assigned to the object in the nav_menu taxonomy. |
| `meta` | `object` | no | Meta fields. |

### Args for methods: `DELETE`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `integer` | no | Unique identifier for the post. |
| `force` | `boolean` | no | Whether to bypass Trash and force deletion. |

### Example
```bash
curl -X DELETE \
  'https://techoblivion.in/wp-json/wp/v2/menu-items/(?P<id>[\d]+)' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/menu-items/(?P<id>[\d]+)/autosaves`

**Methods**: `GET, POST`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `parent` | `integer` | no | The ID for the parent of the autosave. |
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `parent` | `integer` | no | The ID for the parent of the object. |
| `title` | `string / object` | no | The title for the object. |
| `type` | `string` | no | The family of objects originally represented, such as "post_type" or "taxonomy". |
| `status` | `string` | no | A named status for the object. |
| `attr_title` | `string` | no | Text for the title attribute of the link element for this menu item. |
| `classes` | `array` | no | Class names for the link element of this menu item. |
| `description` | `string` | no | The description of this menu item. |
| `menu_order` | `integer` | no | The DB ID of the nav_menu_item that is this item's menu parent, if any, otherwise 0. |
| `object` | `string` | no | The type of object originally represented, such as "category", "post", or "attachment". |
| `object_id` | `integer` | no | The database ID of the original object this menu item represents, for example the ID for posts or the term_id for categories. |
| `target` | `string` | no | The target attribute of the link element for this menu item. |
| `url` | `string` | no | The URL to which this menu item points. |
| `xfn` | `array` | no | The XFN relationship expressed in the link of this menu item. |
| `menus` | `integer` | no | The terms assigned to the object in the nav_menu taxonomy. |
| `meta` | `object` | no | Meta fields. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/menu-items/(?P<id>[\d]+)/autosaves' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/menu-items/(?P<parent>[\d]+)/autosaves/(?P<id>[\d]+)`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `parent` | `integer` | no | The ID for the parent of the autosave. |
| `id` | `integer` | no | The ID for the autosave. |
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/menu-items/(?P<parent>[\d]+)/autosaves/(?P<id>[\d]+)' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/menu-locations`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/menu-locations' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/menu-locations/(?P<location>[\w-]+)`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `location` | `string` | no | An alphanumeric identifier for the menu location. |
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/menu-locations/(?P<location>[\w-]+)' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/menus`

**Methods**: `GET, POST`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |
| `page` | `integer` | no | Current page of the collection. |
| `per_page` | `integer` | no | Maximum number of items to be returned in result set. |
| `search` | `string` | no | Limit results to those matching a string. |
| `exclude` | `array` | no | Ensure result set excludes specific IDs. |
| `include` | `array` | no | Limit result set to specific IDs. |
| `offset` | `integer` | no | Offset the result set by a specific number of items. |
| `order` | `string` | no | Order sort attribute ascending or descending. |
| `orderby` | `string` | no | Sort collection by term attribute. |
| `hide_empty` | `boolean` | no | Whether to hide terms not assigned to any posts. |
| `post` | `integer` | no | Limit result set to terms assigned to a specific post. |
| `slug` | `array` | no | Limit result set to terms with one or more specific slugs. |

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `description` | `string` | no | HTML description of the term. |
| `name` | `string` | yes | HTML title for the term. |
| `slug` | `string` | no | An alphanumeric identifier for the term unique to its type. |
| `meta` | `object` | no | Meta fields. |
| `locations` | `array` | no | The locations assigned to the menu. |
| `auto_add` | `boolean` | no | Whether to automatically add top level pages to this menu. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/menus' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/menus/(?P<id>[\d]+)`

**Methods**: `DELETE, GET, PATCH, POST, PUT`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `integer` | no | Unique identifier for the term. |
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |

### Args for methods: `POST, PUT, PATCH`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `integer` | no | Unique identifier for the term. |
| `description` | `string` | no | HTML description of the term. |
| `name` | `string` | no | HTML title for the term. |
| `slug` | `string` | no | An alphanumeric identifier for the term unique to its type. |
| `meta` | `object` | no | Meta fields. |
| `locations` | `array` | no | The locations assigned to the menu. |
| `auto_add` | `boolean` | no | Whether to automatically add top level pages to this menu. |

### Args for methods: `DELETE`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `integer` | no | Unique identifier for the term. |
| `force` | `boolean` | no | Required to be true, as terms do not support trashing. |

### Example
```bash
curl -X DELETE \
  'https://techoblivion.in/wp-json/wp/v2/menus/(?P<id>[\d]+)' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/navigation`

**Methods**: `GET, POST`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |
| `page` | `integer` | no | Current page of the collection. |
| `per_page` | `integer` | no | Maximum number of items to be returned in result set. |
| `search` | `string` | no | Limit results to those matching a string. |
| `after` | `string` | no | Limit response to posts published after a given ISO8601 compliant date. |
| `modified_after` | `string` | no | Limit response to posts modified after a given ISO8601 compliant date. |
| `before` | `string` | no | Limit response to posts published before a given ISO8601 compliant date. |
| `modified_before` | `string` | no | Limit response to posts modified before a given ISO8601 compliant date. |
| `exclude` | `array` | no | Ensure result set excludes specific IDs. |
| `include` | `array` | no | Limit result set to specific IDs. |
| `search_semantics` | `string` | no | How to interpret the search input. |
| `offset` | `integer` | no | Offset the result set by a specific number of items. |
| `order` | `string` | no | Order sort attribute ascending or descending. |
| `orderby` | `string` | no | Sort collection by post attribute. |
| `search_columns` | `array` | no | Array of column names to be searched. |
| `slug` | `array` | no | Limit result set to posts with one or more specific slugs. |
| `status` | `array` | no | Limit result set to posts assigned one or more statuses. |

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `date` | `string / null` | no | The date the post was published, in the site's timezone. |
| `date_gmt` | `string / null` | no | The date the post was published, as GMT. |
| `slug` | `string` | no | An alphanumeric identifier for the post unique to its type. |
| `status` | `string` | no | A named status for the post. |
| `password` | `string` | no | A password to protect access to the content and excerpt. |
| `title` | `object` | no | The title for the post. |
| `content` | `object` | no | The content for the post. |
| `template` | `string` | no | The theme file to use to display the post. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/navigation' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/navigation/(?P<id>[\d]+)`

**Methods**: `DELETE, GET, PATCH, POST, PUT`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `integer` | no | Unique identifier for the post. |
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |
| `password` | `string` | no | The password for the post if it is password protected. |

### Args for methods: `POST, PUT, PATCH`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `integer` | no | Unique identifier for the post. |
| `date` | `string / null` | no | The date the post was published, in the site's timezone. |
| `date_gmt` | `string / null` | no | The date the post was published, as GMT. |
| `slug` | `string` | no | An alphanumeric identifier for the post unique to its type. |
| `status` | `string` | no | A named status for the post. |
| `password` | `string` | no | A password to protect access to the content and excerpt. |
| `title` | `object` | no | The title for the post. |
| `content` | `object` | no | The content for the post. |
| `template` | `string` | no | The theme file to use to display the post. |

### Args for methods: `DELETE`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `integer` | no | Unique identifier for the post. |
| `force` | `boolean` | no | Whether to bypass Trash and force deletion. |

### Example
```bash
curl -X DELETE \
  'https://techoblivion.in/wp-json/wp/v2/navigation/(?P<id>[\d]+)' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/navigation/(?P<id>[\d]+)/autosaves`

**Methods**: `GET, POST`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `parent` | `integer` | no | The ID for the parent of the autosave. |
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `parent` | `integer` | no | The ID for the parent of the autosave. |
| `date` | `string / null` | no | The date the post was published, in the site's timezone. |
| `date_gmt` | `string / null` | no | The date the post was published, as GMT. |
| `slug` | `string` | no | An alphanumeric identifier for the post unique to its type. |
| `status` | `string` | no | A named status for the post. |
| `password` | `string` | no | A password to protect access to the content and excerpt. |
| `title` | `object` | no | The title for the post. |
| `content` | `object` | no | The content for the post. |
| `template` | `string` | no | The theme file to use to display the post. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/navigation/(?P<id>[\d]+)/autosaves' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/navigation/(?P<parent>[\d]+)/autosaves/(?P<id>[\d]+)`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `parent` | `integer` | no | The ID for the parent of the autosave. |
| `id` | `integer` | no | The ID for the autosave. |
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/navigation/(?P<parent>[\d]+)/autosaves/(?P<id>[\d]+)' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/navigation/(?P<parent>[\d]+)/revisions`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `parent` | `integer` | no | The ID for the parent of the revision. |
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |
| `page` | `integer` | no | Current page of the collection. |
| `per_page` | `integer` | no | Maximum number of items to be returned in result set. |
| `search` | `string` | no | Limit results to those matching a string. |
| `exclude` | `array` | no | Ensure result set excludes specific IDs. |
| `include` | `array` | no | Limit result set to specific IDs. |
| `offset` | `integer` | no | Offset the result set by a specific number of items. |
| `order` | `string` | no | Order sort attribute ascending or descending. |
| `orderby` | `string` | no | Sort collection by object attribute. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/navigation/(?P<parent>[\d]+)/revisions' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/navigation/(?P<parent>[\d]+)/revisions/(?P<id>[\d]+)`

**Methods**: `DELETE, GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `parent` | `integer` | no | The ID for the parent of the revision. |
| `id` | `integer` | no | Unique identifier for the revision. |
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |

### Args for methods: `DELETE`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `parent` | `integer` | no | The ID for the parent of the revision. |
| `id` | `integer` | no | Unique identifier for the revision. |
| `force` | `boolean` | no | Required to be true, as revisions do not support trashing. |

### Example
```bash
curl -X DELETE \
  'https://techoblivion.in/wp-json/wp/v2/navigation/(?P<parent>[\d]+)/revisions/(?P<id>[\d]+)' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/pages`

**Methods**: `GET, POST`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |
| `page` | `integer` | no | Current page of the collection. |
| `per_page` | `integer` | no | Maximum number of items to be returned in result set. |
| `search` | `string` | no | Limit results to those matching a string. |
| `after` | `string` | no | Limit response to posts published after a given ISO8601 compliant date. |
| `modified_after` | `string` | no | Limit response to posts modified after a given ISO8601 compliant date. |
| `author` | `array` | no | Limit result set to posts assigned to specific authors. |
| `author_exclude` | `array` | no | Ensure result set excludes posts assigned to specific authors. |
| `before` | `string` | no | Limit response to posts published before a given ISO8601 compliant date. |
| `modified_before` | `string` | no | Limit response to posts modified before a given ISO8601 compliant date. |
| `exclude` | `array` | no | Ensure result set excludes specific IDs. |
| `include` | `array` | no | Limit result set to specific IDs. |
| `menu_order` | `integer` | no | Limit result set to posts with a specific menu_order value. |
| `search_semantics` | `string` | no | How to interpret the search input. |
| `offset` | `integer` | no | Offset the result set by a specific number of items. |
| `order` | `string` | no | Order sort attribute ascending or descending. |
| `orderby` | `string` | no | Sort collection by post attribute. |
| `parent` | `array` | no | Limit result set to items with particular parent IDs. |
| `parent_exclude` | `array` | no | Limit result set to all items except those of a particular parent ID. |
| `search_columns` | `array` | no | Array of column names to be searched. |
| `slug` | `array` | no | Limit result set to posts with one or more specific slugs. |
| `status` | `array` | no | Limit result set to posts assigned one or more statuses. |

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `date` | `string / null` | no | The date the post was published, in the site's timezone. |
| `date_gmt` | `string / null` | no | The date the post was published, as GMT. |
| `slug` | `string` | no | An alphanumeric identifier for the post unique to its type. |
| `status` | `string` | no | A named status for the post. |
| `password` | `string` | no | A password to protect access to the content and excerpt. |
| `parent` | `integer` | no | The ID for the parent of the post. |
| `title` | `object` | no | The title for the post. |
| `content` | `object` | no | The content for the post. |
| `author` | `integer` | no | The ID for the author of the post. |
| `excerpt` | `object` | no | The excerpt for the post. |
| `featured_media` | `integer` | no | The ID of the featured media for the post. |
| `comment_status` | `string` | no | Whether or not comments are open on the post. |
| `ping_status` | `string` | no | Whether or not the post can be pinged. |
| `menu_order` | `integer` | no | The order of the post in relation to other posts. |
| `meta` | `object` | no | Meta fields. |
| `template` | `string` | no | The theme file to use to display the post. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/pages' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/pages/(?P<id>[\d]+)`

**Methods**: `DELETE, GET, PATCH, POST, PUT`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `integer` | no | Unique identifier for the post. |
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |
| `excerpt_length` | `integer` | no | Override the default excerpt length. |
| `password` | `string` | no | The password for the post if it is password protected. |

### Args for methods: `POST, PUT, PATCH`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `integer` | no | Unique identifier for the post. |
| `date` | `string / null` | no | The date the post was published, in the site's timezone. |
| `date_gmt` | `string / null` | no | The date the post was published, as GMT. |
| `slug` | `string` | no | An alphanumeric identifier for the post unique to its type. |
| `status` | `string` | no | A named status for the post. |
| `password` | `string` | no | A password to protect access to the content and excerpt. |
| `parent` | `integer` | no | The ID for the parent of the post. |
| `title` | `object` | no | The title for the post. |
| `content` | `object` | no | The content for the post. |
| `author` | `integer` | no | The ID for the author of the post. |
| `excerpt` | `object` | no | The excerpt for the post. |
| `featured_media` | `integer` | no | The ID of the featured media for the post. |
| `comment_status` | `string` | no | Whether or not comments are open on the post. |
| `ping_status` | `string` | no | Whether or not the post can be pinged. |
| `menu_order` | `integer` | no | The order of the post in relation to other posts. |
| `meta` | `object` | no | Meta fields. |
| `template` | `string` | no | The theme file to use to display the post. |

### Args for methods: `DELETE`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `integer` | no | Unique identifier for the post. |
| `force` | `boolean` | no | Whether to bypass Trash and force deletion. |

### Example
```bash
curl -X DELETE \
  'https://techoblivion.in/wp-json/wp/v2/pages/(?P<id>[\d]+)' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/pages/(?P<id>[\d]+)/autosaves`

**Methods**: `GET, POST`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `parent` | `integer` | no | The ID for the parent of the autosave. |
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `parent` | `integer` | no | The ID for the parent of the post. |
| `date` | `string / null` | no | The date the post was published, in the site's timezone. |
| `date_gmt` | `string / null` | no | The date the post was published, as GMT. |
| `slug` | `string` | no | An alphanumeric identifier for the post unique to its type. |
| `status` | `string` | no | A named status for the post. |
| `password` | `string` | no | A password to protect access to the content and excerpt. |
| `title` | `object` | no | The title for the post. |
| `content` | `object` | no | The content for the post. |
| `author` | `integer` | no | The ID for the author of the post. |
| `excerpt` | `object` | no | The excerpt for the post. |
| `featured_media` | `integer` | no | The ID of the featured media for the post. |
| `comment_status` | `string` | no | Whether or not comments are open on the post. |
| `ping_status` | `string` | no | Whether or not the post can be pinged. |
| `menu_order` | `integer` | no | The order of the post in relation to other posts. |
| `meta` | `object` | no | Meta fields. |
| `template` | `string` | no | The theme file to use to display the post. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/pages/(?P<id>[\d]+)/autosaves' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/pages/(?P<parent>[\d]+)/autosaves/(?P<id>[\d]+)`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `parent` | `integer` | no | The ID for the parent of the autosave. |
| `id` | `integer` | no | The ID for the autosave. |
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/pages/(?P<parent>[\d]+)/autosaves/(?P<id>[\d]+)' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/pages/(?P<parent>[\d]+)/revisions`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `parent` | `integer` | no | The ID for the parent of the revision. |
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |
| `page` | `integer` | no | Current page of the collection. |
| `per_page` | `integer` | no | Maximum number of items to be returned in result set. |
| `search` | `string` | no | Limit results to those matching a string. |
| `exclude` | `array` | no | Ensure result set excludes specific IDs. |
| `include` | `array` | no | Limit result set to specific IDs. |
| `offset` | `integer` | no | Offset the result set by a specific number of items. |
| `order` | `string` | no | Order sort attribute ascending or descending. |
| `orderby` | `string` | no | Sort collection by object attribute. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/pages/(?P<parent>[\d]+)/revisions' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/pages/(?P<parent>[\d]+)/revisions/(?P<id>[\d]+)`

**Methods**: `DELETE, GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `parent` | `integer` | no | The ID for the parent of the revision. |
| `id` | `integer` | no | Unique identifier for the revision. |
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |

### Args for methods: `DELETE`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `parent` | `integer` | no | The ID for the parent of the revision. |
| `id` | `integer` | no | Unique identifier for the revision. |
| `force` | `boolean` | no | Required to be true, as revisions do not support trashing. |

### Example
```bash
curl -X DELETE \
  'https://techoblivion.in/wp-json/wp/v2/pages/(?P<parent>[\d]+)/revisions/(?P<id>[\d]+)' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/pattern-directory/patterns`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |
| `page` | `integer` | no | Current page of the collection. |
| `per_page` | `integer` | no | Maximum number of items to be returned in result set. |
| `search` | `string` | no | Limit results to those matching a string. |
| `category` | `integer` | no | Limit results to those matching a category ID. |
| `keyword` | `integer` | no | Limit results to those matching a keyword ID. |
| `slug` | `array` | no | Limit results to those matching a pattern (slug). |
| `offset` | `integer` | no | Offset the result set by a specific number of items. |
| `order` | `string` | no | Order sort attribute ascending or descending. |
| `orderby` | `string` | no | Sort collection by post attribute. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/pattern-directory/patterns' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/plugins`

**Methods**: `GET, POST`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |
| `search` | `string` | no | Limit results to those matching a string. |
| `status` | `array` | no | Limits results to plugins with the given status. |

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `slug` | `string` | yes | WordPress.org plugin directory slug. |
| `status` | `string` | no | The plugin activation status. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/plugins' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/plugins/(?P<plugin>[^.\/]+(?:\/[^.\/]+)?)`

**Methods**: `DELETE, GET, PATCH, POST, PUT`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |
| `plugin` | `string` | no |  |

### Args for methods: `POST, PUT, PATCH`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |
| `plugin` | `string` | no |  |
| `status` | `string` | no | The plugin activation status. |

### Args for methods: `DELETE`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |
| `plugin` | `string` | no |  |

### Example
```bash
curl -X DELETE \
  'https://techoblivion.in/wp-json/wp/v2/plugins/(?P<plugin>[^.\/]+(?:\/[^.\/]+)?)' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/posts`

**Methods**: `GET, POST`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |
| `page` | `integer` | no | Current page of the collection. |
| `per_page` | `integer` | no | Maximum number of items to be returned in result set. |
| `search` | `string` | no | Limit results to those matching a string. |
| `after` | `string` | no | Limit response to posts published after a given ISO8601 compliant date. |
| `modified_after` | `string` | no | Limit response to posts modified after a given ISO8601 compliant date. |
| `author` | `array` | no | Limit result set to posts assigned to specific authors. |
| `author_exclude` | `array` | no | Ensure result set excludes posts assigned to specific authors. |
| `before` | `string` | no | Limit response to posts published before a given ISO8601 compliant date. |
| `modified_before` | `string` | no | Limit response to posts modified before a given ISO8601 compliant date. |
| `exclude` | `array` | no | Ensure result set excludes specific IDs. |
| `include` | `array` | no | Limit result set to specific IDs. |
| `search_semantics` | `string` | no | How to interpret the search input. |
| `offset` | `integer` | no | Offset the result set by a specific number of items. |
| `order` | `string` | no | Order sort attribute ascending or descending. |
| `orderby` | `string` | no | Sort collection by post attribute. |
| `search_columns` | `array` | no | Array of column names to be searched. |
| `slug` | `array` | no | Limit result set to posts with one or more specific slugs. |
| `status` | `array` | no | Limit result set to posts assigned one or more statuses. |
| `tax_relation` | `string` | no | Limit result set based on relationship between multiple taxonomies. |
| `categories` | `object / array` | no | Limit result set to items with specific terms assigned in the categories taxonomy. |
| `categories_exclude` | `object / array` | no | Limit result set to items except those with specific terms assigned in the categories taxonomy. |
| `tags` | `object / array` | no | Limit result set to items with specific terms assigned in the tags taxonomy. |
| `tags_exclude` | `object / array` | no | Limit result set to items except those with specific terms assigned in the tags taxonomy. |
| `sticky` | `boolean` | no | Limit result set to items that are sticky. |
| `ignore_sticky` | `boolean` | no | Whether to ignore sticky posts or not. |
| `format` | `array` | no | Limit result set to items assigned one or more given formats. |

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `date` | `string / null` | no | The date the post was published, in the site's timezone. |
| `date_gmt` | `string / null` | no | The date the post was published, as GMT. |
| `slug` | `string` | no | An alphanumeric identifier for the post unique to its type. |
| `status` | `string` | no | A named status for the post. |
| `password` | `string` | no | A password to protect access to the content and excerpt. |
| `title` | `object` | no | The title for the post. |
| `content` | `object` | no | The content for the post. |
| `author` | `integer` | no | The ID for the author of the post. |
| `excerpt` | `object` | no | The excerpt for the post. |
| `featured_media` | `integer` | no | The ID of the featured media for the post. |
| `comment_status` | `string` | no | Whether or not comments are open on the post. |
| `ping_status` | `string` | no | Whether or not the post can be pinged. |
| `format` | `string` | no | The format for the post. |
| `meta` | `object` | no | Meta fields. |
| `sticky` | `boolean` | no | Whether or not the post should be treated as sticky. |
| `template` | `string` | no | The theme file to use to display the post. |
| `categories` | `array` | no | The terms assigned to the post in the category taxonomy. |
| `tags` | `array` | no | The terms assigned to the post in the post_tag taxonomy. |
| `content_raw` | `string` | no | Raw post content |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/posts' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/posts/(?P<id>[\d]+)`

**Methods**: `DELETE, GET, PATCH, POST, PUT`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `integer` | no | Unique identifier for the post. |
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |
| `excerpt_length` | `integer` | no | Override the default excerpt length. |
| `password` | `string` | no | The password for the post if it is password protected. |

### Args for methods: `POST, PUT, PATCH`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `integer` | no | Unique identifier for the post. |
| `date` | `string / null` | no | The date the post was published, in the site's timezone. |
| `date_gmt` | `string / null` | no | The date the post was published, as GMT. |
| `slug` | `string` | no | An alphanumeric identifier for the post unique to its type. |
| `status` | `string` | no | A named status for the post. |
| `password` | `string` | no | A password to protect access to the content and excerpt. |
| `title` | `object` | no | The title for the post. |
| `content` | `object` | no | The content for the post. |
| `author` | `integer` | no | The ID for the author of the post. |
| `excerpt` | `object` | no | The excerpt for the post. |
| `featured_media` | `integer` | no | The ID of the featured media for the post. |
| `comment_status` | `string` | no | Whether or not comments are open on the post. |
| `ping_status` | `string` | no | Whether or not the post can be pinged. |
| `format` | `string` | no | The format for the post. |
| `meta` | `object` | no | Meta fields. |
| `sticky` | `boolean` | no | Whether or not the post should be treated as sticky. |
| `template` | `string` | no | The theme file to use to display the post. |
| `categories` | `array` | no | The terms assigned to the post in the category taxonomy. |
| `tags` | `array` | no | The terms assigned to the post in the post_tag taxonomy. |
| `content_raw` | `string` | no | Raw post content |

### Args for methods: `DELETE`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `integer` | no | Unique identifier for the post. |
| `force` | `boolean` | no | Whether to bypass Trash and force deletion. |

### Example
```bash
curl -X DELETE \
  'https://techoblivion.in/wp-json/wp/v2/posts/(?P<id>[\d]+)' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/posts/(?P<id>[\d]+)/autosaves`

**Methods**: `GET, POST`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `parent` | `integer` | no | The ID for the parent of the autosave. |
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `parent` | `integer` | no | The ID for the parent of the autosave. |
| `date` | `string / null` | no | The date the post was published, in the site's timezone. |
| `date_gmt` | `string / null` | no | The date the post was published, as GMT. |
| `slug` | `string` | no | An alphanumeric identifier for the post unique to its type. |
| `status` | `string` | no | A named status for the post. |
| `password` | `string` | no | A password to protect access to the content and excerpt. |
| `title` | `object` | no | The title for the post. |
| `content` | `object` | no | The content for the post. |
| `author` | `integer` | no | The ID for the author of the post. |
| `excerpt` | `object` | no | The excerpt for the post. |
| `featured_media` | `integer` | no | The ID of the featured media for the post. |
| `comment_status` | `string` | no | Whether or not comments are open on the post. |
| `ping_status` | `string` | no | Whether or not the post can be pinged. |
| `format` | `string` | no | The format for the post. |
| `meta` | `object` | no | Meta fields. |
| `sticky` | `boolean` | no | Whether or not the post should be treated as sticky. |
| `template` | `string` | no | The theme file to use to display the post. |
| `categories` | `array` | no | The terms assigned to the post in the category taxonomy. |
| `tags` | `array` | no | The terms assigned to the post in the post_tag taxonomy. |
| `content_raw` | `string` | no | Raw post content |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/posts/(?P<id>[\d]+)/autosaves' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/posts/(?P<parent>[\d]+)/autosaves/(?P<id>[\d]+)`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `parent` | `integer` | no | The ID for the parent of the autosave. |
| `id` | `integer` | no | The ID for the autosave. |
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/posts/(?P<parent>[\d]+)/autosaves/(?P<id>[\d]+)' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/posts/(?P<parent>[\d]+)/revisions`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `parent` | `integer` | no | The ID for the parent of the revision. |
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |
| `page` | `integer` | no | Current page of the collection. |
| `per_page` | `integer` | no | Maximum number of items to be returned in result set. |
| `search` | `string` | no | Limit results to those matching a string. |
| `exclude` | `array` | no | Ensure result set excludes specific IDs. |
| `include` | `array` | no | Limit result set to specific IDs. |
| `offset` | `integer` | no | Offset the result set by a specific number of items. |
| `order` | `string` | no | Order sort attribute ascending or descending. |
| `orderby` | `string` | no | Sort collection by object attribute. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/posts/(?P<parent>[\d]+)/revisions' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/posts/(?P<parent>[\d]+)/revisions/(?P<id>[\d]+)`

**Methods**: `DELETE, GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `parent` | `integer` | no | The ID for the parent of the revision. |
| `id` | `integer` | no | Unique identifier for the revision. |
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |

### Args for methods: `DELETE`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `parent` | `integer` | no | The ID for the parent of the revision. |
| `id` | `integer` | no | Unique identifier for the revision. |
| `force` | `boolean` | no | Required to be true, as revisions do not support trashing. |

### Example
```bash
curl -X DELETE \
  'https://techoblivion.in/wp-json/wp/v2/posts/(?P<parent>[\d]+)/revisions/(?P<id>[\d]+)' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/search`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |
| `page` | `integer` | no | Current page of the collection. |
| `per_page` | `integer` | no | Maximum number of items to be returned in result set. |
| `search` | `string` | no | Limit results to those matching a string. |
| `type` | `string` | no | Limit results to items of an object type. |
| `subtype` | `array` | no | Limit results to items of one or more object subtypes. |
| `exclude` | `array` | no | Ensure result set excludes specific IDs. |
| `include` | `array` | no | Limit result set to specific IDs. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/search' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/settings`

**Methods**: `GET, PATCH, POST, PUT`

### Args for methods: `POST, PUT, PATCH`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `title` | `string` | no | Site title. |
| `description` | `string` | no | Site tagline. |
| `url` | `string` | no | Site URL. |
| `email` | `string` | no | This address is used for admin purposes, like new user notification. |
| `timezone` | `string` | no | A city in the same timezone as you. |
| `date_format` | `string` | no | A date format for all date strings. |
| `time_format` | `string` | no | A time format for all time strings. |
| `start_of_week` | `integer` | no | A day number of the week that the week should start on. |
| `language` | `string` | no | WordPress locale code. |
| `use_smilies` | `boolean` | no | Convert emoticons like :-) and :-P to graphics on display. |
| `default_category` | `integer` | no | Default post category. |
| `default_post_format` | `string` | no | Default post format. |
| `posts_per_page` | `integer` | no | Blog pages show at most. |
| `show_on_front` | `string` | no | What to show on the front page |
| `page_on_front` | `integer` | no | The ID of the page that should be displayed on the front page |
| `page_for_posts` | `integer` | no | The ID of the page that should display the latest posts |
| `default_ping_status` | `string` | no | Allow link notifications from other blogs (pingbacks and trackbacks) on new articles. |
| `default_comment_status` | `string` | no | Allow people to submit comments on new posts. |
| `site_logo` | `integer` | no | Site logo. |
| `site_icon` | `integer` | no | Site icon. |
| `jwt_auth_options` | `object` | no |  |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/settings' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/sidebars`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/sidebars' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/sidebars/(?P<id>[\w-]+)`

**Methods**: `GET, PATCH, POST, PUT`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `string` | no | The id of a registered sidebar |
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |

### Args for methods: `POST, PUT, PATCH`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `widgets` | `array` | no | Nested widgets. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/sidebars/(?P<id>[\w-]+)' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/statuses`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/statuses' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/statuses/(?P<status>[\w-]+)`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `status` | `string` | no | An alphanumeric identifier for the status. |
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/statuses/(?P<status>[\w-]+)' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/tags`

**Methods**: `GET, POST`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |
| `page` | `integer` | no | Current page of the collection. |
| `per_page` | `integer` | no | Maximum number of items to be returned in result set. |
| `search` | `string` | no | Limit results to those matching a string. |
| `exclude` | `array` | no | Ensure result set excludes specific IDs. |
| `include` | `array` | no | Limit result set to specific IDs. |
| `offset` | `integer` | no | Offset the result set by a specific number of items. |
| `order` | `string` | no | Order sort attribute ascending or descending. |
| `orderby` | `string` | no | Sort collection by term attribute. |
| `hide_empty` | `boolean` | no | Whether to hide terms not assigned to any posts. |
| `post` | `integer` | no | Limit result set to terms assigned to a specific post. |
| `slug` | `array` | no | Limit result set to terms with one or more specific slugs. |

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `description` | `string` | no | HTML description of the term. |
| `name` | `string` | yes | HTML title for the term. |
| `slug` | `string` | no | An alphanumeric identifier for the term unique to its type. |
| `meta` | `object` | no | Meta fields. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/tags' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/tags/(?P<id>[\d]+)`

**Methods**: `DELETE, GET, PATCH, POST, PUT`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `integer` | no | Unique identifier for the term. |
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |

### Args for methods: `POST, PUT, PATCH`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `integer` | no | Unique identifier for the term. |
| `description` | `string` | no | HTML description of the term. |
| `name` | `string` | no | HTML title for the term. |
| `slug` | `string` | no | An alphanumeric identifier for the term unique to its type. |
| `meta` | `object` | no | Meta fields. |

### Args for methods: `DELETE`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `integer` | no | Unique identifier for the term. |
| `force` | `boolean` | no | Required to be true, as terms do not support trashing. |

### Example
```bash
curl -X DELETE \
  'https://techoblivion.in/wp-json/wp/v2/tags/(?P<id>[\d]+)' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/taxonomies`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |
| `type` | `string` | no | Limit results to taxonomies associated with a specific post type. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/taxonomies' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/taxonomies/(?P<taxonomy>[\w-]+)`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `taxonomy` | `string` | no | An alphanumeric identifier for the taxonomy. |
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/taxonomies/(?P<taxonomy>[\w-]+)' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/template-parts`

**Methods**: `GET, POST`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |
| `wp_id` | `integer` | no | Limit to the specified post id. |
| `area` | `string` | no | Limit to the specified template part area. |
| `post_type` | `string` | no | Post type to get the templates for. |

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `slug` | `string` | yes | Unique slug identifying the template. |
| `theme` | `string` | no | Theme identifier for the template. |
| `type` | `string` | no | Type of template. |
| `content` | `object / string` | no | Content of template. |
| `title` | `object / string` | no | Title of template. |
| `description` | `string` | no | Description of template. |
| `status` | `string` | no | Status of template. |
| `author` | `integer` | no | The ID for the author of the template. |
| `area` | `string` | no | Where the template part is intended for use (header, footer, etc.) |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/template-parts' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/template-parts/(?P<id>([^\/:<>\*\?"\|]+(?:\/[^\/:<>\*\?"\|]+)?)[\/\w%-]+)`

**Methods**: `DELETE, GET, PATCH, POST, PUT`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `string` | no | The id of a template |
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |

### Args for methods: `POST, PUT, PATCH`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `string` | no | The id of a template |
| `slug` | `string` | no | Unique slug identifying the template. |
| `theme` | `string` | no | Theme identifier for the template. |
| `type` | `string` | no | Type of template. |
| `content` | `object / string` | no | Content of template. |
| `title` | `object / string` | no | Title of template. |
| `description` | `string` | no | Description of template. |
| `status` | `string` | no | Status of template. |
| `author` | `integer` | no | The ID for the author of the template. |
| `area` | `string` | no | Where the template part is intended for use (header, footer, etc.) |

### Args for methods: `DELETE`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `string` | no | The id of a template |
| `force` | `boolean` | no | Whether to bypass Trash and force deletion. |

### Example
```bash
curl -X DELETE \
  'https://techoblivion.in/wp-json/wp/v2/template-parts/(?P<id>([^\/:<>\*\?"\|]+(?:\/[^\/:<>\*\?"\|]+)?)[\/\w%-]+)' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/template-parts/(?P<id>([^\/:<>\*\?"\|]+(?:\/[^\/:<>\*\?"\|]+)?)[\/\w%-]+)/autosaves`

**Methods**: `GET, POST`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `string` | no | The id of a template |
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `string` | no | The id of a template |
| `slug` | `string` | no | Unique slug identifying the template. |
| `theme` | `string` | no | Theme identifier for the template. |
| `type` | `string` | no | Type of template. |
| `content` | `object / string` | no | Content of template. |
| `title` | `object / string` | no | Title of template. |
| `description` | `string` | no | Description of template. |
| `status` | `string` | no | Status of template. |
| `author` | `integer` | no | The ID for the author of the template. |
| `area` | `string` | no | Where the template part is intended for use (header, footer, etc.) |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/template-parts/(?P<id>([^\/:<>\*\?"\|]+(?:\/[^\/:<>\*\?"\|]+)?)[\/\w%-]+)/autosaves' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/template-parts/(?P<parent>([^\/:<>\*\?"\|]+(?:\/[^\/:<>\*\?"\|]+)?)[\/\w%-]+)/autosaves/(?P<id>[\d]+)`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `parent` | `string` | no | The id of a template |
| `id` | `integer` | no | The ID for the autosave. |
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/template-parts/(?P<parent>([^\/:<>\*\?"\|]+(?:\/[^\/:<>\*\?"\|]+)?)[\/\w%-]+)/autosaves/(?P<id>[\d]+)' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/template-parts/(?P<parent>([^\/:<>\*\?"\|]+(?:\/[^\/:<>\*\?"\|]+)?)[\/\w%-]+)/revisions`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `parent` | `string` | no | The id of a template |
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |
| `page` | `integer` | no | Current page of the collection. |
| `per_page` | `integer` | no | Maximum number of items to be returned in result set. |
| `search` | `string` | no | Limit results to those matching a string. |
| `exclude` | `array` | no | Ensure result set excludes specific IDs. |
| `include` | `array` | no | Limit result set to specific IDs. |
| `offset` | `integer` | no | Offset the result set by a specific number of items. |
| `order` | `string` | no | Order sort attribute ascending or descending. |
| `orderby` | `string` | no | Sort collection by object attribute. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/template-parts/(?P<parent>([^\/:<>\*\?"\|]+(?:\/[^\/:<>\*\?"\|]+)?)[\/\w%-]+)/revisions' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/template-parts/(?P<parent>([^\/:<>\*\?"\|]+(?:\/[^\/:<>\*\?"\|]+)?)[\/\w%-]+)/revisions/(?P<id>[\d]+)`

**Methods**: `DELETE, GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `parent` | `string` | no | The id of a template |
| `id` | `integer` | no | Unique identifier for the revision. |
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |

### Args for methods: `DELETE`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `parent` | `string` | no | The id of a template |
| `id` | `integer` | no | Unique identifier for the revision. |
| `force` | `boolean` | no | Required to be true, as revisions do not support trashing. |

### Example
```bash
curl -X DELETE \
  'https://techoblivion.in/wp-json/wp/v2/template-parts/(?P<parent>([^\/:<>\*\?"\|]+(?:\/[^\/:<>\*\?"\|]+)?)[\/\w%-]+)/revisions/(?P<id>[\d]+)' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/template-parts/lookup`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `slug` | `string` | yes | The slug of the template to get the fallback for |
| `is_custom` | `boolean` | no | Indicates if a template is custom or part of the template hierarchy |
| `template_prefix` | `string` | no | The template prefix for the created template. This is used to extract the main template type, e.g. in `taxonomy-books` extracts the `taxonomy` |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/template-parts/lookup' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/templates`

**Methods**: `GET, POST`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |
| `wp_id` | `integer` | no | Limit to the specified post id. |
| `area` | `string` | no | Limit to the specified template part area. |
| `post_type` | `string` | no | Post type to get the templates for. |

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `slug` | `string` | yes | Unique slug identifying the template. |
| `theme` | `string` | no | Theme identifier for the template. |
| `type` | `string` | no | Type of template. |
| `content` | `object / string` | no | Content of template. |
| `title` | `object / string` | no | Title of template. |
| `description` | `string` | no | Description of template. |
| `status` | `string` | no | Status of template. |
| `author` | `integer` | no | The ID for the author of the template. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/templates' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/templates/(?P<id>([^\/:<>\*\?"\|]+(?:\/[^\/:<>\*\?"\|]+)?)[\/\w%-]+)`

**Methods**: `DELETE, GET, PATCH, POST, PUT`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `string` | no | The id of a template |
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |

### Args for methods: `POST, PUT, PATCH`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `string` | no | The id of a template |
| `slug` | `string` | no | Unique slug identifying the template. |
| `theme` | `string` | no | Theme identifier for the template. |
| `type` | `string` | no | Type of template. |
| `content` | `object / string` | no | Content of template. |
| `title` | `object / string` | no | Title of template. |
| `description` | `string` | no | Description of template. |
| `status` | `string` | no | Status of template. |
| `author` | `integer` | no | The ID for the author of the template. |

### Args for methods: `DELETE`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `string` | no | The id of a template |
| `force` | `boolean` | no | Whether to bypass Trash and force deletion. |

### Example
```bash
curl -X DELETE \
  'https://techoblivion.in/wp-json/wp/v2/templates/(?P<id>([^\/:<>\*\?"\|]+(?:\/[^\/:<>\*\?"\|]+)?)[\/\w%-]+)' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/templates/(?P<id>([^\/:<>\*\?"\|]+(?:\/[^\/:<>\*\?"\|]+)?)[\/\w%-]+)/autosaves`

**Methods**: `GET, POST`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `string` | no | The id of a template |
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `string` | no | The id of a template |
| `slug` | `string` | no | Unique slug identifying the template. |
| `theme` | `string` | no | Theme identifier for the template. |
| `type` | `string` | no | Type of template. |
| `content` | `object / string` | no | Content of template. |
| `title` | `object / string` | no | Title of template. |
| `description` | `string` | no | Description of template. |
| `status` | `string` | no | Status of template. |
| `author` | `integer` | no | The ID for the author of the template. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/templates/(?P<id>([^\/:<>\*\?"\|]+(?:\/[^\/:<>\*\?"\|]+)?)[\/\w%-]+)/autosaves' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/templates/(?P<parent>([^\/:<>\*\?"\|]+(?:\/[^\/:<>\*\?"\|]+)?)[\/\w%-]+)/autosaves/(?P<id>[\d]+)`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `parent` | `string` | no | The id of a template |
| `id` | `integer` | no | The ID for the autosave. |
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/templates/(?P<parent>([^\/:<>\*\?"\|]+(?:\/[^\/:<>\*\?"\|]+)?)[\/\w%-]+)/autosaves/(?P<id>[\d]+)' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/templates/(?P<parent>([^\/:<>\*\?"\|]+(?:\/[^\/:<>\*\?"\|]+)?)[\/\w%-]+)/revisions`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `parent` | `string` | no | The id of a template |
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |
| `page` | `integer` | no | Current page of the collection. |
| `per_page` | `integer` | no | Maximum number of items to be returned in result set. |
| `search` | `string` | no | Limit results to those matching a string. |
| `exclude` | `array` | no | Ensure result set excludes specific IDs. |
| `include` | `array` | no | Limit result set to specific IDs. |
| `offset` | `integer` | no | Offset the result set by a specific number of items. |
| `order` | `string` | no | Order sort attribute ascending or descending. |
| `orderby` | `string` | no | Sort collection by object attribute. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/templates/(?P<parent>([^\/:<>\*\?"\|]+(?:\/[^\/:<>\*\?"\|]+)?)[\/\w%-]+)/revisions' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/templates/(?P<parent>([^\/:<>\*\?"\|]+(?:\/[^\/:<>\*\?"\|]+)?)[\/\w%-]+)/revisions/(?P<id>[\d]+)`

**Methods**: `DELETE, GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `parent` | `string` | no | The id of a template |
| `id` | `integer` | no | Unique identifier for the revision. |
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |

### Args for methods: `DELETE`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `parent` | `string` | no | The id of a template |
| `id` | `integer` | no | Unique identifier for the revision. |
| `force` | `boolean` | no | Required to be true, as revisions do not support trashing. |

### Example
```bash
curl -X DELETE \
  'https://techoblivion.in/wp-json/wp/v2/templates/(?P<parent>([^\/:<>\*\?"\|]+(?:\/[^\/:<>\*\?"\|]+)?)[\/\w%-]+)/revisions/(?P<id>[\d]+)' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/templates/lookup`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `slug` | `string` | yes | The slug of the template to get the fallback for |
| `is_custom` | `boolean` | no | Indicates if a template is custom or part of the template hierarchy |
| `template_prefix` | `string` | no | The template prefix for the created template. This is used to extract the main template type, e.g. in `taxonomy-books` extracts the `taxonomy` |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/templates/lookup' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/themes`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `status` | `array` | no | Limit result set to themes assigned one or more statuses. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/themes' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/themes/(?P<stylesheet>[^\/:<>\*\?"\|]+(?:\/[^\/:<>\*\?"\|]+)?)`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `stylesheet` | `string` | no | The theme's stylesheet. This uniquely identifies the theme. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/themes/(?P<stylesheet>[^\/:<>\*\?"\|]+(?:\/[^\/:<>\*\?"\|]+)?)' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/types`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/types' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/types/(?P<type>[\w-]+)`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `type` | `string` | no | An alphanumeric identifier for the post type. |
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/types/(?P<type>[\w-]+)' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/users`

**Methods**: `GET, POST`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |
| `page` | `integer` | no | Current page of the collection. |
| `per_page` | `integer` | no | Maximum number of items to be returned in result set. |
| `search` | `string` | no | Limit results to those matching a string. |
| `exclude` | `array` | no | Ensure result set excludes specific IDs. |
| `include` | `array` | no | Limit result set to specific IDs. |
| `offset` | `integer` | no | Offset the result set by a specific number of items. |
| `order` | `string` | no | Order sort attribute ascending or descending. |
| `orderby` | `string` | no | Sort collection by user attribute. |
| `slug` | `array` | no | Limit result set to users with one or more specific slugs. |
| `roles` | `array` | no | Limit result set to users matching at least one specific role provided. Accepts csv list or single role. |
| `capabilities` | `array` | no | Limit result set to users matching at least one specific capability provided. Accepts csv list or single capability. |
| `who` | `string` | no | Limit result set to users who are considered authors. |
| `has_published_posts` | `boolean / array` | no | Limit result set to users who have published posts. |
| `search_columns` | `array` | no | Array of column names to be searched. |

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `username` | `string` | yes | Login name for the user. |
| `name` | `string` | no | Display name for the user. |
| `first_name` | `string` | no | First name for the user. |
| `last_name` | `string` | no | Last name for the user. |
| `email` | `string` | yes | The email address for the user. |
| `url` | `string` | no | URL of the user. |
| `description` | `string` | no | Description of the user. |
| `locale` | `string` | no | Locale for the user. |
| `nickname` | `string` | no | The nickname for the user. |
| `slug` | `string` | no | An alphanumeric identifier for the user. |
| `roles` | `array` | no | Roles assigned to the user. |
| `password` | `string` | yes | Password for the user (never included). |
| `meta` | `object` | no | Meta fields. |
| `profile_fields` | `object` | no | Custom user profile fields stored as JSON |
| `social` | `object` | no | User social meta URLs |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/users' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/users/(?P<id>[\d]+)`

**Methods**: `DELETE, GET, PATCH, POST, PUT`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `integer` | no | Unique identifier for the user. |
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |

### Args for methods: `POST, PUT, PATCH`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `integer` | no | Unique identifier for the user. |
| `username` | `string` | no | Login name for the user. |
| `name` | `string` | no | Display name for the user. |
| `first_name` | `string` | no | First name for the user. |
| `last_name` | `string` | no | Last name for the user. |
| `email` | `string` | no | The email address for the user. |
| `url` | `string` | no | URL of the user. |
| `description` | `string` | no | Description of the user. |
| `locale` | `string` | no | Locale for the user. |
| `nickname` | `string` | no | The nickname for the user. |
| `slug` | `string` | no | An alphanumeric identifier for the user. |
| `roles` | `array` | no | Roles assigned to the user. |
| `password` | `string` | no | Password for the user (never included). |
| `meta` | `object` | no | Meta fields. |
| `profile_fields` | `object` | no | Custom user profile fields stored as JSON |
| `social` | `object` | no | User social meta URLs |

### Args for methods: `DELETE`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `integer` | no | Unique identifier for the user. |
| `force` | `boolean` | no | Required to be true, as users do not support trashing. |
| `reassign` | `integer` | yes | Reassign the deleted user's posts and links to this user ID. |

### Example
```bash
curl -X DELETE \
  'https://techoblivion.in/wp-json/wp/v2/users/(?P<id>[\d]+)' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/users/(?P<user_id>(?:[\d]+|me))/application-passwords`

**Methods**: `DELETE, GET, POST`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `app_id` | `string` | no | A UUID provided by the application to uniquely identify it. It is recommended to use an UUID v5 with the URL or DNS namespace. |
| `name` | `string` | yes | The name of the application password. |

### Example
```bash
curl -X DELETE \
  'https://techoblivion.in/wp-json/wp/v2/users/(?P<user_id>(?:[\d]+|me))/application-passwords' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/users/(?P<user_id>(?:[\d]+|me))/application-passwords/(?P<uuid>[\w\-]+)`

**Methods**: `DELETE, GET, PATCH, POST, PUT`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |

### Args for methods: `POST, PUT, PATCH`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `app_id` | `string` | no | A UUID provided by the application to uniquely identify it. It is recommended to use an UUID v5 with the URL or DNS namespace. |
| `name` | `string` | no | The name of the application password. |

### Example
```bash
curl -X DELETE \
  'https://techoblivion.in/wp-json/wp/v2/users/(?P<user_id>(?:[\d]+|me))/application-passwords/(?P<uuid>[\w\-]+)' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/users/(?P<user_id>(?:[\d]+|me))/application-passwords/introspect`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/users/(?P<user_id>(?:[\d]+|me))/application-passwords/introspect' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/users/me`

**Methods**: `DELETE, GET, PATCH, POST, PUT`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |

### Args for methods: `POST, PUT, PATCH`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `username` | `string` | no | Login name for the user. |
| `name` | `string` | no | Display name for the user. |
| `first_name` | `string` | no | First name for the user. |
| `last_name` | `string` | no | Last name for the user. |
| `email` | `string` | no | The email address for the user. |
| `url` | `string` | no | URL of the user. |
| `description` | `string` | no | Description of the user. |
| `locale` | `string` | no | Locale for the user. |
| `nickname` | `string` | no | The nickname for the user. |
| `slug` | `string` | no | An alphanumeric identifier for the user. |
| `roles` | `array` | no | Roles assigned to the user. |
| `password` | `string` | no | Password for the user (never included). |
| `meta` | `object` | no | Meta fields. |
| `profile_fields` | `object` | no | Custom user profile fields stored as JSON |
| `social` | `object` | no | User social meta URLs |

### Args for methods: `DELETE`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `force` | `boolean` | no | Required to be true, as users do not support trashing. |
| `reassign` | `integer` | yes | Reassign the deleted user's posts and links to this user ID. |

### Example
```bash
curl -X DELETE \
  'https://techoblivion.in/wp-json/wp/v2/users/me' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/widget-types`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/widget-types' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/widget-types/(?P<id>[a-zA-Z0-9_-]+)`

**Methods**: `GET`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `string` | no | The widget type id. |
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/widget-types/(?P<id>[a-zA-Z0-9_-]+)' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/widget-types/(?P<id>[a-zA-Z0-9_-]+)/encode`

**Methods**: `POST`

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `string` | yes | The widget type id. |
| `instance` | `object` | no | Current instance settings of the widget. |
| `form_data` | `string` | no | Serialized widget form data to encode into instance settings. |

### Example
```bash
curl -X POST \
  'https://techoblivion.in/wp-json/wp/v2/widget-types/(?P<id>[a-zA-Z0-9_-]+)/encode' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/widget-types/(?P<id>[a-zA-Z0-9_-]+)/render`

**Methods**: `POST`

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `string` | yes | The widget type id. |
| `instance` | `object` | no | Current instance settings of the widget. |

### Example
```bash
curl -X POST \
  'https://techoblivion.in/wp-json/wp/v2/widget-types/(?P<id>[a-zA-Z0-9_-]+)/render' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/widgets`

**Methods**: `GET, POST`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |
| `sidebar` | `string` | no | The sidebar to return widgets for. |

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `string` | no | Unique identifier for the widget. |
| `id_base` | `string` | no | The type of the widget. Corresponds to ID in widget-types endpoint. |
| `sidebar` | `string` | yes | The sidebar the widget belongs to. |
| `instance` | `object` | no | Instance settings of the widget, if supported. |
| `form_data` | `string` | no | URL-encoded form data from the widget admin form. Used to update a widget that does not support instance. Write only. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/widgets' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/widgets/(?P<id>[\w\-]+)`

**Methods**: `DELETE, GET, PATCH, POST, PUT`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |

### Args for methods: `POST, PUT, PATCH`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `string` | no | Unique identifier for the widget. |
| `id_base` | `string` | no | The type of the widget. Corresponds to ID in widget-types endpoint. |
| `sidebar` | `string` | no | The sidebar the widget belongs to. |
| `instance` | `object` | no | Instance settings of the widget, if supported. |
| `form_data` | `string` | no | URL-encoded form data from the widget admin form. Used to update a widget that does not support instance. Write only. |

### Args for methods: `DELETE`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `force` | `boolean` | no | Whether to force removal of the widget, or move it to the inactive sidebar. |

### Example
```bash
curl -X DELETE \
  'https://techoblivion.in/wp-json/wp/v2/widgets/(?P<id>[\w\-]+)' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/wp_pattern_category`

**Methods**: `GET, POST`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |
| `page` | `integer` | no | Current page of the collection. |
| `per_page` | `integer` | no | Maximum number of items to be returned in result set. |
| `search` | `string` | no | Limit results to those matching a string. |
| `exclude` | `array` | no | Ensure result set excludes specific IDs. |
| `include` | `array` | no | Limit result set to specific IDs. |
| `offset` | `integer` | no | Offset the result set by a specific number of items. |
| `order` | `string` | no | Order sort attribute ascending or descending. |
| `orderby` | `string` | no | Sort collection by term attribute. |
| `hide_empty` | `boolean` | no | Whether to hide terms not assigned to any posts. |
| `post` | `integer` | no | Limit result set to terms assigned to a specific post. |
| `slug` | `array` | no | Limit result set to terms with one or more specific slugs. |

### Args for methods: `POST`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `description` | `string` | no | HTML description of the term. |
| `name` | `string` | yes | HTML title for the term. |
| `slug` | `string` | no | An alphanumeric identifier for the term unique to its type. |
| `meta` | `object` | no | Meta fields. |

### Example
```bash
curl -X GET \
  'https://techoblivion.in/wp-json/wp/v2/wp_pattern_category' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---

## `/wp/v2/wp_pattern_category/(?P<id>[\d]+)`

**Methods**: `DELETE, GET, PATCH, POST, PUT`

### Args for methods: `GET`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `integer` | no | Unique identifier for the term. |
| `context` | `string` | no | Scope under which the request is made; determines fields present in response. |

### Args for methods: `POST, PUT, PATCH`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `integer` | no | Unique identifier for the term. |
| `description` | `string` | no | HTML description of the term. |
| `name` | `string` | no | HTML title for the term. |
| `slug` | `string` | no | An alphanumeric identifier for the term unique to its type. |
| `meta` | `object` | no | Meta fields. |

### Args for methods: `DELETE`
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `integer` | no | Unique identifier for the term. |
| `force` | `boolean` | no | Required to be true, as terms do not support trashing. |

### Example
```bash
curl -X DELETE \
  'https://techoblivion.in/wp-json/wp/v2/wp_pattern_category/(?P<id>[\d]+)' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"example":"payload-if-needed"}'
```

---
