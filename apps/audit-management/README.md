# Audit Management — Micro-App

> Audit plan tracking, findings management, and remediation workflow.
> Remote micro-app loaded into the Shell via Module Federation.

---

## Module Federation

| Property | Value |
|----------|-------|
| Port | `4203` |
| MF Name | `auditManagement` |
| Exposed Module | `./Module` → `src/remote-entry.tsx` |

---

## Features

- **Audit Plans**: DataTable with audit ID, name, type, status, start/end dates, findings count
- **Findings & Remediation**: DataTable with finding ID, title, severity, status, owner, due date
- **Dashboard Stats**: Total Audits, In Progress, Open Findings, Critical Findings (via StatCard)
- **Bulk Actions**: Assign Owner, Mark Resolved (gated by `canEdit`)

---

## RBAC Permissions

| Action | Allowed Roles |
|--------|--------------|
| `view` | Admin, Auditor, ComplianceOfficer, Viewer |
| `create` | Admin, Auditor |
| `edit` | Admin, Auditor |
| `close` | Admin, Auditor |

Usage: `const canCreate = usePermission('create', 'audit');`

---

## Data Model

From `@shared/types`:
- `AuditPlan` — id, name, type, status, startDate, endDate, auditor, findingsCount, audit
- `AuditFinding` — id, auditId, title, severity, status, owner, description, dueDate
- `AuditStatus` — Planned, InProgress, Completed, Closed

Mock data: `mockData.audits` (3), `mockData.findings` (3) in `@shared/api-client`

---

## Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `AUDIT_FINDING_CREATED` | Emits | `{ findingId, severity }` |
| `RISK_UPDATED` | Listens | `{ riskId, riskLevel }` |
| `COMPLIANCE_STATUS_CHANGED` | Listens | `{ controlId, newStatus }` |

---

## Dependencies

- `@shared/types` — AuditPlan, AuditFinding, AuditStatus
- `@shared/auth` — useAuth, usePermission
- `@shared/ui-components` — PageHeader, StatCard, DataTable, StatusBadge, BulkActionBar, Card, Button
- `@shared/api-client` — mockData.audits, mockData.findings
- `@shared/event-bus` — AuditFindingCreated

---

## Architecture Rules

1. **No imports from other apps**. Communicate via `@shared/event-bus`.
2. **All UI from `@shared/ui-components`**. No custom base components.
3. **RBAC on every action**. Use `usePermission` before showing create/edit/close buttons.
4. **Domain types from `@shared/types`**. Never define AuditPlan locally.
5. **Styling via CSS custom properties**. No raw color values.

---

## Development

```bash
npm run start:audit    # Standalone on :4203
npm start              # Via shell on :4200/audit
```

## Key Files

| File | Purpose |
|------|---------|
| `src/remote-entry.tsx` | Main app component (exported to shell) |
| `src/bootstrap.tsx` | Standalone render entry |
| `src/index.ts` | Async bootstrap for MF |
| `webpack.config.js` | Remote MF config (port 4203) |
