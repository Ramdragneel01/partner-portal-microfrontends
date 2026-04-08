
/**
 * Button — MUI-based primary interactive element.
 * @accessibility MUI Button inherits full a11y including focus, aria-busy, disabled state.
 */
import React from 'react';
import MuiButton from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

export interface ButtonProps {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    disabled?: boolean;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    children?: React.ReactNode;
    type?: 'button' | 'submit' | 'reset';
    'aria-label'?: string;
    style?: React.CSSProperties;
}

const MUI_VARIANT_MAP = {
    primary: 'contained',
    secondary: 'outlined',
    ghost: 'text',
    danger: 'contained',
} as const;

const SIZE_MAP = { sm: 'small', md: 'medium', lg: 'large' } as const;

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled,
    children,
    onClick,
    type = 'button',
    'aria-label': ariaLabel,
    style,
}) => (
    <MuiButton
        variant={MUI_VARIANT_MAP[variant]}
        size={SIZE_MAP[size]}
        disabled={disabled || loading}
        onClick={onClick}
        type={type}
        aria-label={ariaLabel}
        aria-busy={loading}
        color={variant === 'danger' ? 'error' : 'primary'}
        style={style}
        startIcon={loading ? <CircularProgress size={14} color="inherit" /> : undefined}
    >
        {children}
    </MuiButton>
);
