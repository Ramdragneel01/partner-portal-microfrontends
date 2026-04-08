---
applyTo: '**'
---

# Partner Portal — Copilot Instructions

## Architecture

This is an **Nx 22 monorepo** with **Webpack 5 Module Federation**:
- **Shell** (host, port 4200) loads 7 **remote micro-apps** (ports 4201–4207)
- **5 shared libraries** under `libs/shared/` imported via `@shared/*` path aliases
- Read `ARCHITECTURE.md` at the repo root for full details

## Critical Rules

### Import Rules (NEVER violate)
- Apps import from `@shared/*` barrel exports ONLY — never deep imports
- Apps NEVER import from other apps — use `@shared/event-bus` for cross-app communication
- Libraries may only depend on `@shared/types` — no other inter-library imports
- No circular dependencies

### TypeScript
- Strict mode is ON. No `any` types. Use `unknown` with type guards
- All domain types MUST be in `@shared/types` — never define domain interfaces in apps
- Every new file starts with ``

### React
- Functional components only (except ErrorBoundary)
- Use semantic HTML: `<button>`, `<nav>`, `<main>`, `<header>`, `<table>` — NOT styled `<div>`
- Never use `<div onClick>`. Use `<button>` for interactive elements
- RBAC: always check with `usePermission(action, resource)` before gating UI
- Every new remote must be wrapped in `<ErrorBoundary>` in shell's App.tsx

### Styling
- Inline `style` objects with CSS custom properties: `var(--color-primary)`, `var(--spacing-md)`
- NO CSS files, CSS modules, Tailwind, styled-components, or raw hex color values
- All colors and spacing from design tokens

### Accessibility (WCAG 2.1 AA — Required)
- Semantic HTML elements with proper ARIA attributes
- Keyboard navigation with visible focus indicators
- `role="alert"` for error/status messages, `aria-live` for dynamic content
- `alt` on images, `aria-label` on icon buttons
- Never convey info through color alone

### Security
- Auth tokens in `sessionStorage` ONLY — never `localStorage`
- No PII in console.log or error messages
- Validate all user inputs before API calls
- No `eval()`, `new Function()`, or inline scripts

### Testing
- Semantic queries: `getByRole`, `getByLabelText`, `getByText` — NEVER `getByTestId`
- `vi.clearAllMocks()` in `beforeEach`
- Wrap state changes in `act()`, async in `waitFor()`

## Module Federation

| App | Port | MF Name |
|-----|------|---------|
| Shell | 4200 | shell |
| Risk Assessment | 4201 | riskAssessment |
| Compliance | 4202 | complianceDashboard |
| Audit | 4203 | auditManagement |
| Policy | 4204 | policyManagement |
| Incidents | 4205 | incidentReporting |
| Vendor Risk | 4206 | vendorRisk |
| Onboarding | 4207 | partnerOnboarding |

## Shared Libraries

| Import | Contents |
|--------|----------|
| `@shared/types` | Enums, interfaces, domain models |
| `@shared/auth` | AuthProvider, useAuth, usePermission, ProtectedRoute |
| `@shared/ui-components` | Button, Card, DataTable, Modal, StatCard, StatusBadge, AlertBanner, FormField, BulkActionBar, PageHeader, EmptyState |
| `@shared/api-client` | apiClient (HTTP), mockData |
| `@shared/event-bus` | eventBus, useEventBus, AppEvent |
