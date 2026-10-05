/**
 * A faint green network mesh (dots joined by thin lines), drawn once as a static SVG: no canvas or animation, so
 * it costs nothing while scrolling. The points come from a fixed seed, so server and browser draw the same mesh.
 */
function points(seed: number, n: number, w: number, h: number) {
  let s = seed;
  const rand = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  // Weighted to the left, where the mesh shows
  return Array.from({ length: n }, () => ({ x: rand() ** 1.6 * w, y: rand() * h }));
}

const W = 720;
const H = 480;
const nodes = points(20081, 52, W, H);
const links: [number, number][] = [];
nodes.forEach((a, i) =>
  nodes.forEach((b, j) => {
    if (j > i && Math.hypot(a.x - b.x, a.y - b.y) < 104) links.push([i, j]);
  }),
);

export function MeshLines({ className }: { className?: string }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMinYMid slice" className={className} aria-hidden>
      <g stroke="#7fd1a5" strokeWidth="0.8" strokeOpacity="0.55">
        {links.map(([i, j]) => (
          <line key={`${i}-${j}`} x1={nodes[i].x} y1={nodes[i].y} x2={nodes[j].x} y2={nodes[j].y} />
        ))}
      </g>
      <g fill="#7fd1a5">
        {nodes.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={i % 5 === 0 ? 2.6 : 1.6} />
        ))}
      </g>
    </svg>
  );
}
