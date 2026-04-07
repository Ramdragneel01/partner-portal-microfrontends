# Shell Components

> Shared layout components used by the shell host application.
> These components are **not** part of `@shared/ui-components` — they are shell-specific.

---

## Components

### Header (`Header.tsx`)

Fixed top navigation bar (56px height).

| Element | Details |
|---------|---------|
| Logo | "PP" brand mark + "Partner Portal" title |
| Badge | "Risk & Compliance" environment label |
| Notifications | Bell icon with unread count badge |
| User Info | Avatar + display name + role |
| Sign Out | Logout button (calls `logout()` from `useAuth`) |

**Accessibility**:
- `<header role="banner">` semantic landmark
- All buttons have `aria-label`
- Keyboard-navigable
- Color contrast meets WCAG AA (white on dark slate)

**Styling**: Dark slate background (`#1e293b`), fixed position, `z-index: 1000`.

---

### SideNav (`SideNav.tsx`)

Fixed left sidebar (260px width) with role-filtered navigation.

| Element | Details |
|---------|---------|
| Nav items | 7 entries, each with emoji icon + label |
| Active state | Blue background + left border accent |
| Environment badge | Yellow "Development" indicator at bottom |

**NAV_ITEMS** (with role-based visibility):

| Label | Path | Roles |
|-------|------|-------|
| 🛡️ Risk Assessment | `/risk-assessment` | All |
| ✅ Compliance | `/compliance` | All |
| 📋 Audit | `/audit` | Admin, Auditor, ComplianceOfficer, Viewer |
| 📄 Policy | `/policy` | Admin, ComplianceOfficer, Partner, Viewer |
| 🚨 Incidents | `/incidents` | Admin, ComplianceOfficer, Partner, Viewer |
| 🏢 Vendor Risk | `/vendor-risk` | Admin, ComplianceOfficer, Viewer |
| 🤝 Onboarding | `/onboarding` | Admin, Partner, Viewer |

**Accessibility**:
- `<nav aria-label="Main navigation">` semantic landmark
- `<NavLink>` components with `aria-current="page"` on active
- Keyboard-navigable with visible focus indicator

---

### ErrorBoundary (`ErrorBoundary.tsx`)

Class component that catches render errors in child component trees.

| Prop | Type | Purpose |
|------|------|---------|
| `moduleName` | `string` | Display name for error message |
| `children` | `ReactNode` | Remote module to protect |

**Behavior**:
- Catches JavaScript errors in child tree
- Renders fallback UI with module name + retry button
- Does **not** catch event handler errors (React limitation)
- Logs errors to console

**Accessibility**: Error fallback uses `role="alert"` for screen reader announcement.

---

## Rules

1. These components are **shell-specific**. Do not extract to `@shared/ui-components`.
2. Header and SideNav use **fixed positioning**. Content area accounts for offsets.
3. SideNav role filtering uses `user.role` from `useAuth()` context.
4. ErrorBoundary is a class component (React requirement for error boundaries).
5. All layout dimensions use CSS custom properties (`--header-height`, `--sidebar-width`).
