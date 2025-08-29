# Account Central

Date: 2025-08-30

- Consolidated dashboard under `/account` with sections: Account Info, Profile Settings, Security, Activity.
- Admin surfacing: If `administrator` is present in roles from `/api/wp/users/me`, show admin links.
- Editable fields sourced from `/api/wp/users/me` (display name, email, bio, avatar, nickname, locale, etc.).
- Username change rules:

  - Limit: at most 2 changes within a rolling 6 months.
  - Enforcement: requires local DB/cache tracking (not provided by WordPress core REST).
  - Implementation idea: persist `{ userId, changes[] }` with timestamps; block new change when count >= 2 within last 180 days.

- Password changes via WordPress endpoint or custom auth service depending on your WP setup.

Notes:

- Some endpoints require enabling `show_in_rest` for user meta or adding custom endpoints. See `docs/api_gaps.md`.
