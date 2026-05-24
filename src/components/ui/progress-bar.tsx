import { cn } from "@/lib/utils";

type ProgressBarProps = {
  value: number; // 0-100
  max?: number;
  variant?: "primary" | "accent" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  label?: string;
  className?: string;
};

const variantClasses = {
  primary: "bg-primary",
  accent: "bg-accent",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-destructive",
} as const;

const sizeClasses = {
  sm: "h-1",
  md: "h-1.5",
  lg: "h-2",
} as const;

/**
 * Horizontal progress-bar.
 *
 * Bruk:
 * <ProgressBar value={68} variant="primary" />
 * <ProgressBar value={2} max={100} variant="warning" showLabel label="Kapasitet" />
 */
export function ProgressBar({
  value,
  max = 100,
  variant = "primary",
  size = "md",
  showLabel = false,
  label,
  className,
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="mb-1 flex items-center justify-between gap-2 text-xs">
          {label && (
            <span className="font-mono uppercase tracking-[0.06em] text-muted-foreground">
              {label}
            </span>
          )}
          <span className="font-mono font-semibold tabular-nums">
            {Math.round(pct)}%
          </span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className={cn(
          "w-full overflow-hidden rounded-full bg-muted",
          sizeClasses[size],
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            variantClasses[variant],
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
