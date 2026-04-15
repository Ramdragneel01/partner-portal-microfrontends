---
name: "deploy"
description: "Prepare this repository for deployment with preflight checks and release readiness validation."
argument-hint: "[environment: dev|test|prod]"
agent: "agent"
---

Deployment target: $ARGUMENTS

Workflow:
1. Confirm branch state and deployment scope.
2. Run lint, tests, and build checks relevant to scope.
3. Validate shell and remote integration readiness.
4. Call out risks, blockers, and rollback considerations.
5. Produce a concise release readiness summary.

Safety:
- Do not recommend production deployment with failing quality checks.
- Never include secrets in output or logs.
