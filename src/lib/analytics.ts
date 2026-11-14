import { track as vercelTrack } from '@vercel/analytics';
import { pulseEvent } from '@/components/pulse';

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
  | 'datasheet_request'
  | 'checkout_pay'
  | 'chat_open'
  | 'chat_request_start'
  | 'chat_request_sent';

export function track(event: ConversionEvent, props?: Record<string, string | number | boolean>) {
  try {
    // The owner's dashboard (/owner) too, with the product or page it was about
    const about = props?.product ?? props?.kind ?? props?.items;
    pulseEvent(event, about === undefined ? undefined : String(about));
    vercelTrack(event, props);
  } catch {
    // Analytics must never break the page
  }
}
