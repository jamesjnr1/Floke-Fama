/**
 * Hero centrepiece: a simple medical machine in 3D (no photo, no downloaded model).
 * A soft rounded body with one screen showing a heartbeat line, turning slowly and
 * leaning toward the pointer. Loaded lazily in its own chunk. Returns a cleanup function.
 */
import { prefersReducedMotion } from '@/lib/a11y';
import {
  ACESFilmicToneMapping, BoxGeometry, BufferAttribute, BufferGeometry, CanvasTexture, Color, DirectionalLight, EdgesGeometry,
  Group, HemisphereLight, LineBasicMaterial, LineSegments, Material, Mesh, MeshBasicMaterial, MeshPhysicalMaterial,
  PerspectiveCamera, PlaneGeometry, PMREMGenerator, Points, PointsMaterial, SRGBColorSpace, Scene, Texture, WebGLRenderer,
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

export type MachineStyle = 'solid' | 'dots' | 'outline';

const W = 1.9; // body width
const H = 1.5; // body height
const D = 1.1; // body depth
const MINT = new Color('#8fd1a9');

/** The screen: a dark panel with a heartbeat line that draws itself across. */
function heartbeatScreen() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 300;
  const g = canvas.getContext('2d')!;
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  // One beat: flat, small bump, sharp spike, dip, wide bump, flat
  const beat = (u: number) => {
    if (u > 0.3 && u < 0.36) return Math.sin(((u - 0.3) / 0.06) * Math.PI) * 0.12;
    if (u > 0.42 && u < 0.46) return ((u - 0.42) / 0.04) * 0.9;
    if (u >= 0.46 && u < 0.5) return 0.9 - ((u - 0.46) / 0.04) * 1.2;
    if (u >= 0.5 && u < 0.53) return -0.3 + ((u - 0.5) / 0.03) * 0.3;
    if (u > 0.6 && u < 0.72) return Math.sin(((u - 0.6) / 0.12) * Math.PI) * 0.2;
    return 0;
  };
  const paint = (t: number) => {
    g.fillStyle = '#071510';
    g.fillRect(0, 0, 512, 300);
    const head = (t * 0.45) % 1; // where the line is being drawn
    g.lineWidth = 6;
    g.lineCap = 'round';
    g.lineJoin = 'round';
    g.shadowColor = '#5fd08f';
    g.shadowBlur = 14;
    g.strokeStyle = '#7ee2a8';
    g.beginPath();
    for (let i = 0; i <= 200; i++) {
      const x = i / 200;
      if (x > head) break;
      const y = 160 - beat((x * 2) % 1) * 110;
      if (i === 0) g.moveTo(x * 512, y);
      else g.lineTo(x * 512, y);
    }
    g.stroke();
    g.shadowBlur = 0;
    g.fillStyle = '#ffffff';
    g.beginPath();
    g.arc(head * 512, 160 - beat((head * 2) % 1) * 110, 6, 0, Math.PI * 2);
    g.fill();
    texture.needsUpdate = true;
  };
  return { texture, paint };
}

/** Soft contact shadow under the machine, drawn once. */
function shadowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(0,0,0,0.5)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  return new CanvasTexture(c);
}

/** Evenly spaced dots over the visible faces of a box. */
function boxDots(w: number, h: number, d: number, step: number) {
  const pts: number[] = [];
  for (let x = -w / 2; x <= w / 2 + 1e-6; x += step)
    for (let y = -h / 2; y <= h / 2 + 1e-6; y += step) pts.push(x, y, d / 2, x, y, -d / 2);
  for (let z = -d / 2 + step; z < d / 2; z += step) {
    for (let y = -h / 2; y <= h / 2 + 1e-6; y += step) pts.push(w / 2, y, z, -w / 2, y, z);
    for (let x = -w / 2; x <= w / 2 + 1e-6; x += step) pts.push(x, h / 2, z);
  }
  return new Float32Array(pts);
}

export function mountAnalyser(container: HTMLElement, style: MachineStyle = 'solid', onReady?: () => void): () => void {
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
  camera.position.set(1.4, 0.95, 5.1);
  camera.lookAt(0, -0.05, 0);
  const textures: Texture[] = [];

  const rig = new Group();
  scene.add(rig);
  const machine = new Group();
  rig.add(machine);

  const bodyGeo = new RoundedBoxGeometry(W, H, D, 6, 0.28);
  if (style === 'solid') {
    const pmrem = new PMREMGenerator(renderer);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    textures.push(env);
    pmrem.dispose();
    scene.add(new HemisphereLight('#ffffff', '#0b2a19', 0.6));
    const key = new DirectionalLight('#ffffff', 1.3);
    key.position.set(3, 5, 4);
    const rim = new DirectionalLight(MINT, 1.4);
    rim.position.set(-4, 2, -3);
    scene.add(key, rim);
    machine.add(new Mesh(bodyGeo, new MeshPhysicalMaterial({ color: '#f2f5f3', roughness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.3 })));
  } else if (style === 'dots') {
    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(boxDots(W - 0.2, H - 0.2, D - 0.2, 0.085), 3));
    machine.add(new Points(geo, new PointsMaterial({ color: MINT, size: 0.04, transparent: true, opacity: 1, depthWrite: false })));
  } else {
    machine.add(new LineSegments(new EdgesGeometry(bodyGeo, 12), new LineBasicMaterial({ color: MINT, transparent: true, opacity: 0.55 })));
    machine.add(new Mesh(bodyGeo, new MeshBasicMaterial({ color: MINT, transparent: true, opacity: 0.1, depthWrite: false })));
  }

  // The screen, set into the front
  const screen = heartbeatScreen();
  textures.push(screen.texture);
  const bezel = new Mesh(new RoundedBoxGeometry(1.42, 0.92, 0.04, 2, 0.08), new MeshBasicMaterial({ color: '#0b1712' }));
  bezel.position.set(0, 0.08, D / 2 + 0.005);
  const display = new Mesh(new PlaneGeometry(1.3, 0.8), new MeshBasicMaterial({ map: screen.texture, toneMapped: false }));
  display.position.set(0, 0.08, D / 2 + 0.027);
  // One small green light under the screen
  const light = new Mesh(new BoxGeometry(0.26, 0.03, 0.02), new MeshBasicMaterial({ color: '#5fd08f' }));
  light.position.set(0, -0.53, D / 2 + 0.005);
  machine.add(bezel, display, light);

  // Contact shadow
  const shadowTex = shadowTexture();
  textures.push(shadowTex);
  const shadow = new Mesh(new PlaneGeometry(3.4, 2.2), new MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: style === 'solid' ? 0.9 : 0.45 }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -H / 2 - 0.12;
  rig.add(shadow);

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
    rig.rotation.y = -0.35 + Math.sin(t * 0.3) * 0.3 + eased.x * 0.2; // gentle sway, screen stays in view
    rig.rotation.x = eased.y * 0.06;
    machine.position.y = Math.sin(t * 0.9) * 0.04;
    if (t - lastPaint > 0.04) {
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

  if (reduceMotion) render(1.6);
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
