"use client";

import React, { useState, useMemo } from "react";
import {
  beregnStyrkeprogram,
  beregnEstimert1RM,
  trengerNedtrapping,
  beregnMalbane,
  NEDTRAPPING_TERSKLER,
  MAL_RATIO_VG3,
  type StyrkeloftKode,
} from "@/lib/domain/fys/styrkeprogram";
import { formaterTall, formaterProsent } from "@/lib/format-tall";
import { ShieldAlert, Award, Calculator } from "lucide-react";

interface StyrkeProgramViewProps {
  initialLoft?: StyrkeloftKode;
  initialKroppsvekt?: number;
  initial1RM?: number;
}

export function StyrkeProgramView({
  initialLoft = "MARKLOFT",
  initialKroppsvekt = 74,
  initial1RM = 130,
}: StyrkeProgramViewProps) {
  const [valgtLoft, setValgtLoft] = useState<StyrkeloftKode>(initialLoft);
  const [kroppsvekt, setKroppsvekt] = useState<number>(initialKroppsvekt);
  const [ettRepMaks, setEttRepMaks] = useState<number>(initial1RM);
  const [visKalkulator, setVisKalkulator] = useState(false);
  const [kalkVekt, setKalkVekt] = useState<number>(100);
  const [kalkReps, setKalkReps] = useState<number>(5);
  const [valgtUke, setValgtUke] = useState<number>(1);

  // Baseløft-metadata
  const loftInfo: Record<StyrkeloftKode, { navn: string; enhet: string; beskrivelse: string }> = {
    MARKLOFT: {
      navn: "Trapbar Markløft",
      enhet: "kg",
      beskrivelse: "Hovedløft for hofteekstensjon, bakside lår og vertikal bakkekraft i svingen.",
    },
    BENKPRESS: {
      navn: "Benkpress",
      enhet: "kg",
      beskrivelse: "Overkroppsstyrke og stabilitet i skulderbue for presis køllekontroll.",
    },
    KNEBOY: {
      navn: "Knebøy",
      enhet: "kg",
      beskrivelse: "Bilateral beinstyrke og kjerneaktivering for rotasjonell balanse.",
    },
  };

  // Beregninger fra domenet
  const ukeProgram = useMemo(() => {
    return beregnStyrkeprogram({
      loft: valgtLoft,
      ettRepMaksKg: ettRepMaks > 0 ? ettRepMaks : null,
      kroppsvektKg: kroppsvekt > 0 ? kroppsvekt : null,
    });
  }, [valgtLoft, ettRepMaks, kroppsvekt]);

  const malbane = useMemo(() => {
    return beregnMalbane(valgtLoft, kroppsvekt, ettRepMaks, 3);
  }, [valgtLoft, kroppsvekt, ettRepMaks]);

  const erNedtrapping = useMemo(() => {
    return trengerNedtrapping(valgtLoft, ettRepMaks, kroppsvekt);
  }, [valgtLoft, ettRepMaks, kroppsvekt]);

  // Skiveberegning for 20 kg standard stang
  const beregnSkiver = (totalkg: number | null) => {
    if (!totalkg || totalkg < 20) return [];
    const vektPerSide = (totalkg - 20) / 2;
    const tilgjengeligeSkiver = [20, 10, 5, 2.5, 1.25];
    const skiver: number[] = [];
    let rest = vektPerSide;

    for (const skive of tilgjengeligeSkiver) {
      while (rest >= skive) {
        skiver.push(skive);
        rest = Math.round((rest - skive) * 100) / 100;
      }
    }
    return skiver;
  };

  const aktivUkeData = ukeProgram.find((u) => u.uke === valgtUke) || ukeProgram[0];

  return (
    <div className="space-y-6">
      {/* Toppseksjon med Baseløft-velger */}
      <div className="rounded-xl border border-[#DDD9D1] bg-white p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#DDD9D1] pb-4">
          <div>
            <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-black/50">
              FYS-søylen · WANG Toppidrett
            </span>
            <h2 className="font-sans text-xl font-bold text-[#141413]">
              6-ukers Styrkeprogram
            </h2>
            <p className="font-sans text-xs text-black/60">
              Presis bølgebelastning tilpasset golferens 1RM og kroppsvekt
            </p>
          </div>

          <div className="flex rounded-lg border border-[#DDD9D1] bg-[#FAF8F3] p-1">
            {(["MARKLOFT", "BENKPRESS", "KNEBOY"] as StyrkeloftKode[]).map((kode) => (
              <button
                key={kode}
                type="button"
                onClick={() => {
                  setValgtLoft(kode);
                  if (kode === "MARKLOFT") setEttRepMaks(130);
                  if (kode === "BENKPRESS") setEttRepMaks(85);
                  if (kode === "KNEBOY") setEttRepMaks(110);
                }}
                className={`rounded-md px-3 py-1.5 font-sans text-xs font-semibold transition-all ${
                  valgtLoft === kode
                    ? "bg-[#141413] text-white shadow-xs"
                    : "text-black/70 hover:text-black"
                }`}
              >
                {loftInfo[kode].navn}
              </button>
            ))}
          </div>
        </div>

        {/* Parametere & 1RM-kalkulator */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-lg border border-[#DDD9D1] bg-[#FAF8F3] p-3">
            <label className="block font-sans text-[11px] font-semibold text-black/60 mb-1">
              Kroppsvekt (kg)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="40"
                max="150"
                step="0.5"
                value={kroppsvekt}
                onChange={(e) => setKroppsvekt(parseFloat(e.target.value) || 0)}
                className="w-full rounded border border-[#DDD9D1] bg-white px-3 py-1.5 font-mono text-sm font-bold text-[#141413] focus:border-[#141413] focus:outline-none"
              />
              <span className="font-mono text-xs text-black/50">kg</span>
            </div>
          </div>

          <div className="rounded-lg border border-[#DDD9D1] bg-[#FAF8F3] p-3">
            <div className="flex items-center justify-between mb-1">
              <label className="font-sans text-[11px] font-semibold text-black/60">
                1RM Testresultat (kg)
              </label>
              <button
                type="button"
                onClick={() => setVisKalkulator(!visKalkulator)}
                className="flex items-center gap-1 font-sans text-[10px] font-bold text-[#9B2415] hover:underline"
              >
                <Calculator className="h-3 w-3" />
                <span>{visKalkulator ? "Skjul estimat" : "Beregn fra reps"}</span>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="20"
                max="300"
                step="2.5"
                value={ettRepMaks}
                onChange={(e) => setEttRepMaks(parseFloat(e.target.value) || 0)}
                className="w-full rounded border border-[#DDD9D1] bg-white px-3 py-1.5 font-mono text-sm font-bold text-[#141413] focus:border-[#141413] focus:outline-none"
              />
              <span className="font-mono text-xs text-black/50">kg</span>
            </div>
          </div>

          <div className="rounded-lg border border-[#DDD9D1] bg-[#FAF8F3] p-3 flex flex-col justify-between">
            <span className="font-sans text-[11px] font-semibold text-black/60">
              Relativ styrke (1RM / KV)
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-lg font-bold text-[#141413]">
                {kroppsvekt > 0 ? formaterTall(ettRepMaks / kroppsvekt, 2) : "—"}x
              </span>
              <span className="font-sans text-[11px] text-black/50">
                Mål VG3: {formaterTall(MAL_RATIO_VG3[valgtLoft], 1)}x
              </span>
            </div>
          </div>
        </div>

        {/* Ekspanderbar submaksimal 1RM-kalkulator */}
        {visKalkulator && (
          <div className="mt-3 rounded-lg border border-[#DDD9D1] bg-[#F1EEE8] p-3">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="h-4 w-4 text-[#9B2415]" />
              <span className="font-sans text-xs font-bold text-[#141413]">
                Submaksimal 1RM-beregning (Epley-formel for juniorer)
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div>
                <label className="block font-sans text-[10px] text-black/60 mb-1">
                  Vekt løftet (kg)
                </label>
                <input
                  type="number"
                  step="2.5"
                  value={kalkVekt}
                  onChange={(e) => setKalkVekt(parseFloat(e.target.value) || 0)}
                  className="w-full rounded border border-[#DDD9D1] bg-white px-2 py-1 font-mono text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block font-sans text-[10px] text-black/60 mb-1">
                  Antall repetisjoner (reps)
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={kalkReps}
                  onChange={(e) => setKalkReps(parseInt(e.target.value, 10) || 1)}
                  className="w-full rounded border border-[#DDD9D1] bg-white px-2 py-1 font-mono text-xs font-semibold"
                />
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => {
                    const est = beregnEstimert1RM(kalkVekt, kalkReps);
                    setEttRepMaks(est);
                    setVisKalkulator(false);
                  }}
                  className="w-full rounded bg-[#141413] px-3 py-1.5 font-sans text-xs font-semibold text-white hover:bg-black"
                >
                  Bruk estimat ({formaterTall(beregnEstimert1RM(kalkVekt, kalkReps), 1)} kg)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Varsel ved volumbygging / terskel under 1.0 / 0.8 */}
        {erNedtrapping && (
          <div className="mt-4 flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50/70 p-3">
            <ShieldAlert className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-sans font-bold text-amber-900">
                Volumbygging aktivert (1RM under {NEDTRAPPING_TERSKLER[valgtLoft]}x kroppsvekt)
              </span>
              <p className="font-sans text-amber-800 mt-0.5">
                Uke 5–6 erstatter tung bølgebelastning med kontrollerte 3×5-sett. Dette sikrer optimal
                sene- og muskeladapsjon før submaksimal toppbelastning.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* WANG Toppidrett Målbanekort */}
      {malbane && (
        <div className="rounded-xl border border-[#DDD9D1] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#DDD9D1] pb-3">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-[#9B2415]" />
              <h3 className="font-sans text-sm font-bold text-[#141413]">
                Målbane mot WANG VG3-standard
              </h3>
            </div>
            <span className="font-mono text-xs font-bold text-black/60">
              {malbane.arIgjen} år igjen til eksamen
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-lg bg-[#FAF8F3] p-3 border border-[#DDD9D1]">
              <span className="block font-sans text-[10px] text-black/50 uppercase">Nåværende</span>
              <span className="font-mono text-base font-bold text-[#141413]">
                {formaterTall(malbane.naaKg, 1)} kg
              </span>
            </div>

            <div className="rounded-lg bg-[#FAF8F3] p-3 border border-[#DDD9D1]">
              <span className="block font-sans text-[10px] text-black/50 uppercase">WANG VG3 Mål</span>
              <span className="font-mono text-base font-bold text-emerald-800">
                {formaterTall(malbane.malKg, 1)} kg ({malbane.malRatio}x)
              </span>
            </div>

            <div className="rounded-lg bg-[#FAF8F3] p-3 border border-[#DDD9D1]">
              <span className="block font-sans text-[10px] text-black/50 uppercase">Gjenstående gap</span>
              <span className="font-mono text-base font-bold text-[#9B2415]">
                {malbane.gapKg > 0 ? `+${formaterTall(malbane.gapKg, 1)} kg` : "Nådd"}
              </span>
            </div>

            <div className="rounded-lg bg-[#FAF8F3] p-3 border border-[#DDD9D1]">
              <span className="block font-sans text-[10px] text-black/50 uppercase">Årlig progresjon</span>
              <span className="font-mono text-base font-bold text-black/80">
                +{formaterTall(malbane.arligFramgangKg, 1)} kg/år
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 6-ukers belastningsmatrise */}
      <div className="rounded-xl border border-[#DDD9D1] bg-white p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#DDD9D1] pb-4">
          <div>
            <h3 className="font-sans text-base font-bold text-[#141413]">
              Ukeprogram & Bølgebelastning
            </h3>
            <p className="font-sans text-xs text-black/60">
              Velg uke for å se nøyaktig settstruktur, prosent og skiveopplasting
            </p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {ukeProgram.map((u) => (
              <button
                key={u.uke}
                type="button"
                onClick={() => setValgtUke(u.uke)}
                className={`rounded-lg px-3 py-1.5 font-mono text-xs font-bold transition-all ${
                  valgtUke === u.uke
                    ? "bg-[#141413] text-white"
                    : "bg-[#FAF8F3] border border-[#DDD9D1] text-black/70 hover:bg-[#F1EEE8]"
                }`}
              >
                Uke {u.uke}
              </button>
            ))}
          </div>
        </div>

        {/* Detaljvisning av valgt uke */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#141413] text-white px-2.5 py-0.5 font-mono text-xs font-bold">
                Uke {aktivUkeData.uke}
              </span>
              <span className="font-sans text-xs font-semibold text-black/70">
                {aktivUkeData.periode === 1
                  ? "Periode 1 · Grunnlag & tilvenning"
                  : aktivUkeData.periode === 2
                  ? "Periode 2 · Oppbygging"
                  : aktivUkeData.erNedtrapping
                  ? "Periode 3 · Volumbygging (3×5)"
                  : "Periode 3 · Topping & Bølgebelastning (Wave)"}
              </span>
            </div>
            <span className="font-sans text-[11px] text-black/50">
              {aktivUkeData.sett.length} sett totalt
            </span>
          </div>

          {/* Tabell over sett */}
          <div className="overflow-x-auto rounded-lg border border-[#DDD9D1]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#DDD9D1] bg-[#FAF8F3] font-sans text-[11px] font-bold uppercase tracking-wider text-black/60">
                  <th className="py-2.5 px-4">Sett</th>
                  <th className="py-2.5 px-4">Reps</th>
                  <th className="py-2.5 px-4">Belastning %</th>
                  <th className="py-2.5 px-4">Vekt (kg)</th>
                  <th className="py-2.5 px-4">Skiver per side (20 kg stang)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDD9D1] font-mono text-xs">
                {aktivUkeData.sett.map((s) => {
                  const skiver = beregnSkiver(s.belastningKg);
                  return (
                    <tr key={s.settNr} className="hover:bg-[#FAF8F3]/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-[#141413]">Sett {s.settNr}</td>
                      <td className="py-3 px-4">{s.reps} reps</td>
                      <td className="py-3 px-4 text-black/70">{formaterProsent(s.belastningPst)}</td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-[#9B2415]">
                          {s.belastningKg ? `${formaterTall(s.belastningKg, 1)} kg` : "—"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {skiver.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {skiver.map((sk, idx) => (
                              <span
                                key={idx}
                                className="rounded bg-[#FAF8F3] border border-[#DDD9D1] px-1.5 py-0.5 text-[10px] font-bold text-[#141413]"
                              >
                                {sk} kg
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-black/40 text-[11px] font-sans">Kun stang (20 kg)</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
