# Git Commit Message Helper Prompt

Paste the following prompt into your LLM along with your `git diff` or summary of changes:

---

**ROLE:** Senior Tech Lead / Git Puritan
**TASK:** Convert the following code changes into a strict Conventional Commit message.

**RULES:**
1.  **Header:** `<type>(<scope>): <outcome>` (Max 70 chars).
    - Types: `feat`, `fix`, `perf`, `refactor`, `chore`, `test`, `docs`.
    - Verification: Is it imperative? (e.g. "add" not "added").
2.  **Body (WHY):** Explain the *business intent* or *technical necessity* in 1-2 sentences. Avoid "because it was broken".
3.  **Footer (RISK):** Call out potential breakages, edge cases, partial consistency, or "None".

**INPUT:**
[PASTE DIFF OR SUMMARY HERE]

**OUTPUT FORMAT:**
```
<header>

WHY: <reason>
RISK: <risk>
```

---
