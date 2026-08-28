"use client";

/**
 * RU-02 — Recap: V8 hullgrid (front/back ni) + scorekort-utdrag, Train-lock.
 * Erstatter den gamle T-styrte Oppsummering-komponenten for
 * `steg === "oppsummering"` i runde-live-klient.tsx. Rendres som en HEL,
 * frittstående skjerm (egen TL.scene-bakgrunn) — aldri inni det T-styrte
 * skallet rundt oppsett/føring, for å unngå å blande T og TL i samme skjerm
 * (gotchas.md). Lagring gjenbruker lagreLoggetRunde uendret; serveren regner
 * SG på nytt ved lagring — klientens tall er kun visning.
 *
 * Grid-konvensjon (fasit): over par = dimmet (TL.opasitet.negativ),
 * under par = ring. Scorekort-utdraget viser de {UTDRAG_ANTALL} hullene med
 * størst |SG| — ikke alle 18 (det er RU-03/Analyse sin jobb, urørt her).
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TL } from "@/lib/v2/train-lock";
import { fmtSg } from "@/lib/v2/format";
import { Icon } from "@/components/v2/icon";
import { lagreLoggetRunde } from "@/app/portal/(legacy)/mal/runder/logg/actions";
import { slettKladd } from "@/lib/runde-logg/draft";
import type { LoggetHull } from "@/lib/runde-logg/types";
import { beregnSg } from "@/lib/domain/sg";
import { rundeTilSgShots, hullTilSgShots } from "@/lib/runde-logg/til-sg-shots";
import { deriverRundeScore } from "@/lib/runde-logg/deriver-hullscore";

const UTDRAG_ANTALL = 3;

function erFerdig(h: LoggetHull): boolean {
  return h.slag.at(-1)?.resultat.iHull === true;
}

function diffTekst(diff: number): string {
  if (diff === 0) return "E";
  return diff > 0 ? `+${diff}` : `−${Math.abs(diff)}`;
}

type RundeRecapProps = {
  courseId: string;
  courseNavn: string;
  playedAt: string;
  roundType: "turnering" | "trening";
  hullData: LoggetHull[];
  onTilbake: () => void;
};

export function RundeRecap({ courseId, courseNavn, playedAt, roundType, hullData, onTilbake }: RundeRecapProps) {
  const router = useRouter();
  const [lagrer, setLagrer] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);

  const ferdige = hullData.filter(erFerdig);
  const delvis = ferdige.length < hullData.length;

  let score = 0;
  let putter = 0;
  let sgTotal: number | null = null;
  let hullScores: ReturnType<typeof deriverRundeScore>["hullScores"] = [];
  try {
    const derivert = deriverRundeScore(ferdige);
    hullScores = derivert.hullScores;
    score = derivert.totalScore;
    putter = hullScores.reduce((sum, h) => sum + h.putts, 0);
    sgTotal = beregnSg(rundeTilSgShots(ferdige)).total;
  } catch {
    sgTotal = null;
  }

  const fairwayMuligheter = hullScores.filter((h) => h.fairway != null).length;
  const fairwayTreff = hullScores.filter((h) => h.fairway === true).length;
  const sumPar = ferdige.reduce((sum, h) => sum + h.par, 0);
  const diff = score - sumPar;

  // Per-hull SG — samme motor kalt ett hull av gangen (ingen ny beregning).
  const sgPerHull = new Map<number, number>();
  for (const h of ferdige) {
    try {
      sgPerHull.set(h.holeNumber, beregnSg(hullTilSgShots(h)).total);
    } catch {
      // Ufullstendig kjede for dette hullet — vises uten SG (em-dash).
    }
  }

  const utdrag = [...sgPerHull.entries()]
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .slice(0, UTDRAG_ANTALL)
    .sort((a, b) => a[0] - b[0]);

  const rader: number[][] =
    hullData.length > 9
      ? [hullData.slice(0, 9).map((h) => h.holeNumber), hullData.slice(9).map((h) => h.holeNumber)]
      : [hullData.map((h) => h.holeNumber)];

  const lagre = async () => {
    setLagrer(true);
    setFeil(null);
    try {
      const res = await lagreLoggetRunde({
        courseId,
        playedAt: new Date(playedAt).toISOString(),
        hull: ferdige,
        roundType,
      });
      slettKladd();
      router.push(`/portal/mal/runder/${res.roundId}?lagret=1`);
    } catch (e) {
      setFeil(
        e instanceof Error && e.message.startsWith("Ugyldig runde-logg")
          ? e.message
          : "Fikk ikke kontakt. Runden ligger trygt på enheten — prøv igjen når du har dekning.",
      );
      setLagrer(false);
    }
  };

  return (
    <div
      data-od-id="runde-recap"
      style={{ minHeight: "100dvh", background: TL.scene, color: TL.text, fontFamily: TL.font.sans }}
    >
      <div
        style={{
          maxWidth: 560,
          margin: "0 auto",
          padding: "0 20px 140px",
          paddingTop: "calc(16px + env(safe-area-inset-top))",
        }}
      >
        <header style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: TL.font.mono, fontSize: 10, letterSpacing: TL.track.caps, textTransform: "uppercase", color: TL.mute }}>
            Runde ferdig · {courseNavn}
          </div>
          <h1 style={{ margin: "6px 0 0", fontFamily: TL.font.sans, fontSize: 34, fontWeight: 700, color: TL.text, fontVariantNumeric: "tabular-nums" }}>
            {score} slag
          </h1>
          <p style={{ margin: "4px 0 0", fontFamily: TL.font.mono, fontSize: 12, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>
            {diffTekst(diff)} mot par {sumPar} · {putter} putt
            {fairwayMuligheter > 0 ? ` · ${fairwayTreff} av ${fairwayMuligheter} fairway` : ""}
          </p>
        </header>

        <section style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: TL.font.mono, fontSize: 10, letterSpacing: TL.track.capsSm, textTransform: "uppercase", color: TL.mute, marginBottom: 10 }}>
            Hull for hull
          </div>
          {rader.map((rad, radIdx) => (
            <div key={radIdx} style={{ display: "grid", gridTemplateColumns: `repeat(${rad.length}, 1fr)`, gap: 6, marginBottom: radIdx === rader.length - 1 ? 0 : 6 }}>
              {rad.map((holeNumber) => {
                const hull = hullData.find((h) => h.holeNumber === holeNumber);
                const hs = hullScores.find((h) => h.holeNumber === holeNumber);
                const under = hs ? hs.strokes < hull!.par : false;
                const over = hs ? hs.strokes > hull!.par : false;
                return (
                  <div
                    key={holeNumber}
                    style={{
                      aspectRatio: "1",
                      borderRadius: TL.radius.row,
                      background: TL.elev,
                      boxShadow: under ? `inset 0 0 0 1.5px ${TL.text}` : "none",
                      opacity: over ? TL.opasitet.negativ : 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 2,
                    }}
                  >
                    <span style={{ fontFamily: TL.font.mono, fontSize: 9, color: TL.mute }}>{holeNumber}</span>
                    <span style={{ fontFamily: TL.font.mono, fontSize: 15, fontWeight: 700, color: TL.text, fontVariantNumeric: "tabular-nums" }}>
                      {hs ? hs.strokes : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
          <p style={{ margin: "10px 0 0", fontFamily: TL.font.mono, fontSize: 10, color: TL.mute }}>
            Over par = dimmet · under par = ring
          </p>
        </section>

        {utdrag.length > 0 && (
          <section style={{ marginBottom: 24 }}>
            <div style={{ fontFamily: TL.font.mono, fontSize: 10, letterSpacing: TL.track.capsSm, textTransform: "uppercase", color: TL.mute, marginBottom: 10 }}>
              Scorekort
            </div>
            <div style={{ background: TL.elev, borderRadius: TL.radius.card, padding: "4px 16px" }}>
              {utdrag.map(([holeNumber, sg]) => {
                const hull = hullData.find((h) => h.holeNumber === holeNumber)!;
                const hs = hullScores.find((h) => h.holeNumber === holeNumber)!;
                return (
                  <div
                    key={holeNumber}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "28px 1fr auto auto",
                      gap: 10,
                      alignItems: "baseline",
                      padding: "10px 0",
                      borderBottom: `1px solid ${TL.hair}`,
                    }}
                  >
                    <span style={{ fontFamily: TL.font.mono, fontSize: 12, fontWeight: 700, color: TL.text }}>{holeNumber}</span>
                    <span style={{ fontFamily: TL.font.mono, fontSize: 11, color: TL.mute }}>Par {hull.par}</span>
                    <span style={{ fontFamily: TL.font.mono, fontSize: 13, fontWeight: 700, color: TL.text, fontVariantNumeric: "tabular-nums" }}>
                      {hs.strokes}
                    </span>
                    <span
                      style={{
                        fontFamily: TL.font.mono,
                        fontSize: 12,
                        fontWeight: 700,
                        color: TL.text,
                        opacity: sg < 0 ? TL.opasitet.negativ : 1,
                        fontVariantNumeric: "tabular-nums",
                        minWidth: 48,
                        textAlign: "right",
                      }}
                    >
                      {fmtSg(sg)}
                    </span>
                  </div>
                );
              })}
              <div style={{ display: "grid", gridTemplateColumns: "28px 1fr auto auto", gap: 10, alignItems: "baseline", padding: "10px 0" }}>
                <span style={{ fontFamily: TL.font.mono, fontSize: 12, fontWeight: 700, color: TL.mute, gridColumn: "1 / 3" }}>Sum</span>
                <span style={{ fontFamily: TL.font.mono, fontSize: 13, fontWeight: 700, color: TL.text, fontVariantNumeric: "tabular-nums" }}>
                  {score}
                </span>
                <span
                  style={{
                    fontFamily: TL.font.mono,
                    fontSize: 12,
                    fontWeight: 700,
                    color: TL.text,
                    opacity: sgTotal != null && sgTotal < 0 ? TL.opasitet.negativ : 1,
                    fontVariantNumeric: "tabular-nums",
                    minWidth: 48,
                    textAlign: "right",
                  }}
                >
                  {sgTotal == null ? "—" : fmtSg(sgTotal)}
                </span>
              </div>
            </div>
          </section>
        )}

        {delvis && (
          <p style={{ margin: "0 0 16px", fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute, lineHeight: 1.5 }}>
            Kun de {ferdige.length} fullførte hullene lagres. Serveren beregner SG på nytt ved lagring.
          </p>
        )}

        {feil && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 12px",
              borderRadius: TL.radius.row,
              background: TL.elev,
              boxShadow: `inset 0 0 0 1px ${TL.danger}`,
              marginBottom: 16,
            }}
          >
            <Icon name="triangle-alert" size={14} style={{ color: TL.danger, flex: "none" }} />
            <span style={{ fontFamily: TL.font.sans, fontSize: 12, color: TL.text, lineHeight: 1.5 }}>{feil}</span>
          </div>
        )}

        <button
          type="button"
          onClick={onTilbake}
          disabled={lagrer}
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
            borderRadius: TL.radius.pill,
            background: "transparent",
            boxShadow: `inset 0 0 0 1px ${TL.hair}`,
            fontFamily: TL.font.sans,
            fontSize: 13,
            fontWeight: 600,
            color: TL.mute,
            border: "none",
          }}
        >
          <Icon name="arrow-left" size={14} />
          Tilbake til føringen
        </button>
      </div>

      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          padding: "12px 20px calc(12px + env(safe-area-inset-bottom))",
          background: TL.dock,
          boxShadow: `inset 0 1px 0 ${TL.hair}`,
        }}
      >
        <button
          type="button"
          onClick={lagre}
          disabled={lagrer || ferdige.length === 0}
          className="v2-press v2-focus"
          style={{
            appearance: "none",
            cursor: lagrer || ferdige.length === 0 ? "default" : "pointer",
            width: "100%",
            minHeight: 48,
            border: "none",
            borderRadius: TL.radius.pill,
            background: TL.fill,
            color: TL.onFill,
            fontFamily: TL.font.sans,
            fontSize: 15,
            fontWeight: 700,
            opacity: lagrer || ferdige.length === 0 ? 0.6 : 1,
          }}
        >
          {lagrer ? "Lagrer…" : feil ? "Prøv igjen" : delvis ? `Lagre ${ferdige.length} hull` : "Lagre runde"}
        </button>
      </div>
    </div>
  );
}
