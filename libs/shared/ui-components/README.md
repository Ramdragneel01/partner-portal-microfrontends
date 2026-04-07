# @shared/ui-components — Design System

> WCAG 2.1 AA compliant design system with 11 reusable components.
> All micro-apps must use these components — never build custom base components.

---

## Import

```typescript
import { Button, Card, DataTable, Modal, StatCard, StatusBadge } from '@shared/ui-components';
```

---

## Component Catalog

### Button

Interactive button with loading state support.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'danger' \| 'ghost'` | `'primary'` | Visual style |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| `loading` | `boolean` | `false` | Shows loading spinner, disables interaction |
| `disabled` | `boolean` | `false` | Disables the button |
| `onClick` | `() => void` | — | Click handler |
| `children` | `ReactNode` | — | Button content |

**Accessibility**: Native `<button>` element, `aria-busy` when loading.

---

### Card

Content container with optional title.

| Prop | Type | Description |
|------|------|-------------|
| `title` | `string?` | Optional card heading |
| `children` | `ReactNode` | Card content |

**Accessibility**: Semantic `<article>` element with `<h3>` title.

---

### DataTable

Sortable data table with optional row selection.

| Prop | Type | Description |
|------|------|-------------|
| `columns` | `Column<T>[]` | Column definitions (`key`, `header`, `render?`, `sortable?`, `width?`) |
| `data` | `T[]` | Row data array |
| `selectable` | `boolean?` | Enable checkbox row selection |
| `onSelectionChange` | `(selectedRows: T[]) => void` | Selection callback |
| `emptyMessage` | `string?` | Message when no data |

**Accessibility**: `role="grid"`, `scope="col"`, `aria-sort`, keyboard navigation.

---

### Modal

Dialog overlay with focus trap.

| Prop | Type | Description |
|------|------|-------------|
| `isOpen` | `boolean` | Visibility state |
| `onClose` | `() => void` | Close handler |
| `title` | `string` | Dialog heading |
| `size` | `'sm' \| 'md' \| 'lg'` | Width (400/560/720px) |
| `children` | `ReactNode` | Dialog content |

**Accessibility**: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, focus trap, Escape to close.

---

### StatCard

Dashboard metric card with trend indicator.

| Prop | Type | Description |
|------|------|-------------|
| `label` | `string` | Metric label |
| `value` | `string \| number` | Metric value |
| `change` | `string?` | Change percentage |
| `changeType` | `'positive' \| 'negative' \| 'neutral'` | Trend direction (↑↓→) |
| `icon` | `string?` | Emoji icon |

---

### StatusBadge

Color-coded status indicator with dot icon.

| Prop | Type | Description |
|------|------|-------------|
| `status` | `string` | Status key (maps to predefined colors) |
| `label` | `string?` | Override display text |

**Supported statuses**: critical, high, medium, low, info, compliant, non-compliant, in-progress, not-assessed, planned, completed, closed, draft, under-review, approved, published, archived, open, investigating, contained, resolved, active, inactive, pending.

**Accessibility**: `role="status"`, not color-alone (includes dot indicator + text).

---

### AlertBanner

Notification banner with dismiss option.

| Prop | Type | Description |
|------|------|-------------|
| `type` | `'info' \| 'success' \| 'warning' \| 'error'` | Alert type |
| `message` | `string` | Alert message |
| `onDismiss` | `() => void?` | Optional dismiss handler |

**Accessibility**: `role="alert"`, `aria-live="polite"`.

---

### FormField

Form input with label, error display, and validation support.

| Prop | Type | Description |
|------|------|-------------|
| `label` | `string` | Field label |
| `name` | `string` | Input name attribute |
| `type` | `'text' \| 'email' \| 'number' \| 'textarea' \| 'select'` | Input type |
| `value` | `string` | Current value |
| `onChange` | `(e) => void` | Change handler |
| `error` | `string?` | Validation error message |
| `required` | `boolean?` | Required field indicator |
| `options` | `{ value, label }[]?` | Options for select type |

**Accessibility**: `<label htmlFor>`, `aria-describedby` for errors, `aria-invalid` on error, `aria-required`.

---

### BulkActionBar

Sticky bottom toolbar for batch operations.

| Prop | Type | Description |
|------|------|-------------|
| `selectedCount` | `number` | Number of selected items |
| `actions` | `{ label, onClick, variant? }[]` | Action buttons |
| `onClearSelection` | `() => void` | Clear selection handler |

**Accessibility**: `role="toolbar"`, only renders when `selectedCount > 0`.

---

### PageHeader

Page title with optional subtitle and action buttons.

| Prop | Type | Description |
|------|------|-------------|
| `title` | `string` | Page heading |
| `subtitle` | `string?` | Secondary text |
| `actions` | `ReactNode?` | Right-aligned action elements |

**Accessibility**: Semantic `<header>` with `<h1>` title.

---

### EmptyState

Placeholder for empty data views.

| Prop | Type | Description |
|------|------|-------------|
| `title` | `string` | Empty state heading |
| `description` | `string?` | Explanatory text |
| `actionLabel` | `string?` | CTA button label |
| `onAction` | `() => void?` | CTA click handler |
| `icon` | `string?` | Emoji icon |

---

## CSS Custom Properties

All components use these design tokens:

```css
--color-primary       /* Primary action color */
--color-secondary     /* Secondary text/borders */
--color-danger        /* Destructive actions */
--color-surface       /* Card/panel backgrounds */
--color-border        /* Border color */
--color-text          /* Primary text */
--color-text-secondary /* Secondary text */
--color-selected      /* Selected row highlight */
```

---

## Architecture Rules

1. **All components use semantic HTML**. `<button>`, `<table>`, `<article>`, `<header>` — never styled `<div>`s for interactive elements.
2. **All components are accessible**. WCAG 2.1 AA compliance with proper ARIA attributes.
3. **CSS custom properties only**. No raw hex values. All colors from design tokens.
4. **No external styling dependencies**. No CSS files, Tailwind, or styled-components.
5. **Depends only on `@shared/types`**. No imports from other libraries.
6. **Never import component internals**. Always use the barrel export from `@shared/ui-components`.

---

## Adding a New Component

1. Create `src/lib/MyComponent.tsx` with `// Generated by GitHub Copilot` header.
2. Use semantic HTML elements with proper ARIA attributes.
3. Style with CSS custom properties via inline `style` objects.
4. Export from `src/index.ts`.
5. Document in this README with prop table and accessibility notes.
6. Ensure keyboard navigation and visible focus indicators.

---

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/Button.tsx` | Button component |
| `src/lib/Card.tsx` | Card container |
| `src/lib/DataTable.tsx` | Sortable data table |
| `src/lib/Modal.tsx` | Dialog overlay |
| `src/lib/StatCard.tsx` | Dashboard metric card |
| `src/lib/StatusBadge.tsx` | Status indicator |
| `src/lib/AlertBanner.tsx` | Notification banner |
| `src/lib/FormField.tsx` | Form input |
| `src/lib/BulkActionBar.tsx` | Bulk operation toolbar |
| `src/lib/PageHeader.tsx` | Page title header |
| `src/lib/EmptyState.tsx` | Empty data placeholder |
| `src/index.ts` | Barrel exports |
