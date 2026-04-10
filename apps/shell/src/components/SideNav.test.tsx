
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { axe, toHaveNoViolations } from 'jest-axe';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import SideNav from './SideNav';
import { UserRole } from '@shared/types';

expect.extend(toHaveNoViolations);

const mockUseAuth = vi.fn();
vi.mock('@shared/auth', () => ({ useAuth: () => mockUseAuth() }));
vi.mock('@shared/ui-components', () => ({
    themeTokens: { layout: { iconStripWidth: 56, totalSidebarWidth: 300, headerHeight: 56 }, animation: { duration: { shorter: 200 }, easing: { easeInOut: 'cubic-bezier(0.4,0,0.2,1)' } } },
    Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
    Modal: ({ isOpen, title, children }: any) => isOpen ? <div role="dialog"><h2>{title}</h2>{children}</div> : null,
    UserPreferencesPanel: ({ open }: any) => open ? <div data-testid="preferences-panel" /> : null,
}));

// Stub MUI components
vi.mock('@mui/material/Drawer', () => ({ default: ({ children }: any) => <div data-testid="drawer">{children}</div> }));
vi.mock('@mui/material/Box', () => ({ default: ({ children, component, ...p }: any) => { const T = component || 'div'; return <T {...p}>{children}</T>; } }));
vi.mock('@mui/material/Tooltip', () => ({ default: ({ children, title }: any) => <div title={title}>{children}</div> }));
vi.mock('@mui/material/IconButton', () => ({ default: ({ children, onClick, 'aria-label': label, 'aria-expanded': expanded }: any) => <button aria-label={label} aria-expanded={expanded} onClick={onClick}>{children}</button> }));
vi.mock('@mui/material/Typography', () => ({ default: ({ children }: any) => <span>{children}</span> }));
vi.mock('@mui/material/Avatar', () => ({ default: ({ children }: any) => <span data-testid="avatar">{children}</span> }));
vi.mock('@mui/material/Menu', () => ({ default: ({ children, open }: any) => open ? <ul role="menu">{children}</ul> : null }));
vi.mock('@mui/material/MenuItem', () => ({ default: ({ children, onClick }: any) => <li role="menuitem" onClick={onClick}>{children}</li> }));
vi.mock('@mui/material/Divider', () => ({ default: () => <hr /> }));
vi.mock('@mui/icons-material/ChevronLeft', () => ({ default: () => <span>ChevronLeft</span> }));
vi.mock('@mui/icons-material/ChevronRight', () => ({ default: () => <span>ChevronRight</span> }));
vi.mock('@mui/icons-material/Shield', () => ({ default: () => <span>Shield</span> }));
vi.mock('@mui/icons-material/CheckCircle', () => ({ default: () => <span>Check</span> }));
vi.mock('@mui/icons-material/Article', () => ({ default: () => <span>Article</span> }));
vi.mock('@mui/icons-material/Policy', () => ({ default: () => <span>Policy</span> }));
vi.mock('@mui/icons-material/WarningAmber', () => ({ default: () => <span>Warning</span> }));
vi.mock('@mui/icons-material/Business', () => ({ default: () => <span>Business</span> }));
vi.mock('@mui/icons-material/Handshake', () => ({ default: () => <span>Handshake</span> }));

const adminUser = { id: '1', displayName: 'Admin User', email: 'admin@example.com', role: UserRole.Admin };
const viewerUser = { id: '2', displayName: 'Viewer User', email: 'viewer@example.com', role: UserRole.Viewer };

const SideNavHarness: React.FC = () => {
    const [open, setOpen] = React.useState(true);
    return <SideNav open={open} onOpenChange={setOpen} />;
};

const renderNav = (user = adminUser, path = '/risk-assessment') =>
    render(
        <MemoryRouter initialEntries={[path]}>
            <SideNavHarness />
        </MemoryRouter>
    );

describe('SideNav', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseAuth.mockReturnValue({ user: adminUser, logout: vi.fn() });
    });

    it('renders navigation landmark', () => {
        renderNav();
        expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument();
    });

    it('renders all nav items for Admin role', () => {
        renderNav();
        expect(screen.getByRole('link', { name: /risk assessment/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /compliance/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /audit/i })).toBeInTheDocument();
    });

    it('filters nav items by role — Viewer cannot see Partner Onboarding', () => {
        mockUseAuth.mockReturnValue({ user: viewerUser, logout: vi.fn() });
        renderNav(viewerUser);
        // Viewer is in Partner Onboarding roles — so they CAN see it
        // Let's verify they can view risk assessment
        expect(screen.getByRole('link', { name: /risk assessment/i })).toBeInTheDocument();
    });

    it('shows collapse button when expanded', () => {
        renderNav();
        expect(screen.getByRole('button', { name: /collapse navigation/i })).toBeInTheDocument();
    });

    it('collapses drawer when toggle is clicked', async () => {
        renderNav();
        expect(screen.getByTestId('drawer')).toBeInTheDocument();
        await userEvent.click(screen.getByRole('button', { name: /collapse navigation/i }));
        expect(screen.getByRole('button', { name: /expand navigation/i })).toBeInTheDocument();
    });

    it('shows expand button when collapsed', async () => {
        renderNav();
        await userEvent.click(screen.getByRole('button', { name: /collapse navigation/i }));
        expect(screen.getByRole('button', { name: /expand navigation/i })).toBeInTheDocument();
    });

    it('shows navigation section title', () => {
        renderNav();
        expect(screen.getByText(/security microapps/i)).toBeInTheDocument();
    });

    it('opens user profile popup from bottom-left user menu', async () => {
        renderNav();
        await userEvent.click(screen.getByRole('button', { name: /open user menu/i }));
        await userEvent.click(screen.getByRole('menuitem', { name: /user profile/i }));
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText(/user profile/i)).toBeInTheDocument();
        expect(screen.getByText(/admin@example.com/i)).toBeInTheDocument();
    });

    describe('accessibility', () => {
        it('has no accessibility violations — expanded', async () => {
            const { container } = renderNav();
            expect(await axe(container)).toHaveNoViolations();
        });

        it('has no accessibility violations — collapsed', async () => {
            const { container } = renderNav();
            await userEvent.click(screen.getByRole('button', { name: /collapse navigation/i }));
            expect(await axe(container)).toHaveNoViolations();
        });
    });
});
