import { Reveal } from '@/components/motion/reveal';
import { cn } from '@/lib/utils';

export function SectionHeading({ label, title, lead, dark, className }: { label: string; title: React.ReactNode; lead?: string; dark?: boolean; className?: string }) {
  return (
    <Reveal className={cn('max-w-3xl', className)}>
      <p className={cn('label', dark && '!text-brand-300')}>{label}</p>
      <h2 className={cn('display mt-5 text-[clamp(2.25rem,1.3rem+3.4vw,4.5rem)]', dark && 'text-white')}>{title}</h2>
      {lead && <p className={cn('mt-6 max-w-xl text-lg leading-relaxed', dark ? 'text-white/75' : 'text-ink-3')}>{lead}</p>}
    </Reveal>
  );
}
