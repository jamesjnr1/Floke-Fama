import localFont from 'next/font/local';

/*
 * The owner's dashboard sets its figures in Space Grotesk (kept in the site: src/app/fonts, Latin, SIL Open Font
 * License) and everything else in the site's Plus Jakarta Sans. Any number marked `tabular-nums` or `num` gets it
 * (globals.css, .owner-page).
 */
const grotesk = localFont({ src: '../fonts/grotesk.woff2', weight: '300 700', variable: '--font-grotesk', display: 'swap' });

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return <div className={`owner-page ${grotesk.variable}`}>{children}</div>;
}
