'use client';

/** A submit button that asks first; the form only sends if the admin confirms. */
export function ConfirmButton({ message, className, children }: { message: string; className?: string; children: React.ReactNode }) {
  return (
    <button type="submit" className={className} onClick={(e) => !confirm(message) && e.preventDefault()}>
      {children}
    </button>
  );
}
