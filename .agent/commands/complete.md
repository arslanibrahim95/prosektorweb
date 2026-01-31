---
description: Project completion and quality gate validation command. Runs comprehensive checks before deployment.
---

# /complete - Quality Gate Validation

$ARGUMENTS

---

## Purpose

This command runs the Quality Gate to validate project readiness for deployment. It executes priority-based checks and generates reports.

---

## Sub-commands

```
/complete check          - Run all quality checks (P0-P6)
/complete check --url    - Full suite including performance & E2E (P0-P8)
/complete report         - Generate HTML quality report
/complete config         - Show/edit threshold configuration
/complete status         - Show last gate status
```

---

## Behavior

### /complete check

Runs the master quality gate script with priority-based execution:

1. **Execute blocking checks (P0-P2)**
   - Security scan
   - Lint and type checking
   - Test suite
   - If ANY fails, STOP and report

2. **Execute non-blocking checks (P3-P6)**
   - Schema validation
   - UX audit
   - SEO/GEO checks
   - Accessibility audit

3. **Generate report**
   - Summary of all checks
   - Pass/fail status
   - Exit code for CI/CD

### /complete check --url <URL>

Includes performance and E2E checks:
- Lighthouse audit (P7)
- Playwright E2E tests (P8)

---

## Output Format

### Terminal Output
```
QUALITY GATE REPORT
======================================================================
  Project:  /path/to/project
  Time:     2024-01-15T10:30:00
  Duration: 12345ms
======================================================================

  P0 (BLOCKING)
  --------------------------------------------------------------------
    [PASS] Security Scan                           1234ms

  P1 (BLOCKING)
  --------------------------------------------------------------------
    [PASS] Lint & Type Check                       2345ms

  P2 (BLOCKING)
  --------------------------------------------------------------------
    [PASS] Test Suite                              3456ms

  P3
  --------------------------------------------------------------------
    [PASS] Schema Validation                        567ms

  P4
  --------------------------------------------------------------------
    [WARN] UX Audit                                 890ms
           -> Score 55 below minimum 60

  P5
  --------------------------------------------------------------------
    [PASS] SEO Check                                432ms
    [PASS] GEO Check                                321ms

======================================================================
  SUMMARY
======================================================================
  Total Checks:      8
  Passed:            7
  Failed:            1
  Skipped:           0
  Blocking Failures: 0
======================================================================

  [PASS] QUALITY GATE PASSED

```

### JSON Output (for CI)
```bash
python scripts/checklist.py . --json
```

---

## Examples

```
/complete check
/complete check --url https://staging.myapp.com
/complete report
/complete config
```

---

## Priority Reference

| Priority | Check | Blocking |
|----------|-------|----------|
| P0 | Security | YES |
| P1 | Lint | YES |
| P2 | Tests | YES |
| P3 | Schema | NO |
| P4 | UX | NO |
| P5 | SEO/GEO | NO |
| P6 | A11y | NO |
| P7 | Lighthouse | NO |
| P8 | E2E | NO |

---

## Configuration

### Project-Local Config
Create `.quality-gate.json`:
```json
{
  "security": { "max_critical": 0 },
  "lighthouse": { "min_performance": 80 }
}
```

### View Current Thresholds
```
/complete config
```

---

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Gate passed - safe to deploy |
| 1 | Gate failed - blocking issues exist |

---

## Key Principles

- **Blocking checks are non-negotiable**
- **Run full suite before production deploy**
- **Address warnings even if gate passes**
- **Use JSON output for CI/CD integration**
