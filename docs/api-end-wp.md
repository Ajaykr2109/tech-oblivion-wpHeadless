# WordPress REST API Endpoints (namespaced)

A readable report grouped by namespace with per-route endpoint summaries. Full JSON is available at `/home/ajay/tmp/wp_endpoints.json`.

- Generated at: 2025-08-31T04:36:35.990282Z
- Site URL: http://techoblivion.in
- Home URL: https://techoblivion.in/
- Namespaces: 14 (listed below)
- Total routes: 256

## Summary by namespace

- oembed/1.0: 3 routes
- fe-analytics/v1: 9 routes
- fe-auth/v1: 8 routes
- jwt-auth/v1: 11 routes
- yoast/v1: 48 routes
- to/v1: 2 routes
- wordpress-popular-posts/v1: 5 routes
- wordpress-popular-posts/v2: 3 routes
- google-site-kit/v1: 49 routes
- wp/v2: 104 routes
- wp-site-health/v1: 8 routes
- wp-block-editor/v1: 4 routes
- batch/v1: 1 routes
- root: 1 routes

## Namespace: oembed/1.0 (3 routes)

### /oembed/1.0

- Endpoints: 1
- Methods (any): GET
- Args (any): context, namespace
  - Endpoint 1:
    - Methods: GET
    - Args: namespace, context
    - Callback: `WP_REST_Server::get_namespace_index`

### /oembed/1.0/embed

- Endpoints: 1
- Methods (any): GET
- Args (any): format, maxwidth, url
  - Endpoint 1:
    - Methods: GET
    - Args: url, format, maxwidth
    - Callback: `WP_oEmbed_Controller::get_item`

### /oembed/1.0/proxy

- Endpoints: 1
- Methods (any): GET
- Args (any): discover, format, maxheight, maxwidth, url
  - Endpoint 1:
    - Methods: GET
    - Args: url, format, maxwidth, maxheight, discover
    - Callback: `WP_oEmbed_Controller::get_proxy_item`

## Namespace: fe-analytics/v1 (9 routes)

### /fe-analytics/v1

- Endpoints: 1
- Methods (any): GET
- Args (any): context, namespace
  - Endpoint 1:
    - Methods: GET
    - Args: namespace, context
    - Callback: `WP_REST_Server::get_namespace_index`

### /fe-analytics/v1/check

- Endpoints: 1
- Methods (any): GET
  - Endpoint 1:
    - Methods: GET
    - Callback: `callable`

### /fe-analytics/v1/countries

- Endpoints: 1
- Methods (any): GET
  - Endpoint 1:
    - Methods: GET
    - Callback: `callable`

### /fe-analytics/v1/devices

- Endpoints: 1
- Methods (any): GET
  - Endpoint 1:
    - Methods: GET
    - Callback: `callable`

### /fe-analytics/v1/referers

- Endpoints: 1
- Methods (any): GET
  - Endpoint 1:
    - Methods: GET
    - Callback: `callable`

### /fe-analytics/v1/sessions

- Endpoints: 1
- Methods (any): GET
  - Endpoint 1:
    - Methods: GET
    - Callback: `callable`

### /fe-analytics/v1/summary

- Endpoints: 1
- Methods (any): GET
  - Endpoint 1:
    - Methods: GET
    - Callback: `callable`

### /fe-analytics/v1/top-posts

- Endpoints: 1
- Methods (any): GET
  - Endpoint 1:
    - Methods: GET
    - Callback: `callable`

### /fe-analytics/v1/views

- Endpoints: 1
- Methods (any): GET
  - Endpoint 1:
    - Methods: GET
    - Callback: `callable`

## Namespace: fe-auth/v1 (8 routes)

### /fe-auth/v1

- Endpoints: 1
- Methods (any): GET
- Args (any): context, namespace
  - Endpoint 1:
    - Methods: GET
    - Args: namespace, context
    - Callback: `WP_REST_Server::get_namespace_index`

### /fe-auth/v1/bookmarks

- Endpoints: 1
- Methods (any): GET
  - Endpoint 1:
    - Methods: GET
    - Callback: `callable`

### /fe-auth/v1/bookmarks/check

- Endpoints: 1
- Methods (any): GET
  - Endpoint 1:
    - Methods: GET
    - Callback: `callable`

### /fe-auth/v1/bookmarks/toggle

- Endpoints: 1
- Methods (any): POST
  - Endpoint 1:
    - Methods: POST
    - Callback: `callable`

### /fe-auth/v1/ping

- Endpoints: 1
- Methods (any): GET
  - Endpoint 1:
    - Methods: GET
    - Callback: `callable`

### /fe-auth/v1/proxy

- Endpoints: 1
- Methods (any): DELETE, GET, PATCH, POST, PUT
- Args (any): path
  - Endpoint 1:
    - Methods: DELETE, GET, PATCH, POST, PUT
    - Args: path
    - Callback: `callable`

### /fe-auth/v1/public-user/(?P<slug>[a-z0-9_-]+)

- Endpoints: 1
- Methods (any): GET
  - Endpoint 1:
    - Methods: GET
    - Callback: `callable`

### /fe-auth/v1/track-view

- Endpoints: 1
- Methods (any): POST
- Args (any): post_id
  - Endpoint 1:
    - Methods: POST
    - Args: post_id
    - Callback: `callable`

## Namespace: jwt-auth/v1 (11 routes)

### /jwt-auth/v1

- Endpoints: 1
- Methods (any): GET
- Args (any): context, namespace
  - Endpoint 1:
    - Methods: GET
    - Args: namespace, context
    - Callback: `WP_REST_Server::get_namespace_index`

### /jwt-auth/v1/admin/dashboard

- Endpoints: 1
- Methods (any): GET
  - Endpoint 1:
    - Methods: GET
    - Callback: `Jwt_Auth_Admin::get_dashboard_data`

### /jwt-auth/v1/admin/notices/dismiss

- Endpoints: 1
- Methods (any): POST
- Args (any): notice_id
  - Endpoint 1:
    - Methods: POST
    - Args: notice_id
    - Callback: `Jwt_Auth_Admin::handle_notice_dismissal`

### /jwt-auth/v1/admin/settings

- Endpoints: 1
- Methods (any): GET, POST
  - Endpoint 1:
    - Methods: GET, POST
    - Callback: `Jwt_Auth_Admin::handle_settings`

### /jwt-auth/v1/admin/status

- Endpoints: 1
- Methods (any): GET
  - Endpoint 1:
    - Methods: GET
    - Callback: `Jwt_Auth_Admin::get_configuration_status`

### /jwt-auth/v1/admin/survey

- Endpoints: 1
- Methods (any): POST
  - Endpoint 1:
    - Methods: POST
    - Callback: `Jwt_Auth_Admin::handle_survey_submission`

### /jwt-auth/v1/admin/survey/complete

- Endpoints: 1
- Methods (any): POST
  - Endpoint 1:
    - Methods: POST
    - Callback: `Jwt_Auth_Admin::mark_survey_completed`

### /jwt-auth/v1/admin/survey/dismissal

- Endpoints: 1
- Methods (any): GET, POST
  - Endpoint 1:
    - Methods: GET, POST
    - Callback: `Jwt_Auth_Admin::handle_survey_dismissal`

### /jwt-auth/v1/admin/survey/status

- Endpoints: 1
- Methods (any): GET
  - Endpoint 1:
    - Methods: GET
    - Callback: `Jwt_Auth_Admin::get_survey_status`

### /jwt-auth/v1/token

- Endpoints: 1
- Methods (any): POST
  - Endpoint 1:
    - Methods: POST
    - Callback: `Jwt_Auth_Public::generate_token`

### /jwt-auth/v1/token/validate

- Endpoints: 1
- Methods (any): POST
  - Endpoint 1:
    - Methods: POST
    - Callback: `Jwt_Auth_Public::validate_token`

## Namespace: yoast/v1 (48 routes)

### /yoast/v1

- Endpoints: 1
- Methods (any): GET
- Args (any): context, namespace
  - Endpoint 1:
    - Methods: GET
    - Args: namespace, context
    - Callback: `WP_REST_Server::get_namespace_index`

### /yoast/v1/ai/free_sparks

- Endpoints: 1
- Methods (any): POST
  - Endpoint 1:
    - Methods: POST
    - Callback: `Yoast\WP\SEO\AI_Free_Sparks\User_Interface\Free_Sparks_Route::start`

### /yoast/v1/ai_generator/bust_subscription_cache

- Endpoints: 1
- Methods (any): POST
  - Endpoint 1:
    - Methods: POST
    - Callback: `Yoast\WP\SEO\AI_Generator\User_Interface\Bust_Subscription_Cache_Route::bust_subscription_cache`

### /yoast/v1/ai_generator/callback

- Endpoints: 1
- Methods (any): POST
- Args (any): access_jwt, code_challenge, refresh_jwt, user_id
  - Endpoint 1:
    - Methods: POST
    - Args: access_jwt, refresh_jwt, code_challenge, user_id
    - Callback: `Yoast\WP\SEO\AI_Authorization\User_Interface\Callback_Route::callback`

### /yoast/v1/ai_generator/consent

- Endpoints: 1
- Methods (any): POST
- Args (any): consent
  - Endpoint 1:
    - Methods: POST
    - Args: consent
    - Callback: `Yoast\WP\SEO\AI_Consent\User_Interface\Consent_Route::consent`

### /yoast/v1/ai_generator/get_suggestions

- Endpoints: 1
- Methods (any): POST
- Args (any): editor, focus_keyphrase, language, platform, prompt_content, type
  - Endpoint 1:
    - Methods: POST
    - Args: type, prompt_content, focus_keyphrase, language, platform, editor
    - Callback: `Yoast\WP\SEO\AI_Generator\User_Interface\Get_Suggestions_Route::get_suggestions`

### /yoast/v1/ai_generator/get_usage

- Endpoints: 1
- Methods (any): POST
- Args (any): is_woo_product_entity
  - Endpoint 1:
    - Methods: POST
    - Args: is_woo_product_entity
    - Callback: `Yoast\WP\SEO\AI_Generator\User_Interface\Get_Usage_Route::get_usage`

### /yoast/v1/ai_generator/refresh_callback

- Endpoints: 1
- Methods (any): POST
- Args (any): access_jwt, code_challenge, refresh_jwt, user_id
  - Endpoint 1:
    - Methods: POST
    - Args: access_jwt, refresh_jwt, code_challenge, user_id
    - Callback: `Yoast\WP\SEO\AI_Authorization\User_Interface\Refresh_Callback_Route::callback`

### /yoast/v1/alerts/dismiss

- Endpoints: 1
- Methods (any): POST
- Args (any): key
  - Endpoint 1:
    - Methods: POST
    - Args: key
    - Callback: `Yoast\WP\SEO\Routes\Alert_Dismissal_Route::dismiss`

### /yoast/v1/available_posts

- Endpoints: 1
- Methods (any): GET
- Args (any): postType, search
  - Endpoint 1:
    - Methods: GET
    - Args: search, postType
    - Callback: `Yoast\WP\SEO\Llms_Txt\User_Interface\Available_Posts_Route::get_available_posts`

### /yoast/v1/configuration/check_capability

- Endpoints: 1
- Methods (any): GET
- Args (any): user_id
  - Endpoint 1:
    - Methods: GET
    - Args: user_id
    - Callback: `Yoast\WP\SEO\Routes\First_Time_Configuration_Route::check_capability`

### /yoast/v1/configuration/enable_tracking

- Endpoints: 1
- Methods (any): POST
- Args (any): tracking
  - Endpoint 1:
    - Methods: POST
    - Args: tracking
    - Callback: `Yoast\WP\SEO\Routes\First_Time_Configuration_Route::set_enable_tracking`

### /yoast/v1/configuration/get_configuration_state

- Endpoints: 1
- Methods (any): GET
  - Endpoint 1:
    - Methods: GET
    - Callback: `Yoast\WP\SEO\Routes\First_Time_Configuration_Route::get_configuration_state`

### /yoast/v1/configuration/save_configuration_state

- Endpoints: 1
- Methods (any): POST
- Args (any): finishedSteps
  - Endpoint 1:
    - Methods: POST
    - Args: finishedSteps
    - Callback: `Yoast\WP\SEO\Routes\First_Time_Configuration_Route::save_configuration_state`

### /yoast/v1/configuration/site_representation

- Endpoints: 1
- Methods (any): POST
- Args (any): company_logo, company_logo_id, company_name, company_or_person, company_or_person_user_id, description, person_logo, person_logo_id
  - Endpoint 1:
    - Methods: POST
    - Args: company_or_person, company_name, company_logo, company_logo_id, person_logo, person_logo_id, company_or_person_user_id, description
    - Callback: `Yoast\WP\SEO\Routes\First_Time_Configuration_Route::set_site_representation`

### /yoast/v1/configuration/social_profiles

- Endpoints: 1
- Methods (any): POST
- Args (any): facebook_site, other_social_urls, twitter_site
  - Endpoint 1:
    - Methods: POST
    - Args: facebook_site, twitter_site, other_social_urls
    - Callback: `Yoast\WP\SEO\Routes\First_Time_Configuration_Route::set_social_profiles`

### /yoast/v1/file_size

- Endpoints: 1
- Methods (any): GET
- Args (any): url
  - Endpoint 1:
    - Methods: GET
    - Args: url
    - Callback: `WPSEO_File_Size_Service::get`

### /yoast/v1/get_head

- Endpoints: 1
- Methods (any): GET
- Args (any): url
  - Endpoint 1:
    - Methods: GET
    - Args: url
    - Callback: `Yoast\WP\SEO\Routes\Indexables_Head_Route::get_head`

### /yoast/v1/import/(?P<plugin>[\w-]+)/(?P<type>[\w-]+)

- Endpoints: 1
- Methods (any): POST
  - Endpoint 1:
    - Methods: POST
    - Callback: `Yoast\WP\SEO\Routes\Importing_Route::execute`

### /yoast/v1/indexing/complete

- Endpoints: 1
- Methods (any): POST
  - Endpoint 1:
    - Methods: POST
    - Callback: `Yoast\WP\SEO\Routes\Indexing_Route::complete`

### /yoast/v1/indexing/general

- Endpoints: 1
- Methods (any): POST
  - Endpoint 1:
    - Methods: POST
    - Callback: `Yoast\WP\SEO\Routes\Indexing_Route::index_general`

### /yoast/v1/indexing/indexables-complete

- Endpoints: 1
- Methods (any): POST
  - Endpoint 1:
    - Methods: POST
    - Callback: `Yoast\WP\SEO\Routes\Indexing_Route::indexables_complete`

### /yoast/v1/indexing/post-type-archives

- Endpoints: 1
- Methods (any): POST
  - Endpoint 1:
    - Methods: POST
    - Callback: `Yoast\WP\SEO\Routes\Indexing_Route::index_post_type_archives`

### /yoast/v1/indexing/posts

- Endpoints: 1
- Methods (any): POST
  - Endpoint 1:
    - Methods: POST
    - Callback: `Yoast\WP\SEO\Routes\Indexing_Route::index_posts`

### /yoast/v1/indexing/prepare

- Endpoints: 1
- Methods (any): POST
  - Endpoint 1:
    - Methods: POST
    - Callback: `Yoast\WP\SEO\Routes\Indexing_Route::prepare`

### /yoast/v1/indexing/terms

- Endpoints: 1
- Methods (any): POST
  - Endpoint 1:
    - Methods: POST
    - Callback: `Yoast\WP\SEO\Routes\Indexing_Route::index_terms`

### /yoast/v1/integrations/set_active

- Endpoints: 1
- Methods (any): POST
- Args (any): active, integration
  - Endpoint 1:
    - Methods: POST
    - Args: active, integration
    - Callback: `Yoast\WP\SEO\Routes\Integrations_Route::set_integration_active`

### /yoast/v1/introductions/(?P<introduction_id>[\w-]+)/seen

- Endpoints: 1
- Methods (any): POST
- Args (any): introduction_id, is_seen
  - Endpoint 1:
    - Methods: POST
    - Args: introduction_id, is_seen
    - Callback: `Yoast\WP\SEO\Introductions\User_Interface\Introductions_Seen_Route::set_introduction_seen`

### /yoast/v1/link-indexing/posts

- Endpoints: 1
- Methods (any): POST
  - Endpoint 1:
    - Methods: POST
    - Callback: `Yoast\WP\SEO\Routes\Indexing_Route::index_post_links`

### /yoast/v1/link-indexing/terms

- Endpoints: 1
- Methods (any): POST
  - Endpoint 1:
    - Methods: POST
    - Callback: `Yoast\WP\SEO\Routes\Indexing_Route::index_term_links`

### /yoast/v1/meta/search

- Endpoints: 1
- Methods (any): GET
  - Endpoint 1:
    - Methods: GET
    - Callback: `Yoast\WP\SEO\Routes\Meta_Search_Route::search_meta`

### /yoast/v1/new-content-type-visibility/dismiss-post-type

- Endpoints: 1
- Methods (any): POST
- Args (any): postTypeName
  - Endpoint 1:
    - Methods: POST
    - Args: postTypeName
    - Callback: `Yoast\WP\SEO\Content_Type_Visibility\User_Interface\Content_Type_Visibility_Dismiss_New_Route::post_type_dismiss_callback`

### /yoast/v1/new-content-type-visibility/dismiss-taxonomy

- Endpoints: 1
- Methods (any): POST
- Args (any): taxonomyName
  - Endpoint 1:
    - Methods: POST
    - Args: taxonomyName
    - Callback: `Yoast\WP\SEO\Content_Type_Visibility\User_Interface\Content_Type_Visibility_Dismiss_New_Route::taxonomy_dismiss_callback`

### /yoast/v1/readability_scores

- Endpoints: 1
- Methods (any): GET
- Args (any): contentType, taxonomy, term, troubleshooting
  - Endpoint 1:
    - Methods: GET
    - Args: contentType, taxonomy, term, troubleshooting
    - Callback: `Yoast\WP\SEO\Dashboard\User_Interface\Scores\Readability_Scores_Route::get_scores`

### /yoast/v1/semrush/authenticate

- Endpoints: 1
- Methods (any): POST
- Args (any): code
  - Endpoint 1:
    - Methods: POST
    - Args: code
    - Callback: `Yoast\WP\SEO\Routes\SEMrush_Route::authenticate`

### /yoast/v1/semrush/country_code

- Endpoints: 1
- Methods (any): POST
- Args (any): country_code
  - Endpoint 1:
    - Methods: POST
    - Args: country_code
    - Callback: `Yoast\WP\SEO\Routes\SEMrush_Route::set_country_code_option`

### /yoast/v1/semrush/related_keyphrases

- Endpoints: 1
- Methods (any): GET
- Args (any): country_code, keyphrase
  - Endpoint 1:
    - Methods: GET
    - Args: keyphrase, country_code
    - Callback: `Yoast\WP\SEO\Routes\SEMrush_Route::get_related_keyphrases`

### /yoast/v1/seo_scores

- Endpoints: 1
- Methods (any): GET
- Args (any): contentType, taxonomy, term, troubleshooting
  - Endpoint 1:
    - Methods: GET
    - Args: contentType, taxonomy, term, troubleshooting
    - Callback: `Yoast\WP\SEO\Dashboard\User_Interface\Scores\SEO_Scores_Route::get_scores`

### /yoast/v1/statistics

- Endpoints: 1
- Methods (any): GET
  - Endpoint 1:
    - Methods: GET
    - Callback: `WPSEO_Statistics_Service::get_statistics`

### /yoast/v1/wincher/account/limit

- Endpoints: 1
- Methods (any): GET
  - Endpoint 1:
    - Methods: GET
    - Callback: `Yoast\WP\SEO\Routes\Wincher_Route::check_limit`

### /yoast/v1/wincher/account/upgrade-campaign

- Endpoints: 1
- Methods (any): GET
  - Endpoint 1:
    - Methods: GET
    - Callback: `Yoast\WP\SEO\Routes\Wincher_Route::get_upgrade_campaign`

### /yoast/v1/wincher/authenticate

- Endpoints: 1
- Methods (any): POST
- Args (any): code, websiteId
  - Endpoint 1:
    - Methods: POST
    - Args: code, websiteId
    - Callback: `Yoast\WP\SEO\Routes\Wincher_Route::authenticate`

### /yoast/v1/wincher/authorization-url

- Endpoints: 1
- Methods (any): GET
  - Endpoint 1:
    - Methods: GET
    - Callback: `Yoast\WP\SEO\Routes\Wincher_Route::get_authorization_url`

### /yoast/v1/wincher/keyphrases

- Endpoints: 1
- Methods (any): POST
- Args (any): keyphrases, permalink, startAt
  - Endpoint 1:
    - Methods: POST
    - Args: keyphrases, permalink, startAt
    - Callback: `Yoast\WP\SEO\Routes\Wincher_Route::get_tracked_keyphrases`

### /yoast/v1/wincher/keyphrases/track

- Endpoints: 1
- Methods (any): POST
- Args (any): keyphrases
  - Endpoint 1:
    - Methods: POST
    - Args: keyphrases
    - Callback: `Yoast\WP\SEO\Routes\Wincher_Route::track_keyphrases`

### /yoast/v1/wincher/keyphrases/untrack

- Endpoints: 1
- Methods (any): DELETE
  - Endpoint 1:
    - Methods: DELETE
    - Callback: `Yoast\WP\SEO\Routes\Wincher_Route::untrack_keyphrase`

### /yoast/v1/wistia_embed_permission

- Endpoints: 2
- Methods (any): GET, POST
- Args (any): value
  - Endpoint 1:
    - Methods: GET
    - Callback: `Yoast\WP\SEO\Introductions\User_Interface\Wistia_Embed_Permission_Route::get_wistia_embed_permission`
  - Endpoint 2:
    - Methods: POST
    - Args: value
    - Callback: `Yoast\WP\SEO\Introductions\User_Interface\Wistia_Embed_Permission_Route::set_wistia_embed_permission`

### /yoast/v1/workouts

- Endpoints: 2
- Methods (any): GET, POST
  - Endpoint 1:
    - Methods: GET
    - Callback: `Yoast\WP\SEO\Routes\Workouts_Route::get_workouts`
  - Endpoint 2:
    - Methods: POST
    - Callback: `Yoast\WP\SEO\Routes\Workouts_Route::set_workouts`

## Namespace: to/v1 (2 routes)

### /to/v1

- Endpoints: 1
- Methods (any): GET
- Args (any): context, namespace
  - Endpoint 1:
    - Methods: GET
    - Args: namespace, context
    - Callback: `WP_REST_Server::get_namespace_index`

### /to/v1/search

- Endpoints: 1
- Methods (any): GET
- Args (any): page, per_page, q, types
  - Endpoint 1:
    - Methods: GET
    - Args: q, types, per_page, page
    - Callback: `callable`

## Namespace: wordpress-popular-posts/v1 (5 routes)

### /wordpress-popular-posts/v1

- Endpoints: 1
- Methods (any): GET
- Args (any): context, namespace
  - Endpoint 1:
    - Methods: GET
    - Args: namespace, context
    - Callback: `WP_REST_Server::get_namespace_index`

### /wordpress-popular-posts/v1/popular-posts

- Endpoints: 2
- Methods (any): GET, POST
- Args (any): author, exclude, freshness, id, limit, offset, order_by, pid, post_type, range, sampling, sampling_rate, taxonomy, term_id, time_quantity, time_unit, wpp_id
  - Endpoint 1:
    - Methods: GET
    - Args: post_type, limit, freshness, offset, order_by, range, time_unit, time_quantity, pid, exclude, taxonomy, term_id, author
    - Callback: `WordPressPopularPosts\Rest\PostsEndpoint::get_items`
  - Endpoint 2:
    - Methods: POST
    - Args: wpp_id, id, sampling, sampling_rate
    - Callback: `WordPressPopularPosts\Rest\ViewLoggerEndpoint::update_views_count`

### /wordpress-popular-posts/v1/taxonomies

- Endpoints: 1
- Methods (any): GET
  - Endpoint 1:
    - Methods: GET
    - Callback: `WordPressPopularPosts\Rest\TaxonomiesEndpoint::get_items`

### /wordpress-popular-posts/v1/themes

- Endpoints: 1
- Methods (any): GET
  - Endpoint 1:
    - Methods: GET
    - Callback: `WordPressPopularPosts\Rest\ThemesEndpoint::get_items`

### /wordpress-popular-posts/v1/thumbnails

- Endpoints: 1
- Methods (any): GET
  - Endpoint 1:
    - Methods: GET
    - Callback: `WordPressPopularPosts\Rest\ThumbnailsEndpoint::get_items`

## Namespace: wordpress-popular-posts/v2 (3 routes)

### /wordpress-popular-posts/v2

- Endpoints: 1
- Methods (any): GET
- Args (any): context, namespace
  - Endpoint 1:
    - Methods: GET
    - Args: namespace, context
    - Callback: `WP_REST_Server::get_namespace_index`

### /wordpress-popular-posts/v2/views/(?P<id>[\d]+)

- Endpoints: 2
- Methods (any): GET, POST
- Args (any): id, include_views_text, range, sampling, sampling_rate, time_quantity, time_unit, wpp_id
  - Endpoint 1:
    - Methods: GET
    - Args: id, range, time_unit, time_quantity, include_views_text
    - Callback: `WordPressPopularPosts\Rest\ViewLoggerEndpoint::get_views_count`
  - Endpoint 2:
    - Methods: POST
    - Args: wpp_id, id, sampling, sampling_rate
    - Callback: `WordPressPopularPosts\Rest\ViewLoggerEndpoint::update_views_count`

### /wordpress-popular-posts/v2/widget

- Endpoints: 1
- Methods (any): POST
- Args (any): is_single, lang
  - Endpoint 1:
    - Methods: POST
    - Args: is_single, lang
    - Callback: `WordPressPopularPosts\Rest\WidgetEndpoint::get_widget_block`

## Namespace: google-site-kit/v1 (49 routes)

### /google-site-kit/v1

- Endpoints: 1
- Methods (any): GET
- Args (any): context, namespace
  - Endpoint 1:
    - Methods: GET
    - Args: namespace, context
    - Callback: `WP_REST_Server::get_namespace_index`

### /google-site-kit/v1/core/modules/data/activation

- Endpoints: 1
- Methods (any): PATCH, POST, PUT
- Args (any): data
  - Endpoint 1:
    - Methods: PATCH, POST, PUT
    - Args: data
    - Callback: `callable`

### /google-site-kit/v1/core/modules/data/check-access

- Endpoints: 1
- Methods (any): PATCH, POST, PUT
- Args (any): slug
  - Endpoint 1:
    - Methods: PATCH, POST, PUT
    - Args: slug
    - Callback: `callable`

### /google-site-kit/v1/core/modules/data/info

- Endpoints: 1
- Methods (any): GET
- Args (any): slug
  - Endpoint 1:
    - Methods: GET
    - Args: slug
    - Callback: `callable`

### /google-site-kit/v1/core/modules/data/list

- Endpoints: 1
- Methods (any): GET
  - Endpoint 1:
    - Methods: GET
    - Callback: `callable`

### /google-site-kit/v1/core/modules/data/recover-modules

- Endpoints: 1
- Methods (any): PATCH, POST, PUT
  - Endpoint 1:
    - Methods: PATCH, POST, PUT
    - Callback: `callable`

### /google-site-kit/v1/core/modules/data/sharing-settings

- Endpoints: 2
- Methods (any): DELETE, PATCH, POST, PUT
- Args (any): data
  - Endpoint 1:
    - Methods: PATCH, POST, PUT
    - Args: data
    - Callback: `callable`
  - Endpoint 2:
    - Methods: DELETE
    - Callback: `callable`

### /google-site-kit/v1/core/search/data/entity-search

- Endpoints: 1
- Methods (any): GET
- Args (any): query
  - Endpoint 1:
    - Methods: GET
    - Args: query
    - Callback: `callable`

### /google-site-kit/v1/core/site/data/admin-bar-settings

- Endpoints: 2
- Methods (any): GET, POST
- Args (any): data
  - Endpoint 1:
    - Methods: GET
    - Callback: `callable`
  - Endpoint 2:
    - Methods: POST
    - Args: data
    - Callback: `callable`

### /google-site-kit/v1/core/site/data/ads-measurement-status

- Endpoints: 1
- Methods (any): GET
  - Endpoint 1:
    - Methods: GET
    - Callback: `callable`

### /google-site-kit/v1/core/site/data/connection

- Endpoints: 1
- Methods (any): GET
  - Endpoint 1:
    - Methods: GET
    - Callback: `callable`

### /google-site-kit/v1/core/site/data/consent-api-activate

- Endpoints: 1
- Methods (any): PATCH, POST, PUT
  - Endpoint 1:
    - Methods: PATCH, POST, PUT
    - Callback: `callable`

### /google-site-kit/v1/core/site/data/consent-api-info

- Endpoints: 1
- Methods (any): GET
  - Endpoint 1:
    - Methods: GET
    - Callback: `callable`

### /google-site-kit/v1/core/site/data/consent-mode

- Endpoints: 2
- Methods (any): GET, PATCH, POST, PUT
- Args (any): data
  - Endpoint 1:
    - Methods: GET
    - Callback: `callable`
  - Endpoint 2:
    - Methods: PATCH, POST, PUT
    - Args: data
    - Callback: `callable`

### /google-site-kit/v1/core/site/data/conversion-tracking

- Endpoints: 2
- Methods (any): GET, PATCH, POST, PUT
- Args (any): data
  - Endpoint 1:
    - Methods: GET
    - Callback: `callable`
  - Endpoint 2:
    - Methods: PATCH, POST, PUT
    - Args: data
    - Callback: `callable`

### /google-site-kit/v1/core/site/data/developer-plugin

- Endpoints: 1
- Methods (any): GET
  - Endpoint 1:
    - Methods: GET
    - Callback: `callable`

### /google-site-kit/v1/core/site/data/health-checks

- Endpoints: 1
- Methods (any): GET
  - Endpoint 1:
    - Methods: GET
    - Callback: `callable`

### /google-site-kit/v1/core/site/data/mark-notification

- Endpoints: 1
- Methods (any): PATCH, POST, PUT
- Args (any): data
  - Endpoint 1:
    - Methods: PATCH, POST, PUT
    - Args: data
    - Callback: `callable`

### /google-site-kit/v1/core/site/data/notifications

- Endpoints: 1
- Methods (any): GET
  - Endpoint 1:
    - Methods: GET
    - Callback: `callable`

### /google-site-kit/v1/core/site/data/reset

- Endpoints: 1
- Methods (any): PATCH, POST, PUT
  - Endpoint 1:
    - Methods: PATCH, POST, PUT
    - Callback: `callable`

### /google-site-kit/v1/core/site/data/reset-persistent

- Endpoints: 1
- Methods (any): PATCH, POST, PUT
  - Endpoint 1:
    - Methods: PATCH, POST, PUT
    - Callback: `callable`

### /google-site-kit/v1/core/site/data/setup-tag

- Endpoints: 1
- Methods (any): PATCH, POST, PUT
  - Endpoint 1:
    - Methods: PATCH, POST, PUT
    - Callback: `callable`

### /google-site-kit/v1/core/site/data/site-health-tag-placement-test

- Endpoints: 1
- Methods (any): GET
  - Endpoint 1:
    - Methods: GET
    - Callback: `Google\Site_Kit\Core\Site_Health\Tag_Placement::tag_placement_test`

### /google-site-kit/v1/core/user/data/audience-settings

- Endpoints: 2
- Methods (any): GET, PATCH, POST, PUT
- Args (any): data
  - Endpoint 1:
    - Methods: GET
    - Callback: `callable`
  - Endpoint 2:
    - Methods: PATCH, POST, PUT
    - Args: data
    - Callback: `callable`

### /google-site-kit/v1/core/user/data/authentication

- Endpoints: 1
- Methods (any): GET
  - Endpoint 1:
    - Methods: GET
    - Callback: `callable`

### /google-site-kit/v1/core/user/data/conversion-reporting-settings

- Endpoints: 2
- Methods (any): GET, PATCH, POST, PUT
- Args (any): data
  - Endpoint 1:
    - Methods: GET
    - Callback: `callable`
  - Endpoint 2:
    - Methods: PATCH, POST, PUT
    - Args: data
    - Callback: `callable`

### /google-site-kit/v1/core/user/data/disconnect

- Endpoints: 1
- Methods (any): PATCH, POST, PUT
  - Endpoint 1:
    - Methods: PATCH, POST, PUT
    - Callback: `callable`

### /google-site-kit/v1/core/user/data/dismiss-item

- Endpoints: 1
- Methods (any): POST
- Args (any): data
  - Endpoint 1:
    - Methods: POST
    - Args: data
    - Callback: `callable`

### /google-site-kit/v1/core/user/data/dismiss-prompt

- Endpoints: 1
- Methods (any): POST
- Args (any): data
  - Endpoint 1:
    - Methods: POST
    - Args: data
    - Callback: `callable`

### /google-site-kit/v1/core/user/data/dismiss-tour

- Endpoints: 1
- Methods (any): POST
- Args (any): data
  - Endpoint 1:
    - Methods: POST
    - Args: data
    - Callback: `callable`

### /google-site-kit/v1/core/user/data/dismissed-items

- Endpoints: 2
- Methods (any): DELETE, GET
- Args (any): data
  - Endpoint 1:
    - Methods: GET
    - Callback: `callable`
  - Endpoint 2:
    - Methods: DELETE
    - Args: data
    - Callback: `callable`

### /google-site-kit/v1/core/user/data/dismissed-prompts

- Endpoints: 1
- Methods (any): GET
  - Endpoint 1:
    - Methods: GET
    - Callback: `callable`

### /google-site-kit/v1/core/user/data/dismissed-tours

- Endpoints: 1
- Methods (any): GET
  - Endpoint 1:
    - Methods: GET
    - Callback: `callable`

### /google-site-kit/v1/core/user/data/expirable-items

- Endpoints: 1
- Methods (any): GET
  - Endpoint 1:
    - Methods: GET
    - Callback: `callable`

### /google-site-kit/v1/core/user/data/get-token

- Endpoints: 1
- Methods (any): POST
  - Endpoint 1:
    - Methods: POST
    - Callback: `callable`

### /google-site-kit/v1/core/user/data/key-metrics

- Endpoints: 2
- Methods (any): GET, POST
- Args (any): data
  - Endpoint 1:
    - Methods: GET
    - Callback: `callable`
  - Endpoint 2:
    - Methods: POST
    - Args: data
    - Callback: `callable`

### /google-site-kit/v1/core/user/data/nonces

- Endpoints: 1
- Methods (any): GET
  - Endpoint 1:
    - Methods: GET
    - Callback: `callable`

### /google-site-kit/v1/core/user/data/permissions

- Endpoints: 1
- Methods (any): GET
  - Endpoint 1:
    - Methods: GET
    - Callback: `callable`

### /google-site-kit/v1/core/user/data/set-expirable-item-timers

- Endpoints: 1
- Methods (any): POST
- Args (any): data
  - Endpoint 1:
    - Methods: POST
    - Args: data
    - Callback: `callable`

### /google-site-kit/v1/core/user/data/survey

- Endpoints: 1
- Methods (any): GET
  - Endpoint 1:
    - Methods: GET
    - Callback: `callable`

### /google-site-kit/v1/core/user/data/survey-event

- Endpoints: 1
- Methods (any): POST
- Args (any): data
  - Endpoint 1:
    - Methods: POST
    - Args: data
    - Callback: `callable`

### /google-site-kit/v1/core/user/data/survey-timeouts

- Endpoints: 1
- Methods (any): GET
  - Endpoint 1:
    - Methods: GET
    - Callback: `callable`

### /google-site-kit/v1/core/user/data/survey-trigger

- Endpoints: 1
- Methods (any): POST
- Args (any): data
  - Endpoint 1:
    - Methods: POST
    - Args: data
    - Callback: `callable`

### /google-site-kit/v1/core/user/data/tracking

- Endpoints: 2
- Methods (any): GET, POST
- Args (any): data
  - Endpoint 1:
    - Methods: GET
    - Callback: `callable`
  - Endpoint 2:
    - Methods: POST
    - Args: data
    - Callback: `callable`

### /google-site-kit/v1/core/user/data/user-input-settings

- Endpoints: 2
- Methods (any): GET, POST
- Args (any): data
  - Endpoint 1:
    - Methods: GET
    - Callback: `callable`
  - Endpoint 2:
    - Methods: POST
    - Args: data
    - Callback: `callable`

### /google-site-kit/v1/modules/(?P<slug>[a-z0-9\-]+)/data/(?P<datapoint>[a-z\-]+)

- Endpoints: 2
- Methods (any): GET, PATCH, POST, PUT
- Args (any): data, datapoint, slug
  - Endpoint 1:
    - Methods: GET
    - Args: slug, datapoint
    - Callback: `callable`
  - Endpoint 2:
    - Methods: PATCH, POST, PUT
    - Args: slug, datapoint, data
    - Callback: `callable`

### /google-site-kit/v1/modules/(?P<slug>[a-z0-9\-]+)/data/data-available

- Endpoints: 1
- Methods (any): POST
- Args (any): slug
  - Endpoint 1:
    - Methods: POST
    - Args: slug
    - Callback: `callable`

### /google-site-kit/v1/modules/(?P<slug>[a-z0-9\-]+)/data/notifications

- Endpoints: 1
- Methods (any): GET
- Args (any): slug
  - Endpoint 1:
    - Methods: GET
    - Args: slug
    - Callback: `callable`

### /google-site-kit/v1/modules/(?P<slug>[a-z0-9\-]+)/data/settings

- Endpoints: 2
- Methods (any): GET, PATCH, POST, PUT
- Args (any): data, slug
  - Endpoint 1:
    - Methods: GET
    - Args: slug
    - Callback: `callable`
  - Endpoint 2:
    - Methods: PATCH, POST, PUT
    - Args: slug, data
    - Callback: `callable`

## Namespace: wp/v2 (104 routes)

### /wp/v2

- Endpoints: 1
- Methods (any): GET
- Args (any): context, namespace
  - Endpoint 1:
    - Methods: GET
    - Args: namespace, context
    - Callback: `WP_REST_Server::get_namespace_index`

### /wp/v2/block-directory/search

- Endpoints: 1
- Methods (any): GET
- Args (any): context, page, per_page, term
  - Endpoint 1:
    - Methods: GET
    - Args: context, page, per_page, term
    - Callback: `WP_REST_Block_Directory_Controller::get_items`

### /wp/v2/block-patterns/categories

- Endpoints: 1
- Methods (any): GET
  - Endpoint 1:
    - Methods: GET
    - Callback: `WP_REST_Block_Pattern_Categories_Controller::get_items`

### /wp/v2/block-patterns/patterns

- Endpoints: 1
- Methods (any): GET
  - Endpoint 1:
    - Methods: GET
    - Callback: `WP_REST_Block_Patterns_Controller::get_items`

### /wp/v2/block-renderer/(?P<name>[a-z0-9-]+/[a-z0-9-]+)

- Endpoints: 1
- Methods (any): GET, POST
- Args (any): attributes, context, name, post_id
  - Endpoint 1:
    - Methods: GET, POST
    - Args: name, context, attributes, post_id
    - Callback: `WP_REST_Block_Renderer_Controller::get_item`

### /wp/v2/block-types

- Endpoints: 1
- Methods (any): GET
- Args (any): context, namespace
  - Endpoint 1:
    - Methods: GET
    - Args: context, namespace
    - Callback: `WP_REST_Block_Types_Controller::get_items`

### /wp/v2/block-types/(?P<namespace>[a-zA-Z0-9_-]+)

- Endpoints: 1
- Methods (any): GET
- Args (any): context, namespace
  - Endpoint 1:
    - Methods: GET
    - Args: context, namespace
    - Callback: `WP_REST_Block_Types_Controller::get_items`

### /wp/v2/block-types/(?P<namespace>[a-zA-Z0-9_-]+)/(?P<name>[a-zA-Z0-9_-]+)

- Endpoints: 1
- Methods (any): GET
- Args (any): context, name, namespace
  - Endpoint 1:
    - Methods: GET
    - Args: name, namespace, context
    - Callback: `WP_REST_Block_Types_Controller::get_item`

### /wp/v2/blocks

- Endpoints: 2
- Methods (any): GET, POST
- Args (any): after, before, content, context, date, date_gmt, excerpt, exclude, include, meta, modified_after, modified_before, offset, order, orderby, page, password, per_page, search, search_columns, search_semantics, slug, status, tax_relation, template, title, wp_pattern_category, wp_pattern_category_exclude
  - Endpoint 1:
    - Methods: GET
    - Args: context, page, per_page, search, after, modified_after, before, modified_before, exclude, include, search_semantics, offset, order, orderby, search_columns, slug, status, tax_relation, wp_pattern_category, wp_pattern_category_exclude
    - Callback: `WP_REST_Blocks_Controller::get_items`
  - Endpoint 2:
    - Methods: POST
    - Args: date, date_gmt, slug, status, password, title, content, excerpt, meta, template, wp_pattern_category
    - Callback: `WP_REST_Blocks_Controller::create_item`

### /wp/v2/blocks/(?P<id>[\d]+)

- Endpoints: 3
- Methods (any): DELETE, GET, PATCH, POST, PUT
- Args (any): content, context, date, date_gmt, excerpt, excerpt_length, force, id, meta, password, slug, status, template, title, wp_pattern_category
  - Endpoint 1:
    - Methods: GET
    - Args: id, context, excerpt_length, password
    - Callback: `WP_REST_Blocks_Controller::get_item`
  - Endpoint 2:
    - Methods: PATCH, POST, PUT
    - Args: id, date, date_gmt, slug, status, password, title, content, excerpt, meta, template, wp_pattern_category
    - Callback: `WP_REST_Blocks_Controller::update_item`
  - Endpoint 3:
    - Methods: DELETE
    - Args: id, force
    - Callback: `WP_REST_Blocks_Controller::delete_item`

### /wp/v2/blocks/(?P<id>[\d]+)/autosaves

- Endpoints: 2
- Methods (any): GET, POST
- Args (any): content, context, date, date_gmt, excerpt, meta, parent, password, slug, status, template, title, wp_pattern_category
  - Endpoint 1:
    - Methods: GET
    - Args: parent, context
    - Callback: `WP_REST_Autosaves_Controller::get_items`
  - Endpoint 2:
    - Methods: POST
    - Args: parent, date, date_gmt, slug, status, password, title, content, excerpt, meta, template, wp_pattern_category
    - Callback: `WP_REST_Autosaves_Controller::create_item`

### /wp/v2/blocks/(?P<parent>[\d]+)/autosaves/(?P<id>[\d]+)

- Endpoints: 1
- Methods (any): GET
- Args (any): context, id, parent
  - Endpoint 1:
    - Methods: GET
    - Args: parent, id, context
    - Callback: `WP_REST_Autosaves_Controller::get_item`

### /wp/v2/blocks/(?P<parent>[\d]+)/revisions

- Endpoints: 1
- Methods (any): GET
- Args (any): context, exclude, include, offset, order, orderby, page, parent, per_page, search
  - Endpoint 1:
    - Methods: GET
    - Args: parent, context, page, per_page, search, exclude, include, offset, order, orderby
    - Callback: `WP_REST_Revisions_Controller::get_items`

### /wp/v2/blocks/(?P<parent>[\d]+)/revisions/(?P<id>[\d]+)

- Endpoints: 2
- Methods (any): DELETE, GET
- Args (any): context, force, id, parent
  - Endpoint 1:
    - Methods: GET
    - Args: parent, id, context
    - Callback: `WP_REST_Revisions_Controller::get_item`
  - Endpoint 2:
    - Methods: DELETE
    - Args: parent, id, force
    - Callback: `WP_REST_Revisions_Controller::delete_item`

### /wp/v2/categories

- Endpoints: 2
- Methods (any): GET, POST
- Args (any): context, description, exclude, hide_empty, include, meta, name, order, orderby, page, parent, per_page, post, search, slug
  - Endpoint 1:
    - Methods: GET
    - Args: context, page, per_page, search, exclude, include, order, orderby, hide_empty, parent, post, slug
    - Callback: `WP_REST_Terms_Controller::get_items`
  - Endpoint 2:
    - Methods: POST
    - Args: description, name, slug, parent, meta
    - Callback: `WP_REST_Terms_Controller::create_item`

### /wp/v2/categories/(?P<id>[\d]+)

- Endpoints: 3
- Methods (any): DELETE, GET, PATCH, POST, PUT
- Args (any): context, description, force, id, meta, name, parent, slug
  - Endpoint 1:
    - Methods: GET
    - Args: id, context
    - Callback: `WP_REST_Terms_Controller::get_item`
  - Endpoint 2:
    - Methods: PATCH, POST, PUT
    - Args: id, description, name, slug, parent, meta
    - Callback: `WP_REST_Terms_Controller::update_item`
  - Endpoint 3:
    - Methods: DELETE
    - Args: id, force
    - Callback: `WP_REST_Terms_Controller::delete_item`

### /wp/v2/comments

- Endpoints: 2
- Methods (any): GET, POST
- Args (any): after, author, author_email, author_exclude, author_ip, author_name, author_url, author_user_agent, before, content, content_raw, context, date, date_gmt, exclude, include, meta, offset, order, orderby, page, parent, parent_exclude, password, per_page, post, search, status, type
  - Endpoint 1:
    - Methods: GET
    - Args: context, page, per_page, search, after, author, author_exclude, author_email, before, exclude, include, offset, order, orderby, parent, parent_exclude, post, status, type, password
    - Callback: `WP_REST_Comments_Controller::get_items`
  - Endpoint 2:
    - Methods: POST
    - Args: author, author_email, author_ip, author_name, author_url, author_user_agent, content, date, date_gmt, parent, post, status, meta, content_raw
    - Callback: `WP_REST_Comments_Controller::create_item`

### /wp/v2/comments/(?P<id>[\d]+)

- Endpoints: 3
- Methods (any): DELETE, GET, PATCH, POST, PUT
- Args (any): author, author_email, author_ip, author_name, author_url, author_user_agent, content, content_raw, context, date, date_gmt, force, id, meta, parent, password, post, status
  - Endpoint 1:
    - Methods: GET
    - Args: id, context, password
    - Callback: `WP_REST_Comments_Controller::get_item`
  - Endpoint 2:
    - Methods: PATCH, POST, PUT
    - Args: id, author, author_email, author_ip, author_name, author_url, author_user_agent, content, date, date_gmt, parent, post, status, meta, content_raw
    - Callback: `WP_REST_Comments_Controller::update_item`
  - Endpoint 3:
    - Methods: DELETE
    - Args: id, force, password
    - Callback: `WP_REST_Comments_Controller::delete_item`

### /wp/v2/font-collections

- Endpoints: 1
- Methods (any): GET
- Args (any): context, page, per_page
  - Endpoint 1:
    - Methods: GET
    - Args: context, page, per_page
    - Callback: `WP_REST_Font_Collections_Controller::get_items`

### /wp/v2/font-collections/(?P<slug>[\/\w-]+)

- Endpoints: 1
- Methods (any): GET
- Args (any): context
  - Endpoint 1:
    - Methods: GET
    - Args: context
    - Callback: `WP_REST_Font_Collections_Controller::get_item`

### /wp/v2/font-families

- Endpoints: 2
- Methods (any): GET, POST
- Args (any): context, exclude, font_family_settings, include, offset, order, orderby, page, per_page, search_semantics, slug, theme_json_version
  - Endpoint 1:
    - Methods: GET
    - Args: context, page, per_page, exclude, include, search_semantics, offset, order, orderby, slug
    - Callback: `WP_REST_Font_Families_Controller::get_items`
  - Endpoint 2:
    - Methods: POST
    - Args: theme_json_version, font_family_settings
    - Callback: `WP_REST_Font_Families_Controller::create_item`

### /wp/v2/font-families/(?P<font_family_id>[\d]+)/font-faces

- Endpoints: 2
- Methods (any): GET, POST
- Args (any): context, exclude, font_face_settings, font_family_id, include, offset, order, orderby, page, per_page, search_semantics, theme_json_version
  - Endpoint 1:
    - Methods: GET
    - Args: font_family_id, context, page, per_page, exclude, include, search_semantics, offset, order, orderby
    - Callback: `WP_REST_Font_Faces_Controller::get_items`
  - Endpoint 2:
    - Methods: POST
    - Args: font_family_id, theme_json_version, font_face_settings
    - Callback: `WP_REST_Font_Faces_Controller::create_item`

### /wp/v2/font-families/(?P<font_family_id>[\d]+)/font-faces/(?P<id>[\d]+)

- Endpoints: 2
- Methods (any): DELETE, GET
- Args (any): context, font_family_id, force, id
  - Endpoint 1:
    - Methods: GET
    - Args: font_family_id, id, context
    - Callback: `WP_REST_Font_Faces_Controller::get_item`
  - Endpoint 2:
    - Methods: DELETE
    - Args: font_family_id, id, force
    - Callback: `WP_REST_Font_Faces_Controller::delete_item`

### /wp/v2/font-families/(?P<id>[\d]+)

- Endpoints: 3
- Methods (any): DELETE, GET, PATCH, POST, PUT
- Args (any): context, font_family_settings, force, id, theme_json_version
  - Endpoint 1:
    - Methods: GET
    - Args: id, context
    - Callback: `WP_REST_Font_Families_Controller::get_item`
  - Endpoint 2:
    - Methods: PATCH, POST, PUT
    - Args: id, theme_json_version, font_family_settings
    - Callback: `WP_REST_Font_Families_Controller::update_item`
  - Endpoint 3:
    - Methods: DELETE
    - Args: id, force
    - Callback: `WP_REST_Font_Families_Controller::delete_item`

### /wp/v2/global-styles/(?P<id>[\/\w-]+)

- Endpoints: 2
- Methods (any): GET, PATCH, POST, PUT
- Args (any): id, settings, styles, title
  - Endpoint 1:
    - Methods: GET
    - Args: id
    - Callback: `WP_REST_Global_Styles_Controller::get_item`
  - Endpoint 2:
    - Methods: PATCH, POST, PUT
    - Args: styles, settings, title
    - Callback: `WP_REST_Global_Styles_Controller::update_item`

### /wp/v2/global-styles/(?P<parent>[\d]+)/revisions

- Endpoints: 1
- Methods (any): GET
- Args (any): context, offset, page, parent, per_page
  - Endpoint 1:
    - Methods: GET
    - Args: parent, context, page, per_page, offset
    - Callback: `WP_REST_Global_Styles_Revisions_Controller::get_items`

### /wp/v2/global-styles/(?P<parent>[\d]+)/revisions/(?P<id>[\d]+)

- Endpoints: 1
- Methods (any): GET
- Args (any): context, id, parent
  - Endpoint 1:
    - Methods: GET
    - Args: parent, id, context
    - Callback: `WP_REST_Global_Styles_Revisions_Controller::get_item`

### /wp/v2/global-styles/themes/(?P<stylesheet>[\/\s%\w\.\(\)\[\]\@_\-]+)/variations

- Endpoints: 1
- Methods (any): GET
- Args (any): stylesheet
  - Endpoint 1:
    - Methods: GET
    - Args: stylesheet
    - Callback: `WP_REST_Global_Styles_Controller::get_theme_items`

### /wp/v2/global-styles/themes/(?P<stylesheet>[^\/:<>\*\?"\|]+(?:\/[^\/:<>\*\?"\|]+)?)

- Endpoints: 1
- Methods (any): GET
- Args (any): stylesheet
  - Endpoint 1:
    - Methods: GET
    - Args: stylesheet
    - Callback: `WP_REST_Global_Styles_Controller::get_theme_item`

### /wp/v2/media

- Endpoints: 2
- Methods (any): GET, POST
- Args (any): after, alt_text, author, author_exclude, before, caption, comment_status, context, date, date_gmt, description, exclude, featured_media, include, media_type, meta, mime_type, modified_after, modified_before, offset, order, orderby, page, parent, parent_exclude, per_page, ping_status, post, search, search_columns, search_semantics, slug, status, template, title
  - Endpoint 1:
    - Methods: GET
    - Args: context, page, per_page, search, after, modified_after, author, author_exclude, before, modified_before, exclude, include, search_semantics, offset, order, orderby, parent, parent_exclude, search_columns, slug, status, media_type, mime_type
    - Callback: `WP_REST_Attachments_Controller::get_items`
  - Endpoint 2:
    - Methods: POST
    - Args: date, date_gmt, slug, status, title, author, featured_media, comment_status, ping_status, meta, template, alt_text, caption, description, post
    - Callback: `WP_REST_Attachments_Controller::create_item`

### /wp/v2/media/(?P<id>[\d]+)

- Endpoints: 3
- Methods (any): DELETE, GET, PATCH, POST, PUT
- Args (any): alt_text, author, caption, comment_status, context, date, date_gmt, description, featured_media, force, id, meta, ping_status, post, slug, status, template, title
  - Endpoint 1:
    - Methods: GET
    - Args: id, context
    - Callback: `WP_REST_Attachments_Controller::get_item`
  - Endpoint 2:
    - Methods: PATCH, POST, PUT
    - Args: id, date, date_gmt, slug, status, title, author, featured_media, comment_status, ping_status, meta, template, alt_text, caption, description, post
    - Callback: `WP_REST_Attachments_Controller::update_item`
  - Endpoint 3:
    - Methods: DELETE
    - Args: id, force
    - Callback: `WP_REST_Attachments_Controller::delete_item`

### /wp/v2/media/(?P<id>[\d]+)/edit

- Endpoints: 1
- Methods (any): POST
- Args (any): height, modifiers, rotation, src, width, x, y
  - Endpoint 1:
    - Methods: POST
    - Args: src, modifiers, rotation, x, y, width, height
    - Callback: `WP_REST_Attachments_Controller::edit_media_item`

### /wp/v2/media/(?P<id>[\d]+)/post-process

- Endpoints: 1
- Methods (any): POST
- Args (any): action, id
  - Endpoint 1:
    - Methods: POST
    - Args: id, action
    - Callback: `WP_REST_Attachments_Controller::post_process_item`

### /wp/v2/menu-items

- Endpoints: 2
- Methods (any): GET, POST
- Args (any): after, attr_title, before, classes, context, description, exclude, include, menu_order, menus, menus_exclude, meta, modified_after, modified_before, object, object_id, offset, order, orderby, page, parent, per_page, search, search_columns, search_semantics, slug, status, target, tax_relation, title, type, url, xfn
  - Endpoint 1:
    - Methods: GET
    - Args: context, page, per_page, search, after, modified_after, before, modified_before, exclude, include, search_semantics, offset, order, orderby, search_columns, slug, status, tax_relation, menus, menus_exclude, menu_order
    - Callback: `WP_REST_Menu_Items_Controller::get_items`
  - Endpoint 2:
    - Methods: POST
    - Args: title, type, status, parent, attr_title, classes, description, menu_order, object, object_id, target, url, xfn, menus, meta
    - Callback: `WP_REST_Menu_Items_Controller::create_item`

### /wp/v2/menu-items/(?P<id>[\d]+)

- Endpoints: 3
- Methods (any): DELETE, GET, PATCH, POST, PUT
- Args (any): attr_title, classes, context, description, force, id, menu_order, menus, meta, object, object_id, parent, status, target, title, type, url, xfn
  - Endpoint 1:
    - Methods: GET
    - Args: id, context
    - Callback: `WP_REST_Menu_Items_Controller::get_item`
  - Endpoint 2:
    - Methods: PATCH, POST, PUT
    - Args: id, title, type, status, parent, attr_title, classes, description, menu_order, object, object_id, target, url, xfn, menus, meta
    - Callback: `WP_REST_Menu_Items_Controller::update_item`
  - Endpoint 3:
    - Methods: DELETE
    - Args: id, force
    - Callback: `WP_REST_Menu_Items_Controller::delete_item`

### /wp/v2/menu-items/(?P<id>[\d]+)/autosaves

- Endpoints: 2
- Methods (any): GET, POST
- Args (any): attr_title, classes, context, description, menu_order, menus, meta, object, object_id, parent, status, target, title, type, url, xfn
  - Endpoint 1:
    - Methods: GET
    - Args: parent, context
    - Callback: `WP_REST_Autosaves_Controller::get_items`
  - Endpoint 2:
    - Methods: POST
    - Args: parent, title, type, status, attr_title, classes, description, menu_order, object, object_id, target, url, xfn, menus, meta
    - Callback: `WP_REST_Autosaves_Controller::create_item`

### /wp/v2/menu-items/(?P<parent>[\d]+)/autosaves/(?P<id>[\d]+)

- Endpoints: 1
- Methods (any): GET
- Args (any): context, id, parent
  - Endpoint 1:
    - Methods: GET
    - Args: parent, id, context
    - Callback: `WP_REST_Autosaves_Controller::get_item`

### /wp/v2/menu-locations

- Endpoints: 1
- Methods (any): GET
- Args (any): context
  - Endpoint 1:
    - Methods: GET
    - Args: context
    - Callback: `WP_REST_Menu_Locations_Controller::get_items`

### /wp/v2/menu-locations/(?P<location>[\w-]+)

- Endpoints: 1
- Methods (any): GET
- Args (any): context, location
  - Endpoint 1:
    - Methods: GET
    - Args: location, context
    - Callback: `WP_REST_Menu_Locations_Controller::get_item`

### /wp/v2/menus

- Endpoints: 2
- Methods (any): GET, POST
- Args (any): auto_add, context, description, exclude, hide_empty, include, locations, meta, name, offset, order, orderby, page, per_page, post, search, slug
  - Endpoint 1:
    - Methods: GET
    - Args: context, page, per_page, search, exclude, include, offset, order, orderby, hide_empty, post, slug
    - Callback: `WP_REST_Menus_Controller::get_items`
  - Endpoint 2:
    - Methods: POST
    - Args: description, name, slug, meta, locations, auto_add
    - Callback: `WP_REST_Menus_Controller::create_item`

### /wp/v2/menus/(?P<id>[\d]+)

- Endpoints: 3
- Methods (any): DELETE, GET, PATCH, POST, PUT
- Args (any): auto_add, context, description, force, id, locations, meta, name, slug
  - Endpoint 1:
    - Methods: GET
    - Args: id, context
    - Callback: `WP_REST_Menus_Controller::get_item`
  - Endpoint 2:
    - Methods: PATCH, POST, PUT
    - Args: id, description, name, slug, meta, locations, auto_add
    - Callback: `WP_REST_Menus_Controller::update_item`
  - Endpoint 3:
    - Methods: DELETE
    - Args: id, force
    - Callback: `WP_REST_Menus_Controller::delete_item`

### /wp/v2/navigation

- Endpoints: 2
- Methods (any): GET, POST
- Args (any): after, before, content, context, date, date_gmt, exclude, include, modified_after, modified_before, offset, order, orderby, page, password, per_page, search, search_columns, search_semantics, slug, status, template, title
  - Endpoint 1:
    - Methods: GET
    - Args: context, page, per_page, search, after, modified_after, before, modified_before, exclude, include, search_semantics, offset, order, orderby, search_columns, slug, status
    - Callback: `WP_REST_Posts_Controller::get_items`
  - Endpoint 2:
    - Methods: POST
    - Args: date, date_gmt, slug, status, password, title, content, template
    - Callback: `WP_REST_Posts_Controller::create_item`

### /wp/v2/navigation/(?P<id>[\d]+)

- Endpoints: 3
- Methods (any): DELETE, GET, PATCH, POST, PUT
- Args (any): content, context, date, date_gmt, force, id, password, slug, status, template, title
  - Endpoint 1:
    - Methods: GET
    - Args: id, context, password
    - Callback: `WP_REST_Posts_Controller::get_item`
  - Endpoint 2:
    - Methods: PATCH, POST, PUT
    - Args: id, date, date_gmt, slug, status, password, title, content, template
    - Callback: `WP_REST_Posts_Controller::update_item`
  - Endpoint 3:
    - Methods: DELETE
    - Args: id, force
    - Callback: `WP_REST_Posts_Controller::delete_item`

### /wp/v2/navigation/(?P<id>[\d]+)/autosaves

- Endpoints: 2
- Methods (any): GET, POST
- Args (any): content, context, date, date_gmt, parent, password, slug, status, template, title
  - Endpoint 1:
    - Methods: GET
    - Args: parent, context
    - Callback: `WP_REST_Autosaves_Controller::get_items`
  - Endpoint 2:
    - Methods: POST
    - Args: parent, date, date_gmt, slug, status, password, title, content, template
    - Callback: `WP_REST_Autosaves_Controller::create_item`

### /wp/v2/navigation/(?P<parent>[\d]+)/autosaves/(?P<id>[\d]+)

- Endpoints: 1
- Methods (any): GET
- Args (any): context, id, parent
  - Endpoint 1:
    - Methods: GET
    - Args: parent, id, context
    - Callback: `WP_REST_Autosaves_Controller::get_item`

### /wp/v2/navigation/(?P<parent>[\d]+)/revisions

- Endpoints: 1
- Methods (any): GET
- Args (any): context, exclude, include, offset, order, orderby, page, parent, per_page, search
  - Endpoint 1:
    - Methods: GET
    - Args: parent, context, page, per_page, search, exclude, include, offset, order, orderby
    - Callback: `WP_REST_Revisions_Controller::get_items`

### /wp/v2/navigation/(?P<parent>[\d]+)/revisions/(?P<id>[\d]+)

- Endpoints: 2
- Methods (any): DELETE, GET
- Args (any): context, force, id, parent
  - Endpoint 1:
    - Methods: GET
    - Args: parent, id, context
    - Callback: `WP_REST_Revisions_Controller::get_item`
  - Endpoint 2:
    - Methods: DELETE
    - Args: parent, id, force
    - Callback: `WP_REST_Revisions_Controller::delete_item`

### /wp/v2/pages

- Endpoints: 2
- Methods (any): GET, POST
- Args (any): after, author, author_exclude, before, comment_status, content, context, date, date_gmt, excerpt, exclude, featured_media, include, menu_order, meta, modified_after, modified_before, offset, order, orderby, page, parent, parent_exclude, password, per_page, ping_status, search, search_columns, search_semantics, slug, status, template, title
  - Endpoint 1:
    - Methods: GET
    - Args: context, page, per_page, search, after, modified_after, author, author_exclude, before, modified_before, exclude, include, menu_order, search_semantics, offset, order, orderby, parent, parent_exclude, search_columns, slug, status
    - Callback: `WP_REST_Posts_Controller::get_items`
  - Endpoint 2:
    - Methods: POST
    - Args: date, date_gmt, slug, status, password, parent, title, content, author, excerpt, featured_media, comment_status, ping_status, menu_order, meta, template
    - Callback: `WP_REST_Posts_Controller::create_item`

### /wp/v2/pages/(?P<id>[\d]+)

- Endpoints: 3
- Methods (any): DELETE, GET, PATCH, POST, PUT
- Args (any): author, comment_status, content, context, date, date_gmt, excerpt, excerpt_length, featured_media, force, id, menu_order, meta, parent, password, ping_status, slug, status, template, title
  - Endpoint 1:
    - Methods: GET
    - Args: id, context, excerpt_length, password
    - Callback: `WP_REST_Posts_Controller::get_item`
  - Endpoint 2:
    - Methods: PATCH, POST, PUT
    - Args: id, date, date_gmt, slug, status, password, parent, title, content, author, excerpt, featured_media, comment_status, ping_status, menu_order, meta, template
    - Callback: `WP_REST_Posts_Controller::update_item`
  - Endpoint 3:
    - Methods: DELETE
    - Args: id, force
    - Callback: `WP_REST_Posts_Controller::delete_item`

### /wp/v2/pages/(?P<id>[\d]+)/autosaves

- Endpoints: 2
- Methods (any): GET, POST
- Args (any): author, comment_status, content, context, date, date_gmt, excerpt, featured_media, menu_order, meta, parent, password, ping_status, slug, status, template, title
  - Endpoint 1:
    - Methods: GET
    - Args: parent, context
    - Callback: `WP_REST_Autosaves_Controller::get_items`
  - Endpoint 2:
    - Methods: POST
    - Args: parent, date, date_gmt, slug, status, password, title, content, author, excerpt, featured_media, comment_status, ping_status, menu_order, meta, template
    - Callback: `WP_REST_Autosaves_Controller::create_item`

### /wp/v2/pages/(?P<parent>[\d]+)/autosaves/(?P<id>[\d]+)

- Endpoints: 1
- Methods (any): GET
- Args (any): context, id, parent
  - Endpoint 1:
    - Methods: GET
    - Args: parent, id, context
    - Callback: `WP_REST_Autosaves_Controller::get_item`

### /wp/v2/pages/(?P<parent>[\d]+)/revisions

- Endpoints: 1
- Methods (any): GET
- Args (any): context, exclude, include, offset, order, orderby, page, parent, per_page, search
  - Endpoint 1:
    - Methods: GET
    - Args: parent, context, page, per_page, search, exclude, include, offset, order, orderby
    - Callback: `WP_REST_Revisions_Controller::get_items`

### /wp/v2/pages/(?P<parent>[\d]+)/revisions/(?P<id>[\d]+)

- Endpoints: 2
- Methods (any): DELETE, GET
- Args (any): context, force, id, parent
  - Endpoint 1:
    - Methods: GET
    - Args: parent, id, context
    - Callback: `WP_REST_Revisions_Controller::get_item`
  - Endpoint 2:
    - Methods: DELETE
    - Args: parent, id, force
    - Callback: `WP_REST_Revisions_Controller::delete_item`

### /wp/v2/pattern-directory/patterns

- Endpoints: 1
- Methods (any): GET
- Args (any): category, context, keyword, offset, order, orderby, page, per_page, search, slug
  - Endpoint 1:
    - Methods: GET
    - Args: context, page, per_page, search, category, keyword, slug, offset, order, orderby
    - Callback: `WP_REST_Pattern_Directory_Controller::get_items`

### /wp/v2/plugins

- Endpoints: 2
- Methods (any): GET, POST
- Args (any): context, search, slug, status
  - Endpoint 1:
    - Methods: GET
    - Args: context, search, status
    - Callback: `WP_REST_Plugins_Controller::get_items`
  - Endpoint 2:
    - Methods: POST
    - Args: slug, status
    - Callback: `WP_REST_Plugins_Controller::create_item`

### /wp/v2/plugins/(?P<plugin>[^.\/]+(?:\/[^.\/]+)?)

- Endpoints: 3
- Methods (any): DELETE, GET, PATCH, POST, PUT
- Args (any): context, plugin, status
  - Endpoint 1:
    - Methods: GET
    - Args: context, plugin
    - Callback: `WP_REST_Plugins_Controller::get_item`
  - Endpoint 2:
    - Methods: PATCH, POST, PUT
    - Args: context, plugin, status
    - Callback: `WP_REST_Plugins_Controller::update_item`
  - Endpoint 3:
    - Methods: DELETE
    - Args: context, plugin
    - Callback: `WP_REST_Plugins_Controller::delete_item`

### /wp/v2/posts

- Endpoints: 2
- Methods (any): GET, POST
- Args (any): after, author, author_exclude, before, categories, categories_exclude, comment_status, content, content_raw, context, date, date_gmt, excerpt, exclude, featured_media, format, ignore_sticky, include, meta, modified_after, modified_before, offset, order, orderby, page, password, per_page, ping_status, search, search_columns, search_semantics, slug, status, sticky, tags, tags_exclude, tax_relation, template, title
  - Endpoint 1:
    - Methods: GET
    - Args: context, page, per_page, search, after, modified_after, author, author_exclude, before, modified_before, exclude, include, search_semantics, offset, order, orderby, search_columns, slug, status, tax_relation, categories, categories_exclude, tags, tags_exclude, sticky, ignore_sticky, format
    - Callback: `WP_REST_Posts_Controller::get_items`
  - Endpoint 2:
    - Methods: POST
    - Args: date, date_gmt, slug, status, password, title, content, author, excerpt, featured_media, comment_status, ping_status, format, meta, sticky, template, categories, tags, content_raw
    - Callback: `WP_REST_Posts_Controller::create_item`

### /wp/v2/posts/(?P<id>[\d]+)

- Endpoints: 3
- Methods (any): DELETE, GET, PATCH, POST, PUT
- Args (any): author, categories, comment_status, content, content_raw, context, date, date_gmt, excerpt, excerpt_length, featured_media, force, format, id, meta, password, ping_status, slug, status, sticky, tags, template, title
  - Endpoint 1:
    - Methods: GET
    - Args: id, context, excerpt_length, password
    - Callback: `WP_REST_Posts_Controller::get_item`
  - Endpoint 2:
    - Methods: PATCH, POST, PUT
    - Args: id, date, date_gmt, slug, status, password, title, content, author, excerpt, featured_media, comment_status, ping_status, format, meta, sticky, template, categories, tags, content_raw
    - Callback: `WP_REST_Posts_Controller::update_item`
  - Endpoint 3:
    - Methods: DELETE
    - Args: id, force
    - Callback: `WP_REST_Posts_Controller::delete_item`

### /wp/v2/posts/(?P<id>[\d]+)/autosaves

- Endpoints: 2
- Methods (any): GET, POST
- Args (any): author, categories, comment_status, content, content_raw, context, date, date_gmt, excerpt, featured_media, format, meta, parent, password, ping_status, slug, status, sticky, tags, template, title
  - Endpoint 1:
    - Methods: GET
    - Args: parent, context
    - Callback: `WP_REST_Autosaves_Controller::get_items`
  - Endpoint 2:
    - Methods: POST
    - Args: parent, date, date_gmt, slug, status, password, title, content, author, excerpt, featured_media, comment_status, ping_status, format, meta, sticky, template, categories, tags, content_raw
    - Callback: `WP_REST_Autosaves_Controller::create_item`

### /wp/v2/posts/(?P<parent>[\d]+)/autosaves/(?P<id>[\d]+)

- Endpoints: 1
- Methods (any): GET
- Args (any): context, id, parent
  - Endpoint 1:
    - Methods: GET
    - Args: parent, id, context
    - Callback: `WP_REST_Autosaves_Controller::get_item`

### /wp/v2/posts/(?P<parent>[\d]+)/revisions

- Endpoints: 1
- Methods (any): GET
- Args (any): context, exclude, include, offset, order, orderby, page, parent, per_page, search
  - Endpoint 1:
    - Methods: GET
    - Args: parent, context, page, per_page, search, exclude, include, offset, order, orderby
    - Callback: `WP_REST_Revisions_Controller::get_items`

### /wp/v2/posts/(?P<parent>[\d]+)/revisions/(?P<id>[\d]+)

- Endpoints: 2
- Methods (any): DELETE, GET
- Args (any): context, force, id, parent
  - Endpoint 1:
    - Methods: GET
    - Args: parent, id, context
    - Callback: `WP_REST_Revisions_Controller::get_item`
  - Endpoint 2:
    - Methods: DELETE
    - Args: parent, id, force
    - Callback: `WP_REST_Revisions_Controller::delete_item`

### /wp/v2/search

- Endpoints: 1
- Methods (any): GET
- Args (any): context, exclude, include, page, per_page, search, subtype, type
  - Endpoint 1:
    - Methods: GET
    - Args: context, page, per_page, search, type, subtype, exclude, include
    - Callback: `WP_REST_Search_Controller::get_items`

### /wp/v2/settings

- Endpoints: 2
- Methods (any): GET, PATCH, POST, PUT
- Args (any): date_format, default_category, default_comment_status, default_ping_status, default_post_format, description, email, jwt_auth_options, language, page_for_posts, page_on_front, posts_per_page, show_on_front, site_icon, site_logo, start_of_week, time_format, timezone, title, url, use_smilies
  - Endpoint 1:
    - Methods: GET
    - Callback: `WP_REST_Settings_Controller::get_item`
  - Endpoint 2:
    - Methods: PATCH, POST, PUT
    - Args: title, description, url, email, timezone, date_format, time_format, start_of_week, language, use_smilies, default_category, default_post_format, posts_per_page, show_on_front, page_on_front, page_for_posts, default_ping_status, default_comment_status, site_logo, site_icon, jwt_auth_options
    - Callback: `WP_REST_Settings_Controller::update_item`

### /wp/v2/sidebars

- Endpoints: 1
- Methods (any): GET
- Args (any): context
  - Endpoint 1:
    - Methods: GET
    - Args: context
    - Callback: `WP_REST_Sidebars_Controller::get_items`

### /wp/v2/sidebars/(?P<id>[\w-]+)

- Endpoints: 2
- Methods (any): GET, PATCH, POST, PUT
- Args (any): context, id, widgets
  - Endpoint 1:
    - Methods: GET
    - Args: id, context
    - Callback: `WP_REST_Sidebars_Controller::get_item`
  - Endpoint 2:
    - Methods: PATCH, POST, PUT
    - Args: widgets
    - Callback: `WP_REST_Sidebars_Controller::update_item`

### /wp/v2/statuses

- Endpoints: 1
- Methods (any): GET
- Args (any): context
  - Endpoint 1:
    - Methods: GET
    - Args: context
    - Callback: `WP_REST_Post_Statuses_Controller::get_items`

### /wp/v2/statuses/(?P<status>[\w-]+)

- Endpoints: 1
- Methods (any): GET
- Args (any): context, status
  - Endpoint 1:
    - Methods: GET
    - Args: status, context
    - Callback: `WP_REST_Post_Statuses_Controller::get_item`

### /wp/v2/tags

- Endpoints: 2
- Methods (any): GET, POST
- Args (any): context, description, exclude, hide_empty, include, meta, name, offset, order, orderby, page, per_page, post, search, slug
  - Endpoint 1:
    - Methods: GET
    - Args: context, page, per_page, search, exclude, include, offset, order, orderby, hide_empty, post, slug
    - Callback: `WP_REST_Terms_Controller::get_items`
  - Endpoint 2:
    - Methods: POST
    - Args: description, name, slug, meta
    - Callback: `WP_REST_Terms_Controller::create_item`

### /wp/v2/tags/(?P<id>[\d]+)

- Endpoints: 3
- Methods (any): DELETE, GET, PATCH, POST, PUT
- Args (any): context, description, force, id, meta, name, slug
  - Endpoint 1:
    - Methods: GET
    - Args: id, context
    - Callback: `WP_REST_Terms_Controller::get_item`
  - Endpoint 2:
    - Methods: PATCH, POST, PUT
    - Args: id, description, name, slug, meta
    - Callback: `WP_REST_Terms_Controller::update_item`
  - Endpoint 3:
    - Methods: DELETE
    - Args: id, force
    - Callback: `WP_REST_Terms_Controller::delete_item`

### /wp/v2/taxonomies

- Endpoints: 1
- Methods (any): GET
- Args (any): context, type
  - Endpoint 1:
    - Methods: GET
    - Args: context, type
    - Callback: `WP_REST_Taxonomies_Controller::get_items`

### /wp/v2/taxonomies/(?P<taxonomy>[\w-]+)

- Endpoints: 1
- Methods (any): GET
- Args (any): context, taxonomy
  - Endpoint 1:
    - Methods: GET
    - Args: taxonomy, context
    - Callback: `WP_REST_Taxonomies_Controller::get_item`

### /wp/v2/template-parts

- Endpoints: 2
- Methods (any): GET, POST
- Args (any): area, author, content, context, description, post_type, slug, status, theme, title, type, wp_id
  - Endpoint 1:
    - Methods: GET
    - Args: context, wp_id, area, post_type
    - Callback: `WP_REST_Templates_Controller::get_items`
  - Endpoint 2:
    - Methods: POST
    - Args: slug, theme, type, content, title, description, status, author, area
    - Callback: `WP_REST_Templates_Controller::create_item`

### /wp/v2/template-parts/(?P<id>([^\/:<>\*\?"\|]+(?:\/[^\/:<>\*\?"\|]+)?)[\/\w%-]+)

- Endpoints: 3
- Methods (any): DELETE, GET, PATCH, POST, PUT
- Args (any): area, author, content, context, description, force, id, slug, status, theme, title, type
  - Endpoint 1:
    - Methods: GET
    - Args: id, context
    - Callback: `WP_REST_Templates_Controller::get_item`
  - Endpoint 2:
    - Methods: PATCH, POST, PUT
    - Args: id, slug, theme, type, content, title, description, status, author, area
    - Callback: `WP_REST_Templates_Controller::update_item`
  - Endpoint 3:
    - Methods: DELETE
    - Args: id, force
    - Callback: `WP_REST_Templates_Controller::delete_item`

### /wp/v2/template-parts/(?P<id>([^\/:<>\*\?"\|]+(?:\/[^\/:<>\*\?"\|]+)?)[\/\w%-]+)/autosaves

- Endpoints: 2
- Methods (any): GET, POST
- Args (any): area, author, content, context, description, id, slug, status, theme, title, type
  - Endpoint 1:
    - Methods: GET
    - Args: id, context
    - Callback: `WP_REST_Template_Autosaves_Controller::get_items`
  - Endpoint 2:
    - Methods: POST
    - Args: id, slug, theme, type, content, title, description, status, author, area
    - Callback: `WP_REST_Template_Autosaves_Controller::create_item`

### /wp/v2/template-parts/(?P<parent>([^\/:<>\*\?"\|]+(?:\/[^\/:<>\*\?"\|]+)?)[\/\w%-]+)/autosaves/(?P<id>[\d]+)

- Endpoints: 1
- Methods (any): GET
- Args (any): context, id, parent
  - Endpoint 1:
    - Methods: GET
    - Args: parent, id, context
    - Callback: `WP_REST_Template_Autosaves_Controller::get_item`

### /wp/v2/template-parts/(?P<parent>([^\/:<>\*\?"\|]+(?:\/[^\/:<>\*\?"\|]+)?)[\/\w%-]+)/revisions

- Endpoints: 1
- Methods (any): GET
- Args (any): context, exclude, include, offset, order, orderby, page, parent, per_page, search
  - Endpoint 1:
    - Methods: GET
    - Args: parent, context, page, per_page, search, exclude, include, offset, order, orderby
    - Callback: `WP_REST_Template_Revisions_Controller::get_items`

### /wp/v2/template-parts/(?P<parent>([^\/:<>\*\?"\|]+(?:\/[^\/:<>\*\?"\|]+)?)[\/\w%-]+)/revisions/(?P<id>[\d]+)

- Endpoints: 2
- Methods (any): DELETE, GET
- Args (any): context, force, id, parent
  - Endpoint 1:
    - Methods: GET
    - Args: parent, id, context
    - Callback: `WP_REST_Template_Revisions_Controller::get_item`
  - Endpoint 2:
    - Methods: DELETE
    - Args: parent, id, force
    - Callback: `WP_REST_Template_Revisions_Controller::delete_item`

### /wp/v2/template-parts/lookup

- Endpoints: 1
- Methods (any): GET
- Args (any): is_custom, slug, template_prefix
  - Endpoint 1:
    - Methods: GET
    - Args: slug, is_custom, template_prefix
    - Callback: `WP_REST_Templates_Controller::get_template_fallback`

### /wp/v2/templates

- Endpoints: 2
- Methods (any): GET, POST
- Args (any): area, author, content, context, description, post_type, slug, status, theme, title, type, wp_id
  - Endpoint 1:
    - Methods: GET
    - Args: context, wp_id, area, post_type
    - Callback: `WP_REST_Templates_Controller::get_items`
  - Endpoint 2:
    - Methods: POST
    - Args: slug, theme, type, content, title, description, status, author
    - Callback: `WP_REST_Templates_Controller::create_item`

### /wp/v2/templates/(?P<id>([^\/:<>\*\?"\|]+(?:\/[^\/:<>\*\?"\|]+)?)[\/\w%-]+)

- Endpoints: 3
- Methods (any): DELETE, GET, PATCH, POST, PUT
- Args (any): author, content, context, description, force, id, slug, status, theme, title, type
  - Endpoint 1:
    - Methods: GET
    - Args: id, context
    - Callback: `WP_REST_Templates_Controller::get_item`
  - Endpoint 2:
    - Methods: PATCH, POST, PUT
    - Args: id, slug, theme, type, content, title, description, status, author
    - Callback: `WP_REST_Templates_Controller::update_item`
  - Endpoint 3:
    - Methods: DELETE
    - Args: id, force
    - Callback: `WP_REST_Templates_Controller::delete_item`

### /wp/v2/templates/(?P<id>([^\/:<>\*\?"\|]+(?:\/[^\/:<>\*\?"\|]+)?)[\/\w%-]+)/autosaves

- Endpoints: 2
- Methods (any): GET, POST
- Args (any): author, content, context, description, id, slug, status, theme, title, type
  - Endpoint 1:
    - Methods: GET
    - Args: id, context
    - Callback: `WP_REST_Template_Autosaves_Controller::get_items`
  - Endpoint 2:
    - Methods: POST
    - Args: id, slug, theme, type, content, title, description, status, author
    - Callback: `WP_REST_Template_Autosaves_Controller::create_item`

### /wp/v2/templates/(?P<parent>([^\/:<>\*\?"\|]+(?:\/[^\/:<>\*\?"\|]+)?)[\/\w%-]+)/autosaves/(?P<id>[\d]+)

- Endpoints: 1
- Methods (any): GET
- Args (any): context, id, parent
  - Endpoint 1:
    - Methods: GET
    - Args: parent, id, context
    - Callback: `WP_REST_Template_Autosaves_Controller::get_item`

### /wp/v2/templates/(?P<parent>([^\/:<>\*\?"\|]+(?:\/[^\/:<>\*\?"\|]+)?)[\/\w%-]+)/revisions

- Endpoints: 1
- Methods (any): GET
- Args (any): context, exclude, include, offset, order, orderby, page, parent, per_page, search
  - Endpoint 1:
    - Methods: GET
    - Args: parent, context, page, per_page, search, exclude, include, offset, order, orderby
    - Callback: `WP_REST_Template_Revisions_Controller::get_items`

### /wp/v2/templates/(?P<parent>([^\/:<>\*\?"\|]+(?:\/[^\/:<>\*\?"\|]+)?)[\/\w%-]+)/revisions/(?P<id>[\d]+)

- Endpoints: 2
- Methods (any): DELETE, GET
- Args (any): context, force, id, parent
  - Endpoint 1:
    - Methods: GET
    - Args: parent, id, context
    - Callback: `WP_REST_Template_Revisions_Controller::get_item`
  - Endpoint 2:
    - Methods: DELETE
    - Args: parent, id, force
    - Callback: `WP_REST_Template_Revisions_Controller::delete_item`

### /wp/v2/templates/lookup

- Endpoints: 1
- Methods (any): GET
- Args (any): is_custom, slug, template_prefix
  - Endpoint 1:
    - Methods: GET
    - Args: slug, is_custom, template_prefix
    - Callback: `WP_REST_Templates_Controller::get_template_fallback`

### /wp/v2/themes

- Endpoints: 1
- Methods (any): GET
- Args (any): status
  - Endpoint 1:
    - Methods: GET
    - Args: status
    - Callback: `WP_REST_Themes_Controller::get_items`

### /wp/v2/themes/(?P<stylesheet>[^\/:<>\*\?"\|]+(?:\/[^\/:<>\*\?"\|]+)?)

- Endpoints: 1
- Methods (any): GET
- Args (any): stylesheet
  - Endpoint 1:
    - Methods: GET
    - Args: stylesheet
    - Callback: `WP_REST_Themes_Controller::get_item`

### /wp/v2/types

- Endpoints: 1
- Methods (any): GET
- Args (any): context
  - Endpoint 1:
    - Methods: GET
    - Args: context
    - Callback: `WP_REST_Post_Types_Controller::get_items`

### /wp/v2/types/(?P<type>[\w-]+)

- Endpoints: 1
- Methods (any): GET
- Args (any): context, type
  - Endpoint 1:
    - Methods: GET
    - Args: type, context
    - Callback: `WP_REST_Post_Types_Controller::get_item`

### /wp/v2/users

- Endpoints: 2
- Methods (any): GET, POST
- Args (any): capabilities, context, description, email, exclude, first_name, has_published_posts, include, last_name, locale, meta, name, nickname, offset, order, orderby, page, password, per_page, profile_fields, roles, search, search_columns, slug, social, url, username, who
  - Endpoint 1:
    - Methods: GET
    - Args: context, page, per_page, search, exclude, include, offset, order, orderby, slug, roles, capabilities, who, has_published_posts, search_columns
    - Callback: `WP_REST_Users_Controller::get_items`
  - Endpoint 2:
    - Methods: POST
    - Args: username, name, first_name, last_name, email, url, description, locale, nickname, slug, roles, password, meta, profile_fields, social
    - Callback: `WP_REST_Users_Controller::create_item`

### /wp/v2/users/(?P<id>[\d]+)

- Endpoints: 3
- Methods (any): DELETE, GET, PATCH, POST, PUT
- Args (any): context, description, email, first_name, force, id, last_name, locale, meta, name, nickname, password, profile_fields, reassign, roles, slug, social, url, username
  - Endpoint 1:
    - Methods: GET
    - Args: id, context
    - Callback: `WP_REST_Users_Controller::get_item`
  - Endpoint 2:
    - Methods: PATCH, POST, PUT
    - Args: id, username, name, first_name, last_name, email, url, description, locale, nickname, slug, roles, password, meta, profile_fields, social
    - Callback: `WP_REST_Users_Controller::update_item`
  - Endpoint 3:
    - Methods: DELETE
    - Args: id, force, reassign
    - Callback: `WP_REST_Users_Controller::delete_item`

### /wp/v2/users/(?P<user_id>(?:[\d]+|me))/application-passwords

- Endpoints: 3
- Methods (any): DELETE, GET, POST
- Args (any): app_id, context, name
  - Endpoint 1:
    - Methods: GET
    - Args: context
    - Callback: `WP_REST_Application_Passwords_Controller::get_items`
  - Endpoint 2:
    - Methods: POST
    - Args: app_id, name
    - Callback: `WP_REST_Application_Passwords_Controller::create_item`
  - Endpoint 3:
    - Methods: DELETE
    - Callback: `WP_REST_Application_Passwords_Controller::delete_items`

### /wp/v2/users/(?P<user_id>(?:[\d]+|me))/application-passwords/(?P<uuid>[\w\-]+)

- Endpoints: 3
- Methods (any): DELETE, GET, PATCH, POST, PUT
- Args (any): app_id, context, name
  - Endpoint 1:
    - Methods: GET
    - Args: context
    - Callback: `WP_REST_Application_Passwords_Controller::get_item`
  - Endpoint 2:
    - Methods: PATCH, POST, PUT
    - Args: app_id, name
    - Callback: `WP_REST_Application_Passwords_Controller::update_item`
  - Endpoint 3:
    - Methods: DELETE
    - Callback: `WP_REST_Application_Passwords_Controller::delete_item`

### /wp/v2/users/(?P<user_id>(?:[\d]+|me))/application-passwords/introspect

- Endpoints: 1
- Methods (any): GET
- Args (any): context
  - Endpoint 1:
    - Methods: GET
    - Args: context
    - Callback: `WP_REST_Application_Passwords_Controller::get_current_item`

### /wp/v2/users/me

- Endpoints: 3
- Methods (any): DELETE, GET, PATCH, POST, PUT
- Args (any): context, description, email, first_name, force, last_name, locale, meta, name, nickname, password, profile_fields, reassign, roles, slug, social, url, username
  - Endpoint 1:
    - Methods: GET
    - Args: context
    - Callback: `WP_REST_Users_Controller::get_current_item`
  - Endpoint 2:
    - Methods: PATCH, POST, PUT
    - Args: username, name, first_name, last_name, email, url, description, locale, nickname, slug, roles, password, meta, profile_fields, social
    - Callback: `WP_REST_Users_Controller::update_current_item`
  - Endpoint 3:
    - Methods: DELETE
    - Args: force, reassign
    - Callback: `WP_REST_Users_Controller::delete_current_item`

### /wp/v2/widget-types

- Endpoints: 1
- Methods (any): GET
- Args (any): context
  - Endpoint 1:
    - Methods: GET
    - Args: context
    - Callback: `WP_REST_Widget_Types_Controller::get_items`

### /wp/v2/widget-types/(?P<id>[a-zA-Z0-9_-]+)

- Endpoints: 1
- Methods (any): GET
- Args (any): context, id
  - Endpoint 1:
    - Methods: GET
    - Args: id, context
    - Callback: `WP_REST_Widget_Types_Controller::get_item`

### /wp/v2/widget-types/(?P<id>[a-zA-Z0-9_-]+)/encode

- Endpoints: 1
- Methods (any): POST
- Args (any): form_data, id, instance
  - Endpoint 1:
    - Methods: POST
    - Args: id, instance, form_data
    - Callback: `WP_REST_Widget_Types_Controller::encode_form_data`

### /wp/v2/widget-types/(?P<id>[a-zA-Z0-9_-]+)/render

- Endpoints: 1
- Methods (any): POST
- Args (any): id, instance
  - Endpoint 1:
    - Methods: POST
    - Args: id, instance
    - Callback: `WP_REST_Widget_Types_Controller::render`

### /wp/v2/widgets

- Endpoints: 2
- Methods (any): GET, POST
- Args (any): context, form_data, id, id_base, instance, sidebar
  - Endpoint 1:
    - Methods: GET
    - Args: context, sidebar
    - Callback: `WP_REST_Widgets_Controller::get_items`
  - Endpoint 2:
    - Methods: POST
    - Args: id, id_base, sidebar, instance, form_data
    - Callback: `WP_REST_Widgets_Controller::create_item`

### /wp/v2/widgets/(?P<id>[\w\-]+)

- Endpoints: 3
- Methods (any): DELETE, GET, PATCH, POST, PUT
- Args (any): context, force, form_data, id, id_base, instance, sidebar
  - Endpoint 1:
    - Methods: GET
    - Args: context
    - Callback: `WP_REST_Widgets_Controller::get_item`
  - Endpoint 2:
    - Methods: PATCH, POST, PUT
    - Args: id, id_base, sidebar, instance, form_data
    - Callback: `WP_REST_Widgets_Controller::update_item`
  - Endpoint 3:
    - Methods: DELETE
    - Args: force
    - Callback: `WP_REST_Widgets_Controller::delete_item`

### /wp/v2/wp_pattern_category

- Endpoints: 2
- Methods (any): GET, POST
- Args (any): context, description, exclude, hide_empty, include, meta, name, offset, order, orderby, page, per_page, post, search, slug
  - Endpoint 1:
    - Methods: GET
    - Args: context, page, per_page, search, exclude, include, offset, order, orderby, hide_empty, post, slug
    - Callback: `WP_REST_Terms_Controller::get_items`
  - Endpoint 2:
    - Methods: POST
    - Args: description, name, slug, meta
    - Callback: `WP_REST_Terms_Controller::create_item`

### /wp/v2/wp_pattern_category/(?P<id>[\d]+)

- Endpoints: 3
- Methods (any): DELETE, GET, PATCH, POST, PUT
- Args (any): context, description, force, id, meta, name, slug
  - Endpoint 1:
    - Methods: GET
    - Args: id, context
    - Callback: `WP_REST_Terms_Controller::get_item`
  - Endpoint 2:
    - Methods: PATCH, POST, PUT
    - Args: id, description, name, slug, meta
    - Callback: `WP_REST_Terms_Controller::update_item`
  - Endpoint 3:
    - Methods: DELETE
    - Args: id, force
    - Callback: `WP_REST_Terms_Controller::delete_item`

## Namespace: wp-site-health/v1 (8 routes)

### /wp-site-health/v1

- Endpoints: 1
- Methods (any): GET
- Args (any): context, namespace
  - Endpoint 1:
    - Methods: GET
    - Args: namespace, context
    - Callback: `WP_REST_Server::get_namespace_index`

### /wp-site-health/v1/directory-sizes

- Endpoints: 1
- Methods (any): GET
  - Endpoint 1:
    - Methods: GET
    - Callback: `WP_REST_Site_Health_Controller::get_directory_sizes`

### /wp-site-health/v1/tests/authorization-header

- Endpoints: 1
- Methods (any): GET
  - Endpoint 1:
    - Methods: GET
    - Callback: `WP_REST_Site_Health_Controller::test_authorization_header`

### /wp-site-health/v1/tests/background-updates

- Endpoints: 1
- Methods (any): GET
  - Endpoint 1:
    - Methods: GET
    - Callback: `WP_REST_Site_Health_Controller::test_background_updates`

### /wp-site-health/v1/tests/dotorg-communication

- Endpoints: 1
- Methods (any): GET
  - Endpoint 1:
    - Methods: GET
    - Callback: `WP_REST_Site_Health_Controller::test_dotorg_communication`

### /wp-site-health/v1/tests/https-status

- Endpoints: 1
- Methods (any): GET
  - Endpoint 1:
    - Methods: GET
    - Callback: `WP_REST_Site_Health_Controller::test_https_status`

### /wp-site-health/v1/tests/loopback-requests

- Endpoints: 1
- Methods (any): GET
  - Endpoint 1:
    - Methods: GET
    - Callback: `WP_REST_Site_Health_Controller::test_loopback_requests`

### /wp-site-health/v1/tests/page-cache

- Endpoints: 1
- Methods (any): GET
  - Endpoint 1:
    - Methods: GET
    - Callback: `WP_REST_Site_Health_Controller::test_page_cache`

## Namespace: wp-block-editor/v1 (4 routes)

### /wp-block-editor/v1

- Endpoints: 1
- Methods (any): GET
- Args (any): context, namespace
  - Endpoint 1:
    - Methods: GET
    - Args: namespace, context
    - Callback: `WP_REST_Server::get_namespace_index`

### /wp-block-editor/v1/export

- Endpoints: 1
- Methods (any): GET
  - Endpoint 1:
    - Methods: GET
    - Callback: `WP_REST_Edit_Site_Export_Controller::export`

### /wp-block-editor/v1/navigation-fallback

- Endpoints: 1
- Methods (any): GET
  - Endpoint 1:
    - Methods: GET
    - Callback: `WP_REST_Navigation_Fallback_Controller::get_item`

### /wp-block-editor/v1/url-details

- Endpoints: 1
- Methods (any): GET
- Args (any): url
  - Endpoint 1:
    - Methods: GET
    - Args: url
    - Callback: `WP_REST_URL_Details_Controller::parse_url_details`

## Namespace: batch/v1 (1 routes)

### /batch/v1

- Endpoints: 1
- Methods (any): POST
- Args (any): requests, validation
  - Endpoint 1:
    - Methods: POST
    - Args: validation, requests
    - Callback: `WP_REST_Server::serve_batch_request_v1`

## Namespace: root (1 routes)

### /

- Endpoints: 1
- Methods (any): GET
- Args (any): context
  - Endpoint 1:
    - Methods: GET
    - Args: context
    - Callback: `WP_REST_Server::get_index`

---

Source JSON path: `/home/ajay/tmp/wp_endpoints.json`
