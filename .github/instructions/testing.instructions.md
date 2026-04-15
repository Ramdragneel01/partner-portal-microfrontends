---
name: "Testing Rules"
description: "Use when creating or updating Vitest and Testing Library tests for apps or shared libraries."
applyTo: "{apps,libs,test}/**/*.{ts,tsx}"
---

# Testing Rules

## Defaults
- Use Vitest and Testing Library.
- Test behavior over implementation details.
- Prefer semantic selectors: getByRole, getByLabelText, getByText.

## Coverage expectations
- Add regression tests for bug fixes.
- Add shared library tests when behavior changes in libs/shared.
- Include accessibility assertions for reusable UI components.

## Stability rules
- Keep tests deterministic and avoid flaky timing assumptions.
- For event-bus tests, avoid duplicate identical payloads inside the dedupe window.

## Command guidance
- Run tests from repository root so @shared aliases resolve.
- Use npm test for suite checks and npm run test:coverage for coverage validation.
