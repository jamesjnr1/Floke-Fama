import type { Instrumentation } from 'next';

/**
 * Every error in the site's own code (pages, portals, APIs, background jobs) is recorded for Site health in the admin
 * console (lib/monitor.ts), and the admins are emailed the first time a new kind of error appears. Only on the
 * Node.js runtime: the database client doesn't run in the edge runtime.
 */
export const onRequestError: Instrumentation.onRequestError = async (error, request) => {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { recordError } = await import('./lib/monitor');
    const err = error as Error & { digest?: string };
    await recordError({ message: `${err.name && err.name !== 'Error' ? `${err.name}: ` : ''}${err.message}`, path: request.path, source: 'server', digest: err.digest });
  }
};
