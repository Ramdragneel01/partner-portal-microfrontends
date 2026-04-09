
/**
 * ProtectedRoute — Renders children only if user is authenticated and has required role.
 * @accessibility Shows accessible "Access Denied" message with proper ARIA attributes.
 */
import React from 'react';
import { useAuth } from './AuthProvider';
import { UserRole } from '@shared/types';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRoles }) => {
    const { user, isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div role="status" aria-live="polite" style={{ padding: '2rem', textAlign: 'center' }}>
                <span>Loading authentication...</span>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return (
            <div role="alert" aria-live="assertive" style={{ padding: '2rem', textAlign: 'center' }}>
                <h2>Authentication Required</h2>
                <p>Please sign in to access this page.</p>
            </div>
        );
    }

    if (requiredRoles && requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
        return (
            <div role="alert" aria-live="assertive" style={{ padding: '2rem', textAlign: 'center' }}>
                <h2>Access Denied</h2>
                <p>You do not have permission to access this page.</p>
            </div>
        );
    }

    return <>{children}</>;
};
