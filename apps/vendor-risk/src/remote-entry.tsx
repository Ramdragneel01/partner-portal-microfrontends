
/**
 * Vendor Risk Management — Remote entry point.
 * Vendor registry with risk scoring, questionnaire management, and Add Vendor modal.
 * @security RBAC-gated create/assess actions via usePermission.
 */
import React, { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { BarChart, PieChart } from '@mui/x-charts';
import { apiClient, mockData } from '@shared/api-client';
import { usePermission } from '@shared/auth';
import { PageHeader, Card, StatCard, DataTable, StatusBadge, Button, BulkActionBar, Modal, FormField, AlertBanner } from '@shared/ui-components';
import { AppEvent, eventBus, useEventBus } from '@shared/event-bus';
import type { Vendor } from '@shared/types';
import type { Column } from '@shared/ui-components';

const VENDOR_CATEGORIES = ['Cloud Provider', 'Software', 'Professional Services', 'Infrastructure', 'Logistics', 'Financial', 'Legal', 'Marketing'];
const RISK_RATINGS = [{ value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }];

const VendorRiskApp: React.FC = () => {
    const [vendors, setVendors] = useState<Vendor[]>(mockData.vendors as Vendor[]);
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
    const [showAddModal, setShowAddModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [policySignalMessage, setPolicySignalMessage] = useState<string | null>(null);
    const [addForm, setAddForm] = useState({ name: '', category: '', riskRating: '', contactEmail: '', contractExpiry: '' });
    const canCreate = usePermission('create', 'vendor');
    const theme = useTheme();

    useEventBus(AppEvent.PolicyApproved, ({ policyId, version }) => {
        setPolicySignalMessage(`Policy ${policyId} (v${version}) approved. Reassess vendor controls against new requirements.`);
    });

    const columns: Column<Vendor>[] = [
        { key: 'id', header: 'ID', sortable: true, width: '90px' },
        { key: 'name', header: 'Vendor Name', sortable: true },
        { key: 'category', header: 'Category', sortable: true, width: '160px' },
        { key: 'riskRating', header: 'Risk Rating', sortable: true, width: '120px', render: (r: Vendor) => <StatusBadge status={r.riskRating} /> },
        {
            key: 'riskScore', header: 'Score', sortable: true, width: '80px',
            render: (r: Vendor) => {
                const color = r.riskScore >= 70 ? theme.palette.error.dark : r.riskScore >= 40 ? theme.palette.warning.dark : theme.palette.success.dark;
                return <strong style={{ color }}>{r.riskScore}</strong>;
            },
        },
        { key: 'status', header: 'Status', sortable: true, width: '130px', render: (r: Vendor) => <StatusBadge status={r.status} /> },
        { key: 'contractExpiry', header: 'Contract Expiry', sortable: true, width: '130px' },
        { key: 'lastAssessmentDate', header: 'Last Assessed', sortable: true, width: '130px' },
    ];

    const stats = {
        total: vendors.length,
        highRisk: vendors.filter((v) => v.riskRating === 'high').length,
        mediumRisk: vendors.filter((v) => v.riskRating === 'medium').length,
        underReview: vendors.filter((v) => v.status === 'under-review').length,
    };

    const vendorStatusSeries = [
        { key: 'active', label: 'Active', color: theme.palette.success.main, count: vendors.filter((vendor) => vendor.status === 'active').length },
        { key: 'under-review', label: 'Under Review', color: theme.palette.warning.main, count: vendors.filter((vendor) => vendor.status === 'under-review').length },
        { key: 'inactive', label: 'Inactive', color: theme.palette.text.secondary, count: vendors.filter((vendor) => vendor.status === 'inactive').length },
    ] as const;

    const riskScoreBandSeries = [
        { key: 'low', label: '0-30', color: theme.palette.success.main, count: vendors.filter((vendor) => vendor.riskScore <= 30).length },
        { key: 'medium', label: '31-60', color: theme.palette.warning.main, count: vendors.filter((vendor) => vendor.riskScore > 30 && vendor.riskScore <= 60).length },
        { key: 'high', label: '61-100', color: theme.palette.error.main, count: vendors.filter((vendor) => vendor.riskScore > 60).length },
    ] as const;

    const hasVendorStatusData = vendorStatusSeries.some((series) => series.count > 0);
    const hasRiskBandData = riskScoreBandSeries.some((series) => series.count > 0);

    const setField = (field: string) => (value: string) => setAddForm((prev) => ({ ...prev, [field]: value }));

    const handleCloseModal = () => {
        setShowAddModal(false);
        setSubmitError(null);
        setAddForm({ name: '', category: '', riskRating: '', contactEmail: '', contractExpiry: '' });
    };

    const handleAddVendor = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError(null);
        const payload = {
            name: addForm.name,
            category: addForm.category,
            riskRating: addForm.riskRating,
            contactEmail: addForm.contactEmail,
            contractExpiry: addForm.contractExpiry,
            riskScore: addForm.riskRating === 'high' ? 75 : addForm.riskRating === 'medium' ? 45 : 20,
            status: 'active',
            lastAssessmentDate: new Date().toISOString().split('T')[0],
        };
        const optimisticId = `VND-${Date.now().toString().slice(-5)}`;
        try {
            const created = await apiClient.post<Vendor>('/vendors', payload);
            setVendors((prev) => [created, ...prev]);
            eventBus.emit(AppEvent.VendorRiskChanged, { vendorId: created.id, newRating: created.riskRating });
            eventBus.emit(AppEvent.NotificationReceived, { message: `Vendor added: ${created.name}`, type: 'info' });
        } catch {
            setVendors((prev) => [{ id: optimisticId, ...payload } as unknown as Vendor, ...prev]);
            eventBus.emit(AppEvent.NotificationReceived, { message: `Vendor added: ${addForm.name}`, type: 'info' });
        } finally {
            setIsSubmitting(false);
            handleCloseModal();
        }
    };

    return (
        <section aria-label="Vendor Risk Management">
            <PageHeader
                title="Vendor Risk Management"
                subtitle="Assess and monitor third-party vendor risks"
                actions={
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {canCreate && <Button onClick={() => setShowAddModal(true)}>+ Add Vendor</Button>}
                        <Button variant="secondary" onClick={() => alert('CSV Import — Coming Soon')}>📁 Bulk Import</Button>
                    </div>
                }
            />

            {policySignalMessage && (
                <div style={{ marginBottom: '1rem' }}>
                    <AlertBanner
                        type="info"
                        message={policySignalMessage}
                        onDismiss={() => setPolicySignalMessage(null)}
                    />
                    <div style={{ marginTop: '0.5rem' }}>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => eventBus.emit(AppEvent.NavigationRequested, {
                                path: '/policy',
                                meta: { sourceApp: 'vendor-risk', emittedAt: new Date().toISOString() },
                            })}
                        >
                            Open Policy Module
                        </Button>
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <StatCard label="Total Vendors" value={stats.total} icon="🏢" />
                <StatCard label="High Risk" value={stats.highRisk} icon="🔴" changeType="negative" change="Immediate review required" />
                <StatCard label="Medium Risk" value={stats.mediumRisk} icon="🟡" changeType="neutral" />
                <StatCard label="Under Review" value={stats.underReview} icon="🔍" />
            </div>

            {/* Chart Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <Card title="Vendor Status Distribution" style={{ marginBottom: 0 }}>
                    {hasVendorStatusData ? (
                        <PieChart
                            height={280}
                            series={[
                                {
                                    innerRadius: 45,
                                    outerRadius: 95,
                                    paddingAngle: 2,
                                    cornerRadius: 4,
                                    data: vendorStatusSeries.map((series, index) => ({
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
                            No vendor-status data available.
                        </div>
                    )}
                </Card>

                <Card title="Risk Score Bands" style={{ marginBottom: 0 }}>
                    {hasRiskBandData ? (
                        <BarChart
                            height={280}
                            xAxis={[{ scaleType: 'band', data: riskScoreBandSeries.map((series) => series.label) }]}
                            yAxis={[{ label: 'Vendors' }]}
                            series={[
                                {
                                    label: 'Count',
                                    data: riskScoreBandSeries.map((series) => series.count),
                                    color: theme.palette.secondary.main,
                                },
                            ]}
                            margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
                            borderRadius={6}
                            grid={{ horizontal: true }}
                        />
                    ) : (
                        <div style={{ color: theme.palette.text.secondary, fontSize: '0.875rem' }}>
                            No risk-band data available.
                        </div>
                    )}
                </Card>
            </div>

            {/* RAG Status Overview */}
            <Card title="Risk Distribution (RAG)" style={{ marginBottom: '1.5rem' }}>
                <PieChart
                    height={300}
                    series={[
                        {
                            innerRadius: 55,
                            outerRadius: 105,
                            paddingAngle: 2,
                            cornerRadius: 4,
                            data: [
                                { id: 0, value: stats.highRisk, label: 'High', color: theme.palette.error.main },
                                { id: 1, value: stats.mediumRisk, label: 'Medium', color: theme.palette.warning.main },
                                { id: 2, value: Math.max(0, stats.total - stats.highRisk - stats.mediumRisk), label: 'Low', color: theme.palette.success.main },
                            ],
                        },
                    ]}
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                />
            </Card>

            <Card title="Vendor Registry">
                <BulkActionBar
                    selectedCount={selectedRows.size}
                    actions={[
                        { label: 'Request Assessment', onClick: () => { setVendors((prev) => prev.map((v) => selectedRows.has(v.id) ? { ...v, status: 'under-review' } : v)); setSelectedRows(new Set()); }, variant: 'primary', icon: '📝' },
                        { label: 'Send Questionnaire', onClick: () => { setSelectedRows(new Set()); }, variant: 'secondary', icon: '📋' },
                        { label: 'Deactivate', onClick: () => { setVendors((prev) => prev.map((v) => selectedRows.has(v.id) ? { ...v, status: 'inactive' } : v)); setSelectedRows(new Set()); }, variant: 'danger', icon: '🚫' },
                    ]}
                    onClearSelection={() => setSelectedRows(new Set())}
                    placement="top"
                />

                <DataTable
                    columns={columns}
                    data={vendors}
                    rowKey="id"
                    preferenceKey="vendor-risk.tables.vendor-registry"
                    selectable
                    selectedRows={selectedRows}
                    onSelectionChange={setSelectedRows}
                />
            </Card>

            {/* Add Vendor Modal */}
            <Modal isOpen={showAddModal} onClose={handleCloseModal} title="Add New Vendor" size="lg">
                <form onSubmit={handleAddVendor}>
                    {submitError && <AlertBanner type="error" message={submitError} onDismiss={() => setSubmitError(null)} />}
                    <FormField label="Vendor Name" name="name" value={addForm.name} onChange={setField('name')} required placeholder="e.g. Acme Cloud Services" />
                    <FormField label="Category" name="category" type="select" value={addForm.category} onChange={setField('category')} required
                        options={VENDOR_CATEGORIES.map((c) => ({ value: c.toLowerCase().replace(/\s/g, '-'), label: c }))} />
                    <FormField label="Initial Risk Rating" name="riskRating" type="select" value={addForm.riskRating} onChange={setField('riskRating')} required options={RISK_RATINGS} />
                    <FormField label="Contact Email" name="contactEmail" type="email" value={addForm.contactEmail} onChange={setField('contactEmail')} required placeholder="vendor@company.com" />
                    <FormField label="Contract Expiry Date" name="contractExpiry" type="date" value={addForm.contractExpiry} onChange={setField('contractExpiry')} />
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                        <Button variant="secondary" type="button" onClick={handleCloseModal} disabled={isSubmitting}>Cancel</Button>
                        <Button type="submit" loading={isSubmitting}>Add Vendor</Button>
                    </div>
                </form>
            </Modal>
        </section>
    );
};

export default VendorRiskApp;
