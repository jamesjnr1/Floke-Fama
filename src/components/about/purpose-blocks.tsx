import { Reveal } from '@/components/motion/reveal';
import { Icon } from '@/components/ui/icon';
import { purpose } from '@/data/seed';
import { cn } from '@/lib/utils';

/**
 * Mission, Vision and Aim as three bold blocks, as on the current flokefama.com About page, each with its
 * own icon (award, star, target) and colour: Flokefama green, charcoal navy and medical blue. Red stays a
 * small accent: as a full block it reads as a warning in a healthcare setting.
 */
const tone = {
  Mission: 'bg-brand-600 text-white',
  Vision: 'bg-ink text-white',
  Aim: 'bg-blue text-white',
} as const;

export function PurposeBlocks({ className }: { className?: string }) {
  return (
    <ul className={cn('grid gap-4 md:grid-cols-3 md:gap-5', className)}>
      {purpose.map((p, i) => {
        return (
          <li key={p.label}>
            <Reveal delay={i * 0.08} className={cn('flex h-full flex-col items-center rounded-3xl px-7 py-10 text-center md:px-9 md:py-14', tone[p.label])}>
              <Icon name={p.icon} className="text-5xl text-white" />
              <h3 className="mt-6 text-[clamp(2rem,1.4rem+1.6vw,2.75rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-white">
                Our {p.label}
              </h3>
              <p className="mt-5 max-w-sm text-[17px] leading-relaxed text-white/90">{p.text}</p>
            </Reveal>
          </li>
        );
      })}
    </ul>
  );
}
