'use client';

/**
 * Checks an engineer's photo on their own device before it is saved (nothing is sent anywhere to check it):
 * - exactly one face, found by a face-detection model (MediaPipe BlazeFace: the engine is loaded from the
 *   jsDelivr library network, the small model from this site, /face);
 * - the face large enough in the circle, not cut off;
 * - sharp (not blurred) and neither too dark nor washed out.
 * Returns null when the photo is fine, or what to fix, in plain words.
 */
type Detector = { detect: (img: HTMLCanvasElement) => { detections: { boundingBox?: { originX: number; originY: number; width: number; height: number }; categories: { score: number }[] }[] } };

let detector: Promise<Detector> | null = null;
function loadDetector() {
  detector ??= (async () => {
    const { FilesetResolver, FaceDetector } = await import('@mediapipe/tasks-vision');
    const vision = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.1/wasm');
    return (await FaceDetector.createFromOptions(vision, {
      baseOptions: { modelAssetPath: '/face/blaze_face_short_range.tflite', delegate: 'CPU' },
      runningMode: 'IMAGE',
      minDetectionConfidence: 0.5,
    })) as unknown as Detector;
  })().catch((e) => {
    detector = null; // try again next time
    throw e;
  });
  return detector;
}
/** Starts loading the face check early (when the photo box opens), so it is ready by the time a photo is chosen. */
export const warmUpPhotoCheck = () => void loadDetector().catch(() => {});

/** Sharpness: how much the brightness changes from pixel to pixel (variance of the Laplacian), and the average brightness. */
function sharpnessAndLight(canvas: HTMLCanvasElement, box: { x: number; y: number; w: number; h: number }) {
  const W = 160;
  const H = Math.max(1, Math.round((box.h / box.w) * W));
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(canvas, box.x, box.y, box.w, box.h, 0, 0, W, H);
  const d = ctx.getImageData(0, 0, W, H).data;
  const g = new Float32Array(W * H);
  let sum = 0;
  for (let i = 0; i < W * H; i++) {
    g[i] = 0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2];
    sum += g[i];
  }
  let n = 0;
  let mean = 0;
  let m2 = 0;
  for (let y = 1; y < H - 1; y++)
    for (let x = 1; x < W - 1; x++) {
      const i = y * W + x;
      const lap = g[i - 1] + g[i + 1] + g[i - W] + g[i + W] - 4 * g[i];
      n++;
      const delta = lap - mean;
      mean += delta / n;
      m2 += delta * (lap - mean);
    }
  return { sharpness: n > 1 ? m2 / (n - 1) : 0, light: sum / (W * H) };
}

export async function checkPhoto(canvas: HTMLCanvasElement, sourceShortSide: number): Promise<string | null> {
  if (sourceShortSide < 240) return 'This photo is too small to be clear. Use a photo taken with your phone’s camera.';
  let found;
  try {
    found = (await loadDetector()).detect(canvas).detections.filter((f) => (f.categories[0]?.score ?? 0) >= 0.6 && f.boundingBox);
  } catch {
    return 'We couldn’t check your photo. Check your internet connection and try again.';
  }
  if (found.length === 0) return 'We can’t see a face. Use a clear photo of your face, looking at the camera.';
  if (found.length > 1) return 'Only you should be in the photo.';
  const b = found[0].boundingBox!;
  const size = canvas.width;
  if (b.width < size * 0.28) return 'Your face is too small. Zoom in or move closer so your face fills the circle.';
  const cx = b.originX + b.width / 2;
  const cy = b.originY + b.height / 2;
  if (Math.hypot(cx - size / 2, cy - size / 2) > size * 0.25 || b.originX < 0 || b.originY < 0 || b.originX + b.width > size || b.originY + b.height > size)
    return 'Move the photo so your whole face is in the middle of the circle.';
  const { sharpness, light } = sharpnessAndLight(canvas, { x: Math.max(0, b.originX), y: Math.max(0, b.originY), w: Math.min(b.width, size - Math.max(0, b.originX)), h: Math.min(b.height, size - Math.max(0, b.originY)) });
  if (light < 55) return 'This photo is too dark. Take one facing a window or a light.';
  if (light > 225) return 'This photo is too bright. Move out of direct light and try again.';
  if (sharpness < 25) return 'This photo is blurred. Hold the phone still and take a sharper one.';
  return null;
}
