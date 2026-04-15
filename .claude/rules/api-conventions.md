---
description: API client and contract conventions for frontend modules.
paths:
  - libs/shared/api-client/**
  - apps/**
---

# API Conventions

## Client usage
- Use @shared/api-client for HTTP access instead of ad-hoc per-app wrappers.
- Keep auth and tenant headers centralized in shared API utilities.
- Use explicit request and response types from @shared/types.

## Input and output validation
- Validate user-provided values before sending requests.
- Guard optional fields before rendering.
- Handle partial and null API responses defensively.

## Error handling
- Show user-safe messages and avoid exposing internal details.
- Distinguish validation, auth, network, and server failures in UI state.
- Use consistent error shapes for logging and cross-app event handling.

## Performance and sustainability
- Batch requests when practical and avoid duplicate calls.
- Cache stable reference data when safe.
- Keep payloads minimal and paginate large collections.
