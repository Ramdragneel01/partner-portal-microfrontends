
import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { StatCard } from './StatCard';

expect.extend(toHaveNoViolations);

vi.mock('@mui/material/Card', () => ({ default: ({ children, ...p }: any) => <div {...p}>{children}</div> }));
vi.mock('@mui/material/CardContent', () => ({ default: ({ children }: any) => <div>{children}</div> }));
vi.mock('@mui/material/Typography', () => ({ default: ({ children, variant, color }: any) => <span data-variant={variant} data-color={color}>{children}</span> }));
vi.mock('@mui/material/Box', () => ({ default: ({ children, ...p }: any) => <div {...p}>{children}</div> }));
vi.mock('@mui/icons-material/Security', () => ({ default: (props: any) => <svg data-icon="SecurityIcon" {...props} /> }));
vi.mock('@mui/icons-material/Speed', () => ({ default: (props: any) => <svg data-icon="SpeedIcon" {...props} /> }));
vi.mock('@mui/icons-material/CheckCircle', () => ({ default: (props: any) => <svg data-icon="CheckCircleIcon" {...props} /> }));
vi.mock('@mui/icons-material/Warning', () => ({ default: (props: any) => <svg data-icon="WarningIcon" {...props} /> }));
vi.mock('@mui/icons-material/TrendingUp', () => ({ default: (props: any) => <svg data-icon="TrendingUpIcon" {...props} /> }));
vi.mock('@mui/icons-material/People', () => ({ default: (props: any) => <svg data-icon="PeopleIcon" {...props} /> }));

describe('StatCard', () => {
    beforeEach(() => { vi.clearAllMocks(); });

    it('renders label and value', () => {
        render(<StatCard label="Total Risks" value={42} />);
        expect(screen.getByText('Total Risks')).toBeInTheDocument();
        expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('sets aria-label with label and value', () => {
        render(<StatCard label="Open Incidents" value={7} />);
        expect(screen.getByRole('article')).toHaveAttribute('aria-label', 'Open Incidents: 7');
    });

    it('renders icon when provided', () => {
        render(<StatCard label="Risks" value={5} icon="🛡️" />);
        expect(screen.getByText('🛡️')).toBeInTheDocument();
    });

    it('renders mapped icon component when icon name is provided', () => {
        const { container } = render(<StatCard label="Incidents" value={1234} icon="SecurityIcon" />);
        expect(container.querySelector('[data-icon="SecurityIcon"]')).toBeInTheDocument();
    });

    it('renders change indicator for positive trend', () => {
        render(<StatCard label="Score" value={90} change="+5%" changeType="positive" />);
        expect(screen.getByText(/↑.*\+5%/)).toBeInTheDocument();
    });

    it('renders change indicator for negative trend', () => {
        render(<StatCard label="Score" value={80} change="-3%" changeType="negative" />);
        expect(screen.getByText(/↓.*-3%/)).toBeInTheDocument();
    });

    it('does not render change when not provided', () => {
        render(<StatCard label="Count" value={10} />);
        expect(screen.queryByText('↑')).not.toBeInTheDocument();
        expect(screen.queryByText('↓')).not.toBeInTheDocument();
    });

    it('renders trend shorthand when only trend direction is provided', () => {
        render(<StatCard label="Response Time" value="2.5m" trend="down" />);
        expect(screen.getByText(/↓.*Down/)).toBeInTheDocument();
    });

    it('prefers trendValue when provided', () => {
        render(<StatCard label="Resolved Today" value={45} trend="up" trendValue="+12%" />);
        expect(screen.getByText(/↑.*\+12%/)).toBeInTheDocument();
    });

    describe('accessibility', () => {
        it('has no accessibility violations', async () => {
            const { container } = render(<StatCard label="Total" value={100} change="+10%" changeType="positive" />);
            expect(await axe(container)).toHaveNoViolations();
        });
    });
});
