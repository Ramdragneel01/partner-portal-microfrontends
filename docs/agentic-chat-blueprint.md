# Agentic Chat Blueprint — Partner Portal

> Purpose: Define a production-grade, platform-wide Agentic AI chat capability for this micro-frontend architecture with role-aware micro-app context selection and strong Salesforce/RCA integration.

---

## 1. Problem Framing

Your platform already has:
- Shell-level orchestration with micro-app isolation
- Centralized RBAC with module-level route access policy
- Shared API client with tenant and user context headers
- Event bus for cross-app communication

What is missing is a unified conversational layer that can:
- Understand which micro-app contexts a user is allowed to use
- Orchestrate plugin tools across those contexts
- Reliably execute Salesforce and RCA-heavy workflows
- Stream progressive status back to the UI in real time

---

## 2. AI Board of Council Recommendations

### Council Composition
- Enterprise Architect
- Salesforce Integration Architect
- Risk and Compliance Domain Lead
- Security and Privacy Lead
- Platform Reliability Lead
- UX and Accessibility Lead

### Council Consensus (Recommended Direction)
1. Implement chat as a shell-owned platform capability, not as a single remote-owned feature.
2. Use plugin manifests for all domain integrations, including Salesforce and RCA tools.
3. Enforce role-aware context at plugin resolution time using existing module RBAC policy.
4. Use async execution with progress states (`running`, `completed`, `failed`) and SSE-driven UI refresh.
5. Keep user messages durable even if tool execution fails.
6. Introduce policy guards and redaction before any external connector invocation.

---

## 3. Target Capability Model

### Core Capabilities
- Chat workspace with persistent threads
- Role-aware micro-app context picker
- Plugin execution orchestration
- Real-time updates via SSE
- Audit-safe and tenant-isolated execution trail

### Context Selection Model
Users can choose which micro-app contexts to include in a conversation, but only from modules they are authorized to access.

Example context choices (role filtered):
- Risk Assessment
- Compliance
- Audit Management
- Policy Management
- Incident Reporting
- Vendor Risk
- Partner Onboarding

If the user tries to include an unauthorized module, the request is rejected before orchestration.

---

## 4. Reference Architecture (Platform Fit)

### Shell Layer (Frontend)
- Host a chat route (`/hub/chat` and `/hub/chat/:chatId`) in shell
- Provide chat launcher in shell header and optional floating panel
- Use existing auth context and module policy helpers to initialize allowed contexts
- Subscribe to chat-related events for badge and thread refresh

### API and Orchestration Layer
- Chat API service for chats/messages/unread tracking
- Agent orchestrator service for tool planning and execution graph
- Worker queue for long-running plugin calls
- SSE broadcast for `chat.updated` and `task.updated`

### Plugin Layer
- Plugin registry with manifest-based discovery
- Domain plugins for each micro-app context
- Connector plugins for Salesforce and RCA systems
- Policy engine to validate role, tenant, and allowed action before plugin invoke

### Data Layer
- `chats` table with participants and unread metadata
- `chat_messages` table with role/content/metadata/status
- `worker_tasks` table for async execution
- Optional `chat_plugin_runs` table for detailed execution lineage

---

## 5. Role-Based Conscious Awareness Design

### Authorization Inputs
Use existing module access policy as the source of truth and extend with chat permissions:
- `chat:create`
- `chat:read`
- `chat:update`
- `chat:plugin:invoke`

### Effective Context Computation
At message send time:
1. Resolve user role and tenant
2. Resolve role-visible modules from module access policy
3. Intersect with user-selected contexts
4. Enforce plugin-level required roles
5. Build a signed execution context for orchestrator/worker

### Guardrail Rule
No plugin can execute unless:
- Module context is role-authorized
- User has invoke scope
- Tenant policy allows that plugin

---

## 6. Salesforce and RCA Dependency Strategy

### Integration Pattern
Use adapter plugins behind a stable tool contract:
- `salesforce.case.search`
- `salesforce.case.update`
- `salesforce.account.timeline`
- `rca.incident.lookup`
- `rca.control.trace`
- `rca.remediation.recommend`

### Token and Identity
- Prefer user-delegated token passthrough for user-scoped actions
- Use one-time token reference (Redis/secure cache), consume once in worker
- Do not persist raw connector tokens in relational tables

### Reliability
- Add per-plugin timeout budgets
- Circuit breaker for unstable upstream systems
- Retry only idempotent actions
- Dead-letter queue for repeated failures

---

## 7. Security, Privacy, and Compliance Controls

### Required Controls
- Tenant isolation at API and DB policy levels
- Scope checks on chat and plugin endpoints
- Input validation and content sanitization
- Prompt injection defense:
  - context boundary tagging
  - plugin allowlist only
  - command intent classification before action tools
- PII-safe logging with pseudonymous principal IDs
- End-to-end audit trail for every plugin invocation

### Human-in-the-Loop Gates
Require explicit user confirmation for high-risk actions:
- Creating or modifying Salesforce records
- RCA remediation actions with compliance impact

---

## 8. UX Blueprint (High-Value Behavior)

### Interaction Model
- Chat launcher visible globally in shell
- Context chips show active micro-app scopes
- Running assistant responses display progress state
- Error responses provide retry with preserved user text

### Accessibility
- Keyboard-operable context picker, message composer, and thread list
- Live region announcements for assistant updates
- WCAG 2.1 AA contrast and focus indicators

---

## 9. Delivery Plan (Optimal Sequence)

### Phase 1: Foundation
- Create chat data model and API contract
- Add shell routes and base chat UI
- Implement unread count and read tracking

### Phase 2: Async Plugin Flow
- Add placeholder assistant message lifecycle
- Integrate worker task execution and status updates
- Add first domain plugin and one Salesforce read-only plugin

### Phase 3: Role-Aware Context and SSE
- Add role-filtered context selector
- Add SSE updates for list/thread/badges
- Add event correlation and observability dashboards

### Phase 4: Salesforce and RCA Scale-Out
- Add RCA plugin suite
- Add action confirmation workflow
- Add resilience controls (timeouts, circuit breakers, DLQ)

---

## 10. Initial Backlog Suggestions

### Architecture
- Define plugin manifest schema
- Define chat API contract and event envelope
- Define policy engine interfaces

### Frontend
- Add shell chat routes and UI shell integration
- Add context picker and status-aware message components
- Add SSE hooks for chat updates

### Backend
- Implement chats/messages CRUD and unread semantics
- Implement worker task orchestration and placeholder updates
- Implement Salesforce and RCA connector adapters

### Security and Compliance
- Add redaction and audit logging pipeline
- Add prompt injection and action safety checks
- Add threat-model review for connector plugins

---

## 11. Success Metrics

- Time to triage high-severity incidents via chat
- Percentage of role-authorized plugin invocations vs blocked attempts
- Median and P95 plugin response latency
- First-response perceived latency (running placeholder shown quickly)
- Reduction in manual navigation across modules for common RCA workflows

---

## 12. Decisions to Make Next

1. Confirm whether chat is route-based only, widget-based only, or both.
2. Confirm which Salesforce and RCA APIs are Phase 1 read-only targets.
3. Confirm policy model for action approval (always manual vs risk-based auto).
4. Confirm tenancy model for cross-tenant support boundaries.
5. Confirm final plugin manifest schema and registry ownership team.
