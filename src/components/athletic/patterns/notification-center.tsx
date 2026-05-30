"use client";

import Link from "next/link";
import {
  MessageCircle,
  CalendarCheck,
  Trophy,
  AlertTriangle,
  Settings,
  CheckCheck,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────

export type NotificationType =
  | "COACH"
  | "BOOKING"
  | "MILESTONE"
  | "ALERT"
  | "SYSTEM";

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  time: string; // ISO or pretty
  timeLabel: string; // "for 12 min siden"
  href: string;
  unread: boolean;
};

export type NotificationCenterPatternProps = {
  notifications: Notification[];
  onMarkAllRead?: () => void;
  onMarkOneRead?: (id: string) => void;
};

// ── Type config ────────────────────────────────────────────────

type TypeConfig = {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  pillBg: string;
  pillColor: string;
  label: string;
};

const TYPE_CONFIG: Record<NotificationType, TypeConfig> = {
  COACH: {
    icon: <MessageCircle size={18} />,
    iconBg: "color-mix(in oklab, hsl(var(--accent)) 25%, transparent)",
    iconColor: "hsl(var(--accent-foreground))",
    pillBg: "color-mix(in oklab, hsl(var(--accent)) 20%, transparent)",
    pillColor: "hsl(var(--accent-foreground))",
    label: "COACH",
  },
  BOOKING: {
    icon: <CalendarCheck size={18} />,
    iconBg: "color-mix(in oklab, hsl(var(--info)) 15%, transparent)",
    iconColor: "hsl(var(--info))",
    pillBg: "color-mix(in oklab, hsl(var(--info)) 12%, transparent)",
    pillColor: "hsl(var(--info))",
    label: "BOOKING",
  },
  MILESTONE: {
    icon: <Trophy size={18} />,
    iconBg: "color-mix(in oklab, hsl(var(--primary)) 12%, transparent)",
    iconColor: "hsl(var(--primary))",
    pillBg: "color-mix(in oklab, hsl(var(--primary)) 10%, transparent)",
    pillColor: "hsl(var(--primary))",
    label: "MILESTONE",
  },
  ALERT: {
    icon: <AlertTriangle size={18} />,
    iconBg: "color-mix(in oklab, hsl(var(--destructive)) 12%, transparent)",
    iconColor: "hsl(var(--destructive))",
    pillBg: "color-mix(in oklab, hsl(var(--destructive)) 10%, transparent)",
    pillColor: "hsl(var(--destructive))",
    label: "ALERT",
  },
  SYSTEM: {
    icon: <Settings size={18} />,
    iconBg: "hsl(var(--muted))",
    iconColor: "hsl(var(--muted-foreground))",
    pillBg: "hsl(var(--muted))",
    pillColor: "hsl(var(--muted-foreground))",
    label: "SYSTEM",
  },
};

// ── Date grouping ──────────────────────────────────────────────

type DateGroup = "I DAG" | "I GAR" | "DENNE UKA" | "ELDRE";

function getDateGroup(isoTime: string): DateGroup {
  const now = new Date();
  const date = new Date(isoTime);

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const startOfWeek = new Date(startOfToday);
  // ISO week: Monday as first day
  const dayOfWeek = (startOfToday.getDay() + 6) % 7;
  startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);

  if (date >= startOfToday) return "I DAG";
  if (date >= startOfYesterday) return "I GAR";
  if (date >= startOfWeek) return "DENNE UKA";
  return "ELDRE";
}

const GROUP_ORDER: DateGroup[] = ["I DAG", "I GAR", "DENNE UKA", "ELDRE"];

const GROUP_LABELS: Record<DateGroup, string> = {
  "I DAG": "I DAG",
  "I GAR": "I GAR",
  "DENNE UKA": "DENNE UKA",
  "ELDRE": "ELDRE",
};

function groupNotifications(
  notifications: Notification[]
): Map<DateGroup, Notification[]> {
  const map = new Map<DateGroup, Notification[]>();
  for (const n of notifications) {
    const group = getDateGroup(n.time);
    const existing = map.get(group) ?? [];
    map.set(group, [...existing, n]);
  }
  return map;
}

// ── Sub-components ─────────────────────────────────────────────

function GroupHeader({ label }: { label: string }) {
  return (
    <div
      className="flex items-center gap-4 pt-2 pb-1"
      aria-label={`Gruppe: ${label}`}
    >
      <span
        className="font-mono text-[10px] font-bold tracking-[0.14em] uppercase"
        style={{ color: "hsl(var(--muted-foreground))" }}
      >
        {label}
      </span>
      <div
        className="flex-1 h-px"
        style={{ background: "hsl(var(--border))" }}
        aria-hidden
      />
    </div>
  );
}

function TypePill({ type }: { type: NotificationType }) {
  const cfg = TYPE_CONFIG[type];
  return (
    <span
      className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] rounded-full px-[8px] py-[4px] flex-shrink-0"
      style={{ background: cfg.pillBg, color: cfg.pillColor }}
    >
      {cfg.label}
    </span>
  );
}

function UnreadDot() {
  return (
    <span
      className="w-[8px] h-[8px] rounded-full flex-shrink-0"
      style={{
        background: "hsl(var(--accent))",
        boxShadow: "0 0 0 3px color-mix(in oklab, hsl(var(--accent)) 30%, transparent)",
        animation: "liveBarDot 1.8s ease-in-out infinite",
      }}
      aria-label="Ulest"
    />
  );
}

type NotificationRowProps = {
  notification: Notification;
  onMarkOneRead?: (id: string) => void;
};

function NotificationRow({ notification, onMarkOneRead }: NotificationRowProps) {
  const cfg = TYPE_CONFIG[notification.type];
  const { unread } = notification;

  function handleClick() {
    if (unread && onMarkOneRead) {
      onMarkOneRead(notification.id);
    }
  }

  return (
    <Link
      href={notification.href}
      onClick={handleClick}
      className="lift flex items-start gap-4 px-4 py-4 rounded-[16px] no-underline group"
      style={{
        background: unread
          ? "color-mix(in oklab, hsl(var(--card)) 100%, transparent)"
          : "transparent",
        border: `1px solid ${
          unread ? "hsl(var(--border))" : "transparent"
        }`,
        boxShadow: unread ? "var(--shadow-card)" : undefined,
        color: "inherit",
        display: "flex",
      }}
      aria-label={`${unread ? "Ulest: " : ""}${notification.title}`}
    >
      {/* Left: icon circle */}
      <span
        className="w-10 h-10 rounded-full grid place-items-center flex-shrink-0 mt-[2px]"
        style={{
          background: cfg.iconBg,
          color: cfg.iconColor,
          minWidth: 40,
          minHeight: 40,
        }}
        aria-hidden
      >
        {cfg.icon}
      </span>

      {/* Center: text */}
      <div className="flex-1 min-w-0 flex flex-col gap-[4px]">
        <span
          className="font-display text-[14px] leading-[1.4] truncate"
          style={{
            fontWeight: unread ? 700 : 500,
            color: "hsl(var(--foreground))",
          }}
        >
          {notification.title}
        </span>
        <span
          className="text-sm leading-[1.45] line-clamp-2"
          style={{ color: "hsl(var(--muted-foreground))" }}
        >
          {notification.body}
        </span>
        <span
          className="font-mono text-[10px] uppercase tracking-[0.08em] mt-[2px]"
          style={{ color: "hsl(var(--muted-foreground))" }}
        >
          {notification.timeLabel}
        </span>
      </div>

      {/* Right: pill + unread dot */}
      <div className="flex flex-col items-end gap-2 flex-shrink-0 mt-[2px]">
        <TypePill type={notification.type} />
        {unread && <UnreadDot />}
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center gap-4 py-16 text-center"
      aria-label="Ingen varsler"
    >
      <span
        className="w-12 h-12 rounded-full grid place-items-center"
        style={{
          background: "hsl(var(--muted))",
          color: "hsl(var(--muted-foreground))",
        }}
        aria-hidden
      >
        <CheckCheck size={22} />
      </span>
      <span
        className="font-display text-[15px] font-medium"
        style={{ color: "hsl(var(--muted-foreground))" }}
      >
        Ingen nye varsler
      </span>
      <span
        className="text-sm"
        style={{ color: "hsl(var(--muted-foreground))", opacity: 0.7 }}
      >
        Du er helt ajour.
      </span>
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────

export default function NotificationCenterPattern({
  notifications,
  onMarkAllRead,
  onMarkOneRead,
}: NotificationCenterPatternProps) {
  const hasUnread = notifications.some((n) => n.unread);
  const grouped = groupNotifications(notifications);

  return (
    <section className="w-full max-w-2xl mx-auto flex flex-col gap-2" aria-label="Varsler">
      {/* Top action bar */}
      {hasUnread && (
        <div className="flex justify-end pb-2">
          <button
            type="button"
            onClick={onMarkAllRead}
            className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] rounded-full px-4 py-2 border-0 cursor-pointer transition-colors duration-[160ms]"
            style={{
              background: "hsl(var(--secondary))",
              color: "hsl(var(--secondary-foreground))",
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "hsl(var(--muted))";
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "hsl(var(--secondary))";
            }}
          >
            Marker alle som lest
          </button>
        </div>
      )}

      {/* Empty state */}
      {notifications.length === 0 && <EmptyState />}

      {/* Date groups */}
      {GROUP_ORDER.map((group) => {
        const items = grouped.get(group);
        if (!items || items.length === 0) return null;
        return (
          <div key={group} className="flex flex-col gap-1">
            <GroupHeader label={GROUP_LABELS[group]} />
            <div className="flex flex-col gap-1">
              {items.map((n) => (
                <NotificationRow
                  key={n.id}
                  notification={n}
                  onMarkOneRead={onMarkOneRead}
                />
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
