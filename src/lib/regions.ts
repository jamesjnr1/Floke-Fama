/**
 * Ghana's 16 regions, and how the service desk works out where a hospital or an engineer is: an engineer chooses
 * their region when they register (kept on their account as “Flokefama · Ashanti”), and a hospital's region is
 * read from its orders or, failing that, from the towns in its name or address.
 */
export const regions = [
  'Greater Accra', 'Ashanti', 'Central', 'Eastern', 'Western', 'Western North', 'Volta', 'Oti',
  'Northern', 'Savannah', 'North East', 'Upper East', 'Upper West', 'Bono', 'Bono East', 'Ahafo',
] as const;
export type Region = (typeof regions)[number];

/** An engineer's region, from their account's organisation (“Flokefama · Ashanti” → Ashanti). */
export const regionOfOrganisation = (org: string | undefined): Region | undefined => {
  const r = org?.split('·')[1]?.trim();
  return regions.find((x) => x.toLowerCase() === r?.toLowerCase());
};
export const engineerOrganisation = (region: string) => `Flokefama · ${region}`;

/** Towns and cities to the region they are in (lower case). */
const towns: [RegExp, Region][] = [
  [/\b(accra|tema|madina|kasoa\s*\(accra\)|korle[\s-]?bu|ridge|legon|lekma|teshie|nungua|adenta|dansoman|achimota|kwashieman|santa maria|okaishie|ashaiman|dodowa|weija|east legon|airport|osu|labadi|la\b|mamprobi|kaneshie|lapaz|spintex|ga east|ga west|ga south)\b/i, 'Greater Accra'],
  [/\b(kumasi|komfo anokye|kath|obuasi|ejisu|mampong|konongo|bekwai|offinso|agogo|ejura|asante|ashanti)\b/i, 'Ashanti'],
  [/\b(cape coast|winneba|kasoa|mankessim|saltpond|elmina|swedru|dunkwa|assin|twifo|central region)\b/i, 'Central'],
  [/\b(koforidua|nkawkaw|akim|oda|suhum|nsawam|somanya|akuse|akosombo|kibi|kyebi|asamankese|begoro|eastern region)\b/i, 'Eastern'],
  [/\b(takoradi|sekondi|tarkwa|axim|prestea|half assini|western region)\b/i, 'Western'],
  [/\b(sefwi|wiawso|bibiani|juaboso|enchi|western north)\b/i, 'Western North'],
  [/\b(ho\b|hohoe|keta|aflao|anloga|kpando|sogakope|akatsi|denu|volta)\b/i, 'Volta'],
  [/\b(dambai|nkwanta|jasikan|kadjebi|krachi|oti)\b/i, 'Oti'],
  [/\b(tamale|yendi|savelugu|bimbilla|tolon|northern region)\b/i, 'Northern'],
  [/\b(damongo|salaga|bole|sawla|savannah)\b/i, 'Savannah'],
  [/\b(nalerigu|gambaga|walewale|north east)\b/i, 'North East'],
  [/\b(bolgatanga|bolga|bawku|navrongo|zebilla|upper east)\b/i, 'Upper East'],
  [/\b(wa\b|lawra|tumu|jirapa|nadowli|upper west)\b/i, 'Upper West'],
  [/\b(sunyani|dormaa|berekum|wenchi|bono region)\b/i, 'Bono'],
  [/\b(techiman|kintampo|atebubu|nkoranza|yeji|bono east)\b/i, 'Bono East'],
  [/\b(goaso|bechem|duayaw|kenyasi|hwidiem|ahafo)\b/i, 'Ahafo'],
];

/** The region named in some text (a hospital's name, a department, an address), if any. */
export function regionInText(...texts: (string | undefined)[]): Region | undefined {
  const t = texts.filter(Boolean).join(' ');
  if (!t) return;
  return towns.find(([re]) => re.test(t))?.[1];
}
