"use client";
import { TL } from "@/lib/v2/train-lock";

/**
 * PlayerHQ Plan — Paper-port PR-B (avvik A2).
 * Fasit: designsystem/paper/fase1/playerhq-plan.html
 * PP-1.2 (2026-08-09): slug, dokk gradient, clay 56 enTing.
 *
 * A2: 720px-kolonne, én aksenthandling (dokk «Start [økta] · tid»),
 * ingen KPI-tankestrek-helter, Workbench kun som sekundær (ghost).
 */

import Link from "next/link";
import { useState } from "react";
import { useToppbarHoyde } from "@/components/v2/toppbar-hoyde";
import type { DashboardData } from "@/app/portal/actions";
import { TemaHeaderKnapp } from "@/components/v2/tema";
import { Caps, AkseChip, StatusPill, CTAPill, DagStripe, Icon, type StripeDag } from "@/components/v2";
import { OktKort } from "@/components/v2/domene";
import { HvorforDette } from "@/components/v2/hjelp";
import { BunnArk } from "@/components/v2/bunn-ark";
import type { UkePeriode } from "@/lib/portal-plan/uke-periode";
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

export function PlanV2({
  data,
  depthMode = "simple",
  periode = null,
}: {
  data: DashboardData;
  depthMode?: "simple" | "deep";
  /** Aktiv treningsperiode fra årsplanen. Null = ikke satt (raden viser «Ikke satt»). */
  periode?: UkePeriode | null;
}) {
  const deep = depthMode === "deep";
  const { weekNumber, week, weekProgress, optimalSession, todayAll } = data;

  const iDag = new Date();
  iDag.setHours(0, 0, 0, 0);
  const stripeDager: StripeDag[] = week.map((d) => {
    const forbi = d.date.getTime() < iDag.getTime();
    const alleFullfort = d.sessions.length > 0 && d.sessions.every((s) => s.status === "COMPLETED");
    return {
      /* Paper bruker tre bokstaver (MAN TIR ONS) — med én bokstav er
         tirsdag/torsdag og lørdag/søndag ikke til å skille fra hverandre. */
      dow: d.dayLabel.slice(0, 3).toUpperCase(),
      date: d.dayNumber,
      today: d.isToday,
      state: forbi && alleFullfort ? "done" : undefined,
    };
  });
  const aktivDag = week.find((d) => d.isToday)?.dayNumber ?? week[0]?.dayNumber ?? null;

  const toppRef = useToppbarHoyde<HTMLElement>();
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

  // Ukeoppsummeringen (Paper .uke) teller økter, ikke minutter — begge vises.
  const ukasOkter = week.flatMap((d) => d.sessions);
  const antallOkter = ukasOkter.length;
  const fullforteOkter = ukasOkter.filter((o) => o.status === "COMPLETED").length;

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
      data-paper-portal-plan data-paper-wave-a="plan" data-paper-slug="playerhq-plan" data-od-id="plan-root"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        position: "relative",
        background: TL.scene,
      }}
    >
      {/* Paper .topp — sticky surface header */}
      <header
        ref={toppRef}
        data-paper-topp
        style={{
          flex: "none",
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "12px 16px",
          borderBottom: `1px solid ${TL.hair}`,
          background: TL.scene,
          position: "sticky",
          top: 0,
          zIndex: 5,
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <h1
            style={{
              margin: 0,
              fontFamily: TL.font.sans,
              fontSize: 17,
              fontWeight: 600,
              color: TL.text,
            }}
          >
            Plan
          </h1>
          <span
            style={{
              display: "block",
              fontFamily: TL.font.mono,
              fontSize: 10.5,
              color: TL.mute,
              marginTop: 2,
            }}
          >
            Uke {weekNumber} · {periodeLinje(week)}
            {weekProgress.plannedMin > 0 ? ` · ${gjennomforPct} % gjort` : ""}
          </span>
        </div>
        {deep && (
          <Link
            href={WORKBENCH_HREF}
            className="v2-press v2-focus"
            data-od-id="plan-workbench"
            style={{
              minHeight: 44,
              padding: "0 14px",
              borderRadius: TL.radius.card,
              border: `1px solid ${TL.hair}`,
              background: "transparent",
              color: TL.text,
              fontFamily: TL.font.sans,
              fontSize: 13,
              fontWeight: 500,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              flex: "none",
            }}
          >
            Workbench
          </Link>
        )}
        {/* Fasitens `#themeBtn` — Plan har egen header og fikk den ikke fra
            PaperTopp. */}
        <TemaHeaderKnapp />
      </header>

      {/* Paper .dager */}
      <div
        style={{
          flex: "none",
          borderBottom: `1px solid ${TL.hair}`,
          background: TL.scene,
          padding: "12px 16px",
        }}
      >
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <DagStripe days={stripeDager} value={valgtDagDato} onChange={(dato) => setValgtDagDato(dato)} />
        </div>
      </div>

      {/* Paper .kropp */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflow: "auto",
          padding: "16px 16px 100px",
          background: TL.scene,
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
          {/* Paper .uke — ukeoppsummeringen fasiten åpner Plan med (PP-1.2) */}
          <section
            data-od-id="plan-uke"
            style={{
              background: TL.elev,
              border: `1px solid ${TL.hair}`,
              borderRadius: TL.radius.card,
              padding: 16,
            }}
          >
            <Caps size={9}>
              Uke {weekNumber} · {periodeLinje(week)}
            </Caps>
            {/* Paper .bar — framdrift som andel av planlagt tid */}
            <div
              style={{
                height: 6,
                borderRadius: 999,
                background: TL.dim,
                overflow: "hidden",
                margin: "10px 0 8px",
              }}
              role="progressbar"
              aria-valuenow={gjennomforPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Andel av ukas planlagte tid som er gjennomført"
            >
              <i
                style={{
                  display: "block",
                  height: "100%",
                  width: `${gjennomforPct}%`,
                  background: TL.text,
                }}
              />
            </div>
            <Caps size={9}>
              {fullforteOkter} av {antallOkter} økt{antallOkter === 1 ? "" : "er"} gjennomført · {gjennomforPct} %
            </Caps>

            <div style={{ marginTop: 12, display: "flex", flexDirection: "column" }}>
              {[
                ["Periode", periode ? periode.navn : "Ikke satt"],
                ["Økter", String(antallOkter)],
                ["Planlagt tid", varighet(weekProgress.plannedMin)],
                ["Gjennomført", varighet(weekProgress.completedMin)],
              ].map(([etikett, verdi]) => (
                <div
                  key={etikett}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    minHeight: 32,
                    borderTop: `1px solid ${TL.hair}`,
                    paddingTop: 6,
                    marginTop: 6,
                  }}
                >
                  <span style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, minWidth: 0 }}>{etikett}</span>
                  <span style={{ fontFamily: TL.font.mono, fontSize: 13, color: TL.text, flex: "none" }}>{verdi}</span>
                </div>
              ))}
            </div>

            <HvorforDette
              kilde={`Uke ${weekNumber} slik den ligger i planen din nå.`}
              beregning="Gjennomført tid delt på planlagt tid. Bare økter du har markert som ferdige teller."
              forbehold="En økt du starter, men ikke fullfører, teller ikke før den er logget."
            />
          </section>

          {/* Paper `.eier` — eierskapet skrevet ut, ikke antatt. Signering
              12.08: notisen sto som løs brødtekst og forsvant i sida; fasiten
              har den i en grå boks med blyantikon, så den leses som en notis
              og ikke som en avsnitt til. */}
          <div
            data-od-id="plan-eierskap"
            style={{
              display: "flex",
              gap: 12,
              padding: "12px 16px",
              borderRadius: TL.radius.card,
              background: TL.dock,
              border: `1px solid ${TL.hair}`,
              fontFamily: TL.font.sans,
              fontSize: 12.5,
              lineHeight: 1.5,
              color: TL.mute,
            }}
          >
            <Icon name="pencil" size={16} style={{ flex: "none", marginTop: 2 }} />
            <span>
              Planen er din. Du kan flytte og endre øktene selv, med én gang — ingen godkjenning. Coachen din får
              beskjed om endringen, så han vet hva som skjedde.
            </span>
          </div>

          {/* Coachingtimer bookes her; treningsøkter ligger i planen — to ting, to steder */}
          <Link
            href="/portal/booking"
            data-od-id="plan-book-time"
            className="v2-press v2-focus"
            style={{
              minHeight: 44,
              borderRadius: TL.radius.card,
              border: `1px solid ${TL.hair}`,
              background: "transparent",
              color: TL.text,
              fontFamily: TL.font.sans,
              fontSize: 14,
              fontWeight: 500,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Book coachingtime med Anders
          </Link>

          {valgtDagObj && (
            <section
              style={{
                background: TL.elev,
                border: `1px solid ${TL.hair}`,
                borderRadius: TL.radius.card,
                padding: 16,
              }}
              data-od-id="plan-dag"
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 8,
                  marginBottom: valgtDagObj.sessions.length || (valgtDagObj.isToday && optimalSession) ? 12 : 0,
                }}
              >
                <span style={{ fontFamily: TL.font.sans, fontSize: 14, fontWeight: 600, color: TL.text }}>
                  {valgtDagObj.isToday ? "I dag" : dagEtikett(valgtDagObj.date)}
                </span>
                {valgtDagObj.sessions.length > 0 && (
                  <Caps size={9}>
                    {valgtDagObj.sessions.length} økt{valgtDagObj.sessions.length === 1 ? "" : "er"}
                  </Caps>
                )}
              </div>
              <div>
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
                  <div style={{ fontFamily: TL.font.sans, fontWeight: 600, fontSize: 15, color: TL.text }}>
                    {optimalSession.title}
                  </div>
                  <p style={{ fontFamily: TL.font.sans, fontSize: 13.5, color: TL.mute, margin: 0, lineHeight: 1.55 }}>
                    {optimalSession.rationale}
                  </p>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <AkseChip a={optimalSession.pyramidArea as AkseKey} />
                    <StatusPill tone="info">{varighet(optimalSession.durationMin)}</StatusPill>
                  </div>
                </div>
              ) : (
                <div
                  data-od-id="plan-hvile"
                  style={{
                    padding: "20px 16px",
                    background: TL.dock,
                    border: `1px dashed ${TL.hair}`,
                    borderRadius: TL.radius.card,
                  }}
                >
                  <h3 style={{ margin: "0 0 8px", fontFamily: TL.font.sans, fontSize: 15, fontWeight: 600, color: TL.text }}>
                    Hviledag
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontFamily: TL.font.sans,
                      fontSize: 13.5,
                      color: TL.mute,
                      lineHeight: 1.5,
                      maxWidth: "46ch",
                    }}
                  >
                    {deep
                      ? "Ingen økt denne dagen. Endre i Workbench hvis du vil legge inn noe."
                      : "Ingen økt denne dagen — nyt hviledagen, eller se ukeplanen med coach."}
                  </p>
                </div>
              )}
              </div>
            </section>
          )}

          {week.every((d) => d.sessions.length === 0) && !optimalSession && (
            <div
              data-od-id="plan-tom-uke"
              style={{
                padding: "24px 20px",
                background: TL.dock,
                border: `1px dashed ${TL.hair}`,
                borderRadius: TL.radius.card,
              }}
            >
              <h3 style={{ margin: "0 0 8px", fontFamily: TL.font.sans, fontSize: 15, fontWeight: 600, color: TL.text }}>
                Ingen økter planlagt denne uka
              </h3>
              <p
                style={{
                  margin: "0 0 16px",
                  fontFamily: TL.font.sans,
                  fontSize: 13.5,
                  color: TL.mute,
                  lineHeight: 1.55,
                  maxWidth: "46ch",
                }}
              >
                Hvile er en del av planen, ikke et hull i den. Når coach eller du legger inn økter, dukker de opp her.
              </p>
              {/* Paper .tom .valg — stille sekundærvalg, aldri TL.fill her */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 0,
                }}
              >
                <Link
                  href="/portal"
                  data-od-id="plan-tom-fangst"
                  style={{
                    fontFamily: TL.font.sans,
                    fontSize: 13,
                    fontWeight: 600,
                    color: TL.text,
                    textDecoration: "none",
                    minHeight: 44,
                    display: "flex",
                    alignItems: "center",
                    borderBottom: `1px solid ${TL.hair}`,
                    padding: "8px 0",
                  }}
                >
                  Fang en observasjon på Hjem
                </Link>
                <Link
                  href="/portal/coach/melding"
                  data-od-id="plan-tom-spor"
                  style={{
                    fontFamily: TL.font.sans,
                    fontSize: 13,
                    fontWeight: 600,
                    color: TL.text,
                    textDecoration: "none",
                    minHeight: 44,
                    display: "flex",
                    alignItems: "center",
                    borderBottom: `1px solid ${TL.hair}`,
                    padding: "8px 0",
                  }}
                >
                  Spør coach
                </Link>
                {deep ? (
                  <Link
                    href={WORKBENCH_HREF}
                    data-od-id="plan-tom-workbench"
                    style={{
                      fontFamily: TL.font.sans,
                      fontSize: 13,
                      fontWeight: 600,
                      color: TL.mute,
                      textDecoration: "none",
                      minHeight: 44,
                      display: "flex",
                      alignItems: "center",
                      padding: "8px 0",
                    }}
                  >
                    Åpne Workbench (avansert)
                  </Link>
                ) : (
                  <Link
                    href="/portal/meg/innstillinger"
                    data-od-id="plan-tom-depth"
                    style={{
                      fontFamily: TL.font.sans,
                      fontSize: 13,
                      fontWeight: 600,
                      color: TL.mute,
                      textDecoration: "none",
                      minHeight: 44,
                      display: "flex",
                      alignItems: "center",
                      padding: "8px 0",
                    }}
                  >
                    Avansert visning under Meg
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dokk — ÉN aksenthandling (fasit .dokk + .btn.now) */}
      {dokkTekst && nesteOkt && !apenOkt && (
        <div
          style={{
            position: "sticky",
            bottom: 0,
            borderTop: `1px solid ${TL.hair}`,
            /* Paper .dokk — fade over innhold */
            background: "linear-gradient(180deg, color-mix(in srgb, var(--tl-scene) 0%, transparent) 0%, var(--tl-scene) 28%)",
            padding: "16px 16px",
            // + --ak-cookie-h: forskyv opp mens cookie-banneret dekker bunnen.
            paddingBottom: "calc(max(16px, env(safe-area-inset-bottom)) + var(--ak-cookie-h, 0px))",
          }}
          data-paper-dokk
        >
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <Link
              href={nesteOkt.href}
              className="v2-press v2-focus"
              data-od-id="plan-dokk-start"
              data-paper-en-ting="true"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 56,
                width: "100%",
                borderRadius: 12,
                background: TL.fill,
                color: TL.onFill,
                fontFamily: TL.font.sans,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
                border: `1px solid ${TL.fill}`,
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
                    fontFamily: TL.font.sans,
                    color: TL.mute,
                  }}
                >
                  <span>{l}</span>
                  <span style={{ fontFamily: TL.font.mono, color: TL.text }}>{v}</span>
                </div>
              ))}
            </div>

            {apenOkt.maalsetning && (
              <div>
                <Caps size={9}>Målsetning</Caps>
                <p style={{ margin: "6px 0 0", fontFamily: TL.font.sans, fontSize: 14, color: TL.mute, lineHeight: 1.55 }}>
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
                        border: `1px solid ${TL.hair}`,
                        borderRadius: TL.radius.card,
                        padding: "8px 12px",
                        background: TL.scene,
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 8,
                      }}
                    >
                      <span style={{ fontFamily: TL.font.sans, fontSize: 13, fontWeight: 600, color: TL.text }}>{d.name}</span>
                      <span style={{ fontFamily: TL.font.mono, fontSize: 11, color: TL.mute, flex: "none" }}>
                        {d.durationMinutes} min
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {deep && (
              <p style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 12, color: TL.mute, lineHeight: 1.5 }}>
                Vil du flytte økta? Gjør det i Workbench — endringen gjelder med én gang.
              </p>
            )}

            <div style={{ display: "flex", gap: 8 }}>
              {deep && (
                <Link href={WORKBENCH_HREF} style={{ textDecoration: "none", flex: 1 }}>
                  <CTAPill icon="calendar" ghost full>
                    Workbench
                  </CTAPill>
                </Link>
              )}
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
                  background: apenOkt.status === "COMPLETED" ? TL.dim : TL.fill,
                  color: apenOkt.status === "COMPLETED" ? TL.text : TL.onFill,
                  fontFamily: TL.font.sans,
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
