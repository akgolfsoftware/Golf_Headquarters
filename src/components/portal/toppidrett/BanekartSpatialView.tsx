"use client";

import React, { useState } from "react";
import { Flag, ZoomIn, Info } from "lucide-react";

export type SoneId = "TEE" | "APP_200" | "APP_150" | "APP_100" | "ARG" | "GREEN";

export interface SoneData {
  id: SoneId;
  navn: string;
  avstand: string;
  sg: number;
  planlagtTreningTimer: number;
  gjennomfortTreningTimer: number;
  status: "gevinst" | "lekkasje" | "noytral";
  detaljer: string;
}

export function BanekartSpatialView({ className = "" }: { className?: string }) {
  const [valgtSoneId, setValgtSoneId] = useState<SoneId>("APP_150");
  const [visGreenZoom, setVisGreenZoom] = useState(false);

  const soner: SoneData[] = [
    {
      id: "TEE",
      navn: "Tee Total (Utslag)",
      avstand: "220–280 m",
      sg: 0.4,
      planlagtTreningTimer: 12,
      gjennomfortTreningTimer: 14,
      status: "gevinst",
      detaljer: "God lengde og god spredningskontroll. Ligger +0,4 slag foran Kategori D-norm.",
    },
    {
      id: "APP_200",
      navn: "Innspill 150–200 m",
      avstand: "150–200 m (5–7 jern)",
      sg: -0.2,
      planlagtTreningTimer: 8,
      gjennomfortTreningTimer: 6,
      status: "noytral",
      detaljer: "Moderat treffprosent. 48 % GIR fra denne distansen.",
    },
    {
      id: "APP_150",
      navn: "Innspill 100–150 m",
      avstand: "100–150 m (8–PW)",
      sg: -0.8,
      planlagtTreningTimer: 16,
      gjennomfortTreningTimer: 8,
      status: "lekkasje",
      detaljer: "Her tapes det slag! Største lekkasje i spillet. Planlagt volum ikke nådd (kun 8 av 16 timer gjennomført).",
    },
    {
      id: "APP_100",
      navn: "Wedge 50–100 m",
      avstand: "50–100 m (GW/SW)",
      sg: 0.1,
      planlagtTreningTimer: 10,
      gjennomfortTreningTimer: 11,
      status: "gevinst",
      detaljer: "God lengdekontroll. Snitt proximity 4,8 meter til pinnen.",
    },
    {
      id: "ARG",
      navn: "Nærspill Greenside",
      avstand: "0–30 m (Rough/Bunker)",
      sg: 0.2,
      planlagtTreningTimer: 14,
      gjennomfortTreningTimer: 15,
      status: "gevinst",
      detaljer: "Solid opp-og-ned rate (61 %). Bunker krever fortsatt fokus.",
    },
    {
      id: "GREEN",
      navn: "Putting Green",
      avstand: "7 avstandsbånd",
      sg: -0.1,
      planlagtTreningTimer: 20,
      gjennomfortTreningTimer: 18,
      status: "noytral",
      detaljer: "Sterk på korte putter (0–5 ft). Svakest på 25–40 ft lag-putter.",
    },
  ];

  const valgtSone = soner.find((s) => s.id === valgtSoneId) || soner[2];

  const puttingBands = [
    { band: "0–3 ft (1 m)", make: "98 %", norm: "99 %", status: "ok" },
    { band: "3–5 ft (1,5 m)", make: "82 %", norm: "81 %", status: "ok" },
    { band: "5–10 ft (2,5 m)", make: "55 %", norm: "57 %", status: "ok" },
    { band: "10–15 ft (4 m)", make: "32 %", norm: "34 %", status: "ok" },
    { band: "15–25 ft (6 m)", make: "18 %", norm: "20 %", status: "advarsel" },
    { band: "25–40 ft (10 m)", make: "4 %", norm: "8 %", status: "lekkasje" },
    { band: "40+ ft (15 m)", make: "0 %", norm: "3 %", status: "ok" },
  ];

  return (
    <div className={`rounded-xl border border-white/10 bg-[#0C0D0C] p-5 sm:p-6 text-white ${className}`}>
      {/* Toppseksjon */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
            Spatial Banekart · Strokes Gained & Treningskorrelasjon
          </span>
          <h2 className="font-sans text-xl font-bold tracking-tight text-white">
            Hull 14 · Par 4 (385 meter)
          </h2>
          <p className="font-mono text-xs text-white/50">
            Klikk på en sone for å se sammenhengen mellom planlagt trening og oppnådd score
          </p>
        </div>

        <button
          type="button"
          onClick={() => setVisGreenZoom(!visGreenZoom)}
          className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 font-sans text-xs font-medium text-white transition-colors hover:bg-white/10"
        >
          <ZoomIn className="h-3.5 w-3.5" />
          <span>{visGreenZoom ? "Vis hele hullet" : "Zoom inn på green"}</span>
        </button>
      </div>

      {/* Kart- og detaljseksjon */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Venstre side: Visuell spatial representasjon av hullet */}
        <div className="lg:col-span-7 rounded-lg border border-white/10 bg-[#141413] p-4 flex flex-col items-center justify-between min-h-[460px] relative overflow-hidden">
          {!visGreenZoom ? (
            /* Hele hullet med avstandsbuer */
            <div className="w-full flex flex-col items-center justify-between h-full space-y-4 py-2">
              {/* Green / Flagg */}
              <button
                type="button"
                onClick={() => setValgtSoneId("GREEN")}
                className={`w-4/5 py-4 rounded-xl border flex flex-col items-center transition-all ${
                  valgtSoneId === "GREEN"
                    ? "border-emerald-400 bg-emerald-950/60 ring-2 ring-emerald-400"
                    : "border-emerald-600/40 bg-emerald-950/20 hover:border-emerald-400/60"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Flag className="h-4 w-4 text-emerald-400" />
                  <span className="font-sans text-xs font-bold text-emerald-300">
                    GREEN & FLAGG
                  </span>
                </div>
                <span className="font-mono text-[11px] text-white/60">
                  −0,1 SG · 7 puttingbånd
                </span>
              </button>

              {/* Nærspillssone (ARG) */}
              <button
                type="button"
                onClick={() => setValgtSoneId("ARG")}
                className={`w-3/4 py-3 rounded-lg border flex flex-col items-center transition-all ${
                  valgtSoneId === "ARG"
                    ? "border-white bg-white/15 ring-2 ring-white"
                    : "border-white/15 bg-white/5 hover:border-white/30"
                }`}
              >
                <span className="font-sans text-xs font-semibold">Nærspill (0–30 m)</span>
                <span className="font-mono text-[10px] text-emerald-400 font-bold">+0,2 SG</span>
              </button>

              {/* Innspill 100–150m (Lekkasjesone med rust) */}
              <button
                type="button"
                onClick={() => setValgtSoneId("APP_150")}
                className={`w-full py-5 rounded-lg border flex flex-col items-center transition-all relative ${
                  valgtSoneId === "APP_150"
                    ? "border-[#9B2415] bg-[#9B2415]/20 ring-2 ring-[#9B2415]"
                    : "border-[#9B2415]/40 bg-[#9B2415]/10 hover:border-[#9B2415]"
                }`}
              >
                <span className="absolute top-2 right-3 rounded-full bg-[#9B2415] px-2 py-0.5 font-sans text-[9px] font-bold text-white uppercase">
                  Her tapes det slag
                </span>
                <span className="font-sans text-sm font-bold text-white">
                  Innspill 100–150 m
                </span>
                <span className="font-mono text-xs text-[#F2908C] font-bold">
                  −0,8 SG (Mangler 8t trening)
                </span>
              </button>

              {/* Innspill 150–200m */}
              <button
                type="button"
                onClick={() => setValgtSoneId("APP_200")}
                className={`w-11/12 py-3 rounded-lg border flex flex-col items-center transition-all ${
                  valgtSoneId === "APP_200"
                    ? "border-white bg-white/15 ring-2 ring-white"
                    : "border-white/15 bg-white/5 hover:border-white/30"
                }`}
              >
                <span className="font-sans text-xs font-semibold">Innspill 150–200 m</span>
                <span className="font-mono text-[10px] text-white/60">−0,2 SG</span>
              </button>

              {/* Tee boks */}
              <button
                type="button"
                onClick={() => setValgtSoneId("TEE")}
                className={`w-2/3 py-3 rounded-lg border flex flex-col items-center transition-all ${
                  valgtSoneId === "TEE"
                    ? "border-emerald-400 bg-emerald-950/40 ring-2 ring-emerald-400"
                    : "border-white/15 bg-white/5 hover:border-white/30"
                }`}
              >
                <span className="font-sans text-xs font-bold text-white">UTSLAG (TEE TOTAL)</span>
                <span className="font-mono text-[10px] text-emerald-400 font-bold">+0,4 SG</span>
              </button>
            </div>
          ) : (
            /* Green Zoom: 7 konsentriske ringer rundt koppen */
            <div className="w-full flex flex-col items-center justify-center py-4 space-y-3">
              <span className="font-sans text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Green Målesoner · 7 Puttingbånd
              </span>
              <div className="relative w-64 h-64 rounded-full border border-white/20 flex items-center justify-center bg-emerald-950/20">
                {/* 25-40 ft ring */}
                <div className="w-52 h-52 rounded-full border border-white/15 flex items-center justify-center">
                  {/* 15-25 ft ring */}
                  <div className="w-40 h-40 rounded-full border border-white/15 flex items-center justify-center">
                    {/* 5-10 ft ring */}
                    <div className="w-28 h-28 rounded-full border border-white/20 flex items-center justify-center">
                      {/* 0-3 ft ring */}
                      <div className="w-14 h-14 rounded-full border-2 border-emerald-400 bg-emerald-900/40 flex items-center justify-center">
                        {/* Kopp */}
                        <div className="w-3.5 h-3.5 rounded-full bg-white shadow-glow" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="font-mono text-[11px] text-white/50 text-center">
                Målesoner: 0–3 ft (innerst) til 40+ ft (ytterst)
              </p>
            </div>
          )}
        </div>

        {/* Høyre side: Detaljkort for valgt sone */}
        <div className="lg:col-span-5 rounded-lg border border-white/10 bg-[#1B1C1A] p-5 space-y-5">
          <div className="border-b border-white/10 pb-3 flex items-center justify-between">
            <div>
              <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-white/50">
                Soneanalyse
              </span>
              <h3 className="font-sans text-lg font-bold text-white">{valgtSone.navn}</h3>
              <p className="font-mono text-xs text-white/50">{valgtSone.avstand}</p>
            </div>
            <span
              className={`font-mono text-lg font-bold ${
                valgtSone.sg < 0 ? "text-[#F2908C]" : "text-emerald-400"
              }`}
            >
              {valgtSone.sg > 0 ? `+${valgtSone.sg}` : valgtSone.sg.toString().replace("-", "−")} SG
            </span>
          </div>

          {/* Treningsvolum: Planlagt vs Gjennomført */}
          <div className="space-y-2">
            <div className="flex items-center justify-between font-sans text-xs">
              <span className="text-white/60">Planlagt treningsvolum:</span>
              <span className="font-mono font-bold">{valgtSone.planlagtTreningTimer} timer</span>
            </div>
            <div className="flex items-center justify-between font-sans text-xs">
              <span className="text-white/60">Gjennomført hittil:</span>
              <span className="font-mono font-bold">{valgtSone.gjennomfortTreningTimer} timer</span>
            </div>

            {/* Framgangsbar */}
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mt-1">
              <div
                className={`h-full rounded-full transition-all ${
                  valgtSone.gjennomfortTreningTimer < valgtSone.planlagtTreningTimer
                    ? "bg-[#9B2415]"
                    : "bg-emerald-500"
                }`}
                style={{
                  width: `${Math.min(
                    100,
                    (valgtSone.gjennomfortTreningTimer / valgtSone.planlagtTreningTimer) * 100
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* Beskrivelse og trener-anbefaling */}
          <div className="rounded-lg bg-black/40 p-3.5 border border-white/10">
            <div className="flex items-center gap-1.5 mb-1">
              <Info className="h-3.5 w-3.5 text-white/70" />
              <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-white/70">
                Konklusjon
              </span>
            </div>
            <p className="font-sans text-xs text-white/80 leading-relaxed">
              {valgtSone.detaljer}
            </p>
          </div>

          {/* Hvis Green er valgt: Tabell med de 7 puttingbåndene */}
          {valgtSoneId === "GREEN" && (
            <div className="pt-2 space-y-1.5">
              <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-white/50">
                Treffprosent per distanse
              </span>
              <div className="space-y-1">
                {puttingBands.map((pb, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-1 border-b border-white/5 text-[11px] font-mono"
                  >
                    <span className="text-white/70">{pb.band}</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={
                          pb.status === "lekkasje"
                            ? "text-[#F2908C] font-bold"
                            : "text-white font-bold"
                        }
                      >
                        {pb.make}
                      </span>
                      <span className="text-white/40">(norm {pb.norm})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
