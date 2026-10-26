import 'server-only';
import { Query, type Models } from 'node-appwrite';
import { appwrite, DATABASE_ID, TABLES } from '@/lib/appwrite';
import { withTable } from '@/lib/appwrite-tables';
import type { SupportInput } from '@/lib/support-schema';

/**
 * Requests sent with the Support page's form (Report a fault, maintenance, installation, other), kept in Appwrite
 * (table `support_requests`) so the admin console lists them and the team can mark them called back and closed.
 */
export type SupportStatus = 'new' | 'called' | 'closed';
export const supportStatuses: SupportStatus[] = ['new', 'called', 'closed'];
export interface SupportRequest extends Omit<SupportInput, 'website'> { id: string; at: string; status: SupportStatus }

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

export async function setSupportStatus(id: string, status: SupportStatus) {
  await appwrite!.tables.updateRow({ databaseId: DATABASE_ID, tableId: TABLES.supportRequests, rowId: id, data: { status } });
}
