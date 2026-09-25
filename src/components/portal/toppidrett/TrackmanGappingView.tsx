"use client";

import React, { useState } from "react";
import { ShieldCheck } from "lucide-react";

export interface KolleGapData {
  kolle: string;
  carryMeter: number;
  ballSpeedMph: number;
  spinRpm: number;
  gapTilNesteMeter?: number;
  status?: "ok" | "for_lite_gap" | "for_stort_gap";
}

export function TrackmanGappingView({ className = "" }: { className?: string }) {
  const [valgtKolle, setValgtKolle] = useState<string>("7-jern");

  const bagData: KolleGapData[] = [
    { kolle: "Driver", carryMeter: 254, ballSpeedMph: 164, spinRpm: 2350, gapTilNesteMeter: 24, status: "ok" },
    { kolle: "3-wood", carryMeter: 230, ballSpeedMph: 154, spinRpm: 3400, gapTilNesteMeter: 16, status: "ok" },
    { kolle: "5-wood", carryMeter: 214, ballSpeedMph: 147, spinRpm: 4100, gapTilNesteMeter: 12, status: "ok" },
    { kolle: "4-jern", carryMeter: 202, ballSpeedMph: 139, spinRpm: 4600, gapTilNesteMeter: 12, status: "ok" },
    { kolle: "5-jern", carryMeter: 190, ballSpeedMph: 132, spinRpm: 5100, gapTilNesteMeter: 11, status: "ok" },
    { kolle: "6-jern", carryMeter: 179, ballSpeedMph: 126, spinRpm: 5800, gapTilNesteMeter: 11, status: "ok" },
    { kolle: "7-jern", carryMeter: 168, ballSpeedMph: 120, spinRpm: 6600, gapTilNesteMeter: 12, status: "ok" },
    { kolle: "8-jern", carryMeter: 156, ballSpeedMph: 114, spinRpm: 7400, gapTilNesteMeter: 11, status: "ok" },
    { kolle: "9-jern", carryMeter: 145, ballSpeedMph: 108, spinRpm: 8200, gapTilNesteMeter: 12, status: "ok" },
    { kolle: "PW (46°)", carryMeter: 133, ballSpeedMph: 102, spinRpm: 8900, gapTilNesteMeter: 13, status: "ok" },
    { kolle: "GW (50°)", carryMeter: 120, ballSpeedMph: 96, spinRpm: 9400, gapTilNesteMeter: 12, status: "ok" },
    { kolle: "SW (54°)", carryMeter: 108, ballSpeedMph: 89, spinRpm: 9800, gapTilNesteMeter: 14, status: "ok" },
    { kolle: "LW (58°)", carryMeter: 94, ballSpeedMph: 81, spinRpm: 10200 },
  ];

  const aktivData = bagData.find((k) => k.kolle === valgtKolle) || bagData[6];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 2D Spredningskart for valgt kølle */}
      <div className="rounded-lg border border-[#DDD9D1] bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#DDD9D1] pb-4">
          <div>
            <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-black/50">
              TrackMan Spredningsellipser · 2D Dispersion
            </span>
            <h2 className="font-sans text-xl font-bold tracking-tight text-[#141413]">
              {aktivData.kolle} · Carry & Sideavvik
            </h2>
            <p className="font-mono text-xs text-black/50">
              Carry: {aktivData.carryMeter} m · Ball Speed: {aktivData.ballSpeedMph} mph · Spinn: {aktivData.spinRpm} rpm
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
              <ShieldCheck className="h-3.5 w-3.5" />
              68 % og 95 % spredning
            </span>
          </div>
        </div>

        {/* 2D spredningsgraf / visuell illustrasjon */}
        <div className="mt-5 rounded-lg bg-[#FAF8F3] border border-[#DDD9D1] p-6 flex flex-col items-center justify-center min-h-[220px] relative">
          {/* Målblokk med flagg */}
          <div className="relative w-72 h-44 border border-dashed border-black/20 rounded-full flex items-center justify-center">
            {/* 95 % ellipse (ytre) */}
            <div className="w-56 h-32 rounded-full border border-black/30 flex items-center justify-center bg-black/[0.02]">
              {/* 68 % ellipse (indre) */}
              <div className="w-36 h-20 rounded-full border-2 border-emerald-600/60 bg-emerald-600/10 flex items-center justify-center">
                {/* Flagg / målpunkt */}
                <div className="h-2 w-2 rounded-full bg-[#141413] shadow-xs" />
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-4 font-mono text-[11px] text-black/50">
            <span>Lengdespredning: ±4,2 m</span>
            <span>·</span>
            <span>Sideavvik: ±3,1 m</span>
          </div>
        </div>
      </div>

      {/* Bag Gapping stige: 13/14 køller */}
      <div className="rounded-lg border border-[#DDD9D1] bg-white overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#DDD9D1] bg-[#FAF8F3] flex items-center justify-between">
          <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-black/70">
            14-Køllers Bag Gapping (Carry Stige)
          </h3>
          <span className="font-mono text-xs text-black/50">Mål: 10–14 m jevne gap</span>
        </div>

        <div className="divide-y divide-black/[0.06]">
          {bagData.map((k) => {
            const erValgt = k.kolle === valgtKolle;
            return (
              <button
                key={k.kolle}
                type="button"
                onClick={() => setValgtKolle(k.kolle)}
                className={`w-full p-3.5 flex items-center justify-between transition-colors text-left ${
                  erValgt ? "bg-[#141413]/[0.05]" : "hover:bg-black/[0.02]"
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="font-sans text-xs font-bold text-[#141413] w-24">
                    {k.kolle}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-mono text-sm font-bold text-[#141413]">
                      {k.carryMeter}
                    </span>
                    <span className="font-mono text-[10px] text-black/40">m carry</span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="hidden sm:flex items-center gap-4 font-mono text-xs text-black/50">
                    <span>{k.ballSpeedMph} mph</span>
                    <span>{k.spinRpm} rpm</span>
                  </div>

                  {k.gapTilNesteMeter !== undefined ? (
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-[#F1EEE8] text-[#141413]">
                      ↓ {k.gapTilNesteMeter} m
                    </span>
                  ) : (
                    <span className="font-mono text-xs text-black/30">Nederst</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
