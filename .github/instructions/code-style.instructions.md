---
name: "Code Style Rules"
description: "Use when implementing or refactoring TypeScript and React code in apps, libs, or tools."
applyTo: "{apps,libs,tools}/**/*.{ts,tsx,js,jsx}"
---

# Code Style Rules

## TypeScript
- Keep strict typing and avoid any unless there is no safer alternative.
- Keep shared domain models in @shared/types.
- Export public APIs from library index files.

## React
- Use functional components and hooks.
- Prefer semantic HTML for interactive elements.
- Keep components focused and composable.

## Architecture boundaries
- Never import one app from another app.
- Use @shared/event-bus for cross-app communication.
- Keep shell and remotes aligned on Module Federation singleton strategy.

## Accessibility and security
- Keep keyboard accessibility and visible focus states.
- Use ARIA only when native semantics are insufficient.
- Never log secrets, tokens, or PII.
- Avoid eval, new Function, and unsafe dynamic execution.
