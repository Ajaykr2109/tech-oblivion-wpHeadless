#!/usr/bin/env bash
set -euo pipefail

# Helper commands for API docs and sanity checks.

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)

echo "Using root: $ROOT_DIR"

cmd=${1:-help}

case "$cmd" in
  regen|generate)
    echo "Generating API proxy maps and roles matrix..."
    npx -y tsx "$ROOT_DIR/scripts/generateApiMap.ts"
    npx -y tsx "$ROOT_DIR/scripts/generateApiProxyRoles.ts"
    npx -y tsx "$ROOT_DIR/scripts/generateRoleMatrix.ts"
    echo "Wrote docs to $ROOT_DIR/docs/api-reference"
    ;;
  smoke)
    BASE=${BASE:-"http://localhost:3000"}
    echo "Running REST smoke checks against $BASE"
    curl -sSf "$BASE/api/test-wp" | jq . >/dev/null
    curl -sSf "$BASE/api/wp/posts?per_page=1" | jq '.[0] | {id, slug, title}' >/dev/null
    curl -sSf "$BASE/api/analytics/summary" | jq '{views, devices, countries, referers}' >/dev/null || true
    echo "Smoke checks OK"
    ;;
  dbcheck)
    WP=${WP:-"ssh user@server"}
    FILE=${FILE:-"wp-content/mu-plugins/_devtools/db_check.php"}
    echo "Running DB schema sanity on remote via: $WP"
    $WP "wp eval-file $FILE"
    ;;
  *)
    cat <<'USAGE'
Usage: scripts/api-tools.sh <command>

Commands:
  regen      Regenerate API docs (proxy map, roles matrix)
  smoke      Run REST smoke checks against BASE (default http://localhost:3000)
  dbcheck    Run WP DB schema sanity (requires remote WP access via $WP)

Env:
  BASE=http://localhost:3000
  WP="ssh user@server"
  FILE=wp-content/mu-plugins/_devtools/db_check.php
USAGE
    ;;
esac
