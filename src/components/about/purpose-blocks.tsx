import { Reveal } from '@/components/motion/reveal';
import { Icon } from '@/components/ui/icon';
import { getSite } from '@/lib/site';
import { cn } from '@/lib/utils';

/**
 * Mission, Vision and Aim, each with an icon that says what it means: a hand offering care (mission), an eye
 * (vision), an arrow on target (aim).
 * - 'cards' (default): a coloured top with the icon and title, the text on white below.
 * - 'blocks': the earlier three solid colour blocks, as on the current flokefama.com About page.
 * Switch with NEXT_PUBLIC_PURPOSE_STYLE=blocks in Vercel (then redeploy).
 */
const style: 'cards' | 'blocks' = process.env.NEXT_PUBLIC_PURPOSE_STYLE === 'blocks' ? 'blocks' : 'cards';

const tone = {
  Mission: { box: 'bg-midnight', head: 'text-white', body: 'text-white/85', icon: 'text-brand-300', top: 'bg-[linear-gradient(135deg,#0a9a5e_0%,#00703a_100%)]' },
  Vision: { box: 'bg-signal', head: 'text-white', body: 'text-white/90', icon: 'text-white', top: 'bg-[linear-gradient(135deg,#e6414a_0%,#b81d24_100%)]' },
  Aim: { box: 'bg-sea', head: 'text-white', body: 'text-white/85', icon: 'text-brand-300', top: 'bg-[linear-gradient(135deg,#0d6f76_0%,#064247_100%)]' },
} as const;

export async function PurposeBlocks({ className }: { className?: string }) {
  const { purpose } = await getSite();
  return (
    <ul className={cn('grid gap-4 md:grid-cols-3 md:gap-5', className)}>
      {purpose.map((p, i) => {
        const t = tone[p.label as keyof typeof tone] ?? tone.Mission;
        return (
          <li key={p.label}>
            {style === 'cards' ? (
              <Reveal delay={i * 0.08} className="flex h-full flex-col overflow-hidden rounded-lg border border-line bg-paper shadow-[0_1px_2px_rgb(11_21_16/0.04)]">
                <div className={cn('px-7 pb-7 pt-8 text-white md:px-8', t.top)}>
                  <Icon name={p.icon} className="text-[2.5rem] text-white" />
                  <h3 className="mt-5 text-[1.625rem] font-bold leading-tight tracking-[-0.02em] text-white">Our {p.label}</h3>
                </div>
                <p className="flex-1 px-7 py-7 text-[1.0625rem] leading-relaxed text-ink-2 md:px-8">{p.text}</p>
              </Reveal>
            ) : (
              <Reveal delay={i * 0.08} className={cn('flex h-full flex-col items-center rounded-3xl px-7 py-10 text-center md:px-9 md:py-14', t.box)}>
                <Icon name={p.icon} className={cn('text-5xl', t.icon)} />
                <h3 className={cn('mt-6 text-[clamp(2rem,1.4rem+1.6vw,2.75rem)] font-semibold leading-[1.05] tracking-[-0.02em]', t.head)}>
                  Our {p.label}
                </h3>
                <p className={cn('mt-5 max-w-sm text-[1.0625rem] leading-relaxed', t.body)}>{p.text}</p>
              </Reveal>
            )}
          </li>
        );
      })}
    </ul>
  );
}
