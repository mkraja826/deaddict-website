#!/usr/bin/env python3
"""Static safety checks for the unapplied Phase 3 PostgreSQL/Supabase draft."""

from __future__ import annotations

from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
MIGRATIONS = sorted((ROOT / "supabase" / "migrations").glob("*_phase3_private_foundation.sql"))

REQUIRED_TABLES = (
    "user_profiles",
    "consent_records",
    "goals",
    "checkins",
    "export_requests",
    "deletion_requests",
)

FORBIDDEN_PATTERNS = {
    r"grant\s+all": "broad GRANT ALL is forbidden",
    r"grant[^;]*\bto\s+anon\b": "anon must not receive private-table access",
    r"using\s*\(\s*true\s*\)": "unrestricted RLS USING (true) is forbidden",
    r"with\s+check\s*\(\s*true\s*\)": "unrestricted RLS WITH CHECK (true) is forbidden",
    r"security\s+definer": "SECURITY DEFINER requires a separate privileged-function review",
    r"\b(journal_body|journal_text|free_text|notes?)\s+text\b": "free-text recovery storage is excluded from Phase 3",
    r"\bservice[_ -]?role\b": "service-role credentials or grants must not be embedded in the migration",
}


def executable_sql(source: str) -> str:
    """Remove comments before scanning for executable forbidden patterns."""
    without_blocks = re.sub(r"/\*.*?\*/", "", source, flags=re.DOTALL)
    return re.sub(r"--[^\n]*", "", without_blocks)


def main() -> int:
    errors: list[str] = []

    if len(MIGRATIONS) != 1:
        errors.append(f"Expected exactly one Phase 3 migration, found {len(MIGRATIONS)}")
        sql = ""
    else:
        sql = MIGRATIONS[0].read_text(encoding="utf-8").lower()

    if sql:
        code = executable_sql(sql)

        for table in REQUIRED_TABLES:
            if f"create table public.{table}" not in code:
                errors.append(f"Missing table: public.{table}")
            if f"alter table public.{table} enable row level security" not in code:
                errors.append(f"RLS not enabled for public.{table}")
            if f"alter table public.{table} force row level security" not in code:
                errors.append(f"RLS not forced for public.{table}")
            if f"revoke all on table public.{table} from anon, authenticated" not in code:
                errors.append(f"Default privileges not revoked for public.{table}")

        if code.count("references auth.users(id) on delete cascade") < len(REQUIRED_TABLES):
            errors.append("Every user-owned table must cascade from auth.users")

        if "(select auth.uid()) = user_id" not in code:
            errors.append("Ownership policies must compare auth.uid() with user_id")

        if "prevent_user_id_change" not in code:
            errors.append("Ownership-transfer prevention trigger is missing")

        if "begin;" not in code or not re.search(r"\bcommit;\s*$", code):
            errors.append("Migration must be transaction-wrapped")

        for pattern, message in FORBIDDEN_PATTERNS.items():
            if re.search(pattern, code, flags=re.IGNORECASE | re.DOTALL):
                errors.append(message)

    for error in errors:
        print(f"ERROR: {error}")

    if errors:
        print(f"Phase 3 SQL check failed with {len(errors)} error(s).")
        return 1

    print("Phase 3 SQL check passed: private tables, forced RLS, ownership checks, and restricted grants are present.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
