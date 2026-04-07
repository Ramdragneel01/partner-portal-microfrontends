# Roadmap — Oscar-Inspired Architecture Enhancements

> Phased plan for adopting patterns from the Oscar platform architecture.
> Each phase builds on the previous. Prioritized by impact and complexity.

---

## Phase 1: Foundation Enhancements (Near-Term)

### 1.1 Theme System — Light/Dark Toggle

**Oscar Pattern**: `ThemeProvider` with CSS custom properties + `[data-theme="dark"]` override.

**Implementation**:
- Add `ThemeProvider` component to `@shared/ui-components`
- Extend CSS custom properties with dark mode values
- Add `useTheme()` hook returning `{ themeMode, toggleTheme }`
- Persist selection in `localStorage` under `portal-theme-mode`
- Add toggle button to shell Header

**Impact**: Medium | **Effort**: Low

### 1.2 Centralized Version Management

**Oscar Pattern**: `shared/versions.json` + `sync-versions.js` script.

**Implementation**:
- Create `versions.json` in workspace root with all dependency versions
- Build `sync-versions.js` script to update `package.json` files
- Add npm script: `npm run sync-versions`
- Enforce via CI check

**Impact**: Low | **Effort**: Low

### 1.3 Storybook for Design System

**Oscar Pattern**: Storybook 8+ for component documentation.

**Implementation**:
- Add Storybook to `libs/shared/ui-components`
- Create stories for all 11 components
- Add visual regression testing
- Serve at `:6006`

**Impact**: High | **Effort**: Medium

---

## Phase 2: Config-Driven UI (Mid-Term)

### 2.1 ViewConfig Schema & Types

**Oscar Pattern**: `ViewConfig` + `ComponentConfig` TypeScript interfaces.

**Implementation**:
- Define `ViewConfig` and `ComponentConfig` types in `@shared/types`
- Support component types: `Table`, `StatCard`, `Chart`, `Form`, `Text`, `List`
- Define grid-based layout schema (12-column grid)

**Impact**: High | **Effort**: Medium

### 2.2 View Renderer

**Oscar Pattern**: `ViewRenderer` + `ComponentRenderer` with lazy loading.

**Implementation**:
- Build `ViewRenderer` component that takes `ViewConfig` and renders component tree
- Build `ComponentRenderer` that maps type strings to React components
- Add `useIntersectionObserver` for lazy loading (only fetch data when visible)
- Add to `@shared/ui-components`

**Impact**: High | **Effort**: High

### 2.3 Build-Time View Configs

**Oscar Pattern**: JSON files in `views/configs/` compiled into bundle.

**Implementation**:
- Create `views/configs/` directory in each micro-app
- Define dashboard layouts as JSON
- Import and render via ViewRenderer
- Example: Risk Assessment dashboard as ViewConfig JSON

**Impact**: Medium | **Effort**: Medium

---

## Phase 3: Real-Time & i18n (Mid-Term)

### 3.1 SSE Provider

**Oscar Pattern**: `SSEProvider` wrapping EventSource with auto-reconnect.

**Implementation**:
- Build `SSEProvider` in `@shared/ui-components` or new `@shared/realtime` library
- Support `useSSE()` hook for subscribing to server events
- Auto-reconnect on disconnect
- Use for: live dashboard updates, notifications

**Impact**: Medium | **Effort**: Medium

### 3.2 Internationalization (i18n)

**Oscar Pattern**: `react-i18next` with `i18next-http-backend`.

**Implementation**:
- Install `react-i18next` and `i18next`
- Create `I18nProvider` in `@shared/ui-components`
- Move all hardcoded strings to translation files
- Support `en` locale initially, add others as needed
- Locale-aware date formatting via `date-fns`

**Impact**: Medium | **Effort**: High

---

## Phase 4: Plugin System (Long-Term)

### 4.1 Plugin Config Schema

**Oscar Pattern**: `plugin.config.json` with name, version, entry, description.

**Implementation**:
- Define plugin manifest schema
- Create `PluginRegistry` service in shell
- Auto-discover plugins from config or API

**Impact**: High | **Effort**: High

### 4.2 Plugin Runtime Loading

**Oscar Pattern**: Dynamic import of plugin bundles from CDN or local dev server.

**Implementation**:
- Build plugin dev server at `:3001`
- Plugin build system (single Vite/Webpack config builds all plugins)
- Lazy-load plugins on navigation
- Plugins inherit theme via CSS custom properties

**Impact**: High | **Effort**: High

---

## Phase 5: Advanced Patterns (Long-Term)

### 5.1 Zustand for View-Scoped State

**Oscar Pattern**: Zustand store for component data caching and request deduplication.

**Implementation**:
- Install Zustand
- Create `ViewsProvider` with per-view stores
- Implement data caching with configurable TTL
- Request deduplication for simultaneous component data fetches

**Impact**: Medium | **Effort**: Medium

### 5.2 API Client Enhancement

**Oscar Pattern**: `axios-cache-interceptor` with automatic header injection.

**Implementation**:
- Migrate from fetch to Axios (or enhance fetch wrapper)
- Add request caching with configurable TTL
- Add automatic `X-Tenant-ID` header injection for multi-tenancy
- Add retry logic with exponential backoff

**Impact**: Medium | **Effort**: Medium

### 5.3 URL Compression

**Oscar Pattern**: Compress/decompress route params for shorter URLs.

**Implementation**:
- Build `urlCompression.ts` utility
- Apply to complex filter/sort/pagination params in URL
- Keep URLs shareable and bookmarkable

**Impact**: Low | **Effort**: Low

---

## Priority Matrix

| Enhancement | Impact | Effort | Priority |
|-------------|--------|--------|----------|
| Theme Light/Dark | Medium | Low | **P1** |
| Storybook | High | Medium | **P1** |
| Centralized Versions | Low | Low | **P2** |
| ViewConfig Schema | High | Medium | **P2** |
| View Renderer | High | High | **P2** |
| SSE Provider | Medium | Medium | **P3** |
| i18n | Medium | High | **P3** |
| Plugin System | High | High | **P4** |
| Zustand State | Medium | Medium | **P4** |
| API Enhancement | Medium | Medium | **P4** |
