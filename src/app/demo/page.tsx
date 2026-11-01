import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LogoMark, LogoWordmark } from '@/components/layout/logo';
import { Icon } from '@/components/ui/icon';
import { startDemo } from '@/lib/demo-actions';
import { isDemoCode } from '@/lib/demo-server';

export const metadata: Metadata = { title: 'Flokefama demo', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

const areas = [
  { role: 'admin', icon: 'fi-rr-chart-histogram', title: 'Admin console', text: 'Orders, hospitals, engineers, the service desk and performance, as the office sees them.', note: 'Best on a computer' },
  { role: 'client', icon: 'fi-rr-hospital', title: 'Hospital dashboard', text: 'What a hospital sees: its equipment, service requests (with the engineer on the way), certificates and orders.', note: 'Phone or computer' },
  { role: 'engineer', icon: 'fi-rr-tools', title: 'Engineer portal', text: 'What an engineer uses in the field: jobs, step by step, equipment, calibration and the service report.', note: 'Phone or computer' },
] as const;

/**
 * The private demo page (/demo?code=…, the link is in the admin console → Database & settings): opens each area as a
 * made-up user on sample data. Without the right code the page doesn't exist.
 */
export default async function DemoPage({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const { code } = await searchParams;
  if (!isDemoCode(code)) notFound();
  return (
    <main id="main" className="min-h-svh bg-[#eef2f0] px-4 pb-16 pt-14 md:pt-20">
      <div className="mx-auto w-full max-w-[1040px]">
        <div className="flex items-center justify-center gap-2.5">
          <LogoMark className="size-9" />
          <LogoWordmark className="h-[20px] text-[#00703A]" />
        </div>
        <h1 className="mt-8 text-center text-[clamp(1.75rem,1.3rem+1.6vw,2.5rem)] font-bold leading-tight tracking-[-0.02em] text-ink">See the Flokefama system</h1>
        <p className="mx-auto mt-3 max-w-2xl text-center text-[1.0625rem] text-ink-2">
          Open each part as a sample user. The hospitals, machines and jobs are made up: nothing you do here is saved to the real system, and no one is texted or emailed.
        </p>
        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          {areas.map((a) => (
            <li key={a.role}>
              <form action={startDemo} className="flex h-full flex-col rounded-2xl bg-white p-6 shadow-[0_30px_60px_-40px_rgb(11_21_16/0.35)]">
                <input type="hidden" name="code" value={code} />
                <input type="hidden" name="role" value={a.role} />
                <span className="grid size-12 place-items-center rounded-xl bg-brand-50 text-xl text-brand-700"><Icon name={a.icon} /></span>
                <h2 className="mt-4 text-[1.25rem] font-semibold text-ink">{a.title}</h2>
                <p className="mt-2 flex-1 text-ink-2">{a.text}</p>
                <p className="mt-3 text-sm text-ink-3">{a.note}</p>
                <button className="mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-700 font-semibold text-white hover:bg-brand-800">
                  Open {a.title.toLowerCase()} <Icon name="fi-rr-arrow-small-right" />
                </button>
              </form>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-center text-sm text-ink-3">
          Tip: open the hospital dashboard and the engineer portal in two tabs. A request the hospital sends shows up for the engineer, and every step the engineer takes shows up for the hospital.
        </p>
      </div>
    </main>
  );
}
