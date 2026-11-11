'use client';

import { createContext, useContext, useEffect, type ReactNode } from 'react';
import posthog from 'posthog-js';
import { defaultSite, type SiteContent } from '@/lib/site-content';

const SiteContext = createContext<SiteContent>(defaultSite);

/** Makes the site content (from Sanity, see lib/site.ts) available to components that run in the browser. */
export function SiteProvider({ value, children }: { value: SiteContent; children: React.ReactNode }) {
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

/** Contact details, branches, logos and the rest of the site content, in browser components. */
export const useSite = () => useContext(SiteContext);

type AnalyticsUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  facility?: string;
};

/** Identifies an authenticated user once when their verified server session reaches the browser. */
export function PostHogIdentity({ user }: { user: AnalyticsUser | null }) {
  useEffect(() => {
    if (!user) {
      if (posthog.get_property('$user_id')) posthog.reset();
      return;
    }
    posthog.identify(user.id, {
      email: user.email,
      name: user.name,
      role: user.role,
      facility: user.facility,
    });
  }, [user]);

  return null;
}

/** Resets the browser identity before a server action signs the current user out. */
export function PostHogLogoutForm({ action, children, className }: { action: (formData: FormData) => void | Promise<void>; children: ReactNode; className?: string }) {
  return <form action={action} className={className} onSubmit={() => posthog.reset()}>{children}</form>;
}
