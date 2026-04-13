
import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Card } from './Card';

expect.extend(toHaveNoViolations);

vi.mock('@mui/material/Card', () => ({ default: ({ children, component, ...p }: any) => <article {...p}>{children}</article> }));
vi.mock('@mui/material/CardContent', () => ({ default: ({ children }: any) => <div>{children}</div> }));
vi.mock('@mui/material/Typography', () => ({
    default: ({ children, variant, component }: any) => {
        const Tag = component || (variant === 'h6' ? 'h3' : 'p');
        return <Tag>{children}</Tag>;
    }
}));

describe('Card', () => {
    beforeEach(() => { vi.clearAllMocks(); });

    it('renders children', () => {
        render(<Card>Card content</Card>);
        expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('renders title when provided', () => {
        render(<Card title="Risk Summary">Body</Card>);
        expect(screen.getByRole('heading', { name: 'Risk Summary' })).toBeInTheDocument();
    });

    it('does not render title heading when title is omitted', () => {
        render(<Card>Just content</Card>);
        expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });

    it('passes className to article element', () => {
        const { container } = render(<Card className="my-card">Content</Card>);
        expect(container.querySelector('.my-card')).toBeInTheDocument();
    });

    it('renders header actions when provided', () => {
        render(<Card title="Incidents" actions={<button type="button">Send Email</button>}>Content</Card>);
        expect(screen.getByRole('button', { name: 'Send Email' })).toBeInTheDocument();
    });

    describe('accessibility', () => {
        it('has no accessibility violations', async () => {
            const { container } = render(<Card title="Summary">Details here</Card>);
            expect(await axe(container)).toHaveNoViolations();
        });

        it('has no violations without title', async () => {
            const { container } = render(<Card>Content only</Card>);
            expect(await axe(container)).toHaveNoViolations();
        });
    });
});
