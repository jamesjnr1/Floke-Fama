import type { StructureResolver } from 'sanity/structure';

/** The Studio's left menu, in the order staff use it. */
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Flokefama')
    .items([
      S.listItem().title('Shop').child(
        S.list().title('Shop').items([
          S.documentTypeListItem('product').title('Products'),
          S.listItem().title('New arrivals').child(S.documentList().title('New arrivals').filter('_type == "product" && newArrival == true')),
          S.documentTypeListItem('category').title('Categories'),
        ]),
      ),
      S.divider(),
      S.listItem().title('Events').child(
        S.list().title('Events').items([
          S.listItem().title('Upcoming').child(S.documentList().title('Upcoming').filter('_type == "event" && date >= now()').defaultOrdering([{ field: 'date', direction: 'asc' }])),
          S.listItem().title('Past').child(S.documentList().title('Past').filter('_type == "event" && date < now()').defaultOrdering([{ field: 'date', direction: 'desc' }])),
        ]),
      ),
      S.documentTypeListItem('article').title('News, Blog & Press'),
      S.divider(),
      S.documentTypeListItem('metric').title('Figures'),
      S.documentTypeListItem('milestone').title('Milestones'),
    ]);
