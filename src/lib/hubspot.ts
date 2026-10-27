import 'server-only';

/**
 * HubSpot through a service key (HubSpot → Development → Service keys) or a private app's token, set as HUBSPOT_ACCESS_TOKEN.
 * Each shop order (and each demonstration asked for on the Support page) becomes a deal on the sales pipeline, linked
 * to the contact and the hospital (a company), with the details as a note; other support requests add a note to the
 * caller's contact. HUBSPOT_PIPELINE_ID and
 * HUBSPOT_DEAL_STAGE pick where new deals land (default: the first stage of the default pipeline), and
 * HUBSPOT_OWNER_ID who in sales owns them.
 */
const token = () => process.env.HUBSPOT_ACCESS_TOKEN?.trim() || undefined;
const base = () => (process.env.HUBSPOT_API_URL?.trim() || 'https://api.hubapi.com').replace(/\/$/, '');
const pipelineId = () => process.env.HUBSPOT_PIPELINE_ID?.trim() || 'default';

export const hubspotConfigured = () => Boolean(token());

// HubSpot's built-in association types
const DEAL_TO_CONTACT = 3;
const DEAL_TO_COMPANY = 5;
const NOTE_TO_CONTACT = 202;
const NOTE_TO_DEAL = 214;

class HubSpotError extends Error {
  constructor(public status: number, public body: { message?: string; category?: string }) {
    super(`HubSpot responded ${status}: ${body.message ?? ''}`.trim());
  }
}

async function api<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${base()}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: 'no-store',
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new HubSpotError(res.status, await res.json().catch(() => ({})));
  return (res.status === 204 ? {} : await res.json()) as T;
}

type Found = { total: number; results: { id: string }[] };
const to = (id: string, typeId: number) => ({ to: { id }, types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: typeId }] });
const clean = (props: Record<string, string | undefined>) => Object.fromEntries(Object.entries(props).filter(([, v]) => v?.trim())) as Record<string, string>;

/** The contact with this email (or, without one, this phone number), created or brought up to date. */
async function upsertContact(props: Record<string, string | undefined>) {
  const p = clean(props);
  const key = p.email ? 'email' : p.phone ? 'phone' : null;
  if (key) {
    const found = await api<Found>('POST', '/crm/v3/objects/contacts/search', {
      filterGroups: [{ filters: [{ propertyName: key, operator: 'EQ', value: p[key] }] }],
      limit: 1,
    });
    if (found.results[0]) {
      const id = found.results[0].id;
      await api('PATCH', `/crm/v3/objects/contacts/${id}`, { properties: p });
      return id;
    }
  }
  return (await api<{ id: string }>('POST', '/crm/v3/objects/contacts', { properties: p })).id;
}

/** The hospital or lab as a company, found by name or created. */
async function upsertCompany(name: string) {
  const found = await api<Found>('POST', '/crm/v3/objects/companies/search', {
    filterGroups: [{ filters: [{ propertyName: 'name', operator: 'EQ', value: name }] }],
    limit: 1,
  });
  return found.results[0]?.id ?? (await api<{ id: string }>('POST', '/crm/v3/objects/companies', { properties: { name } })).id;
}

let firstStage: Promise<string> | undefined;
/** HUBSPOT_DEAL_STAGE, or the first stage of the pipeline (looked up once). */
function dealStage() {
  const set = process.env.HUBSPOT_DEAL_STAGE?.trim();
  if (set) return Promise.resolve(set);
  firstStage ??= api<{ stages: { id: string; displayOrder: number }[] }>('GET', `/crm/v3/pipelines/deals/${pipelineId()}`)
    .then(({ stages }) => [...stages].sort((a, b) => a.displayOrder - b.displayOrder)[0]?.id ?? 'appointmentscheduled')
    .catch((e) => {
      firstStage = undefined;
      throw e;
    });
  return firstStage;
}

type Lines = [string, string | undefined][];
let priorities: Promise<{ label: string; value: string }[]> | undefined;
/** The account's own value for this deal priority (HubSpot's are usually low/medium/high), or none if it has no such option. */
async function priority(level: 'HIGH' | 'MEDIUM' | 'LOW') {
  priorities ??= api<{ options?: { label: string; value: string }[] }>('GET', '/crm/v3/properties/deals/hs_priority')
    .then((p) => p.options ?? [])
    .catch(() => {
      priorities = undefined;
      return [];
    });
  const want = level.toLowerCase();
  return (await priorities).find((o) => o.value.toLowerCase() === want || o.label.toLowerCase() === want)?.value;
}

const html = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
/** Lines of "Label: value" as a note HubSpot shows with line breaks. */
const noteBody = (title: string, lines: Lines) =>
  `<p><strong>${html(title)}</strong></p>` +
  lines.filter(([, v]) => v?.trim()).map(([k, v]) => `<p><strong>${html(k)}:</strong> ${html(v!).replace(/\n/g, '<br>')}</p>`).join('');

async function addNote(body: string, associations: ReturnType<typeof to>[]) {
  await api('POST', '/crm/v3/objects/notes', { properties: { hs_note_body: body, hs_timestamp: new Date().toISOString() }, associations });
}

/** Who a deal is for; without an email (a Support page request) the contact is found by phone. */
type Person = { name: string; email?: string; phone: string; role?: string; facility: string };

/** A deal on the sales pipeline, linked to the person (a contact) and their hospital (a company), with the details as a note. */
async function createDeal(who: Person, deal: { name: string; priority: 'HIGH' | 'MEDIUM' | 'LOW'; noteTitle: string; lines: Lines }) {
  const [firstname, ...rest] = who.name.trim().split(/\s+/);
  const [contactId, companyId, stage] = await Promise.all([
    upsertContact({ email: who.email, firstname, lastname: rest.join(' '), phone: who.phone, company: who.facility, jobtitle: who.role }),
    upsertCompany(who.facility),
    dealStage(),
  ]);
  await api('PUT', `/crm/v4/objects/contact/${contactId}/associations/default/company/${companyId}`);
  const required = {
    dealname: deal.name.slice(0, 250),
    pipeline: pipelineId(),
    dealstage: stage,
    description: deal.lines.filter(([, v]) => v?.trim()).map(([k, v]) => `${k}: ${v}`).join('\n').slice(0, 60_000),
  };
  const optional = clean({ hs_priority: await priority(deal.priority), hubspot_owner_id: process.env.HUBSPOT_OWNER_ID?.trim() });
  const associations = [to(contactId, DEAL_TO_CONTACT), to(companyId, DEAL_TO_COMPANY)];
  const created = await api<{ id: string }>('POST', '/crm/v3/objects/deals', { properties: { ...required, ...optional }, associations }).catch((e) => {
    // A priority or owner this account doesn't accept mustn't lose the deal: try once without them
    if (e instanceof HubSpotError && e.status === 400 && Object.keys(optional).length) {
      console.error('[hubspot] deal refused with priority/owner, sending without them', e.message);
      return api<{ id: string }>('POST', '/crm/v3/objects/deals', { properties: required, associations });
    }
    throw e;
  });
  await addNote(noteBody(deal.noteTitle, deal.lines), [to(created.id, NOTE_TO_DEAL), to(contactId, NOTE_TO_CONTACT)]);
  return created.id;
}

const from = (w: Person) => [`${w.name}${w.role ? `, ${w.role}` : ''}`, w.facility, w.phone, w.email].filter(Boolean).join(' · ');
const summary = (names: string[]) => (names.length > 1 ? `${names[0]} +${names.length - 1} more` : names[0]);

export type OrderDeal = Person & {
  reference: string;
  items: { name: string; qty: number }[];
  payment: string;
  region?: string;
  address?: string;
  department?: string;
  /** How soon it is needed: sets the deal's priority (urgent → high). */
  timeline?: { id: 'urgent' | 'quarter' | 'planning'; label: string };
  notes?: string;
};

/** A shop order as a deal: sales confirms the total and the payment with the hospital. */
export function createOrderDeal(o: OrderDeal) {
  const items = o.items.map((i) => `${i.name}${i.qty > 1 ? ` × ${i.qty}` : ''}`);
  return createDeal(o, {
    name: `Order ${o.reference}: ${summary(items)} · ${o.facility}`,
    priority: o.timeline?.id === 'planning' ? 'LOW' : o.timeline?.id === 'quarter' ? 'MEDIUM' : 'HIGH',
    noteTitle: `Shop order ${o.reference}, awaiting payment`,
    lines: [
      ['Reference', o.reference],
      ['Items', items.map((i) => `• ${i}`).join('\n')],
      ['Department', o.department],
      ['Needed', o.timeline?.label],
      ['Notes', o.notes],
      ['Payment', o.payment],
      ['Deliver to', [o.address, o.region].filter(Boolean).join(', ')],
      ['From', from(o)],
    ],
  });
}

/** A demonstration requested on the Support page: a sales lead, so a deal rather than a note. */
export function createDemoDeal(d: Person & { reference?: string; equipment?: string; message?: string }) {
  return createDeal(d, {
    name: `Demo: ${d.equipment || 'equipment'} · ${d.facility}`,
    priority: 'MEDIUM',
    noteTitle: `Demonstration requested on the Support page${d.reference ? ` (${d.reference})` : ''}`,
    lines: [
      ['Reference', d.reference],
      ['Equipment', d.equipment],
      ['Details', d.message],
      ['From', from(d)],
    ],
  });
}

/** A support request from the Support page as a note on the caller's contact, so sales sees the history. */
export async function noteSupportRequest(s: { name: string; phone: string; facility: string; title: string; lines: Lines }) {
  const [firstname, ...rest] = s.name.trim().split(/\s+/);
  const contactId = await upsertContact({ firstname, lastname: rest.join(' '), phone: s.phone, company: s.facility });
  await addNote(noteBody(s.title, s.lines), [to(contactId, NOTE_TO_CONTACT)]);
  return contactId;
}

/**
 * A live check for the admin console (nothing is written): is the token accepted, and may it use contacts,
 * companies and deals? Returns the reason in plain words when something is wrong.
 */
export async function hubspotStatus(): Promise<{ ok: boolean; detail: string }> {
  if (!token()) return { ok: false, detail: 'HUBSPOT_ACCESS_TOKEN is not set: orders are saved for the hospital’s dashboard but sales isn’t told; the confirmation offers to send them by email or WhatsApp.' };
  try {
    for (const object of ['contacts', 'companies', 'deals']) await api('GET', `/crm/v3/objects/${object}?limit=1`);
    const pipeline = await api<{ label: string; stages: { id: string; label: string; displayOrder: number }[] }>('GET', `/crm/v3/pipelines/deals/${pipelineId()}`);
    const stageId = await dealStage();
    const stage = pipeline.stages.find((s) => s.id === stageId);
    if (!stage) return { ok: false, detail: `HUBSPOT_DEAL_STAGE “${stageId}” is not a stage of the “${pipeline.label}” pipeline. Stages: ${pipeline.stages.map((s) => `${s.label} (${s.id})`).join(', ')}.` };
    return { ok: true, detail: `Connected. Each shop order and demonstration request becomes a deal in “${pipeline.label}” at “${stage.label}”, with its contact, hospital and a note; support requests are noted on the caller’s contact.` };
  } catch (e) {
    if (e instanceof HubSpotError) {
      if (e.status === 401) return { ok: false, detail: 'HubSpot did not accept HUBSPOT_ACCESS_TOKEN. Copy the service key again from HubSpot → Development → Service keys (or create a new one).' };
      if (e.status === 403) return { ok: false, detail: `The service key is missing a permission. In HubSpot → Development → Service keys, edit the key and add read and write for contacts, companies and deals. HubSpot said: ${e.body.message ?? 'forbidden'}` };
      if (e.status === 404) return { ok: false, detail: `HUBSPOT_PIPELINE_ID “${pipelineId()}” is not a deal pipeline in this HubSpot account.` };
      return { ok: false, detail: e.message };
    }
    return { ok: false, detail: 'HubSpot could not be reached from this server. Try again in a minute.' };
  }
}
