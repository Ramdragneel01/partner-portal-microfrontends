---
description: Testing standards for Vitest and Testing Library in this monorepo.
paths:
  - apps/**
  - libs/**
  - test/**
---

# Testing Rules

## Framework and commands
- Unit and integration tests use Vitest.
- Run tests from repository root so @shared aliases resolve.
- Primary commands: npm test, npm run test:coverage.

## Test design
- Test behavior, not implementation details.
- Prefer getByRole, getByLabelText, and getByText selectors.
- Keep tests deterministic and avoid timing-based flakes.

## Shared library changes
- Add or update tests in libs/shared when behavior changes.
- For event-bus tests, avoid duplicate payloads within 300ms because dedupe is expected behavior.

## Module federation and shell tests
- Stub remote modules in test/mocks when testing shell routing behavior.
- Keep Vitest alias mappings aligned with federation remote names.

## Accessibility
- Add accessibility assertions for reusable UI components.
- Cover keyboard navigation and focus behavior for interactive elements.
