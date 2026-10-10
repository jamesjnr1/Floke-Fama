// Makes the hero product photos transparent (white → see-through, like Photoshop's "colour to alpha"), so the
// carousel tiles show their own colour behind each machine without CSS blending, which some browsers drop while
// a tile animates and flash the white photo background. Run: node scripts/hero-cutouts.mjs <slug>...
import sharp from 'sharp';

for (const slug of process.argv.slice(2)) {
  const { data, info } = await sharp(`public/images/products/${slug}.webp`).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(info.width * info.height * 4);
  for (let p = 0, q = 0; p < data.length; p += 3, q += 4) {
    const a = Math.max(255 - data[p], 255 - data[p + 1], 255 - data[p + 2]) / 255;
    for (let c = 0; c < 3; c++) out[q + c] = a ? Math.round(255 - (255 - data[p + c]) / a) : 0;
    out[q + 3] = Math.round(a * 255);
  }
  await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } }).webp({ quality: 90, alphaQuality: 100 }).toFile(`public/images/hero/${slug}.webp`);
  console.log('hero cutout:', slug);
}
