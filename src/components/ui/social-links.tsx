import { Icon } from '@/components/ui/icon';
import { socials } from '@/data/socials';
import { cn } from '@/lib/utils';

/** Flokefama's social accounts as plain icons (no boxes), opening in a new tab. */
export function SocialLinks({ className, buttonClassName }: { className?: string; buttonClassName?: string }) {
  return (
    <ul className={cn('-mx-2 flex items-center gap-1', className)}>
      {socials.map((s) => (
        <li key={s.label}>
          <a
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Flokefama on ${s.label} (opens in a new tab)`}
            title={`${s.label} · ${s.handle}`}
            className={cn('grid size-9 place-items-center text-xl transition-colors', buttonClassName)}
          >
            <Icon name={s.icon} />
          </a>
        </li>
      ))}
    </ul>
  );
}
