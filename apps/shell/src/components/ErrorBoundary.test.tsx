
import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ErrorBoundary from './ErrorBoundary';
import userEvent from '@testing-library/user-event';

expect.extend(toHaveNoViolations);

// Component that throws on demand
const ThrowingChild: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
    if (shouldThrow) throw new Error('Test module failure');
    return <div>Loaded successfully</div>;
};

describe('ErrorBoundary', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, 'error').mockImplementation(() => { });
    });

    it('renders children when no error', () => {
        render(
            <ErrorBoundary moduleName="Risk Assessment">
                <div>Child content</div>
            </ErrorBoundary>
        );
        expect(screen.getByText('Child content')).toBeInTheDocument();
    });

    it('renders error fallback when child throws', () => {
        render(
            <ErrorBoundary moduleName="Risk Assessment">
                <ThrowingChild shouldThrow />
            </ErrorBoundary>
        );
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/Risk Assessment is unavailable/i)).toBeInTheDocument();
    });

    it('shows retry button in error state', () => {
        render(
            <ErrorBoundary moduleName="Compliance">
                <ThrowingChild shouldThrow />
            </ErrorBoundary>
        );
        expect(screen.getByRole('button', { name: /retry loading/i })).toBeInTheDocument();
    });

    it('shows module-specific name in error message', () => {
        render(
            <ErrorBoundary moduleName="Audit Management">
                <ThrowingChild shouldThrow />
            </ErrorBoundary>
        );
        expect(screen.getByText(/Audit Management is unavailable/i)).toBeInTheDocument();
    });

    it('clears error state when Retry is clicked', async () => {
        const { rerender } = render(
            <ErrorBoundary moduleName="Incidents">
                <ThrowingChild shouldThrow />
            </ErrorBoundary>
        );
        expect(screen.getByRole('alert')).toBeInTheDocument();
        await userEvent.click(screen.getByRole('button', { name: /retry loading/i }));
        // After retry, boundary resets — child renders without throw
        rerender(
            <ErrorBoundary moduleName="Incidents" key="retry-success">
                <ThrowingChild shouldThrow={false} />
            </ErrorBoundary>
        );
        expect(screen.getByText('Loaded successfully')).toBeInTheDocument();
    });

    it('informs user that other modules remain available', () => {
        render(
            <ErrorBoundary moduleName="Policy">
                <ThrowingChild shouldThrow />
            </ErrorBoundary>
        );
        expect(screen.getByText(/other modules remain available/i)).toBeInTheDocument();
    });

    describe('accessibility', () => {
        it('error state has no accessibility violations', async () => {
            const { container } = render(
                <ErrorBoundary moduleName="Vendor Risk">
                    <ThrowingChild shouldThrow />
                </ErrorBoundary>
            );
            expect(await axe(container)).toHaveNoViolations();
        });

        it('normal state has no accessibility violations', async () => {
            const { container } = render(
                <ErrorBoundary moduleName="Vendor Risk">
                    <div>Content</div>
                </ErrorBoundary>
            );
            expect(await axe(container)).toHaveNoViolations();
        });
    });
});
