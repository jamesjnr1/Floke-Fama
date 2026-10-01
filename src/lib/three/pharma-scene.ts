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
  Vector2, Vector3, WebGLRenderer, CanvasTexture, Line, LineBasicMaterial, MeshBasicMaterial, PlaneGeometry,
  QuadraticBezierCurve3, RepeatWrapping, Texture,
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

export type PharmaVariant = 'capsules' | 'molecule' | 'equipment';

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

  const tickers: ((t: number) => void)[] = [];
  if (variant === 'capsules') buildCapsules();
  else if (variant === 'molecule') buildMolecule();
  else buildEquipment();

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
    floaters.push({ obj: mol, base: new Vector3(0, 0, 0), spin: new Vector3(0, 0.75, 0), phase: 0, amp: 0.08 });
    swayOnly = true;
  }

  /** Canvas-drawn texture (screens), shown unlit so it reads as a glowing display. */
  function canvasTexture(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    draw(c.getContext('2d')!);
    const tex = new CanvasTexture(c);
    tex.colorSpace = SRGBColorSpace;
    tex.anisotropy = 4;
    disposables.push(tex);
    return tex;
  }
  function screenMat(map: Texture) {
    const m = new MeshBasicMaterial({ map, toneMapped: false });
    disposables.push(m);
    return m;
  }
  function box(w: number, h: number, d: number, r: number) {
    const g = new RoundedBoxGeometry(w, h, d, 4, r);
    disposables.push(g);
    return g;
  }

  function buildEquipment() {
    const shell = glossy(new Color('#eef3f0'), { roughness: 0.32, clearcoat: 0.7 });
    const trim = glossy(new Color('#d9e3dd'), { roughness: 0.45, clearcoat: 0.3 });
    const glass = glossy(new Color('#0b1510'), { roughness: 0.08, metalness: 0.2, clearcoat: 1 });
    const brand = glossy(GREEN, { roughness: 0.3 });
    const rig = new Group();

    // Display plinth: dark glass disc with a glowing brand-green edge
    const plinthGeo = new CylinderGeometry(2.25, 2.35, 0.24, 96);
    disposables.push(plinthGeo);
    const plinth = new Mesh(plinthGeo, glossy(new Color('#111d17'), { roughness: 0.7, clearcoat: 0, envMapIntensity: 0.15 }));
    plinth.position.y = -1.32;
    rig.add(plinth);
    const edgeGeo = new TorusGeometry(2.3, 0.022, 8, 160);
    disposables.push(edgeGeo);
    const edgeMat = new MeshBasicMaterial({ color: GREEN_LIGHT, toneMapped: false });
    disposables.push(edgeMat);
    const edge = new Mesh(edgeGeo, edgeMat);
    edge.rotation.x = Math.PI / 2;
    edge.position.y = -1.2;
    rig.add(edge);

    // Benchtop analyser
    const analyser = new Group();
    analyser.position.y = -0.62;
    const body = new Mesh(box(2.6, 1.0, 1.55, 0.14), shell);
    analyser.add(body);
    const base = new Mesh(box(2.64, 0.16, 1.6, 0.06), trim);
    base.position.y = -0.5;
    analyser.add(base);
    const stripe = new Mesh(box(2.66, 0.05, 1.62, 0.02), brand);
    stripe.position.y = -0.4;
    analyser.add(stripe);
    // Front viewing window
    const win = new Mesh(box(1.3, 0.34, 0.05, 0.03), glass);
    win.position.set(0.45, -0.05, 0.78);
    analyser.add(win);
    // Status light
    const ledGeo = new SphereGeometry(0.035, 12, 8);
    disposables.push(ledGeo);
    const led = new Mesh(ledGeo, edgeMat);
    led.position.set(1.12, 0.3, 0.79);
    analyser.add(led);

    // Angled touchscreen on the left with a results view
    const screenTex = canvasTexture(512, 340, (g) => {
      g.fillStyle = '#07130d';
      g.fillRect(0, 0, 512, 340);
      g.fillStyle = '#257847';
      g.fillRect(0, 0, 512, 42);
      g.fillStyle = '#eaf6ee';
      g.font = '600 20px sans-serif';
      g.fillText('Sample 0428 · Biochemistry', 18, 28);
      const rows: [string, number][] = [['GLU', 0.62], ['ALT', 0.38], ['CREA', 0.74], ['TBIL', 0.3]];
      rows.forEach(([k, v], i) => {
        const y = 78 + i * 40;
        g.fillStyle = '#8fd1a9';
        g.font = '500 17px sans-serif';
        g.fillText(k, 18, y + 6);
        g.fillStyle = '#17261e';
        g.fillRect(96, y - 8, 280, 14);
        g.fillStyle = i === 2 ? '#e4283c' : '#3aa867';
        g.fillRect(96, y - 8, 280 * v, 14);
      });
      g.strokeStyle = '#52b57c';
      g.lineWidth = 3;
      g.beginPath();
      for (let x = 0; x <= 470; x += 4) g.lineTo(20 + x, 300 - Math.exp(-((x - 230) ** 2) / 4000) * 70 - Math.sin(x / 30) * 4);
      g.stroke();
    });
    const panel = new Group();
    panel.position.set(-0.78, 0.62, 0.42);
    panel.rotation.x = -0.75;
    const panelBody = new Mesh(box(0.98, 0.7, 0.08, 0.04), shell);
    const screenGeo = new PlaneGeometry(0.88, 0.6);
    disposables.push(screenGeo);
    const screen = new Mesh(screenGeo, screenMat(screenTex));
    screen.position.z = 0.042;
    panel.add(panelBody, screen);
    analyser.add(panel);

    // Sample carousel with capped tubes, turning
    const carousel = new Group();
    carousel.position.set(0.62, 0.5, 0.05);
    const trayGeo = new CylinderGeometry(0.62, 0.64, 0.08, 64);
    disposables.push(trayGeo);
    carousel.add(new Mesh(trayGeo, trim));
    const tubeGeo = new CylinderGeometry(0.04, 0.04, 0.34, 12);
    const capGeo = new CylinderGeometry(0.052, 0.052, 0.07, 16);
    disposables.push(tubeGeo, capGeo);
    const tubeMat = glossy(new Color('#f7faf8'), { roughness: 0.15, transmission: 0.5, thickness: 0.1 });
    const capMats = [GREEN, MINT, WHITE, GREEN_LIGHT, RED].map((c) => glossy(c, { roughness: 0.4 }));
    for (const [ring, n] of [[0.5, 18], [0.32, 11]] as const) {
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const tube = new Mesh(tubeGeo, tubeMat);
        tube.position.set(Math.cos(a) * ring, 0.2, Math.sin(a) * ring);
        const cap = new Mesh(capGeo, capMats[i === 3 && ring > 0.4 ? 4 : i % 4]);
        cap.position.set(tube.position.x, 0.4, tube.position.z);
        carousel.add(tube, cap);
      }
    }
    analyser.add(carousel);
    tickers.push((t) => (carousel.rotation.y = t * 0.35));
    rig.add(analyser);
    rig.rotation.x = 0.12;
    rig.position.x = -0.3;
    world.add(rig);
    world.position.y = 0.3;
    floaters.push({ obj: rig, base: new Vector3(-0.45, 0, 0), spin: new Vector3(0, 0.45, 0), phase: 0, amp: 0.05 });
    swayOnly = true;

    // Patient monitor with a scrolling ECG trace
    const ecg = canvasTexture(512, 128, (g) => {
      g.fillStyle = '#07130d';
      g.fillRect(0, 0, 512, 128);
      g.strokeStyle = '#8fd1a9';
      g.lineWidth = 3;
      g.beginPath();
      for (let x = 0; x <= 512; x += 2) {
        const p = x % 128;
        const y = p > 50 && p < 56 ? 30 : p >= 56 && p < 62 ? 100 : p > 80 && p < 96 ? 58 - Math.sin(((p - 80) / 16) * Math.PI) * 10 : 64;
        g.lineTo(x, y);
      }
      g.stroke();
    });
    ecg.wrapS = RepeatWrapping;
    const monitor = new Group();
    const monBody = new Mesh(box(1.05, 0.78, 0.14, 0.06), shell);
    const monScreenGeo = new PlaneGeometry(0.9, 0.42);
    disposables.push(monScreenGeo);
    const monScreen = new Mesh(monScreenGeo, screenMat(ecg));
    monScreen.position.set(0, 0.08, 0.072);
    const monBar = new Mesh(box(0.9, 0.1, 0.02, 0.01), brand);
    monBar.position.set(0, -0.26, 0.07);
    monitor.add(monBody, monScreen, monBar);
    tickers.push((t) => (ecg.offset.x = t * 0.25));
    monitor.position.set(0.2, 2.3, -1.0);
    monitor.rotation.set(0.12, 0.3, -0.05);
    world.add(monitor);
    floaters.push({ obj: monitor, base: monitor.position.clone(), spin: new Vector3(), phase: 1.2, amp: 0.1 });

    // Shipping carton with brand tape: distribution
    const carton = new Group();
    carton.add(new Mesh(box(0.62, 0.48, 0.5, 0.04), shell));
    const tape = new Mesh(box(0.64, 0.5, 0.12, 0.02), brand);
    carton.add(tape);
    carton.position.set(2.35, 0.75, -0.4);
    carton.rotation.set(0.35, -0.6, 0.12);
    world.add(carton);
    floaters.push({ obj: carton, base: carton.position.clone(), spin: new Vector3(), phase: 2.4, amp: 0.12 });

    // Two capsules: the pharmaceutical side of the business
    const c1 = capsule(GREEN, WHITE, 0.15, 0.42);
    c1.position.set(1.9, 2.0, 0.2);
    c1.rotation.set(0.3, 0.2, -0.8);
    world.add(c1);
    floaters.push({ obj: c1, base: c1.position.clone(), spin: new Vector3(), phase: 0.6, amp: 0.1 });
    const c2 = capsule(RED, WHITE, 0.12, 0.34);
    c2.position.set(-2.55, -0.25, 0.4);
    c2.rotation.set(-0.2, 0.4, 0.9);
    world.add(c2);
    floaters.push({ obj: c2, base: c2.position.clone(), spin: new Vector3(), phase: 3.1, amp: 0.1 });

    // Delivery arcs from the plinth out to facilities, with travelling light
    const hubs = Array.from({ length: 7 }, (_, i) => {
      const a = -0.35 + (i / 6) * (Math.PI + 0.7);
      return new Vector3(Math.cos(a) * 3.1, -1.32, Math.sin(a) * 1.5 + 0.3);
    });
    const arcMat = new LineBasicMaterial({ color: GREEN_LIGHT, transparent: true, opacity: 0.6, blending: AdditiveBlending, depthWrite: false });
    disposables.push(arcMat);
    const curves = hubs.map((h) => {
      const from = new Vector3(h.x, 0, h.z).normalize().multiplyScalar(2.3).setY(-1.2);
      const mid = from.clone().add(h).multiplyScalar(0.5).setY(-0.55);
      return new QuadraticBezierCurve3(from, mid, h);
    });
    curves.forEach((c) => {
      const geo = new BufferGeometry().setFromPoints(c.getPoints(40));
      disposables.push(geo);
      world.add(new Line(geo, arcMat));
    });
    const hubGeo = new BufferGeometry().setFromPoints(hubs);
    const hubMat = new PointsMaterial({ color: MINT, size: 0.12, transparent: true, opacity: 0.9, blending: AdditiveBlending, depthWrite: false });
    world.add(new Points(hubGeo, hubMat));
    disposables.push(hubGeo, hubMat);
    const pulsePos = new Float32Array(curves.length * 3);
    const pulseGeo = new BufferGeometry();
    pulseGeo.setAttribute('position', new BufferAttribute(pulsePos, 3));
    const pulseMat = new PointsMaterial({ color: new Color('#c9f0d8'), size: 0.16, transparent: true, blending: AdditiveBlending, depthWrite: false });
    world.add(new Points(pulseGeo, pulseMat));
    disposables.push(pulseGeo, pulseMat);
    const tmp = new Vector3();
    tickers.push((t) => {
      curves.forEach((c, i) => {
        c.getPoint((t * 0.22 + i * 0.37) % 1, tmp);
        pulsePos.set([tmp.x, tmp.y, tmp.z], i * 3);
      });
      pulseGeo.attributes.position.needsUpdate = true;
    });

    camera.position.set(0, 1.7, 9.2);
    camera.lookAt(0, 0.3, 0);
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
      if (i === 0) f.obj.rotation.y = swayOnly ? f.base.x + Math.sin(t * 0.3) * f.spin.y : t * f.spin.y;
      else {
        f.obj.rotation.x += f.spin.x * 0.01;
        f.obj.rotation.y += f.spin.y * 0.01;
        f.obj.rotation.z += f.spin.z * 0.01;
      }
    });
    dust.rotation.y = t * 0.02;
    tickers.forEach((fn) => fn(t));
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
