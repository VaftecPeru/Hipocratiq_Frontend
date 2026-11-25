#!/usr/bin/env python3
"""Fail-closed Mobile CI backend target policy. No network calls or AWS access."""
import ipaddress
import os
import re
import sys
from urllib.parse import urlsplit

NON_UAT_TARGET = "https://hipocratiq-ci.invalid/backend"
REQUIRED_ACKNOWLEDGEMENT = "APPROVED_MOBILE_UAT_NO_PRODUCTION"


def canonical_approved_url(value: str) -> str:
    """Accept a vetted UAT HTTPS backend only; never credentials, production or raw IPs."""
    if not value or not isinstance(value, str) or value != value.strip():
        raise ValueError("UAT backend URL is missing or padded")
    if any(ord(c) < 33 or ord(c) > 126 for c in value):
        raise ValueError("URL contains control or non-ASCII characters")
    try:
        parsed = urlsplit(value)
        host = parsed.hostname or ""
        port = parsed.port
    except ValueError as error:
        raise ValueError("Malformed UAT backend URL") from error
    if (parsed.scheme != "https" or parsed.username is not None
            or parsed.password is not None or parsed.query or parsed.fragment
            or parsed.netloc.endswith(".") or port not in (None, 443)):
        raise ValueError("UAT backend requires plain HTTPS without credentials or custom port")
    if not re.fullmatch(r"[a-z0-9-]+(?:\.[a-z0-9-]+)+", host, re.IGNORECASE):
        raise ValueError("UAT backend requires a DNS hostname")
    labels = host.lower().split(".")
    if any(part.startswith("-") or part.endswith("-") for part in labels):
        raise ValueError("Invalid DNS hostname label")
    if labels[-1] in ("invalid", "localhost", "local", "internal", "test"):
        raise ValueError("Non-public UAT hostname")
    try:
        ipaddress.ip_address(host)
    except ValueError:
        pass
    else:
        raise ValueError("Literal IP host is not an approved UAT domain")
    if not re.search(r"(^|[.-])(uat|qa|staging)([.-]|$)", host, re.IGNORECASE):
        raise ValueError("Hostname does not identify UAT/QA/staging")
    if re.search(r"(^|[.-])(prod|production)([.-]|$)", host, re.IGNORECASE):
        raise ValueError("Production hostnames are forbidden")
    path = parsed.path.rstrip("/")
    if path not in ("", "/backend"):
        raise ValueError("Backend URL may contain only an optional /backend path")
    return "https://" + host.lower() + (path or "")


def resolve_backend(env: dict) -> str:
    event = env.get("GITHUB_EVENT_NAME")
    if event not in ("push", "pull_request", "workflow_dispatch"):
        raise ValueError("Unsupported GitHub Actions event")
    if event != "workflow_dispatch":
        return NON_UAT_TARGET
    if env.get("GITHUB_REF") != "refs/heads/develop":
        raise ValueError("Manual Mobile UAT builds may run only from develop")
    if env.get("UAT_MOBILE_BUILD_ENABLED") != "true":
        raise ValueError("Mobile UAT builds are not approved by repository administrator")
    if env.get("UAT_ACKNOWLEDGEMENT") != REQUIRED_ACKNOWLEDGEMENT:
        raise ValueError("Explicit Mobile UAT approval is missing")
    requested = canonical_approved_url(env.get("UAT_BACKEND_URL", ""))
    approved = canonical_approved_url(env.get("APPROVED_UAT_BACKEND_URL", ""))
    if requested != approved:
        raise ValueError("Requested backend differs from approved GitHub UAT backend")
    return requested


def main() -> int:
    try:
        url = resolve_backend(os.environ)
    except ValueError as error:
        print("::error::Mobile backend validation denied: " + str(error), file=sys.stderr)
        return 1
    destination = os.environ.get("GITHUB_OUTPUT")
    if not destination:
        print("::error::Missing GitHub Actions output path", file=sys.stderr)
        return 1
    with open(destination, "a", encoding="utf-8") as handle:
        handle.write("backend_url=" + url + "\n")
    print("MOBILE_BACKEND_GATE=PASS (no network calls; explicit UAT approval checked)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
