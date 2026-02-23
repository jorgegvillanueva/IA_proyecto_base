import type { ReactElement, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

type ButtonProps = {
  variant?: ButtonVariant;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
  children: ReactNode;
};

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary/90',
  secondary: 'bg-secondary text-white hover:bg-secondary/90',
  danger: 'bg-danger text-white hover:bg-danger/90',
};

export function Button({
  variant = 'primary',
  type = 'button',
  disabled = false,
  onClick,
  className = '',
  children,
}: ButtonProps): ReactElement {
  const baseClasses =
    'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/50 disabled:cursor-not-allowed disabled:opacity-60';

  return (
    <button
      type={type}
      className={`${baseClasses} ${VARIANT_CLASSES[variant]} ${className}`.trim()}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
