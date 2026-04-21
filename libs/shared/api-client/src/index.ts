
/**
 * Shared API Client — HTTP client with auth token injection and mock data support.
 * @module @shared/api-client
 * @security Automatically attaches bearer token from sessionStorage.
 */
export { apiClient } from './lib/apiClient';
export { setApiRuntimeContext, clearApiClientCache } from './lib/apiClient';
export { isMockDataEnabled, createApiEventSource } from './lib/apiClient';
export { mockData } from './lib/mockData';
export { mockDataPreset } from './lib/mockData';
