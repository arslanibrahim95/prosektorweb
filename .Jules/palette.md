## 2026-01-31 - Accessible Password Toggle & Localization
**Learning:** Password toggle buttons are often inaccessible (missing tabIndex, label). In this repo, fixing it required addressing localization ambiguity (Turkish vs English). Hardcoding English is safer for generic components but contradicts existing Turkish hardcoding. Also, replaced raw SVGs with Lucide icons for consistency.
**Action:** Always check for keyboard accessibility on interactive icons. Check project locale strategy before hardcoding labels.
