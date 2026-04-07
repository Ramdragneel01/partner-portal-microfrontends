# @shared/types — Domain Type System

> Single source of truth for all domain models, enums, and interfaces.
> Every app and library imports types exclusively from this package.

---

## Import

```typescript
import { UserRole, RiskLevel, RiskAssessment, Incident } from '@shared/types';
```

---

## Enums

| Enum | Values |
|------|--------|
| `UserRole` | `Admin`, `Partner`, `Auditor`, `ComplianceOfficer`, `Viewer` |
| `RiskLevel` | `Critical`, `High`, `Medium`, `Low`, `Info` |
| `ComplianceStatus` | `Compliant`, `NonCompliant`, `InProgress`, `NotAssessed` |
| `AuditStatus` | `Planned`, `InProgress`, `Completed`, `Closed` |
| `PolicyStatus` | `Draft`, `UnderReview`, `Approved`, `Published`, `Archived` |
| `IncidentSeverity` | `Critical`, `High`, `Medium`, `Low` |
| `IncidentStatus` | `Open`, `Investigating`, `Contained`, `Resolved`, `Closed` |
| `VendorRiskRating` | `High`, `Medium`, `Low` |
| `OnboardingStep` | `CompanyInfo`, `KYC`, `Compliance`, `Review`, `Approval` |
| `OnboardingStatus` | `NotStarted`, `InProgress`, `PendingApproval`, `Approved`, `Rejected` |

---

## Interfaces

### Generic

| Interface | Fields |
|-----------|--------|
| `User` | `id`, `displayName`, `email`, `role: UserRole`, `avatarUrl?` |
| `ApiResponse<T>` | `data: T`, `message?`, `status` |
| `PaginatedResult<T>` | `items: T[]`, `total`, `page`, `pageSize` |
| `AuditMeta` | `createdBy`, `createdAt`, `updatedBy`, `updatedAt` |
| `NavItem` | `key`, `label`, `path`, `icon`, `roles: UserRole[]` |

### Domain Models

| Interface | Domain | Key Fields |
|-----------|--------|------------|
| `RiskAssessment` | Risk | `likelihood` (1–5), `impact` (1–5), `riskScore`, `riskLevel`, `owner`, `dueDate` |
| `ComplianceFramework` | Compliance | `name`, `totalControls`, `compliantControls`, `score` |
| `ComplianceControl` | Compliance | `controlId`, `title`, `status`, `owner`, `evidenceCount` |
| `AuditPlan` | Audit | `name`, `type`, `status`, `startDate`, `endDate`, `findingsCount` |
| `AuditFinding` | Audit | `auditId`, `severity`, `status`, `owner`, `dueDate` |
| `Policy` | Policy | `title`, `category`, `status`, `version`, `effectiveDate` |
| `Incident` | Incidents | `severity`, `status`, `category`, `affectedSystems`, `reporter` |
| `Vendor` | Vendor Risk | `name`, `riskRating`, `riskScore`, `contractExpiry` |
| `Partner` | Onboarding | `companyName`, `contactEmail`, `currentStep`, `status` |

---

## Architecture Rules

1. **All domain types defined here**. No app should define its own domain interfaces.
2. **No dependencies**. This library imports from nothing — it is the foundation.
3. **Enums use string values** for serialization safety and debug readability.
4. **AuditMeta on every entity**. All domain models include `audit: AuditMeta`.
5. **Extend, don't modify**. When adding fields, keep backward compatibility.

---

## Adding a New Type

1. Define the interface/enum in `src/index.ts`.
2. Export it from the barrel export.
3. Document it in this README.
4. Use it in apps via `import { NewType } from '@shared/types'`.

---

## Key Files

| File | Purpose |
|------|---------|
| `src/index.ts` | All enums, interfaces, and type exports |
| `project.json` | Nx project configuration |
| `tsconfig.json` | TypeScript configuration |
