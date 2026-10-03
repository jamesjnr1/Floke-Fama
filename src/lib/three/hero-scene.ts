/**
 * Hero centrepiece, in glossy, lit 3D, kept deliberately simple:
 * - the pharmacy cross: medicine and healthcare, what Flokefama supplies, recognisable at a glance;
 *   Flokefama green on the faces, a pearl-white rim;
 * - two orbit rings with light travelling round them: the distribution and service network, always moving;
 * - beads on the rings: the hospitals, labs and pharmacies it reaches;
 * - the red dot on the outer ring: head office, the red dot from the logo.
 * Physically based materials under a studio environment, no transmission, so it composites cleanly
 * over the hero photo. Loaded lazily in its own chunk. Returns a cleanup function.
 */
import { prefersReducedMotion } from '@/lib/a11y';
import {
  ACESFilmicToneMapping, AdditiveBlending, AmbientLight, CanvasTexture, Color, DirectionalLight, ExtrudeGeometry, Group,
  Mesh, MeshPhysicalMaterial, PerspectiveCamera, PMREMGenerator, PointLight, Scene, Shape, SphereGeometry, Sprite,
  SpriteMaterial, SRGBColorSpace, TorusGeometry, Vector2, WebGLRenderer,
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const ARM = 0.5; // half the width of each arm
const SPAN = 1.4; // centre to the end of an arm
const CORNER = 0.16; // corner rounding

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

/** The plus outline, every corner (outer and inner) softly rounded. */
function crossShape() {
  const a = ARM;
  const l = SPAN;
  const pts = [
    [a, -l], [a, -a], [l, -a], [l, a], [a, a], [a, l],
    [-a, l], [-a, a], [-l, a], [-l, -a], [-a, -a], [-a, -l],
  ].map(([x, y]) => new Vector2(x, y));
  const shape = new Shape();
  pts.forEach((p, i) => {
    const prev = pts[(i + pts.length - 1) % pts.length];
    const next = pts[(i + 1) % pts.length];
    const start = p.clone().sub(p.clone().sub(prev).normalize().multiplyScalar(CORNER));
    const end = p.clone().add(next.clone().sub(p).normalize().multiplyScalar(CORNER));
    if (i === 0) shape.moveTo(start.x, start.y);
    else shape.lineTo(start.x, start.y);
    shape.quadraticCurveTo(p.x, p.y, end.x, end.y);
  });
  shape.closePath();
  return shape;
}

export function mountHeroScene(container: HTMLElement, onReady?: () => void): () => void {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  } catch {
    return () => {};
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.domElement.style.cssText = 'width:100%;height:100%;display:block';
  container.appendChild(renderer.domElement);

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = env;
  const key = new DirectionalLight(0xffffff, 2);
  key.position.set(4, 6, 5);
  const rim = new PointLight(0x63c6b5, 28, 20); // soft teal rim
  rim.position.set(-3, -3, 2);
  const cool = new PointLight(0x2f80b7, 18, 16); // cool medical-blue light from behind
  cool.position.set(3.5, -1, -3);
  scene.add(key, rim, cool, new AmbientLight(0xffffff, 0.3));

  const camera = new PerspectiveCamera(36, 1, 0.1, 100);
  camera.position.set(0, 0.3, 9.6);
  camera.lookAt(0, 0, 0);
  const world = new Group();
  scene.add(world);
  const disposables: { dispose: () => void }[] = [];
  const keep = <T extends { dispose: () => void }>(d: T) => (disposables.push(d), d);

  // 1. The pharmacy cross: green faces, pearl rim (the extrusion's sides and bevel)
  const crossGeo = keep(new ExtrudeGeometry(crossShape(), { depth: 0.38, bevelEnabled: true, bevelThickness: 0.11, bevelSize: 0.09, bevelSegments: 8, curveSegments: 10 }));
  crossGeo.center();
  const green = keep(new MeshPhysicalMaterial({ color: 0x007a4d, roughness: 0.3, envMapIntensity: 0.5, clearcoat: 1, clearcoatRoughness: 0.08 }));
  const pearl = keep(new MeshPhysicalMaterial({ color: 0xf3f7f5, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.05 }));
  const cross = new Mesh(crossGeo, [green, pearl]);
  world.add(cross);
  const sphere = keep(new SphereGeometry(1, 24, 16)); // shared by the red dot, beads and pulses

  // 2. Two polished orbit rings (the network), beads for the facilities, lights travelling round
  const ringMat = keep(new MeshPhysicalMaterial({ color: 0xdcebe6, roughness: 0.12, clearcoat: 1, metalness: 0.2, transparent: true, opacity: 0.7 }));
  const beadMat = keep(new MeshPhysicalMaterial({ color: 0xeef6f2, roughness: 0.08, clearcoat: 1 }));
  const pulseMat = keep(new MeshPhysicalMaterial({ color: 0xffffff, emissive: new Color(0xc4efe6), emissiveIntensity: 2 }));
  const pulseGlowMat = keep(new SpriteMaterial({ map: keep(glowTexture('rgba(170,232,220,1)')), transparent: true, blending: AdditiveBlending, depthWrite: false }));
  const PULSES = 2;
  const rings = [
    { radius: 2.6, tilt: [1.25, 0, -0.3], speed: 0.06, nodes: 5 },
    { radius: 3.05, tilt: [-0.5, 0, 0.4], speed: -0.045, nodes: 4 },
  ].map(({ radius, tilt: [x, y, z], speed, nodes }) => {
    const g = new Group();
    g.rotation.set(x, y, z);
    const ring = new Mesh(keep(new TorusGeometry(radius, 0.02, 12, 200)), ringMat);
    ring.rotation.x = Math.PI / 2;
    g.add(ring);
    for (let k = 0; k < nodes; k++) {
      const a = (k / nodes) * Math.PI * 2 + 0.4;
      const b = new Mesh(sphere, beadMat);
      b.scale.setScalar(0.08);
      b.position.set(Math.cos(a) * radius, 0, Math.sin(a) * radius);
      g.add(b);
    }
    const pulses = Array.from({ length: PULSES }, () => {
      const p = new Mesh(sphere, pulseMat);
      p.scale.setScalar(0.055);
      const glow = new Sprite(pulseGlowMat);
      glow.scale.setScalar(0.42);
      g.add(p, glow);
      return { p, glow };
    });
    world.add(g);
    return { g, radius, speed, pulses };
  });

  // 3. The logo's red dot: head office, a glowing red jewel on the outer ring, facing the viewer
  const red = new Mesh(sphere, keep(new MeshPhysicalMaterial({ color: 0xe3262e, roughness: 0.15, clearcoat: 1, emissive: new Color(0xe3262e), emissiveIntensity: 0.6 })));
  red.scale.setScalar(0.12);
  const ra = Math.PI * 0.42;
  red.position.set(Math.cos(ra) * rings[1].radius, 0, Math.sin(ra) * rings[1].radius);
  const redGlow = new Sprite(keep(new SpriteMaterial({ map: keep(glowTexture('rgba(227,38,46,1)')), transparent: true, blending: AdditiveBlending, depthWrite: false })));
  redGlow.position.copy(red.position);
  rings[1].g.add(red, redGlow);

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
    // A calm three-quarter sway, never edge-on, so the cross always reads
    cross.rotation.y = -0.35 + Math.sin(t * 0.45) * 0.45;
    cross.rotation.x = 0.08 + Math.sin(t * 0.3) * 0.05;
    world.rotation.x = eased.y * 0.15;
    world.rotation.y = eased.x * 0.3;
    world.position.y = Math.sin(t * 0.8) * 0.06;
    rings.forEach((r) => {
      r.pulses.forEach(({ p, glow }, k) => {
        const a = t * r.speed * Math.PI * 2 + (k / PULSES) * Math.PI * 2;
        p.position.set(Math.cos(a) * r.radius, 0, Math.sin(a) * r.radius);
        glow.position.copy(p.position);
      });
    });
    redGlow.scale.setScalar(0.5 + 0.18 * Math.sin(t * 3));
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

  if (prefersReducedMotion()) render(1.5);
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
    env.dispose();
    pmrem.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  };
}
