"use client";
import { TL } from "@/lib/v2/train-lock";

/**
 * Hull-oversikt: 18-grid (eller 9) med score-farger, hopp til/rediger
 * tidligere hull, og avslutt-bekreftelse for avbrutt runde
 * (delvis lagring — kun fullførte hull, aldri skalert opp).
 */

import type { LoggetHull } from "@/lib/runde-logg/types";
import { Icon } from "@/components/v2";

function scoreFor(hull: LoggetHull): number | null {
  if (hull.slag.at(-1)?.resultat.iHull !== true) return null;
  return hull.slag.length + hull.slag.filter((s) => s.straffe).length;
}

function farge(par: number, s: number | null) {
  if (s == null) return { bg: TL.dock, bd: TL.hair, fg: TL.mute };
  const d = s - par;
  if (d < 0) return { bg: "color-mix(in srgb, var(--tl-ok) 14%, transparent)", bd: "color-mix(in srgb, var(--tl-ok) 45%, transparent)", fg: TL.ok };
  if (d === 0) return { bg: TL.dim, bd: TL.hair, fg: TL.text };
  if (d === 1) return { bg: "color-mix(in srgb, var(--v2-warn) 12%, transparent)", bd: "color-mix(in srgb, var(--v2-warn) 40%, transparent)", fg: TL.warn };
  return { bg: "color-mix(in srgb, var(--v2-down) 12%, transparent)", bd: "color-mix(in srgb, var(--v2-down) 45%, transparent)", fg: TL.danger };
}

type HullOversiktProps = {
  hullData: LoggetHull[];
  aktivtHullIdx: number;
  onVelgHull: (idx: number) => void;
  onLukk: () => void;
  /** Antall fullførte hull — avslutt-panelet vises når ≥1 og runden er ufullstendig. */
  onAvslutt: (() => void) | null;
};

export function HullOversikt({ hullData, aktivtHullIdx, onVelgHull, onLukk, onAvslutt }: HullOversiktProps) {
  const ferdige = hullData.filter((h) => h.slag.at(-1)?.resultat.iHull === true).length;
  const sumScore = hullData.reduce((sum, h) => sum + (scoreFor(h) ?? 0), 0);
  const sumPar = hullData
    .filter((h) => h.slag.at(-1)?.resultat.iHull === true)
    .reduce((sum, h) => sum + h.par, 0);
  const diff = sumScore - sumPar;
  const diffTxt = ferdige === 0 ? "—" : diff === 0 ? "E" : diff > 0 ? `+${diff}` : `−${Math.abs(diff)}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontFamily: TL.font.sans, fontWeight: 700, fontSize: 22, color: TL.text, lineHeight: 1.1 }}>
            Hull-oversikt
          </div>
          <div style={{ fontFamily: TL.font.sans, fontSize: 11.5, color: TL.mute, marginTop: 3 }}>
            {ferdige} av {hullData.length} hull ført · trykk et hull for å redigere
          </div>
        </div>
        <span style={{ fontFamily: TL.font.mono, fontSize: 15, fontWeight: 700, color: TL.text }}>{diffTxt}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
        {hullData.map((h, idx) => {
          const s = scoreFor(h);
          const f = farge(h.par, s);
          const aktiv = idx === aktivtHullIdx;
          return (
            <button
              key={h.holeNumber}
              type="button"
              onClick={() => onVelgHull(idx)}
              className="v2-press v2-focus"
              style={{
                appearance: "none",
                cursor: "pointer",
                aspectRatio: "1",
                borderRadius: 12,
                background: f.bg,
                border: `1px solid ${aktiv ? TL.fill : f.bd}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                position: "relative",
              }}
            >
              {aktiv && (
                <span
                  style={{
                    position: "absolute",
                    top: 5,
                    right: 5,
                    width: 6,
                    height: 6,
                    borderRadius: 9999,
                    background: TL.fill,
                  }}
                />
              )}
              <span style={{ fontFamily: TL.font.mono, fontSize: 9, fontWeight: 700, color: TL.mute }}>
                {h.holeNumber} · P{h.par}
              </span>
              <span style={{ fontFamily: TL.font.mono, fontSize: 17, fontWeight: 700, color: f.fg }}>
                {s ?? "—"}
              </span>
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontFamily: TL.font.mono, fontSize: 9.5, color: TL.mute }}>
        {(
          [
            ["Birdie–", TL.ok],
            ["Par", TL.text],
            ["Bogey", TL.warn],
            ["Dobbel+", TL.danger],
          ] as const
        ).map(([l, c]) => (
          <span key={l} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: 3, background: c }} />
            {l}
          </span>
        ))}
      </div>

      {onAvslutt && ferdige > 0 && ferdige < hullData.length && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            padding: 14,
            borderRadius: 14,
            background: TL.elev,
            border: `1px solid ${TL.hair}`,
          }}
        >
          <div style={{ fontFamily: TL.font.sans, fontSize: 13.5, fontWeight: 700, color: TL.text }}>
            Avslutte runden nå?
          </div>
          <div style={{ fontFamily: TL.font.sans, fontSize: 12, color: TL.mute, lineHeight: 1.55 }}>
            {ferdige} av {hullData.length} hull er fullført. De {ferdige} lagres med full SG — resten
            lagres ikke. Du kan også fortsette senere fra kladden på denne enheten.
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={onAvslutt}
              className="v2-press v2-focus"
              style={{
                appearance: "none",
                cursor: "pointer",
                flex: 1,
                padding: "11px 0",
                borderRadius: 12,
                background: TL.dim,
                border: `1px solid ${TL.hair}`,
                fontFamily: TL.font.sans,
                fontSize: 13,
                fontWeight: 700,
                color: TL.text,
              }}
            >
              Lagre {ferdige} hull
            </button>
            <button
              type="button"
              onClick={onLukk}
              className="v2-press v2-focus"
              style={{
                appearance: "none",
                cursor: "pointer",
                flex: 1,
                padding: "11px 0",
                borderRadius: 12,
                background: "transparent",
                border: `1px solid ${TL.hair}`,
                fontFamily: TL.font.sans,
                fontSize: 13,
                fontWeight: 600,
                color: TL.mute,
              }}
            >
              Fortsett runden
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onLukk}
        className="v2-press v2-focus"
        style={{
          appearance: "none",
          cursor: "pointer",
          width: "100%",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          padding: "12px 0",
          borderRadius: 12,
          background: "transparent",
          border: `1px solid ${TL.hair}`,
          fontFamily: TL.font.sans,
          fontSize: 13,
          fontWeight: 600,
          color: TL.mute,
        }}
      >
        <Icon name="arrow-left" size={14} />
        Tilbake til føringen
      </button>
    </div>
  );
}
