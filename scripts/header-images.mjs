// Makes the phone copy (`-m.webp`) of each header photo: at most 1000 px tall (900 px wide for upright photos),
// more compressed. Run: npm run header-images, then list any new photo in phoneCopies (src/lib/header-image.ts).
import fs from 'node:fs';
import sharp from 'sharp';

const files = [
  ...fs.readdirSync('public/images/headers').filter((f) => f.endsWith('.webp') && !f.endsWith('-m.webp')).map((f) => `public/images/headers/${f}`),
  'public/images/awards/ghana-club-100-trophy.webp',
  'public/images/news/flokefama-supports-zodf-ramadan-distribution-programme-cover.webp',
  'public/images/news/quality-verification-the-cornerstone-of-healthcare-excellence-in-ghana-1.webp',
  'public/images/news/quality-verification-the-cornerstone-of-healthcare-excellence-in-ghana-cover.webp',
];
for (const f of files) {
  const { width, height } = await sharp(f).metadata();
  const out = f.replace(/\.webp$/, '-m.webp');
  await sharp(f).resize(height > width ? { width: 900 } : { height: 1000, withoutEnlargement: true }).webp({ quality: 64, effort: 6 }).toFile(out);
  console.log(`${f} -> ${out}`);
}
