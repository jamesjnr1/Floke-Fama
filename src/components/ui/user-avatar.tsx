import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

/**
 * A person: their photo when there is one (`src`), otherwise a person icon (from the site's icon set) in a circle,
 * never their initials. `className` sets size and colours.
 */
export function UserAvatar({ className, label, src }: { className?: string; label?: string; src?: string | null }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element -- a small photo from Appwrite storage, already sized when uploaded
    return <img src={src} alt={label ?? ''} className={cn('shrink-0 object-cover', className, 'rounded-full')} />;
  }
  return (
    <span className={cn('grid shrink-0 place-items-center', className, 'rounded-full')} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <Icon name="fi-rr-user" className="text-[1.15em] leading-none" />
    </span>
  );
}
