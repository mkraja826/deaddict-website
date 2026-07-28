#!/usr/bin/env python3
"""Small dependency-free integrity check for the DeAddict static prototype."""

from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
HTML_FILES = sorted(ROOT.glob("*.html"))
SKIP_SCHEMES = {"http", "https", "mailto", "tel", "data", "javascript"}


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.links: list[str] = []
        self.has_title = False
        self.has_description = False
        self.has_viewport = False

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = {name: value for name, value in attrs}
        if tag == "title":
            self.has_title = True
        if tag == "meta" and values.get("name") == "description" and values.get("content"):
            self.has_description = True
        if tag == "meta" and values.get("name") == "viewport" and values.get("content"):
            self.has_viewport = True
        for attribute in ("href", "src"):
            value = values.get(attribute)
            if value:
                self.links.append(value)


def resolve_local_target(page: Path, raw_url: str) -> Path | None:
    if raw_url.startswith("#"):
        return None

    parsed = urlsplit(raw_url)
    if parsed.scheme in SKIP_SCHEMES or parsed.netloc:
        return None

    path_text = unquote(parsed.path)
    if not path_text:
        return None

    if path_text.startswith("/"):
        target = ROOT / path_text.lstrip("/")
    else:
        target = page.parent / path_text

    if path_text.endswith("/"):
        target /= "index.html"

    return target.resolve()


def main() -> int:
    errors: list[str] = []
    warnings: list[str] = []

    required_files = [
        ROOT / "index.html",
        ROOT / "styles.css",
        ROOT / "script.js",
        ROOT / "robots.txt",
        ROOT / "site.webmanifest",
        ROOT / "favicon.svg",
    ]
    for required in required_files:
        if not required.exists():
            errors.append(f"Missing required file: {required.relative_to(ROOT)}")

    for page in HTML_FILES:
        source = page.read_text(encoding="utf-8")
        parser = PageParser()
        parser.feed(source)

        if not parser.has_title:
            errors.append(f"{page.name}: missing <title>")
        if not parser.has_description and page.name not in {"dashboard.html", "checkin.html"}:
            warnings.append(f"{page.name}: missing meta description")
        if not parser.has_viewport:
            errors.append(f"{page.name}: missing viewport meta tag")

        if "deaddict.example" in source:
            warnings.append(f"{page.name}: source canonical still awaits the final production domain")
        if "$[" in source:
            warnings.append(f"{page.name}: source contains a pricing placeholder hidden by Phase 1 runtime messaging")

        for raw_url in parser.links:
            target = resolve_local_target(page, raw_url)
            if target is None:
                continue
            if ROOT not in target.parents and target != ROOT:
                errors.append(f"{page.name}: local link escapes repository: {raw_url}")
                continue
            if not target.exists():
                errors.append(f"{page.name}: missing local target for {raw_url}")

    for warning in warnings:
        print(f"WARNING: {warning}")
    for error in errors:
        print(f"ERROR: {error}")

    if errors:
        print(f"Static-site check failed with {len(errors)} error(s).")
        return 1

    print(f"Static-site check passed for {len(HTML_FILES)} HTML page(s) with {len(warnings)} warning(s).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
