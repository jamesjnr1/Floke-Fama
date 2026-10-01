/**
 * Hero centrepiece: a medical machine drawn in dots, in the same language as the earlier capsule.
 * A rounded body of dots with one screen cut into the front, where a heartbeat line draws itself.
 * It sways slowly inside two orbit rings that carry light pulses out to facility nodes, and a
 * single red status light echoes the logo's dot.
 * Lines and points only (no lights or textures beyond two small glows), so it stays cheap on phones.
 * Loaded lazily in its own chunk. Returns a cleanup function that disposes everything.
 */
import { prefersReducedMotion } from '@/lib/a11y';
import {
  AdditiveBlending, BufferAttribute, BufferGeometry, CanvasTexture, Color, Group, Line, LineBasicMaterial, Mesh,
  MeshBasicMaterial, PerspectiveCamera, Points, PointsMaterial, Scene, Sprite, SpriteMaterial, Vector3, WebGLRenderer,
} from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

const W = 2.7; // body width
const H = 1.9; // body height
const D = 1.6; // body depth
const RAD = 0.42; // corner radius
const STEP = 0.11; // dot spacing
const SCREEN = { w: 1.7, h: 0.92, y: 0.14 };
const GREEN_BRIGHT = new Color('#8fd1a9'); // light enough to read on the green hero
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

/** A point at distance s along the outline of a rounded rectangle (w × d, corner r) in the x/z plane. */
function roundedRect(w: number, d: number, r: number) {
  const a = w / 2 - r;
  const b = d / 2 - r;
  const segs: [number, (u: number) => [number, number]][] = [
    [2 * a, (u) => [-a + u, d / 2]],
    [(Math.PI / 2) * r, (u) => { const t = u / r; return [a + Math.sin(t) * r, b + Math.cos(t) * r]; }],
    [2 * b, (u) => [w / 2, b - u]],
    [(Math.PI / 2) * r, (u) => { const t = u / r; return [a + Math.cos(t) * r, -b - Math.sin(t) * r]; }],
    [2 * a, (u) => [a - u, -d / 2]],
    [(Math.PI / 2) * r, (u) => { const t = u / r; return [-a - Math.sin(t) * r, -b - Math.cos(t) * r]; }],
    [2 * b, (u) => [-w / 2, -b + u]],
    [(Math.PI / 2) * r, (u) => { const t = u / r; return [-a - Math.cos(t) * r, b + Math.sin(t) * r]; }],
  ];
  const length = segs.reduce((n, [l]) => n + l, 0);
  return {
    length,
    at(s: number): [number, number] {
      for (const [l, f] of segs) {
        if (s <= l) return f(Math.max(0, s));
        s -= l;
      }
      return segs[0][1](0);
    },
  };
}

/** Evenly spaced dots over a rounded box, leaving the screen open. */
function machinePoints() {
  const pts: number[] = [];
  const ring = (y: number, inset: number, stagger: number) => {
    const w = W - 2 * inset;
    const d = D - 2 * inset;
    const r = Math.max(0.001, RAD - inset);
    if (w <= 0 || d <= 0) return;
    const path = roundedRect(w, d, Math.min(r, w / 2, d / 2));
    const n = Math.max(1, Math.round(path.length / STEP));
    for (let i = 0; i < n; i++) {
      const [x, z] = path.at(((i + stagger) / n) * path.length);
      const inScreen = z > D / 2 - 0.01 && Math.abs(x) < SCREEN.w / 2 + 0.04 && Math.abs(y - SCREEN.y) < SCREEN.h / 2 + 0.04;
      if (!inScreen) pts.push(x, y, z);
    }
  };
  let k = 0;
  for (let y = -H / 2 + RAD; y <= H / 2 - RAD + 1e-6; y += STEP) ring(y, 0, (k++ % 2) * 0.5);
  const edgeRings = Math.round(((Math.PI / 2) * RAD) / STEP);
  for (let j = 1; j <= edgeRings; j++) {
    const t = (j / edgeRings) * (Math.PI / 2);
    const inset = RAD * (1 - Math.cos(t));
    ring(H / 2 - RAD + Math.sin(t) * RAD, inset, (j % 2) * 0.5);
    ring(-H / 2 + RAD - Math.sin(t) * RAD, inset, (j % 2) * 0.5);
  }
  // Top face: rings stepping inward
  for (let inset = RAD + STEP; inset < Math.min(W, D) / 2; inset += STEP) ring(H / 2, inset, 0);
  return new Float32Array(pts);
}

/** One heartbeat: flat, small bump, sharp spike, dip, wide bump, flat (u in 0..1). */
function beat(u: number) {
  if (u > 0.18 && u < 0.26) return Math.sin(((u - 0.18) / 0.08) * Math.PI) * 0.12;
  if (u > 0.32 && u < 0.36) return ((u - 0.32) / 0.04) * 1;
  if (u >= 0.36 && u < 0.41) return 1 - ((u - 0.36) / 0.05) * 1.35;
  if (u >= 0.41 && u < 0.44) return -0.35 + ((u - 0.41) / 0.03) * 0.35;
  if (u > 0.52 && u < 0.66) return Math.sin(((u - 0.52) / 0.14) * Math.PI) * 0.22;
  return 0;
}

export function mountMachine(container: HTMLElement, onReady?: () => void): () => void {
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
  camera.position.set(0, 0.9, 8.2);
  camera.lookAt(0, 0, 0);
  const rig = new Group();
  scene.add(rig);
  const machine = new Group();
  rig.add(machine);
  const disposables: { dispose: () => void }[] = [];

  // 1. Dotted body, mint on top fading to green below
  const pos = machinePoints();
  const count = pos.length / 3;
  const col = new Float32Array(count * 3);
  const c = new Color();
  for (let i = 0; i < count; i++) {
    c.copy(GREEN_BRIGHT).lerp(MINT, (pos[i * 3 + 1] + H / 2) / H);
    col.set([c.r, c.g, c.b], i * 3);
  }
  const dotGeo = new BufferGeometry();
  dotGeo.setAttribute('position', new BufferAttribute(pos, 3));
  dotGeo.setAttribute('color', new BufferAttribute(col, 3));
  const dotMat = new PointsMaterial({ vertexColors: true, size: 0.042, transparent: true, opacity: 0.9, depthWrite: false });
  machine.add(new Points(dotGeo, dotMat));
  disposables.push(dotGeo, dotMat);
  // Invisible inner body: writes depth only, so dots on the far side are hidden and the form reads as solid
  const occGeo = new RoundedBoxGeometry(W * 0.97, H * 0.97, D * 0.97, 3, RAD * 0.97);
  const occMat = new MeshBasicMaterial({ colorWrite: false });
  const occluder = new Mesh(occGeo, occMat);
  occluder.renderOrder = -1;
  machine.add(occluder);
  disposables.push(occGeo, occMat);

  // 2. The screen: a faint frame and a heartbeat line that draws itself
  const z = D / 2 + 0.01;
  const frameMat = new LineBasicMaterial({ color: MINT, transparent: true, opacity: 0.45, depthWrite: false });
  const fw = SCREEN.w / 2;
  const fh = SCREEN.h / 2;
  const frameGeo = new BufferGeometry().setFromPoints([
    new Vector3(-fw, SCREEN.y - fh, z), new Vector3(fw, SCREEN.y - fh, z), new Vector3(fw, SCREEN.y + fh, z),
    new Vector3(-fw, SCREEN.y + fh, z), new Vector3(-fw, SCREEN.y - fh, z),
  ]);
  machine.add(new Line(frameGeo, frameMat));
  disposables.push(frameMat, frameGeo);
  const SAMPLES = 180;
  const pulse = Array.from({ length: SAMPLES }, (_, i) => {
    const u = i / (SAMPLES - 1);
    return new Vector3(-fw + 0.1 + u * (SCREEN.w - 0.2), SCREEN.y - 0.08 + beat((u * 2) % 1) * (SCREEN.h * 0.42), z);
  });
  const pulseGeo = new BufferGeometry().setFromPoints(pulse);
  const pulseMat = new LineBasicMaterial({ color: '#c9f5da', transparent: true, depthWrite: false });
  machine.add(new Line(pulseGeo, pulseMat));
  disposables.push(pulseGeo, pulseMat);
  const headTex = glowTexture('rgba(190,240,210,1)');
  const headMat = new SpriteMaterial({ map: headTex, transparent: true, blending: AdditiveBlending, depthWrite: false });
  const head = new Sprite(headMat);
  head.scale.setScalar(0.32);
  machine.add(head);
  disposables.push(headTex, headMat);

  // 3. The logo's red dot: a status light under the screen
  const redTex = glowTexture('rgba(228,40,60,1)');
  const redMat = new SpriteMaterial({ map: redTex, transparent: true, blending: AdditiveBlending, depthWrite: false });
  const red = new Sprite(redMat);
  const redCoreGeo = new BufferGeometry().setFromPoints([new Vector3()]);
  const redCoreMat = new PointsMaterial({ color: RED, size: 0.1, transparent: true, depthWrite: false });
  const redCore = new Points(redCoreGeo, redCoreMat);
  red.position.set(SCREEN.w / 2 - 0.05, SCREEN.y - SCREEN.h / 2 - 0.22, z);
  redCore.position.copy(red.position);
  machine.add(red, redCore);
  disposables.push(redTex, redMat, redCoreGeo, redCoreMat);

  // 4. Two orbit rings with facility nodes and light pulses travelling round them
  const ringMat = new LineBasicMaterial({ color: MINT, transparent: true, opacity: 0.3, depthWrite: false });
  const nodeMat = new PointsMaterial({ color: MINT, size: 0.09, transparent: true, opacity: 0.95, blending: AdditiveBlending, depthWrite: false });
  const pulseTex = glowTexture('rgba(190,240,210,1)');
  const travelMat = new PointsMaterial({ map: pulseTex, size: 0.24, transparent: true, blending: AdditiveBlending, depthWrite: false });
  disposables.push(ringMat, nodeMat, pulseTex, travelMat);
  const PULSES = 3;
  const rings = [
    { radius: 2.75, tilt: [1.25, 0, -0.22], speed: 0.07, nodes: 5 },
    { radius: 3.15, tilt: [-0.5, 0, 0.42], speed: -0.05, nodes: 4 },
  ].map(({ radius, tilt: [x, y, zz], speed, nodes }) => {
    const g = new Group();
    g.rotation.set(x, y, zz);
    const at = (a: number) => new Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius);
    const ringGeo = new BufferGeometry().setFromPoints(Array.from({ length: 161 }, (_, k) => at((k / 160) * Math.PI * 2)));
    const nodeGeo = new BufferGeometry().setFromPoints(Array.from({ length: nodes }, (_, k) => at((k / nodes) * Math.PI * 2 + 0.4)));
    const travelPos = new Float32Array(PULSES * 3);
    const travelGeo = new BufferGeometry();
    travelGeo.setAttribute('position', new BufferAttribute(travelPos, 3));
    g.add(new Line(ringGeo, ringMat), new Points(nodeGeo, nodeMat), new Points(travelGeo, travelMat));
    disposables.push(ringGeo, nodeGeo, travelGeo);
    scene.add(g);
    return { radius, speed, travelPos, travelGeo };
  });

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
    rig.rotation.y = -0.45 + Math.sin(t * 0.25) * 0.4 + eased.x * 0.3; // slow sway; the screen stays in view
    rig.rotation.x = 0.08 + eased.y * 0.12;
    rig.position.y = Math.sin(t * 0.8) * 0.06;
    // Heartbeat line draws itself across the screen, then starts again
    const drawn = Math.max(2, Math.floor(((t * 0.4) % 1) * SAMPLES));
    pulseGeo.setDrawRange(0, drawn);
    head.position.copy(pulse[drawn - 1]);
    rings.forEach((r) => {
      for (let k = 0; k < PULSES; k++) {
        const a = t * r.speed * Math.PI * 2 + (k / PULSES) * Math.PI * 2;
        r.travelPos.set([Math.cos(a) * r.radius, 0, Math.sin(a) * r.radius], k * 3);
      }
      r.travelGeo.attributes.position.needsUpdate = true;
    });
    red.scale.setScalar(0.42 + 0.18 * Math.sin(t * 3));
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

  if (reduceMotion) render(2.2);
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
