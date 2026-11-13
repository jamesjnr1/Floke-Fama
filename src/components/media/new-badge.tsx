import { isNew, type Story } from '@/data/site-stories';

/** A small red “New” label in the top corner of a story's photo, for a month from the story's date. */
export function NewBadge({ story }: { story: Story }) {
  if (!isNew(story)) return null;
  return <span className="absolute left-3 top-3 z-10 bg-signal px-2.5 py-1 text-[0.75rem] font-bold uppercase tracking-[0.08em] text-white shadow-[0_6px_16px_-6px_rgb(0_0_0/0.45)]">New</span>;
}
