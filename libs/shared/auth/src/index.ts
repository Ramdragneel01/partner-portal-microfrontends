
/**
 * Shared Auth Library — Authentication context, hooks, and RBAC utilities.
 * Wraps MSAL for Azure AD integration; provides useAuth/usePermission hooks.
 * @module @shared/auth
 */
export { AuthProvider, useAuth } from './lib/AuthProvider';
export { ProtectedRoute } from './lib/ProtectedRoute';
export {
	canRoleAccessModule,
	getAccessibleModules,
	getModuleKeyForPath,
	getRequiredRolesForModule,
	useModuleAccess,
} from './lib/moduleAccess';
export { usePermission } from './lib/usePermission';
export type { AuthContextType } from './lib/AuthProvider';
export type { ModuleKey } from './lib/moduleAccess';
