"use client";

import React, { useState } from "react";
import { NavDrawer } from "@/components/navigation/NavDrawer";
import {
  HierarkiskMaalTracker,
  YtelsesbildeScorecard,
  BanekartSpatialView,
  StrokesGainedDeepDive,
  TrackmanGappingView,
  KategoriOversikt,
} from "@/components/portal/toppidrett";
import { Layers, MapPin, Target, Award, Compass, BarChart2 } from "lucide-react";

export interface ToppidrettKlientProps {
  user: {
    id: string;
    name?: string | null;
    role?: string;
  };
}

export function ToppidrettKlient({ user }: ToppidrettKlientProps) {
  const [aktivFane, setAktivFane] = useState<
    "ytelse" | "banekart" | "sg" | "gapping" | "kategori" | "maal"
  >("ytelse");

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#141413]">
      {/* 56px Toppnavigasjon med mobil-drawer */}
      <NavDrawer
        currentRole={user.role === "COACH" || user.role === "ADMIN" ? "trener" : "spiller"}
        userName={user.name || "Spiller"}
        userCategory="Kategori D"
      />

      {/* Hovedinnhold */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Tittel og overordnet kontekst */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-black/50">
              Toppidrett-OS · Analyse & Ytelse
            </span>
            <h1 className="font-sans text-2xl sm:text-3xl font-bold tracking-tight text-[#141413]">
              Presisjonsanalyse
            </h1>
            <p className="font-sans text-xs text-black/60">
              Lukket sirkel: Planlagt trening vs faktiske målinger og score
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-100 px-3 py-1 font-mono text-xs font-bold text-emerald-800">
              Snittscore: 73,4 (Kategori D)
            </span>
          </div>
        </div>

        {/* Fanevelger */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setAktivFane("ytelse")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-sans text-xs font-semibold whitespace-nowrap transition-colors ${
              aktivFane === "ytelse"
                ? "bg-[#141413] text-white"
                : "bg-white border border-[#DDD9D1] text-black/70 hover:bg-[#F1EEE8]"
            }`}
          >
            <BarChart2 className="h-3.5 w-3.5" />
            <span>Scorekort (5 faktorer)</span>
          </button>

          <button
            type="button"
            onClick={() => setAktivFane("banekart")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-sans text-xs font-semibold whitespace-nowrap transition-colors ${
              aktivFane === "banekart"
                ? "bg-[#141413] text-white"
                : "bg-white border border-[#DDD9D1] text-black/70 hover:bg-[#F1EEE8]"
            }`}
          >
            <MapPin className="h-3.5 w-3.5" />
            <span>Banekart & Putting</span>
          </button>

          <button
            type="button"
            onClick={() => setAktivFane("sg")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-sans text-xs font-semibold whitespace-nowrap transition-colors ${
              aktivFane === "sg"
                ? "bg-[#141413] text-white"
                : "bg-white border border-[#DDD9D1] text-black/70 hover:bg-[#F1EEE8]"
            }`}
          >
            <Target className="h-3.5 w-3.5" />
            <span>Strokes Gained & Tiger 5</span>
          </button>

          <button
            type="button"
            onClick={() => setAktivFane("gapping")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-sans text-xs font-semibold whitespace-nowrap transition-colors ${
              aktivFane === "gapping"
                ? "bg-[#141413] text-white"
                : "bg-white border border-[#DDD9D1] text-black/70 hover:bg-[#F1EEE8]"
            }`}
          >
            <Compass className="h-3.5 w-3.5" />
            <span>Bag Gapping & 2D</span>
          </button>

          <button
            type="button"
            onClick={() => setAktivFane("kategori")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-sans text-xs font-semibold whitespace-nowrap transition-colors ${
              aktivFane === "kategori"
                ? "bg-[#141413] text-white"
                : "bg-white border border-[#DDD9D1] text-black/70 hover:bg-[#F1EEE8]"
            }`}
          >
            <Award className="h-3.5 w-3.5" />
            <span>Kategori A–K</span>
          </button>

          <button
            type="button"
            onClick={() => setAktivFane("maal")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-sans text-xs font-semibold whitespace-nowrap transition-colors ${
              aktivFane === "maal"
                ? "bg-[#141413] text-white"
                : "bg-white border border-[#DDD9D1] text-black/70 hover:bg-[#F1EEE8]"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Målkaskade</span>
          </button>
        </div>

        {/* Aktiv skjermvisning */}
        <div className="pt-2">
          {aktivFane === "ytelse" && <YtelsesbildeScorecard />}
          {aktivFane === "banekart" && <BanekartSpatialView />}
          {aktivFane === "sg" && <StrokesGainedDeepDive />}
          {aktivFane === "gapping" && <TrackmanGappingView />}
          {aktivFane === "kategori" && <KategoriOversikt spillerScore={73.4} />}
          {aktivFane === "maal" && <HierarkiskMaalTracker />}
        </div>
      </main>
    </div>
  );
}
