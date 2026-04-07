# Partner Onboarding — Micro-App

> Multi-step partner onboarding wizard, KYC verification, pipeline tracking, and bulk invite.
> Remote micro-app loaded into the Shell via Module Federation.

---

## Module Federation

| Property | Value |
|----------|-------|
| Port | `4207` |
| MF Name | `partnerOnboarding` |
| Exposed Module | `./Module` → `src/remote-entry.tsx` |

---

## Features

- **Onboarding Wizard**: 5-step form (Company Info → KYC → Compliance → Review → Approval)
- **Onboarding Pipeline**: Visual tracker showing partners at each step
- **Partner Registry**: DataTable with company name, contact email, industry, country, current step, status
- **Dashboard Stats**: Total Partners, Pending, Active, Rejected (via StatCard)
- **Bulk Actions**: Approve, Request Info, Reject (gated by `canApprove`)
- **Bulk Invite**: CSV upload for mass partner invitations (gated by `canBulkInvite`)

---

## RBAC Permissions

| Action | Allowed Roles |
|--------|--------------|
| `view` | Admin, Partner, Viewer |
| `onboard` | Admin, Partner |
| `approve` | Admin |
| `bulkInvite` | Admin |

Usage: `const canApprove = usePermission('approve', 'partner');`

---

## Data Model

From `@shared/types`:
- `Partner` — id, companyName, contactEmail, industry, country, currentStep, status, audit
- `OnboardingStep` — CompanyInfo, KYC, Compliance, Review, Approval
- `OnboardingStatus` — NotStarted, InProgress, PendingApproval, Approved, Rejected

Mock data: `mockData.partners` (4) in `@shared/api-client`

---

## Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `PARTNER_ONBOARDED` | Emits | `{ partnerId, companyName }` |
| `USER_ROLE_CHANGED` | Listens | `{ userId, newRole }` |

---

## Dependencies

- `@shared/types` — Partner, OnboardingStep, OnboardingStatus
- `@shared/auth` — useAuth, usePermission
- `@shared/ui-components` — PageHeader, StatCard, DataTable, StatusBadge, BulkActionBar, Card, Button, FormField
- `@shared/api-client` — mockData.partners
- `@shared/event-bus` — PartnerOnboarded

---

## Architecture Rules

1. **No imports from other apps**. Communicate via `@shared/event-bus`.
2. **All UI from `@shared/ui-components`**. No custom base components.
3. **RBAC on every action**. Use `usePermission` before showing approve/invite/onboard controls.
4. **Domain types from `@shared/types`**. Never define Partner locally.
5. **Styling via CSS custom properties**. No raw color values.
6. **Wizard state**: Manage multi-step form state locally with `useState`. No global state needed.
7. **Input validation**: Validate all wizard form steps before proceeding to next step.

---

## Development

```bash
npm run start:onboarding   # Standalone on :4207
npm start                  # Via shell on :4200/onboarding
```

## Key Files

| File | Purpose |
|------|---------|
| `src/remote-entry.tsx` | Main app component (exported to shell) |
| `src/bootstrap.tsx` | Standalone render entry |
| `src/index.ts` | Async bootstrap for MF |
| `webpack.config.js` | Remote MF config (port 4207) |
