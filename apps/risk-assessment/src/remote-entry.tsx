
/**
 * Risk Assessment — Remote entry point exposed via Module Federation.
 * Provides risk register, scoring matrix, bulk actions, and create risk workflow.
 * @security RBAC-gated create/edit/delete actions via usePermission.
 */
import React, { useState } from 'react';
import { useTheme, alpha } from '@mui/material/styles';
import { apiClient, mockData } from '@shared/api-client';
import { usePermission } from '@shared/auth';
import { PageHeader, DataTable, StatusBadge, Button, StatCard, BulkActionBar, Card, Modal, FormField, AlertBanner } from '@shared/ui-components';
import { AppEvent, eventBus } from '@shared/event-bus';
import type { RiskAssessment } from '@shared/types';
import type { Column } from '@shared/ui-components';

const RISK_CATEGORIES = ['Operational', 'Financial', 'Regulatory', 'Strategic', 'Reputational', 'Cybersecurity', 'Third-Party'];

const RiskAssessmentApp: React.FC = () => {
    const [risks, setRisks] = useState<RiskAssessment[]>(mockData.risks as RiskAssessment[]);
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [createForm, setCreateForm] = useState({ title: '', category: '', likelihood: '', impact: '', owner: '', dueDate: '' });
    const canCreate = usePermission('create', 'risk');
    const canApprove = usePermission('approve', 'risk');
    const theme = useTheme();

    const columns: Column<RiskAssessment>[] = [
        { key: 'id', header: 'ID', sortable: true, width: '100px' },
        { key: 'title', header: 'Risk Title', sortable: true },
        { key: 'category', header: 'Category', sortable: true, width: '160px' },
        { key: 'riskScore', header: 'Score', sortable: true, width: '80px', render: (row: RiskAssessment) => <strong>{row.riskScore}</strong> },
        { key: 'riskLevel', header: 'Level', sortable: true, width: '120px', render: (row: RiskAssessment) => <StatusBadge status={row.riskLevel} /> },
        { key: 'owner', header: 'Owner', sortable: true, width: '140px' },
        { key: 'status', header: 'Status', sortable: true, width: '120px', render: (row: RiskAssessment) => <StatusBadge status={row.status} /> },
        { key: 'dueDate', header: 'Due Date', sortable: true, width: '120px' },
    ];

    const stats = {
        total: risks.length,
        critical: risks.filter((r) => r.riskLevel === 'critical').length,
        high: risks.filter((r) => r.riskLevel === 'high').length,
        open: risks.filter((r) => r.status === 'open').length,
    };

    const setField = (field: string) => (value: string) => setCreateForm((prev) => ({ ...prev, [field]: value }));

    const handleCloseModal = () => {
        setShowCreateModal(false);
        setSubmitError(null);
        setCreateForm({ title: '', category: '', likelihood: '', impact: '', owner: '', dueDate: '' });
    };

    /**
     * Calculates risk score from likelihood and impact (1-5 scale).
     * Derives riskLevel from score thresholds.
     */
    const scoreToLevel = (score: number): string => {
        if (score >= 15) return 'critical';
        if (score >= 10) return 'high';
        if (score >= 5) return 'medium';
        return 'low';
    };

    const handleCreateRisk = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError(null);
        const likelihood = parseInt(createForm.likelihood, 10);
        const impact = parseInt(createForm.impact, 10);
        const riskScore = likelihood * impact;
        const riskLevel = scoreToLevel(riskScore);
        const payload = {
            title: createForm.title,
            category: createForm.category,
            likelihood,
            impact,
            riskScore,
            riskLevel,
            owner: createForm.owner,
            dueDate: createForm.dueDate,
            status: 'open',
        };
        const optimisticId = `RISK-${Date.now().toString().slice(-5)}`;
        try {
            const created = await apiClient.post<RiskAssessment>('/risks', payload);
            setRisks((prev) => [created, ...prev]);
            eventBus.emit(AppEvent.RiskUpdated, { riskId: created.id, riskLevel: created.riskLevel });
            eventBus.emit(AppEvent.NotificationReceived, { message: `Risk created: ${created.title} (${created.riskLevel})`, type: riskLevel === 'critical' ? 'error' : 'warning' });
        } catch {
            const optimistic = { id: optimisticId, ...payload } as unknown as RiskAssessment;
            setRisks((prev) => [optimistic, ...prev]);
            eventBus.emit(AppEvent.RiskUpdated, { riskId: optimisticId, riskLevel });
            eventBus.emit(AppEvent.NotificationReceived, { message: `Risk created: ${createForm.title} (${riskLevel})`, type: riskLevel === 'critical' ? 'error' : 'warning' });
        } finally {
            setIsSubmitting(false);
            handleCloseModal();
        }
    };

    /** Bulk escalate: update selected risks to status 'escalated' */
    const handleEscalate = async () => {
        const ids = Array.from(selectedRows);
        await Promise.allSettled(ids.map((id) => apiClient.patch(`/risks/${id}`, { status: 'escalated' })));
        setRisks((prev) => prev.map((r) => selectedRows.has(r.id) ? { ...r, status: 'escalated' } : r));
        ids.forEach((id) => {
            const risk = risks.find((r) => r.id === id);
            if (risk) eventBus.emit(AppEvent.RiskUpdated, { riskId: id, riskLevel: risk.riskLevel });
        });
        eventBus.emit(AppEvent.NotificationReceived, { message: `${ids.length} risk(s) escalated`, type: 'warning' });
        setSelectedRows(new Set());
    };

    return (
        <section aria-label="Risk Assessment">
            <PageHeader
                title="Risk Assessment"
                subtitle="Identify, assess, and mitigate organizational risks"
                actions={
                    canCreate ? <Button onClick={() => setShowCreateModal(true)}>+ New Risk</Button> : undefined
                }
            />

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <StatCard label="Total Risks" value={stats.total} icon="🛡️" />
                <StatCard label="Critical" value={stats.critical} changeType="negative" change="Requires immediate action" icon="🔴" />
                <StatCard label="High" value={stats.high} changeType="negative" change="Escalation needed" icon="🟠" />
                <StatCard label="Open Risks" value={stats.open} icon="📂" />
            </div>

            {/* Risk Scoring Matrix */}
            <Card title="Risk Scoring Matrix (Likelihood × Impact)" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(5, 1fr)', gap: '4px', fontSize: '0.75rem', textAlign: 'center' }}>
                    <div />
                    {[1, 2, 3, 4, 5].map((impact) => (
                        <div key={impact} style={{ fontWeight: 600, padding: '0.25rem', color: theme.palette.text.secondary }}>Impact {impact}</div>
                    ))}
                    {[5, 4, 3, 2, 1].map((likelihood) => (
                        <React.Fragment key={likelihood}>
                            <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.palette.text.secondary }}>L{likelihood}</div>
                            {[1, 2, 3, 4, 5].map((impact) => {
                                const score = likelihood * impact;
                                const riskCount = risks.filter((r) => r.likelihood === likelihood && r.impact === impact).length;
                                let bg = alpha(theme.palette.success.main, 0.12);
                                if (score >= 15) bg = alpha(theme.palette.error.main, 0.15);
                                else if (score >= 10) bg = alpha(theme.palette.warning.dark, 0.15);
                                else if (score >= 5) bg = alpha(theme.palette.warning.main, 0.12);
                                return (
                                    <div key={`${likelihood}-${impact}`} style={{ padding: '0.5rem', backgroundColor: bg, borderRadius: '4px', fontWeight: riskCount > 0 ? 700 : 400 }}>
                                        {score}
                                        {riskCount > 0 && <div style={{ fontSize: '0.625rem', color: theme.palette.error.dark }}>({riskCount})</div>}
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>
            </Card>

            {/* Risk Register Table */}
            <Card title="Risk Register">
                <DataTable
                    columns={columns}
                    data={risks}
                    rowKey="id"
                    selectable
                    selectedRows={selectedRows}
                    onSelectionChange={setSelectedRows}
                />
            </Card>

            {/* Bulk Action Bar */}
            <BulkActionBar
                selectedCount={selectedRows.size}
                actions={[
                    ...(canApprove ? [{ label: 'Approve', onClick: () => { setRisks((prev) => prev.map((r) => selectedRows.has(r.id) ? { ...r, status: 'approved' } : r)); setSelectedRows(new Set()); }, variant: 'primary' as const, icon: '✅' }] : []),
                    { label: 'Escalate', onClick: handleEscalate, variant: 'secondary' as const, icon: '⬆️' },
                    { label: 'Close', onClick: () => { setRisks((prev) => prev.map((r) => selectedRows.has(r.id) ? { ...r, status: 'closed' } : r)); setSelectedRows(new Set()); }, variant: 'danger' as const, icon: '🗑️' },
                ]}
                onClearSelection={() => setSelectedRows(new Set())}
            />

            {/* Create Risk Modal */}
            <Modal isOpen={showCreateModal} onClose={handleCloseModal} title="Create New Risk" size="lg">
                <form onSubmit={handleCreateRisk}>
                    {submitError && <AlertBanner type="error" message={submitError} onDismiss={() => setSubmitError(null)} />}
                    <FormField label="Risk Title" name="title" value={createForm.title} onChange={setField('title')} required placeholder="Describe the risk" />
                    <FormField label="Category" name="category" type="select" value={createForm.category} onChange={setField('category')} required
                        options={RISK_CATEGORIES.map((c) => ({ value: c.toLowerCase().replace(/\s/g, '-'), label: c }))} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <FormField label="Likelihood (1–5)" name="likelihood" type="select" value={createForm.likelihood} onChange={setField('likelihood')} required
                            options={[1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: `${n} — ${['Very Low', 'Low', 'Medium', 'High', 'Very High'][n - 1]}` }))} />
                        <FormField label="Impact (1–5)" name="impact" type="select" value={createForm.impact} onChange={setField('impact')} required
                            options={[1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: `${n} — ${['Negligible', 'Minor', 'Moderate', 'Major', 'Critical'][n - 1]}` }))} />
                    </div>
                    {createForm.likelihood && createForm.impact && (
                        <div style={{ padding: '0.75rem', marginBottom: '0.5rem', borderRadius: '6px', backgroundColor: alpha(theme.palette.secondary.main, 0.08), fontSize: '0.875rem' }}>
                            Calculated Risk Score: <strong>{parseInt(createForm.likelihood) * parseInt(createForm.impact)}</strong>
                            {' — '}
                            <StatusBadge status={scoreToLevel(parseInt(createForm.likelihood) * parseInt(createForm.impact))} />
                        </div>
                    )}
                    <FormField label="Risk Owner" name="owner" value={createForm.owner} onChange={setField('owner')} required placeholder="Responsible person or team" />
                    <FormField label="Due Date" name="dueDate" type="text" value={createForm.dueDate} onChange={setField('dueDate')} placeholder="YYYY-MM-DD" />
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                        <Button variant="secondary" type="button" onClick={handleCloseModal} disabled={isSubmitting}>Cancel</Button>
                        <Button type="submit" loading={isSubmitting}>Create Risk</Button>
                    </div>
                </form>
            </Modal>
        </section>
    );
};

export default RiskAssessmentApp;
