"use client";

import React, { useState } from "react";
import { formaterTall } from "@/lib/format-tall";

export interface KategoriDefinisjon {
  id: string; // f.eks. "D"
  navn: string;
  snittScoreFra: number;
  snittScoreTil: number;
  girProsent: number;
  driverCarryMeter: number;
  putterPerRunde: number;
  upAndDownProsent: number;
  beskrivelse: string;
}

export function KategoriOversikt({
  spillerScore = 73.4,
  className = "",
}: {
  spillerScore?: number;
  className?: string;
}) {
  const [valgtScore, setValgtScore] = useState<number>(spillerScore);

  const kategorier: KategoriDefinisjon[] = [
    { id: "A", navn: "Kategori A", snittScoreFra: 64, snittScoreTil: 67.9, girProsent: 72, driverCarryMeter: 285, putterPerRunde: 28.2, upAndDownProsent: 68, beskrivelse: "Internasjonalt tour-nivå (DP World Tour / PGA Tour)." },
    { id: "B", navn: "Kategori B", snittScoreFra: 68, snittScoreTil: 69.9, girProsent: 68, driverCarryMeter: 275, putterPerRunde: 28.8, upAndDownProsent: 64, beskrivelse: "Challenge Tour / Nordic League toppspiller." },
    { id: "C", navn: "Kategori C", snittScoreFra: 70, snittScoreTil: 71.9, girProsent: 64, driverCarryMeter: 265, putterPerRunde: 29.4, upAndDownProsent: 60, beskrivelse: "Norgescup topp / Elite amatør." },
    { id: "D", navn: "Kategori D", snittScoreFra: 72, snittScoreTil: 73.9, girProsent: 60, driverCarryMeter: 255, putterPerRunde: 30.1, upAndDownProsent: 56, beskrivelse: "Scratch-spiller / Toppidrett junior." },
    { id: "E", navn: "Kategori E", snittScoreFra: 74, snittScoreTil: 76.9, girProsent: 54, driverCarryMeter: 245, putterPerRunde: 31.0, upAndDownProsent: 52, beskrivelse: "Satsende junior / HCP 1–3." },
    { id: "F", navn: "Kategori F", snittScoreFra: 77, snittScoreTil: 79.9, girProsent: 48, driverCarryMeter: 235, putterPerRunde: 31.8, upAndDownProsent: 46, beskrivelse: "Etablert turneringsspiller / HCP 4–6." },
    { id: "G", navn: "Kategori G", snittScoreFra: 80, snittScoreTil: 83.9, girProsent: 42, driverCarryMeter: 225, putterPerRunde: 32.5, upAndDownProsent: 40, beskrivelse: "Klubbspiller med ambisjon / HCP 7–10." },
    { id: "H", navn: "Kategori H", snittScoreFra: 84, snittScoreTil: 88.9, girProsent: 34, driverCarryMeter: 210, putterPerRunde: 33.5, upAndDownProsent: 34, beskrivelse: "Aktiv klubbspiller / HCP 11–15." },
    { id: "I", navn: "Kategori I", snittScoreFra: 89, snittScoreTil: 93.9, girProsent: 26, driverCarryMeter: 195, putterPerRunde: 34.5, upAndDownProsent: 28, beskrivelse: "HCP 16–20." },
    { id: "J", navn: "Kategori J", snittScoreFra: 94, snittScoreTil: 99.9, girProsent: 18, driverCarryMeter: 180, putterPerRunde: 36.0, upAndDownProsent: 22, beskrivelse: "HCP 21–28." },
    { id: "K", navn: "Kategori K", snittScoreFra: 100, snittScoreTil: 110, girProsent: 10, driverCarryMeter: 160, putterPerRunde: 38.0, upAndDownProsent: 15, beskrivelse: "Nybegynner / HCP 29–54." },
  ];

  // Finn gjeldende kategori basert på slider
  const aktivKat =
    kategorier.find((k) => valgtScore >= k.snittScoreFra && valgtScore <= k.snittScoreTil) ||
    kategorier[3]; // Fallback til D

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Slider og statusboks */}
      <div className="rounded-lg border border-[#DDD9D1] bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#DDD9D1] pb-4">
          <div>
            <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-black/50">
              Spillerkategori A–K · Basert på bruttoscore
            </span>
            <h2 className="font-sans text-xl font-bold tracking-tight text-[#141413]">
              Ferdighetskrav og Nivåtrapp
            </h2>
            <p className="font-sans text-xs text-black/60">
              Trekk i glidebryteren for å utforske krav og normer for de ulike nivåene
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-sans text-xs text-black/50">Gjeldende kategori:</span>
            <span className="inline-flex items-center rounded-lg bg-[#141413] px-3.5 py-1.5 font-mono text-sm font-bold text-white">
              {aktivKat.navn}
            </span>
          </div>
        </div>

        {/* Interaktiv glidebryter */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-black/50">Score: 64 (Kat A)</span>
            <span className="font-bold text-base text-[#141413] bg-[#F1EEE8] px-3 py-1 rounded-md">
              {formaterTall(valgtScore, 1, true)} slag
            </span>
            <span className="text-black/50">Score: 105+ (Kat K)</span>
          </div>

          <input
            type="range"
            min="64"
            max="105"
            step="0.5"
            value={valgtScore}
            onChange={(e) => setValgtScore(parseFloat(e.target.value))}
            className="w-full accent-[#141413] cursor-pointer"
          />
        </div>

        {/* Nøkkeltall for valgt kategori */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-lg bg-[#FAF8F3] p-3 border border-[#DDD9D1]">
            <span className="font-sans text-[10px] uppercase font-semibold text-black/50">
              GIR (Green-treff)
            </span>
            <p className="font-mono text-lg font-bold text-[#141413] mt-0.5">
              {aktivKat.girProsent} %
            </p>
          </div>
          <div className="rounded-lg bg-[#FAF8F3] p-3 border border-[#DDD9D1]">
            <span className="font-sans text-[10px] uppercase font-semibold text-black/50">
              Driver Carry
            </span>
            <p className="font-mono text-lg font-bold text-[#141413] mt-0.5">
              {aktivKat.driverCarryMeter} m
            </p>
          </div>
          <div className="rounded-lg bg-[#FAF8F3] p-3 border border-[#DDD9D1]">
            <span className="font-sans text-[10px] uppercase font-semibold text-black/50">
              Putter per runde
            </span>
            <p className="font-mono text-lg font-bold text-[#141413] mt-0.5">
              {formaterTall(aktivKat.putterPerRunde, 1, true)}
            </p>
          </div>
          <div className="rounded-lg bg-[#FAF8F3] p-3 border border-[#DDD9D1]">
            <span className="font-sans text-[10px] uppercase font-semibold text-black/50">
              Up-and-down %
            </span>
            <p className="font-mono text-lg font-bold text-[#141413] mt-0.5">
              {aktivKat.upAndDownProsent} %
            </p>
          </div>
        </div>
      </div>

      {/* Fullstendig A–K referansetabell */}
      <div className="rounded-lg border border-[#DDD9D1] bg-white overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#DDD9D1] bg-[#FAF8F3]">
          <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-black/70">
            Komplett oversikt (Kategori A til K)
          </h3>
        </div>

        <div className="divide-y divide-black/[0.06] overflow-x-auto">
          {kategorier.map((kat) => {
            const erAktiv = kat.id === aktivKat.id;
            return (
              <div
                key={kat.id}
                className={`p-3.5 flex items-center justify-between transition-colors ${
                  erAktiv ? "bg-[#141413]/[0.04]" : "hover:bg-black/[0.02]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-md font-mono text-xs font-bold ${
                      erAktiv
                        ? "bg-[#141413] text-white"
                        : "bg-[#F1EEE8] text-[#141413]"
                    }`}
                  >
                    {kat.id}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-sans text-xs font-bold text-[#141413]">
                        {kat.navn}
                      </span>
                      {erAktiv && (
                        <span className="rounded-full bg-[#9B2415] px-1.5 py-0.2 font-sans text-[9px] font-bold text-white uppercase">
                          DU
                        </span>
                      )}
                    </div>
                    <p className="font-sans text-[11px] text-black/50">
                      {kat.beskrivelse}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-right">
                  <div>
                    <span className="font-sans text-[10px] text-black/40 block">SNITTSCORE</span>
                    <span className="font-mono text-xs font-bold text-[#141413]">
                      {kat.snittScoreFra}–{kat.snittScoreTil}
                    </span>
                  </div>
                  <div className="hidden sm:block">
                    <span className="font-sans text-[10px] text-black/40 block">GIR %</span>
                    <span className="font-mono text-xs text-[#141413]">
                      {kat.girProsent} %
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
