---
name: fix-issue
description: Implement a complete issue fix with tests and verification steps. Use for repeatable bug-fix workflow.
disable-model-invocation: true
argument-hint: "[issue-id-or-problem-statement]"
---

Issue input: $ARGUMENTS

Workflow:
1. Reproduce and isolate the problem.
2. Identify root cause before editing code.
3. Implement the smallest safe change that resolves the issue.
4. Add or update tests covering the regression.
5. Run lint, tests, and targeted build commands.
6. Summarize what changed, why it is safe, and how it was verified.

Quality gates:
- Preserve architecture boundaries and shared library rules.
- Keep security and accessibility behavior intact.
- Avoid unrelated refactors unless required for the fix.
