"use client";

// KalenderRoot — Client-wrapper som binder vy-velger, sidebar og data sammen.
//
// Tar inn demo- eller ekte-data og rendrer riktig vy basert på state. Server-
// komponenten leverer dataene, denne håndterer interaksjonen.

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { addDays, addMonths, addYears, addWeeks } from "date-fns";
import type { PyramidArea, PracticeType, PeriodeType } from "@/generated/prisma/client";
import { CalendarShell, type KalenderVy } from "./CalendarShell";
import { PlanSidebar, type FilterState, type PeriodeStatus, type SidebarStats, type SpillerOption } from "./PlanSidebar";
import { AarsplanView, type AarsplanPeriode, type AarsplanTurnering } from "./AarsplanView";
import { MonthView, type MonthOkt } from "./MonthView";
import { WeekView, type WeekOkt } from "./WeekView";
import { DayView, type DayOkt } from "./DayView";

export type KalenderOkt = {
  id: string;
  spilllerId: string;
  title: string;
  startTime: Date;
  endTime: Date;
  pyramide: PyramidArea;
  practiceType: PracticeType;
  notes?: string | null;
};

export type KalenderData = {
  startVy: KalenderVy;
  basisdato: Date;
  spillere: SpillerOption[];
  perioder: AarsplanPeriode[];
  turneringer: AarsplanTurnering[];
  okter: KalenderOkt[];
  aktivPeriode: PeriodeStatus | null;
  planNavn?: string;
};

const URL_VY: Record<KalenderVy, string> = {
  AAR: "ar",
  MAANED: "maaned",
  UKE: "uke",
  DAG: "dag",
};

function defaultFilter(): FilterState {
  return {
    pyramide: { FYS: true, TEK: true, SLAG: true, SPILL: true, TURN: true },
    praksis: { BLOKK: true, RANDOM: true, KONKURRANSE: true, SPILL_TEST: true },
    visAvbrutte: false,
    visSkjulte: false,
  };
}

export function KalenderRoot({ data }: { data: KalenderData }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [vy, setVy] = useState<KalenderVy>(data.startVy);
  const [basisdato, setBasisdato] = useState<Date>(data.basisdato);
  const [valgtSpiller, setValgtSpiller] = useState<string | null>(
    data.spillere[0]?.id ?? null,
  );
  const [filter, setFilter] = useState<FilterState>(defaultFilter());
  const [sidebarApent, setSidebarApent] = useState(true);

  function bytteVy(ny: KalenderVy) {
    setVy(ny);
    const params = new URLSearchParams(sp.toString());
    params.set("view", URL_VY[ny]);
    router.replace(`?${params.toString()}`);
  }

  function bytteDato(delta: -1 | 0 | 1) {
    if (delta === 0) {
      setBasisdato(new Date());
      return;
    }
    if (vy === "AAR") setBasisdato((d) => addYears(d, delta));
    else if (vy === "MAANED") setBasisdato((d) => addMonths(d, delta));
    else if (vy === "UKE") setBasisdato((d) => addWeeks(d, delta));
    else setBasisdato((d) => addDays(d, delta));
  }

  // Filtrer for valgt spiller
  const okterForSpiller = useMemo(() => {
    if (!valgtSpiller) return data.okter;
    return data.okter.filter((o) => o.spilllerId === valgtSpiller);
  }, [data.okter, valgtSpiller]);

  const filtrert = useMemo(() => {
    return okterForSpiller.filter(
      (o) => filter.pyramide[o.pyramide] && filter.praksis[o.practiceType],
    );
  }, [okterForSpiller, filter]);

  const stats: SidebarStats = useMemo(() => {
    const naa = new Date();
    const ukeFra = addDays(naa, -7);
    const maanedFra = addDays(naa, -30);
    let ukeMin = 0;
    let maanedMin = 0;
    const fordeling: Record<PyramidArea, number> = { FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 };
    for (const o of filtrert) {
      const min = (o.endTime.getTime() - o.startTime.getTime()) / 60_000;
      if (o.startTime >= ukeFra) ukeMin += min;
      if (o.startTime >= maanedFra) maanedMin += min;
      fordeling[o.pyramide] += min;
    }
    return {
      timerDenneUken: ukeMin / 60,
      timerDenneMaaneden: maanedMin / 60,
      antallOkter: filtrert.length,
      fordeling,
    };
  }, [filtrert]);

  // Map til vy-spesifikke typer
  const monthOkter: MonthOkt[] = filtrert.map(({ spilllerId: _s, notes: _n, ...o }) => o);
  const weekOkter: WeekOkt[] = filtrert.map(({ spilllerId: _s, notes: _n, ...o }) => o);
  const dayOkter: DayOkt[] = filtrert.map(({ spilllerId: _s, ...o }) => o);

  return (
    <div className="flex h-full">
      {sidebarApent && (
        <PlanSidebar
          spillere={data.spillere}
          valgtSpillerId={valgtSpiller}
          onValgSpiller={setValgtSpiller}
          planNavn={data.planNavn}
          periode={data.aktivPeriode}
          stats={stats}
          filter={filter}
          onFilterChange={setFilter}
        />
      )}
      <div className="flex flex-1 flex-col">
        <CalendarShell
          vy={vy}
          onByttVy={bytteVy}
          basisdato={basisdato}
          onByttDato={bytteDato}
          onValgIdag={() => setBasisdato(new Date())}
          sidebarApent={sidebarApent}
          onToggleSidebar={() => setSidebarApent((v) => !v)}
        >
          {vy === "AAR" && (
            <AarsplanView
              aar={basisdato.getFullYear()}
              spillere={data.spillere.map((s) => ({ id: s.id, navn: s.navn }))}
              perioder={data.perioder}
              turneringer={data.turneringer}
            />
          )}
          {vy === "MAANED" && (
            <MonthView
              maaned={basisdato}
              okter={monthOkter}
              forventet={erverventet(data.aktivPeriode?.type)}
            />
          )}
          {vy === "UKE" && <WeekView uke={basisdato} okter={weekOkter} />}
          {vy === "DAG" && (
            <DayView
              dato={basisdato}
              okter={dayOkter.filter(
                (o) => o.startTime.toDateString() === basisdato.toDateString(),
              )}
              forventet={erverventet(data.aktivPeriode?.type)}
            />
          )}
        </CalendarShell>
      </div>
    </div>
  );
}

function erverventet(
  type: PeriodeType | undefined,
): Partial<Record<PyramidArea, number>> | undefined {
  if (!type) return undefined;
  // Forenklet: bruk midt-verdier fra constraints
  const mid: Record<PeriodeType, Partial<Record<PyramidArea, number>>> = {
    GRUNN: { FYS: 30, TEK: 30, SLAG: 15, SPILL: 15, TURN: 5 },
    SPESIALISERING: { FYS: 20, TEK: 20, SLAG: 30, SPILL: 25, TURN: 10 },
    TURNERING: { FYS: 10, TEK: 10, SLAG: 25, SPILL: 30, TURN: 25 },
    EVALUERING: { FYS: 5, TEK: 5, SLAG: 15, SPILL: 35, TURN: 40 },
    FERIE: { FYS: 70, TEK: 10, SLAG: 5, SPILL: 5, TURN: 0 },
  };
  return mid[type];
}
