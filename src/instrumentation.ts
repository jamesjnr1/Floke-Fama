import type { Instrumentation } from 'next';
import { after } from 'next/server';
import { SeverityNumber } from '@opentelemetry/api-logs';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { BatchLogRecordProcessor, LoggerProvider } from '@opentelemetry/sdk-logs';

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

// This provider is deliberately not registered globally: only log records emitted through emitPostHogLog leave the app.
export const posthogLoggerProvider = process.env.NEXT_RUNTIME === 'nodejs' && posthogKey && posthogHost
  ? new LoggerProvider({
      resource: resourceFromAttributes({ 'service.name': 'flokefama-web' }),
      processors: [
        new BatchLogRecordProcessor({
          exporter: new OTLPLogExporter({
            url: `${posthogHost}/i/v1/logs`,
            headers: {
              Authorization: `Bearer ${posthogKey}`,
              'Content-Type': 'application/json',
            },
          }),
        }),
      ],
    })
  : null;

if (!posthogLoggerProvider && process.env.NEXT_RUNTIME === 'nodejs' && process.env.NODE_ENV !== 'production') {
  if (!posthogKey) console.warn('NEXT_PUBLIC_POSTHOG_KEY variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once NEXT_PUBLIC_POSTHOG_KEY is configured');
  if (!posthogHost) console.warn('NEXT_PUBLIC_POSTHOG_HOST variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once NEXT_PUBLIC_POSTHOG_HOST is configured');
}

/** Emits only purpose-written, safe structured logs through the isolated PostHog exporter. */
export function emitPostHogLog(body: string, attributes: Record<string, string | number | boolean>) {
  const provider = posthogLoggerProvider;
  if (!provider) return;
  provider.getLogger('flokefama-posthog').emit({
    body,
    severityNumber: SeverityNumber.INFO,
    attributes,
  });
  after(() => provider.forceFlush().catch(() => {}));
}

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
