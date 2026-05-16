"use client";

// MonthView — månedlig oversikt med dager i 7-kolonners grid.
//
// - Pyramide-fordelingsbar øverst
// - Hver celle viser dato, økt-chips og "+X til"-popover ved overflod
// - Today: lime sirkel rundt nummer
// - Helger: lys beige bakgrunn

import { useMemo, useState } from "react";
import {
  addDays,
  endOfMonth,
  format,
  isSameDay,
  isSameMonth,
  isWeekend,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { nb } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { PyramideBar } from "./PyramideBar";
import type { PyramidArea, PracticeType } from "@/generated/prisma/client";

export type MonthOkt = {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  pyramide: PyramidArea;
  practiceType: PracticeType;
};

type Props = {
  maaned: Date;
  okter: MonthOkt[];
  /** Forventet pyramide-fordeling (% per område). */
  forventet?: Partial<Record<PyramidArea, number>>;
  onOpprett?: (dato: Date) => void;
  onValgOkt?: (id: string) => void;
};

const PYRAMIDE_BG: Record<PyramidArea, string> = {
  FYS: "bg-pyr-fys/15 border-l-pyr-fys",
  TEK: "bg-pyr-tek/15 border-l-pyr-tek",
  SLAG: "bg-pyr-slag/30 border-l-pyr-slag",
  SPILL: "bg-pyr-spill/15 border-l-pyr-spill",
  TURN: "bg-pyr-turn/20 border-l-pyr-turn",
};

const UKEDAGER = ["man", "tir", "ons", "tor", "fre", "lør", "søn"];

function summerFordeling(okter: MonthOkt[]): Record<PyramidArea, number> {
  const acc: Record<PyramidArea, number> = { FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 };
  for (const o of okter) {
    const min = Math.max(1, (o.endTime.getTime() - o.startTime.getTime()) / 60_000);
    acc[o.pyramide] += min;
  }
  return acc;
}

export function MonthView({ maaned, okter, forventet, onOpprett, onValgOkt }: Props) {
  const [aapenDag, setAapenDag] = useState<string | null>(null);

  const dager = useMemo(() => {
    const start = startOfWeek(startOfMonth(maaned), { weekStartsOn: 1 });
    const slutt = endOfMonth(maaned);
    const list: Date[] = [];
    let cur = start;
    while (cur <= slutt || list.length % 7 !== 0) {
      list.push(cur);
      cur = addDays(cur, 1);
    }
    return list;
  }, [maaned]);

  const totalFordeling = useMemo(() => summerFordeling(okter), [okter]);
  const idag = new Date();

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto bg-background p-4">
      {/* Pyramide-bar */}
      <div className="flex items-center gap-4">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Pyramide-fordeling
        </div>
        <div className="flex-1">
          <PyramideBar fordeling={totalFordeling} forventet={forventet} visTall />
        </div>
      </div>

      {/* Ukedags-header */}
      <div className="grid border-b border-border" style={{ gridTemplateColumns: "repeat(7, 1fr)" }}>
        {UKEDAGER.map((d) => (
          <div
            key={d}
            className="px-2 py-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Dagsruter */}
      <div className="grid gap-px bg-border" style={{ gridTemplateColumns: "repeat(7, 1fr)" }}>
        {dager.map((dato) => {
          const ikkeImaaned = !isSameMonth(dato, maaned);
          const dagensOkter = okter.filter((o) => isSameDay(o.startTime, dato));
          const erIdag = isSameDay(dato, idag);
          const helg = isWeekend(dato);
          const synlige = dagensOkter.slice(0, 3);
          const skjulte = dagensOkter.length - synlige.length;
          const datoKey = dato.toISOString().slice(0, 10);
          return (
            <div
              key={datoKey}
              className={cn(
                "relative flex min-h-[120px] flex-col gap-1.5 bg-card p-2",
                helg && "bg-secondary/50",
                ikkeImaaned && "opacity-50",
              )}
            >
              <button
                type="button"
                onClick={() => onOpprett?.(dato)}
                className="flex items-center justify-between text-left"
                aria-label={`Opprett økt ${dato.toLocaleDateString("no-NO")}`}
              >
                <span
                  className={cn(
                    "inline-flex h-7 w-7 items-center justify-center font-mono text-sm tabular-nums",
                    erIdag
                      ? "rounded-full bg-accent text-accent-foreground"
                      : "text-foreground",
                  )}
                >
                  {format(dato, "d", { locale: nb })}
                </span>
              </button>

              <div className="flex flex-col gap-1">
                {synlige.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => onValgOkt?.(o.id)}
                    className={cn(
                      "flex items-center gap-1 truncate border-l-2 px-1.5 py-0.5 text-left text-[11px]",
                      PYRAMIDE_BG[o.pyramide],
                    )}
                  >
                    <span className="truncate font-medium text-foreground">{o.title}</span>
                  </button>
                ))}
                {skjulte > 0 && (
                  <button
                    type="button"
                    onClick={() => setAapenDag((d) => (d === datoKey ? null : datoKey))}
                    className="rounded-md bg-muted px-1.5 py-0.5 text-left text-[11px] text-muted-foreground hover:bg-secondary"
                  >
                    +{skjulte} til
                  </button>
                )}
              </div>

              {aapenDag === datoKey && skjulte > 0 && (
                <div className="absolute left-2 right-2 top-full z-20 mt-1 flex flex-col gap-1 rounded-lg border border-border bg-popover p-2 shadow-lg">
                  {dagensOkter.map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => {
                        onValgOkt?.(o.id);
                        setAapenDag(null);
                      }}
                      className={cn(
                        "truncate border-l-2 px-2 py-1 text-left text-xs",
                        PYRAMIDE_BG[o.pyramide],
                      )}
                    >
                      <span className="font-mono tabular-nums text-muted-foreground">
                        {format(o.startTime, "HH:mm")}
                      </span>
                      <span className="ml-2 font-medium text-foreground">{o.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
