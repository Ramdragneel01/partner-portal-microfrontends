
/**
 * PageHeader — MUI consistent page title bar with optional action buttons.
 * @accessibility Uses Typography h5 for page title per README §7 spec.
 */
import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actions }) => (
    <Box
        component="header"
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}
    >
        <Box>
            <Typography variant="h5" component="h1" fontWeight={700} gutterBottom={Boolean(subtitle)}>
                {title}
            </Typography>
            {subtitle && (
                <Typography variant="body1" color="text.secondary">
                    {subtitle}
                </Typography>
            )}
        </Box>
        {actions && (
            <Box component="nav" aria-label="Page actions" sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                {actions}
            </Box>
        )}
    </Box>
);
