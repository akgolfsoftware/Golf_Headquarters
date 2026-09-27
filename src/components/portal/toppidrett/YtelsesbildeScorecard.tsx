"use client";

import React, { useState } from "react";
import { Activity } from "lucide-react";

export type YtelsesFaktor = "smerte" | "mental" | "sosial" | "ernaering" | "teknikk";

export interface HullData {
  hullNr: number;
  par: number;
  score: number;
  feilFaktorer: YtelsesFaktor[];
}

export interface YtelsesbildeScorecardProps {
  baneNavn?: string;
  dato?: string;
  onLagreRapport?: (data: { huller: HullData[]; kommentar: string }) => void;
  className?: string;
}

const FAKTOR_LABELS: Record<YtelsesFaktor, { label: string; desc: string }> = {
  smerte: { label: "Smerte / Helse", desc: "Fysisk ubehag, stivhet eller smerte" },
  mental: { label: "Mental / Fokus", desc: "Frustrasjon, utålmodighet eller tap av rutine" },
  sosial: { label: "Sosial / Gruppe", desc: "Spilletempo, medspillere eller ekstern støy" },
  ernaering: { label: "Mat / Energi", desc: "Lavt blodsukker, dehydrering eller utmattelse" },
  teknikk: { label: "Sving / Taktikk", desc: "Dårlig treff, feil kølle eller feil linje" },
};

export function YtelsesbildeScorecard({
  baneNavn = "Miklagard Golf",
  dato = "I dag",
  onLagreRapport,
  className = "",
}: YtelsesbildeScorecardProps) {
  // Standard 18 hull med par og syntetisk utgangsscore
  const [huller, setHuller] = useState<HullData[]>(() =>
    Array.from({ length: 18 }, (_, i) => {
      const par = [4, 5, 3, 4, 4, 3, 5, 4, 4, 4, 3, 5, 4, 4, 3, 4, 5, 4][i] || 4;
      return {
        hullNr: i + 1,
        par,
        score: par, // Par som utgangspunkt
        feilFaktorer: [],
      };
    })
  );

  const [valgtHullNr, setValgtHullNr] = useState<number>(1);
  const [lagretStatus, setLagretStatus] = useState<string | null>(null);

  const valgtHull = huller.find((h) => h.hullNr === valgtHullNr) || huller[0];

  // Beregn totale slag og avvik
  const totalPar = huller.reduce((acc, h) => acc + h.par, 0);
  const totalScore = huller.reduce((acc, h) => acc + h.score, 0);
  const diffTotalt = totalScore - totalPar;

  // Toggle faktor på valgt hull
  const toggleFaktor = (faktor: YtelsesFaktor) => {
    setHuller((prev) =>
      prev.map((h) => {
        if (h.hullNr !== valgtHullNr) return h;
        const exists = h.feilFaktorer.includes(faktor);
        return {
          ...h,
          feilFaktorer: exists
            ? h.feilFaktorer.filter((f) => f !== faktor)
            : [...h.feilFaktorer, faktor],
        };
      })
    );
  };

  // Endre score på valgt hull
  const justerScore = (delta: number) => {
    setHuller((prev) =>
      prev.map((h) => {
        if (h.hullNr !== valgtHullNr) return h;
        const nyScore = Math.max(1, h.score + delta);
        return { ...h, score: nyScore };
      })
    );
  };

  // Generer objektiv coach-narrativ basert på faktorene
  const genererOppsummering = (): string => {
    const berorteHuller = huller.filter((h) => h.feilFaktorer.length > 0);
    if (berorteHuller.length === 0) {
      return "Jevn runde uten registrerte ytelsesfall. Fokus og energinivå ble opprettholdt gjennom 18 hull.";
    }

    const faktorCounts: Record<YtelsesFaktor, number> = {
      smerte: 0,
      mental: 0,
      sosial: 0,
      ernaering: 0,
      teknikk: 0,
    };

    berorteHuller.forEach((h) => {
      h.feilFaktorer.forEach((f) => {
        faktorCounts[f] = (faktorCounts[f] || 0) + 1;
      });
    });

    const hyppigste = (Object.keys(faktorCounts) as YtelsesFaktor[]).sort(
      (a, b) => faktorCounts[b] - faktorCounts[a]
    )[0];

    const hullListe = berorteHuller.map((h) => `hull ${h.hullNr}`).join(", ");
    return `Energitap eller utfordringer registrert på ${hullListe}. Primær faktor var ${FAKTOR_LABELS[hyppigste].label.toLowerCase()} (${faktorCounts[hyppigste]} tilfeller).`;
  };

  const handleLagre = () => {
    const rapport = genererOppsummering();
    if (onLagreRapport) {
      onLagreRapport({ huller, kommentar: rapport });
    }
    const na = new Date().toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
    setLagretStatus(`Lagret ${na} — ikke delt`);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Toppkort: Oppsummering & Brutto score */}
      <div className="rounded-lg border border-[#DDD9D1] bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#DDD9D1] pb-4">
          <div>
            <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-black/50">
              Ytelsesbilde Scorekort · 18 Hull
            </span>
            <h2 className="font-sans text-xl font-bold tracking-tight text-[#141413]">
              {baneNavn}
            </h2>
            <p className="font-mono text-xs text-black/50">{dato}</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <span className="font-sans text-[11px] text-black/50">BRUTTO SCORE</span>
              <p className="font-mono text-2xl font-bold text-[#141413]">
                {totalScore}{" "}
                <span className={`text-base font-normal ${diffTotalt > 0 ? "text-[#9B2415]" : "text-emerald-700"}`}>
                  ({diffTotalt > 0 ? `+${diffTotalt}` : diffTotalt === 0 ? "E" : diffTotalt})
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={handleLagre}
              className="rounded-lg bg-[#141413] px-4 py-2 font-sans text-xs font-medium text-white transition-opacity hover:opacity-90 active:scale-98"
            >
              Lagre rapport
            </button>
          </div>
        </div>

        {/* 18-hulls horisontal grid (9 ut / 9 inn) */}
        <div className="mt-4 space-y-2">
          <p className="font-sans text-xs text-black/60">
            Trykk på et hull for å registrere score og eventuelle årsaker til tap av fokus/energi:
          </p>

          <div className="grid grid-cols-9 sm:grid-cols-18 gap-1.5 pt-1">
            {huller.map((h) => {
              const erValgt = h.hullNr === valgtHullNr;
              const diff = h.score - h.par;
              const harFeil = h.feilFaktorer.length > 0;

              return (
                <button
                  key={h.hullNr}
                  type="button"
                  onClick={() => setValgtHullNr(h.hullNr)}
                  className={`flex flex-col items-center justify-between rounded-md p-1.5 transition-all text-center min-h-[58px] ${
                    erValgt
                      ? "ring-2 ring-[#141413] bg-[#141413] text-white"
                      : harFeil
                      ? "bg-[#9B2415]/10 border border-[#9B2415]/30 text-[#141413]"
                      : "bg-[#F1EEE8] hover:bg-[#E6E3DD] text-[#141413]"
                  }`}
                >
                  <span className={`font-mono text-[10px] ${erValgt ? "text-white/70" : "text-black/50"}`}>
                    #{h.hullNr}
                  </span>
                  <span className="font-mono text-sm font-bold">{h.score}</span>
                  <span
                    className={`font-mono text-[9px] ${
                      erValgt
                        ? "text-white/80"
                        : diff > 0
                        ? "text-[#9B2415] font-semibold"
                        : diff < 0
                        ? "text-emerald-700 font-semibold"
                        : "text-black/40"
                    }`}
                  >
                    {diff > 0 ? `+${diff}` : diff === 0 ? "par" : diff}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hull-detalj og 5-faktor velger for valgt hull */}
      <div className="rounded-lg border border-[#DDD9D1] bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#DDD9D1] pb-4">
          <div>
            <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-black/50">
              Registrering for hull #{valgtHull.hullNr} (Par {valgtHull.par})
            </span>
            <h3 className="font-sans text-lg font-bold text-[#141413]">
              Score: {valgtHull.score} slag
            </h3>
          </div>

          {/* Hurtigknapper for score: -1, par, +1 */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => justerScore(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#DDD9D1] bg-[#F1EEE8] font-mono text-base font-bold text-[#141413] hover:bg-[#E6E3DD] active:scale-95"
            >
              −
            </button>
            <button
              type="button"
              onClick={() => setHuller((prev) => prev.map((h) => (h.hullNr === valgtHullNr ? { ...h, score: h.par } : h)))}
              className="rounded-lg border border-[#DDD9D1] px-3 py-1.5 font-sans text-xs font-medium text-black/70 hover:bg-[#F1EEE8]"
            >
              Par ({valgtHull.par})
            </button>
            <button
              type="button"
              onClick={() => justerScore(1)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#DDD9D1] bg-[#F1EEE8] font-mono text-base font-bold text-[#141413] hover:bg-[#E6E3DD] active:scale-95"
            >
              +
            </button>
          </div>
        </div>

        {/* 5-faktorer pilleknapper */}
        <div className="mt-5 space-y-3">
          <p className="font-sans text-xs font-semibold text-black/70">
            Hva påvirket spillet på dette hullet? (Velg alle som gjelder):
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {(Object.keys(FAKTOR_LABELS) as YtelsesFaktor[]).map((key) => {
              const erAktiv = valgtHull.feilFaktorer.includes(key);
              const info = FAKTOR_LABELS[key];

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleFaktor(key)}
                  className={`flex flex-col items-start p-3 rounded-lg border text-left transition-all ${
                    erAktiv
                      ? "border-[#9B2415] bg-[#9B2415]/10 text-[#141413]"
                      : "border-[#DDD9D1] bg-[#FAF8F3] hover:bg-[#F1EEE8] text-[#141413]"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-sans text-xs font-bold">{info.label}</span>
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        erAktiv ? "bg-[#9B2415]" : "bg-black/15"
                      }`}
                    />
                  </div>
                  <span className="font-sans text-[11px] text-black/60 mt-1">
                    {info.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Automatisk coach-narrativ boks */}
        <div className="mt-6 rounded-lg bg-[#FAF8F3] p-4 border border-[#DDD9D1]">
          <div className="flex items-center gap-2 mb-1.5">
            <Activity className="h-4 w-4 text-[#141413]" />
            <span className="font-sans text-xs font-bold uppercase tracking-wider text-[#141413]">
              Treneroppsummering (Auto-narrativ)
            </span>
          </div>
          <p className="font-sans text-sm text-black/80 leading-relaxed">
            {genererOppsummering()}
          </p>
          {lagretStatus && (
            <p className="font-mono text-[11px] text-black/50 mt-2">
              {lagretStatus}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
