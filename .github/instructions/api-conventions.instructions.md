---
name: "API Conventions"
description: "Use when modifying API integration code, request contracts, or response handling behavior."
applyTo: "{apps,libs/shared/api-client}/**/*.{ts,tsx}"
---

# API Conventions

## Client and contracts
- Use @shared/api-client for HTTP behavior instead of app-local wrappers.
- Keep tenant and auth header logic centralized in shared API utilities.
- Use explicit request and response types from @shared/types.

## Input and response safety
- Validate user-provided values before API usage.
- Guard optional fields before rendering.
- Handle null and partial responses defensively.

## Error handling
- Keep user-facing errors safe and non-sensitive.
- Distinguish validation, auth, network, and server failures.
- Maintain consistent error shapes for observability and supportability.

## Performance and sustainability
- Avoid duplicate calls when one endpoint can serve multiple UI elements.
- Prefer pagination for large data sets.
- Keep payloads minimal and cache stable reference data when safe.
