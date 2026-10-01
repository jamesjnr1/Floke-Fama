'use client';

import { MotionConfig } from 'motion/react';
import { usePathname } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/ui/icon';
import { A11Y_KEY, applyA11y, defaultA11y, type A11ySettings, type TextSize } from '@/lib/a11y';
import { cn } from '@/lib/utils';

const Ctx = createContext<{ open: () => void }>({ open: () => {} });
/** Lets a portal sidebar open the accessibility panel. */
export const useAccessibility = () => useContext(Ctx);

const toggles: { key: Exclude<keyof A11ySettings, 'text'>; label: string; hint: string; icon: string }[] = [
  { key: 'contrast', label: 'High contrast', hint: 'Stronger text and borders', icon: 'fi-rr-eye' },
  { key: 'motion', label: 'Reduce motion', hint: 'Stop animations and 3D', icon: 'fi-rr-pause' },
  { key: 'links', label: 'Underline links', hint: 'Make links easier to spot', icon: 'fi-rr-link-alt' },
  { key: 'font', label: 'Readable font', hint: 'Plainer letters, more spacing', icon: 'fi-rr-text' },
];
const sizes: { id: TextSize; label: string; aria: string }[] = [
  { id: 'standard', label: 'A', aria: 'Standard text' },
  { id: 'large', label: 'A+', aria: 'Large text' },
  { id: 'larger', label: 'A++', aria: 'Larger text' },
];

/**
 * Accessibility preferences for every page: text size, contrast, motion, link underlines and a
 * readable font. Saved on the visitor's device. A floating button opens it on the public site;
 * the portals open it from their own navigation.
 */
export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<A11ySettings>(defaultA11y);
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const inPortal = pathname.startsWith('/portal') || pathname.startsWith('/engineer');

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(A11Y_KEY) ?? 'null') as A11ySettings | null;
      if (saved) setSettings({ ...defaultA11y, ...saved });
    } catch {
      /* storage unavailable */
    }
  }, []);

  const update = useCallback((next: A11ySettings) => {
    setSettings(next);
    applyA11y(next);
    try {
      localStorage.setItem(A11Y_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    panel.current?.querySelector<HTMLElement>('button')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    const onDown = (e: MouseEvent) => {
      if (!panel.current?.contains(e.target as Node) && !trigger.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDown);
    };
  }, [open]);

  const changed = JSON.stringify(settings) !== JSON.stringify(defaultA11y);

  return (
    <Ctx.Provider value={{ open: () => setOpen(true) }}>
      <MotionConfig reducedMotion={settings.motion ? 'always' : 'user'}>{children}</MotionConfig>

      {!inPortal && (
        <button
          ref={trigger}
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="a11y-panel"
          aria-label="Accessibility options"
          className="fixed bottom-4 left-4 z-[55] grid size-12 place-items-center rounded-full bg-brand-600 text-xl text-white shadow-[0_12px_30px_-10px_rgb(0_40_21/0.6)] ring-2 ring-white/70 transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-300"
        >
          <Icon name="fi-rr-universal-access" />
          {changed && <span className="absolute -right-0.5 -top-0.5 size-3 rounded-full border-2 border-white bg-brand-300" aria-hidden />}
        </button>
      )}

      {open && (
        <div
          ref={panel}
          id="a11y-panel"
          role="dialog"
          aria-modal="false"
          aria-labelledby="a11y-title"
          className="fixed bottom-20 left-4 z-[56] w-[min(340px,calc(100vw-2rem))] rounded-3xl border border-line bg-paper p-5 text-ink shadow-[0_30px_60px_-20px_rgb(0_40_21/0.45)]"
        >
          <div className="flex items-center justify-between">
            <h2 id="a11y-title" className="flex items-center gap-2 text-lg font-semibold"><Icon name="fi-rr-universal-access" className="text-brand-600" /> Accessibility</h2>
            <button onClick={() => setOpen(false)} aria-label="Close accessibility options" className="grid size-9 place-items-center rounded-full text-ink-3 hover:bg-mist hover:text-ink">
              <Icon name="fi-rr-cross-small" />
            </button>
          </div>

          <fieldset className="mt-4">
            <legend className="text-sm font-medium text-ink-2">Text size</legend>
            <div className="mt-2 grid grid-cols-3 gap-1 rounded-xl bg-mist p-1">
              {sizes.map((s) => (
                <button
                  key={s.id}
                  aria-pressed={settings.text === s.id}
                  aria-label={s.aria}
                  onClick={() => update({ ...settings, text: s.id })}
                  className={cn('rounded-lg py-2 font-semibold transition', settings.text === s.id ? 'bg-paper text-ink shadow-sm' : 'text-ink-3 hover:text-ink', s.id === 'standard' ? 'text-sm' : s.id === 'large' ? 'text-base' : 'text-lg')}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </fieldset>

          <ul className="mt-4 space-y-1">
            {toggles.map((t) => (
              <li key={t.key}>
                <button
                  role="switch"
                  aria-checked={settings[t.key]}
                  onClick={() => update({ ...settings, [t.key]: !settings[t.key] })}
                  className="flex w-full items-center gap-3 rounded-2xl px-2 py-2.5 text-left transition hover:bg-canvas"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700"><Icon name={t.icon} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-ink">{t.label}</span>
                    <span className="block text-xs text-ink-3">{t.hint}</span>
                  </span>
                  <span aria-hidden className={cn('relative h-6 w-11 shrink-0 rounded-full transition', settings[t.key] ? 'bg-brand-600' : 'bg-line')}>
                    <span className={cn('absolute top-0.5 size-5 rounded-full bg-white shadow transition-all', settings[t.key] ? 'left-[22px]' : 'left-0.5')} />
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <button onClick={() => update(defaultA11y)} disabled={!changed} className="mt-3 w-full rounded-xl border border-line py-2.5 text-sm font-medium text-ink transition hover:border-ink/30 disabled:opacity-40">
            Reset to default
          </button>
        </div>
      )}
    </Ctx.Provider>
  );
}
