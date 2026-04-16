import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { UserRole } from '@shared/types';
import AgenticChatPage from './AgenticChatPage';
import {
    appendMessage,
    resetChatBackendMockState,
    waitForTaskResult,
} from './chatBackendMock';

const mockUseAuth = vi.fn();
const mockGetAccessibleModules = vi.fn();

vi.mock('@shared/auth', () => ({
    useAuth: () => mockUseAuth(),
    getAccessibleModules: (role: unknown) => mockGetAccessibleModules(role),
}));

const renderChatDrawer = (open = true) =>
    render(<AgenticChatPage open={open} onClose={vi.fn()} />);

describe('AgenticChatPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        resetChatBackendMockState();

        mockUseAuth.mockReturnValue({
            user: {
                id: 'usr-1',
                displayName: 'Jane Doe',
                email: 'jane.doe@example.com',
                role: UserRole.Admin,
            },
        });

        mockGetAccessibleModules.mockReturnValue([
            'home',
            'agentic-chat',
            'risk-assessment',
            'compliance-dashboard',
            'incident-reporting',
            'vendor-risk',
            'partner-onboarding',
        ]);
    });

    afterEach(() => {
        resetChatBackendMockState();
        vi.useRealTimers();
    });

    it('renders drawer heading and context scopes', async () => {
        const user = userEvent.setup();

        renderChatDrawer();

        expect(screen.getByRole('heading', { name: /agentic chat/i })).toBeInTheDocument();
        expect(await screen.findByText(/no sessions yet/i)).toBeInTheDocument();

        expect(screen.getByRole('button', { name: /model/i })).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: /model/i }));
        expect(screen.getByLabelText(/select chat model profile/i)).toBeInTheDocument();
        expect(screen.getAllByText(/unified multi-microapp model/i).length).toBeGreaterThan(0);
        await user.keyboard('{Escape}');

        await user.click(screen.getByRole('button', { name: /context scope/i }));
        expect(screen.getByLabelText(/risk assessment context scope/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/incident reporting context scope/i)).toBeInTheDocument();
    });

    it('creates a thread and resolves assistant response on send', async () => {
        const user = userEvent.setup();

        renderChatDrawer();

        fireEvent.change(screen.getByLabelText(/chat message input/i), {
            target: { value: 'Show Salesforce case risk trend for vendor onboarding' },
        });
        await user.click(screen.getByRole('button', { name: /send chat message/i }));

        expect(screen.getAllByText(/worker task accepted/i).length).toBeGreaterThan(0);

        const pluginSelectedEntries = await screen.findAllByText(/plugin selected:/i, {}, { timeout: 3000 });
        expect(pluginSelectedEntries.length).toBeGreaterThan(0);
        expect(screen.getAllByText(/model selected:/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/salesforce case search/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/live salesforce snapshots/i).length).toBeGreaterThan(0);
    }, 20000);

    it('refreshes, searches, and filters sessions', async () => {
        const user = userEvent.setup();

        renderChatDrawer();
        expect(await screen.findByText(/no sessions yet/i)).toBeInTheDocument();

        const queued = await appendMessage({
            prompt: 'Show Salesforce case backlog for vendor risk review',
            selectedScopes: ['vendor-risk'],
            senderId: 'usr-1',
        });
        await waitForTaskResult(queued.task.id);

        await user.click(screen.getByRole('button', { name: /refresh agentic chat sessions/i }));

        expect(await screen.findByText(/salesforce case brief/i)).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /show session search controls/i }));
        await user.type(screen.getByLabelText(/search agentic chat sessions/i), 'does-not-exist');
        await user.click(screen.getByRole('button', { name: /apply session search/i }));
        expect(screen.getByText(/no sessions match/i)).toBeInTheDocument();

        await user.clear(screen.getByLabelText(/search agentic chat sessions/i));
        await user.click(screen.getByRole('button', { name: /clear session search/i }));
        await user.click(screen.getByRole('button', { name: /show session filter controls/i }));
        await user.selectOptions(screen.getByLabelText(/filter agentic chat sessions/i), 'running');
        expect(screen.getByText(/no sessions match/i)).toBeInTheDocument();

        await user.selectOptions(screen.getByLabelText(/filter agentic chat sessions/i), 'completed');
        expect(screen.getByText(/salesforce case brief/i)).toBeInTheDocument();
    }, 20000);

    it('keeps only first two sessions expanded by default', async () => {
        const user = userEvent.setup();

        const prompts = [
            'Show Salesforce case backlog for vendor risk review',
            'Need root cause timeline for incident escalations',
            'Summarize control evidence drift across policy workflows',
        ];

        for (const prompt of prompts) {
            const queued = await appendMessage({
                prompt,
                selectedScopes: ['vendor-risk'],
                senderId: 'usr-1',
            });
            await waitForTaskResult(queued.task.id, 'usr-1');
        }

        renderChatDrawer();
        await user.click(screen.getByRole('button', { name: /refresh agentic chat sessions/i }));

        expect(await screen.findByText(/showing 3 of 3 session/i)).toBeInTheDocument();
        expect(screen.getAllByText(/^Updated/i).length).toBe(2);

        await user.click(screen.getByRole('button', { name: /toggle full recent session details/i }));
        expect(screen.getAllByText(/^Updated/i).length).toBe(3);
    }, 20000);

    it('hides and restores the recent sessions sidebar', async () => {
        const user = userEvent.setup();

        renderChatDrawer();
        expect(await screen.findByText(/recent sessions/i)).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /hide recent sessions sidebar/i }));
        expect(screen.queryByText(/recent sessions/i)).not.toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /show recent sessions sidebar/i }));
        expect(screen.getByText(/recent sessions/i)).toBeInTheDocument();
    });
});
