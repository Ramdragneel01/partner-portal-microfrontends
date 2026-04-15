# CLAUDE.md

This file is loaded at session start for repository-wide context.
Keep this file short and stable. Put repeatable workflows in skills or commands.

## Read these first
- ARCHITECTURE.md
- CONTRIBUTING.md
- SECURITY.md
- .github/copilot-instructions.md
- docs/GETTING-STARTED.md

## Project at a glance
- Nx 22 monorepo with Webpack 5 Module Federation.
- Host app: shell on port 4200.
- Remote apps: risk-assessment (4201), compliance-dashboard (4202), audit-management (4203), policy-management (4204), incident-reporting (4205), vendor-risk (4206), partner-onboarding (4207).
- Shared libraries in libs/shared: types, auth, ui-components, api-client, event-bus.

## Core commands
- npm install
- npm start
- npm run start:all
- npm run lint
- npm test
- npm run build
- npm run build:affected
- npm run graph

## Known reliability notes
- Run commands from the repository root.
- If Nx graph or plugin worker fails, retry with:
  - PowerShell: $env:NX_ISOLATE_PLUGINS='false'; $env:NX_DAEMON='false'; npm run build
- Shell-only build fallback:
  - npx webpack --config apps/shell/webpack.config.js --mode development

## Architecture guardrails
- Never import from one app into another app.
- Apps import shared code only via @shared/* barrel exports.
- Shared libraries may depend on @shared/types only.
- Cross-app coordination uses @shared/event-bus, not direct app imports.
- Keep react, react-dom, and react-router-dom as federation singletons.

## Security and privacy
- Never print secrets, tokens, or PII in logs.
- Validate untrusted input before API usage.
- Keep auth tokens in sessionStorage, never localStorage.
- Do not disable security headers or RBAC checks.

## Accessibility baseline
- Follow WCAG 2.1 AA.
- Prefer semantic HTML and keyboard-accessible interactions.
- Ensure visible focus states and accessible labels for icon-only controls.

## Testing baseline
- Use Vitest and Testing Library.
- Prefer getByRole, getByLabelText, and getByText selectors.
- Add regression tests for behavior changes, especially in libs/shared.

## Local overrides
- Optional per-developer overrides go in CLAUDE.local.md.
- CLAUDE.local.md should not be committed.
