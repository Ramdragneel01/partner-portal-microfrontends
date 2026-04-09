
/**
 * useUserPreferences — Persists domain data to localStorage under a namespaced key.
 *
 * Usage:
 *   const [risks, setRisks, clearRisks] = useUserPreferences('risk-assessment:risks', mockData.risks);
 *
 * Keys are stored as `partner-portal:prefs:<namespace>`.
 * Returns a [value, setValue, clearValue] tuple. setValue accepts a direct value or
 * an updater function identical to React's setState.
 *
 * @security Values are JSON-serialised; no sensitive credentials should be stored here.
 *   Reads are isolated to the current origin via the Web Storage same-origin policy.
 */
import { useState, useCallback, useEffect, useRef } from 'react';

export const PREFS_STORAGE_PREFIX = 'partner-portal:prefs:';

function readStorage<T>(storageKey: string, defaultValue: T): T {
    try {
        const raw = localStorage.getItem(storageKey);
        return raw !== null ? (JSON.parse(raw) as T) : defaultValue;
    } catch {
        return defaultValue;
    }
}

function writeStorage<T>(storageKey: string, value: T): void {
    try {
        localStorage.setItem(storageKey, JSON.stringify(value));
    } catch {
        // Silently swallow QuotaExceededError — in-memory state still correct
    }
}

/**
 * Persists a value in localStorage under `partner-portal:prefs:<namespace>`.
 * The stored value survives navigation and page reloads.
 *
 * @param namespace  Dot-separated domain key, e.g. `risk-assessment.risks`
 * @param defaultValue  Fallback used when no stored value exists or storage is cleared
 * @returns [value, setValue, clearValue]
 */
export function useUserPreferences<T>(
    namespace: string,
    defaultValue: T
): [T, (next: T | ((prev: T) => T)) => void, () => void] {
    const storageKey = `${PREFS_STORAGE_PREFIX}${namespace}`;

    // Use a ref for defaultValue so clearValue doesn't change identity on every render
    const defaultRef = useRef(defaultValue);

    const [value, setValueInternal] = useState<T>(() =>
        readStorage(storageKey, defaultRef.current)
    );

    // Keep state in sync if the same namespace is used in multiple component instances
    useEffect(() => {
        const handler = (e: StorageEvent) => {
            if (e.key === storageKey) {
                setValueInternal(
                    e.newValue !== null
                        ? (JSON.parse(e.newValue) as T)
                        : defaultRef.current
                );
            }
        };
        window.addEventListener('storage', handler);
        return () => window.removeEventListener('storage', handler);
    }, [storageKey]);

    const setValue = useCallback(
        (next: T | ((prev: T) => T)) => {
            setValueInternal((prev) => {
                const resolved =
                    typeof next === 'function'
                        ? (next as (prev: T) => T)(prev)
                        : next;
                writeStorage(storageKey, resolved);
                return resolved;
            });
        },
        [storageKey]
    );

    const clearValue = useCallback(() => {
        localStorage.removeItem(storageKey);
        setValueInternal(defaultRef.current);
    }, [storageKey]);

    return [value, setValue, clearValue];
}
