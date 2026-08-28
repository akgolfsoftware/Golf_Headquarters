"use client";

/**
 * PlayerHQ Plan — Train-lock-porten.
 * Fasit: designsystem/train-lock/PH-07 Plan.dc.html
 * Fasit: designsystem/train-lock/PH-08 Plan tom uke.dc.html
 *
 * Caps «Uke N · måned» + «Plan» 34/700, sticky uke-stripe (46×58-piller,
 * valgt = hvit), dag-seksjoner med økt-rader (tid · skille · tittel/meta ·
 * chevron) og ÉN hvit «Åpne økt» på valgt dag. Tom uke = PH-08-kortet.
 */

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { ChevronRight } from "lucide-react";
import { TL } from "@/lib/v2/train-lock";
import type { DashboardData, TodaySession, WeekDay } from "@/app/portal/actions";
import type { UkePeriode } from "@/lib/portal-plan/uke-periode";

const UKEDAGER = ["søndag", "mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag"];
const MANEDER = [
  "januar", "februar", "mars", "april", "mai", "juni",
  "juli", "august", "september", "oktober", "november", "desember",
];
/** Uke-stripen: mandag først — én bokstav per dag som i fasiten. */
const STRIPE_BOKSTAV = ["M", "T", "O", "T", "F", "L", "S"];

const caps: CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: TL.mute,
};

function klokkePunkt(dato: Date): string {
  const h = String(dato.getHours()).padStart(2, "0");
  const m = String(dato.getMinutes()).padStart(2, "0");
  return `${h}.${m}`;
}

function dagEtikett(dato: Date): string {
  const dag = UKEDAGER[dato.getDay()];
  return `${dag[0].toUpperCase()}${dag.slice(1)} ${dato.getDate()}.`;
}

function varighet(min: number): string {
  if (min >= 60) {
    const t = Math.floor(min / 60);
    const r = min % 60;
    return r === 0 ? `${t} t` : `${t} t ${r} min`;
  }
  return `${min} min`;
}

function erHvile(okt: TodaySession): boolean {
  return okt.title.trim().toLowerCase() === "hvile";
}

function erApnbar(okt: TodaySession): boolean {
  return !erHvile(okt) && okt.status !== "COMPLETED" && okt.status !== "CANCELLED";
}

/** PH-07: økt-rad — tid · hairline-skille · tittel/meta · chevron. */
function OktRad({ okt }: { okt: TodaySession }) {
  const hvile = erHvile(okt);
  const rad = (
    <div
      style={{
        marginTop: 10,
        background: TL.elev,
        borderRadius: TL.radius.card,
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}
    >
      <div
        style={{
          fontSize: 15,
          fontWeight: 600,
          fontVariantNumeric: "tabular-nums",
          width: 48,
          flexShrink: 0,
          color: hvile ? TL.mute : TL.text,
        }}
      >
        {hvile ? "—" : klokkePunkt(okt.startTime)}
      </div>
      <div style={{ width: 1, alignSelf: "stretch", background: TL.hair }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: TL.text }}>{okt.title}</div>
        <div style={{ marginTop: 2, fontSize: 13, fontWeight: 400, color: TL.mute }}>
          {hvile
            ? "Programmert av Anders"
            : [okt.sted, varighet(okt.durationMin)].filter(Boolean).join(" · ")}
        </div>
      </div>
      {!hvile && <ChevronRight size={16} strokeWidth={2} style={{ color: TL.mute, flex: "none" }} />}
    </div>
  );
  if (hvile) return rad;
  return (
    <Link href={okt.href} className="v2-press" style={{ display: "block", textDecoration: "none", color: "inherit" }}>
      {rad}
    </Link>
  );
}

export function PlanV2({
  data,
  depthMode = "simple",
  periode = null,
}: {
  data: DashboardData;
  depthMode?: "simple" | "deep";
  /** Aktiv treningsperiode fra årsplanen — vises ikke i PH-07-fasiten. */
  periode?: UkePeriode | null;
}) {
  void depthMode;
  void periode;
  const { weekNumber, week } = data;

  const [valgtDag, setValgtDag] = useState<number | null>(
    week.find((d) => d.isToday)?.dayNumber ?? week[0]?.dayNumber ?? null,
  );

  const maned = week[0] ? MANEDER[week[0].date.getMonth()] : "";
  const ukeHarOkter = week.some((d) => d.sessions.length > 0);
  const dagerMedInnhold: WeekDay[] = week.filter((d) => d.sessions.length > 0);

  return (
    <div
      data-od-id="plan-root"
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        fontFamily: TL.font.sans,
        color: TL.text,
        background: TL.scene,
        padding: "8px 0 24px",
      }}
    >
      <div style={caps}>
        Uke {weekNumber}
        {maned ? ` · ${maned}` : ""}
      </div>
      <h1
        style={{
          margin: "6px 0 0",
          fontSize: 34,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          lineHeight: 1.1,
          color: TL.text,
        }}
      >
        Plan
      </h1>

      {/* PH-07: sticky uke-stripe — valgt dag er hvit pille */}
      <div
        style={{
          position: "sticky",
          top: 0,
          background: TL.scene,
          padding: "14px 0 10px",
          zIndex: 3,
          display: "flex",
          justifyContent: "space-between",
          gap: 4,
        }}
      >
        {week.map((d, i) => {
          const valgt = d.dayNumber === valgtDag;
          return (
            <button
              key={d.dayNumber}
              type="button"
              onClick={() => setValgtDag(d.dayNumber)}
              aria-pressed={valgt}
              className="v2-press v2-focus"
              style={{
                width: 46,
                height: 58,
                borderRadius: 999,
                border: "none",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                background: valgt ? TL.fill : "transparent",
                color: valgt ? TL.onFill : TL.mute,
                fontFamily: TL.font.sans,
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em" }}>
                {d.dayLabel[0]?.toUpperCase() ?? STRIPE_BOKSTAV[i]}
              </span>
              <span style={{ fontSize: 15, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                {d.dayNumber}
              </span>
            </button>
          );
        })}
      </div>

      {!ukeHarOkter ? (
        /* PH-08: tom uke */
        <div
          style={{
            marginTop: 10,
            background: TL.elev,
            borderRadius: TL.radius.card,
            padding: "24px 20px",
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 400, color: TL.mute }}>Ingen økter denne uken.</div>
        </div>
      ) : (
        dagerMedInnhold.map((d, di) => {
          const valgt = d.dayNumber === valgtDag;
          const apnbar = valgt ? d.sessions.find(erApnbar) : undefined;
          return (
            <section key={d.dayNumber}>
              <div style={{ ...caps, marginTop: di === 0 ? 10 : 24 }}>{dagEtikett(d.date)}</div>
              {d.sessions.map((okt) => (
                <OktRad key={okt.id} okt={okt} />
              ))}
              {apnbar && (
                <Link
                  href={apnbar.href}
                  className="v2-press v2-focus"
                  data-od-id="plan-apne-okt"
                  style={{
                    marginTop: 16,
                    height: 48,
                    borderRadius: 999,
                    background: TL.fill,
                    color: TL.onFill,
                    fontSize: 16,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textDecoration: "none",
                  }}
                >
                  Åpne økt
                </Link>
              )}
            </section>
          );
        })
      )}
    </div>
  );
}
