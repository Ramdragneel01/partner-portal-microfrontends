---
name: "review"
description: "Review changed code for bugs, regressions, security risks, accessibility issues, and missing tests."
argument-hint: "[optional scope or path]"
agent: "agent"
---

Perform a code review for: $ARGUMENTS

Workflow:
1. Inspect changed files first, then directly related shared library code.
2. Prioritize findings by severity: critical, high, medium, low.
3. Focus on correctness, security, accessibility, and regression risk.
4. Call out missing or weak tests.
5. Suggest concrete remediation steps with file references.

Output contract:
- Findings first, ordered by severity.
- Include why it matters and how to fix.
- If no findings, state that explicitly and list residual risks or testing gaps.
