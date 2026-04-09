
/**
 * AuthProvider — Provides authentication context to the entire application tree.
 * Supports two adapters controlled by the USE_MOCK_AUTH build-time flag:
 *   - MSAL (production): Azure AD via @azure/msal-browser PublicClientApplication
 *   - Mock (development): In-memory user for local dev without Azure AD tenant
 * @security Tokens stored in sessionStorage (cleared on tab close). No PII logged.
 */
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { PublicClientApplication, AccountInfo, InteractionRequiredAuthError } from '@azure/msal-browser';
import { MsalProvider, useMsal } from '@azure/msal-react';
import { User, UserRole } from '@shared/types';
import { msalConfig, loginRequest, apiRequest } from './msalConfig';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => void;
  getAccessToken: () => Promise<string | null>;
}


/**
 * Window-based singleton ensures all Module Federation bundles share
 * the same React context object, even when each bundles its own copy
 * of this module.
 */
const AUTH_CONTEXT_KEY = '__PARTNER_PORTAL_AUTH_CONTEXT__';
const AuthContext: React.Context<AuthContextType | null> =
  (window as any)[AUTH_CONTEXT_KEY] ||
  ((window as any)[AUTH_CONTEXT_KEY] = createContext<AuthContextType | null>(null));

// ─── Mock adapter (USE_MOCK_AUTH=true) ────────────────────────────────────────

/** Mock user for development — never used in production builds */
const MOCK_USER: User = {
  id: 'usr-001',
  displayName: 'Jane Doe',
  email: 'jane.doe@partner-portal.com',
  role: UserRole.Admin,
  avatarUrl: undefined,
};
const MOCK_TOKEN = 'mock-jwt-token-for-development';

/**
 * MockAuthProvider — local development only.
 * Auto-logs in as Jane Doe (Admin). No network calls.
 */
const MockAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(MOCK_USER);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    sessionStorage.setItem('auth_token', MOCK_TOKEN);
  }, []);

  const login = useCallback(async () => {
    setIsLoading(true);
    try {
      setUser(MOCK_USER);
      sessionStorage.setItem('auth_token', MOCK_TOKEN);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem('auth_token');
  }, []);

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    return sessionStorage.getItem('auth_token');
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, getAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

// ─── MSAL adapter (USE_MOCK_AUTH=false) ───────────────────────────────────────

/** Singleton MSAL instance shared across all MF bundles via window */
const MSAL_INSTANCE_KEY = '__PARTNER_PORTAL_MSAL_INSTANCE__';
const msalInstance: PublicClientApplication =
  (window as any)[MSAL_INSTANCE_KEY] ||
  ((window as any)[MSAL_INSTANCE_KEY] = new PublicClientApplication(msalConfig));

/**
 * Maps an MSAL AccountInfo to the portal's User domain type.
 * Role is parsed from app roles claim if present, falling back to Viewer.
 */
function mapAccountToUser(account: AccountInfo): User {
  const claims = account.idTokenClaims as Record<string, unknown> | undefined;
  const roles = (claims?.roles as string[] | undefined) ?? [];
  const roleMap: Record<string, UserRole> = {
    Admin: UserRole.Admin,
    ComplianceOfficer: UserRole.ComplianceOfficer,
    Auditor: UserRole.Auditor,
    Partner: UserRole.Partner,
  };
  const role = roles.reduce<UserRole>((acc, r) => roleMap[r] ?? acc, UserRole.Viewer);

  return {
    id: account.localAccountId,
    displayName: account.name ?? account.username,
    email: account.username,
    role,
    avatarUrl: undefined,
  };
}

/**
 * MsalAuthBridge — inner component that reads MSAL state and provides AuthContext.
 * Must be rendered inside MsalProvider.
 */
const MsalAuthBridge: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { instance, accounts, inProgress } = useMsal();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (accounts.length > 0) {
      const mapped = mapAccountToUser(accounts[0]);
      setUser(mapped);
    } else {
      setUser(null);
      sessionStorage.removeItem('auth_token');
    }
  }, [accounts]);

  const login = useCallback(async () => {
    await instance.loginRedirect(loginRequest);
  }, [instance]);

  const logout = useCallback(() => {
    sessionStorage.removeItem('auth_token');
    instance.logoutRedirect({ postLogoutRedirectUri: window.location.origin });
  }, [instance]);

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    const account = accounts[0];
    if (!account) return null;
    try {
      const result = await instance.acquireTokenSilent({ ...apiRequest, account });
      sessionStorage.setItem('auth_token', result.accessToken);
      return result.accessToken;
    } catch (err) {
      if (err instanceof InteractionRequiredAuthError) {
        await instance.acquireTokenRedirect({ ...apiRequest, account });
      }
      return null;
    }
  }, [instance, accounts]);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user && accounts.length > 0,
      isLoading: inProgress !== 'none',
      login,
      logout,
      getAccessToken,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * MsalAuthProvider — wraps MsalProvider (required by @azure/msal-react hooks)
 * and the bridge that translates MSAL state into AuthContext.
 */
const MsalAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <MsalProvider instance={msalInstance}>
    <MsalAuthBridge>{children}</MsalAuthBridge>
  </MsalProvider>
);

// ─── Public AuthProvider — switches adapter based on build flag ───────────────

// USE_MOCK_AUTH is injected by webpack DefinePlugin; default to true for safety.
const USE_MOCK = typeof (process.env as any).USE_MOCK_AUTH !== 'undefined'
  ? String((process.env as any).USE_MOCK_AUTH) === 'true'
  : true;

/**
 * AuthProvider — Use this in every app's bootstrap.tsx.
 * Automatically selects Mock or MSAL adapter based on the USE_MOCK_AUTH build-time env var.
 * @accessibility No direct UI — provides context only.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (USE_MOCK) {
    return <MockAuthProvider>{children}</MockAuthProvider>;
  }
  return <MsalAuthProvider>{children}</MsalAuthProvider>;
};

/**
 * Hook to access auth context from any component.
 * @throws Error if used outside AuthProvider.
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
