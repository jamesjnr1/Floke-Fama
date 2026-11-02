import { config } from 'zod';

/**
 * Form checks (zod) in the browser run without generating code at run time. Zod otherwise tests whether it may
 * (`Function("")`), which the Content-Security-Policy (next.config.ts) blocks and reports on every page; checks
 * work the same either way. Imported by a component every page loads (components/layout/motion-provider.tsx) and,
 * first of all, by any file whose schemas run in the browser (lib/support-schema.ts), so it applies before they are made.
 */
config({ jitless: true });
