'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Logos hospitals upload for their account, shown in the menu bar and on the hospital dashboard.
 * - With Appwrite configured: saved with the account through /api/hospital-logo (Appwrite Storage), so the
 *   logo shows on every device the hospital signs in from.
 * - Without it: kept in this browser (localStorage), keyed by the hospital's name.
 * Either way the image is prepared in the browser first: shrunk to 256 px and its white background cleared.
 */
const KEY = 'ff-hospital-logos';
const EVENT = 'ff-hospital-logo';
const keyFor = (facility: string) => facility.trim().toLowerCase();

function read(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}

/**
 * Makes the white (or near-white) background around a logo transparent, so only the logo shows. Fills in
 * from the edges, so white inside the logo (a cross, lettering) is kept.
 */
function clearBackground(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  const light = (i: number) => d[i + 3] < 16 || (d[i] > 232 && d[i + 1] > 232 && d[i + 2] > 232);
  const seen = new Uint8Array(w * h);
  const stack: number[] = [];
  for (let x = 0; x < w; x++) stack.push(x, x + (h - 1) * w);
  for (let y = 0; y < h; y++) stack.push(y * w, w - 1 + y * w);
  while (stack.length) {
    const p = stack.pop()!;
    if (seen[p] || !light(p * 4)) continue;
    seen[p] = 1;
    d[p * 4 + 3] = 0;
    const x = p % w;
    if (x > 0) stack.push(p - 1);
    if (x < w - 1) stack.push(p + 1);
    if (p >= w) stack.push(p - w);
    if (p < w * (h - 1)) stack.push(p + w);
  }
  ctx.putImageData(img, 0, 0);
}

/** Draws an image at up to 256×256 with its white background removed; returns a WebP data URL. */
function toTransparentLogo(img: HTMLImageElement) {
  const scale = Math.min(1, 256 / Math.max(img.naturalWidth || 256, img.naturalHeight || 256));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round((img.naturalWidth || 256) * scale));
  canvas.height = Math.max(1, Math.round((img.naturalHeight || 256) * scale));
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  clearBackground(ctx, canvas.width, canvas.height);
  return canvas.toDataURL('image/webp', 0.9);
}

/** Shrinks an uploaded image to fit 256×256 and clears its white background, so it stays small and clean. */
export async function prepareLogo(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Please choose an image file (PNG, JPG, WebP or SVG).');
  if (file.size > 5 * 1024 * 1024) throw new Error('That image is over 5 MB. Please choose a smaller file.');
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return toTransparentLogo(img);
  } finally {
    URL.revokeObjectURL(url);
  }
}

const cleared = new Map<string, Promise<string>>();
/** A listed client's logo with its white background cleared (worked out once per page visit). */
export function transparentLogo(src: string): Promise<string> {
  if (!cleared.has(src)) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    cleared.set(src, img.decode().then(() => toTransparentLogo(img)));
  }
  return cleared.get(src)!;
}

/** What the server said about logo storage: Appwrite on (with this hospital's logo, if any) or off. */
type Remote = { enabled: false } | { enabled: true; url: string | null };
let remote: Promise<Remote> | null = null;
const askServer = () =>
  (remote ??= fetch('/api/hospital-logo', { cache: 'no-store' })
    .then(async (r) => (r.ok || r.status === 401 ? ((await r.json()) as Remote) : { enabled: false as const }))
    .catch(() => ({ enabled: false as const })));

/** The logo this hospital uploaded (or null), with a setter; every mark on the page updates together. */
export function useHospitalLogo(facility: string | undefined) {
  const [logo, setLogoState] = useState<string | null>(null);

  useEffect(() => {
    if (!facility) return;
    let live = true;
    const sync = () =>
      askServer().then((r) => {
        if (live) setLogoState(r.enabled ? r.url : (read()[keyFor(facility)] ?? null));
      });
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      live = false;
      window.removeEventListener(EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, [facility]);

  /** Saves (a prepared data URL) or removes the logo. Throws with a readable message if saving fails. */
  const setLogo = useCallback(
    async (dataUrl: string | null) => {
      if (!facility) return;
      const r = await askServer();
      if (r.enabled) {
        const res = dataUrl
          ? await fetch('/api/hospital-logo', { method: 'PUT', headers: { 'Content-Type': 'image/webp' }, body: await (await fetch(dataUrl)).blob() })
          : await fetch('/api/hospital-logo', { method: 'DELETE' });
        const out = (await res.json().catch(() => ({}))) as { url?: string | null; error?: string };
        if (!res.ok) throw new Error(out.error ?? 'The logo could not be saved. Please try again.');
        remote = Promise.resolve({ enabled: true, url: out.url ?? null });
      } else {
        const all = read();
        if (dataUrl) all[keyFor(facility)] = dataUrl;
        else delete all[keyFor(facility)];
        try {
          localStorage.setItem(KEY, JSON.stringify(all));
        } catch {
          /* storage full or blocked: the logo just isn't kept */
        }
      }
      window.dispatchEvent(new Event(EVENT));
    },
    [facility],
  );

  return { logo, setLogo };
}
