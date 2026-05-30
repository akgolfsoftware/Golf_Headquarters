"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  ChevronDown,
  ChevronUp,
  Calendar,
  X,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

export type AuditEvent = {
  id: string;
  timestamp: string; // ISO
  timeLabel: string; // "25. mai 2026 14:32"
  actor: { id: string; name: string; initials: string; role: string };
  action: "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "APPROVE" | "REJECT";
  actionLabel: string; // "opprettet" / "oppdaterte" / etc.
  target: { type: string; id: string; label: string; href?: string };
  ipAddress?: string;
  details?: string; // markdown or plain text
};

export type AuditLogPatternProps = {
  events: AuditEvent[];
  filterActors?: string[];
  filterActions?: string[];
  onLoadMore?: () => void;
};

// ── Action styling map ───────────────────────────────────────────────────────

type ActionStyle = {
  color: string;
  bg: string;
  label: string;
};

const ACTION_STYLE: Record<AuditEvent["action"], ActionStyle> = {
  CREATE: {
    color: "var(--color-primary)",
    bg: "color-mix(in oklab, var(--color-primary) 10%, transparent)",
    label: "CREATE",
  },
  UPDATE: {
    color: "var(--color-info)",
    bg: "color-mix(in oklab, var(--color-info) 10%, transparent)",
    label: "UPDATE",
  },
  DELETE: {
    color: "var(--color-destructive)",
    bg: "color-mix(in oklab, var(--color-destructive) 10%, transparent)",
    label: "DELETE",
  },
  LOGIN: {
    color: "hsl(var(--muted-foreground))",
    bg: "color-mix(in oklab, hsl(var(--foreground)) 6%, transparent)",
    label: "LOGIN",
  },
  APPROVE: {
    color: "var(--color-success)",
    bg: "color-mix(in oklab, var(--color-success) 10%, transparent)",
    label: "APPROVE",
  },
  REJECT: {
    color: "var(--color-warning)",
    bg: "color-mix(in oklab, var(--color-warning) 10%, transparent)",
    label: "REJECT",
  },
};

// ── Avatar initials ──────────────────────────────────────────────────────────

// Deterministic avatar background based on actor id
const AVATAR_GRADIENTS = [
  "var(--gradient-avatar-1)",
  "var(--gradient-avatar-2)",
  "var(--gradient-avatar-3)",
  "var(--gradient-avatar-4)",
  "var(--gradient-avatar-5)",
  "var(--gradient-avatar-6)",
  "var(--gradient-avatar-7)",
  "var(--gradient-avatar-8)",
];

function avatarGradient(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff;
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

// ── Sub-components ───────────────────────────────────────────────────────────

function ActorAvatar({ actor }: { actor: AuditEvent["actor"] }) {
  return (
    <div
      className="shrink-0 w-10 h-10 rounded-full grid place-items-center select-none"
      style={{ background: avatarGradient(actor.id) }}
      aria-label={actor.name}
      title={`${actor.name} · ${actor.role}`}
    >
      <span className="font-mono text-[11px] font-bold text-white tracking-[0.04em]">
        {actor.initials}
      </span>
    </div>
  );
}

function ActionBadge({ action }: { action: AuditEvent["action"] }) {
  const style = ACTION_STYLE[action];
  return (
    <span
      className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] rounded-full"
      style={{
        background: style.bg,
        color: style.color,
        padding: "3px 10px",
      }}
    >
      {style.label}
    </span>
  );
}

function EventDetails({
  details,
  expanded,
  onToggle,
}: {
  details: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={onToggle}
        className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground cursor-pointer border-0 bg-transparent p-0 hover:text-foreground transition-colors"
      >
        {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        {expanded ? "Skjul detaljer" : "Vis detaljer"}
      </button>

      {expanded && (
        <p
          className="mt-2 m-0 font-mono text-[12px] text-muted-foreground leading-[1.6] rounded-lg p-4"
          style={{
            background: "color-mix(in oklab, hsl(var(--foreground)) 4%, transparent)",
            borderLeft: "2px solid hsl(var(--border))",
          }}
        >
          {details}
        </p>
      )}
    </div>
  );
}

// ── Event row ────────────────────────────────────────────────────────────────

function EventRow({ event }: { event: AuditEvent }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex gap-4 py-4">
      {/* Left: avatar */}
      <ActorAvatar actor={event.actor} />

      {/* Center: content */}
      <div className="flex-1 min-w-0">
        {/* Main sentence */}
        <p className="m-0 text-[14px] leading-[1.5]">
          <span
            className="font-display font-bold text-foreground"
          >
            {event.actor.name}
          </span>{" "}
          <span className="text-muted-foreground">{event.actionLabel}</span>{" "}
          {event.target.href ? (
            <Link
              href={event.target.href}
              className="font-medium text-primary no-underline hover:underline"
            >
              {event.target.label}
            </Link>
          ) : (
            <span className="font-medium text-primary">
              {event.target.label}
            </span>
          )}
        </p>

        {/* Role eyebrow */}
        <p className="m-0 mt-[3px] font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          {event.actor.role}
        </p>

        {/* Details section */}
        {event.details && (
          <EventDetails
            details={event.details}
            expanded={expanded}
            onToggle={() => setExpanded((v) => !v)}
          />
        )}
      </div>

      {/* Right: meta */}
      <div className="shrink-0 flex flex-col items-end gap-1 pt-[2px]">
        <ActionBadge action={event.action} />
        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground whitespace-nowrap">
          {event.timeLabel}
        </span>
        {event.ipAddress && (
          <span className="font-mono text-[10px] text-muted-foreground opacity-60">
            {event.ipAddress}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Day header ───────────────────────────────────────────────────────────────

function DayHeader({ label }: { label: string }) {
  return (
    <div
      className="sticky top-[57px] z-10 -mx-4 px-4 py-2 flex items-center gap-4"
      style={{
        background: "hsl(var(--background))",
        borderBottom: "1px solid hsl(var(--border))",
      }}
    >
      <span className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      <div className="flex-1 h-px" style={{ background: "hsl(var(--border))" }} />
    </div>
  );
}

// ── Filter bar ───────────────────────────────────────────────────────────────

const ALL_ACTIONS: AuditEvent["action"][] = [
  "CREATE",
  "UPDATE",
  "DELETE",
  "LOGIN",
  "APPROVE",
  "REJECT",
];

type FilterBarProps = {
  search: string;
  onSearch: (v: string) => void;
  activeActions: Set<AuditEvent["action"]>;
  onToggleAction: (a: AuditEvent["action"]) => void;
};

function FilterBar({
  search,
  onSearch,
  activeActions,
  onToggleAction,
}: FilterBarProps) {
  return (
    <div
      className="sticky top-0 z-20 -mx-4 px-4 py-4 flex flex-wrap items-center gap-4"
      style={{
        background: "hsl(var(--background))",
        borderBottom: "1px solid hsl(var(--border))",
      }}
    >
      {/* Search */}
      <div
        className="flex items-center gap-2 rounded-lg flex-1 min-w-[180px]"
        style={{
          background: "color-mix(in oklab, hsl(var(--foreground)) 5%, transparent)",
          border: "1px solid hsl(var(--border))",
          padding: "8px 12px",
        }}
      >
        <Search size={14} className="text-muted-foreground shrink-0" />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Søk etter aktør eller mål..."
          className="flex-1 bg-transparent border-0 outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 font-mono text-[13px] text-foreground placeholder:text-muted-foreground"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearch("")}
            className="border-0 bg-transparent p-0 cursor-pointer text-muted-foreground hover:text-foreground"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Action pills */}
      <div className="flex flex-wrap items-center gap-2">
        {ALL_ACTIONS.map((action) => {
          const style = ACTION_STYLE[action];
          const isActive = activeActions.has(action);
          return (
            <button
              key={action}
              type="button"
              onClick={() => onToggleAction(action)}
              className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] rounded-full cursor-pointer border-0 transition-opacity"
              style={{
                background: isActive
                  ? style.bg
                  : "color-mix(in oklab, hsl(var(--foreground)) 5%, transparent)",
                color: isActive ? style.color : "hsl(var(--muted-foreground))",
                padding: "5px 12px",
                border: isActive
                  ? `1px solid ${style.color}`
                  : "1px solid hsl(var(--border))",
              }}
            >
              {action}
            </button>
          );
        })}
      </div>

      {/* Date-range stub */}
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-lg font-mono text-[11px] font-bold uppercase tracking-[0.10em] text-muted-foreground cursor-pointer border-0 shrink-0"
        style={{
          background: "color-mix(in oklab, hsl(var(--foreground)) 5%, transparent)",
          border: "1px solid hsl(var(--border))",
          padding: "8px 12px",
        }}
        aria-label="Velg datoperiode (kommer)"
        title="Datofilter — kommer"
      >
        <Calendar size={13} />
        Periode
      </button>
    </div>
  );
}

// ── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center gap-6 rounded-[20px] border border-dashed py-16 px-8 text-center"
      style={{ borderColor: "hsl(var(--border))" }}
    >
      <span
        className="w-14 h-14 rounded-full grid place-items-center"
        style={{
          background: "color-mix(in oklab, hsl(var(--foreground)) 5%, transparent)",
        }}
      >
        <Search size={24} className="text-muted-foreground" />
      </span>
      <div className="flex flex-col gap-2">
        <h3 className="m-0 font-display text-xl font-bold tracking-[-0.02em] text-foreground">
          Ingen hendelser matcher filteret
        </h3>
        <p className="m-0 text-muted-foreground text-[14px]">
          Juster soket eller filterpillene over.
        </p>
      </div>
    </div>
  );
}

// ── Day grouping ─────────────────────────────────────────────────────────────

/**
 * Returns a display label for a day (ISO date string "YYYY-MM-DD").
 * Today/yesterday are relative; older dates are formatted as "25. MAI 2026".
 */
function dayLabel(isoDate: string): string {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  if (isoDate === todayStr) return "I DAG";
  if (isoDate === yesterdayStr) return "I GAR";

  const d = new Date(isoDate + "T12:00:00Z");
  const months = [
    "JAN", "FEB", "MAR", "APR", "MAI", "JUN",
    "JUL", "AUG", "SEP", "OKT", "NOV", "DES",
  ];
  return `${d.getUTCDate()}. ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function isoDay(timestamp: string): string {
  return timestamp.slice(0, 10);
}

// ── Main pattern ─────────────────────────────────────────────────────────────

export default function AuditLogPattern({
  events,
  onLoadMore,
}: AuditLogPatternProps) {
  const [search, setSearch] = useState("");
  const [activeActions, setActiveActions] = useState<Set<AuditEvent["action"]>>(
    new Set()
  );

  function toggleAction(action: AuditEvent["action"]) {
    setActiveActions((prev) => {
      const next = new Set(prev);
      if (next.has(action)) {
        next.delete(action);
      } else {
        next.add(action);
      }
      return next;
    });
  }

  // Filtered list
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return events.filter((e) => {
      const matchSearch =
        !q ||
        e.actor.name.toLowerCase().includes(q) ||
        e.target.label.toLowerCase().includes(q) ||
        e.actionLabel.toLowerCase().includes(q);

      const matchAction =
        activeActions.size === 0 || activeActions.has(e.action);

      return matchSearch && matchAction;
    });
  }, [events, search, activeActions]);

  // Group by day
  const groups = useMemo(() => {
    const map = new Map<string, AuditEvent[]>();
    for (const e of filtered) {
      const day = isoDay(e.timestamp);
      if (!map.has(day)) map.set(day, []);
      map.get(day)!.push(e);
    }
    // Already sorted by timestamp descending (caller responsibility), preserve order
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <div className="relative max-w-4xl mx-auto">
      {/* Sticky filter bar */}
      <FilterBar
        search={search}
        onSearch={setSearch}
        activeActions={activeActions}
        onToggleAction={toggleAction}
      />

      {/* Timeline */}
      <div className="px-4">
        {groups.length === 0 ? (
          <div className="pt-8">
            <EmptyState />
          </div>
        ) : (
          groups.map(([day, dayEvents]) => (
            <div key={day}>
              {/* Sticky day header */}
              <DayHeader label={dayLabel(day)} />

              {/* Events for this day */}
              <div className="divide-y divide-border">
                {dayEvents.map((event) => (
                  <EventRow key={event.id} event={event} />
                ))}
              </div>
            </div>
          ))
        )}

        {/* Load more */}
        {onLoadMore && filtered.length > 0 && (
          <div className="flex justify-center pt-8 pb-4">
            <button
              type="button"
              onClick={onLoadMore}
              className="inline-flex items-center gap-2 rounded-full font-mono text-[12px] font-bold uppercase tracking-[0.10em] cursor-pointer border-0"
              style={{
                background: "color-mix(in oklab, hsl(var(--foreground)) 8%, transparent)",
                color: "hsl(var(--muted-foreground))",
                padding: "10px 24px",
                border: "1px solid hsl(var(--border))",
              }}
            >
              Last inn flere
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
