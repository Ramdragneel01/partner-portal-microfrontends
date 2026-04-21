import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { appendMessage, listThreads, resetChatBackendMockState, waitForTaskResult } from './chatBackendMock';

describe('chatBackendMock', () => {
    beforeEach(() => {
        resetChatBackendMockState();
        vi.useFakeTimers();
    });

    afterEach(() => {
        resetChatBackendMockState();
        vi.useRealTimers();
    });

    it('completes Salesforce worker execution with dummy live data', async () => {
        const queued = await appendMessage({
            prompt: 'Show Salesforce case backlog for vendor risk review',
            selectedScopes: ['vendor-risk'],
            senderId: 'user-1',
        });

        const completionPromise = waitForTaskResult(queued.task.id, 'user-1');
        await vi.advanceTimersByTimeAsync(1300);

        const completion = await completionPromise;
        expect(completion.task.status).toBe('completed');
        expect(
            completion.thread.messages.some((message) =>
                message.content.includes('Live Salesforce snapshots (dummy dataset):')
            )
        ).toBe(true);

        const persistedThreads = await listThreads();
        expect(persistedThreads[0]?.id).toBe(completion.thread.id);
    });

    it('marks worker task as failed when prompt requests simulated failure', async () => {
        const queued = await appendMessage({
            prompt: 'please simulate failure in worker path',
            selectedScopes: ['incident-reporting'],
            senderId: 'user-2',
        });

        const completionPromise = waitForTaskResult(queued.task.id, 'user-2');
        const rejectionExpectation = expect(completionPromise).rejects.toThrow(/simulated worker failure/i);
        await vi.advanceTimersByTimeAsync(1300);

        await rejectionExpectation;

        const persistedThreads = await listThreads();
        const failedThread = persistedThreads.find((thread) => thread.id === queued.thread.id);

        expect(
            failedThread?.messages.some((message) => message.status === 'failed')
        ).toBe(true);
    });

    it('returns sessions only for the requested user id', async () => {
        const userOne = await appendMessage({
            prompt: 'Salesforce queue status for user one',
            selectedScopes: ['vendor-risk'],
            senderId: 'user-1',
        });

        const userTwo = await appendMessage({
            prompt: 'RCA timeline for user two',
            selectedScopes: ['incident-reporting'],
            senderId: 'user-2',
        });

        await vi.advanceTimersByTimeAsync(1300);

        await waitForTaskResult(userOne.task.id, 'user-1');
        await waitForTaskResult(userTwo.task.id, 'user-2');

        const userOneThreads = await listThreads('user-1');
        const userTwoThreads = await listThreads('user-2');

        expect(userOneThreads.length).toBe(1);
        expect(userTwoThreads.length).toBe(1);
        expect(userOneThreads[0]?.id).not.toBe(userTwoThreads[0]?.id);
        expect(userOneThreads[0]?.ownerId).toBe('user-1');
        expect(userTwoThreads[0]?.ownerId).toBe('user-2');
    });

    it('extracts risk ids and returns RCA, TRA, and IMS sections for unified model', async () => {
        const queued = await appendMessage({
            prompt: 'For RSK-004 provide RCA TRA IMS updates for identity management risk alert.',
            selectedScopes: ['risk-assessment', 'incident-reporting'],
            selectedModelId: 'multi-microapp-model',
            senderId: 'user-3',
        });

        const completionPromise = waitForTaskResult(queued.task.id, 'user-3');
        await vi.advanceTimersByTimeAsync(1300);

        const completion = await completionPromise;
        const assistantMessage = completion.thread.messages[completion.thread.messages.length - 1];

        expect(completion.task.status).toBe('completed');
        expect(completion.task.selectedModelId).toBe('multi-microapp-model');
        expect(assistantMessage?.content).toContain('Detected IDs: RSK-004');
        expect(assistantMessage?.content).toContain('Risk alerts:');
        expect(assistantMessage?.content).toContain('RCA findings:');
        expect(assistantMessage?.content).toContain('TRA findings:');
        expect(assistantMessage?.content).toContain('IMS findings:');
        expect(assistantMessage?.content).toContain('Weak password policy for partners');
    });

    it('resolves auditor-linked RCA records for audit-focused prompts', async () => {
        const queued = await appendMessage({
            prompt: 'hey can u give me an RCA for the auit which Sarah Chen did',
            selectedScopes: ['audit-management', 'incident-reporting', 'compliance-dashboard'],
            selectedModelId: 'multi-microapp-model',
            senderId: 'user-4',
        });

        const completionPromise = waitForTaskResult(queued.task.id, 'user-4');
        await vi.advanceTimersByTimeAsync(1300);

        const completion = await completionPromise;
        const assistantMessage = completion.thread.messages[completion.thread.messages.length - 1];

        expect(completion.task.status).toBe('completed');
        expect(assistantMessage?.content).toContain('Matched audit context:');
        expect(assistantMessage?.content).toContain('AUD-001');
        expect(assistantMessage?.content).toContain('lead auditor: Sarah Chen');
        expect(assistantMessage?.content).toContain('Audit RCA linkage:');
        expect(assistantMessage?.content).toContain('RCA:');
        expect(assistantMessage?.content).toContain('RCA-7812');
        expect(assistantMessage?.content).toContain('RCA-7721');
        expect(assistantMessage?.content).not.toContain('RCA-7798');
    });

    it('returns only applicable RCA TRA IMS for the requested Salesforce record', async () => {
        const queued = await appendMessage({
            prompt: 'For SF-001294 give me RCA TRA IMS for this salesforce record',
            selectedScopes: ['incident-reporting', 'vendor-risk', 'risk-assessment'],
            selectedModelId: 'multi-microapp-model',
            senderId: 'user-5',
        });

        const completionPromise = waitForTaskResult(queued.task.id, 'user-5');
        await vi.advanceTimersByTimeAsync(1300);

        const completion = await completionPromise;
        const assistantMessage = completion.thread.messages[completion.thread.messages.length - 1];

        expect(completion.task.status).toBe('completed');
        expect(assistantMessage?.content).toContain('Relevant logs/records:');
        expect(assistantMessage?.content).toContain('SF-001294');
        expect(assistantMessage?.content).toContain('RCA findings:');
        expect(assistantMessage?.content).toContain('TRA findings:');
        expect(assistantMessage?.content).toContain('IMS findings:');

        expect(assistantMessage?.content).toContain('RCA-7812');
        expect(assistantMessage?.content).toContain('TRA-203');
        expect(assistantMessage?.content).toContain('IMS-105');

        expect(assistantMessage?.content).not.toContain('RCA-7798');
        expect(assistantMessage?.content).not.toContain('TRA-188');
        expect(assistantMessage?.content).not.toContain('IMS-092');
    });
});
