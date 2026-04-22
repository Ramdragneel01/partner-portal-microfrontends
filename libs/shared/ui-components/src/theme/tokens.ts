
/**
 * Design tokens — spacing, border-radius, elevation, and animation constants.
 * Single source of truth for all dimension and motion values.
 */
export const themeTokens = {
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48,
    },

    borderRadius: {
        xs: 2,
        sm: 4,
        md: 8,
        lg: 12,
        xl: 16,
        round: '50%' as const,
    },

    elevation: {
        none: 'none',
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    },

    animation: {
        duration: {
            shortest: 150,
            shorter: 200,
            short: 250,
            standard: 300,
            complex: 375,
            enteringScreen: 225,
            leavingScreen: 195,
        },
        easing: {
            easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
            easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
            easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
            sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
        },
    },

    /** Sidebar layout constants (README §5) */
    layout: {
        iconStripWidth: 56,
        drawerWidth: 244,
        totalSidebarWidth: 300,
        headerHeight: 56,
        footerMinHeight: 60,
    },
} as const;

/** Shared Archaic Search brand palette — identical in dark and light themes */
export const customBrand = {
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
} as const;
