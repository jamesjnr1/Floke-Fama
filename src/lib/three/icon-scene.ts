/**
 * Hero centrepiece: a simple healthcare symbol drawn in dots, in the same style as the original
 * capsule. It turns gently inside two orbit rings that carry light pulses out to facility nodes,
 * and a red accent echoes the logo's dot.
 *   cross: a medical cross with a heartbeat line across it (healthcare)
 *   tube: a blood sample tube with bubbles rising (diagnostics)
 *   microscope: a laboratory microscope with a red sample on the stage (laboratory)
 *   ultrasound: a portable ultrasound (after the Mindray DP-10 in the Shop) with a live scan on its screen
 * Lines and points only (no lights), so it stays cheap on phones. Lazy chunk; returns a cleanup.
 */
import { prefersReducedMotion } from '@/lib/a11y';
import {
  AdditiveBlending, BufferAttribute, BufferGeometry, CanvasTexture, Color, CylinderGeometry, Group, Line, LineBasicMaterial,
  Mesh, MeshBasicMaterial, PerspectiveCamera, Points, PointsMaterial, Scene, SphereGeometry, Sprite, SpriteMaterial,
  Matrix4, TorusGeometry, Vector3, WebGLRenderer,
} from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export type HeroIcon = 'cross' | 'tube' | 'microscope' | 'ultrasound';

const STEP = 0.11; // dot spacing
const GREEN_BRIGHT = new Color('#8fd1a9'); // light enough to read on the green hero
const MINT = new Color('#e6f6ec');
const BLOOD = new Color('#ff7084');
const RED = new Color('#e4283c');

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

/** Dots on a rounded box (w × h × d, corner r), as rings stacked along y, with both ends filled. */
function roundedBoxDots(w: number, h: number, d: number, r: number): number[] {
  const pts: number[] = [];
  const ring = (y: number, inset: number, stagger: number) => {
    const ww = w - 2 * inset;
    const dd = d - 2 * inset;
    if (ww <= 0 || dd <= 0) return;
    const rr = Math.min(Math.max(0.001, r - inset), ww / 2, dd / 2);
    const a = ww / 2 - rr;
    const b = dd / 2 - rr;
    const segs: [number, (u: number) => [number, number]][] = [
      [2 * a, (u) => [-a + u, dd / 2]],
      [(Math.PI / 2) * rr, (u) => [a + Math.sin(u / rr) * rr, b + Math.cos(u / rr) * rr]],
      [2 * b, (u) => [ww / 2, b - u]],
      [(Math.PI / 2) * rr, (u) => [a + Math.cos(u / rr) * rr, -b - Math.sin(u / rr) * rr]],
      [2 * a, (u) => [a - u, -dd / 2]],
      [(Math.PI / 2) * rr, (u) => [-a - Math.sin(u / rr) * rr, -b - Math.cos(u / rr) * rr]],
      [2 * b, (u) => [-ww / 2, -b + u]],
      [(Math.PI / 2) * rr, (u) => [-a - Math.cos(u / rr) * rr, b + Math.sin(u / rr) * rr]],
    ];
    const length = segs.reduce((n, [l]) => n + l, 0);
    const n = Math.max(1, Math.round(length / STEP));
    for (let i = 0; i < n; i++) {
      let s = ((i + stagger) / n) * length;
      for (const [l, f] of segs) {
        if (s <= l) {
          const [x, z] = f(Math.max(0, s));
          pts.push(x, y, z);
          break;
        }
        s -= l;
      }
    }
  };
  let k = 0;
  for (let y = -h / 2 + r; y <= h / 2 - r + 1e-6; y += STEP) ring(y, 0, (k++ % 2) * 0.5);
  const edge = Math.max(1, Math.round(((Math.PI / 2) * r) / STEP));
  for (let j = 1; j <= edge; j++) {
    const t = (j / edge) * (Math.PI / 2);
    const inset = r * (1 - Math.cos(t));
    ring(h / 2 - r + Math.sin(t) * r, inset, (j % 2) * 0.5);
    ring(-h / 2 + r - Math.sin(t) * r, inset, (j % 2) * 0.5);
  }
  for (let inset = r + STEP; inset < Math.min(w, d) / 2; inset += STEP) {
    ring(h / 2, inset, 0);
    ring(-h / 2, inset, 0);
  }
  return pts;
}

/** Dots on a surface of revolution around y, following a profile of [radius, y] points. */
function latheDots(profile: [number, number][]): number[] {
  const pts: number[] = [];
  let carry = 0;
  let k = 0;
  for (let i = 1; i < profile.length; i++) {
    const [r0, y0] = profile[i - 1];
    const [r1, y1] = profile[i];
    const len = Math.hypot(r1 - r0, y1 - y0);
    for (let s = carry; s <= len; s += STEP) {
      const u = s / len;
      const r = r0 + (r1 - r0) * u;
      const y = y0 + (y1 - y0) * u;
      const n = Math.max(1, Math.round((Math.PI * 2 * r) / STEP));
      const off = (k++ % 2) * 0.5;
      for (let j = 0; j < n; j++) {
        const a = ((j + off) / n) * Math.PI * 2;
        pts.push(Math.cos(a) * r, y, Math.sin(a) * r);
      }
      carry = s + STEP - len;
    }
  }
  return pts;
}

/** Evenly spread random dots on any mesh, about one per STEP² of surface. */
function sampleDots(geo: BufferGeometry, step = STEP): number[] {
  const mesh = new Mesh(geo);
  const sampler = new MeshSurfaceSampler(mesh).build();
  const pos = geo.getAttribute('position');
  let area = 0;
  const a = new Vector3(), b = new Vector3(), c = new Vector3();
  for (let i = 0; i < pos.count; i += 3) {
    a.fromBufferAttribute(pos, i);
    b.fromBufferAttribute(pos, i + 1);
    c.fromBufferAttribute(pos, i + 2);
    area += b.sub(a).cross(c.sub(a)).length() / 2;
  }
  const n = Math.round(area / (step * step * 0.85));
  const pts: number[] = [];
  const p = new Vector3();
  for (let i = 0; i < n; i++) {
    sampler.sample(p);
    pts.push(p.x, p.y, p.z);
  }
  return pts;
}

interface Built {
  points: number[];
  colors?: (x: number, y: number, z: number) => Color;
  occluders: BufferGeometry[];
  /** Extra lines/sprites; returns a per-frame update. */
  extras?: (group: Group, track: (d: { dispose: () => void }) => void) => (t: number) => void;
  tilt?: number;
}

function heartbeatLine(group: Group, track: (d: { dispose: () => void }) => void, from: number, to: number, y: number, z: number, amp: number) {
  const beat = (u: number) => {
    if (u > 0.18 && u < 0.26) return Math.sin(((u - 0.18) / 0.08) * Math.PI) * 0.15;
    if (u > 0.32 && u < 0.36) return (u - 0.32) / 0.04;
    if (u >= 0.36 && u < 0.41) return 1 - ((u - 0.36) / 0.05) * 1.4;
    if (u >= 0.41 && u < 0.44) return -0.4 + ((u - 0.41) / 0.03) * 0.4;
    if (u > 0.52 && u < 0.66) return Math.sin(((u - 0.52) / 0.14) * Math.PI) * 0.25;
    return 0;
  };
  const N = 160;
  const pts = Array.from({ length: N }, (_, i) => new Vector3(from + (i / (N - 1)) * (to - from), y + beat(i / (N - 1)) * amp, z));
  const geo = new BufferGeometry().setFromPoints(pts);
  const mat = new LineBasicMaterial({ color: '#ffffff', transparent: true, depthWrite: false });
  group.add(new Line(geo, mat));
  const tex = glowTexture('rgba(190,240,210,1)');
  const headMat = new SpriteMaterial({ map: tex, transparent: true, blending: AdditiveBlending, depthWrite: false });
  const head = new Sprite(headMat);
  head.scale.setScalar(0.35);
  group.add(head);
  [geo, mat, tex, headMat].forEach(track);
  return (t: number) => {
    const drawn = Math.max(2, Math.floor(((t * 0.4) % 1) * N));
    geo.setDrawRange(0, drawn);
    head.position.copy(pts[drawn - 1]);
  };
}

function build(icon: HeroIcon): Built {
  if (icon === 'cross') {
    const T = 1.05; // arm thickness
    const L = 3.0; // arm length
    const Dp = 0.75; // depth
    const r = 0.2;
    const eps = 0.03;
    const vertical = roundedBoxDots(T, L, Dp, r);
    const horizontal = roundedBoxDots(T, L, Dp, r);
    const points: number[] = [];
    for (let i = 0; i < vertical.length; i += 3) {
      const [x, y, z] = [vertical[i], vertical[i + 1], vertical[i + 2]];
      if (Math.abs(y) >= T / 2 - eps) points.push(x, y, z); // the centre square comes from the horizontal arm
    }
    for (let i = 0; i < horizontal.length; i += 3) {
      const [x, y, z] = [horizontal[i + 1], horizontal[i], horizontal[i + 2]]; // lay the arm on its side
      if (!(Math.abs(x) < T / 2 - eps && Math.abs(z) < Dp / 2 - eps)) points.push(x, y, z);
    }
    const occA = new RoundedBoxGeometry(T * 0.96, L * 0.98, Dp * 0.94, 3, r);
    const occB = new RoundedBoxGeometry(L * 0.98, T * 0.96, Dp * 0.94, 3, r);
    return {
      points,
      occluders: [occA, occB],
      extras: (g, track) => heartbeatLine(g, track, -L / 2 + 0.22, L / 2 - 0.22, -0.05, Dp / 2 + 0.02, 0.4),
    };
  }
  if (icon === 'tube') {
    const r = 0.62;
    const bottom = -1.25;
    const top = 1.45;
    const level = 0.1; // blood level
    const profile: [number, number][] = [];
    for (let i = 0; i <= 10; i++) {
      const a = (i / 10) * (Math.PI / 2);
      profile.push([Math.sin(a) * r, bottom - Math.cos(a) * r]);
    }
    profile.push([r, top], [r + 0.09, top + 0.05], [r + 0.09, top + 0.14]);
    const points = latheDots(profile);
    // The blood's surface
    for (let rr = r - STEP; rr > 0.02; rr -= STEP) {
      const n = Math.round((Math.PI * 2 * rr) / STEP);
      for (let j = 0; j < n; j++) points.push(Math.cos((j / n) * Math.PI * 2) * rr, level, Math.sin((j / n) * Math.PI * 2) * rr);
    }
    const occ = mergeGeometries([
      new CylinderGeometry(r * 0.95, r * 0.95, level - bottom, 32, 1, true).translate(0, (level + bottom) / 2, 0), // glass above the blood stays see-through
      new SphereGeometry(r * 0.95, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2).translate(0, bottom, 0),
    ].map((g) => g.toNonIndexed()));
    return {
      points,
      colors: (_x, y) => (y <= level + 0.01 ? BLOOD : MINT),
      occluders: [occ!],
      tilt: -0.35,
      extras: (g, track) => {
        // Bubbles rising through the blood
        const B = 7;
        const pos = new Float32Array(B * 3);
        const geo = new BufferGeometry();
        geo.setAttribute('position', new BufferAttribute(pos, 3));
        const mat = new PointsMaterial({ color: '#ffd9de', size: 0.08, transparent: true, opacity: 0.9, depthWrite: false });
        g.add(new Points(geo, mat));
        [geo, mat].forEach(track);
        return (t: number) => {
          for (let i = 0; i < B; i++) {
            const u = (t * 0.18 + i / B) % 1;
            const a = i * 2.4;
            pos.set([Math.cos(a) * 0.22, bottom - 0.2 + u * (level - bottom + 0.15), Math.sin(a) * 0.22 + 0.15], i * 3);
          }
          geo.attributes.position.needsUpdate = true;
        };
      },
    };
  }
  if (icon === 'ultrasound') {
    // Portable ultrasound: keyboard base, a screen tilted back on its hinge, a carry handle on top.
    const pts: number[] = [];
    const place = (local: number[], m: Matrix4, keep: (x: number, y: number, z: number) => boolean = () => true) => {
      const v = new Vector3();
      for (let i = 0; i < local.length; i += 3) {
        if (!keep(local[i], local[i + 1], local[i + 2])) continue;
        v.set(local[i], local[i + 1], local[i + 2]).applyMatrix4(m);
        pts.push(v.x, v.y, v.z);
      }
    };
    const baseM = new Matrix4().makeRotationX(0.12).setPosition(0, -1.0, 0.35);
    const SW = 2.5, SH = 1.65, SD = 0.16; // screen
    const screenM = new Matrix4().makeRotationX(-0.16).setPosition(0, 0.12, -0.45);
    const VIEW = { w: SW - 0.36, h: SH - 0.34 }; // the open display area
    place(roundedBoxDots(2.7, 0.3, 1.75, 0.12), baseM);
    place(roundedBoxDots(SW, SH, SD, 0.14), screenM, (x, y, z) => !(z > SD / 2 - 0.02 && Math.abs(x) < VIEW.w / 2 && Math.abs(y) < VIEW.h / 2));
    // Handle: an arch of dots over the screen
    const handleM = new Matrix4().makeRotationX(-0.16).setPosition(0, 0.12 + SH / 2 - 0.05, -0.45);
    const handle: number[] = [];
    for (let a = 0; a <= Math.PI + 1e-6; a += STEP / 0.62) for (let k = -1; k <= 1; k++) handle.push(Math.cos(a) * 0.95, Math.sin(a) * 0.42, k * 0.05);
    place(handle, handleM);
    const occs = [
      new RoundedBoxGeometry(2.62, 0.24, 1.66, 2, 0.1).applyMatrix4(baseM),
      new RoundedBoxGeometry(SW * 0.97, SH * 0.97, SD * 0.8, 2, 0.12).applyMatrix4(screenM),
    ];
    return {
      points: pts,
      occluders: occs,
      extras: (g, track) => {
        // The live scan: a fan with speckle and a beam sweeping back and forth
        const screen = new Group();
        screen.applyMatrix4(screenM);
        g.add(screen);
        const z = SD / 2 + 0.02;
        const apex = new Vector3(0, VIEW.h / 2 - 0.08, z);
        const R = VIEW.h - 0.16;
        const A = 0.62; // half-angle of the fan
        const at = (ang: number, r: number) => new Vector3(apex.x + Math.sin(ang) * r, apex.y - Math.cos(ang) * r, z);
        const outline = [at(-A, 0.18)];
        for (let i = 0; i <= 40; i++) outline.push(at(-A + (i / 40) * 2 * A, R));
        outline.push(at(A, 0.18));
        for (let i = 0; i <= 10; i++) outline.push(at(A - (i / 10) * 2 * A, 0.18));
        // A thin frame round the display
        const fw = VIEW.w / 2, fh = VIEW.h / 2;
        const frameGeo = new BufferGeometry().setFromPoints([new Vector3(-fw, -fh, z), new Vector3(fw, -fh, z), new Vector3(fw, fh, z), new Vector3(-fw, fh, z), new Vector3(-fw, -fh, z)]);
        const frameMat = new LineBasicMaterial({ color: MINT, transparent: true, opacity: 0.35, depthWrite: false });
        screen.add(new Line(frameGeo, frameMat));
        track(frameGeo);
        track(frameMat);
        const fanGeo = new BufferGeometry().setFromPoints(outline);
        const fanMat = new LineBasicMaterial({ color: MINT, transparent: true, opacity: 0.55, depthWrite: false });
        screen.add(new Line(fanGeo, fanMat));
        // The image: speckle plus a few bright tissue layers, with a dark oval (an organ) in the middle.
        // Each dot keeps its angle so it can light up as the beam passes, like a live scan.
        const speck: number[] = [];
        const angles: number[] = [];
        const base: number[] = [];
        let seed = 7;
        const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
        const oval = (p: Vector3) => ((p.x - 0.1) / 0.36) ** 2 + ((p.y - (apex.y - R * 0.62)) / 0.2) ** 2;
        const push = (ang: number, r: number, b: number) => {
          const p = at(ang, r);
          if (oval(p) < 1) return;
          speck.push(p.x, p.y, p.z);
          angles.push(ang);
          base.push(b);
        };
        for (let i = 0; i < 420; i++) push((rand() * 2 - 1) * A * 0.96, 0.24 + rand() * (R - 0.28), 0.35);
        for (const [depth, wobble] of [[0.32, 0.03], [0.5, 0.05], [0.86, 0.04]] as const)
          for (let i = 0; i < 70; i++) {
            const ang = (i / 69 - 0.5) * 2 * A * 0.92;
            push(ang, R * depth + Math.sin(ang * 9 + depth * 20) * wobble, 0.75);
          }
        for (let i = 0; i < 46; i++) {
          // bright rim of the oval
          const t = (i / 46) * Math.PI * 2;
          const p = new Vector3(0.1 + Math.cos(t) * 0.38, apex.y - R * 0.62 + Math.sin(t) * 0.22, z);
          speck.push(p.x, p.y, p.z);
          angles.push(Math.atan2(p.x - apex.x, apex.y - p.y));
          base.push(0.85);
        }
        const speckGeo = new BufferGeometry();
        speckGeo.setAttribute('position', new BufferAttribute(new Float32Array(speck), 3));
        const speckCol = new Float32Array(speck.length);
        speckGeo.setAttribute('color', new BufferAttribute(speckCol, 3));
        const speckMat = new PointsMaterial({ vertexColors: true, size: 0.034, transparent: true, depthWrite: false, blending: AdditiveBlending });
        screen.add(new Points(speckGeo, speckMat));
        const beamGeo = new BufferGeometry().setFromPoints([at(0, 0.05), at(0, R)]);
        const beamMat = new LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.85, depthWrite: false });
        screen.add(new Line(beamGeo, beamMat));
        // The logo's red dot: the transducer at the top of the fan, where the beam starts
        const tex = glowTexture('rgba(228,40,60,1)');
        const mat = new SpriteMaterial({ map: tex, transparent: true, blending: AdditiveBlending, depthWrite: false });
        const source = new Sprite(mat);
        source.position.copy(apex).setZ(z + 0.01);
        screen.add(source);
        const coreGeo = new BufferGeometry().setFromPoints([source.position.clone()]);
        const coreMat = new PointsMaterial({ color: RED, size: 0.09, transparent: true, depthWrite: false });
        screen.add(new Points(coreGeo, coreMat));
        // Keyboard: a trackball ring and two rows of keys
        const deck = new Group();
        deck.applyMatrix4(baseM);
        g.add(deck);
        const ringPts = Array.from({ length: 49 }, (_, k) => new Vector3(Math.cos((k / 48) * Math.PI * 2) * 0.17, 0.16, 0.38 + Math.sin((k / 48) * Math.PI * 2) * 0.17));
        const ringGeo = new BufferGeometry().setFromPoints(ringPts);
        const lineMat = new LineBasicMaterial({ color: MINT, transparent: true, opacity: 0.7, depthWrite: false });
        deck.add(new Line(ringGeo, lineMat));
        const keys: number[] = [];
        for (const zz of [-0.35, -0.12]) for (let x = -1.0; x <= 1.0 + 1e-6; x += 0.2) keys.push(x, 0.16, zz);
        const keyGeo = new BufferGeometry();
        keyGeo.setAttribute('position', new BufferAttribute(new Float32Array(keys), 3));
        const keyMat = new PointsMaterial({ color: '#ffffff', size: 0.06, transparent: true, opacity: 0.85, depthWrite: false });
        deck.add(new Points(keyGeo, keyMat));
        [speckGeo, speckMat, beamGeo, beamMat, tex, mat, coreGeo, coreMat, ringGeo, lineMat, keyGeo, keyMat].forEach(track);
        const tint = new Color('#d7f2e1');
        return (t: number) => {
          const ang = Math.sin(t * 1.2) * A * 0.95;
          const pos = beamGeo.getAttribute('position') as BufferAttribute;
          const a0 = at(ang, 0.05), a1 = at(ang, R);
          pos.setXYZ(0, a0.x, a0.y, a0.z);
          pos.setXYZ(1, a1.x, a1.y, a1.z);
          pos.needsUpdate = true;
          for (let i = 0; i < angles.length; i++) {
            const lit = Math.exp(-((angles[i] - ang) ** 2) / 0.03);
            const v = base[i] * (0.45 + 0.75 * lit);
            speckCol[i * 3] = tint.r * v;
            speckCol[i * 3 + 1] = tint.g * v;
            speckCol[i * 3 + 2] = tint.b * v;
          }
          speckGeo.attributes.color.needsUpdate = true;
          source.scale.setScalar(0.42 + 0.14 * Math.sin(t * 3));
        };
      },
    };
  }
  // microscope: side view, eyepiece up and to the left
  const parts = [
    new RoundedBoxGeometry(2.1, 0.3, 1.3, 3, 0.12).translate(0.1, -1.55, 0),
    new TorusGeometry(0.95, 0.17, 12, 48, Math.PI * 1.05).rotateZ(-Math.PI / 2).translate(0.45, -0.3, 0),
    new RoundedBoxGeometry(1.3, 0.12, 1.0, 2, 0.05).translate(-0.35, -0.55, 0),
    new CylinderGeometry(0.24, 0.24, 1.55, 24).rotateZ(0.42).translate(-0.12, 0.62, 0),
    new CylinderGeometry(0.13, 0.17, 0.4, 20).rotateZ(0.42).translate(-0.5, -0.24, 0),
    new CylinderGeometry(0.17, 0.2, 0.42, 20).rotateZ(0.42).translate(0.3, 1.52, 0),
    new CylinderGeometry(0.22, 0.22, 1.1, 24).rotateX(Math.PI / 2).translate(0.45, -0.3, 0),
  ].map((g) => {
    const ng = g.toNonIndexed();
    ng.deleteAttribute('uv');
    ng.deleteAttribute('normal');
    return ng;
  });
  const merged = mergeGeometries(parts)!;
  merged.computeVertexNormals();
  return {
    points: sampleDots(merged, 0.075),
    colors: (_x, y) => GREEN_BRIGHT.clone().lerp(MINT, Math.min(1, (y + 1.7) / 3.4)),
    occluders: [merged],
    extras: (g, track) => {
      // A red sample on the slide
      const tex = glowTexture('rgba(228,40,60,1)');
      const mat = new SpriteMaterial({ map: tex, transparent: true, blending: AdditiveBlending, depthWrite: false });
      const s = new Sprite(mat);
      s.position.set(-0.55, -0.45, 0.2);
      g.add(s);
      [tex, mat].forEach(track);
      return (t: number) => s.scale.setScalar(0.45 + 0.15 * Math.sin(t * 3));
    },
  };
}

export function mountIcon(container: HTMLElement, icon: HeroIcon = 'cross', onReady?: () => void): () => void {
  const reduceMotion = prefersReducedMotion();
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  } catch {
    return () => {};
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.domElement.style.cssText = 'width:100%;height:100%;display:block';
  container.appendChild(renderer.domElement);

  const scene = new Scene();
  const camera = new PerspectiveCamera(36, 1, 0.1, 100);
  camera.position.set(0, 0.3, 8.2);
  camera.lookAt(0, 0, 0);
  const tilt = new Group();
  scene.add(tilt);
  const shape = new Group();
  tilt.add(shape);
  const disposables: { dispose: () => void }[] = [];
  const track = (d: { dispose: () => void }) => disposables.push(d);

  const built = build(icon);
  tilt.rotation.z = built.tilt ?? 0;
  if (icon === 'ultrasound') shape.scale.setScalar(1.18);
  const pos = new Float32Array(built.points);
  const count = pos.length / 3;
  const col = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const c = built.colors ? built.colors(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]) : GREEN_BRIGHT.clone().lerp(MINT, Math.min(1, Math.max(0, (pos[i * 3 + 1] + 1.4) / 2.8)));
    col.set([c.r, c.g, c.b], i * 3);
  }
  const dotGeo = new BufferGeometry();
  dotGeo.setAttribute('position', new BufferAttribute(pos, 3));
  dotGeo.setAttribute('color', new BufferAttribute(col, 3));
  const dotMat = new PointsMaterial({ vertexColors: true, size: 0.042, transparent: true, opacity: 0.92, depthWrite: false });
  shape.add(new Points(dotGeo, dotMat));
  track(dotGeo);
  track(dotMat);
  // Invisible inner surfaces write depth only, so dots on the far side are hidden and the form reads as solid
  const occMat = new MeshBasicMaterial({ colorWrite: false, polygonOffset: true, polygonOffsetFactor: 2, polygonOffsetUnits: 2 });
  track(occMat);
  for (const g of built.occluders) {
    const m = new Mesh(g, occMat);
    m.renderOrder = -1;
    shape.add(m);
    track(g);
  }
  const update = built.extras?.(shape, track);

  // The logo's red dot (the cross has it at the centre; the others carry their own red)
  let red: Sprite | undefined;
  if (icon === 'cross') {
    const redTex = glowTexture('rgba(228,40,60,1)');
    const redMat = new SpriteMaterial({ map: redTex, transparent: true, blending: AdditiveBlending, depthWrite: false });
    red = new Sprite(redMat);
    red.position.set(0, 1.05, 0.42); // on the upper arm
    const coreGeo = new BufferGeometry().setFromPoints([red.position.clone()]);
    const coreMat = new PointsMaterial({ color: RED, size: 0.1, transparent: true, depthWrite: false });
    shape.add(red, new Points(coreGeo, coreMat));
    [redTex, redMat, coreGeo, coreMat].forEach(track);
  }

  // Two orbit rings with facility nodes and light pulses travelling round them
  const ringMat = new LineBasicMaterial({ color: MINT, transparent: true, opacity: 0.3, depthWrite: false });
  const nodeMat = new PointsMaterial({ color: MINT, size: 0.09, transparent: true, opacity: 0.95, blending: AdditiveBlending, depthWrite: false });
  const pulseTex = glowTexture('rgba(190,240,210,1)');
  const pulseMat = new PointsMaterial({ map: pulseTex, size: 0.24, transparent: true, blending: AdditiveBlending, depthWrite: false });
  [ringMat, nodeMat, pulseTex, pulseMat].forEach(track);
  const PULSES = 3;
  const rings = [
    { radius: 2.75, tilt: [1.2, 0, -0.25], speed: 0.07, nodes: 5 },
    { radius: 3.15, tilt: [-0.55, 0, 0.45], speed: -0.05, nodes: 4 },
  ].map(({ radius, tilt: [x, y, z], speed, nodes }) => {
    const g = new Group();
    g.rotation.set(x, y, z);
    const at = (a: number) => new Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius);
    const ringGeo = new BufferGeometry().setFromPoints(Array.from({ length: 161 }, (_, k) => at((k / 160) * Math.PI * 2)));
    const nodeGeo = new BufferGeometry().setFromPoints(Array.from({ length: nodes }, (_, k) => at((k / nodes) * Math.PI * 2 + 0.4)));
    const pulsePos = new Float32Array(PULSES * 3);
    const pulseGeo = new BufferGeometry();
    pulseGeo.setAttribute('position', new BufferAttribute(pulsePos, 3));
    g.add(new Line(ringGeo, ringMat), new Points(nodeGeo, nodeMat), new Points(pulseGeo, pulseMat));
    [ringGeo, nodeGeo, pulseGeo].forEach(track);
    scene.add(g);
    return { radius, speed, pulsePos, pulseGeo };
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
    shape.rotation.y = icon === 'tube' ? t * 0.25 : Math.sin(t * 0.3) * (icon === 'microscope' ? 0.3 : icon === 'ultrasound' ? 0.5 : 0.45) + (icon === 'ultrasound' ? -0.25 : 0); // the tube turns; the others sway, front in view
    tilt.rotation.x = eased.y * 0.15;
    tilt.rotation.y = eased.x * 0.3;
    tilt.position.y = Math.sin(t * 0.8) * 0.06;
    update?.(t);
    rings.forEach((r) => {
      for (let k = 0; k < PULSES; k++) {
        const a = t * r.speed * Math.PI * 2 + (k / PULSES) * Math.PI * 2;
        r.pulsePos.set([Math.cos(a) * r.radius, 0, Math.sin(a) * r.radius], k * 3);
      }
      r.pulseGeo.attributes.position.needsUpdate = true;
    });
    red?.scale.setScalar(0.45 + 0.2 * Math.sin(t * 3));
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

  if (reduceMotion) render(2.2);
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
    renderer.dispose();
    renderer.domElement.remove();
  };
}
