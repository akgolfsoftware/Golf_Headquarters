"use client";

/**
 * CalendarWidget — horisontal dag-kalender for Player Workbench.
 *
 * Viser dagens økter fra 05:00 til 24:00 (19 timer) som fargekodede blokker
 * langs en horisontal tidsakse. Inkluderer "NÅ"-tidsmarkør og hover-popover
 * med detaljer per økt.
 *
 * Server-component-friendly grunnet "use client" (popover-state).
 * Referanse: hand-off bundle PR1 Hjem-sider.html, PHVariantA.
 */

import Link from "next/link";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

// ---------- Types ----------

export type CalendarPyramid = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";

export type CalendarSession = {
  id: string;
  title: string;
  startAt: Date;
  endAt: Date;
  pyramid: CalendarPyramid;
  location?: string;
  drills?: string[];
  tags?: string[];
};

export type CalendarWidgetProps = {
  sessions: CalendarSession[];
  currentTime: Date;
  className?: string;
};

// ---------- Konstanter ----------

const START_HOUR = 5; // 05:00
const END_HOUR = 24; // 24:00 (eksklusiv øvre grense — viser 19 hele timer 05-23)
const TOTAL_HOURS = END_HOUR - START_HOUR; // 19
const HOUR_WIDTH = 40; // px per time på desktop
const TOTAL_WIDTH = TOTAL_HOURS * HOUR_WIDTH; // 760px

// Pyramide-farger via semantic tokens (lyst + mørkt tema-bevisst)
const PYRAMID_STYLE: Record<CalendarPyramid, string> = {
  FYS: "bg-primary/20 text-primary border-primary/30",
  TEK: "bg-warning/20 text-warning border-warning/30",
  SLAG: "bg-info/20 text-info border-info/30",
  SPILL: "bg-accent/30 text-accent-foreground border-accent/40",
  TURN: "bg-destructive/15 text-destructive border-destructive/30",
};

const PYRAMID_LABEL: Record<CalendarPyramid, string> = {
  FYS: "Fysisk",
  TEK: "Teknikk",
  SLAG: "Slagtrening",
  SPILL: "Spill",
  TURN: "Turnering",
};

// ---------- Helpers ----------

/**
 * Konverterer Date til antall minutter siden START_HOUR.
 * Klippes til [0, TOTAL_HOURS * 60] slik at økter utenfor synlig rekkevidde
 * fortsatt rendres, men beskåret.
 */
function minutesFromStart(date: Date): number {
  const minutes = date.getHours() * 60 + date.getMinutes();
  return minutes - START_HOUR * 60;
}

function clampMinutes(minutes: number): number {
  return Math.max(0, Math.min(TOTAL_HOURS * 60, minutes));
}

/** Formaterer time som "HH:MM" for label på blokk og popover */
function formatTime(date: Date): string {
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

/**
 * Avgjør popover-ankring basert på øktens posisjon i tidslinjen.
 * Venstre 25%: ankre høyre. Høyre 25%: ankre venstre. Midten: midt.
 */
function popoverAnchor(positionPct: number): "left" | "center" | "right" {
  if (positionPct < 25) return "left"; // popover utfra venstre kant av økten
  if (positionPct > 75) return "right"; // popover utfra høyre kant
  return "center";
}

// ---------- Komponent ----------

export function CalendarWidget({
  sessions,
  currentTime,
  className,
}: CalendarWidgetProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const nowMinutes = useMemo(() => minutesFromStart(currentTime), [currentTime]);
  const nowVisible = nowMinutes >= 0 && nowMinutes <= TOTAL_HOURS * 60;

  // Sortér økter etter starttid for konsistent rendring
  const sortedSessions = useMemo(
    () =>
      [...sessions].sort(
        (a, b) => a.startAt.getTime() - b.startAt.getTime()
      ),
    [sessions]
  );

  const hours = useMemo(
    () => Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => START_HOUR + i),
    []
  );

  // Empty state
  if (sortedSessions.length === 0) {
    return (
      <div
        className={cn(
          "rounded-lg border border-border bg-card p-8 text-center",
          className
        )}
      >
        <p className="text-sm text-muted-foreground">
          Ingen økter planlagt i dag
        </p>
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg border border-border bg-card", className)}>
      {/* Horisontal scroll-container på mobile */}
      <div className="overflow-x-auto">
        <div
          className="relative"
          style={{ width: `${TOTAL_WIDTH}px`, minWidth: "100%" }}
        >
          {/* Timeline-rad med time-tall */}
          <div
            className="relative flex border-b border-border"
            style={{ height: "28px" }}
          >
            {hours.map((h) => (
              <div
                key={h}
                className="flex shrink-0 items-center justify-start border-r border-border/50 px-2 font-mono text-[10px] text-muted-foreground"
                style={{ width: `${HOUR_WIDTH}px` }}
              >
                {h.toString().padStart(2, "0")}
              </div>
            ))}
          </div>

          {/* Økt-track */}
          <div
            className="relative"
            style={{ height: "72px" }}
          >
            {/* Bakgrunns-grid (vertikale linjer per time) */}
            <div className="absolute inset-0 flex">
              {hours.slice(0, -1).map((h) => (
                <div
                  key={h}
                  className="shrink-0 border-r border-border/30"
                  style={{ width: `${HOUR_WIDTH}px` }}
                />
              ))}
            </div>

            {/* Øktblokker */}
            {sortedSessions.map((session) => {
              const startMin = clampMinutes(minutesFromStart(session.startAt));
              const endMin = clampMinutes(minutesFromStart(session.endAt));
              const widthMin = Math.max(15, endMin - startMin); // min 15 min for visibility
              const leftPx = (startMin / 60) * HOUR_WIDTH;
              const widthPx = (widthMin / 60) * HOUR_WIDTH;
              const isPast = session.endAt < currentTime;
              const isHovered = hoveredId === session.id;
              const positionPct = (leftPx / TOTAL_WIDTH) * 100;
              const anchor = popoverAnchor(positionPct);

              return (
                <div
                  key={session.id}
                  className="absolute top-2 bottom-2"
                  style={{ left: `${leftPx}px`, width: `${widthPx}px` }}
                  onMouseEnter={() => setHoveredId(session.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onFocus={() => setHoveredId(session.id)}
                  onBlur={() => setHoveredId(null)}
                >
                  <Link
                    href={`/portal/tren/${session.id}`}
                    className={cn(
                      "block h-full min-h-[44px] w-full overflow-hidden rounded-sm border px-1.5 py-1 transition-opacity",
                      PYRAMID_STYLE[session.pyramid],
                      isPast && !isHovered && "opacity-50",
                      "hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    )}
                    aria-label={`${session.title}, ${formatTime(session.startAt)}-${formatTime(session.endAt)}, ${PYRAMID_LABEL[session.pyramid]}`}
                  >
                    <div className="font-mono text-[10px] leading-tight opacity-80">
                      {formatTime(session.startAt)}
                    </div>
                    <div className="truncate text-xs font-medium leading-tight">
                      {session.title}
                    </div>
                  </Link>

                  {/* Hover-popover */}
                  {isHovered ? (
                    <div
                      className={cn(
                        "absolute top-full z-20 mt-2 w-64 rounded-md border border-border bg-popover p-4 text-popover-foreground shadow-lg",
                        anchor === "left" && "left-0",
                        anchor === "center" && "left-1/2 -translate-x-1/2",
                        anchor === "right" && "right-0"
                      )}
                      role="tooltip"
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold leading-tight">
                          {session.title}
                        </h3>
                        <span
                          className={cn(
                            "shrink-0 rounded-sm border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide",
                            PYRAMID_STYLE[session.pyramid]
                          )}
                        >
                          {session.pyramid}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="font-mono">
                          {formatTime(session.startAt)}–{formatTime(session.endAt)}
                        </div>
                        {session.location ? (
                          <div>Sted: {session.location}</div>
                        ) : null}
                      </div>

                      {session.drills && session.drills.length > 0 ? (
                        <div className="mt-3">
                          <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                            Drills
                          </p>
                          <ul className="space-y-0.5 text-xs">
                            {session.drills.map((drill, i) => (
                              <li key={i} className="text-foreground">
                                {drill}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}

                      {session.tags && session.tags.length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {session.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="rounded-sm bg-secondary px-1.5 py-0.5 text-[10px] text-secondary-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}

                      <div className="mt-4 flex gap-2 border-t border-border pt-3">
                        <Link
                          href={`/portal/tren/${session.id}/planlagt`}
                          className="flex-1 rounded-sm bg-primary px-2 py-1.5 text-center text-xs font-medium text-primary-foreground hover:opacity-90"
                        >
                          Åpne brief
                        </Link>
                        {/* TODO: Endre tid-modal — koble til senere */}
                        <button
                          type="button"
                          className="flex-1 rounded-sm border border-border bg-card px-2 py-1.5 text-xs font-medium text-foreground hover:bg-secondary"
                          aria-label="Endre tid (kommer senere)"
                        >
                          Endre tid
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}

            {/* NÅ-tidsmarkør */}
            {nowVisible ? (
              <div
                className="pointer-events-none absolute top-0 bottom-0 z-10"
                style={{ left: `${(nowMinutes / 60) * HOUR_WIDTH}px` }}
              >
                <div className="absolute top-0 bottom-0 w-px bg-destructive" />
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 rounded-sm bg-destructive px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wide text-destructive-foreground">
                  NÅ {formatTime(currentTime)}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
