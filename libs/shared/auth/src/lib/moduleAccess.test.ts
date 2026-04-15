import { renderHook } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { UserRole } from '@shared/types';
import {
    canRoleAccessModule,
    getAccessibleModules,
    getModuleKeyForPath,
    getRequiredRolesForModule,
    useModuleAccess,
} from './moduleAccess';

const mockUseAuth = vi.fn();
vi.mock('./AuthProvider', () => ({ useAuth: () => mockUseAuth() }));

describe('moduleAccess', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('resolves module keys from route paths', () => {
        expect(getModuleKeyForPath('/risk-assessment')).toBe('risk-assessment');
        expect(getModuleKeyForPath('/compliance/view?tab=summary')).toBe('compliance-dashboard');
        expect(getModuleKeyForPath('/hub/chat')).toBe('agentic-chat');
        expect(getModuleKeyForPath('/unknown')).toBeNull();
    });

    it('returns required roles for a module', () => {
        const requiredRoles = getRequiredRolesForModule('event-debug');
        expect(requiredRoles).toContain(UserRole.Admin);
        expect(requiredRoles).not.toContain(UserRole.Viewer);
    });

    it('checks role access against module policy', () => {
        expect(canRoleAccessModule(UserRole.Viewer, 'event-debug')).toBe(false);
        expect(canRoleAccessModule(UserRole.Auditor, 'event-debug')).toBe(true);
    });

    it('returns all visible modules for a role', () => {
        const viewerModules = getAccessibleModules(UserRole.Viewer);
        expect(viewerModules).toContain('agentic-chat');
        expect(viewerModules).toContain('risk-assessment');
        expect(viewerModules).not.toContain('event-debug');
    });

    it('useModuleAccess returns false when no authenticated user exists', () => {
        mockUseAuth.mockReturnValue({ user: null });
        const { result } = renderHook(() => useModuleAccess('home'));
        expect(result.current).toBe(false);
    });

    it('useModuleAccess returns true when authenticated user role is allowed', () => {
        mockUseAuth.mockReturnValue({
            user: { id: '1', displayName: 'Compliance', role: UserRole.ComplianceOfficer },
        });
        const { result } = renderHook(() => useModuleAccess('event-debug'));
        expect(result.current).toBe(true);
    });
});
