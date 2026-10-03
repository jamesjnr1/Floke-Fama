/**
 * Hero centrepiece, in glossy, lit 3D. Same meaning as before:
 * - the capsule: healthcare, the field Flokefama serves;
 * - two halves, green and white: equipment, and the reagents and supplies that keep it running;
 * - orbit rings and moving light: the supply and service network, always in motion;
 * - points on the rings: the hospitals and labs it reaches;
 * - the red dot: head office, the red dot from the logo.
 * Physically based materials under a studio environment; no transmission, so it composites cleanly
 * over the hero photo. Loaded lazily in its own chunk. Returns a cleanup function.
 */
import { prefersReducedMotion } from '@/lib/a11y';
import {
  ACESFilmicToneMapping, AdditiveBlending, AmbientLight, CanvasTexture, Color, DirectionalLight, Group,
  LatheGeometry, Mesh, MeshPhysicalMaterial, PerspectiveCamera, PMREMGenerator, PointLight, Scene,
  SphereGeometry, Sprite, SpriteMaterial, SRGBColorSpace, TorusGeometry, Vector2, WebGLRenderer,
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const R = 1.05; // capsule radius
const H = 1.15; // half-length of the straight section

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

/** One half of the capsule as a lathe profile: from the seam, up the wall, round to the pole. */
function halfProfile(r: number) {
  const pts = [new Vector2(r, 0), new Vector2(r, H)];
  for (let i = 1; i <= 24; i++) {
    const a = (i / 24) * (Math.PI / 2);
    pts.push(new Vector2(Math.cos(a) * r, H + Math.sin(a) * r));
  }
  return pts;
}

export function mountCapsule(container: HTMLElement, onReady?: () => void): () => void {
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
  const rim = new PointLight(0x8fd1a9, 30, 20);
  rim.position.set(-3, -3, 2);
  scene.add(key, rim, new AmbientLight(0xffffff, 0.3));

  const camera = new PerspectiveCamera(36, 1, 0.1, 100);
  camera.position.set(0, 0.3, 9.6);
  camera.lookAt(0, 0, 0);
  const tilt = new Group();
  tilt.rotation.z = -0.62; // lie the capsule on a diagonal
  scene.add(tilt);
  const capsule = new Group();
  tilt.add(capsule);
  const disposables: { dispose: () => void }[] = [];
  const keep = <T extends { dispose: () => void }>(d: T) => (disposables.push(d), d);

  // 1. The capsule: glossy green half (equipment) and a white half (reagents and supplies)
  const green = keep(new MeshPhysicalMaterial({ color: 0x257847, roughness: 0.24, clearcoat: 1, clearcoatRoughness: 0.06, sheen: 0.3, sheenColor: new Color(0x8fd1a9) }));
  const white = keep(new MeshPhysicalMaterial({ color: 0xf3f7f4, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.05, sheen: 0.4, sheenColor: new Color(0xdcede2) }));
  const halfGeo = keep(new LatheGeometry(halfProfile(R), 64));
  const top = new Mesh(halfGeo, green);
  const bottom = new Mesh(halfGeo, white);
  bottom.rotation.x = Math.PI; // mirror to the other side of the seam
  capsule.add(top, bottom);
  // Seam band
  const seam = new Mesh(keep(new TorusGeometry(R * 1.005, 0.035, 16, 96)), keep(new MeshPhysicalMaterial({ color: 0xe6f6ec, roughness: 0.15, clearcoat: 1 })));
  seam.rotation.x = Math.PI / 2;
  capsule.add(seam);
  const granuleGeo = keep(new SphereGeometry(1, 24, 16)); // shared sphere for the red dot, beads and pulses

  // 2. The logo's red dot: head office, a glowing red jewel on the seam facing the viewer
  const redMat = keep(new MeshPhysicalMaterial({ color: 0xe4283c, roughness: 0.15, clearcoat: 1, emissive: new Color(0xe4283c), emissiveIntensity: 0.6 }));
  const red = new Mesh(granuleGeo, redMat);
  red.scale.setScalar(0.11);
  red.position.set(0, 0, R * 1.06);
  const redTex = keep(glowTexture('rgba(228,40,60,1)'));
  const redGlow = new Sprite(keep(new SpriteMaterial({ map: redTex, transparent: true, blending: AdditiveBlending, depthWrite: false })));
  redGlow.position.copy(red.position);
  tilt.add(red, redGlow);

  // 3. Two polished orbit rings (the network), beads for the facilities, lights travelling round
  const ringMat = keep(new MeshPhysicalMaterial({ color: 0xd5ecdd, roughness: 0.12, clearcoat: 1, metalness: 0.2, transparent: true, opacity: 0.75 }));
  const beadMat = keep(new MeshPhysicalMaterial({ color: 0xe6f6ec, roughness: 0.08, clearcoat: 1 }));
  const pulseMat = keep(new MeshPhysicalMaterial({ color: 0xffffff, emissive: new Color(0xbff0d2), emissiveIntensity: 2 }));
  const pulseTex = keep(glowTexture('rgba(190,240,210,1)'));
  const pulseGlowMat = keep(new SpriteMaterial({ map: pulseTex, transparent: true, blending: AdditiveBlending, depthWrite: false }));
  const PULSES = 2;
  const rings = [
    { radius: 2.75, tilt: [1.2, 0, -0.25], speed: 0.06, nodes: 5 },
    { radius: 3.15, tilt: [-0.55, 0, 0.45], speed: -0.045, nodes: 4 },
  ].map(({ radius, tilt: [x, y, z], speed, nodes }) => {
    const g = new Group();
    g.rotation.set(x, y, z);
    const ring = new Mesh(keep(new TorusGeometry(radius, 0.022, 12, 200)), ringMat);
    ring.rotation.x = Math.PI / 2;
    g.add(ring);
    for (let k = 0; k < nodes; k++) {
      const a = (k / nodes) * Math.PI * 2 + 0.4;
      const b = new Mesh(granuleGeo, beadMat);
      b.scale.setScalar(0.085);
      b.position.set(Math.cos(a) * radius, 0, Math.sin(a) * radius);
      g.add(b);
    }
    const pulses = Array.from({ length: PULSES }, () => {
      const p = new Mesh(granuleGeo, pulseMat);
      p.scale.setScalar(0.06);
      const glow = new Sprite(pulseGlowMat);
      glow.scale.setScalar(0.45);
      g.add(p, glow);
      return { p, glow };
    });
    scene.add(g);
    return { radius, speed, pulses };
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
    capsule.rotation.y = t * 0.25; // turn on its long axis
    tilt.rotation.x = eased.y * 0.15;
    tilt.rotation.y = eased.x * 0.3;
    tilt.position.y = Math.sin(t * 0.8) * 0.06;
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
