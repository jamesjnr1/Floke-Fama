'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Logos hospitals upload for their account, shown in the menu bar and on the hospital dashboard.
 * DEMO STORAGE: there is no database yet, so each logo is kept in this browser (localStorage), keyed by the
 * hospital's name, the same way the service desk keeps its data. In production, upload it to file storage
 * (Sanity assets, Supabase Storage…) and save the URL on the hospital's account; `useHospitalLogo` stays.
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

/** The logo this hospital uploaded (or null), with a setter; every mark on the page updates together. */
export function useHospitalLogo(facility: string | undefined) {
  const [logo, setLogoState] = useState<string | null>(null);

  useEffect(() => {
    if (!facility) return;
    const sync = () => setLogoState(read()[keyFor(facility)] ?? null);
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, [facility]);

  const setLogo = useCallback(
    (dataUrl: string | null) => {
      if (!facility) return;
      const all = read();
      if (dataUrl) all[keyFor(facility)] = dataUrl;
      else delete all[keyFor(facility)];
      try {
        localStorage.setItem(KEY, JSON.stringify(all));
      } catch {
        /* storage full or blocked: the logo just isn't kept */
      }
      window.dispatchEvent(new Event(EVENT));
    },
    [facility],
  );

  return { logo, setLogo };
}
