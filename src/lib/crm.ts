import 'server-only';
import { siteUrl } from '@/lib/utils';

/** True when HubSpot (the CRM) is connected, so web submissions are delivered automatically. */
export const crmConfigured = () => Boolean(process.env.HUBSPOT_PORTAL_ID?.trim() && process.env.HUBSPOT_FORM_GUID?.trim());

/**
 * Sends a submission to HubSpot's Forms API. Returns false when no CRM is configured,
 * so the caller can hand the message to the visitor's email or WhatsApp instead of
 * silently dropping it. Throws if the CRM is configured but rejects the submission.
 */
export async function submitToCrm(fields: Record<string, string | undefined>, page: { path: string; name: string }) {
  if (!crmConfigured()) return false;
  const res = await fetch(
    `https://api.hsforms.com/submissions/v3/integration/submit/${process.env.HUBSPOT_PORTAL_ID!.trim()}/${process.env.HUBSPOT_FORM_GUID!.trim()}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: Object.entries(fields).filter(([, v]) => v).map(([name, value]) => ({ name, value: String(value) })),
        context: { pageUri: `${siteUrl}${page.path}`, pageName: page.name },
      }),
    },
  );
  if (!res.ok) throw new Error(`HubSpot responded ${res.status}`);
  return true;
}
