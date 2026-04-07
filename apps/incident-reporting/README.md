# Incident Reporting — Micro-App

> Incident submission, tracking, investigation timeline, and escalation management.
> Remote micro-app loaded into the Shell via Module Federation.

---

## Module Federation

| Property | Value |
|----------|-------|
| Port | `4205` |
| MF Name | `incidentReporting` |
| Exposed Module | `./Module` → `src/remote-entry.tsx` |

---

## Features

- **Incident List**: DataTable with incident ID, title, severity, status, category, reporter, reported date
- **Incident Timeline**: Chronological left-side bar with colored dots by severity
- **Dashboard Stats**: Total Incidents, Active, Critical, Resolved (via StatCard)
- **Report Incident**: Modal form with title, description, severity, category, affected systems (gated by `canReport`)
- **Investigate**: Action for admins/compliance officers (gated by `canInvestigate`)

---

## RBAC Permissions

| Action | Allowed Roles |
|--------|--------------|
| `view` | Admin, ComplianceOfficer, Partner, Viewer |
| `report` | Admin, ComplianceOfficer, Partner |
| `investigate` | Admin, ComplianceOfficer |
| `resolve` | Admin, ComplianceOfficer |

Usage: `const canReport = usePermission('report', 'incident');`

---

## Data Model

From `@shared/types`:
- `Incident` — id, title, description, severity, status, category, affectedSystems, reporter, assignee, reportedAt, resolvedAt, audit
- `IncidentSeverity` — Critical, High, Medium, Low
- `IncidentStatus` — Open, Investigating, Contained, Resolved, Closed

Mock data: `mockData.incidents` (3) in `@shared/api-client`

---

## Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `INCIDENT_CREATED` | Emits | `{ incidentId, severity }` |
| `INCIDENT_RESOLVED` | Emits | `{ incidentId }` |
| `RISK_UPDATED` | Listens | `{ riskId, riskLevel }` |

---

## Dependencies

- `@shared/types` — Incident, IncidentSeverity, IncidentStatus
- `@shared/auth` — useAuth, usePermission
- `@shared/ui-components` — PageHeader, StatCard, DataTable, StatusBadge, Modal, FormField, Button, Card
- `@shared/api-client` — mockData.incidents
- `@shared/event-bus` — IncidentCreated, IncidentResolved

---

## Architecture Rules

1. **No imports from other apps**. Communicate via `@shared/event-bus`.
2. **All UI from `@shared/ui-components`**. No custom base components.
3. **RBAC on every action**. Use `usePermission` before showing report/investigate/resolve buttons.
4. **Domain types from `@shared/types`**. Never define Incident locally.
5. **Styling via CSS custom properties**. No raw color values.
6. **Form validation**: Validate all modal form inputs before submission.

---

## Development

```bash
npm run start:incidents   # Standalone on :4205
npm start                 # Via shell on :4200/incidents
```

## Key Files

| File | Purpose |
|------|---------|
| `src/remote-entry.tsx` | Main app component (exported to shell) |
| `src/bootstrap.tsx` | Standalone render entry |
| `src/index.ts` | Async bootstrap for MF |
| `webpack.config.js` | Remote MF config (port 4205) |
