
/**
 * MSAL Configuration — Azure AD authentication settings.
 * All values must be provided via environment variables; no defaults in production.
 * @security Never commit real tenant/client IDs. Use .env.local for local dev.
 */
import { Configuration, LogLevel } from '@azure/msal-browser';

/**
 * MSAL PublicClientApplication configuration.
 * Reads from webpack DefinePlugin-injected globals at build time.
 */
export const msalConfig: Configuration = {
  auth: {
    clientId: (typeof process !== 'undefined' && (process.env as any).MSAL_CLIENT_ID) || '',
    authority: `https://login.microsoftonline.com/${(typeof process !== 'undefined' && (process.env as any).MSAL_TENANT_ID) || 'common'}`,
    redirectUri: (typeof process !== 'undefined' && (process.env as any).MSAL_REDIRECT_URI) || window.location.origin,
    postLogoutRedirectUri: window.location.origin,
    navigateToLoginRequestUrl: true,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        if (process.env.NODE_ENV === 'development') {
          console.log(`[MSAL ${LogLevel[level]}] ${message}`);
        }
      },
      logLevel: LogLevel.Warning,
    },
  },
};

/** Default OAuth scopes to request on login */
export const loginRequest = {
  scopes: ['User.Read', 'openid', 'profile', 'email'],
};

/** Graph API scope for acquiring access tokens for downstream APIs */
export const apiRequest = {
  scopes: [(typeof process !== 'undefined' && (process.env as any).API_SCOPE) || 'api://partner-portal/.default'],
};
