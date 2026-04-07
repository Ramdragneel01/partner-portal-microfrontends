# Compliance Dashboard — Micro-App

> Framework compliance posture, control status tracking, and compliance scoring.
> Remote micro-app loaded into the Shell via Module Federation.

---

## Module Federation

| Property | Value |
|----------|-------|
| Port | `4202` |
| MF Name | `complianceDashboard` |
| Exposed Module | `./Module` → `src/remote-entry.tsx` |

---

## Features

- **Score Overview**: Overall compliance score + per-framework scores (via StatCard)
- **Framework Compliance**: Stacked bar chart showing compliant/in-progress/non-compliant by framework
- **Control Details**: DataTable with controlId, title, status, owner, evidenceCount, lastAssessedDate
- **Color-coded scores**: Green ≥85%, Yellow ≥70%, Red <70%

---

## RBAC Permissions

| Action | Allowed Roles |
|--------|--------------|
| `view` | Admin, Auditor, ComplianceOfficer, Partner, Viewer |
| `edit` | Admin, ComplianceOfficer |
| `assess` | Admin, ComplianceOfficer, Auditor |

Usage: `const canAssess = usePermission('assess', 'compliance');`

---

## Data Model

From `@shared/types`:
- `ComplianceFramework` — id, name, totalControls, compliantControls, nonCompliantControls, inProgressControls, score
- `ComplianceControl` — id, controlId, title, status, owner, evidenceCount, lastAssessedDate
- `ComplianceStatus` — Compliant, NonCompliant, InProgress, NotAssessed

Mock data: `mockData.frameworks` (4), `mockData.controls` (3) in `@shared/api-client`

---

## Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `COMPLIANCE_STATUS_CHANGED` | Emits | `{ controlId, newStatus }` |
| `POLICY_APPROVED` | Listens | `{ policyId, version }` |
| `AUDIT_FINDING_CREATED` | Listens | `{ findingId, severity }` |

---

## Dependencies

- `@shared/types` — ComplianceFramework, ComplianceControl, ComplianceStatus
- `@shared/auth` — useAuth, usePermission
- `@shared/ui-components` — PageHeader, StatCard, DataTable, StatusBadge, Card
- `@shared/api-client` — mockData.frameworks, mockData.controls
- `@shared/event-bus` — ComplianceStatusChanged

---

## Architecture Rules

1. **No imports from other apps**. Communicate via `@shared/event-bus`.
2. **All UI from `@shared/ui-components`**. No custom base components.
3. **RBAC on every action**. Use `usePermission` before showing edit/assess controls.
4. **Domain types from `@shared/types`**. Never define ComplianceFramework locally.
5. **Styling via CSS custom properties**. No raw color values.

---

## Development

```bash
npm run start:compliance   # Standalone on :4202
npm start                  # Via shell on :4200/compliance
```

## Key Files

| File | Purpose |
|------|---------|
| `src/remote-entry.tsx` | Main app component (exported to shell) |
| `src/bootstrap.tsx` | Standalone render entry |
| `src/index.ts` | Async bootstrap for MF |
| `webpack.config.js` | Remote MF config (port 4202) |
