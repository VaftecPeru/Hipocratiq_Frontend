"""Offline security regression tests for Mobile CI backend selection."""
import unittest

from resolve_backend import NON_UAT_TARGET, canonical_approved_url, resolve_backend

GOOD = {
    "GITHUB_EVENT_NAME": "workflow_dispatch",
    "GITHUB_REF": "refs/heads/develop",
    "UAT_MOBILE_BUILD_ENABLED": "true",
    "UAT_ACKNOWLEDGEMENT": "APPROVED_MOBILE_UAT_NO_PRODUCTION",
    "UAT_BACKEND_URL": "https://api-uat.hipocratiq.com/backend",
    "APPROVED_UAT_BACKEND_URL": "https://api-uat.hipocratiq.com/backend",
}


class MobileUatBackendTests(unittest.TestCase):
    def test_only_approved_exact_uat_target(self):
        self.assertEqual(resolve_backend(GOOD), GOOD["UAT_BACKEND_URL"])

    def test_pr_and_push_always_build_debug_against_invalid_backend(self):
        for event in ("push", "pull_request"):
            with self.subTest(event=event):
                self.assertEqual(resolve_backend({
                    **GOOD, "GITHUB_EVENT_NAME": event,
                    "UAT_BACKEND_URL": "https://api-uat.attacker.example/backend",
                }), NON_UAT_TARGET)

    def test_manual_build_requires_develop_branch(self):
        for ref in ("refs/heads/main", "refs/heads/qa/uat", "refs/tags/v1"):
            with self.subTest(ref=ref), self.assertRaises(ValueError):
                resolve_backend({**GOOD, "GITHUB_REF": ref})

    def test_manual_build_requires_admin_and_explicit_acknowledgement(self):
        for key, invalid in [
            ("UAT_MOBILE_BUILD_ENABLED", "false"),
            ("UAT_MOBILE_BUILD_ENABLED", ""),
            ("UAT_ACKNOWLEDGEMENT", "yes"),
            ("APPROVED_UAT_BACKEND_URL", ""),
        ]:
            with self.subTest(key=key), self.assertRaises(ValueError):
                resolve_backend({**GOOD, key: invalid})

    def test_other_uat_hostname_does_not_override_approved_url(self):
        for candidate in (
            "https://api-uat.attacker.example/backend",
            "https://qa.hipocratiq.com/backend",
            "https://api-uat.hipocratiq.com/secret",
            "https://api-uat.hipocratiq.com/backend?otp=123456",
        ):
            with self.subTest(candidate=candidate), self.assertRaises(ValueError):
                resolve_backend({**GOOD, "UAT_BACKEND_URL": candidate})

    def test_production_credentials_http_invalid_and_custom_ports_rejected(self):
        for candidate in (
            "https://hipocratiq.com/backend",
            "https://api.hipocratiq.com/backend",
            "https://prod-uat.hipocratiq.com/backend",
            "https://qa-production.example/backend",
            "https://uat.example.invalid/backend",
            "https://qa.local/backend",
            "http://api-uat.hipocratiq.com/backend",
            "https://user:password@api-uat.hipocratiq.com/backend",
            "https://api-uat.hipocratiq.com:8443/backend",
            "https://api-uat.hipocratiq.com/#fragment",
            "https://127.0.0.1/backend",
            "https://api-uat.hipocratiq.com/backend%0aattack",
        ):
            with self.subTest(candidate=candidate), self.assertRaises(ValueError):
                canonical_approved_url(candidate)

    def test_unapproved_event_rejected(self):
        with self.assertRaises(ValueError):
            resolve_backend({"GITHUB_EVENT_NAME": "schedule"})

    def test_normalize_default_tls_port(self):
        self.assertEqual(
            canonical_approved_url("https://API-UAT.HIPOCRATIQ.COM:443/backend/"),
            GOOD["UAT_BACKEND_URL"],
        )


if __name__ == "__main__":
    unittest.main()
