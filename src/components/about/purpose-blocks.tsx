import { Reveal } from '@/components/motion/reveal';
import { Icon } from '@/components/ui/icon';
import { purpose } from '@/data/seed';
import { cn } from '@/lib/utils';

/**
 * Mission, Vision and Aim as three bold blocks, as on the current flokefama.com About page, in three palette
 * colours (Mirage, Blaze Orange, Deep Sea Green), each with an icon that says
 * what it means: a hand offering care (mission), an eye (vision), an arrow on target (aim).
 */
const tone = {
  Mission: { box: 'bg-midnight', head: 'text-white', body: 'text-white/85', icon: 'text-brand-300' },
  Vision: { box: 'bg-signal', head: 'text-ink', body: 'text-ink/85', icon: 'text-ink' },
  Aim: { box: 'bg-sea', head: 'text-white', body: 'text-white/85', icon: 'text-brand-300' },
} as const;

export function PurposeBlocks({ className }: { className?: string }) {
  return (
    <ul className={cn('grid gap-4 md:grid-cols-3 md:gap-5', className)}>
      {purpose.map((p, i) => {
        return (
          <li key={p.label}>
            <Reveal delay={i * 0.08} className={cn('flex h-full flex-col items-center rounded-3xl px-7 py-10 text-center md:px-9 md:py-14', tone[p.label].box)}>
              <Icon name={p.icon} className={cn('text-5xl', tone[p.label].icon)} />
              <h3 className={cn('mt-6 text-[clamp(2rem,1.4rem+1.6vw,2.75rem)] font-semibold leading-[1.05] tracking-[-0.02em]', tone[p.label].head)}>
                Our {p.label}
              </h3>
              <p className={cn('mt-5 max-w-sm text-[17px] leading-relaxed', tone[p.label].body)}>{p.text}</p>
            </Reveal>
          </li>
        );
      })}
    </ul>
  );
}
