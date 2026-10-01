/**
 * Hero centrepiece, pharmaceutical variants (preview).
 *  - 'capsules': a large two-tone capsule with smaller capsules and scored tablets floating around it.
 *  - 'molecule': a ball-and-stick paracetamol (acetaminophen) molecule.
 * Glossy physical materials lit by a soft studio environment and a brand-green rim light.
 * Loaded lazily in its own chunk. Returns a cleanup function that disposes everything.
 */
import { prefersReducedMotion } from '@/lib/a11y';
import {
  ACESFilmicToneMapping, AdditiveBlending, BufferAttribute, BufferGeometry, CapsuleGeometry, Color, CylinderGeometry,
  DirectionalLight, Group, LatheGeometry, Material, Mesh, MeshPhysicalMaterial, Object3D, PerspectiveCamera,
  PMREMGenerator, PointLight, Points, PointsMaterial, Quaternion, Scene, SphereGeometry, SRGBColorSpace, TorusGeometry,
  Vector2, Vector3, WebGLRenderer,
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export type PharmaVariant = 'capsules' | 'molecule';

const GREEN = new Color('#257847');
const GREEN_LIGHT = new Color('#3aa867');
const MINT = new Color('#8fd1a9');
const WHITE = new Color('#f4f7f5');
const RED = new Color('#e4283c');

type Floater = { obj: Object3D; base: Vector3; spin: Vector3; phase: number; amp: number };

export function mountPharma(container: HTMLElement, variant: PharmaVariant, onReady?: () => void): () => void {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  } catch {
    return () => {};
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.domElement.style.cssText = 'width:100%;height:100%;display:block';
  container.appendChild(renderer.domElement);

  const scene = new Scene();
  const camera = new PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 10);
  const disposables: { dispose: () => void }[] = [];

  // Soft studio reflections, plus a cool key light and a green rim from behind
  const pmrem = new PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const envMap = pmrem.fromScene(room, 0.04).texture;
  scene.environment = envMap;
  scene.environmentIntensity = 0.55;
  disposables.push(pmrem, envMap);
  const key = new DirectionalLight(0xffffff, 2.2);
  key.position.set(-4, 5, 6);
  scene.add(key);
  const rim = new PointLight(GREEN_LIGHT, 60, 20, 1.6);
  rim.position.set(3, 2, -4);
  scene.add(rim);
  const fill = new PointLight(MINT, 14, 16, 1.6);
  fill.position.set(-4, -3, 3);
  scene.add(fill);

  const world = new Group();
  scene.add(world);
  const floaters: Floater[] = [];
  let swayOnly = false; // flat molecule: sway around its face instead of spinning edge-on
  let seed = 7;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  const glossy = (color: Color, opts: Partial<MeshPhysicalMaterial> = {}) => {
    const m = new MeshPhysicalMaterial({ color, roughness: 0.28, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.12, ...opts });
    disposables.push(m);
    return m;
  };

  if (variant === 'capsules') buildCapsules();
  else buildMolecule();

  // Fine floating dust for depth
  const DUST = 160;
  const dustPos = new Float32Array(DUST * 3);
  for (let i = 0; i < DUST; i++) dustPos.set([(rand() - 0.5) * 9, (rand() - 0.5) * 9, (rand() - 0.5) * 6 - 1], i * 3);
  const dustGeo = new BufferGeometry();
  dustGeo.setAttribute('position', new BufferAttribute(dustPos, 3));
  const dustMat = new PointsMaterial({ color: MINT, size: 0.03, transparent: true, opacity: 0.45, blending: AdditiveBlending, depthWrite: false });
  const dust = new Points(dustGeo, dustMat);
  scene.add(dust);
  disposables.push(dustGeo, dustMat);

  /** Two-tone capsule: one colour per half, split exactly at the seam. */
  function capsule(top: Color, bottom: Color, radius: number, length: number) {
    const g = new Group();
    const topGeo = new CapsuleGeometry(radius, length, 12, 40);
    const botGeo = topGeo.clone();
    disposables.push(topGeo, botGeo);
    // Clip each half with a local clipping-free trick: squash the other half into the seam
    const squash = (geo: BufferGeometry, keepTop: boolean) => {
      const p = geo.attributes.position as BufferAttribute;
      for (let i = 0; i < p.count; i++) {
        const y = p.getY(i);
        if (keepTop ? y < 0 : y > 0) p.setY(i, 0);
      }
      geo.computeVertexNormals();
    };
    squash(topGeo, true);
    squash(botGeo, false);
    const capTop = new Mesh(topGeo, glossy(top));
    const capBot = new Mesh(botGeo, glossy(bottom, { roughness: 0.35 }));
    // The cap overlaps the body slightly, as on a real hard capsule
    capTop.scale.setScalar(1.035);
    const seamGeo = new TorusGeometry(radius * 1.03, radius * 0.035, 8, 48);
    disposables.push(seamGeo);
    const seam = new Mesh(seamGeo, glossy(top.clone().multiplyScalar(0.7)));
    seam.rotation.x = Math.PI / 2;
    g.add(capTop, capBot, seam);
    return g;
  }

  /** Round biconvex tablet with a score line. */
  function tablet(color: Color, radius: number) {
    const h = radius * 0.38;
    const pts: Vector2[] = [];
    pts.push(new Vector2(0, h));
    for (let i = 0; i <= 10; i++) { const t = i / 10; pts.push(new Vector2(radius * 0.82 * t, h - h * 0.35 * t * t)); }
    for (let i = 0; i <= 12; i++) {
      const a = Math.PI / 2 - (i / 12) * Math.PI;
      pts.push(new Vector2(radius * 0.82 + Math.cos(a) * radius * 0.18, Math.sin(a) * h * 0.65));
    }
    for (let i = 10; i >= 0; i--) { const t = i / 10; pts.push(new Vector2(radius * 0.82 * t, -(h - h * 0.35 * t * t))); }
    const geo = new LatheGeometry(pts, 48);
    disposables.push(geo);
    const g = new Group();
    g.add(new Mesh(geo, glossy(color, { roughness: 0.55, clearcoat: 0.3 })));
    const scoreGeo = new CylinderGeometry(0.012, 0.012, radius * 1.5, 6);
    disposables.push(scoreGeo);
    const score = new Mesh(scoreGeo, glossy(color.clone().multiplyScalar(0.75), { roughness: 0.8, clearcoat: 0 }));
    score.rotation.z = Math.PI / 2;
    score.position.y = h - 0.005;
    g.add(score);
    return g;
  }

  function addFloater(obj: Object3D, pos: [number, number, number], amp = 0.12) {
    obj.position.set(...pos);
    obj.rotation.set(rand() * Math.PI, rand() * Math.PI, rand() * Math.PI);
    world.add(obj);
    floaters.push({ obj, base: new Vector3(...pos), spin: new Vector3((rand() - 0.5) * 0.5, (rand() - 0.5) * 0.6, (rand() - 0.5) * 0.4), phase: rand() * 6.28, amp });
  }

  function buildCapsules() {
    // Hero capsule
    const hero = capsule(GREEN, WHITE, 0.62, 1.9);
    hero.rotation.set(0.2, 0, -0.62);
    world.add(hero);
    floaters.push({ obj: hero, base: new Vector3(0, 0, 0), spin: new Vector3(0, 0.22, 0), phase: 0, amp: 0.08 });

    const set: [Object3D, [number, number, number]][] = [
      [capsule(MINT, WHITE, 0.24, 0.7), [-2.15, 1.3, -0.6]],
      [capsule(GREEN, MINT, 0.2, 0.6), [2.05, 1.65, -1.2]],
      [capsule(RED, WHITE, 0.22, 0.66), [1.95, -1.25, 0.5]],
      [capsule(WHITE, GREEN, 0.17, 0.5), [-1.0, -2.1, -0.8]],
      [capsule(GREEN, WHITE, 0.15, 0.44), [-2.6, -0.5, -1.8]],
      [tablet(WHITE, 0.36), [-1.6, 2.1, 0.3]],
      [tablet(MINT, 0.3), [2.5, 0.25, -0.4]],
      [tablet(WHITE, 0.28), [0.85, -2.25, -0.3]],
      [tablet(WHITE, 0.24), [0.6, 2.35, -1.6]],
      [tablet(GREEN_LIGHT, 0.22), [-2.35, -1.6, 0.6]],
    ];
    set.forEach(([o, p]) => addFloater(o, p));
  }

  function buildMolecule() {
    // Paracetamol (C8H9NO2), roughly planar; coordinates in Å-like units, centred below
    const atoms: [string, number, number, number][] = [
      ['C', 0, 1.4, 0], ['C', 1.21, 0.7, 0], ['C', 1.21, -0.7, 0], ['C', 0, -1.4, 0], ['C', -1.21, -0.7, 0], ['C', -1.21, 0.7, 0],
      ['O', 0, 2.78, 0], ['H', 0.88, 3.22, 0.1],
      ['H', 2.16, 1.24, 0], ['H', 2.16, -1.24, 0], ['H', -2.16, -1.24, 0], ['H', -2.16, 1.24, 0],
      ['N', 0, -2.8, 0], ['H', -0.92, -3.25, 0.1],
      ['C', 1.2, -3.5, 0], ['O', 2.3, -2.95, 0], ['C', 1.2, -5.0, 0],
      ['H', 2.15, -5.42, 0.35], ['H', 0.45, -5.4, 0.65], ['H', 1.0, -5.35, -1.0],
    ];
    const bonds: [number, number, number][] = [
      [0, 1, 2], [1, 2, 1], [2, 3, 2], [3, 4, 1], [4, 5, 2], [5, 0, 1],
      [0, 6, 1], [6, 7, 1], [1, 8, 1], [2, 9, 1], [4, 10, 1], [5, 11, 1],
      [3, 12, 1], [12, 13, 1], [12, 14, 1], [14, 15, 2], [14, 16, 1], [16, 17, 1], [16, 18, 1], [16, 19, 1],
    ];
    const style: Record<string, { color: Color; r: number }> = {
      C: { color: GREEN, r: 0.36 },
      O: { color: RED, r: 0.34 },
      N: { color: MINT, r: 0.35 },
      H: { color: WHITE, r: 0.2 },
    };
    const mol = new Group();
    const centre = new Vector3(0.35, -1.1, 0);
    const pos = atoms.map(([, x, y, z]) => new Vector3(x, y, z).sub(centre));
    const sphere = new SphereGeometry(1, 40, 28);
    disposables.push(sphere);
    const mats = Object.fromEntries(Object.entries(style).map(([k, s]) => [k, glossy(s.color)])) as Record<string, Material>;
    atoms.forEach(([el], i) => {
      const m = new Mesh(sphere, mats[el]);
      m.position.copy(pos[i]);
      m.scale.setScalar(style[el].r);
      mol.add(m);
    });
    const stick = new CylinderGeometry(1, 1, 1, 16);
    disposables.push(stick);
    const stickMat = glossy(new Color('#cfe3d6'), { roughness: 0.4 });
    const up = new Vector3(0, 1, 0);
    bonds.forEach(([a, b, order]) => {
      const dir = pos[b].clone().sub(pos[a]);
      const len = dir.length();
      const q = new Quaternion().setFromUnitVectors(up, dir.clone().normalize());
      const side = new Vector3().crossVectors(dir, new Vector3(0, 0, 1)).normalize().multiplyScalar(0.09);
      const offsets = order === 2 ? [side, side.clone().negate()] : [new Vector3()];
      offsets.forEach((o) => {
        const s = new Mesh(stick, stickMat);
        s.quaternion.copy(q);
        s.position.copy(pos[a]).add(pos[b]).multiplyScalar(0.5).add(o);
        s.scale.set(order === 2 ? 0.055 : 0.075, len, order === 2 ? 0.055 : 0.075);
        mol.add(s);
      });
    });
    mol.scale.setScalar(0.62);
    mol.rotation.set(0.35, 0, -0.5);
    world.add(mol);
    floaters.push({ obj: mol, base: new Vector3(0, 0, 0), spin: new Vector3(0, 0, 0), phase: 0, amp: 0.08 });
    swayOnly = true;
  }

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
    world.rotation.y = eased.x * 0.3;
    world.rotation.x = eased.y * 0.15;
    floaters.forEach((f, i) => {
      f.obj.position.y = f.base.y + Math.sin(t * 0.8 + f.phase) * f.amp;
      if (i === 0) f.obj.rotation.y = swayOnly ? Math.sin(t * 0.35) * 0.75 : t * f.spin.y;
      else {
        f.obj.rotation.x += f.spin.x * 0.01;
        f.obj.rotation.y += f.spin.y * 0.01;
        f.obj.rotation.z += f.spin.z * 0.01;
      }
    });
    dust.rotation.y = t * 0.02;
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
  const motionWatch = new MutationObserver(() => setRunning(!prefersReducedMotion() && visible && !document.hidden));
  motionWatch.observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] });

  if (prefersReducedMotion()) render(2);
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
    room.dispose?.();
    renderer.dispose();
    renderer.domElement.remove();
  };
}
