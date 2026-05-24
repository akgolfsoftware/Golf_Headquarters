import { cn } from "@/lib/utils";

type ProgressRingProps = {
  value: number; // 0-100
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: "primary" | "accent" | "success" | "warning" | "danger";
  showLabel?: boolean;
  label?: string;
  className?: string;
};

const variantHsl = {
  primary: "hsl(var(--primary))",
  accent: "hsl(var(--accent))",
  success: "hsl(var(--success))",
  warning: "hsl(var(--warning))",
  danger: "hsl(var(--destructive))",
} as const;

/**
 * Sirkulær progress-ring.
 *
 * Bruk:
 * <ProgressRing value={55} variant="accent" showLabel size={96} />
 */
export function ProgressRing({
  value,
  max = 100,
  size = 80,
  strokeWidth = 6,
  variant = "primary",
  showLabel = false,
  label,
  className,
}: ProgressRingProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const color = variantHsl[variant];

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-lg font-bold tabular-nums">
            {Math.round(pct)}%
          </span>
          {label && (
            <span className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
