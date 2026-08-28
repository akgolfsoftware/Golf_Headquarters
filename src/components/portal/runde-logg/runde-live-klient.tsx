"use client";
import { TL } from "@/lib/v2/train-lock";

/**
 * PlayerHQ · Runde live — Paper-port PP-3 (fase 1).
 * Fasit: designsystem/paper/fase1/playerhq-runde-live.html.
 *
 * Stepper er standardinngangen: sumkort (løpende brutto + why-details),
 * hullstripe (hopp til hull), − / stort tall / + per hull, ← Forrige /
 * Neste hull →, og skjermens ene clay-handling «Lagre runden» i fast dokk.
 *
 * Slag-for-slag-editoren er BEHOLDT bak et nøytralt detaljnivå per hull
 * («Slag for slag · detaljer») — Enkelhet: behold funksjoner, færre trykk.
 * Den gamle «Slag | Hurtig»-toggelen i headeren er fjernet: stepperen ER
 * hurtigmodusen, slag-detaljen bor bak hullet.
 *
 * Kladd i localStorage etter hver mutasjon (golfbane = dårlig dekning) —
 * gjenopprettes ved reload. steg === "oppsummering" rendres av RundeRecap
 * (RU-02, Train-lock — Loop 9/C5), som gjenbruker lagreLoggetRunde UENDRET.
 * KUN brutto score — netto finnes ikke.
 */

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import type { LoggetHull, LoggetSlag } from "@/lib/runde-logg/types";
import { lesKladdCached, lesKladdServer, lagreKladd, slettKladd } from "@/lib/runde-logg/draft";
import { syntetiserHurtigHull, scoreFraHull } from "@/lib/runde-logg/syntetiser-hurtig";
import { Icon } from "@/components/v2";
import { OppsettSteg, type OppsettVerdi } from "./oppsett-steg";
import { HullForing } from "./hull-foring";
import { HullOversikt } from "./hull-oversikt";
import { SgPanel } from "./sg-panel";
import { RundeRecap } from "./runde-recap";
import { TommelSone, PrimaerKnapp } from "./tommel-sone";

/** Kladden endres aldri utenfra mens siden er åpen — tom subscribe. */
const abonnerIngen = () => () => {};

type Steg = "oppsett" | "foring" | "oppsummering";
type Visning = "stepper" | "detalj" | "oversikt" | "sg";

type RundeLiveKlientProps = {
  baner: Array<{ id: string; name: string }>;
};

function erFerdig(h: LoggetHull): boolean {
  return h.slag.at(-1)?.resultat.iHull === true;
}

/** Scorenavn på norsk — avledet av par, bare visning (fasit). */
function scoreNavn(s: number, par: number): string {
  const d = s - par;
  if (d <= -2) return "eagle";
  if (d === -1) return "birdie";
  if (d === 0) return "par";
  if (d === 1) return "bogey";
  if (d === 2) return "dobbeltbogey";
  return `${d} over`;
}

export function RundeLiveKlient({ baner }: RundeLiveKlientProps) {
  const [steg, setSteg] = useState<Steg>("oppsett");
  const [visning, setVisning] = useState<Visning>("stepper");
  const [oppsett, setOppsett] = useState<Omit<OppsettVerdi, "hull"> | null>(null);
  const [hullData, setHullData] = useState<LoggetHull[]>([]);
  const [aktivtHullIdx, setAktivtHullIdx] = useState(0);
  const [kladdHandtert, setKladdHandtert] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [srMelding, setSrMelding] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function visToast(t: string) {
    setToast(t);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }

  // Gjenoppretting: les kladd hydration-trygt (server ser alltid null).
  const lagretKladd = useSyncExternalStore(abonnerIngen, lesKladdCached, lesKladdServer);
  const kladd = kladdHandtert ? null : lagretKladd;

  // Autolagre kladd etter hver mutasjon (kun etter at føringen er i gang).
  const startet = steg !== "oppsett" && oppsett != null;
  useEffect(() => {
    if (!startet || !oppsett) return;
    lagreKladd({
      versjon: 1,
      modus: "live",
      foringsModus: visning === "detalj" ? "slag" : "hurtig",
      steg,
      oppsett: {
        courseId: oppsett.courseId,
        courseNavn: oppsett.courseNavn,
        roundType: oppsett.roundType,
        hullValg: oppsett.hullValg,
        playedAt: oppsett.playedAt,
      },
      hullData,
      aktivtHullIdx,
    });
  }, [startet, visning, steg, oppsett, hullData, aktivtHullIdx]);

  const start = (verdi: OppsettVerdi) => {
    setOppsett({
      courseId: verdi.courseId,
      courseNavn: verdi.courseNavn,
      roundType: verdi.roundType,
      hullValg: verdi.hullValg,
      playedAt: verdi.playedAt,
    });
    setHullData(
      verdi.hull.map((h) => ({
        holeNumber: h.holeNumber,
        par: h.par,
        lengdeMeter: h.lengdeMeter,
        slag: [],
      })),
    );
    setAktivtHullIdx(0);
    setSteg("foring");
    setVisning("stepper");
    setKladdHandtert(true);
  };

  const gjenopprett = () => {
    if (!kladd) return;
    setOppsett({
      courseId: kladd.oppsett.courseId ?? "",
      courseNavn: kladd.oppsett.courseNavn,
      roundType: kladd.oppsett.roundType,
      hullValg: kladd.oppsett.hullValg,
      playedAt: kladd.oppsett.playedAt,
    });
    setHullData(kladd.hullData);
    setAktivtHullIdx(Math.min(kladd.aktivtHullIdx, Math.max(kladd.hullData.length - 1, 0)));
    setSteg(kladd.steg === "oppsett" ? "foring" : kladd.steg);
    setVisning("stepper");
    setKladdHandtert(true);
  };

  const forkastKladd = () => {
    slettKladd();
    setKladdHandtert(true);
  };

  const aktivtHull = hullData[aktivtHullIdx];

  // ── Stepper-semantikk (fasit): uendret stepper = par ────────────
  /** Brutto score per hull — null når hullet ikke er satt/ferdig. */
  const scores = useMemo(() => hullData.map((h) => scoreFraHull(h)), [hullData]);

  const settScore = (idx: number, strokes: number) => {
    setHullData((data) =>
      data.map((h, i) =>
        i === idx
          ? syntetiserHurtigHull({
              holeNumber: h.holeNumber,
              par: h.par,
              lengdeMeter: h.lengdeMeter,
              strokes,
            })
          : h,
      ),
    );
    setSrMelding(`Hull ${hullData[idx]?.holeNumber ?? idx + 1}: ${strokes} slag.`);
  };

  const stepperMinus = () => {
    if (!aktivtHull) return;
    const vis = scores[aktivtHullIdx] ?? aktivtHull.par;
    if (vis > 1) settScore(aktivtHullIdx, vis - 1);
  };

  const stepperPluss = () => {
    if (!aktivtHull) return;
    const satt = scores[aktivtHullIdx] != null;
    const vis = scores[aktivtHullIdx] ?? aktivtHull.par;
    settScore(aktivtHullIdx, satt ? vis + 1 : aktivtHull.par);
  };

  const stepperNeste = () => {
    if (!aktivtHull) return;
    // Fasit: uendret stepper = par.
    if (scores[aktivtHullIdx] == null) settScore(aktivtHullIdx, aktivtHull.par);
    if (aktivtHullIdx < hullData.length - 1) {
      const neste = aktivtHullIdx + 1;
      setAktivtHullIdx(neste);
      setSrMelding(`Hull ${hullData[neste].holeNumber}, par ${hullData[neste].par}.`);
    } else {
      visToast("Siste hull — lagre runden når du er klar.");
    }
  };

  // ── Slag-for-slag-detaljen (beholdt funksjonalitet) ─────────────
  const leggTilSlag = (slag: LoggetSlag) => {
    setHullData((data) =>
      data.map((h, i) => (i === aktivtHullIdx ? { ...h, slag: [...h.slag, slag] } : h)),
    );
  };

  const angre = () => {
    setHullData((data) =>
      data.map((h, i) => (i === aktivtHullIdx ? { ...h, slag: h.slag.slice(0, -1) } : h)),
    );
  };

  const nesteFraDetalj = () => {
    // Neste uferdige hull ETTER aktivt (wrap-around); tilbake til stepperen.
    const n = hullData.length;
    for (let s = 1; s <= n; s++) {
      const idx = (aktivtHullIdx + s) % n;
      if (!erFerdig(hullData[idx])) {
        setAktivtHullIdx(idx);
        setVisning("stepper");
        return;
      }
    }
    setSteg("oppsummering");
  };

  // Score hittil (satte hull) relativt til par — til detaljvisningen.
  const scoreHittil = useMemo(() => {
    const satte = scores
      .map((s, i) => (s != null ? { s, par: hullData[i].par } : null))
      .filter((x): x is { s: number; par: number } => x != null);
    if (satte.length === 0) return "E";
    const diff = satte.reduce((sum, x) => sum + x.s - x.par, 0);
    return diff === 0 ? "E" : diff > 0 ? `+${diff}` : `−${Math.abs(diff)}`;
  }, [scores, hullData]);

  // Vind vedvarer per hull: sist registrerte vind i aktivt hull.
  const sisteVind = useMemo(
    () => aktivtHull?.slag.findLast((s) => s.vind != null)?.vind,
    [aktivtHull],
  );

  const antallFerdige = hullData.filter(erFerdig).length;

  // ── Sum-tall (fasit: regnet, ikke skrevet) ──────────────────────
  const spilte = scores.filter((s) => s != null).length;
  const sumSlag = scores.reduce<number>((a, s) => a + (s ?? 0), 0);
  const sumPar = scores.reduce<number>((a, s, i) => a + (s != null ? hullData[i].par : 0), 0);
  const relDiff = sumSlag - sumPar;
  const relStr = relDiff === 0 ? "E" : relDiff > 0 ? `+${relDiff}` : String(relDiff);

  const lagreRunden = () => {
    if (spilte === 0) {
      visToast("Tast minst ett hull først.");
      return;
    }
    setSteg("oppsummering");
  };

  // RU-02: recap er en HEL, frittstående Train-lock-skjerm — rendres FØR det
  // T-styrte skallet under, aldri inni det (gotchas.md: bland aldri T og TL
  // i samme skjerm).
  if (steg === "oppsummering" && oppsett) {
    return (
      <RundeRecap
        courseId={oppsett.courseId}
        courseNavn={oppsett.courseNavn}
        playedAt={oppsett.playedAt}
        roundType={oppsett.roundType}
        hullData={hullData}
        onTilbake={() => {
          setSteg("foring");
          setVisning("stepper");
        }}
      />
    );
  }

  return (
    <div
      data-paper-slug="playerhq-runde-live"
      data-od-id="playerhq-runde-live"
      style={{ minHeight: "100dvh", background: TL.scene, color: TL.text, fontFamily: TL.font.sans }}
    >
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "0 16px 32px",
          paddingTop: "calc(12px + env(safe-area-inset-top))",
        }}
      >
        {/* ── Topp — fasit .topp ── */}
        <header
          data-paper-topp
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 14,
            paddingBottom: 12,
            borderBottom: `1px solid ${TL.hair}`,
          }}
        >
          <Link
            href="/portal/planlegge"
            aria-label="Til planen — kladden beholdes"
            className="v2-press v2-focus"
            style={{
              flex: "none",
              width: 44,
              height: 44,
              borderRadius: 12,
              border: `1px solid ${TL.hair}`,
              color: TL.text,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
            }}
          >
            <Icon name="chevron-left" size={18} />
          </Link>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h1 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 17, fontWeight: 600, color: TL.text }}>
              Runde · live
            </h1>
            <span style={{ display: "block", fontFamily: TL.font.mono, fontSize: 10.5, color: TL.mute, marginTop: 2 }}>
              {oppsett
                ? `${oppsett.courseNavn} · ${hullData.length} hull · brutto`
                : "På banen · brutto"}
            </span>
          </div>
        </header>

        {/* ── Tom tilstand: ingen runde pågår → oppsett ── */}
        {steg === "oppsett" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {kladd && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 14px",
                  borderRadius: 14,
                  background: "color-mix(in srgb, var(--tl-warn) 8%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--tl-warn) 35%, transparent)",
                }}
              >
                <Icon name="clock" size={16} style={{ color: TL.warn, flex: "none" }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: TL.font.sans, fontSize: 12.5, fontWeight: 700, color: TL.text }}>
                    Uferdig runde funnet
                  </div>
                  <div style={{ fontFamily: TL.font.sans, fontSize: 11, color: TL.mute }}>
                    {kladd.oppsett.courseNavn} · {kladd.hullData.filter(erFerdig).length} hull ført —
                    lagret på denne enheten
                  </div>
                </div>
                <button
                  type="button"
                  onClick={gjenopprett}
                  className="v2-press v2-focus"
                  style={{
                    appearance: "none",
                    cursor: "pointer",
                    padding: "8px 14px",
                    borderRadius: 10,
                    background: TL.warn,
                    border: "none",
                    fontFamily: TL.font.sans,
                    fontSize: 12,
                    fontWeight: 700,
                    color: TL.onFill,
                  }}
                >
                  Fortsett
                </button>
                <button
                  type="button"
                  onClick={forkastKladd}
                  className="v2-press v2-focus"
                  style={{
                    appearance: "none",
                    cursor: "pointer",
                    padding: "8px 10px",
                    borderRadius: 10,
                    background: "transparent",
                    border: `1px solid ${TL.hair}`,
                    fontFamily: TL.font.sans,
                    fontSize: 12,
                    fontWeight: 600,
                    color: TL.mute,
                  }}
                >
                  Forkast
                </button>
              </div>
            )}
            <OppsettSteg modus="live" baner={baner} onStart={start} />
            <Link
              href="/portal/runde/logg"
              className="v2-press v2-focus"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                minHeight: 48,
                borderRadius: 12,
                border: `1px solid ${TL.hair}`,
                fontFamily: TL.font.sans,
                fontSize: 13,
                fontWeight: 600,
                color: TL.mute,
                textDecoration: "none",
              }}
            >
              Etterregistrer en spilt runde
            </Link>
          </div>
        )}

        {/* ── Suksess: runde pågår ── */}
        {steg === "foring" && oppsett && aktivtHull && visning === "stepper" && (
          <>
            {/* Sumkort — løpende brutto, regnet, ikke skrevet */}
            <div
              style={{
                background: TL.elev,
                border: `1px solid ${TL.hair}`,
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  fontFamily: TL.font.mono,
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: "0.09em",
                  textTransform: "uppercase",
                  color: TL.mute,
                }}
              >
                etter {spilte} av {hullData.length} hull
              </span>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 4 }}>
                <span
                  style={{
                    fontFamily: TL.font.mono,
                    fontVariantNumeric: "tabular-nums",
                    fontSize: 40,
                    fontWeight: 500,
                    lineHeight: 1,
                    color: TL.text,
                  }}
                >
                  {sumSlag}
                </span>
                <span style={{ fontFamily: TL.font.mono, fontSize: 16, color: TL.mute }}>
                  {relStr} · brutto
                </span>
              </div>
              <span style={{ display: "block", fontFamily: TL.font.mono, fontSize: 10.5, color: TL.mute, marginTop: 4 }}>
                {oppsett.courseNavn} · par {sumPar} på spilte hull
              </span>
              <details style={{ margin: "12px 0 0", border: `1px solid ${TL.hair}`, borderRadius: 12 }}>
                <summary
                  className="v2-focus"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    minHeight: 44,
                    padding: "0 16px",
                    cursor: "pointer",
                    listStyle: "none",
                    fontSize: 12.5,
                    fontWeight: 500,
                    color: TL.mute,
                  }}
                >
                  Hvorfor dette tallet
                </summary>
                <ul
                  style={{
                    margin: 0,
                    padding: "12px 16px 16px 26px",
                    fontFamily: TL.font.sans,
                    fontSize: 13,
                    color: TL.mute,
                    lineHeight: 1.55,
                  }}
                >
                  <li style={{ marginBottom: 8 }}>
                    Kilde: slagene du har tastet inn, hull for hull. Ingenting annet.
                  </li>
                  <li style={{ marginBottom: 8 }}>
                    Beregning: {sumSlag} slag minus par {sumPar} på de {spilte} spilte hullene ={" "}
                    {relStr}.
                  </li>
                  <li>
                    Forbehold: kun brutto — ekte slag. Netto og poeng finnes ikke i denne appen.
                  </li>
                </ul>
              </details>
            </div>

            {/* Hullstripe — trykk for å hoppe */}
            <div
              role="group"
              aria-label="Hopp til hull"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(9, 1fr)",
                gap: 4,
                marginBottom: 16,
                minWidth: 0,
              }}
            >
              {hullData.map((h, i) => {
                const s = scores[i];
                const aktiv = i === aktivtHullIdx;
                return (
                  <button
                    key={h.holeNumber}
                    type="button"
                    aria-current={aktiv}
                    aria-label={`Hull ${h.holeNumber}${s != null ? `, ${s} slag` : ", ikke spilt"}`}
                    onClick={() => {
                      setAktivtHullIdx(i);
                      setVisning("stepper");
                    }}
                    className="v2-press v2-focus"
                    style={{
                      appearance: "none",
                      cursor: "pointer",
                      minHeight: 44,
                      minWidth: 0,
                      border: `1px solid ${aktiv ? TL.text : TL.hair}`,
                      borderRadius: 8,
                      background: aktiv ? TL.dock : TL.elev,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "2px 0",
                    }}
                  >
                    <span style={{ fontFamily: TL.font.mono, fontSize: 8.5, color: TL.mute, lineHeight: 1.2 }}>
                      {h.holeNumber}
                    </span>
                    <span
                      style={{
                        fontFamily: TL.font.mono,
                        fontVariantNumeric: "tabular-nums",
                        fontSize: 13,
                        fontWeight: s == null ? 400 : 600,
                        lineHeight: 1.2,
                        color:
                          s == null ? TL.mute : s > h.par ? TL.danger : s < h.par ? TL.ok : TL.text,
                      }}
                    >
                      {s == null ? "·" : s}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Gjeldende hull — score settes med to store knapper */}
            <div
              style={{
                background: TL.elev,
                border: `1px solid ${TL.hair}`,
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12 }}>
                <h2 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 16, fontWeight: 600, color: TL.text }}>
                  Hull {aktivtHull.holeNumber}
                </h2>
                <span style={{ fontFamily: TL.font.mono, fontSize: 12, color: TL.mute }}>
                  par {aktivtHull.par}
                </span>
              </div>
              {(() => {
                const satt = scores[aktivtHullIdx] != null;
                const vis = scores[aktivtHullIdx] ?? aktivtHull.par;
                return (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr auto 1fr",
                      gap: 8,
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >
                    <button
                      type="button"
                      onClick={stepperMinus}
                      aria-label="Ett slag mindre"
                      className="v2-press v2-focus"
                      style={{
                        appearance: "none",
                        cursor: "pointer",
                        minHeight: 88,
                        border: `1px solid ${TL.hair}`,
                        borderRadius: 12,
                        background: TL.dock,
                        fontFamily: TL.font.mono,
                        fontSize: 28,
                        color: TL.text,
                      }}
                    >
                      −
                    </button>
                    <div style={{ minWidth: 96, textAlign: "center" }}>
                      <span
                        style={{
                          fontFamily: TL.font.mono,
                          fontVariantNumeric: "tabular-nums",
                          fontSize: 56,
                          fontWeight: 500,
                          lineHeight: 1,
                          color: TL.text,
                        }}
                      >
                        {vis}
                      </span>
                      <span
                        style={{
                          display: "block",
                          fontFamily: TL.font.mono,
                          fontSize: 10.5,
                          color: TL.mute,
                          marginTop: 4,
                        }}
                      >
                        {satt ? scoreNavn(vis, aktivtHull.par) : "trykk + eller − for å sette"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={stepperPluss}
                      aria-label="Ett slag mer"
                      className="v2-press v2-focus"
                      style={{
                        appearance: "none",
                        cursor: "pointer",
                        minHeight: 88,
                        border: `1px solid ${TL.hair}`,
                        borderRadius: 12,
                        background: TL.dock,
                        fontFamily: TL.font.mono,
                        fontSize: 28,
                        color: TL.text,
                      }}
                    >
                      +
                    </button>
                  </div>
                );
              })()}
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <button
                  type="button"
                  onClick={() => aktivtHullIdx > 0 && setAktivtHullIdx(aktivtHullIdx - 1)}
                  disabled={aktivtHullIdx === 0}
                  className="v2-press v2-focus"
                  style={{
                    appearance: "none",
                    cursor: aktivtHullIdx === 0 ? "default" : "pointer",
                    flex: 1,
                    minHeight: 48,
                    border: `1px solid ${TL.hair}`,
                    borderRadius: 12,
                    background: "transparent",
                    fontFamily: TL.font.sans,
                    fontSize: 14,
                    fontWeight: 500,
                    color: TL.text,
                    opacity: aktivtHullIdx === 0 ? 0.4 : 1,
                  }}
                >
                  ← Forrige
                </button>
                <button
                  type="button"
                  onClick={stepperNeste}
                  className="v2-press v2-focus"
                  style={{
                    appearance: "none",
                    cursor: "pointer",
                    flex: 1,
                    minHeight: 48,
                    border: "none",
                    borderRadius: 12,
                    background: TL.fill,
                    fontFamily: TL.font.sans,
                    fontSize: 14,
                    fontWeight: 500,
                    color: TL.onFill,
                  }}
                >
                  Neste hull →
                </button>
              </div>
              {/* Nøytralt detaljnivå — slag-for-slag-editoren er beholdt */}
              <button
                type="button"
                onClick={() => setVisning("detalj")}
                className="v2-press v2-focus"
                style={{
                  appearance: "none",
                  cursor: "pointer",
                  width: "100%",
                  minHeight: 44,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  border: `1px solid ${TL.hair}`,
                  borderRadius: 12,
                  background: "transparent",
                  fontFamily: TL.font.sans,
                  fontSize: 12.5,
                  fontWeight: 500,
                  color: TL.mute,
                }}
              >
                <Icon name="list" size={13} />
                Slag for slag · detaljer for hullet
              </button>
            </div>

            <p style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute, lineHeight: 1.55 }}>
              Du kan lagre når som helst — også etter 9 hull eller midt i runden. Det som er
              tastet, telles.
            </p>

            {/* Fast dokk — skjermens ene clay-handling */}
            <TommelSone>
              <PrimaerKnapp onClick={lagreRunden}>Lagre runden</PrimaerKnapp>
            </TommelSone>
          </>
        )}

        {/* ── Slag-for-slag-detalj (beholdt funksjonalitet) ── */}
        {steg === "foring" && oppsett && aktivtHull && visning === "detalj" && (
          <>
            <button
              type="button"
              onClick={() => setVisning("stepper")}
              className="v2-press v2-focus"
              style={{
                appearance: "none",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                minHeight: 44,
                padding: "0 12px",
                marginBottom: 12,
                border: `1px solid ${TL.hair}`,
                borderRadius: 12,
                background: "transparent",
                fontFamily: TL.font.sans,
                fontSize: 12.5,
                fontWeight: 600,
                color: TL.mute,
              }}
            >
              <Icon name="arrow-left" size={13} />
              Tilbake til hurtigføringen
            </button>
            <HullForing
              hull={aktivtHull}
              antallHull={hullData.length}
              ferdigeFor={antallFerdige}
              scoreHittil={scoreHittil}
              sisteVind={sisteVind}
              onSlag={leggTilSlag}
              onAngre={aktivtHull.slag.length > 0 ? angre : null}
              onNesteHull={nesteFraDetalj}
              onVisOversikt={() => setVisning("oversikt")}
              onVisSg={() => setVisning("sg")}
            />
          </>
        )}
        {steg === "foring" && visning === "oversikt" && (
          <HullOversikt
            hullData={hullData}
            aktivtHullIdx={aktivtHullIdx}
            onVelgHull={(idx) => {
              setAktivtHullIdx(idx);
              setVisning("detalj");
            }}
            onLukk={() => setVisning("detalj")}
            onAvslutt={antallFerdige > 0 ? () => setSteg("oppsummering") : null}
          />
        )}
        {steg === "foring" && visning === "sg" && (
          <SgPanel hullData={hullData} onLukk={() => setVisning("detalj")} />
        )}
      </div>

      {toast && (
        <div
          role="status"
          style={{
            position: "fixed",
            left: "50%",
            bottom: 96,
            transform: "translateX(-50%)",
            zIndex: 100,
            background: TL.text,
            color: TL.scene,
            padding: "12px 16px",
            borderRadius: 12,
            fontSize: 13,
            fontFamily: TL.font.sans,
            maxWidth: "min(90vw, 420px)",
          }}
        >
          {toast}
        </div>
      )}
      {/* Skjermleser-oppdateringer fra stepperen */}
      <div
        aria-live="polite"
        style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clipPath: "inset(50%)" }}
      >
        {srMelding}
      </div>
      <style>{`details > summary::-webkit-details-marker { display: none; }`}</style>
    </div>
  );
}
