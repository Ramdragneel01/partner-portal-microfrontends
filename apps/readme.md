# UI Blueprint — Portable Dashboard Platform

> **Purpose**: This document is a self-contained, copy-paste blueprint to replicate the full UI architecture, theme system, component library, and config-driven dashboard of this project in any new project under a different name and use case. Every color, dimension, font, layout value, TypeScript type, and build command is captured here.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Monorepo Folder Structure](#2-monorepo-folder-structure)
3. [Tech Stack (Exact Versions)](#3-tech-stack-exact-versions)
4. [Theme System — Full Specification](#4-theme-system--full-specification)
   - 4.1 [Dark Theme (Default)](#41-dark-theme-default)
   - 4.2 [Light Theme](#42-light-theme)
   - 4.3 [Shared Design Tokens](#43-shared-design-tokens)
   - 4.4 [Typography](#44-typography)
  - 4.5 [Custom Brand Colors (Archaic Search Palette)](#45-custom-brand-colors-archaic-search-palette)
   - 4.6 [Chart Palette](#46-chart-palette)
5. [Layout & Dimensions](#5-layout--dimensions)
6. [Provider Hierarchy](#6-provider-hierarchy)
7. [Component Library Specification](#7-component-library-specification)
8. [Config-Driven UI System](#8-config-driven-ui-system)
9. [Navigation & Categories](#9-navigation--categories)
10. [Authentication Architecture](#10-authentication-architecture)
11. [API Integration Pattern](#11-api-integration-pattern)
12. [Real-Time (SSE)](#12-real-time-sse)
13. [Build Commands & Scripts](#13-build-commands--scripts)
14. [Environment Variables](#14-environment-variables)
15. [Testing Strategy](#15-testing-strategy)
16. [Prompt for AI — Recreate This Project](#16-prompt-for-ai--recreate-this-project)

---

## 1. Project Overview

This is a **multi-tenant, config-driven SaaS dashboard** built with React 19 + MUI 7 + TypeScript 5.6. The UI is a **thin client** — all business logic lives on the backend (FastAPI + PostgreSQL). The frontend renders dashboards/views from JSON configurations, supports light/dark themes, pluggable authentication (Azure Entra / offline dev), real-time SSE streaming, and a plugin system for extending views without changing core code.

**Rename checklist for a new project:**
- Replace all `archaic` / `Achaic` / `legacy product` / `Archaic Search Risk & Compliance` with your product name
- Replace `@archaic/ui-lib` and `@archaic/ui-core` with your package names
- Replace `archaic-theme-mode` localStorage key with your own
- Swap the logo asset in `NavigationCategories`
- Update `VITE_UI_NAME`, `VITE_PRODUCT_FULL_NAME` env vars

---

## 2. Monorepo Folder Structure

```
your-project/
├── apps/
│   ├── api/                    # FastAPI backend (Python 3.13)
│   └── web/                    # All frontend code
│       ├── lib/                # @your/ui-lib — shared component library
│       ├── core/               # @your/ui-core — main app shell
│       ├── plugins/            # Universal plugin build system
│       └── shared/             # Synchronized config (versions, tsconfig, eslint)
├── packages/
│   ├── archaic-shared/           # Python shared utilities
│   └── archaic-plugin-sdk/       # Plugin development SDK
├── deploy/
│   └── docker-compose/
├── docs/
└── Makefile
```

### `apps/web/` internal structure

```
apps/web/
├── lib/
│   ├── src/
│   │   ├── components/         # All reusable UI components
│   │   ├── config-driven-ui/   # JSON-to-UI rendering engine
│   │   ├── theme/              # ThemeProvider, light/dark configs, tokens
│   │   ├── providers/          # SSEProvider, AxiosProvider
│   │   ├── services/           # axios.ts, preferences.ts
│   │   ├── hooks/              # useTheme, useSSE
│   │   ├── i18n/               # Translation files
│   │   ├── tokens/             # Design tokens
│   │   └── index.ts            # Public barrel export
│   ├── .storybook/
│   └── package.json            # name: "@your/ui-lib"
│
├── core/
│   ├── src/
│   │   ├── main.tsx            # Bootstrap entry
│   │   ├── App.tsx             # Provider hierarchy
│   │   ├── Content.tsx         # Routes
│   │   ├── Auth/               # Adapter interface + MSAL + Offline adapters
│   │   ├── components/
│   │   │   ├── Sidebar/        # Navigation sidebar (categories + nav drawer)
│   │   │   ├── ViewRenderer.tsx
│   │   │   ├── PluginRouter.tsx
│   │   │   ├── PreferencesInitializer.tsx
│   │   │   ├── AppErrorBoundary.tsx
│   │   │   ├── Footer/
│   │   │   └── Content/
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx
│   │   │   ├── ContextProvider.tsx  # tenant + user + features
│   │   │   ├── NavigationContext.tsx
│   │   │   └── SidebarContext.tsx
│   │   ├── providers/
│   │   │   ├── AuthProvider.tsx
│   │   │   ├── ContextProvider.tsx
│   │   │   └── I18nProvider.tsx
│   │   ├── services/
│   │   │   ├── PluginRegistry.ts
│   │   │   ├── CustomViewInitializer.ts
│   │   │   └── user.ts
│   │   ├── views/
│   │   │   ├── categories/
│   │   │   │   └── categories.json   # Navigation definition
│   │   │   └── configs/              # Build-time ViewConfig JSON files
│   │   ├── config/
│   │   │   └── env.ts               # Typed VITE_* access
│   │   ├── hooks/
│   │   │   └── usePluginReady.ts
│   │   ├── utils/
│   │   │   └── urlCompression.ts
│   │   ├── i18n/
│   │   └── styles/
│   │       ├── global.css
│   │       └── views.css
│   └── package.json            # name: "@your/ui-core"
│
├── plugins/
│   ├── vite.config.ts          # Universal builder
│   ├── build-plugins.ts
│   ├── dev-server.ts
│   └── [plugin-name]/
│       ├── plugin.config.json
│       └── src/index.tsx
│
└── shared/
    ├── versions.json           # Single source of truth for all package versions
    ├── tsconfig.base.json      # Strict TypeScript config
    ├── eslint.config.base.js
    └── vite.config.shared.ts   # Shared alias: @your/ui-lib → ../lib/src
```

---

## 3. Tech Stack (Exact Versions)

### Frontend Core

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | `19.2.1` | UI framework |
| `react-dom` | `19.2.1` | DOM renderer |
| `typescript` | `^5.8.3` | Type safety |
| `vite` | `^7.1.5` | Build tool |
| `vitest` | `^3.1.2` | Test runner |
| `@mui/material` | `^7.3.4` | Component library |
| `@mui/icons-material` | `^7.3.4` | Icons |
| `@mui/lab` | `^7.0.1-beta.20` | Lab components |
| `@mui/x-date-pickers` | `^8.25.0` | Date pickers |
| `@emotion/react` | `^11.11.0` | CSS-in-JS |
| `@emotion/styled` | `^11.11.0` | Styled components |
| `react-router-dom` | `^7.12.0` | Routing |
| `i18next` | `^25.4.2` | i18n |
| `react-i18next` | `^15.7.3` | React i18n bindings |
| `i18next-http-backend` | `^3.0.2` | Lazy-load translations |
| `axios` | `1.13.6` | HTTP client |
| `axios-cache-interceptor` | `^1.6.0` | Request caching |
| `echarts` | `^6.0.0` | Charts |
| `echarts-for-react` | `^3.0.2` | ECharts React wrapper |
| `zustand` | `^5.0.8` | View-scoped state |
| `@rjsf/core` | `^6.0.0-beta.21` | JSON Schema forms |
| `@rjsf/mui` | `^6.2.5` | MUI-styled forms |
| `@rjsf/validator-ajv8` | `^6.0.0-beta.21` | Form validation |
| `date-fns` | `^4.1.0` | Date utilities + i18n locales |
| `jmespath` | `^0.15.0` | JSON path queries |
| `jsonata` | `^2.1.0` | JSON transformation |
| `zod` | `^4.2.1` | Schema validation |
| `dompurify` | `^3.3.3` | XSS sanitization |
| `react-markdown` | `^10.1.0` | Markdown rendering |
| `gridstack` | `^12.3.3` | Drag-and-drop grid |
| `@dnd-kit/core` | `^6.1.0` | Drag and drop |

### Auth

| Package | Version |
|---------|---------|
| `@azure/msal-browser` | `^3.23.0` |
| `@azure/msal-react` | `^2.0.22` |

### Dev Tools

| Package | Version |
|---------|---------|
| `eslint` | `^9.36.0` |
| `eslint-plugin-jsx-a11y` | `^6.10.2` |
| `eslint-plugin-react-hooks` | `^7.0.1` |
| `prettier` | `^3.3.3` |
| `storybook` | `^8.6.14` |
| `babel-plugin-react-compiler` | `1.0.0` |
| `jest-axe` | `^10.0.0` |
| `@testing-library/react` | `^14.0.0` |
| `@testing-library/user-event` | `^14.5.2` |
| `node` | `>=18.0.0` |

---

## 4. Theme System — Full Specification

The theme uses **MUI v7 `extendTheme`** with CSS custom properties emitted as `--mui-palette-*` variables. The app defaults to **dark mode**.

### 4.1 Dark Theme (Default)

File: `lib/src/theme/configs/dark.ts`

```typescript
import { extendTheme } from '@mui/material/styles';

export const darkThemeConfig = {
  mode: 'dark',
  palette: {
    mode: 'dark',

    // Primary — near-white text/icons
    primary: {
      main:  '#e0e0e0',
      light: '#e6e6dc',
      dark:  '#bdbdbd',
    },

    // Secondary — Archaic Search purple accent
    secondary: {
      main:  '#be82ff',
      light: '#dcafff',
      dark:  '#a055f5',
    },

    error:   { main: '#ef5350', light: '#e57373', dark: '#e53935' },
    warning: { main: '#ffb74d', light: '#ffcc90', dark: '#fb8c00' },
    info:    { main: '#4fc3f7', light: '#81d4fa', dark: '#03a9f4' },
    success: { main: '#8BC34A', light: '#AED581', dark: '#7CB342' },
    majorWarning: { main: '#FF9800', light: '#FFB74D', dark: '#FF6F00' },

    text: {
      primary:   '#eeeeee',
      secondary: '#9e9e9e',
      disabled:  '#616161',
      icon: 'rgba(255, 255, 255, 0.7)',
    },

    background: {
      default: '#121212',
      paper:   '#232323',
      // Elevation scale — dark mode uses progressively lighter surfaces
      'paper-elevation-0':  '#121212',
      'paper-elevation-1':  '#1e1e1e',
      'paper-elevation-2':  '#232323',
      'paper-elevation-3':  '#252525',
      'paper-elevation-4':  '#272727',
      'paper-elevation-5':  '#2a2a2a',
      'paper-elevation-6':  '#2c2c2c',
      'paper-elevation-8':  '#2e2e2e',
      'paper-elevation-10': '#313131',
      'paper-elevation-12': '#333333',
      'paper-elevation-16': '#363636',
      'paper-elevation-20': '#383838',
      'paper-elevation-24': '#383838',
      // Decorative background blobs
      imageBlobTop:    'url(./assets/dark-top-left-blob.png)',
      imageBlobMiddle: 'url(./assets/dark-middle-blob.png)',
      imageBlobBottom: 'url(./assets/dark-bottom-blob.png)',
      parallaxBlob:    'url(./assets/dark-middle-blob.png)',
      radialGradient: `radial-gradient(ellipse at center top,
          var(--mui-palette-background-paper-elevation-10) 0%,
          var(--mui-palette-background-paper-elevation-0)  63%,
          #000000 100%)`,
    },

    divider:  'rgba(255, 255, 255, 0.12)',
    outlined: '#616161',
    backdrop: 'rgba(0, 0, 0, 0.35)',

    action: {
      active:            'rgba(255, 255, 255, 0.7)',
      hover:             'rgba(160, 85, 245, 0.08)',   // purple tint on hover
      hoverOpacity:      0.08,
      selected:          'rgba(255, 255, 255, 0.16)',
      selectedOpacity:   0.16,
      disabled:          'rgba(255, 255, 255, 0.3)',
      disabledBackground:'rgba(255, 255, 255, 0.12)',
      focus:             'rgba(160, 85, 245, 0.12)',
    },

    common: {
      black: '#000000',
      white: '#ffffff',
      darkGrey:          '#96968c',
      lightGrey:         '#e6e6dc',
      gradientStart:     '#668DF6',
      gradientEnd:       '#0037E4',
      rowDefault:        '#191919',
      rowHighlight:      '#1E1E1E',
      rowHoverNormal:    '#2a2a2a',
      rowHoverClickable: '#e6e6dc',
      rowSelected:       '#32323e',
    },

    // Archaic Search brand palette (same in both themes)
    customBrand: {
      corePurple1: '#a100ff',
      corePurple2: '#7500c0',
      corePurple3: '#460073',
      accentPurple1: '#b455aa',
      accentPurple2: '#a055f5',
      accentPurple3: '#be82ff',
      accentPurple4: '#dcafff',
      accentPurple5: '#e6dcff',
      enterpriseBlue1: '#e5ecfd',
      enterpriseBlue2: '#b2c6fa',
      enterpriseBlue3: '#668df6',
      enterpriseBlue4: '#475ff5',
      enterpriseBlue5: '#0041f0',
      enterpriseBlue6: '#0037ea',
      enterpriseBlue7: '#002766',
    },

    iconColors: {
      'status-error':         'mui-palette-error-main',
      'status-warning-major': 'mui-palette-majorWarning-main',
      'status-warning':       'mui-palette-warning-main',
      'status-info':          'mui-palette-info-main',
      'status-success':       'mui-palette-success-main',
      'status-neutral':       '#BDBDBD',
      'status-brand':         'mui-palette-secondary-main',
      'trend-positive':       '#8BC34A',
      'trend-negative':       '#FF5252',
      'severity-moderate':    '#26A69A',
    },

    // 12-color chart palette — dark mode (vibrant)
    chartPalette: {
      colors: [
        '#2962FF', // blue-A700
        '#18ffff', // cyan-A200
        '#EC407A', // pink-400
        '#FFEB3B', // yellow-500
        '#6732B7', // deepPurple-500
        '#FFA000', // amber-700
        '#AB47BC', // purple-400
        '#00E676', // green-A400
        '#FF5252', // red-A200
        '#C6FF00', // lime-A400
        '#26A69A', // teal-400
        '#FF9100', // orange-A400
      ],
    },
  },
};
```

### 4.2 Light Theme

File: `lib/src/theme/configs/light.ts`

```typescript
export const lightThemeConfig = {
  mode: 'light',
  palette: {
    mode: 'light',

    primary: {
      main:          '#212121',
      light:         '#616161',
      dark:          '#000000',
      contrastText:  '#eeeeee',
    },

    // Secondary — Archaic Search enterprise blue
    secondary: {
      main:         '#0041f0',
      light:        '#668df6',
      dark:         '#0037ea',
      contrastText: '#ffffff',
    },

    error:   { main: '#d32f2f', light: '#ef5350', dark: '#c62828', contrastText: '#ffffff' },
    warning: { main: '#ef6c00', light: '#ff9800', dark: '#e65100', contrastText: '#ffffff' },
    info:    { main: '#0288d1', light: '#03a9f4', dark: '#01579b', contrastText: '#ffffff' },
    success: { main: '#2e7d32', light: '#4caf50', dark: '#1b5e20', contrastText: '#000000' },
    majorWarning: { main: '#E64A19', light: '#FF5722', dark: '#BF360C' },

    text: {
      primary:   '#212121',
      secondary: '#616161',
      disabled:  '#bdbdbd',
      icon: 'rgba(0, 0, 0, 0.7)',
    },

    background: {
      default: '#F5F5F5',
      paper:   '#ffffff',
      // All elevation levels are white in light mode (flat)
      'paper-elevation-0':  '#ffffff',
      // ... through 'paper-elevation-24': '#ffffff'
      imageBlobTop:    'url(./assets/light-top-left-blob.png)',
      imageBlobMiddle: 'url(./assets/light-middle-blob.png)',
      imageBlobBottom: 'url(./assets/light-bottom-blob.png)',
      radialGradient: `radial-gradient(ellipse at center top,
          rgba(from var(--mui-palette-background-paper-elevation-0) r g b / 0.1) 0%,
          rgba(from var(--mui-palette-customBrand-enterpriseBlue1) r g b / 0.3) 63%,
          rgba(from var(--mui-palette-customBrand-enterpriseBlue2) r g b / 0.2) 100%)`,
    },

    divider:  'rgba(0, 0, 0, 0.12)',
    outlined: '#E0E0E0',

    action: {
      active:          'rgba(0, 0, 0, 0.7)',
      hover:           'rgba(160, 85, 245, 0.08)',
      selected:        'rgba(0, 0, 0, 0.16)',
      disabled:        'rgba(0, 0, 0, 0.3)',
      disabledBackground: 'rgba(0, 0, 0, 0.12)',
      focus:           'rgba(160, 85, 245, 0.12)',
    },

    common: {
      black: '#000000',
      white: '#ffffff',
      gradientStart:     '#668DF6',
      gradientEnd:       '#0037E4',
      rowDefault:        '#F5F5F5',
      rowHighlight:      '#EBEAF5',
      rowHoverNormal:    '#e8e8e8',
      rowHoverClickable: '#616161',
      rowSelected:       '#d1d1e8',
    },

    // Same Archaic Search brand palette
    customBrand: { /* identical to dark theme */ },

    iconColors: {
      'status-neutral':    '#424242',  // darker in light
      'status-brand':      '#673AB7',
      'severity-moderate': '#00796B',  // teal-700 in light
      // rest identical to dark
    },

    // 12-color chart palette — light mode (richer/darker for contrast)
    chartPalette: {
      colors: [
        '#2962FF', // blue-A700
        '#00838F', // cyan-800
        '#880E4F', // pink-900
        '#E65100', // orange-900
        '#311B92', // deepPurple-900
        '#BF360C', // deepOrange-900
        '#7B1FA2', // purple-700
        '#1B5E20', // green-900
        '#B71C1C', // red-900
        '#827717', // lime-900
        '#00796B', // teal-700
        '#3E2723', // brown-900
      ],
    },
  },
};
```

### 4.3 Shared Design Tokens

File: `lib/src/theme/tokens.ts`

```typescript
export const themeTokens = {
  spacing: {
    xs:  4,   // 4px
    sm:  8,   // 8px
    md:  16,  // 16px
    lg:  24,  // 24px
    xl:  32,  // 32px
    xxl: 48,  // 48px
  },

  borderRadius: {
    xs:    2,
    sm:    4,
    md:    8,   // ← default for inputs, buttons
    lg:    12,  // ← default for cards
    xl:    16,
    round: '50%',
  },

  elevation: {
    none: 'none',
    sm:   '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md:   '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg:   '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl:   '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },

  animation: {
    duration: {
      shortest:       150,
      shorter:        200,
      short:          250,
      standard:       300,
      complex:        375,
      enteringScreen: 225,
      leavingScreen:  195,
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut:   'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn:    'cubic-bezier(0.4, 0, 1, 1)',
      sharp:     'cubic-bezier(0.4, 0, 0.6, 1)',
    },
  },
};
```

### 4.4 Typography

Applied via `extendTheme` in both light and dark:

```typescript
typography: {
  fontFamily: 'Graphik, Inter, system-ui, -apple-system, sans-serif',
  fontSize: 14,
  htmlFontSize: 16,
  fontWeightLight:   300,
  fontWeightRegular: 400,
  fontWeightMedium:  500,
  fontWeightBold:    700,
  h1: { fontSize: '6rem',    fontWeight: 300, lineHeight: 1.2, letterSpacing: '-1.5px' },
  h2: { fontSize: '3.75rem', fontWeight: 300, lineHeight: 1.2, letterSpacing: '-0.5px' },
  h3: { fontSize: '3rem',    fontWeight: 400, lineHeight: 1.2, letterSpacing: '0px' },
  h4: { fontSize: '2.125rem',fontWeight: 400, lineHeight: 1.2, letterSpacing: '0.25px' },
  h5: { fontSize: '1.5rem',  fontWeight: 400, lineHeight: 1.2, letterSpacing: '0px' },
  h6: { fontSize: '1.25rem', fontWeight: 500, lineHeight: 1.2, letterSpacing: '0.15px' },
  body1: { fontSize: '1rem',    fontWeight: 400, lineHeight: 1.5, letterSpacing: '0.15px' },
  body2: { fontSize: '0.875rem',fontWeight: 400, lineHeight: 1.5, letterSpacing: '0.15px' },
}
```

> **Font**: `Graphik` (enterprise licensed). For non-Archaic Search projects, replace with `Inter` — the fallback already in the stack.

### 4.5 Custom Brand Colors (Archaic Search Palette)

These are **identical in both dark and light themes**:

| Token | Hex | Description |
|-------|-----|-------------|
| `corePurple1` | `#a100ff` | Archaic Search core purple (vibrant) |
| `corePurple2` | `#7500c0` | Core purple mid |
| `corePurple3` | `#460073` | Core purple deep |
| `accentPurple1` | `#b455aa` | Accent purple 1 |
| `accentPurple2` | `#a055f5` | Accent purple 2 (hover tints) |
| `accentPurple3` | `#be82ff` | Secondary main (dark) |
| `accentPurple4` | `#dcafff` | Secondary light (dark) |
| `accentPurple5` | `#e6dcff` | Lightest purple |
| `enterpriseBlue1` | `#e5ecfd` | Enterprise blue lightest |
| `enterpriseBlue2` | `#b2c6fa` | Enterprise blue light |
| `enterpriseBlue3` | `#668df6` | Enterprise blue mid |
| `enterpriseBlue4` | `#475ff5` | Enterprise blue mid-dark |
| `enterpriseBlue5` | `#0041f0` | Secondary main (light) |
| `enterpriseBlue6` | `#0037ea` | Secondary dark (light) |
| `enterpriseBlue7` | `#002766` | Enterprise blue deepest |

> **For a non-Archaic Search project**: Replace `corePurple*` with your brand's primary color scale, and `enterpriseBlue*` with your secondary color scale.

### 4.6 Chart Palette

The 12-color sequential palettes for ECharts are defined per theme. See sections 4.1 and 4.2 above. Access via `muiTheme.palette.chartPalette.colors`.

---

## 5. Layout & Dimensions

```
┌─────────────────────────────────────────────────────────┐
│  NavigationCategories (56px)  │  NavSlider (244px)  │  Main Content (flex-grow: 1)  │
│  [icon strip]                 │  [nav menu]         │  [views/routes]               │
│  height: 100svh               │  height: 100svh     │  min-height: 100vh            │
└─────────────────────────────────────────────────────────┘
```

| Element | Value |
|---------|-------|
| **Navigation icon strip** | `width: 56px`, `minWidth: 56px` |
| **Nav drawer (expanded)** | `width: 244px` (`DRAWER_WIDTH = 244`) |
| **Total sidebar (expanded)** | `300px` (56 + 244) |
| **App height** | `100svh` (modern viewport unit) |
| **Main content** | `flex-grow: 1`, `min-height: 100vh`, `overflow: auto` |
| **Toggle button** | `34×34px`, positioned `left: 254px` (open) / `-28px` (closed) |
| **Toggle animation** | `left 200ms cubic-bezier(0.4, 0, 0.2, 1)` |
| **Logo button** | `40×40px` container, `28×28px` image |
| **Category icon buttons** | `32×32px` icon, `40×40px` container |
| **Tenant selector strip** | Fixed `height: 81px`, `border-top: 1px` divider |
| **Footer margin (expanded)** | `margin-left: 240px` |
| **Footer margin (collapsed)** | `margin-left: 64px` |
| **Footer min-height** | `60px` |
| **PageContainer padding X** | `{xs: 1, sm: 3, md: 8}` (MUI spacing units × 8px) |
| **PageContainer padding Y** | `{xs: 1, sm: 3, md: 5}` |
| **PageContainer max-width** | `1200px` (content area) |
| **Breadcrumb blur** | `backdropFilter: blur(18.5px)` |
| **Modal max-width** | `1200px` |
| **Modal max-height** | `90vh` |
| **Modal transform** | `translate(-50%, -45vh)` (slightly above center) |
| **Card glass blur** | `blur(18.5px)` |
| **Card hover lift** | `translateY(-4px)` |
| **Card transition** | `all 0.3s ease` |

### CSS Custom Properties (Global)

```css
.app-container {
  min-height: 100vh;
  color: var(--mui-palette-text-primary);
  background-color: var(--mui-palette-background-default);
}

/* Loading screen */
.app-loading {
  background-color: #121212;
  background-color: var(--mui-palette-background-default, #121212);
  color: #e0e0e0;
  color: var(--mui-palette-text-primary, #e0e0e0);
  font-family: var(--mui-typography-fontFamily, 'Inter', system-ui, sans-serif);
}

/* Content area */
.content-container {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--mui-spacing-3, 24px);
  background: var(--mui-palette-background-default, #ffffff);
}

/* Auto-fit content grid */
.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--mui-spacing-3, 24px);
}

/* Stats/KPI grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--mui-spacing-2, 16px);
}

/* Mobile */
@media (max-width: 768px) {
  .content-grid { grid-template-columns: 1fr; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}
```

### MUI Component Overrides (Base)

```typescript
const baseComponents = {
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: 'none',   // no uppercase
        fontWeight: 500,
        borderRadius: 8,         // themeTokens.borderRadius.md
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: { borderRadius: 12 }, // themeTokens.borderRadius.lg
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: { borderRadius: 8 },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': { borderRadius: 8 },
      },
    },
  },
};
```

---

## 6. Provider Hierarchy

### Bootstrap (`main.tsx`)

```tsx
// Outer-most: theme → axios → auth → app
<ThemeProvider defaultMode="dark" storageKey="your-app-theme-mode">
  <AxiosProvider axiosInstance={createCoreAxiosInstance(token)} authAdapter={adapter}>
    <AuthProvider>
      <App />
    </AuthProvider>
  </AxiosProvider>
</ThemeProvider>
```

### App Shell (`App.tsx`)

```tsx
// Exact nesting order — DO NOT reorder
<BrowserRouter basename={basePath}>
  <AppErrorBoundaryWrapper>
    <AlertManagerProvider maxNotifications={5}>
      <I18nProvider>
        <SidebarProvider>
          <ContextProvider>          {/* tenant + user + feature flags */}
            <SSEProvider>            {/* real-time Server-Sent Events */}
              <PreferencesInitializer />
              <Content />            {/* route tree */}
            </SSEProvider>
          </ContextProvider>
        </SidebarProvider>
      </I18nProvider>
    </AlertManagerProvider>
  </AppErrorBoundaryWrapper>
</BrowserRouter>
```

### ThemeProvider Behavior

```typescript
// lib/src/theme/provider.tsx
// - Reads from localStorage (key: 'your-app-theme-mode')
// - Falls back to system prefers-color-scheme
// - toggleTheme() cycles: light → dark (dark is sticky — no toggle back to light by default)
// - Emits: <MuiThemeProvider theme={themes[themeMode]}> + <CssBaseline />
```

---

## 7. Component Library Specification

All components live in `lib/src/components/`. They wrap MUI but are never imported directly in `core/`. Always import from `@your/ui-lib`.

### KPI

```typescript
interface KPIProps {
  value:          string | number;
  label:          string;
  previousValue?: string | number;
  trend?:         'up' | 'down' | 'neutral';
  trendValue?:    string | number;
  status?:        'success' | 'warning' | 'error' | 'info' | 'neutral';
  unit?:          string;
  format?:        'number' | 'currency' | 'percentage' | 'plain' | 'text';
  currency?:      string;              // 'USD' | 'EUR' | 'GBP' etc.
  size?:          'small' | 'medium' | 'large';
  variant?:       'outlined' | 'filled' | 'elevated';
  interactive?:   boolean;
  subtitle?:      string;
  loading?:       boolean;
  onAction?:      (actionId: string, context?: Record<string, unknown>) => void;
}
// Padding: theme.spacing(1) | Icon size: spacing(2/2.5/3) by size
// Trend animation: pulse 0.5s ease-in-out scale(1→1.1)
```

### Table

```typescript
interface TableProps {
  headers:                  /* normalized header format */;
  rows?:                    Record<string, unknown>[];
  data?:                    /* alternative data source */;
  hoverable?:               boolean;
  loading?:                 boolean;
  onRowClick?:              (row: Record<string, unknown>, index: number) => void;
  clickable?:               boolean;
  pagination?:              /* pagination config */;
  sortBy?:                  string;
  sortDirection?:           'asc' | 'desc';
  onSort?:                  (sortBy: string, direction: 'asc' | 'desc') => void;
  selectable?:              boolean;
  selectedRows?:            string[];
  onRowSelection?:          (selectedRows: string[]) => void;
  enableColumnSelector?:    boolean;
  tableId?:                 string;
  preferencesAdapter?:      /* persistence adapter */;
}
// Hooks used internally: useColumnManagement, useRowData, useSortManagement,
//   usePinnedColumnOffsets, useChangeDetection, useDelayedLoading
```

### Card

```typescript
interface CardProps {
  variant?:     'default' | 'elevated' | 'outlined' | 'flat' | 'glass';
  size?:        'small' | 'medium' | 'large' | 'wide';
  hoverable?:   boolean;
  hoverEffect?: 'none' | 'lift' | 'scale' | 'glass';
  header?:      React.ReactNode;
  title?:       string;
  description?: string;
  footer?:      React.ReactNode;
  icon?:        React.ReactNode;
  loading?:     boolean;
  clickable?:   boolean;
  onClick?:     () => void;
  withBorder?:  boolean;
  sx?:          SxProps<Theme>;
}
// minHeight: small=120px, medium=200px, large=300px, wide=200px
// Glass variant (dark): linear-gradient(180deg, rgba(30,30,30,0.50) 0%, rgba(18,18,18,0.50) 100%)
//   + backdropFilter: blur(18.5px)
// Glass variant (light): rgba(255,255,255,0.7)
// Focus outline: 2px solid theme.palette.primary.main, outlineOffset: 2px
// No MUI Paper overlay: --Paper-overlay: none, backgroundImage: none
```

### Modal

```typescript
interface ModalProps {
  open:          boolean;
  onClose:       () => void;
  title?:        string;
  children:      React.ReactNode;
  dimensions?:   { width?: string | number; height?: string | number };
  ariaLabelledBy?: string;
}
// Positioning: top:50%, left:50%, transform: translate(-50%, -45vh)
// Default width: 90vw, maxWidth: 1200px
// Default height: auto, maxHeight: 90vh
// Background: var(--mui-palette-background-paper-elevation-1)
// Border-radius: 8px (borderRadius: 2 in MUI units)
// boxShadow: 24 (MUI elevation shadow)
// Animation: Fade with closeAfterTransition
// Backdrop: rgba(0, 0, 0, 0.35)
```

### Slideout (Drawer Panel)

```typescript
interface SlideoutProps {
  open:     boolean;
  onClose:  () => void;
  title?:   string;
  children: React.ReactNode;
  width?:   string | number;
  anchor?:  'left' | 'right' | 'top' | 'bottom';
}
// Slides in from right by default
```

### PageContainer

```typescript
interface PageContainerProps {
  children:    React.ReactNode;
  minHeight?:  string;             // default: '100vh'
  breadcrumb?: React.ReactNode;
}
// paddingX: {xs:1, sm:3, md:8}  (8/24/64px)
// paddingY: {xs:1, sm:3, md:5}  (8/24/40px)
// Breadcrumb: backdropFilter blur(18.5px), border-bottom: 1px divider
// Breadcrumb bg dark:  linear-gradient(...)
// Breadcrumb bg light: rgba(255,255,255,0.7)
```

### PageHeader

```typescript
interface PageHeaderProps {
  title:        string;          // rendered as h5
  intro?:       string;          // body1, secondary color
  description?: string;          // body1, secondary color
  actions?:     React.ReactNode; // right-aligned
}
// Layout: flex, justifyContent: space-between, mb: 5 (40px)
```

### Filters

```typescript
// Filter types:
type FilterConfig = SearchFilterConfig | FacetFilterConfig | DateRangeFilterConfig | RqlFilterConfig;
// Supports: search (text), facets (multi-select), date ranges, RSQL relationship filters
// Filter chips shown for applied filters
// Sections: Search grid | Facet grid | Date range grid | Relationships (collapsible)
```

### Charts (ECharts Wrapper)

```typescript
// ECharts theme auto-built from MUI palette:
// - color: muiTheme.palette.chartPalette.colors (12 colors)
// - fontFamily: muiTheme.typography.fontFamily
// - text colors: palette.text.primary / secondary
// - gridlines: palette.divider
// - tooltip bg: palette.background.paper
// - title: typography.h6 sizing/weight
// Auto-detects chart type, handles empty/loading states
```

### Other Components (implement per spec above)

`Button`, `Input`, `Icon`, `Typography`, `Breadcrumb`, `Pagination`, `Loading`, `Error`, `Notification` (AlertManager), `List`, `Summary`, `CodeBlock`, `TabNavigation`, `Carousel`, `MasonryCatalog`, `Currency`, `Date`

---

## 8. Config-Driven UI System

The most important architectural feature. Views are JSON configs, not React code.

### TypeScript Types

```typescript
// ViewConfig — top-level view definition
type ViewConfig = {
  id:          string;
  tenantId:    string;
  title:       string;
  description?: string;
  layout?:     LayoutNode;         // Grid/Stack/Tab/Carousel
  components:  ViewComponent[];    // List of all components
  actions?:    Actions[];
  filters?:    FilterConfig[];
  dataSource?: DataSource | DataSource[];
  dataBinding?: DataBinding;
  realtime?:   ViewConfigRealtime;
};

// ViewComponent — a single component inside a view
type ViewComponent = {
  type:         string;            // 'chart' | 'table' | 'text' | 'kpi' | 'form' | 'summary' | 'list'
  id:           string;
  title?:       string;
  description?: string;
  props?:       Record<string, unknown>;
  dataSource?:  DataSource | DataSource[];
  dataBinding?: DataBinding;
  actions?:     Actions[];
  filters?:     FilterConfig[];
  metadata?: {
    hideTitle?:       boolean;
    hideDescription?: boolean;
    hideCard?:        boolean;
  };
};

// DataSource — API call config
type DataSource = {
  id?:               string;
  purpose?:          'data' | 'filters' | 'actions' | 'metadata';
  method:            'GET' | 'POST' | 'PUT' | 'DELETE';
  path:              string;         // e.g. '/api/v1/incidents'
  params?:           Record<string, unknown>;
  body?:             Record<string, unknown>;
  headers?:          Record<string, string>;
  responseTransform?: string;        // JMESPath
  transform?:        DataSourceTransform;
  disableCache?:     boolean;
  inheritFilters?:   boolean;
  errorHandling?:    'default' | 'component' | 'ignore';
};

// DataBinding — map API response fields → component props
interface DataBinding {
  bindings:  Record<string, string | DataBindingConfig>;
  strategy?: 'merge' | 'replace' | 'overlay';
}
interface DataBindingConfig {
  path:      string;                 // JMESPath or JSONata expression
  engine?:   'jmespath' | 'jsonata';
  transform?: string;
  fallback?: unknown;
}

// Layout — Grid, Stack, Tab, Carousel
interface GridLayoutNode {
  type: 'grid';
  rows: Array<{
    columns: Array<{
      size: number | string | Record<string, number | string>;  // 1-12
      sx?: SxProps;
      children?: LayoutNode[];
    }>;
    sx?: SxProps;
  }>;
}
interface StackLayoutNode { type: 'stack'; direction?: 'row' | 'column'; children: LayoutNode[]; }
interface ComponentLayoutNode { type: 'component'; id: string; }
interface TabLayoutNode {
  type: 'tab';
  tabs: Array<{ name: string; icon?: string; disabled?: boolean; badge?: string | number; layout: LayoutNode; }>;
  defaultTab?: number;
}
type LayoutNode = GridLayoutNode | StackLayoutNode | ComponentLayoutNode | TabLayoutNode;

// Actions
interface NavigationAction {
  id: string; title: string; type: 'navigation';
  trigger: 'click' | 'doubleClick' | 'rightClick' | 'success' | 'error' | 'change';
  target?: 'row' | 'cell' | 'component';
  navigation: {
    viewId?: string;
    presentation?: 'fullPage' | 'modal' | 'slideout';
    dimensions?: { width?: string | number; height?: string | number };
    params?: ParameterMapping[];
    url?: string;
    openInNewTab?: boolean;
  };
}
interface EntityCrudAction {
  id: string; title: string; type: 'entity-crud';
  trigger: 'click';
  form: { inputSchema: object; /* JSON Schema */ };
  endpoint: { method: string; path: string };
  onSuccess?: ActionResultHandling;
  onError?: ActionResultHandling;
}
```

### Example View Config JSON

```json
{
  "id": "incidents-dashboard",
  "tenantId": "DEFAULT",
  "title": "Incidents Dashboard",
  "layout": {
    "type": "grid",
    "rows": [
      {
        "columns": [
          { "size": 3, "children": [{ "type": "component", "id": "kpi-total" }] },
          { "size": 3, "children": [{ "type": "component", "id": "kpi-critical" }] },
          { "size": 3, "children": [{ "type": "component", "id": "kpi-open" }] },
          { "size": 3, "children": [{ "type": "component", "id": "kpi-resolved" }] }
        ]
      },
      {
        "columns": [
          { "size": 8, "children": [{ "type": "component", "id": "incidents-chart" }] },
          { "size": 4, "children": [{ "type": "component", "id": "severity-pie" }] }
        ]
      },
      {
        "columns": [
          { "size": 12, "children": [{ "type": "component", "id": "incidents-table" }] }
        ]
      }
    ]
  },
  "components": [
    {
      "id": "kpi-total",
      "type": "kpi",
      "title": "Total Incidents",
      "dataSource": { "method": "GET", "path": "/api/v1/incidents/stats" },
      "dataBinding": { "bindings": { "value": "total", "trend": "trend_direction" } }
    },
    {
      "id": "incidents-chart",
      "type": "chart",
      "title": "Incidents Over Time",
      "props": {
        "option": {
          "xAxis": { "type": "time" },
          "yAxis": { "type": "value" },
          "series": [{ "type": "line", "smooth": true }]
        }
      },
      "dataSource": { "method": "GET", "path": "/api/v1/incidents/timeseries" }
    },
    {
      "id": "incidents-table",
      "type": "table",
      "title": "Recent Incidents",
      "dataSource": { "method": "GET", "path": "/api/v1/incidents", "params": { "size": 25 } },
      "actions": [
        {
          "id": "view-detail",
          "title": "View",
          "type": "navigation",
          "trigger": "click",
          "target": "row",
          "navigation": { "viewId": "incident-detail", "presentation": "slideout" }
        }
      ]
    }
  ]
}
```

### Rendering Pipeline

```
ConfigDrivenUi (entry — receives viewId or ViewConfig)
└── ConfigDrivenUiProvider (base context + render actions)
    └── ViewsRenderer (iterates multiple views)
        └── ViewsProvider (Zustand store: per-view component data, caching, dedup)
            └── ViewRenderer (single view, applies layout)
                └── ComponentRenderer (per component)
                    ├── useIntersectionObserver → lazy load only when visible
                    ├── useLazyComponentData → fetch + cache + poll API data
                    ├── data binding engine (JMESPath / JSONata)
                    └── dynamic import → actual component (KPI, Table, Chart, etc.)
```

**Two view sources:**
- **Build-time**: JSON files in `core/src/views/configs/` → compiled into bundle
- **Runtime**: `GET /api/v1/views/{viewId}` → tenant-customizable without redeploy

---

## 9. Navigation & Categories

Categories define the entire left-sidebar navigation. File: `core/src/views/categories/categories.json`

```json
{
  "categories": [
    {
      "id": "operations",
      "title": "Operations",
      "description": "Operational dashboards",
      "icon": "Dashboard",
      "required_roles": ["viewer", "operator"],
      "views": [
        { "id": "incidents-dashboard", "title": "Incidents" },
        { "id": "alerts-dashboard",    "title": "Alerts" }
      ],
      "groups": [
        {
          "id": "analytics",
          "title": "Analytics",
          "icon": "BarChart",
          "views": [
            { "id": "metrics-view", "title": "Metrics" }
          ]
        }
      ],
      "i18n": {
        "defaultLanguage": "en",
        "translations": {
          "title": { "en": "Operations", "es": "Operaciones" }
        }
      }
    },
    {
      "id": "hub",
      "title": "Hub",
      "icon": "Home",
      "views": []
    }
  ]
}
```

**Routes generated:**
```
/                               → redirect to first available view
/hub/chat                       → chat landing
/hub/chat/:chatId               → chat detail
/:categoryId/:viewId/*          → config-driven view
/:categoryId/post/:postSlug     → content page
/:categoryId/help/:helpSlug     → help page
```

**RBAC filtering**: Navigation items filtered by `required_roles` vs user's roles from `ContextProvider`.

---

## 10. Authentication Architecture

```typescript
// lib/src/Auth/AuthAdapter.ts
interface AuthAdapter {
  initialize():      Promise<void>;
  login():           Promise<void>;
  logout():          Promise<void>;
  getUser():         Promise<User | null>;
  getToken():        Promise<string | null>;
  isAuthenticated(): Promise<boolean>;
  token?:            string;  // sync access after init
}
```

**Adapters:**
- `MSALAdapter` — Azure Entra ID via `@azure/msal-react`. Config in `VITE_UI_AUTH` JSON.
- `OfflineAdapter` — Mock auth for local dev. Returns hardcoded user. Activated via `VITE_USE_MOCKED_AUTH=true`.

**Selection logic:**
```typescript
// core/src/Auth/adapterInstance.ts
const authConfig = JSON.parse(env.uiAuth || '{}');
const adapter = authConfig.type === 'msal-react'
  ? new MSALAdapter(authConfig.config)
  : new OfflineAdapter();
```

---

## 11. API Integration Pattern

```typescript
// lib/src/services/axios.ts
import axios from 'axios';
import { setupCache } from 'axios-cache-interceptor';

export function createCoreAxiosInstance(token?: string) {
  const instance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
    withCredentials: true,
  });

  // Cache layer (TTL from env, default 3s)
  const cached = setupCache(instance, {
    ttl: (Number(import.meta.env.VITE_API_CACHE_TTL) || 3) * 1000,
  });

  // Auth + tenant headers injected automatically
  cached.interceptors.request.use((config) => {
    if (token) config.headers.Authorization = `Bearer ${token}`;
    const tenantId = getCurrentTenantId();  // from ContextProvider
    if (tenantId) config.headers['X-Tenant-ID'] = tenantId;
    return config;
  });

  return cached;
}

// Usage in components:
const axios = useAxiosInstance();
const { data } = await axios.get('/api/v1/incidents');
// Headers auto-injected:
//   Authorization: Bearer <token>
//   X-Tenant-ID: <current-tenant>
```

---

## 12. Real-Time (SSE)

```typescript
// lib/src/providers/SSEProvider/
// - Wraps EventSource API
// - Auto-reconnect on disconnect
// - Two stream types:
//   1. Global broadcast: system-wide events (notifications, feature flags)
//   2. View-scoped: entity-specific updates tied to current view

// Hook usage:
const { subscribe, unsubscribe } = useSSE();
useEffect(() => {
  const unsub = subscribe('incident:updated', (event) => {
    // refresh component data
  });
  return unsub;
}, []);
```

---

## 13. Build Commands & Scripts

```bash
# ─── From apps/web/core/ ───────────────────────────────────
npm run build:full         # Builds lib → installs → builds core (production)
npm run build              # Build core only (lib must be pre-built)
npm run build:lib          # Builds lib as a dependency step
npm run dev                # Vite dev server at :5173 (mocked auth)
npm run test               # Vitest run (bail:1)
npm run test:full          # Full coverage suite + combined reports
npm run lint               # TypeScript check + ESLint
npm run format             # Prettier
npm run preview            # Preview production build
npm run validate           # Validate ViewConfig JSON files
npm run bundle:locales      # Merge lib + core i18n files

# ─── From apps/web/lib/ ────────────────────────────────────
npm run dev                # Storybook at :4200
npm run build              # Full lib build (clean + locales + typecheck + lint + vite + webcomponents)
npm run build:lightweight  # Quick build (skip webcomponents)
npm run test               # Vitest run
npm run storybook          # Launch Storybook dev server
npm run generate:stories   # Auto-generate stories from configs
npm run generate:docs      # Generate AI agent documentation

# ─── From apps/web/plugins/ ───────────────────────────────
npm run dev                # Plugin dev server at :3001 (hot reload)
npm run build              # Build all plugins in parallel

# ─── From apps/web/shared/ ────────────────────────────────
npm run sync-versions      # Sync versions.json into all package.json files

# ─── From monorepo root (Makefile) ────────────────────────
make run                   # Full stack: backend + frontend + DB + Redis
make backend               # API only (fastest backend dev)
make ui-dev                # Frontend only at :5173
make test                  # Full test suite with coverage
make test-web              # Web UI tests only
make lint                  # Ruff + ESLint
make bootstrap             # One-time: uv sync + npm install everywhere
make obs                   # Observability stack (Grafana, Prometheus, OTEL)
```

---

## 14. Environment Variables

File: `apps/web/core/.env`

Implementation note for this workspace:
- Root onboarding template is `.env.example`.
- Both legacy env keys (`USE_MOCK_AUTH`, `USE_MOCK_DATA`, `MOCK_DATA_SCALE`, `API_BASE_URL`) and VITE aliases (`VITE_USE_MOCKED_AUTH`, `VITE_USE_MOCKED_DATA`, `VITE_MOCK_DATA_SCALE`, `VITE_API_BASE_URL`) are supported during migration.
- Local scale presets are available via `MOCK_DATA_SCALE=small|10k|100k|600k|1m|2m`.

```bash
# API
VITE_API_BASE_URL=http://localhost:8000/api
VITE_API_TIMEOUT=30000
VITE_API_CACHE_TTL=3
VITE_API_WITH_CREDENTIALS=true

# Auth — set to '{"type":"offline"}' for local dev, or full MSAL config for prod
VITE_UI_AUTH='{"type":"offline"}'
# MSAL example:
# VITE_UI_AUTH='{"type":"msal-react","config":{"auth":{"clientId":"<id>","authority":"https://login.microsoftonline.com/<tenant>","redirectUri":"http://localhost:5173"}}}'

# Dev flags
VITE_USE_MOCKED_AUTH=true
VITE_USE_MOCKED_DATA=false
VITE_ENABLE_THEME_EDITOR=false

# Tenant
VITE_DEV_DEFAULT_TENANT=DEFAULT
VITE_DEV_API_KEY_DEFAULT=<generated-by-make-run>
VITE_DEV_API_KEY_SYSTEM=<generated-by-make-run>

# Application Identity (RENAME THESE)
VITE_UI_NAME="Your Platform Name"
VITE_PRODUCT_FULL_NAME="Your Platform Full Name"
VITE_BASE_PATH=/
```

---

## 15. Testing Strategy

| Rule | Detail |
|------|--------|
| **Runner** | Vitest 3+ with `bail: 1` — stops at first failure |
| **Component testing** | `@testing-library/react` — semantic queries only (role, label, text) |
| **No testIds** | Do not use `data-testid` in queries |
| **Accessibility** | `jest-axe` test for every component |
| **Mock cleanup** | `vi.clearAllMocks()` in every `beforeEach` |
| **State changes** | Wrap in `act()` from `@testing-library/react` |
| **Async** | Use `waitFor()` after async operations |
| **Disabled elements** | Never click a disabled button — check enabled state first |
| **Mock declarations** | Define all variables BEFORE using in `vi.mock()` calls |
| **i18n mocking** | Always mock `react-i18next` in lib tests |
| **Theme testing** | Test both light + dark modes in lib component tests |
| **Lib tests** | Focus: isolation, props, reusability, no app context deps |
| **Core tests** | Focus: user behavior, integration with contexts, mock external hooks |
| **Never-resolving promises** | Never use these in mocks — they cause test hangs |

---

## 16. Prompt for AI — Recreate This Project

Copy this entire prompt into any AI coding assistant (GitHub Copilot, Claude, ChatGPT) to scaffold a new project with this exact UI architecture under a different name:

---

> **Build a new multi-tenant SaaS dashboard project called `[YOUR_PROJECT_NAME]` using the following exact architecture. This is the UI layer only — the backend is a separate FastAPI service. Keep all component structure, theme values, and patterns identical to the specification below. Only change the product name, logo, and use-case-specific content.**
>
> ### Folder Structure
> Create `apps/web/` with four sub-folders: `lib/`, `core/`, `plugins/`, `shared/`.
>
> - **`lib/`** is a self-contained React component library published as `@[yourname]/ui-lib`. It has NO dependency on `core/`. It exports: ThemeProvider, AxiosProvider, SSEProvider, all UI components (KPI, Table, Chart, Card, Modal, Slideout, Filters, Form, Text, List, Summary, Loading, Error, Notification, PageContainer, PageHeader, Breadcrumb, Pagination, Icon, Typography, Button, Date, CodeBlock, TabNavigation), and the Config-Driven UI system (ConfigDrivenUi, ViewRenderer, ComponentRenderer, ViewsProvider).
>
> - **`core/`** is the main app shell `@[yourname]/ui-core`. It imports ONLY from `@[yourname]/ui-lib` for UI components — never from `@mui/material` directly. It contains: Auth adapters (MSAL + Offline), Sidebar (56px icon strip + 244px nav drawer), routes, ContextProvider (tenant + user + features), NavigationContext (RBAC-filtered views from categories.json), SSE integration, PreferencesInitializer.
>
> - **`plugins/`** is a universal Vite builder. Each plugin is a folder with `plugin.config.json` + `src/index.tsx`. No individual build config needed.
>
> - **`shared/`** has `versions.json` as single source of truth for all package versions, plus shared tsconfig, eslint, and vite alias configs.
>
> ### Exact Theme (MUI v7 extendTheme)
>
> **Dark theme** (default mode):
> - `background.default`: `#121212`, `background.paper`: `#232323`
> - `primary.main`: `#e0e0e0` (near-white)
> - `secondary.main`: `#be82ff` (Archaic Search purple)
> - `text.primary`: `#eeeeee`, `text.secondary`: `#9e9e9e`
> - `divider`: `rgba(255,255,255,0.12)`
> - `action.hover`: `rgba(160,85,245,0.08)` (purple tint)
> - Elevation surfaces from `#1e1e1e` (elev-1) up to `#383838` (elev-24)
>
> **Light theme**:
> - `background.default`: `#F5F5F5`, `background.paper`: `#ffffff`
> - `primary.main`: `#212121` (near-black), `secondary.main`: `#0041f0` (enterprise blue)
> - `text.primary`: `#212121`, `text.secondary`: `#616161`
> - `divider`: `rgba(0,0,0,0.12)`
>
> **Shared brand palette** (`customBrand`):
> - corePurple1: `#a100ff`, corePurple2: `#7500c0`, corePurple3: `#460073`
> - accentPurple2: `#a055f5`, accentPurple3: `#be82ff`, accentPurple4: `#dcafff`
> - enterpriseBlue3: `#668df6`, enterpriseBlue5: `#0041f0`, enterpriseBlue6: `#0037ea`
>
> **Typography**: font-family `Graphik, Inter, system-ui, sans-serif`, base 14px
>
> **Component overrides**: buttons `textTransform: none`, `borderRadius: 8px`; cards `borderRadius: 12px`; papers `borderRadius: 8px`
>
> **ThemeProvider** (`lib/src/theme/provider.tsx`): reads/writes `localStorage` key `[your-app]-theme-mode`, respects `prefers-color-scheme` as fallback, wraps `MuiThemeProvider` + `CssBaseline`. Export `useTheme()` hook returning `{ themeMode, setThemeMode, toggleTheme }`.
>
> ### Layout Dimensions
> - Left icon strip: `56px` wide, `100svh` tall
> - Nav drawer: `244px` wide (`DRAWER_WIDTH = 244`), toggle animation `200ms cubic-bezier(0.4,0,0.2,1)`
> - PageContainer: padding `{xs:1, sm:3, md:8}` horizontal, `{xs:1, sm:3, md:5}` vertical
> - Content max-width: `1200px`
> - Modal: max-width `1200px`, max-height `90vh`, centered with `translate(-50%, -45vh)`
> - Card glass variant: `backdropFilter: blur(18.5px)`
> - Card hover lift: `translateY(-4px)`, transition `all 0.3s ease`
>
> ### Provider Hierarchy (exact nesting in App.tsx)
> `ThemeProvider` → `AxiosProvider` → `AuthProvider` → `BrowserRouter` → `AppErrorBoundaryWrapper` → `AlertManagerProvider` → `I18nProvider` → `SidebarProvider` → `ContextProvider` → `SSEProvider` → `PreferencesInitializer` + `Content`
>
> ### Config-Driven UI System
> Build a `ConfigDrivenUi` component that: (1) accepts a `viewId` or `ViewConfig` object, (2) fetches config from `GET /api/v1/views/{viewId}` if ID given, (3) uses a Zustand store per view for component data caching and request deduplication, (4) renders components lazily with `IntersectionObserver`, (5) supports JMESPath and JSONata data binding between API responses and component props, (6) supports layout types: grid (12-col), stack (row/column), tab, carousel. Support component types: `kpi`, `table`, `chart`, `text`, `form`, `summary`, `list`.
>
> ### Navigation
> Categories defined in `core/src/views/categories/categories.json`. Each category has `id`, `title`, `icon`, `required_roles`, `views[]`, `groups[]`. Views filtered by user roles. Routes: `/:categoryId/:viewId/*` renders ViewRenderer. Chat routes: `/hub/chat` and `/hub/chat/:chatId`.
>
> ### Authentication
> `AuthAdapter` interface with `initialize()`, `login()`, `logout()`, `getUser()`, `getToken()`, `isAuthenticated()`. Implement `MSALAdapter` (Azure Entra via `@azure/msal-react`) and `OfflineAdapter` (mock, for local dev). Select adapter based on `VITE_UI_AUTH` env var. Expose via singleton `adapterInstance`.
>
> ### API Client
> Single Axios instance via `axios-cache-interceptor`. TTL from `VITE_API_CACHE_TTL` (default 3s). Interceptors auto-inject `Authorization: Bearer <token>` and `X-Tenant-ID: <tenantId>`. Export `useAxiosInstance()` hook.
>
> ### Real-time
> `SSEProvider` wrapping `EventSource`, with auto-reconnect, global + view-scoped event channels, `useSSE()` hook.
>
> ### Build
> - `lib`: `npm run build` → vite library mode + web component build; `npm run dev` → Storybook :4200
> - `core`: `npm run build:full` → builds lib then core; `npm run dev` → Vite :5173
> - `plugins`: `npm run dev` → Express dev server :3001 with hot reload
>
> ### Testing
> Vitest 3+, `bail: 1`, `@testing-library/react` semantic queries, `jest-axe` for every component, `vi.clearAllMocks()` in `beforeEach`, `act()` for state, `waitFor()` for async, always mock `react-i18next` in lib tests.
>
> **Replace these strings with your product:**
> - `archaic` / `archaic` → `[your product name]`
> - `@archaic/ui-lib` → `@[yourname]/ui-lib`
> - `@archaic/ui-core` → `@[yourname]/ui-core`
> - `archaic-theme-mode` localStorage key → `[yourapp]-theme-mode`
> - `VITE_UI_NAME` → `"[Your Product Name]"`
> - Logo asset in `NavigationCategories` → your own logo file

---

## 17. User Preferences System

The preferences system persists per-user UI state (theme, language, active filters, column visibility, column order, pinned columns, page size) to the backend and restores it on next login.

### Architecture Overview

```
lib/src/services/preferences/
├── PreferencesAdapter.ts   ← interface (implemented in core)
├── types.ts                ← TypeScript schema for all stored data
└── utils.ts                ← helper functions for filters/columns/pageSize

core/src/services/preferences/
└── ApiPreferencesAdapter.ts ← production implementation (HTTP + debounce)

core/src/components/
└── PreferencesInitializer.tsx ← applies stored theme+language on mount

core/src/providers/
└── ContextProvider.tsx     ← creates adapter, injects into context
```

### PreferencesAdapter Interface

```typescript
// lib/src/services/preferences/PreferencesAdapter.ts
export interface PreferencesAdapter {
  getPreference<T>(key: string): Promise<T | null>;
  setPreference<T>(key: string, value: T): Promise<void>;
  clearPreference(key: string): Promise<void>;
  clearAllPreferences?(): Promise<void>;
  getPreferences?(): Promise<Record<string, unknown>>;
  deletePreferences?(): Promise<void>;
  flush?(): Promise<void>;
  getPreferencesSync?(): Record<string, unknown> | null;
}
```

**Key-path format:** dot-notation strings.  
- `'ui'` → top-level UI settings (theme, language)  
- `'views.dashboard.filters'` → filters for the "dashboard" view  
- `'components.incidents-table.columns'` → column config for a component  
- `'components.incidents-table.pageSize'` → page size for a component  

### ApiPreferencesAdapter (Production)

```typescript
// core/src/services/preferences/ApiPreferencesAdapter.ts

// Module-level singleton — survives component remounts
let preferencesAdapterSingleton: ApiPreferencesAdapter | null = null;

export class ApiPreferencesAdapter implements PreferencesAdapter {
  private cache: Record<string, unknown> | null = null;
  private pendingWrites: Record<string, unknown> = {};
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private axiosInstance: AxiosInstance,
    private options: { debounceMs?: number; debug?: boolean } = {}
  ) {}

  // GET /api/v1/users/me/preferences on first call; 404 → initialise with {}
  async getPreference<T>(key: string): Promise<T | null> { ... }

  // Optimistic cache update; debounced PATCH /api/v1/users/me/preferences
  async setPreference<T>(key: string, value: T): Promise<void> { ... }

  // Clears a dot-notation path from cache + queues PATCH
  async clearPreference(key: string): Promise<void> { ... }

  // Force-flush all pending writes immediately (bypasses debounce)
  async flush(): Promise<void> { ... }

  // Returns in-memory cache synchronously (null until first getPreference call)
  getPreferencesSync(): Record<string, unknown> | null { ... }

  // Call when tenant context changes (axios instance re-created)
  updateAxiosInstance(instance: AxiosInstance): void { ... }
}

export function getOrCreatePreferencesAdapter(axiosInstance: AxiosInstance): ApiPreferencesAdapter {
  if (!preferencesAdapterSingleton) {
    preferencesAdapterSingleton = new ApiPreferencesAdapter(axiosInstance, { debounceMs: 1500 });
  } else {
    preferencesAdapterSingleton.updateAxiosInstance(axiosInstance);
  }
  return preferencesAdapterSingleton;
}
```

**API shape:** `PATCH /api/v1/users/me/preferences` sends `{ "ui": {...}, "views": {...}, "components": {...} }` as a shallow merge (each top-level key replaces its server-side counterpart).

**Debounce:** All writes within a 1500 ms window are batched into a single PATCH. Calling `flush()` immediately dispatches the pending batch (useful on tab close / logout).

### TypeScript Schema

```typescript
// lib/src/services/preferences/types.ts

export const COLUMN_PREFERENCE_VERSION = 1; // bump to invalidate old column configs

export interface FilterPreferenceMetadata {
  updated_at: string; // ISO-8601
  version: number;
}

export interface PersistedFilterSet {
  _meta: FilterPreferenceMetadata;
  filters: Record<string, string>; // filterId → encoded filter value
}

export interface PersistedColumnConfig {
  _meta: FilterPreferenceMetadata;
  columnVisibility: Record<string, boolean>; // columnId → visible?
  columnOrder: string[];                      // ordered list of columnIds
  pinnedColumns: string[];                    // columnIds pinned to the left
}

export interface ComponentPreferences {
  _meta?: FilterPreferenceMetadata;
  filters?: PersistedFilterSet;
  columns?: PersistedColumnConfig;
  pageSize?: number;
}

export interface ViewPreferences {
  _meta?: FilterPreferenceMetadata;
  filters?: PersistedFilterSet;
  components?: Record<string, ComponentPreferences>; // componentId → prefs
}

export interface UserPreferences {
  ui?: { theme?: 'light' | 'dark'; language?: string };
  views?: Record<string, ViewPreferences>;            // viewId → prefs
  components?: Record<string, ComponentPreferences>;  // componentId → prefs
}
```

### Utility Functions

```typescript
// lib/src/services/preferences/utils.ts

// ── Filters ──────────────────────────────────────────────────────────────────
// scope: 'views' persists at views.{id}.filters
// scope: 'components' persists at components.{id}.filters

loadFiltersFromPreferences(
  adapter: PreferencesAdapter,
  scope: 'views' | 'components',
  id: string
): Promise<Record<string, string>>
// Returns {} if nothing stored yet.

saveFiltersToPreferences(
  adapter: PreferencesAdapter,
  scope: 'views' | 'components',
  id: string,
  filters: Record<string, string>
): Promise<void>
// Wraps filters in { _meta: { updated_at, version }, filters } before writing.

clearFiltersFromPreferences(
  adapter: PreferencesAdapter,
  scope: 'views' | 'components',
  id: string
): Promise<void>

getPersistedFilterIds(
  adapter: PreferencesAdapter,
  scope: 'views' | 'components',
  id: string
): Promise<string[]>
// Returns Object.keys() of the stored filters object.

getFilterMetadata(
  adapter: PreferencesAdapter,
  scope: 'views' | 'components',
  id: string
): Promise<{ updated_at: string; version: number } | null>

// ── Columns ───────────────────────────────────────────────────────────────────
// All column prefs stored at components.{componentId}.columns

loadColumnsFromPreferences(
  adapter: PreferencesAdapter,
  componentId: string
): Promise<{ columnVisibility: Record<string,boolean>; columnOrder: string[]; pinnedColumns: string[] } | null>
// Returns null on COLUMN_PREFERENCE_VERSION mismatch (triggers profile reset).

saveColumnsToPreferences(
  adapter: PreferencesAdapter,
  componentId: string,
  config: { columnVisibility: Record<string,boolean>; columnOrder: string[]; pinnedColumns: string[] }
): Promise<void>

clearColumnsFromPreferences(
  adapter: PreferencesAdapter,
  componentId: string
): Promise<void>

// ── Page Size ─────────────────────────────────────────────────────────────────
// Stored at components.{componentId}.pageSize

savePageSizeToPreferences(
  adapter: PreferencesAdapter,
  componentId: string,
  pageSize: number
): Promise<void>

loadPageSizeFromPreferences(
  adapter: PreferencesAdapter,
  componentId: string
): Promise<number | null>
```

### PreferencesInitializer Component

Rendered inside all providers (returns `null` — side effects only). On mount, reads `'ui'` preference and applies stored theme and language:

```typescript
// core/src/components/PreferencesInitializer.tsx
const PreferencesInitializer = () => {
  const { context } = useContext(archaicContext);
  const { setThemeMode } = useThemeContext();

  useEffect(() => {
    context.preferencesAdapter
      .getPreference<{ theme?: string; language?: string }>('ui')
      .then((prefs) => {
        if (prefs?.theme === 'light' || prefs?.theme === 'dark') setThemeMode(prefs.theme);
        if (prefs?.language === 'en' || prefs?.language === 'ita') i18n.changeLanguage(prefs.language);
      })
      .catch(() => { /* non-fatal — use defaults */ });
  }, []);

  return null;
};
```

### Initialization Order (ContextProvider)

```
1. GET /api/v1/users/me/context  → authenticate + get user roles
2. setTenantContext(tenantId)    → configure axios X-Tenant-ID header
3. initializeApiViews()         → load navigation categories
4. preferencesAdapter.getPreference('ui')  ← pre-warms cache (avoids
                                              double-fetch in Initializer)
```

### How to Add a New Preference

| What to persist | Path pattern | Util to use |
|---|---|---|
| Per-view filter state | `views.{viewId}.filters` | `saveFiltersToPreferences(adapter, 'views', viewId, filters)` |
| Per-component filter state | `components.{componentId}.filters` | `saveFiltersToPreferences(adapter, 'components', componentId, filters)` |
| Column visibility/order | `components.{componentId}.columns` | `saveColumnsToPreferences(adapter, componentId, config)` |
| Page size | `components.{componentId}.pageSize` | `savePageSizeToPreferences(adapter, componentId, n)` |
| Theme | `ui.theme` | `adapter.setPreference('ui', { ...ui, theme: 'dark' })` |
| Language | `ui.language` | `adapter.setPreference('ui', { ...ui, language: 'en' })` |
| Any custom state | `custom.{yourKey}` | `adapter.setPreference('custom.{yourKey}', value)` |

For a completely new top-level preference category:
1. Add a TypeScript interface in `lib/src/services/preferences/types.ts`
2. Extend `UserPreferences` with the new field
3. Add loader/saver functions in `utils.ts` following existing patterns
4. Wire into your component — no changes to `ApiPreferencesAdapter` needed

---

## 18. RBAC & Role-Based Navigation

Role filtering is **frontend-only for navigation visibility**. The backend enforces access independently via its own middleware. Frontend RBAC hides irrelevant navigation items; it does not grant access permissions.

### User Type & Roles

```typescript
// core/src/services/user.ts

export interface UserTenant {
  tenant_id: string;
  tenant_name: string;
  roles?: string[];
  scopes?: string[];
}

export interface UserResponse {
  id: string;
  display_name: string;
  first_name: string;
  last_name: string;
  email: string;
  tenants: UserTenant[];
  current_roles: string[];   // roles for the currently active tenant
  current_scopes: string[];
}
```

**Fetched from:** `GET /api/v1/users/me/context` (includes `X-Tenant-ID` header after tenant selection).

**normalizeUserData:** If `current_roles` is empty on first load (no `X-Tenant-ID` header sent yet), copies the first tenant's `roles` array into `current_roles` as a fallback.

### System Admin Detection

```typescript
// core/src/providers/ContextProvider.tsx
const isSystemAdmin = user.current_roles.includes('system:admin');
if (isSystemAdmin) {
  tenantId = 'SYSTEM';
  actingTenantId = user.tenants.find((t) => t.tenant_id !== 'SYSTEM')?.tenant_id;
}
```

A system admin user sees a virtual `SYSTEM` tenant and can act on behalf of a real tenant via `actingTenantId`.

### RBAC Core Functions

```typescript
// core/src/contexts/NavigationContext.tsx

/**
 * Returns true if the user has at least one of the required roles (any-of match).
 * Returns true if requiredRoles is empty (no restriction).
 * Case-sensitive.
 */
export const hasRequiredRole = (
  userRoles: string[],
  requiredRoles: string[]
): boolean => {
  if (!requiredRoles || requiredRoles.length === 0) return true;
  return requiredRoles.some((role) => userRoles.includes(role));
};

/**
 * Recursively filters a NavigationCategory list by the current user's roles.
 * - Removes individual views the user lacks roles for
 * - Removes groups where all child views are inaccessible
 * - Removes categories that have no accessible views or groups
 */
export const filterCategoriesByRoles = (
  categories: NavigationCategory[],
  userRoles: string[]
): NavigationCategory[] => {
  return categories
    .map((category) => ({
      ...category,
      views: (category.views ?? []).filter((view) =>
        hasRequiredRole(userRoles, view.required_roles ?? [])
      ),
      groups: (category.groups ?? [])
        .map((group) => ({
          ...group,
          views: (group.views ?? []).filter((view) =>
            hasRequiredRole(userRoles, view.required_roles ?? [])
          ),
        }))
        .filter((group) => group.views.length > 0),
    }))
    .filter(
      (category) =>
        category.views.length > 0 || category.groups.length > 0
    );
};
```

### Navigation Categories JSON — Role Configuration

```json
// core/src/views/categories/categories.json (excerpt)
{
  "categories": [
    {
      "id": "operations",
      "title": "Operations",
      "icon": "SupportAgent",
      "required_roles": [],            // empty = visible to all
      "views": [
        {
          "id": "incidents",
          "title": "Incidents",
          "path": "/operations/incidents",
          "required_roles": ["user:default", "system:admin"]
        }
      ],
      "groups": [
        {
          "id": "advanced",
          "title": "Advanced",
          "required_roles": ["user:admin"],
          "views": [
            {
              "id": "audit-log",
              "title": "Audit Log",
              "path": "/operations/audit-log",
              "required_roles": ["user:admin"]
            }
          ]
        }
      ]
    }
  ]
}
```

`required_roles` can be set at the **category**, **group**, or **view** level. The filter applies all three levels independently.

### Built-in Role Values

| Role string | Meaning |
|---|---|
| `user:default` | Standard logged-in user |
| `user:admin` | Tenant-level administrator |
| `system:admin` | Cross-tenant system superuser |
| `user:read_only` | Read-only access |

You can define custom roles; add them to the tenant config in the backend and reference them in `required_roles`.

### Adding a New Role-Gated View

1. Add the view entry in `categories.json` with `"required_roles": ["your:role"]`
2. Assign `your:role` to users via the tenant management API
3. No code changes required — `filterCategoriesByRoles` handles it automatically

---

## 19. Icon Handling System

Icons come in two types:
- **`'icon'`** — custom SVG files rendered as `<img>` with CSS filter color tinting
- **`'mui-icon'`** — MUI icons rendered as SVG components with MUI's `sx` color system

### IIcon Props Interface

```typescript
// lib/src/components/Icon/Icon.tsx
export interface IIcon {
  iconType?: 'icon' | 'mui-icon'; // default: 'icon'
  icon: string;                   // icon name (key in iconsList or MUI_ICON_REGISTRY)
  colorCssVar?: string;           // CSS variable name (without '--') for explicit color
  colorHexValue?: string;         // Hex color string for explicit color
  hoverColorCssVar?: string;      // CSS variable for hover state filter
  muiColor?: 'inherit' | 'primary' | 'secondary' | 'action' | 'error'
           | 'disabled' | 'info' | 'success' | 'warning'; // MUI icon color prop
  fontSize?: 'inherit' | 'large' | 'medium' | 'small';   // MUI icon size
  className?: string;
}
```

**Color resolution priority (both icon types):**
1. `colorHexValue` / `colorCssVar` — explicit override (highest priority)
2. `ICON_COLOR_CATEGORY[icon]` → `theme.palette.iconColors[category]` — semantic auto-color
3. No color applied (icon renders in its default appearance)

### ICON_COLOR_CATEGORY Map

```typescript
// lib/src/components/Icon/IconUtils.tsx
export const ICON_COLOR_CATEGORY: Record<string, string> = {
  // Error / Critical
  Block: 'status-error',
  Error: 'status-error',
  HexagonOutlined: 'status-error',

  // Major Warning / High (maps to status-warning-major)
  Report: 'status-warning-major',
  KeyboardDoubleArrowUpOutlined: 'status-warning-major',

  // Warning / Medium
  Warning: 'status-warning',
  KeyboardArrowUpOutlined: 'status-warning',

  // Info / Normal / In-Progress
  Info: 'status-info',
  CircleOutlined: 'status-info',
  CheckCircleOutline: 'status-info',
  KeyboardArrowDownOutlined: 'status-info',
  'in-progress': 'status-info',

  // Success / Resolved
  CheckCircle: 'status-success',
  'in-review': 'status-success',

  // Neutral / Unknown / Not-Started
  Help: 'status-neutral',
  PendingOutlined: 'status-neutral',
  HighlightOffOutlined: 'status-neutral',
  Cancel: 'status-neutral',
  RemoveOutlined: 'status-neutral',
  'not-started': 'status-neutral',
  incomplete: 'status-neutral',

  // Brand Purple / Paused / Low
  PauseCircleFilledOutlined: 'status-brand',
  KeyboardDoubleArrowDownOutlined: 'status-brand',

  // Trend indicators
  CallMade: 'trend-positive',
  CallReceived: 'trend-negative',

  // Severity – moderate (teal)
  DragHandleOutlined: 'severity-moderate',
};
```

### Semantic Color Categories → Theme Values

Each category key resolves to a value in `theme.palette.iconColors`:

| Category key | Semantic meaning | Dark mode (example) |
|---|---|---|
| `status-error` | Critical / Error | `#ff5959` (red) |
| `status-warning-major` | High severity | `#ff8c00` (orange-red) |
| `status-warning` | Medium severity | `#ffbf00` (amber) |
| `status-info` | Informational / Normal | `#6db3f2` (blue) |
| `status-success` | Resolved / Success | `#4caf50` (green) |
| `status-neutral` | Unknown / Closed | `#888888` (grey) |
| `status-brand` | Brand accent / Paused | `#be82ff` (purple) |
| `trend-positive` | Positive trend | `#4caf50` (green) |
| `trend-negative` | Negative trend | `#ff5959` (red) |
| `severity-moderate` | Moderate severity | `#26c6da` (teal) |

### Color Resolution Functions

```typescript
// lib/src/components/Icon/IconUtils.tsx

/**
 * Looks up an icon's auto-color from the theme iconColors palette.
 * Direct icon-name override in iconColors takes precedence over category lookup.
 */
export const getIconThemeColor = (
  iconName: string,
  iconColors: Record<string, string> | undefined
): string | undefined => {
  if (!iconColors) return undefined;
  if (iconColors[iconName]) return iconColors[iconName]; // direct override
  const category = ICON_COLOR_CATEGORY[iconName];
  return category ? iconColors[category] : undefined;
};

/**
 * Converts a theme iconColors value to a CSS color for MUI sx.color.
 * CSS variable names → var(--name); hex values passed through unchanged.
 */
export const toMuiColor = (value: string): string =>
  value.startsWith('#') ? value : `var(--${value})`;

/**
 * Converts a hex color or CSS var to a CSS filter string (for <img> tinting).
 */
export const calculateColor = (value: string, type: 'var' | 'hex') => { ... };
```

### MUI Icon Registry

```typescript
// lib/src/components/Icon/constants.ts
export const MUI_ICON_REGISTRY: Record<string, React.ComponentType<SvgIconProps>> = {
  Home: HomeIcon,
  Person: PersonIcon,
  Settings: SettingsIcon,
  Block: BlockIcon,
  Error: ErrorIcon,
  Warning: WarningIcon,
  CheckCircle: CheckCircleIcon,
  Info: InfoIcon,
  // ... ~50 entries
};
```

### Custom SVG Icons

Custom icons live in `lib/src/components/Icon/icons/` as SVG files. The `iconsList.ts` file maps each file to an `id`:

```typescript
// lib/src/components/Icon/iconsList.ts
export interface IconVariant {
  id: string;
  image: () => string;              // default image import
  variants?: {
    light?: () => string;           // light-mode variant
    dark?: () => string;            // dark-mode variant
  };
}
export const iconsList: IconVariant[] = [ ... ];
```

`Icon.tsx` calls `getThemedIcon()` which checks `iconConfig.variants[themeMode]` first, falling back to `iconConfig.image()`.

### How to Add a New Icon

**MUI icon:**
1. Import from `@mui/icons-material` in `constants.ts`
2. Add to `MUI_ICON_REGISTRY` with your chosen key name
3. If it needs auto-color, add `'YourIconName': 'status-info'` (or any category) in `ICON_COLOR_CATEGORY`
4. Use `<Icon iconType="mui-icon" icon="YourIconName" />`

**Custom SVG icon:**
1. Place SVG(s) in `lib/src/components/Icon/icons/`
2. Add an entry to `iconsList.ts`:
   ```typescript
   { id: 'my-icon', image: () => import('./icons/my-icon.svg') }
   // with theme variants:
   { id: 'my-icon', image: () => import('./icons/my-icon-dark.svg'),
     variants: { light: () => import('./icons/my-icon-light.svg') } }
   ```
3. Optionally add to `ICON_COLOR_CATEGORY` for automatic color tinting
4. Use `<Icon icon="my-icon" />`

**Custom color category:**
1. Add the category key + value to both `dark.ts` and `light.ts` `iconColors` objects
2. Add entries to `ICON_COLOR_CATEGORY` pointing to the new key
3. No other changes needed

---

## 20. Testing Plan

### 20.1 Testing Patterns — Setup

**MockPreferencesAdapter** (used in all unit tests):

```typescript
// Reusable mock for lib/src/services/preferences tests
class MockPreferencesAdapter implements PreferencesAdapter {
  private store: Record<string, unknown> = {};

  async getPreference<T>(key: string): Promise<T | null> {
    const keys = key.split('.');
    let value: unknown = this.store;
    for (const k of keys) {
      if (typeof value !== 'object' || value === null) return null;
      value = (value as Record<string, unknown>)[k];
    }
    return (value as T) ?? null;
  }

  async setPreference<T>(key: string, value: T): Promise<void> {
    const keys = key.split('.');
    let obj: Record<string, unknown> = this.store;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) obj[keys[i]] = {};
      obj = obj[keys[i]] as Record<string, unknown>;
    }
    obj[keys[keys.length - 1]] = value;
  }

  async clearPreference(key: string): Promise<void> {
    const keys = key.split('.');
    let obj: Record<string, unknown> = this.store;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) return;
      obj = obj[keys[i]] as Record<string, unknown>;
    }
    delete obj[keys[keys.length - 1]];
  }

  async clearAllPreferences(): Promise<void> { this.store = {}; }
  getPreferencesSync(): Record<string, unknown> { return this.store; }
}
```

### 20.2 Filter Preference Tests

```typescript
describe('Filter Preferences', () => {
  let adapter: MockPreferencesAdapter;
  beforeEach(() => { adapter = new MockPreferencesAdapter(); vi.clearAllMocks(); });

  describe('saveFiltersToPreferences', () => {
    it('stores filters with _meta for views scope', async () => {
      await saveFiltersToPreferences(adapter, 'views', 'dashboard', { severity: 'high' });
      const result = await loadFiltersFromPreferences(adapter, 'views', 'dashboard');
      expect(result).toEqual({ severity: 'high' });
    });

    it('stores filters with _meta for components scope', async () => {
      await saveFiltersToPreferences(adapter, 'components', 'incidents-table', { status: 'open' });
      const result = await loadFiltersFromPreferences(adapter, 'components', 'incidents-table');
      expect(result).toEqual({ status: 'open' });
    });

    it('returns empty object when no filters stored', async () => {
      const result = await loadFiltersFromPreferences(adapter, 'views', 'nonexistent');
      expect(result).toEqual({});
    });
  });

  describe('clearFiltersFromPreferences', () => {
    it('removes stored filters', async () => {
      await saveFiltersToPreferences(adapter, 'views', 'dashboard', { key: 'val' });
      await clearFiltersFromPreferences(adapter, 'views', 'dashboard');
      const result = await loadFiltersFromPreferences(adapter, 'views', 'dashboard');
      expect(result).toEqual({});
    });
  });

  describe('getPersistedFilterIds', () => {
    it('returns filter keys', async () => {
      await saveFiltersToPreferences(adapter, 'views', 'dashboard', { a: '1', b: '2' });
      const ids = await getPersistedFilterIds(adapter, 'views', 'dashboard');
      expect(ids).toEqual(expect.arrayContaining(['a', 'b']));
    });

    it('returns empty array when nothing stored', async () => {
      const ids = await getPersistedFilterIds(adapter, 'views', 'none');
      expect(ids).toEqual([]);
    });
  });

  describe('getFilterMetadata', () => {
    it('returns metadata with updated_at and version', async () => {
      await saveFiltersToPreferences(adapter, 'views', 'dashboard', { x: '1' });
      const meta = await getFilterMetadata(adapter, 'views', 'dashboard');
      expect(meta).not.toBeNull();
      expect(meta?.updated_at).toBeDefined();
      expect(typeof meta?.version).toBe('number');
    });

    it('returns null when no filters exist', async () => {
      const meta = await getFilterMetadata(adapter, 'views', 'ghost');
      expect(meta).toBeNull();
    });
  });
});
```

### 20.3 Column Preference Tests

```typescript
describe('Column Preferences', () => {
  let adapter: MockPreferencesAdapter;
  beforeEach(() => { adapter = new MockPreferencesAdapter(); vi.clearAllMocks(); });

  const sampleConfig = {
    columnVisibility: { id: true, title: false },
    columnOrder: ['id', 'title', 'status'],
    pinnedColumns: ['id'],
  };

  it('saves and loads column config', async () => {
    await saveColumnsToPreferences(adapter, 'incidents-table', sampleConfig);
    const loaded = await loadColumnsFromPreferences(adapter, 'incidents-table');
    expect(loaded).toEqual(sampleConfig);
  });

  it('returns null when nothing stored', async () => {
    const result = await loadColumnsFromPreferences(adapter, 'missing-table');
    expect(result).toBeNull();
  });

  it('returns null on version mismatch (triggers profile reset)', async () => {
    // Manually write stale version
    await adapter.setPreference('components.incidents-table.columns', {
      _meta: { version: 0, updated_at: new Date().toISOString() },
      columnVisibility: {}, columnOrder: [], pinnedColumns: [],
    });
    const result = await loadColumnsFromPreferences(adapter, 'incidents-table');
    expect(result).toBeNull();
  });

  it('clears column config', async () => {
    await saveColumnsToPreferences(adapter, 'incidents-table', sampleConfig);
    await clearColumnsFromPreferences(adapter, 'incidents-table');
    const result = await loadColumnsFromPreferences(adapter, 'incidents-table');
    expect(result).toBeNull();
  });
});
```

### 20.4 Page Size Preference Tests

```typescript
describe('Page Size Preferences', () => {
  let adapter: MockPreferencesAdapter;
  beforeEach(() => { adapter = new MockPreferencesAdapter(); vi.clearAllMocks(); });

  it('saves and loads page size', async () => {
    await savePageSizeToPreferences(adapter, 'incidents-table', 50);
    const size = await loadPageSizeFromPreferences(adapter, 'incidents-table');
    expect(size).toBe(50);
  });

  it('returns null when not set', async () => {
    const size = await loadPageSizeFromPreferences(adapter, 'nonexistent');
    expect(size).toBeNull();
  });
});
```

### 20.5 PreferencesInitializer Tests

```typescript
// core/src/components/PreferencesInitializer.test.tsx
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ i18n: { changeLanguage: vi.fn() } }),
}));

const mockSetThemeMode = vi.fn();
vi.mock('../contexts/ThemeContext', () => ({
  useThemeContext: () => ({ setThemeMode: mockSetThemeMode }),
}));

describe('PreferencesInitializer', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('applies stored dark theme on mount', async () => {
    const adapter = new MockPreferencesAdapter();
    await adapter.setPreference('ui', { theme: 'dark' });
    render(<PreferencesInitializer />, { wrapper: makeContextWrapper(adapter) });
    await waitFor(() => expect(mockSetThemeMode).toHaveBeenCalledWith('dark'));
  });

  it('applies stored language on mount', async () => {
    const mockChangeLang = vi.fn();
    vi.mocked(useTranslation().i18n.changeLanguage) /* or access via vi.fn ref */;
    const adapter = new MockPreferencesAdapter();
    await adapter.setPreference('ui', { language: 'ita' });
    render(<PreferencesInitializer />, { wrapper: makeContextWrapper(adapter) });
    await waitFor(() => {/* assert i18n.changeLanguage called with 'ita' */});
  });

  it('does not crash when preferences are null', async () => {
    const adapter = new MockPreferencesAdapter(); // empty
    expect(() =>
      render(<PreferencesInitializer />, { wrapper: makeContextWrapper(adapter) })
    ).not.toThrow();
  });

  it('does not crash when adapter throws', async () => {
    const adapter = new MockPreferencesAdapter();
    vi.spyOn(adapter, 'getPreference').mockRejectedValue(new Error('network error'));
    expect(() =>
      render(<PreferencesInitializer />, { wrapper: makeContextWrapper(adapter) })
    ).not.toThrow();
  });
});
```

### 20.6 ApiPreferencesAdapter Tests

```typescript
describe('ApiPreferencesAdapter', () => {
  let axiosMock: AxiosInstance;

  beforeEach(() => {
    vi.clearAllMocks();
    axiosMock = { get: vi.fn(), patch: vi.fn() } as unknown as AxiosInstance;
  });

  it('fetches preferences on first getPreference call', async () => {
    vi.mocked(axiosMock.get).mockResolvedValue({ data: { ui: { theme: 'dark' } } });
    const adapter = new ApiPreferencesAdapter(axiosMock);
    const result = await adapter.getPreference<string>('ui.theme');
    expect(axiosMock.get).toHaveBeenCalledWith('/api/v1/users/me/preferences');
    expect(result).toBe('dark');
  });

  it('initializes with empty object on 404', async () => {
    vi.mocked(axiosMock.get).mockRejectedValue({ response: { status: 404 } });
    const adapter = new ApiPreferencesAdapter(axiosMock);
    const result = await adapter.getPreference('ui');
    expect(result).toBeNull();
  });

  it('does not fetch again on second getPreference (cache hit)', async () => {
    vi.mocked(axiosMock.get).mockResolvedValue({ data: {} });
    const adapter = new ApiPreferencesAdapter(axiosMock);
    await adapter.getPreference('ui');
    await adapter.getPreference('ui');
    expect(axiosMock.get).toHaveBeenCalledTimes(1);
  });

  it('debounces writes and sends PATCH after debounce interval', async () => {
    vi.useFakeTimers();
    vi.mocked(axiosMock.get).mockResolvedValue({ data: {} });
    vi.mocked(axiosMock.patch).mockResolvedValue({ data: {} });
    const adapter = new ApiPreferencesAdapter(axiosMock, { debounceMs: 100 });
    await adapter.getPreference('ui'); // prime cache
    await adapter.setPreference('ui', { theme: 'dark' });
    expect(axiosMock.patch).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);
    await Promise.resolve();
    expect(axiosMock.patch).toHaveBeenCalledWith('/api/v1/users/me/preferences', expect.any(Object));
    vi.useRealTimers();
  });

  it('flush() sends PATCH immediately', async () => {
    vi.mocked(axiosMock.get).mockResolvedValue({ data: {} });
    vi.mocked(axiosMock.patch).mockResolvedValue({ data: {} });
    const adapter = new ApiPreferencesAdapter(axiosMock, { debounceMs: 5000 });
    await adapter.getPreference('ui');
    await adapter.setPreference('ui', { theme: 'light' });
    await adapter.flush();
    expect(axiosMock.patch).toHaveBeenCalled();
  });
});
```

### 20.7 RBAC Tests

```typescript
// core/src/contexts/NavigationContext.test.tsx
import { hasRequiredRole, filterCategoriesByRoles } from '../contexts/NavigationContext';

describe('hasRequiredRole', () => {
  it('returns true when requiredRoles is empty', () => {
    expect(hasRequiredRole(['user:default'], [])).toBe(true);
  });

  it('returns true when user has one of the required roles', () => {
    expect(hasRequiredRole(['user:default', 'user:admin'], ['user:admin'])).toBe(true);
  });

  it('returns false when user lacks all required roles', () => {
    expect(hasRequiredRole(['user:default'], ['user:admin'])).toBe(false);
  });

  it('is case-sensitive', () => {
    expect(hasRequiredRole(['User:Default'], ['user:default'])).toBe(false);
  });

  it('returns false for empty userRoles with non-empty requiredRoles', () => {
    expect(hasRequiredRole([], ['user:default'])).toBe(false);
  });
});

describe('filterCategoriesByRoles', () => {
  const categories = [
    {
      id: 'ops',
      title: 'Operations',
      views: [
        { id: 'incidents', title: 'Incidents', required_roles: ['user:default'] },
        { id: 'audit', title: 'Audit', required_roles: ['user:admin'] },
      ],
      groups: [
        {
          id: 'advanced',
          title: 'Advanced',
          views: [{ id: 'bulk-ops', title: 'Bulk Ops', required_roles: ['user:admin'] }],
        },
      ],
    },
    {
      id: 'admin',
      title: 'Admin',
      views: [{ id: 'settings', title: 'Settings', required_roles: ['system:admin'] }],
      groups: [],
    },
  ];

  it('shows only accessible views for user:default', () => {
    const result = filterCategoriesByRoles(categories, ['user:default']);
    const ops = result.find((c) => c.id === 'ops')!;
    expect(ops.views.map((v) => v.id)).toEqual(['incidents']);
    expect(ops.groups).toHaveLength(0); // advanced group removed
  });

  it('removes entire category when user has no access', () => {
    const result = filterCategoriesByRoles(categories, ['user:default']);
    expect(result.find((c) => c.id === 'admin')).toBeUndefined();
  });

  it('shows all views for user:admin', () => {
    const result = filterCategoriesByRoles(categories, ['user:admin']);
    const ops = result.find((c) => c.id === 'ops')!;
    expect(ops.views.map((v) => v.id)).toContain('audit');
    expect(ops.groups[0].views.map((v) => v.id)).toContain('bulk-ops');
  });

  it('shows everything for system:admin', () => {
    const result = filterCategoriesByRoles(categories, ['system:admin']);
    expect(result).toHaveLength(2);
    expect(result.find((c) => c.id === 'admin')).toBeDefined();
  });

  it('returns empty array when userRoles is empty', () => {
    // All categories require at least one role → all filtered out
    const result = filterCategoriesByRoles(categories, []);
    expect(result).toEqual([]);
  });
});
```

### 20.8 Icon Tests

```typescript
// lib/src/components/Icon/Icon.test.tsx
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { Icon } from './Icon';
import { getIconThemeColor } from './IconUtils';
import { ICON_COLOR_CATEGORY } from './IconUtils';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));

describe('Icon component', () => {
  const makeTheme = (iconColors: Record<string, string>) =>
    createTheme({ palette: { iconColors } } as any);

  it('renders img element for icon type', () => {
    render(
      <ThemeProvider theme={makeTheme({})}>
        <Icon icon="question" />
      </ThemeProvider>
    );
    expect(screen.getByTestId('my-nav-icon')).toBeInTheDocument();
  });

  it('falls back to question icon for unknown id', () => {
    render(
      <ThemeProvider theme={makeTheme({})}>
        <Icon icon="nonexistent-icon-xyz" />
      </ThemeProvider>
    );
    expect(screen.getByAltText('question')).toBeInTheDocument();
  });

  it('renders MUI icon when iconType is mui-icon', () => {
    render(
      <ThemeProvider theme={makeTheme({})}>
        <Icon iconType="mui-icon" icon="Error" />
      </ThemeProvider>
    );
    // MUI icons render SVG elements
    expect(document.querySelector('svg')).toBeInTheDocument();
  });
});

describe('getIconThemeColor', () => {
  const iconColors = {
    'status-error': '#ff5959',
    'status-info': '#6db3f2',
    'custom-override': '#aabbcc',
    Error: '#ffffff', // direct icon-name override
  };

  it('returns direct icon-name override if present', () => {
    expect(getIconThemeColor('Error', iconColors)).toBe('#ffffff');
  });

  it('resolves via ICON_COLOR_CATEGORY category', () => {
    expect(getIconThemeColor('Info', iconColors)).toBe('#6db3f2');
  });

  it('returns undefined for unknown icon with no category', () => {
    expect(getIconThemeColor('UnknownWidget', iconColors)).toBeUndefined();
  });

  it('returns undefined when iconColors is undefined', () => {
    expect(getIconThemeColor('Error', undefined)).toBeUndefined();
  });
});

describe('ICON_COLOR_CATEGORY', () => {
  it('maps Error to status-error', () => {
    expect(ICON_COLOR_CATEGORY['Error']).toBe('status-error');
  });

  it('maps CheckCircle to status-success', () => {
    expect(ICON_COLOR_CATEGORY['CheckCircle']).toBe('status-success');
  });

  it('maps in-progress to status-info', () => {
    expect(ICON_COLOR_CATEGORY['in-progress']).toBe('status-info');
  });

  it('maps CallMade to trend-positive', () => {
    expect(ICON_COLOR_CATEGORY['CallMade']).toBe('trend-positive');
  });
});
```

### 20.9 Test Configuration Notes

- All tests use **Vitest 3+** with `bail: 1` (stop on first failure)
- All test files call `vi.clearAllMocks()` in `beforeEach`  
- Wrap state-changing callbacks in `act()` from `@testing-library/react`
- Always `await waitFor(...)` after async adapter operations in component tests
- Always mock `react-i18next` in `lib/` component tests
- Inject `MockPreferencesAdapter` via context wrapper — never use `ApiPreferencesAdapter` in unit tests
- Use `vi.useFakeTimers()` / `vi.advanceTimersByTime()` for debounce tests; always call `vi.useRealTimers()` in cleanup

---

# Theme Reuse Guide for External Projects

## Purpose

This guide explains how to reuse the achaic UI library theme system in another project and what each attached folder contributes to that process.

## Folder Map (What Matters for Theming)

| Folder | Role | Required to reuse theme? |
| --- | --- | --- |
| `src/theme` | Core theme provider, light/dark configs, tokens, hooks, theme editor | Yes |
| `src/components` | UI components that consume the theme | Optional (useful if you want themed components too) |
| `src/config-driven-ui` | Dynamic JSON-driven UI framework, depends on theme and components | Optional |
| `src/services` | Axios provider and API client helpers, can carry tenant/auth headers | Optional |
| `src/shared` | Shared constants, data binding, snippets, value mappings | Optional |
| `src/utils` | Generic helpers (crypto, css class, random, test setup) | Optional |
| `src/web-components` | Web component wrappers for non-React apps | Optional |
| `src/testing` | Accessibility and testing helpers | Recommended for quality, not runtime required |
| `src/templates` | Placeholder/template notes | No |

## Recommended Reuse Paths

### Path A: Consume the package (preferred)

Use the published library exports and avoid copying source files.

- Pros: Less maintenance, easier upgrades
- Cons: You inherit package versioning and peer dependencies

### Path B: Copy only the theme subsystem

Copy the `src/theme` folder into your project and wire it locally.

- Pros: Full customization
- Cons: You own updates and bug fixes

## Minimum Dependencies for Theme Reuse

At minimum, your target project should align with these runtime dependencies:

- React 19.x
- React DOM 19.x
- @mui/material 7.x
- @emotion/react 11.x
- @emotion/styled 11.x

If you also want date pickers and broader library compatibility, include:

- @mui/icons-material
- @mui/x-date-pickers
- date-fns

## Integration Steps (React App)

### 1. Install dependencies

```bash
npm i react react-dom @mui/material @emotion/react @emotion/styled
```

### 2. Wrap your app with the theme provider

```tsx
// Generated by GitHub Copilot
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Theme } from '@achaic/ui-lib';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Theme.ThemeProvider defaultMode="dark" storageKey="my-project-theme-mode">
    <App />
  </Theme.ThemeProvider>
);
```

### 3. Read and update theme mode in components

```tsx
// Generated by GitHub Copilot
import { Theme } from '@achaic/ui-lib';

export function ThemeSwitcher() {
  const { themeMode, setThemeMode } = Theme.useTheme();

  return (
    <div>
      <p>Current mode: {themeMode}</p>
      <button onClick={() => setThemeMode('light')}>Light</button>
      <button onClick={() => setThemeMode('dark')}>Dark</button>
    </div>
  );
}
```

### 4. Use theme CSS variables in custom styles

The theme imports `spacing.css`, which defines the 8-point spacing scale:

- `--mui-spacing-1` = 8px
- `--mui-spacing-2` = 16px
- `--mui-spacing-3` = 24px
- ...

```css
/* Generated by GitHub Copilot */
.card {
  background: var(--mui-palette-background-paper);
  color: var(--mui-palette-text-primary);
  padding: var(--mui-spacing-2);
  border: 1px solid var(--mui-palette-divider);
  border-radius: var(--mui-shape-borderRadius);
}
```

## Using Theme with Other Attached Folders

### With `src/components`

- Components inherit theme values through MUI context.
- Prefer library components for consistency (buttons, cards, forms, tables, typography).

### With `src/config-driven-ui`

- Works best when your app already uses the library providers and component registry.
- Theme is consumed through normal React context and MUI variables.

### With `src/services`

- Not required for theming.
- Useful if your themed app also needs auth/tenant-aware API calls.

### With `src/web-components`

- Use this when your target project is not React.
- You can still share visual tokens by relying on CSS variables from the theme.

### With `src/testing`

- Use these tests to validate accessibility after porting theme customizations.
- Strongly recommended when modifying contrast or typography tokens.

## Known Implementation Notes from Current Source

1. Supported modes are currently `light` and `dark` in `src/theme/constants.ts`.
2. The README mentions high contrast mode, but that mode is not in the current `ThemeMode` union.
3. `toggleTheme` currently flips `light -> dark` and keeps `dark -> dark`. For deterministic switching, use `setThemeMode`.

## Security, Accessibility, and Efficiency Checklist

When reusing in another project:

1. Do not inject untrusted values into style objects or CSS variable names.
2. Keep WCAG contrast validation in CI when changing palette tokens.
3. Avoid loading multiple nested theme providers unless needed (reduces rerender cost).
4. Keep one source of truth for mode persistence key (`storageKey`).

## Copy Checklist (If You Choose Path B)

1. Copy `src/theme`.
2. Keep `src/theme/spacing.css` import in `src/theme/index.ts`.
3. Keep theme config asset imports in `src/theme/configs/assets`.
4. Ensure `@mui/material`, `@emotion/react`, `@emotion/styled`, `react`, `react-dom` are installed.
5. Wrap app root with `ThemeProvider`.
6. Replace ad-hoc colors with MUI palette tokens or CSS variables.
7. Add or run accessibility checks after migration.

## Suggested Next Step

If you want, I can also generate a second document with a strict "minimal copy pack" that lists exact files to copy for:

- Theme only
- Theme + components
- Theme + web components



# Reuse Guide: components, config-driven-ui, hooks, services

## Scope
This guide documents these folders for reuse in other projects:
- `apps/web/lib/src/components`
- `apps/web/lib/src/config-driven-ui`
- `apps/web/lib/src/hooks`
- `apps/web/lib/src/services`

The goal is practical reuse: what each file/folder is for, what is required, and what is opt# Reuse Guide: components, config-driven-ui, hooks, services

## Scope
This guide documents these folders for reuse in other projects:
- `apps/web/lib/src/components`
- `apps/web/lib/src/config-driven-ui`
- `apps/web/lib/src/hooks`
- `apps/web/lib/src/services`

The goal is practical reuse: what each file/folder is for, what is required, and what is optional.

## Quick Reuse Matrix

| You want to reuse | Minimum folders/files to copy | Usually optional |
|---|---|---|
| Basic UI components (Button/Card/Text/etc.) | `components/<Component>/<Component>.tsx` and `components/<Component>/index.ts` | `*.test.tsx`, `stories/`, docs files |
| Rich data table | `components/Table/` | `stories/`, some tests |
| JSON schema forms | `components/Form/` | `stories/`, docs markdown files |
| Icon system with custom SVGs | `components/Icon/` | icon tests, stories |
| Real-time chat hooks | `hooks/useSSE*.ts`, `hooks/useChat*.ts`, `services/axios.ts` | `*.test.ts` |
| Config-driven dashboard framework | `config-driven-ui/`, `services/`, core components used by config-driven-ui | generated stories/docs, many tests |

## Shared File Pattern Across Component Folders

Most component folders follow a reusable pattern:

| File type | Meaning | Reuse guidance |
|---|---|---|
| `<Component>.tsx` | Main component implementation | Required |
| `index.ts` | Public export surface | Required |
| `<Component>.test.tsx` | Unit tests | Optional but recommended |
| `<Component>.stories.tsx` or `stories/` | Storybook demos | Optional |
| `<Component>.css` | Component-specific styling | Required if referenced by component |
| `types.ts` | Component-specific types | Required if imported by component |
| `utils/` | Helpers used by component | Required if imported by component |
| `locale/` | i18n resources | Required only if localization is needed |
| `README.md` | Component usage docs | Optional but useful |

---

## Components Folder Deep Brief

### Top-level component map

| Folder | What it is | Root files/folders present | Reuse notes |
|---|---|---|---|
| `Breadcrumb` | Breadcrumb navigation UI | `Breadcrumb.tsx`, `Breadcrumb.test.tsx`, `index.ts` | Copy `Breadcrumb.tsx` + `index.ts`; keep test for regression safety |
| `Button` | Styled button wrapper | `Button.tsx`, `Button.test.tsx`, `Button.css`, `index.ts`, `stories/` | Include CSS with component |
| `Card` | Generic card container | `Card.tsx`, `Card.test.tsx`, `index.ts`, `stories/` | Low-dependency reusable card |
| `Carousel` | Carousel/slider UI | `Carousel.tsx`, `Carousel.test.tsx`, `Carousel.stories.tsx`, `index.ts` | Include story as usage reference |
| `Charts` | Chart rendering + empty/skeleton states | `Charts.tsx`, `Charts.test.tsx`, `Charts.types.ts`, `ChartEmptyState.tsx`, `ChartSkeleton.tsx`, `detectChartType.ts`, `hasChartData.ts`, `helper.ts`, `index.ts`, `README.md`, `stories/`, `AGENT_INSTRUCTIONS.md`, `AGENT_QUICK_REFERENCE.md` | Reuse as a complete folder because internals are interdependent |
| `Chat` | Chat UI cluster | `Chat/`, `ChatContainer/`, `ChatInput/`, `ChatMessage/`, `WorkerTaskDialog/`, `ChatIcon.tsx`, `ChatList.tsx`, `ChatList.css`, `types.ts`, `utils.ts`, tests, `index.ts` | Copy entire folder for chat features |
| `CodeBlock` | Code snippet renderer | `CodeBlock.tsx`, `CodeBlock.test.tsx`, `CodeBlock.stories.tsx`, `index.ts` | Usually standalone reusable |
| `ComponentHeader` | Header/title wrapper for components | `ComponentHeader.tsx`, `ComponentHeader.test.tsx` | No `index.ts`; import direct file when reusing |
| `ComponentWrapper` | Structural wrapper component | `ComponentWrapper.tsx`, `ComponentWrapper.test.tsx`, `ComponentWrapper.css` | Include CSS |
| `Currency` | Currency value display/formatting | `Currency.tsx`, `Currency.test.tsx`, `index.ts` | Good utility display component |
| `Date` | Date display and date input components | `DateDisplay.tsx`, `DateInput.tsx`, `DateRangeInput.tsx`, tests, `index.ts`, `types.ts`, `utils/`, `stories/` | Reuse full folder for date features |
| `Error` | Error display UI | `Error.tsx`, `Error.test.tsx`, `Error.css`, `locale/`, `stories/` | Include locale files if multilingual |
| `Filters` | Filter panel and applied filter chips | `Filters.tsx`, `Filter.tsx`, `AppliedFilters.tsx`, tests, `Filters.css`, `filters.types.ts`, `filters/`, `utils/`, `locale/`, `stories/` | Reuse full folder for filtering system |
| `FiltersButton` | Trigger button for filter panel | `FiltersButton.tsx`, `index.ts` | Lightweight helper component |
| `Form` | JSON-schema form system with custom fields | `Form.tsx`, `Form.test.tsx`, `Form.css`, `index.ts`, `fields/`, `types/`, `stories/`, `README.md`, `CUSTOM_FIELDS.md`, `INTEGRATION_GUIDE.md`, `SUMMARY.md` | Copy whole folder for schema-based form behavior |
| `Icon` | Icon abstraction for MUI/custom SVG icons | `Icon.tsx`, `IconSrc.tsx`, `IconUtils.tsx`, `iconsList.ts`, `constants.ts`, `icons/`, `Icon.css`, tests, `stories/` | Copy full folder to preserve icon mapping + theme behavior |
| `KPI` | KPI card display component | `KPI.tsx`, `KPI.test.tsx`, `index.ts`, `README.md`, `locale/`, `stories/` | Include locale if using labels/messages |
| `List` | List display component | `List.tsx`, `List.test.tsx`, `stories/` | No root `index.ts` listed; verify import path before extraction |
| `Loading` | Loading indicators and i18n wrapper | `Loading.tsx`, `LoadingI18n.tsx`, tests, `Loading.css`, `locale/`, `stories/` | Copy full folder for loading + i18n support |
| `MasonryCatalog` | Masonry/tile layout catalog | `MasonryCatalog.tsx`, `MasonryCatalog.test.tsx`, `MasonryCatalog.stories.tsx`, `index.ts` | Useful for card dashboards |
| `Modal` | Modal/dialog component | `Modal.tsx`, `Modal.test.tsx`, `index.ts` | Standard reusable modal |
| `Notification` | Notification/alert system | `Notification.tsx`, `AlertManagerService.tsx`, `hooks.ts`, tests, `types.ts`, `Notification.css`, `README.md`, `stories/`, `index.ts` | Reuse complete folder for service + UI coupling |
| `PageContainer` | Page-level content container | `PageContainer.tsx`, `PageContainer.test.tsx`, `PageContainer.stories.tsx`, `index.ts` | Base layout component |
| `PageHeader` | Page header/title block | `PageHeader.tsx`, `PageHeader.test.tsx` | No root `index.ts`; direct import likely |
| `Pagination` | Pagination component + transform helpers | `Pagination.tsx`, `Pagination.test.tsx`, `transformers.ts`, `transformers.test.ts`, `types.ts`, `examples.ts`, `README.md`, `index.ts` | Keep `transformers.ts` if using data adaptation |
| `Slideout` | Slideout panel component | `Slideout.tsx`, `Slideout.test.tsx`, `index.ts` | Reusable panel shell |
| `Summary` | Summary card/info overview renderer | `Summary.tsx`, `Summary.test.tsx`, `types.ts`, `definitions/`, `utils/`, `stories/`, `index.ts` | Reuse folder for typed summary rendering |
| `Table` | Advanced data table subsystem | `Table.tsx`, `ColumnSelector.tsx`, `BulkActionsToolbar.tsx`, `SkeletonRows.tsx`, tests, `types.ts`, `hooks/`, `renderers/`, `utils/`, `locale/`, `stories/`, `CELL_RENDERERS.md`, `index.ts` | Reuse complete folder due internal coupling |
| `TabNavigation` | Tab navigation component | `TabNavigation.tsx`, `TabNavigation.test.tsx`, `types.ts`, `locale/`, `README.md`, `stories/`, `index.ts` | Include locale for translated tab labels |
| `Text` | Text rendering component | `Text.tsx`, `Text.test.tsx`, `stories/`, `index.ts` | Lightweight reusable |
| `Typography` | Typography wrapper/system component | `Typography.tsx`, `index.ts` | Minimal dependency component |

### Complex component notes for reuse

#### `components/Form`
- Built around schema-driven form patterns.
- Keep `fields/` and `types/` because custom field mapping and schemas depend on them.
- Docs files in the folder are high-value onboarding assets.

#### `components/Table`
- This is a subsystem, not a single file component.
- `renderers/`, `hooks/`, and `utils/` are essential for full behavior.
- Reuse as a whole if you need sorting, selection, bulk actions, and custom cell rendering.

#### `components/Icon`
- Color/theming behavior and icon mapping are driven by `IconUtils.tsx`, `iconsList.ts`, `constants.ts`, and `icons/` assets.
- Copying only `Icon.tsx` is usually insufficient.

#### `components/Notification`
- UI and service layer are coupled (`Notification.tsx` + `AlertManagerService.tsx` + `hooks.ts`).
- Reuse all of them together.

---

## Hooks Folder: File-by-file Brief

| File | What it does | Reuse priority |
|---|---|---|
| `index.ts` | Barrel exports for selected hooks/types | Required if preserving import ergonomics |
| `useAutoTrend.ts` | Calculates KPI trend direction/value deltas | Optional utility |
| `useAutoTrend.test.ts` | Tests for trend logic | Optional but recommended |
| `useChangeDetection.ts` | Detects value/object changes across renders | Optional utility |
| `useChangeDetection.test.ts` | Tests for change detection | Optional |
| `useChatMessages.ts` | Manages chat message state lifecycle | Required for chat features |
| `useChatMessages.test.ts` | Tests for chat state behavior | Optional |
| `useChatUnreadCount.ts` | Tracks unread chat counts | Required for unread badges |
| `useChatUnreadCount.test.ts` | Tests for unread count logic | Optional |
| `useCreateChat.ts` | Creates chat sessions (API-integrated) | Required for chat create flows |
| `useCreateChat.test.ts` | Tests for create-chat behavior | Optional |
| `useDelayedLoading.ts` | Prevents loading flicker by delaying indicator | Optional UX helper |
| `useDelayedLoading.test.ts` | Tests for delayed loading behavior | Optional |
| `useMarkChatRead.ts` | Marks chat messages as read | Required for read-state sync |
| `useMarkChatRead.test.ts` | Tests for mark-read behavior | Optional |
| `useSSEConnectionState.ts` | Exposes SSE connection state | Required for realtime UX status |
| `useSSEConnectionState.test.ts` | Tests for SSE status logic | Optional |
| `useSSEContext.ts` | Accesses SSE provider context | Required when using SSE provider |
| `useSSEContext.test.ts` | Tests for context contract | Optional |
| `useSSEEvent.ts` | Subscribes to specific SSE event types | Required for event-driven updates |
| `useSSEEvent.test.ts` | Tests for event subscription behavior | Optional |
| `useSSEStream.ts` | Manages SSE stream lifecycle/reconnect | Required for raw stream handling |
| `useSSEStream.test.ts` | Tests for stream logic | Optional |
| `useViewRealtime.ts` | Realtime updates for config-driven views | Required for realtime views |
| `useViewRealtime.test.ts` | Tests for realtime view behavior | Optional |
| `useViewStream.ts` | View-level stream helper (inferred from name and exports) | Optional unless streaming data views |
| `useViewStream.test.ts` | Tests for stream-view behavior | Optional |

### Hook reuse guidance
- If you only need chat: copy chat hooks + SSE hooks + axios service.
- If you only need delayed loading or trend: copy isolated utility hooks.
- Keep tests where possible when extracting to another repo.

---

## Services Folder: File-by-file Brief

### Root files

| File | What it does | Reuse priority |
|---|---|---|
| `index.ts` | Re-exports axios service and provider | Required for clean imports |
| `axios.ts` | Axios instance/config, includes core helper exports | Required for API integration |
| `axios.test.ts` | Axios service tests | Optional |
| `AxiosProvider.tsx` | React provider for axios context/config | Required if app uses provider pattern |
| `AxiosProvider.test.tsx` | Provider tests | Optional |

### `services/preferences`

| File | What it does | Reuse priority |
|---|---|---|
| `index.ts` | Preference module barrel export | Required if reusing preferences module |
| `PreferencesAdapter.ts` | Adapter abstraction for user preference persistence | Required for pluggable preference backends |
| `types.ts` | Preference module types/interfaces | Required |
| `utils.ts` | Helpers for preference handling | Required if imported by adapter/consumers |
| `utils.test.ts` | Utility tests | Optional |

### Service reuse guidance
- For most reuse cases, keep `axios.ts`, `AxiosProvider.tsx`, and `index.ts` together.
- Include `preferences/` only if you need persistent UI state (filters, table preferences, etc.).

---

## Config-driven-ui Folder: Deep Brief

## Top-level files

| File | Purpose | Reuse priority |
|---|---|---|
| `index.tsx` | Main `ConfigDrivenUi` entry component and orchestration | Required |
| `exports.tsx` | Secondary export surface for framework internals | Recommended |
| `types.ts` | Core config-driven types (view config, component config, etc.) | Required |
| `actions.types.ts` | Action contracts for navigation/form/actions | Required |
| `README.md` | Framework overview and architecture intro | Recommended |
| `Architecture.md` | Architecture deep dive | Recommended |
| `ONBOARDING.md` | Setup and onboarding flow | Recommended |
| `index.test.tsx` | Integration-level tests | Optional but valuable |
| `render-count.test.tsx` | Performance/rendering regression tests | Optional |

## Top-level subfolders and what they are

| Subfolder | What it contains | Reuse priority |
|---|---|---|
| `components/` | Config-driven adapters for Text/KPI/Table/Chart/Form/List/Summary plus archetype | Required |
| `contexts/` | Drilldown and preferences contexts | Required |
| `core/` | Core view/action/filter and drilldown building blocks | Required |
| `renderer/` | Dynamic renderers for components/views and action buttons | Required |
| `providers/` | Base and views providers + action service init | Required |
| `hooks/` | Config-driven hooks (loading, nav, filters, data sources, etc.) | Required |
| `services/` | Action service, navigation service, filter service, override registry | Required |
| `store/` | Stateful view store and internal store services | Required |
| `utils/` | Binding/transforms/mappers/export helpers | Required |
| `layouts/` | Layout renderer/types and guides | Required if using layout configs |
| `performance/` | Profiling and render monitor helpers | Optional but recommended |
| `generated/` | Generated schema/story metadata files | Optional for runtime, useful for docs/tooling |
| `docs/` | Internal docs and guides | Optional but high-value |
| `mocks/` | Mock view fixtures | Optional |
| `stories/` | Storybook stories | Optional |
| `scripts/` | Docs/story generation scripts | Optional |
| `testing/` | Validator/test harness utilities | Optional but useful |
| `tests/` | End-to-end style framework tests | Optional |

## `config-driven-ui/components` details

| Folder | Key files | Purpose |
|---|---|---|
| `Text` | `Text.tsx`, `examples.ts`, `validator.ts`, `index.ts`, `README.md`, `Text.test.tsx` | Config-driven text component adapter |
| `KPI` | `KPI.tsx`, `examples.ts`, `validator.ts`, `index.ts`, `README.md` | Config-driven KPI adapter |
| `Chart` | `Chart.tsx`, `examples.ts`, `validator.ts`, `index.ts`, `README.md` | Config-driven chart adapter |
| `Table` | `Table.tsx`, tests, `examples.ts`, `validator.ts`, `hooks/`, `renderers/`, `index.ts`, `README.md` | Config-driven table adapter with internal table behavior |
| `Form` | `Form.tsx`, `Form.test.tsx`, `examples.ts`, `validator.ts`, `index.ts`, `README.md` | Config-driven form adapter |
| `List` | `ListComponent.tsx`, `ListComponent.test.tsx`, `examples.ts`, `validator.ts`, `index.ts`, `README.md` | Config-driven list adapter |
| `Summary` | `Summary.tsx`, `examples.ts`, `validator.ts`, `index.ts`, `README.md` | Config-driven summary adapter |
| `_archetype` | `ArchetypeComponent.tsx`, `examples.ts`, `validator.ts`, `index.ts`, `README.md` | Template/archetype for building new adapters |

## `config-driven-ui/hooks` inventory

| File | Purpose |
|---|---|
| `index.ts` | Barrel exports for framework hooks |
| `useActionHandler.ts` | Executes configured actions |
| `useActionServiceSetup.ts` | Initializes action service wiring |
| `useComponentLevelFilters.ts` | Per-component filter state |
| `useConfigDrivenUiProvider.ts` | Accessor for base provider context |
| `useEntityCrudModal.ts` | Entity CRUD modal state/flow |
| `useGlobalContext.ts` | Global context extraction/resolution |
| `useIntersectionObserver.tsx` | Visibility-driven load trigger |
| `useLazyComponentData.tsx` | Lazy data fetch and binding lifecycle |
| `useNavigation.ts` | Framework navigation logic |
| `useReactRouterNavigation.ts` | Router adapter for framework navigation |
| `useResolvedComponentLevelData.ts` | Resolves dynamic bindings/values |
| `useViewConfiguration.ts` | Loads and resolves view configuration |
| `useViewDataSources.ts` | Data source orchestration |
| `useViewLevelFilters.ts` | View-level filter management |
| `initial-loading-state.test.tsx` and other `*.test.*` files | Hook behavior tests |

## Key framework internals worth knowing before reuse

- `renderer/`: dynamic rendering entry points (`component.tsx`, `view.tsx`, `views.tsx`).
- `providers/`: state and context boundary (`base.tsx`, `ViewsProvider.tsx`).
- `services/actionService.ts`: central action dispatcher.
- `services/ComponentOverrideRegistry.ts`: custom component override point.
- `store/viewsStore.tsx`: shared request/data state.
- `utils/dataBinding.ts`: property/data binding engine.
- `utils/parameterMapper.ts`: maps params into action/navigation payloads.

---

## Suggested Extraction Plans

### Plan A: Reuse only regular UI components
1. Copy selected folders from `components/`.
2. Keep each folder's CSS/types/utils that are imported by the main component.
3. Copy `services/axios.ts` only if component uses API hooks/services.

### Plan B: Reuse chat + realtime
1. Copy `components/Chat/`.
2. Copy required hooks from `hooks/`: all `useSSE*` and chat hooks.
3. Copy `services/axios.ts`, `services/AxiosProvider.tsx`, `services/index.ts`.

### Plan C: Reuse full config-driven-ui framework
1. Copy entire `config-driven-ui/` folder.
2. Copy dependency components used by config-driven adapters (`components/Text`, `components/KPI`, `components/Table`, `components/Charts`, `components/Form`, `components/List`, `components/Summary`).
3. Copy `services/` and required `hooks/`.
4. Keep `types.ts` and `actions.types.ts` intact to avoid contract breaks.

---

## External Dependencies to Verify in Target Project

At minimum, ensure compatible versions of:
- React and React DOM
- MUI (`@mui/material`, `@mui/icons-ma# Reuse Guide: components, config-driven-ui, hooks, services

## Scope
This guide documents these folders for reuse in other projects:
- `apps/web/lib/src/components`
- `apps/web/lib/src/config-driven-ui`
- `apps/web/lib/src/hooks`
- `apps/web/lib/src/services`

The goal is practical reuse: what each file/folder is for, what is required, and what is optional.

## Quick Reuse Matrix

| You want to reuse | Minimum folders/files to copy | Usually optional |
|---|---|---|
| Basic UI components (Button/Card/Text/etc.) | `components/<Component>/<Component>.tsx` and `components/<Component>/index.ts` | `*.test.tsx`, `stories/`, docs files |
| Rich data table | `components/Table/` | `stories/`, some tests |
| JSON schema forms | `components/Form/` | `stories/`, docs markdown files |
| Icon system with custom SVGs | `components/Icon/` | icon tests, stories |
| Real-time chat hooks | `hooks/useSSE*.ts`, `hooks/useChat*.ts`, `services/axios.ts` | `*.test.ts` |
| Config-driven dashboard framework | `config-driven-ui/`, `services/`, core components used by config-driven-ui | generated stories/docs, many tests |

## Shared File Pattern Across Component Folders

Most component folders follow a reusable pattern:

| File type | Meaning | Reuse guidance |
|---|---|---|
| `<Component>.tsx` | Main component implementation | Required |
| `index.ts` | Public export surface | Required |
| `<Component>.test.tsx` | Unit tests | Optional but recommended |
| `<Component>.stories.tsx` or `stories/` | Storybook demos | Optional |
| `<Component>.css` | Component-specific styling | Required if referenced by component |
| `types.ts` | Component-specific types | Required if imported by component |
| `utils/` | Helpers used by component | Required if imported by component |
| `locale/` | i18n resources | Required only if localization is needed |
| `README.md` | Component usage docs | Optional but useful |

---

## Components Folder Deep Brief

### Top-level component map

| Folder | What it is | Root files/folders present | Reuse notes |
|---|---|---|---|
| `Breadcrumb` | Breadcrumb navigation UI | `Breadcrumb.tsx`, `Breadcrumb.test.tsx`, `index.ts` | Copy `Breadcrumb.tsx` + `index.ts`; keep test for regression safety |
| `Button` | Styled button wrapper | `Button.tsx`, `Button.test.tsx`, `Button.css`, `index.ts`, `stories/` | Include CSS with component |
| `Card` | Generic card container | `Card.tsx`, `Card.test.tsx`, `index.ts`, `stories/` | Low-dependency reusable card |
| `Carousel` | Carousel/slider UI | `Carousel.tsx`, `Carousel.test.tsx`, `Carousel.stories.tsx`, `index.ts` | Include story as usage reference |
| `Charts` | Chart rendering + empty/skeleton states | `Charts.tsx`, `Charts.test.tsx`, `Charts.types.ts`, `ChartEmptyState.tsx`, `ChartSkeleton.tsx`, `detectChartType.ts`, `hasChartData.ts`, `helper.ts`, `index.ts`, `README.md`, `stories/`, `AGENT_INSTRUCTIONS.md`, `AGENT_QUICK_REFERENCE.md` | Reuse as a complete folder because internals are interdependent |
| `Chat` | Chat UI cluster | `Chat/`, `ChatContainer/`, `ChatInput/`, `ChatMessage/`, `WorkerTaskDialog/`, `ChatIcon.tsx`, `ChatList.tsx`, `ChatList.css`, `types.ts`, `utils.ts`, tests, `index.ts` | Copy entire folder for chat features |
| `CodeBlock` | Code snippet renderer | `CodeBlock.tsx`, `CodeBlock.test.tsx`, `CodeBlock.stories.tsx`, `index.ts` | Usually standalone reusable |
| `ComponentHeader` | Header/title wrapper for components | `ComponentHeader.tsx`, `ComponentHeader.test.tsx` | No `index.ts`; import direct file when reusing |
| `ComponentWrapper` | Structural wrapper component | `ComponentWrapper.tsx`, `ComponentWrapper.test.tsx`, `ComponentWrapper.css` | Include CSS |
| `Currency` | Currency value display/formatting | `Currency.tsx`, `Currency.test.tsx`, `index.ts` | Good utility display component |
| `Date` | Date display and date input components | `DateDisplay.tsx`, `DateInput.tsx`, `DateRangeInput.tsx`, tests, `index.ts`, `types.ts`, `utils/`, `stories/` | Reuse full folder for date features |
| `Error` | Error display UI | `Error.tsx`, `Error.test.tsx`, `Error.css`, `locale/`, `stories/` | Include locale files if multilingual |
| `Filters` | Filter panel and applied filter chips | `Filters.tsx`, `Filter.tsx`, `AppliedFilters.tsx`, tests, `Filters.css`, `filters.types.ts`, `filters/`, `utils/`, `locale/`, `stories/` | Reuse full folder for filtering system |
| `FiltersButton` | Trigger button for filter panel | `FiltersButton.tsx`, `index.ts` | Lightweight helper component |
| `Form` | JSON-schema form system with custom fields | `Form.tsx`, `Form.test.tsx`, `Form.css`, `index.ts`, `fields/`, `types/`, `stories/`, `README.md`, `CUSTOM_FIELDS.md`, `INTEGRATION_GUIDE.md`, `SUMMARY.md` | Copy whole folder for schema-based form behavior |
| `Icon` | Icon abstraction for MUI/custom SVG icons | `Icon.tsx`, `IconSrc.tsx`, `IconUtils.tsx`, `iconsList.ts`, `constants.ts`, `icons/`, `Icon.css`, tests, `stories/` | Copy full folder to preserve icon mapping + theme behavior |
| `KPI` | KPI card display component | `KPI.tsx`, `KPI.test.tsx`, `index.ts`, `README.md`, `locale/`, `stories/` | Include locale if using labels/messages |
| `List` | List display component | `List.tsx`, `List.test.tsx`, `stories/` | No root `index.ts` listed; verify import path before extraction |
| `Loading` | Loading indicators and i18n wrapper | `Loading.tsx`, `LoadingI18n.tsx`, tests, `Loading.css`, `locale/`, `stories/` | Copy full folder for loading + i18n support |
| `MasonryCatalog` | Masonry/tile layout catalog | `MasonryCatalog.tsx`, `MasonryCatalog.test.tsx`, `MasonryCatalog.stories.tsx`, `index.ts` | Useful for card dashboards |
| `Modal` | Modal/dialog component | `Modal.tsx`, `Modal.test.tsx`, `index.ts` | Standard reusable modal |
| `Notification` | Notification/alert system | `Notification.tsx`, `AlertManagerService.tsx`, `hooks.ts`, tests, `types.ts`, `Notification.css`, `README.md`, `stories/`, `index.ts` | Reuse complete folder for service + UI coupling |
| `PageContainer` | Page-level content container | `PageContainer.tsx`, `PageContainer.test.tsx`, `PageContainer.stories.tsx`, `index.ts` | Base layout component |
| `PageHeader` | Page header/title block | `PageHeader.tsx`, `PageHeader.test.tsx` | No root `index.ts`; direct import likely |
| `Pagination` | Pagination component + transform helpers | `Pagination.tsx`, `Pagination.test.tsx`, `transformers.ts`, `transformers.test.ts`, `types.ts`, `examples.ts`, `README.md`, `index.ts` | Keep `transformers.ts` if using data adaptation |
| `Slideout` | Slideout panel component | `Slideout.tsx`, `Slideout.test.tsx`, `index.ts` | Reusable panel shell |
| `Summary` | Summary card/info overview renderer | `Summary.tsx`, `Summary.test.tsx`, `types.ts`, `definitions/`, `utils/`, `stories/`, `index.ts` | Reuse folder for typed summary rendering |
| `Table` | Advanced data table subsystem | `Table.tsx`, `ColumnSelector.tsx`, `BulkActionsToolbar.tsx`, `SkeletonRows.tsx`, tests, `types.ts`, `hooks/`, `renderers/`, `utils/`, `locale/`, `stories/`, `CELL_RENDERERS.md`, `index.ts` | Reuse complete folder due internal coupling |
| `TabNavigation` | Tab navigation component | `TabNavigation.tsx`, `TabNavigation.test.tsx`, `types.ts`, `locale/`, `README.md`, `stories/`, `index.ts` | Include locale for translated tab labels |
| `Text` | Text rendering component | `Text.tsx`, `Text.test.tsx`, `stories/`, `index.ts` | Lightweight reusable |
| `Typography` | Typography wrapper/system component | `Typography.tsx`, `index.ts` | Minimal dependency component |

### Complex component notes for reuse

#### `components/Form`
- Built around schema-driven form patterns.
- Keep `fields/` and `types/` because custom field mapping and schemas depend on them.
- Docs files in the folder are high-value onboarding assets.

#### `components/Table`
- This is a subsystem, not a single file component.
- `renderers/`, `hooks/`, and `utils/` are essential for full behavior.
- Reuse as a whole if you need sorting, selection, bulk actions, and custom cell rendering.

#### `components/Icon`
- Color/theming behavior and icon mapping are driven by `IconUtils.tsx`, `iconsList.ts`, `constants.ts`, and `icons/` assets.
- Copying only `Icon.tsx` is usually insufficient.

#### `components/Notification`
- UI and service layer are coupled (`Notification.tsx` + `AlertManagerService.tsx` + `hooks.ts`).
- Reuse all of them together.

---

## Hooks Folder: File-by-file Brief

| File | What it does | Reuse priority |
|---|---|---|
| `index.ts` | Barrel exports for selected hooks/types | Required if preserving import ergonomics |
| `useAutoTrend.ts` | Calculates KPI trend direction/value deltas | Optional utility |
| `useAutoTrend.test.ts` | Tests for trend logic | Optional but recommended |
| `useChangeDetection.ts` | Detects value/object changes across renders | Optional utility |
| `useChangeDetection.test.ts` | Tests for change detection | Optional |
| `useChatMessages.ts` | Manages chat message state lifecycle | Required for chat features |
| `useChatMessages.test.ts` | Tests for chat state behavior | Optional |
| `useChatUnreadCount.ts` | Tracks unread chat counts | Required for unread badges |
| `useChatUnreadCount.test.ts` | Tests for unread count logic | Optional |
| `useCreateChat.ts` | Creates chat sessions (API-integrated) | Required for chat create flows |
| `useCreateChat.test.ts` | Tests for create-chat behavior | Optional |
| `useDelayedLoading.ts` | Prevents loading flicker by delaying indicator | Optional UX helper |
| `useDelayedLoading.test.ts` | Tests for delayed loading behavior | Optional |
| `useMarkChatRead.ts` | Marks chat messages as read | Required for read-state sync |
| `useMarkChatRead.test.ts` | Tests for mark-read behavior | Optional |
| `useSSEConnectionState.ts` | Exposes SSE connection state | Required for realtime UX status |
| `useSSEConnectionState.test.ts` | Tests for SSE status logic | Optional |
| `useSSEContext.ts` | Accesses SSE provider context | Required when using SSE provider |
| `useSSEContext.test.ts` | Tests for context contract | Optional |
| `useSSEEvent.ts` | Subscribes to specific SSE event types | Required for event-driven updates |
| `useSSEEvent.test.ts` | Tests for event subscription behavior | Optional |
| `useSSEStream.ts` | Manages SSE stream lifecycle/reconnect | Required for raw stream handling |
| `useSSEStream.test.ts` | Tests for stream logic | Optional |
| `useViewRealtime.ts` | Realtime updates for config-driven views | Required for realtime views |
| `useViewRealtime.test.ts` | Tests for realtime view behavior | Optional |
| `useViewStream.ts` | View-level stream helper (inferred from name and exports) | Optional unless streaming data views |
| `useViewStream.test.ts` | Tests for stream-view behavior | Optional |

### Hook reuse guidance
- If you only need chat: copy chat hooks + SSE hooks + axios service.
- If you only need delayed loading or trend: copy isolated utility hooks.
- Keep tests where possible when extracting to another repo.

---

## Services Folder: File-by-file Brief

### Root files

| File | What it does | Reuse priority |
|---|---|---|
| `index.ts` | Re-exports axios service and provider | Required for clean imports |
| `axios.ts` | Axios instance/config, includes core helper exports | Required for API integration |
| `axios.test.ts` | Axios service tests | Optional |
| `AxiosProvider.tsx` | React provider for axios context/config | Required if app uses provider pattern |
| `AxiosProvider.test.tsx` | Provider tests | Optional |

### `services/preferences`

| File | What it does | Reuse priority |
|---|---|---|
| `index.ts` | Preference module barrel export | Required if reusing preferences module |
| `PreferencesAdapter.ts` | Adapter abstraction for user preference persistence | Required for pluggable preference backends |
| `types.ts` | Preference module types/interfaces | Required |
| `utils.ts` | Helpers for preference handling | Required if imported by adapter/consumers |
| `utils.test.ts` | Utility tests | Optional |

### Service reuse guidance
- For most reuse cases, keep `axios.ts`, `AxiosProvider.tsx`, and `index.ts` together.
- Include `preferences/` only if you need persistent UI state (filters, table preferences, etc.).

---

## Config-driven-ui Folder: Deep Brief

## Top-level files

| File | Purpose | Reuse priority |
|---|---|---|
| `index.tsx` | Main `ConfigDrivenUi` entry component and orchestration | Required |
| `exports.tsx` | Secondary export surface for framework internals | Recommended |
| `types.ts` | Core config-driven types (view config, component config, etc.) | Required |
| `actions.types.ts` | Action contracts for navigation/form/actions | Required |
| `README.md` | Framework overview and architecture intro | Recommended |
| `Architecture.md` | Architecture deep dive | Recommended |
| `ONBOARDING.md` | Setup and onboarding flow | Recommended |
| `index.test.tsx` | Integration-level tests | Optional but valuable |
| `render-count.test.tsx` | Performance/rendering regression tests | Optional |

## Top-level subfolders and what they are

| Subfolder | What it contains | Reuse priority |
|---|---|---|
| `components/` | Config-driven adapters for Text/KPI/Table/Chart/Form/List/Summary plus archetype | Required |
| `contexts/` | Drilldown and preferences contexts | Required |
| `core/` | Core view/action/filter and drilldown building blocks | Required |
| `renderer/` | Dynamic renderers for components/views and action buttons | Required |
| `providers/` | Base and views providers + action service init | Required |
| `hooks/` | Config-driven hooks (loading, nav, filters, data sources, etc.) | Required |
| `services/` | Action service, navigation service, filter service, override registry | Required |
| `store/` | Stateful view store and internal store services | Required |
| `utils/` | Binding/transforms/mappers/export helpers | Required |
| `layouts/` | Layout renderer/types and guides | Required if using layout configs |
| `performance/` | Profiling and render monitor helpers | Optional but recommended |
| `generated/` | Generated schema/story metadata files | Optional for runtime, useful for docs/tooling |
| `docs/` | Internal docs and guides | Optional but high-value |
| `mocks/` | Mock view fixtures | Optional |
| `stories/` | Storybook stories | Optional |
| `scripts/` | Docs/story generation scripts | Optional |
| `testing/` | Validator/test harness utilities | Optional but useful |
| `tests/` | End-to-end style framework tests | Optional |

## `config-driven-ui/components` details

| Folder | Key files | Purpose |
|---|---|---|
| `Text` | `Text.tsx`, `examples.ts`, `validator.ts`, `index.ts`, `README.md`, `Text.test.tsx` | Config-driven text component adapter |
| `KPI` | `KPI.tsx`, `examples.ts`, `validator.ts`, `index.ts`, `README.md` | Config-driven KPI adapter |
| `Chart` | `Chart.tsx`, `examples.ts`, `validator.ts`, `index.ts`, `README.md` | Config-driven chart adapter |
| `Table` | `Table.tsx`, tests, `examples.ts`, `validator.ts`, `hooks/`, `renderers/`, `index.ts`, `README.md` | Config-driven table adapter with internal table behavior |
| `Form` | `Form.tsx`, `Form.test.tsx`, `examples.ts`, `validator.ts`, `index.ts`, `README.md` | Config-driven form adapter |
| `List` | `ListComponent.tsx`, `ListComponent.test.tsx`, `examples.ts`, `validator.ts`, `index.ts`, `README.md` | Config-driven list adapter |
| `Summary` | `Summary.tsx`, `examples.ts`, `validator.ts`, `index.ts`, `README.md` | Config-driven summary adapter |
| `_archetype` | `ArchetypeComponent.tsx`, `examples.ts`, `validator.ts`, `index.ts`, `README.md` | Template/archetype for building new adapters |

## `config-driven-ui/hooks` inventory

| File | Purpose |
|---|---|
| `index.ts` | Barrel exports for framework hooks |
| `useActionHandler.ts` | Executes configured actions |
| `useActionServiceSetup.ts` | Initializes action service wiring |
| `useComponentLevelFilters.ts` | Per-component filter state |
| `useConfigDrivenUiProvider.ts` | Accessor for base provider context |
| `useEntityCrudModal.ts` | Entity CRUD modal state/flow |
| `useGlobalContext.ts` | Global context extraction/resolution |
| `useIntersectionObserver.tsx` | Visibility-driven load trigger |
| `useLazyComponentData.tsx` | Lazy data fetch and binding lifecycle |
| `useNavigation.ts` | Framework navigation logic |
| `useReactRouterNavigation.ts` | Router adapter for framework navigation |
| `useResolvedComponentLevelData.ts` | Resolves dynamic bindings/values |
| `useViewConfiguration.ts` | Loads and resolves view configuration |
| `useViewDataSources.ts` | Data source orchestration |
| `useViewLevelFilters.ts` | View-level filter management |
| `initial-loading-state.test.tsx` and other `*.test.*` files | Hook behavior tests |

## Key framework internals worth knowing before reuse

- `renderer/`: dynamic rendering entry points (`component.tsx`, `view.tsx`, `views.tsx`).
- `providers/`: state and context boundary (`base.tsx`, `ViewsProvider.tsx`).
- `services/actionService.ts`: central action dispatcher.
- `services/ComponentOverrideRegistry.ts`: custom component override point.
- `store/viewsStore.tsx`: shared request/data state.
- `utils/dataBinding.ts`: property/data binding engine.
- `utils/parameterMapper.ts`: maps params into action/navigation payloads.

---

## Suggested Extraction Plans

### Plan A: Reuse only regular UI components
1. Copy selected folders from `components/`.
2. Keep each folder's CSS/types/utils that are imported by the main component.
3. Copy `services/axios.ts` only if component uses API hooks/services.

### Plan B: Reuse chat + realtime
1. Copy `components/Chat/`.
2. Copy required hooks from `hooks/`: all `useSSE*` and chat hooks.
3. Copy `services/axios.ts`, `services/AxiosProvider.tsx`, `services/index.ts`.

### Plan C: Reuse full config-driven-ui framework
1. Copy entire `config-driven-ui/` folder.
2. Copy dependency components used by config-driven adapters (`components/Text`, `components/KPI`, `components/Table`, `components/Charts`, `components/Form`, `components/List`, `components/Summary`).
3. Copy `services/` and required `hooks/`.
4. Keep `types.ts` and `actions.types.ts` intact to avoid contract breaks.

---

## External Dependencies to Verify in Target Project

At minimum, ensure compatible versions of:
- React and React DOM
- MUI (`@mui/material`, `@mui/icons-material`, plus emotion)
- Axios
- For form reuse: `@rjsf/*`
- For charts reuse: `echarts`, `echarts-for-react`
- For config-driven state: `zustand`

(See `apps/web/lib/package.json` for the full dependency list and versions.)

---

## Final Notes

- For simple components, copy only `*.tsx` + `index.ts` + required style/type files.
- For subsystem components (Table, Form, Icon, Notification, Chat), copy the full folder.
- For framework reuse (`config-driven-ui`), treat it as a single unit and avoid partial copies unless you also refactor imports.
terial`, plus emotion)
- Axios
- For form reuse: `@rjsf/*`
- For charts reuse: `echarts`, `echarts-for-react`
- For config-driven state: `zustand`

(See `apps/web/lib/package.json` for the full dependency list and versions.)

---

## Final Notes

- For simple components, copy only `*.tsx` + `index.ts` + required style/type files.
- For subsystem components (Table, Form, Icon, Notification, Chat), copy the full folder.
- For framework reuse (`config-driven-ui`), treat it as a single unit and avoid partial copies unless you also refactor imports.
ional.

## Quick Reuse Matrix

| You want to reuse | Minimum folders/files to copy | Usually optional |
|---|---|---|
| Basic UI components (Button/Card/Text/etc.) | `components/<Component>/<Component>.tsx` and `components/<Component>/index.ts` | `*.test.tsx`, `stories/`, docs files |
| Rich data table | `components/Table/` | `stories/`, some tests |
| JSON schema forms | `components/Form/` | `stories/`, docs markdown files |
| Icon system with custom SVGs | `components/Icon/` | icon tests, stories |
| Real-time chat hooks | `hooks/useSSE*.ts`, `hooks/useChat*.ts`, `services/axios.ts` | `*.test.ts` |
| Config-driven dashboard framework | `config-driven-ui/`, `services/`, core components used by config-driven-ui | generated stories/docs, many tests |

## Shared File Pattern Across Component Folders

Most component folders follow a reusable pattern:

| File type | Meaning | Reuse guidance |
|---|---|---|
| `<Component>.tsx` | Main component implementation | Required |
| `index.ts` | Public export surface | Required |
| `<Component>.test.tsx` | Unit tests | Optional but recommended |
| `<Component>.stories.tsx` or `stories/` | Storybook demos | Optional |
| `<Component>.css` | Component-specific styling | Required if referenced by component |
| `types.ts` | Component-specific types | Required if imported by component |
| `utils/` | Helpers used by component | Required if imported by component |
| `locale/` | i18n resources | Required only if localization is needed |
| `README.md` | Component usage docs | Optional but useful |

---

## Components Folder Deep Brief

### Top-level component map

| Folder | What it is | Root files/folders present | Reuse notes |
|---|---|---|---|
| `Breadcrumb` | Breadcrumb navigation UI | `Breadcrumb.tsx`, `Breadcrumb.test.tsx`, `index.ts` | Copy `Breadcrumb.tsx` + `index.ts`; keep test for regression safety |
| `Button` | Styled button wrapper | `Button.tsx`, `Button.test.tsx`, `Button.css`, `index.ts`, `stories/` | Include CSS with component |
| `Card` | Generic card container | `Card.tsx`, `Card.test.tsx`, `index.ts`, `stories/` | Low-dependency reusable card |
| `Carousel` | Carousel/slider UI | `Carousel.tsx`, `Carousel.test.tsx`, `Carousel.stories.tsx`, `index.ts` | Include story as usage reference |
| `Charts` | Chart rendering + empty/skeleton states | `Charts.tsx`, `Charts.test.tsx`, `Charts.types.ts`, `ChartEmptyState.tsx`, `ChartSkeleton.tsx`, `detectChartType.ts`, `hasChartData.ts`, `helper.ts`, `index.ts`, `README.md`, `stories/`, `AGENT_INSTRUCTIONS.md`, `AGENT_QUICK_REFERENCE.md` | Reuse as a complete folder because internals are interdependent |
| `Chat` | Chat UI cluster | `Chat/`, `ChatContainer/`, `ChatInput/`, `ChatMessage/`, `WorkerTaskDialog/`, `ChatIcon.tsx`, `ChatList.tsx`, `ChatList.css`, `types.ts`, `utils.ts`, tests, `index.ts` | Copy entire folder for chat features |
| `CodeBlock` | Code snippet renderer | `CodeBlock.tsx`, `CodeBlock.test.tsx`, `CodeBlock.stories.tsx`, `index.ts` | Usually standalone reusable |
| `ComponentHeader` | Header/title wrapper for components | `ComponentHeader.tsx`, `ComponentHeader.test.tsx` | No `index.ts`; import direct file when reusing |
| `ComponentWrapper` | Structural wrapper component | `ComponentWrapper.tsx`, `ComponentWrapper.test.tsx`, `ComponentWrapper.css` | Include CSS |
| `Currency` | Currency value display/formatting | `Currency.tsx`, `Currency.test.tsx`, `index.ts` | Good utility display component |
| `Date` | Date display and date input components | `DateDisplay.tsx`, `DateInput.tsx`, `DateRangeInput.tsx`, tests, `index.ts`, `types.ts`, `utils/`, `stories/` | Reuse full folder for date features |
| `Error` | Error display UI | `Error.tsx`, `Error.test.tsx`, `Error.css`, `locale/`, `stories/` | Include locale files if multilingual |
| `Filters` | Filter panel and applied filter chips | `Filters.tsx`, `Filter.tsx`, `AppliedFilters.tsx`, tests, `Filters.css`, `filters.types.ts`, `filters/`, `utils/`, `locale/`, `stories/` | Reuse full folder for filtering system |
| `FiltersButton` | Trigger button for filter panel | `FiltersButton.tsx`, `index.ts` | Lightweight helper component |
| `Form` | JSON-schema form system with custom fields | `Form.tsx`, `Form.test.tsx`, `Form.css`, `index.ts`, `fields/`, `types/`, `stories/`, `README.md`, `CUSTOM_FIELDS.md`, `INTEGRATION_GUIDE.md`, `SUMMARY.md` | Copy whole folder for schema-based form behavior |
| `Icon` | Icon abstraction for MUI/custom SVG icons | `Icon.tsx`, `IconSrc.tsx`, `IconUtils.tsx`, `iconsList.ts`, `constants.ts`, `icons/`, `Icon.css`, tests, `stories/` | Copy full folder to preserve icon mapping + theme behavior |
| `KPI` | KPI card display component | `KPI.tsx`, `KPI.test.tsx`, `index.ts`, `README.md`, `locale/`, `stories/` | Include locale if using labels/messages |
| `List` | List display component | `List.tsx`, `List.test.tsx`, `stories/` | No root `index.ts` listed; verify import path before extraction |
| `Loading` | Loading indicators and i18n wrapper | `Loading.tsx`, `LoadingI18n.tsx`, tests, `Loading.css`, `locale/`, `stories/` | Copy full folder for loading + i18n support |
| `MasonryCatalog` | Masonry/tile layout catalog | `MasonryCatalog.tsx`, `MasonryCatalog.test.tsx`, `MasonryCatalog.stories.tsx`, `index.ts` | Useful for card dashboards |
| `Modal` | Modal/dialog component | `Modal.tsx`, `Modal.test.tsx`, `index.ts` | Standard reusable modal |
| `Notification` | Notification/alert system | `Notification.tsx`, `AlertManagerService.tsx`, `hooks.ts`, tests, `types.ts`, `Notification.css`, `README.md`, `stories/`, `index.ts` | Reuse complete folder for service + UI coupling |
| `PageContainer` | Page-level content container | `PageContainer.tsx`, `PageContainer.test.tsx`, `PageContainer.stories.tsx`, `index.ts` | Base layout component |
| `PageHeader` | Page header/title block | `PageHeader.tsx`, `PageHeader.test.tsx` | No root `index.ts`; direct import likely |
| `Pagination` | Pagination component + transform helpers | `Pagination.tsx`, `Pagination.test.tsx`, `transformers.ts`, `transformers.test.ts`, `types.ts`, `examples.ts`, `README.md`, `index.ts` | Keep `transformers.ts` if using data adaptation |
| `Slideout` | Slideout panel component | `Slideout.tsx`, `Slideout.test.tsx`, `index.ts` | Reusable panel shell |
| `Summary` | Summary card/info overview renderer | `Summary.tsx`, `Summary.test.tsx`, `types.ts`, `definitions/`, `utils/`, `stories/`, `index.ts` | Reuse folder for typed summary rendering |
| `Table` | Advanced data table subsystem | `Table.tsx`, `ColumnSelector.tsx`, `BulkActionsToolbar.tsx`, `SkeletonRows.tsx`, tests, `types.ts`, `hooks/`, `renderers/`, `utils/`, `locale/`, `stories/`, `CELL_RENDERERS.md`, `index.ts` | Reuse complete folder due internal coupling |
| `TabNavigation` | Tab navigation component | `TabNavigation.tsx`, `TabNavigation.test.tsx`, `types.ts`, `locale/`, `README.md`, `stories/`, `index.ts` | Include locale for translated tab labels |
| `Text` | Text rendering component | `Text.tsx`, `Text.test.tsx`, `stories/`, `index.ts` | Lightweight reusable |
| `Typography` | Typography wrapper/system component | `Typography.tsx`, `index.ts` | Minimal dependency component |

### Complex component notes for reuse

#### `components/Form`
- Built around schema-driven form patterns.
- Keep `fields/` and `types/` because custom field mapping and schemas depend on them.
- Docs files in the folder are high-value onboarding assets.

#### `components/Table`
- This is a subsystem, not a single file component.
- `renderers/`, `hooks/`, and `utils/` are essential for full behavior.
- Reuse as a whole if you need sorting, selection, bulk actions, and custom cell rendering.

#### `components/Icon`
- Color/theming behavior and icon mapping are driven by `IconUtils.tsx`, `iconsList.ts`, `constants.ts`, and `icons/` assets.
- Copying only `Icon.tsx` is usually insufficient.

#### `components/Notification`
- UI and service layer are coupled (`Notification.tsx` + `AlertManagerService.tsx` + `hooks.ts`).
- Reuse all of them together.

---

## Hooks Folder: File-by-file Brief

| File | What it does | Reuse priority |
|---|---|---|
| `index.ts` | Barrel exports for selected hooks/types | Required if preserving import ergonomics |
| `useAutoTrend.ts` | Calculates KPI trend direction/value deltas | Optional utility |
| `useAutoTrend.test.ts` | Tests for trend logic | Optional but recommended |
| `useChangeDetection.ts` | Detects value/object changes across renders | Optional utility |
| `useChangeDetection.test.ts` | Tests for change detection | Optional |
| `useChatMessages.ts` | Manages chat message state lifecycle | Required for chat features |
| `useChatMessages.test.ts` | Tests for chat state behavior | Optional |
| `useChatUnreadCount.ts` | Tracks unread chat counts | Required for unread badges |
| `useChatUnreadCount.test.ts` | Tests for unread count logic | Optional |
| `useCreateChat.ts` | Creates chat sessions (API-integrated) | Required for chat create flows |
| `useCreateChat.test.ts` | Tests for create-chat behavior | Optional |
| `useDelayedLoading.ts` | Prevents loading flicker by delaying indicator | Optional UX helper |
| `useDelayedLoading.test.ts` | Tests for delayed loading behavior | Optional |
| `useMarkChatRead.ts` | Marks chat messages as read | Required for read-state sync |
| `useMarkChatRead.test.ts` | Tests for mark-read behavior | Optional |
| `useSSEConnectionState.ts` | Exposes SSE connection state | Required for realtime UX status |
| `useSSEConnectionState.test.ts` | Tests for SSE status logic | Optional |
| `useSSEContext.ts` | Accesses SSE provider context | Required when using SSE provider |
| `useSSEContext.test.ts` | Tests for context contract | Optional |
| `useSSEEvent.ts` | Subscribes to specific SSE event types | Required for event-driven updates |
| `useSSEEvent.test.ts` | Tests for event subscription behavior | Optional |
| `useSSEStream.ts` | Manages SSE stream lifecycle/reconnect | Required for raw stream handling |
| `useSSEStream.test.ts` | Tests for stream logic | Optional |
| `useViewRealtime.ts` | Realtime updates for config-driven views | Required for realtime views |
| `useViewRealtime.test.ts` | Tests for realtime view behavior | Optional |
| `useViewStream.ts` | View-level stream helper (inferred from name and exports) | Optional unless streaming data views |
| `useViewStream.test.ts` | Tests for stream-view behavior | Optional |

### Hook reuse guidance
- If you only need chat: copy chat hooks + SSE hooks + axios service.
- If you only need delayed loading or trend: copy isolated utility hooks.
- Keep tests where possible when extracting to another repo.

---

## Services Folder: File-by-file Brief

### Root files

| File | What it does | Reuse priority |
|---|---|---|
| `index.ts` | Re-exports axios service and provider | Required for clean imports |
| `axios.ts` | Axios instance/config, includes core helper exports | Required for API integration |
| `axios.test.ts` | Axios service tests | Optional |
| `AxiosProvider.tsx` | React provider for axios context/config | Required if app uses provider pattern |
| `AxiosProvider.test.tsx` | Provider tests | Optional |

### `services/preferences`

| File | What it does | Reuse priority |
|---|---|---|
| `index.ts` | Preference module barrel export | Required if reusing preferences module |
| `PreferencesAdapter.ts` | Adapter abstraction for user preference persistence | Required for pluggable preference backends |
| `types.ts` | Preference module types/interfaces | Required |
| `utils.ts` | Helpers for preference handling | Required if imported by adapter/consumers |
| `utils.test.ts` | Utility tests | Optional |

### Service reuse guidance
- For most reuse cases, keep `axios.ts`, `AxiosProvider.tsx`, and `index.ts` together.
- Include `preferences/` only if you need persistent UI state (filters, table preferences, etc.).

---

## Config-driven-ui Folder: Deep Brief

## Top-level files

| File | Purpose | Reuse priority |
|---|---|---|
| `index.tsx` | Main `ConfigDrivenUi` entry component and orchestration | Required |
| `exports.tsx` | Secondary export surface for framework internals | Recommended |
| `types.ts` | Core config-driven types (view config, component config, etc.) | Required |
| `actions.types.ts` | Action contracts for navigation/form/actions | Required |
| `README.md` | Framework overview and architecture intro | Recommended |
| `Architecture.md` | Architecture deep dive | Recommended |
| `ONBOARDING.md` | Setup and onboarding flow | Recommended |
| `index.test.tsx` | Integration-level tests | Optional but valuable |
| `render-count.test.tsx` | Performance/rendering regression tests | Optional |

## Top-level subfolders and what they are

| Subfolder | What it contains | Reuse priority |
|---|---|---|
| `components/` | Config-driven adapters for Text/KPI/Table/Chart/Form/List/Summary plus archetype | Required |
| `contexts/` | Drilldown and preferences contexts | Required |
| `core/` | Core view/action/filter and drilldown building blocks | Required |
| `renderer/` | Dynamic renderers for components/views and action buttons | Required |
| `providers/` | Base and views providers + action service init | Required |
| `hooks/` | Config-driven hooks (loading, nav, filters, data sources, etc.) | Required |
| `services/` | Action service, navigation service, filter service, override registry | Required |
| `store/` | Stateful view store and internal store services | Required |
| `utils/` | Binding/transforms/mappers/export helpers | Required |
| `layouts/` | Layout renderer/types and guides | Required if using layout configs |
| `performance/` | Profiling and render monitor helpers | Optional but recommended |
| `generated/` | Generated schema/story metadata files | Optional for runtime, useful for docs/tooling |
| `docs/` | Internal docs and guides | Optional but high-value |
| `mocks/` | Mock view fixtures | Optional |
| `stories/` | Storybook stories | Optional |
| `scripts/` | Docs/story generation scripts | Optional |
| `testing/` | Validator/test harness utilities | Optional but useful |
| `tests/` | End-to-end style framework tests | Optional |

## `config-driven-ui/components` details

| Folder | Key files | Purpose |
|---|---|---|
| `Text` | `Text.tsx`, `examples.ts`, `validator.ts`, `index.ts`, `README.md`, `Text.test.tsx` | Config-driven text component adapter |
| `KPI` | `KPI.tsx`, `examples.ts`, `validator.ts`, `index.ts`, `README.md` | Config-driven KPI adapter |
| `Chart` | `Chart.tsx`, `examples.ts`, `validator.ts`, `index.ts`, `README.md` | Config-driven chart adapter |
| `Table` | `Table.tsx`, tests, `examples.ts`, `validator.ts`, `hooks/`, `renderers/`, `index.ts`, `README.md` | Config-driven table adapter with internal table behavior |
| `Form` | `Form.tsx`, `Form.test.tsx`, `examples.ts`, `validator.ts`, `index.ts`, `README.md` | Config-driven form adapter |
| `List` | `ListComponent.tsx`, `ListComponent.test.tsx`, `examples.ts`, `validator.ts`, `index.ts`, `README.md` | Config-driven list adapter |
| `Summary` | `Summary.tsx`, `examples.ts`, `validator.ts`, `index.ts`, `README.md` | Config-driven summary adapter |
| `_archetype` | `ArchetypeComponent.tsx`, `examples.ts`, `validator.ts`, `index.ts`, `README.md` | Template/archetype for building new adapters |

## `config-driven-ui/hooks` inventory

| File | Purpose |
|---|---|
| `index.ts` | Barrel exports for framework hooks |
| `useActionHandler.ts` | Executes configured actions |
| `useActionServiceSetup.ts` | Initializes action service wiring |
| `useComponentLevelFilters.ts` | Per-component filter state |
| `useConfigDrivenUiProvider.ts` | Accessor for base provider context |
| `useEntityCrudModal.ts` | Entity CRUD modal state/flow |
| `useGlobalContext.ts` | Global context extraction/resolution |
| `useIntersectionObserver.tsx` | Visibility-driven load trigger |
| `useLazyComponentData.tsx` | Lazy data fetch and binding lifecycle |
| `useNavigation.ts` | Framework navigation logic |
| `useReactRouterNavigation.ts` | Router adapter for framework navigation |
| `useResolvedComponentLevelData.ts` | Resolves dynamic bindings/values |
| `useViewConfiguration.ts` | Loads and resolves view configuration |
| `useViewDataSources.ts` | Data source orchestration |
| `useViewLevelFilters.ts` | View-level filter management |
| `initial-loading-state.test.tsx` and other `*.test.*` files | Hook behavior tests |

## Key framework internals worth knowing before reuse

- `renderer/`: dynamic rendering entry points (`component.tsx`, `view.tsx`, `views.tsx`).
- `providers/`: state and context boundary (`base.tsx`, `ViewsProvider.tsx`).
- `services/actionService.ts`: central action dispatcher.
- `services/ComponentOverrideRegistry.ts`: custom component override point.
- `store/viewsStore.tsx`: shared request/data state.
- `utils/dataBinding.ts`: property/data binding engine.
- `utils/parameterMapper.ts`: maps params into action/navigation payloads.

---

## Suggested Extraction Plans

### Plan A: Reuse only regular UI components
1. Copy selected folders from `components/`.
2. Keep each folder's CSS/types/utils that are imported by the main component.
3. Copy `services/axios.ts` only if component uses API hooks/services.

### Plan B: Reuse chat + realtime
1. Copy `components/Chat/`.
2. Copy required hooks from `hooks/`: all `useSSE*` and chat hooks.
3. Copy `services/axios.ts`, `services/AxiosProvider.tsx`, `services/index.ts`.

### Plan C: Reuse full config-driven-ui framework
1. Copy entire `config-driven-ui/` folder.
2. Copy dependency components used by config-driven adapters (`components/Text`, `components/KPI`, `components/Table`, `components/Charts`, `components/Form`, `components/List`, `components/Summary`).
3. Copy `services/` and required `hooks/`.
4. Keep `types.ts` and `actions.types.ts` intact to avoid contract breaks.

---

## External Dependencies to Verify in Target Project

At minimum, ensure compatible versions of:
- React and React DOM
- MUI (`@mui/material`, `@mui/icons-material`, plus emotion)
- Axios
- For form reuse: `@rjsf/*`
- For charts reuse: `echarts`, `echarts-for-react`
- For config-driven state: `zustand`

(See `apps/web/lib/package.json` for the full dependency list and versions.)

---

## Final Notes

- For simple components, copy only `*.tsx` + `index.ts` + required style/type files.
- For subsystem components (Table, Form, Icon, Notification, Chat), copy the full folder.
- For framework reuse (`config-driven-ui`), treat it as a single unit and avoid partial copies unless you also refactor imports.
