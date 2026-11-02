import { config } from 'zod';

/**
 * Form checks (zod) in the browser run without generating code at run time. Zod otherwise tests whether it may
 * (`Function("")`), which the Content-Security-Policy (next.config.ts) blocks and reports on every page; checks
 * work the same either way. Imported once by a component every page loads (components/layout/motion-provider.tsx).
 */
config({ jitless: true });
