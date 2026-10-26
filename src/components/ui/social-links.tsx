import { Icon } from '@/components/ui/icon';
import { socials } from '@/data/socials';
import { cn } from '@/lib/utils';

/** Square buttons for Flokefama's social accounts, opening in a new tab. */
export function SocialLinks({ className, buttonClassName }: { className?: string; buttonClassName?: string }) {
  return (
    <ul className={cn('flex items-center gap-2', className)}>
      {socials.map((s) => (
        <li key={s.label}>
          <a
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Flokefama on ${s.label} (opens in a new tab)`}
            title={`${s.label} · ${s.handle}`}
            className={cn('grid size-10 place-items-center border text-lg transition-colors', buttonClassName)}
          >
            <Icon name={s.icon} />
          </a>
        </li>
      ))}
    </ul>
  );
}
