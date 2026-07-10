"use client";

/**
 * PlayerHQ Plan — v2 (retning C «Presis»). Komponert 1:1 fra
 * ui_kits/v2/phq-skjermer.jsx → funksjonen Plan, men med EKTE data fra
 * getDashboardData (src/app/portal/actions.ts): ukeoversikt (week) +
 * ukas planlagte/fullførte belastning per akse (weekProgress).
 *
 * Låst IA: Plan er ETT trykkpunkt til Workbench — ikke en meny av kort.
 * All faktisk planlegging (dra/slipp/be om endring) skjer i Workbench;
 * denne flaten er oversikt + inngang. Kun v2-komponenter fra
 * "@/components/v2"; ingen ad-hoc UI, ingen rå hex (kun T.*).
 *
 * V2Shell (montert i (v2preview)/v2-plan/page.tsx) eier chrome-en — denne
 * komponenten rendrer bare den indre innholds-stacken.
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import type { DashboardData } from "@/app/portal/actions";
import type { PyramidArea } from "@/generated/prisma/client";
import {
  T,
  Caps,
  Tittel,
  Kort,
  Rad,
  AkseChip,
  AkseBar,
  TallHero,
  PillVelger,
  InnsiktChip,
  DagStripe,
  TomTilstand,
  type StripeDag,
} from "@/components/v2";
import type { AkseKey } from "@/lib/v2/tokens";
import { WorkbenchInngang, WORKBENCH_HREF } from "./WorkbenchInngang";

/* ── Rene hjelpere (norsk bokmål, brutto tall) ─────────────────────── */

const UKEDAGER = ["søndag", "mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag"];
const MANEDER = [
  "januar", "februar", "mars", "april", "mai", "juni",
  "juli", "august", "september", "oktober", "november", "desember",
];
/** Aksene i pyramide-rekkefølge (fasten fra bunn til topp). */
const AKSER: AkseKey[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];


/** «23.–29. juni» (samme måned) eller «29. juni – 5. juli» (over månedsskifte). */
function periodeLinje(week: DashboardData["week"]): string {
  const first = week[0]?.date;
  const last = week[6]?.date;
  if (!first || !last) return "";
  const d1 = first.getDate();
  const d2 = last.getDate();
  if (first.getMonth() === last.getMonth()) return `${d1}.–${d2}. ${MANEDER[first.getMonth()]}`;
  return `${d1}. ${MANEDER[first.getMonth()]} – ${d2}. ${MANEDER[last.getMonth()]}`;
}

/** «Onsdag 25.» — full ukedag + dato, til kort-eyebrow. */
function dagEtikett(dato: Date): string {
  const dag = UKEDAGER[dato.getDay()];
  return `${dag[0].toUpperCase()}${dag.slice(1)} ${dato.getDate()}.`;
}

function toMin(dato: Date): string {
  const h = String(dato.getHours()).padStart(2, "0");
  const m = String(dato.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

/** Minutter → «1,5 t» (≥60) eller «45 min». */
function varighet(min: number): string {
  if (min >= 60) return `${(min / 60).toFixed(1).replace(".", ",")} t`;
  return `${min} min`;
}

/** Minutter → timer (1 desimal). */
function timer(min: number): number {
  return Math.round((min / 60) * 10) / 10;
}

/** 8.5 → «8,5» (norsk desimalkomma). */
function fmtT(t: number): string {
  return String(t).replace(".", ",");
}

/** true på klient etter mount når viewport < 768px (styrer kun tallstørrelser/kolonner). */
function useMobile(): boolean {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const oppdater = () => setM(mq.matches);
    oppdater();
    mq.addEventListener("change", oppdater);
    return () => mq.removeEventListener("change", oppdater);
  }, []);
  return m;
}

/* ── Skjerm ────────────────────────────────────────────────────────── */

type Periode = "uke" | "maned" | "sesong";

export function PlanV2({ data }: { data: DashboardData }) {
  const mobile = useMobile();
  const [periode, setPeriode] = useState<Periode>("uke");
  const { weekNumber, week, weekProgress } = data;

  // DagStripe — ekte uke (mandag→søndag). state «done» = tidligere dag der alle økter er fullført.
  const iDag = new Date();
  iDag.setHours(0, 0, 0, 0);
  const stripeDager: StripeDag[] = week.map((d) => {
    const forbi = d.date.getTime() < iDag.getTime();
    const alleFullfort = d.sessions.length > 0 && d.sessions.every((s) => s.status === "COMPLETED");
    return {
      dow: d.dayLabel.charAt(0),
      date: d.dayNumber,
      today: d.isToday,
      state: forbi && alleFullfort ? "done" : undefined,
    };
  });
  const aktivDag = week.find((d) => d.isToday)?.dayNumber ?? null;

  // Ukeplan — kun dager med planlagte økter (som mockupens UKEPLAN).
  const dagerMedOkter = week.filter((d) => d.sessions.length > 0);

  // Ukas belastning — planlagte timer totalt + fullført, per akse (ekte, ikke fabrikkert).
  const planlagtTot = timer(weekProgress.plannedMin);
  const fullfortTot = timer(weekProgress.completedMin);
  const gjennomforPct =
    weekProgress.plannedMin > 0 ? Math.round((weekProgress.completedMin / weekProgress.plannedMin) * 100) : 0;
  const akseRader = AKSER.map((a) => ({
    a,
    v: timer(weekProgress.completedByAxis[a as PyramidArea]),
    m: timer(weekProgress.plannedByAxis[a as PyramidArea]),
  })).filter((r) => r.m > 0 || r.v > 0);
  const akseMax = Math.max(5, Math.ceil(Math.max(...akseRader.map((r) => Math.max(r.v, r.m)), 0)));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Hode */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <Caps>{`Uke ${weekNumber} · ${periodeLinje(week)}`}</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel mobile={mobile} em="uke">Din</Tittel>
          </div>
        </div>
        <PillVelger
          options={[
            { v: "uke", l: "Uke" },
            { v: "maned", l: "Måned" },
            { v: "sesong", l: "Sesong" },
          ]}
          value={periode}
          onChange={(v) => setPeriode(v as Periode)}
        />
      </div>

      {periode === "uke" ? (
        <>
          <DagStripe days={stripeDager} value={aktivDag} />

          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr]" style={{ gap: T.gap, alignItems: "start" }}>
            {/* Ukeplan — dag for dag */}
            <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
              {dagerMedOkter.length > 0 ? (
                dagerMedOkter.map((d) => (
                  <Kort key={d.date.toISOString()} eyebrow={dagEtikett(d.date)}>
                    {d.sessions.map((o, j) => {
                      const naa = o.status === "IN_PROGRESS";
                      const varMin = Math.max(0, Math.round((o.endTime.getTime() - o.startTime.getTime()) / 60_000));
                      return (
                        <Rad
                          key={o.id}
                          leading={
                            <span style={{ width: 44, flex: "none", fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: naa ? T.lime : T.mut }}>
                              {toMin(o.startTime)}
                            </span>
                          }
                          title={o.title}
                          sub={varighet(varMin)}
                          meta={<AkseChip a={o.pyramidArea as AkseKey} />}
                          naa={naa}
                          trailing={null}
                          last={j === d.sessions.length - 1}
                        />
                      );
                    })}
                  </Kort>
                ))
              ) : (
                <Kort>
                  <TomTilstand
                    icon="calendar"
                    title="Ingen økter planlagt denne uka"
                    sub="Legg til økter i Workbench — dra, slipp og be om endring."
                  />
                </Kort>
              )}
            </div>

            {/* Belastning + innsikt + Workbench-inngang */}
            <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
              <Kort tint eyebrow="Ukas belastning">
                {weekProgress.plannedMin > 0 ? (
                  <>
                    <TallHero
                      value={fmtT(planlagtTot)}
                      unit="timer"
                      size={40}
                      sub={`${fmtT(fullfortTot)} t fullført · ${gjennomforPct} % av planen`}
                    />
                    <div style={{ marginTop: 12 }}>
                      {akseRader.map((r, i) => (
                        <AkseBar key={r.a} a={r.a} v={r.v} m={r.m} max={akseMax} last={i === akseRader.length - 1} />
                      ))}
                    </div>
                  </>
                ) : (
                  <TomTilstand icon="activity" title="Ingen belastning planlagt" sub="Planlegg ukas økter i Workbench." />
                )}
              </Kort>

              <Link href={WORKBENCH_HREF} style={{ textDecoration: "none", display: "block" }}>
                <InnsiktChip cta="Åpne Workbench">
                  Vil du endre planen? Dra og slipp i Workbench — coachen din ser forslaget med en gang.
                </InnsiktChip>
              </Link>

              <WorkbenchInngang />
            </div>
          </div>
        </>
      ) : (
        /* Måned/Sesong — periodeplan bor i Workbench (loaderen leverer kun inneværende uke). */
        <Kort>
          <TomTilstand
            icon="calendar"
            title={periode === "maned" ? "Månedsplan" : "Sesongplan"}
            sub="Hele periodeplanen ser du og redigerer i Workbench."
          />
          <div style={{ marginTop: 4 }}>
            <WorkbenchInngang />
          </div>
        </Kort>
      )}
    </div>
  );
}
