"use client";

import React, { useState } from "react";
import { formaterTall } from "@/lib/format-tall";
import {
  Users,
  Search,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

export interface StallSpiller {
  id: string;
  navn: string;
  kategori: string;
  snittScore: number;
  acwr: number;
  timerDenneUken: number;
  sisteOkt: string;
  status: "OPTIMAL" | "RISIKO" | "RESTITUSJON";
}

export function StallPrecisionView() {
  const [sokeord, setSokeord] = useState("");
  const [valgtKategori, setValgtKategori] = useState<string>("ALLE");

  const [spillere] = useState<StallSpiller[]>([
    {
      id: "spiller-1",
      navn: "Magnus Kristiansen",
      kategori: "Kategori D",
      snittScore: 73.4,
      acwr: 1.18,
      timerDenneUken: 14.5,
      sisteOkt: "I dag (Nærspill & Wedge)",
      status: "OPTIMAL",
    },
    {
      id: "spiller-2",
      navn: "Sander Berg",
      kategori: "Kategori C",
      snittScore: 71.2,
      acwr: 1.54,
      timerDenneUken: 18.0,
      sisteOkt: "I går (Banerunde 18 hull)",
      status: "RISIKO",
    },
    {
      id: "spiller-3",
      navn: "Emilie Holst",
      kategori: "Kategori B",
      snittScore: 69.8,
      acwr: 1.05,
      timerDenneUken: 16.0,
      sisteOkt: "I dag (TrackMan Gapping)",
      status: "OPTIMAL",
    },
    {
      id: "spiller-4",
      navn: "Jonas Eide",
      kategori: "Kategori E",
      snittScore: 75.6,
      acwr: 0.72,
      timerDenneUken: 6.0,
      sisteOkt: "3 dager siden (Fysisk FYS)",
      status: "RESTITUSJON",
    },
    {
      id: "spiller-5",
      navn: "Nora Lind",
      kategori: "Kategori D",
      snittScore: 74.0,
      acwr: 1.22,
      timerDenneUken: 13.5,
      sisteOkt: "I dag (Putting-stige)",
      status: "OPTIMAL",
    },
  ]);

  const filtrerteSpillere = spillere.filter((s) => {
    const matcherSok = s.navn.toLowerCase().includes(sokeord.toLowerCase());
    const matcherKat = valgtKategori === "ALLE" || s.kategori === valgtKategori;
    return matcherSok && matcherKat;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-6">
      {/* Toppseksjon */}
      <div className="rounded-2xl border border-[#DDD9D1] bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-black/50">
                AgencyOS · Trenerkonsoll
              </span>
              <span className="rounded-full bg-[#141413] px-2.5 py-0.5 font-mono text-[10px] font-bold text-white">
                33 aktive spillere i stallen
              </span>
            </div>
            <h1 className="font-sans text-2xl sm:text-3xl font-bold tracking-tight text-[#141413] mt-1">
              Spillerstall & Belastningskontroll
            </h1>
            <p className="font-sans text-xs text-black/60 mt-1">
              Formkurver, ACWR-belastning, snittscorer og direkte tilgang til spillerens analyser
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/agencyos"
              className="rounded-lg border border-[#DDD9D1] bg-[#FAF8F3] px-3.5 py-2 font-sans text-xs font-semibold text-[#141413] hover:bg-[#F1EEE8] transition-colors"
            >
              Åpne Cockpit →
            </Link>
          </div>
        </div>

        {/* Søk og filterbånd */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3 border-t border-[#DDD9D1] pt-4">
          <div className="relative flex-1">
            <input
              type="text"
              value={sokeord}
              onChange={(e) => setSokeord(e.target.value)}
              placeholder="Søk etter spiller..."
              className="w-full rounded-lg border border-[#DDD9D1] bg-[#FAF8F3] pl-9 pr-3 py-2 font-sans text-xs text-[#141413] focus:border-[#141413] focus:outline-none"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-black/40" />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {["ALLE", "Kategori B", "Kategori C", "Kategori D", "Kategori E"].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setValgtKategori(k)}
                className={`rounded-lg px-3 py-1.5 font-sans text-xs font-semibold transition-all whitespace-nowrap ${
                  valgtKategori === k
                    ? "bg-[#141413] text-white"
                    : "bg-[#FAF8F3] border border-[#DDD9D1] text-black/70 hover:bg-[#F1EEE8]"
                }`}
              >
                {k}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Spillertabell */}
      <div className="rounded-2xl border border-[#DDD9D1] bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#DDD9D1] pb-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[#141413]" />
            <h2 className="font-sans text-sm font-bold text-[#141413]">
              Spilleroversikt ({filtrerteSpillere.length} treff)
            </h2>
          </div>
          <span className="font-sans text-[11px] text-black/50">
            Sist oppdatert: I dag kl. 01:15
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-[#DDD9D1]">
          <table className="w-full text-left border-collapse font-sans text-xs">
            <thead>
              <tr className="border-b border-[#DDD9D1] bg-[#FAF8F3] font-sans text-[11px] font-bold uppercase tracking-wider text-black/60">
                <th className="py-3 px-4">Spiller</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Snittscore</th>
                <th className="py-3 px-4">ACWR Belastning</th>
                <th className="py-3 px-4">Timer denne uken</th>
                <th className="py-3 px-4">Siste økt</th>
                <th className="py-3 px-4 text-right">Handling</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDD9D1] font-mono text-xs">
              {filtrerteSpillere.map((s) => (
                <tr key={s.id} className="hover:bg-[#FAF8F3]/50 transition-colors">
                  <td className="py-3 px-4 font-sans font-bold text-[#141413]">
                    {s.navn}
                  </td>
                  <td className="py-3 px-4 font-sans">
                    <span className="rounded bg-black/5 px-2 py-0.5 font-bold text-[#141413]">
                      {s.kategori}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-[#141413]">
                    {formaterTall(s.snittScore, 1)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded px-2 py-0.5 text-[11px] font-bold ${
                          s.status === "RISIKO"
                            ? "bg-rose-100 text-rose-900 border border-rose-300"
                            : s.status === "RESTITUSJON"
                            ? "bg-amber-100 text-amber-900"
                            : "bg-emerald-100 text-emerald-900"
                        }`}
                      >
                        {formaterTall(s.acwr, 2)}
                      </span>
                      {s.status === "RISIKO" && (
                        <span title="Belastning over 1,5">
                          <AlertTriangle className="h-3.5 w-3.5 text-[#9B2415]" />
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-black/80">{formaterTall(s.timerDenneUken, 1)} t</span>
                  </td>
                  <td className="py-3 px-4 font-sans text-black/70">
                    {s.sisteOkt}
                  </td>
                  <td className="py-3 px-4 text-right font-sans">
                    <Link
                      href="/portal/toppidrett"
                      className="inline-flex items-center gap-1 font-bold text-[#9B2415] hover:underline"
                    >
                      <span>Analyse</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
