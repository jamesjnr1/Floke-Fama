import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemas';
import { structure } from './structure';

export default defineConfig({
  name: 'flokefama',
  title: 'Flokefama',
  // The existing project (“project-red-field”); override with SANITY_STUDIO_PROJECT_ID if it changes
  projectId: process.env.SANITY_STUDIO_PROJECT_ID!,
  dataset: process.env.SANITY_STUDIO_DATASET ?? 'production',
  plugins: [structureTool({ structure }), visionTool()],
  schema: { types: schemaTypes },
});
