#!/usr/bin/env python3
"""Validate that Phase 5 remains fail-closed and contains no live deployment configuration."""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONFIG_PATH = ROOT / "config" / "runtime-config.disabled.json"
SCHEMA_PATH = ROOT / "contracts" / "runtime-config.schema.json"
SERVER_PATH = ROOT / "server" / "disabled-account-operations.mjs"

FALSE_FLAGS = (
    "publicClientKeyConfigured",
    "serverSecretsConfigured",
    "emailDeliveryConfigured",
    "migrationApplied",
    "authEnabled",
    "persistenceEnabled",
    "exportEnabled",
    "deletionEnabled",
    "sessionRevocationEnabled",
    "incidentOwnerConfigured",
)

FORBIDDEN_SERVER_PATTERNS = {
    r"\bfetch\s*\(": "network fetch is forbidden in disabled server scaffolding",
    r"\bXMLHttpRequest\b": "XMLHttpRequest is forbidden",
    r"\bWebSocket\b": "WebSocket is forbidden",
    r"\bEventSource\b": "server-sent events are forbidden",
    r"\bcreateClient\s*\(": "provider clients must not be created",
    r"supabase\.co": "live Supabase hostnames must not be embedded",
    r"service[_-]?role": "service-role material must not be embedded",
    r"eyJ[A-Za-z0-9_-]{20,}": "JWT-like material must not be embedded",
    r"https?://": "live URLs must not be embedded in disabled handlers",
}


def load_json(path: Path, errors: list[str]) -> object:
    if not path.exists():
        errors.append(f"Missing required JSON file: {path.relative_to(ROOT)}")
        return {}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        errors.append(f"Invalid JSON in {path.relative_to(ROOT)}: {exc}")
        return {}


def main() -> int:
    errors: list[str] = []
    config = load_json(CONFIG_PATH, errors)
    schema = load_json(SCHEMA_PATH, errors)

    if isinstance(config, dict):
        if config.get("deploymentMode") != "disabled":
            errors.append("deploymentMode must remain disabled")
        if config.get("publicOrigin") is not None:
            errors.append("publicOrigin must remain null")
        if config.get("allowedRedirectOrigins") != []:
            errors.append("allowedRedirectOrigins must remain empty")
        if config.get("backendProvider") is not None:
            errors.append("backendProvider must remain null")
        if config.get("backendProjectRef") is not None:
            errors.append("backendProjectRef must remain null")
        if config.get("approvedConsentVersions") != []:
            errors.append("approvedConsentVersions must remain empty until approval")
        for flag in FALSE_FLAGS:
            if config.get(flag) is not False:
                errors.append(f"{flag} must remain false")

    if isinstance(schema, dict):
        if schema.get("additionalProperties") is not False:
            errors.append("Runtime schema must reject additional properties")
        properties = schema.get("properties", {})
        required = set(schema.get("required", []))
        expected = {
            "deploymentMode",
            "publicOrigin",
            "allowedRedirectOrigins",
            "backendProvider",
            "backendProjectRef",
            *FALSE_FLAGS,
            "approvedConsentVersions",
        }
        missing = sorted(expected - required)
        if missing:
            errors.append(f"Runtime schema missing required fields: {', '.join(missing)}")
        if not expected.issubset(set(properties)):
            errors.append("Runtime schema does not define every expected field")

    if not SERVER_PATH.exists():
        errors.append("Missing disabled server operation scaffold")
    else:
        server = SERVER_PATH.read_text(encoding="utf-8")
        if "DEPLOYMENT_NOT_CONFIGURED" not in server:
            errors.append("Disabled server scaffold must return DEPLOYMENT_NOT_CONFIGURED")
        for operation in (
            "completeAuthCallback",
            "requestExport",
            "requestDeletion",
            "revokeAllSessions",
        ):
            if operation not in server:
                errors.append(f"Missing disabled operation: {operation}")
        for pattern, message in FORBIDDEN_SERVER_PATTERNS.items():
            if re.search(pattern, server, flags=re.IGNORECASE):
                errors.append(message)

    for relative in (
        "PHASE_5_PLAN.md",
        "docs/SECRET_AND_RUNTIME_BOUNDARY.md",
        "docs/DEPLOYMENT_APPROVAL_CHECKLIST.md",
    ):
        if not (ROOT / relative).exists():
            errors.append(f"Missing Phase 5 document: {relative}")

    for error in errors:
        print(f"ERROR: {error}")

    if errors:
        print(f"Phase 5 deployment guard failed with {len(errors)} error(s).")
        return 1

    print("Phase 5 deployment guard passed: runtime disabled, origins empty, flags false, handlers inert, and no live provider configuration present.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
