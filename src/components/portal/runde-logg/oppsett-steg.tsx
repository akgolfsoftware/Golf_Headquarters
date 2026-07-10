"use client";

/**
 * Oppsett-steget for slag-for-slag-føring: bane · 18/9 hull ·
 * turnering/trening · hull-tabell (prefylt fra baneregisteret via
 * hentBaneHull, ellers manuell par/lengde) · dato (kun etterpå-modus).
 */

import { useEffect, useState, useTransition } from "react";
import { hentBaneHull } from "@/app/portal/(legacy)/mal/runder/logg/actions";
import { T, Caps, Kort, Icon, Velger, ValgKort, PillTabs } from "@/components/v2";

export type OppsettHull = { holeNumber: number; par: number; lengdeMeter: number };

export type OppsettVerdi = {
  courseId: string;
  courseNavn: string;
  roundType: "turnering" | "trening";
  hullValg: "18" | "ut" | "inn";
  playedAt: string;
  hull: OppsettHull[];
};

/** Standardlengder per par når baneregisteret mangler data (redigerbare). */
const STANDARD_LENGDE: Record<number, number> = { 3: 150, 4: 350, 5: 480 };

function standardHull(hullValg: "18" | "ut" | "inn"): OppsettHull[] {
  const start = hullValg === "inn" ? 10 : 1;
  const antall = hullValg === "18" ? 18 : 9;
  return Array.from({ length: antall }, (_, i) => ({
    holeNumber: start + i,
    par: 4,
    lengdeMeter: STANDARD_LENGDE[4],
  }));
}

type OppsettStegProps = {
  modus: "live" | "etterpaa";
  baner: Array<{ id: string; name: string }>;
  /** Gjenopprettet kladd-oppsett (etter «Fortsett»). */
  initial?: Partial<OppsettVerdi>;
  onStart: (verdi: OppsettVerdi) => void;
};

export function OppsettSteg({ modus, baner, initial, onStart }: OppsettStegProps) {
  const [courseId, setCourseId] = useState<string>(initial?.courseId ?? baner[0]?.id ?? "");
  const [roundType, setRoundType] = useState<"turnering" | "trening">(initial?.roundType ?? "turnering");
  const [hullValg, setHullValg] = useState<"18" | "ut" | "inn">(initial?.hullValg ?? "18");
  const [playedAt, setPlayedAt] = useState<string>(
    initial?.playedAt ?? new Date().toISOString().slice(0, 10),
  );
  const [hull, setHull] = useState<OppsettHull[]>(initial?.hull ?? standardHull("18"));
  const [fraRegister, setFraRegister] = useState(false);
  const [henter, startHenting] = useTransition();

  // Hent hull-oppsett fra baneregisteret når bane/hullvalg endres.
  useEffect(() => {
    if (!courseId) return;
    startHenting(async () => {
      try {
        const registrert = await hentBaneHull(courseId);
        const start = hullValg === "inn" ? 10 : 1;
        const antall = hullValg === "18" ? 18 : 9;
        const basis = standardHull(hullValg);
        if (registrert.length === 0) {
          setHull(basis);
          setFraRegister(false);
          return;
        }
        const perHull = new Map(registrert.map((h) => [h.holeNumber, h]));
        setHull(
          Array.from({ length: antall }, (_, i) => {
            const nr = start + i;
            const reg = perHull.get(nr);
            const par = reg?.par ?? 4;
            return {
              holeNumber: nr,
              par,
              lengdeMeter: reg?.lengdeMeter ?? STANDARD_LENGDE[par] ?? 350,
            };
          }),
        );
        setFraRegister(true);
      } catch {
        setHull(standardHull(hullValg));
        setFraRegister(false);
      }
    });
  }, [courseId, hullValg]);

  const settPar = (idx: number, par: number) =>
    setHull((h) => h.map((x, i) => (i === idx ? { ...x, par } : x)));
  const settLengde = (idx: number, lengde: number) =>
    setHull((h) => h.map((x, i) => (i === idx ? { ...x, lengdeMeter: lengde } : x)));

  const gyldig =
    courseId !== "" && hull.every((h) => h.lengdeMeter >= 40 && h.lengdeMeter <= 700);
  const courseNavn = baner.find((b) => b.id === courseId)?.name ?? "";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 22, color: T.fg, lineHeight: 1.1 }}>
          {modus === "live" ? "Start runde" : "Før runde i etterkant"}
        </div>
        <div style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, marginTop: 3 }}>
          Slag for slag — full Strokes Gained
        </div>
      </div>

      <Velger
        label="Bane"
        options={baner.map((b) => ({ value: b.id, label: b.name }))}
        value={courseId}
        onChange={setCourseId}
      />

      {modus === "etterpaa" && (
        <div>
          <Caps style={{ marginBottom: 6 }}>Dato spilt</Caps>
          <input
            type="date"
            value={playedAt}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setPlayedAt(e.target.value)}
            style={{
              width: "100%",
              height: 44,
              borderRadius: 11,
              padding: "0 12px",
              background: T.panel2,
              border: `1px solid ${T.borderS}`,
              color: T.fg,
              fontFamily: T.mono,
              fontSize: 13,
              outline: "none",
              colorScheme: "dark",
            }}
          />
        </div>
      )}

      <PillTabs
        tabs={[
          { id: "18", l: "18 hull" },
          { id: "ut", l: "9 hull ut" },
          { id: "inn", l: "9 hull inn" },
        ]}
        value={hullValg}
        onChange={(v) => setHullValg(v as "18" | "ut" | "inn")}
      />

      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}>
          <ValgKort
            tittel="Turnering"
            sub="teller mot turneringsstatistikken"
            valgt={roundType === "turnering"}
            onClick={() => setRoundType("turnering")}
          />
        </div>
        <div style={{ flex: 1 }}>
          <ValgKort
            tittel="Trening"
            sub="treningsrunde — egen trend"
            valgt={roundType === "trening"}
            onClick={() => setRoundType("trening")}
          />
        </div>
      </div>

      <Kort eyebrow="Hull — par og lengde" pad="14px 12px">
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "36px 1fr 96px",
              gap: 8,
              padding: "4px 10px",
              fontFamily: T.mono,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: T.mut,
            }}
          >
            <span>Hull</span>
            <span>Par</span>
            <span>Lengde</span>
          </div>
          {hull.map((h, idx) => (
            <div
              key={h.holeNumber}
              className="v2-row-h"
              style={{
                display: "grid",
                gridTemplateColumns: "36px 1fr 96px",
                gap: 8,
                alignItems: "center",
                padding: "6px 10px",
                borderRadius: 10,
              }}
            >
              <span style={{ fontFamily: T.mono, fontSize: 12, fontWeight: 700, color: T.fg2 }}>
                {h.holeNumber}
              </span>
              <div style={{ display: "flex", gap: 4 }}>
                {[3, 4, 5].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => settPar(idx, p)}
                    className="v2-press v2-focus"
                    style={{
                      appearance: "none",
                      cursor: "pointer",
                      width: 34,
                      padding: "6px 0",
                      textAlign: "center",
                      borderRadius: 8,
                      fontFamily: T.mono,
                      fontSize: 11.5,
                      fontWeight: 700,
                      background: p === h.par ? T.panel3 : "transparent",
                      color: p === h.par ? T.fg : T.mut,
                      border: `1px solid ${p === h.par ? T.borderS : T.border}`,
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <div style={{ position: "relative" }}>
                <input
                  inputMode="numeric"
                  value={h.lengdeMeter || ""}
                  onChange={(e) => settLengde(idx, Number(e.target.value.replace(/\D/g, "")) || 0)}
                  aria-label={`Lengde hull ${h.holeNumber} i meter`}
                  style={{
                    width: "100%",
                    height: 34,
                    borderRadius: 8,
                    padding: "0 26px 0 10px",
                    background: T.panel2,
                    border: `1px solid ${T.border}`,
                    color: T.fg,
                    fontFamily: T.mono,
                    fontSize: 12.5,
                    outline: "none",
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontFamily: T.mono,
                    fontSize: 10,
                    color: T.mut,
                  }}
                >
                  m
                </span>
              </div>
            </div>
          ))}
          <div style={{ fontFamily: T.ui, fontSize: 10.5, color: T.mut, padding: "6px 10px" }}>
            {henter
              ? "Henter hull fra baneregisteret…"
              : fraRegister
                ? "Prefylt fra baneregisteret — juster ved behov."
                : "Banen mangler hulldata i registeret — sett par og lengde selv."}
          </div>
        </div>
      </Kort>

      <button
        type="button"
        disabled={!gyldig}
        onClick={() =>
          onStart({ courseId, courseNavn, roundType, hullValg, playedAt, hull })
        }
        className="v2-press v2-focus"
        style={{
          appearance: "none",
          cursor: gyldig ? "pointer" : "not-allowed",
          width: "100%",
          height: 54,
          borderRadius: 16,
          border: "none",
          background: gyldig ? T.lime : T.panel3,
          color: gyldig ? T.onLime : T.mut,
          fontFamily: T.disp,
          fontSize: 16,
          fontWeight: 700,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          boxShadow: gyldig ? "0 10px 34px rgba(209,248,67,0.28)" : "none",
        }}
      >
        Til hull {hull[0]?.holeNumber ?? 1}
        <Icon name="arrow-right" size={16} />
      </button>
    </div>
  );
}
