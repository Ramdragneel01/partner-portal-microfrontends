
import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AuthProvider, useAuth } from './AuthProvider';

expect.extend(toHaveNoViolations);

// Consumer component for testing hook
const AuthConsumer: React.FC = () => {
    const { user, isAuthenticated, isLoading, login, logout } = useAuth();
    return (
        <div>
            <span data-testid="loading">{String(isLoading)}</span>
            <span data-testid="authenticated">{String(isAuthenticated)}</span>
            <span data-testid="user">{user?.displayName ?? 'none'}</span>
            <button onClick={login}>Login</button>
            <button onClick={logout}>Logout</button>
        </div>
    );
};

describe('AuthProvider', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        sessionStorage.clear();
    });
    afterEach(() => {
        sessionStorage.clear();
    });

    it('provides authenticated user by default (mock mode)', () => {
        render(<AuthProvider><AuthConsumer /></AuthProvider>);
        expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
        expect(screen.getByTestId('user')).toHaveTextContent('Jane Doe');
    });

    it('is not in loading state by default', () => {
        render(<AuthProvider><AuthConsumer /></AuthProvider>);
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    it('logs out and clears user', async () => {
        render(<AuthProvider><AuthConsumer /></AuthProvider>);
        await userEvent.click(screen.getByRole('button', { name: 'Logout' }));
        expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
        expect(screen.getByTestId('user')).toHaveTextContent('none');
    });

    it('clears session storage on logout', async () => {
        sessionStorage.setItem('auth_token', 'test-token');
        render(<AuthProvider><AuthConsumer /></AuthProvider>);
        await userEvent.click(screen.getByRole('button', { name: 'Logout' }));
        expect(sessionStorage.getItem('auth_token')).toBeNull();
    });

    it('logs in and sets user', async () => {
        render(<AuthProvider><AuthConsumer /></AuthProvider>);
        // Logout first
        await userEvent.click(screen.getByRole('button', { name: 'Logout' }));
        expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
        // Login
        await userEvent.click(screen.getByRole('button', { name: 'Login' }));
        await waitFor(() => {
            expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
        });
    });

    it('throws when useAuth is used outside AuthProvider', () => {
        const spy = vi.spyOn(console, 'error').mockImplementation(() => { });
        expect(() => render(<AuthConsumer />)).toThrow();
        spy.mockRestore();
    });

    describe('accessibility', () => {
        it('has no violations', async () => {
            const { container } = render(<AuthProvider><div>App</div></AuthProvider>);
            expect(await axe(container)).toHaveNoViolations();
        });
    });
});
