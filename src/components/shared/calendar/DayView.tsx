// DayView — stor enkelt-dag visning.
//
// - Editorial hero med dato (Instrument Serif) og italic-undertekst
// - PyramideBar 240px
// - Blokker proporsjonale med varighet, én kolonne

import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { PyramideBar } from "./PyramideBar";
import { PraksistypeBadge } from "./PraksistypeBadge";
import type { PyramidArea, PracticeType } from "@/generated/prisma/client";

export type DayOkt = {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  pyramide: PyramidArea;
  practiceType: PracticeType;
  notes?: string | null;
};

type Props = {
  dato: Date;
  okter: DayOkt[];
  forventet?: Partial<Record<PyramidArea, number>>;
};

const PYRAMIDE_BG: Record<PyramidArea, string> = {
  FYS: "border-l-pyr-fys",
  TEK: "border-l-pyr-tek",
  SLAG: "border-l-pyr-slag",
  SPILL: "border-l-pyr-spill",
  TURN: "border-l-pyr-turn",
};

const PYRAMIDE_LABEL: Record<PyramidArea, string> = {
  FYS: "Fysisk",
  TEK: "Teknisk",
  SLAG: "Slag",
  SPILL: "Spill",
  TURN: "Turnering",
};

function summerFordeling(okter: DayOkt[]): Record<PyramidArea, number> {
  const acc: Record<PyramidArea, number> = { FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 };
  for (const o of okter) {
    const min = Math.max(1, (o.endTime.getTime() - o.startTime.getTime()) / 60_000);
    acc[o.pyramide] += min;
  }
  return acc;
}

function tidssitat(dato: Date): string {
  const dag = dato.getDay();
  const dager = [
    "Søndagens stillhet — bygg neste uke i ro",
    "Mandagens momentum — sett retning",
    "Tirsdag er for håndverket",
    "Onsdag er midten — re-sjekk kompasset",
    "Torsdag bygger reps",
    "Fredag er for å låse rutiner",
    "Lørdag spiller du for ekte",
  ];
  return dager[dag];
}

export function DayView({ dato, okter, forventet }: Props) {
  const sortert = [...okter].sort(
    (a, b) => a.startTime.getTime() - b.startTime.getTime(),
  );
  const fordeling = summerFordeling(okter);
  const totalMin = Object.values(fordeling).reduce((s, v) => s + v, 0);

  return (
    <div className="h-full overflow-auto bg-background">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 p-8">
        {/* Hero */}
        <header className="flex flex-col gap-2 border-b border-border pb-6">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {format(dato, "EEEE", { locale: nb })}
          </span>
          <h1 className="font-display text-[72px] leading-none text-foreground">
            {format(dato, "d. MMMM", { locale: nb })}
          </h1>
          <p className="font-display text-lg italic text-muted-foreground">
            {tidssitat(dato)}
          </p>
        </header>

        {/* PyramideBar */}
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium uppercase tracking-wide text-muted-foreground">
              Dagens fordeling
            </span>
            <span className="font-mono tabular-nums text-muted-foreground">
              {(totalMin / 60).toFixed(1)} t · {okter.length} økt
              {okter.length === 1 ? "" : "er"}
            </span>
          </div>
          <div className="w-[240px]">
            <PyramideBar fordeling={fordeling} forventet={forventet} visTall />
          </div>
        </section>

        {/* Blokker proporsjonalt */}
        <section className="flex flex-col gap-3">
          {sortert.length === 0 && (
            <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
              Ingen økter planlagt denne dagen.
            </div>
          )}
          {sortert.map((o) => {
            const min = Math.max(15, (o.endTime.getTime() - o.startTime.getTime()) / 60_000);
            // 2px per minutt for vertikal proporsjonalitet
            const hoyde = Math.min(360, min * 2);
            return (
              <article
                key={o.id}
                className={cn(
                  "relative flex flex-col gap-2 rounded-lg border border-border border-l-4 bg-card p-4",
                  PYRAMIDE_BG[o.pyramide],
                )}
                style={{ minHeight: `${hoyde}px` }}
              >
                <header className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      {PYRAMIDE_LABEL[o.pyramide]}
                    </span>
                    <h2 className="font-display text-2xl text-foreground">{o.title}</h2>
                  </div>
                  <PraksistypeBadge type={o.practiceType} size="md" />
                </header>
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-mono tabular-nums text-foreground">
                    {format(o.startTime, "HH:mm")}–{format(o.endTime, "HH:mm")}
                  </span>
                  <span className="tabular-nums text-muted-foreground">{min} min</span>
                </div>
                {o.notes && (
                  <p className="text-sm leading-relaxed text-muted-foreground">{o.notes}</p>
                )}
              </article>
            );
          })}
        </section>
      </div>
    </div>
  );
}
