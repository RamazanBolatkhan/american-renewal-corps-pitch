'use client';

import { useFormStatus } from 'react-dom';

/** A submit button that says what it is doing while its server action runs (AI calls can take a while). */
export function PendingButton({ children, pending, className, formAction, disabled }: {
  children: React.ReactNode;
  pending: string;
  className: string;
  formAction?: (formData: FormData) => void | Promise<void>;
  disabled?: boolean;
}) {
  const status = useFormStatus();
  return (
    <button className={className} type="submit" formAction={formAction} disabled={disabled || status.pending} aria-busy={status.pending}>
      {status.pending ? pending : children}
    </button>
  );
}
