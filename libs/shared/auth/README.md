# @shared/auth — Authentication & RBAC

> Authentication context, role-based access control, and route protection.
> Provides the auth provider, permission hooks, and protected route wrapper.

---

## Import

```typescript
import { AuthProvider, useAuth, ProtectedRoute, usePermission } from '@shared/auth';
```

---

## Exports

### `AuthProvider` & `useAuth()`

React context provider for authentication state.

```tsx
// Wrap app in AuthProvider (done in shell's bootstrap.tsx)
<AuthProvider>
  <App />
</AuthProvider>

// Access auth state in any component
const { user, isAuthenticated, isLoading, login, logout, getAccessToken } = useAuth();
```

**AuthContext interface:**

| Property | Type | Description |
|----------|------|-------------|
| `user` | `User \| null` | Current authenticated user |
| `isAuthenticated` | `boolean` | Whether user is logged in |
| `isLoading` | `boolean` | Auth initialization in progress |
| `login()` | `() => Promise<void>` | Trigger login flow |
| `logout()` | `() => void` | Clear session and log out |
| `getAccessToken()` | `() => Promise<string \| null>` | Get current Bearer token |

**Current adapter**: Mock (starts signed out; sign-in resolves to Jane Doe / Admin for local development).
**Future adapter**: MSAL for Azure Entra ID.

---

### `usePermission(action, resource)`

Hook for checking RBAC permissions at the component level.

```tsx
const canCreate = usePermission('create', 'risk');
// Returns boolean — true if current user's role has that permission

{canCreate && <Button onClick={handleCreate}>New Risk</Button>}
```

**Permission Matrix:**

| Resource | view | create | edit | delete | approve | publish | assess | report | investigate | resolve | onboard | bulkInvite |
|----------|------|--------|------|--------|---------|---------|--------|--------|-------------|---------|---------|------------|
| `risk` | All | A,CO | A,CO | A | A,CO | — | — | — | — | — | — | — |
| `compliance` | All | — | A,CO | — | — | — | A,CO,Au | — | — | — | — | — |
| `audit` | A,Au,CO,V | A,Au | A,Au | — | — | — | — | — | — | — | — | — |
| `policy` | A,CO,P,V | A,CO | — | — | A | A | — | — | — | — | — | — |
| `incident` | A,CO,P,V | — | — | — | — | — | — | A,CO,P | A,CO | A,CO | — | — |
| `vendor` | A,CO,V | A,CO | A,CO | — | — | — | A,CO,Au | — | — | — | — | — |
| `partner` | A,P,V | — | — | — | A | — | — | — | — | — | A,P | A |

> A=Admin, Au=Auditor, CO=ComplianceOfficer, P=Partner, V=Viewer

---

### `ProtectedRoute`

Route wrapper that enforces authentication and optional role requirements.

```tsx
<ProtectedRoute requiredRoles={[UserRole.Admin, UserRole.ComplianceOfficer]}>
  <AdminPanel />
</ProtectedRoute>
```

**Behavior:**
- If not authenticated → shows "Authentication Required" alert
- If authenticated but wrong role → shows "Access Denied" alert
- Both alerts use `role="alert"` and `aria-live` for accessibility

---

## Token Storage

- Stored in `sessionStorage` under key `auth_token`.
- Cleared on tab close (sessionStorage behavior).
- Injected as `Authorization: Bearer <token>` by `@shared/api-client`.

---

## MSAL Migration Plan

The current mock adapter will be replaced with MSAL:

1. Install `@azure/msal-browser` and `@azure/msal-react`.
2. Create `MsalAuthAdapter` implementing the same `login/logout/getUser/getAccessToken` interface.
3. Configure via environment variables: `MSAL_CLIENT_ID`, `MSAL_AUTHORITY`, `MSAL_REDIRECT_URI`.
4. Replace mock user with MSAL token parsed claims.
5. Switch adapters based on `REACT_APP_AUTH_MODE=msal|mock` env var.

---

## Architecture Rules

1. **Shell owns `<AuthProvider>`**. No app should create its own auth context.
2. **Always use `usePermission`** for gating actions. Never hardcode role checks.
3. **Token in sessionStorage only**. Never localStorage for auth tokens.
4. **No PII in logs**. Never console.log user emails or tokens.
5. **Depends only on `@shared/types`**. No imports from other libraries.

---

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/AuthProvider.tsx` | Auth context provider + useAuth hook |
| `src/lib/usePermission.ts` | RBAC permission matrix + hook |
| `src/lib/ProtectedRoute.tsx` | Route protection wrapper |
| `src/index.ts` | Barrel exports |
