
/**
 * Partner Onboarding — Remote entry point.
 * Multi-step onboarding wizard, status tracker, and bulk partner invite.
 * @security RBAC-gated onboard/approve actions via usePermission.
 */
import React, { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { BarChart, PieChart } from '@mui/x-charts';
import { apiClient, mockData } from '@shared/api-client';
import { usePermission } from '@shared/auth';
import { PageHeader, Card, StatCard, DataTable, StatusBadge, Button, FormField, BulkActionBar, AlertBanner } from '@shared/ui-components';
import { AppEvent, eventBus, useEventBus } from '@shared/event-bus';
import { OnboardingStep } from '@shared/types';
import type { Partner } from '@shared/types';
import type { Column } from '@shared/ui-components';

const ONBOARDING_STEPS = [
    { key: OnboardingStep.CompanyInfo, label: 'Company Info', icon: '🏢' },
    { key: OnboardingStep.KycDocuments, label: 'KYC Documents', icon: '📄' },
    { key: OnboardingStep.ComplianceAttestation, label: 'Compliance', icon: '✅' },
    { key: OnboardingStep.Review, label: 'Review', icon: '🔍' },
    { key: OnboardingStep.Approval, label: 'Approval', icon: '✔️' },
];

const PartnerOnboardingApp: React.FC = () => {
    const [partners, setPartners] = useState<Partner[]>(mockData.partners as Partner[]);
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
    const [showWizard, setShowWizard] = useState(false);
    const [wizardStep, setWizardStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [blockedVendorIds, setBlockedVendorIds] = useState<string[]>([]);
    const [complianceChecklist, setComplianceChecklist] = useState({ gdpr: false, iso27001: false, dataHandling: false, amlKyc: false });
    const [kycFiles, setKycFiles] = useState<string[]>([]);
    const [formData, setFormData] = useState({ companyName: '', contactName: '', contactEmail: '', industry: '', country: '' });
    const canOnboard = usePermission('onboard', 'partner');
    const canApprove = usePermission('approve', 'partner');
    const theme = useTheme();
    const isOnboardingBlocked = blockedVendorIds.length > 0;


    /**
     * Applies cross-domain vendor risk signals to onboarding actions.
     * High-risk vendors temporarily block approval and new partner submissions.
     */
    useEventBus(AppEvent.VendorRiskChanged, ({ vendorId, newRating }) => {
        if (newRating === 'high') {
            setBlockedVendorIds((prev) => (prev.includes(vendorId) ? prev : [...prev, vendorId]));
            return;
        }

        setBlockedVendorIds((prev) => prev.filter((existingVendorId) => existingVendorId !== vendorId));
    });

    const columns: Column<Partner>[] = [
        { key: 'id', header: 'ID', sortable: true, width: '90px' },
        { key: 'companyName', header: 'Company', sortable: true },
        { key: 'contactName', header: 'Contact', sortable: true, width: '140px' },
        { key: 'industry', header: 'Industry', sortable: true, width: '140px' },
        { key: 'country', header: 'Country', sortable: true, width: '120px' },
        {
            key: 'currentStep', header: 'Current Step', sortable: true, width: '140px',
            render: (r: Partner) => {
                const step = ONBOARDING_STEPS.find((s) => s.key === r.currentStep);
                return <span>{step?.icon} {step?.label}</span>;
            },
        },
        { key: 'status', header: 'Status', sortable: true, width: '150px', render: (r: Partner) => <StatusBadge status={r.status} /> },
    ];

    const stats = {
        total: partners.length,
        inProgress: partners.filter((p) => p.status === 'in-progress').length,
        pendingApproval: partners.filter((p) => p.status === 'pending-approval').length,
        approved: partners.filter((p) => p.status === 'approved').length,
    };

    const onboardingStatusSeries = [
        { key: 'in-progress', label: 'In Progress', color: theme.palette.info.main, count: partners.filter((partner) => partner.status === 'in-progress').length },
        { key: 'pending-approval', label: 'Pending Approval', color: theme.palette.warning.main, count: partners.filter((partner) => partner.status === 'pending-approval').length },
        { key: 'approved', label: 'Approved', color: theme.palette.success.main, count: partners.filter((partner) => partner.status === 'approved').length },
        { key: 'rejected', label: 'Rejected', color: theme.palette.error.main, count: partners.filter((partner) => partner.status === 'rejected').length },
        { key: 'not-started', label: 'Not Started', color: theme.palette.text.secondary, count: partners.filter((partner) => partner.status === 'not-started').length },
    ] as const;

    const onboardingStepSeries = ONBOARDING_STEPS.map((step) => ({
        key: step.key,
        label: step.label,
        count: partners.filter((partner) => partner.currentStep === step.key).length,
    }));

    const hasOnboardingStatusData = onboardingStatusSeries.some((series) => series.count > 0);
    const hasOnboardingStepData = onboardingStepSeries.some((series) => series.count > 0);

    const handleField = (field: string) => (value: string) => setFormData((prev) => ({ ...prev, [field]: value }));

    const canProceedToNextStep = () => {
        if (wizardStep === 0) return formData.companyName && formData.contactName && formData.contactEmail && formData.industry && formData.country;
        if (wizardStep === 2) return complianceChecklist.gdpr && complianceChecklist.iso27001 && complianceChecklist.dataHandling;
        return true;
    };

    const handleSubmitApplication = async () => {
        setIsSubmitting(true);
        setSubmitError(null);
        const payload = {
            companyName: formData.companyName,
            contactName: formData.contactName,
            contactEmail: formData.contactEmail,
            industry: formData.industry,
            country: formData.country,
            currentStep: OnboardingStep.Review,
            status: 'pending-approval',
            submittedAt: new Date().toISOString(),
            approvedAt: null,
        };
        const optimisticId = `PART-${Date.now().toString().slice(-5)}`;
        try {
            const created = await apiClient.post<Partner>('/partners', payload);
            setPartners((prev) => [created, ...prev]);
            eventBus.emit(AppEvent.PartnerOnboarded, { partnerId: created.id, companyName: created.companyName });
            eventBus.emit(AppEvent.NotificationReceived, { message: `Partner application submitted: ${created.companyName}`, type: 'info' });
        } catch {
            setPartners((prev) => [{ id: optimisticId, ...payload } as unknown as Partner, ...prev]);
            eventBus.emit(AppEvent.NotificationReceived, { message: `Partner application submitted: ${formData.companyName}`, type: 'info' });
        } finally {
            setIsSubmitting(false);
            setShowWizard(false);
            setWizardStep(0);
            setFormData({ companyName: '', contactName: '', contactEmail: '', industry: '', country: '' });
            setComplianceChecklist({ gdpr: false, iso27001: false, dataHandling: false, amlKyc: false });
            setKycFiles([]);
        }
    };

    const handleBulkApprove = async () => {
        const ids = Array.from(selectedRows);
        await Promise.allSettled(ids.map((id) => apiClient.patch(`/partners/${id}`, { status: 'approved', approvedAt: new Date().toISOString() })));
        setPartners((prev) => prev.map((p) => selectedRows.has(p.id) ? { ...p, status: 'approved' } : p));
        ids.forEach((id) => {
            const partner = partners.find((p) => p.id === id);
            if (partner) eventBus.emit(AppEvent.PartnerOnboarded, { partnerId: id, companyName: partner.companyName });
        });
        eventBus.emit(AppEvent.NotificationReceived, { message: `${ids.length} partner(s) approved`, type: 'success' });
        setSelectedRows(new Set());
    };

    return (
        <section aria-label="Partner Onboarding">
            <PageHeader
                title="Partner Onboarding"
                subtitle="Register, verify, and onboard new partners"
                actions={
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {canOnboard && (
                            <Button
                                disabled={isOnboardingBlocked}
                                onClick={() => { setShowWizard(true); setWizardStep(0); }}
                            >
                                + New Partner
                            </Button>
                        )}
                        <Button variant="secondary" onClick={() => alert('Bulk CSV Invite — Coming Soon')}>📁 Bulk Invite</Button>
                    </div>
                }
            />

            {isOnboardingBlocked && (
                <AlertBanner
                    type="warning"
                    message={`Onboarding approvals are temporarily blocked due to high-risk vendor signals (${blockedVendorIds.length}).`}
                />
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <StatCard label="Total Partners" value={stats.total} icon="🤝" />
                <StatCard label="In Progress" value={stats.inProgress} icon="🔄" changeType="neutral" />
                <StatCard label="Pending Approval" value={stats.pendingApproval} icon="⏳" changeType="neutral" change="Awaiting review" />
                <StatCard label="Approved" value={stats.approved} icon="✅" changeType="positive" />
            </div>

            {/* Chart Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <Card title="Onboarding Status Mix" style={{ marginBottom: 0 }}>
                    {hasOnboardingStatusData ? (
                        <PieChart
                            height={280}
                            series={[
                                {
                                    innerRadius: 45,
                                    outerRadius: 95,
                                    paddingAngle: 2,
                                    cornerRadius: 4,
                                    data: onboardingStatusSeries.map((series, index) => ({
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
                            No onboarding-status data available.
                        </div>
                    )}
                </Card>

                <Card title="Partner Distribution by Step" style={{ marginBottom: 0 }}>
                    {hasOnboardingStepData ? (
                        <BarChart
                            height={280}
                            xAxis={[{ scaleType: 'band', data: onboardingStepSeries.map((series) => series.label) }]}
                            yAxis={[{ label: 'Partners' }]}
                            series={[
                                {
                                    label: 'Count',
                                    data: onboardingStepSeries.map((series) => series.count),
                                    color: theme.palette.secondary.main,
                                },
                            ]}
                            margin={{ top: 20, right: 20, bottom: 70, left: 50 }}
                            borderRadius={6}
                            grid={{ horizontal: true }}
                        />
                    ) : (
                        <div style={{ color: theme.palette.text.secondary, fontSize: '0.875rem' }}>
                            No onboarding-step data available.
                        </div>
                    )}
                </Card>
            </div>

            {/* Onboarding Pipeline */}
            <Card title="Onboarding Pipeline" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0' }}>
                    {ONBOARDING_STEPS.map((step, idx) => {
                        const count = partners.filter((p) => p.currentStep === step.key).length;
                        return (
                            <div key={step.key} style={{ textAlign: 'center', flex: 1, position: 'relative' }}>
                                <div style={{
                                    width: 48, height: 48, borderRadius: '50%',
                                    backgroundColor: count > 0 ? theme.palette.secondary.main : theme.palette.action.selected,
                                    color: theme.palette.common.white, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    margin: '0 auto 0.5rem', fontSize: '1.25rem',
                                }}>
                                    {step.icon}
                                </div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block' }}>{step.label}</span>
                                <span style={{ fontSize: '0.6875rem', color: theme.palette.text.secondary }}>{count} partner(s)</span>
                                {idx < ONBOARDING_STEPS.length - 1 && (
                                    <div style={{ position: 'absolute', top: 24, left: '65%', right: '-35%', height: 2, backgroundColor: theme.palette.divider }} />
                                )}
                            </div>
                        );
                    })}
                </div>
            </Card>

            {/* Onboarding Wizard */}
            {showWizard && (
                <Card title={`New Partner — Step ${wizardStep + 1} of ${ONBOARDING_STEPS.length}: ${ONBOARDING_STEPS[wizardStep].label}`} style={{ marginBottom: '1.5rem', border: `2px solid ${theme.palette.secondary.main}` }}>
                    {submitError && <AlertBanner type="error" message={submitError} onDismiss={() => setSubmitError(null)} />}
                    {/* Step Progress Bar */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        {ONBOARDING_STEPS.map((step, idx) => (
                            <div key={step.key} style={{
                                flex: 1, height: 4, borderRadius: 2,
                                backgroundColor: idx <= wizardStep ? theme.palette.secondary.main : theme.palette.action.selected,
                                transition: 'background-color 0.3s',
                            }} />
                        ))}
                    </div>

                    {/* Step 0: Company Info */}
                    {wizardStep === 0 && (
                        <>
                            <FormField label="Company Name" name="companyName" value={formData.companyName} onChange={handleField('companyName')} required />
                            <FormField label="Contact Name" name="contactName" value={formData.contactName} onChange={handleField('contactName')} required />
                            <FormField label="Contact Email" name="contactEmail" type="email" value={formData.contactEmail} onChange={handleField('contactEmail')} required />
                            <FormField label="Industry" name="industry" type="select" value={formData.industry} onChange={handleField('industry')} required options={[
                                { value: 'financial', label: 'Financial Services' }, { value: 'technology', label: 'Technology' },
                                { value: 'healthcare', label: 'Healthcare' }, { value: 'retail', label: 'Retail' }, { value: 'consulting', label: 'Consulting' },
                            ]} />
                            <FormField label="Country" name="country" value={formData.country} onChange={handleField('country')} required />
                        </>
                    )}

                    {/* Step 1: KYC Documents */}
                    {wizardStep === 1 && (
                        <div style={{ padding: '1rem 0' }}>
                            <p style={{ color: theme.palette.text.secondary, marginBottom: '1rem', fontSize: '0.875rem' }}>
                                Upload the required KYC documents. All files are encrypted at rest.
                            </p>
                            {['Company Registration Certificate', 'Government-Issued Tax ID', 'Proof of Business Address', 'Beneficial Ownership Declaration'].map((docType) => (
                                <div key={docType} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '0.75rem 1rem', marginBottom: '0.5rem', borderRadius: '6px',
                                    border: `1px dashed ${kycFiles.includes(docType) ? theme.palette.success.main : theme.palette.divider}`,
                                    backgroundColor: kycFiles.includes(docType) ? 'rgba(76,175,80,0.05)' : theme.palette.background.default,
                                }}>
                                    <span style={{ fontSize: '0.875rem' }}>
                                        {kycFiles.includes(docType) ? '✅' : '📄'} {docType}
                                    </span>
                                    <Button variant="secondary" onClick={() => setKycFiles((prev) => prev.includes(docType) ? prev.filter((f) => f !== docType) : [...prev, docType])}>
                                        {kycFiles.includes(docType) ? 'Remove' : 'Upload'}
                                    </Button>
                                </div>
                            ))}
                            <p style={{ fontSize: '0.75rem', color: theme.palette.text.secondary, marginTop: '0.5rem' }}>
                                Supported formats: PDF, PNG, JPG · Max 10MB per file
                            </p>
                        </div>
                    )}

                    {/* Step 2: Compliance Attestation */}
                    {wizardStep === 2 && (
                        <div style={{ padding: '1rem 0' }}>
                            <p style={{ marginBottom: '1rem', color: theme.palette.text.secondary, fontSize: '0.875rem' }}>
                                By checking these boxes, your organisation attests compliance with the listed requirements.
                            </p>
                            {[
                                { key: 'gdpr', label: 'GDPR / Data Protection Compliance', subtext: 'We comply with applicable data protection regulations.' },
                                { key: 'iso27001', label: 'ISO 27001 / Information Security', subtext: 'We have an information security management system in place.' },
                                { key: 'dataHandling', label: 'Accenture Data Handling Policy', subtext: 'We agree to handle Accenture data per the data handling guidelines.' },
                                { key: 'amlKyc', label: 'AML / KYC Compliance', subtext: 'We comply with anti-money laundering and know-your-customer requirements.' },
                            ].map((item) => (
                                <label key={item.key} style={{
                                    display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.875rem',
                                    marginBottom: '0.5rem', borderRadius: '6px', cursor: 'pointer',
                                    border: `1px solid ${(complianceChecklist as any)[item.key] ? theme.palette.secondary.main : theme.palette.divider}`,
                                    backgroundColor: (complianceChecklist as any)[item.key] ? 'rgba(161,0,255,0.04)' : 'transparent',
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={(complianceChecklist as any)[item.key]}
                                        onChange={(e) => setComplianceChecklist((prev) => ({ ...prev, [item.key]: e.target.checked }))}
                                        style={{ marginTop: 2, accentColor: theme.palette.secondary.main }}
                                    />
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{item.label}</div>
                                        <div style={{ fontSize: '0.75rem', color: theme.palette.text.secondary }}>{item.subtext}</div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}

                    {/* Step 3: Review Summary */}
                    {wizardStep === 3 && (
                        <div style={{ padding: '0.5rem 0' }}>
                            <p style={{ marginBottom: '1rem', color: theme.palette.text.secondary, fontSize: '0.875rem' }}>
                                Please review your application before final submission.
                            </p>
                            {[
                                ['Company', formData.companyName],
                                ['Contact', `${formData.contactName} (${formData.contactEmail})`],
                                ['Industry', formData.industry],
                                ['Country', formData.country],
                                ['KYC Documents', kycFiles.length > 0 ? `${kycFiles.length} uploaded` : 'None uploaded'],
                                ['Compliance Attestations', `${Object.values(complianceChecklist).filter(Boolean).length}/4 completed`],
                            ].map(([label, value]) => (
                                <div key={label} style={{ display: 'flex', gap: '1rem', padding: '0.5rem 0', borderBottom: `1px solid ${theme.palette.divider}` }}>
                                    <span style={{ width: '160px', fontWeight: 600, fontSize: '0.875rem', color: theme.palette.text.secondary }}>{label}</span>
                                    <span style={{ fontSize: '0.875rem' }}>{value || '—'}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Step 4: Approval Decision */}
                    {wizardStep === 4 && (
                        <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>✔️</div>
                            <h3 style={{ marginBottom: '0.5rem' }}>Ready to Submit</h3>
                            <p style={{ color: theme.palette.text.secondary, fontSize: '0.875rem', maxWidth: '400px', margin: '0 auto' }}>
                                Your partner application for <strong>{formData.companyName}</strong> is complete. It will be reviewed by the portal administrators within 3 business days.
                            </p>
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
                        <Button variant="ghost" type="button" onClick={() => wizardStep > 0 ? setWizardStep(wizardStep - 1) : setShowWizard(false)}>
                            {wizardStep > 0 ? '← Previous' : 'Cancel'}
                        </Button>
                        {wizardStep < ONBOARDING_STEPS.length - 1 ? (
                            <Button disabled={!canProceedToNextStep()} onClick={() => setWizardStep(wizardStep + 1)}>
                                Next →
                            </Button>
                        ) : (
                            <Button loading={isSubmitting} onClick={handleSubmitApplication}>
                                Submit Application
                            </Button>
                        )}
                    </div>
                </Card>
            )}

            <Card title="Partner Registry">
                <BulkActionBar
                    selectedCount={selectedRows.size}
                    actions={[
                        ...(canApprove ? [{ label: 'Approve', onClick: handleBulkApprove, variant: 'primary' as const, icon: '✅', disabled: isOnboardingBlocked }] : []),
                        { label: 'Request More Info', onClick: () => { setPartners((prev) => prev.map((p) => selectedRows.has(p.id) ? { ...p, status: 'in-progress' } : p)); setSelectedRows(new Set()); }, variant: 'secondary' as const, icon: '📧' },
                        ...(canApprove ? [{ label: 'Reject', onClick: () => { setPartners((prev) => prev.map((p) => selectedRows.has(p.id) ? { ...p, status: 'rejected' } : p)); setSelectedRows(new Set()); }, variant: 'danger' as const, icon: '❌' }] : []),
                    ]}
                    onClearSelection={() => setSelectedRows(new Set())}
                    placement="top"
                />

                <DataTable
                    columns={columns}
                    data={partners}
                    rowKey="id"
                    preferenceKey="partner-onboarding.tables.partner-registry"
                    selectable
                    selectedRows={selectedRows}
                    onSelectionChange={setSelectedRows}
                />
            </Card>
        </section>
    );
};

export default PartnerOnboardingApp;
