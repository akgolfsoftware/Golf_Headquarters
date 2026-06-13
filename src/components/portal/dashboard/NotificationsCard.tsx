"use client";

import Link from "next/link";
import { Bell, MessageCircle, CalendarCheck, Trophy, AlertTriangle, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { AthleticCard } from "@/components/athletic";
import type { NotificationItem } from "@/app/portal/actions";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  COACH: MessageCircle,
  BOOKING: CalendarCheck,
  MILESTONE: Trophy,
  ALERT: AlertTriangle,
  SYSTEM: Settings,
};

function timeLabel(d: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return "nå";
  if (diffMin < 60) return `${diffMin} min siden`;
  if (diffHour < 24) return `${diffHour} t siden`;
  if (diffDay < 7) return `${diffDay} d siden`;
  return d.toLocaleDateString("nb-NO", { day: "numeric", month: "short", timeZone: "Europe/Oslo" });
}

type NotificationsCardProps = {
  count: number;
  notifications: NotificationItem[];
  className?: string;
};

export function NotificationsCard({ count, notifications, className }: NotificationsCardProps) {
  return (
    <AthleticCard
      label={count > 0 ? `Varsler · ${count} ulest${count === 1 ? "" : "e"}` : "Varsler"}
      action={
        <Link href="/portal/varsler" className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-primary hover:opacity-80">
          Se alle →
        </Link>
      }
      className={className}
    >
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-6 text-center">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-muted">
            <Bell size={20} className="text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">Ingen nye varsler.</p>
        </div>
      ) : (
        <ul className="space-y-0">
          {notifications.slice(0, 5).map((n, idx) => {
            const Icon = ICON_MAP[n.type] ?? Bell;
            return (
              <li
                key={n.id}
                className={cn(
                  "flex items-start gap-4 py-4",
                  idx < notifications.length - 1 && "border-b border-border",
                )}
              >
                <div className={cn("mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full", n.unread ? "bg-accent/20" : "bg-muted")}>
                  <Icon size={16} className={n.unread ? "text-accent-foreground" : "text-muted-foreground"} />
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={n.href} className="block text-sm font-semibold text-foreground hover:text-primary">
                    {n.title}
                  </Link>
                  {n.body && <p className="line-clamp-2 text-xs text-muted-foreground">{n.body}</p>}
                  <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">{timeLabel(n.createdAt)}</p>
                </div>
                {n.unread && (
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" aria-label="Ulest" />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </AthleticCard>
  );
}
