# Context / Problem
<!-- What problem are you trying to solve? Link the issue/ticket if applicable. -->

# Solution
<!-- High-level summary of your changes. NOT a copy-paste of the commit message. -->

# Implementation Details
<!-- Critical or complex changes that require specific attention from reviewers. -->

# Testing
<!-- How was this tested? Unit tests, manual scenarios, etc. -->
- [ ] Unit Tests pass
- [ ] Manual verification (describe steps below)

# Risks
<!-- Breaking changes? Database migrations? Performance impacts? -->

# Self-Review Checklist
- [ ] I have performed a self-review of my code
- [ ] I have commented hard-to-understand areas
- [ ] My changes generate no new warnings/lint errors
- [ ] I have added tests that prove my fix is effective or that my feature works

# Vibe Coding Edge Case Checklist 🛡️
<!-- Mark checked items as done. If N/A, explain why in comments. -->

- [ ] **String:** Emojis, Unicode, ZWJ, RTL text handled?
- [ ] **Numbers:** Tested with 0, negative, NaN, Infinity?
- [ ] **Collections:** Empty array, null, undefined handled?
- [ ] **Concurrent:** Race conditions, double-submit protection?
- [ ] **Navigation:** Back button, Multi-tab, Refresh safety?
- [ ] **Limits:** Pagination bounds, Integer overflow, Payload size?
- [ ] **Null Handling:** `null` vs `undefined` vs `""` checked?
- [ ] **Security:** Input sanitized? DevTools bypass checked?
