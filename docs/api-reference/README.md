# API Reference

This folder centralizes all API documentation for the project.

Contents:

- proxy-map.md — Generated map of Next.js API routes → WordPress REST endpoints
- proxy-map-with-roles.md — Generated map with role access columns
- roles-matrix.md — Generated per-endpoint/method RBAC matrix (source: src/config/apiRolesMatrix.ts)
- endpoints-wp.md — WordPress REST endpoints by namespace (generated snapshot)
- mapping.md — Narrative mapping and conventions between FE and WP
- nextjs.md — Next.js API surface with examples
- button-api-map.md — UI actions → internal API routes and required roles

Notes:

- proxy-map.md and proxy-map-with-roles.md are generated via scripts under /scripts.
- Use scripts/api-tools.sh (macOS/Linux) or scripts/api-tools.cmd (Windows) for common tasks (regenerate, smoke tests).
