'use client';

import { LayoutGroup, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { LoginForm } from '@/components/auth/login-form';
import { RegisterForm } from '@/components/auth/register-form';
import { contact } from '@/data/seed';
import { cn } from '@/lib/utils';

type Mode = 'signin' | 'register';
type Demo = { role: 'client' | 'engineer'; label: string; email: string; password: string };

/**
 * Portal access: Sign in and Register tabs, as on the original site's account page.
 * Engineers' accounts are issued internally, so their sign-in has no Register tab.
 */
export function AccessPanel({ next, demo, notice, engineer, initialMode }: {
  next?: string;
  demo: Demo[];
  notice?: string;
  engineer: boolean;
  initialMode: Mode;
}) {
  const [mode, setMode] = useState<Mode>(engineer ? 'signin' : initialMode);

  // Keep the URL shareable (?mode=register) without a navigation.
  useEffect(() => {
    if (engineer) return;
    const url = new URL(location.href);
    if (mode === 'register') url.searchParams.set('mode', 'register');
    else url.searchParams.delete('mode');
    if (url.href !== location.href) history.replaceState(null, '', url);
  }, [mode, engineer]);

  return (
    <>
      {!engineer && (
        <LayoutGroup>
          <div role="tablist" aria-label="Portal access" className="grid grid-cols-2 rounded-xl bg-mist p-1 lg:mt-12">
            {(['signin', 'register'] as const).map((m) => (
              <button
                key={m}
                role="tab"
                type="button"
                aria-selected={mode === m}
                onClick={() => setMode(m)}
                className={cn('relative h-10 rounded-lg text-sm font-medium transition-colors', mode === m ? 'text-ink' : 'text-ink-3 hover:text-ink')}
              >
                {mode === m && <motion.span layoutId="access-tab" className="absolute inset-0 rounded-lg bg-paper shadow-[0_1px_3px_rgb(0_40_21/0.12)]" transition={{ type: 'spring', bounce: 0.15, duration: 0.45 }} />}
                <span className="relative">{m === 'signin' ? 'Sign in' : 'Register'}</span>
              </button>
            ))}
          </div>
        </LayoutGroup>
      )}

      <div role={engineer ? undefined : 'tabpanel'} className={engineer ? 'lg:mt-12' : 'mt-8'}>
        <h2 className="text-[32px] font-semibold leading-tight tracking-[-0.02em] text-ink">
          {mode === 'signin' ? 'Welcome back' : 'Create an account'}
        </h2>
        <p className="mt-2 text-[15px] text-ink-3">
          {engineer
            ? 'Sign in to the engineer service portal.'
            : mode === 'signin'
              ? 'Sign in to your Flokefama client portal.'
              : 'Register your facility for the Flokefama client portal.'}
        </p>

        {mode === 'signin' ? <LoginForm next={next} demo={demo} notice={notice} /> : <RegisterForm onSignIn={() => setMode('signin')} />}
      </div>

      <p className="mt-8 text-center text-sm text-ink-3">
        {engineer || mode === 'register' ? 'Need help?' : 'New to the portal?'}{' '}
        {!engineer && mode === 'signin' ? (
          <button type="button" onClick={() => setMode('register')} className="font-medium text-brand-700 underline-offset-4 hover:underline">Register your facility</button>
        ) : (
          <a href={`mailto:${contact.support}`} className="font-medium text-brand-700 underline-offset-4 hover:underline">Contact support</a>
        )}
        {' '}or call{' '}
        <a href={contact.phoneHref} className="whitespace-nowrap font-medium text-brand-700 underline-offset-4 hover:underline">{contact.phone}</a>
      </p>
    </>
  );
}
