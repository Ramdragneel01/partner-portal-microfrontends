---
description: Coding style and architecture constraints for apps and shared libraries.
paths:
  - apps/**
  - libs/**
  - tools/**
---

# Code Style Rules

## TypeScript
- Keep strict typing. Avoid any and prefer explicit interfaces.
- Put shared domain types in @shared/types.
- Export public APIs through library index files.

## React
- Use functional components and hooks.
- Keep components focused and composable.
- Prefer semantic HTML over generic containers.

## Module federation and boundaries
- Never import from one app directly into another app.
- Use @shared/event-bus for cross-app coordination.
- Keep shell and remotes aligned on singleton dependency strategy.

## Styling and UX
- Reuse shared UI components and design tokens before adding custom styles.
- Maintain accessible contrast, visible focus states, and keyboard support.
- Use ARIA only when native semantics are insufficient.

## Code hygiene
- Prefer simple O(n) solutions over nested loops when possible.
- Keep comments focused on intent and non-obvious decisions.
- Avoid dead code, broad catch blocks, and silent failures.
