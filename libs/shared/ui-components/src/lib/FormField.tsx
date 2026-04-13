
/**
 * FormField — Accessible labeled input wrapper with validation support.
 * @accessibility Links label to input via htmlFor/id, displays aria-describedby errors.
 */
import React from 'react';

interface FormFieldProps {
    label: string;
    name: string;
    type?: 'text' | 'email' | 'number' | 'date' | 'textarea' | 'select';
    value: string;
    onChange: (value: string) => void;
    error?: string;
    required?: boolean;
    placeholder?: string;
    options?: { value: string; label: string }[];
}

export const FormField: React.FC<FormFieldProps> = ({
    label,
    name,
    type = 'text',
    value,
    onChange,
    error,
    required = false,
    placeholder,
    options,
}) => {
    const inputId = `field-${name}`;
    const errorId = `error-${name}`;

    const inputStyles: React.CSSProperties = {
        width: '100%',
        padding: '0.5rem 0.75rem',
        borderRadius: '6px',
        border: `1px solid ${error ? 'var(--color-danger, #dc2626)' : 'var(--color-border, #d1d5db)'}`,
        fontSize: '0.875rem',
        fontFamily: 'inherit',
        outline: 'none',
        boxSizing: 'border-box',
    };

    const renderInput = () => {
        if (type === 'textarea') {
            return (
                <textarea
                    id={inputId}
                    name={name}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    required={required}
                    placeholder={placeholder}
                    aria-invalid={!!error}
                    aria-describedby={error ? errorId : undefined}
                    style={{ ...inputStyles, minHeight: '80px', resize: 'vertical' }}
                    rows={3}
                />
            );
        }
        if (type === 'select' && options) {
            return (
                <select
                    id={inputId}
                    name={name}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    required={required}
                    aria-invalid={!!error}
                    aria-describedby={error ? errorId : undefined}
                    style={inputStyles}
                >
                    <option value="">-- Select --</option>
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            );
        }
        return (
            <input
                id={inputId}
                type={type}
                name={name}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={required}
                placeholder={placeholder}
                aria-invalid={!!error}
                aria-describedby={error ? errorId : undefined}
                style={inputStyles}
            />
        );
    };

    return (
        <div style={{ marginBottom: '1rem' }}>
            <label
                htmlFor={inputId}
                style={{ display: 'block', marginBottom: '0.375rem', fontWeight: 500, fontSize: '0.875rem', color: 'var(--color-text, #374151)' }}
            >
                {label}
                {required && <span aria-hidden="true" style={{ color: 'var(--color-danger, #dc2626)', marginLeft: '0.25rem' }}>*</span>}
            </label>
            {renderInput()}
            {error && (
                <p id={errorId} role="alert" style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'var(--color-danger, #dc2626)' }}>
                    {error}
                </p>
            )}
        </div>
    );
};
