/**
 * Hero centrepiece: a capsule drawn in dots (one half brand green, the other mint), turning
 * slowly inside two orbit rings that carry light pulses out to facility nodes, a picture of
 * the medicines and equipment Flokefama distributes. A single red node echoes the logo's dot.
 * Lines and points only (no lights or textures), so it stays cheap on mid-range phones.
 * Loaded lazily in its own chunk. Returns a cleanup function that disposes everything.
 */
import { prefersReducedMotion } from '@/lib/a11y';
import {
  AdditiveBlending, BufferAttribute, BufferGeometry, CanvasTexture, CapsuleGeometry, Color, Group, Line, LineBasicMaterial, Mesh,
  MeshBasicMaterial,
  PerspectiveCamera, Points, PointsMaterial, Scene, Sprite, SpriteMaterial, Vector3, WebGLRenderer,
} from 'three';

const R = 1.05; // capsule radius
const H = 1.15; // half-length of the straight section
const STEP = 0.115; // dot spacing
const GREEN = new Color('#3aa867');
const GREEN_BRIGHT = new Color('#52b57c');
const MINT = new Color('#e6f6ec');
const RED = new Color('#e4283c');

function glowTexture(inner: string) {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, inner);
  grad.addColorStop(0.35, inner.replace('1)', '0.45)'));
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return new CanvasTexture(c);
}

/** Evenly spaced dots on the capsule surface: rings along the body, latitude rings on the caps. */
function capsulePoints() {
  const pts: number[] = [];
  const ring = (y: number, r: number) => {
    const n = Math.max(1, Math.round((Math.PI * 2 * r) / STEP));
    const off = (Math.round(y / STEP) % 2) * 0.5; // stagger alternate rings
    for (let i = 0; i < n; i++) {
      const a = ((i + off) / n) * Math.PI * 2;
      pts.push(Math.cos(a) * r, y, Math.sin(a) * r);
    }
  };
  for (let y = -H; y <= H + 1e-6; y += STEP) ring(y, R);
  const capRings = Math.round((Math.PI / 2) * R / STEP);
  for (let k = 1; k <= capRings; k++) {
    const t = (k / capRings) * (Math.PI / 2);
    ring(H + Math.sin(t) * R, Math.cos(t) * R);
    ring(-H - Math.sin(t) * R, Math.cos(t) * R);
  }
  return new Float32Array(pts);
}

export function mountCapsule(container: HTMLElement, onReady?: () => void): () => void {
  const reduceMotion = prefersReducedMotion();
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  } catch {
    return () => {};
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.domElement.style.cssText = 'width:100%;height:100%;display:block';
  container.appendChild(renderer.domElement);

  const scene = new Scene();
  const camera = new PerspectiveCamera(36, 1, 0.1, 100);
  camera.position.set(0, 0.3, 8.2);
  camera.lookAt(0, 0, 0);
  const tilt = new Group();
  tilt.rotation.z = -0.62; // lie the capsule on a diagonal
  scene.add(tilt);
  const capsule = new Group();
  tilt.add(capsule);
  const disposables: { dispose: () => void }[] = [];

  // 1. Dotted capsule, green over mint, with a brighter seam
  const pos = capsulePoints();
  const count = pos.length / 3;
  const col = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const y = pos[i * 3 + 1];
    const c = y > 0 ? GREEN_BRIGHT : MINT;
    col.set([c.r, c.g, c.b], i * 3);
  }
  const dotGeo = new BufferGeometry();
  dotGeo.setAttribute('position', new BufferAttribute(pos, 3));
  dotGeo.setAttribute('color', new BufferAttribute(col, 3));
  const dotMat = new PointsMaterial({ vertexColors: true, size: 0.04, transparent: true, opacity: 0.9, depthWrite: false });
  capsule.add(new Points(dotGeo, dotMat));
  disposables.push(dotGeo, dotMat);
  // Invisible inner capsule: writes depth only, so dots on the far side are hidden and the form reads as solid
  const occGeo = new CapsuleGeometry(R * 0.97, H * 2, 12, 32);
  const occMat = new MeshBasicMaterial({ colorWrite: false });
  const occluder = new Mesh(occGeo, occMat);
  occluder.renderOrder = -1;
  capsule.add(occluder);
  disposables.push(occGeo, occMat);

  // 2. Faint outline: profile lines around the body and the seam
  const lineMat = new LineBasicMaterial({ color: GREEN, transparent: true, opacity: 0.1, depthWrite: false });
  disposables.push(lineMat);
  // Half silhouette from the bottom pole, up the side, to the top pole
  const profile: Vector3[] = [];
  for (let i = 0; i <= 16; i++) { const a = -Math.PI / 2 + (i / 16) * (Math.PI / 2); profile.push(new Vector3(Math.cos(a) * R, -H + Math.sin(a) * R, 0)); }
  for (let i = 0; i <= 16; i++) { const a = (i / 16) * (Math.PI / 2); profile.push(new Vector3(Math.cos(a) * R, H + Math.sin(a) * R, 0)); }
  const profileGeo = new BufferGeometry().setFromPoints(profile);
  disposables.push(profileGeo);
  for (let i = 0; i < 8; i++) {
    const l = new Line(profileGeo, lineMat);
    l.rotation.y = (i / 8) * Math.PI * 2;
    capsule.add(l);
  }
  const seamGeo = new BufferGeometry().setFromPoints(Array.from({ length: 97 }, (_, k) => {
    const a = (k / 96) * Math.PI * 2;
    return new Vector3(Math.cos(a) * R * 1.02, 0, Math.sin(a) * R * 1.02);
  }));
  const seamMat = new LineBasicMaterial({ color: MINT, transparent: true, opacity: 0.45, depthWrite: false });
  capsule.add(new Line(seamGeo, seamMat));
  disposables.push(seamGeo, seamMat);

  // 3. The logo's red dot: the head office, pulsing on the capsule's seam (placed below)
  const redTex = glowTexture('rgba(228,40,60,1)');
  const redMat = new SpriteMaterial({ map: redTex, transparent: true, blending: AdditiveBlending, depthWrite: false });
  const red = new Sprite(redMat);
  const redCoreGeo = new BufferGeometry().setFromPoints([new Vector3()]);
  const redCoreMat = new PointsMaterial({ color: RED, size: 0.12, transparent: true, depthWrite: false });
  const redCore = new Points(redCoreGeo, redCoreMat);
  disposables.push(redTex, redMat, redCoreGeo, redCoreMat);

  // 4. Two orbit rings with facility nodes and light pulses travelling round them
  const ringMat = new LineBasicMaterial({ color: GREEN, transparent: true, opacity: 0.38, depthWrite: false });
  const nodeMat = new PointsMaterial({ color: MINT, size: 0.09, transparent: true, opacity: 0.95, blending: AdditiveBlending, depthWrite: false });
  const pulseTex = glowTexture('rgba(190,240,210,1)');
  const pulseMat = new PointsMaterial({ map: pulseTex, size: 0.24, transparent: true, blending: AdditiveBlending, depthWrite: false });
  disposables.push(ringMat, nodeMat, pulseTex, pulseMat);
  const PULSES = 3;
  const rings = [
    { radius: 2.75, tilt: [1.2, 0, -0.25], speed: 0.07, nodes: 5 },
    { radius: 3.15, tilt: [-0.55, 0, 0.45], speed: -0.05, nodes: 4 },
  ].map(({ radius, tilt: [x, y, z], speed, nodes }) => {
    const g = new Group();
    g.rotation.set(x, y, z);
    const at = (a: number) => new Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius);
    const ringGeo = new BufferGeometry().setFromPoints(Array.from({ length: 161 }, (_, k) => at((k / 160) * Math.PI * 2)));
    const nodeGeo = new BufferGeometry().setFromPoints(Array.from({ length: nodes }, (_, k) => at((k / nodes) * Math.PI * 2 + 0.4)));
    const pulsePos = new Float32Array(PULSES * 3);
    const pulseGeo = new BufferGeometry();
    pulseGeo.setAttribute('position', new BufferAttribute(pulsePos, 3));
    g.add(new Line(ringGeo, ringMat), new Points(nodeGeo, nodeMat), new Points(pulseGeo, pulseMat));
    disposables.push(ringGeo, nodeGeo, pulseGeo);
    scene.add(g);
    return { g, radius, speed, pulsePos, pulseGeo };
  });
  // On the seam, facing the viewer (in the tilted frame, so it doesn't turn away with the capsule)
  red.position.set(0, 0, R * 1.08);
  redCore.position.copy(red.position);
  tilt.add(red, redCore);

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = container;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();

  const pointer = { x: 0, y: 0 };
  const eased = { x: 0, y: 0 };
  const onPointer = (e: PointerEvent) => {
    pointer.x = (e.clientX / innerWidth) * 2 - 1;
    pointer.y = (e.clientY / innerHeight) * 2 - 1;
  };
  window.addEventListener('pointermove', onPointer, { passive: true });

  const render = (t: number) => {
    eased.x += (pointer.x - eased.x) * 0.04;
    eased.y += (pointer.y - eased.y) * 0.04;
    capsule.rotation.y = t * 0.25; // turn on its long axis
    tilt.rotation.x = eased.y * 0.15;
    tilt.rotation.y = eased.x * 0.3;
    tilt.position.y = Math.sin(t * 0.8) * 0.06;
    rings.forEach((r) => {
      for (let k = 0; k < PULSES; k++) {
        const a = t * r.speed * Math.PI * 2 + (k / PULSES) * Math.PI * 2;
        r.pulsePos.set([Math.cos(a) * r.radius, 0, Math.sin(a) * r.radius], k * 3);
      }
      r.pulseGeo.attributes.position.needsUpdate = true;
    });
    red.scale.setScalar(0.45 + 0.2 * Math.sin(t * 3));
    renderer.render(scene, camera);
  };

  let raf = 0;
  let visible = true;
  const start = performance.now();
  const loop = () => {
    render((performance.now() - start) / 1000);
    raf = requestAnimationFrame(loop);
  };
  const setRunning = (on: boolean) => {
    if (on && !raf) loop();
    if (!on && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (!prefersReducedMotion()) setRunning(visible && !document.hidden);
  });
  const onVisibility = () => {
    if (!prefersReducedMotion()) setRunning(visible && !document.hidden);
  };
  // React live to the site's “Reduce motion” accessibility switch
  const motionWatch = new MutationObserver(() => setRunning(!prefersReducedMotion() && visible && !document.hidden));
  motionWatch.observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] });

  if (reduceMotion) render(1.5);
  else loop();
  io.observe(container);
  document.addEventListener('visibilitychange', onVisibility);
  onReady?.();

  return () => {
    setRunning(false);
    motionWatch.disconnect();
    io.disconnect();
    ro.disconnect();
    window.removeEventListener('pointermove', onPointer);
    document.removeEventListener('visibilitychange', onVisibility);
    disposables.forEach((d) => d.dispose());
    renderer.dispose();
    renderer.domElement.remove();
  };
}
