
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Header from './Header';

expect.extend(toHaveNoViolations);

const mockUseAuth = vi.fn();
const mockUseThemeMode = vi.fn();

vi.mock('@shared/auth', () => ({ useAuth: () => mockUseAuth() }));
vi.mock('@shared/ui-components', () => ({
    useThemeMode: () => mockUseThemeMode(),
    themeTokens: { layout: { headerHeight: 56 } },
}));

// Stub all MUI components minimally
vi.mock('@mui/material/AppBar', () => ({ default: ({ children, component, ...p }: any) => <header {...p}>{children}</header> }));
vi.mock('@mui/material/Toolbar', () => ({ default: ({ children }: any) => <div>{children}</div> }));
vi.mock('@mui/material/Typography', () => ({ default: ({ children }: any) => <span>{children}</span> }));
vi.mock('@mui/material/IconButton', () => ({ default: ({ children, onClick, 'aria-label': label }: any) => <button aria-label={label} onClick={onClick}>{children}</button> }));
vi.mock('@mui/material/Box', () => ({ default: ({ children, component, ...p }: any) => { const T = component || 'div'; return <T {...p}>{children}</T>; } }));
vi.mock('@mui/material/Avatar', () => ({ default: ({ children }: any) => <span data-testid="avatar">{children}</span> }));
vi.mock('@mui/material/Tooltip', () => ({ default: ({ children }: any) => <>{children}</> }));
vi.mock('@mui/material/Menu', () => ({ default: ({ children, open }: any) => open ? <ul role="menu">{children}</ul> : null }));
vi.mock('@mui/material/MenuItem', () => ({ default: ({ children, onClick }: any) => <li role="menuitem" onClick={onClick}>{children}</li> }));
vi.mock('@mui/material/Badge', () => ({ default: ({ children, badgeContent }: any) => <span><span data-testid="badge">{badgeContent}</span>{children}</span> }));
vi.mock('@mui/icons-material/DarkMode', () => ({ default: () => <span>DarkIcon</span> }));
vi.mock('@mui/icons-material/LightMode', () => ({ default: () => <span>LightIcon</span> }));
vi.mock('@mui/icons-material/Notifications', () => ({ default: () => <span>BellIcon</span> }));

const mockUser = { displayName: 'Jane Doe', email: 'jane@test.com', role: 'admin' };

describe('Header', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseAuth.mockReturnValue({ user: mockUser, logout: vi.fn() });
        mockUseThemeMode.mockReturnValue({ themeMode: 'dark', toggleTheme: vi.fn() });
    });

    it('renders the Portal brand name', () => {
        render(<Header />);
        expect(screen.getByText('Accenture Risk & Compliance')).toBeInTheDocument();
    });

    it('renders user display name', () => {
        render(<Header />);
        expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });

    it('renders notification badge', () => {
        render(<Header />);
        expect(screen.getByTestId('badge')).toHaveTextContent('3');
    });

    it('shows dark mode icon when in dark theme', () => {
        mockUseThemeMode.mockReturnValue({ themeMode: 'dark', toggleTheme: vi.fn() });
        render(<Header />);
        expect(screen.getByText('LightIcon')).toBeInTheDocument(); // shows "switch to light" icon
    });

    it('shows light mode icon when in light theme', () => {
        mockUseThemeMode.mockReturnValue({ themeMode: 'light', toggleTheme: vi.fn() });
        render(<Header />);
        expect(screen.getByText('DarkIcon')).toBeInTheDocument();
    });

    it('calls toggleTheme when theme button clicked', async () => {
        const toggleTheme = vi.fn();
        mockUseThemeMode.mockReturnValue({ themeMode: 'dark', toggleTheme });
        render(<Header />);
        await userEvent.click(screen.getByRole('button', { name: /switch to light mode/i }));
        expect(toggleTheme).toHaveBeenCalledTimes(1);
    });

    it('opens user menu on avatar click', async () => {
        render(<Header />);
        await userEvent.click(screen.getByRole('button', { name: /open user menu/i }));
        expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('calls logout when Sign Out is clicked', async () => {
        const logout = vi.fn();
        mockUseAuth.mockReturnValue({ user: mockUser, logout });
        render(<Header />);
        await userEvent.click(screen.getByRole('button', { name: /open user menu/i }));
        await userEvent.click(screen.getByRole('menuitem', { name: /sign out/i }));
        expect(logout).toHaveBeenCalledTimes(1);
    });

    describe('accessibility', () => {
        it('has no accessibility violations', async () => {
            const { container } = render(<Header />);
            expect(await axe(container)).toHaveNoViolations();
        });
    });
});
