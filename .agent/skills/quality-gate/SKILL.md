---
name: quality-gate
description: Quality gate framework for comprehensive project validation before deployment.
allowed-tools: Read, Glob, Grep, Bash
---

# Quality Gate

> Unified quality validation framework with priority-based checks.

---

## 1. Overview

The Quality Gate is a systematic validation system that ensures project quality before deployment. It runs checks in priority order, with blocking checks that must pass before deployment.

---

## 2. Priority Levels

| Priority | Category | Blocking | Checks |
|----------|----------|----------|--------|
| P0 | Security | YES | Vulnerabilities, secrets, dependencies |
| P1 | Lint | YES | Code quality, type safety |
| P2 | Tests | YES | Unit, integration tests |
| P3 | Schema | NO | Database schema validation |
| P4 | UX | NO | User experience audit |
| P5 | SEO/GEO | NO | Search optimization |
| P6 | A11y | NO | Accessibility |
| P7 | Performance | NO | Lighthouse (URL required) |
| P8 | E2E | NO | End-to-end tests (URL required) |

---

## 3. Blocking vs Non-Blocking

### Blocking Checks (P0-P2)
- **Must pass** for deployment
- Run sequentially
- If one fails, remaining are skipped
- Critical for security and stability

### Non-Blocking Checks (P3-P8)
- Run in parallel for speed
- Generate warnings, not blockers
- Still tracked in report
- Should be addressed, not required

---

## 4. Content Map

| File | Purpose |
|------|---------|
| `thresholds.md` | Threshold configuration guide |
| `ci-integration.md` | CI/CD pipeline integration |
| `scripts/quality_report.py` | HTML report generator |
| `config/default-thresholds.json` | Default threshold values |

---

## 5. Usage

### Basic Usage
```bash
# Run all local checks (P0-P6)
python scripts/checklist.py .

# Include performance and E2E (P7-P8)
python scripts/checklist.py . --url https://staging.example.com

# Only blocking checks
python scripts/checklist.py . --max-priority 2

# JSON output for CI
python scripts/checklist.py . --json
```

### Configuration
```bash
# Custom thresholds
python scripts/checklist.py . --config path/to/thresholds.json

# Project-local config (auto-detected)
# Place .quality-gate.json in project root
```

---

## 6. Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Gate passed - safe to deploy |
| 1 | Gate failed - blocking issues exist |

---

## 7. Integration Points

- **CI/CD**: Use `--json` flag for machine-readable output
- **Pre-commit**: Run `--max-priority 1` for quick lint checks
- **Pre-deploy**: Run full suite with `--url` flag
- **Local dev**: Run without URL for quick feedback

---

> **Principle:** Quality is not negotiable. Blocking checks exist for a reason.
