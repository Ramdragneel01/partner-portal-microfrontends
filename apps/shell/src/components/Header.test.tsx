
import React from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Header from './Header';
import { AppEvent, eventBus } from '@shared/event-bus';

expect.extend(toHaveNoViolations);

const mockUseThemeMode = vi.fn();

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
vi.mock('@mui/material/Drawer', () => ({ default: ({ children, open }: any) => open ? <aside>{children}</aside> : null }));
vi.mock('@mui/material/Menu', () => ({ default: ({ children, open }: any) => open ? <ul role="menu">{children}</ul> : null }));
vi.mock('@mui/material/MenuItem', () => ({ default: ({ children, onClick }: any) => <li role="menuitem" onClick={onClick}>{children}</li> }));
vi.mock('@mui/material/Badge', () => ({ default: ({ children, badgeContent }: any) => <span><span data-testid="badge">{badgeContent}</span>{children}</span> }));
vi.mock('@mui/icons-material/DarkMode', () => ({ default: () => <span>DarkIcon</span> }));
vi.mock('@mui/icons-material/LightMode', () => ({ default: () => <span>LightIcon</span> }));
vi.mock('@mui/icons-material/Notifications', () => ({ default: () => <span>BellIcon</span> }));

describe('Header', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseThemeMode.mockReturnValue({ themeMode: 'dark', toggleTheme: vi.fn() });
    });

    it('renders the Portal brand name', () => {
        render(<Header />);
        expect(screen.getByText('Accenture Risk & Compliance')).toBeInTheDocument();
    });

    it('renders notification control', () => {
        render(<Header />);
        expect(screen.getByRole('button', { name: /no new notifications/i })).toBeInTheDocument();
    });

    it('increments notification count from event bus events', () => {
        render(<Header />);

        act(() => {
            eventBus.emit(AppEvent.NotificationReceived, { message: 'Something changed', type: 'info' });
        });

        expect(screen.getByRole('button', { name: /1 unread notification/i })).toBeInTheDocument();
        expect(screen.getByTestId('badge')).toHaveTextContent('1');
    });

    it('marks notifications read but keeps them in drawer when bell is clicked', async () => {
        render(<Header />);

        act(() => {
            eventBus.emit(AppEvent.NotificationReceived, { message: 'Risk updated', type: 'warning' });
        });

        await userEvent.click(screen.getByRole('button', { name: /1 unread notification/i }));
        expect(screen.getByRole('button', { name: /no new notifications/i })).toBeInTheDocument();
        expect(screen.getByText('Risk updated')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /close notifications drawer/i })).toBeInTheDocument();
    });

    it('clears all notifications from the drawer', async () => {
        render(<Header />);
        const clearAllMessage = 'Clear all test notification';

        act(() => {
            eventBus.emit(AppEvent.NotificationReceived, { message: clearAllMessage, type: 'warning' });
        });

        await userEvent.click(await screen.findByRole('button', { name: /unread notification/i }));
        expect(screen.getByText(clearAllMessage)).toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', { name: /clear all notifications/i }));

        expect(screen.queryByText(clearAllMessage)).not.toBeInTheDocument();
        expect(screen.getByText('No notifications available.')).toBeInTheDocument();
    });

    it('clears an individual notification from the drawer', async () => {
        render(<Header />);
        const clearOneMessage = 'Clear single test notification';

        act(() => {
            eventBus.emit(AppEvent.NotificationReceived, { message: clearOneMessage, type: 'warning' });
        });

        await userEvent.click(await screen.findByRole('button', { name: /unread notification/i }));
        const clearButtons = screen.getAllByRole('button', { name: /clear notification/i });

        await userEvent.click(clearButtons[0]);

        expect(screen.queryByText(clearOneMessage)).not.toBeInTheDocument();
        expect(screen.getByText('No notifications available.')).toBeInTheDocument();
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

    describe('accessibility', () => {
        it('has no accessibility violations', async () => {
            const { container } = render(<Header />);
            expect(await axe(container)).toHaveNoViolations();
        });
    });
});
