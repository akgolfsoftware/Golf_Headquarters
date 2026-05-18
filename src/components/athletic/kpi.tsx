import { cn } from "@/lib/utils";

type KpiCardProps = {
  label: string;
  value: React.ReactNode;
  unit?: string;
  trend?: { value: string; tone?: "positive" | "negative" | "neutral" };
  size?: "sm" | "md" | "lg";
  className?: string;
};

const valueSize: Record<NonNullable<KpiCardProps["size"]>, string> = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-3xl",
};

const trendTone: Record<NonNullable<NonNullable<KpiCardProps["trend"]>["tone"]>, string> = {
  positive: "text-primary",
  negative: "text-destructive",
  neutral: "text-muted-foreground",
};

export function KpiCard({ label, value, unit, trend, size = "md", className }: KpiCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-3 md:p-4",
        className,
      )}
    >
      <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
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
      {trend && (
        <div
          className={cn(
            "mt-1.5 font-mono text-[10px] font-medium",
            trendTone[trend.tone ?? "positive"],
          )}
        >
          {trend.value}
        </div>
      )}
    </div>
  );
}

type KpiStripProps = {
  children: React.ReactNode;
  columns?: 2 | 3 | 4 | 5;
  className?: string;
};

const colMap: Record<NonNullable<KpiStripProps["columns"]>, string> = {
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-2 md:grid-cols-4",
  5: "grid-cols-2 md:grid-cols-5",
};

export function KpiStrip({ children, columns = 4, className }: KpiStripProps) {
  return <div className={cn("grid gap-2 md:gap-3", colMap[columns], className)}>{children}</div>;
}
