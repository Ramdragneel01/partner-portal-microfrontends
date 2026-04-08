
/**
 * PortalThemeProvider — Wraps the app with MUI ThemeProvider + CssBaseline.
 * Persists the selected mode in localStorage and exposes useThemeMode hook.
 *
 * @accessibility CssBaseline resets browser defaults for consistent rendering.
 */
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { darkTheme } from './darkTheme';
import { lightTheme } from './lightTheme';

const STORAGE_KEY = 'partner-portal-theme-mode';

type ThemeMode = 'dark' | 'light';

interface ThemeModeContextType {
    themeMode: ThemeMode;
    setThemeMode: (mode: ThemeMode) => void;
    toggleTheme: () => void;
}

const ThemeModeContext = createContext<ThemeModeContextType | null>(null);

function readStoredMode(): ThemeMode {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === 'light' || stored === 'dark') return stored;
    } catch {
        // localStorage unavailable (e.g. private mode restrictions)
    }
    return 'dark'; // default per README
}

/**
 * PortalThemeProvider — place at the top of the component tree, outside BrowserRouter.
 */
export const PortalThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [themeMode, setThemeModeState] = useState<ThemeMode>(readStoredMode);

    const setThemeMode = useCallback((mode: ThemeMode) => {
        setThemeModeState(mode);
        try { localStorage.setItem(STORAGE_KEY, mode); } catch { /* ignore */ }
    }, []);

    const toggleTheme = useCallback(() => {
        setThemeMode(themeMode === 'dark' ? 'light' : 'dark');
    }, [themeMode, setThemeMode]);

    const muiTheme = useMemo(() => (themeMode === 'dark' ? darkTheme : lightTheme), [themeMode]);

    const ctx = useMemo<ThemeModeContextType>(
        () => ({ themeMode, setThemeMode, toggleTheme }),
        [themeMode, setThemeMode, toggleTheme],
    );

    return (
        <ThemeModeContext.Provider value={ctx}>
            <ThemeProvider theme={muiTheme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ThemeModeContext.Provider>
    );
};

/**
 * Hook to read and toggle the current theme mode from any component.
 * @throws Error if used outside PortalThemeProvider.
 */
export const useThemeMode = (): ThemeModeContextType => {
    const ctx = useContext(ThemeModeContext);
    if (!ctx) throw new Error('useThemeMode must be used within PortalThemeProvider');
    return ctx;
};
