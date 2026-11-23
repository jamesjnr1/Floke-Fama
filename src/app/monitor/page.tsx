import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { Dashboard } from '@/components/owner/dashboard';
import { ComputerOnly, KeyForm } from '@/components/owner/key-form';
import { isOwner, ownerConfigured, ownerName } from '@/lib/owner/auth';

export const metadata: Metadata = { title: 'Site monitor', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

/**
 * The site monitor: the live site at a glance (who is on it and what they do, the period's figures, page speed,
 * health and errors). For the site's manager alone, behind MONITOR_KEY: apart from the admin console and its accounts.
 */
export default async function OwnerPage() {
  // A computer or a tablet: a phone gets a short note instead (and so does a window narrower than a tablet).
  // Android phones say "Mobile" and Android tablets don't; iPads say "iPad" (or pass as a Mac).
  const ua = (await headers()).get('user-agent') ?? '';
  const tablet = /ipad|tablet|playbook|silk|kindle/i.test(ua) || (/android/i.test(ua) && !/mobile/i.test(ua));
  if (!tablet && /mobi|iphone|ipod|android|blackberry|windows phone/i.test(ua)) return <ComputerOnly />;
  return (
    <>
      <div className="min-[600px]:hidden">
        <ComputerOnly />
      </div>
      <div className="hidden min-[600px]:block">{(await isOwner()) ? <Dashboard name={ownerName()} /> : <KeyForm ready={ownerConfigured()} />}</div>
    </>
  );
}
