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

/** A run of text inside a paragraph or list item. */
const run = defineArrayMember({
  type: 'object',
  name: 'run',
  fields: [
    defineField({ name: 't', title: 'Text', type: 'text', rows: 2 }),
    defineField({ name: 'b', title: 'Bold', type: 'boolean' }),
    defineField({ name: 'i', title: 'Italic', type: 'boolean' }),
    defineField({ name: 'href', title: 'Link', type: 'url', validation: (r) => r.uri({ allowRelative: true, scheme: ['http', 'https', 'mailto', 'tel'] }) }),
  ],
  preview: { select: { title: 't', b: 'b', href: 'href' }, prepare: ({ title, b, href }) => ({ title, subtitle: [b && 'bold', href && 'link'].filter(Boolean).join(' · ') }) },
});

export const event = defineType({
  name: 'event',
  title: 'Event',
  type: 'document',
  description: 'Shown on Events & Activities. Upcoming events move to “Past” the day after they end.',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'slug', title: 'ID', type: 'slug', options: { source: 'title' }, validation: (r) => r.required(), description: 'Used in links and calendar invites, e.g. floke-praise-2026' }),
    defineField({ name: 'date', type: 'date', validation: (r) => r.required(), description: 'The day of the event' }),
    defineField({ name: 'start', title: 'Starts', type: 'datetime', validation: (r) => r.required(), description: 'Used for calendar invites (Ghana time)' }),
    defineField({ name: 'end', title: 'Ends', type: 'datetime' }),
    defineField({ name: 'time', title: 'Time as shown', type: 'string', validation: (r) => r.required(), description: 'e.g. “3:00 pm” or “3:00 pm – 7:00 pm”' }),
    defineField({ name: 'venue', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'theme', type: 'string' }),
    defineField({ name: 'guests', title: 'Guests / ministering', type: 'string' }),
    defineField({ name: 'price', title: 'Entry', type: 'string', description: 'e.g. “Free”' }),
    defineField({ name: 'body', title: 'Short description', type: 'text', rows: 3, validation: (r) => r.required() }),
    defineField({ name: 'more', title: 'More paragraphs', type: 'array', of: [{ type: 'text' }] }),
    defineField({
      name: 'image',
      title: 'Flyer',
      type: 'image',
      fields: [defineField({ name: 'alt', title: 'Describe the flyer', type: 'string', description: 'Read aloud to visitors who use a screen reader' })],
    }),
  ],
  orderings: [{ title: 'Date, newest first', name: 'dateDesc', by: [{ field: 'date', direction: 'desc' }] }],
  preview: { select: { title: 'title', subtitle: 'date', media: 'image' } },
});

export const article = defineType({
  name: 'article',
  title: 'News article',
  type: 'document',
  description: 'News, Blog & Press. Each block is a paragraph, heading, quote, list or image.',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'slug', type: 'slug', options: { source: 'title' }, validation: (r) => r.required() }),
    defineField({ name: 'date', type: 'date', validation: (r) => r.required() }),
    defineField({ name: 'categories', type: 'array', of: [{ type: 'string' }], options: { layout: 'tags' } }),
    defineField({ name: 'excerpt', type: 'text', rows: 3, description: 'Shown on the news cards' }),
    defineField({ name: 'cover', title: 'Cover image', type: 'image', fields: [defineField({ name: 'alt', type: 'string' })] }),
    defineField({
      name: 'blocks',
      title: 'Body',
      type: 'array',
      of: [
        defineArrayMember({ type: 'object', name: 'heading', fields: [defineField({ name: 'text', type: 'string' })], preview: { select: { title: 'text' }, prepare: ({ title }) => ({ title, subtitle: 'Heading' }) } }),
        defineArrayMember({ type: 'object', name: 'paragraph', fields: [defineField({ name: 'runs', type: 'array', of: [run] })], preview: { select: { t: 'runs.0.t' }, prepare: ({ t }) => ({ title: t, subtitle: 'Paragraph' }) } }),
        defineArrayMember({ type: 'object', name: 'quote', fields: [defineField({ name: 'runs', type: 'array', of: [run] })], preview: { select: { t: 'runs.0.t' }, prepare: ({ t }) => ({ title: t, subtitle: 'Quote' }) } }),
        defineArrayMember({
          type: 'object',
          name: 'list',
          fields: [
            defineField({ name: 'ordered', title: 'Numbered', type: 'boolean' }),
            defineField({ name: 'items', type: 'array', of: [defineArrayMember({ type: 'object', name: 'item', fields: [defineField({ name: 'runs', type: 'array', of: [run] })], preview: { select: { title: 'runs.0.t' } } })] }),
          ],
          preview: { select: { t: 'items.0.runs.0.t', o: 'ordered' }, prepare: ({ t, o }) => ({ title: t, subtitle: o ? 'Numbered list' : 'List' }) },
        }),
        defineArrayMember({ type: 'image', name: 'figure', fields: [defineField({ name: 'alt', type: 'string' })] }),
      ],
    }),
    defineField({ name: 'source', title: 'Path on the old site', type: 'string', description: 'Used to redirect old links' }),
  ],
  orderings: [{ title: 'Date, newest first', name: 'dateDesc', by: [{ field: 'date', direction: 'desc' }] }],
  preview: { select: { title: 'title', subtitle: 'date', media: 'cover' } },
});

export const schemaTypes = [category, product, event, article, metric, milestone];
