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
   - 4.5 [Custom Brand Colors (Accenture Palette)](#45-custom-brand-colors-accenture-palette)
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
- Replace all `oscar` / `OSCAR` / `notouch` / `NOTOUCH` with your product name
- Replace `@oscar/ui-lib` and `@oscar/ui-core` with your package names
- Replace `oscar-theme-mode` localStorage key with your own
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
│   ├── oscar-shared/           # Python shared utilities
│   └── oscar-plugin-sdk/       # Plugin development SDK
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

    // Secondary — Accenture purple accent
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

    // Accenture brand palette (same in both themes)
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

    // Secondary — Accenture enterprise blue
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

    // Same Accenture brand palette
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

> **Font**: `Graphik` (Accenture licensed). For non-Accenture projects, replace with `Inter` — the fallback already in the stack.

### 4.5 Custom Brand Colors (Accenture Palette)

These are **identical in both dark and light themes**:

| Token | Hex | Description |
|-------|-----|-------------|
| `corePurple1` | `#a100ff` | Accenture core purple (vibrant) |
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

> **For a non-Accenture project**: Replace `corePurple*` with your brand's primary color scale, and `enterpriseBlue*` with your secondary color scale.

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
> - `secondary.main`: `#be82ff` (Accenture purple)
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
> - `oscar` / `OSCAR` → `[your product name]`
> - `@oscar/ui-lib` → `@[yourname]/ui-lib`
> - `@oscar/ui-core` → `@[yourname]/ui-core`
> - `oscar-theme-mode` localStorage key → `[yourapp]-theme-mode`
> - `VITE_UI_NAME` → `"[Your Product Name]"`
> - Logo asset in `NavigationCategories` → your own logo file

---
