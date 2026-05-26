import { cn } from "@/lib/utils";

type SparklineProps = {
  values: number[];
  color?: string;
  width?: number;
  height?: number;
  className?: string;
};

export function Sparkline({
  values,
  color = "hsl(var(--primary))",
  width = 64,
  height = 22,
  className,
}: SparklineProps) {
  const pad = 2;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;

  let points = "";
  if (values.length === 0) {
    const midY = height / 2;
    points = `${pad},${midY} ${width - pad},${midY}`;
  } else if (values.length === 1) {
    const midY = height / 2;
    points = `${pad},${midY} ${width - pad},${midY}`;
  } else {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    const stepX = innerW / (values.length - 1);

    points = values
      .map((v, i) => {
        const x = pad + i * stepX;
        const y =
          range === 0
            ? height / 2
            : pad + innerH - ((v - min) / range) * innerH;
        return `${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(" ");
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
      className={cn("block", className)}
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
