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

# Start ALL apps in parallel
npm run start:all          # or: npm run dev

# Start a micro-app standalone
npm run start:risk         # :4201
npm run start:compliance   # :4202
npm run start:audit        # :4203
npm run start:policy       # :4204
npm run start:incidents    # :4205
npm run start:vendor       # :4206
npm run start:onboarding   # :4207

# Copy env template
cp .env.example .env.development
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
- Use **MUI v7** components (`Box`, `Typography`, `Button`, `DataGrid`, etc.) as the primary UI layer.
- Extend with `sx` prop or `styled()` as needed. Avoid separate CSS files, CSS modules, or Tailwind.
- Use design tokens via `theme.palette.*`, `theme.spacing()`, or CSS custom properties (`var(--color-*)`, `var(--spacing-*)`). Never use raw hex values.
- Use the shared `themeTokens` and `customBrand` exports from `@shared/ui-components` for cross-app token access.
- Theme (light/dark) is toggled globally via `useThemeMode()` — **never** hardcode light- or dark-specific colors.

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
6. **Navigation safety**: Any event-driven navigation must go through `sanitizeNavigationPath` — validates against `ALLOWED_NAV_ROOTS` to prevent open redirects.
7. **MSAL secrets**: `MSAL_CLIENT_ID`, `MSAL_TENANT_ID`, and `API_SCOPE` values must only come from environment variables — never hardcoded.
8. **Dependency auditing**: Run `npm audit` regularly. No known high/critical vulnerabilities.

---

## PR Checklist

Before submitting a pull request:

- [ ] Code follows TypeScript strict mode (no `any`, no type errors)
- [ ] All new components use MUI primitives, semantic HTML, and proper ARIA attributes
- [ ] RBAC permissions checked via `usePermission` for gated actions
- [ ] No direct imports between micro-apps
- [ ] All imports use `@shared/*` barrel exports
- [ ] Styling uses `theme.palette.*` or `var(--color-*)` — no raw hex values
- [ ] Light and dark themes both tested visually
- [ ] Error boundaries wrap any new remote module
- [ ] New tests added and `npm test` passes
- [ ] README updated if adding new app/library/route
- [ ] `PERMISSION_MATRIX` updated if adding new resource/action
- [ ] Event types added to `AppEvent` enum if new cross-app communication needed
- [ ] Build succeeds: `npm run build`
- [ ] Lint passes: `npm run lint`
- [ ] `npm audit` shows no new high/critical vulnerabilities

## Testing

The project uses **Vitest** + **Testing Library** for all unit and integration tests.

```bash
npm test                  # Run all tests once
npm run test:watch        # Watch mode with HMR
npm run test:coverage     # Coverage report (V8 provider)
```

### Testing Standards
- Test files live alongside source files as `*.test.tsx`.
- Use `@testing-library/react` (`render`, `screen`, `userEvent`) — no Enzyme.
- Use `jest-axe` (`checkA11y`) for accessibility assertions in component tests.
- Mock `@shared/*` modules using `vi.mock()` where needed.
- Do **not** test implementation details — test observable behavior.
- Coverage targets: **80% statements** (`libs/`) and **70% statements** (`apps/`).

---

See `ARCHITECTURE.md` → "Adding a New Micro-App" for the 10-step checklist.

## Adding a New Shell Provider

1. Create the provider in `apps/shell/src/providers/MyProvider.tsx`.
2. Export it from `apps/shell/src/providers/index.ts`.
3. Compose it inside `AppProviders.tsx` in the correct order (auth before tenant, tenant before UI).
4. Document the new context shape in `ARCHITECTURE.md`.

## Adding a New Shared Component

1. Create component in `libs/shared/ui-components/src/lib/MyComponent.tsx`.
2. Export from `libs/shared/ui-components/src/index.ts`.
3. Use MUI primitives and semantic HTML. Add ARIA attributes where needed.
4. Support both light and dark themes via `theme.palette.*` or `useThemeMode()`.
5. Use CSS custom properties for any values not covered by MUI tokens.
6. Support keyboard navigation and visible focus indicators.
7. Add a Vitest test file `MyComponent.test.tsx` with at least one accessibility assertion.
8. Create the component’s `README.md` section in `libs/shared/ui-components/README.md`.

## Adding a New Event

1. Add entry to `AppEvent` enum in `libs/shared/event-bus/src/index.ts`.
2. Add typed payload to `AppEventPayload` interface.
3. Document in `ARCHITECTURE.md` → Event Types table.
4. Use `eventBus.emit()` in producer app and `useEventBus()` hook in consumer apps.
