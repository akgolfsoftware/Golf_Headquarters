"use client";

import React, { useState } from "react";
import {
  Star,
  Search,
  Award,
  GraduationCap,
  FileText,
  ChevronDown,
  ChevronUp,
  Sparkles,
  School,
  Activity,
  Trophy,
} from "lucide-react";

export interface TalentSpiller {
  id: string;
  navn: string;
  fodselsar: number;
  klubb: string;
  onsketAvSkoler: string[]; // f.eks. ["Fredrikstad", "Oslo"]
  stjernemerket: boolean;
  snittKarakter: number; // f.eks. 5.1
  opptaksStatus: "Tilbud sendt" | "Vurderes" | "Møte gjennomført" | "Kartlegging" | "Søkt";
  hcp: number;
  bruttoSnittScore: number;
  sisteTurnering: {
    navn: string;
    score: string; // f.eks. "71 (-1)"
    plassering: string; // f.eks. "2. plass"
    dato: string;
  };
  turneringsHistorikk: Array<{
    turnering: string;
    runder: string; // f.eks. "72 - 70 (142, -2)"
    plass: string;
    dato: string;
  }>;
  fysiskeTester: {
    trapbar: number; // kg
    kneboy: number; // kg
    treTusen: string; // min:sek
    ballSpeedDriver: number; // mph
  };
  speiderNotat: string;
  sistOppdatertPipeline: string;
}

const INITIAL_TALENTER: TalentSpiller[] = [
  {
    id: "t1",
    navn: "Magnus Kristiansen",
    fodselsar: 2008,
    klubb: "Gamle Fredrikstad GK",
    onsketAvSkoler: ["Fredrikstad", "Oslo"],
    stjernemerket: true,
    snittKarakter: 5.2,
    opptaksStatus: "Tilbud sendt",
    hcp: -2.4,
    bruttoSnittScore: 70.8,
    sisteTurnering: {
      navn: "Srixon Tour #4 Sola",
      score: "69 (-3)",
      plassering: "1. plass",
      dato: "14. sep 2026",
    },
    turneringsHistorikk: [
      { turnering: "Srixon Tour #4 Sola", runder: "69 - 70 (-5)", plass: "1. plass", dato: "14. sep 2026" },
      { turnering: "NM Junior Byneset", runder: "71 - 71 - 72 (-2)", plass: "3. plass", dato: "25. aug 2026" },
      { turnering: "Garmin Norgescup #3", runder: "73 - 68 (-3)", plass: "2. plass", dato: "10. aug 2026" },
    ],
    fysiskeTester: {
      trapbar: 190,
      kneboy: 150,
      treTusen: "10:40",
      ballSpeedDriver: 176,
    },
    speiderNotat: "Ekstremt stabil balltreff. Stor treningsvilje og modenhet under press. Fysisk langt fremme for alderen.",
    sistOppdatertPipeline: "I dag 14:20",
  },
  {
    id: "t2",
    navn: "Alexander Bøe",
    fodselsar: 2008,
    klubb: "Oslo Golfklubb",
    onsketAvSkoler: ["Oslo", "Romerike"],
    stjernemerket: true,
    snittKarakter: 4.9,
    opptaksStatus: "Møte gjennomført",
    hcp: -1.8,
    bruttoSnittScore: 71.5,
    sisteTurnering: {
      navn: "Srixon Tour #4 Sola",
      score: "71 (-1)",
      plassering: "4. plass",
      dato: "14. sep 2026",
    },
    turneringsHistorikk: [
      { turnering: "Srixon Tour #4 Sola", runder: "71 - 72 (-1)", plass: "4. plass", dato: "14. sep 2026" },
      { turnering: "NM Junior Byneset", runder: "70 - 74 (E)", plass: "5. plass", dato: "25. aug 2026" },
    ],
    fysiskeTester: {
      trapbar: 195,
      kneboy: 150,
      treTusen: "10:45",
      ballSpeedDriver: 175,
    },
    speiderNotat: "Høy svinghastighet og presist nærspill. God dialog med sportssjef Jørn Johnsen om skolekombinasjon.",
    sistOppdatertPipeline: "I går 18:05",
  },
  {
    id: "t3",
    navn: "Henrik Holthe",
    fodselsar: 2008,
    klubb: "Stavanger Golfklubb",
    onsketAvSkoler: ["Stavanger"],
    stjernemerket: true,
    snittKarakter: 5.0,
    opptaksStatus: "Tilbud sendt",
    hcp: -1.5,
    bruttoSnittScore: 72.1,
    sisteTurnering: {
      navn: "Srixon Tour #4 Sola",
      score: "70 (-2)",
      plassering: "2. plass",
      dato: "14. sep 2026",
    },
    turneringsHistorikk: [
      { turnering: "Srixon Tour #4 Sola", runder: "70 - 72 (-2)", plass: "2. plass", dato: "14. sep 2026" },
      { turnering: "Vestlandstouren #3", runder: "69 (-3)", plass: "1. plass", dato: "01. sep 2026" },
    ],
    fysiskeTester: {
      trapbar: 188,
      kneboy: 148,
      treTusen: "10:55",
      ballSpeedDriver: 174,
    },
    speiderNotat: "Førsteprioritet for Stavanger. Henning Lindanger og Are Friestad har hatt samtale med foreldre.",
    sistOppdatertPipeline: "I dag 11:30",
  },
  {
    id: "t4",
    navn: "Felix Thoresen",
    fodselsar: 2008,
    klubb: "Vestfold Golfklubb",
    onsketAvSkoler: ["Tønsberg", "Fredrikstad"],
    stjernemerket: false,
    snittKarakter: 4.7,
    opptaksStatus: "Vurderes",
    hcp: 0.2,
    bruttoSnittScore: 73.4,
    sisteTurnering: {
      navn: "Srixon Tour #4 Sola",
      score: "74 (+2)",
      plassering: "9. plass",
      dato: "14. sep 2026",
    },
    turneringsHistorikk: [
      { turnering: "Srixon Tour #4 Sola", runder: "74 - 75 (+5)", plass: "9. plass", dato: "14. sep 2026" },
      { turnering: "Østlandstouren #4", runder: "72 (E)", plass: "3. plass", dato: "28. aug 2026" },
    ],
    fysiskeTester: {
      trapbar: 185,
      kneboy: 145,
      treTusen: "11:10",
      ballSpeedDriver: 172,
    },
    speiderNotat: "Ønsker primært WANG Tønsberg pga reisevei. Knud Andreas Krokeide følger opp med prøveøkt.",
    sistOppdatertPipeline: "I forgårs",
  },
  {
    id: "t5",
    navn: "Sara Melle",
    fodselsar: 2009,
    klubb: "Moss & Rygge GK",
    onsketAvSkoler: ["Fredrikstad"],
    stjernemerket: true,
    snittKarakter: 5.4,
    opptaksStatus: "Kartlegging",
    hcp: 1.1,
    bruttoSnittScore: 74.8,
    sisteTurnering: {
      navn: "Garmin Norgescup #4",
      score: "77 (+5)",
      plassering: "6. plass",
      dato: "12. sep 2026",
    },
    turneringsHistorikk: [
      { turnering: "Garmin Norgescup #4", runder: "77 - 76 (+9)", plass: "6. plass", dato: "12. sep 2026" },
      { turnering: "Srixon Tour Jenter U16", runder: "74 (+2)", plass: "2. plass", dato: "20. aug 2026" },
    ],
    fysiskeTester: {
      trapbar: 128,
      kneboy: 102,
      treTusen: "12:15",
      ballSpeedDriver: 144,
    },
    speiderNotat: "Kommende årskull (2009). Svært høyt karaktersnitt. Solid grunnfysikk og god teknisk forståelse.",
    sistOppdatertPipeline: "I dag 09:15",
  },
  {
    id: "t6",
    navn: "Jens Løken",
    fodselsar: 2010,
    klubb: "Bærum Golfklubb",
    onsketAvSkoler: ["Oslo", "Romerike"],
    stjernemerket: false,
    snittKarakter: 5.1,
    opptaksStatus: "Søkt",
    hcp: 2.8,
    bruttoSnittScore: 75.2,
    sisteTurnering: {
      navn: "Narvesen Tour #5",
      score: "74 (+2)",
      plassering: "1. plass",
      dato: "06. sep 2026",
    },
    turneringsHistorikk: [
      { turnering: "Narvesen Tour #5", runder: "74 (+2)", plass: "1. plass", dato: "06. sep 2026" },
      { turnering: "Srixon Tour Gutter U15", runder: "76 (+4)", plass: "4. plass", dato: "15. aug 2026" },
    ],
    fysiskeTester: {
      trapbar: 135,
      kneboy: 105,
      treTusen: "11:45",
      ballSpeedDriver: 160,
    },
    speiderNotat: "Aktuell for WANG Ung Oslo. God motorikk og dedikert golfutøver.",
    sistOppdatertPipeline: "3 dager siden",
  },
];

export function WangRekrutteringView() {
  const [spillere, setSpillere] = useState<TalentSpiller[]>(INITIAL_TALENTER);
  const [kunStjerner, setKunStjerner] = useState<boolean>(false);
  const [skoleFilter, setSkoleFilter] = useState<string>("ALLE");
  const [arFilter, setArFilter] = useState<string>("ALLE");
  const [statusFilter, setStatusFilter] = useState<string>("ALLE");
  const [sokTekst, setSokTekst] = useState<string>("");
  const [ekspandertSpillerId, setEkspandertSpillerId] = useState<string | null>("t1");

  // Toggle stjernemarkering (★/☆)
  const toggleStjerne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSpillere((prev) =>
      prev.map((spiller) =>
        spiller.id === id
          ? { ...spiller, stjernemerket: !spiller.stjernemerket }
          : spiller
      )
    );
  };

  // Filtrering
  const filtrerteSpillere = spillere.filter((s) => {
    if (kunStjerner && !s.stjernemerket) return false;
    if (skoleFilter !== "ALLE" && !s.onsketAvSkoler.includes(skoleFilter)) return false;
    if (arFilter !== "ALLE" && s.fodselsar.toString() !== arFilter) return false;
    if (statusFilter !== "ALLE" && s.opptaksStatus !== statusFilter) return false;
    if (sokTekst.trim() !== "") {
      const q = sokTekst.toLowerCase();
      return (
        s.navn.toLowerCase().includes(q) ||
        s.klubb.toLowerCase().includes(q) ||
        s.onsketAvSkoler.some((sk) => sk.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const antallStjerner = spillere.filter((s) => s.stjernemerket).length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0A2540] font-sans antialiased p-4 sm:p-6 lg:p-8 space-y-6">
      {/* ─────────────────────────────────────────────────────────────
          WANG REKRUTTERING & OPPTAKSHUB
         ───────────────────────────────────────────────────────────── */}

      {/* Header med WANG Brand & Pipeline Status */}
      <div className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-[#17446F] text-white flex items-center justify-center font-bold text-xs font-mono">
              W
            </span>
            <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#17446F]">
              WANG TOPPIDRETT & WANG UNG
            </span>
            <span className="text-xs text-[#94A3B8]">|</span>
            <span className="text-xs font-mono text-[#00A896] font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> INTERNSKJERM FOR SPEIDING & OPPTAK
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#0A2540] tracking-tight mt-1.5">
            Spillerrekruttering & Talentpipeline
          </h1>
          <p className="text-sm text-[#64748B] mt-1 max-w-2xl">
            Felles speider- og opptaksflate for alle WANG-skoler. Sanntids turneringsoppdateringer via AK Golf Pipeline, skolekrav, fysiske tester og interne prioriteringer.
          </p>
        </div>

        {/* Pipeline Synk-boks */}
        <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-md p-3 flex items-center gap-3 shrink-0 shadow-2xs">
          <div className="w-2.5 h-2.5 rounded-full bg-[#16A34A] animate-pulse" />
          <div>
            <div className="text-xs font-mono font-bold text-[#166534]">
              AK GOLF PIPELINE AKTIV
            </div>
            <div className="text-[11px] text-[#15803D]">
              Turneringsdata synkroniseres fortløpende
            </div>
          </div>
        </div>
      </div>

      {/* KPI-bånd */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-[#E2E8F0] shadow-xs">
          <div className="text-xs font-mono uppercase tracking-wider text-[#64748B] flex items-center justify-between">
            <span>PRIORITERTE (★)</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#0A2540] mt-1">
            {antallStjerner}
          </div>
          <div className="text-xs text-[#64748B] mt-0.5">
            På nasjonal prioritetsliste
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#E2E8F0] shadow-xs">
          <div className="text-xs font-mono uppercase tracking-wider text-[#64748B] flex items-center justify-between">
            <span>TILBUD SENDT</span>
            <GraduationCap className="w-4 h-4 text-[#17446F]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#00A896] mt-1">
            {spillere.filter((s) => s.opptaksStatus === "Tilbud sendt").length}
          </div>
          <div className="text-xs text-[#64748B] mt-0.5">
            Skoleplass tilbudt for 2026/27
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#E2E8F0] shadow-xs">
          <div className="text-xs font-mono uppercase tracking-wider text-[#64748B] flex items-center justify-between">
            <span>SNITTKARAKTER</span>
            <Award className="w-4 h-4 text-[#17446F]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#17446F] mt-1">
            5.05
          </div>
          <div className="text-xs text-[#64748B] mt-0.5">
            Over minstekrav for Toppidrett
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#E2E8F0] shadow-xs">
          <div className="text-xs font-mono uppercase tracking-wider text-[#64748B] flex items-center justify-between">
            <span>WANG-SKOLER AKTIVE</span>
            <School className="w-4 h-4 text-[#17446F]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#0A2540] mt-1">
            5 VGS + 6 Ung
          </div>
          <div className="text-xs text-[#64748B] mt-0.5">
            Fredrikstad, Oslo, Romerike m.fl.
          </div>
        </div>
      </div>

      {/* Filter og verktøylinje */}
      <div className="bg-white rounded-lg border border-[#E2E8F0] p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Stjernetoggle og skolefilter */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setKunStjerner(!kunStjerner)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all ${
                kunStjerner
                  ? "bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs font-bold"
                  : "bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0] border border-transparent"
              }`}
            >
              <Star
                className={`w-3.5 h-3.5 ${
                  kunStjerner ? "text-amber-600 fill-amber-500" : "text-[#64748B]"
                }`}
              />
              <span>Kun stjernemerkede ({antallStjerner})</span>
            </button>

            {/* Skole-knapper */}
            <div className="h-5 w-[1px] bg-[#E2E8F0] hidden sm:block" />
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              {["ALLE", "Fredrikstad", "Oslo", "Romerike", "Tønsberg", "Stavanger"].map((skole) => (
                <button
                  key={skole}
                  type="button"
                  onClick={() => setSkoleFilter(skole)}
                  className={`px-2.5 py-1 text-xs rounded-md font-mono transition-colors ${
                    skoleFilter === skole
                      ? "bg-[#17446F] text-white font-bold"
                      : "bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]"
                  }`}
                >
                  {skole === "ALLE" ? "Alle skoler" : skole}
                </button>
              ))}
            </div>
          </div>

          {/* Søk */}
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Søk spiller, klubb, skole..."
              value={sokTekst}
              onChange={(e) => setSokTekst(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-[#CBD5E1] bg-[#F8FAFC] focus:bg-white focus:outline-none focus:border-[#17446F]"
            />
          </div>
        </div>

        {/* Sekundære filtre (Årskull og opptaksstatus) */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#F1F5F9] text-xs">
          <div className="flex items-center gap-1 text-[#64748B]">
            <span className="font-mono text-[11px] uppercase">Årskull:</span>
            {["ALLE", "2008", "2009", "2010"].map((ar) => (
              <button
                key={ar}
                type="button"
                onClick={() => setArFilter(ar)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                  arFilter === ar
                    ? "bg-[#0A2540] text-white font-bold"
                    : "text-[#64748B] hover:text-[#0A2540]"
                }`}
              >
                {ar === "ALLE" ? "Alle år" : `${ar} (${2026 - parseInt(ar)} år)`}
              </button>
            ))}
          </div>

          <div className="h-4 w-[1px] bg-[#E2E8F0]" />

          <div className="flex items-center gap-1 text-[#64748B]">
            <span className="font-mono text-[11px] uppercase">Status:</span>
            {["ALLE", "Tilbud sendt", "Møte gjennomført", "Vurderes", "Kartlegging"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                  statusFilter === st
                    ? "bg-[#00A896] text-white font-bold"
                    : "text-[#64748B] hover:text-[#0A2540]"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Spillerliste med stjernemarkering & detaljer */}
      <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <div>
            <h2 className="font-bold text-[#0A2540] text-base">
              Kandidater for rekruttering ({filtrerteSpillere.length} spillere)
            </h2>
            <p className="text-xs text-[#64748B]">
              Klikk på stjernen for å flagge talentet. Klikk på raden for å se turneringshistorikk, fysiske tester og speidernotater.
            </p>
          </div>
          <span className="text-[11px] font-mono text-[#00A896] bg-[#F0FDF4] px-2.5 py-1 rounded border border-[#BBF7D0]">
            AK Golf Pipeline: Direktekoblet
          </span>
        </div>

        <div className="divide-y divide-[#F1F5F9]">
          {filtrerteSpillere.map((spiller) => {
            const erEkspandert = ekspandertSpillerId === spiller.id;

            return (
              <div
                key={spiller.id}
                className={`transition-colors ${
                  erEkspandert ? "bg-[#F8FAFC]" : "hover:bg-[#F8FAFC]/60"
                }`}
              >
                {/* Hovedrad */}
                <div
                  onClick={() =>
                    setEkspandertSpillerId(erEkspandert ? null : spiller.id)
                  }
                  className="p-4 sm:px-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
                >
                  {/* Spiller & Stjerne */}
                  <div className="flex items-center gap-3 min-w-[260px]">
                    <button
                      type="button"
                      onClick={(e) => toggleStjerne(spiller.id, e)}
                      title={
                        spiller.stjernemerket
                          ? "Fjern fra prioritetslisten"
                          : "Sett på prioritetslisten"
                      }
                      className="p-1 rounded hover:bg-slate-200 transition-colors shrink-0"
                    >
                      <Star
                        className={`w-5 h-5 transition-transform active:scale-125 ${
                          spiller.stjernemerket
                            ? "text-amber-500 fill-amber-500"
                            : "text-slate-300 hover:text-amber-400"
                        }`}
                      />
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#0A2540]">
                          {spiller.navn}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#F1F5F9] text-[#475569] rounded">
                          Født {spiller.fodselsar}
                        </span>
                      </div>
                      <div className="text-xs text-[#64748B] flex items-center gap-2 mt-0.5">
                        <span>{spiller.klubb}</span>
                        <span>·</span>
                        <span className="font-mono font-medium text-[#17446F]">
                          HCP {spiller.hcp}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Hvilken WANG-skole ønsker spilleren */}
                  <div className="min-w-[180px]">
                    <span className="text-[10px] font-mono uppercase text-[#94A3B8] block mb-1">
                      Ønsket av WANG-skole:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {spiller.onsketAvSkoler.map((skole) => (
                        <span
                          key={skole}
                          className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-[#17446F]/10 text-[#17446F] border border-[#17446F]/20"
                        >
                          WANG {skole}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Siste turnering (AK Golf Pipeline) */}
                  <div className="min-w-[200px]">
                    <span className="text-[10px] font-mono uppercase text-[#94A3B8] block mb-1">
                      Siste turnering (Pipeline):
                    </span>
                    <div className="text-xs font-semibold text-[#0A2540]">
                      {spiller.sisteTurnering.navn}
                    </div>
                    <div className="text-[11px] text-[#64748B] font-mono flex items-center gap-1.5">
                      <strong className="text-[#16A34A]">{spiller.sisteTurnering.score}</strong>
                      <span>·</span>
                      <span>{spiller.sisteTurnering.plassering}</span>
                      <span>·</span>
                      <span className="text-[10px] text-[#94A3B8]">{spiller.sisteTurnering.dato}</span>
                    </div>
                  </div>

                  {/* Skolekarakter & Opptaksstatus */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] font-mono uppercase text-[#94A3B8] block">
                        Karaktersnitt
                      </span>
                      <span className="text-sm font-mono font-bold text-[#17446F]">
                        {spiller.snittKarakter}
                      </span>
                    </div>

                    <div className="text-right min-w-[110px]">
                      <span
                        className={`inline-block px-2.5 py-1 rounded text-xs font-mono font-semibold ${
                          spiller.opptaksStatus === "Tilbud sendt"
                            ? "bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]"
                            : spiller.opptaksStatus === "Møte gjennomført"
                            ? "bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]"
                            : spiller.opptaksStatus === "Vurderes"
                            ? "bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]"
                            : "bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0]"
                        }`}
                      >
                        {spiller.opptaksStatus}
                      </span>
                    </div>

                    <div className="text-[#94A3B8]">
                      {erEkspandert ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Ekspandert detaljpanel */}
                {erEkspandert && (
                  <div className="px-6 pb-6 pt-2 bg-[#F1F5F9]/50 border-t border-[#E2E8F0] space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Boks 1: Turneringshistorikk fra AK Golf Pipeline */}
                      <div className="bg-white p-4 rounded-md border border-[#E2E8F0] shadow-2xs space-y-3">
                        <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-2">
                          <span className="text-xs font-mono font-bold uppercase text-[#17446F] flex items-center gap-1.5">
                            <Trophy className="w-3.5 h-3.5 text-[#17446F]" /> Turneringshistorikk (Pipeline)
                          </span>
                          <span className="text-[10px] font-mono text-[#16A34A] bg-[#F0FDF4] px-1.5 py-0.5 rounded">
                            Synkronisert {spiller.sistOppdatertPipeline}
                          </span>
                        </div>

                        <div className="space-y-2">
                          {spiller.turneringsHistorikk.map((t, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between text-xs py-1 border-b border-[#F8FAFC] last:border-none"
                            >
                              <div>
                                <span className="font-medium text-[#0A2540] block">
                                  {t.turnering}
                                </span>
                                <span className="text-[10px] text-[#94A3B8]">
                                  {t.dato}
                                </span>
                              </div>
                              <div className="text-right font-mono">
                                <span className="font-bold text-[#16A34A] block">
                                  {t.runder}
                                </span>
                                <span className="text-[11px] text-[#64748B]">
                                  {t.plass}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="pt-1 text-[11px] text-[#64748B] flex justify-between font-mono">
                          <span>Brutto snittscore sesong:</span>
                          <strong className="text-[#0A2540]">{spiller.bruttoSnittScore}</strong>
                        </div>
                      </div>

                      {/* Boks 2: Fysiske testresultater & standarder */}
                      <div className="bg-white p-4 rounded-md border border-[#E2E8F0] shadow-2xs space-y-3">
                        <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-2">
                          <span className="text-xs font-mono font-bold uppercase text-[#17446F] flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5 text-[#17446F]" /> Fysiske Benchmark-tester
                          </span>
                          <span className="text-[10px] font-mono text-[#64748B]">
                            WANG standard
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-[#F8FAFC] p-2 rounded">
                            <span className="text-[10px] font-mono uppercase text-[#64748B] block">Trapbar markløft</span>
                            <span className="font-mono font-bold text-[#0A2540] text-sm">{spiller.fysiskeTester.trapbar} kg</span>
                            <span className="text-[9px] text-[#16A34A] block">Standard: 170+ kg</span>
                          </div>
                          <div className="bg-[#F8FAFC] p-2 rounded">
                            <span className="text-[10px] font-mono uppercase text-[#64748B] block">Knebøy</span>
                            <span className="font-mono font-bold text-[#0A2540] text-sm">{spiller.fysiskeTester.kneboy} kg</span>
                            <span className="text-[9px] text-[#16A34A] block">Standard: 130+ kg</span>
                          </div>
                          <div className="bg-[#F8FAFC] p-2 rounded">
                            <span className="text-[10px] font-mono uppercase text-[#64748B] block">3000 meter</span>
                            <span className="font-mono font-bold text-[#0A2540] text-sm">{spiller.fysiskeTester.treTusen}</span>
                            <span className="text-[9px] text-[#16A34A] block">Standard: &lt; 11:30</span>
                          </div>
                          <div className="bg-[#F8FAFC] p-2 rounded">
                            <span className="text-[10px] font-mono uppercase text-[#64748B] block">Ball Speed Driver</span>
                            <span className="font-mono font-bold text-[#0A2540] text-sm">{spiller.fysiskeTester.ballSpeedDriver} mph</span>
                            <span className="text-[9px] text-[#16A34A] block">Standard: 165+ mph</span>
                          </div>
                        </div>

                        <div className="pt-1 text-[11px] text-[#64748B] flex items-center justify-between">
                          <span>Fysisk profil:</span>
                          <span className="font-mono font-semibold text-[#00A896]">
                            Over nasjonalt opptakskrav
                          </span>
                        </div>
                      </div>

                      {/* Boks 3: Speiderrapport & Handlinger */}
                      <div className="bg-white p-4 rounded-md border border-[#E2E8F0] shadow-2xs space-y-3 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-2">
                            <span className="text-xs font-mono font-bold uppercase text-[#17446F] flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-[#17446F]" /> Speidernotat fra Sportssjef
                            </span>
                          </div>
                          <p className="text-xs text-[#334155] leading-relaxed mt-2 italic bg-[#F8FAFC] p-2.5 rounded border border-[#E2E8F0]">
                            &ldquo;{spiller.speiderNotat}&rdquo;
                          </p>
                        </div>

                        {/* Handlingsknapper */}
                        <div className="pt-2 border-t border-[#F1F5F9] flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => alert(`Oppdaterer status for ${spiller.navn}`)}
                            className="px-3 py-1.5 bg-[#17446F] hover:bg-[#0F2D4A] text-white text-xs font-mono font-semibold rounded transition-colors"
                          >
                            Endre opptaksstatus
                          </button>
                          <button
                            type="button"
                            onClick={() => alert(`Sender intern melding til sportssjefer om ${spiller.navn}`)}
                            className="px-3 py-1.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0A2540] text-xs font-mono font-medium rounded transition-colors"
                          >
                            Internmelding
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
