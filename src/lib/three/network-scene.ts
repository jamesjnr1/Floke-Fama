/**
 * Hero background: a slowly drifting network of wireframe polyhedra (Three.js), drawn in the company green
 * and Deep Sea Green so it reads on the light hero.
 * No lighting or environment maps, just lines, so it stays cheap on mid-range devices.
 * Loaded lazily in its own chunk. Returns a cleanup function that disposes everything.
 */
import { prefersReducedMotion } from '@/lib/a11y';
import {
  BufferAttribute, BufferGeometry, EdgesGeometry, Group, IcosahedronGeometry, LineBasicMaterial,
  LineSegments, PerspectiveCamera, Points, PointsMaterial, Scene, Vector3, WebGLRenderer,
} from 'three';

const NODES = 26;
const LINK_DISTANCE = 3.1;

export function mountNetwork(container: HTMLElement, onReady?: () => void): () => void {
  const reduceMotion = prefersReducedMotion();
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  } catch {
    return () => {}; // No WebGL: the CSS pattern fallback remains.
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.domElement.style.cssText = 'width:100%;height:100%;display:block';
  container.appendChild(renderer.domElement);

  const scene = new Scene();
  const camera = new PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.z = 12;
  const world = new Group();
  scene.add(world);

  // Deterministic pseudo-random so the composition is identical on every load
  let seed = 7;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  // Nodes biased to the right half, where the product image sits
  const positions: Vector3[] = Array.from({ length: NODES }, () => new Vector3(rand() * 10 - 1.5, (rand() - 0.5) * 9, (rand() - 0.5) * 6));

  const ico = new EdgesGeometry(new IcosahedronGeometry(1, 0));
  const nodeMat = new LineBasicMaterial({ color: 0x007a4d, transparent: true, opacity: 0.32 });
  const nodes = positions.map((p) => {
    const m = new LineSegments(ico, nodeMat);
    m.position.copy(p);
    m.scale.setScalar(0.14 + rand() * 0.26);
    m.rotation.set(rand() * 3, rand() * 3, rand() * 3);
    world.add(m);
    return m;
  });

  // Vertex dots
  const dotGeo = new BufferGeometry().setFromPoints(positions);
  const dotMat = new PointsMaterial({ color: 0x075056, size: 0.08, transparent: true, opacity: 0.75, depthWrite: false });
  world.add(new Points(dotGeo, dotMat));

  // Connections, fading with distance
  const linkPos: number[] = [];
  const linkCol: number[] = [];
  for (let i = 0; i < NODES; i++) {
    for (let j = i + 1; j < NODES; j++) {
      const d = positions[i].distanceTo(positions[j]);
      if (d > LINK_DISTANCE) continue;
      const a = 1 - d / LINK_DISTANCE;
      linkPos.push(...positions[i].toArray(), ...positions[j].toArray());
      linkCol.push(0, 0.48, 0.3, a, 0, 0.48, 0.3, a); // company green, fading out with distance (RGBA)
    }
  }
  const linkGeo = new BufferGeometry();
  linkGeo.setAttribute('position', new BufferAttribute(new Float32Array(linkPos), 3));
  linkGeo.setAttribute('color', new BufferAttribute(new Float32Array(linkCol), 4));
  const linkMat = new LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.35, depthWrite: false });
  world.add(new LineSegments(linkGeo, linkMat));

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
    world.rotation.y = Math.sin(t * 0.05) * 0.25 + eased.x * 0.12;
    world.rotation.x = Math.cos(t * 0.04) * 0.08 + eased.y * 0.08;
    nodes.forEach((n, i) => {
      n.rotation.x += 0.0015 + (i % 3) * 0.0006;
      n.rotation.y += 0.002 + (i % 5) * 0.0004;
    });
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

  if (reduceMotion) render(0);
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
    [ico, nodeMat, dotGeo, dotMat, linkGeo, linkMat].forEach((d) => d.dispose());
    renderer.dispose();
    renderer.domElement.remove();
  };
}
