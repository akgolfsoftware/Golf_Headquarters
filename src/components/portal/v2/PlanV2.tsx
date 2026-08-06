"use client";

/**
 * PlayerHQ Plan — Paper-port PR-B (avvik A2).
 * Fasit: designsystem/paper/fase1/playerhq-plan.html
 *
 * A2: 720px-kolonne, én aksenthandling (dokk «Start [økta] · tid»),
 * ingen KPI-tankestrek-helter, Workbench kun som sekundær (ghost).
 */

import Link from "next/link";
import { useState } from "react";
import type { DashboardData } from "@/app/portal/actions";
import {
  T,
  Caps,
  Kort,
  AkseChip,
  StatusPill,
  CTAPill,
  DagStripe,
  TomTilstand,
  type StripeDag,
} from "@/components/v2";
import { OktKort } from "@/components/v2/domene";
import { BunnArk } from "@/components/v2/bunn-ark";
import type { AkseKey } from "@/lib/v2/tokens";
import { WORKBENCH_HREF } from "./WorkbenchInngang";

const UKEDAGER = ["søndag", "mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag"];
const MANEDER = [
  "januar", "februar", "mars", "april", "mai", "juni",
  "juli", "august", "september", "oktober", "november", "desember",
];

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

function kortNavn(tittel: string): string {
  return tittel.split(" · ")[0] ?? tittel;
}

export function PlanV2({ data }: { data: DashboardData }) {
  const { weekNumber, week, weekProgress, optimalSession, todayAll } = data;

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
  const aktivDag = week.find((d) => d.isToday)?.dayNumber ?? week[0]?.dayNumber ?? null;

  const [valgtDagDato, setValgtDagDato] = useState<number | null>(aktivDag);
  const valgtDagObj = week.find((d) => d.dayNumber === valgtDagDato) ?? week.find((d) => d.isToday) ?? week[0];

  const [apentOktId, setApentOktId] = useState<string | null>(null);
  const apenOkt = apentOktId
    ? week.flatMap((d) => d.sessions).find((o) => o.id === apentOktId)
    : null;
  const apenOktDag = apenOkt ? week.find((d) => d.sessions.some((s) => s.id === apenOkt.id)) : null;

  const gjennomforPct =
    weekProgress.plannedMin > 0
      ? Math.round((weekProgress.completedMin / weekProgress.plannedMin) * 100)
      : 0;

  // Neste økt for dokken: pågående først, ellers første ufullførte i dag/uka
  const nesteOkt =
    todayAll.find((o) => o.status === "IN_PROGRESS") ??
    todayAll.find((o) => o.status !== "COMPLETED" && o.status !== "CANCELLED" && o.status !== "SKIPPED") ??
    week
      .flatMap((d) => d.sessions)
      .find((o) => o.status !== "COMPLETED" && o.status !== "CANCELLED" && o.status !== "SKIPPED") ??
    null;

  const dokkTekst = nesteOkt
    ? `Start ${kortNavn(nesteOkt.title).toLowerCase()} · ${toMin(nesteOkt.startTime)}`
    : null;

  return (
    <div
      data-paper-portal-planlegge
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        position: "relative",
      }}
    >
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflow: "auto",
          padding: "16px 16px 88px",
        }}
      >
        <div
          style={{
            maxWidth: 720,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* Kompakt topplinje — fasit, ikke «Din *uke*»-helter */}
          <header
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div>
              <h1
                style={{
                  margin: 0,
                  fontFamily: T.disp,
                  fontSize: 15,
                  fontWeight: 600,
                  color: T.fg,
                }}
              >
                Plan
              </h1>
              <div
                style={{
                  fontFamily: T.mono,
                  fontSize: 10.5,
                  letterSpacing: "0.04em",
                  color: T.mut,
                  marginTop: 2,
                }}
              >
                Uke {weekNumber} · {periodeLinje(week)}
                {weekProgress.plannedMin > 0 ? ` · ${gjennomforPct} % gjort` : ""}
              </div>
            </div>
            <Link
              href={WORKBENCH_HREF}
              className="v2-press v2-focus"
              style={{
                minHeight: 36,
                padding: "0 12px",
                borderRadius: 8,
                border: `1px solid ${T.border}`,
                background: "transparent",
                color: T.fg,
                fontFamily: T.ui,
                fontSize: 12,
                fontWeight: 500,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              Workbench
            </Link>
          </header>

          <DagStripe days={stripeDager} value={valgtDagDato} onChange={(dato) => setValgtDagDato(dato)} />

          {valgtDagObj && (
            <Kort
              pad="12px"
              eyebrow={
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  {valgtDagObj.isToday ? "I dag" : dagEtikett(valgtDagObj.date)}
                  {valgtDagObj.sessions.length > 0 && (
                    <Caps size={9}>
                      {valgtDagObj.sessions.length} økt{valgtDagObj.sessions.length === 1 ? "" : "er"}
                    </Caps>
                  )}
                </span>
              }
            >
              {valgtDagObj.sessions.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {valgtDagObj.sessions.map((o) => {
                    const naa = o.status === "IN_PROGRESS";
                    const ferdig = o.status === "COMPLETED" || o.status === "SKIPPED";
                    const state = ferdig ? ("done" as const) : naa ? ("live" as const) : ("planned" as const);
                    return (
                      <OktKort
                        key={o.id}
                        title={o.title}
                        time={toMin(o.startTime)}
                        duration={varighet(o.durationMin)}
                        axis={(o.pyramidArea as AkseKey) || "TEK"}
                        state={state}
                        naa={naa}
                        onClick={() => setApentOktId(o.id)}
                        meta={[o.sted, o.drills.length > 0 ? `${o.drills.length} øvelser` : null]
                          .filter(Boolean)
                          .join(" · ")}
                      />
                    );
                  })}
                </div>
              ) : valgtDagObj.isToday && optimalSession ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <Caps>Anbefalt (fra form)</Caps>
                  <div style={{ fontFamily: T.disp, fontWeight: 600, fontSize: 15, color: T.fg }}>
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
                  title="Hviledag"
                  sub="Ingen økt denne dagen. Endre i Workbench hvis du vil legge inn noe."
                />
              )}
            </Kort>
          )}

          {week.every((d) => d.sessions.length === 0) && !optimalSession && (
            <Kort>
              <TomTilstand
                icon="calendar"
                title="Ingen økter planlagt denne uka"
                sub="Åpne Workbench for å legge inn økter — eller vent på coach-plan."
              />
              <div style={{ marginTop: 12 }}>
                <Link href={WORKBENCH_HREF} style={{ textDecoration: "none", display: "block" }}>
                  <CTAPill icon="calendar" ghost full>
                    Åpne Workbench
                  </CTAPill>
                </Link>
              </div>
            </Kort>
          )}
        </div>
      </div>

      {/* Dokk — ÉN aksenthandling (fasit .dokk + .btn.now) */}
      {dokkTekst && nesteOkt && !apenOkt && (
        <div
          style={{
            position: "sticky",
            bottom: 0,
            borderTop: `1px solid ${T.border}`,
            background: T.bg,
            padding: "12px 16px",
            paddingBottom: "max(12px, env(safe-area-inset-bottom))",
          }}
        >
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <Link
              href={nesteOkt.href}
              className="v2-press v2-focus"
              data-od-id="plan-dokk-start"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 48,
                width: "100%",
                borderRadius: 10,
                background: T.handling,
                color: T.onHandling,
                fontFamily: T.ui,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              {dokkTekst}
            </Link>
          </div>
        </div>
      )}

      <BunnArk open={apenOkt != null} onClose={() => setApentOktId(null)} tittel={apenOkt?.title}>
        {apenOkt && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                ["Når", `${apenOktDag ? dagEtikett(apenOktDag.date) : ""} ${toMin(apenOkt.startTime)}`],
                ["Sted", apenOkt.sted ?? "—"],
                ["Varighet", varighet(apenOkt.durationMin)],
                ["Pyramide", AKSE_KORT[(apenOkt.pyramidArea as AkseKey) || "TEK"]],
              ].map(([l, v]) => (
                <div
                  key={l}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 12.5,
                    fontFamily: T.ui,
                    color: T.mut,
                  }}
                >
                  <span>{l}</span>
                  <span style={{ fontFamily: T.mono, color: T.fg }}>{v}</span>
                </div>
              ))}
            </div>

            {apenOkt.maalsetning && (
              <div>
                <Caps size={9}>Målsetning</Caps>
                <p style={{ margin: "6px 0 0", fontFamily: T.ui, fontSize: 13, color: T.fg2, lineHeight: 1.5 }}>
                  {apenOkt.maalsetning}
                </p>
              </div>
            )}

            {apenOkt.drills.length > 0 && (
              <div>
                <Caps size={9}>{`Drills · ${apenOkt.drills.length}`}</Caps>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                  {apenOkt.drills.map((d) => (
                    <div
                      key={d.id}
                      style={{
                        border: `1px solid ${T.border}`,
                        borderRadius: T.rCard,
                        padding: "8px 12px",
                        background: T.bg,
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 8,
                      }}
                    >
                      <span style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg }}>{d.name}</span>
                      <span style={{ fontFamily: T.mono, fontSize: 11, color: T.mut, flex: "none" }}>
                        {d.durationMinutes} min
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p style={{ margin: 0, fontFamily: T.ui, fontSize: 12, color: T.mut, lineHeight: 1.5 }}>
              Vil du flytte økta? Gjør det i Workbench — endringen gjelder med én gang.
            </p>

            <div style={{ display: "flex", gap: 8 }}>
              <Link href={WORKBENCH_HREF} style={{ textDecoration: "none", flex: 1 }}>
                <CTAPill icon="calendar" ghost full>
                  Workbench
                </CTAPill>
              </Link>
              <Link
                href={apenOkt.href}
                className="v2-press v2-focus"
                style={{
                  flex: 1,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 44,
                  borderRadius: 10,
                  background: apenOkt.status === "COMPLETED" ? T.panel3 : T.handling,
                  color: apenOkt.status === "COMPLETED" ? T.fg : T.onHandling,
                  fontFamily: T.ui,
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                {apenOkt.status === "COMPLETED" ? "Se loggen" : "Start økt"}
              </Link>
            </div>
          </div>
        )}
      </BunnArk>
    </div>
  );
}
