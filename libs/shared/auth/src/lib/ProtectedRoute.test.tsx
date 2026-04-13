
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ProtectedRoute } from './ProtectedRoute';
import { UserRole } from '@shared/types';

expect.extend(toHaveNoViolations);

const mockUseAuth = vi.fn();
vi.mock('./AuthProvider', () => ({ useAuth: () => mockUseAuth() }));

describe('ProtectedRoute', () => {
    beforeEach(() => { vi.clearAllMocks(); });

    describe('loading state', () => {
        it('shows loading message while auth is loading', () => {
            mockUseAuth.mockReturnValue({ user: null, isAuthenticated: false, isLoading: true });
            render(<ProtectedRoute><div>Protected</div></ProtectedRoute>);
            expect(screen.getByRole('status')).toBeInTheDocument();
            expect(screen.getByText(/loading authentication/i)).toBeInTheDocument();
        });

        it('does not render children while loading', () => {
            mockUseAuth.mockReturnValue({ user: null, isAuthenticated: false, isLoading: true });
            render(<ProtectedRoute><div>Protected</div></ProtectedRoute>);
            expect(screen.queryByText('Protected')).not.toBeInTheDocument();
        });
    });

    describe('unauthenticated state', () => {
        it('shows authentication required when not logged in', () => {
            mockUseAuth.mockReturnValue({ user: null, isAuthenticated: false, isLoading: false });
            render(<ProtectedRoute><div>Protected</div></ProtectedRoute>);
            expect(screen.getByRole('alert')).toBeInTheDocument();
            expect(screen.getByRole('heading', { name: /authentication required/i })).toBeInTheDocument();
        });
    });

    describe('authorized access', () => {
        it('renders children when authenticated with no role restriction', () => {
            mockUseAuth.mockReturnValue({
                user: { id: '1', displayName: 'Admin', role: UserRole.Admin },
                isAuthenticated: true,
                isLoading: false,
            });
            render(<ProtectedRoute><div>Secure content</div></ProtectedRoute>);
            expect(screen.getByText('Secure content')).toBeInTheDocument();
        });

        it('renders children when user has required role', () => {
            mockUseAuth.mockReturnValue({
                user: { id: '1', displayName: 'Auditor', role: UserRole.Auditor },
                isAuthenticated: true,
                isLoading: false,
            });
            render(
                <ProtectedRoute requiredRoles={[UserRole.Admin, UserRole.Auditor]}>
                    <div>Audit view</div>
                </ProtectedRoute>
            );
            expect(screen.getByText('Audit view')).toBeInTheDocument();
        });

        it('renders children when moduleKey policy allows the role', () => {
            mockUseAuth.mockReturnValue({
                user: { id: '1', displayName: 'Auditor', role: UserRole.Auditor },
                isAuthenticated: true,
                isLoading: false,
            });
            render(
                <ProtectedRoute moduleKey="vendor-risk">
                    <div>Vendor module</div>
                </ProtectedRoute>
            );
            expect(screen.getByText('Vendor module')).toBeInTheDocument();
        });
    });

    describe('unauthorized access', () => {
        it('shows access denied when user lacks required role', () => {
            mockUseAuth.mockReturnValue({
                user: { id: '1', displayName: 'Viewer', role: UserRole.Viewer },
                isAuthenticated: true,
                isLoading: false,
            });
            render(
                <ProtectedRoute requiredRoles={[UserRole.Admin]}>
                    <div>Admin only</div>
                </ProtectedRoute>
            );
            expect(screen.getByRole('alert')).toBeInTheDocument();
            expect(screen.getByRole('heading', { name: /access denied/i })).toBeInTheDocument();
            expect(screen.queryByText('Admin only')).not.toBeInTheDocument();
        });

        it('shows access denied when moduleKey policy blocks the role', () => {
            mockUseAuth.mockReturnValue({
                user: { id: '1', displayName: 'Viewer', role: UserRole.Viewer },
                isAuthenticated: true,
                isLoading: false,
            });
            render(
                <ProtectedRoute moduleKey="event-debug">
                    <div>Event debug module</div>
                </ProtectedRoute>
            );
            expect(screen.getByRole('alert')).toBeInTheDocument();
            expect(screen.queryByText('Event debug module')).not.toBeInTheDocument();
        });
    });

    describe('accessibility', () => {
        it('loading state has no violations', async () => {
            mockUseAuth.mockReturnValue({ user: null, isAuthenticated: false, isLoading: true });
            const { container } = render(<ProtectedRoute><div>X</div></ProtectedRoute>);
            expect(await axe(container)).toHaveNoViolations();
        });

        it('access denied state has no violations', async () => {
            mockUseAuth.mockReturnValue({
                user: { id: '1', displayName: 'Guest', role: UserRole.Viewer },
                isAuthenticated: true,
                isLoading: false,
            });
            const { container } = render(
                <ProtectedRoute requiredRoles={[UserRole.Admin]}><div>X</div></ProtectedRoute>
            );
            expect(await axe(container)).toHaveNoViolations();
        });

        it('authorized state has no violations', async () => {
            mockUseAuth.mockReturnValue({
                user: { id: '1', displayName: 'Admin', role: UserRole.Admin },
                isAuthenticated: true,
                isLoading: false,
            });
            const { container } = render(
                <ProtectedRoute><div>Content</div></ProtectedRoute>
            );
            expect(await axe(container)).toHaveNoViolations();
        });
    });
});
