import 'server-only';

/**
 * Formspree (formspree.io): emails each submission to the support inbox and keeps a copy in the Formspree
 * dashboard. Set FORMSPREE_FORM_ID to the form's ID (the part after /f/ in its endpoint, e.g. "xabcdwxy");
 * without it this does nothing and returns false.
 */
export const formspreeConfigured = () => Boolean(process.env.FORMSPREE_FORM_ID?.trim());

export async function sendToFormspree(subject: string, fields: Record<string, string | undefined>) {
  const id = process.env.FORMSPREE_FORM_ID?.trim();
  if (!id) return false;
  const res = await fetch(`https://formspree.io/f/${encodeURIComponent(id)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ _subject: subject, ...Object.fromEntries(Object.entries(fields).filter(([, v]) => v)) }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`Formspree responded ${res.status}: ${(await res.text().catch(() => '')).slice(0, 200)}`);
  return true;
}
