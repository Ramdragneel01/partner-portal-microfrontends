
import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { StatusBadge } from './StatusBadge';

expect.extend(toHaveNoViolations);

describe('StatusBadge', () => {
    beforeEach(() => { vi.clearAllMocks(); });

    it('renders the status label', () => {
        render(<StatusBadge status="open" />);
        expect(screen.getByRole('status')).toBeInTheDocument();
        expect(screen.getByText('open')).toBeInTheDocument();
    });

    it('uses custom label when provided', () => {
        render(<StatusBadge status="in-progress" label="In Progress" />);
        expect(screen.getByText('In Progress')).toBeInTheDocument();
    });

    it('replaces hyphens with spaces in auto-generated label', () => {
        render(<StatusBadge status="non-compliant" />);
        expect(screen.getByText('non compliant')).toBeInTheDocument();
    });

    it('sets aria-label to include status text', () => {
        render(<StatusBadge status="critical" />);
        expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Status: critical');
    });

    it('uses custom label in aria-label', () => {
        render(<StatusBadge status="high" label="High Risk" />);
        expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Status: High Risk');
    });

    it('renders for unknown status without crashing', () => {
        render(<StatusBadge status="unknown-status" />);
        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    describe('known statuses', () => {
        const statuses = ['critical', 'high', 'medium', 'low', 'open', 'closed', 'in-progress',
            'resolved', 'compliant', 'non-compliant', 'draft', 'approved', 'published', 'active', 'inactive'];
        statuses.forEach(s => {
            it(`renders ${s} without error`, () => {
                render(<StatusBadge status={s} />);
                expect(screen.getByRole('status')).toBeInTheDocument();
            });
        });
    });

    describe('accessibility', () => {
        it('has no accessibility violations', async () => {
            const { container } = render(<StatusBadge status="compliant" label="Compliant" />);
            expect(await axe(container)).toHaveNoViolations();
        });
    });
});
