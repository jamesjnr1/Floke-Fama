import Link from 'next/link';
import { Icon } from '@/components/ui/icon';
import { noticeColours } from '@/lib/notice';
import type { MaintenanceNotice } from '@/lib/site-content';

/**
 * The strip across the top of every page, switched on and off in the Studio (Site content → Maintenance notice),
 * with its heading, message, icon, colour and an optional link. Its height is --banner (globals.css): 2.5rem while it
 * shows, 0 when it is off, so the header, the portals' sidebars and the page heroes move up into its place.
 */
export function MaintenanceBanner({ notice }: { notice: MaintenanceNotice }) {
  const href = notice.linkHref;
  const external = href ? /^https?:\/\//i.test(href) : false;
  const linkClass = 'shrink-0 font-semibold underline decoration-white/60 underline-offset-2 hover:decoration-white';
  return (
    <div
      role="status"
      aria-live="polite"
      style={{ backgroundColor: noticeColours[notice.colour] }}
      className="fixed inset-x-0 top-0 z-[130] flex h-[var(--banner)] w-full items-center justify-center gap-2 overflow-hidden px-3 text-center font-sans text-[10px] leading-none text-white sm:gap-2.5 sm:px-4 sm:text-xs md:text-[13px]"
    >
      {notice.icon !== 'none' && <Icon name={notice.icon} className="shrink-0 text-[0.95em] sm:text-sm" />}
      <span className="shrink-0 font-semibold">{notice.title}</span>
      <span className="min-w-0 truncate text-white/90">
        <span className="hidden sm:inline">{notice.message}</span>
        <span className="sm:hidden">{notice.short}</span>
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
