"use client";

/**
 * Hurtigmodus (F.02): bare score per hull — store tall-knapper.
 * Samme runde-motor (lagring via syntetisert kjede). Minst mulig trykk:
 * Birdie / Par / Bogey + finjustering.
 */

import { useState } from "react";
import type { LoggetHull } from "@/lib/runde-logg/types";
import { scoreFraHull } from "@/lib/runde-logg/syntetiser-hurtig";
import { T, Icon } from "@/components/v2";

type HurtigHullForingProps = {
  hull: LoggetHull;
  antallHull: number;
  ferdigeFor: number;
  scoreHittil: string;
  onLagre: (strokes: number, putts?: number) => void;
  onNesteHull: () => void;
  onVisOversikt: () => void;
  onVisSg: () => void;
  onSlettHull: (() => void) | null;
};

export function HurtigHullForing({
  hull,
  antallHull,
  ferdigeFor,
  scoreHittil,
  onLagre,
  onNesteHull,
  onVisOversikt,
  onVisSg,
  onSlettHull,
}: HurtigHullForingProps) {
  const eksisterende = scoreFraHull(hull);
  const [strokes, setStrokes] = useState(eksisterende ?? hull.par);
  const [putts, setPutts] = useState(2);
  const [visPutter, setVisPutter] = useState(false);

  const ferdig = eksisterende != null;
  const diff = strokes - hull.par;
  const diffTxt = diff === 0 ? "E" : diff > 0 ? `+${diff}` : `−${Math.abs(diff)}`;

  const sett = (n: number) => setStrokes(Math.max(1, Math.min(15, n)));

  const lagre = () => {
    onLagre(strokes, visPutter ? putts : undefined);
  };

  const chip = (label: string, n: number, primary?: boolean) => (
    <button
      key={label}
      type="button"
      onClick={() => sett(n)}
      className="v2-press v2-focus"
      style={{
        appearance: "none",
        cursor: "pointer",
        flex: 1,
        minHeight: 52,
        borderRadius: 14,
        border: `1px solid ${strokes === n ? T.lime : T.border}`,
        background: strokes === n ? "color-mix(in srgb, var(--v2-lime) 14%, transparent)" : T.panel,
        fontFamily: T.ui,
        fontSize: 14,
        fontWeight: 700,
        color: primary ? T.lime : T.fg,
      }}
    >
      {label}
      <div style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 600, color: T.mut, marginTop: 2 }}>
        {n} slag
      </div>
    </button>
  );

  const sekundaer = (label: string, ikon: string, onClick: () => void) => (
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
            Hull {hull.holeNumber} · par {hull.par} · hurtig
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

      {ferdig ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            padding: "18px 14px 16px",
            borderRadius: 16,
            background: T.panel,
            border: `1px solid ${T.borderS}`,
            alignItems: "center",
          }}
        >
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
            Hull {hull.holeNumber}: {eksisterende} slag
          </div>
          {onSlettHull && (
            <button
              type="button"
              onClick={onSlettHull}
              className="v2-press v2-focus"
              style={{
                appearance: "none",
                cursor: "pointer",
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
              Endre score
            </button>
          )}
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
            }}
          >
            {ferdigeFor >= antallHull ? "Til oppsummering" : "Neste hull"}
            <Icon name="arrow-right" size={16} />
          </button>
        </div>
      ) : (
        <>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              padding: "20px 14px",
              borderRadius: 16,
              background: T.panel,
              border: `1px solid ${T.borderS}`,
            }}
          >
            <div style={{ fontFamily: T.mono, fontSize: 42, fontWeight: 800, color: T.fg, lineHeight: 1 }}>
              {strokes}
            </div>
            <div style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: T.fg2 }}>
              {diffTxt} til par
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <button
                type="button"
                onClick={() => sett(strokes - 1)}
                disabled={strokes <= 1}
                className="v2-press v2-focus"
                aria-label="Færre slag"
                style={{
                  appearance: "none",
                  cursor: strokes <= 1 ? "default" : "pointer",
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  border: `1px solid ${T.border}`,
                  background: T.panel2,
                  color: T.fg,
                  fontSize: 22,
                  fontWeight: 700,
                  opacity: strokes <= 1 ? 0.35 : 1,
                }}
              >
                −
              </button>
              <button
                type="button"
                onClick={() => sett(strokes + 1)}
                disabled={strokes >= 15}
                className="v2-press v2-focus"
                aria-label="Flere slag"
                style={{
                  appearance: "none",
                  cursor: strokes >= 15 ? "default" : "pointer",
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  border: `1px solid ${T.border}`,
                  background: T.panel2,
                  color: T.fg,
                  fontSize: 22,
                  fontWeight: 700,
                  opacity: strokes >= 15 ? 0.35 : 1,
                }}
              >
                +
              </button>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            {hull.par >= 3 && chip("Birdie", Math.max(1, hull.par - 1))}
            {chip("Par", hull.par, true)}
            {chip("Bogey", hull.par + 1)}
            {chip("Dobbelt", hull.par + 2)}
          </div>

          <button
            type="button"
            onClick={() => setVisPutter((v) => !v)}
            className="v2-press v2-focus"
            style={{
              appearance: "none",
              cursor: "pointer",
              alignSelf: "flex-start",
              padding: "6px 12px",
              borderRadius: 9999,
              border: `1px solid ${visPutter ? T.lime : T.border}`,
              background: visPutter ? "color-mix(in srgb, var(--v2-lime) 10%, transparent)" : "transparent",
              fontFamily: T.mono,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: visPutter ? T.lime : T.mut,
            }}
          >
            Putter {visPutter ? `· ${putts}` : "· valgfritt"}
          </button>

          {visPutter && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[0, 1, 2, 3].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPutts(n)}
                  className="v2-press v2-focus"
                  style={{
                    appearance: "none",
                    cursor: "pointer",
                    width: 48,
                    height: 40,
                    borderRadius: 12,
                    border: `1px solid ${putts === n ? T.lime : T.border}`,
                    background: putts === n ? "color-mix(in srgb, var(--v2-lime) 12%, transparent)" : T.panel,
                    fontFamily: T.mono,
                    fontSize: 14,
                    fontWeight: 700,
                    color: T.fg,
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={lagre}
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
            }}
          >
            Lagre hull · {strokes} slag
          </button>
        </>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {sekundaer("Hull-oversikt", "layout-dashboard", onVisOversikt)}
        {sekundaer("SG hittil", "trending-up", onVisSg)}
      </div>
    </div>
  );
}
