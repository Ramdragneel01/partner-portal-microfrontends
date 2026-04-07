# Contributing to Partner Portal

> Guidelines for contributing to the Partner Portal micro-frontend platform.
> Read `ARCHITECTURE.md` first for system understanding.

---

## Development Setup

```bash
# Clone and install
git clone <repo-url>
cd partner-portal-microfrontends
npm install

# Start shell (host) with all remotes pointed to dev servers
npm start                  # Shell on :4200

# Start a micro-app standalone
npm run start:risk         # :4201
npm run start:compliance   # :4202
npm run start:audit        # :4203
npm run start:policy       # :4204
npm run start:incidents    # :4205
npm run start:vendor       # :4206
npm run start:onboarding   # :4207
```

---

## Coding Standards

### TypeScript
- Strict mode enabled (`strict: true` in `tsconfig.base.json`).
- No `any` types. Use `unknown` with type guards if needed.
- Prefer `interface` over `type` for public APIs.
- Export types from `@shared/types`. Never define domain types in apps.

### React
- Functional components only. No class components (except ErrorBoundary).
- Use semantic HTML elements (`<button>`, `<nav>`, `<main>`, `<header>`, `<table>`).
- Never use `<div>` with `onClick`. Use `<button>` for interactive elements.
- All RBAC checks via `usePermission(action, resource)` hook.
- All user-facing text should be hardcoded strings (i18n keys in future).

### Styling
- Inline `style` objects with CSS custom properties (`var(--color-*)`, `var(--spacing-*)`).
- No CSS files, no CSS modules, no Tailwind, no styled-components.
- Never use raw color hex values. Always use design tokens.

### Imports
- Import shared code from `@shared/*` barrel exports only.
- Never deep-import from library internals (e.g., `@shared/ui-components/src/lib/Button`).
- Never import from one app into another app.
- Keep imports sorted: React → third-party → `@shared/*` → local.

---

## Dependency Rules

```
ALLOWED                          FORBIDDEN
─────────────────────────       ──────────────────────────
App → @shared/types             App → Another App
App → @shared/auth              @shared/auth → @shared/ui-components
App → @shared/ui-components     @shared/event-bus → @shared/auth
App → @shared/api-client        Any circular dependency
App → @shared/event-bus
@shared/auth → @shared/types
@shared/ui-components → @shared/types
@shared/api-client → @shared/types
```

---

## Accessibility Requirements (WCAG 2.1 AA)

Every component and feature **must** meet these requirements:

1. **Semantic HTML**: Use `<button>`, `<nav>`, `<main>`, `<header>`, `<table>` — not styled `<div>`s.
2. **ARIA attributes**: Add `role`, `aria-label`, `aria-live`, `aria-expanded` only when native semantics are insufficient.
3. **Keyboard navigation**: All interactive elements must be focusable and operable via keyboard.
4. **Focus indicators**: Visible focus outlines. Never `outline: none` without a visible replacement.
5. **Color independence**: Never convey information through color alone. Use icons + text.
6. **Alt text**: All images must have `alt` attributes. Decorative images use `alt=""`.
7. **Error messages**: Associated with inputs via `aria-describedby` and `aria-invalid`.
8. **Skip link**: Shell provides `<a href="#main-content">` for keyboard users.

---

## Security Requirements

1. **No PII in logs**: Never `console.log` user emails, tokens, or personal data.
2. **Token storage**: `sessionStorage` only. Never `localStorage` for auth tokens.
3. **Input validation**: Validate all user inputs before API calls.
4. **No inline scripts**: CSP-compatible code. No `eval()`, no `new Function()`.
5. **RBAC enforcement**: Check permissions at both navigation and action level.
6. **Dependency auditing**: Run `npm audit` regularly. No known high/critical vulnerabilities.

---

## PR Checklist

Before submitting a pull request:

- [ ] Code follows TypeScript strict mode (no `any`, no type errors)
- [ ] All new components use semantic HTML and proper ARIA attributes
- [ ] RBAC permissions checked via `usePermission` for gated actions
- [ ] No direct imports between micro-apps
- [ ] All imports use `@shared/*` barrel exports
- [ ] CSS uses design tokens (`var(--color-*)`) — no raw hex values
- [ ] Error boundaries wrap any new remote module
- [ ] README updated if adding new app/library/route
- [ ] `PERMISSION_MATRIX` updated if adding new resource/action
- [ ] Event types added to `AppEvent` enum if new cross-app communication needed
- [ ] Build succeeds: `npm run build`
- [ ] Lint passes: `npm run lint`

---

## Adding a New Micro-App

See `ARCHITECTURE.md` → "Adding a New Micro-App" for the 10-step checklist.

## Adding a New Shared Component

1. Create component in `libs/shared/ui-components/src/lib/MyComponent.tsx`.
2. Export from `libs/shared/ui-components/src/index.ts`.
3. Use semantic HTML. Add ARIA attributes where needed.
4. Use CSS custom properties for all colors and spacing.
5. Support keyboard navigation and visible focus indicators.
6. Create the component's `README.md` section in `libs/shared/ui-components/README.md`.

## Adding a New Event

1. Add entry to `AppEvent` enum in `libs/shared/event-bus/src/index.ts`.
2. Add typed payload to `AppEventPayload` interface.
3. Document in `ARCHITECTURE.md` → Event Types table.
4. Use `eventBus.emit()` in producer app and `useEventBus()` hook in consumer apps.
