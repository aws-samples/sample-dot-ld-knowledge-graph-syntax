#!/usr/bin/env python3
# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0
"""Update the CSP script hash in index.html after editing its inline <script>.

The Content Security Policy only allows the inline app script whose SHA-256 hash
it lists. Any edit to that script changes the hash, so run this afterwards:

    python3 update-csp-hash.py           # rewrite the hash in index.html
    python3 update-csp-hash.py --check   # exit 1 if the hash is out of date (for CI)
"""
import base64
import hashlib
import pathlib
import re
import sys

HTML = pathlib.Path(__file__).with_name("index.html")

# The inline app script is the only <script> element without attributes; its opening tag sits on its own line.
INLINE_SCRIPT = re.compile(r"^[ \t]*<script>(.*?)</script>", re.S | re.M)
CSP_HASH = re.compile(r"'sha256-[^']*'")


def main() -> int:
    html = HTML.read_text(encoding="utf-8")
    scripts = INLINE_SCRIPT.findall(html)
    if len(scripts) != 1:
        print(f"Expected exactly one inline <script>, found {len(scripts)}", file=sys.stderr)
        return 2

    digest = hashlib.sha256(scripts[0].encode("utf-8")).digest()
    expected = f"'sha256-{base64.b64encode(digest).decode()}'"

    current = CSP_HASH.findall(html)
    if len(current) != 1:
        print(f"Expected exactly one 'sha256-...' source in the CSP, found {len(current)}", file=sys.stderr)
        return 2

    if current[0] == expected:
        print(f"CSP hash is up to date: {expected}")
        return 0

    if "--check" in sys.argv[1:]:
        print(f"CSP hash is out of date. Expected {expected}, found {current[0]}", file=sys.stderr)
        return 1

    HTML.write_text(CSP_HASH.sub(expected, html, count=1), encoding="utf-8")
    print(f"Updated CSP hash to {expected}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
