#!/usr/bin/env python3
"""Validate the disabled Phase 4 account preview and provider-neutral contracts."""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ACCOUNT_HTML = ROOT / "account.html"
ACCOUNT_JS = ROOT / "account.js"
AUTH_ADAPTER = ROOT / "auth-adapter.js"
SCHEMA = ROOT / "contracts" / "account-operations.schema.json"

FORBIDDEN_CODE_PATTERNS = {
    r"localStorage": "browser local storage is forbidden",
    r"sessionStorage": "browser session storage is forbidden",
    r"document\.cookie": "cookies are forbidden in the disabled preview",
    r"indexedDB": "IndexedDB is forbidden in the disabled preview",
    r"\bfetch\s*\(": "network fetch is forbidden",
    r"XMLHttpRequest": "XMLHttpRequest is forbidden",
    r"sendBeacon": "beacon transmission is forbidden",
    r"\bWebSocket\b": "WebSocket is forbidden",
    r"\bEventSource\b": "server-sent events are forbidden",
    r"navigator\.credentials": "credential APIs are forbidden before provider approval",
    r"service[_-]?role": "service-role material must never enter client code",
    r"supabase[_-]?(url|key)|anon[_-]?key": "provider project configuration is forbidden",
}

FORBIDDEN_REQUEST_PROPERTIES = {
    "userid",
    "user_id",
    "email",
    "role",
    "status",
    "storagepath",
    "storage_path",
    "completedat",
    "completed_at",
    "requestedat",
    "requested_at",
}


def fail(errors: list[str], message: str) -> None:
    errors.append(message)


def main() -> int:
    errors: list[str] = []

    for path in (ACCOUNT_HTML, ACCOUNT_JS, AUTH_ADAPTER, SCHEMA):
        if not path.is_file():
            fail(errors, f"Missing required Phase 4 file: {path.relative_to(ROOT)}")

    if errors:
        return report(errors)

    html = ACCOUNT_HTML.read_text(encoding="utf-8")
    account_js = ACCOUNT_JS.read_text(encoding="utf-8")
    adapter_js = AUTH_ADAPTER.read_text(encoding="utf-8")

    if not re.search(r'<meta\s+name="robots"\s+content="noindex, nofollow"', html, re.I):
        fail(errors, "account.html must remain noindex, nofollow")
    if re.search(r"<form\b[^>]*\baction\s*=", html, re.I):
        fail(errors, "account preview forms must not have a submission action")
    for script_name in ("script.js", "auth-adapter.js", "account.js"):
        if f'src="{script_name}"' not in html:
            fail(errors, f"account.html must load {script_name}")

    combined_code = account_js + "\n" + adapter_js
    for pattern, message in FORBIDDEN_CODE_PATTERNS.items():
        if re.search(pattern, combined_code, re.I):
            fail(errors, message)

    if "isConfigured: false" not in adapter_js:
        fail(errors, "auth adapter must remain explicitly disabled")
    for method in (
        "requestMagicLink",
        "completeCallback",
        "getSession",
        "signOutCurrentSession",
        "revokeAllSessions",
        "requestExport",
        "requestDeletion",
    ):
        if f"{method}: unavailable" not in adapter_js:
            fail(errors, f"disabled auth adapter is missing {method}")

    try:
        schema = json.loads(SCHEMA.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        fail(errors, f"account operation schema is invalid JSON: {exc}")
        schema = {}

    definitions = schema.get("$defs", {}) if isinstance(schema, dict) else {}
    expected_requests = {
        "exportRequest": ("format", "json"),
        "deletionRequest": ("confirmation", "DELETE"),
        "revokeSessionsRequest": ("scope", "all"),
    }
    for definition, (property_name, constant) in expected_requests.items():
        request_schema = definitions.get(definition)
        if not isinstance(request_schema, dict):
            fail(errors, f"Missing schema definition: {definition}")
            continue
        if request_schema.get("additionalProperties") is not False:
            fail(errors, f"{definition} must reject additional properties")
        if request_schema.get("required") != [property_name]:
            fail(errors, f"{definition} must require only {property_name}")
        properties = request_schema.get("properties", {})
        normalized = {str(key).replace("-", "").lower() for key in properties}
        forbidden = normalized & FORBIDDEN_REQUEST_PROPERTIES
        if forbidden:
            fail(errors, f"{definition} contains forbidden client-owned fields: {sorted(forbidden)}")
        if properties.get(property_name, {}).get("const") != constant:
            fail(errors, f"{definition}.{property_name} must be fixed to {constant!r}")

    error_codes = (
        definitions.get("errorEnvelope", {})
        .get("properties", {})
        .get("error", {})
        .get("properties", {})
        .get("code", {})
        .get("enum", [])
    )
    required_codes = {
        "AUTH_REQUIRED",
        "RECENT_AUTH_REQUIRED",
        "INVALID_REQUEST",
        "CONFLICT",
        "RATE_LIMITED",
        "TEMPORARILY_UNAVAILABLE",
    }
    if set(error_codes) != required_codes:
        fail(errors, "error envelope must expose only the approved stable public error codes")

    return report(errors)


def report(errors: list[str]) -> int:
    for error in errors:
        print(f"ERROR: {error}")
    if errors:
        print(f"Phase 4 contract check failed with {len(errors)} error(s).")
        return 1
    print("Phase 4 contract check passed: account preview is disabled, network-free, non-persistent, and minimally contracted.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())