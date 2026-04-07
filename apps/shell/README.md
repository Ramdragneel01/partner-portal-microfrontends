# Shell — Host Application

> The shell is the **host** application in the Module Federation architecture.
> It provides the layout frame (Header + SideNav), authentication context, routing, and error isolation for all remote micro-apps.

---

## Responsibilities

1. **Layout orchestration**: Renders Header, SideNav, and main content area.
2. **Remote loading**: Lazy-loads 7 micro-apps via Webpack Module Federation.
3. **Authentication**: Wraps entire app in `<AuthProvider>` from `@shared/auth`.
4. **Routing**: Defines top-level routes, one per micro-app.
5. **Error isolation**: Each remote is wrapped in its own `<ErrorBoundary>`.
6. **RBAC navigation**: SideNav filters menu items based on user role.

---

## Port & Module Federation

| Property | Value |
|----------|-------|
| Port | `4200` |
| MF Name | `shell` |
| Role | Host (consumer of remotes) |

---

## Provider Hierarchy

```
<StrictMode>
  <BrowserRouter>
    <AuthProvider>
      <App>
        <Header />
        <SideNav />
        <main id="main-content">
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/risk-assessment/*" element={<ErrorBoundary><RiskAssessment /></ErrorBoundary>} />
              <Route path="/compliance/*" element={<ErrorBoundary><ComplianceDashboard /></ErrorBoundary>} />
              ...
            </Routes>
          </Suspense>
        </main>
      </App>
    </AuthProvider>
  </BrowserRouter>
</StrictMode>
```

---

## Route Table

| Path | Remote Module | Error Boundary Label |
|------|--------------|---------------------|
| `/` | Redirect → `/risk-assessment` | — |
| `/risk-assessment/*` | `riskAssessment/Module` | Risk Assessment |
| `/compliance/*` | `complianceDashboard/Module` | Compliance Dashboard |
| `/audit/*` | `auditManagement/Module` | Audit Management |
| `/policy/*` | `policyManagement/Module` | Policy Management |
| `/incidents/*` | `incidentReporting/Module` | Incident Reporting |
| `/vendor-risk/*` | `vendorRisk/Module` | Vendor Risk Management |
| `/onboarding/*` | `partnerOnboarding/Module` | Partner Onboarding |
| `*` | 404 fallback | — |

---

## Key Files

| File | Purpose |
|------|---------|
| `src/App.tsx` | Root layout — Header, SideNav, Routes with ErrorBoundaries |
| `src/bootstrap.tsx` | ReactDOM.createRoot entry point |
| `src/index.ts` | Async bootstrap for Module Federation compatibility |
| `src/index.html` | HTML template with security headers + skip link |
| `src/remotes.d.ts` | TypeScript declarations for remote modules |
| `src/components/Header.tsx` | Application header (branding, notifications, user info) |
| `src/components/SideNav.tsx` | Role-filtered navigation sidebar |
| `src/components/ErrorBoundary.tsx` | Per-remote error isolation boundary |
| `webpack.config.js` | Host Module Federation configuration |
| `project.json` | Nx project configuration |
| `tsconfig.app.json` | TypeScript configuration |

---

## Dependencies

- `@shared/auth` — AuthProvider, useAuth
- `@shared/types` — UserRole, NavItem
- `@shared/ui-components` — (available but shell uses custom layout components)
- `@shared/event-bus` — NavigationRequested, NotificationReceived

---

## Architecture Rules

1. **Shell owns the layout**. No micro-app should render its own header or sidebar.
2. **Shell owns routing**. Micro-apps receive their sub-routes via `/*` catch-all.
3. **Shell owns auth**. `<AuthProvider>` wraps everything. Apps use `useAuth()`.
4. **Shell does NOT own business logic**. No domain-specific code in shell.
5. **Every remote gets an ErrorBoundary**. Crashes are contained per-app.
6. **SideNav items are role-gated**. NAV_ITEMS define `roles` arrays.

---

## Development

```bash
npm start              # Start shell on :4200
npm run start:shell    # Same as above
```

The shell fetches remote entries from `localhost:420x`. Start the desired micro-apps in separate terminals for full functionality.
