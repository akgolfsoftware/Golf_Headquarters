"use client";

import React, { useState, useEffect } from "react";
import {
  Play,
  Pause,
  CheckCircle2,
  MapPin,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export interface LiveOktOppgave {
  id: string;
  tittel: string;
  kategori: string;
  antallBaller: number;
  fullfort: boolean;
  malKrav: string;
  score?: number;
}

export interface LivePrecisionProps {
  oktTittel?: string;
  sted?: string;
  oppgaverInit?: LiveOktOppgave[];
}

export function LivePrecisionView({
  oktTittel = "Wedge-kontroll & Distansekalibrering",
  sted = "AK Golf Academy / Studio 2 (TrackMan 4)",
  oppgaverInit = [
    {
      id: "1",
      tittel: "50m Wedge-landing (54° SW)",
      kategori: "SLAG · Presisjon",
      antallBaller: 15,
      fullfort: true,
      malKrav: "12 av 15 innenfor 2,0m sirkel",
      score: 13,
    },
    {
      id: "2",
      tittel: "70m Wedge-landing (50° GW)",
      kategori: "SLAG · Presisjon",
      antallBaller: 15,
      fullfort: false,
      malKrav: "10 av 15 innenfor 3,0m sirkel",
    },
    {
      id: "3",
      tittel: "90m Full Pitch (PW)",
      kategori: "TEK · Balltreff & Spinn",
      antallBaller: 20,
      fullfort: false,
      malKrav: "Spinnrate 8500-9200 rpm i TrackMan",
    },
    {
      id: "4",
      tittel: "Putting-stige hastighetskontroll",
      kategori: "SPILL · Putting",
      antallBaller: 12,
      fullfort: false,
      malKrav: "Ingen 3-putts fra 6m, 9m og 12m",
    },
  ],
}: LivePrecisionProps) {
  const [sekunder, setSekunder] = useState(24 * 60 + 15); // starter på 24 min 15 sek
  const [kjorer, setKjorer] = useState(true);
  const [oppgaver, setOppgaver] = useState<LiveOktOppgave[]>(oppgaverInit);
  const [aktivOppgaveId, setAktivOppgaveId] = useState<string>("2");
  const [spillerNotat, setSpillerNotat] = useState("");
  const [fullfortOkt, setFullfortOkt] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (kjorer && !fullfortOkt) {
      interval = setInterval(() => {
        setSekunder((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [kjorer, fullfortOkt]);

  const formaterTid = (totalSek: number) => {
    const m = Math.floor(totalSek / 60);
    const s = totalSek % 60;
    return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const toggleOppgave = (id: string) => {
    setOppgaver((prev) =>
      prev.map((o) => (o.id === id ? { ...o, fullfort: !o.fullfort } : o))
    );
  };

  const fullforteAntall = oppgaver.filter((o) => o.fullfort).length;
  const progresjonPst = Math.round((fullforteAntall / oppgaver.length) * 100);

  if (fullfortOkt) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center space-y-6">
        <div className="rounded-2xl border border-[#DDD9D1] bg-white p-8 shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 border border-emerald-300">
            <CheckCircle2 className="h-10 w-10 text-emerald-800" />
          </div>

          <h2 className="mt-4 font-sans text-2xl font-bold tracking-tight text-[#141413]">
            Treningsøkten er fullført!
          </h2>
          <p className="mt-1 font-sans text-xs text-black/60">
            Varighet: <strong className="font-mono text-[#141413]">{formaterTid(sekunder)}</strong> · {fullforteAntall} av {oppgaver.length} øvelser registrert.
          </p>

          <div className="mt-6 rounded-xl bg-[#FAF8F3] border border-[#DDD9D1] p-4 text-left space-y-2">
            <span className="font-sans text-xs font-bold text-[#141413] block">
              Oppsummering til Coach Anders
            </span>
            <p className="font-sans text-xs text-black/70">
              Data er overført til din utviklingsplan. Notat: «{spillerNotat || "God kontakt og stabil carry."}»
            </p>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              href="/portal/toppidrett"
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-[#141413] py-2.5 font-sans text-xs font-bold text-white hover:bg-black transition-colors"
            >
              <span>Se i Toppidrett-OS</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/portal"
              className="flex-1 flex items-center justify-center rounded-lg border border-[#DDD9D1] bg-[#FAF8F3] py-2.5 font-sans text-xs font-semibold text-[#141413] hover:bg-[#F1EEE8] transition-colors"
            >
              Tilbake til I dag
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 space-y-6">
      {/* Live status bar */}
      <div className="rounded-2xl border border-[#DDD9D1] bg-white p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-emerald-900">
                Live økt pågår
              </span>
            </div>
            <h1 className="font-sans text-xl sm:text-2xl font-bold tracking-tight text-[#141413] mt-1">
              {oktTittel}
            </h1>
            <div className="flex items-center gap-3 text-xs text-black/60 font-sans mt-1">
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-black/40" />
                <span>{sted}</span>
              </div>
            </div>
          </div>

          {/* Stoppeklokke & Kontroller */}
          <div className="flex items-center gap-3 bg-[#FAF8F3] border border-[#DDD9D1] rounded-xl p-3">
            <div className="text-right">
              <span className="block font-sans text-[10px] uppercase tracking-wider text-black/50">Tid brukt</span>
              <span className="font-mono text-2xl font-bold text-[#141413]">
                {formaterTid(sekunder)}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setKjorer(!kjorer)}
              className="rounded-lg bg-[#141413] p-2 text-white hover:bg-black transition-colors"
              title={kjorer ? "Pause" : "Start"}
            >
              {kjorer ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Fremdriftslinje */}
        <div className="mt-5 space-y-1.5 border-t border-[#DDD9D1] pt-4">
          <div className="flex justify-between font-sans text-xs">
            <span className="text-black/60 font-medium">
              Fremdrift: <strong>{fullforteAntall} av {oppgaver.length} øvelser fullført</strong>
            </span>
            <span className="font-mono font-bold text-[#141413]">{progresjonPst} %</span>
          </div>
          <div className="h-2 w-full rounded-full bg-[#DDD9D1] overflow-hidden">
            <div
              style={{ width: `${progresjonPst}%` }}
              className="h-full bg-[#141413] transition-all duration-300"
            />
          </div>
        </div>
      </div>

      {/* Oppgaveliste under økten */}
      <div className="space-y-3">
        <h2 className="font-sans text-sm font-bold uppercase tracking-wider text-black/60">
          Dagens øvelser og tester
        </h2>

        <div className="space-y-3">
          {oppgaver.map((o) => {
            const erAktiv = aktivOppgaveId === o.id;
            return (
              <div
                key={o.id}
                className={`rounded-xl border p-4 sm:p-5 transition-all ${
                  erAktiv
                    ? "border-[#141413] bg-white ring-1 ring-[#141413] shadow-sm"
                    : o.fullfort
                    ? "border-[#DDD9D1] bg-[#FAF8F3] opacity-80"
                    : "border-[#DDD9D1] bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => toggleOppgave(o.id)}
                      className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-md border transition-all ${
                        o.fullfort
                          ? "bg-emerald-700 border-emerald-700 text-white"
                          : "border-[#DDD9D1] bg-white hover:border-black"
                      }`}
                    >
                      {o.fullfort && <CheckCircle2 className="h-3.5 w-3.5" />}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-sans text-xs font-bold text-[#141413]">
                          {o.tittel}
                        </span>
                        <span className="rounded bg-black/10 px-2 py-0.2 font-sans text-[10px] font-semibold text-black/70">
                          {o.kategori}
                        </span>
                      </div>
                      <p className="font-sans text-xs text-black/60 mt-1">
                        Målkrav: <strong className="text-black/80">{o.malKrav}</strong> · {o.antallBaller} baller
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setAktivOppgaveId(o.id)}
                    className="font-sans text-[11px] font-bold text-[#9B2415] hover:underline shrink-0"
                  >
                    {erAktiv ? "Fokusert" : "Vis detaljer"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Spillerens notatblokk & Fullfør */}
      <div className="rounded-2xl border border-[#DDD9D1] bg-white p-5 shadow-sm space-y-4">
        <div>
          <label className="block font-sans text-xs font-bold text-[#141413] mb-1">
            Raske notater under økten (følelse, TrackMan-tall, balltreff)
          </label>
          <textarea
            rows={2}
            value={spillerNotat}
            onChange={(e) => setSpillerNotat(e.target.value)}
            placeholder="F.eks. Stabil 54° carry på 102m. God rotasjon gjennom ballen..."
            className="w-full rounded-lg border border-[#DDD9D1] bg-[#FAF8F3] p-3 font-sans text-xs text-[#141413] focus:border-[#141413] focus:outline-none"
          />
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-[#DDD9D1]">
          <Link
            href="/portal"
            className="font-sans text-xs font-semibold text-black/60 hover:text-black"
          >
            Avbryt økt
          </Link>

          <button
            type="button"
            onClick={() => setFullfortOkt(true)}
            className="flex items-center gap-2 rounded-lg bg-[#141413] px-6 py-2.5 font-sans text-xs font-bold text-white hover:bg-black transition-colors"
          >
            <span>Fullfør økt og lagre data</span>
            <CheckCircle2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
