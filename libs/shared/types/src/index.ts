
/**
 * Shared Types Library — Domain models and common types for the Partner Portal.
 * @module @shared/types
 */

// Config-driven UI types (README §8)
export * from './view-config';

/* ─── Common Enums ──────────────────────────────────────────────── */

export enum UserRole {
  Admin = 'admin',
  Partner = 'partner',
  Auditor = 'auditor',
  ComplianceOfficer = 'compliance-officer',
  Viewer = 'viewer',
}

export enum RiskLevel {
  Critical = 'critical',
  High = 'high',
  Medium = 'medium',
  Low = 'low',
  Info = 'info',
}

export enum ComplianceStatus {
  Compliant = 'compliant',
  NonCompliant = 'non-compliant',
  InProgress = 'in-progress',
  NotAssessed = 'not-assessed',
}

export enum AuditStatus {
  Planned = 'planned',
  InProgress = 'in-progress',
  Completed = 'completed',
  Closed = 'closed',
}

export enum PolicyStatus {
  Draft = 'draft',
  UnderReview = 'under-review',
  Approved = 'approved',
  Published = 'published',
  Archived = 'archived',
}

export enum IncidentSeverity {
  Critical = 'critical',
  High = 'high',
  Medium = 'medium',
  Low = 'low',
}

export enum IncidentStatus {
  Open = 'open',
  Investigating = 'investigating',
  Mitigated = 'mitigated',
  Resolved = 'resolved',
  Closed = 'closed',
}

export enum VendorRiskRating {
  High = 'high',
  Medium = 'medium',
  Low = 'low',
}

export enum OnboardingStep {
  CompanyInfo = 'company-info',
  KycDocuments = 'kyc-documents',
  ComplianceAttestation = 'compliance-attestation',
  Review = 'review',
  Approval = 'approval',
}

export enum OnboardingStatus {
  NotStarted = 'not-started',
  InProgress = 'in-progress',
  PendingApproval = 'pending-approval',
  Approved = 'approved',
  Rejected = 'rejected',
}

/* ─── Common Types ──────────────────────────────────────────────── */

export interface User {
  id: string;
  displayName: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AuditMeta {
  createdBy: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
}

/* ─── Risk Assessment Models ────────────────────────────────────── */

export interface RiskAssessment extends AuditMeta {
  id: string;
  title: string;
  description: string;
  category: string;
  likelihood: number; // 1-5
  impact: number; // 1-5
  riskScore: number; // likelihood × impact
  riskLevel: RiskLevel;
  owner: string;
  mitigationPlan: string;
  status: 'open' | 'mitigated' | 'accepted' | 'closed';
  dueDate: string;
}

/* ─── Compliance Models ─────────────────────────────────────────── */

export interface ComplianceFramework {
  id: string;
  name: string; // SOC2, ISO 27001, GDPR, etc.
  totalControls: number;
  compliantControls: number;
  nonCompliantControls: number;
  inProgressControls: number;
  score: number; // 0-100
}

export interface ComplianceControl extends AuditMeta {
  id: string;
  frameworkId: string;
  controlId: string;
  title: string;
  description: string;
  status: ComplianceStatus;
  owner: string;
  evidenceCount: number;
  lastAssessedDate: string;
}

/* ─── Audit Models ──────────────────────────────────────────────── */

export interface AuditPlan extends AuditMeta {
  id: string;
  title: string;
  scope: string;
  status: AuditStatus;
  startDate: string;
  endDate: string;
  leadAuditor: string;
  findingsCount: number;
}

export interface AuditFinding extends AuditMeta {
  id: string;
  auditPlanId: string;
  title: string;
  description: string;
  severity: RiskLevel;
  owner: string;
  remediationStatus: 'open' | 'in-progress' | 'resolved' | 'risk-accepted';
  dueDate: string;
}

/* ─── Policy Models ─────────────────────────────────────────────── */

export interface Policy extends AuditMeta {
  id: string;
  title: string;
  category: string;
  status: PolicyStatus;
  version: string;
  owner: string;
  approver: string;
  effectiveDate: string;
  reviewDate: string;
  summary: string;
}

/* ─── Incident Models ───────────────────────────────────────────── */

export interface Incident extends AuditMeta {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  category: string;
  affectedSystems: string[];
  reporter: string;
  assignee: string;
  reportedAt: string;
  resolvedAt?: string;
}

/* ─── Vendor Risk Models ────────────────────────────────────────── */

export interface Vendor extends AuditMeta {
  id: string;
  name: string;
  category: string;
  riskRating: VendorRiskRating;
  riskScore: number; // 0-100
  lastAssessmentDate: string;
  contractExpiry: string;
  contactEmail: string;
  status: 'active' | 'inactive' | 'under-review';
}

/* ─── Partner Onboarding Models ─────────────────────────────────── */

export interface Partner extends AuditMeta {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  industry: string;
  country: string;
  currentStep: OnboardingStep;
  status: OnboardingStatus;
  submittedAt?: string;
  approvedAt?: string;
}

/* ─── Navigation Types ──────────────────────────────────────────── */

export interface NavItem {
  key: string;
  label: string;
  path: string;
  icon: string;
  roles: UserRole[];
  children?: NavItem[];
}
