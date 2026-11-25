"""Contract tests for a PROPOSED GitHub Ruleset; no API writes or admin tokens."""
import copy
import json
from pathlib import Path
import unittest

RULESET = Path(__file__).resolve().parents[2] / "infra/github/frontend-develop-ruleset.json"
EXACT_STATUS_CHECKS = {
    ("Frontend CI", 15368),
    ("Frontend E2E role routing", 15368),
}


def validate_policy(ruleset):
    if set(ruleset) != {
        "name", "target", "enforcement", "conditions", "bypass_actors", "rules"
    }:
        raise ValueError("Unexpected policy root fields")
    if (ruleset["name"] != "HIPOCRATIQ-Frontend-Protect-Develop"
            or ruleset["target"] != "branch"
            or ruleset["enforcement"] != "active"):
        raise ValueError("Ruleset must protect frontend develop")
    if ruleset["conditions"] != {
        "ref_name": {"include": ["refs/heads/develop"], "exclude": []}
    }:
        raise ValueError("Ruleset must be scoped ONLY to develop")
    if ruleset["bypass_actors"] != []:
        raise ValueError("Any bypass must be separately reviewed")

    rules = ruleset["rules"]
    required_types = {
        "deletion", "non_fast_forward", "pull_request", "required_status_checks"
    }
    if not isinstance(rules, list) or len(rules) != len(required_types):
        raise ValueError("Exactly four branch protection rules are required")
    lookup = {rule["type"]: rule for rule in rules}
    if set(lookup) != required_types:
        raise ValueError("Branch protection rule missing or duplicated")
    if lookup["deletion"] != {"type": "deletion"}:
        raise ValueError("No extra deletion rule fields permitted")
    if lookup["non_fast_forward"] != {"type": "non_fast_forward"}:
        raise ValueError("No extra non-fast-forward fields permitted")

    pr = lookup["pull_request"]["parameters"]
    if (pr.get("required_approving_review_count", 0) < 1
            or pr.get("dismiss_stale_reviews_on_push") is not True
            or pr.get("require_last_push_approval") is not True
            or pr.get("required_review_thread_resolution") is not True
            or pr.get("require_extra_approval_for_unattributed_changes") is not True
            or pr.get("require_code_owner_review") is not False
            or pr.get("required_reviewers") != []
            or sorted(pr.get("allowed_merge_methods", [])) != ["merge", "squash"]):
        raise ValueError("Independent, fresh review and resolved comments required")

    checks = lookup["required_status_checks"]["parameters"]
    if (checks.get("strict_required_status_checks_policy") is not True
            or checks.get("do_not_enforce_on_create") is not False):
        raise ValueError("Status check enforcement must be strict")
    values = checks.get("required_status_checks")
    if not isinstance(values, list) or len(values) != len(EXACT_STATUS_CHECKS):
        raise ValueError("Exactly the verified CI and E2E contexts required")
    actual = {(x.get("context"), x.get("integration_id")) for x in values}
    if actual != EXACT_STATUS_CHECKS:
        raise ValueError("Only verified GitHub Actions CI and E2E checks allowed")
    if any(set(x) != {"context", "integration_id"} for x in values):
        raise ValueError("Status check entries must have exact shape")
    return True


class FrontendDevelopRulesetContract(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.rules = json.loads(RULESET.read_text(encoding="utf-8"))

    def test_proposed_ruleset_is_safe_and_admin_only(self):
        self.assertTrue(validate_policy(self.rules))

    def test_rejects_main_wildcards_disabled_and_bypass(self):
        edits = [
            ("conditions", {"ref_name": {"include": ["refs/heads/main"], "exclude": []}}),
            ("conditions", {"ref_name": {"include": ["~ALL"], "exclude": []}}),
            ("enforcement", "disabled"),
            ("enforcement", "evaluate"),
            ("bypass_actors", [{"actor_id": 1, "actor_type": "Team", "bypass_mode": "always"}]),
        ]
        for key, value in edits:
            with self.subTest(key=key, value=str(value)):
                changed = copy.deepcopy(self.rules)
                changed[key] = value
                with self.assertRaises(ValueError):
                    validate_policy(changed)

    def test_rejects_missing_review_stale_review_and_force_push(self):
        for key, value in (
            ("required_approving_review_count", 0),
            ("dismiss_stale_reviews_on_push", False),
            ("require_last_push_approval", False),
            ("required_review_thread_resolution", False),
        ):
            changed = copy.deepcopy(self.rules)
            pr = next(r for r in changed["rules"] if r["type"] == "pull_request")
            pr["parameters"][key] = value
            with self.subTest(key=key), self.assertRaises(ValueError):
                validate_policy(changed)
        changed = copy.deepcopy(self.rules)
        changed["rules"] = [r for r in changed["rules"] if r["type"] != "non_fast_forward"]
        with self.assertRaises(ValueError):
            validate_policy(changed)

    def test_rejects_missing_e2e_or_unverified_no_go_release_checks(self):
        for status in (
            [{"context": "Frontend CI", "integration_id": 15368}],
            [{"context": "Frontend CI", "integration_id": 15368},
             {"context": "Frontend release NO-GO evidence", "integration_id": 15368}],
            [{"context": "Frontend CI", "integration_id": 1234},
             {"context": "Frontend E2E role routing", "integration_id": 15368}],
        ):
            changed = copy.deepcopy(self.rules)
            c = next(r for r in changed["rules"] if r["type"] == "required_status_checks")
            c["parameters"]["required_status_checks"] = status
            with self.assertRaises(ValueError):
                validate_policy(changed)


if __name__ == "__main__":
    unittest.main()
