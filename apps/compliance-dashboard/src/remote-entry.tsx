
/**
 * Compliance Dashboard — Remote entry point.
 * Displays compliance posture by framework, control status, and score trends.
 * @security RBAC-gated assess action via usePermission.
 */
import React, { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { apiClient, mockData } from '@shared/api-client';
import { usePermission } from '@shared/auth';
import { PageHeader, Card, StatCard, DataTable, StatusBadge, Button } from '@shared/ui-components';
import { AppEvent, eventBus } from '@shared/event-bus';
import type { ComplianceFramework, ComplianceControl } from '@shared/types';
import type { Column } from '@shared/ui-components';

const ComplianceDashboardApp: React.FC = () => {
    const [controls, setControls] = useState<ComplianceControl[]>(mockData.controls as ComplianceControl[]);
    const theme = useTheme();
    const canAssess = usePermission('assess', 'compliance');
    const { frameworks } = mockData;

    const overallScore = Math.round(frameworks.reduce((sum, f) => sum + f.score, 0) / frameworks.length);

    /** Mark a control as compliant and emit ComplianceStatusChanged event */
    const handleAssessControl = async (controlId: string) => {
        try {
            await apiClient.patch(`/controls/${controlId}`, { status: 'compliant', lastAssessedDate: new Date().toISOString().split('T')[0] });
        } finally {
            setControls((prev) => prev.map((c) => c.id === controlId ? { ...c, status: 'compliant', lastAssessedDate: new Date().toISOString().split('T')[0] } : c));
            eventBus.emit(AppEvent.ComplianceStatusChanged, { controlId, newStatus: 'compliant' });
            eventBus.emit(AppEvent.NotificationReceived, { message: `Control ${controlId} assessed as compliant`, type: 'success' });
        }
    };

    const frameworkColumns: Column<ComplianceFramework>[] = [
        { key: 'name', header: 'Framework', sortable: true },
        {
            key: 'score', header: 'Score', sortable: true, width: '80px', render: (r: ComplianceFramework) => {
                const color = r.score >= 85 ? theme.palette.success.dark : r.score >= 70 ? theme.palette.warning.dark : theme.palette.error.dark;
                return <strong style={{ color }}>{r.score}%</strong>;
            }
        },
        { key: 'totalControls', header: 'Total', width: '80px' },
        { key: 'compliantControls', header: 'Compliant', width: '100px', render: (r: ComplianceFramework) => <span style={{ color: theme.palette.success.dark }}>{r.compliantControls}</span> },
        { key: 'nonCompliantControls', header: 'Non-Compliant', width: '120px', render: (r: ComplianceFramework) => <span style={{ color: theme.palette.error.dark }}>{r.nonCompliantControls}</span> },
        { key: 'inProgressControls', header: 'In Progress', width: '110px', render: (r: ComplianceFramework) => <span style={{ color: theme.palette.info.dark }}>{r.inProgressControls}</span> },
    ];

    const controlColumns: Column<ComplianceControl>[] = [
        { key: 'controlId', header: 'Control ID', sortable: true, width: '110px' },
        { key: 'title', header: 'Title', sortable: true },
        { key: 'status', header: 'Status', sortable: true, width: '140px', render: (r: ComplianceControl) => <StatusBadge status={r.status} /> },
        { key: 'owner', header: 'Owner', sortable: true, width: '120px' },
        { key: 'evidenceCount', header: 'Evidence', width: '90px' },
        { key: 'lastAssessedDate', header: 'Last Assessed', sortable: true, width: '130px' },
        ...(canAssess ? [{
            key: 'actions' as keyof ComplianceControl,
            header: 'Actions',
            width: '120px',
            render: (r: ComplianceControl) => r.status !== 'compliant'
                ? <Button variant="secondary" onClick={() => handleAssessControl(r.id)}>Assess</Button>
                : <span style={{ color: 'green', fontSize: '0.8rem' }}>✅ Compliant</span>,
        }] : []),
    ];

    return (
        <section aria-label="Compliance Dashboard">
            <PageHeader title="Compliance Dashboard" subtitle="Monitor compliance posture across frameworks" />

            {/* Score Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <StatCard label="Overall Score" value={`${overallScore}%`} icon="📊" changeType={overallScore >= 80 ? 'positive' : 'negative'} change={overallScore >= 80 ? 'On track' : 'Needs improvement'} />
                {frameworks.map((fw) => (
                    <StatCard key={fw.id} label={fw.name} value={`${fw.score}%`} changeType={fw.score >= 85 ? 'positive' : fw.score >= 70 ? 'neutral' : 'negative'} change={`${fw.compliantControls}/${fw.totalControls} controls`} />
                ))}
            </div>

            {/* Framework Breakdown */}
            <Card title="Framework Compliance Overview" style={{ marginBottom: '1.5rem' }}>
                {/* Visual bar chart */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                    {frameworks.map((fw) => (
                        <div key={fw.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ width: '120px', fontSize: '0.8125rem', fontWeight: 500, flexShrink: 0 }}>{fw.name}</span>
                            <div style={{ flex: 1, height: '24px', backgroundColor: theme.palette.action.selected, borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                                <div style={{ width: `${(fw.compliantControls / fw.totalControls) * 100}%`, backgroundColor: theme.palette.success.main, transition: 'width 0.3s' }} title={`Compliant: ${fw.compliantControls}`} />
                                <div style={{ width: `${(fw.inProgressControls / fw.totalControls) * 100}%`, backgroundColor: theme.palette.primary.main }} title={`In Progress: ${fw.inProgressControls}`} />
                                <div style={{ width: `${(fw.nonCompliantControls / fw.totalControls) * 100}%`, backgroundColor: theme.palette.error.main }} title={`Non-Compliant: ${fw.nonCompliantControls}`} />
                            </div>
                            <span style={{ fontSize: '0.8125rem', fontWeight: 600, width: '40px', textAlign: 'right' }}>{fw.score}%</span>
                        </div>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.75rem' }}>
                    <span><span style={{ display: 'inline-block', width: 10, height: 10, backgroundColor: theme.palette.success.main, borderRadius: 2, marginRight: 4 }} />Compliant</span>
                    <span><span style={{ display: 'inline-block', width: 10, height: 10, backgroundColor: theme.palette.primary.main, borderRadius: 2, marginRight: 4 }} />In Progress</span>
                    <span><span style={{ display: 'inline-block', width: 10, height: 10, backgroundColor: theme.palette.error.main, borderRadius: 2, marginRight: 4 }} />Non-Compliant</span>
                </div>
            </Card>

            {/* Controls Table */}
            <Card title="Control Details">
                <DataTable columns={controlColumns} data={controls} rowKey="id" />
            </Card>
        </section>
    );
};

export default ComplianceDashboardApp;
