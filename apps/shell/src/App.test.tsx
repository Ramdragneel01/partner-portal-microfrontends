
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { axe, toHaveNoViolations } from 'jest-axe';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import App from './App';

expect.extend(toHaveNoViolations);

// Mock lazy remote micro-apps — Module Federation not available in test env
vi.mock('riskAssessment/Module', () => ({ default: () => <div>Risk Assessment</div> }), { virtual: true });
vi.mock('complianceDashboard/Module', () => ({ default: () => <div>Compliance</div> }), { virtual: true });
vi.mock('auditManagement/Module', () => ({ default: () => <div>Audit</div> }), { virtual: true });
vi.mock('policyManagement/Module', () => ({ default: () => <div>Policy</div> }), { virtual: true });
vi.mock('incidentReporting/Module', () => ({ default: () => <div>Incidents</div> }), { virtual: true });
vi.mock('vendorRisk/Module', () => ({ default: () => <div>Vendor Risk</div> }), { virtual: true });
vi.mock('partnerOnboarding/Module', () => ({ default: () => <div>Onboarding</div> }), { virtual: true });

vi.mock('@shared/auth', () => ({
    ProtectedRoute: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('./providers', () => ({
    useSidebar: () => ({ open: true, setOpen: vi.fn() }),
}));

vi.mock('./components/Header', () => ({
    default: () => <header data-testid="header">Header</header>,
}));
vi.mock('./components/SideNav', () => ({
    default: () => <nav data-testid="sidenav">SideNav</nav>,
}));

const renderWithRouter = (initialPath = '/') =>
    render(
        <MemoryRouter initialEntries={[initialPath]}>
            <App />
        </MemoryRouter>
    );

describe('App', () => {
    beforeEach(() => { vi.clearAllMocks(); });

    it('renders Header and SideNav', () => {
        renderWithRouter();
        expect(screen.getByTestId('header')).toBeInTheDocument();
        expect(screen.getByTestId('sidenav')).toBeInTheDocument();
    });

    it('renders main content landmark', () => {
        renderWithRouter();
        expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('redirects / to /risk-assessment', () => {
        renderWithRouter('/');
        expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('renders 404 page for unknown route', () => {
        renderWithRouter('/does-not-exist');
        expect(screen.getByText(/404/i)).toBeInTheDocument();
        expect(screen.getByText(/page not found/i)).toBeInTheDocument();
    });

    describe('accessibility', () => {
        it('root layout has no accessibility violations', async () => {
            const { container } = renderWithRouter('/');
            expect(await axe(container)).toHaveNoViolations();
        });
    });
});
