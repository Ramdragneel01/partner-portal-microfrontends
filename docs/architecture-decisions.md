# Architecture Decisions

> Key architectural decisions for the Partner Portal platform with context and rationale.

---

## ADR-001: Micro-Frontend Architecture with Module Federation

**Status**: Accepted

**Context**: The legacy C#/Azure partner portal is a monolith. We need independent deployability, team autonomy, and technology flexibility.

**Decision**: Use Webpack 5 Module Federation with a shell host and 7 remote micro-apps.

**Rationale**:
- Independent build and deploy per domain
- Shared React runtime (no duplication)
- Error isolation via ErrorBoundary per remote
- Each team owns their micro-app end-to-end
- Gradual migration from legacy possible

**Consequences**: Requires careful version alignment of shared deps. Remote URLs must be configurable per environment.

---

## ADR-002: Nx Monorepo with Shared Libraries

**Status**: Accepted

**Context**: Code sharing (types, auth, UI) across 7 apps requires a structured approach.

**Decision**: Nx workspace with `libs/shared/` containing 5 libraries, imported via TypeScript path aliases.

**Rationale**:
- Dependency graph visualization (`nx graph`)
- Affected-only builds for CI optimization
- Enforced boundaries via import rules
- Consistent tooling across all projects

**Consequences**: All devs must learn Nx conventions. Path aliases require matching webpack aliases.

---

## ADR-003: RBAC via Permission Matrix

**Status**: Accepted

**Context**: Different user roles need different access levels across 7 domain areas.

**Decision**: Centralized `PERMISSION_MATRIX` in `@shared/auth/usePermission.ts`. Components use `usePermission(action, resource)` hook.

**Rationale**:
- Single source of truth for all permissions
- Consistent enforcement across all apps
- Easy to audit and extend
- Navigation filtering + action gating at two levels

**Consequences**: Matrix must be kept in sync with backend RBAC. New resources require matrix updates.

---

## ADR-004: Event Bus for Cross-App Communication

**Status**: Accepted

**Context**: Micro-apps need to communicate (e.g., risk update triggers compliance refresh) without direct imports.

**Decision**: Typed pub/sub event bus with `AppEvent` enum and `AppEventPayload` types.

**Rationale**:
- Loose coupling between apps
- Type-safe payloads prevent runtime errors
- React hook (`useEventBus`) with auto-cleanup
- Singleton pattern ensures all apps share one bus

**Consequences**: Debugging cross-app events requires logging. Event naming must follow conventions.

---

## ADR-005: Design System with CSS Custom Properties

**Status**: Accepted

**Context**: UI consistency across 8 apps requires a shared component library with consistent theming.

**Decision**: 11 WCAG-compliant components in `@shared/ui-components` styled with CSS custom properties.

**Rationale**:
- No external CSS framework dependency (no Tailwind/MUI lock-in)
- CSS custom properties enable future dark mode with zero component changes
- Inline styles with `var(--token)` are predictable and debuggable
- Semantic HTML ensures accessibility by default

**Consequences**: No utility classes (slower initial development). Must maintain token consistency.

---

## ADR-006: Mock Auth for Development (MSAL-Ready)

**Status**: Accepted

**Context**: Development needs to work offline without Azure Entra ID. Production will use MSAL.

**Decision**: Pluggable auth adapter — mock for dev, MSAL for prod. Interface: `login/logout/getUser/getAccessToken`.

**Rationale**:
- Development works offline with auto-authenticated mock user
- Same API surface for both adapters
- Environment variable switches the adapter
- No MSAL dependency needed during development

**Consequences**: Mock adapter must simulate real role/permission behavior accurately.

---

## ADR-007: Config-Driven UI (Future — Oscar-Inspired)

**Status**: Proposed

**Context**: Dashboard views currently require code changes for every new widget or layout modification.

**Decision**: Adopt Oscar's config-driven UI pattern — define views as JSON configs, render them dynamically.

**Rationale**:
- Views can be modified without code deploys
- Tenant-customizable dashboards
- Standardized component rendering pipeline
- Reduces development time for new dashboards

**Consequences**: Requires building `ViewRenderer`, `ComponentRenderer`, and view config API. See `roadmap.md` for timeline.

---

## ADR-008: No Redux — Context + Zustand Strategy

**Status**: Accepted

**Context**: State management needs vary — global auth/theme state vs. view-local component state.

**Decision**: React Context for global state (auth, theme, navigation). Zustand (future) for view-scoped state.

**Rationale**:
- Context is sufficient for low-frequency global state
- Zustand is lightweight and composable for high-frequency view state
- Avoids Redux boilerplate and complexity
- Aligns with Oscar platform's approach

**Consequences**: Complex cross-component state may need careful context design. Zustand adoption requires team training.
