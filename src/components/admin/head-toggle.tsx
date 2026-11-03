'use client';

import { useActionState } from 'react';
import { setHeadEngineer, type HeadState } from '@/lib/engineer-actions';

/**
 * Admin console → Engineers: Make head / Remove for one engineer. Any number of engineers can be head. Shows that it
 * is saving, and says why if it couldn't be saved, instead of doing nothing.
 */
export function HeadToggle({ id, name, head }: { id: string; name: string; head: boolean }) {
  const [state, action, pending] = useActionState<HeadState, FormData>(setHeadEngineer, {});
  return (
    <form action={action} className="flex flex-col items-start gap-1">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="on" value={head ? '0' : '1'} />
      <span className="flex items-center gap-2">
        {head && (
          <span className="inline-flex items-center gap-1.5 text-[0.875rem] font-semibold text-brand-700">
            <span aria-hidden className="size-1.5 rounded-full bg-brand-600" /> Head
          </span>
        )}
        <button
          disabled={pending}
          aria-label={head ? `Remove ${name} as head of engineering` : `Make ${name} head of engineering`}
          className={head ? 'text-[0.875rem] font-medium text-ink-3 hover:text-signal-700 disabled:opacity-60' : 'inline-flex h-9 items-center rounded-lg border border-line bg-white px-3 text-[0.875rem] font-medium hover:border-ink/40 disabled:opacity-60'}
        >
          {pending ? 'Saving…' : head ? 'Remove' : 'Make head'}
        </button>
      </span>
      {state.error && !pending && (
        <span role="alert" className="max-w-[16rem] whitespace-normal text-[0.8125rem] text-signal-700">
          {state.error}
        </span>
      )}
    </form>
  );
}
