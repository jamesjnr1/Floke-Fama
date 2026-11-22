import 'server-only';
import { emptyDay, summarise, type DaySummary, type Device, type Visit } from '@/lib/pulse/types';

/**
 * Made-up visits for previewing the site monitor on a computer without the database (MONITOR_SAMPLE_DATA=true, never
 * in production). The same visitors every time for a given day, so screenshots are repeatable.
 */
export const monitorSample = () => process.env.MONITOR_SAMPLE_DATA === 'true' && process.env.VERCEL_ENV !== 'production';

const pages: [string, string][] = [
  ['/', 'Flokefama'], ['/products', 'Shop'], ['/services', 'Products & Services'], ['/about', 'About us'], ['/support', 'Support'],
  ['/events', 'Events & News'], ['/csr', 'CSR'], ['/awards', 'Awards'], ['/checkout', 'Quote list'],
  ['/products/bc-5150-haematology-analyzer', 'BC-5150 Haematology Analyzer'], ['/products/bs-240-chemistry-analyzer', 'BS-240 Chemistry Analyzer'],
  ['/products/patient-monitor-comen', 'Patient Monitor'], ['/products/autoclave-machine-35l', 'Autoclave Machine 35L'], ['/products/dp-10-ultrasound', 'DP-10 Ultrasound'],
  ['/news/flokefama-honoured-at-the-22nd-ghana-club-100-awards', 'Flokefama honoured at the 22nd Ghana Club 100 Awards'],
];
const places: [string, string][] = [['GH', 'Accra'], ['GH', 'Accra'], ['GH', 'Accra'], ['GH', 'Kumasi'], ['GH', 'Tema'], ['GH', 'Takoradi'], ['GH', 'Tamale'], ['GH', 'Cape Coast'], ['NG', 'Lagos'], ['GB', 'London'], ['US', 'Houston'], ['TG', 'Lomé'], ['CN', 'Shenzhen']];
const refs = ['google.com', 'google.com', 'google.com', '', '', 'facebook.com', 'linkedin.com', 'instagram.com', 'whatsapp.com', 'bing.com', 'chatgpt.com'];
const searches = ['haematology analyzer', 'patient monitor', 'autoclave', 'ultrasound', 'bs-240', 'centrifuge', 'reagents', 'microscope'];
const browsers: [Device, string, string][] = [['Phone', 'Chrome', 'Android'], ['Phone', 'Chrome', 'Android'], ['Phone', 'Safari', 'iOS'], ['Computer', 'Chrome', 'Windows'], ['Computer', 'Chrome', 'Windows'], ['Computer', 'Edge', 'Windows'], ['Computer', 'Safari', 'macOS'], ['Tablet', 'Safari', 'iPadOS']];
const actions = ['whatsapp_click', 'call_click', 'quote_list_add', 'quote_list_add', 'brochure_download', 'email_click', 'chat_open'];
const enquiries = ['quote_submitted', 'quote_list_request', 'demo_submitted', 'chat_request_sent'];

function rng(seed: number) {
  let s = seed % 2147483647 || 7;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

/** One day's visits. Today's are spread up to now; the last few are still on the site. */
export function sampleVisits(day: string, now = Date.now()): Visit[] {
  const r = rng(Number(day.replace(/-/g, '')));
  const pick = <T,>(xs: readonly T[]) => xs[Math.floor(r() * xs.length)];
  const start = Date.parse(`${day}T00:00:00Z`);
  const isToday = new Date(now).toISOString().slice(0, 10) === day;
  const end = isToday ? now : start + 864e5;
  const weekday = new Date(start).getUTCDay();
  const count = Math.round((weekday === 0 || weekday === 6 ? 26 : 48) * (0.8 + r() * 0.5) * (isToday ? (now - start) / 864e5 : 1)) + (isToday ? 4 : 0);
  const out: Visit[] = [];
  for (let i = 0; i < count; i++) {
    // Busier in working hours (Ghana time = UTC)
    let at: number;
    do at = start + Math.floor((7 + r() * r() * 14 + r() * 3) * 36e5) + Math.floor(r() * 36e5);
    while (at > end);
    const [country, city] = pick(places);
    const [device, browser, os] = pick(browsers);
    const n = r() < 0.38 ? 1 : 1 + Math.ceil(r() * r() * 7);
    const visitPages = [];
    let t = 0;
    for (let k = 0; k < n; k++) {
      const [p, title] = k === 0 ? pick(pages.slice(0, 10)) : pick(pages);
      const s = Math.round(8 + r() * r() * 160);
      const missing = k > 0 && r() < 0.012;
      visitPages.push(missing ? { p: pick(['/shop/old-catalogue', '/index.php', '/products/bc-3000']), at: t, s: 4, nf: true } : { p, t: title, at: t, s, d: Math.round(30 + r() * 70) });
      t += s + 2;
    }
    const events = [];
    if (n > 1 && r() < 0.35) events.push({ n: pick(actions), at: Math.floor(t * r()), p: visitPages[visitPages.length - 1].p });
    if (n > 2 && r() < 0.25) events.push({ n: 'search', at: Math.floor(t * r()), p: '/products', v: pick(searches) });
    if (n > 2 && r() < 0.11) events.push({ n: pick(enquiries), at: t - 5, p: '/checkout' });
    const signedIn = r() < 0.06;
    // The last few of today are still on the site: their latest page opened in the last minute or two
    if (isToday && i >= count - 4) at = now - t * 1000 - Math.floor(r() * 9e4);
    out.push({
      id: `${day}-${i}`, vid: Math.floor(r() * 1e9).toString(36), day, startedAt: new Date(at).toISOString(), lastAt: new Date(at + t * 1000).toISOString(),
      isNew: r() < 0.62, country, city, device, browser, os, ref: pick(refs), ...(r() < 0.05 ? { campaign: 'gc100-awards' } : {}),
      ...(signedIn ? { who: { role: 'client' as const, name: 'Hospital user', facility: pick(['Ridge Practice Hospital', 'Kasoa Practice Clinic', 'Coastline Medical Centre']) } } : {}),
      pages: visitPages, events, secs: t,
      vitals: { LCP: 900 + r() * r() * 4200, INP: 40 + r() * r() * 500, CLS: r() * r() * 0.3, TTFB: 120 + r() * r() * 1500, FCP: 600 + r() * r() * 2600 },
      left: !(isToday && i >= count - 4),
    });
  }
  return out.sort((a, b) => b.lastAt.localeCompare(a.lastAt));
}

/** The last `n` days' summaries, oldest first, as the database would give them. */
export function sampleDays(n: number, now = Date.now()): DaySummary[] {
  return Array.from({ length: n }, (_, i) => {
    const day = new Date(now - (n - 1 - i) * 864e5).toISOString().slice(0, 10);
    // Nothing before the monitor "started", 80 days ago
    return n - 1 - i > 80 ? emptyDay(day) : summarise(day, sampleVisits(day, now));
  });
}
