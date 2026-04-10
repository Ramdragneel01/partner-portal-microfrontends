/**
 * Router configuration for the shell host.
 * Uses the data router so navigation can opt into flushSync updates.
 */
import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import App from './App';


export const router = createBrowserRouter([
    {
        path: '/*',
        element: <App />,
    },
]);