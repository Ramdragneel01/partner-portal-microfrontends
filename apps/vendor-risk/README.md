# Vendor Risk — Micro-App

> Vendor registry, third-party risk scoring, assessment workflows, and contract tracking.
> Remote micro-app loaded into the Shell via Module Federation.

---

## Module Federation

| Property | Value |
|----------|-------|
| Port | `4206` |
| MF Name | `vendorRisk` |
| Exposed Module | `./Module` → `src/remote-entry.tsx` |

---

## Features

- **Vendor Registry**: DataTable with vendor name, category, risk rating, risk score, contract expiry, status
- **RAG Status Overview**: Distribution chart showing High/Medium/Low vendor risk breakdown
- **Dashboard Stats**: Total Vendors, High Risk, Medium Risk, Low Risk (via StatCard)
- **Add Vendor**: Create button (gated by `canCreate`)
- **CSV Bulk Import**: Upload vendor data (gated by `canCreate`)
- **Bulk Actions**: Request Assessment, Send Questionnaire, Deactivate (gated by `canAssess`)

---

## RBAC Permissions

| Action | Allowed Roles |
|--------|--------------|
| `view` | Admin, ComplianceOfficer, Viewer |
| `create` | Admin, ComplianceOfficer |
| `assess` | Admin, ComplianceOfficer, Auditor |
| `edit` | Admin, ComplianceOfficer |

Usage: `const canAssess = usePermission('assess', 'vendor');`

---

## Data Model

From `@shared/types`:
- `Vendor` — id, name, category, riskRating, riskScore, contractExpiry, status, contactEmail, audit
- `VendorRiskRating` — High, Medium, Low

Mock data: `mockData.vendors` (4) in `@shared/api-client`

---

## Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `VENDOR_RISK_CHANGED` | Emits | `{ vendorId, newRating }` |
| `RISK_UPDATED` | Listens | `{ riskId, riskLevel }` |
| `COMPLIANCE_STATUS_CHANGED` | Listens | `{ controlId, newStatus }` |

---

## Dependencies

- `@shared/types` — Vendor, VendorRiskRating
- `@shared/auth` — useAuth, usePermission
- `@shared/ui-components` — PageHeader, StatCard, DataTable, StatusBadge, BulkActionBar, Card, Button
- `@shared/api-client` — mockData.vendors
- `@shared/event-bus` — VendorRiskChanged

---

## Architecture Rules

1. **No imports from other apps**. Communicate via `@shared/event-bus`.
2. **All UI from `@shared/ui-components`**. No custom base components.
3. **RBAC on every action**. Use `usePermission` before showing create/assess/edit controls.
4. **Domain types from `@shared/types`**. Never define Vendor locally.
5. **Styling via CSS custom properties**. No raw color values.
6. **File upload validation**: Validate CSV structure before bulk import.

---

## Development

```bash
npm run start:vendor   # Standalone on :4206
npm start              # Via shell on :4200/vendor-risk
```

## Key Files

| File | Purpose |
|------|---------|
| `src/remote-entry.tsx` | Main app component (exported to shell) |
| `src/bootstrap.tsx` | Standalone render entry |
| `src/index.ts` | Async bootstrap for MF |
| `webpack.config.js` | Remote MF config (port 4206) |
