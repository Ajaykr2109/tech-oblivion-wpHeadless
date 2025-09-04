#!/usr/bin/env python3
"""
generate_wp_docs.py
Turn a WordPress REST index dump (API_WP.txt / JSON) into Markdown docs
and optionally a minimal OpenAPI spec.

Usage:
  python generate_wp_docs.py -i API_WP.txt -o docs --openapi openapi.yaml

Notes:
- Robust JSON loader: trims junk before/after the outer JSON braces.
- Groups routes by namespace.
- Writes per-namespace Markdown with args, methods, and sample curl.
- OpenAPI is intentionally minimal; extend as you like.

Author: your friendly future-proofing goblin
"""
import argparse
import json
import os
import re
from collections import defaultdict
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Tuple, Optional

# ---------- helpers ----------
def _slurp_json(path: Path) -> Dict[str, Any]:
    raw = path.read_text(encoding="utf-8", errors="ignore")
    # Try direct parse
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        # Fallback: find first '{' and last '}' to salvage
        m1 = raw.find("{")
        m2 = raw.rfind("}")
        if m1 == -1 or m2 == -1 or m2 <= m1:
            raise
        trimmed = raw[m1:m2+1]
        return json.loads(trimmed)

def _sanitize_filename(name: str) -> str:
    return re.sub(r"[^a-zA-Z0-9._-]+", "_", name.strip()) or "root"

def _fmt_type(t) -> str:
    if isinstance(t, list):
        return " / ".join(map(_fmt_type, t))
    if isinstance(t, dict):
        return "object"
    return str(t)

def _guess_base_url(index_json: Dict[str, Any]) -> str:
    # Try links.self of "/" route; else best-effort
    routes = index_json.get("routes", {})
    root = routes.get("/", {})
    link = (root.get("_links", {}).get("self") or [{}])[0].get("href")
    if link:
        # e.g., https://site.tld/wp-json/  -> base host
        return link.rstrip("/")
    return index_json.get("url") or "https://example.com/wp-json"

def _arg_table(args_obj: Dict[str, Any]) -> str:
    if not args_obj:
        return "_None_"
    rows = ["| Name | Type | Required | Description |",
            "|------|------|----------|-------------|"]
    for name, spec in args_obj.items():
        typ = _fmt_type(spec.get("type", "any"))
        req = "yes" if spec.get("required", False) else "no"
        desc = spec.get("description", "").replace("\n", " ").strip()
        if not desc:
            desc = ""
        rows.append(f"| `{name}` | `{typ}` | {req} | {desc} |")
    return "\n".join(rows)

def _curl_example(base: str, path: str, method: str) -> str:
    url = f"{base}{path if path.startswith('/') else '/'+path}"
    return (
        "```bash\n"
        f"curl -X {method} \\\n"
        f"  '{url}' \\\n"
        "  -H 'Accept: application/json' \\\n"
        "  -H 'Authorization: Bearer <JWT>' \\\n"
        "  -d '{\"example\":\"payload-if-needed\"}'\n"
        "```"
    )

def _method_list(endpoint: Dict[str, Any]) -> List[str]:
    return endpoint.get("methods", [])

# ---------- doc writers ----------
def write_namespace_md(
    outdir: Path,
    namespace: str,
    items: List[Tuple[str, Dict[str, Any]]],
    base_url: str
) -> None:
    p = outdir / f"{_sanitize_filename(namespace)}.md"
    items_sorted = sorted(items, key=lambda kv: kv[0])
    lines = [
        f"# `{namespace}`",
        "",
        f"_Generated: {datetime.utcnow().isoformat()}Z_",
        "",
        f"**Base**: `{base_url}`  ",
        f"**Endpoints**: {len(items_sorted)}",
        "",
        "---",
        ""
    ]
    for route, meta in items_sorted:
        endpoints = meta.get("endpoints", [])
        methods = sorted({m for ep in endpoints for m in ep.get("methods", [])})
        lines.append(f"## `{route}`")
        lines.append("")
        lines.append(f"**Methods**: `{', '.join(methods) if methods else 'GET'}`")
        lines.append("")
        # args per endpoint variant
        for ep in endpoints:
            emethods = ", ".join(ep.get("methods", [])) or "GET"
            args = ep.get("args", {})
            if args:
                lines.append(f"### Args for methods: `{emethods}`")
                lines.append(_arg_table(args))
                lines.append("")
        # sample curl for first method
        smethod = (methods or ["GET"])[0]
        lines.append("### Example")
        lines.append(_curl_example(base_url, route, smethod))
        lines.append("")
        lines.append("---\n")
    p.write_text("\n".join(lines), encoding="utf-8")

def write_index_md(
    outdir: Path,
    site_meta: Dict[str, Any],
    routes: Dict[str, Any],
    by_ns: Dict[str, List[Tuple[str, Dict[str, Any]]]],
    base_url: str
) -> None:
    readme = outdir / "README.md"
    name = site_meta.get("name", "")
    desc = site_meta.get("description", "")
    site_icon_url = site_meta.get("site_icon_url", "")
    namespaces = sorted(by_ns.keys())
    lines = [
        f"# {name or 'WordPress Headless API'}",
        "",
        desc or "_No site description available._",
        "",
        f"**Base URL**: `{base_url}`",
        "",
    ]
    if site_icon_url:
        lines.append(f"![site icon]({site_icon_url})")
        lines.append("")
    lines += [
        "## Namespaces",
        "",
        "| Namespace | Endpoints |",
        "|-----------|-----------|",
    ]
    for ns in namespaces:
        lines.append(f"| `{ns}` | {len(by_ns[ns])} |")
    lines += [
        "",
        "## Notes",
        "- Use `Authorization: Bearer <token>` for protected routes.",
        "- Pagination and other common params are under each route’s args.",
        "",
        "## Generated From",
        f"- Routes discovered: **{len(routes)}**",
        f"- Generated: **{datetime.utcnow().isoformat()}Z**",
        ""
    ]
    readme.write_text("\n".join(lines), encoding="utf-8")

# ---------- OpenAPI ----------
def build_openapi(
    site_meta: Dict[str, Any],
    routes: Dict[str, Any],
    base_url: str
) -> Dict[str, Any]:
    info_title = site_meta.get("name", "WordPress Headless API")
    info_desc = site_meta.get("description", "Auto-generated from REST index")
    # Normalize base_url into server url (strip trailing /wp-json if present)
    # If base_url ends with /wp-json, keep it; paths are absolute from there.
    servers = [{"url": base_url}]
    paths: Dict[str, Any] = {}

    for route, meta in routes.items():
        if not route.startswith("/"):
            continue
        endpoints = meta.get("endpoints", [])
        path_item: Dict[str, Any] = {}
        for ep in endpoints:
            for m in ep.get("methods", ["GET"]):
                op = {
                    "summary": f"{m} {route}",
                    "responses": {
                        "200": {"description": "OK"},
                        "400": {"description": "Bad Request"},
                        "401": {"description": "Unauthorized"},
                        "403": {"description": "Forbidden"},
                        "404": {"description": "Not Found"},
                        "429": {"description": "Rate Limited"},
                        "5XX": {"description": "Server Error"},
                    }
                }
                # args -> parameters (query/path best-effort)
                params = []
                args = ep.get("args", {})
                for arg_name, spec in args.items():
                    p: Dict[str, Any] = {
                        "name": arg_name,
                        "in": "query",  # heuristic; WP index doesn't distinguish path params cleanly
                        "required": bool(spec.get("required", False)),
                        "schema": {"type": spec.get("type", "string")}
                    }
                    if spec.get("description"):
                        p["description"] = spec["description"]
                    params.append(p)
                if params:
                    op["parameters"] = params
                # naive requestBody when method likely writes
                if m.upper() in {"POST", "PUT", "PATCH", "DELETE"}:
                    op["requestBody"] = {
                        "required": False,
                        "content": {
                            "application/json": {
                                "schema": {"type": "object", "additionalProperties": True}
                            }
                        }
                    }
                path_item.setdefault(m.lower(), op)
        if path_item:
            paths[route] = path_item

    return {
        "openapi": "3.1.0",
        "info": {
            "title": info_title,
            "version": "0.1.0",
            "description": info_desc
        },
        "servers": servers,
        "components": {
            "securitySchemes": {
                "bearerAuth": {"type": "http", "scheme": "bearer"}
            }
        },
        "security": [{"bearerAuth": []}],
        "paths": paths
    }

# ---------- main ----------
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("-i", "--input", required=True, help="Path to API_WP.txt (WP REST index JSON)")
    ap.add_argument("-o", "--outdir", default="docs", help="Output directory for Markdown docs")
    ap.add_argument("--openapi", default=None, help="If set, write minimal OpenAPI YAML to this path")
    args = ap.parse_args()

    inpath = Path(args.input)
    outdir = Path(args.outdir)
    outdir.mkdir(parents=True, exist_ok=True)

    index = _slurp_json(inpath)

    site_meta_keys = [
        "name", "description", "url", "home", "gmt_offset", "timezone_string",
        "site_logo", "site_icon", "site_icon_url"
    ]
    site_meta = {k: index.get(k) for k in site_meta_keys}
    routes: Dict[str, Any] = index.get("routes", {})

    # group by namespace
    by_ns: Dict[str, List[Tuple[str, Dict[str, Any]]]] = defaultdict(list)
    for route, meta in routes.items():
        ns = meta.get("namespace", "") or "root"
        by_ns[ns].append((route, meta))

    base_url = _guess_base_url(index)

    # Write per-namespace docs
    for ns, items in sorted(by_ns.items(), key=lambda kv: kv[0]):
        write_namespace_md(outdir, ns, items, base_url)

    # Write index
    write_index_md(outdir, site_meta, routes, by_ns, base_url)

    # Optional OpenAPI
    if args.openapi:
        try:
            import yaml  # only if user has PyYAML
            # If not installed, fall back to JSON with .yaml name
            spec = build_openapi(site_meta, routes, base_url)
            with open(args.openapi, "w", encoding="utf-8") as f:
                yaml.safe_dump(spec, f, sort_keys=False, allow_unicode=True)
        except Exception:
            # Fallback: JSON dump (still valid for many tools)
            spec = build_openapi(site_meta, routes, base_url)
            Path(args.openapi).write_text(json.dumps(spec, indent=2), encoding="utf-8")

    print(f"Docs written to: {outdir.resolve()}")
    if args.openapi:
        print(f"OpenAPI written to: {Path(args.openapi).resolve()}")

if __name__ == "__main__":
    main()
