/**
 * A faint green triangle mesh, drawn once as a static SVG (no canvas or animation, nothing to slow scrolling).
 * Points sit on an even triangular lattice (each row offset by half a step) with a small fixed jitter, and every
 * point joins its right and two lower neighbours, so the lines form tidy triangles. The seed is fixed, so the
 * server and the browser draw the same mesh.
 */
const COLS = 9;
const ROWS = 8;
const STEP = 80;
const W = COLS * STEP;
const H = ROWS * STEP * 0.866;

let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

const grid = Array.from({ length: ROWS + 1 }, (_, r) =>
  Array.from({ length: COLS + 1 }, (_, c) => ({
    x: c * STEP + (r % 2 ? STEP / 2 : 0) + (rand() - 0.5) * 22,
    y: r * STEP * 0.866 + (rand() - 0.5) * 22,
  })),
);

const lines: [number, number, number, number][] = [];
grid.forEach((row, r) =>
  row.forEach((p, c) => {
    const right = row[c + 1];
    if (right) lines.push([p.x, p.y, right.x, right.y]);
    const below = grid[r + 1];
    if (!below) return;
    // Down-left and down-right neighbours on the offset row
    const [dl, dr] = r % 2 ? [below[c], below[c + 1]] : [below[c - 1], below[c]];
    if (dl) lines.push([p.x, p.y, dl.x, dl.y]);
    if (dr) lines.push([p.x, p.y, dr.x, dr.y]);
  }),
);
const nodes = grid.flat();

export function MeshLines({ className }: { className?: string }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMinYMid slice" className={className} aria-hidden>
      <g stroke="#7fd1a5" strokeWidth="0.9" strokeOpacity="0.6" strokeLinecap="round">
        {lines.map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
        ))}
      </g>
      <g fill="#7fd1a5">
        {nodes.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={i % 7 === 0 ? 3 : 1.8} />
        ))}
      </g>
    </svg>
  );
}
