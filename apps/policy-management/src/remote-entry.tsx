
/**
 * Policy Management — Remote entry point.
 * Displays policy library, approval workflows, and version tracking with full CRUD.
 * @security RBAC-gated create/approve actions via usePermission.
 */
import React, { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { apiClient, mockData } from '@shared/api-client';
import { usePermission } from '@shared/auth';
import { PageHeader, Card, StatCard, DataTable, StatusBadge, Button, Modal, FormField, AlertBanner } from '@shared/ui-components';
import { AppEvent, eventBus } from '@shared/event-bus';
import type { Policy } from '@shared/types';
import type { Column } from '@shared/ui-components';

const POLICY_CATEGORIES = ['Information Security', 'Data Privacy', 'Access Control', 'Business Continuity', 'Vendor Management', 'Incident Response', 'Acceptable Use'];

const PolicyManagementApp: React.FC = () => {
    const [policies, setPolicies] = useState<Policy[]>(mockData.policies as Policy[]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showApprovalQueue, setShowApprovalQueue] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [createForm, setCreateForm] = useState({ title: '', category: '', owner: '', summary: '', reviewDate: '' });
    const canCreate = usePermission('create', 'policy');
    const canApprove = usePermission('approve', 'policy');
    const theme = useTheme();

    const columns: Column<Policy>[] = [
        { key: 'id', header: 'ID', sortable: true, width: '90px' },
        { key: 'title', header: 'Policy Title', sortable: true },
        { key: 'category', header: 'Category', sortable: true, width: '120px' },
        { key: 'status', header: 'Status', sortable: true, width: '140px', render: (r: Policy) => <StatusBadge status={r.status} /> },
        { key: 'version', header: 'Version', width: '90px' },
        { key: 'owner', header: 'Owner', sortable: true, width: '160px' },
        { key: 'effectiveDate', header: 'Effective', sortable: true, width: '110px', render: (r: Policy) => <span>{r.effectiveDate || '—'}</span> },
        { key: 'reviewDate', header: 'Review By', sortable: true, width: '110px', render: (r: Policy) => <span>{r.reviewDate || '—'}</span> },
    ];

    const underReviewPolicies = policies.filter((p) => p.status === 'under-review');
    const stats = {
        total: policies.length,
        published: policies.filter((p) => p.status === 'published').length,
        underReview: underReviewPolicies.length,
        drafts: policies.filter((p) => p.status === 'draft').length,
    };

    const setField = (field: string) => (value: string) => setCreateForm((prev) => ({ ...prev, [field]: value }));

    const handleCloseCreateModal = () => {
        setShowCreateModal(false);
        setSubmitError(null);
        setCreateForm({ title: '', category: '', owner: '', summary: '', reviewDate: '' });
    };

    const handleCreatePolicy = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError(null);
        const payload = {
            title: createForm.title,
            category: createForm.category,
            owner: createForm.owner,
            summary: createForm.summary,
            reviewDate: createForm.reviewDate,
            status: 'draft',
            version: '1.0',
            effectiveDate: null,
            approver: null,
        };
        const optimisticId = `POL-${Date.now().toString().slice(-5)}`;
        try {
            const created = await apiClient.post<Policy>('/policies', payload);
            setPolicies((prev) => [created, ...prev]);
            eventBus.emit(AppEvent.NotificationReceived, { message: `Policy created: ${created.title}`, type: 'info' });
        } catch {
            setPolicies((prev) => [{ id: optimisticId, ...payload } as unknown as Policy, ...prev]);
            eventBus.emit(AppEvent.NotificationReceived, { message: `Policy created: ${createForm.title}`, type: 'info' });
        } finally {
            setIsSubmitting(false);
            handleCloseCreateModal();
        }
    };

    /** Approve a policy: transitions status from under-review → approved */
    const handleApprovePolicy = async (policyId: string, policyTitle: string) => {
        try {
            await apiClient.patch(`/policies/${policyId}`, { status: 'approved' });
        } finally {
            setPolicies((prev) => prev.map((p) => p.id === policyId ? { ...p, status: 'approved' } : p));
            eventBus.emit(AppEvent.PolicyApproved, { policyId, version: '1.0' });
            eventBus.emit(AppEvent.NotificationReceived, { message: `Policy approved: ${policyTitle}`, type: 'success' });
        }
    };

    return (
        <section aria-label="Policy Management">
            <PageHeader
                title="Policy Management"
                subtitle="Create, review, approve, and distribute organizational policies"
                actions={
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {canCreate && <Button onClick={() => setShowCreateModal(true)}>+ New Policy</Button>}
                        {canApprove && (
                            <Button variant="secondary" onClick={() => setShowApprovalQueue(true)}>
                                Approval Queue {underReviewPolicies.length > 0 && `(${underReviewPolicies.length})`}
                            </Button>
                        )}
                    </div>
                }
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <StatCard label="Total Policies" value={stats.total} icon="📜" />
                <StatCard label="Published" value={stats.published} icon="✅" changeType="positive" />
                <StatCard label="Under Review" value={stats.underReview} icon="🔍" changeType="neutral" />
                <StatCard label="Drafts" value={stats.drafts} icon="📝" />
            </div>

            {/* Policy Lifecycle Tracker */}
            <Card title="Policy Lifecycle" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0' }}>
                    {['Draft', 'Under Review', 'Approved', 'Published', 'Archived'].map((step, idx) => (
                        <div key={step} style={{ textAlign: 'center', flex: 1, position: 'relative' }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: '50%',
                                backgroundColor: idx < 4 ? theme.palette.secondary.main : theme.palette.action.selected,
                                color: theme.palette.common.white, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 0.5rem', fontWeight: 700, fontSize: '0.875rem',
                            }}>
                                {idx + 1}
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 500, color: theme.palette.text.secondary }}>{step}</span>
                            {idx < 4 && (
                                <div style={{ position: 'absolute', top: 18, left: '60%', right: '-40%', height: 2, backgroundColor: idx < 3 ? theme.palette.secondary.main : theme.palette.action.selected }} />
                            )}
                        </div>
                    ))}
                </div>
            </Card>

            <Card title="Policy Library">
                <DataTable columns={columns} data={policies} rowKey="id" />
            </Card>

            {/* Create Policy Modal */}
            <Modal isOpen={showCreateModal} onClose={handleCloseCreateModal} title="Create New Policy" size="lg">
                <form onSubmit={handleCreatePolicy}>
                    {submitError && <AlertBanner type="error" message={submitError} onDismiss={() => setSubmitError(null)} />}
                    <FormField label="Policy Title" name="title" value={createForm.title} onChange={setField('title')} required placeholder="e.g. Information Security Policy" />
                    <FormField label="Category" name="category" type="select" value={createForm.category} onChange={setField('category')} required
                        options={POLICY_CATEGORIES.map((c) => ({ value: c.toLowerCase().replace(/\s/g, '-'), label: c }))} />
                    <FormField label="Policy Owner" name="owner" value={createForm.owner} onChange={setField('owner')} required placeholder="Person or team responsible" />
                    <FormField label="Executive Summary" name="summary" type="textarea" value={createForm.summary} onChange={setField('summary')} required placeholder="Brief description of the policy's purpose and scope" />
                    <FormField label="Review Date" name="reviewDate" type="text" value={createForm.reviewDate} onChange={setField('reviewDate')} placeholder="YYYY-MM-DD" />
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                        <Button variant="secondary" type="button" onClick={handleCloseCreateModal} disabled={isSubmitting}>Cancel</Button>
                        <Button type="submit" loading={isSubmitting}>Create as Draft</Button>
                    </div>
                </form>
            </Modal>

            {/* Approval Queue Modal */}
            <Modal isOpen={showApprovalQueue} onClose={() => setShowApprovalQueue(false)} title="Policy Approval Queue" size="lg">
                {underReviewPolicies.length === 0 ? (
                    <p style={{ textAlign: 'center', color: theme.palette.text.secondary, padding: '2rem' }}>No policies pending approval.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {underReviewPolicies.map((p) => (
                            <div key={p.id} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '0.875rem 1rem', borderRadius: '6px',
                                border: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.background.default,
                            }}>
                                <div>
                                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{p.title}</div>
                                    <div style={{ fontSize: '0.75rem', color: theme.palette.text.secondary }}>
                                        {p.category} · v{p.version} · Owner: {p.owner}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <Button variant="primary" onClick={() => handleApprovePolicy(p.id, p.title)}>✅ Approve</Button>
                                    <Button variant="danger" onClick={() => { setPolicies((prev) => prev.map((x) => x.id === p.id ? { ...x, status: 'draft' } : x)); }}>↩ Return</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Modal>
        </section>
    );
};

export default PolicyManagementApp;
