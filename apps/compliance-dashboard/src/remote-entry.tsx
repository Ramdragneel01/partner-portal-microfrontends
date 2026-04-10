
/**
 * Compliance Dashboard — Remote entry point.
 * Displays compliance posture by framework, control status, and score trends.
 * @security RBAC-gated assess action via usePermission.
 */
import React, { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { BarChart, PieChart, RadarChart } from '@mui/x-charts';
import { apiClient, mockData } from '@shared/api-client';
import { usePermission } from '@shared/auth';
import { PageHeader, Card, StatCard, DataTable, StatusBadge, Button, AlertBanner } from '@shared/ui-components';
import { AppEvent, eventBus, useEventBus } from '@shared/event-bus';
import type { ComplianceFramework, ComplianceControl } from '@shared/types';
import type { Column } from '@shared/ui-components';

const ComplianceDashboardApp: React.FC = () => {
    const [controls, setControls] = useState<ComplianceControl[]>(mockData.controls as ComplianceControl[]);
    const [crossAppMessage, setCrossAppMessage] = useState<string | null>(null);
    const theme = useTheme();
    const canAssess = usePermission('assess', 'compliance');
    const { frameworks } = mockData;

    const overallScore = Math.round(frameworks.reduce((sum, f) => sum + f.score, 0) / frameworks.length);

    const controlStatusSeries = [
        {
            key: 'compliant',
            label: 'Compliant',
            color: theme.palette.success.main,
            count: controls.filter((control) => control.status === 'compliant').length,
        },
        {
            key: 'in-progress',
            label: 'In Progress',
            color: theme.palette.info.main,
            count: controls.filter((control) => control.status === 'in-progress').length,
        },
        {
            key: 'non-compliant',
            label: 'Non-Compliant',
            color: theme.palette.error.main,
            count: controls.filter((control) => control.status === 'non-compliant').length,
        },
        {
            key: 'not-assessed',
            label: 'Not Assessed',
            color: theme.palette.text.secondary,
            count: controls.filter((control) => control.status === 'not-assessed').length,
        },
    ] as const;

    const controlsCompliant = controlStatusSeries.find((series) => series.key === 'compliant')?.count ?? 0;
    const controlsInProgress = controlStatusSeries.find((series) => series.key === 'in-progress')?.count ?? 0;
    const controlsNonCompliant = controlStatusSeries.find((series) => series.key === 'non-compliant')?.count ?? 0;

    const hasControlStatusData = controlStatusSeries.some((series) => series.count > 0);
    const hasFrameworkScoreData = frameworks.length > 0;

    const totalControls = Math.max(1, controls.length);
    const totalFrameworks = Math.max(1, frameworks.length);

    const controlOwnerRatios = {
        identityAndAccess: Math.round((controls.filter((control) => control.owner.toLowerCase().includes('iam')).length / totalControls) * 100),
        vendorAndThirdParty: Math.round((controls.filter((control) => {
            const owner = control.owner.toLowerCase();
            return owner.includes('vendor') || owner.includes('third');
        }).length / totalControls) * 100),
    };

    const criticalTagRadarValues = {
        identityAndAccess: Math.max(controlOwnerRatios.identityAndAccess, Math.round((controlsCompliant / totalControls) * 100)),
        dataProtection: Math.round((controls.filter((control) => control.frameworkId === 'FW-003').length / totalControls) * 100),
        monitoringAndDetection: Math.round((controls.filter((control) => control.title.toLowerCase().includes('monitor')).length / totalControls) * 100),
        incidentResponse: Math.round((controlsInProgress / totalControls) * 100),
        resilienceAndRecovery: Math.round(frameworks.reduce((sum, framework) => sum + framework.score, 0) / totalFrameworks),
        vendorAndThirdParty: Math.max(controlOwnerRatios.vendorAndThirdParty, Math.round((controlsNonCompliant / totalControls) * 100)),
    };

    const radarMetrics = [
        { name: 'Identity & Access', max: 100 },
        { name: 'Data Protection', max: 100 },
        { name: 'Monitoring', max: 100 },
        { name: 'Incident Response', max: 100 },
        { name: 'Resilience', max: 100 },
        { name: 'Third-Party', max: 100 },
    ];

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


    /**
     * Reacts to risk changes from other micro-apps so compliance users
     * can see upstream signals in real time.
     */
    useEventBus(AppEvent.RiskUpdated, ({ riskId, riskLevel }) => {
        setCrossAppMessage(`Risk ${riskId} moved to ${riskLevel}. Review related controls.`);
    });

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

            {crossAppMessage && (
                <AlertBanner
                    type="info"
                    message={crossAppMessage}
                    onDismiss={() => setCrossAppMessage(null)}
                />
            )}

            {/* Score Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <StatCard label="Overall Score" value={`${overallScore}%`} icon="📊" changeType={overallScore >= 80 ? 'positive' : 'negative'} change={overallScore >= 80 ? 'On track' : 'Needs improvement'} />
                {frameworks.map((fw) => (
                    <StatCard key={fw.id} label={fw.name} value={`${fw.score}%`} changeType={fw.score >= 85 ? 'positive' : fw.score >= 70 ? 'neutral' : 'negative'} change={`${fw.compliantControls}/${fw.totalControls} controls`} />
                ))}
            </div>

            {/* Chart Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <Card title="Control Status Distribution" style={{ marginBottom: 0 }}>
                    {hasControlStatusData ? (
                        <PieChart
                            height={280}
                            series={[
                                {
                                    innerRadius: 45,
                                    outerRadius: 95,
                                    paddingAngle: 2,
                                    cornerRadius: 4,
                                    data: controlStatusSeries.map((series, index) => ({
                                        id: index,
                                        value: series.count,
                                        label: series.label,
                                        color: series.color,
                                    })),
                                },
                            ]}
                            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                        />
                    ) : (
                        <div style={{ color: theme.palette.text.secondary, fontSize: '0.875rem' }}>
                            No control-status data available.
                        </div>
                    )}
                </Card>

                <Card title="Framework Score Comparison" style={{ marginBottom: 0 }}>
                    {hasFrameworkScoreData ? (
                        <BarChart
                            height={280}
                            xAxis={[{ scaleType: 'band', data: frameworks.map((framework) => framework.name) }]}
                            yAxis={[{ label: 'Score %' }]}
                            series={[
                                {
                                    label: 'Compliance score',
                                    data: frameworks.map((framework) => framework.score),
                                    color: theme.palette.secondary.main,
                                },
                            ]}
                            margin={{ top: 20, right: 20, bottom: 60, left: 50 }}
                            borderRadius={6}
                            grid={{ horizontal: true }}
                        />
                    ) : (
                        <div style={{ color: theme.palette.text.secondary, fontSize: '0.875rem' }}>
                            No framework-score data available.
                        </div>
                    )}
                </Card>
            </div>

            {/* Hexagon-Style Radar */}
            <Card title="Compliance per Business Critical Tag" style={{ marginBottom: '1.5rem' }}>
                <RadarChart
                    height={340}
                    radar={{ metrics: radarMetrics, max: 100 }}
                    series={[
                        {
                            label: 'Compliance Coverage',
                            data: [
                                criticalTagRadarValues.identityAndAccess,
                                criticalTagRadarValues.dataProtection,
                                criticalTagRadarValues.monitoringAndDetection,
                                criticalTagRadarValues.incidentResponse,
                                criticalTagRadarValues.resilienceAndRecovery,
                                criticalTagRadarValues.vendorAndThirdParty,
                            ],
                            fillArea: true,
                        },
                    ]}
                />
            </Card>

            {/* Controls Table */}
            <Card title="Control Details">
                <DataTable
                    columns={controlColumns}
                    data={controls}
                    rowKey="id"
                    preferenceKey="compliance-dashboard.tables.control-details"
                />
            </Card>
        </section>
    );
};

export default ComplianceDashboardApp;
