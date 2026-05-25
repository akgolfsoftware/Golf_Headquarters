/**
 * SparkBars + SparkLine — minimal bar and polyline charts
 * Server components — pure SVG, no state.
 */

interface SparkBarsProps {
  values: number[];
  height?: number;
  accent?: string;
  highlight?: number;
}

export function SparkBars({
  values,
  height = 56,
  accent = "#005840",
  highlight,
}: SparkBarsProps) {
  const max = Math.max(...values) * 1.05;

  return (
    <svg
      viewBox={`0 0 ${values.length * 14} ${height}`}
      width="100%"
      height={height}
      preserveAspectRatio="none"
      style={{ display: "block" }}
    >
      {values.map((v, i) => {
        const h = (v / max) * height;
        const isHi = i === (highlight ?? -1);
        return (
          <rect
            key={i}
            x={i * 14 + 2}
            y={height - h}
            width={10}
            height={h}
            rx={1.5}
            fill={isHi ? "#D1F843" : accent}
            opacity={isHi ? 1 : 0.85}
          />
        );
      })}
    </svg>
  );
}

interface SparkLineProps {
  values: number[];
  height?: number;
  color?: string;
}

export function SparkLine({
  values,
  height = 36,
  color = "#005840",
}: SparkLineProps) {
  const w = 120;
  const max = Math.max(...values);
  const min = Math.min(...values);

  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = height - ((v - min) / (max - min || 1)) * (height - 6) - 3;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${w} ${height}`}
      width="100%"
      height={height}
      preserveAspectRatio="none"
    >
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
