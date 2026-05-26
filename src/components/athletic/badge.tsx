import { cn } from "@/lib/utils";

type AthleticBadgeProps = {
  children: React.ReactNode;
  variant?: "primary" | "lime" | "neutral" | "warn" | "urgent" | "ok";
  className?: string;
};

const variantClasses: Record<NonNullable<AthleticBadgeProps["variant"]>, string> = {
  primary: "bg-primary text-accent",
  lime: "bg-accent text-primary",
  neutral: "bg-secondary text-secondary-foreground",
  warn: "bg-warning/15 text-warning",
  urgent: "bg-destructive/15 text-destructive",
  ok: "bg-success/15 text-success",
};

export function AthleticBadge({
  children,
  variant = "primary",
  className,
}: AthleticBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-[3px] font-mono text-[10px] font-bold uppercase tracking-[0.05em]",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
