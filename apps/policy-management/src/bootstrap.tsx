
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@shared/auth';
import PolicyManagementApp from './remote-entry';

const root = createRoot(document.getElementById('root')!);
root.render(<React.StrictMode><BrowserRouter><AuthProvider><PolicyManagementApp /></AuthProvider></BrowserRouter></React.StrictMode>);
