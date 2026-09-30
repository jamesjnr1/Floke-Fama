# Flokefama.com — Site Audit

**Audited:** 30 Sep 2026 · **URL:** https://flokefama.com · **Method:** HTML/CSS inspection plus headless Chromium at 1440×900 (desktop) and 390×844 (iPhone 14)

This is the "before" picture. Every item here should turn into a fix, a content request to the client, or a conscious decision to leave it as it is.

---

## 1. What the site runs on today

| Layer | Current | Notes |
|---|---|---|
| CMS | WordPress 7.1.2 | Fine, and the team already knows how to use it |
| Page builder | Elementor 4.2.3 + UiCore theme + BdThemes widgets | The main cause of bloat: **~790 `elementor` references on the homepage alone** |
| Shop | WooCommerce 11.0.1 | 92 products across ~20 categories |
| Events | The Events Calendar + Event Tickets | Used for things like Floke Praise 2025 |
| Fonts | Inter (self-hosted by Elementor) | |
| Brand colours in theme | Primary `#257847` (green), Secondary `#E4283C` (red), Dark `#25324A` | Correct values; keep them |

**Homepage HTML is 126 KB before any CSS or JS loads, and pages take 5–7 s to finish loading in a clean headless browser.**

---

## 2. Critical issues (fix first, these are visible to every visitor)

| # | Issue | Where | Evidence |
|---|---|---|---|
| C1 | **Horizontal scroll / overflow**: the page is wider than the screen | Home (desktop & mobile), About (mobile) | Home desktop: 1712 px content in a 1440 px viewport. Home mobile: 459 px in 390 px. About mobile: 485 px in 390 px |
| C2 | **Stats show "0 +"** instead of real numbers | Home, "The Results" section | The counter animation never fires, so the value stays 0 |
| C3 | **Placeholder "99" stats** on "Why Choose Flokefama?" | Services | Four identical "99" counters with no units |
| C4 | **ESG page is empty**: just a banner and the footer | /esg/ | Linked in the main nav, so it's a dead end |
| C5 | **Careers page is empty** | /careers/ | Same problem |
| C6 | **Social icons in the footer go nowhere** (`href="#"`) | Every page | Facebook, LinkedIn and WhatsApp icons are not linked |
| C7 | **Privacy Policy / Terms links are `#`** | Footer | A legal and trust problem, especially for a shop that takes accounts |
| C8 | **Large blank gap under "Solutions"** on mobile | Home | Content fails to render or animates in late, so the user sees white space |

## 3. High-priority issues

| # | Issue | Detail |
|---|---|---|
| H1 | **Contradictory numbers across pages** | About: *17 yrs / 56 clients*. Awards: *200 products / 5 awards / 40 team*. Shop: *92 products*. Home: *0+*. Pick one verified set and use it everywhere |
| H2 | **Brand name used inconsistently** | "Flokefama", "FLOKEFAMA LIMITED", "Flokefama Company Ltd", "FLOKE FAMA" (logo), "Floke Company Ltd." (building sign). **Ask the client for the one official written form** |
| H3 | **Testimonials look like placeholders** | Generic names and titles ("Dr. Kwame Asante, Medical Director, Lifecare Hospital") with no photos or organisations that can be checked. Only publish quotes that come from real, consenting clients |
| H4 | **No meta description, no Open Graph image** | Links shared on WhatsApp, LinkedIn and Facebook show no preview card. That matters for a company that wants active social channels |
| H5 | **12 of 30 homepage images have empty `alt`** | Includes partner logos. Hurts accessibility and SEO |
| H6 | **Mobile partner logos shrink to ~20 px** | They can't be read. Use a 2- or 3-column grid or a marquee on mobile |
| H7 | **Mobile hero copy is centred and floats over faces** | The headline sits on top of the people in the photo; there isn't enough contrast control |
| H8 | **Two identical red CTAs** ("Shop Now" in the nav and "Contact Us" in the hero) | Red is used for everything, so nothing stands out. Red should be an accent, not the main button colour |
| H9 | **"Solutions" heading in red, centred, huge, and followed by nothing** (mobile) | Looks broken |
| H10 | **Navigation is overloaded** | Home / Company ▾ / Shop / ESG / Contact / My Account ▾ / Search / Cart / Shop Now. "Shop" appears twice, and "My Account" in the main nav is unusual for a B2B healthcare supplier |
| H11 | **Contact details aren't in the header or footer** | Phone and email appear only on /contact/. The call-centre number should be one tap away on mobile |
| H12 | **Product images vary in size, background and quality** | Some are Amazon listing photos (`41-LcRQwLL._AC_SL1060_`), some are `OIP-3.jpg` from Bing. There are licensing risks and the result looks inconsistent |

## 4. Content inventory (what already exists and is worth keeping)

**Company facts**
- Founded **2008**; Ghana Club 100 company; tagline *"Saving Lives"*
- Mission: *world-class medical solutions to all medical facilities and laboratories in the West African sub-region*
- Vision: *a localised industrial complex producing medical equipment and reagents locally, listed on the Ghana Stock Exchange by 2030*
- Official distributor of **Mindray**, **Biozek Holland**, **MR Global**

**Solutions (3 pillars):** In-Vitro Diagnostics · Consumables · In-Vivo Medical Devices

**Services (6):** Equipment Sales · Installation & Commissioning · Technical Support & Maintenance · Calibration · Repairs & Spare Parts · Training & Capacity Building

**Clients and partners shown:** Mindray, Biozek, The Trust Hospital, UGMC, Korle Bu Teaching Hospital, KATH, LEKMA, Euracare

**Contact**
- Call centre **+233 (53) 339 2863**
- info@ / sales@ / support@flokefama.com
- Branches: Santa Maria (HQ), Korle-Bu, Okaishie, Kumasi, Aflao, Techiman

**Recent news, which is strong material for flyers and social posts:**
- Mindray Central Africa **IVD Breakthrough Award** (Nairobi, Mar 2026)
- Featured in **Forbes Africa** (Jun/Jul 2026)
- Partnership with the **University of Ghana** School of Engineering (biomedical engineering)
- ZODF Ramadan distribution programme (CSR)
- Floke Praise 2025, marking 17 years (Oct 2025)

## 5. Questions to send the client (send these in week 1)

1. What is the one official name and its written form (e.g. *Flokefama Company Limited*, short name *Flokefama*)?
2. Do you have the logo as a vector file (SVG/AI/EPS)? The website currently uses a 500×153 PNG with a white pill baked in.
3. Which numbers are verified and approved: years, facilities served, products, installations, branches, staff?
4. Can we get 3–5 **real** testimonials, with names, roles, organisations and permission to publish?
5. What are the URLs of the Facebook, LinkedIn, Instagram and WhatsApp Business accounts, and who has admin access?
6. Should the online shop stay transactional (checkout and payment), or become a **catalogue with a "Request a Quote" button**? For hospital procurement the second is usually the better fit.
7. What content is planned for ESG and Careers? Should they be hidden until it exists?
8. Is there professional photography of the team, warehouse, installations and engineers on site? If not, can we schedule a shoot?
9. Who will update the site after launch, and how comfortable are they with WordPress?
10. Where is the site hosted and who holds the domain and DNS access?
