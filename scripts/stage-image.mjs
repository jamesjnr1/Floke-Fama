// Builds public/images/bs-240-stage.webp from the original BS-240 render:
// removes the white studio background (flood fill from the borders, so white lettering survives),
// recolours the blue light strip to the logo green, and feathers the cropped edges to transparent
// so the machine dissolves into dark sections instead of ending in a hard rectangle.
// Usage: node scripts/stage-image.mjs
import sharp from 'sharp';

const { data, info } = await sharp('public/images/solution-ivd.webp').ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;
const out = Buffer.from(data);
const smooth = (e0, e1, x) => { const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
const light = (i) => { const r = data[i], g = data[i + 1], b = data[i + 2]; return (Math.max(r, g, b) - Math.min(r, g, b) < 40 && (r + g + b) / 3 > 150) || data[i + 3] < 20; };

const bg = new Uint8Array(W * H);
const queue = [];
for (let x = 0; x < W; x++) queue.push(x, (H - 1) * W + x);
for (let y = 0; y < H; y++) queue.push(y * W, y * W + W - 1);
while (queue.length) {
  const p = queue.pop();
  if (bg[p] || !light(p * 4)) continue;
  bg[p] = 1;
  const x = p % W, y = (p / W) | 0;
  if (x > 0) queue.push(p - 1);
  if (x < W - 1) queue.push(p + 1);
  if (y > 0) queue.push(p - W);
  if (y < H - 1) queue.push(p + W);
}

for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const p = y * W + x, i = p * 4;
  let r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
  if (bg[p]) a = Math.round(a * (1 - smooth(150, 235, (r + g + b) / 3)));
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  if (b > r + 20 && b >= g) {
    const k = smooth(18, 70, mx - mn), L = mx / 255;
    r = r * (1 - k) + 70 * L * k; g = g * (1 - k) + 200 * L * k; b = b * (1 - k) + 110 * L * k;
  }
  const fx = Math.min(smooth(0, 0.05, x / W), smooth(0, 0.3, (W - x) / W));
  const fy = Math.min(smooth(0, 0.08, y / H), smooth(0, 0.32, (H - y) / H));
  out[i] = r; out[i + 1] = g; out[i + 2] = b; out[i + 3] = Math.round(a * fx * fy);
}

await sharp(out, { raw: { width: W, height: H, channels: 4 } }).webp({ quality: 90, alphaQuality: 100 }).toFile('public/images/bs-240-stage.webp');
console.log('Wrote public/images/bs-240-stage.webp');
