
/**
 * Bootstrap — Renders the root React application.
 * Separated from index.ts to support Module Federation async loading.
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { PortalThemeProvider } from '@shared/ui-components';
import { router } from './router';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

const root = createRoot(rootElement);
root.render(
    <React.StrictMode>
        <PortalThemeProvider>
            <RouterProvider router={router} />
        </PortalThemeProvider>
    </React.StrictMode>
);
