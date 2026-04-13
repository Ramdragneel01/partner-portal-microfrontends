# @shared/api-client — HTTP Client

> Lightweight fetch-based HTTP client with automatic auth token injection and mock data.
> Used by all micro-apps for backend API communication.

---

## Import

```typescript
import { apiClient, mockData } from '@shared/api-client';
```

---

## API Client

### Methods

```typescript
apiClient.get<T>(path: string, config?: RequestConfig): Promise<T>
apiClient.post<T>(path: string, body: unknown, config?: RequestConfig): Promise<T>
apiClient.put<T>(path: string, body: unknown, config?: RequestConfig): Promise<T>
apiClient.patch<T>(path: string, body: unknown, config?: RequestConfig): Promise<T>
apiClient.delete<T>(path: string, config?: RequestConfig): Promise<T>
```

### RequestConfig

| Property | Type | Description |
|----------|------|-------------|
| `headers` | `Record<string, string>?` | Additional headers |
| `signal` | `AbortSignal?` | Request cancellation signal |

### Automatic Headers

Every request automatically includes:

| Header | Source | Value |
|--------|--------|-------|
| `Content-Type` | Default | `application/json` |
| `Authorization` | `sessionStorage['auth_token']` | `Bearer <token>` |

### Base URL

Default: `/api` (configurable in `apiClient.ts`).

### Error Handling

Throws an `Error` for non-OK responses with the status text. Callers should wrap in try/catch:

```typescript
try {
  const risks = await apiClient.get<RiskAssessment[]>('/risks');
} catch (error) {
  // handle HTTP error
}
```

---

## Mock Data

Pre-built test datasets for all 7 domains. Used during development before backend API is available.

```typescript
import { mockData } from '@shared/api-client';

mockData.risks        // RiskAssessment[] — 5 records
mockData.frameworks   // ComplianceFramework[] — 4 records
mockData.controls     // ComplianceControl[] — 3 records
mockData.audits       // AuditPlan[] — 3 records
mockData.findings     // AuditFinding[] — 3 records
mockData.policies     // Policy[] — 4 records
mockData.incidents    // Incident[] — 3 records
mockData.vendors      // Vendor[] — 4 records
mockData.partners     // Partner[] — 4 records
```

Scale presets can be configured with `MOCK_DATA_SCALE` / `VITE_MOCK_DATA_SCALE`:

```bash
small | 10k | 100k | 600k | 1m | 2m
```

For non-`small` presets, each domain dataset is expanded to the selected record count.

### Sample Data

| Domain | Example Record | Key Details |
|--------|---------------|-------------|
| Risks | RSK-001 "Unpatched production servers" | Critical, riskScore: 20, open |
| Frameworks | SOC 2 Type II | 81% compliant, 45 total controls |
| Audits | Q1 2026 Security Audit | Completed, 8 findings |
| Policies | Information Security Policy | Published v3.1 |
| Incidents | Phishing Attack on Finance | Critical, investigating |
| Vendors | QuickPay Solutions | High risk, score 78, under review |
| Partners | Acme Global Solutions | Pending approval |

---

## Future Enhancements

1. **Request caching** — Add cache layer with configurable TTL (similar to Oscar's `axios-cache-interceptor`).
2. **Retry logic** — Automatic retry with exponential backoff for 5xx errors.
3. **Request deduplication** — Prevent duplicate concurrent requests to the same endpoint.
4. **Multi-tenant headers** — Add `X-Tenant-ID` header injection for multi-tenancy.
5. **AbortController management** — Auto-cancel in-flight requests on component unmount.

---

## Architecture Rules

1. **Single HTTP client**. All apps use `apiClient`. No custom fetch/axios instances.
2. **Token from sessionStorage**. Never pass tokens manually — auto-injected.
3. **Mock data for development only**. Replace with real API calls when backend is ready.
4. **Depends only on `@shared/types`**. No imports from other libraries.
5. **Input validation**: Validate request payloads before sending to API.

---

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/apiClient.ts` | HTTP client implementation |
| `src/lib/mockData.ts` | Mock datasets for all 7 domains |
| `src/index.ts` | Barrel exports |
