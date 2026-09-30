# Flokefama Studio (Sanity)

Where the Flokefama team edits products, specifications, compatibility tables, datasheets, hero metrics and milestones, without touching code.

```bash
cd studio
npm install
npx sanity login
npx sanity init --env      # creates the project, writes SANITY_STUDIO_PROJECT_ID
npm run import-seed        # loads the current catalogue from ../src/data/seed.ts
npm run dev                # http://localhost:3333
npm run deploy             # hosts the Studio at https://flokefama.sanity.studio
```

Then set `NEXT_PUBLIC_SANITY_PROJECT_ID` in the web app (Vercel → Settings → Environment Variables). Pages revalidate every 10 minutes.
