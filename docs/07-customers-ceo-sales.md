# Customer, CEO and sales: what the website must do

Three questions, answered against what the site does today. ✅ means it is built and tested; ⏳ means it needs something from Flokefama (an account, data or a decision).

## 1. As a customer buying medical equipment, what do I want to see?

A hospital administrator, lab manager or procurement officer arrives with a need (*“we need a haematology analyser”*) and three worries: *Is this the right product? Can I trust this supplier? What happens after I buy?*

| What the buyer wants | Where it is | Status |
|---|---|---|
| Find the product fast | Shop: 92 products, category tabs, instant search, Explore Product Categories, New arrivals | ✅ |
| See what it is and what it does | Product page: photos, description, key features (from the brochure), details, Documents tab | ✅ |
| Get specifications and datasheets | Documents tab: company brochure download; datasheet request goes to sales pre-filled | ✅ |
| Know the price | Every order is quoted (model, configuration, quantity and service package change the price). The Buying FAQ explains this, and the quote flow makes it a 2-minute request | ✅ |
| Ask for several items at once | **Quote list**: “+” on every product, a floating list, one request for all of them | ✅ new |
| See it working before buying | “Schedule a demonstration” on every product | ✅ |
| Talk to someone now | **WhatsApp button on every page**, pre-filled with the product being viewed; phone and email in the header, footer and Contact | ✅ new |
| Be sure the supplier is genuine | Official distributor of Mindray, Biozek Holland and MR Global; partners and clients; awards (Ghana Club 100 No.1 in Healthcare); testimonials; CEO and history | ✅ |
| Know what happens after purchase | Installation, calibration, training, maintenance and repairs (Services); **why-buy strip on every product**; client portal for service requests and certificates | ✅ |
| Know where you are | Six branches, map and directions on Contact | ✅ |
| Answers to common questions | **Buying FAQ** on the Shop page (also published as FAQ structured data for Google) | ✅ new |
| Find related items | **“Often requested together”** on every product (same type, then same category) | ✅ new |
| Use it on a phone | Every page is tested at phone width; product pages have a **sticky “Request a quote” bar** on phones | ✅ new |
| See stock and delivery times | Needs live stock from Flokefama’s inventory system | ⏳ |
| Compare models side by side | Needs verified specifications per product (most catalogue entries have none yet) | ⏳ |

## 2. As the CEO, what do I want customers to see?

That Flokefama is **Ghana’s No.1 healthcare company**, safe to trust with critical equipment, and a partner rather than a box-seller.

| Message | Where it is | Status |
|---|---|---|
| Leadership and scale: “Ghana’s No.1 Healthcare Company” | Home hero | ✅ |
| Proof in numbers: 700+ hospitals and labs, 300+ integrations, 6 branches, 40 team members | Home (The Results), About (Our Impact) | ✅ |
| Recognition: Ghana Club 100 No.1 in Healthcare, Mindray awards, Forbes Africa | Awards page, About | ✅ |
| The people behind it | About: Meet our CEO (story, beliefs, background, Man of the Year in Health) | ✅ |
| Who trusts us | Partners & clientele logos, testimonials | ✅ |
| We serve for the long term | Services lifecycle, client portal, engineer service portal | ✅ (portals on demo data until the backend, see `06-backend-plan.md`) |
| We give back | ESG, News (blood bank renovation, University of Ghana, ZoDF) | ✅ |
| We are active | Events & Activities, News articles | ✅ |

## 3. As the CEO, how do I grow sales through the website?

| Lever | What it does | Status |
|---|---|---|
| Fewer steps to enquire | “Request a quote” on every product, in the header, and in the phone sticky bar; the machine is pre-filled | ✅ |
| Bigger orders | **Quote list**: labs order several items (analyser + reagents + consumables) in one request | ✅ new |
| Cross-sell | **Often requested together** on every product | ✅ new |
| Instant conversation | **WhatsApp** with the product named in the first message, so sales knows what to quote | ✅ new |
| Remove doubt before contact | **Buying FAQ**, why-buy strip, demonstrations | ✅ new |
| Never lose a lead | Every form validates on the server and goes to the CRM; until the CRM is connected, the visitor sends it by email or WhatsApp in one tap | ✅ (HubSpot ⏳) |
| Measure what works | **Conversion analytics**: quote and demo submissions, quote-list adds and requests, WhatsApp and call clicks, brochure downloads, datasheet requests; per page and product | ✅ new (shows once deployed on Vercel) |
| Be found on Google | Product, FAQ, NewsArticle and Organization structured data; sitemap; fast pages | ✅ (indexing switched on only at launch) |
| Keep customers | Client portal (service requests, live engineer tracking, certificates) | ✅ (real accounts ⏳ backend) |
| Follow up every lead fast | Response promise of one business day is shown on the site; needs a named owner in sales | ⏳ decision |

### What Flokefama needs to do to get the full value

1. **Connect HubSpot** (free CRM) so every quote lands as a deal: see `06-backend-plan.md`.
2. **Deploy on Vercel and turn on Web Analytics** (Project → Analytics). The events above then appear with no further work.
3. **Name an owner for WhatsApp and quote replies**, and keep to the one-business-day promise.
4. **Send verified specifications** for the top 20 products; this unlocks product comparison and better Google results.
5. **Stock and delivery times** need the inventory system; we can connect it in phase 4 of the backend plan.

## Conversion events (for reports)

| Event | Fired when | Extra data |
|---|---|---|
| `quote_submitted` / `demo_submitted` | A quote or demo request is sent | number of items, department, delivered to CRM |
| `quote_list_add` | A product is added to the quote list | product |
| `quote_list_request` | “Request one quote for all” is pressed | number of items |
| `whatsapp_click` | Any WhatsApp button or link | page, product |
| `call_click` | Any phone number is tapped | page |
| `brochure_download` | The company brochure is downloaded | page |
| `datasheet_request` | A datasheet is requested | page |

No names, emails or phone numbers are sent to analytics; those stay in the CRM. Vercel Web Analytics uses no cookies, so no consent banner is needed.
