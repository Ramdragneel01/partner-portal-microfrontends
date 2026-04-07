# Policy Management — Micro-App

> Policy library, approval workflows, versioning, and lifecycle management.
> Remote micro-app loaded into the Shell via Module Federation.

---

## Module Federation

| Property | Value |
|----------|-------|
| Port | `4204` |
| MF Name | `policyManagement` |
| Exposed Module | `./Module` → `src/remote-entry.tsx` |

---

## Features

- **Policy Library**: DataTable with policy ID, title, category, status, version, owner, effective date, review date
- **Policy Lifecycle**: 5-step workflow visualization (Draft → Review → Approved → Published → Archived)
- **Dashboard Stats**: Total Policies, Published, Under Review, Drafts (via StatCard)
- **New Policy**: Create button (gated by `canCreate`)
- **Approval Queue**: Button for policy approvers (gated by `canApprove`)

---

## RBAC Permissions

| Action | Allowed Roles |
|--------|--------------|
| `view` | Admin, ComplianceOfficer, Partner, Viewer |
| `create` | Admin, ComplianceOfficer |
| `approve` | Admin |
| `publish` | Admin |

Usage: `const canApprove = usePermission('approve', 'policy');`

---

## Data Model

From `@shared/types`:
- `Policy` — id, title, category, status, version, owner, description, effectiveDate, reviewDate, audit
- `PolicyStatus` — Draft, UnderReview, Approved, Published, Archived

Mock data: `mockData.policies` (4) in `@shared/api-client`

---

## Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `POLICY_APPROVED` | Emits | `{ policyId, version }` |
| `COMPLIANCE_STATUS_CHANGED` | Listens | `{ controlId, newStatus }` |

---

## Dependencies

- `@shared/types` — Policy, PolicyStatus
- `@shared/auth` — useAuth, usePermission
- `@shared/ui-components` — PageHeader, StatCard, DataTable, StatusBadge, Card, Button
- `@shared/api-client` — mockData.policies
- `@shared/event-bus` — PolicyApproved

---

## Architecture Rules

1. **No imports from other apps**. Communicate via `@shared/event-bus`.
2. **All UI from `@shared/ui-components`**. No custom base components.
3. **RBAC on every action**. Use `usePermission` before showing create/approve/publish buttons.
4. **Domain types from `@shared/types`**. Never define Policy locally.
5. **Styling via CSS custom properties**. No raw color values.

---

## Development

```bash
npm run start:policy   # Standalone on :4204
npm start              # Via shell on :4200/policy
```

## Key Files

| File | Purpose |
|------|---------|
| `src/remote-entry.tsx` | Main app component (exported to shell) |
| `src/bootstrap.tsx` | Standalone render entry |
| `src/index.ts` | Async bootstrap for MF |
| `webpack.config.js` | Remote MF config (port 4204) |
