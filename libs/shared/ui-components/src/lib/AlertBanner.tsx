
/**
 * AlertBanner — Actionable notification banner.
 * @accessibility Uses role="alert" with aria-live for screen reader announcements.
 */
import React from 'react';

interface AlertBannerProps {
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  onDismiss?: () => void;
}

const alertStyles: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  info: { bg: '#eff6ff', border: '#93c5fd', text: '#1e40af', icon: 'ℹ️' },
  success: { bg: '#f0fdf4', border: '#86efac', text: '#166534', icon: '✅' },
  warning: { bg: '#fffbeb', border: '#fcd34d', text: '#92400e', icon: '⚠️' },
  error: { bg: '#fef2f2', border: '#fca5a5', text: '#991b1b', icon: '❌' },
};

export const AlertBanner: React.FC<AlertBannerProps> = ({ type, message, onDismiss }) => {
  const style = alertStyles[type];
  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem 1rem',
        borderRadius: '8px',
        backgroundColor: style.bg,
        borderLeft: `4px solid ${style.border}`,
        color: style.text,
        fontSize: '0.875rem',
      }}
    >
      <span aria-hidden="true">{style.icon}</span>
      <span style={{ flex: 1 }}>{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss alert"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: style.text, fontSize: '1.25rem' }}
        >
          ×
        </button>
      )}
    </div>
  );
};
