import { cn } from "@/lib/utils";
import { AthleticAvatar } from "./avatar";
import { AthleticBadge } from "./badge";

export type QueueItemData = {
  key: string;
  name: string;
  detail: string;
  status: { label: string; variant: "warn" | "urgent" | "ok" | "neutral" };
  avatar?: { src?: string | null; initials?: string };
};

type QueueListProps = {
  items: QueueItemData[];
  className?: string;
};

export function QueueList({ items, className }: QueueListProps) {
  return (
    <ul className={cn("space-y-0", className)}>
      {items.map((it, idx) => (
        <li
          key={it.key}
          className={cn(
            "flex items-center gap-3 py-2.5",
            idx < items.length - 1 && "border-b border-border",
          )}
        >
          {it.avatar && (
            <AthleticAvatar
              src={it.avatar.src}
              initials={it.avatar.initials}
              size="sm"
              status="none"
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold leading-tight tracking-[-0.005em] text-foreground">
              {it.name}
            </p>
            <p className="mt-0.5 truncate font-mono text-[10px] tracking-[0.02em] text-muted-foreground">
              {it.detail}
            </p>
          </div>
          <AthleticBadge variant={it.status.variant === "neutral" ? "neutral" : it.status.variant}>
            {it.status.label}
          </AthleticBadge>
        </li>
      ))}
    </ul>
  );
}
