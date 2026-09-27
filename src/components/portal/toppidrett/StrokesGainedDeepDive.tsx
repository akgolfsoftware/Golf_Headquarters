"use client";

import React, { useState } from "react";
import { Target } from "lucide-react";

export type SgKategori = "OTT" | "APP" | "ARG" | "PUTT";

export interface SgKategoriData {
  id: SgKategori;
  navn: string;
  verdi: number; // F.eks. +0.4 eller -0.8
  forklaring: string;
  detaljer: { etikett: string; verdi: string; status?: "ok" | "advarsel" | "lekkasje" }[];
}

export interface Tiger5Feil {
  id: string;
  beskrivelse: string;
  antall: number;
  maksgrense: number;
}

export interface StrokesGainedDeepDiveProps {
  className?: string;
}

export function StrokesGainedDeepDive({ className = "" }: StrokesGainedDeepDiveProps) {
  const [valgtKat, setValgtKat] = useState<SgKategori>("APP");

  const kategorier: SgKategoriData[] = [
    {
      id: "OTT",
      navn: "Utslag (OTT)",
      verdi: 0.4,
      forklaring: "Gevinst fra tee. God lengde og kontrollerte misser.",
      detaljer: [
        { etikett: "Snitt carry driver", verdi: "254 m", status: "ok" },
        { etikett: "Fairway-treff", verdi: "64 %", status: "ok" },
        { etikett: "Straffeslag fra tee", verdi: "0", status: "ok" },
        { etikett: "Venstre / Høyre miss", verdi: "12 % / 24 %", status: "ok" },
      ],
    },
    {
      id: "APP",
      navn: "Innspill (APP)",
      verdi: -0.8,
      forklaring: "Hovedlekkasje. Tap av slag på 100–150 meters avstand.",
      detaljer: [
        { etikett: "Innspill 100–150 m", verdi: "−0,52 slag", status: "lekkasje" },
        { etikett: "Innspill 150–200 m", verdi: "−0,28 slag", status: "advarsel" },
        { etikett: "Green in Regulation (GIR)", verdi: "55 %", status: "advarsel" },
        { etikett: "Proximity til flagg", verdi: "9,8 m", status: "advarsel" },
      ],
    },
    {
      id: "ARG",
      navn: "Nærspill (ARG)",
      verdi: 0.2,
      forklaring: "Solid opp-og-ned rate fra fairway og rough rundt green.",
      detaljer: [
        { etikett: "Chip fra fringe", verdi: "68 % up-and-down", status: "ok" },
        { etikett: "Pitch 30–50 m", verdi: "52 % up-and-down", status: "ok" },
        { etikett: "Bunkerslag", verdi: "40 % up-and-down", status: "advarsel" },
        { etikett: "Lobbslag over hinder", verdi: "50 %", status: "ok" },
      ],
    },
    {
      id: "PUTT",
      navn: "Putting (PUTT)",
      verdi: -0.1,
      forklaring: "Nær nøytral. Sterk innenfor 5 fot, tap på lag-putter 25–40 fot.",
      detaljer: [
        { etikett: "0–3 fot (1 m)", verdi: "98 % (PGA: 99 %)", status: "ok" },
        { etikett: "3–5 fot (1,5 m)", verdi: "82 % (PGA: 81 %)", status: "ok" },
        { etikett: "5–10 fot (2,5 m)", verdi: "55 % (PGA: 57 %)", status: "ok" },
        { etikett: "10–15 fot (4 m)", verdi: "32 % (PGA: 34 %)", status: "ok" },
        { etikett: "15–25 fot (6 m)", verdi: "18 % (PGA: 20 %)", status: "advarsel" },
        { etikett: "25–40 fot (10 m)", verdi: "4 % (PGA: 8 %)", status: "lekkasje" },
        { etikett: "40+ fot (15 m)", verdi: "0 % (PGA: 3 %)", status: "ok" },
      ],
    },
  ];

  const tiger5Data: Tiger5Feil[] = [
    { id: "par5", beskrivelse: "Bogey eller verre på Par 5", antall: 1, maksgrense: 0 },
    { id: "dbl", beskrivelse: "Dobbelbogey eller verre", antall: 0, maksgrense: 0 },
    { id: "3putt", beskrivelse: "3-putter på runden", antall: 2, maksgrense: 1 },
    { id: "bunker", beskrivelse: "Blown bunker (ikke ut på 1)", antall: 0, maksgrense: 0 },
    { id: "fairway", beskrivelse: "Bogey med 9-jern eller kortere", antall: 1, maksgrense: 0 },
  ];

  // Finn svakeste kategori for automatisk rust-markering
  const minVerdi = Math.min(...kategorier.map((k) => k.verdi));
  const aktivKategori = kategorier.find((k) => k.id === valgtKat) || kategorier[0];
  const tiger5Totalt = tiger5Data.reduce((acc, t) => acc + t.antall, 0);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 4 Strokes Gained faner / fliser */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-black/50">
            Strokes Gained Fordeling · vs Kategori D Norm
          </span>
          <span className="font-mono text-xs text-black/50">Siste 10 runder</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {kategorier.map((kat) => {
            const erValgt = kat.id === valgtKat;
            const erLekkasje = kat.verdi === minVerdi;

            return (
              <button
                key={kat.id}
                type="button"
                onClick={() => setValgtKat(kat.id)}
                className={`flex flex-col justify-between p-4 rounded-lg border text-left transition-all relative ${
                  erValgt
                    ? "ring-2 ring-[#141413] bg-white border-transparent shadow-sm"
                    : "bg-[#FAF8F3] hover:bg-white border-[#DDD9D1]"
                }`}
              >
                {erLekkasje && (
                  <span className="absolute top-2 right-2 rounded-full bg-[#9B2415] px-1.5 py-0.5 font-sans text-[9px] font-bold text-white uppercase tracking-wider">
                    Lekkasje
                  </span>
                )}
                <div>
                  <span className="font-sans text-xs font-semibold text-black/60">
                    {kat.navn}
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span
                    className={`font-mono text-2xl font-bold ${
                      kat.verdi < 0
                        ? "text-[#9B2415]"
                        : kat.verdi > 0
                        ? "text-emerald-700"
                        : "text-[#141413]"
                    }`}
                  >
                    {kat.verdi > 0 ? `+${kat.verdi}` : kat.verdi.toString().replace("-", "−")}
                  </span>
                  <span className="font-sans text-xs text-black/40">SG</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detaljvisning for valgt kategori */}
      <div className="rounded-lg border border-[#DDD9D1] bg-white p-5 sm:p-6 shadow-xs">
        <div className="border-b border-[#DDD9D1] pb-3 mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-sans text-base font-bold text-[#141413]">
              Dypdykk: {aktivKategori.navn}
            </h3>
            <p className="font-sans text-xs text-black/60 mt-0.5">
              {aktivKategori.forklaring}
            </p>
          </div>
          <span
            className={`font-mono text-lg font-bold ${
              aktivKategori.verdi < 0 ? "text-[#9B2415]" : "text-emerald-700"
            }`}
          >
            {aktivKategori.verdi > 0 ? `+${aktivKategori.verdi}` : aktivKategori.verdi.toString().replace("-", "−")} SG
          </span>
        </div>

        {/* Metrikk-rader */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {aktivKategori.detaljer.map((det, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                det.status === "lekkasje"
                  ? "border-[#9B2415]/30 bg-[#9B2415]/5"
                  : "border-[#DDD9D1] bg-[#FAF8F3]"
              }`}
            >
              <span className="font-sans text-xs text-black/70">{det.etikett}</span>
              <span
                className={`font-mono text-xs font-bold ${
                  det.status === "lekkasje"
                    ? "text-[#9B2415]"
                    : det.status === "advarsel"
                    ? "text-amber-700"
                    : "text-[#141413]"
                }`}
              >
                {det.verdi}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tiger 5 Taps- og Disiplinkort */}
      <div className="rounded-lg border border-[#DDD9D1] bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#DDD9D1] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-[#9B2415]" />
            <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-[#141413]">
              Tiger 5 · Disiplinindikator
            </h3>
          </div>
          <span className="font-mono text-xs font-semibold text-black/60">
            Totalt: <strong className={tiger5Totalt > 2 ? "text-[#9B2415]" : "text-emerald-700"}>{tiger5Totalt}</strong> (Maks 2)
          </span>
        </div>

        <div className="space-y-2">
          {tiger5Data.map((t) => {
            const erOversteget = t.antall > t.maksgrense;
            return (
              <div
                key={t.id}
                className="flex items-center justify-between py-2 border-b border-black/[0.04] last:border-none"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      erOversteget ? "bg-[#9B2415]" : "bg-emerald-600"
                    }`}
                  />
                  <span className="font-sans text-xs text-black/80">{t.beskrivelse}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-[#141413]">
                    {t.antall}
                  </span>
                  <span className="font-mono text-[10px] text-black/40">
                    (mål: ≤{t.maksgrense})
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
