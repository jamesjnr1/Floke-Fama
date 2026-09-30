/**
 * Hero 3D scene: glossy molecule + floating two-tone capsules (Three.js).
 * Loaded lazily in its own chunk. Returns a cleanup function that disposes everything.
 */
import {
  ACESFilmicToneMapping, AdditiveBlending, AmbientLight, BufferGeometry, CanvasTexture, CylinderGeometry,
  DirectionalLight, Float32BufferAttribute, Group, LatheGeometry, Mesh, MeshPhysicalMaterial, PMREMGenerator,
  PerspectiveCamera, Points, PointsMaterial, Quaternion, SRGBColorSpace, Scene, SphereGeometry, Vector2, Vector3,
  WebGLRenderer, type Material,
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const BRAND = { green: 0x1f8a4c, mint: 0x6fd89c, red: 0xe4283c, white: 0xf2f6f4 };

export function mountMolecule(container: HTMLElement, onReady?: () => void): () => void {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch {
    return () => {}; // No WebGL: the CSS glow behind the canvas remains.
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.domElement.style.cssText = 'width:100%;height:100%;display:block';
  container.appendChild(renderer.domElement);

  const scene = new Scene();
  const camera = new PerspectiveCamera(32, 1, 0.1, 100);
  const pmrem = new PMREMGenerator(renderer);
  const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envMap;
  scene.add(new AmbientLight(0xffffff, 0.6));
  const key = new DirectionalLight(0xffffff, 3.2);
  key.position.set(4, 6, 6);
  const rim = new DirectionalLight(BRAND.mint, 3);
  rim.position.set(-6, -2, -4);
  scene.add(key, rim);

  const disposables: { dispose: () => void }[] = [pmrem, envMap];
  const glossy = (color: number, extra: Partial<ConstructorParameters<typeof MeshPhysicalMaterial>[0]> = {}) => {
    const m = new MeshPhysicalMaterial({ color, roughness: 0.14, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.4, ...extra });
    disposables.push(m);
    return m;
  };
  const mat = {
    green: glossy(BRAND.green),
    mint: glossy(BRAND.mint, { roughness: 0.25 }),
    red: glossy(BRAND.red),
    white: glossy(BRAND.white, { roughness: 0.3 }),
    bond: glossy(0xe8f2ec, { roughness: 0.25, metalness: 0.2 }),
  };

  // ---- Molecule: two fused hexagonal rings + substituents ----
  const molecule = new Group();
  const atoms: Vector3[] = [];
  const types: string[] = [];
  const bonds = new Set<string>();
  const addAtom = (p: Vector3, type = 'C') => {
    const i = atoms.findIndex((q) => q.distanceTo(p) < 0.01);
    if (i >= 0) return i;
    atoms.push(p);
    types.push(type);
    return atoms.length - 1;
  };
  const addBond = (a: number, b: number) => bonds.add(a < b ? `${a}-${b}` : `${b}-${a}`);
  for (const cx of [-0.866, 0.866]) {
    const ids = Array.from({ length: 6 }, (_, k) => {
      const a = Math.PI / 6 + (k * Math.PI) / 3;
      return addAtom(new Vector3(cx + Math.cos(a), Math.sin(a), 0));
    });
    ids.forEach((id, k) => addBond(id, ids[(k + 1) % 6]));
  }
  const ringCount = atoms.length;
  const substituents: [number, string, number, number][] = [[1, 'O', 0.95, 0.5], [4, 'N', 0.95, -0.6], [6, 'O', 0.95, 0.7], [8, 'H', 0.8, -0.5], [9, 'C', 1.0, 0.4]];
  for (const [idx, type, len, z] of substituents) {
    const p = atoms[idx];
    const c = new Vector3(p.x < 0 ? -0.866 : 0.866, 0, 0);
    const dir = p.clone().sub(c).setZ(0).normalize();
    addBond(idx, addAtom(p.clone().addScaledVector(dir, len).setZ(z), type));
  }
  atoms.forEach((p, i) => { if (i < ringCount) p.z += Math.sin(i * 1.7) * 0.18; });

  const sphere = new SphereGeometry(1, 48, 48);
  const cyl = new CylinderGeometry(0.06, 0.06, 1, 20);
  disposables.push(sphere, cyl);
  const style: Record<string, [number, Material]> = { C: [0.26, mat.green], O: [0.3, mat.red], N: [0.28, mat.mint], H: [0.18, mat.white] };
  atoms.forEach((p, i) => {
    const [r, m] = style[types[i]] ?? style.C;
    const mesh = new Mesh(sphere, m);
    mesh.position.copy(p);
    mesh.scale.setScalar(r);
    molecule.add(mesh);
  });
  const up = new Vector3(0, 1, 0);
  for (const key of bonds) {
    const [a, b] = key.split('-').map(Number);
    const mesh = new Mesh(cyl, mat.bond);
    mesh.position.copy(atoms[a]).add(atoms[b]).multiplyScalar(0.5);
    mesh.scale.y = atoms[a].distanceTo(atoms[b]);
    mesh.quaternion.copy(new Quaternion().setFromUnitVectors(up, atoms[b].clone().sub(atoms[a]).normalize()));
    molecule.add(mesh);
  }
  molecule.scale.setScalar(1.15);
  scene.add(molecule);

  // ---- Two-tone capsules ----
  const pts: Vector2[] = [];
  for (let i = 0; i <= 16; i++) {
    const a = (i / 16) * (Math.PI / 2);
    pts.push(new Vector2(Math.sin(a) * 0.3, -0.36 - Math.cos(a) * 0.3));
  }
  pts.push(new Vector2(0.3, 0), new Vector2(0, 0));
  const half = new LatheGeometry(pts, 48);
  disposables.push(half);
  const capsule = (top: Material, bottom: Material) => {
    const g = new Group();
    const t = new Mesh(half, top);
    t.rotation.z = Math.PI;
    g.add(new Mesh(half, bottom), t);
    return g;
  };
  const capsules = [
    { g: capsule(mat.green, mat.white), pos: [2.9, 1.7, 0.6], rot: [0.6, 0.2, 0.9], s: 1, speed: 0.6 },
    { g: capsule(mat.red, mat.white), pos: [-3.3, -0.2, 0.9], rot: [-0.4, 0.5, -0.7], s: 0.8, speed: 0.8 },
    { g: capsule(mat.green, mat.mint), pos: [-2.4, 2.1, -1.4], rot: [0.9, -0.3, 0.3], s: 0.6, speed: 0.5 },
    { g: capsule(mat.white, mat.green), pos: [2.5, -2.2, -0.8], rot: [0.2, 0.8, -1.2], s: 0.7, speed: 0.7 },
  ];
  capsules.forEach((c) => {
    c.g.position.set(c.pos[0], c.pos[1], c.pos[2]);
    c.g.rotation.set(c.rot[0], c.rot[1], c.rot[2]);
    c.g.scale.setScalar(c.s);
    scene.add(c.g);
  });

  // ---- Particles ----
  const dotCanvas = document.createElement('canvas');
  dotCanvas.width = dotCanvas.height = 64;
  const ctx = dotCanvas.getContext('2d')!;
  const grd = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, 64, 64);
  const dot = new CanvasTexture(dotCanvas);
  const pos = new Float32Array(220 * 3);
  for (let i = 0; i < pos.length; i += 3) {
    pos[i] = (Math.random() - 0.5) * 12;
    pos[i + 1] = (Math.random() - 0.5) * 8;
    pos[i + 2] = (Math.random() - 0.5) * 6 - 1;
  }
  const pGeo = new BufferGeometry();
  pGeo.setAttribute('position', new Float32BufferAttribute(pos, 3));
  const pMat = new PointsMaterial({ size: 0.06, map: dot, color: BRAND.mint, transparent: true, opacity: 0.7, depthWrite: false, blending: AdditiveBlending });
  const particles = new Points(pGeo, pMat);
  scene.add(particles);
  disposables.push(dot, pGeo, pMat);

  // ---- Sizing & interaction ----
  const resize = () => {
    const { clientWidth: w, clientHeight: h } = container;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = w / h < 0.9 ? 17 : 14;
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
    eased.x += (pointer.x - eased.x) * 0.05;
    eased.y += (pointer.y - eased.y) * 0.05;
    molecule.rotation.y = t * 0.25 + eased.x * 0.5;
    molecule.rotation.x = Math.sin(t * 0.4) * 0.15 + eased.y * 0.3;
    molecule.position.y = Math.sin(t * 0.8) * 0.08;
    capsules.forEach((c, i) => {
      c.g.position.y = c.pos[1] + Math.sin(t * c.speed + i) * 0.18;
      c.g.rotation.x = c.rot[0] + t * 0.2 * c.speed;
      c.g.rotation.y = c.rot[1] + t * 0.3 * c.speed;
    });
    particles.rotation.y = t * 0.02;
    scene.rotation.set(eased.y * 0.05, eased.x * 0.08, 0);
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
    if (!reduceMotion) setRunning(visible && !document.hidden);
  });
  const onVisibility = () => { if (!reduceMotion) setRunning(visible && !document.hidden); };

  if (reduceMotion) render(1.2);
  else {
    io.observe(container);
    document.addEventListener('visibilitychange', onVisibility);
    loop();
  }
  onReady?.();

  return () => {
    setRunning(false);
    io.disconnect();
    ro.disconnect();
    window.removeEventListener('pointermove', onPointer);
    document.removeEventListener('visibilitychange', onVisibility);
    disposables.forEach((d) => d.dispose());
    renderer.dispose();
    renderer.domElement.remove();
  };
}
