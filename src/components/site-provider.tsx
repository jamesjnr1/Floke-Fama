'use client';

import { createContext, useContext } from 'react';
import { defaultSite, type SiteContent } from '@/lib/site-content';

const SiteContext = createContext<SiteContent>(defaultSite);

/** Makes the site content (from Sanity, see lib/site.ts) available to components that run in the browser. */
export function SiteProvider({ value, children }: { value: SiteContent; children: React.ReactNode }) {
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

/** Contact details, branches, logos and the rest of the site content, in browser components. */
export const useSite = () => useContext(SiteContext);
