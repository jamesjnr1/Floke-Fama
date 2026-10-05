# Flokefama Studio (Sanity)

Where the Flokefama team edits the website without a developer: products and photos, new arrivals, events and flyers, news articles, figures and milestones. When the Studio isn't connected, the website shows its built-in content, so nothing breaks before setup.

## What the team can edit

| In the Studio | Appears on |
|---|---|
| Shop → Products, New arrivals, Categories | Shop, product pages, home |
| Events → Upcoming, Past | Events & Activities (with calendar invites and WhatsApp sharing) |
| News, Blog & Press | News grid and article pages |
| Figures, Milestones | Home and About |

## Set up the existing project (about 15 minutes)

The project **project-red-field** already exists, with a `production` dataset, Viewer and Editor tokens for Vercel, and CORS origins for the Vercel previews. These steps connect it.

### 1. Find the project ID
sanity.io/manage → **project-red-field** → the **Project ID** under the name: `wq2wc7i8`.

**Status (5 Oct 2026):** the content is already imported (92 products with photos, 5 categories, 2 events, 8 articles, 4 figures, 4 milestones). Step 2 is only needed to reload it.

### 2. Load the current content into Sanity
On your computer, in the repository:

```bash
cd studio
npm install
npx sanity login                      # the same account you used on sanity.io
export SANITY_STUDIO_PROJECT_ID=<project ID>
npm run import-seed                   # products with photos, events with flyers, 8 articles, figures
```

It takes a few minutes because it uploads about 290 images. You can run it again safely: it replaces the same documents and doesn't duplicate images.

### 3. Open the Studio
```bash
npm run dev                           # http://localhost:3333
npm run deploy                        # optional: hosts it at https://flokefama.sanity.studio
```
Before deploying, add `https://flokefama.sanity.studio` (and `http://localhost:3333`) under **API → CORS origins**, with *Allow credentials* ticked.

### 4. Connect the website (Vercel → Project → Settings → Environment Variables)

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | the project ID |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` |
| `SANITY_API_READ_TOKEN` | the **Viewer token for Vercel** (only needed if the dataset is private) |
| `SANITY_REVALIDATE_SECRET` | any long random text, e.g. from `openssl rand -hex 24` |

Then redeploy (Deployments → ⋯ → Redeploy).

The **Editor token for Vercel** is not needed by the website. Keep it for scripts only, and never put it in a `NEXT_PUBLIC_` variable.

### 5. Make edits appear instantly (webhook)
Without this, published changes appear within 10 minutes. With it, they appear within seconds, which is what you want for a live demo.

sanity.io/manage → **API → Webhooks → Create webhook**:
- **URL:** `https://<your-vercel-site>/api/revalidate`
- **Dataset:** `production`
- **Trigger on:** Create, Update, Delete
- **HTTP method:** POST
- **Secret:** the same value as `SANITY_REVALIDATE_SECRET`

## Demo script (5 minutes)

1. **Events:** open *Events → Upcoming → Floke Praise 2026*. Change the guest line, then **Publish**. Refresh `/events`: the change is live, and the calendar invite updates too.
2. **New product:** *Shop → Products → Create*. Add a name, brand, category and photo, tick **New arrival**, then **Publish**. It appears under New arrivals on the Shop and gets its own product page with a quote button.
3. **News:** *News, Blog & Press → Create*. Add a title, cover image and a few paragraphs, then **Publish**. It appears first in the news grid with its own article page.
4. **Undo:** every document has a history (the clock icon). Restore any earlier version in one click.

## Good to know
- **Images:** upload the original; the website resizes and converts it (WebP/AVIF) automatically.
- **Event dates:** an event moves from Upcoming to Past the day after its date. *Starts* is used for calendar invites; *Time as shown* is what visitors read.
- **Product slugs:** the slug is the address (`/products/<slug>`). Don't change it on published products, or old links break.
- **Icons** (categories, milestones) must be a Flaticon UIcon class such as `fi-rr-microscope`. A new icon needs `npm run icons` in the web app.
