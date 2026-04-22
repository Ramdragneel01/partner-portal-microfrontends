# Contributing to Archaic Search Partner Portal

Thank you for contributing to the Archaic Search Partner Portal micro-frontend platform.
This guide defines the conventions we use to keep contributions consistent across the Nx monorepo.

## Project Snapshot

- Codename: Archaic Search Partner Portal
- Goal: Deliver a modular, secure, and accessible partner platform using React, Nx, and Module Federation.
- Architecture: Shell host plus independently deployable remote apps, with shared libraries under `libs/shared`.
- Core principles: secure by default, accessibility by default, minimal duplication, and simple developer workflows.

## Branch Naming Conventions

### Required Format

Use this format for all manually created branches:

`<prefix>/<issue-identifier>-<short-description>`

Short descriptions should be lowercase words joined by hyphens.

Examples:

- `feature/APP-123-user-authentication-flow`
- `bugfix/GH-123-login-error-handling`
- `docs/GH-456-contributing-guide-refresh`
- `chore/GH-789-upgrade-vitest`

### Prefix Mapping

Use the prefix that matches the issue type:

| Prefix | Use for |
|---|---|
| `feature/` | New capabilities or enhancements |
| `bugfix/` | Defect fixes |
| `chore/` | Maintenance, tooling, dependency, or repository housekeeping |
| `docs/` | Documentation-only changes |

If no issue label clearly matches, default to `feature/`.

### Issue Identifier Priority

Use this identifier priority in the branch name:

1. Linear issue identifier, when available in issue context (for example `APP-123`)
2. GitHub issue fallback using `GH-<number>` (for example `GH-123`)

### Valid and Invalid Examples

Valid:

- `feature/APP-123-user-authentication-flow`
- `bugfix/GH-123-login-error-handling`
- `docs/GH-123-api-documentation-update`
- `feature/APP-123`

Invalid:

- `feature_123` (uses underscore instead of slash and hyphen format)
- `random-branch-name` (missing required prefix)
- `Feature/APP-123` (prefix must be lowercase)

### Automated Branches

The following automated branch prefixes are allowed and excluded from manual naming rules:

- `copilot/`
- `dependabot/`

### Enforcement

Branch naming conventions are expected for all manual branches.
Current repository automation enforces lint/build/security checks in CI; branch-name compliance is reviewed during PR review and branch governance.

If you need to rename your branch before opening or merging a PR:

```bash
git branch -m <new-branch-name>
git push origin -u <new-branch-name>
```

## Commit Message Conventions

We use Conventional Commits.

Format:

`<type>(scope?): <short summary>`

Common types:

- `feat`: a new feature
- `fix`: a bug fix
- `docs`: documentation only changes
- `chore`: maintenance, tooling, repository meta
- `ci`: CI/CD workflow changes
- `refactor`: code changes that neither fix a bug nor add a feature
- `test`: test-only changes

Examples:

- `feat(shell): add remote fallback state`
- `fix(risk-assessment): guard null trend values`
- `docs(contributing): add branch naming policy`
- `chore(deps): upgrade nx to 22.6.4`

Notes:

- Keep the subject line concise and imperative.
- Use a short body when context is needed for reviewers.

## Development Workflow

Run commands from the repository root.

```bash
npm install

# Serve shell only
npm start

# Serve all apps in parallel
npm run start:all

# Serve a single remote
npm run start:risk
npm run start:compliance
npm run start:audit
npm run start:policy
npm run start:incidents
npm run start:vendor
npm run start:onboarding

# Quality checks
npm run lint
npm run build
npm test
npm run test:coverage
```

Affected-only commands (useful before PRs with focused changes):

```bash
npm run lint:affected
npm run build:affected
```

## Pull Request Validation

### What CI Validates

On pull requests to `main` and `develop`, [`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs:

- Dependency install with `npm ci`
- `npx nx affected --target=lint --parallel=3`
- `npx nx affected --target=build --parallel=3`
- `npm audit --audit-level=high` (reported, currently non-blocking)

On push to `main`, [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) builds production artifacts and deploys shell/remotes to Azure Static Web Apps.

### Before Submitting a PR

Run these locally before pushing:

```bash
npm run lint
npm run build
npm test
```

If your change touches multiple apps or shared libraries, also run:

```bash
npm run start:all
```

## Engineering Standards

### TypeScript and Boundaries

- TypeScript strict mode is enabled.
- Avoid `any`; prefer `unknown` with type guards.
- Keep domain models in `@shared/types`.
- Do not import one app from another app.
- Import shared code through `@shared/*` paths.

### React and Accessibility

- Use functional components.
- Prefer semantic HTML (`button`, `nav`, `main`, `header`, `table`).
- Ensure keyboard operability and visible focus indicators.
- Use ARIA only when native semantics are not sufficient.
- Include alt text for informative images and `alt=""` for decorative images.
- Follow WCAG 2.1 AA.

### Security

- Do not log secrets, tokens, or PII.
- Keep sensitive values in environment variables.
- Validate user input before API usage.
- Avoid `eval`, `new Function`, and unsafe dynamic execution.

### Testing

- Use Vitest and Testing Library.
- Prefer semantic selectors (`getByRole`, `getByLabelText`, `getByText`).
- Add tests for behavior changes, especially in shared libraries.
- Include accessibility assertions for new reusable UI components.

## Documentation Index

### Core Repository Docs

- [README.md](README.md) - project overview and quick start
- [ARCHITECTURE.md](ARCHITECTURE.md) - architecture, module federation model, dependency rules
- [docs/README.md](docs/README.md) - documentation index
- [docs/GETTING-STARTED.md](docs/GETTING-STARTED.md) - onboarding setup
- [docs/architecture-decisions.md](docs/architecture-decisions.md) - architecture decision records
- [docs/roadmap.md](docs/roadmap.md) - roadmap and planned enhancements
- [docs/UX-MODERNIZATION-PROBLEM-STATEMENT.md](docs/UX-MODERNIZATION-PROBLEM-STATEMENT.md) - modernization context

### App and Library Docs

- Each app under `apps/*` has a local `README.md`.
- Shared library guidance starts in `libs/shared/README.md`.

## UI Development Scope

UI changes generally belong in one of these locations:

- Domain UI in `apps/shell` and `apps/*` remotes
- Reusable UI in `libs/shared/ui-components`

For cross-app UX consistency, prefer shared components and tokens over app-specific duplication.
