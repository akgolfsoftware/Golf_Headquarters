import Link from "next/link";
import {
  Calendar,
  ClipboardList,
  Info,
  MessageSquare,
  Trophy,
} from "lucide-react";

const IKON_MAP: Record<
  string,
  React.ComponentType<{ className?: string; strokeWidth?: number }>
> = {
  booking: Calendar,
  plan: ClipboardList,
  achievement: Trophy,
  melding: MessageSquare,
  system: Info,
};

type Props = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  readAt: Date | null;
  createdAt: Date;
  IconName?: string;
};

export function NotificationItem({
  type,
  title,
  body,
  link,
  readAt,
  createdAt,
}: Props) {
  const Icon = IKON_MAP[type] ?? Info;
  const inner = (
    <div
      className={`flex items-start gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40 ${
        !readAt ? "border-primary/30 bg-primary/5" : ""
      }`}
    >
      <span className="mt-0.5 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-4 w-4" strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-display text-sm font-semibold tracking-tight">
            {title}
          </h3>
          <span className="font-mono text-[10px] uppercase tracking-[0.05em] text-muted-foreground">
            {createdAt.toLocaleDateString("nb-NO", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        {body && (
          <p className="mt-1 text-sm text-muted-foreground">{body}</p>
        )}
      </div>
      {!readAt && (
        <span className="mt-1 inline-block h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
      )}
    </div>
  );
  return (
    <li>
      {link ? <Link href={link}>{inner}</Link> : inner}
    </li>
  );
}
