# Risk Assessment — Micro-App

> Enterprise risk register with scoring matrix, trend analysis, and bulk operations.
> Remote micro-app loaded into the Shell via Module Federation.

---

## Module Federation

| Property | Value |
|----------|-------|
| Port | `4201` |
| MF Name | `riskAssessment` |
| Exposed Module | `./Module` → `src/remote-entry.tsx` |

---

## Features

- **Risk Register**: DataTable with ID, Title, Category, Risk Score, Level, Owner, Status, Due Date
- **Risk Scoring Matrix**: 5×5 likelihood × impact grid with color-coded cells
- **Dashboard Stats**: Total Risks, Critical, High, Open (via StatCard)
- **Bulk Actions**: Approve, Escalate, Close (gated by `canApprove`)
- **New Risk**: Create button (gated by `canCreate`)

---

## RBAC Permissions

| Action | Allowed Roles |
|--------|--------------|
| `view` | Admin, Auditor, ComplianceOfficer, Partner, Viewer |
| `create` | Admin, ComplianceOfficer |
| `edit` | Admin, ComplianceOfficer |
| `delete` | Admin |
| `approve` | Admin, ComplianceOfficer |

Usage: `const canCreate = usePermission('create', 'risk');`

---

## Data Model

From `@shared/types`:
- `RiskAssessment` — id, title, description, category, likelihood, impact, riskScore, riskLevel, status, owner, mitigationPlan, dueDate, audit
- `RiskLevel` — Critical, High, Medium, Low, Info

Mock data: `mockData.risks` (5 records) in `@shared/api-client`

---

## Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `RISK_UPDATED` | Emits | `{ riskId, riskLevel }` |
| `COMPLIANCE_STATUS_CHANGED` | Listens | `{ controlId, newStatus }` |
| `AUDIT_FINDING_CREATED` | Listens | `{ findingId, severity }` |

---

## Dependencies

- `@shared/types` — RiskAssessment, RiskLevel
- `@shared/auth` — useAuth, usePermission
- `@shared/ui-components` — PageHeader, StatCard, DataTable, StatusBadge, BulkActionBar, Button
- `@shared/api-client` — mockData.risks
- `@shared/event-bus` — RiskUpdated

---

## Architecture Rules

1. **No imports from other apps**. Communicate via `@shared/event-bus`.
2. **All UI from `@shared/ui-components`**. No custom base components.
3. **RBAC on every action**. Use `usePermission` before showing create/edit/delete buttons.
4. **Domain types from `@shared/types`**. Never define RiskAssessment locally.
5. **Styling via CSS custom properties**. No raw color values.

---

## Development

```bash
npm run start:risk     # Standalone on :4201
npm start              # Via shell on :4200/risk-assessment
```

## Key Files

| File | Purpose |
|------|---------|
| `src/remote-entry.tsx` | Main app component (exported to shell) |
| `src/bootstrap.tsx` | Standalone render entry |
| `src/index.ts` | Async bootstrap for MF |
| `webpack.config.js` | Remote MF config (port 4201) |
