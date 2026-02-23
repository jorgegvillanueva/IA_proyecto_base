import type { ReactElement } from 'react';

type SpinnerProps = {
  text?: string;
};

export function Spinner({ text }: SpinnerProps): ReactElement {
  return (
    <div className="flex items-center gap-3 text-sm text-gray-600">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
      {text ? <span>{text}</span> : null}
    </div>
  );
}
