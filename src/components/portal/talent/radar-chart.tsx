/**
 * SVG pentagonal radar for de 5 talent-aksene (1–10).
 * Server-renderbar (ren SVG, ingen klient-state).
 *
 * Aksene rendres i fast rekkefølge:
 *   0: Fysisk · 1: Teknikk · 2: Taktikk · 3: Mental · 4: Motivasjon
 */

export const AXIS_KEYS = [
  "fysisk",
  "teknikk",
  "taktikk",
  "mental",
  "motivasjon",
] as const;

export type AxisKey = (typeof AXIS_KEYS)[number];

export const AXIS_LABELS: Record<AxisKey, string> = {
  fysisk: "Fysisk",
  teknikk: "Teknikk",
  taktikk: "Taktikk",
  mental: "Mental",
  motivasjon: "Motivasjon",
};

export type RadarValues = Record<AxisKey, number | null | undefined>;

type Series = {
  label: string;
  values: RadarValues;
  // Tailwind klassenavn for fill/stroke
  fillClass: string;
  strokeClass: string;
};

type Props = {
  series: Series[];
  size?: number;
  max?: number;
};

function polar(cx: number, cy: number, r: number, angleRad: number) {
  return [cx + r * Math.cos(angleRad), cy + r * Math.sin(angleRad)] as const;
}

export function RadarChart({ series, size = 360, max = 10 }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 56;
  const n = AXIS_KEYS.length;
  // start på toppen (-90deg), klokken rundt
  const angle = (i: number) => (-Math.PI / 2) + (i * 2 * Math.PI) / n;

  // bakgrunns-ringer 2, 4, 6, 8, 10
  const rings = [0.2, 0.4, 0.6, 0.8, 1].map((f) => {
    const points = AXIS_KEYS.map((_, i) => {
      const [x, y] = polar(cx, cy, radius * f, angle(i));
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");
    return { f, points };
  });

  // akse-linjer
  const axes = AXIS_KEYS.map((_, i) => {
    const [x, y] = polar(cx, cy, radius, angle(i));
    return { x2: x, y2: y };
  });

  // serier
  const polygons = series.map((s) => {
    const pts = AXIS_KEYS.map((k, i) => {
      const v = s.values[k] ?? 0;
      const f = Math.max(0, Math.min(1, v / max));
      const [x, y] = polar(cx, cy, radius * f, angle(i));
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");
    return { ...s, pts };
  });

  // label-posisjoner (litt utenfor radius)
  const labels = AXIS_KEYS.map((k, i) => {
    const [x, y] = polar(cx, cy, radius + 28, angle(i));
    return { key: k, label: AXIS_LABELS[k], x, y };
  });

  return (
    <svg
      role="img"
      aria-label="Talent-radar med 5 akser"
      viewBox={`0 0 ${size} ${size}`}
      className="h-auto w-full max-w-md"
    >
      {/* bakgrunns-ringer */}
      {rings.map((r, idx) => (
        <polygon
          key={idx}
          points={r.points}
          className="fill-secondary/40 stroke-border"
          strokeWidth={1}
        />
      ))}
      {/* akser */}
      {axes.map((a, i) => (
        <line
          key={i}
          x1={cx}
          y1={cy}
          x2={a.x2}
          y2={a.y2}
          className="stroke-border"
          strokeWidth={1}
        />
      ))}
      {/* serier */}
      {polygons.map((p) => (
        <polygon
          key={p.label}
          points={p.pts}
          className={`${p.fillClass} ${p.strokeClass}`}
          strokeWidth={2}
          fillOpacity={0.25}
        />
      ))}
      {/* labels */}
      {labels.map((l) => (
        <text
          key={l.key}
          x={l.x}
          y={l.y}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-foreground font-mono text-[10px] uppercase tracking-[0.1em]"
        >
          {l.label}
        </text>
      ))}
    </svg>
  );
}
