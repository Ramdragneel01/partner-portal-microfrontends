
/**
 * Dark theme configuration for MUI v7.
 * Default theme for the Partner Portal — dark navy/charcoal palette
 * with Accenture purple accents.
 */
import { createTheme } from '@mui/material/styles';
import { themeTokens, customBrand } from './tokens';

declare module '@mui/material/styles' {
    interface Palette {
        customBrand: typeof customBrand;
        chartPalette: { colors: string[] };
        majorWarning: {
            main: string;
            light: string;
            dark: string;
        };
        iconColors: Record<string, string>;
    }
    interface PaletteOptions {
        customBrand?: Partial<typeof customBrand>;
        chartPalette?: { colors: string[] };
        majorWarning?: {
            main: string;
            light: string;
            dark: string;
        };
        iconColors?: Record<string, string>;
    }
}

export const darkTheme = createTheme({
    palette: {
        mode: 'dark',

        primary: {
            main: '#e0e0e0',
            light: '#e6e6dc',
            dark: '#bdbdbd',
        },

        secondary: {
            main: '#be82ff',
            light: '#dcafff',
            dark: '#a055f5',
        },

        error: { main: '#ef5350', light: '#e57373', dark: '#e53935' },
        warning: { main: '#ffb74d', light: '#ffcc90', dark: '#fb8c00' },
        majorWarning: { main: '#FF9800', light: '#FFB74D', dark: '#FF6F00' },
        info: { main: '#4fc3f7', light: '#81d4fa', dark: '#03a9f4' },
        success: { main: '#8BC34A', light: '#AED581', dark: '#7CB342' },

        text: {
            primary: '#eeeeee',
            secondary: '#9e9e9e',
            disabled: '#616161',
        },

        background: {
            default: '#121212',
            paper: '#232323',
        },

        divider: 'rgba(255, 255, 255, 0.12)',

        action: {
            active: 'rgba(255, 255, 255, 0.7)',
            hover: 'rgba(160, 85, 245, 0.08)',
            hoverOpacity: 0.08,
            selected: 'rgba(255, 255, 255, 0.16)',
            selectedOpacity: 0.16,
            disabled: 'rgba(255, 255, 255, 0.3)',
            disabledBackground: 'rgba(255, 255, 255, 0.12)',
            focus: 'rgba(160, 85, 245, 0.12)',
        },

        customBrand,

        chartPalette: {
            colors: [
                '#2962FF',
                '#18ffff',
                '#EC407A',
                '#FFEB3B',
                '#6732B7',
                '#FFA000',
                '#AB47BC',
                '#00E676',
                '#FF5252',
                '#C6FF00',
                '#26A69A',
                '#FF9100',
            ],
        },

        iconColors: {
            'status-error': 'mui-palette-error-main',
            'status-warning-major': 'mui-palette-majorWarning-main',
            'status-warning': 'mui-palette-warning-main',
            'status-info': 'mui-palette-info-main',
            'status-success': 'mui-palette-success-main',
            'status-neutral': '#BDBDBD',
            'status-brand': '#673AB7',
            'trend-positive': '#8BC34A',
            'trend-negative': '#FF5252',
            'severity-moderate': '#26A69A',
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
                    backgroundColor: '#121212',
                    borderRight: '1px solid rgba(161,0,255,0.15)',
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#121212',
                    backgroundImage: 'none',
                    borderBottom: '1px solid rgba(161,0,255,0.2)',
                },
            },
        },
    },
});
