"use client";

// WeekView — 7-dagers timegrid (Notion Calendar-fasit: 05:00–23:00, 30 min).
//
// - Første kolonne er tid (64px)
// - PIXEL_PER_HOUR fra notion-grid
// - Økter rendres som blokker proporsjonale med varighet
// - LIVE-økt: ring + NÅ-badge
// - Today-kolonne: tint + nå-linje
// - Dobbeltklikk / klikk tom luke → onOpprett med avrundet 30-min slot

import { useEffect, useMemo, useState } from "react";
import { addDays, format, isSameDay, startOfWeek } from "date-fns";
import { nb } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { PyramidArea, PracticeType } from "@/generated/prisma/client";
import {
  GRID_BODY_PX,
  GRID_END_HOUR,
  GRID_SLOT_MIN,
  GRID_START_HOUR,
  PIXEL_PER_HOUR,
  WEEK_STARTS_ON,
  dateToPx,
  durationToPx,
  gridHours,
} from "@/lib/calendar/notion-grid";
import { PraksistypeBadge } from "./PraksistypeBadge";

export type WeekOkt = {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  pyramide: PyramidArea;
  practiceType: PracticeType;
};

type Props = {
  uke: Date;
  okter: WeekOkt[];
  onFlyttOkt?: (id: string, nyStart: Date) => void;
  onValgOkt?: (id: string) => void;
  onOpprett?: (start: Date) => void;
};

const PYRAMIDE_BG: Record<PyramidArea, string> = {
  FYS: "bg-pyr-fys/20 border-l-pyr-fys",
  TEK: "bg-pyr-tek/20 border-l-pyr-tek",
  SLAG: "bg-pyr-slag/40 border-l-pyr-slag",
  SPILL: "bg-pyr-spill/20 border-l-pyr-spill",
  TURN: "bg-pyr-turn/25 border-l-pyr-turn",
};

function varighetPx(start: Date, slutt: Date): number {
  return durationToPx((slutt.getTime() - start.getTime()) / 60_000);
}

function erLive(start: Date, slutt: Date): boolean {
  const naa = new Date();
  return naa >= start && naa <= slutt;
}

/** Y → Date med 30-min avrunding innenfor grid. */
function yTilDato(dato: Date, y: number): Date {
  const time = GRID_START_HOUR + y / PIXEL_PER_HOUR;
  const totalMin = Math.round((time * 60) / GRID_SLOT_MIN) * GRID_SLOT_MIN;
  const clamped = Math.max(GRID_START_HOUR * 60, Math.min(GRID_END_HOUR * 60, totalMin));
  const ny = new Date(dato);
  ny.setHours(Math.floor(clamped / 60), clamped % 60, 0, 0);
  return ny;
}

export function WeekView({ uke, okter, onFlyttOkt, onValgOkt, onOpprett }: Props) {
  const [draOkt, setDraOkt] = useState<string | null>(null);
  const [tikk, setTikk] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setTikk((t) => t + 1), 60_000);
    return () => clearInterval(i);
  }, []);

  const ukeStart = useMemo(
    () => startOfWeek(uke, { weekStartsOn: WEEK_STARTS_ON }),
    [uke],
  );
  const dager = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(ukeStart, i)),
    [ukeStart],
  );
  const timer = useMemo(() => gridHours(), []);
  const idag = new Date();
  const nowMin = idag.getHours() * 60 + idag.getMinutes();
  const nowInGrid =
    nowMin >= GRID_START_HOUR * 60 && nowMin <= GRID_END_HOUR * 60;
  const nowTop = ((nowMin - GRID_START_HOUR * 60) / 60) * PIXEL_PER_HOUR;

  function handleDrop(e: React.DragEvent<HTMLDivElement>, dato: Date) {
    e.preventDefault();
    const oktId = e.dataTransfer.getData("text/x-okt");
    if (!oktId) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    onFlyttOkt?.(oktId, yTilDato(dato, y));
    setDraOkt(null);
  }

  return (
    <div className="flex h-full w-full flex-col overflow-auto bg-background" data-tikk={tikk}>
      {/* Dags-header */}
      <div
        className="sticky top-0 z-10 grid border-b border-border bg-card"
        style={{ gridTemplateColumns: "64px repeat(7, 1fr)" }}
      >
        <div className="border-r border-border" />
        {dager.map((d) => {
          const erIdag = isSameDay(d, idag);
          return (
            <div
              key={d.toISOString()}
              className={cn(
                "border-r border-border px-2 py-2 text-center",
                erIdag && "bg-primary text-primary-foreground",
              )}
            >
              <div className="text-[11px] font-medium uppercase tracking-wide">
                {format(d, "EEE", { locale: nb })}
              </div>
              <div className="font-mono text-lg tabular-nums">{format(d, "d")}</div>
            </div>
          );
        })}
      </div>

      {/* Time-grid */}
      <div className="relative grid flex-1" style={{ gridTemplateColumns: "64px repeat(7, 1fr)" }}>
        <div className="border-r border-border bg-card">
          {timer.map((t) => (
            <div
              key={t}
              className="border-b border-border/50 px-2 pt-1 text-right font-mono text-[10px] tabular-nums text-muted-foreground"
              style={{ height: `${PIXEL_PER_HOUR}px` }}
            >
              {String(t).padStart(2, "0")}:00
            </div>
          ))}
        </div>

        {dager.map((dato) => {
          const erIdag = isSameDay(dato, idag);
          const dagensOkter = okter.filter((o) => isSameDay(o.startTime, dato));
          return (
            <div
              key={dato.toISOString()}
              className={cn("relative border-r border-border", erIdag && "bg-primary/5")}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, dato)}
              onDoubleClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const y = e.clientY - rect.top;
                onOpprett?.(yTilDato(dato, y));
              }}
              style={{ height: `${GRID_BODY_PX + PIXEL_PER_HOUR}px` }}
            >
              {timer.map((t) => (
                <div key={t}>
                  <div
                    className="absolute left-0 right-0 border-b border-border/30"
                    style={{ top: `${(t - GRID_START_HOUR) * PIXEL_PER_HOUR}px` }}
                  />
                  {/* Halvtime-stiplet */}
                  {t < GRID_END_HOUR && (
                    <div
                      className="absolute left-0 right-0 border-b border-dashed border-border/20"
                      style={{
                        top: `${(t - GRID_START_HOUR) * PIXEL_PER_HOUR + PIXEL_PER_HOUR / 2}px`,
                      }}
                    />
                  )}
                </div>
              ))}

              {erIdag && nowInGrid && (
                <div
                  className="pointer-events-none absolute left-0 right-0 z-20 flex items-center"
                  style={{ top: `${nowTop}px` }}
                  aria-hidden
                >
                  <span className="h-2 w-2 shrink-0 rounded-full bg-accent" />
                  <span className="h-px flex-1 bg-accent" />
                </div>
              )}

              {dagensOkter.map((o) => {
                const top = dateToPx(o.startTime);
                const h = varighetPx(o.startTime, o.endTime);
                const live = erLive(o.startTime, o.endTime);
                return (
                  <div
                    key={o.id}
                    draggable
                    onDragStart={(e) => {
                      setDraOkt(o.id);
                      e.dataTransfer.setData("text/x-okt", o.id);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    onDragEnd={() => setDraOkt(null)}
                    onClick={() => onValgOkt?.(o.id)}
                    className={cn(
                      "absolute left-1 right-1 cursor-move overflow-hidden rounded-md border-l-4 p-1.5 text-[11px] transition-shadow hover:shadow-md",
                      PYRAMIDE_BG[o.pyramide],
                      live && "ring-2 ring-accent",
                      draOkt === o.id && "opacity-50",
                    )}
                    style={{ top: `${top}px`, height: `${h}px` }}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="truncate font-medium text-foreground">{o.title}</span>
                      <PraksistypeBadge type={o.practiceType} />
                    </div>
                    <div className="font-mono tabular-nums text-muted-foreground">
                      {format(o.startTime, "HH:mm")}–{format(o.endTime, "HH:mm")}
                    </div>
                    {live && (
                      <span className="absolute right-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-accent-foreground">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-foreground" />
                        NÅ
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
