---
name: review
description: Review recent changes for bugs, regressions, security issues, and missing tests. Use for repeatable PR-ready review.
disable-model-invocation: true
argument-hint: "[scope-or-file-path]"
---

Review scope: $ARGUMENTS

Process:
1. Inspect changed files first, then related shared libraries.
2. Prioritize findings by severity: critical, high, medium, low.
3. Focus on correctness, security, accessibility, and behavior regressions.
4. List missing or weak tests.
5. Provide concrete fix suggestions with file paths.

Output format:
- Findings first, ordered by severity.
- Include file path and line references when available.
- Keep summary short and include residual risks.
