/**
 * The demo for showing the system (to the CEO, say): one private link (/demo?code=…, shown to admins in the admin
 * console) opens the admin console, the hospital dashboard and the engineer portal as made-up users on sample data.
 * Nothing in a demo reads or changes the real database: the server treats a demo session as signed out everywhere
 * except the three pages that show the samples, and the portals keep the sample desk in the browser.
 *
 * On unless DEMO=off. DEMO_UNTIL (a date, e.g. 2026-12-31) ends it on that day; changing DEMO_CODE gives a new link.
 */
export const demoOn = (now = Date.now()) => {
  if ((process.env.DEMO ?? '').trim().toLowerCase() === 'off') return false;
  const until = Date.parse(process.env.DEMO_UNTIL ?? '');
  return Number.isNaN(until) || now < until + 864e5;
};

/** The sample desk the demo hospital and demo engineer share in one browser (so a request made in one shows in the other). */
export const DEMO_KEY = 'ff-demo-desk';
export const DEMO_ENGINEER = 'Demo Engineer';
/** One of the practice hospitals (see lib/service/practice.ts). */
export const DEMO_HOSPITAL = 'Ridge Practice Hospital';

export const demoUsers = {
  admin: { sub: 'demo-admin', name: 'Demo Admin', email: 'admin@demo.flokefama.com', role: 'admin' as const },
  client: { sub: 'demo-hospital', name: 'Demo Hospital User', email: 'hospital@demo.flokefama.com', role: 'client' as const, facility: DEMO_HOSPITAL, phone: '024 000 1234' },
  engineer: { sub: 'demo-engineer', name: DEMO_ENGINEER, email: 'engineer@demo.flokefama.com', role: 'engineer' as const, phone: '020 000 5678' },
};
export type DemoRole = keyof typeof demoUsers;

/** The demo's sample desk from the start again (in the browser). */
export function restartDemo() {
  try {
    localStorage.removeItem(DEMO_KEY);
  } catch {
    /* storage unavailable */
  }
  location.reload();
}
