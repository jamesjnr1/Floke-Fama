import 'server-only';
import { Query, type Models } from 'node-appwrite';
import { appwrite, DATABASE_ID, TABLES } from '@/lib/appwrite';
import { withTable } from '@/lib/appwrite-tables';
import type { SupportInput } from '@/lib/support-schema';

/**
 * Requests sent with the Support page's form (Report a fault, maintenance, installation, other), kept in Appwrite
 * (table `support_requests`). Engineers see them in their portal (From the website), call back, and when a visit
 * is needed press Send an engineer, which opens a service request; the admin console lists them all.
 */
export type SupportStatus = 'new' | 'called' | 'closed';
export const supportStatuses: SupportStatus[] = ['new', 'called', 'closed'];
export interface SupportRequest extends Omit<SupportInput, 'website'> {
  id: string;
  at: string;
  status: SupportStatus;
  /** Who last moved it on (engineer or admin), and when. */
  handledBy?: string;
  handledAt?: string;
  /** The service request it became (Send an engineer). */
  ticketId?: string;
}

type Row = Models.Row & { status: string; data: string };

/** A reference the caller can quote, e.g. SR-MH2K7Q4A. */
const newReference = () => `SR-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 36 ** 2).toString(36).toUpperCase().padStart(2, '0')}`;

/** Saves a request and returns its reference, or null without a database. */
export async function saveSupportRequest(d: SupportInput): Promise<string | null> {
  if (!appwrite) return null;
  const reference = newReference();
  const fields: Omit<SupportInput, 'website'> = { type: d.type, name: d.name, facility: d.facility, phone: d.phone, equipment: d.equipment, message: d.message };
  await withTable(TABLES.supportRequests, () =>
    appwrite!.tables.createRow({ databaseId: DATABASE_ID, tableId: TABLES.supportRequests, rowId: reference, data: { status: 'new', facility: d.facility.slice(0, 160), data: JSON.stringify(fields) } }),
  );
  return reference;
}

/** The latest requests, newest first. */
export async function listSupportRequests(limit = 200): Promise<SupportRequest[]> {
  const { rows } = await appwrite!.tables.listRows<Row>({ databaseId: DATABASE_ID, tableId: TABLES.supportRequests, queries: [Query.orderDesc('$createdAt'), Query.limit(limit)] });
  return rows.flatMap((r) => {
    try {
      const status = supportStatuses.includes(r.status as SupportStatus) ? (r.status as SupportStatus) : 'new';
      return [{ ...(JSON.parse(r.data) as Omit<SupportInput, 'website'>), id: r.$id, at: r.$createdAt, status }];
    } catch {
      return [];
    }
  });
}

/** Moves a request on, recording who did it (and the service request it became). */
export async function setSupportStatus(id: string, status: SupportStatus, by: string, ticketId?: string) {
  const row = await appwrite!.tables.getRow<Row>({ databaseId: DATABASE_ID, tableId: TABLES.supportRequests, rowId: id });
  const data = { ...(JSON.parse(row.data) as object), handledBy: by, handledAt: new Date().toISOString(), ...(ticketId ? { ticketId } : {}) };
  await appwrite!.tables.updateRow({ databaseId: DATABASE_ID, tableId: TABLES.supportRequests, rowId: id, data: { status, data: JSON.stringify(data) } });
}

export const isReference = (v: unknown): v is string => typeof v === 'string' && /^SR-[A-Z0-9]{6,16}$/.test(v);
