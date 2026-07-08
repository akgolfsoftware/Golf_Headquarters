"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
// eslint-disable-next-line no-restricted-imports -- TODO(opprydding): migrer til golfdata (Fase 3/4)
import { YearPlanGantt } from "@/components/athletic/calendars/year-plan-gantt";
// eslint-disable-next-line no-restricted-imports -- TODO(opprydding): migrer til golfdata (Fase 3/4)
import { MonthGrid } from "@/components/athletic/calendars/month-grid";
// eslint-disable-next-line no-restricted-imports -- TODO(opprydding): migrer til golfdata (Fase 3/4)
import { WeekGrid } from "@/components/athletic/calendars/week-grid";
import { byggArsfaser, byggManedceller, byggUkehendelser } from "@/lib/gruppe-kalender/bygg-visninger";
import type { GruppeKalenderData } from "@/lib/gruppe-kalender/types";

type Visning = "ar" | "maned" | "uke";

const MAANEDSNAVN = [
  "Januar", "Februar", "Mars", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Desember",
];

function mandagIUken(d: Date): Date {
  const dato = new Date(d);
  const ukedag = (dato.getDay() + 6) % 7; // søn(0)->6, man(1)->0
  dato.setDate(dato.getDate() - ukedag);
  dato.setHours(0, 0, 0, 0);
  return dato;
}

export function GruppeKalenderWrapper({ data }: { data: GruppeKalenderData }) {
  const idag = useMemo(() => new Date(), []);
  const [visning, setVisning] = useState<Visning>("uke");
  const [year, setYear] = useState(idag.getFullYear());
  const [month, setMonth] = useState(idag.getMonth() + 1); // 1-indeksert
  const [weekStart, setWeekStart] = useState(() => mandagIUken(idag));

  function naviger(retning: -1 | 1) {
    if (visning === "ar") {
      setYear((y) => y + retning);
      return;
    }
    if (visning === "maned") {
      let nyMaaned = month + retning;
      if (nyMaaned < 1) {
        nyMaaned = 12;
        setYear((y) => y - 1);
      } else if (nyMaaned > 12) {
        nyMaaned = 1;
        setYear((y) => y + 1);
      }
      setMonth(nyMaaned);
      return;
    }
    setWeekStart((w) => new Date(w.getTime() + retning * 7 * 24 * 60 * 60 * 1000));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-full border border-border bg-card p-1">
          {(["ar", "maned", "uke"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVisning(v)}
              className={
                "rounded-full px-4 py-1.5 font-mono text-[12px] font-bold uppercase tracking-[0.06em] transition " +
                (visning === v
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground")
              }
            >
              {v === "ar" ? "År" : v === "maned" ? "Måned" : "Uke"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => naviger(-1)} aria-label="Forrige">
            <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
          </Button>
          <Button variant="secondary" size="sm" onClick={() => naviger(1)} aria-label="Neste">
            <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
          </Button>
        </div>
      </div>

      {visning === "ar" && (
        <YearPlanGantt
          year={year}
          phases={byggArsfaser(data.perioder, year)}
          currentMonth={year === idag.getFullYear() ? idag.getMonth() + 1 : undefined}
        />
      )}

      {visning === "maned" && (
        <MonthGrid
          year={year}
          month={month}
          monthName={`${MAANEDSNAVN[month - 1]} ${year}`}
          cells={byggManedceller(data.faste, data.perioder, year, month)}
        />
      )}

      {visning === "uke" && (
        <WeekGrid
          weekStart={weekStart}
          events={byggUkehendelser(data.faste)}
          todayIndex={
            weekStart <= idag && idag.getTime() < weekStart.getTime() + 7 * 24 * 60 * 60 * 1000
              ? (idag.getDay() + 6) % 7
              : undefined
          }
        />
      )}
    </div>
  );
}
