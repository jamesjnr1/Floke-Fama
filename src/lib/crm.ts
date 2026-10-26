import 'server-only';
import { siteUrl } from '@/lib/utils';

import { hubspotConfigured } from '@/lib/hubspot';

/** True when a HubSpot form is set up (HUBSPOT_PORTAL_ID and HUBSPOT_FORM_GUID). */
export const formConfigured = () => Boolean(process.env.HUBSPOT_PORTAL_ID?.trim() && process.env.HUBSPOT_FORM_GUID?.trim());
/** True when HubSpot (the CRM) is connected, by private app or form, so web submissions are delivered automatically. */
export const crmConfigured = () => hubspotConfigured() || formConfigured();

/**
 * Sends a submission to HubSpot's Forms API. Returns false when no CRM is configured,
 * so the caller can hand the message to the visitor's email or WhatsApp instead of
 * silently dropping it. Throws if the CRM is configured but rejects the submission.
 */
export async function submitToCrm(fields: Record<string, string | undefined>, page: { path: string; name: string }) {
  if (!formConfigured()) return false;
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
