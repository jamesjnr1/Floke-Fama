/**
 * Hero centrepiece: a laboratory analyser modelled in 3D (no photo, no downloaded model).
 * A rounded instrument body with a live touchscreen (blood-count histograms that redraw),
 * a green status light, and a sample bay where a test tube rises to the probe every few seconds.
 * The machine sways gently and leans toward the pointer. Loaded lazily in its own chunk.
 * Returns a cleanup function that disposes everything.
 */
import { prefersReducedMotion } from '@/lib/a11y';
import {
  ACESFilmicToneMapping, AdditiveBlending, BoxGeometry, BufferAttribute, BufferGeometry, CanvasTexture, Color, CylinderGeometry,
  DirectionalLight, DoubleSide, EdgesGeometry, Group, HemisphereLight, LineBasicMaterial, LineSegments, Material, Mesh,
  MeshBasicMaterial, MeshPhysicalMaterial, MeshStandardMaterial, Object3D, PerspectiveCamera, PlaneGeometry,
  PMREMGenerator, Points, PointsMaterial, SRGBColorSpace, Scene, Texture, TorusGeometry, Vector3, WebGLRenderer,
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

export type AnalyserStyle = 'studio' | 'dots' | 'hologram';

const W = 1.7; // body width
const H = 2.0; // body height
const D = 1.45; // body depth
const FRONT = D / 2;
const MINT = new Color('#8fd1a9');
const GLOW = new Color('#5fd08f');
const RED = new Color('#e4283c');

/** The touchscreen: a dark clinical UI with three histograms and a sweeping cursor. */
function screenPainter() {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 440;
  const g = canvas.getContext('2d')!;
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  const values = [['WBC', '6.84'], ['RBC', '4.92'], ['HGB', '14.1'], ['HCT', '42.6'], ['PLT', '254']];
  const curve = (x0: number, y0: number, w: number, h: number, peaks: [number, number, number][], color: string, t: number) => {
    g.beginPath();
    g.moveTo(x0, y0);
    for (let i = 0; i <= 80; i++) {
      const u = i / 80;
      let v = 0;
      for (const [m, s, a] of peaks) v += a * Math.exp(-((u - m) ** 2) / (2 * s * s));
      v *= 0.92 + 0.08 * Math.sin(t * 2 + u * 9);
      g.lineTo(x0 + u * w, y0 - Math.min(1, v) * h);
    }
    g.lineTo(x0 + w, y0);
    g.closePath();
    g.fillStyle = color.replace('1)', '0.22)');
    g.fill();
    g.strokeStyle = color;
    g.lineWidth = 3;
    g.stroke();
  };
  const paint = (t: number) => {
    const bg = g.createLinearGradient(0, 0, 0, 440);
    bg.addColorStop(0, '#0a1d14');
    bg.addColorStop(1, '#06110b');
    g.fillStyle = bg;
    g.fillRect(0, 0, 640, 440);
    // header
    g.fillStyle = 'rgba(255,255,255,0.06)';
    g.fillRect(0, 0, 640, 54);
    g.fillStyle = '#e6f6ec';
    g.font = '600 22px sans-serif';
    g.fillText('CBC + 5-DIFF', 24, 35);
    g.fillStyle = '#5fd08f';
    g.beginPath();
    g.roundRect(520, 14, 100, 26, 13);
    g.fill();
    g.fillStyle = '#06110b';
    g.font = '700 15px sans-serif';
    g.fillText('READY', 543, 33);
    // values
    g.font = '500 17px sans-serif';
    values.forEach(([k, v], i) => {
      const y = 100 + i * 66;
      g.fillStyle = 'rgba(230,246,236,0.55)';
      g.fillText(k, 24, y);
      g.fillStyle = '#ffffff';
      g.font = '700 30px sans-serif';
      g.fillText(v, 24, y + 32);
      g.font = '500 17px sans-serif';
    });
    // histograms
    const panel = (y: number, label: string, peaks: [number, number, number][], color: string, phase: number) => {
      g.fillStyle = 'rgba(255,255,255,0.04)';
      g.fillRect(170, y - 104, 446, 112);
      g.fillStyle = 'rgba(230,246,236,0.5)';
      g.font = '600 14px sans-serif';
      g.fillText(label, 182, y - 84);
      curve(182, y, 422, 76, peaks, color, t + phase);
    };
    panel(176, 'WBC', [[0.22, 0.06, 0.9], [0.52, 0.09, 0.55], [0.78, 0.06, 0.3]], 'rgba(95,208,143,1)', 0);
    panel(300, 'RBC', [[0.45, 0.13, 0.95]], 'rgba(143,209,169,1)', 1);
    panel(424, 'PLT', [[0.2, 0.1, 0.85], [0.6, 0.2, 0.2]], 'rgba(228,40,60,1)', 2);
    // sweeping cursor
    const x = 182 + ((t * 0.25) % 1) * 422;
    g.fillStyle = 'rgba(255,255,255,0.35)';
    g.fillRect(x, 72, 2, 356);
    texture.needsUpdate = true;
  };
  return { texture, paint };
}

/** Soft contact shadow under the machine, drawn once (cheaper than real shadows). */
function shadowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(0,0,0,0.55)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  return new CanvasTexture(c);
}

/** Evenly spaced dots over the faces of a box (used by the dotted style). */
function boxDots(w: number, h: number, d: number, step: number) {
  const pts: number[] = [];
  const face = (n: [number, number, number], u: [number, number, number], v: [number, number, number], su: number, sv: number, off: number) => {
    for (let a = -su / 2 + step / 2; a < su / 2; a += step)
      for (let b = -sv / 2 + step / 2; b < sv / 2; b += step)
        pts.push(n[0] * off + u[0] * a + v[0] * b, n[1] * off + u[1] * a + v[1] * b, n[2] * off + u[2] * a + v[2] * b);
  };
  face([0, 0, 1], [1, 0, 0], [0, 1, 0], w, h, d / 2);
  face([0, 0, -1], [1, 0, 0], [0, 1, 0], w, h, d / 2);
  face([1, 0, 0], [0, 0, 1], [0, 1, 0], d, h, w / 2);
  face([-1, 0, 0], [0, 0, 1], [0, 1, 0], d, h, w / 2);
  face([0, 1, 0], [1, 0, 0], [0, 0, 1], w, d, h / 2);
  return new Float32Array(pts);
}

export function mountAnalyser(container: HTMLElement, style: AnalyserStyle = 'studio', onReady?: () => void): () => void {
  const reduceMotion = prefersReducedMotion();
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  } catch {
    return () => {};
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.domElement.style.cssText = 'width:100%;height:100%;display:block';
  container.appendChild(renderer.domElement);

  const scene = new Scene();
  const camera = new PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(2.3, 1.35, 6.1);
  camera.lookAt(0, -0.08, 0);
  const textures: Texture[] = [];

  if (style === 'studio') {
    const pmrem = new PMREMGenerator(renderer);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    textures.push(env);
    pmrem.dispose();
    scene.add(new HemisphereLight('#ffffff', '#0b2a19', 0.6));
    const key = new DirectionalLight('#ffffff', 1.4);
    key.position.set(3, 5, 4);
    const rim = new DirectionalLight(MINT, 1.6);
    rim.position.set(-4, 2, -3);
    scene.add(key, rim);
  }

  const rig = new Group(); // sway + pointer
  scene.add(rig);
  const machine = new Group();
  rig.add(machine);

  // --- Materials per style
  const ghost = style === 'hologram';
  const mat = {
    body: style === 'studio'
      ? new MeshPhysicalMaterial({ color: '#f2f5f3', roughness: 0.38, metalness: 0, clearcoat: 0.6, clearcoatRoughness: 0.3 })
      : new MeshBasicMaterial({ color: MINT, transparent: true, opacity: ghost ? 0.1 : 0.0, depthWrite: false, side: DoubleSide }),
    plinth: style === 'studio'
      ? new MeshStandardMaterial({ color: '#9fb0a6', roughness: 0.6 })
      : new MeshBasicMaterial({ color: MINT, transparent: true, opacity: 0.0, depthWrite: false }),
    dark: style === 'studio'
      ? new MeshStandardMaterial({ color: '#0d1712', roughness: 0.35, metalness: 0.2 })
      : new MeshBasicMaterial({ color: '#06110b', transparent: true, opacity: ghost ? 0.35 : 0.85 }),
    metal: style === 'studio'
      ? new MeshStandardMaterial({ color: '#d7dcd9', roughness: 0.2, metalness: 0.9 })
      : new MeshBasicMaterial({ color: '#e6f6ec' }),
    glass: style === 'studio'
      ? new MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.05, transmission: 0, transparent: true, opacity: 0.35 })
      : new MeshBasicMaterial({ color: '#e6f6ec', transparent: true, opacity: 0.35 }),
    blood: new MeshBasicMaterial({ color: '#b3122a' }),
    led: new MeshBasicMaterial({ color: GLOW }),
    red: new MeshBasicMaterial({ color: RED }),
    lines: new LineBasicMaterial({ color: MINT, transparent: true, opacity: ghost ? 0.9 : 0.55 }),
  };
  const lined: Mesh[] = []; // meshes that get outline edges in the dotted / hologram styles
  const add = (geo: BufferGeometry, m: Material, x: number, y: number, z: number, outline = true, parent: Object3D = machine) => {
    const mesh = new Mesh(geo, m);
    mesh.position.set(x, y, z);
    parent.add(mesh);
    if (outline) lined.push(mesh);
    return mesh;
  };

  // --- Body, plinth, top lid seam
  add(new RoundedBoxGeometry(W, H, D, 4, 0.14), mat.body, 0, 0, 0);
  add(new RoundedBoxGeometry(W - 0.1, 0.12, D - 0.1, 2, 0.05), mat.plinth, 0, -H / 2 - 0.05, 0);

  // --- Touchscreen with bezel (upper front, slightly left)
  const screen = screenPainter();
  textures.push(screen.texture);
  add(new RoundedBoxGeometry(1.2, 0.86, 0.05, 2, 0.04), mat.dark, -0.12, 0.38, FRONT + 0.01);
  const display = add(new PlaneGeometry(1.1, 0.76), new MeshBasicMaterial({ map: screen.texture, toneMapped: false }), -0.12, 0.38, FRONT + 0.037, false);

  // --- Green status light across the front
  add(new BoxGeometry(W - 0.34, 0.025, 0.02), mat.led, 0, -0.14, FRONT + 0.004, false);

  // --- Sample bay (lower right): recess, probe, rising test tube
  add(new RoundedBoxGeometry(0.46, 0.62, 0.08, 2, 0.05), mat.dark, 0.5, -0.56, FRONT - 0.01);
  const probe = add(new CylinderGeometry(0.012, 0.012, 0.3, 8), mat.metal, 0.5, -0.36, FRONT + 0.06, false);
  const tube = new Group();
  machine.add(tube);
  add(new CylinderGeometry(0.055, 0.05, 0.36, 20, 1, true), mat.glass, 0, 0, 0, false, tube);
  add(new CylinderGeometry(0.046, 0.042, 0.2, 20), mat.blood, 0, -0.07, 0, false, tube);
  add(new CylinderGeometry(0.062, 0.062, 0.06, 20), mat.red, 0, 0.2, 0, false, tube); // cap
  tube.position.set(0.5, -0.82, FRONT + 0.06);

  // --- Controls (lower left): two buttons and a small red indicator (the logo's red dot)
  add(new CylinderGeometry(0.05, 0.05, 0.03, 24), mat.dark, -0.55, -0.45, FRONT + 0.01, false).rotation.x = Math.PI / 2;
  add(new CylinderGeometry(0.05, 0.05, 0.03, 24), mat.dark, -0.38, -0.45, FRONT + 0.01, false).rotation.x = Math.PI / 2;
  const indicator = add(new CylinderGeometry(0.022, 0.022, 0.02, 16), mat.red, -0.55, -0.62, FRONT + 0.01, false);
  indicator.rotation.x = Math.PI / 2;

  // --- Side vents (right side)
  for (let i = 0; i < 7; i++) add(new BoxGeometry(0.01, 0.022, 0.62), mat.dark, W / 2 + 0.001, -0.5 + i * 0.07, -0.18, false);

  // --- Style extras
  if (style !== 'studio') {
    // Outlines of every main part
    for (const m of lined) {
      // Outline the part's bounding box: crisp lines even where the surface is rounded
      m.geometry.computeBoundingBox();
      const size = m.geometry.boundingBox!.getSize(new Vector3());
      const box = new BoxGeometry(size.x, size.y, size.z);
      const e = new LineSegments(new EdgesGeometry(box), mat.lines);
      box.dispose();
      e.position.copy(m.position);
      e.rotation.copy(m.rotation);
      m.parent!.add(e);
    }
  }
  let dots: Points | undefined;
  if (style === 'dots') {
    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(boxDots(W - 0.06, H - 0.06, D - 0.06, 0.075), 3));
    dots = new Points(geo, new PointsMaterial({ color: MINT, size: 0.022, transparent: true, opacity: 0.85, depthWrite: false }));
    machine.add(dots);
  }
  let carousel: Group | undefined;
  let scan: Mesh | undefined;
  if (ghost) {
    // Inside the shell: a turning rack of tubes and a scanning light plane
    carousel = new Group();
    carousel.position.set(0, -0.45, -0.1);
    machine.add(carousel);
    add(new TorusGeometry(0.42, 0.01, 6, 64), mat.led, 0, 0, 0, false, carousel).rotation.x = Math.PI / 2;
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      add(new CylinderGeometry(0.035, 0.03, 0.26, 12), i % 3 === 0 ? mat.red : mat.metal, Math.cos(a) * 0.42, 0.1, Math.sin(a) * 0.42, false, carousel);
    }
    scan = add(new PlaneGeometry(W - 0.1, D - 0.1), new MeshBasicMaterial({ color: GLOW, transparent: true, opacity: 0.18, side: DoubleSide, blending: AdditiveBlending, depthWrite: false }), 0, 0, 0, false);
    scan.rotation.x = -Math.PI / 2;
  }

  // Contact shadow
  const shadowTex = shadowTexture();
  textures.push(shadowTex);
  const shadow = new Mesh(new PlaneGeometry(3.4, 2.6), new MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: style === 'studio' ? 0.9 : 0.5 }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -H / 2 - 0.12;
  rig.add(shadow);
  void display;
  void probe;

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

  let lastPaint = -1;
  const render = (t: number) => {
    eased.x += (pointer.x - eased.x) * 0.04;
    eased.y += (pointer.y - eased.y) * 0.04;
    rig.rotation.y = -0.42 + Math.sin(t * 0.35) * 0.32 + eased.x * 0.25; // sway, front stays in view
    rig.rotation.x = eased.y * 0.08;
    machine.position.y = Math.sin(t * 0.9) * 0.04;
    // Test tube: rises to the probe, holds, lowers (6-second cycle)
    const c = (t % 6) / 6;
    const lift = c < 0.15 ? c / 0.15 : c < 0.55 ? 1 : c < 0.7 ? 1 - (c - 0.55) / 0.15 : 0;
    tube.position.y = -0.82 + 0.18 * (lift * lift * (3 - 2 * lift));
    (mat.led as MeshBasicMaterial).color.copy(GLOW).multiplyScalar(0.75 + 0.25 * Math.sin(t * 2.4));
    if (carousel) carousel.rotation.y = t * 0.6;
    if (scan) scan.position.y = Math.sin(t * 0.8) * (H / 2 - 0.1);
    if (t - lastPaint > 0.08) {
      screen.paint(t);
      lastPaint = t;
    }
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

  if (reduceMotion) render(1.2);
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
    scene.traverse((o) => {
      const m = o as Mesh;
      m.geometry?.dispose();
      const mm = m.material as Material | Material[] | undefined;
      (Array.isArray(mm) ? mm : mm ? [mm] : []).forEach((x) => x.dispose());
    });
    textures.forEach((x) => x.dispose());
    renderer.dispose();
    renderer.domElement.remove();
  };
}
