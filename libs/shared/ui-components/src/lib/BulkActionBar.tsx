
/**
 * BulkActionBar — Floating action bar for batch operations on selected items.
 * @accessibility Uses role="toolbar" with aria-label for screen readers.
 */
import React from 'react';
import { useTheme } from '@mui/material/styles';
import { Button } from './Button';

interface BulkAction {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
    icon?: string;
}

interface BulkActionBarProps {
    selectedCount: number;
    actions: BulkAction[];
    onClearSelection: () => void;
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({ selectedCount, actions, onClearSelection }) => {
    if (selectedCount === 0) return null;
    const theme = useTheme();

    return (
        <div
            role="toolbar"
            aria-label={`Bulk actions for ${selectedCount} selected items`}
            style={{
                position: 'sticky',
                bottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1.25rem',
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.primary,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: '12px',
                boxShadow: theme.shadows[8],
                fontSize: '0.875rem',
                zIndex: 50,
            }}
        >
            <span style={{ fontWeight: 600 }}>{selectedCount} selected</span>
            <div style={{ flex: 1, display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                {actions.map((action) => (
                    <Button key={action.label} variant={action.variant || 'secondary'} size="sm" onClick={action.onClick}>
                        {action.icon && <span aria-hidden="true">{action.icon}</span>}
                        {action.label}
                    </Button>
                ))}
                <Button variant="ghost" size="sm" onClick={onClearSelection}>
                    Clear
                </Button>
            </div>
        </div>
    );
};
