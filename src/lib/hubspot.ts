import 'server-only';

/**
 * HubSpot through a private app (HubSpot → Settings → Integrations → Private apps), set as HUBSPOT_ACCESS_TOKEN.
 * Each quote becomes a deal on the sales pipeline, linked to the contact and the hospital (a company), with the full
 * request as a note; a support request adds a note to the caller's contact. HUBSPOT_PIPELINE_ID and
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

const html = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
/** Lines of "Label: value" as a note HubSpot shows with line breaks. */
const noteBody = (title: string, lines: [string, string | undefined][]) =>
  `<p><strong>${html(title)}</strong></p>` +
  lines.filter(([, v]) => v?.trim()).map(([k, v]) => `<p><strong>${html(k)}:</strong> ${html(v!).replace(/\n/g, '<br>')}</p>`).join('');

async function addNote(body: string, associations: ReturnType<typeof to>[]) {
  await api('POST', '/crm/v3/objects/notes', { properties: { hs_note_body: body, hs_timestamp: new Date().toISOString() }, associations });
}

export type QuoteDeal = {
  reference: string;
  intent: 'quote' | 'demo';
  name: string;
  email: string;
  phone: string;
  role?: string;
  facility: string;
  department: string;
  equipment: string[];
  timeline: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  notes?: string;
};

/** A quote or demonstration request as a deal, with its contact, hospital and the full request as a note. */
export async function createQuoteDeal(q: QuoteDeal) {
  const [firstname, ...rest] = q.name.trim().split(/\s+/);
  const [contactId, companyId, stage] = await Promise.all([
    upsertContact({ email: q.email, firstname, lastname: rest.join(' '), phone: q.phone, company: q.facility, jobtitle: q.role }),
    upsertCompany(q.facility),
    dealStage(),
  ]);
  await api('PUT', `/crm/v4/objects/contact/${contactId}/associations/default/company/${companyId}`);
  const what = q.equipment.length > 1 ? `${q.equipment[0]} +${q.equipment.length - 1} more` : q.equipment[0];
  const lines: [string, string | undefined][] = [
    ['Reference', q.reference],
    ['Request', q.intent === 'demo' ? 'Demonstration' : 'Quotation'],
    ['Department', q.department],
    ['Equipment', q.equipment.map((e) => `• ${e}`).join('\n')],
    ['Timeline', q.timeline],
    ['Notes', q.notes],
    ['From', `${q.name}${q.role ? `, ${q.role}` : ''}, ${q.facility} · ${q.phone} · ${q.email}`],
  ];
  const deal = await api<{ id: string }>('POST', '/crm/v3/objects/deals', {
    properties: clean({
      dealname: `${q.intent === 'demo' ? 'Demo' : 'Quote'}: ${what} · ${q.facility}`.slice(0, 250),
      pipeline: pipelineId(),
      dealstage: stage,
      hs_priority: q.priority,
      hubspot_owner_id: process.env.HUBSPOT_OWNER_ID?.trim(),
      description: lines.filter(([, v]) => v?.trim()).map(([k, v]) => `${k}: ${v}`).join('\n').slice(0, 60_000),
    }),
    associations: [to(contactId, DEAL_TO_CONTACT), to(companyId, DEAL_TO_COMPANY)],
  });
  await addNote(noteBody(`Website ${q.intent === 'demo' ? 'demonstration' : 'quote'} request ${q.reference}`, lines), [
    to(deal.id, NOTE_TO_DEAL),
    to(contactId, NOTE_TO_CONTACT),
  ]);
  return deal.id;
}

/** A support request from the Support page as a note on the caller's contact, so sales sees the history. */
export async function noteSupportRequest(s: { name: string; phone: string; facility: string; title: string; lines: [string, string | undefined][] }) {
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
  if (!token()) return { ok: false, detail: 'HUBSPOT_ACCESS_TOKEN is not set: quotes are handed to the visitor’s email or WhatsApp (or the HubSpot form, if HUBSPOT_PORTAL_ID and HUBSPOT_FORM_GUID are set).' };
  try {
    for (const object of ['contacts', 'companies', 'deals']) await api('GET', `/crm/v3/objects/${object}?limit=1`);
    const pipeline = await api<{ label: string; stages: { id: string; label: string; displayOrder: number }[] }>('GET', `/crm/v3/pipelines/deals/${pipelineId()}`);
    const stageId = await dealStage();
    const stage = pipeline.stages.find((s) => s.id === stageId);
    if (!stage) return { ok: false, detail: `HUBSPOT_DEAL_STAGE “${stageId}” is not a stage of the “${pipeline.label}” pipeline. Stages: ${pipeline.stages.map((s) => `${s.label} (${s.id})`).join(', ')}.` };
    return { ok: true, detail: `Connected. Each quote becomes a deal in “${pipeline.label}” at “${stage.label}”, with its contact, hospital and a note; support requests are noted on the caller’s contact.` };
  } catch (e) {
    if (e instanceof HubSpotError) {
      if (e.status === 401) return { ok: false, detail: 'HubSpot did not accept HUBSPOT_ACCESS_TOKEN. Copy the private app’s access token again (it starts with “pat-”).' };
      if (e.status === 403) return { ok: false, detail: `The private app is missing a permission. In HubSpot → Private apps → Scopes, tick read and write for contacts, companies and deals. HubSpot said: ${e.body.message ?? 'forbidden'}` };
      if (e.status === 404) return { ok: false, detail: `HUBSPOT_PIPELINE_ID “${pipelineId()}” is not a deal pipeline in this HubSpot account.` };
      return { ok: false, detail: e.message };
    }
    return { ok: false, detail: 'HubSpot could not be reached from this server. Try again in a minute.' };
  }
}
