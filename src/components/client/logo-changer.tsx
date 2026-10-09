'use client';

import { useRef } from 'react';
import { toast } from 'sonner';
import { HospitalMark } from '@/components/ui/hospital-mark';
import { Icon } from '@/components/ui/icon';
import { prepareLogo, useHospitalLogo } from '@/lib/hospital-logo';
import { cn } from '@/lib/utils';

/**
 * The hospital’s mark as a button: click to upload or change the hospital’s logo. Given `children` (the
 * hospital's name, in the dashboard sidebar), it shows them beside the mark with "Change logo" / "Remove" links.
 */
export function LogoChanger({ facility, className, fallbackClassName, children }: { facility: string; className?: string; fallbackClassName?: string; children?: React.ReactNode }) {
  const input = useRef<HTMLInputElement>(null);
  const { logo, setLogo } = useHospitalLogo(facility);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      setLogo(await prepareLogo(file));
      toast.success('Logo updated', { description: `${facility}’s logo now shows across your dashboard.` });
    } catch (err) {
      toast.error('Couldn’t use that image', { description: err instanceof Error ? err.message : 'Please try another file.' });
    }
  };

  const remove = () => {
    setLogo(null);
    toast('Logo removed');
  };

  return (
    <>
      <input ref={input} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="sr-only" tabIndex={-1} onChange={onFile} aria-hidden />
      <button type="button" onClick={() => input.current?.click()} className={cn('group relative shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70', className)} aria-label={logo ? 'Change your hospital’s logo' : 'Add your hospital’s logo'} title={logo ? 'Change logo' : 'Add logo'}>
        <HospitalMark facility={facility} className="size-full rounded-[inherit]" fallbackClassName={fallbackClassName} />
        <span className="absolute inset-0 grid place-items-center rounded-[inherit] bg-black/45 text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100" aria-hidden>
          <Icon name="fi-rr-camera" />
        </span>
      </button>
      {children && (
        <div className="min-w-0">
          {children}
          <p className="mt-0.5 flex gap-2 text-[0.6875rem] text-white/75">
            <button type="button" onClick={() => input.current?.click()} className="underline-offset-2 hover:text-white hover:underline">
              {logo ? 'Change logo' : 'Add your logo'}
            </button>
            {logo && (
              <button type="button" onClick={remove} className="underline-offset-2 hover:text-white hover:underline">
                Remove
              </button>
            )}
          </p>
        </div>
      )}
    </>
  );
}
