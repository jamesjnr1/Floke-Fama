import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { Dashboard } from '@/components/owner/dashboard';
import { ComputerOnly, KeyForm } from '@/components/owner/key-form';
import { isOwner, ownerConfigured } from '@/lib/owner/auth';

export const metadata: Metadata = { title: 'Site monitor', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

/**
 * The owner's dashboard: the live site at a glance (who is on it and what they do, the period's figures, page speed,
 * health and errors). For the owner alone, behind OWNER_KEY: apart from the admin console and its accounts.
 */
export default async function OwnerPage() {
  // A computer's screen only: a phone or tablet gets a short note instead (and so does a narrow window)
  const ua = (await headers()).get('user-agent') ?? '';
  if (/mobi|iphone|ipod|ipad|android|tablet/i.test(ua)) return <ComputerOnly />;
  return (
    <>
      <div className="lg:hidden">
        <ComputerOnly />
      </div>
      <div className="hidden lg:block">{(await isOwner()) ? <Dashboard /> : <KeyForm ready={ownerConfigured()} />}</div>
    </>
  );
}
