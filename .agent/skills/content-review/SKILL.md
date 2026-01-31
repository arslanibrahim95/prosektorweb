---
name: content-review
description: AI-powered content review and quality assessment using GPT-4 as reviewer.
allowed-tools: Read, Glob, Grep, Bash
---

# Content Review

> Automated content quality assessment and improvement workflow.

---

## 1. Overview

This skill provides GPT-4 powered content review for:
- Quality scoring across multiple criteria
- Actionable feedback generation
- Revision iteration management
- Quality gate integration

---

## 2. Content Map

| File | Purpose |
|------|---------|
| `review-criteria.md` | Detailed review criteria definitions |
| `config/content-thresholds.json` | Quality thresholds and scoring rules |
| `scripts/content_reviewer.py` | Automated review pipeline |

---

## 3. Review Pipeline

```
CONTENT → ANALYZE → SCORE → FEEDBACK → DECISION
   │                                      │
   │         ┌──────────────────┐         │
   │         │ Score < 70?      │─── YES ──┤
   │         └──────────────────┘         │
   │                  │                   │
   │                 NO                   │
   │                  ↓                   │
   │            APPROVED                  │
   │                                      │
   └───────── REVISE (max 2x) ←──────────┘
```

---

## 4. Review Criteria

### Core Criteria

| Criterion | Weight | Description |
|-----------|--------|-------------|
| **accuracy** | 20% | Factual correctness, claims verification |
| **clarity** | 20% | Readability, ease of understanding |
| **tone** | 15% | Appropriate voice for audience |
| **seo** | 15% | Keyword usage, structure, meta elements |
| **engagement** | 15% | Hook, flow, reader retention |
| **eeat** | 15% | E-E-A-T signals (expertise, authority, trust) |

### Content-Type Specific Criteria

| Content Type | Priority Criteria |
|--------------|-------------------|
| Blog | accuracy, engagement, seo |
| Landing | clarity, cta, engagement |
| Product | accuracy, clarity, engagement |
| FAQ | accuracy, clarity, structure |

---

## 5. Scoring System

### Score Bands

| Score Range | Rating | Action |
|-------------|--------|--------|
| 90-100 | Excellent | Approve |
| 80-89 | Good | Approve with minor edits |
| 70-79 | Acceptable | Conditional approve |
| 60-69 | Needs Work | Revise required |
| < 60 | Poor | Reject or major revision |

### Pass Threshold

```python
DEFAULT_PASS_THRESHOLD = 70
```

---

## 6. Usage

### Basic Review

```python
from content_reviewer import ContentReviewer

reviewer = ContentReviewer()
result = reviewer.review(
    content="...",
    content_type="blog"
)

print(f"Score: {result['overall_score']}")
print(f"Passed: {result['passed']}")
```

### With Custom Criteria

```python
result = reviewer.review(
    content="...",
    content_type="landing",
    criteria=["clarity", "cta", "engagement"],
    threshold=75
)
```

### Full Pipeline (Generate + Review + Revise)

```python
from content_reviewer import ContentReviewer
from connector_manager import ConnectorManager

manager = ConnectorManager()
reviewer = ContentReviewer()

# Generate
content = manager.generate(
    content_type="blog",
    prompt="Write about workplace safety..."
)

# Review
review = reviewer.review(content.content, content_type="blog")

# Revise if needed
if not review["passed"]:
    revised = reviewer.revise_content(
        content=content.content,
        feedback=review["improvements"],
        content_type="blog"
    )
```

---

## 7. Review Output Schema

```python
{
    "success": bool,
    "overall_score": int,  # 0-100
    "criteria_scores": {
        "accuracy": {"score": int, "feedback": str},
        "clarity": {"score": int, "feedback": str},
        # ...
    },
    "strengths": [str],
    "improvements": [str],
    "critical_issues": [str],
    "recommendation": "approve" | "revise" | "reject",
    "passed": bool,
    "revision_count": int
}
```

---

## 8. Integration with Quality Gate

The content-review skill integrates with quality-gate for final validation:

```python
# Content review score feeds into quality gate
quality_gate_input = {
    "content_score": review["overall_score"],
    "seo_score": review["criteria_scores"]["seo"]["score"],
    "readability_score": review["criteria_scores"]["clarity"]["score"]
}
```

---

## 9. Best Practices

| Practice | Rationale |
|----------|-----------|
| Review all AI content | Quality consistency |
| Set type-specific thresholds | Different standards per content |
| Limit revision iterations | Avoid infinite loops |
| Log all reviews | Quality tracking over time |
| Human review for critical content | AI is assistive, not final |

---

> **Principle:** Every piece of content should meet quality standards before publication. GPT-4 review is systematic, but human oversight remains essential for critical content.
