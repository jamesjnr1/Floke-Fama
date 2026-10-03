import { Reveal } from '@/components/motion/reveal';
import { cn } from '@/lib/utils';

/** `dark` for dark green/navy sections; `onBlue` for the medical-blue band (white label, as mint would clash). */
export function SectionHeading({ label, title, lead, dark, onBlue, className }: { label: string; title: React.ReactNode; lead?: string; dark?: boolean; onBlue?: boolean; className?: string }) {
  dark = dark || onBlue;
  return (
    <Reveal className={cn('max-w-3xl', className)}>
      <p className={cn('label eyebrow', dark && '!text-brand-300', onBlue && '!text-white/90')}>{label}</p>
      <h2 className={cn('display mt-5 text-[clamp(2.25rem,1.3rem+3.4vw,4.5rem)]', dark && 'text-white')}>{title}</h2>
      {lead && <p className={cn('mt-6 max-w-xl text-lg leading-relaxed', onBlue ? 'text-white/85' : dark ? 'text-white/75' : 'text-ink-3')}>{lead}</p>}
    </Reveal>
  );
}
