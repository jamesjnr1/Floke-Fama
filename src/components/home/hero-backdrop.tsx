import type { HeroBackground } from '@/lib/hero-style';
import { navStyle } from '@/lib/nav-style';
import { cn } from '@/lib/utils';

/** The ECG trace across the hero, in the given colour. */
function Ecg({ stroke, className }: { stroke: string; className?: string }) {
  return (
    <svg aria-hidden className={cn('absolute inset-x-0 top-[38%] -z-10 h-32 w-full', className)} viewBox="0 0 1400 100" preserveAspectRatio="none">
      <path
        d="M0,50 L200,50 L220,50 L230,20 L240,80 L250,50 L300,50 L310,50 L320,10 L330,90 L340,50 L600,50 L620,50 L630,30 L640,70 L650,50 L900,50 L920,50 L930,15 L940,85 L950,50 L1200,50 L1220,50 L1230,25 L1240,75 L1250,50 L1400,50"
        stroke={stroke}
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}

/** Under the full-width menu bar: start in the bar's own colour, so there is no hard edge where they meet. */
const BarBlend = () =>
  navStyle === 'bar' ? <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-56 bg-[linear-gradient(180deg,#16232a_0,#16232a_72px,rgb(22_35_42/0)_100%)]" /> : null;

/**
 * The hero's background (see heroBackground). Glows are gradients rather than CSS blur filters, which are costly
 * while scrolling.
 */
export function HeroBackdrop({ bg }: { bg: HeroBackground }) {
  switch (bg) {
    // Deep navy with a soft blue light from the top right
    case 'navy':
      return (
        <>
          <div aria-hidden className="absolute inset-0 -z-20 bg-[linear-gradient(160deg,#0b1624_0%,#0f2238_50%,#0a1522_100%)]" />
          <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(45%_55%_at_85%_20%,rgb(59_130_246/0.2),transparent_70%),radial-gradient(35%_45%_at_15%_80%,rgb(14_116_144/0.14),transparent_70%)]" />
          <BarBlend />
          <Ecg stroke="#93c5fd" className="opacity-[0.1]" />
        </>
      );
    // Near-black graphite with a fine grid fading out from a soft spotlight
    case 'graphite':
      return (
        <>
          <div aria-hidden className="absolute inset-0 -z-20 bg-[#0c0e11]" />
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-[linear-gradient(rgb(255_255_255/0.07)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.07)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(75%_70%_at_50%_25%,black_30%,transparent)]"
          />
          <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(55%_45%_at_50%_0%,rgb(255_255_255/0.13),transparent_70%),radial-gradient(30%_35%_at_85%_30%,rgb(0_122_77/0.12),transparent_70%)]" />
          <BarBlend />
        </>
      );
    // Light and clinical: soft white-blue with a faint dot pattern (dark text)
    case 'light':
      return (
        <>
          <div aria-hidden className="absolute inset-0 -z-20 bg-[linear-gradient(180deg,#eef3f6_0%,#f7f9fa_60%,#ffffff_100%)]" />
          <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(rgb(22_35_42/0.09)_1px,transparent_1px)] bg-[size:22px_22px] [mask-image:linear-gradient(180deg,black,transparent_80%)]" />
          <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(40%_50%_at_90%_10%,rgb(0_122_77/0.08),transparent_70%)]" />
          <Ecg stroke="#007a4d" className="opacity-[0.1]" />
        </>
      );
    // Midnight slate with a dot grid and the ECG trace
    case 'dots':
      return (
        <>
          <div aria-hidden className="absolute inset-0 -z-20 bg-[linear-gradient(180deg,#121a21_0%,#0e151b_100%)]" />
          <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(rgb(255_255_255/0.1)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(80%_70%_at_50%_40%,black,transparent)]" />
          <BarBlend />
          <Ecg stroke="#ffffff" className="opacity-[0.08]" />
        </>
      );
    // Navy with large soft lights in blue, teal and a touch of the company red
    case 'aurora':
      return (
        <>
          <div aria-hidden className="absolute inset-0 -z-20 bg-[#0b1220]" />
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-[radial-gradient(45%_55%_at_5%_15%,rgb(59_130_246/0.45),transparent_70%),radial-gradient(45%_55%_at_100%_25%,rgb(20_184_166/0.35),transparent_70%),radial-gradient(40%_45%_at_55%_105%,rgb(237_28_36/0.3),transparent_70%)]"
          />
          <BarBlend />
        </>
      );
    // The current dark teal: Mirage → Deep Sea with soft green glows
    default:
      return (
        <>
          <div aria-hidden className="absolute inset-0 -z-20 bg-[linear-gradient(135deg,#10191e_0%,#16232a_40%,#0b3b40_72%,#10191e_100%)]" />
          <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(40%_50%_at_85%_40%,rgb(0_138_87/0.16),transparent_70%),radial-gradient(30%_40%_at_30%_70%,rgb(13_155_168/0.1),transparent_70%)]" />
          <BarBlend />
          <Ecg stroke="#7fd1a5" className="opacity-[0.12]" />
        </>
      );
  }
}
