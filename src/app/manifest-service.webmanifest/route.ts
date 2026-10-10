import { NextResponse } from 'next/server';

/**
 * The engineer portal as its own installable app ("Flokefama Service"): added to the home screen it opens
 * straight into /engineer, and on iPhone it is what allows alerts. Served outside /engineer, because the
 * browser fetches manifests without the sign-in cookie.
 */
export const dynamic = 'force-static';

export function GET() {
  return NextResponse.json(
    {
      name: 'Flokefama Service',
      short_name: 'FF Service',
      description: 'Biomedical Engineer Service Portal: service requests, equipment and calibration.',
      id: '/engineer',
      start_url: '/engineer',
      scope: '/',
      display: 'standalone',
      background_color: '#f5f6f4',
      theme_color: '#16232a',
      icons: [
        { src: '/images/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: '/images/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: '/images/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    { headers: { 'Content-Type': 'application/manifest+json' } },
  );
}
