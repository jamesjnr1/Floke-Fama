'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * A guided tour for someone's first visit to their portal: it dims the page, lights up one button or section at a
 * time and says what it is for, with Next, Back and Skip. Shown once per browser (taken again from “Take the tour”).
 * Steps point at elements marked `data-tour="…"`; when one isn't on screen (e.g. on a phone), the card shows alone.
 */
export type TourStep = { target?: string; title: string; text: string; /** Runs first, e.g. to open the right view. */ before?: () => void };

const seenKey = (id: string) => `ff-tour-${id}-v1`;

/** The first visible element for a target (the same button can be in the sidebar on a computer and a bar on a phone). */
function find(target?: string) {
  if (!target) return null;
  for (const el of document.querySelectorAll<HTMLElement>(`[data-tour="${target}"]`)) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden') return el;
  }
  return null;
}

export function useTour(id: string, steps: TourStep[], { ready, auto = true }: { ready: boolean; auto?: boolean }) {
  const [step, setStep] = useState<number | null>(null);
  // First visit: start by itself, once the portal has loaded
  useEffect(() => {
    if (!ready || !auto) return;
    let seen = true;
    try {
      seen = localStorage.getItem(seenKey(id)) === '1';
    } catch {
      /* storage unavailable: don't show it on every visit */
    }
    if (seen) return;
    const t = window.setTimeout(() => setStep(0), 700);
    return () => window.clearTimeout(t);
  }, [ready, auto, id]);
  const close = useCallback(() => {
    setStep(null);
    try {
      localStorage.setItem(seenKey(id), '1');
    } catch {
      /* ignore */
    }
  }, [id]);
  const start = useCallback(() => setStep(0), []);
  const node = step === null ? null : <Tour steps={steps} step={step} onStep={setStep} onClose={close} />;
  return { start, node, open: step !== null };
}

function Tour({ steps, step, onStep, onClose }: { steps: TourStep[]; step: number; onStep: (n: number) => void; onClose: () => void }) {
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
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') {
        if (step < steps.length - 1) onStep(step + 1);
        else onClose();
      }
      if (e.key === 'ArrowLeft' && step > 0) onStep(step - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step, steps.length, onStep, onClose]);

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
          {!last && <button type="button" onClick={onClose} className="mr-auto text-sm font-medium text-ink-3 hover:text-ink">Skip tour</button>}
          {last && <span className="mr-auto" />}
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
