/*
 * PyramideRinger — AK Golf's signature progress visualization.
 *
 * 5 nested half-arcs ("buer"), one per training layer:
 *   FYS  (#005840) — fysisk fundament (outermost = wide base)
 *   TEK  (#1A7D56) — teknikk
 *   SLAG (#D1F843) — slagprogresjon
 *   SPILL (#B8852A) — banespill
 *   TURN (#5E5C57) — turnering (innermost = the peak)
 *
 * Each arc renders a faint background stroke + a foreground stroke whose
 * stroke-dashoffset indicates the layer's progress (0..1).
 *
 * Usage (inside a <script type="text/babel"> bundle that has React on window):
 *   <PyramideRinger size={240} progress={{fys:.82, tek:.65, slag:.48, spill:.34, turn:.18}} showLabels />
 *
 * Side-effect: assigns to window.PyramideRinger so other Babel scripts can use it.
 * No imports — relies on global React (loaded via the standard React+Babel script tags).
 */

const PYR_LAYERS = [
  { key: 'fys',   color: '#005840', label: 'FYS',   name: 'Fysisk' },
  { key: 'tek',   color: '#1A7D56', label: 'TEK',   name: 'Teknikk' },
  { key: 'slag',  color: '#D1F843', label: 'SLAG',  name: 'Slag' },
  { key: 'spill', color: '#B8852A', label: 'SPILL', name: 'Spill' },
  { key: 'turn',  color: '#5E5C57', label: 'TURN',  name: 'Turnering' },
];

function PyramideRinger({
  size = 240,
  progress = { fys: 0.8, tek: 0.65, slag: 0.45, spill: 0.3, turn: 0.15 },
  showLabels = false,
  strokeWidth = 7,
}) {
  // Vertical layout: half-arc (top half) centered horizontally, baseline at bottom.
  const cx = size / 2;
  const cy = size * 0.92;          // baseline near bottom — top of arc has room to breathe
  const maxR = size * 0.42;
  const minR = size * 0.10;
  const step = (maxR - minR) / 4;  // 5 arcs, 4 gaps

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      style={{ display: 'block', overflow: 'visible' }}
      role="img"
      aria-label="Pyramide-progresjon: FYS, TEK, SLAG, SPILL, TURN"
    >
      {PYR_LAYERS.map((layer, i) => {
        const r = maxR - i * step;          // FYS outermost, TURN innermost
        const len = Math.PI * r;             // half-circle arc length
        const pct = Math.max(0, Math.min(1, progress[layer.key] ?? 0));
        const d = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;

        return (
          <g key={layer.key}>
            {/* Track */}
            <path
              d={d}
              stroke={layer.color}
              strokeOpacity="0.16"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              fill="none"
            />
            {/* Progress */}
            <path
              d={d}
              stroke={layer.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={len}
              strokeDashoffset={(1 - pct) * len}
              style={{
                transition: 'stroke-dashoffset 320ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
            {showLabels && (
              /* Place each label at the TOP of its arc so they don't collide.
                 cx,cy is the baseline center; top of arc is at (cx, cy - r). */
              <text
                x={cx}
                y={cy - r - 4}
                fontFamily="'Inter', system-ui, sans-serif"
                fontSize="8.5"
                fontWeight="500"
                letterSpacing="0.06em"
                fill={layer.color}
                textAnchor="middle"
              >
                {layer.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// Compact list view of the same data — pairs nicely beside the rings.
function PyramideLegend({ progress = {}, dense = false }) {
  return (
    <ul style={{
      listStyle: 'none', margin: 0, padding: 0,
      display: 'flex', flexDirection: 'column', gap: dense ? 6 : 10,
    }}>
      {PYR_LAYERS.map(l => {
        const pct = Math.round((progress[l.key] ?? 0) * 100);
        return (
          <li key={l.key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: l.color, flexShrink: 0,
            }} />
            <span style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 12, fontWeight: 500,
              letterSpacing: '0.04em', textTransform: 'uppercase',
              color: '#0A1F18', minWidth: 44,
            }}>{l.label}</span>
            <span style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 12, color: '#5E5C57',
              flex: 1,
            }}>{l.name}</span>
            <span style={{
              fontFamily: "'JetBrains Mono', ui-monospace, monospace",
              fontSize: 12, color: '#0A1F18',
              fontVariantNumeric: 'tabular-nums',
            }}>{pct}%</span>
          </li>
        );
      })}
    </ul>
  );
}

// Expose to other Babel scripts and to plain <script> consumers.
if (typeof window !== 'undefined') {
  window.PyramideRinger = PyramideRinger;
  window.PyramideLegend = PyramideLegend;
  window.PYR_LAYERS = PYR_LAYERS;
}
