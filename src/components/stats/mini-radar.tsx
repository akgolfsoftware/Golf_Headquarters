/**
 * MiniRadar — 4-axis polygon preview (SG-categories)
 * Server component — pure SVG, no state.
 */

interface MiniRadarProps {
  values?: number[];
  values2?: number[];
  size?: number;
}

export function MiniRadar({
  values = [0.7, 0.5, 0.6, 0.8],
  values2 = [0.85, 0.85, 0.85, 0.85],
  size = 120,
}: MiniRadarProps) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 8;
  const axes = values.length;

  const pt = (val: number, i: number): [number, number] => {
    const a = (Math.PI * 2 * i) / axes - Math.PI / 2;
    return [cx + Math.cos(a) * r * val, cy + Math.sin(a) * r * val];
  };

  const buildPath = (vs: number[]) =>
    vs
      .map((v, i) => pt(v, i))
      .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`)
      .join(" ") + "Z";

  const rings = [0.33, 0.66, 1].map((k, i) => {
    const pts = Array.from({ length: axes }, (_, j) => {
      const a = (Math.PI * 2 * j) / axes - Math.PI / 2;
      return `${cx + Math.cos(a) * r * k},${cy + Math.sin(a) * r * k}`;
    }).join(" ");
    return (
      <polygon key={i} points={pts} fill="none" stroke="#E5E3DD" strokeWidth="1" />
    );
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {rings}
      {Array.from({ length: axes }, (_, j) => {
        const a = (Math.PI * 2 * j) / axes - Math.PI / 2;
        return (
          <line
            key={j}
            x1={cx}
            y1={cy}
            x2={cx + Math.cos(a) * r}
            y2={cy + Math.sin(a) * r}
            stroke="#E5E3DD"
            strokeWidth="1"
          />
        );
      })}
      <path
        d={buildPath(values2)}
        fill="#005840"
        fillOpacity="0.08"
        stroke="#005840"
        strokeOpacity="0.4"
        strokeWidth="1"
        strokeDasharray="2 2"
      />
      <path
        d={buildPath(values)}
        fill="#D1F843"
        fillOpacity="0.45"
        stroke="#005840"
        strokeWidth="1.5"
      />
      {values.map((v, i) => {
        const [x, y] = pt(v, i);
        return <circle key={i} cx={x} cy={y} r="2.5" fill="#005840" />;
      })}
    </svg>
  );
}
