
/**
 * DataTable — Accessible data table with sorting and row selection.
 * @accessibility Uses semantic <table> with proper th scope, aria-sort, and keyboard navigation.
 */
import React, { useEffect, useState } from 'react';
import { useTheme, alpha } from '@mui/material/styles';
import Skeleton from '@mui/material/Skeleton';
import { PREFS_STORAGE_PREFIX } from './useUserPreferences';

export interface Column<T> {
    key: string;
    header: string;
    render?: (row: T) => React.ReactNode;
    sortable?: boolean;
    width?: string;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    rowKey: keyof T;
    selectable?: boolean;
    selectedRows?: Set<string>;
    onSelectionChange?: (selected: Set<string>) => void;
    emptyMessage?: string;
    preferenceKey?: string;
    loading?: boolean;
    skeletonRowCount?: number;
}

interface PersistedTablePreferences {
    sortColumn: string | null;
    sortDir: 'asc' | 'desc';
}

function getPreferenceStorageKey(preferenceKey?: string): string | null {
    if (!preferenceKey || !preferenceKey.trim()) {
        return null;
    }

    return `${PREFS_STORAGE_PREFIX}${preferenceKey}`;
}

function readPersistedPreferences(storageKey: string | null): PersistedTablePreferences {
    if (!storageKey) {
        return { sortColumn: null, sortDir: 'asc' };
    }

    try {
        const raw = localStorage.getItem(storageKey);
        if (!raw) {
            return { sortColumn: null, sortDir: 'asc' };
        }

        const parsed = JSON.parse(raw) as Partial<PersistedTablePreferences>;
        return {
            sortColumn: typeof parsed.sortColumn === 'string' || parsed.sortColumn === null ? parsed.sortColumn : null,
            sortDir: parsed.sortDir === 'desc' ? 'desc' : 'asc',
        };
    } catch {
        return { sortColumn: null, sortDir: 'asc' };
    }
}

export function DataTable<T extends object>({
    columns,
    data,
    rowKey,
    selectable = false,
    selectedRows,
    onSelectionChange,
    emptyMessage = 'No data available',
    preferenceKey,
    loading = false,
    skeletonRowCount = 10,
}: DataTableProps<T>) {
    const storageKey = getPreferenceStorageKey(preferenceKey);
    const [sortColumn, setSortColumn] = useState<string | null>(() => readPersistedPreferences(storageKey).sortColumn);
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>(() => readPersistedPreferences(storageKey).sortDir);
    const theme = useTheme();
    const normalizedSkeletonRowCount = Number.isFinite(skeletonRowCount)
        ? Math.max(1, Math.floor(skeletonRowCount))
        : 10;

    useEffect(() => {
        const preferences = readPersistedPreferences(storageKey);
        setSortColumn(preferences.sortColumn);
        setSortDir(preferences.sortDir);
    }, [storageKey]);

    useEffect(() => {
        if (!storageKey) {
            return;
        }

        const payload: PersistedTablePreferences = { sortColumn, sortDir };

        try {
            localStorage.setItem(storageKey, JSON.stringify(payload));
        } catch {
            // Silently ignore localStorage write failures.
        }
    }, [storageKey, sortColumn, sortDir]);

    const handleSort = (col: string) => {
        if (sortColumn === col) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(col);
            setSortDir('asc');
        }
    };

    const sorted = [...data].sort((a, b) => {
        if (!sortColumn) return 0;
        const aVal = String((a as Record<string, unknown>)[sortColumn] ?? '');
        const bVal = String((b as Record<string, unknown>)[sortColumn] ?? '');
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });

    const toggleRow = (id: string) => {
        if (!onSelectionChange || !selectedRows) return;
        const next = new Set(selectedRows);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        onSelectionChange(next);
    };

    const toggleAll = () => {
        if (!onSelectionChange) return;
        if (selectedRows?.size === data.length) {
            onSelectionChange(new Set());
        } else {
            onSelectionChange(new Set(data.map((r) => String((r as Record<string, unknown>)[rowKey as string]))));
        }
    };

    const tableStyles: React.CSSProperties = {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '0.875rem',
    };

    const thStyles: React.CSSProperties = {
        textAlign: 'left',
        padding: '0.75rem 1rem',
        borderBottom: `2px solid ${theme.palette.divider}`,
        fontWeight: 600,
        color: theme.palette.text.secondary,
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        whiteSpace: 'nowrap',
    };

    const tdStyles: React.CSSProperties = {
        padding: '0.75rem 1rem',
        borderBottom: `1px solid ${theme.palette.divider}`,
        color: theme.palette.text.primary,
    };

    return (
        <div style={{ overflowX: 'auto' }} role="region" aria-label="Data table" aria-busy={loading || undefined}>
            <table style={tableStyles}>
                <thead>
                    <tr>
                        {selectable && (
                            <th style={{ ...thStyles, width: '40px' }}>
                                <input
                                    type="checkbox"
                                    aria-label="Select all rows"
                                    checked={selectedRows?.size === data.length && data.length > 0}
                                    onChange={toggleAll}
                                />
                            </th>
                        )}
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                style={{ ...thStyles, width: col.width, cursor: col.sortable ? 'pointer' : 'default' }}
                                scope="col"
                                aria-sort={sortColumn === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}
                                onClick={() => col.sortable && handleSort(col.key)}
                                onKeyDown={(e) => e.key === 'Enter' && col.sortable && handleSort(col.key)}
                                tabIndex={col.sortable ? 0 : undefined}
                            >
                                {col.header}
                                {col.sortable && sortColumn === col.key && (
                                    <span aria-hidden="true" style={{ marginLeft: '0.25rem' }}>{sortDir === 'asc' ? '▲' : '▼'}</span>
                                )}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        Array.from({ length: normalizedSkeletonRowCount }).map((_, rowIndex) => (
                            <tr key={`skeleton-row-${rowIndex}`} aria-hidden="true">
                                {selectable && (
                                    <td style={tdStyles}>
                                        <Skeleton variant="rounded" width={16} height={16} />
                                    </td>
                                )}
                                {columns.map((col) => (
                                    <td key={`${col.key}-skeleton-${rowIndex}`} style={tdStyles}>
                                        <Skeleton
                                            variant="text"
                                            width={col.width ?? `${Math.max(45, 88 - rowIndex * 3)}%`}
                                            height={22}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : sorted.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length + (selectable ? 1 : 0)} style={{ ...tdStyles, textAlign: 'center', padding: '2rem' }}>
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        sorted.map((row) => {
                            const id = String((row as Record<string, unknown>)[rowKey as string]);
                            const isSelected = selectedRows?.has(id);
                            return (
                                <tr
                                    key={id}
                                    style={{ backgroundColor: isSelected ? alpha(theme.palette.primary.main, 0.12) : 'transparent' }}
                                >
                                    {selectable && (
                                        <td style={tdStyles}>
                                            <input
                                                type="checkbox"
                                                aria-label={`Select row ${id}`}
                                                checked={!!isSelected}
                                                onChange={() => toggleRow(id)}
                                            />
                                        </td>
                                    )}
                                    {columns.map((col) => (
                                        <td key={col.key} style={tdStyles}>
                                            {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '')}
                                        </td>
                                    ))}
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
}
