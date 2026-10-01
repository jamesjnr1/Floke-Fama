# Backend plan

How the site's back end will work once Flokefama goes beyond the preview, and **everything that has to happen, by whom**.

## 1. What exists today

| Part | Today (preview) | Problem for real use |
|---|---|---|
| Public pages, Shop, news | Content files in the repo (`src/data/*`), Sanity wiring ready but not connected | Staff can't edit content without a developer |
| Quote, contact, registration forms | Validated on the server; sent to HubSpot **if configured**, otherwise handed to email / WhatsApp | Works, but no CRM record until HubSpot is connected |
| Portal sign-in | Signed cookie + two demo accounts (`src/lib/auth/users.ts`) | No real accounts, no password reset |
| Client portal + engineer portal | One shared service desk stored **in the browser** (`src/lib/service/store.ts`) | Each person sees their own copy; nothing is shared between devices |

The screens are finished. The back end replaces the *storage* underneath them; the screens stay the same.

## 2. Target structure

```
                     Visitors · Hospital staff · Flokefama engineers
                                        │
                     ┌──────────────────▼───────────────────┐
                     │  Next.js website + portals (Vercel)   │
                     │  pages · server actions · API routes  │
                     └──┬──────────────┬──────────────┬─────┘
                        │              │              │
          ┌─────────────▼──┐  ┌────────▼────────┐  ┌──▼──────────────────────┐
          │  Sanity (CMS)  │  │ HubSpot (CRM)   │  │ Supabase                │
          │ products, news,│  │ quotes, demos,  │  │ Postgres database        │
          │ events, pages  │  │ contact, leads  │  │ Auth (accounts, reset)   │
          └────────────────┘  └─────────────────┘  │ Storage (certificates)   │
                                                   │ Realtime (live updates)  │
                                                   └──┬──────────────────────┘
                                                      │
                                    ┌─────────────────▼───────────────┐
                                    │ Resend (email) · SMS (optional)  │
                                    │ notifications, password resets   │
                                    └──────────────────────────────────┘
```

**One job per service:**
- **Sanity** holds marketing content that staff edit: products, news, events, page text.
- **HubSpot** holds sales leads: quotes, demos and contact messages.
- **Supabase** holds everything behind a login: accounts, facilities, equipment, service tickets, calibration certificates and notifications.

Why Supabase for the portals:
- One service gives the database, sign-in, file storage and live updates.
- Its row-level security means a hospital can only ever read its own rows.
- It is Postgres, so the data can move elsewhere later.

**Algolia is not needed.** With 92 products, the built-in local search is instant. Drop it unless the catalogue grows into the thousands.

## 3. Database (Supabase)

| Table | Holds | Key fields |
|---|---|---|
| `facilities` | Hospitals, labs, clinics (the clients) | name, region, branch, address, main contact |
| `profiles` | One row per person who can sign in | user id (Supabase Auth), name, phone, **role** |
| `facility_members` | Who belongs to which facility | facility, profile, `admin` or `staff` |
| `registrations` | "Register" requests from `/login` | name, facility, role, email, phone, systems, status (`pending` / `approved` / `rejected`), reviewed by |
| `assets` | Installed equipment | facility, product slug (links to the Shop), serial, location, installed, warranty until, calibration interval, last / next calibration |
| `tickets` | Service requests | asset, title, description, priority, status, engineer, ETA, requested by, contact phone, preferred visit, resolution, rating, feedback |
| `ticket_events` | The work log on each ticket | ticket, time, by, kind (`status` / `note` / `part` / `system`), text |
| `ticket_parts` | Parts used | ticket, part, quantity |
| `calibrations` | Calibration results and certificates | asset, date, result (`Pass` / `Adjusted`), engineer, notes, certificate PDF path |
| `notifications` | Bell-icon updates | recipient, text, ticket / asset, read |
| `audit_log` | Who changed what (for compliance) | actor, action, table, row, time |

These match the types the portals already use (`Ticket`, `Asset`, `Certificate`, `Notification` in `src/lib/service/store.ts`), so the screens need no redesign.

**Roles and what each can see** (enforced by the database itself, not just the screens):

| Role | Can see | Can do |
|---|---|---|
| `client_staff` | Their facility's equipment, tickets, certificates | Raise tickets, message the engineer, rate a visit |
| `client_admin` | Same as staff | Also invite or remove their facility's staff |
| `engineer` | Tickets assigned to them, plus their branch's queue | Update status, log work and parts, record calibrations |
| `dispatcher` | All tickets | Assign engineers, set priority |
| `admin` (Flokefama office) | Everything | Approve registrations, manage facilities, assets and engineers |

## 4. How the main flows work

1. **Registration → account.** A hospital fills in Register on `/login`. That creates a `registrations` row and an email to support. An admin approves it, which creates the facility (if new) and sends a Supabase invite email. The person sets their own password.
2. **Sign-in.** Supabase Auth replaces the demo accounts. It handles password reset by email, and engineers and admins get two-factor sign-in. The current middleware role checks stay in place.
3. **Service request.**
   - A client raises a ticket, which creates a `tickets` row and notifies the dispatcher (in-app + email).
   - The dispatcher assigns an engineer.
   - Each step is written to `ticket_events`: en route with ETA, on site, resolved.
   - The client's portal updates live (Supabase Realtime), and they receive an email or SMS.
4. **Calibration.**
   - The engineer records the result.
   - The site generates the certificate PDF (`src/lib/service/certificate.ts` already does this), saves it to Storage and sets the next due date.
   - The client sees it in Certificates.
   - Reminders go out 30 days before the due date (a scheduled job).
5. **Quotes and contact.** These go to HubSpot as today. Nothing changes except connecting the account.

## 5. What I build (development work)

| Step | Work |
|---|---|
| 1 | Supabase schema as SQL migrations in `supabase/migrations/`, with row-level security for every table |
| 2 | Supabase sign-in: replace `src/lib/auth/users.ts` and the cookie session; invite, password-reset and two-factor screens |
| 3 | Swap the browser service desk for server actions on Supabase (same action names the screens call today), plus live updates |
| 4 | Admin screens: approve registrations, manage facilities, assets and engineers |
| 5 | Certificates to Storage; email notifications (Resend); 30-day calibration reminders |
| 6 | Import script for Flokefama's real asset register (spreadsheet → database) |
| 7 | Connect Sanity and HubSpot with the real accounts; move the content files into Sanity |
| 8 | Tests for every role (a hospital must never see another hospital's data), then a security review |

## 6. Everything you need to do

### A. Accounts to create (Flokefama-owned; I can't own them)
Create each one under a company email (e.g. it@ or admin@), not a personal one.

| # | Service | What to do | What I need back |
|---|---|---|---|
| 1 | **Vercel** | Create a team; import this GitHub repo | Nothing: add the keys below in Vercel → Settings → Environment Variables |
| 2 | **Supabase** | New project, region **London (eu-west-2)**, closest to Ghana. Or say the word and I'll create it through the Supabase account connected to this session | Project URL, anon key, service-role key (into Vercel, **never in chat or email**) |
| 3 | **Sanity** | Create a project at sanity.io | Project ID, a read token |
| 4 | **HubSpot** | Free CRM; create one form for website enquiries | Portal ID, form GUID |
| 5 | **Resend** (email) | Create an account | API key |
| 6 | SMS (optional) | A Ghanaian SMS provider, e.g. Hubtel | API credentials |

### B. Decisions only Flokefama can make
1. **Who approves portal registrations** (names, and a shared inbox).
2. **Response times per priority** (critical / high / routine), so the portal can show and track them.
3. **Branches and engineers**: which engineer covers which branch (Accra, Korle-Bu, Okaishie, Kumasi, Aflao, Techiman).
4. **Email sender address**. Sending as `@flokefama.com` needs DNS records added to the flokefama.com domain, which is **a change to the live domain**. It needs written approval from whoever manages it. Until then, email goes from a Resend test address.
5. **SMS or email only** for engineer-visit updates.

### C. Information to gather
- **Facility list**: name, region, branch, main contact.
- **Asset register**: per machine, the facility, model, serial number, location, install date, warranty end, calibration interval and last calibration. A spreadsheet is fine; I'll import it.
- **Engineer list**: name, phone, email, branch.
- **Confirmed CEO name** for the About page ("Emmanuel Teye Kenney" or "Emmanuel Kwabena Kenney").

### D. Legal and compliance (Ghana)
- **Data Protection Commission**: under the Data Protection Act, 2012 (Act 843), organisations that process personal data must register as data controllers. Confirm Flokefama's registration covers the portal.
- **Privacy policy and terms of use** for the website and portal (a lawyer or the DPC template).
- **Data retention**: how long tickets, certificates and accounts are kept.
- **Agreements**: Supabase, Vercel and Resend each offer a Data Processing Agreement; accept them for the account.

### E. Rough running costs
These are approximate monthly figures at small scale; check each provider's current pricing.

| Service | Plan | Approx. cost |
|---|---|---|
| Vercel | Pro (commercial use isn't allowed on the free plan) | ~$20 per team member |
| Supabase | Pro (daily backups, no pausing) | ~$25 |
| Sanity | Free tier is enough to start | $0 |
| HubSpot | Free CRM | $0 |
| Resend | Free tier (3,000 emails / month) | $0 |
| SMS | Pay per message | Depends on volume |

### F. Unchanged rules
- The live flokefama.com site, its WordPress and its DNS are not touched.
- The preview stays hidden from search engines until launch is approved. Launch day is its own planned task (backup, domain, DNS).

## 7. Order of work

| Phase | Needs from you | Result |
|---|---|---|
| 1. Leads live | Vercel, HubSpot | Every quote and message lands in the CRM |
| 2. Content editable | Sanity | Staff edit products, news and events themselves |
| 3. Real portal accounts | Supabase, Resend, decisions B1 and B4 | Hospitals and engineers sign in with their own accounts |
| 4. Live service desk | Asset register, engineer list, decisions B2, B3 and B5 | Real tickets, live updates, notifications |
| 5. Certificates and reminders | — | Calibration PDFs stored; 30-day reminders |
| 6. Launch | Written approval, DPC and privacy policy | Site goes live on flokefama.com |
