
/**
 * Mock Data — Static data for all 7 micro-app domains.
 * Used for development and standalone remote testing.
 */
import {
    RiskAssessment,
    RiskLevel,
    ComplianceFramework,
    ComplianceControl,
    ComplianceStatus,
    AuditPlan,
    AuditStatus,
    AuditFinding,
    Policy,
    PolicyStatus,
    Incident,
    IncidentSeverity,
    IncidentStatus,
    Vendor,
    VendorRiskRating,
    Partner,
    OnboardingStep,
    OnboardingStatus,
} from '@shared/types';

/* ─── Risk Assessment Data ──────────────────────────────────────── */
const risks: RiskAssessment[] = [
    { id: 'RSK-001', title: 'Unpatched production servers', description: 'Critical servers missing latest security patches', category: 'Infrastructure', likelihood: 4, impact: 5, riskScore: 20, riskLevel: RiskLevel.Critical, owner: 'IT Ops Team', mitigationPlan: 'Schedule emergency patching window', status: 'open', dueDate: '2026-04-30', createdBy: 'admin', createdAt: '2026-03-01' },
    { id: 'RSK-002', title: 'Third-party API key exposure', description: 'API keys stored in plain text config files', category: 'Application Security', likelihood: 3, impact: 4, riskScore: 12, riskLevel: RiskLevel.High, owner: 'DevSecOps', mitigationPlan: 'Migrate to Azure Key Vault', status: 'open', dueDate: '2026-05-15', createdBy: 'admin', createdAt: '2026-03-05' },
    { id: 'RSK-003', title: 'Insufficient access logging', description: 'No centralized audit logging for database access', category: 'Data Security', likelihood: 3, impact: 3, riskScore: 9, riskLevel: RiskLevel.Medium, owner: 'DBA Team', mitigationPlan: 'Implement Azure Monitor log analytics', status: 'mitigated', dueDate: '2026-06-01', createdBy: 'admin', createdAt: '2026-02-20' },
    { id: 'RSK-004', title: 'Weak password policy for partners', description: 'Partner accounts allow passwords under 8 characters', category: 'Identity Management', likelihood: 2, impact: 3, riskScore: 6, riskLevel: RiskLevel.Low, owner: 'IAM Team', mitigationPlan: 'Enforce minimum 12-char passwords with MFA', status: 'open', dueDate: '2026-04-20', createdBy: 'admin', createdAt: '2026-03-10' },
    { id: 'RSK-005', title: 'No disaster recovery test plan', description: 'DR plan not tested in over 18 months', category: 'Business Continuity', likelihood: 2, impact: 5, riskScore: 10, riskLevel: RiskLevel.High, owner: 'Infrastructure', mitigationPlan: 'Schedule quarterly DR drills', status: 'open', dueDate: '2026-05-01', createdBy: 'admin', createdAt: '2026-03-15' },
    { id: 'RSK-006', title: 'Manual onboarding bottlenecks', description: 'Partner onboarding still relies on manual triage queues', category: 'Operational', likelihood: 3, impact: 3, riskScore: 9, riskLevel: RiskLevel.Medium, owner: 'Partner Ops', mitigationPlan: 'Introduce automated queue assignment and SLA triggers', status: 'open', dueDate: '2026-05-20', createdBy: 'admin', createdAt: '2026-03-18' },
    { id: 'RSK-007', title: 'Regulatory evidence traceability gaps', description: 'Control evidence links are inconsistent across frameworks', category: 'Regulatory', likelihood: 3, impact: 4, riskScore: 12, riskLevel: RiskLevel.High, owner: 'Compliance Team', mitigationPlan: 'Implement evidence lineage metadata for all control artifacts', status: 'escalated', dueDate: '2026-06-10', createdBy: 'admin', createdAt: '2026-03-22' },
];

/* ─── Compliance Data ───────────────────────────────────────────── */
const frameworks: ComplianceFramework[] = [
    { id: 'FW-001', name: 'SOC 2 Type II', totalControls: 64, compliantControls: 52, nonCompliantControls: 5, inProgressControls: 7, score: 81 },
    { id: 'FW-002', name: 'ISO 27001', totalControls: 114, compliantControls: 98, nonCompliantControls: 8, inProgressControls: 8, score: 86 },
    { id: 'FW-003', name: 'GDPR', totalControls: 42, compliantControls: 38, nonCompliantControls: 2, inProgressControls: 2, score: 90 },
    { id: 'FW-004', name: 'NIST CSF', totalControls: 108, compliantControls: 82, nonCompliantControls: 12, inProgressControls: 14, score: 76 },
];

const controls: ComplianceControl[] = [
    { id: 'CTL-001', frameworkId: 'FW-001', controlId: 'CC6.1', title: 'Logical and Physical Access Controls', description: 'Access restricted to authorized users', status: ComplianceStatus.Compliant, owner: 'IAM Team', evidenceCount: 3, lastAssessedDate: '2026-03-15', createdBy: 'admin', createdAt: '2025-12-01' },
    { id: 'CTL-002', frameworkId: 'FW-001', controlId: 'CC7.2', title: 'System Monitoring', description: 'Monitor for anomalies and incidents', status: ComplianceStatus.NonCompliant, owner: 'SOC Team', evidenceCount: 1, lastAssessedDate: '2026-03-10', createdBy: 'admin', createdAt: '2025-12-01' },
    { id: 'CTL-003', frameworkId: 'FW-002', controlId: 'A.12.4', title: 'Logging and Monitoring', description: 'Event logs shall be produced, retained', status: ComplianceStatus.InProgress, owner: 'IT Ops', evidenceCount: 2, lastAssessedDate: '2026-03-20', createdBy: 'admin', createdAt: '2025-12-15' },
    { id: 'CTL-004', frameworkId: 'FW-003', controlId: 'GDPR-7.1', title: 'Data Subject Access Request Workflow', description: 'DSAR workflow should meet statutory response timelines', status: ComplianceStatus.NotAssessed, owner: 'Privacy Office', evidenceCount: 0, lastAssessedDate: '2026-02-27', createdBy: 'admin', createdAt: '2026-01-11' },
    { id: 'CTL-005', frameworkId: 'FW-004', controlId: 'PR.AC-1', title: 'Identity and Credential Management', description: 'Identity lifecycle should be enforced with least privilege', status: ComplianceStatus.Compliant, owner: 'IAM Team', evidenceCount: 4, lastAssessedDate: '2026-03-25', createdBy: 'admin', createdAt: '2026-01-22' },
];

/* ─── Audit Data ────────────────────────────────────────────────── */
const audits: AuditPlan[] = [
    { id: 'AUD-001', title: 'Q1 2026 Internal Security Audit', scope: 'Infrastructure and application security', status: AuditStatus.Completed, startDate: '2026-01-15', endDate: '2026-03-01', leadAuditor: 'Sarah Chen', findingsCount: 8, createdBy: 'admin', createdAt: '2026-01-01' },
    { id: 'AUD-002', title: 'SOC 2 Type II Annual Audit', scope: 'All trust service criteria', status: AuditStatus.InProgress, startDate: '2026-03-01', endDate: '2026-06-30', leadAuditor: 'External - Deloitte', findingsCount: 3, createdBy: 'admin', createdAt: '2026-02-15' },
    { id: 'AUD-003', title: 'Partner Data Handling Review', scope: 'Data processing and storage practices', status: AuditStatus.Planned, startDate: '2026-05-01', endDate: '2026-06-15', leadAuditor: 'Mike Johnson', findingsCount: 0, createdBy: 'admin', createdAt: '2026-03-20' },
];

const findings: AuditFinding[] = [
    { id: 'FND-001', auditPlanId: 'AUD-001', title: 'Excessive admin privileges', description: '12 users have unnecessary admin access', severity: RiskLevel.High, owner: 'IAM Team', remediationStatus: 'in-progress', dueDate: '2026-04-15', createdBy: 'admin', createdAt: '2026-02-20' },
    { id: 'FND-002', auditPlanId: 'AUD-001', title: 'Missing encryption at rest', description: 'Database backups not encrypted', severity: RiskLevel.Critical, owner: 'DBA Team', remediationStatus: 'open', dueDate: '2026-04-01', createdBy: 'admin', createdAt: '2026-02-22' },
    { id: 'FND-003', auditPlanId: 'AUD-002', title: 'Incomplete change management logs', description: 'Some production changes not documented', severity: RiskLevel.Medium, owner: 'DevOps', remediationStatus: 'in-progress', dueDate: '2026-05-01', createdBy: 'admin', createdAt: '2026-03-10' },
];

/* ─── Policy Data ───────────────────────────────────────────────── */
const policies: Policy[] = [
    { id: 'POL-001', title: 'Information Security Policy', category: 'Security', status: PolicyStatus.Published, version: '3.1', owner: 'CISO', approver: 'CTO', effectiveDate: '2026-01-01', reviewDate: '2027-01-01', summary: 'Establishes the overall security framework and responsibilities.', createdBy: 'admin', createdAt: '2025-11-01' },
    { id: 'POL-002', title: 'Acceptable Use Policy', category: 'HR/IT', status: PolicyStatus.Published, version: '2.0', owner: 'HR Director', approver: 'CIO', effectiveDate: '2026-02-01', reviewDate: '2027-02-01', summary: 'Defines acceptable use of company IT resources.', createdBy: 'admin', createdAt: '2025-12-01' },
    { id: 'POL-003', title: 'Data Classification Standard', category: 'Data', status: PolicyStatus.UnderReview, version: '1.2-draft', owner: 'Data Protection Officer', approver: 'CISO', effectiveDate: '', reviewDate: '', summary: 'Defines data classification levels and handling requirements.', createdBy: 'admin', createdAt: '2026-02-15' },
    { id: 'POL-004', title: 'Incident Response Plan', category: 'Security', status: PolicyStatus.Draft, version: '0.9', owner: 'SOC Manager', approver: 'CISO', effectiveDate: '', reviewDate: '', summary: 'Procedures for detecting, responding, and recovering from incidents.', createdBy: 'admin', createdAt: '2026-03-01' },
];

/* ─── Incident Data ─────────────────────────────────────────────── */
const incidents: Incident[] = [
    { id: 'INC-001', title: 'Phishing attack on partner accounts', description: 'Multiple partners reported phishing emails mimicking portal login', severity: IncidentSeverity.High, status: IncidentStatus.Investigating, category: 'Phishing', affectedSystems: ['Partner Portal', 'Email'], reporter: 'SOC Analyst', assignee: 'Security Team', reportedAt: '2026-04-01T09:15:00Z', createdBy: 'admin', createdAt: '2026-04-01' },
    { id: 'INC-002', title: 'Unauthorized data export attempt', description: 'Anomalous bulk data export detected from internal user', severity: IncidentSeverity.Critical, status: IncidentStatus.Mitigated, category: 'Data Exfiltration', affectedSystems: ['CRM', 'Data Warehouse'], reporter: 'SIEM Alert', assignee: 'DLP Team', reportedAt: '2026-03-28T14:30:00Z', createdBy: 'admin', createdAt: '2026-03-28' },
    { id: 'INC-003', title: 'SSL certificate expiry on API gateway', description: 'Certificate for api.portal.com expired causing 503 errors', severity: IncidentSeverity.Medium, status: IncidentStatus.Resolved, category: 'Configuration', affectedSystems: ['API Gateway'], reporter: 'Monitoring', assignee: 'Infrastructure', reportedAt: '2026-03-25T08:00:00Z', resolvedAt: '2026-03-25T10:30:00Z', createdBy: 'admin', createdAt: '2026-03-25' },
    { id: 'INC-004', title: 'Privilege misuse detected in support account', description: 'Support role accessed restricted policy artifacts', severity: IncidentSeverity.High, status: IncidentStatus.Open, category: 'Access Control', affectedSystems: ['Policy Service'], reporter: 'UEBA Alert', assignee: 'Identity Team', reportedAt: '2026-04-05T11:20:00Z', createdBy: 'admin', createdAt: '2026-04-05' },
    { id: 'INC-005', title: 'Suspicious endpoint malware activity', description: 'Endpoint telemetry indicates potential credential theft attempt', severity: IncidentSeverity.Low, status: IncidentStatus.Closed, category: 'Malware', affectedSystems: ['Endpoint Fleet'], reporter: 'EDR', assignee: 'SOC L2', reportedAt: '2026-03-21T06:10:00Z', resolvedAt: '2026-03-22T18:00:00Z', createdBy: 'admin', createdAt: '2026-03-21' },
];

/* ─── Vendor Data ───────────────────────────────────────────────── */
const vendors: Vendor[] = [
    { id: 'VND-001', name: 'CloudSecure Inc.', category: 'Cloud Infrastructure', riskRating: VendorRiskRating.Low, riskScore: 22, lastAssessmentDate: '2026-03-01', contractExpiry: '2027-06-30', contactEmail: 'security@cloudsecure.com', status: 'active', createdBy: 'admin', createdAt: '2025-06-01' },
    { id: 'VND-002', name: 'DataFlow Analytics', category: 'Data Processing', riskRating: VendorRiskRating.Medium, riskScore: 55, lastAssessmentDate: '2026-02-15', contractExpiry: '2026-12-31', contactEmail: 'compliance@dataflow.io', status: 'active', createdBy: 'admin', createdAt: '2025-08-15' },
    { id: 'VND-003', name: 'QuickPay Solutions', category: 'Payment Processing', riskRating: VendorRiskRating.High, riskScore: 78, lastAssessmentDate: '2026-01-20', contractExpiry: '2026-09-30', contactEmail: 'security@quickpay.com', status: 'under-review', createdBy: 'admin', createdAt: '2025-03-01' },
    { id: 'VND-004', name: 'TalentHub HR', category: 'HR Services', riskRating: VendorRiskRating.Low, riskScore: 18, lastAssessmentDate: '2026-03-10', contractExpiry: '2027-03-31', contactEmail: 'privacy@talenthub.com', status: 'active', createdBy: 'admin', createdAt: '2025-09-01' },
    { id: 'VND-005', name: 'Northbridge Logistics', category: 'Logistics', riskRating: VendorRiskRating.Medium, riskScore: 49, lastAssessmentDate: '2026-03-12', contractExpiry: '2026-11-15', contactEmail: 'security@northbridge-logistics.com', status: 'inactive', createdBy: 'admin', createdAt: '2025-10-02' },
    { id: 'VND-006', name: 'LegalCore Advisors', category: 'Legal', riskRating: VendorRiskRating.High, riskScore: 71, lastAssessmentDate: '2026-02-28', contractExpiry: '2027-01-30', contactEmail: 'risk@legalcoreadvisors.com', status: 'under-review', createdBy: 'admin', createdAt: '2025-07-12' },
];

/* ─── Partner Onboarding Data ───────────────────────────────────── */
const partners: Partner[] = [
    { id: 'PTR-001', companyName: 'Acme Global Solutions', contactName: 'John Smith', contactEmail: 'john@acmeglobal.com', industry: 'Financial Services', country: 'United States', currentStep: OnboardingStep.Approval, status: OnboardingStatus.PendingApproval, submittedAt: '2026-03-20', createdBy: 'admin', createdAt: '2026-03-15' },
    { id: 'PTR-002', companyName: 'EuroTech GmbH', contactName: 'Hans Mueller', contactEmail: 'hans@eurotech.de', industry: 'Technology', country: 'Germany', currentStep: OnboardingStep.ComplianceAttestation, status: OnboardingStatus.InProgress, createdBy: 'admin', createdAt: '2026-03-22' },
    { id: 'PTR-003', companyName: 'Asia Pacific Trading', contactName: 'Li Wei', contactEmail: 'li.wei@aptrade.com', industry: 'Retail', country: 'Singapore', currentStep: OnboardingStep.KycDocuments, status: OnboardingStatus.InProgress, createdBy: 'admin', createdAt: '2026-04-01' },
    { id: 'PTR-004', companyName: 'Nordic Consulting AB', contactName: 'Erik Svensson', contactEmail: 'erik@nordicconsulting.se', industry: 'Consulting', country: 'Sweden', currentStep: OnboardingStep.CompanyInfo, status: OnboardingStatus.Approved, submittedAt: '2026-02-10', approvedAt: '2026-02-28', createdBy: 'admin', createdAt: '2026-02-01' },
    { id: 'PTR-005', companyName: 'BlueRiver Health Ltd.', contactName: 'Maya Carter', contactEmail: 'maya.carter@blueriverhealth.com', industry: 'Healthcare', country: 'United Kingdom', currentStep: OnboardingStep.Review, status: OnboardingStatus.PendingApproval, submittedAt: '2026-04-04', createdBy: 'admin', createdAt: '2026-03-29' },
    { id: 'PTR-006', companyName: 'Vertex Retail Group', contactName: 'Noah Ortiz', contactEmail: 'noah.ortiz@vertexretail.com', industry: 'Retail', country: 'Canada', currentStep: OnboardingStep.Approval, status: OnboardingStatus.Rejected, submittedAt: '2026-03-16', createdBy: 'admin', createdAt: '2026-03-11' },
];

/* ─── Scalable Mock Data Presets ────────────────────────────────── */

// Generated by GitHub Copilot
type MockScalePreset = 'small' | '10k' | '100k' | '600k' | '1m' | '2m';

interface MockDataset {
    readonly risks: RiskAssessment[];
    readonly frameworks: ComplianceFramework[];
    readonly controls: ComplianceControl[];
    readonly audits: AuditPlan[];
    readonly findings: AuditFinding[];
    readonly policies: Policy[];
    readonly incidents: Incident[];
    readonly vendors: Vendor[];
    readonly partners: Partner[];
}

const SCALE_PRESET_RECORDS_PER_DOMAIN: Record<MockScalePreset, number> = {
    small: 0,
    '10k': 10_000,
    '100k': 100_000,
    '600k': 600_000,
    '1m': 1_000_000,
    '2m': 2_000_000,
};

const COMPILED_RUNTIME_ENV: Record<string, string | undefined> = {
    USE_MOCK_AUTH: typeof process !== 'undefined' ? process.env.USE_MOCK_AUTH : undefined,
    USE_MOCK_DATA: typeof process !== 'undefined' ? process.env.USE_MOCK_DATA : undefined,
    MOCK_DATA_SCALE: typeof process !== 'undefined' ? process.env.MOCK_DATA_SCALE : undefined,
    MOCK_DATA_SEED: typeof process !== 'undefined' ? process.env.MOCK_DATA_SEED : undefined,
};


/**
 * Reads the first non-empty env value from the provided keys.
 * Supports transition from legacy and VITE-style environment names.
 */
function readRuntimeEnv(keys: string[], fallback: string): string {
    const runtimeEnv = (globalThis as { __PARTNER_PORTAL_ENV__?: Record<string, string | undefined> }).__PARTNER_PORTAL_ENV__;

    for (const key of keys) {
        const normalizedKey = key.startsWith('VITE_') ? key.slice(5) : key;
        const value = runtimeEnv?.[key]
            ?? runtimeEnv?.[normalizedKey]
            ?? COMPILED_RUNTIME_ENV[key]
            ?? COMPILED_RUNTIME_ENV[normalizedKey];

        if (typeof value === 'string' && value.trim() !== '') {
            return value.trim();
        }
    }

    return fallback;
}


/**
 * Parses the mock scale preset value from environment variables.
 */
function readScalePreset(): MockScalePreset {
    const raw = readRuntimeEnv(['MOCK_DATA_SCALE', 'VITE_MOCK_DATA_SCALE'], 'small').toLowerCase();
    if (Object.prototype.hasOwnProperty.call(SCALE_PRESET_RECORDS_PER_DOMAIN, raw)) {
        return raw as MockScalePreset;
    }
    return 'small';
}


/**
 * Builds deterministic dates for generated records.
 */
function buildDate(index: number): string {
    const month = String((index % 12) + 1).padStart(2, '0');
    const day = String((index % 28) + 1).padStart(2, '0');
    return `2026-${month}-${day}`;
}


/**
 * Produces stable pseudo-random values for repeatable local datasets.
 */
function seededNumber(index: number, modulo: number, seed: number): number {
    return Math.abs((index * 9301 + seed * 49297 + 233280) % modulo);
}


/**
 * Repeats and transforms a base dataset up to a target count.
 */
function expandRecords<T>(
    source: readonly T[],
    targetCount: number,
    transform: (template: T, index: number) => T,
): T[] {
    if (targetCount <= source.length) {
        return [...source];
    }

    const output = new Array<T>(targetCount);
    for (let i = 0; i < targetCount; i += 1) {
        output[i] = transform(source[i % source.length], i);
    }
    return output;
}


/**
 * Converts numeric risk score to risk level.
 */
function scoreToRiskLevel(score: number): RiskLevel {
    if (score >= 15) return RiskLevel.Critical;
    if (score >= 10) return RiskLevel.High;
    if (score >= 5) return RiskLevel.Medium;
    return RiskLevel.Low;
}

const mockScalePreset = readScalePreset();
const mockSeed = Number.parseInt(readRuntimeEnv(['MOCK_DATA_SEED', 'VITE_MOCK_DATA_SEED'], '42'), 10) || 42;
const scaledRecordsPerDomain = SCALE_PRESET_RECORDS_PER_DOMAIN[mockScalePreset];


/**
 * Computes per-domain record counts from the selected scale preset.
 */
function countForDomain(baseCount: number): number {
    if (scaledRecordsPerDomain === 0) {
        return baseCount;
    }
    return Math.max(baseCount, scaledRecordsPerDomain);
}


/**
 * Builds scaled risk records used by large local datasets.
 */
function buildRisks(): RiskAssessment[] {
    const target = countForDomain(risks.length);
    return expandRecords(risks, target, (template, index) => {
        const likelihood = (seededNumber(index, 5, mockSeed) % 5) + 1;
        const impact = (seededNumber(index + 7, 5, mockSeed) % 5) + 1;
        const riskScore = likelihood * impact;
        const statuses: RiskAssessment['status'][] = ['open', 'mitigated', 'accepted', 'closed', 'escalated', 'approved'];
        return {
            ...template,
            id: `RSK-${String(index + 1).padStart(6, '0')}`,
            title: `${template.title} #${index + 1}`,
            likelihood,
            impact,
            riskScore,
            riskLevel: scoreToRiskLevel(riskScore),
            status: statuses[seededNumber(index, statuses.length, mockSeed)],
            dueDate: buildDate(index),
            createdAt: buildDate(index + 3),
        };
    });
}

/**
 * Builds scaled compliance framework records.
 */
// Generated by GitHub Copilot
function buildFrameworks(): ComplianceFramework[] {
    const target = countForDomain(frameworks.length);
    return expandRecords(frameworks, target, (template, index) => {
        const totalControls = (seededNumber(index, 160, mockSeed) % 160) + 40;
        const nonCompliantControls = seededNumber(index + 1, Math.max(2, Math.floor(totalControls * 0.2)), mockSeed);
        const inProgressControls = seededNumber(index + 2, Math.max(2, Math.floor(totalControls * 0.15)), mockSeed);
        const compliantControls = Math.max(0, totalControls - nonCompliantControls - inProgressControls);
        const score = Math.round((compliantControls / totalControls) * 100);

        return {
            ...template,
            id: `FW-${String(index + 1).padStart(6, '0')}`,
            name: `${template.name} ${index + 1}`,
            totalControls,
            compliantControls,
            nonCompliantControls,
            inProgressControls,
            score,
        };
    });
}


/**
 * Builds scaled compliance controls.
 */
function buildControls(): ComplianceControl[] {
    const target = countForDomain(controls.length);
    const statuses: ComplianceStatus[] = [ComplianceStatus.Compliant, ComplianceStatus.InProgress, ComplianceStatus.NonCompliant, ComplianceStatus.NotAssessed];
    return expandRecords(controls, target, (template, index) => ({
        ...template,
        id: `CTL-${String(index + 1).padStart(6, '0')}`,
        controlId: `CC${(index % 12) + 1}.${(index % 9) + 1}`,
        title: `${template.title} #${index + 1}`,
        status: statuses[seededNumber(index, statuses.length, mockSeed)],
        evidenceCount: (seededNumber(index, 7, mockSeed) % 6) + 1,
        lastAssessedDate: buildDate(index + 11),
        createdAt: buildDate(index + 2),
    }));
}


/**
 * Builds scaled audit plans.
 */
function buildAudits(): AuditPlan[] {
    const target = countForDomain(audits.length);
    const statuses: AuditStatus[] = [AuditStatus.Planned, AuditStatus.InProgress, AuditStatus.Completed, AuditStatus.Closed];
    return expandRecords(audits, target, (template, index) => ({
        ...template,
        id: `AUD-${String(index + 1).padStart(6, '0')}`,
        title: `${template.title} #${index + 1}`,
        status: statuses[seededNumber(index, statuses.length, mockSeed)],
        startDate: buildDate(index + 1),
        endDate: buildDate(index + 21),
        findingsCount: seededNumber(index, 15, mockSeed),
        createdAt: buildDate(index + 5),
    }));
}


/**
 * Builds scaled audit findings.
 */
function buildFindings(): AuditFinding[] {
    const target = countForDomain(findings.length);
    const remediationStates: AuditFinding['remediationStatus'][] = ['open', 'in-progress', 'resolved', 'risk-accepted'];
    const severities: RiskLevel[] = [RiskLevel.Critical, RiskLevel.High, RiskLevel.Medium, RiskLevel.Low];
    return expandRecords(findings, target, (template, index) => ({
        ...template,
        id: `FND-${String(index + 1).padStart(6, '0')}`,
        auditPlanId: `AUD-${String((index % Math.max(1, countForDomain(audits.length))) + 1).padStart(6, '0')}`,
        title: `${template.title} #${index + 1}`,
        severity: severities[seededNumber(index, severities.length, mockSeed)],
        remediationStatus: remediationStates[seededNumber(index, remediationStates.length, mockSeed)],
        dueDate: buildDate(index + 9),
        createdAt: buildDate(index + 4),
    }));
}


/**
 * Builds scaled policy records.
 */
function buildPolicies(): Policy[] {
    const target = countForDomain(policies.length);
    const statuses: PolicyStatus[] = [PolicyStatus.Draft, PolicyStatus.UnderReview, PolicyStatus.Approved, PolicyStatus.Published, PolicyStatus.Archived];
    return expandRecords(policies, target, (template, index) => ({
        ...template,
        id: `POL-${String(index + 1).padStart(6, '0')}`,
        title: `${template.title} #${index + 1}`,
        status: statuses[seededNumber(index, statuses.length, mockSeed)],
        version: `1.${index % 10}`,
        effectiveDate: buildDate(index + 2),
        reviewDate: buildDate(index + 62),
        createdAt: buildDate(index + 1),
    }));
}


/**
 * Builds scaled incident records.
 */
function buildIncidents(): Incident[] {
    const target = countForDomain(incidents.length);
    const severities: IncidentSeverity[] = [IncidentSeverity.Critical, IncidentSeverity.High, IncidentSeverity.Medium, IncidentSeverity.Low];
    const statuses: IncidentStatus[] = [IncidentStatus.Open, IncidentStatus.Investigating, IncidentStatus.Mitigated, IncidentStatus.Resolved, IncidentStatus.Closed];
    return expandRecords(incidents, target, (template, index) => ({
        ...template,
        id: `INC-${String(index + 1).padStart(6, '0')}`,
        title: `${template.title} #${index + 1}`,
        severity: severities[seededNumber(index, severities.length, mockSeed)],
        status: statuses[seededNumber(index, statuses.length, mockSeed)],
        reportedAt: `${buildDate(index)}T09:15:00Z`,
        resolvedAt: seededNumber(index, 5, mockSeed) > 2 ? `${buildDate(index + 1)}T10:30:00Z` : undefined,
        createdAt: buildDate(index),
    }));
}


/**
 * Builds scaled vendor records.
 */
function buildVendors(): Vendor[] {
    const target = countForDomain(vendors.length);
    const ratings: VendorRiskRating[] = [VendorRiskRating.High, VendorRiskRating.Medium, VendorRiskRating.Low];
    const statuses: Vendor['status'][] = ['active', 'inactive', 'under-review'];
    return expandRecords(vendors, target, (template, index) => {
        const riskScore = seededNumber(index, 100, mockSeed) + 1;
        return {
            ...template,
            id: `VND-${String(index + 1).padStart(6, '0')}`,
            name: `${template.name} ${index + 1}`,
            riskRating: ratings[seededNumber(index, ratings.length, mockSeed)],
            riskScore,
            status: statuses[seededNumber(index, statuses.length, mockSeed)],
            lastAssessmentDate: buildDate(index + 8),
            contractExpiry: buildDate(index + 120),
            createdAt: buildDate(index + 3),
        };
    });
}


/**
 * Builds scaled partner onboarding records.
 */
function buildPartners(): Partner[] {
    const target = countForDomain(partners.length);
    const steps: OnboardingStep[] = [
        OnboardingStep.CompanyInfo,
        OnboardingStep.KycDocuments,
        OnboardingStep.ComplianceAttestation,
        OnboardingStep.Review,
        OnboardingStep.Approval,
    ];
    const statuses: OnboardingStatus[] = [
        OnboardingStatus.NotStarted,
        OnboardingStatus.InProgress,
        OnboardingStatus.PendingApproval,
        OnboardingStatus.Approved,
        OnboardingStatus.Rejected,
    ];

    return expandRecords(partners, target, (template, index) => ({
        ...template,
        id: `PTR-${String(index + 1).padStart(6, '0')}`,
        companyName: `${template.companyName} ${index + 1}`,
        contactEmail: `partner${index + 1}@example.com`,
        currentStep: steps[seededNumber(index, steps.length, mockSeed)],
        status: statuses[seededNumber(index, statuses.length, mockSeed)],
        submittedAt: buildDate(index + 13),
        approvedAt: seededNumber(index, 4, mockSeed) === 0 ? buildDate(index + 16) : undefined,
        createdAt: buildDate(index + 6),
    }));
}

const datasetCache: Partial<Record<keyof MockDataset, unknown[]>> = {};


/**
 * Lazily builds and caches a scaled dataset only when first accessed.
 */
function getDataset<K extends keyof MockDataset>(key: K, factory: () => MockDataset[K]): MockDataset[K] {
    const cached = datasetCache[key] as MockDataset[K] | undefined;
    if (cached) {
        return cached;
    }

    const value = factory();
    datasetCache[key] = value as unknown[];
    return value;
}

/* ─── Export All Mock Data ──────────────────────────────────────── */
export const mockData: MockDataset = {
    get risks() {
        return getDataset('risks', buildRisks);
    },
    get frameworks() {
        return getDataset('frameworks', buildFrameworks);
    },
    get controls() {
        return getDataset('controls', buildControls);
    },
    get audits() {
        return getDataset('audits', buildAudits);
    },
    get findings() {
        return getDataset('findings', buildFindings);
    },
    get policies() {
        return getDataset('policies', buildPolicies);
    },
    get incidents() {
        return getDataset('incidents', buildIncidents);
    },
    get vendors() {
        return getDataset('vendors', buildVendors);
    },
    get partners() {
        return getDataset('partners', buildPartners);
    },
};

export const mockDataPreset = mockScalePreset;
