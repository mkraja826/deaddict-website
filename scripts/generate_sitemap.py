#!/usr/bin/env python3
"""Generate sitemap.xml after the final production origin is known."""

from __future__ import annotations

import argparse
from pathlib import Path
from urllib.parse import urljoin, urlsplit
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parents[1]
PUBLIC_PAGES = ["index.html", "support-alcohol.html", "pricing.html"]


def parse_origin(value: str) -> str:
    origin = value.rstrip("/") + "/"
    parsed = urlsplit(origin)
    if parsed.scheme != "https" or not parsed.netloc or parsed.path != "/":
        raise argparse.ArgumentTypeError("origin must look like https://example.com")
    return origin


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("origin", type=parse_origin, help="Production origin, for example https://example.com")
    parser.add_argument("--output", default="sitemap.xml")
    args = parser.parse_args()

    missing = [page for page in PUBLIC_PAGES if not (ROOT / page).exists()]
    if missing:
        parser.error(f"missing public page(s): {', '.join(missing)}")

    urls = []
    for page in PUBLIC_PAGES:
        path = "" if page == "index.html" else page
        urls.append(urljoin(args.origin, path))

    rows = "\n".join(f"  <url><loc>{escape(url)}</loc></url>" for url in urls)
    xml = f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{rows}\n</urlset>\n'
    output = ROOT / args.output
    output.write_text(xml, encoding="utf-8")
    print(f"Wrote {output.relative_to(ROOT)} with {len(urls)} URL(s).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
