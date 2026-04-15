---
name: deploy
description: Prepare this Nx microfrontend repo for deployment with preflight checks, build validation, and release notes.
disable-model-invocation: true
argument-hint: "[environment: dev|test|prod]"
---

Deploy target: $ARGUMENTS

Use the deployment profile and checklist in [deploy-config.md](deploy-config.md).

Deployment runbook:
1. Confirm branch state and workspace cleanliness.
2. Run quality gates:
   - npm run lint
   - npm test
3. Build artifacts:
   - npm run build
   - npm run build:affected when validating a focused change set
4. Validate expected outputs:
   - shell and remote bundles build successfully
   - remoteEntry assets are present for required remotes
5. Generate a deployment summary:
   - environment
   - commit and branch
   - commands run
   - pass or fail results
   - follow-up actions

Safety rules:
- Never deploy with failing lint or tests.
- Never include secrets in logs or artifacts.
- Require explicit confirmation before production actions.
