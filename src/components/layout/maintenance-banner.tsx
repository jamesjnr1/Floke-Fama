import Link from 'next/link';
import { Icon } from '@/components/ui/icon';
import { noticeColours } from '@/lib/notice';
import type { MaintenanceNotice } from '@/lib/site-content';

/**
 * The strip across the top of every page, switched on and off in the Studio (Site content → Maintenance notice),
 * with its heading, message, icon, colour and an optional link, in Poppins. Phones show the icon, the phone text and the link (no
 * heading), so the phone text is never cut short. Its height is --banner (globals.css): 2.5rem while it
 * shows, 0 when it is off, so the header, the portals' sidebars and the page heroes move up into its place.
 */
export function MaintenanceBanner({ notice }: { notice: MaintenanceNotice }) {
  // A full address on this site (flokefama.com, its Vercel address) opens as a page of the site, in the same tab
  const href = notice.linkHref?.replace(/^https?:\/\/(www\.)?(flokefama\.com|floke-fama\.vercel\.app)(?=\/|$)/i, '') || (notice.linkHref ? '/' : undefined);
  const external = href ? /^https?:\/\//i.test(href) : false;
  const linkClass = 'shrink-0 font-semibold underline decoration-white/60 underline-offset-2 hover:decoration-white';
  return (
    <div
      role="status"
      aria-live="polite"
      style={{ backgroundColor: noticeColours[notice.colour] }}
      className="fixed inset-x-0 top-0 z-[130] flex h-[var(--banner)] w-full items-center justify-center gap-2 overflow-hidden px-3 text-center font-notice text-[10px] leading-normal text-white sm:gap-2.5 sm:px-4 sm:text-xs md:text-[13px]"
    >
      {notice.icon !== 'none' && <Icon name={notice.icon} className="shrink-0 text-[0.95em] sm:text-sm" />}
      {/* Phones (narrower than a tablet): the phone text alone, in full, instead of the heading and the message */}
      <span className="hidden shrink-0 font-semibold md:inline">{notice.title}</span>
      <span className="min-w-0 truncate md:text-white/90">
        <span className="hidden md:inline">{notice.message}</span>
        <span className="font-semibold md:hidden">{notice.short}</span>
      </span>
      {href && notice.linkLabel &&
        (external ? (
          <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
            {notice.linkLabel}
          </a>
        ) : href.startsWith('/') ? (
          <Link href={href} className={linkClass}>
            {notice.linkLabel}
          </Link>
        ) : (
          <a href={href} className={linkClass}>
            {notice.linkLabel}
          </a>
        ))}
    </div>
  );
}
