# Security Policy

## Supported Versions

| Branch / Tag | Security Updates |
|---|---|
| `main` | ✅ Active |
| `develop` | ✅ Active (pre-release) |
| Older tags | ❌ Not supported |

---

## Reporting a Vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Please report security issues by emailing the maintainers directly or using your organization's private disclosure channel. Include:

1. A description of the vulnerability and its potential impact.
2. Steps to reproduce or a proof-of-concept.
3. Affected files, components, or routes.
4. Suggested remediation (if known).

You can expect an initial acknowledgement within **2 business days** and a full assessment within **7 business days**. Critical issues (CVSS ≥ 9.0) are patched on an emergency basis.

---

## Security Controls

### Authentication & Authorization
- Azure AD authentication via **MSAL** (`@azure/msal-browser` / `@azure/msal-react`).
- Mock auth provider available for local development only (`USE_MOCK_AUTH=true`).
- Auth tokens are stored in **`sessionStorage` only** — never `localStorage`.
- RBAC enforced at two layers: shell navigation (route guard) and action level (`usePermission` hook inside each micro-app).

### Navigation Safety
- All event-driven navigation is validated against an `ALLOWED_NAV_ROOTS` allowlist before being passed to React Router.
- Paths containing `://`, double slashes, or unknown roots are silently rejected to prevent open-redirect attacks.

### Secret Management
- MSAL credentials (`MSAL_CLIENT_ID`, `MSAL_TENANT_ID`, `API_SCOPE`) and API URLs must only be supplied via environment variables.
- Never commit `.env.development` or any file containing real secrets. Use `.env.example` as the committed template.
- All production secrets are managed via **GitHub Secrets** and injected at CI/CD build time.

### HTTP Security Headers
The following headers are set on the shell `index.html` and apply to all hosted static assets:

| Header | Value / Policy |
|--------|---------------|
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` (clickjacking protection) |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | Camera, microphone, geolocation disabled |

### Content Security Policy
- No `eval()`, `new Function()`, or inline scripts — code is CSP-compatible by design.
- Module Federation remote entry URLs must be explicitly allowlisted in the production CSP.

### Dependency Management
- `npm audit --audit-level=high` runs automatically on every CI build.
- Dependabot is configured to file PRs for outdated or vulnerable dependencies.
- The `axios` package version is pinned via `overrides` in `package.json` to a known-safe version.

### Input Validation
- All user input is validated client-side before API calls.
- API responses are typed via `@shared/types` — raw `any` casts are prohibited.

### Logging
- No PII (emails, tokens, user IDs) may appear in `console.log` output.
- Structured error logging is used; stack traces are suppressed in production builds.

---

## Dependency Auditing

```bash
# Check for known vulnerabilities
npm audit

# Auto-fix safe updates
npm audit fix
```

Any dependency with a **high** or **critical** severity must be resolved before merging to `main`.

---

## CI/CD Security

- The CI pipeline (`ci.yml`) runs with minimal GitHub Actions permissions (`contents: read` only).
- No secrets are printed to workflow logs.
- Deployment credentials are injected via GitHub Secrets — never hardcoded in workflow files.
- Azure Static Web Apps deployment uses OIDC-based authentication where available.
