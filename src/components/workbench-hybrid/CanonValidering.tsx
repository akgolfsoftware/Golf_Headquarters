"use client";

import { useState } from "react";
import { AlertTriangle, ShieldCheck } from "lucide-react";

import type { BruddRad } from "@/lib/canon/valider-plan";
import { klarsprak, feltForInvariant } from "@/lib/canon/klarsprak";
import type { DimField } from "./taxonomy";
import { FONT, WB } from "./theme";

const fargeFor = (a: "hard" | "myk") => (a === "hard" ? WB.err : WB.warn);

/** Hvilke chip-felt som har et aktivt (ikke-overstyrt) brudd → for kant-markering i inspektøren. */
export function bruddByField(
  brudd: BruddRad[],
  overrides: Set<string>,
): Partial<Record<DimField, "hard" | "myk">> {
  const out: Partial<Record<DimField, "hard" | "myk">> = {};
  for (const b of brudd) {
    if (overrides.has(b.invariantId)) continue;
    for (const felt of feltForInvariant(b.invariantId)) {
      // hard vinner over myk
      if (out[felt] !== "hard") out[felt] = b.alvorlighet;
    }
  }
  return out;
}

const scoreFarge = (score: number) => (score >= 80 ? WB.lime : score >= 50 ? WB.warn : WB.err);

/** Plan-kvalitetskort — stort mono-tall + kort bruddliste (klikkbar → hopp). */
export function PlanKvalitetKort({
  score,
  brudd,
  isCoach,
  overrides,
  onJump,
}: {
  score: number;
  brudd: BruddRad[];
  isCoach: boolean;
  overrides: Set<string>;
  onJump?: (sessionIds: string[]) => void;
}) {
  const aktive = brudd.filter((b) => !overrides.has(b.invariantId));
  return (
    <div
      style={{
        background: WB.cardBg,
        border: `1px solid ${WB.panelBorder}`,
        borderRadius: 12,
        padding: "10px 13px",
        minWidth: 180,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
        <span style={{ fontFamily: FONT.mono, fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: WB.muted }}>
          Plan-kvalitet
        </span>
        <span style={{ fontFamily: FONT.mono, fontSize: 26, fontWeight: 700, lineHeight: 1, color: scoreFarge(score) }}>
          {score}
        </span>
      </div>
      <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
        {aktive.length === 0 ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, color: WB.lime }}>
            <ShieldCheck size={13} /> Ingen brudd
          </span>
        ) : (
          aktive.slice(0, 4).map((b, i) => (
            <button
              key={`${b.invariantId}-${i}`}
              type="button"
              onClick={() => onJump?.(b.sessionIds)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "transparent",
                border: "none",
                padding: 0,
                cursor: b.sessionIds.length ? "pointer" : "default",
                textAlign: "left",
                color: fargeFor(b.alvorlighet),
                fontSize: 10.5,
              }}
            >
              <AlertTriangle size={11} />
              <span style={{ color: WB.muted2 }}>{isCoach ? b.melding : klarsprak(b.invariantId, b.melding)}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

/** Brudd-panel i inspektøren for valgt økt: melding + (coach) overstyr-knapp m/ begrunnelse. */
export function BruddPanel({
  brudd,
  isCoach,
  overrides,
  onOverstyr,
}: {
  brudd: BruddRad[];
  isCoach: boolean;
  overrides: Set<string>;
  onOverstyr?: (invariantId: string, begrunnelse: string) => void;
}) {
  const [aapen, setAapen] = useState<string | null>(null);
  const [tekst, setTekst] = useState("");

  if (brudd.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 14 }}>
      {brudd.map((b) => {
        const overstyrt = overrides.has(b.invariantId);
        const farge = overstyrt ? WB.muted3 : fargeFor(b.alvorlighet);
        return (
          <div
            key={b.invariantId}
            style={{
              background: WB.cardBg,
              border: `1px solid ${overstyrt ? WB.panelBorder : farge}`,
              borderRadius: 9,
              padding: "9px 11px",
              opacity: overstyrt ? 0.6 : 1,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <AlertTriangle size={13} color={farge} />
              <span style={{ fontSize: 11.5, color: WB.text, flex: 1 }}>
                {isCoach ? b.melding : klarsprak(b.invariantId, b.melding)}
              </span>
              {overstyrt && (
                <span style={{ fontFamily: FONT.mono, fontSize: 8.5, color: WB.muted3, textTransform: "uppercase" }}>overstyrt</span>
              )}
            </div>

            {isCoach && !overstyrt && b.alvorlighet === "hard" && onOverstyr && (
              <div style={{ marginTop: 8 }}>
                {aapen === b.invariantId ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <textarea
                      value={tekst}
                      onChange={(e) => setTekst(e.target.value)}
                      placeholder="Begrunnelse (påkrevd)"
                      rows={2}
                      style={{
                        width: "100%",
                        background: WB.railBg,
                        border: `1px solid ${WB.panelBorder}`,
                        borderRadius: 7,
                        padding: "6px 8px",
                        color: WB.text,
                        fontSize: 11,
                        resize: "vertical",
                      }}
                    />
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        type="button"
                        disabled={!tekst.trim()}
                        onClick={() => {
                          onOverstyr(b.invariantId, tekst.trim());
                          setAapen(null);
                          setTekst("");
                        }}
                        style={{
                          flex: 1,
                          background: tekst.trim() ? WB.lime : WB.panelBorder,
                          color: WB.limeDark,
                          border: "none",
                          borderRadius: 7,
                          padding: "6px 10px",
                          cursor: tekst.trim() ? "pointer" : "not-allowed",
                          fontFamily: FONT.mono,
                          fontSize: 10,
                          fontWeight: 700,
                          textTransform: "uppercase",
                        }}
                      >
                        Bekreft
                      </button>
                      <button
                        type="button"
                        onClick={() => { setAapen(null); setTekst(""); }}
                        style={{ background: "transparent", border: "none", color: WB.muted, cursor: "pointer", fontSize: 11 }}
                      >
                        Avbryt
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setAapen(b.invariantId)}
                    style={{
                      background: "transparent",
                      border: `1px solid ${WB.panelBorder}`,
                      color: WB.muted2,
                      borderRadius: 7,
                      padding: "4px 10px",
                      cursor: "pointer",
                      fontFamily: FONT.mono,
                      fontSize: 9.5,
                      fontWeight: 700,
                      textTransform: "uppercase",
                    }}
                  >
                    Overstyr
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
