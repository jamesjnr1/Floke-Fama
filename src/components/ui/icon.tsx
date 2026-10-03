import { cn } from '@/lib/utils';

/** Flaticon UIcon. Pass the full class (e.g. "fi-rr-microscope") so `npm run icons` can find it. */
export function Icon({ name, className, label }: { name: string; className?: string; label?: string }) {
  return (
    <i
      className={cn(name, 'inline-flex leading-none', className)}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
    />
  );
}

/** Glossy raised icon tile used for feature icons. */
export function IconTile({ name, className, size = 'md' }: { name: string; className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'size-10 rounded-xl text-base', md: 'size-12 rounded-2xl text-xl', lg: 'size-16 rounded-[1.35rem] text-2xl' };
  return (
    <span
      className={cn(
        'relative grid shrink-0 place-items-center text-white',
        'bg-[linear-gradient(150deg,#34a174_0%,#007a4d_55%,#004d3b_100%)]',
        'shadow-[inset_0_2px_1px_rgb(255_255_255/0.45),inset_0_-6px_12px_rgb(11_21_16/0.35),0_14px_24px_-10px_rgb(37_120_71/0.7)]',
        'before:pointer-events-none before:absolute before:inset-x-1.5 before:top-1 before:h-[45%] before:rounded-t-[inherit] before:bg-gradient-to-b before:from-white/40 before:to-transparent',
        sizes[size],
        className,
      )}
    >
      <Icon name={name} className="relative drop-shadow-[0_2px_2px_rgb(11_21_16/0.35)]" />
    </span>
  );
}
