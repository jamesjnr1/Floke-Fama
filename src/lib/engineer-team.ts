import 'server-only';
import { Query, type Models } from 'node-appwrite';
import { appwrite, DATABASE_ID, TABLES } from '@/lib/appwrite';
import { signPayload, verifyPayload } from '@/lib/auth/session';
import { ENGINEER_ID_PREFIX, roleFor } from '@/lib/auth/users';
import { headByEmail } from '@/lib/auth/users';
import { engineerOrganisation, isHeadOrganisation, regionOfOrganisation, type Region } from '@/lib/regions';

/**
 * Bringing the engineers onto the system from anywhere in the country:
 * - An admin shares one invite link (WhatsApp or email). It works for 30 days; a new one can be made any time.
 * - Engineers register themselves with it (name, phone, email, region, password). Their account waits for an admin to
 *   approve it (`engp-` id), so a forwarded link can't give a stranger the hospitals' details.
 * - Approving turns it into an engineer account (`eng-` id): they can sign in, and they get a text.
 */
export const PENDING_PREFIX = 'engp-';
const INVITE_DAYS = 30;

type Invite = { k: 'engineer-invite'; exp: number };

/** A new invite code, valid for 30 days. */
export async function newInviteCode() {
  return signPayload({ k: 'engineer-invite', exp: Date.now() + INVITE_DAYS * 864e5 } satisfies Invite);
}
/** When a code expires, or null when it isn't a valid invite (or has expired). */
export async function checkInvite(code: string | undefined | null): Promise<Date | null> {
  const v = await verifyPayload<Invite>(code ?? undefined);
  if (!v || v.k !== 'engineer-invite' || typeof v.exp !== 'number' || v.exp < Date.now()) return null;
  return new Date(v.exp);
}

type Row = Models.Row & { name: string; email: string; organisation: string; phone?: string; salt: string; hash: string };
/** `head`: the head of engineering, who can give any job to any engineer. */
export type TeamMember = { id: string; name: string; email: string; phone: string; region?: Region; pending: boolean; head: boolean; joined: string };

/** Every engineer account (approved, waiting, and those in ENGINEER_EMAILS), newest first. */
export async function listTeam(): Promise<TeamMember[]> {
  if (!appwrite) return [];
  const rows: Row[] = [];
  let cursor: string | undefined;
  for (let i = 0; i < 20; i++) {
    const page = await appwrite.tables.listRows<Row>({ databaseId: DATABASE_ID, tableId: TABLES.accounts, queries: [Query.limit(500), ...(cursor ? [Query.cursorAfter(cursor)] : [])] });
    rows.push(...page.rows);
    if (page.rows.length < 500) break;
    cursor = page.rows[page.rows.length - 1].$id;
  }
  return rows
    .filter((r) => r.$id.startsWith(PENDING_PREFIX) || roleFor(r.email ?? '', r.$id) === 'engineer')
    .map((r) => ({ id: r.$id, name: r.name, email: r.email, phone: r.phone ?? '', region: regionOfOrganisation(r.organisation), pending: r.$id.startsWith(PENDING_PREFIX), head: !r.$id.startsWith(PENDING_PREFIX) && (isHeadOrganisation(r.organisation) || headByEmail(r.email ?? '')), joined: r.$createdAt }))
    .sort((a, b) => b.joined.localeCompare(a.joined));
}

let teamCache: { at: number; key: string; team: Promise<TeamMember[]> } | null = null;
/**
 * The team, as the portals ask for it on every refresh: one small read says whether any account changed (count and
 * latest change), and only then is the team read again. So a new head of engineering counts at once, on every page.
 */
export async function teamCached(): Promise<TeamMember[]> {
  if (!appwrite) return [];
  const probe = await appwrite.tables.listRows<Row>({ databaseId: DATABASE_ID, tableId: TABLES.accounts, queries: [Query.orderDesc('$updatedAt'), Query.limit(1)] });
  const key = `${probe.total}:${probe.rows[0]?.$id ?? ''}:${probe.rows[0]?.$updatedAt ?? ''}`;
  if (!teamCache || teamCache.key !== key || Date.now() - teamCache.at > 10 * 60_000) {
    const team = listTeam().catch((e) => ((teamCache = null), Promise.reject(e)));
    teamCache = { at: Date.now(), key, team };
  }
  return teamCache.team;
}

/** Forget the team read a moment ago (after someone is added or removed). */
export const forgetTeam = () => {
  teamCache = null;
};

/**
 * Makes an engineer the head of engineering (or not): kept on their account, next to their region. Returns the
 * engineer when it changed (to tell them by text), or null.
 */
export async function setHead(id: string, on: boolean): Promise<{ name: string; phone: string } | null> {
  if (!appwrite || id.startsWith(PENDING_PREFIX)) return null;
  const row = await appwrite.tables.getRow<Row>({ databaseId: DATABASE_ID, tableId: TABLES.accounts, rowId: id });
  if (roleFor(row.email ?? '', row.$id) !== 'engineer') return null;
  if (isHeadOrganisation(row.organisation) === on) return null;
  await appwrite.tables.updateRow({ databaseId: DATABASE_ID, tableId: TABLES.accounts, rowId: id, data: { organisation: engineerOrganisation(regionOfOrganisation(row.organisation), on) } });
  teamCache = null;
  return { name: row.name, phone: row.phone ?? '' };
}

/** Approves a waiting registration: the same details, under an engineer id. Returns the engineer, or null. */
export async function approve(id: string): Promise<{ name: string; phone: string } | null> {
  if (!appwrite || !id.startsWith(PENDING_PREFIX)) return null;
  const row = await appwrite.tables.getRow<Row>({ databaseId: DATABASE_ID, tableId: TABLES.accounts, rowId: id }).catch(() => null);
  if (!row) return null;
  const data = { name: row.name, email: row.email, organisation: row.organisation, phone: row.phone ?? '', salt: row.salt, hash: row.hash };
  // Remove the waiting one first (the email must stay unique), then create the engineer
  await appwrite.tables.deleteRow({ databaseId: DATABASE_ID, tableId: TABLES.accounts, rowId: id });
  teamCache = null;
  try {
    await appwrite.tables.createRow({ databaseId: DATABASE_ID, tableId: TABLES.accounts, rowId: `${ENGINEER_ID_PREFIX}${crypto.randomUUID().slice(0, 8)}`, data });
  } catch (e) {
    // Put the registration back, so nothing is lost
    await appwrite.tables.createRow({ databaseId: DATABASE_ID, tableId: TABLES.accounts, rowId: id, data }).catch(() => {});
    throw e;
  }
  return { name: row.name, phone: row.phone ?? '' };
}

/** Declines a waiting registration (deletes it). */
export async function decline(id: string) {
  if (!appwrite || !id.startsWith(PENDING_PREFIX)) return;
  await appwrite.tables.deleteRow({ databaseId: DATABASE_ID, tableId: TABLES.accounts, rowId: id });
}
