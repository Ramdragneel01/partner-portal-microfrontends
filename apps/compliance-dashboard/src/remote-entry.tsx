
/**
 * Compliance Dashboard — Remote entry point.
 * Displays compliance posture by framework, control status, and score trends.
 * @security RBAC-gated assess action via usePermission.
 */
import React, { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { BarChart, PieChart, RadarChart } from '@mui/x-charts';
import { apiClient, isMockDataEnabled, mockData } from '@shared/api-client';
import { usePermission } from '@shared/auth';
import { PageHeader, Card, StatCard, DataTable, StatusBadge, Button, AlertBanner } from '@shared/ui-components';
import { AppEvent, eventBus, useEventBus } from '@shared/event-bus';
import type { ComplianceFramework, ComplianceControl } from '@shared/types';
import type { Column } from '@shared/ui-components';

const MAX_FRAMEWORK_STAT_CARDS = 8;
const MAX_FRAMEWORK_CHART_POINTS = 12;

const ComplianceDashboardApp: React.FC = () => {
    const isMockDataMode = React.useMemo(() => isMockDataEnabled(), []);
    const [controls, setControls] = useState<ComplianceControl[]>(
        () => (isMockDataMode ? (mockData.controls as ComplianceControl[]) : []),
    );
    const [frameworks, setFrameworks] = useState<ComplianceFramework[]>(
        () => (isMockDataMode ? (mockData.frameworks as ComplianceFramework[]) : []),
    );
    const [liveLoadError, setLiveLoadError] = useState<string | null>(null);
    const [isInitialLiveLoadPending, setIsInitialLiveLoadPending] = useState(!isMockDataMode);
    const [crossAppMessage, setCrossAppMessage] = useState<string | null>(null);
    const theme = useTheme();
    const canAssess = usePermission('assess', 'compliance');

    useEffect(() => {
        if (isMockDataMode) {
            setControls(mockData.controls as ComplianceControl[]);
            setFrameworks(mockData.frameworks as ComplianceFramework[]);
            setLiveLoadError(null);
            setIsInitialLiveLoadPending(false);
            return undefined;
        }

        const controller = new AbortController();

        const loadComplianceData = async () => {
            try {
                const [controlsData, frameworkData] = await Promise.all([
                    apiClient.get<ComplianceControl[]>('/controls', {
                        signal: controller.signal,
                        cacheTtlMs: 0,
                        dedupe: false,
                    }),
                    apiClient.get<ComplianceFramework[]>('/frameworks', {
                        signal: controller.signal,
                        cacheTtlMs: 0,
                        dedupe: false,
                    }),
                ]);

                if (Array.isArray(controlsData)) {
                    setControls(controlsData);
                }

                if (Array.isArray(frameworkData)) {
                    setFrameworks(frameworkData);
                }

                setLiveLoadError(null);
                setIsInitialLiveLoadPending(false);
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return;
                }

                setLiveLoadError('Live API request failed. Verify backend is running and API_BASE_URL is reachable.');
                setIsInitialLiveLoadPending(false);
            }
        };

        void loadComplianceData();
        const intervalId = window.setInterval(() => {
            void loadComplianceData();
        }, 15_000);

        return () => {
            controller.abort();
            window.clearInterval(intervalId);
        };
    }, [isMockDataMode]);

    const overallScore = frameworks.length > 0
        ? Math.round(frameworks.reduce((sum, f) => sum + f.score, 0) / frameworks.length)
        : 0;
    const frameworksForStatCards = frameworks.slice(0, MAX_FRAMEWORK_STAT_CARDS);
    const frameworksForChart = frameworks.slice(0, MAX_FRAMEWORK_CHART_POINTS);

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
    const hasFrameworkScoreData = frameworksForChart.length > 0;

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

            {isInitialLiveLoadPending && !isMockDataMode && (
                <AlertBanner
                    type="info"
                    message="Loading live compliance data..."
                />
            )}

            {liveLoadError && !isMockDataMode && (
                <AlertBanner
                    type="warning"
                    message={liveLoadError}
                    onDismiss={() => setLiveLoadError(null)}
                />
            )}

            {/* Score Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <StatCard label="Overall Score" value={`${overallScore}%`} icon="📊" changeType={overallScore >= 80 ? 'positive' : 'negative'} change={overallScore >= 80 ? 'On track' : 'Needs improvement'} />
                {frameworksForStatCards.map((fw) => (
                    <StatCard key={fw.id} label={fw.name} value={`${fw.score}%`} changeType={fw.score >= 85 ? 'positive' : fw.score >= 70 ? 'neutral' : 'negative'} change={`${fw.compliantControls}/${fw.totalControls} controls`} />
                ))}
            </div>

            {!isMockDataMode && frameworks.length > frameworksForStatCards.length && (
                <div style={{ color: theme.palette.text.secondary, fontSize: '0.875rem', marginBottom: '1rem' }}>
                    Showing first {frameworksForStatCards.length} of {frameworks.length} frameworks in summary cards.
                </div>
            )}

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
                            xAxis={[{ scaleType: 'band', data: frameworksForChart.map((framework) => framework.name) }]}
                            yAxis={[{ label: 'Score %' }]}
                            series={[
                                {
                                    label: 'Compliance score',
                                    data: frameworksForChart.map((framework) => framework.score),
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

                    {!isMockDataMode && frameworks.length > frameworksForChart.length && (
                        <div style={{ color: theme.palette.text.secondary, fontSize: '0.75rem', marginTop: '0.5rem' }}>
                            Chart limited to first {frameworksForChart.length} frameworks to keep the view responsive.
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
