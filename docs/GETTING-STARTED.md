# Getting Started — Partner Portal

> Everything you need to clone, install, and run the Partner Portal micro-frontend platform.
> Time to first working app: **under 5 minutes**.

---

## Prerequisites

| Tool | Minimum Version | Check Command | Install |
|------|----------------|---------------|---------|
| **Node.js** | 20+ | `node -v` | [nodejs.org](https://nodejs.org/) |
| **npm** | 9+ | `npm -v` | Bundled with Node.js |
| **Git** | 2.30+ | `git --version` | [git-scm.com](https://git-scm.com/) |

> **Windows users**: Use PowerShell or Windows Terminal. Git Bash also works.
> **macOS/Linux**: Default terminal is fine.

---

## 1. Clone & Install

```bash
git clone <repo-url> partner-portal-microfrontends
cd partner-portal-microfrontends
npm install
```

`npm install` installs all dependencies for the shell, 7 micro-apps, and 5 shared libraries in one go (Nx workspace handles it from the root).

---

## 2. Configure Environment

Create your local environment file from the template:

```bash
cp .env.example .env.development
```

Recommended defaults for local development without backend containers:

- `USE_MOCK_AUTH=true`
- `USE_MOCK_DATA=true`

Choose a mock dataset size for local performance checks:

- `MOCK_DATA_SCALE=small` for regular development
- `MOCK_DATA_SCALE=10k` for medium-volume testing
- `MOCK_DATA_SCALE=100k` for high-volume testing
- `MOCK_DATA_SCALE=600k` for large-dataset pagination testing
- `MOCK_DATA_SCALE=1m` for stress testing
- `MOCK_DATA_SCALE=2m` for extreme-volume stress testing

Both legacy env names and VITE aliases are accepted.

---

## 3. Run the Full Portal

### Option A — Single Command (Recommended)

```bash
npm run start:all     # Or :
npm run dev
```

This starts **all 8 apps** in parallel from a single terminal using Nx `run-many`. Once all compilations complete, open **http://localhost:4200** to see the full portal.

### Option B — Separate Terminals

If you prefer to start apps individually (e.g., for focused log output), open separate terminals:

#### Terminal 1 — Shell (Host)
```bash
npm start
```

#### Terminals 2–8 — Micro-Apps
```bash
npm run start:risk         # http://localhost:4201
npm run start:compliance   # http://localhost:4202
npm run start:audit        # http://localhost:4203
npm run start:policy       # http://localhost:4204
npm run start:incidents    # http://localhost:4205
npm run start:vendor       # http://localhost:4206
npm run start:onboarding   # http://localhost:4207
```

Once all are running, go to **http://localhost:4200** — you'll see the full portal with all 7 apps loaded via the sidebar navigation.

---

## 4. Run a Single App (Quick Start)

Don't need the full portal? Run just one app standalone:

```bash
npm run start:risk
```

This serves Risk Assessment at **http://localhost:4201** independently with its own HTML page. Useful for focused development on one domain.

> **Note**: When running standalone, the shell layout (Header, SideNav) won't appear — you'll see the app content only.

---

## 5. Build All Apps

```bash
npm run build
```

Builds all 8 apps in parallel to `dist/apps/`. Output:

```
dist/apps/
├── shell/
├── risk-assessment/
├── compliance-dashboard/
├── audit-management/
├── policy-management/
├── incident-reporting/
├── vendor-risk/
└── partner-onboarding/
```

### Build Only Changed Apps (CI)

```bash
npm run build:affected
```

Uses Nx's dependency graph to build only apps affected by recent changes — faster CI builds.

---

## 6. View Dependency Graph

```bash
npm run graph
```

Opens an interactive visualization of all projects and their dependencies in your browser.

---

## Port Reference

| App | Port | npm Script | URL |
|-----|------|-----------|-----|
| Shell (Host) | 4200 | `npm start` | http://localhost:4200 |
| Risk Assessment | 4201 | `npm run start:risk` | http://localhost:4201 |
| Compliance Dashboard | 4202 | `npm run start:compliance` | http://localhost:4202 |
| Audit Management | 4203 | `npm run start:audit` | http://localhost:4203 |
| Policy Management | 4204 | `npm run start:policy` | http://localhost:4204 |
| Incident Reporting | 4205 | `npm run start:incidents` | http://localhost:4205 |
| Vendor Risk | 4206 | `npm run start:vendor` | http://localhost:4206 |
| Partner Onboarding | 4207 | `npm run start:onboarding` | http://localhost:4207 |

---

## How It Works

```
You open http://localhost:4200
         │
         ▼
    Shell loads (Header + SideNav + Content area)
         │
         ▼
    You click "Risk Assessment" in sidebar
         │
         ▼
    Shell fetches localhost:4201/remoteEntry.js
         │
         ▼
    Risk Assessment React component renders in content area
         │
    React, ReactDOM, Router shared as singletons (loaded once)
```

The shell is a **host** that loads **remote** micro-apps via [Webpack Module Federation](https://webpack.js.org/concepts/module-federation/). Each app is built and served independently but shares React as a singleton to avoid duplication.

---

## Default Auth

The app ships with a **mock auth provider** — you're automatically logged in as:

| Field | Value |
|-------|-------|
| Name | Jane Doe |
| Email | jane.doe@partner-portal.com |
| Role | `Admin` (full access) |

No login screen, no Azure setup needed. Just start the app and go.

To test with different roles, edit the `MOCK_USER` object in `libs/shared/auth/src/lib/AuthProvider.tsx` and change the `role` field to `Partner`, `Auditor`, `ComplianceOfficer`, or `Viewer`. The sidebar navigation and action buttons will filter based on role.

---

## Project Structure at a Glance

```
partner-portal-microfrontends/
├── apps/                    # 1 shell + 7 micro-apps
│   ├── shell/               # Host app (layout, routing, auth)
│   ├── risk-assessment/     # Risk register & scoring
│   ├── compliance-dashboard/# Framework compliance
│   ├── audit-management/    # Audit plans & findings
│   ├── policy-management/   # Policy library & workflows
│   ├── incident-reporting/  # Incident tracking
│   ├── vendor-risk/         # Vendor risk scoring
│   └── partner-onboarding/  # Onboarding wizard
├── libs/shared/             # Shared libraries (@shared/*)
│   ├── types/               # Domain models & enums
│   ├── auth/                # Auth provider & RBAC
│   ├── ui-components/       # 11 design system components
│   ├── api-client/          # HTTP client & mock data
│   └── event-bus/           # Cross-app pub/sub events
├── tools/webpack/           # Shared webpack config factory
├── docs/                    # Architecture decisions & roadmap
├── ARCHITECTURE.md          # Full architecture reference
├── CONTRIBUTING.md          # Development guidelines
└── package.json             # All scripts & dependencies
```

Each folder has its own `README.md` with detailed documentation.

---

## Common Tasks

### Add a new component to the design system
Edit in `libs/shared/ui-components/src/lib/`, export from `src/index.ts`.

### Add a new domain type
Add to `libs/shared/types/src/index.ts`. Use `import { MyType } from '@shared/types'` in apps.

### Add a cross-app event
Add to `AppEvent` enum and `AppEventPayload` in `libs/shared/event-bus/src/index.ts`.

### Change RBAC permissions
Edit `PERMISSION_MATRIX` in `libs/shared/auth/src/lib/usePermission.ts`.

### Add a new micro-app
Follow the 10-step checklist in [ARCHITECTURE.md](../ARCHITECTURE.md#adding-a-new-micro-app).

---

## Troubleshooting

### Port already in use
```
Error: listen EADDRINUSE :::4200
```
Kill the process using the port:
```bash
# Windows
netstat -ano | findstr :4200
taskkill /PID <pid> /F

# macOS/Linux
lsof -ti:4200 | xargs kill
```

### Remote app not loading in shell
1. Make sure the remote app dev server is running on its port.
2. Check the browser console for network errors fetching `remoteEntry.js`.
3. Verify the port matches what's configured in `apps/shell/webpack.config.js` → `remotes`.

### TypeScript path alias errors
Run `npm install` from the repo root. Path aliases (`@shared/*`) are resolved via `tsconfig.base.json` and webpack aliases — both must match.

### Build fails
```bash
npm run build 2>&1
```
Check the error output. Common causes:
- Missing export in a `@shared/*` barrel file (`src/index.ts`)
- Importing from one app into another (forbidden — use event bus)
- Type errors from `@shared/types` changes

### Clear Nx cache
```bash
npx nx reset
```

---

## Next Steps

- Read [ARCHITECTURE.md](../ARCHITECTURE.md) for the full system design
- Read [CONTRIBUTING.md](../CONTRIBUTING.md) before your first PR
- Check [docs/roadmap.md](roadmap.md) for planned enhancements
- Run `npm run graph` to explore the dependency graph visually
