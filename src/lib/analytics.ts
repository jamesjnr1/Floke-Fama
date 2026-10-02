import { track as vercelTrack } from '@vercel/analytics';

/**
 * Conversion events, so Flokefama can see which pages and products produce enquiries.
 * Sent to Vercel Web Analytics (cookie-free, no consent banner needed). Never send personal data here:
 * names, emails and phone numbers stay in the CRM.
 */
export type ConversionEvent =
  | 'quote_submitted'
  | 'demo_submitted'
  | 'quote_list_add'
  | 'quote_list_request'
  | 'whatsapp_click'
  | 'call_click'
  | 'brochure_download'
  | 'datasheet_request';

export function track(event: ConversionEvent, props?: Record<string, string | number | boolean>) {
  try {
    vercelTrack(event, props);
  } catch {
    // Analytics must never break the page
  }
}
