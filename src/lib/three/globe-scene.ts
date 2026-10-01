/**
 * Hero centrepiece: a dotted globe with a pulsing head-office node (logo red) and
 * brand-green arcs carrying light pulses out to facilities, a picture of the network
 * of hospitals and laboratories Flokefama equips and services.
 * Lines and points only (no lights or textures), so it stays cheap on mid-range phones.
 * Loaded lazily in its own chunk. Returns a cleanup function that disposes everything.
 */
import { prefersReducedMotion } from '@/lib/a11y';
import {
  AdditiveBlending, BufferAttribute, BufferGeometry, CanvasTexture, Color, EdgesGeometry, Group, IcosahedronGeometry,
  Line, LineBasicMaterial, LineSegments, PerspectiveCamera, Points, PointsMaterial, QuadraticBezierCurve3, Scene,
  Sprite, SpriteMaterial, Vector3, WebGLRenderer,
} from 'three';

const R = 2.2;
const DOTS = 1400;
const HUBS = 16;
const PULSES_PER_ARC = 2;
const GREEN = new Color('#3aa867');
const MINT = new Color('#8fd1a9');
const RED = new Color('#e4283c');

/** Soft round sprite texture, drawn once on a canvas. */
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

export function mountGlobe(container: HTMLElement, onReady?: () => void): () => void {
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
  camera.position.set(0, 0.4, 8.2);
  camera.lookAt(0, 0, 0);
  const world = new Group();
  world.rotation.z = 0.28; // axial tilt
  scene.add(world);
  const disposables: { dispose: () => void }[] = [];

  let seed = 11;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  // 1. Dotted sphere (Fibonacci distribution), brighter towards the front
  const dotPos = new Float32Array(DOTS * 3);
  for (let i = 0; i < DOTS; i++) {
    const y = 1 - (i / (DOTS - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const t = Math.PI * (3 - Math.sqrt(5)) * i;
    dotPos.set([Math.cos(t) * r * R, y * R, Math.sin(t) * r * R], i * 3);
  }
  const dotGeo = new BufferGeometry();
  dotGeo.setAttribute('position', new BufferAttribute(dotPos, 3));
  const dotMat = new PointsMaterial({ color: GREEN, size: 0.028, transparent: true, opacity: 0.55, depthWrite: false });
  world.add(new Points(dotGeo, dotMat));
  disposables.push(dotGeo, dotMat);

  // 2. Faint geodesic shell
  const shellGeo = new EdgesGeometry(new IcosahedronGeometry(R * 1.001, 3));
  const shellMat = new LineBasicMaterial({ color: GREEN, transparent: true, opacity: 0.07, depthWrite: false });
  world.add(new LineSegments(shellGeo, shellMat));
  disposables.push(shellGeo, shellMat);

  // 3. Hubs: head office (red) + facilities (mint)
  const onSphere = (lat: number, lon: number, r = R) =>
    new Vector3(Math.cos(lat) * Math.cos(lon) * r, Math.sin(lat) * r, Math.cos(lat) * Math.sin(lon) * r);
  const hq = onSphere(0.35, 1.4);
  const hubs = Array.from({ length: HUBS }, () => onSphere((rand() - 0.5) * 2.2, rand() * Math.PI * 2));

  const hubGeo = new BufferGeometry().setFromPoints(hubs);
  const hubMat = new PointsMaterial({ color: MINT, size: 0.09, transparent: true, opacity: 0.95, blending: AdditiveBlending, depthWrite: false });
  world.add(new Points(hubGeo, hubMat));
  disposables.push(hubGeo, hubMat);

  const redTex = glowTexture('rgba(228,40,60,1)');
  const hqMat = new SpriteMaterial({ map: redTex, color: 0xffffff, transparent: true, blending: AdditiveBlending, depthWrite: false });
  const hqSprite = new Sprite(hqMat);
  hqSprite.position.copy(hq);
  hqSprite.scale.setScalar(0.5);
  world.add(hqSprite);
  const coreMat = new PointsMaterial({ color: RED, size: 0.13, transparent: true, depthWrite: false });
  const coreGeo = new BufferGeometry().setFromPoints([hq]);
  world.add(new Points(coreGeo, coreMat));
  disposables.push(redTex, hqMat, coreMat, coreGeo);

  // 4. Arcs from the head office to every hub, plus a few hub-to-hub links
  const pairs: [Vector3, Vector3][] = hubs.map((h) => [hq, h]);
  for (let i = 0; i < 5; i++) pairs.push([hubs[i], hubs[(i * 5 + 3) % HUBS]]);
  const curves = pairs.map(([a, b]) => {
    const mid = a.clone().add(b).multiplyScalar(0.5);
    const lift = R * (1.15 + a.distanceTo(b) * 0.12);
    return new QuadraticBezierCurve3(a, mid.normalize().multiplyScalar(lift), b);
  });
  const arcMat = new LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.55, blending: AdditiveBlending, depthWrite: false });
  disposables.push(arcMat);
  curves.forEach((c) => {
    const pts = c.getPoints(48);
    const geo = new BufferGeometry().setFromPoints(pts);
    const col = new Float32Array(pts.length * 3);
    pts.forEach((_, i) => {
      const k = Math.sin((i / (pts.length - 1)) * Math.PI) * 0.8 + 0.2; // brighter at the apex
      col.set([GREEN.r * k, GREEN.g * k, GREEN.b * k], i * 3);
    });
    geo.setAttribute('color', new BufferAttribute(col, 3));
    world.add(new Line(geo, arcMat));
    disposables.push(geo);
  });

  // 5. Light pulses travelling along the arcs
  const pulseCount = curves.length * PULSES_PER_ARC;
  const pulsePos = new Float32Array(pulseCount * 3);
  const pulseGeo = new BufferGeometry();
  pulseGeo.setAttribute('position', new BufferAttribute(pulsePos, 3));
  const mintTex = glowTexture('rgba(190,240,210,1)');
  const pulseMat = new PointsMaterial({ map: mintTex, size: 0.22, transparent: true, blending: AdditiveBlending, depthWrite: false });
  world.add(new Points(pulseGeo, pulseMat));
  disposables.push(pulseGeo, mintTex, pulseMat);
  const offsets = Array.from({ length: pulseCount }, () => rand());
  const speeds = curves.map(() => 0.12 + rand() * 0.1);
  const tmp = new Vector3();

  // 6. Two tilted orbit rings
  const ringMat = new LineBasicMaterial({ color: GREEN, transparent: true, opacity: 0.22, depthWrite: false });
  disposables.push(ringMat);
  const rings = [1.32, 1.55].map((scale, i) => {
    const pts = Array.from({ length: 129 }, (_, k) => {
      const a = (k / 128) * Math.PI * 2;
      return new Vector3(Math.cos(a) * R * scale, 0, Math.sin(a) * R * scale);
    });
    const geo = new BufferGeometry().setFromPoints(pts);
    disposables.push(geo);
    const ring = new Line(geo, ringMat);
    ring.rotation.set(i ? -0.5 : 1.15, 0, i ? 0.4 : -0.2);
    scene.add(ring);
    return ring;
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
    world.rotation.y = -0.9 + t * 0.06 + eased.x * 0.25;
    world.rotation.x = eased.y * 0.12;
    rings[0].rotation.y = t * 0.05;
    rings[1].rotation.y = -t * 0.035;
    curves.forEach((c, i) => {
      for (let k = 0; k < PULSES_PER_ARC; k++) {
        const idx = i * PULSES_PER_ARC + k;
        const u = (offsets[idx] + t * speeds[i]) % 1;
        c.getPoint(u, tmp);
        pulsePos.set([tmp.x, tmp.y, tmp.z], idx * 3);
      }
    });
    pulseGeo.attributes.position.needsUpdate = true;
    const beat = 0.5 + 0.25 * Math.sin(t * 3);
    hqSprite.scale.setScalar(beat);
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

  if (reduceMotion) render(4);
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
