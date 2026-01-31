# Quality Gate Thresholds

> Configuration guide for quality gate threshold values.

---

## 1. Default Thresholds

```json
{
  "security": {
    "max_critical": 0,
    "max_high": 0
  },
  "lint": {
    "must_pass": true
  },
  "tests": {
    "min_coverage": 0,
    "must_pass": true
  },
  "schema": {
    "must_valid": true
  },
  "ux": {
    "min_score": 60
  },
  "seo": {
    "min_score": 60
  },
  "geo": {
    "min_score": 50
  },
  "a11y": {
    "min_score": 70
  },
  "lighthouse": {
    "min_performance": 50,
    "min_accessibility": 70,
    "min_best_practices": 70,
    "min_seo": 70
  },
  "e2e": {
    "must_pass": true
  }
}
```

---

## 2. Threshold Types

### Boolean Thresholds
| Check | Parameter | Default | Description |
|-------|-----------|---------|-------------|
| lint | `must_pass` | true | Lint must pass |
| tests | `must_pass` | true | Tests must pass |
| schema | `must_valid` | true | Schema must validate |
| e2e | `must_pass` | true | E2E must pass |

### Count Thresholds
| Check | Parameter | Default | Description |
|-------|-----------|---------|-------------|
| security | `max_critical` | 0 | Max critical vulnerabilities |
| security | `max_high` | 0 | Max high vulnerabilities |

### Score Thresholds
| Check | Parameter | Default | Description |
|-------|-----------|---------|-------------|
| ux | `min_score` | 60 | Minimum UX score (0-100) |
| seo | `min_score` | 60 | Minimum SEO score (0-100) |
| geo | `min_score` | 50 | Minimum GEO score (0-100) |
| a11y | `min_score` | 70 | Minimum accessibility score |

### Lighthouse Thresholds
| Parameter | Default | Description |
|-----------|---------|-------------|
| `min_performance` | 50 | Performance score minimum |
| `min_accessibility` | 70 | Accessibility score minimum |
| `min_best_practices` | 70 | Best practices minimum |
| `min_seo` | 70 | SEO score minimum |

---

## 3. Configuration Methods

### Method 1: Project-Local Config
Create `.quality-gate.json` in project root:

```json
{
  "security": {
    "max_critical": 0,
    "max_high": 2
  },
  "lighthouse": {
    "min_performance": 80
  }
}
```

### Method 2: CLI Config Path
```bash
python scripts/checklist.py . --config /path/to/config.json
```

### Method 3: CI Environment
```yaml
# GitHub Actions example
- name: Quality Gate
  run: |
    python scripts/checklist.py . --config .ci/quality-thresholds.json --json
```

---

## 4. Recommended Thresholds by Project Type

### Production SaaS
```json
{
  "security": { "max_critical": 0, "max_high": 0 },
  "lighthouse": { "min_performance": 80, "min_accessibility": 90 },
  "a11y": { "min_score": 90 }
}
```

### Internal Tool
```json
{
  "security": { "max_critical": 0, "max_high": 5 },
  "lighthouse": { "min_performance": 50 },
  "a11y": { "min_score": 60 }
}
```

### MVP / Prototype
```json
{
  "security": { "max_critical": 0 },
  "lint": { "must_pass": false },
  "ux": { "min_score": 40 }
}
```

---

## 5. Adjusting Thresholds

### When to Lower
- Early development stage
- Prototype phase
- Non-critical internal tools
- Legacy codebase migration

### When to Raise
- Production-ready applications
- Public-facing services
- Regulated industries
- High-traffic systems

---

> **Warning:** Never set `security.max_critical` above 0 for production deployments.
