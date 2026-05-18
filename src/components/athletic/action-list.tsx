import { cn } from "@/lib/utils";

export type ActionItem = {
  key: string;
  numeric?: string;
  title: React.ReactNode;
  meta?: string;
  tone?: "lime" | "neutral";
};

type ActionListProps = {
  items: ActionItem[];
  variant?: "on-dark" | "on-light";
  className?: string;
};

export function ActionList({ items, variant = "on-dark", className }: ActionListProps) {
  const onDark = variant === "on-dark";
  return (
    <ul className={cn("space-y-0", className)}>
      {items.map((item, idx) => (
        <li
          key={item.key}
          className={cn(
            "flex items-center gap-3 py-2",
            idx < items.length - 1 && (onDark ? "border-b border-white/10" : "border-b border-border"),
          )}
        >
          {item.numeric && (
            <span
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-bold",
                item.tone === "neutral"
                  ? onDark
                    ? "bg-white/15 text-white"
                    : "bg-muted text-muted-foreground"
                  : "bg-accent text-primary",
              )}
            >
              {item.numeric}
            </span>
          )}
          <span
            className={cn(
              "flex-1 text-[13px] leading-snug",
              onDark ? "text-white/90" : "text-foreground",
            )}
          >
            {item.title}
          </span>
          {item.meta && (
            <span
              className={cn(
                "font-mono text-[10px] tracking-[0.04em]",
                onDark ? "text-white/55" : "text-muted-foreground",
              )}
            >
              {item.meta}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
