import { cn } from '@/lib/utils';

/**
 * A faint pattern behind a light section, so the page isn't plain white: a fine grid, a dot field or small medical
 * crosses, fading out from one corner, with a soft green light.
 */
export function Backdrop({ variant = 'grid', at = '50% 0%', className }: { variant?: 'grid' | 'dots' | 'cross'; at?: string; className?: string }) {
  const pattern = {
    grid: { backgroundImage: 'linear-gradient(rgb(11 61 42/0.06) 1px,transparent 1px),linear-gradient(90deg,rgb(11 61 42/0.06) 1px,transparent 1px)', backgroundSize: '56px 56px' },
    dots: { backgroundImage: 'radial-gradient(rgb(11 61 42/0.13) 1px,transparent 1.5px)', backgroundSize: '22px 22px' },
    cross: {
      backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='44' height='44'><path d='M22 17v10M17 22h10' stroke='%230b3d2a' stroke-opacity='0.12' stroke-width='1.4' stroke-linecap='round'/></svg>")`,
    },
  }[variant];
  return (
    <>
      <div aria-hidden className={cn('pointer-events-none absolute inset-0 -z-10', className)} style={{ ...pattern, maskImage: `radial-gradient(70% 70% at ${at}, black, transparent 75%)`, WebkitMaskImage: `radial-gradient(70% 70% at ${at}, black, transparent 75%)` }} />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10" style={{ backgroundImage: `radial-gradient(40% 45% at ${at}, rgb(0 122 77/0.07), transparent 70%)` }} />
    </>
  );
}
