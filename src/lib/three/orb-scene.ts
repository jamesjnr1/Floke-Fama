/**
 * Page header display: one calm, slowly turning geodesic sphere (Three.js), drawn in the same line
 * style as the home hero network: wireframe edges, glowing vertex dots and a faint inner core.
 * Lines only, no lighting, so it stays cheap. Loaded lazily; returns a cleanup function.
 */
import { prefersReducedMotion } from '@/lib/a11y';
import {
  AdditiveBlending, BufferGeometry, EdgesGeometry, Group, IcosahedronGeometry, LineBasicMaterial, LineSegments,
  PerspectiveCamera, Points, PointsMaterial, Scene, Vector3, WebGLRenderer,
} from 'three';

export function mountOrb(container: HTMLElement, onReady?: () => void): () => void {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  } catch {
    return () => {}; // No WebGL: the header keeps its gradient and glow.
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.domElement.style.cssText = 'width:100%;height:100%;display:block';
  container.appendChild(renderer.domElement);

  const scene = new Scene();
  const camera = new PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.z = 9;
  const orb = new Group();
  orb.rotation.set(0.35, 0, 0.12);
  scene.add(orb);

  // Outer geodesic shell
  const shellSrc = new IcosahedronGeometry(2.2, 2);
  const shell = new EdgesGeometry(shellSrc);
  const shellMat = new LineBasicMaterial({ color: 0x52b57c, transparent: true, opacity: 0.38 });
  orb.add(new LineSegments(shell, shellMat));

  // Glowing nodes on the shell's vertices (deduplicated)
  const pos = shellSrc.getAttribute('position');
  const seen = new Set<string>();
  const verts: Vector3[] = [];
  for (let i = 0; i < pos.count; i++) {
    const v = new Vector3().fromBufferAttribute(pos, i);
    const k = v.toArray().map((n) => n.toFixed(3)).join();
    if (seen.has(k)) continue;
    seen.add(k);
    verts.push(v);
  }
  const dotGeo = new BufferGeometry().setFromPoints(verts);
  const dotMat = new PointsMaterial({ color: 0x8fd1a9, size: 0.08, transparent: true, opacity: 0.95, blending: AdditiveBlending, depthWrite: false });
  orb.add(new Points(dotGeo, dotMat));

  // Faint inner core, turning the other way
  const core = new EdgesGeometry(new IcosahedronGeometry(1.05, 1));
  const coreMat = new LineBasicMaterial({ color: 0x8fd1a9, transparent: true, opacity: 0.22 });
  const coreMesh = new LineSegments(core, coreMat);
  orb.add(coreMesh);

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

  const render = (t: number) => {
    orb.rotation.y = t * 0.12;
    orb.position.y = Math.sin(t * 0.6) * 0.06;
    coreMesh.rotation.y = -t * 0.2;
    coreMesh.rotation.x = t * 0.07;
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
  const sync = () => setRunning(!prefersReducedMotion() && visible && !document.hidden);
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    sync();
  });
  // React live to the site's “Reduce motion” accessibility switch
  const motionWatch = new MutationObserver(sync);
  motionWatch.observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] });

  if (prefersReducedMotion()) render(0);
  else loop();
  io.observe(container);
  document.addEventListener('visibilitychange', sync);
  onReady?.();

  return () => {
    setRunning(false);
    motionWatch.disconnect();
    io.disconnect();
    ro.disconnect();
    document.removeEventListener('visibilitychange', sync);
    [shellSrc, shell, shellMat, dotGeo, dotMat, core, coreMat].forEach((d) => d.dispose());
    renderer.dispose();
    renderer.domElement.remove();
  };
}
