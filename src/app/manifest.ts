import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Flokefama',
    short_name: 'Flokefama',
    description: 'Medical equipment, diagnostics and biomedical support across Ghana.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f7f8f7',
    theme_color: '#003223',
    icons: [{ src: '/images/favicon.png', sizes: '60x60', type: 'image/png' }],
  };
}
