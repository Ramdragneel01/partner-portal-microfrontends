---
name: "fix-issue"
description: "Implement a complete issue fix with root-cause analysis, tests, and validation."
argument-hint: "[issue id or problem statement]"
agent: "agent"
---

Fix issue input: $ARGUMENTS

Workflow:
1. Reproduce or clearly infer the failure mode.
2. Identify root cause before editing code.
3. Implement the smallest safe change set.
4. Add or update regression tests.
5. Run appropriate validation commands.
6. Summarize cause, fix, and verification evidence.

Guardrails:
- Preserve app and library boundaries.
- Avoid unrelated refactors unless required for correctness.
- Keep security and accessibility behavior intact.
