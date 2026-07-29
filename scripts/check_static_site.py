#!/usr/bin/env python3
"""Dependency-free integrity checks for the DeAddict static prototype."""

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
        self.ids: set[str] = set()
        self.has_title = False
        self.has_description = False
        self.has_viewport = False
        self.has_stylesheet = False
        self.has_script = False
        self.has_favicon = False
        self.canonicals: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = {name: value for name, value in attrs}
        element_id = values.get("id")
        if element_id:
            self.ids.add(element_id)
        if tag == "title":
            self.has_title = True
        if tag == "meta" and values.get("name") == "description" and values.get("content"):
            self.has_description = True
        if tag == "meta" and values.get("name") == "viewport" and values.get("content"):
            self.has_viewport = True
        if tag == "link" and values.get("rel") == "stylesheet":
            self.has_stylesheet = True
        if tag == "link" and values.get("rel") == "icon":
            self.has_favicon = True
        if tag == "link" and values.get("rel") == "canonical" and values.get("href"):
            self.canonicals.append(values["href"] or "")
        if tag == "script" and values.get("src"):
            self.has_script = True
        for attribute in ("href", "src"):
            value = values.get(attribute)
            if value:
                self.links.append(value)


def resolve_local_target(page: Path, raw_url: str) -> tuple[Path | None, str]:
    parsed = urlsplit(raw_url)
    if parsed.scheme in SKIP_SCHEMES or parsed.netloc:
        return None, parsed.fragment
    path_text = unquote(parsed.path)
    if not path_text:
        return page.resolve(), parsed.fragment
    if path_text.startswith("/"):
        target = ROOT / path_text.lstrip("/")
    else:
        target = page.parent / path_text
    if path_text.endswith("/"):
        target /= "index.html"
    return target.resolve(), parsed.fragment


def main() -> int:
    errors: list[str] = []
    warnings: list[str] = []

    required_files = [
        "index.html",
        "styles.css",
        "script.js",
        "robots.txt",
        "site.webmanifest",
        "favicon.svg",
        "_headers",
        "README.md",
    ]
    for relative in required_files:
        if not (ROOT / relative).exists():
            errors.append(f"Missing required file: {relative}")

    parsed_pages: dict[Path, PageParser] = {}
    sources: dict[Path, str] = {}
    for page in HTML_FILES:
        source = page.read_text(encoding="utf-8")
        parser = PageParser()
        parser.feed(source)
        parsed_pages[page.resolve()] = parser
        sources[page.resolve()] = source

    for page in HTML_FILES:
        resolved_page = page.resolve()
        parser = parsed_pages[resolved_page]
        source = sources[resolved_page]

        if not parser.has_title:
            errors.append(f"{page.name}: missing <title>")
        if not parser.has_description:
            errors.append(f"{page.name}: missing meta description")
        if not parser.has_viewport:
            errors.append(f"{page.name}: missing viewport meta tag")
        if not parser.has_stylesheet:
            errors.append(f"{page.name}: missing stylesheet link")
        if not parser.has_script:
            warnings.append(f"{page.name}: no shared script loaded")
        if not parser.has_favicon:
            warnings.append(f"{page.name}: no favicon link")

        if "deaddict.example" in source:
            errors.append(f"{page.name}: contains placeholder production domain")
        if "$[" in source:
            errors.append(f"{page.name}: contains pricing placeholder")
        if 'href="#"' in source or "href='#'" in source:
            errors.append(f"{page.name}: contains dead href=# link")

        for canonical in parser.canonicals:
            parsed = urlsplit(canonical)
            if parsed.scheme != "https" or not parsed.netloc:
                errors.append(f"{page.name}: canonical must be an absolute HTTPS URL or omitted")

        for raw_url in parser.links:
            target, fragment = resolve_local_target(page, raw_url)
            if target is None:
                continue
            if ROOT not in target.parents and target != ROOT:
                errors.append(f"{page.name}: local link escapes repository: {raw_url}")
                continue
            if not target.exists():
                errors.append(f"{page.name}: missing local target for {raw_url}")
                continue
            if fragment and target.suffix == ".html":
                target_parser = parsed_pages.get(target)
                if target_parser and fragment not in target_parser.ids:
                    errors.append(f"{page.name}: missing fragment #{fragment} in {target.name}")

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
