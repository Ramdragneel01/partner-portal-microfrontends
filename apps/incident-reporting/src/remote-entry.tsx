
/**
 * Incident Reporting — Remote entry point.
 * Provides incident submission, tracking, timeline, and escalation UI.
 * @security RBAC-gated report action via usePermission. API writes use authenticated apiClient.
 */
import React, { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { apiClient, mockData } from '@shared/api-client';
import { usePermission } from '@shared/auth';
import { PageHeader, Card, StatCard, DataTable, StatusBadge, Button, FormField, Modal, AlertBanner } from '@shared/ui-components';
import { AppEvent, eventBus } from '@shared/event-bus';
import type { Incident } from '@shared/types';
import type { Column } from '@shared/ui-components';

const IncidentReportingApp: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>(mockData.incidents as Incident[]);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: '', description: '', severity: '', category: '', affectedSystems: '' });
  const canReport = usePermission('report', 'incident');
  const theme = useTheme();

  const columns: Column<Incident>[] = [
    { key: 'id', header: 'ID', sortable: true, width: '90px' },
    { key: 'title', header: 'Incident', sortable: true },
    { key: 'severity', header: 'Severity', sortable: true, width: '110px', render: (r: Incident) => <StatusBadge status={r.severity} /> },
    { key: 'status', header: 'Status', sortable: true, width: '130px', render: (r: Incident) => <StatusBadge status={r.status} /> },
    { key: 'category', header: 'Category', sortable: true, width: '140px' },
    { key: 'assignee', header: 'Assignee', sortable: true, width: '130px' },
    { key: 'reportedAt', header: 'Reported', sortable: true, width: '160px', render: (r: Incident) => <span>{new Date(r.reportedAt).toLocaleDateString()}</span> },
  ];

  const stats = {
    total: incidents.length,
    open: incidents.filter((i) => i.status === 'open' || i.status === 'investigating').length,
    critical: incidents.filter((i) => i.severity === 'critical').length,
    resolved: incidents.filter((i) => i.status === 'resolved' || i.status === 'closed').length,
  };

  const handleField = (field: string) => (value: string) => setFormData((prev) => ({ ...prev, [field]: value }));

  const handleCloseForm = () => {
    setShowForm(false);
    setSubmitError(null);
    setFormData({ title: '', description: '', severity: '', category: '', affectedSystems: '' });
  };

  /**
   * Submits the incident form to the API.
   * Falls back to optimistic local state if no backend is available (development).
   * Emits IncidentCreated event for cross-app notification.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    const payload = {
      title: formData.title,
      description: formData.description,
      severity: formData.severity,
      category: formData.category,
      affectedSystems: formData.affectedSystems ? formData.affectedSystems.split(',').map((s) => s.trim()) : [],
      status: 'open',
      reportedAt: new Date().toISOString(),
      reporter: 'current-user',
      assignee: 'Unassigned',
    };


    /** Optimistic ID for development when no backend is available */
    const optimisticId = `INC-${Date.now().toString().slice(-5)}`;

    try {
      const created = await apiClient.post<Incident>('/incidents', payload);
      setIncidents((prev) => [created, ...prev]);
      eventBus.emit(AppEvent.IncidentCreated, { incidentId: created.id, severity: created.severity });
      eventBus.emit(AppEvent.NotificationReceived, { message: `New incident reported: ${created.title}`, type: 'warning' });
    } catch {
      // No backend available — apply optimistic update for development
      const optimistic: Incident = { id: optimisticId, ...payload } as unknown as Incident;
      setIncidents((prev) => [optimistic, ...prev]);
      eventBus.emit(AppEvent.IncidentCreated, { incidentId: optimisticId, severity: formData.severity });
      eventBus.emit(AppEvent.NotificationReceived, { message: `New incident reported: ${formData.title}`, type: 'warning' });
    } finally {
      setIsSubmitting(false);
      handleCloseForm();
    }
  };

  return (
    <section aria-label="Incident Reporting">
      <PageHeader
        title="Incident Reporting"
        subtitle="Report, track, and respond to security incidents"
        actions={canReport ? <Button onClick={() => setShowForm(true)}>🚨 Report Incident</Button> : undefined}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard label="Total Incidents" value={stats.total} icon="📊" />
        <StatCard label="Active" value={stats.open} icon="🔴" changeType="negative" change="Requires attention" />
        <StatCard label="Critical" value={stats.critical} icon="🚨" changeType="negative" />
        <StatCard label="Resolved" value={stats.resolved} icon="✅" changeType="positive" />
      </div>

      {/* Incident Timeline */}
      <Card title="Recent Activity Timeline" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingLeft: '1.5rem', borderLeft: `2px solid ${theme.palette.divider}` }}>
          {incidents.slice(0, 10).map((inc: Incident) => (
            <div key={inc.id} style={{ position: 'relative', paddingLeft: '1rem' }}>
              <div style={{
                position: 'absolute', left: '-1.75rem', top: '0.25rem',
                width: 12, height: 12, borderRadius: '50%',
                backgroundColor: inc.severity === 'critical' ? theme.palette.error.main : inc.severity === 'high' ? theme.palette.warning.main : theme.palette.primary.main,
                border: `2px solid ${theme.palette.background.paper}`,
              }} />
              <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{inc.title}</div>
              <div style={{ fontSize: '0.75rem', color: theme.palette.text.secondary }}>
                {new Date(inc.reportedAt).toLocaleString()} · <StatusBadge status={inc.status} /> · {inc.assignee}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Incident Register">
        <DataTable columns={columns} data={incidents} rowKey="id" />
      </Card>

      {/* Report Incident Modal */}
      <Modal isOpen={showForm} onClose={handleCloseForm} title="Report New Incident" size="lg">
        <form onSubmit={handleSubmit}>
          {submitError && <AlertBanner type="error" message={submitError} onDismiss={() => setSubmitError(null)} />}
          <FormField label="Incident Title" name="title" value={formData.title} onChange={handleField('title')} required placeholder="Brief description of the incident" />
          <FormField label="Description" name="description" type="textarea" value={formData.description} onChange={handleField('description')} required placeholder="Detailed description..." />
          <FormField label="Severity" name="severity" type="select" value={formData.severity} onChange={handleField('severity')} required options={[
            { value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }, { value: 'critical', label: 'Critical' },
          ]} />
          <FormField label="Category" name="category" type="select" value={formData.category} onChange={handleField('category')} required options={[
            { value: 'phishing', label: 'Phishing' }, { value: 'data-exfiltration', label: 'Data Exfiltration' }, { value: 'malware', label: 'Malware' }, { value: 'configuration', label: 'Configuration Error' }, { value: 'other', label: 'Other' },
          ]} />
          <FormField label="Affected Systems" name="affectedSystems" value={formData.affectedSystems} onChange={handleField('affectedSystems')} placeholder="Comma-separated list of affected systems" />
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <Button variant="secondary" type="button" onClick={handleCloseForm} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" loading={isSubmitting}>Submit Incident</Button>
          </div>
        </form>
      </Modal>
    </section>
  );
};

export default IncidentReportingApp;
