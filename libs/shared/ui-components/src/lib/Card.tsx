
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
    children: React.ReactNode;
    sx?: SxProps<Theme>;
    style?: React.CSSProperties;
    className?: string;
}

export const Card: React.FC<CardProps> = ({ title, children, sx, style, className }) => (
    <MuiCard component="article" className={className} elevation={1} sx={sx} style={style}>
        <CardContent>
            {title && (
                <Typography variant="h6" component="h3" gutterBottom fontWeight={600}>
                    {title}
                </Typography>
            )}
            {children}
        </CardContent>
    </MuiCard>
);
