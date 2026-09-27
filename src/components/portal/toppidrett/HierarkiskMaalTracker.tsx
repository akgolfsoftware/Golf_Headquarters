"use client";

import React from "react";

export function HierarkiskMaalTracker({ className = "" }: { className?: string }) {
  const maalHierarki = [
    {
      nivaa: "1. SESONGMÅL (ÅR)",
      tittel: "Kvalifisere til Kategori C · Snittscore ≤71,9",
      frist: "Oktober 2026",
      status: "65 % oppnådd",
      prosent: 65,
      farge: "bg-emerald-600",
    },
    {
      nivaa: "2. PERIODE (FASE)",
      tittel: "Spesifikk forberedelse · Konkurranseoppkjøring",
      frist: "Uke 36–42 (6 uker)",
      status: "Uke 3 av 6",
      prosent: 50,
      farge: "bg-[#141413]",
    },
    {
      nivaa: "3. MÅNEDSFOKUS",
      tittel: "Innspill 100–150 m og lag-putting (25–40 fot)",
      frist: "September",
      status: "14 av 20 planlagte timer",
      prosent: 70,
      farge: "bg-[#141413]",
    },
    {
      nivaa: "4. UKEBUDSJETT",
      tittel: "Uke 39 · Volum og ACWR-belastning",
      frist: "Søndag 28. sep",
      status: "16 av 20 timer (ACWR: 1,12 · Trygg sone)",
      prosent: 80,
      farge: "bg-emerald-600",
    },
    {
      nivaa: "5. DAGENS ØKT",
      tittel: "Teknikk P3/P4 med TrackMan + 50 putter 3–5 fot",
      frist: "I dag kl. 14:00",
      status: "Gjennomført (75 min)",
      prosent: 100,
      farge: "bg-emerald-600",
    },
  ];

  return (
    <div className={`rounded-lg border border-[#DDD9D1] bg-white p-5 sm:p-6 shadow-xs ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#DDD9D1] pb-4 mb-5">
        <div>
          <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-black/50">
            Hierarkisk Målstruktur · Kaskade
          </span>
          <h2 className="font-sans text-xl font-bold tracking-tight text-[#141413]">
            Fra Sesongmål til Dagens Økt
          </h2>
          <p className="font-sans text-xs text-black/60">
            Hver treningsøkt henger direkte sammen med sesongens overordnede resultatmål
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-emerald-100 px-3 py-1 font-mono text-xs font-bold text-emerald-800">
            I rute mot Kategori C
          </span>
        </div>
      </div>

      {/* Kaskade-steg */}
      <div className="space-y-4">
        {maalHierarki.map((steg, idx) => (
          <div
            key={idx}
            className="p-4 rounded-lg bg-[#FAF8F3] border border-[#DDD9D1] space-y-2.5 transition-all hover:bg-white"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-black/50">
                {steg.nivaa}
              </span>
              <span className="font-mono text-[11px] text-black/50">{steg.frist}</span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <h3 className="font-sans text-sm font-bold text-[#141413]">
                {steg.tittel}
              </h3>
              <span className="font-mono text-xs font-bold text-[#141413] shrink-0">
                {steg.status}
              </span>
            </div>

            {/* Progresjonslinje */}
            <div className="w-full bg-[#E6E3DD] h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${steg.farge}`}
                style={{ width: `${steg.prosent}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
