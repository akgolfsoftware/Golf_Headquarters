"use client";

import { useState } from "react";
import {
  QuickAddSessionModal,
  type FacilityOption,
  type LocationOption,
  type QuickAddSlot,
  type ServiceTypeOption,
  type SpillerOption,
} from "@/components/admin/quick-add-session-modal";

const TIMES = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00",
  "20:00", "21:00", "22:00",
];
const SLOT_PX = 56;
const GRID_START_HOUR = 6;
const GRID_TOTAL_PX = TIMES.length * SLOT_PX;

const DAGER_LANGE = [
  "Mandag",
  "Tirsdag",
  "Onsdag",
  "Torsdag",
  "Fredag",
  "Lørdag",
  "Søndag",
];

export type Ev = {
  kind: "booking" | "group";
  /** Topp-piksel relativt til kolonnens start. */
  top: number;
  /** Høyde i piksler. */
  height: number;
  timeLabel: string;
  title: string;
  sub?: string;
  /** Start-time som flyttall (07.5 = 07:30). Brukes for å detektere ledige slots. */
  startHour: number;
  endHour: number;
};

export type Stripe = { top: number; height: number };

export type DagPayload = {
  /** Stabil key per dag, f.eks. "2026-05-12". */
  dateKey: string;
  /** År, måned (1-12) og dag-i-måned (1-31) — brukes for tidsone-trygg Date-konstruksjon klient-side. */
  year: number;
  month: number;
  dayOfMonth: number;
  events: Ev[];
  stripes: Stripe[];
};

type Props = {
  dager: DagPayload[];
  todayDateKey: string;
  nowHour: number;
  spillere: SpillerOption[];
  serviceTypes: ServiceTypeOption[];
  locations: LocationOption[];
  facilities?: FacilityOption[];
  /** Hvis innlogget bruker har lov til å booke (alle unntatt GUEST). */
  kanBooke: boolean;
};

function erIdagFn(dateKey: string, todayKey: string): boolean {
  return dateKey === todayKey;
}

function harEventPaTime(dag: DagPayload, hour: number): boolean {
  // Slot er "opptatt" hvis enten en booking eller fast gruppe overlapper hele timen.
  return dag.events.some((ev) => ev.startHour < hour + 1 && ev.endHour > hour);
}

export function CalendarWeekGrid({
  dager,
  todayDateKey,
  nowHour,
  spillere,
  serviceTypes,
  locations,
  facilities = [],
  kanBooke,
}: Props) {
  const [slot, setSlot] = useState<QuickAddSlot | null>(null);

  function aapneSlot(dag: DagPayload, dagIdx: number, hour: number) {
    if (!kanBooke) return;
    // Konstruer lokal Date fra eksplisitt year/month/day — unngår tidsone-glipp
    // mellom server (ofte UTC) og klient (lokal).
    const lokal = new Date(dag.year, dag.month - 1, dag.dayOfMonth, hour, 0, 0, 0);
    const tidLabel = `${String(hour).padStart(2, "0")}:00`;
    const datoFmt = new Intl.DateTimeFormat("nb-NO", {
      day: "numeric",
      month: "long",
    }).format(lokal);
    setSlot({
      startIso: lokal.toISOString(),
      datoLabel: datoFmt,
      tidLabel,
      ukedag: DAGER_LANGE[dagIdx] ?? "",
    });
  }

  return (
    <>
      <div className="overflow-x-auto">
        <div
          className="relative grid min-w-[860px] overflow-hidden rounded-lg border border-border bg-card"
          style={{ gridTemplateColumns: "64px repeat(7, 1fr)" }}
        >
          {/* Header rad — første tomme + 7 dager */}
          <div className="border-b border-r border-border bg-card px-4 py-2" />
          {dager.map((dag, i) => {
            const erIdag = erIdagFn(dag.dateKey, todayDateKey);
            const erHelg = i >= 5;
            return (
              <div
                key={dag.dateKey}
                className={`flex flex-col gap-0.5 border-b border-border px-4 py-2 ${
                  erIdag
                    ? "bg-accent"
                    : erHelg
                      ? "bg-secondary"
                      : "bg-card"
                } ${i < 6 ? "border-r" : ""}`}
              >
                <span
                  className={`font-mono text-[10px] font-semibold uppercase tracking-[0.08em] ${
                    erIdag ? "text-accent-foreground" : "text-muted-foreground"
                  }`}
                >
                  {DAGER_LANGE[i]}
                </span>
                <span
                  className={`font-display text-lg font-semibold leading-none tracking-tight ${
                    erIdag ? "text-accent-foreground" : "text-foreground"
                  }`}
                >
                  {dag.dayOfMonth}
                  {erIdag && (
                    <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                </span>
                <span className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                  {dag.events.length}{" "}
                  {dag.events.length === 1 ? "økt" : "økter"}
                </span>
              </div>
            );
          })}

          {/* Tids-kolonne */}
          <div className="border-r border-border bg-card">
            {TIMES.map((t, i) => (
              <div
                key={t}
                className={`h-14 border-b border-border pr-2 pt-1 text-right font-mono text-[10px] ${
                  i % 2 === 1 ? "text-muted-foreground/50" : "text-muted-foreground"
                }`}
              >
                {t}
              </div>
            ))}
          </div>

          {/* Dag-kolonner */}
          {dager.map((dag, i) => {
            const erIdag = erIdagFn(dag.dateKey, todayDateKey);
            const erHelg = i >= 5;
            const nowVisible =
              erIdag &&
              nowHour >= GRID_START_HOUR &&
              nowHour <= GRID_START_HOUR + TIMES.length;
            const nowTop = nowVisible
              ? (nowHour - GRID_START_HOUR) * SLOT_PX
              : 0;
            const nowLabelHours = Math.floor(nowHour);
            const nowLabelMin = Math.round((nowHour - nowLabelHours) * 60);
            const nowLabel = nowVisible
              ? `${String(nowLabelHours).padStart(2, "0")}:${String(nowLabelMin).padStart(2, "0")}`
              : "";

            return (
              <div
                key={dag.dateKey}
                className={`relative ${
                  erHelg && !erIdag ? "bg-secondary/30" : ""
                } ${i < 6 ? "border-r border-border" : ""}`}
                style={{ minHeight: GRID_TOTAL_PX }}
              >
                {/* Klikkbare time-slots (under stripes/events) */}
                {TIMES.map((tLabel, j) => {
                  const hour = GRID_START_HOUR + j;
                  const opptatt = harEventPaTime(dag, hour);
                  const baseLinjer =
                    j % 2 === 1
                      ? "border-b border-dashed border-border"
                      : "border-b border-border";
                  if (opptatt || !kanBooke) {
                    return (
                      <div
                        key={j}
                        className={`h-14 ${baseLinjer}`}
                      />
                    );
                  }
                  return (
                    <button
                      key={j}
                      type="button"
                      onClick={() => aapneSlot(dag, i, hour)}
                      aria-label={`Opprett økt ${DAGER_LANGE[i]} kl ${tLabel}`}
                      className={`block h-14 w-full cursor-pointer text-left transition-colors hover:bg-primary/8 active:bg-primary/15 focus-visible:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ${baseLinjer}`}
                    />
                  );
                })}

                {/* Availability-striper (over slot-knapper, men pointer-events-none så klikk går gjennom) */}
                {dag.stripes.map((s, idx) => (
                  <div
                    key={`stripe-${idx}`}
                    className="pointer-events-none absolute inset-x-1 rounded-sm bg-primary/5"
                    style={{ top: s.top, height: s.height }}
                  />
                ))}

                {/* Events */}
                {dag.events.map((ev, idx) => (
                  <div
                    key={`ev-${idx}`}
                    className={`absolute inset-x-1.5 flex flex-col gap-0.5 overflow-hidden rounded-md border px-2.5 py-1.5 shadow-sm ${
                      ev.kind === "group"
                        ? "border-primary/20 bg-primary/8"
                        : "border-accent/40 bg-accent/15"
                    }`}
                    style={{ top: ev.top, height: ev.height }}
                  >
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {ev.timeLabel}
                    </span>
                    <span className="text-xs font-semibold leading-tight text-foreground">
                      {ev.title}
                    </span>
                    {ev.sub && (
                      <span className="text-[11px] leading-tight text-muted-foreground">
                        {ev.sub}
                      </span>
                    )}
                  </div>
                ))}

                {/* Nå-linje */}
                {erIdag && nowVisible && (
                  <div
                    className="pointer-events-none absolute inset-x-0 z-10 h-px bg-destructive"
                    style={{ top: nowTop }}
                  >
                    <span className="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-destructive" />
                    <span className="absolute -top-2 right-1 rounded bg-card px-1 font-mono text-[9px] font-semibold text-destructive">
                      {nowLabel}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <QuickAddSessionModal
        slot={slot}
        onClose={() => setSlot(null)}
        spillere={spillere}
        serviceTypes={serviceTypes}
        locations={locations}
        facilities={facilities}
      />
    </>
  );
}
