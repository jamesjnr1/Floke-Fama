'use client';

import { useEffect, useState } from 'react';
import { useSite } from '@/components/site-provider';
import { transparentLogo, useHospitalLogo } from '@/lib/hospital-logo';
import type { Logo } from '@/lib/site-content';
import { cn } from '@/lib/utils';

const words = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
/** "Komfo Anokye Teaching Hospital" → "kath"; "University of Ghana Medical Centre" → "ugmc". */
const acronym = (s: string) => words(s).filter((w) => !['of', 'the', 'and', '&'].includes(w)).map((w) => w[0]).join('');

/** The logo of the hospital an account belongs to, from the clients listed on the site (Sanity → Clients). */
export function findHospitalLogo(facility: string | undefined, clients: Logo[]): Logo | undefined {
  if (!facility) return undefined;
  const f = words(facility).join(' ');
  const fa = acronym(facility);
  return clients.find((c) => {
    if (!c.logo) return false;
    const n = words(c.name).join(' ');
    const na = acronym(c.name);
    // Same name, one inside the other ("Korle Bu Teaching Hospital, Accra"), or written as its acronym ("KATH")
    return f === n || f.includes(n) || (f.split(' ').length >= 2 && n.includes(f)) || (na.length >= 3 && (f.split(' ').includes(na) || fa === na));
  });
}

/**
 * A hospital's mark: the logo the hospital uploaded (see lib/hospital-logo), else its logo when it is one of
 * Flokefama's listed clients, else the initials of its name. Logos show on their own, with no tile behind. `className` sets the size and corner;
 * `fallbackClassName` styles the initials tile.
 */
export function HospitalMark({ facility, name, className, fallbackClassName }: { facility?: string; name?: string; className?: string; fallbackClassName?: string }) {
  const { clients } = useSite();
  const { logo: uploaded } = useHospitalLogo(facility);
  const listed = findHospitalLogo(facility, clients)?.logo ?? undefined;
  // Listed clients' logo files sit on white; show them with that background cleared, like uploaded logos
  const [clearedListed, setClearedListed] = useState<string | null>(null);
  useEffect(() => {
    if (!listed || uploaded) return;
    let live = true;
    transparentLogo(listed).then((url) => live && setClearedListed(url)).catch(() => live && setClearedListed(listed));
    return () => {
      live = false;
    };
  }, [listed, uploaded]);

  const src = uploaded ?? (listed ? clearedListed : null);
  if (uploaded || listed)
    return (
      <span className={cn('relative grid shrink-0 place-items-center', className)}>
        {/* eslint-disable-next-line @next/next/no-img-element -- a small logo prepared in the browser */}
        {src && <img src={src} alt={`${facility} logo`} className="size-full object-contain" />}
      </span>
    );
  const text = (facility ?? name ?? '').split(/\s+/).filter((w) => /^[A-Za-z0-9]/.test(w) && !/^(of|the|and)$/i.test(w)).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  return <span className={cn('grid shrink-0 place-items-center font-semibold', className, fallbackClassName)} aria-hidden>{text}</span>;
}
