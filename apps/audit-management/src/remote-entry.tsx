
/**
 * Audit Management — Remote entry point.
 * Displays audit plans, findings, and remediation tracking with full CRUD.
 * @security RBAC-gated create action via usePermission.
 */
import React, { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { BarChart, PieChart } from '@mui/x-charts';
import { apiClient, mockData } from '@shared/api-client';
import { usePermission } from '@shared/auth';
import { PageHeader, Card, StatCard, DataTable, StatusBadge, Button, BulkActionBar, Modal, FormField, AlertBanner, useUserPreferences } from '@shared/ui-components';
import { AppEvent, eventBus, useEventBus } from '@shared/event-bus';
import type { AuditPlan, AuditFinding } from '@shared/types';
import type { Column } from '@shared/ui-components';

const AuditManagementApp: React.FC = () => {
  const [audits, setAudits] = useState<AuditPlan[]>(mockData.audits as AuditPlan[]);
  const [findings, setFindings] = useState<AuditFinding[]>(mockData.findings as AuditFinding[]);
  const [selectedFindings, setSelectedFindings] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useUserPreferences<'plans' | 'findings'>('audit-management.view-selection', 'plans');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [policySignalMessage, setPolicySignalMessage] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState({ title: '', scope: '', leadAuditor: '', startDate: '', endDate: '' });
  const canCreate = usePermission('create', 'audit');
  const theme = useTheme();

  useEventBus(AppEvent.PolicyApproved, ({ policyId, version }) => {
    setPolicySignalMessage(`Policy ${policyId} (v${version}) was approved. Re-validate related audit findings.`);
  });

  const auditColumns: Column<AuditPlan>[] = [
    { key: 'id', header: 'ID', sortable: true, width: '100px' },
    { key: 'title', header: 'Audit Title', sortable: true },
    { key: 'status', header: 'Status', sortable: true, width: '130px', render: (r: AuditPlan) => <StatusBadge status={r.status} /> },
    { key: 'leadAuditor', header: 'Lead Auditor', sortable: true, width: '160px' },
    { key: 'startDate', header: 'Start', sortable: true, width: '110px' },
    { key: 'endDate', header: 'End', sortable: true, width: '110px' },
    { key: 'findingsCount', header: 'Findings', width: '90px', render: (r: AuditPlan) => <strong>{r.findingsCount}</strong> },
  ];

  const findingColumns: Column<AuditFinding>[] = [
    { key: 'id', header: 'ID', sortable: true, width: '100px' },
    { key: 'title', header: 'Finding', sortable: true },
    { key: 'severity', header: 'Severity', sortable: true, width: '120px', render: (r: AuditFinding) => <StatusBadge status={r.severity} /> },
    { key: 'owner', header: 'Owner', sortable: true, width: '120px' },
    { key: 'remediationStatus', header: 'Remediation', sortable: true, width: '140px', render: (r: AuditFinding) => <StatusBadge status={r.remediationStatus} /> },
    { key: 'dueDate', header: 'Due Date', sortable: true, width: '110px' },
  ];

  const stats = {
    total: audits.length,
    inProgress: audits.filter((a) => a.status === 'in-progress').length,
    openFindings: findings.filter((f) => f.remediationStatus === 'open').length,
    criticalFindings: findings.filter((f) => f.severity === 'critical').length,
  };

  const auditStatusSeries = [
    { key: 'planned', label: 'Planned', color: theme.palette.info.main, count: audits.filter((audit) => audit.status === 'planned').length },
    { key: 'in-progress', label: 'In Progress', color: theme.palette.warning.main, count: audits.filter((audit) => audit.status === 'in-progress').length },
    { key: 'completed', label: 'Completed', color: theme.palette.success.main, count: audits.filter((audit) => audit.status === 'completed').length },
    { key: 'closed', label: 'Closed', color: theme.palette.text.secondary, count: audits.filter((audit) => audit.status === 'closed').length },
  ] as const;

  const findingSeveritySeries = [
    { key: 'critical', label: 'Critical', color: theme.palette.error.main, count: findings.filter((finding) => finding.severity === 'critical').length },
    { key: 'high', label: 'High', color: theme.palette.warning.main, count: findings.filter((finding) => finding.severity === 'high').length },
    { key: 'medium', label: 'Medium', color: theme.palette.info.main, count: findings.filter((finding) => finding.severity === 'medium').length },
    { key: 'low', label: 'Low', color: theme.palette.success.main, count: findings.filter((finding) => finding.severity === 'low').length },
  ] as const;

  const hasAuditStatusData = auditStatusSeries.some((series) => series.count > 0);
  const hasFindingSeverityData = findingSeveritySeries.some((series) => series.count > 0);

  const setField = (field: string) => (value: string) => setCreateForm((prev) => ({ ...prev, [field]: value }));

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setSubmitError(null);
    setCreateForm({ title: '', scope: '', leadAuditor: '', startDate: '', endDate: '' });
  };

  const handleCreateAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    const payload = {
      title: createForm.title,
      scope: createForm.scope,
      leadAuditor: createForm.leadAuditor,
      startDate: createForm.startDate,
      endDate: createForm.endDate,
      status: 'planned',
      findingsCount: 0,
    };
    const optimisticId = `AUD-${Date.now().toString().slice(-5)}`;
    try {
      const created = await apiClient.post<AuditPlan>('/audits', payload);
      setAudits((prev) => [created, ...prev]);
      eventBus.emit(AppEvent.NotificationReceived, { message: `Audit plan created: ${created.title}`, type: 'info' });
    } catch {
      setAudits((prev) => [{ id: optimisticId, ...payload } as unknown as AuditPlan, ...prev]);
      eventBus.emit(AppEvent.NotificationReceived, { message: `Audit plan created: ${createForm.title}`, type: 'info' });
    } finally {
      setIsSubmitting(false);
      handleCloseModal();
    }
  };

  /** Bulk mark findings as resolved */
  const handleMarkResolved = async () => {
    const ids = Array.from(selectedFindings);
    await Promise.allSettled(ids.map((id) => apiClient.patch(`/findings/${id}`, { remediationStatus: 'resolved' })));
    setFindings((prev) => prev.map((f) => selectedFindings.has(f.id) ? { ...f, remediationStatus: 'resolved' } : f));
    eventBus.emit(AppEvent.AuditFindingCreated, { findingId: ids[0] ?? '', severity: 'resolved' });
    setSelectedFindings(new Set());
  };

  return (
    <section aria-label="Audit Management">
      <PageHeader
        title="Audit Management"
        subtitle="Plan audits, track findings, and manage remediation"
        actions={canCreate ? <Button onClick={() => setShowCreateModal(true)}>+ New Audit</Button> : undefined}
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
                meta: { sourceApp: 'audit-management', emittedAt: new Date().toISOString() },
              })}
            >
              Open Policy Module
            </Button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard label="Total Audits" value={stats.total} icon="📋" />
        <StatCard label="In Progress" value={stats.inProgress} icon="🔄" changeType="neutral" />
        <StatCard label="Open Findings" value={stats.openFindings} icon="🔍" changeType="negative" change="Needs remediation" />
        <StatCard label="Critical Findings" value={stats.criticalFindings} icon="🚨" changeType="negative" />
      </div>

      {/* Chart Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <Card title="Audit Progress by Status" style={{ marginBottom: 0 }}>
          {hasAuditStatusData ? (
            <BarChart
              height={280}
              xAxis={[{ scaleType: 'band', data: auditStatusSeries.map((series) => series.label) }]}
              yAxis={[{ label: 'Audit plans' }]}
              series={[
                {
                  label: 'Count',
                  data: auditStatusSeries.map((series) => series.count),
                  color: theme.palette.secondary.main,
                },
              ]}
              margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
              borderRadius={6}
              grid={{ horizontal: true }}
            />
          ) : (
            <div style={{ color: theme.palette.text.secondary, fontSize: '0.875rem' }}>
              No audit-status data available.
            </div>
          )}
        </Card>

        <Card title="Finding Severity Composition" style={{ marginBottom: 0 }}>
          {hasFindingSeverityData ? (
            <PieChart
              height={280}
              series={[
                {
                  innerRadius: 45,
                  outerRadius: 95,
                  paddingAngle: 2,
                  cornerRadius: 4,
                  data: findingSeveritySeries.map((series, index) => ({
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
              No finding-severity data available.
            </div>
          )}
        </Card>
      </div>

      {/* Tab Navigation */}
      <div role="tablist" aria-label="Audit sections" style={{ display: 'flex', gap: '0.25rem', borderBottom: `2px solid ${theme.palette.divider}`, marginBottom: '1.5rem' }}>
        {(['plans', 'findings'] as const).map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.625rem 1.25rem',
              border: 'none',
              borderBottom: activeTab === tab ? `2px solid ${theme.palette.secondary.main}` : '2px solid transparent',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              fontWeight: activeTab === tab ? 600 : 400,
              color: activeTab === tab ? theme.palette.secondary.main : theme.palette.text.secondary,
              fontSize: '0.875rem',
              marginBottom: '-2px',
            }}
          >
            {tab === 'plans' ? 'Audit Plans' : 'Findings & Remediation'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'plans' ? (
        <Card title="Audit Plans">
          <DataTable
            columns={auditColumns}
            data={audits}
            rowKey="id"
            preferenceKey="audit-management.tables.audit-plans"
          />
        </Card>
      ) : (
        <>
          <Card title="Audit Findings">
            <BulkActionBar
              selectedCount={selectedFindings.size}
              actions={[
                { label: 'Assign Owner', onClick: () => { setFindings((prev) => prev.map((f) => selectedFindings.has(f.id) ? { ...f, owner: 'Assigned' } : f)); setSelectedFindings(new Set()); }, variant: 'primary', icon: '👤' },
                { label: 'Mark Resolved', onClick: handleMarkResolved, variant: 'secondary', icon: '✅' },
              ]}
              onClearSelection={() => setSelectedFindings(new Set())}
              placement="top"
            />

            <DataTable
              columns={findingColumns}
              data={findings}
              rowKey="id"
              preferenceKey="audit-management.tables.audit-findings"
              selectable
              selectedRows={selectedFindings}
              onSelectionChange={setSelectedFindings}
            />
          </Card>
        </>
      )}

      {/* Create Audit Modal */}
      <Modal isOpen={showCreateModal} onClose={handleCloseModal} title="Create New Audit Plan" size="lg">
        <form onSubmit={handleCreateAudit}>
          {submitError && <AlertBanner type="error" message={submitError} onDismiss={() => setSubmitError(null)} />}
          <FormField label="Audit Title" name="title" value={createForm.title} onChange={setField('title')} required placeholder="e.g. Q3 SOC2 Compliance Audit" />
          <FormField label="Scope" name="scope" type="textarea" value={createForm.scope} onChange={setField('scope')} required placeholder="Define the audit scope and objectives" />
          <FormField label="Lead Auditor" name="leadAuditor" value={createForm.leadAuditor} onChange={setField('leadAuditor')} required placeholder="Responsible auditor name" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField label="Start Date" name="startDate" type="date" value={createForm.startDate} onChange={setField('startDate')} required />
            <FormField label="End Date" name="endDate" type="date" value={createForm.endDate} onChange={setField('endDate')} required />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <Button variant="secondary" type="button" onClick={handleCloseModal} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" loading={isSubmitting}>Create Audit</Button>
          </div>
        </form>
      </Modal>
    </section>
  );
};

export default AuditManagementApp;
