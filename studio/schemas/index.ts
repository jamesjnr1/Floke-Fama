import { defineArrayMember, defineField, defineType } from 'sanity';

const order = defineField({ name: 'order', title: 'Sort order', type: 'number', initialValue: 0 });

/** UIcon class, e.g. "fi-rr-microscope". Run `npm run icons` in the web app after adding a new one. */
const icon = defineField({
  name: 'icon',
  type: 'string',
  description: 'Flaticon UIcon class, e.g. fi-rr-microscope (see flaticon.com/uicons)',
  validation: (r) => r.required().regex(/^fi-rr-[a-z0-9-]+$/),
});

export const category = defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'slug', type: 'slug', options: { source: 'title' }, validation: (r) => r.required() }),
    defineField({ name: 'short', title: 'Short label', type: 'string', validation: (r) => r.required().max(16) }),
    defineField({ name: 'description', type: 'text', rows: 2 }),
    icon,
    order,
  ],
});

export const product = defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  groups: [{ name: 'main', default: true }, { name: 'technical' }, { name: 'documents' }],
  fields: [
    defineField({ name: 'name', type: 'string', group: 'main', validation: (r) => r.required() }),
    defineField({ name: 'slug', type: 'slug', group: 'main', options: { source: 'name' }, validation: (r) => r.required() }),
    defineField({ name: 'brand', type: 'string', group: 'main', validation: (r) => r.required() }),
    defineField({ name: 'category', type: 'reference', to: [{ type: 'category' }], group: 'main', validation: (r) => r.required() }),
    defineField({ name: 'summary', type: 'text', rows: 2, group: 'main', validation: (r) => r.required().max(180) }),
    defineField({ name: 'image', type: 'image', group: 'main', description: 'Square, white or transparent background, product centred' }),
    defineField({ name: 'featured', type: 'boolean', group: 'main', initialValue: false }),
    defineField({ name: 'newArrival', title: 'New arrival', type: 'boolean', group: 'main', initialValue: false, description: 'Show in “New arrivals” on the Shop' }),
    defineField({ name: 'types', title: 'Listed under', type: 'array', of: [{ type: 'string' }], group: 'main', description: 'Original shop categories from flokefama.com, e.g. “Hematology Analyzers”' }),
    defineField({ name: 'description', type: 'array', of: [{ type: 'text' }], group: 'main', description: 'Description paragraphs' }),
    defineField({ name: 'highlightsSource', title: 'Highlights source', type: 'string', group: 'main', options: { list: ['brochure'] } }),
    defineField({ name: 'source', title: 'Path on the old site', type: 'string', group: 'main', description: 'Used to redirect old links' }),
    defineField({ name: 'highlights', type: 'array', of: [{ type: 'string' }], group: 'main', validation: (r) => r.max(4) }),
    defineField({ name: 'tags', title: 'Search keywords', type: 'array', of: [{ type: 'string' }], options: { layout: 'tags' }, group: 'main' }),
    defineField({
      name: 'specs',
      title: 'Specifications',
      type: 'array',
      group: 'technical',
      of: [defineArrayMember({ type: 'object', fields: [{ name: 'label', type: 'string' }, { name: 'value', type: 'string' }], preview: { select: { title: 'label', subtitle: 'value' } } })],
    }),
    defineField({ name: 'specsVerified', title: 'Specs verified against manufacturer datasheet', type: 'boolean', group: 'technical', initialValue: false }),
    defineField({
      name: 'compatibility',
      title: 'Reagent / consumable compatibility',
      type: 'array',
      group: 'technical',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            { name: 'item', type: 'string' },
            { name: 'status', type: 'string', options: { list: ['validated', 'supported', 'consult'], layout: 'radio' } },
            { name: 'note', type: 'string' },
          ],
          preview: { select: { title: 'item', subtitle: 'status' } },
        }),
      ],
    }),
    defineField({
      name: 'documents',
      type: 'array',
      group: 'documents',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            { name: 'title', type: 'string' },
            { name: 'kind', type: 'string', options: { list: ['datasheet', 'brochure', 'manual'] } },
            { name: 'file', type: 'file', options: { accept: 'application/pdf' } },
          ],
        }),
      ],
    }),
  ],
  preview: { select: { title: 'name', subtitle: 'brand', media: 'image' } },
});

export const metric = defineType({
  name: 'metric',
  title: 'Hero metric',
  type: 'document',
  description: 'Shown in the Enterprise Metrics Tracker. Only publish verified figures.',
  fields: [
    defineField({ name: 'label', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'value', type: 'number', validation: (r) => r.required() }),
    defineField({ name: 'prefix', type: 'string' }),
    defineField({ name: 'suffix', type: 'string' }),
    defineField({ name: 'caption', type: 'string' }),
    order,
  ],
});

export const milestone = defineType({
  name: 'milestone',
  title: 'Milestone',
  type: 'document',
  description: 'Awards, rankings, press and partnerships for the Trust & Authority section.',
  fields: [
    defineField({ name: 'kicker', type: 'string', description: 'e.g. "Award · March 2026"' }),
    defineField({ name: 'title', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'body', type: 'text', rows: 2 }),
    defineField({ name: 'date', type: 'date' }),
    defineField({ name: 'image', type: 'image', description: 'Real event photography only' }),
    icon,
    defineField({ name: 'href', type: 'url' }),
    order,
  ],
});

export const schemaTypes = [category, product, metric, milestone];
