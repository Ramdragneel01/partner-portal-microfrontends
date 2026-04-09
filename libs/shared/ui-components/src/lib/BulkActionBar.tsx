
/**
 * BulkActionBar — Floating action bar for batch operations on selected items.
 * Supports unlimited actions via an overflow "More" dropdown menu when visible
 * actions exceed `maxVisibleActions` (default: 3).
 * @accessibility Uses role="toolbar" with aria-label for screen readers.
 *   The overflow menu button uses aria-haspopup/aria-expanded for screen reader support.
 */

import React, { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { Button } from './Button';

export interface BulkAction {
    /** Unique identifier for the action */
    id?: string;
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
    icon?: string;
    /** When true, action is hidden from the toolbar */
    disabled?: boolean;
}

export interface BulkActionBarProps {
    selectedCount: number;
    actions: BulkAction[];
    onClearSelection: () => void;
    /**
     * Maximum number of actions shown inline before the rest collapse into a
     * "More" overflow menu. Defaults to 3.
     */
    maxVisibleActions?: number;
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({
    selectedCount,
    actions,
    onClearSelection,
    maxVisibleActions = 3,
}) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const menuOpen = Boolean(anchorEl);

    if (selectedCount === 0) return null;
    const theme = useTheme();

    const enabledActions = actions.filter((a) => !a.disabled);
    const visibleActions = enabledActions.slice(0, maxVisibleActions);
    const overflowActions = enabledActions.slice(maxVisibleActions);

    const handleMoreClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleOverflowAction = (action: BulkAction) => {
        handleMenuClose();
        action.onClick();
    };

    const selectionLabel = `${selectedCount} ${selectedCount === 1 ? 'item' : 'items'} selected`;

    return (
        <>
            <div
                role="toolbar"
                aria-label={`Bulk actions for ${selectedCount} selected ${selectedCount === 1 ? 'item' : 'items'}`}
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
                <span style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{selectionLabel}</span>
                <div style={{ flex: 1, display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    {visibleActions.map((action) => (
                        <Button
                            key={action.id ?? action.label}
                            variant={action.variant || 'secondary'}
                            size="sm"
                            onClick={action.onClick}
                        >
                            {action.icon && <span aria-hidden="true">{action.icon}&nbsp;</span>}
                            {action.label}
                        </Button>
                    ))}

                    {overflowActions.length > 0 && (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleMoreClick}
                            aria-haspopup="true"
                            aria-expanded={menuOpen}
                            aria-controls={menuOpen ? 'bulk-overflow-menu' : undefined}
                        >
                            More&nbsp;▾
                        </Button>
                    )}

                    <Button variant="ghost" size="sm" onClick={onClearSelection} aria-label="Clear selection">
                        ✕ Clear
                    </Button>
                </div>
            </div>

            {overflowActions.length > 0 && (
                <Menu
                    id="bulk-overflow-menu"
                    anchorEl={anchorEl}
                    open={menuOpen}
                    onClose={handleMenuClose}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    slotProps={{ paper: { elevation: 8, style: { minWidth: '180px' } } }}
                >
                    {overflowActions.map((action) => (
                        <MenuItem
                            key={action.id ?? action.label}
                            onClick={() => handleOverflowAction(action)}
                            dense
                        >
                            {action.icon && (
                                <ListItemIcon sx={{ minWidth: 32 }}>
                                    <span aria-hidden="true" style={{ fontSize: '1rem' }}>{action.icon}</span>
                                </ListItemIcon>
                            )}
                            <ListItemText
                                primary={action.label}
                                slotProps={{
                                    primary: {
                                        style: {
                                            color: action.variant === 'danger'
                                                ? theme.palette.error.main
                                                : 'inherit',
                                            fontWeight: action.variant === 'primary' ? 600 : 400,
                                        },
                                    },
                                }}
                            />
                        </MenuItem>
                    ))}
                </Menu>
            )}
        </>
    );
};
