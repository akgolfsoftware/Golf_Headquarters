"use client";

/**
 * Hull-føring — HOVEDSKJERMEN i live-føringen.
 * Rundetopp (progresjon + score hittil) · slag-kjeden som liste ·
 * inline slag-editor · hull-ferdig-tilstand med hull-SG · «Neste hull».
 * Neste slag starter der forrige landet — kjeden kan ikke føres inkonsistent.
 */

import type { WindDir } from "@/generated/prisma/enums";
import type { HvileLie, LoggetHull, LoggetSlag } from "@/lib/runde-logg/types";
import { beregnSg } from "@/lib/domain/sg";
import { rundeTilSgShots } from "@/lib/runde-logg/til-sg-shots";
import { T, fmtSg, Caps, Kort, Icon } from "@/components/v2";
import { SlagEditor } from "./slag-editor";

const LIE_LABEL: Record<"TEE" | HvileLie, string> = {
  TEE: "Tee",
  FAIRWAY: "Fairway",
  SEMI_ROUGH: "Semi-rough",
  ROUGH: "Rough",
  DEEP_ROUGH: "Dyp rough",
  BUNKER: "Bunker",
  GREEN: "Green",
  TREES: "Trær",
};

const komma = (n: number) => String(n).replace(".", ",");

/** Kjede-rad avledet fra posisjonskjedet: start → resultat per slag. */
type KjedeRadData = {
  nr: number;
  fraLie: "TEE" | HvileLie;
  fraM: number;
  til: string;
  tilM: number | null;
  straffe: boolean;
};

function byggKjedeRader(hull: LoggetHull): KjedeRadData[] {
  let lie: "TEE" | HvileLie = "TEE";
  let avstand = hull.lengdeMeter;
  return hull.slag.map((slag, i) => {
    const rad: KjedeRadData = {
      nr: i + 1,
      fraLie: lie,
      fraM: avstand,
      til: slag.resultat.iHull ? "I hull" : LIE_LABEL[slag.resultat.lie],
      tilM: slag.resultat.iHull ? null : slag.resultat.avstandTilHull,
      straffe: slag.straffe === true,
    };
    if (!slag.resultat.iHull) {
      lie = slag.resultat.lie;
      avstand = slag.resultat.avstandTilHull;
    }
    return rad;
  });
}

function kategori(fraLie: "TEE" | HvileLie, fraM: number): string {
  if (fraLie === "TEE") return "OTT";
  if (fraLie === "GREEN") return "PUTT";
  return fraM <= 30 ? "ARG" : "APP";
}

function KjedeRad({ rad, aktiv }: { rad: KjedeRadData; aktiv?: boolean }) {
  return (
    <div
      className={aktiv ? undefined : "v2-row-h"}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        borderRadius: 12,
        background: aktiv ? T.panel3 : "transparent",
        border: `1px solid ${aktiv ? T.borderS : "transparent"}`,
      }}
    >
      <span
        style={{
          width: 22,
          height: 22,
          borderRadius: 8,
          background: T.panel2,
          border: `1px solid ${T.border}`,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: T.mono,
          fontSize: 10.5,
          fontWeight: 700,
          color: T.fg2,
          flex: "none",
        }}
      >
        {rad.nr}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg }}>
            {LIE_LABEL[rad.fraLie]}
            <span style={{ fontFamily: T.mono, fontWeight: 400, color: T.fg2 }}> · {komma(rad.fraM)} m</span>
          </span>
          <span
            style={{
              fontFamily: T.mono,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: T.mut,
            }}
          >
            {kategori(rad.fraLie, rad.fraM)}
          </span>
        </div>
        <div
          style={{
            fontFamily: T.ui,
            fontSize: 11.5,
            color: rad.til === "I hull" ? T.up : T.fg2,
            marginTop: 1,
          }}
        >
          → {rad.til}
          {rad.tilM != null && <span style={{ fontFamily: T.mono }}> · {komma(rad.tilM)} m igjen</span>}
          {rad.straffe && (
            <span
              style={{
                fontFamily: T.mono,
                fontSize: 9.5,
                fontWeight: 700,
                color: T.down,
                marginLeft: 6,
              }}
            >
              +1 STRAFFE
            </span>
          )}
        </div>
      </div>
      {aktiv && <Icon name="pencil" size={13} style={{ color: T.lime, flex: "none" }} />}
    </div>
  );
}

type HullForingProps = {
  hull: LoggetHull;
  antallHull: number;
  /** Antall hull ferdig før dette (til progresjonsbaren). */
  ferdigeFor: number;
  /** Score hittil relativt til par, formatert («+3» / «E»). */
  scoreHittil: string;
  /** Sist brukte vind på hullet — vedvarer i editoren. */
  sisteVind?: WindDir;
  onSlag: (slag: LoggetSlag) => void;
  onAngre: (() => void) | null;
  onNesteHull: () => void;
  onVisOversikt: () => void;
  onVisSg: () => void;
};

export function HullForing({
  hull,
  antallHull,
  ferdigeFor,
  scoreHittil,
  sisteVind,
  onSlag,
  onAngre,
  onNesteHull,
  onVisOversikt,
  onVisSg,
}: HullForingProps) {
  const rader = byggKjedeRader(hull);
  const ferdig = hull.slag.at(-1)?.resultat.iHull === true;

  // Startposisjon for NESTE slag (kjeden).
  let startLie: "TEE" | HvileLie = "TEE";
  let startAvstand = hull.lengdeMeter;
  for (const slag of hull.slag) {
    if (!slag.resultat.iHull) {
      startLie = slag.resultat.lie;
      startAvstand = slag.resultat.avstandTilHull;
    }
  }

  const straffer = hull.slag.filter((s) => s.straffe).length;
  const strokes = hull.slag.length + straffer;

  // Hull-SG (klient-estimat — serveren er fasit ved lagring).
  let hullSg: number | null = null;
  if (ferdig) {
    try {
      hullSg = beregnSg(rundeTilSgShots([hull])).total;
    } catch {
      hullSg = null;
    }
  }

  const sekundaerKnapp = (label: string, ikon: string, onClick: () => void) => (
    <button
      type="button"
      onClick={onClick}
      className="v2-press v2-focus"
      style={{
        appearance: "none",
        cursor: "pointer",
        flex: 1,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        padding: "11px 0",
        borderRadius: 12,
        background: "transparent",
        border: `1px solid ${T.border}`,
        fontFamily: T.ui,
        fontSize: 12.5,
        fontWeight: 600,
        color: T.fg2,
      }}
    >
      <Icon name={ikon} size={13} />
      {label}
    </button>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Rundetopp */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span
            style={{
              fontFamily: T.mono,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: T.fg,
            }}
          >
            Hull {hull.holeNumber} · par {hull.par} · {komma(hull.lengdeMeter)} m
          </span>
          <span style={{ fontFamily: T.mono, fontSize: 12, fontWeight: 700, color: T.fg }}>
            {scoreHittil}
            <span style={{ color: T.mut, fontWeight: 400 }}> totalt</span>
          </span>
        </div>
        <div style={{ height: 3, borderRadius: 9999, background: T.panel2 }}>
          <div
            style={{
              width: `${Math.round((ferdigeFor / antallHull) * 100)}%`,
              height: "100%",
              borderRadius: 9999,
              background: T.lime,
            }}
          />
        </div>
      </div>

      {/* Slag-kjeden */}
      {rader.length > 0 && (
        <Kort eyebrow={`Slag-kjeden — hull ${hull.holeNumber}`} pad="14px 12px">
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {rader.map((rad) => (
              <KjedeRad key={rad.nr} rad={rad} />
            ))}
          </div>
        </Kort>
      )}

      {ferdig ? (
        /* Hull-ferdig: score + hull-SG + neste hull */
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            padding: "18px 14px 16px",
            borderRadius: 16,
            background: T.panel,
            border: `1px solid ${T.borderS}`,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <span
              style={{
                width: 52,
                height: 52,
                borderRadius: 9999,
                background: "color-mix(in srgb, var(--v2-up) 12%, transparent)",
                border: "1px solid color-mix(in srgb, var(--v2-up) 40%, transparent)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="check" size={24} style={{ color: T.up }} />
            </span>
            <div style={{ fontFamily: T.disp, fontSize: 18, fontWeight: 700, color: T.fg }}>
              Hull {hull.holeNumber} ferdig — {strokes} slag
              {straffer > 0 ? ` (+${straffer})` : ""}
            </div>
            {hullSg != null && (
              <div style={{ display: "flex", gap: 12, fontFamily: T.mono, fontSize: 11.5 }}>
                <span style={{ color: T.fg2 }}>
                  Hull-SG{" "}
                  <b style={{ color: hullSg >= 0 ? T.up : T.down }}>{fmtSg(hullSg)}</b>
                </span>
                {straffer > 0 && (
                  <span style={{ color: T.fg2 }}>
                    Straffen{straffer > 1 ? "e" : ""} kostet <b style={{ color: T.down }}>−{komma(straffer)},0</b>
                  </span>
                )}
              </div>
            )}
            {onAngre && (
              <button
                type="button"
                onClick={onAngre}
                className="v2-press v2-focus"
                style={{
                  appearance: "none",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "5px 10px",
                  borderRadius: 9999,
                  background: "transparent",
                  border: `1px solid ${T.border}`,
                  fontFamily: T.mono,
                  fontSize: 10,
                  fontWeight: 700,
                  color: T.fg2,
                }}
              >
                <Icon name="arrow-left" size={12} />
                Angre siste slag
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={onNesteHull}
            className="v2-press v2-focus"
            style={{
              appearance: "none",
              cursor: "pointer",
              width: "100%",
              height: 54,
              borderRadius: 16,
              border: "none",
              background: T.lime,
              color: T.onLime,
              fontFamily: T.disp,
              fontSize: 16,
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: "0 10px 34px color-mix(in srgb, var(--v2-lime) 28%, transparent)",
            }}
          >
            {ferdigeFor + 1 >= antallHull ? "Til oppsummering" : `Neste hull`}
            <Icon name="arrow-right" size={16} />
          </button>
        </div>
      ) : (
        <SlagEditor
          slagNr={hull.slag.length + 1}
          startLie={startLie}
          startAvstand={startAvstand}
          hullLengde={hull.lengdeMeter}
          par={hull.par}
          defaultVind={sisteVind}
          onLagre={onSlag}
          onIHull={onSlag}
          onAngre={onAngre}
        />
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {sekundaerKnapp("Hull-oversikt", "layout-dashboard", onVisOversikt)}
        {sekundaerKnapp("SG hittil", "trending-up", onVisSg)}
      </div>

      {/* Skjult caps for skjermlesere: aktiv posisjon */}
      <Caps style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clipPath: "inset(50%)" }}>
        Neste slag fra {LIE_LABEL[startLie]} {komma(startAvstand)} meter
      </Caps>
    </div>
  );
}
