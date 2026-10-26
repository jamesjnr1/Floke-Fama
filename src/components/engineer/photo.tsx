'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { GhostButton, PrimaryButton } from '@/components/service/ui';
import { Icon } from '@/components/ui/icon';
import { UserAvatar } from '@/components/ui/user-avatar';
import { checkPhoto, warmUpPhotoCheck } from '@/components/engineer/photo-check';
import { cn } from '@/lib/utils';

/**
 * The engineer's photo (see /api/photo). It is required: until one is added the portal asks for it and can't be used.
 * Without the database (enabled false) no photo is asked for.
 */
export function useEngineerPhoto() {
  const [photo, setPhoto] = useState<{ enabled: boolean; url: string | null; loaded: boolean }>({ enabled: false, url: null, loaded: false });
  useEffect(() => {
    fetch('/api/photo', { cache: 'no-store' })
      .then((r) => r.json() as Promise<{ enabled?: boolean; url?: string | null }>)
      .then((j) => setPhoto({ enabled: j.enabled === true, url: j.url ?? null, loaded: true }))
      .catch(() => setPhoto((p) => ({ ...p, loaded: true })));
  }, []);
  const save = useCallback(async (blob: Blob) => {
    const r = await fetch('/api/photo', { method: 'PUT', headers: { 'Content-Type': blob.type }, body: blob });
    const j = (await r.json().catch(() => ({}))) as { url?: string; error?: string };
    if (!r.ok || !j.url) throw new Error(j.error ?? 'Your photo could not be saved. Please try again.');
    setPhoto((p) => ({ ...p, url: j.url! }));
  }, []);
  return { ...photo, required: photo.loaded && photo.enabled && !photo.url, save };
}

const OUT = 400; // the saved photo: 400×400
const VIEW = 260; // the editor on screen

type Edit = { img: HTMLImageElement; zoom: number; x: number; y: number; turn: number };

/** Draws the photo as edited (moved, zoomed, turned) into a square of `size`; x and y are in saved-photo pixels. */
function draw(ctx: CanvasRenderingContext2D, e: Edit, size: number) {
  const sideways = e.turn % 2 === 1;
  const w = sideways ? e.img.naturalHeight : e.img.naturalWidth;
  const h = sideways ? e.img.naturalWidth : e.img.naturalHeight;
  const scale = (size / Math.min(w, h)) * e.zoom;
  ctx.fillStyle = '#e9edeb';
  ctx.fillRect(0, 0, size, size);
  ctx.save();
  ctx.translate(size / 2 + (e.x * size) / OUT, size / 2 + (e.y * size) / OUT);
  ctx.rotate((e.turn * Math.PI) / 2);
  ctx.scale(scale, scale);
  ctx.drawImage(e.img, -e.img.naturalWidth / 2, -e.img.naturalHeight / 2);
  ctx.restore();
}

/** Keeps the photo covering the whole square however it is moved or zoomed. */
function clamp(e: Edit): Edit {
  const sideways = e.turn % 2 === 1;
  const w = sideways ? e.img.naturalHeight : e.img.naturalWidth;
  const h = sideways ? e.img.naturalWidth : e.img.naturalHeight;
  const scale = (OUT / Math.min(w, h)) * e.zoom;
  const maxX = Math.max(0, (w * scale - OUT) / 2);
  const maxY = Math.max(0, (h * scale - OUT) / 2);
  return { ...e, x: Math.max(-maxX, Math.min(maxX, e.x)), y: Math.max(-maxY, Math.min(maxY, e.y)) };
}

async function load(file: File) {
  if (!file.type.startsWith('image/')) throw new Error('Please choose a photo (JPG or PNG).');
  if (file.size > 15 * 1024 * 1024) throw new Error('That photo is over 15 MB. Please choose a smaller one.');
  const img = new Image();
  img.src = URL.createObjectURL(file);
  await img.decode();
  return img;
}

/**
 * Asks for the engineer's photo, with a simple editor: drag to move it, zoom, turn it, and a circle shows what will
 * be seen. Each version is checked (one clear face, filling the circle, see photo-check.ts) and can only be saved
 * once it passes. `required`: the first time, it can't be closed until a photo is saved.
 */
export function PhotoDialog({ open, required, current, onSave, onClose }: {
  open: boolean;
  required: boolean;
  current: string | null;
  onSave: (blob: Blob) => Promise<void>;
  onClose: () => void;
}) {
  const [edit, setEdit] = useState<Edit | null>(null);
  const [check, setCheck] = useState<{ state: 'idle' | 'checking' | 'ok' | 'bad'; message?: string }>({ state: 'idle' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const view = useRef<HTMLCanvasElement>(null);
  const drag = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (open) warmUpPhotoCheck();
    else {
      setEdit(null);
      setError('');
      setCheck({ state: 'idle' });
    }
  }, [open]);

  // Redraw the editor, and check this version of the photo a moment after the last change
  useEffect(() => {
    if (!edit || !view.current) return;
    const dpr = window.devicePixelRatio || 1;
    view.current.width = VIEW * dpr;
    view.current.height = VIEW * dpr;
    draw(view.current.getContext('2d')!, edit, VIEW * dpr);
    setCheck({ state: 'checking' });
    let live = true;
    const t = window.setTimeout(async () => {
      const out = document.createElement('canvas');
      out.width = out.height = OUT;
      draw(out.getContext('2d')!, edit, OUT);
      const problem = await checkPhoto(out, Math.min(edit.img.naturalWidth, edit.img.naturalHeight));
      if (live) setCheck(problem ? { state: 'bad', message: problem } : { state: 'ok' });
    }, 350);
    return () => {
      live = false;
      window.clearTimeout(t);
    };
  }, [edit]);

  if (!open) return null;

  const pick = async (file?: File) => {
    if (!file) return;
    setError('');
    try {
      setEdit({ img: await load(file), zoom: 1, x: 0, y: 0, turn: 0 });
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const save = async () => {
    if (!edit || check.state !== 'ok') return;
    setBusy(true);
    try {
      const out = document.createElement('canvas');
      out.width = out.height = OUT;
      draw(out.getContext('2d')!, edit, OUT);
      const blob = await new Promise<Blob>((ok, fail) => out.toBlob((b) => (b ? ok(b) : fail(new Error('That photo could not be read.'))), 'image/jpeg', 0.88));
      await onSave(blob);
      toast.success('Photo saved', { description: 'Hospitals and the admin team will see it.' });
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const move = (dx: number, dy: number) => setEdit((e) => (e ? clamp({ ...e, x: e.x + (dx * OUT) / VIEW, y: e.y + (dy * OUT) / VIEW }) : e));

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="photo-title" className="fixed inset-0 z-[60] grid place-items-center overflow-y-auto bg-black/60 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-md rounded-xl bg-paper p-6 text-ink shadow-2xl md:p-8">
        <h2 id="photo-title" className="text-xl font-semibold tracking-[-0.01em]">{required ? 'Add your photo to continue' : 'Change your photo'}</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-3">
          Hospitals see who is coming to fix their equipment, and the admin team sees who is on each job. Use a clear, recent photo of your face, looking at the camera.
        </p>

        <div className="mt-5 flex justify-center">
          {edit ? (
            <div className="relative touch-none select-none" style={{ width: VIEW, height: VIEW }}>
              <canvas
                ref={view}
                aria-label="Your photo: drag to move it"
                style={{ width: VIEW, height: VIEW }}
                className="cursor-grab rounded-lg active:cursor-grabbing"
                onPointerDown={(e) => {
                  e.currentTarget.setPointerCapture(e.pointerId);
                  drag.current = { x: e.clientX, y: e.clientY };
                }}
                onPointerMove={(e) => {
                  if (!drag.current) return;
                  move(e.clientX - drag.current.x, e.clientY - drag.current.y);
                  drag.current = { x: e.clientX, y: e.clientY };
                }}
                onPointerUp={() => (drag.current = null)}
                onWheel={(e) => setEdit((x) => (x ? clamp({ ...x, zoom: Math.min(4, Math.max(1, x.zoom - e.deltaY / 500)) }) : x))}
              />
              {/* What will be seen: the circle; outside it is dimmed */}
              <span aria-hidden className="pointer-events-none absolute inset-0 rounded-lg" style={{ background: 'radial-gradient(circle at center, transparent 0, transparent 69.5%, rgb(0 0 0 / 0.5) 70.5%)' }} />
              <span aria-hidden className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-white/90" />
            </div>
          ) : (
            <UserAvatar src={current} label="Your photo" className="size-32 bg-brand-50 text-4xl text-brand-700" />
          )}
        </div>

        {edit && (
          <div className="mt-4 flex items-center gap-3">
            <Icon name="fi-rr-search" className="text-ink-3" />
            <input
              type="range"
              min={1}
              max={4}
              step={0.01}
              value={edit.zoom}
              onChange={(e) => setEdit((x) => (x ? clamp({ ...x, zoom: Number(e.target.value) }) : x))}
              aria-label="Zoom"
              className="h-2 flex-1 accent-[#007a4d]"
            />
            <button type="button" onClick={() => setEdit((x) => (x ? clamp({ ...x, turn: (x.turn + 1) % 4, x: 0, y: 0 }) : x))} className="inline-flex h-9 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium text-ink-2 hover:bg-mist" title="Turn the photo">
              <Icon name="fi-rr-rotate-right" /> Turn
            </button>
          </div>
        )}
        {edit && <p className="mt-2 text-center text-xs text-ink-3">Drag to move · zoom so your face fills the circle</p>}

        {edit && (
          <p role="status" className={cn('mt-4 flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm', check.state === 'ok' ? 'bg-brand-50 text-brand-700' : check.state === 'bad' ? 'bg-[#fdecea] text-[#b42318]' : 'bg-canvas text-ink-3')}>
            <Icon name={check.state === 'ok' ? 'fi-rr-check-circle' : check.state === 'bad' ? 'fi-rr-exclamation' : 'fi-rr-time-fast'} className="mt-0.5 shrink-0" />
            {check.state === 'ok' ? 'Clear photo of your face. You can save it.' : check.state === 'bad' ? check.message : 'Checking your photo…'}
          </p>
        )}

        <label className="mt-4 flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-line text-sm font-medium text-ink transition hover:border-ink/30">
          <Icon name="fi-rr-camera" /> {edit || current ? 'Choose another photo' : 'Take or choose a photo'}
          <input type="file" accept="image/*" capture="user" className="sr-only" onChange={(e) => pick(e.target.files?.[0])} />
        </label>
        {error && <p role="alert" className="mt-3 text-sm text-signal-700">{error}</p>}
        <div className="mt-6 flex justify-end gap-2">
          {!required && <GhostButton type="button" onClick={onClose}>Cancel</GhostButton>}
          <PrimaryButton type="button" onClick={save} disabled={!edit || check.state !== 'ok' || busy} className={required ? 'w-full' : undefined}>
            {busy ? 'Saving…' : 'Save photo'}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
