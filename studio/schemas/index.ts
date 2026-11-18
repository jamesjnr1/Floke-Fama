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
    defineField({ name: 'image', title: 'Main photo', type: 'image', group: 'main', description: 'Square, white or transparent background, product centred' }),
    defineField({ name: 'gallery', title: 'More photos', type: 'array', of: [{ type: 'image' }], group: 'main', options: { layout: 'grid' }, description: 'Other angles; shown as thumbnails under the main photo. Drag to reorder.' }),
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
  title: 'Figure',
  type: 'document',
  description: 'The first two (by sort order) are the big numbers on the home page, under the hero. Only publish verified figures.',
  fields: [
    defineField({ name: 'label', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'homeLabel', title: 'Label on the home page (optional)', type: 'string', description: 'A shorter line for the home page, e.g. “Hospitals and laboratories served”. Empty: the label above is used.' }),
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
    defineField({ name: 'cover', title: 'Cover photo', type: 'image', options: { hotspot: true }, description: 'A photo from the event, shown for it in the events list (landscape works best)' }),
    defineField({
      name: 'photos',
      title: 'Event photos',
      type: 'array',
      description: 'Pictures taken at the event. They show under the event on Events & News; placeholders show until the first one is added.',
      options: { layout: 'grid' },
      of: [
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'caption', type: 'string', description: 'Optional, shown on the event page' }),
            defineField({ name: 'alt', title: 'Describe the photo', type: 'string', description: 'Read aloud to visitors who use a screen reader' }),
          ],
        }),
      ],
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

/* ---------- Site content: everything else on the website, in one document ---------- */

const iconField = defineField({ name: 'icon', type: 'string', description: 'Flaticon UIcon class, e.g. fi-rr-microscope', validation: (r) => r.regex(/^fi-rr-[a-z0-9-]+$/) });
const textItem = (name: string, title: string, textName = 'text') =>
  defineArrayMember({
    type: 'object',
    name,
    title,
    fields: [defineField({ name: 'title', type: 'string', validation: (r) => r.required() }), iconField, defineField({ name: textName, title: 'Text', type: 'text', rows: 3 })],
    preview: { select: { title: 'title', subtitle: textName } },
  });
const logo = (name: string) =>
  defineArrayMember({
    type: 'object',
    name,
    fields: [
      defineField({ name: 'name', type: 'string', validation: (r) => r.required() }),
      defineField({ name: 'logo', type: 'image', description: 'Transparent PNG or a logo on white' }),
      defineField({ name: 'role', type: 'string', description: 'Optional, e.g. Official distributor' }),
      ...(name === 'client'
        ? [
            defineField({ name: 'code', title: 'Code (optional)', type: 'string', description: 'Optional, not shown on the website for now, e.g. FF-H08' }),
            defineField({ name: 'kind', title: 'Kind of facility', type: 'string', description: 'Optional, e.g. Teaching hospital, Private clinic' }),
          ]
        : []),
    ],
    preview: { select: { title: 'name', subtitle: 'code', media: 'logo' } },
  });
/** A photo with its description and an optional caption, for galleries. */
const photo = defineArrayMember({
  type: 'image',
  name: 'photo',
  options: { hotspot: true },
  fields: [
    defineField({ name: 'alt', title: 'Describe the photo', type: 'string', description: 'Read aloud to visitors who use a screen reader' }),
    defineField({ name: 'caption', type: 'string', description: 'Optional, shown under the photo' }),
  ],
});
const header = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: 'object',
    options: { collapsible: true, collapsed: true },
    fields: [
      defineField({ name: 'title', type: 'string', description: 'First part of the heading' }),
      defineField({ name: 'highlight', type: 'string', description: 'Words shown in italic (emphasised)' }),
      defineField({ name: 'emphasisFirst', title: 'Italic words first', type: 'boolean', description: 'e.g. “Saving Lives since 2008”: the italic words come before the heading' }),
      defineField({ name: 'lead', title: 'Intro line', type: 'text', rows: 2 }),
      defineField({ name: 'image', title: 'Header photo', type: 'image', options: { hotspot: true }, description: 'Wide photo; shown on the right, fading into the dark background' }),
    ],
  });

export const siteContent = defineType({
  name: 'siteContent',
  title: 'Site content',
  type: 'document',
  groups: [
    { name: 'notice', title: 'Maintenance notice' },
    { name: 'contact', title: 'Contact & branches', default: true },
    { name: 'logos', title: 'Partners & clients' },
    { name: 'home', title: 'Home' },
    { name: 'about', title: 'About' },
    { name: 'services', title: 'Services' },
    { name: 'awards', title: 'Awards' },
    { name: 'faq', title: 'Buying FAQ' },
    { name: 'esg', title: 'CSR' },
    { name: 'support', title: 'Support' },
    { name: 'footer', title: 'Footer' },
    { name: 'events', title: 'Events photos' },
    { name: 'photos', title: 'Photos' },
    { name: 'headers', title: 'Page headers' },
  ],
  fields: [
    defineField({
      name: 'contact',
      type: 'object',
      group: 'contact',
      fields: [
        defineField({ name: 'phone', title: 'Phone (also WhatsApp)', type: 'string', description: 'e.g. +233 53 339 2863', validation: (r) => r.required() }),
        defineField({ name: 'info', title: 'General email', type: 'string' }),
        defineField({ name: 'sales', title: 'Sales email', type: 'string' }),
        defineField({ name: 'support', title: 'Support email', type: 'string' }),
        defineField({ name: 'address', type: 'string' }),
        defineField({ name: 'lat', title: 'Head office latitude', type: 'number' }),
        defineField({ name: 'lng', title: 'Head office longitude', type: 'number' }),
        defineField({ name: 'mapEmbed', title: 'Google Maps embed link', type: 'url', description: 'Google Maps → Share → Embed a map → copy the src link' }),
      ],
    }),
    defineField({
      name: 'signInPhones',
      title: 'Numbers on the hospital sign-in page',
      type: 'array',
      group: 'contact',
      // No longer shown (Nov 2026: the sign-in page was kept to the form); hidden so it doesn't look like it does something
      hidden: true,
      description: 'Extra numbers hospitals can call, shown under the sign-in form (the main phone number is always shown)',
      of: [defineArrayMember({ type: 'object', name: 'signInPhone', fields: [defineField({ name: 'label', type: 'string', description: 'e.g. Client service, Engineering desk', validation: (r) => r.required() }), defineField({ name: 'phone', type: 'string', description: 'e.g. 024 423 7783', validation: (r) => r.required() })], preview: { select: { title: 'phone', subtitle: 'label' } } })],
    }),
    defineField({
      name: 'branches',
      type: 'array',
      group: 'contact',
      of: [defineArrayMember({ type: 'object', name: 'branch', fields: [defineField({ name: 'name', type: 'string' }), defineField({ name: 'detail', title: 'Where', type: 'string' }), defineField({ name: 'phone', title: 'Phone', type: 'string', description: 'e.g. 020 025 0127' })], preview: { select: { title: 'name', subtitle: 'detail' } } })],
    }),
    defineField({ name: 'technologyPartners', title: 'Technology partners (brands we distribute)', type: 'array', group: 'logos', of: [logo('partner')] }),
    defineField({ name: 'clients', title: 'Clients (logo strip)', type: 'array', group: 'logos', of: [logo('client')] }),
    defineField({
      name: 'hero',
      title: 'Home headline',
      type: 'object',
      group: 'home',
      fields: [
        defineField({ name: 'title', type: 'string', description: 'e.g. Ghana’s No.1' }),
        defineField({ name: 'highlight', type: 'string', description: 'Second line, in green, e.g. Healthcare Company' }),
        defineField({ name: 'lead', title: 'Intro line', type: 'text', rows: 2 }),
      ],
    }),
    defineField({
      name: 'heroMedia',
      title: 'Hero: installation photos and videos',
      type: 'array',
      group: 'home',
      description: 'Shown as slides after the first hero slide. Videos: MP4, short (under 30 seconds) and under 20 MB; they play muted.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'heroSlide',
          fields: [
            defineField({ name: 'image', title: 'Photo', type: 'image', options: { hotspot: true }, description: 'A wide photo (landscape). For a video, the still shown while it loads.' }),
            defineField({ name: 'video', title: 'Video (optional)', type: 'file', options: { accept: 'video/mp4' } }),
            defineField({ name: 'caption', type: 'string', description: 'e.g. Installing a CT scanner', validation: (r) => r.required() }),
            defineField({ name: 'label', type: 'string', description: 'Small line above the caption, e.g. Installation · Accra' }),
          ],
          validation: (r) => r.custom((v: { image?: unknown; video?: unknown } | undefined) => (v?.image || v?.video ? true : 'Add a photo or a video')),
          preview: { select: { title: 'caption', subtitle: 'label', media: 'image' } },
        }),
      ],
    }),
    defineField({ name: 'heroMediaOnly', title: 'Hero: show only these photos and videos', type: 'boolean', group: 'home', initialValue: false, description: 'On: the stock equipment photos are no longer shown in the hero' }),
    defineField({
      name: 'solutions',
      title: 'Our solutions (six pillars)',
      type: 'object',
      group: 'home',
      fields: [
        defineField({ name: 'kicker', title: 'Small label', type: 'string', description: 'e.g. Our solutions' }),
        defineField({ name: 'title', type: 'string', description: 'e.g. Six pillars of' }),
        defineField({ name: 'highlight', type: 'string', description: 'Second line, in green, e.g. medical infrastructure.' }),
        defineField({ name: 'lead', title: 'Intro line', type: 'text', rows: 2 }),
        defineField({
          name: 'items',
          title: 'Pillars',
          type: 'array',
          description: 'Drag to reorder. A pillar without a photo shows a placeholder.',
          of: [
            defineArrayMember({
              type: 'object',
              name: 'pillar',
              fields: [
                defineField({ name: 'title', type: 'string', validation: (r) => r.required() }),
                defineField({ name: 'body', title: 'Text', type: 'text', rows: 2 }),
                defineField({ name: 'points', title: 'Three points', type: 'array', of: [{ type: 'string' }], validation: (r) => r.max(4) }),
                defineField({ name: 'href', title: 'Opens', type: 'string', description: 'e.g. /products?category=medical-consumables or /services' }),
                defineField({ name: 'image', title: 'Photo', type: 'image', options: { hotspot: true } }),
                defineField({ name: 'alt', title: 'Describe the photo', type: 'string' }),
                defineField({ name: 'fit', title: 'Photo style', type: 'string', initialValue: 'cover', options: { list: [{ title: 'Photo filling the frame', value: 'cover' }, { title: 'Product on white (whole product shown)', value: 'contain' }], layout: 'radio' } }),
              ],
              preview: { select: { title: 'title', subtitle: 'body', media: 'image' } },
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'testimonials',
      type: 'array',
      group: 'home',
      of: [defineArrayMember({ type: 'object', name: 'testimonial', fields: [defineField({ name: 'quote', type: 'text', rows: 3 }), defineField({ name: 'name', type: 'string' }), defineField({ name: 'role', type: 'string', description: 'e.g. Medical Director, Lifecare Hospital' }), defineField({ name: 'photo', title: 'Photo of the person', type: 'image', options: { hotspot: true }, description: 'Portrait (head and shoulders), with their permission. A placeholder shows until a photo is added.' })], preview: { select: { title: 'name', subtitle: 'role', media: 'photo' } } })],
    }),
    defineField({
      name: 'purpose',
      title: 'Mission, vision and aim',
      type: 'array',
      group: 'about',
      of: [defineArrayMember({ type: 'object', name: 'statement', fields: [defineField({ name: 'label', type: 'string', options: { list: ['Mission', 'Vision', 'Aim'] } }), iconField, defineField({ name: 'text', type: 'text', rows: 3 })], preview: { select: { title: 'label', subtitle: 'text' } } })],
    }),
    defineField({ name: 'coreValues', title: 'Core values', type: 'array', group: 'about', of: [textItem('value', 'Value')] }),
    // Not shown since the About page was redesigned: hidden so it doesn't look like it does something
    defineField({ name: 'servicesInBrief', title: 'Our services (About page)', type: 'array', group: 'about', hidden: true, of: [textItem('service', 'Service')] }),
    defineField({ name: 'ceo', title: 'CEO', type: 'object', group: 'about', fields: [defineField({ name: 'name', type: 'string' }), defineField({ name: 'role', type: 'string' }), defineField({ name: 'bio', title: 'Biography paragraphs', type: 'array', of: [{ type: 'text' }] })] }),
    defineField({
      name: 'engineering',
      title: 'Engineering department',
      type: 'object',
      group: 'services',
      description: 'A photo section on the Services page; it appears once there is at least one photo',
      fields: [
        defineField({ name: 'title', type: 'string', description: 'e.g. Our engineering department' }),
        defineField({ name: 'lead', title: 'Intro line', type: 'text', rows: 2 }),
        defineField({ name: 'photos', type: 'array', of: [photo], options: { layout: 'grid' } }),
      ],
    }),
    // Not shown on the site any more: hidden
    defineField({ name: 'whyChoose', title: 'Why choose Flokefama', type: 'array', group: 'services', hidden: true, of: [textItem('reason', 'Reason', 'body')] }),
    defineField({
      name: 'awards',
      type: 'array',
      group: 'awards',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'award',
          fields: [
            defineField({ name: 'title', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'year', type: 'string' }),
            defineField({ name: 'body', title: 'Text', type: 'text', rows: 2 }),
            defineField({ name: 'image', title: 'Photo of the award', type: 'image' }),
            defineField({ name: 'alt', title: 'Photo description', type: 'string' }),
          ],
          preview: { select: { title: 'title', subtitle: 'year', media: 'image' } },
        }),
      ],
    }),
    defineField({
      name: 'faqs',
      title: 'Questions',
      type: 'array',
      group: 'faq',
      of: [defineArrayMember({ type: 'object', name: 'faq', fields: [defineField({ name: 'q', title: 'Question', type: 'string' }), defineField({ name: 'a', title: 'Answer', type: 'text', rows: 3 }), defineField({ name: 'linkLabel', title: 'Link text (optional)', type: 'string' }), defineField({ name: 'linkHref', title: 'Link address (optional)', type: 'string', description: 'e.g. /quote' })], preview: { select: { title: 'q', subtitle: 'a' } } })],
    }),
    defineField({
      name: 'kpone',
      title: 'CSR: Kpone Hospital refurbishment',
      type: 'object',
      group: 'esg',
      description: 'More photos and a video for the Kpone Hospital section of the CSR page. They are added after the four photos already there.',
      fields: [
        defineField({ name: 'photos', title: 'More photos', type: 'array', of: [photo], options: { layout: 'grid' }, description: 'Landscape photos look best. Drag to reorder.' }),
        defineField({ name: 'video', title: 'Video (optional)', type: 'file', options: { accept: 'video/mp4' }, description: 'MP4, under 50 MB. Shown above the photos; visitors press play.' }),
        defineField({ name: 'videoPoster', title: 'Video cover photo', type: 'image', options: { hotspot: true }, description: 'The still shown before the video plays (landscape).' }),
      ],
    }),
    // ── The pages' wording (lib/page-text.ts). Every field starts empty and the website shows its own wording until one is
    //    filled in; **double stars** make words bold.
    defineField({
      name: 'homeText',
      title: 'Home page wording',
      type: 'object',
      group: 'home',
      description: 'Leave a field empty to keep the website’s own wording. Put **double stars** around words to show them in bold. The two big numbers come from Figures (left menu).',
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({ name: 'highlightValue', title: 'Third figure: value', type: 'string', description: 'Default: No.1' }),
        defineField({ name: 'highlightLabel', title: 'Third figure: label', type: 'string', description: 'Default: Healthcare sector, Ghana Club 100 (followed by a link to Awards)' }),
        defineField({ name: 'whatWeDoTitle', title: '“What we do”: heading', type: 'string' }),
        defineField({ name: 'whatWeDoBody', title: '“What we do”: text', type: 'text', rows: 4 }),
        defineField({ name: 'videoTitle', title: 'Video section: title', type: 'string', description: 'Default: Healthcare Solutions in Action' }),
        defineField({ name: 'videoLead', title: 'Video section: line under the title', type: 'text', rows: 2 }),
        defineField({ name: 'purposeTitle', title: 'Mission, vision & aim: heading', type: 'string', description: 'Default: Why we do what we do' }),
        defineField({ name: 'purposeLead', title: 'Mission, vision & aim: line under the heading', type: 'text', rows: 2 }),
        defineField({ name: 'ctaTitle', title: 'Closing green band: heading', type: 'string' }),
        defineField({ name: 'ctaLead', title: 'Closing green band: text', type: 'text', rows: 2 }),
      ],
    }),
    defineField({
      name: 'aboutText',
      title: 'About page wording',
      type: 'object',
      group: 'about',
      description: 'Leave a field empty to keep the website’s own wording. **Double stars** make words bold.',
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({ name: 'introTitle', title: 'Opening heading', type: 'string', description: 'Default: Redefining healthcare delivery in Ghana and across Africa.' }),
        defineField({ name: 'introParagraphs', title: 'Opening paragraphs', type: 'array', of: [{ type: 'text', rows: 3 }], description: 'Shown beside the head office photo. Empty: the website’s three paragraphs.' }),
        defineField({ name: 'officeCaption', title: 'Head office photo caption', type: 'string', description: 'Default: Head office · Santa Maria, Accra' }),
        defineField({ name: 'valuesTitle', title: 'Core values: heading', type: 'string', description: 'Default: The principles that define who we are.' }),
        defineField({ name: 'valuesLead', title: 'Core values: text beside the heading', type: 'text', rows: 3 }),
      ],
    }),
    defineField({
      name: 'supportText',
      title: 'Support page wording',
      type: 'object',
      group: 'support',
      description: 'Leave a field empty to keep the website’s own wording. The phone number comes from Contact & branches.',
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({ name: 'callKicker', title: 'Call centre: small label', type: 'string', description: 'Default: Client service · 24/7 call centre' }),
        defineField({ name: 'callTitle', title: 'Call centre: heading', type: 'string', description: 'Default: We answer around the clock' }),
        defineField({
          name: 'callPoints',
          title: 'Call centre: the two boxes',
          type: 'array',
          validation: (r) => r.max(2),
          of: [defineArrayMember({ type: 'object', name: 'point', fields: [defineField({ name: 'title', type: 'string', validation: (r) => r.required() }), defineField({ name: 'text', type: 'text', rows: 2, validation: (r) => r.required() })], preview: { select: { title: 'title', subtitle: 'text' } } })],
        }),
        defineField({ name: 'helplineLabel', title: 'Helpline box: small label', type: 'string', description: 'Default: Client helpline · open 24/7' }),
        defineField({ name: 'servicesTitle', title: 'Engineering services: heading', type: 'string', description: 'Default: What we do' }),
        defineField({ name: 'servicesLead', title: 'Engineering services: text beside the heading', type: 'text', rows: 2 }),
        defineField({ name: 'featuredService', title: 'Engineering services: the large dark card', type: 'object', fields: [defineField({ name: 'title', type: 'string' }), defineField({ name: 'text', type: 'text', rows: 3 })] }),
        defineField({
          name: 'services',
          title: 'Engineering services: the other cards',
          type: 'array',
          description: 'Each with an icon (e.g. fi-rr-shield-check), a title and a line of text. Empty: the website’s four.',
          of: [defineArrayMember({ type: 'object', name: 'service', fields: [defineField({ ...icon, validation: (r) => r.required().regex(/^fi-rr-[a-z0-9-]+$/) }), defineField({ name: 'title', type: 'string', validation: (r) => r.required() }), defineField({ name: 'text', type: 'text', rows: 2, validation: (r) => r.required() })], preview: { select: { title: 'title', subtitle: 'text' } } })],
        }),
      ],
    }),
    defineField({
      name: 'csrText',
      title: 'CSR page wording',
      type: 'object',
      group: 'esg',
      description: 'Leave a field empty to keep the website’s own wording. Project photos stay as they are (Kpone’s extra photos and video are below).',
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({ name: 'introTitle', title: 'Opening heading', type: 'string', description: 'Default: Giving back to the people behind Ghana’s healthcare' }),
        defineField({ name: 'introLead', title: 'Opening text', type: 'text', rows: 2 }),
        defineField({
          name: 'commitments',
          title: 'Our commitment (the three boxes)',
          type: 'array',
          description: 'Empty: the website’s three (Giving back value, Empowering individuals, Bringing hope & care).',
          of: [defineArrayMember({ type: 'object', name: 'commitment', fields: [defineField({ name: 'label', title: 'Small label', type: 'string', validation: (r) => r.required() }), defineField({ ...icon, validation: (r) => r.required().regex(/^fi-rr-[a-z0-9-]+$/) }), defineField({ name: 'title', type: 'string', validation: (r) => r.required() }), defineField({ name: 'text', type: 'text', rows: 3, validation: (r) => r.required() })], preview: { select: { title: 'title', subtitle: 'label' } } })],
        }),
        defineField({
          name: 'forbes',
          title: 'Forbes Africa section',
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Small label', type: 'string' }),
            defineField({ name: 'title', title: 'Heading', type: 'string' }),
            defineField({ name: 'points', title: 'The three points', type: 'array', of: [defineArrayMember({ type: 'object', name: 'point', fields: [defineField({ name: 'title', type: 'string', validation: (r) => r.required() }), defineField({ name: 'text', type: 'text', rows: 2, validation: (r) => r.required() })], preview: { select: { title: 'title', subtitle: 'text' } } })] }),
          ],
        }),
        defineField({
          name: 'projects',
          title: 'Projects: label, heading and text',
          type: 'array',
          description: 'Pick a project and fill in only what should change.',
          of: [
            defineArrayMember({
              type: 'object',
              name: 'projectText',
              fields: [
                defineField({
                  name: 'project',
                  type: 'string',
                  validation: (r) => r.required(),
                  options: {
                    list: [
                      { title: 'Kpone Hospital refurbishment', value: 'kpone' },
                      { title: 'Pentecost Hospital CSSD', value: 'pentecost' },
                      { title: 'Korle Bu Blood Bank', value: 'korle-bu' },
                      { title: 'UGMC neonatal incubators', value: 'ugmc' },
                      { title: 'The Trust Hospital', value: 'trust-hospital' },
                      { title: 'Women in engineering', value: 'engineering' },
                    ],
                  },
                }),
                defineField({ name: 'label', title: 'Small label', type: 'string' }),
                defineField({ name: 'title', title: 'Heading', type: 'string' }),
                defineField({ name: 'text', title: 'Text', type: 'text', rows: 3 }),
              ],
              preview: { select: { title: 'project', subtitle: 'title' } },
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'footerText',
      title: 'Footer wording',
      type: 'object',
      group: 'footer',
      description: 'Leave a field empty to keep the website’s own wording.',
      fields: [
        defineField({ name: 'statement', title: 'Statement under the logo', type: 'text', rows: 3 }),
        defineField({ name: 'tagline', title: 'Bold line', type: 'string', description: 'Default: Ghana’s No.1 healthcare company.' }),
        defineField({ name: 'honours', title: 'Line at the very bottom', type: 'string', description: 'Default: Ghana Club 100 · Forbes Africa · Mindray Best in IVD' }),
      ],
    }),
    defineField({
      name: 'esgPillars',
      title: 'ESG pillars',
      type: 'array',
      group: 'esg',
      // Replaced by the CSR page's projects (Nov 2026): hidden
      hidden: true,
      of: [
        defineArrayMember({
          type: 'object',
          name: 'pillar',
          fields: [
            defineField({ name: 'label', type: 'string', description: 'e.g. Social · Community' }),
            iconField,
            defineField({ name: 'title', type: 'string' }),
            defineField({ name: 'body', title: 'Text', type: 'text', rows: 3 }),
            defineField({ name: 'image', type: 'image', options: { hotspot: true } }),
            defineField({ name: 'alt', title: 'Photo description', type: 'string' }),
          ],
          preview: { select: { title: 'title', subtitle: 'label', media: 'image' } },
        }),
      ],
    }),
    defineField({ name: 'photoWhatWeDo', title: 'Home: “What we do” photo', type: 'image', group: 'photos', options: { hotspot: true }, description: 'Landscape (4:3)' }),
    defineField({ name: 'photoOffice', title: 'About: head office photo', type: 'image', group: 'photos', options: { hotspot: true }, description: 'Landscape (4:3); also behind the Leadership heading' }),
    defineField({ name: 'photoCeo', title: 'About: CEO portrait', type: 'image', group: 'photos', options: { hotspot: true }, description: 'Portrait (4:5)' }),
    defineField({
      name: 'eventAlbums',
      title: 'Event photo albums',
      type: 'array',
      group: 'events',
      description: 'Shown as “Event photos” on the Events page, newest album first as listed here',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'album',
          fields: [
            defineField({ name: 'title', type: 'string', description: 'e.g. Floke Praise 2026', validation: (r) => r.required() }),
            defineField({ name: 'date', type: 'date' }),
            defineField({ name: 'photos', type: 'array', of: [photo], options: { layout: 'grid' } }),
          ],
          preview: { select: { title: 'title', subtitle: 'date', media: 'photos.0' } },
        }),
      ],
    }),
    defineField({
      name: 'maintenance',
      title: 'Maintenance notice',
      type: 'object',
      group: 'notice',
      description: 'The green strip across the top of every page. Turn it on while you work on parts of the website, then Publish; turn it off and Publish again when you are done. The site updates within a minute.',
      fields: [
        defineField({ name: 'show', title: 'Show the notice', type: 'boolean', initialValue: true, description: 'On: the strip shows on every page. Off: it is hidden and the pages move up to fill its place.' }),
        defineField({ name: 'title', title: 'Heading', type: 'string', description: 'e.g. Website Under Maintenance. Empty: the standard heading.', validation: (r) => r.max(40) }),
        defineField({ name: 'message', title: 'Message (computers)', type: 'string', description: 'One short sentence. Empty: the standard message.', validation: (r) => r.max(110) }),
        defineField({ name: 'short', title: 'Message (phones)', type: 'string', description: 'Phones show only this (with the icon and the link), not the heading or the message above. Keep it to about 40 characters, or about 30 with a link. Empty: the standard one.', validation: (r) => r.max(70) }),
        defineField({
          name: 'icon',
          title: 'Icon',
          type: 'string',
          initialValue: 'fi-rr-tools',
          description: 'Shown before the heading. Empty: the tools icon.',
          // The same list as src/lib/notice.ts (the website only shows icons from it)
          options: {
            list: [
              { value: 'none', title: 'No icon' },
              { value: 'fi-rr-tools', title: 'Tools (maintenance)' },
              { value: 'fi-rr-info', title: 'Information' },
              { value: 'fi-rr-megaphone', title: 'Announcement' },
              { value: 'fi-rr-triangle-warning', title: 'Warning' },
              { value: 'fi-rr-calendar', title: 'Calendar (event)' },
              { value: 'fi-rr-clock', title: 'Clock (opening hours)' },
              { value: 'fi-rr-phone-call', title: 'Phone' },
              { value: 'fi-rr-truck-side', title: 'Delivery' },
              { value: 'fi-rr-gift', title: 'Gift (offer)' },
              { value: 'fi-rr-party-horn', title: 'Celebration' },
              { value: 'fi-rr-heart', title: 'Heart' },
              { value: 'fi-rr-star', title: 'Star' },
              { value: 'fi-rr-shield-check', title: 'Shield (security)' },
              { value: 'fi-rr-stethoscope', title: 'Stethoscope' },
            ],
          },
        }),
        defineField({
          name: 'colour',
          title: 'Colour',
          type: 'string',
          initialValue: 'green',
          options: {
            list: [
              { value: 'green', title: 'Flokefama green' },
              { value: 'red', title: 'Red (urgent)' },
              { value: 'dark', title: 'Dark' },
              { value: 'gold', title: 'Gold' },
              { value: 'blue', title: 'Blue' },
            ],
            layout: 'radio',
            direction: 'horizontal',
          },
        }),
        defineField({ name: 'linkLabel', title: 'Link text (optional)', type: 'string', description: 'e.g. Call us, Read more. Shown at the end of the strip.', validation: (r) => r.max(24) }),
        defineField({
          name: 'linkHref',
          title: 'Link goes to (optional)',
          type: 'string',
          description: 'A page on the site (/support), a web address (https://…), a phone number (tel:+233533392863) or an email (mailto:info@flokefama.com).',
          validation: (r) =>
            r.custom((v) => {
              const h = String(v ?? '').trim();
              if (!h) return true;
              return /^\/(?!\/)/.test(h) || /^https?:\/\/\S+$/i.test(h) || /^tel:\+?[\d\s-]{6,}$/i.test(h) || /^mailto:[^\s@]+@[^\s@]+$/i.test(h)
                ? true
                : 'Use a page (/support), https://…, tel:… or mailto:…';
            }),
        }),
      ],
      preview: { select: { show: 'show', title: 'title' }, prepare: ({ show, title }) => ({ title: `${show === false ? 'Off' : 'On'}: ${title || 'Website Under Maintenance'}` }) },
    }),
    defineField({
      name: 'pageHeaders',
      title: 'Page headers',
      type: 'object',
      group: 'headers',
      description: 'The dark banner at the top of each page. Leave a field empty to keep the current text or photo.',
      fields: [
        header('about', 'About'),
        header('services', 'Products & Services'),
        header('shop', 'Shop (use {count} for the number of products)'),
        header('events', 'Events & Activities'),
        header('awards', 'Awards'),
        header('esg', 'CSR'),
        header('contact', 'Contact'),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: 'Site content' }) },
});

export const schemaTypes = [category, product, event, article, metric, milestone, siteContent];
