/**
 * A phone number as the SMS gateway wants it (233XXXXXXXXX for Ghana), or null when it can't receive texts. Kept
 * apart from lib/sms (server only) so forms can check a number with the same rule.
 * Ghana numbers are accepted as people type them: 024 123 4567, +233 24 123 4567, 00233…, +233 024… (the 0 kept
 * after the country code), and 24 123 4567 (the 0 left off, e.g. 507584822 for 050 758 4822).
 */
export function normalisePhone(raw: string) {
  let d = (raw ?? '').replace(/\D/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  if (d.length === 13 && d.startsWith('2330')) d = `233${d.slice(4)}`;
  if (d.length === 10 && d.startsWith('0')) d = `233${d.slice(1)}`;
  // A Ghana mobile number without its leading 0 (they start 2 or 5: 020–028, 050–059)
  if (d.length === 9 && /^[25]/.test(d)) d = `233${d}`;
  return /^\d{11,15}$/.test(d) ? d : null;
}

/** The message forms show for a number that can't receive texts. */
export const phoneHint = 'Enter a mobile number that can receive texts, e.g. 024 123 4567.';

/**
 * A number as people in Ghana write it: 050 758 4822, with the 0 put back when it was typed without one (507584822)
 * or with the country code (+233 50 758 4822). Other countries' numbers keep the +; anything that can't receive texts
 * is shown as it was typed. Used to save numbers from the forms and to show them in the admin console.
 */
export function showPhone(raw: string | undefined | null) {
  const n = normalisePhone(raw ?? '');
  if (!n) return (raw ?? '').trim();
  if (n.length === 12 && n.startsWith('233')) return `0${n.slice(3, 5)} ${n.slice(5, 8)} ${n.slice(8)}`;
  return `+${n}`;
}

/** A number for a tel: link (+233…), or the digits as typed when it isn't one the gateway would accept. */
export function telOf(raw: string | undefined | null) {
  const n = normalisePhone(raw ?? '');
  return n ? `+${n}` : (raw ?? '').replace(/[^\d+]/g, '');
}
