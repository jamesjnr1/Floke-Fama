'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * A guided tour of someone's portal: it dims the page, lights up one button or section at a time and says what it is
 * for, with Next and Back. It starts by itself on a person's first two visits (a visit: the portal opened in a new
 * tab or window) and must be taken to the end there: no Skip, and Escape doesn't close it. From the third visit it no
 * longer starts by itself; “Take the tour” still opens it, and then it can be skipped.
 * Counted per person on each browser. Steps point at elements marked `data-tour="…"`; when one isn't on screen (e.g. on
 * a phone), the card shows alone.
 */
export type TourStep = { target?: string; title: string; text: string; /** Runs first, e.g. to open the right view. */ before?: () => void };

/** The visits on which the tour starts by itself, and can't be skipped. */
const REQUIRED_VISITS = 2;

/** A short, stable code for the person (so their email isn't kept in the browser as it is). */
const code = (who: string) => {
  let h = 5381;
  for (const ch of who.trim().toLowerCase()) h = ((h << 5) + h + ch.charCodeAt(0)) >>> 0;
  return h.toString(36);
};

/** The first visible element for a target (the same button can be in the sidebar on a computer and a bar on a phone). */
function find(target?: string) {
  if (!target) return null;
  for (const el of document.querySelectorAll<HTMLElement>(`[data-tour="${target}"]`)) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden') return el;
  }
  return null;
}

/** `who`: the signed-in person (their email), so each person on a shared computer gets their own two tours. */
export function useTour(id: string, steps: TourStep[], { ready, auto = true, who = '' }: { ready: boolean; auto?: boolean; who?: string }) {
  const [step, setStep] = useState<number | null>(null);
  const [required, setRequired] = useState(false);
  const key = `ff-tour-${id}-${code(who)}-v2`;
  // Opened straight onto something (a job from a text message, say): let them see it; the tour waits for their next
  // visit (this one isn't counted). Read on the first render, before the portal tidies the address
  const [deepLink] = useState(() => typeof window !== 'undefined' && /[?&](ticket|asset|website|photo|guide)=/.test(window.location.search));
  useEffect(() => {
    if (!ready || !auto || deepLink) return;
    let visit = REQUIRED_VISITS + 1;
    let done = true;
    try {
      // A visit is counted once per tab: moving around the portal or refreshing isn't a new one
      const counted = sessionStorage.getItem(key);
      visit = counted ? Number(counted.split(':')[0]) : Number(localStorage.getItem(key) ?? 0) + 1;
      done = counted?.endsWith(':done') ?? false;
      if (!counted) {
        localStorage.setItem(key, String(visit));
        sessionStorage.setItem(key, String(visit));
      }
    } catch {
      /* storage unavailable: don't hold them in the tour on every visit */
    }
    if (done || !(visit <= REQUIRED_VISITS)) return;
    const t = window.setTimeout(() => {
      setRequired(true);
      setStep(0);
    }, 700);
    return () => window.clearTimeout(t);
  }, [ready, auto, key, deepLink]);
  const close = useCallback(() => {
    setStep(null);
    setRequired(false);
    try {
      // Taken in this tab: not again until their next visit
      const counted = sessionStorage.getItem(key);
      if (counted && !counted.endsWith(':done')) sessionStorage.setItem(key, `${counted}:done`);
    } catch {
      /* ignore */
    }
  }, [key]);
  const start = useCallback(() => {
    setRequired(false);
    setStep(0);
  }, []);
  const node = step === null ? null : <Tour steps={steps} step={step} required={required} onStep={setStep} onClose={close} />;
  return { start, node, open: step !== null };
}

/** `required`: one of the first visits, so it can only be finished (no Skip, no Escape). */
function Tour({ steps, step, required, onStep, onClose }: { steps: TourStep[]; step: number; required: boolean; onStep: (n: number) => void; onClose: () => void }) {
  const s = steps[step];
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [vw, setVw] = useState(0);
  const card = useRef<HTMLDivElement>(null);
  const [cardH, setCardH] = useState(220);

  // Open the right view, then find the element, bring it into view and follow it while the page moves
  useEffect(() => {
    s.before?.();
    let raf = 0;
    let el: HTMLElement | null = null;
    const t = window.setTimeout(() => {
      el = find(s.target);
      el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      let last = '';
      const loop = () => {
        const r = el ? el.getBoundingClientRect() : null;
        const sig = r ? `${r.left}|${r.top}|${r.width}|${r.height}|${window.innerWidth}` : `none|${window.innerWidth}`;
        // Only when something moved (scrolling, resizing), not on every frame
        if (sig !== last) {
          last = sig;
          setRect(r);
          setVw(window.innerWidth);
        }
        raf = requestAnimationFrame(loop);
      };
      loop();
    }, 120);
    setRect(null);
    return () => {
      window.clearTimeout(t);
      cancelAnimationFrame(raf);
    };
  }, [s]);
  // The card's height, to place it above an element when it doesn't fit below
  useLayoutEffect(() => {
    if (card.current) setCardH(card.current.offsetHeight);
  }, [step, rect]);
  useEffect(() => {
    card.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !required) onClose();
      if (e.key === 'ArrowRight') {
        if (step < steps.length - 1) onStep(step + 1);
        else onClose();
      }
      if (e.key === 'ArrowLeft' && step > 0) onStep(step - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step, steps.length, required, onStep, onClose]);

  const last = step === steps.length - 1;
  const pad = 8;
  const phone = vw > 0 && vw < 640;
  // Where the card goes: under the element if it fits, else above it; centred when there is no element; on a phone, at the bottom
  const W = 380;
  let pos: React.CSSProperties;
  if (!rect || phone) {
    pos = rect || phone ? { left: 12, right: 12, bottom: 16 } : { left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: `min(${W + 60}px, calc(100vw - 24px))` };
    if (phone && rect && rect.bottom > window.innerHeight - cardH - 40) pos = { left: 12, right: 12, top: 16 };
  } else {
    const below = rect.bottom + pad + 12 + cardH < window.innerHeight;
    const left = Math.min(Math.max(12, rect.left), window.innerWidth - W - 12);
    pos = below ? { left, top: rect.bottom + pad + 12, width: W } : { left, top: Math.max(12, rect.top - pad - 12 - cardH), width: W };
  }

  return createPortal(
    <div className="fixed inset-0 z-[200]" aria-live="polite">
      {/* The dimmed page, with a hole around the element (clicks are held, so the tour can't be lost by accident) */}
      {rect ? (
        <div
          aria-hidden
          className="pointer-events-none fixed rounded-xl ring-2 ring-white transition-all duration-200"
          style={{ left: rect.left - pad, top: rect.top - pad, width: rect.width + pad * 2, height: rect.height + pad * 2, boxShadow: '0 0 0 9999px rgb(8 18 13 / 0.62)' }}
        />
      ) : (
        <div aria-hidden className="fixed inset-0 bg-[rgb(8_18_13/0.62)]" />
      )}
      <div className="fixed inset-0" onClick={(e) => e.stopPropagation()} />
      <div
        ref={card}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        tabIndex={-1}
        className="fixed rounded-xl bg-white p-5 text-ink shadow-[0_24px_60px_-20px_rgb(0_0_0/0.55)] outline-none"
        style={pos}
      >
        <p className="text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-brand-700">Step {step + 1} of {steps.length}</p>
        <h2 id="tour-title" className="mt-1.5 text-[1.1875rem] font-semibold leading-snug">{s.title}</h2>
        <p className="mt-2 text-[0.96875rem] leading-relaxed text-ink-2">{s.text}</p>
        <div className="mt-3 flex gap-1" aria-hidden>
          {steps.map((_, i) => <span key={i} className={i <= step ? 'h-1 flex-1 rounded-full bg-brand-600' : 'h-1 flex-1 rounded-full bg-[#e3e8e5]'} />)}
        </div>
        <div className="mt-4 flex items-center gap-2">
          {!last && !required && <button type="button" onClick={onClose} className="mr-auto text-sm font-medium text-ink-3 hover:text-ink">Skip tour</button>}
          {(last || required) && <span className="mr-auto" />}
          {step > 0 && <button type="button" onClick={() => onStep(step - 1)} className="h-10 rounded-md border border-line px-4 text-sm font-semibold hover:border-ink/30">Back</button>}
          <button type="button" onClick={() => (last ? onClose() : onStep(step + 1))} className="h-10 rounded-md bg-brand-700 px-5 text-sm font-semibold text-white hover:bg-brand-800">
            {last ? 'Finish' : step === 0 ? 'Show me' : 'Next'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
