---
description: "Use when building or updating config-driven dashboard views and KPI cards. Enforces consistent JSON UX syntax, KPI semantics, layout rules, and accessibility expectations."
applyTo: "**/*.{json,md,ts,tsx}"
---

# Config-Driven View + KPI Authoring Instructions

## Goal
Create reusable, predictable, and accessible view configurations where UI behavior comes from JSON config, not ad-hoc JSX.

## Default Authoring Pattern
Use this order every time:
1. Define view-level metadata (`id`, `tenantId`, `title`, optional `description`).
2. Define layout first (`grid`, `stack`, or `tab`) with explicit component IDs.
3. Define `components[]` as reusable objects.
4. Attach `dataSource` and `dataBinding` per component (or at view level).
5. Add actions only after data + layout are stable.

## KPI JSON UX Contract
For all `type: "kpi"` components, use this canonical shape:

- Required:
  - `id`: unique stable identifier.
  - `type`: must be `"kpi"`.
  - `title`: KPI label shown in UI.
  - `props.value`: main metric value (string or number).

- Preferred trend fields:
  - `props.trend`: `"up" | "down" | "neutral"`.
  - `props.trendValue`: optional value/percent/time delta (example: `"+8%"`, `"-0.7m"`).

- Backward-compatible trend fields:
  - `props.change`: legacy trend text.
  - `props.changeType`: `"positive" | "negative" | "neutral"`.

- Icon field:
  - `props.icon` can be either a named icon key or a raw glyph string.
  - Supported named keys: `SecurityIcon`, `SpeedIcon`, `CheckCircleIcon`, `WarningIcon`, `TrendingUpIcon`, `PeopleIcon`.

## UI/UX Consistency Rules
- Keep KPI cards in a 12-column grid and use equal width for sibling KPIs.
- Prefer one semantic unit per KPI (`count`, `percent`, `minutes`, `currency`).
- Never rely on color alone for trend direction; include trend text or arrow.
- Keep KPI titles as nouns and nouns phrases (object-first/OOUX style).
- Use deterministic IDs (`kpi-<domain>-<metric>`).

## Security, A11y, and Efficiency Rules
- Do not embed executable logic in config values.
- Keep API paths explicit and least-privilege.
- Avoid duplicate data source calls when one endpoint can serve multiple KPIs.
- Ensure each KPI still communicates meaning without icon rendering.

## Canonical JSON UX Template
Use this as the default baseline when creating KPI-driven views.

```json
{
  "id": "incident-kpi-overview",
  "tenantId": "DEFAULT",
  "title": "Incident KPI Overview",
  "description": "Operational KPI snapshot for incident response and team health.",
  "layout": {
    "type": "grid",
    "rows": [
      {
        "columns": [
          { "size": 2, "children": [{ "type": "component", "id": "kpi-total-incidents" }] },
          { "size": 2, "children": [{ "type": "component", "id": "kpi-response-time" }] },
          { "size": 2, "children": [{ "type": "component", "id": "kpi-resolved-today" }] },
          { "size": 2, "children": [{ "type": "component", "id": "kpi-open-critical" }] },
          { "size": 2, "children": [{ "type": "component", "id": "kpi-team-performance" }] },
          { "size": 2, "children": [{ "type": "component", "id": "kpi-active-users" }] }
        ]
      }
    ]
  },
  "components": [
    {
      "id": "kpi-total-incidents",
      "type": "kpi",
      "title": "Total Incidents",
      "props": {
        "value": "1,234",
        "trend": "up",
        "icon": "SecurityIcon"
      }
    },
    {
      "id": "kpi-response-time",
      "type": "kpi",
      "title": "Response Time",
      "props": {
        "value": "2.5m",
        "trend": "down",
        "icon": "SpeedIcon"
      }
    },
    {
      "id": "kpi-resolved-today",
      "type": "kpi",
      "title": "Resolved Today",
      "props": {
        "value": 45,
        "trend": "up",
        "icon": "CheckCircleIcon"
      }
    },
    {
      "id": "kpi-open-critical",
      "type": "kpi",
      "title": "Open Critical",
      "props": {
        "value": 3,
        "icon": "WarningIcon"
      }
    },
    {
      "id": "kpi-team-performance",
      "type": "kpi",
      "title": "Team Performance",
      "props": {
        "value": "94%",
        "trend": "up",
        "icon": "TrendingUpIcon"
      }
    },
    {
      "id": "kpi-active-users",
      "type": "kpi",
      "title": "Active Users",
      "props": {
        "value": 567,
        "trend": "up"
      }
    }
  ]
}
```

## Acceptance Checklist
- Uses only supported component types and valid layout nodes.
- Every layout `component.id` exists in `components[]`.
- KPI cards use canonical fields (`value`, `trend`, optional `trendValue`, optional `icon`).
- IDs and titles are stable and business-readable.
- View remains understandable with icons disabled.
