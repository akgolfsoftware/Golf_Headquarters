import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

type TrendTone = "positive" | "negative" | "neutral";

type KpiCardProps = {
  label: string;
  value: React.ReactNode;
  unit?: string;
  trend?: { value: string; tone?: TrendTone };
  size?: "sm" | "md" | "lg";
  className?: string;
};

const valueSize: Record<NonNullable<KpiCardProps["size"]>, string> = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-3xl",
};

const trendTone: Record<TrendTone, string> = {
  positive: "text-primary",
  negative: "text-destructive",
  neutral: "text-muted-foreground",
};

const trendIcon: Record<TrendTone, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  positive: TrendingUp,
  negative: TrendingDown,
  neutral: Minus,
};

export function KpiCard({ label, value, unit, trend, size = "md", className }: KpiCardProps) {
  const TrendIcon = trend ? trendIcon[trend.tone ?? "positive"] : null;

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-4",
        className,
      )}
    >
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "mt-1.5 font-mono font-semibold leading-none tracking-[-0.02em] text-foreground",
          valueSize[size],
        )}
      >
        {value}
        {unit && <span className="ml-1 text-xs font-normal text-muted-foreground">{unit}</span>}
      </div>
      {trend && TrendIcon && (
        <div
          className={cn(
            "mt-1.5 inline-flex items-center gap-1 font-mono text-[10px] font-medium",
            trendTone[trend.tone ?? "positive"],
          )}
        >
          <TrendIcon className="h-3 w-3" strokeWidth={2} aria-hidden />
          {trend.value}
        </div>
      )}
    </div>
  );
}

type KpiStripProps = {
  children: React.ReactNode;
  /** Antall kolonner på desktop. `cols` overstyrer `columns` hvis begge er satt. */
  columns?: 2 | 3 | 4 | 5;
  cols?: 2 | 3 | 4;
  className?: string;
};

const colMap: Record<2 | 3 | 4 | 5, string> = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  5: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5",
};

export function KpiStrip({ children, columns, cols, className }: KpiStripProps) {
  const resolved: 2 | 3 | 4 | 5 = cols ?? columns ?? 3;
  return <div className={cn("grid gap-4", colMap[resolved], className)}>{children}</div>;
}
