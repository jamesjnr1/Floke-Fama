'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { GhostButton, PrimaryButton } from '@/components/service/ui';
import { Icon } from '@/components/ui/icon';
import { UserAvatar } from '@/components/ui/user-avatar';

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

/** A square photo, centred and cropped to 400×400 JPEG, so it is small and looks right in a circle. */
async function preparePhoto(file: File): Promise<Blob> {
  if (!file.type.startsWith('image/')) throw new Error('Please choose a photo (JPG or PNG).');
  if (file.size > 15 * 1024 * 1024) throw new Error('That photo is over 15 MB. Please choose a smaller one.');
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const side = Math.min(img.naturalWidth, img.naturalHeight);
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 400;
    canvas.getContext('2d')!.drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, 400, 400);
    return await new Promise<Blob>((ok, fail) => canvas.toBlob((b) => (b ? ok(b) : fail(new Error('That photo could not be read.'))), 'image/jpeg', 0.85));
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Asks for the engineer's photo. `required`: the first time, it can't be closed until a photo is saved. */
export function PhotoDialog({ open, required, current, onSave, onClose }: {
  open: boolean;
  required: boolean;
  current: string | null;
  onSave: (blob: Blob) => Promise<void>;
  onClose: () => void;
}) {
  const [chosen, setChosen] = useState<{ blob: Blob; preview: string } | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!open) {
      setChosen(null);
      setError('');
    }
  }, [open]);
  if (!open) return null;

  const pick = async (file?: File) => {
    if (!file) return;
    setError('');
    try {
      const blob = await preparePhoto(file);
      setChosen({ blob, preview: URL.createObjectURL(blob) });
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const save = async () => {
    if (!chosen) return;
    setBusy(true);
    try {
      await onSave(chosen.blob);
      toast.success('Photo saved', { description: 'Hospitals and the admin team will see it.' });
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="photo-title" className="fixed inset-0 z-[60] grid place-items-center bg-black/60 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-md rounded-xl bg-paper p-6 text-ink shadow-2xl md:p-8">
        <h2 id="photo-title" className="text-xl font-semibold tracking-[-0.01em]">{required ? 'Add your photo to continue' : 'Change your photo'}</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-3">
          Hospitals see who is coming to fix their equipment, and the admin team sees who is on each job. Use a clear, recent photo of your face.
        </p>
        <div className="mt-6 flex justify-center">
          <UserAvatar src={chosen?.preview ?? current} label="Your photo" className="size-32 bg-brand-50 text-4xl text-brand-700" />
        </div>
        <label className="mt-6 flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-line text-sm font-medium text-ink transition hover:border-ink/30">
          <Icon name="fi-rr-camera" /> {chosen || current ? 'Choose another photo' : 'Take or choose a photo'}
          <input type="file" accept="image/*" capture="user" className="sr-only" onChange={(e) => pick(e.target.files?.[0])} />
        </label>
        {error && <p role="alert" className="mt-3 text-sm text-signal-700">{error}</p>}
        <div className="mt-6 flex justify-end gap-2">
          {!required && <GhostButton type="button" onClick={onClose}>Cancel</GhostButton>}
          <PrimaryButton type="button" onClick={save} disabled={!chosen || busy} className={required ? 'w-full' : undefined}>
            {busy ? 'Saving…' : 'Save photo'}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
