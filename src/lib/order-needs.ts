/** What checkout asks about an order besides delivery: the department it is for and how soon it is needed. */
export const departments = [
  { id: 'laboratory', label: 'Laboratory' },
  { id: 'icu', label: 'ICU / Critical care' },
  { id: 'theatre', label: 'Theatre' },
  { id: 'maternity', label: 'Maternity' },
  { id: 'opd', label: 'OPD / Clinic' },
  { id: 'cssd', label: 'Sterile services' },
] as const;

export const timelines = [
  { id: 'urgent', label: 'Urgent', detail: 'Within 2 weeks' },
  { id: 'quarter', label: 'This quarter', detail: '1–3 months' },
  { id: 'planning', label: 'Planning', detail: 'Budgeting / tender' },
] as const;

export type Timeline = (typeof timelines)[number]['id'];
export const departmentLabel = (id?: string) => departments.find((d) => d.id === id)?.label;
export const timelineLabel = (id?: string) => {
  const t = timelines.find((x) => x.id === id);
  return t && `${t.label} (${t.detail.toLowerCase()})`;
};
