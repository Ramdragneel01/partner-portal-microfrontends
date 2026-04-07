# Documentation

> Architecture documentation, decision records, and roadmap for the Partner Portal platform.

---

## Contents

| Document | Purpose |
|----------|---------|| [Getting Started](GETTING-STARTED.md) | Clone, install, run — onboarding guide for new developers || [Architecture Decisions](architecture-decisions.md) | Key architectural decisions and rationale |
| [Roadmap](roadmap.md) | Phased plan for Oscar-inspired architecture enhancements |

---

## Related Docs

| File | Location | Purpose |
|------|----------|---------|
| [ARCHITECTURE.md](../ARCHITECTURE.md) | Root | Full system architecture reference |
| [CONTRIBUTING.md](../CONTRIBUTING.md) | Root | Development guidelines and PR checklist |
| [README.md](../README.md) | Root | Quick start and overview |

---

## Architecture Quick Reference

- **Pattern**: Micro-Frontend with Module Federation
- **Host**: Shell on port 4200
- **Remotes**: 7 domain apps on ports 4201–4207
- **Shared**: 5 libraries (`@shared/types|auth|ui-components|api-client|event-bus`)
- **Build**: Nx 22 monorepo with Webpack 5
- **Framework**: React 19 + TypeScript 5.9
