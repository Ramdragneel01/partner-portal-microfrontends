
import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { PageHeader } from './PageHeader';

expect.extend(toHaveNoViolations);

vi.mock('@mui/material/Box', () => ({
    default: ({ children, component, ...p }: any) => {
        const Tag = component || 'div';
        return <Tag {...p}>{children}</Tag>;
    }
}));
vi.mock('@mui/material/Typography', () => ({
    default: ({ children, variant, component }: any) => {
        const Tag = component || (variant === 'h5' ? 'h1' : 'p');
        return <Tag>{children}</Tag>;
    }
}));

describe('PageHeader', () => {
    beforeEach(() => { vi.clearAllMocks(); });

    it('renders page title', () => {
        render(<PageHeader title="Risk Assessment" />);
        expect(screen.getByRole('heading', { level: 1, name: 'Risk Assessment' })).toBeInTheDocument();
    });

    it('renders subtitle when provided', () => {
        render(<PageHeader title="Dashboard" subtitle="Overview of all risks" />);
        expect(screen.getByText('Overview of all risks')).toBeInTheDocument();
    });

    it('does not render subtitle when omitted', () => {
        render(<PageHeader title="Dashboard" />);
        expect(screen.queryByText(/overview/i)).not.toBeInTheDocument();
    });

    it('renders action buttons in a nav landmark when provided', () => {
        render(<PageHeader title="Policy" actions={<button>Add Policy</button>} />);
        expect(screen.getByRole('navigation', { name: 'Page actions' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Add Policy' })).toBeInTheDocument();
    });

    it('does not render nav landmark when actions are omitted', () => {
        render(<PageHeader title="Page" />);
        expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    });

    describe('accessibility', () => {
        it('has no accessibility violations — title only', async () => {
            const { container } = render(<PageHeader title="Compliance Overview" />);
            expect(await axe(container)).toHaveNoViolations();
        });

        it('has no accessibility violations — with subtitle and actions', async () => {
            const { container } = render(
                <PageHeader title="Incidents" subtitle="Active incidents" actions={<button>Create</button>} />
            );
            expect(await axe(container)).toHaveNoViolations();
        });
    });
});
