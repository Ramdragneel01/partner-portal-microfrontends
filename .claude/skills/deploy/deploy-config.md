# Deploy Config Reference

## Environments
- dev: rapid validation and smoke checks
- test: integration verification with representative data
- prod: controlled release with rollback readiness

## Preflight checklist
- Branch is up to date with the target base.
- No unresolved merge conflicts.
- Environment variables come from secure sources.
- Auth and API endpoints match the target environment.

## Verification checklist
- Shell app can load each required remote.
- Route navigation works for key journeys:
  - /risk-assessment
  - /compliance
  - /audit
  - /policy
  - /incidents
  - /vendor-risk
  - /onboarding
- Error boundaries render safe fallback for failed remotes.
- Accessibility smoke checks pass for keyboard navigation and focus visibility.

## Rollback readiness
- Previous known-good artifact version is documented.
- Rollback process is available to the on-call team.
- Post-deploy monitoring owner is assigned.
