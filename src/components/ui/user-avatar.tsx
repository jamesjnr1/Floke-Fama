import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

/** A signed-in person: a person icon (from the site's icon set), never their initials. `className` sets size, shape and colours. */
export function UserAvatar({ className, label }: { className?: string; label?: string }) {
  return (
    <span className={cn('grid shrink-0 place-items-center', className)} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <Icon name="fi-rr-user" className="text-[1.15em] leading-none" />
    </span>
  );
}
