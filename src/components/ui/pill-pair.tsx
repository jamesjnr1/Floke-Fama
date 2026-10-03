import Link from 'next/link';

/**
 * Two joined pill links: a solid primary pill that flows through a narrow neck into an outlined
 * secondary pill. For a hero's two main actions; on light text over a dark background.
 */
export function PillPair({ primary, secondary }: { primary: { href: string; label: string }; secondary: { href: string; label: string } }) {
  const pill = 'inline-flex h-12 items-center px-6 text-[15px] font-medium transition-colors duration-300 md:h-[52px] md:px-8';
  return (
    <div className="inline-flex items-center">
      <Link href={primary.href} className={`${pill} rounded-l-full bg-white text-brand-800 hover:bg-brand-50`}>
        {primary.label}
      </Link>
      {/* The neck: the solid pill narrows into the outline pill's edge */}
      <svg aria-hidden viewBox="0 0 28 56" preserveAspectRatio="none" className="-ml-px h-12 w-5 shrink-0 text-white md:h-[52px] md:w-6">
        <path d="M0 0C11 0 15 25 28 26.5V29.5C15 31 11 56 0 56Z" fill="currentColor" />
      </svg>
      <Link href={secondary.href} className={`${pill} -ml-px rounded-full border border-white/70 text-white hover:border-white hover:bg-white/10`}>
        {secondary.label}
      </Link>
    </div>
  );
}
