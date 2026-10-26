'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { UserAvatar } from '@/components/ui/user-avatar';

/** Engineers' photos by name (see /api/team-photos), loaded once per visit and refreshed every few minutes. */
const Photos = createContext<Record<string, string>>({});

export function EngineerPhotosProvider({ children }: { children: React.ReactNode }) {
  const [photos, setPhotos] = useState<Record<string, string>>({});
  useEffect(() => {
    const load = () => fetch('/api/team-photos').then((r) => (r.ok ? r.json() : { photos: {} })).then((j: { photos?: Record<string, string> }) => setPhotos(j.photos ?? {})).catch(() => {});
    load();
    const id = window.setInterval(load, 5 * 60_000);
    return () => window.clearInterval(id);
  }, []);
  return <Photos.Provider value={photos}>{children}</Photos.Provider>;
}

/** The photo of the engineer with this name, if they have added one. */
export const useEngineerPhoto = (name?: string) => {
  const photos = useContext(Photos);
  return name ? photos[name] : undefined;
};

/** The engineer's photo in a circle (a person icon until they add one). */
export function EngineerFace({ name, className }: { name: string; className?: string }) {
  const src = useEngineerPhoto(name);
  return <UserAvatar src={src} label={src ? name : undefined} className={className} />;
}
