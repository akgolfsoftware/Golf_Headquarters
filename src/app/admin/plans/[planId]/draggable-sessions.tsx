"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import type {
  LPhase,
  PyramidArea,
  SessionEnvironment,
  SessionStatus,
  SkillArea,
} from "@/generated/prisma/client";
import { flyttOkt } from "./actions";
import { EditSessionModal } from "./edit-session-modal";
import {
  ENVIRONMENT_LABEL,
  LPHASE_LABEL,
  PYRAMIDE_LABEL,
  SKILL_AREA_LABEL,
} from "@/lib/labels/taxonomy";

// ────────────────────────────────────────────────────────────────
// Typer
// ────────────────────────────────────────────────────────────────

export type DraggableSession = {
  id: string;
  scheduledAt: string; // ISO-streng (serialiserbar fra server til klient)
  durationMin: number;
  title: string;
  pyramidArea: PyramidArea;
  skillArea: SkillArea | null;
  environment: SessionEnvironment | null;
  lPhase: LPhase | null;
  status: SessionStatus;
  drillCount: number;
  rationale: string | null;
};

const PYR_COLOR: Record<PyramidArea, string> = {
  FYS: "var(--color-pyr-fys, #005840)",
  TEK: "var(--color-pyr-tek, #1A7D56)",
  SLAG: "var(--color-pyr-slag, #D1F843)",
  SPILL: "var(--color-pyr-spill, #B8852A)",
  TURN: "var(--color-pyr-turn, #5E5C57)",
};

const STATUS_LABEL: Record<SessionStatus, string> = {
  PLANNED: "Planlagt",
  ACTIVE: "Pågår",
  COMPLETED: "Fullført",
  SKIPPED: "Hoppet over",
  CANCELLED: "Avlyst",
};

// ────────────────────────────────────────────────────────────────
// Uke-hjelpere
// ────────────────────────────────────────────────────────────────

function getISOWeek(d: Date): { year: number; week: number } {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { year: date.getUTCFullYear(), week };
}

function startOfISOWeek(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay() || 7;
  date.setDate(date.getDate() - (day - 1));
  date.setHours(0, 0, 0, 0);
  return date;
}

function weekKey(d: Date): string {
  const { year, week } = getISOWeek(d);
  return `${year}-${String(week).padStart(2, "0")}`;
}

function weekLabel(d: Date): string {
  const start = startOfISOWeek(d);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const { week } = getISOWeek(d);
  const startLbl = start.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
  });
  const endLbl = end.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
  });
  return `Uke ${week} · ${startLbl} – ${endLbl}`;
}

type SessionGroup = {
  key: string;
  label: string;
  weekStart: Date;
  sessions: DraggableSession[];
};

function groupByWeek(sessions: DraggableSession[]): SessionGroup[] {
  const map = new Map<string, SessionGroup>();
  for (const s of sessions) {
    const d = new Date(s.scheduledAt);
    const key = weekKey(d);
    let group = map.get(key);
    if (!group) {
      group = {
        key,
        label: weekLabel(d),
        weekStart: startOfISOWeek(d),
        sessions: [],
      };
      map.set(key, group);
    }
    group.sessions.push(s);
  }

  const groups = Array.from(map.values()).sort(
    (a, b) => a.weekStart.getTime() - b.weekStart.getTime(),
  );
  for (const g of groups) {
    g.sessions.sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    );
  }
  return groups;
}

// ────────────────────────────────────────────────────────────────
// Hovedkomponent
// ────────────────────────────────────────────────────────────────

export function DraggableSessions({
  sessions: initialSessions,
}: {
  sessions: DraggableSession[];
}) {
  const [sessions, setSessions] = useState(initialSessions);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const groups = useMemo(() => groupByWeek(sessions), [sessions]);
  const allIds = useMemo(() => sessions.map((s) => s.id), [sessions]);
  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeId) ?? null,
    [activeId, sessions],
  );

  if (sessions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Ingen planlagte økter å flytte.
      </p>
    );
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;

    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);

    const fromSession = sessions.find((s) => s.id === activeIdStr);
    const toSession = sessions.find((s) => s.id === overIdStr);
    if (!fromSession || !toSession) return;

    const fromDate = new Date(fromSession.scheduledAt);
    const toDate = new Date(toSession.scheduledAt);

    // Behold tid-på-dagen, men flytt til måldagen (samme uke som droppet)
    const newDate = new Date(toDate);
    newDate.setHours(
      fromDate.getHours(),
      fromDate.getMinutes(),
      fromDate.getSeconds(),
      0,
    );

    // Optimistisk update
    const optimistic = sessions.map((s) =>
      s.id === activeIdStr
        ? { ...s, scheduledAt: newDate.toISOString() }
        : s,
    );
    setSessions(optimistic);

    startTransition(async () => {
      try {
        await flyttOkt(activeIdStr, newDate);
      } catch (err) {
        // Rull tilbake hvis server feiler
        setSessions(initialSessions);
        console.error("Kunne ikke flytte økt", err);
      }
    });
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={allIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.key} className="space-y-2">
              <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                {group.label}
              </div>
              <ul className="space-y-1">
                {group.sessions.map((s, i) => (
                  <SortableSessionRow
                    key={s.id}
                    session={s}
                    last={i === group.sessions.length - 1}
                  />
                ))}
              </ul>
            </div>
          ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeSession ? (
          <div className="rounded-md border border-border bg-card p-3 shadow-lg ring-2 ring-ring/40">
            <SessionContent session={activeSession} dragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

// ────────────────────────────────────────────────────────────────
// Sortable rad
// ────────────────────────────────────────────────────────────────

function SortableSessionRow({
  session,
  last,
}: {
  session: DraggableSession;
  last?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: session.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`grid grid-cols-[auto_60px_1fr_auto_auto] items-center gap-2 rounded-md px-1 py-2 ${
        last ? "" : "border-b border-border"
      } ${isDragging ? "bg-muted" : "hover:bg-muted/40"}`}
    >
      <button
        type="button"
        aria-label={`Dra for å flytte ${session.title}`}
        className="flex h-6 w-6 cursor-grab items-center justify-center rounded-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" strokeWidth={1.8} />
      </button>
      <SessionContent session={session} />
      <EditSessionModal
        mode={{ kind: "edit", sessionId: session.id }}
        initial={{
          title: session.title,
          scheduledAt: new Date(session.scheduledAt),
          durationMin: session.durationMin,
          pyramidArea: session.pyramidArea,
          rationale: session.rationale,
        }}
        triggerVariant="icon-edit"
      />
    </li>
  );
}

function SessionContent({
  session,
  dragging,
}: {
  session: DraggableSession;
  dragging?: boolean;
}) {
  const date = new Date(session.scheduledAt);
  const dateStr = date.toLocaleDateString("nb-NO", {
    weekday: "short",
    day: "2-digit",
  });
  const timeStr = date.toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const inner = (
    <>
      <div className="font-mono text-[11px] font-semibold leading-tight">
        {dateStr}
        <span className="mt-1 block font-sans text-[10px] font-normal text-muted-foreground">
          {timeStr}
        </span>
      </div>
      <div className="min-w-0">
        <div className="truncate text-[13px] font-semibold leading-tight">
          {session.title}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <i
              className="inline-block h-2 w-2 rounded-sm"
              style={{ background: PYR_COLOR[session.pyramidArea] }}
            />
            {PYRAMIDE_LABEL[session.pyramidArea]} · {session.durationMin} min
          </span>
          {session.skillArea && (
            <span className="rounded-sm bg-secondary px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
              {SKILL_AREA_LABEL[session.skillArea]}
            </span>
          )}
          {session.environment && (
            <span className="rounded-sm bg-secondary px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
              {ENVIRONMENT_LABEL[session.environment]}
            </span>
          )}
          {session.lPhase && (
            <span className="rounded-sm bg-secondary px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
              {LPHASE_LABEL[session.lPhase]}
            </span>
          )}
          <span>{session.drillCount} drills</span>
        </div>
      </div>
      <span
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
          session.status === "ACTIVE"
            ? "bg-accent text-accent-foreground"
            : "bg-secondary text-muted-foreground"
        }`}
      >
        {STATUS_LABEL[session.status]}
      </span>
    </>
  );

  if (dragging) {
    return (
      <div className="grid grid-cols-[60px_1fr_auto] items-center gap-2">
        {inner}
      </div>
    );
  }

  return (
    <Link
      href={`/portal/tren/${session.id}`}
      className="contents focus-visible:outline-none"
      onClick={(e) => {
        // Forhindre navigasjon mens man drar
        if (e.defaultPrevented) return;
      }}
    >
      {inner}
    </Link>
  );
}
