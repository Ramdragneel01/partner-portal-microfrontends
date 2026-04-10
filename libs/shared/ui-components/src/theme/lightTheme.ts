
/**
 * Light theme configuration for MUI v7.
 * Partner Portal light variant — near-black primary with enterprise blue accents.
 */
import { createTheme } from '@mui/material/styles';
import { themeTokens, customBrand } from './tokens';

export const lightTheme = createTheme({
    palette: {
        mode: 'light',

        primary: {
            main: '#212121',
            light: '#616161',
            dark: '#000000',
            contrastText: '#eeeeee',
        },

        secondary: {
            main: '#a100ff',
            light: '#be82ff',
            dark: '#7500c0',
            contrastText: '#ffffff',
        },

        error: { main: '#d32f2f', light: '#ef5350', dark: '#c62828', contrastText: '#ffffff' },
        warning: { main: '#ef6c00', light: '#ff9800', dark: '#e65100', contrastText: '#ffffff' },
        majorWarning: { main: '#E64A19', light: '#FF5722', dark: '#BF360C' },
        info: { main: '#0288d1', light: '#03a9f4', dark: '#01579b', contrastText: '#ffffff' },
        success: { main: '#2e7d32', light: '#4caf50', dark: '#1b5e20', contrastText: '#000000' },

        text: {
            primary: '#212121',
            secondary: '#616161',
            disabled: '#bdbdbd',
        },

        background: {
            default: '#f5f5f5',
            paper: '#ffffff',
        },

        divider: 'rgba(0, 0, 0, 0.12)',

        action: {
            active: 'rgba(0, 0, 0, 0.7)',
            hover: 'rgba(160, 85, 245, 0.08)',
            hoverOpacity: 0.08,
            selected: 'rgba(0, 0, 0, 0.16)',
            selectedOpacity: 0.16,
            disabled: 'rgba(0, 0, 0, 0.3)',
            disabledBackground: 'rgba(0, 0, 0, 0.12)',
            focus: 'rgba(160, 85, 245, 0.12)',
        },

        customBrand,

        chartPalette: {
            colors: [
                '#2962FF',
                '#00838F',
                '#880E4F',
                '#E65100',
                '#311B92',
                '#BF360C',
                '#7B1FA2',
                '#1B5E20',
                '#B71C1C',
                '#827717',
                '#00796B',
                '#3E2723',
            ],
        },

        iconColors: {
            'status-error': 'mui-palette-error-main',
            'status-warning-major': 'mui-palette-majorWarning-main',
            'status-warning': 'mui-palette-warning-main',
            'status-info': 'mui-palette-info-main',
            'status-success': 'mui-palette-success-main',
            'status-neutral': '#424242',
            'status-brand': '#673AB7',
            'trend-positive': '#8BC34A',
            'trend-negative': '#FF5252',
            'severity-moderate': '#00796B',
        },
    },

    typography: {
        fontFamily: 'Graphik, Inter, system-ui, -apple-system, sans-serif',
        fontSize: 14,
        htmlFontSize: 16,
        fontWeightLight: 300,
        fontWeightRegular: 400,
        fontWeightMedium: 500,
        fontWeightBold: 700,
        h1: { fontSize: '6rem', fontWeight: 300, lineHeight: 1.2, letterSpacing: '-1.5px' },
        h2: { fontSize: '3.75rem', fontWeight: 300, lineHeight: 1.2, letterSpacing: '-0.5px' },
        h3: { fontSize: '3rem', fontWeight: 400, lineHeight: 1.2 },
        h4: { fontSize: '2.125rem', fontWeight: 400, lineHeight: 1.2, letterSpacing: '0.25px' },
        h5: { fontSize: '1.5rem', fontWeight: 400, lineHeight: 1.2 },
        h6: { fontSize: '1.25rem', fontWeight: 500, lineHeight: 1.2, letterSpacing: '0.15px' },
        body1: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.5, letterSpacing: '0.15px' },
        body2: { fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.5, letterSpacing: '0.15px' },
    },

    shape: { borderRadius: themeTokens.borderRadius.md },

    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 500,
                    borderRadius: themeTokens.borderRadius.md,
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: { borderRadius: themeTokens.borderRadius.lg },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: { borderRadius: themeTokens.borderRadius.md },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: themeTokens.borderRadius.md,
                    },
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: '#ffffff',
                    borderRight: '1px solid rgba(0,0,0,0.12)',
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#ffffff',
                    color: '#212121',
                    backgroundImage: 'none',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                },
            },
        },
    },
});
