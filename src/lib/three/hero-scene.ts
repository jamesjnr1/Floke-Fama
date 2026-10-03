/**
 * Home hero: a futuristic laboratory diagnostic analyser floating at an angle, wrapped in transparent
 * diagnostic rings and subtle data particles, with a microscope, a rack of test tubes and a
 * patient-monitor panel floating around it. Pearl-white equipment, Flokefama green accents, restrained
 * red highlights and cool blue digital light, under studio lighting with a soft contact shadow, on a
 * transparent canvas over the hero's off-white background.
 * Loaded lazily in its own chunk; pauses off-screen; a still frame for reduced motion.
 * Returns a cleanup function that disposes everything.
 */
import { prefersReducedMotion } from '@/lib/a11y';
import {
  ACESFilmicToneMapping, AdditiveBlending, AmbientLight, BufferGeometry, CanvasTexture, CatmullRomCurve3, Color,
  CylinderGeometry, DirectionalLight, Float32BufferAttribute, Group, Mesh, MeshBasicMaterial, MeshPhysicalMaterial,
  PerspectiveCamera, PlaneGeometry, PMREMGenerator, Points, PointsMaterial, Scene, SphereGeometry, SRGBColorSpace,
  TorusGeometry, TubeGeometry, Vector3, WebGLRenderer,
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

const GREEN = 0x007a4d;
const RED = 0xe3262e;
const BLUE = 0x2f80b7;
const TEAL = 0x63c6b5;

function canvasTexture(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d')!);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

/** The analyser's display: a cool blue interface with result bars and a curve. */
const analyserScreen = () =>
  canvasTexture(512, 320, (g) => {
    const bg = g.createLinearGradient(0, 0, 512, 320);
    bg.addColorStop(0, '#0c2a3d');
    bg.addColorStop(1, '#0f3f5c');
    g.fillStyle = bg;
    g.fillRect(0, 0, 512, 320);
    g.strokeStyle = 'rgba(99,198,181,0.18)';
    g.beginPath();
    for (let x = 0; x < 512; x += 32) {
      g.moveTo(x, 0);
      g.lineTo(x, 320);
    }
    for (let y = 0; y < 320; y += 32) {
      g.moveTo(0, y);
      g.lineTo(512, y);
    }
    g.stroke();
    // curve
    g.strokeStyle = '#63c6b5';
    g.lineWidth = 4;
    g.beginPath();
    for (let x = 30; x <= 300; x += 3) g.lineTo(x, 230 - 130 * Math.exp(-(((x - 140) / 42) ** 2)) - 40 * Math.exp(-(((x - 235) / 22) ** 2)));
    g.stroke();
    // bars
    [0.82, 0.55, 0.7, 0.4].forEach((v, i) => {
      g.fillStyle = 'rgba(255,255,255,0.12)';
      g.fillRect(340, 60 + i * 52, 140, 14);
      g.fillStyle = i === 3 ? '#e3262e' : i % 2 ? '#2f80b7' : '#63c6b5';
      g.fillRect(340, 60 + i * 52, 140 * v, 14);
    });
  });

/** The patient-monitor panel: an ECG trace and two readouts on dark glass. */
const monitorScreen = () =>
  canvasTexture(512, 300, (g) => {
    g.fillStyle = 'rgba(10,30,44,0.92)';
    g.fillRect(0, 0, 512, 300);
    g.strokeStyle = '#63c6b5';
    g.lineWidth = 4;
    g.beginPath();
    let x = 20;
    g.moveTo(x, 120);
    while (x < 360) {
      g.lineTo(x + 30, 120);
      g.lineTo(x + 38, 95);
      g.lineTo(x + 46, 160);
      g.lineTo(x + 54, 40);
      g.lineTo(x + 62, 130);
      g.lineTo(x + 70, 120);
      x += 80;
    }
    g.stroke();
    g.strokeStyle = '#2f80b7';
    g.beginPath();
    for (let i = 20; i < 360; i += 4) g.lineTo(i, 230 + 14 * Math.sin(i / 14));
    g.stroke();
    g.fillStyle = '#63c6b5';
    g.font = '700 54px sans-serif';
    g.fillText('72', 395, 120);
    g.fillStyle = '#e3262e';
    g.font = '700 40px sans-serif';
    g.fillText('98', 400, 240);
  });

/** A soft round shadow for under the floating group. */
const shadowTexture = () =>
  canvasTexture(256, 256, (g) => {
    const r = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    r.addColorStop(0, 'rgba(23,49,58,0.28)');
    r.addColorStop(0.6, 'rgba(23,49,58,0.08)');
    r.addColorStop(1, 'rgba(23,49,58,0)');
    g.fillStyle = r;
    g.fillRect(0, 0, 256, 256);
  });

export function mountHeroScene(container: HTMLElement, onReady?: () => void): () => void {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch {
    return () => {};
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.domElement.style.cssText = 'width:100%;height:100%;display:block';
  container.appendChild(renderer.domElement);

  const disposables: { dispose: () => void }[] = [];
  const keep = <T extends { dispose: () => void }>(d: T) => (disposables.push(d), d);

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = env;
  const key = new DirectionalLight(0xffffff, 1.6);
  key.position.set(5, 8, 6);
  const fill = new DirectionalLight(0xbfe0f5, 0.6); // cool blue fill
  fill.position.set(-6, 2, 4);
  scene.add(key, fill, new AmbientLight(0xffffff, 0.35));

  const camera = new PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0.6, 17.5);
  camera.lookAt(0, 0, 0);

  // Materials
  const pearl = keep(new MeshPhysicalMaterial({ color: 0xf6f7f4, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.08, sheen: 0.5, sheenColor: new Color(0xe8eef0) }));
  const greenMat = keep(new MeshPhysicalMaterial({ color: GREEN, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.1 }));
  const darkGlass = keep(new MeshPhysicalMaterial({ color: 0x17313a, roughness: 0.1, clearcoat: 1, metalness: 0.2 }));
  const glass = keep(new MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.04, clearcoat: 1, transparent: true, opacity: 0.32, depthWrite: false }));
  const redGlow = keep(new MeshPhysicalMaterial({ color: RED, emissive: new Color(RED), emissiveIntensity: 1.1, roughness: 0.2 }));
  const blueGlow = keep(new MeshBasicMaterial({ color: BLUE, transparent: true, opacity: 0.55, depthWrite: false, blending: AdditiveBlending }));
  const tealGlow = keep(new MeshBasicMaterial({ color: TEAL, transparent: true, opacity: 0.5, depthWrite: false, blending: AdditiveBlending }));
  const sphere = keep(new SphereGeometry(1, 24, 16));

  const world = new Group();
  world.rotation.set(0.08, -0.35, 0);
  scene.add(world);

  // 1. The analyser, floating at an angle
  const analyser = new Group();
  analyser.rotation.set(0.12, 0.42, -0.06);
  world.add(analyser);
  const body = new Mesh(keep(new RoundedBoxGeometry(3.4, 2.5, 2.2, 8, 0.35)), pearl);
  analyser.add(body);
  // green accent band wrapping the lower body
  const band = new Mesh(keep(new RoundedBoxGeometry(3.46, 0.18, 2.26, 4, 0.08)), greenMat);
  band.position.y = -0.82;
  analyser.add(band);
  // recessed screen with glowing blue display
  const bezel = new Mesh(keep(new RoundedBoxGeometry(2.2, 1.35, 0.12, 6, 0.08)), darkGlass);
  bezel.position.set(-0.35, 0.28, 1.08);
  analyser.add(bezel);
  const screenTex = keep(analyserScreen());
  const screen = new Mesh(keep(new PlaneGeometry(2.04, 1.2)), keep(new MeshBasicMaterial({ map: screenTex, toneMapped: false })));
  screen.position.set(-0.35, 0.28, 1.15);
  analyser.add(screen);
  // sample carousel on top: a green ring holding glass tubes with coloured caps
  const carousel = new Group();
  carousel.position.set(0.55, 1.3, 0.1);
  analyser.add(carousel);
  carousel.add(new Mesh(keep(new CylinderGeometry(0.85, 0.9, 0.16, 48)), greenMat));
  const tubeGeo = keep(new CylinderGeometry(0.08, 0.08, 0.6, 20));
  const capGeo = keep(new CylinderGeometry(0.095, 0.095, 0.12, 20));
  const capMats = [greenMat, keep(new MeshPhysicalMaterial({ color: BLUE, roughness: 0.3, clearcoat: 1 })), redGlow];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const t = new Mesh(tubeGeo, glass);
    t.position.set(Math.cos(a) * 0.62, 0.36, Math.sin(a) * 0.62);
    const c = new Mesh(capGeo, capMats[i % 3]);
    c.position.set(Math.cos(a) * 0.62, 0.7, Math.sin(a) * 0.62);
    carousel.add(t, c);
  }
  // red status light and a blue light strip
  const status = new Mesh(sphere, redGlow);
  status.scale.setScalar(0.07);
  status.position.set(1.25, 0.85, 1.1);
  analyser.add(status);
  const strip = new Mesh(keep(new PlaneGeometry(0.06, 1.1)), blueGlow);
  strip.position.set(1.3, 0.2, 1.12);
  analyser.add(strip);

  // 2. Transparent diagnostic rings around the analyser, with travelling light beads
  const rings = [
    { r: 3.3, rot: [1.25, 0.1, -0.2], mat: blueGlow, speed: 0.12 },
    { r: 3.75, rot: [1.1, -0.3, 0.35], mat: tealGlow, speed: -0.09 },
    { r: 4.2, rot: [1.4, 0.2, 0.1], mat: blueGlow, speed: 0.06 },
  ].map(({ r, rot, mat, speed }) => {
    const g = new Group();
    g.rotation.set(rot[0], rot[1], rot[2]);
    g.add(new Mesh(keep(new TorusGeometry(r, 0.012, 8, 220)), mat));
    // a glassy wide band for the "transparent ring" look
    const bandRing = new Mesh(keep(new TorusGeometry(r, 0.06, 2, 220)), glass);
    bandRing.scale.z = 0.15;
    g.add(bandRing);
    const bead = new Mesh(sphere, mat === tealGlow ? tealGlow : blueGlow);
    bead.scale.setScalar(0.09);
    g.add(bead);
    world.add(g);
    return { g, r, speed, bead };
  });

  // 3. Microscope, upper left
  const scope = new Group();
  scope.position.set(-3.7, 1.9, -1.2);
  scope.rotation.set(0.1, 0.6, 0.15);
  scope.scale.setScalar(0.62);
  world.add(scope);
  const base = new Mesh(keep(new RoundedBoxGeometry(1.6, 0.25, 1.1, 4, 0.1)), pearl);
  base.position.y = -1.3;
  const arm = new Mesh(keep(new TubeGeometry(new CatmullRomCurve3([new Vector3(0.5, -1.2, 0), new Vector3(0.65, -0.2, 0), new Vector3(0.45, 0.7, 0), new Vector3(0, 1.05, 0)]), 32, 0.17, 12)), pearl);
  const stage = new Mesh(keep(new RoundedBoxGeometry(1.1, 0.1, 0.9, 3, 0.04)), darkGlass);
  stage.position.set(-0.15, -0.35, 0);
  const objective = new Mesh(keep(new CylinderGeometry(0.12, 0.16, 0.6, 20)), greenMat);
  objective.position.set(-0.15, 0.1, 0);
  const head = new Mesh(keep(new RoundedBoxGeometry(0.7, 0.45, 0.6, 4, 0.12)), pearl);
  head.position.set(-0.05, 0.95, 0);
  const eyepiece = new Mesh(keep(new CylinderGeometry(0.1, 0.1, 0.65, 20)), darkGlass);
  eyepiece.position.set(-0.3, 1.35, 0);
  eyepiece.rotation.z = 0.6;
  const slide = new Mesh(keep(new PlaneGeometry(0.5, 0.18)), blueGlow);
  slide.rotation.x = -Math.PI / 2;
  slide.position.set(-0.15, -0.29, 0);
  scope.add(base, arm, stage, objective, head, eyepiece, slide);

  // 4. Test tube rack, lower left
  const rack = new Group();
  rack.position.set(-3.4, -2.2, 0.8);
  rack.rotation.set(0.25, 0.5, -0.12);
  world.add(rack);
  rack.add(new Mesh(keep(new RoundedBoxGeometry(1.7, 0.22, 0.6, 4, 0.08)), greenMat));
  const bigTube = keep(new CylinderGeometry(0.13, 0.13, 1.2, 24));
  const liquidGeo = keep(new CylinderGeometry(0.11, 0.11, 0.55, 24));
  [RED, BLUE, TEAL, GREEN].forEach((c, i) => {
    const x = -0.6 + i * 0.4;
    const t = new Mesh(bigTube, glass);
    t.position.set(x, 0.55, 0);
    const l = new Mesh(liquidGeo, keep(new MeshPhysicalMaterial({ color: c, roughness: 0.15, clearcoat: 1, transparent: true, opacity: 0.85 })));
    l.position.set(x, 0.3, 0);
    rack.add(t, l);
  });

  // 5. Patient-monitor panel, right
  const monitor = new Group();
  monitor.position.set(3.6, -0.6, 1.2);
  monitor.rotation.set(0.05, -0.55, 0.04);
  world.add(monitor);
  monitor.add(new Mesh(keep(new RoundedBoxGeometry(2.3, 1.45, 0.08, 4, 0.1)), glass));
  const monTex = keep(monitorScreen());
  const monScreen = new Mesh(keep(new PlaneGeometry(2.1, 1.25)), keep(new MeshBasicMaterial({ map: monTex, transparent: true, opacity: 0.95, toneMapped: false })));
  monScreen.position.z = 0.05;
  monitor.add(monScreen);
  const monEdge = new Mesh(keep(new PlaneGeometry(2.3, 0.05)), greenMat);
  monEdge.position.set(0, -0.75, 0.05);
  monitor.add(monEdge);

  // 6. Subtle data particles
  let seed = 3;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const pts: number[] = [];
  for (let i = 0; i < 160; i++) {
    const a = rand() * Math.PI * 2;
    const r = 2.5 + rand() * 3.5;
    pts.push(Math.cos(a) * r, (rand() - 0.5) * 6, Math.sin(a) * r * 0.6);
  }
  const dataGeo = keep(new BufferGeometry());
  dataGeo.setAttribute('position', new Float32BufferAttribute(pts, 3));
  const data = new Points(dataGeo, keep(new PointsMaterial({ color: BLUE, size: 0.05, transparent: true, opacity: 0.6, depthWrite: false })));
  world.add(data);

  // 7. Soft contact shadow
  const shadowTex = keep(shadowTexture());
  const shadow = new Mesh(keep(new PlaneGeometry(9, 4)), keep(new MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -3.4;
  scene.add(shadow);

  const floaters = [
    { o: analyser, y: analyser.position.y, s: 0.6, p: 0 },
    { o: scope, y: scope.position.y, s: 0.7, p: 1.4 },
    { o: rack, y: rack.position.y, s: 0.8, p: 2.6 },
    { o: monitor, y: monitor.position.y, s: 0.65, p: 3.7 },
  ];

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = container;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = w / h < 1 ? 20 : 17.5;
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
    world.rotation.y = -0.35 + Math.sin(t * 0.15) * 0.12 + eased.x * 0.12;
    world.rotation.x = 0.08 + eased.y * 0.06;
    for (const f of floaters) f.o.position.y = f.y + Math.sin(t * f.s + f.p) * 0.12;
    shadow.scale.setScalar(1 - Math.sin(t * 0.6) * 0.03);
    carousel.rotation.y = t * 0.3;
    for (const r of rings) {
      const a = t * r.speed * Math.PI * 2;
      r.bead.position.set(Math.cos(a) * r.r, Math.sin(a) * r.r, 0);
    }
    data.rotation.y = t * 0.02;
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
  const sync = () => {
    if (prefersReducedMotion()) {
      setRunning(false);
      render(2);
    } else setRunning(visible && !document.hidden);
  };
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    sync();
  });
  const motionWatch = new MutationObserver(sync);
  motionWatch.observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] });
  sync();
  io.observe(container);
  document.addEventListener('visibilitychange', sync);
  onReady?.();

  return () => {
    setRunning(false);
    motionWatch.disconnect();
    io.disconnect();
    ro.disconnect();
    window.removeEventListener('pointermove', onPointer);
    document.removeEventListener('visibilitychange', sync);
    disposables.forEach((d) => d.dispose());
    env.dispose();
    pmrem.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  };
}
