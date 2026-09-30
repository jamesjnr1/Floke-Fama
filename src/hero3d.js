// Flokefama hero: real-time 3D molecule + floating capsules (Three.js).
// Bundled to site/assets/js/hero3d.js with `npm run build:3d`.
// Progressive enhancement: the hero looks complete without it (CSS glow fallback).
import {
  WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh, SphereGeometry, CylinderGeometry,
  LatheGeometry, MeshPhysicalMaterial, Vector2, Vector3, Quaternion, PMREMGenerator,
  DirectionalLight, AmbientLight, BufferGeometry, Float32BufferAttribute, Points, PointsMaterial,
  ACESFilmicToneMapping, SRGBColorSpace, AdditiveBlending, CanvasTexture,
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const BRAND = { green: 0x1f8a4c, mint: 0x6fd89c, red: 0xe4283c, white: 0xf2f6f4 };

function mountHero(container) {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let renderer;
  try {
    renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch {
    return; // No WebGL: the CSS fallback stays visible.
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  container.appendChild(renderer.domElement);

  const scene = new Scene();
  const camera = new PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 11);

  // Studio reflections make the glossy materials look real
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.add(new AmbientLight(0xffffff, 0.6));
  const key = new DirectionalLight(0xffffff, 3.2);
  key.position.set(4, 6, 6);
  const rim = new DirectionalLight(BRAND.mint, 3);
  rim.position.set(-6, -2, -4);
  scene.add(key, rim);

  // ---------- Materials ----------
  const glossy = (color, extra = {}) => new MeshPhysicalMaterial({
    color, roughness: 0.14, metalness: 0.0, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.4, ...extra,
  });
  const matGreen = glossy(BRAND.green);
  const matMint = glossy(BRAND.mint, { roughness: 0.25 });
  const matRed = glossy(BRAND.red);
  const matWhite = glossy(BRAND.white, { roughness: 0.3 });
  const matBond = glossy(0xe8f2ec, { roughness: 0.25, metalness: 0.2 });

  // ---------- Molecule: two fused hexagonal rings with substituents ----------
  const molecule = new Group();
  const atoms = [];
  const hex = (cx) => Array.from({ length: 6 }, (_, k) => {
    const a = Math.PI / 6 + (k * Math.PI) / 3;
    return new Vector3(cx + Math.cos(a), Math.sin(a), 0);
  });
  const addAtom = (p) => {
    const i = atoms.findIndex((q) => q.distanceTo(p) < 0.01);
    if (i >= 0) return i;
    atoms.push(p);
    return atoms.length - 1;
  };
  const bonds = new Set();
  const addBond = (a, b) => bonds.add(a < b ? `${a}-${b}` : `${b}-${a}`);
  for (const cx of [-0.866, 0.866]) {
    const ids = hex(cx).map(addAtom);
    ids.forEach((id, k) => addBond(id, ids[(k + 1) % 6]));
  }
  // Substituents: push outward from selected ring atoms, with depth for a 3D silhouette
  const types = atoms.map(() => 'C');
  const substituents = [
    [1, 'O', 0.95, 0.5], [4, 'N', 0.95, -0.6], [6, 'O', 0.95, 0.7], [8, 'H', 0.8, -0.5], [9, 'C', 1.0, 0.4],
  ];
  const centers = { left: new Vector3(-0.866, 0, 0), right: new Vector3(0.866, 0, 0) };
  for (const [idx, type, len, z] of substituents) {
    const p = atoms[idx];
    if (!p) continue;
    const c = p.x < 0 ? centers.left : centers.right;
    const dir = p.clone().sub(c).setZ(0).normalize();
    const q = p.clone().addScaledVector(dir, len).setZ(z);
    const id = addAtom(q);
    types[id] = type;
    addBond(idx, id);
  }
  // Gentle pucker so the rings aren't perfectly flat
  atoms.forEach((p, i) => { if (types[i] === 'C' && i < 10) p.z += Math.sin(i * 1.7) * 0.18; });

  const atomStyle = { C: [0.26, matGreen], O: [0.3, matRed], N: [0.28, matMint], H: [0.18, matWhite] };
  const sphere = new SphereGeometry(1, 48, 48);
  atoms.forEach((p, i) => {
    const [r, m] = atomStyle[types[i]] || atomStyle.C;
    const mesh = new Mesh(sphere, m);
    mesh.position.copy(p);
    mesh.scale.setScalar(r);
    molecule.add(mesh);
  });
  const cyl = new CylinderGeometry(0.06, 0.06, 1, 20);
  const up = new Vector3(0, 1, 0);
  for (const key of bonds) {
    const [a, b] = key.split('-').map(Number);
    const pa = atoms[a], pb = atoms[b];
    const mesh = new Mesh(cyl, matBond);
    mesh.position.copy(pa).add(pb).multiplyScalar(0.5);
    mesh.scale.y = pa.distanceTo(pb);
    mesh.quaternion.copy(new Quaternion().setFromUnitVectors(up, pb.clone().sub(pa).normalize()));
    molecule.add(mesh);
  }
  molecule.scale.setScalar(1.15);
  scene.add(molecule);

  // ---------- Two-tone capsules ----------
  const halfCapsule = (() => {
    const r = 0.3, h = 0.36, pts = [];
    for (let i = 0; i <= 16; i++) {
      const a = (i / 16) * (Math.PI / 2);
      pts.push(new Vector2(Math.sin(a) * r, -h - Math.cos(a) * r));
    }
    pts.push(new Vector2(r, 0), new Vector2(0, 0));
    return new LatheGeometry(pts, 48);
  })();
  const makeCapsule = (topMat, bottomMat) => {
    const g = new Group();
    const bottom = new Mesh(halfCapsule, bottomMat);
    const top = new Mesh(halfCapsule, topMat);
    top.rotation.z = Math.PI;
    g.add(bottom, top);
    return g;
  };
  const capsules = [
    { g: makeCapsule(matGreen, matWhite), pos: [2.9, 1.7, 0.6], rot: [0.6, 0.2, 0.9], s: 1.0, speed: 0.6 },
    { g: makeCapsule(matRed, matWhite), pos: [-3.3, -0.2, 0.9], rot: [-0.4, 0.5, -0.7], s: 0.8, speed: 0.8 },
    { g: makeCapsule(matGreen, matMint), pos: [-2.4, 2.1, -1.4], rot: [0.9, -0.3, 0.3], s: 0.6, speed: 0.5 },
    { g: makeCapsule(matWhite, matGreen), pos: [2.5, -2.2, -0.8], rot: [0.2, 0.8, -1.2], s: 0.7, speed: 0.7 },
  ];
  capsules.forEach((c) => {
    c.g.position.set(...c.pos);
    c.g.rotation.set(...c.rot);
    c.g.scale.setScalar(c.s);
    scene.add(c.g);
  });

  // ---------- Soft particle field ----------
  const dot = (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const x = c.getContext('2d');
    const grd = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, 'rgba(255,255,255,1)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = grd;
    x.fillRect(0, 0, 64, 64);
    return new CanvasTexture(c);
  })();
  const count = 220, pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 12;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 6 - 1;
  }
  const pGeo = new BufferGeometry();
  pGeo.setAttribute('position', new Float32BufferAttribute(pos, 3));
  const particles = new Points(pGeo, new PointsMaterial({
    size: 0.06, map: dot, color: BRAND.mint, transparent: true, opacity: 0.7, depthWrite: false, blending: AdditiveBlending,
  }));
  scene.add(particles);

  // ---------- Sizing ----------
  const resize = () => {
    const { clientWidth: w, clientHeight: h } = container;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Pull back on narrow screens so nothing is cropped
    camera.position.z = w / h < 0.9 ? 17 : 14;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(container);
  resize();

  // ---------- Interaction ----------
  const pointer = { x: 0, y: 0 }, eased = { x: 0, y: 0 };
  window.addEventListener('pointermove', (e) => {
    pointer.x = (e.clientX / innerWidth) * 2 - 1;
    pointer.y = (e.clientY / innerHeight) * 2 - 1;
  }, { passive: true });

  const render = (t) => {
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
    scene.rotation.y = eased.x * 0.08;
    scene.rotation.x = eased.y * 0.05;
    renderer.render(scene, camera);
  };

  if (reduceMotion) {
    render(1.2);
  } else {
    // Only animate while the hero is on screen and the tab is visible
    let running = true, raf = 0;
    const start = performance.now();
    const loop = () => { render((performance.now() - start) / 1000); raf = requestAnimationFrame(loop); };
    const setRunning = (on) => {
      if (on && !raf) loop();
      if (!on && raf) { cancelAnimationFrame(raf); raf = 0; }
    };
    new IntersectionObserver(([e]) => { running = e.isIntersecting; setRunning(running && !document.hidden); }).observe(container);
    document.addEventListener('visibilitychange', () => setRunning(running && !document.hidden));
    loop();
  }
  container.classList.add('is-ready');
}

const el = document.querySelector('[data-hero-3d]');
if (el) mountHero(el);
