"use client";

/**
 * PlayerHQ Plan — v2 Presis + opplevelse B-pakke (uke + status).
 * Oversikt + ett trykk til Workbench. Ekte data fra getDashboardData.
 * Låst: docs/design-system/plattform-design-2026-07-21/RETNING-PLAN.md
 *
 * V2Shell eier chrome — denne filen er innholds-stacken.
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
  StatusPill,
  CTAPill,
  ProgresjonsBar,
  DagStripe,
  TomTilstand,
  HjelpTips,
  type StripeDag,
  type StatusTone,
} from "@/components/v2";
import type { AkseKey } from "@/lib/v2/tokens";
import { WORKBENCH_HREF } from "./WorkbenchInngang";

const UKEDAGER = ["søndag", "mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag"];
const MANEDER = [
  "januar", "februar", "mars", "april", "mai", "juni",
  "juli", "august", "september", "oktober", "november", "desember",
];
const AKSER: AkseKey[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];

const AKSE_KORT: Record<AkseKey, string> = {
  FYS: "Fysisk",
  TEK: "Teknikk",
  SLAG: "Slag",
  SPILL: "Spill",
  TURN: "Turnering",
};

function periodeLinje(week: DashboardData["week"]): string {
  const first = week[0]?.date;
  const last = week[6]?.date;
  if (!first || !last) return "";
  const d1 = first.getDate();
  const d2 = last.getDate();
  if (first.getMonth() === last.getMonth()) return `${d1}.–${d2}. ${MANEDER[first.getMonth()]}`;
  return `${d1}. ${MANEDER[first.getMonth()]} – ${d2}. ${MANEDER[last.getMonth()]}`;
}

function dagEtikett(dato: Date): string {
  const dag = UKEDAGER[dato.getDay()];
  return `${dag[0].toUpperCase()}${dag.slice(1)} ${dato.getDate()}.`;
}

function toMin(dato: Date): string {
  const h = String(dato.getHours()).padStart(2, "0");
  const m = String(dato.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

function varighet(min: number): string {
  if (min >= 60) return `${(min / 60).toFixed(1).replace(".", ",")} t`;
  return `${min} min`;
}

function timer(min: number): number {
  return Math.round((min / 60) * 10) / 10;
}

function fmtT(t: number): string {
  return String(t).replace(".", ",");
}

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

/** Dominerende planlagt akse denne uka (timer) — «Fokus»-KPI. */
function ukasFokusAkse(weekProgress: DashboardData["weekProgress"]): AkseKey | null {
  let best: AkseKey | null = null;
  let bestMin = 0;
  for (const a of AKSER) {
    const m = weekProgress.plannedByAxis[a as PyramidArea] ?? 0;
    if (m > bestMin) {
      bestMin = m;
      best = a;
    }
  }
  return bestMin > 0 ? best : null;
}

export function PlanV2({ data }: { data: DashboardData }) {
  const mobile = useMobile();
  const { weekNumber, week, weekProgress, optimalSession, todayAll, nesteHandling } = data;

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

  const planlagtTot = timer(weekProgress.plannedMin);
  const fullfortTot = timer(weekProgress.completedMin);
  const gjennomforPct =
    weekProgress.plannedMin > 0
      ? Math.round((weekProgress.completedMin / weekProgress.plannedMin) * 100)
      : 0;

  const fokusAkse =
    (todayAll[0]?.pyramidArea as AkseKey | undefined) ??
    (optimalSession?.pyramidArea as AkseKey | undefined) ??
    ukasFokusAkse(weekProgress);

  const akseRader = AKSER.map((a) => ({
    a,
    v: timer(weekProgress.completedByAxis[a as PyramidArea]),
    m: timer(weekProgress.plannedByAxis[a as PyramidArea]),
  })).filter((r) => r.m > 0 || r.v > 0);
  const akseMax = Math.max(5, Math.ceil(Math.max(...akseRader.map((r) => Math.max(r.v, r.m)), 0)));

  // I dag: bruk todayAll (full detalj). Resten av uka: week-rader.
  const dagerMedOkter = week.filter((d) => d.sessions.length > 0 && !d.isToday);

  const statusTone: StatusTone =
    gjennomforPct >= 80 ? "up" : gjennomforPct >= 40 ? "info" : weekProgress.plannedMin > 0 ? "warn" : "info";
  const statusTekst =
    weekProgress.plannedMin === 0
      ? "Ingen plan"
      : gjennomforPct >= 80
        ? "På plan"
        : gjennomforPct >= 40
          ? "Underveis"
          : "Bak plan";

  // Primær CTA: start/neste fra dashboard, ellers Workbench
  const harDagensJobb = todayAll.some(
    (o) => o.status !== "COMPLETED" && o.status !== "CANCELLED" && o.status !== "SKIPPED",
  );
  const primaerHref = harDagensJobb ? nesteHandling.href : WORKBENCH_HREF;
  const primaerTekst = harDagensJobb
    ? nesteHandling.tekst
    : weekProgress.plannedMin > 0
      ? "Åpne Workbench"
      : "Planlegg uke i Workbench";
  const primaerIkon = harDagensJobb ? nesteHandling.ikon : "calendar";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Hode — B: «Din uke» + status */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <Caps>{`Uke ${weekNumber} · ${periodeLinje(week)}`}</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel mobile={mobile} em="uke">
              Din
            </Tittel>
          </div>
        </div>
        <StatusPill tone={statusTone}>{statusTekst}</StatusPill>
      </div>

      {/* Uke-status KPI — B: planlagt / gjort / fokus (kompakt, ikke 38px-helter) */}
      <div className="grid grid-cols-3" style={{ gap: 8 }}>
        {(
          [
            { l: "Planlagt", v: weekProgress.plannedMin > 0 ? `${fmtT(planlagtTot)} t` : "—", h: "ukevolum" as const },
            {
              l: "Gjort",
              v: weekProgress.plannedMin > 0 || weekProgress.completedMin > 0 ? `${fmtT(fullfortTot)} t` : "—",
              h: "planEtterlevelse" as const,
            },
            { l: "Fokus", v: fokusAkse ? AKSE_KORT[fokusAkse] : "—", h: "pyramideAkse" as const },
          ] as const
        ).map((k) => (
          <Kort key={k.l} pad="12px 12px">
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Caps size={9}>{k.l}</Caps>
              <HjelpTips k={k.h} size={11} />
            </div>
            <div
              style={{
                fontFamily: T.mono,
                fontWeight: 700,
                fontSize: mobile ? 16 : 18,
                color: T.fg,
                marginTop: 8,
                letterSpacing: "-0.02em",
                lineHeight: 1.15,
              }}
            >
              {k.v}
            </div>
          </Kort>
        ))}
      </div>

      {weekProgress.plannedMin > 0 && (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 6,
            }}
          >
            <span style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, fontWeight: 600 }}>
              Uke-gjennomføring
            </span>
            <span style={{ fontFamily: T.mono, fontSize: 11.5, fontWeight: 700, color: T.fg }}>
              {gjennomforPct} %
            </span>
          </div>
          <ProgresjonsBar variant="bar" value={gjennomforPct} max={100} showValue={false} label="" />
        </div>
      )}

      <DagStripe days={stripeDager} value={aktivDag} />

      {/* Primær CTA — én grønn jobb */}
      <Link href={primaerHref} style={{ textDecoration: "none", display: "block" }}>
        <CTAPill icon={primaerIkon} full>
          {primaerTekst}
        </CTAPill>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr]" style={{ gap: T.gap, alignItems: "start" }}>
        {/* Tidslinje / dager */}
        <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
          {todayAll.length > 0 ? (
            <Kort
              eyebrow={
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  I dag
                  <Caps size={9}>
                    {todayAll.length} økt{todayAll.length === 1 ? "" : "er"}
                  </Caps>
                </span>
              }
            >
              {todayAll.map((o, j) => {
                const naa = o.status === "IN_PROGRESS";
                const statusL =
                  o.status === "COMPLETED" ? "Fullført" : o.status === "IN_PROGRESS" ? "Pågår" : "Planlagt";
                return (
                  <div key={o.id} style={{ marginBottom: j < todayAll.length - 1 ? 10 : 0 }}>
                    <Rad
                      leading={
                        <span
                          style={{
                            width: 44,
                            flex: "none",
                            fontFamily: T.mono,
                            fontSize: 11,
                            fontWeight: 700,
                            color: naa ? T.lime : T.mut,
                          }}
                        >
                          {toMin(o.startTime)}
                        </span>
                      }
                      title={
                        <span
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            whiteSpace: "normal",
                          }}
                        >
                          {o.title}
                        </span>
                      }
                      sub={[varighet(o.durationMin), o.sted].filter(Boolean).join(" · ")}
                      meta={<AkseChip a={o.pyramidArea as AkseKey} />}
                      naa={naa}
                      trailing={null}
                      last
                    />
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8, paddingLeft: 55 }}>
                      <StatusPill tone={naa ? "lime" : o.status === "COMPLETED" ? "up" : "info"}>
                        {statusL}
                      </StatusPill>
                      {o.drills.length > 0 && <Caps size={9}>{o.drills.length} øvelser</Caps>}
                    </div>
                  </div>
                );
              })}
            </Kort>
          ) : (
            <Kort eyebrow="I dag">
              {optimalSession ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <Caps>Anbefalt (fra form)</Caps>
                  <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 16, color: T.fg }}>
                    {optimalSession.title}
                  </div>
                  <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, margin: 0, lineHeight: 1.5 }}>
                    {optimalSession.rationale}
                  </p>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <AkseChip a={optimalSession.pyramidArea as AkseKey} />
                    <StatusPill tone="info">{varighet(optimalSession.durationMin)}</StatusPill>
                  </div>
                </div>
              ) : (
                <TomTilstand
                  icon="calendar"
                  title="Ingen økt i dag"
                  sub="Hviledag — eller legg inn økter i Workbench."
                />
              )}
            </Kort>
          )}

          {dagerMedOkter.map((d) => (
            <Kort key={d.date.toISOString()} eyebrow={dagEtikett(d.date)}>
              {d.sessions.map((o, j) => {
                const naa = o.status === "IN_PROGRESS";
                const varMin = Math.max(0, Math.round((o.endTime.getTime() - o.startTime.getTime()) / 60_000));
                return (
                  <Rad
                    key={o.id}
                    leading={
                      <span
                        style={{
                          width: 44,
                          flex: "none",
                          fontFamily: T.mono,
                          fontSize: 11,
                          fontWeight: 700,
                          color: naa ? T.lime : T.mut,
                        }}
                      >
                        {toMin(o.startTime)}
                      </span>
                    }
                    title={
                      <span
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          whiteSpace: "normal",
                        }}
                      >
                        {o.title}
                      </span>
                    }
                    sub={varighet(varMin)}
                    meta={<AkseChip a={o.pyramidArea as AkseKey} />}
                    naa={naa}
                    trailing={null}
                    last={j === d.sessions.length - 1}
                  />
                );
              })}
            </Kort>
          ))}

          {todayAll.length === 0 && dagerMedOkter.length === 0 && !optimalSession && (
            <Kort>
              <TomTilstand
                icon="calendar"
                title="Ingen økter planlagt denne uka"
                sub="Åpne Workbench for å legge inn økter."
              />
            </Kort>
          )}
        </div>

        {/* Side: belastning + hvorfor + sekundær */}
        <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
          <Kort
            tint
            eyebrow={
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                Ukas belastning
                <HjelpTips k="ukevolum" size={11} />
              </span>
            }
            action={<HjelpTips k="pyramideAkse" size={11} align="right" />}
          >
            {weekProgress.plannedMin > 0 ? (
              <>
                <div
                  style={{
                    fontFamily: T.mono,
                    fontWeight: 700,
                    fontSize: 28,
                    color: T.fg,
                    letterSpacing: "-0.03em",
                  }}
                >
                  {fmtT(planlagtTot)}
                  <span style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 500, color: T.mut, marginLeft: 6 }}>
                    timer
                  </span>
                </div>
                <p style={{ fontFamily: T.ui, fontSize: 12, color: T.fg2, margin: "6px 0 0" }}>
                  {fmtT(fullfortTot)} t fullført · {gjennomforPct} % av planen
                </p>
                {akseRader.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    {akseRader.map((r, i) => (
                      <AkseBar key={r.a} a={r.a} v={r.v} m={r.m} max={akseMax} last={i === akseRader.length - 1} />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <TomTilstand icon="activity" title="Ingen belastning" sub="Planlegg økter i Workbench." />
            )}
          </Kort>

          {/* Hvorfor — sekundært (fra SG / optimal) */}
          {optimalSession && (
            <Kort eyebrow="Fra form (SG)">
              <div style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg, lineHeight: 1.35 }}>
                {optimalSession.title}
              </div>
              <p style={{ fontFamily: T.ui, fontSize: 12, color: T.mut, margin: "6px 0 0", lineHeight: 1.45 }}>
                {optimalSession.rationale}
              </p>
            </Kort>
          )}

          {/* Sekundær — ghost, ikke grønn */}
          <Link href={WORKBENCH_HREF} style={{ textDecoration: "none", display: "block" }}>
            <CTAPill icon="calendar" ghost full>
              Endre tidslinje i Workbench
            </CTAPill>
          </Link>
          <Link
            href="/portal/planlegge/bygger"
            style={{
              textDecoration: "none",
              display: "block",
              textAlign: "center",
              fontFamily: T.ui,
              fontSize: 12,
              fontWeight: 600,
              color: T.mut,
              padding: "4px 0",
            }}
          >
            Bygg ny plan fra bunnen →
          </Link>
        </div>
      </div>
    </div>
  );
}
