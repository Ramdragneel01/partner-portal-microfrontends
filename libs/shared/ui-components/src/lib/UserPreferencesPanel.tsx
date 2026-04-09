
/**
 * UserPreferencesPanel — Modal dialog that lets users inspect and clear
 * locally-stored portal preferences (localStorage entries under the
 * `partner-portal:prefs:*` namespace).
 *
 * @accessibility Uses role="dialog", aria-modal, keyboard navigation, and
 *   visible focus indicators on all interactive elements (WCAG 2.1 AA).
 * @security No passwords or tokens are ever stored under the prefs prefix.
 *   This panel only reads/removes keys from the partner-portal namespace.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useTheme, alpha } from '@mui/material/styles';
import { Modal } from './Modal';
import { Button } from './Button';
import { PREFS_STORAGE_PREFIX } from './useUserPreferences';

interface PrefEntry {
    namespace: string;
    key: string;
    label: string;
    itemCount: number | null;
    bytes: number;
}

interface UserPreferencesPanelProps {
    open: boolean;
    onClose: () => void;
}

/** Human-readable label from a raw namespace key */
function toLabel(namespace: string): string {
    return namespace
        .replace(/[-_.]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Derive a friendly item count from a stored JSON value */
function deriveCount(raw: string): number | null {
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.length : null;
    } catch {
        return null;
    }
}

/** Read all partner-portal preference entries from localStorage */
function readAllEntries(): PrefEntry[] {
    const found: PrefEntry[] = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(PREFS_STORAGE_PREFIX)) {
            const namespace = key.slice(PREFS_STORAGE_PREFIX.length);
            const raw = localStorage.getItem(key) ?? '';
            found.push({
                namespace,
                key,
                label: toLabel(namespace),
                itemCount: deriveCount(raw),
                bytes: new Blob([raw]).size,
            });
        }
    }
    return found.sort((a, b) => a.label.localeCompare(b.label));
}


export const UserPreferencesPanel: React.FC<UserPreferencesPanelProps> = ({
    open,
    onClose,
}) => {
    const theme = useTheme();
    const [entries, setEntries] = useState<PrefEntry[]>([]);
    const [justCleared, setJustCleared] = useState<Set<string>>(new Set());

    const refresh = useCallback(() => setEntries(readAllEntries()), []);

    useEffect(() => {
        if (open) {
            refresh();
            setJustCleared(new Set());
        }
    }, [open, refresh]);

    const clearEntry = (key: string, namespace: string) => {
        localStorage.removeItem(key);
        setJustCleared((prev) => new Set([...prev, namespace]));
        refresh();
        // Notify other tabs / hook instances
        window.dispatchEvent(
            new StorageEvent('storage', { key, newValue: null, storageArea: localStorage })
        );
    };

    const clearAll = () => {
        entries.forEach((e) => {
            localStorage.removeItem(e.key);
            window.dispatchEvent(
                new StorageEvent('storage', { key: e.key, newValue: null, storageArea: localStorage })
            );
        });
        setJustCleared(new Set(entries.map((e) => e.namespace)));
        refresh();
    };

    const rowStyle = (isCleared: boolean): React.CSSProperties => ({
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.625rem 0.75rem',
        borderRadius: '8px',
        backgroundColor: isCleared
            ? alpha(theme.palette.success.main, 0.08)
            : alpha(theme.palette.background.default, 0.5),
        border: `1px solid ${isCleared ? alpha(theme.palette.success.main, 0.25) : theme.palette.divider}`,
        marginBottom: '0.5rem',
        opacity: isCleared ? 0.65 : 1,
        transition: 'all 0.2s ease',
    });

    const labelStyle: React.CSSProperties = {
        flex: 1,
        fontWeight: 500,
        fontSize: '0.875rem',
        color: theme.palette.text.primary,
    };

    const metaStyle: React.CSSProperties = {
        fontSize: '0.75rem',
        color: theme.palette.text.secondary,
    };

    const emptyStyle: React.CSSProperties = {
        textAlign: 'center',
        padding: '2rem 0',
        color: theme.palette.text.secondary,
        fontSize: '0.9rem',
    };

    return (
        <Modal isOpen={open} onClose={onClose} title="User Preferences" size="md">
            <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: theme.palette.text.secondary }}>
                The portal stores your changes (created records, edits) locally in your browser.
                You can clear individual sections or remove everything below.
            </p>

            {entries.length === 0 ? (
                <div style={emptyStyle} role="status" aria-live="polite">
                    No stored preferences found.
                </div>
            ) : (
                <ul
                    style={{ listStyle: 'none', padding: 0, margin: '0 0 1rem' }}
                    aria-label="Stored preference sections"
                >
                    {entries.map((entry) => {
                        const cleared = justCleared.has(entry.namespace);
                        return (
                            <li key={entry.key} style={rowStyle(cleared)}>
                                <span
                                    aria-hidden="true"
                                    style={{ fontSize: '1.1rem' }}
                                >
                                    {cleared ? '✓' : '💾'}
                                </span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={labelStyle}>{entry.label}</div>
                                    <div style={metaStyle}>
                                        {entry.itemCount !== null
                                            ? `${entry.itemCount} record${entry.itemCount !== 1 ? 's' : ''} · `
                                            : ''}
                                        {entry.bytes < 1024
                                            ? `${entry.bytes} B`
                                            : `${(entry.bytes / 1024).toFixed(1)} KB`}
                                        {cleared && (
                                            <span
                                                style={{ color: theme.palette.success.main, marginLeft: '0.5rem' }}
                                            >
                                                Cleared
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {!cleared && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => clearEntry(entry.key, entry.namespace)}
                                        aria-label={`Clear ${entry.label} preferences`}
                                    >
                                        Clear
                                    </Button>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}

            <footer
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '0.75rem',
                    borderTop: `1px solid ${theme.palette.divider}`,
                    gap: '0.75rem',
                    flexWrap: 'wrap',
                }}
            >
                <span style={{ fontSize: '0.75rem', color: theme.palette.text.secondary }}>
                    {entries.length > 0
                        ? `${entries.length} section${entries.length !== 1 ? 's' : ''} stored locally`
                        : 'No data stored'}
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {entries.length > 0 && justCleared.size < entries.length && (
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={clearAll}
                            aria-label="Clear all stored preferences"
                        >
                            Clear All
                        </Button>
                    )}
                    <Button variant="secondary" size="sm" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </footer>
        </Modal>
    );
};
