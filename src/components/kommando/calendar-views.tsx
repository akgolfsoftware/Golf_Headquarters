"use client";

// Kalender-visning for Kommando. Tar ferdig-bygde dager/blokker fra serveren
// og veksler mellom måned (alle hendelser) og uke (tidssatte bookinger).
// Golfdata-kalenderfamilien (MaanedKalender piller-modus + TidsGrid).

import { useState } from "react";
import { cn } from "@/lib/utils";
import { MaanedKalender, TidsGrid, type MaanedDag } from "@/components/athletic/golfdata";

/** Én tidssatt booking i ukevisningen. */
export type UkeBlokk = {
  id: string;
  /** 0=man .. 6=søn. */
  dag: number;
  /** Desimaltimer. */
  fra: number;
  til: number;
  tittel: string;
  tid: string;
};

type View = "month" | "week";

const UKEDAGER = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];

export function CalendarViews({
  year,
  month,
  monthDays,
  weekStart,
  weekBlocks,
  todayIndex,
}: {
  year: number;
  /** 1-indeksert (1=januar). */
  month: number;
  monthName: string;
  monthDays: MaanedDag[];
  weekStart: Date;
  weekBlocks: UkeBlokk[];
  todayIndex?: number;
}) {
  const [view, setView] = useState<View>("month");

  return (
    <div>
      <div className="mb-4 flex gap-1.5">
        {(["month", "week"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={cn(
              "rounded-full px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.05em] transition-colors",
              view === v
                ? "bg-accent text-accent-foreground"
                : "border border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {v === "month" ? "Måned" : "Uke"}
          </button>
        ))}
      </div>

      {view === "month" ? (
        <MaanedKalender year={year} month={month - 1} modus="piller" days={monthDays} />
      ) : (
        <>
          <TidsGrid fraTime={7} tilTime={21}>
            {UKEDAGER.map((navn, dagIndex) => {
              const dagDato = new Date(weekStart.getTime() + dagIndex * 24 * 60 * 60 * 1000);
              return (
                <TidsGrid.Kolonne
                  key={dagIndex}
                  id={`dag-${dagIndex}`}
                  header={`${navn} ${dagDato.getDate()}`}
                  idag={todayIndex === dagIndex}
                >
                  {weekBlocks
                    .filter((b) => b.dag === dagIndex)
                    .map((b) => (
                      <TidsGrid.Blokk key={b.id} fra={b.fra} til={b.til}>
                        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.04em]">{b.tid}</span>
                        <span className="block truncate text-[12px] font-medium">{b.tittel}</span>
                      </TidsGrid.Blokk>
                    ))}
                </TidsGrid.Kolonne>
              );
            })}
          </TidsGrid>
          <p className="mt-3 font-mono text-[11px] text-muted-foreground">
            Uke-visningen viser tidssatte bookinger. Oppgaver med frist vises i måneds-visningen.
          </p>
        </>
      )}
    </div>
  );
}
