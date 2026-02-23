import type { ReactElement } from 'react';

type InputProps = {
  id: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  showCounter?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

export function Input({
  id,
  label,
  value,
  onChange,
  maxLength,
  showCounter = false,
  placeholder,
  disabled = false,
  className = '',
}: InputProps): ReactElement {
  const counterText = showCounter && maxLength ? `${value.length}/${maxLength}` : null;

  return (
    <div className={`flex w-full flex-col gap-1 ${className}`.trim()}>
      {label ? (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      ) : null}
      <input
        id={id}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        maxLength={maxLength}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-gray-100"
      />
      {counterText ? <span className="text-xs text-gray-500">{counterText}</span> : null}
    </div>
  );
}
