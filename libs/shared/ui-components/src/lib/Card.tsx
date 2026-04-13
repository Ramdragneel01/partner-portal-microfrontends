
/**
 * Card — MUI-based container component for content sections.
 * @accessibility Uses semantic article element with proper heading hierarchy.
 */
import React from 'react';
import MuiCard from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import type { SxProps, Theme } from '@mui/material/styles';

interface CardProps {
    title?: string;
    actions?: React.ReactNode;
    children: React.ReactNode;
    sx?: SxProps<Theme>;
    style?: React.CSSProperties;
    className?: string;
}

export const Card: React.FC<CardProps> = ({ title, actions, children, sx, style, className }) => (
    <MuiCard component="article" className={className} elevation={1} sx={sx} style={style}>
        <CardContent>
            {(title || actions) && (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                        marginBottom: '0.75rem',
                    }}
                >
                    {title ? (
                        <Typography variant="h6" component="h3" fontWeight={600} sx={{ m: 0 }}>
                            {title}
                        </Typography>
                    ) : <span />}
                    {actions && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
                            {actions}
                        </div>
                    )}
                </div>
            )}
            {children}
        </CardContent>
    </MuiCard>
);
