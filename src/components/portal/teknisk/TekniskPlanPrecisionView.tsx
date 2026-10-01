"use client";

import React, { useState } from "react";
import {
  Target,
  Compass,
  Camera,
  CheckCircle2,
  Clock,
  Calendar,
  Layers,
  ChevronRight,
  Sparkles,
  Plus,
  Play,
  Upload,
  FileText,
  User,
  MapPin,
} from "lucide-react";

export type MotoriskSteg = "UTEN_BALL" | "LAV_FART" | "AUTO";
export type ArenaMiljo = "NETT" | "TRACKMAN" | "RANGE" | "BANE";

interface PPositionData {
  pNum: string;
  navn: string;
  fokus: boolean;
  status: "FERDIG" | "PAGAAR" | "PLANLAGT";
  sjekkpunkter: string[];
  trenerTips: string;
  referanseBildeUrl: string;
  referanseVideoTittel: string;
  spillerSisteVideoTittel?: string;
  spillerSisteVideoDato?: string;
}

export function TekniskPlanPrecisionView() {
  // Aktiv valgt P-posisjon
  const [valgtPNum, setValgtPNum] = useState<string>("P4.0");

  // Logg-modal tilstand
  const [visLoggModal, setVisLoggModal] = useState<boolean>(false);
  const [loggArena, setLoggArena] = useState<ArenaMiljo>("TRACKMAN");
  const [loggSteg, setLoggSteg] = useState<MotoriskSteg>("LAV_FART");
  const [loggReps, setLoggReps] = useState<number>(30);
  const [loggNotat, setLoggNotat] = useState<string>("");
  const [loggSuksess, setLoggSuksess] = useState<boolean>(false);

  // Repetisjonsstatus (live state)
  const [repsData, setRepsData] = useState({
    utenBall: { gjort: 200, maal: 200 },
    lavFart: { gjort: 180, maal: 300 },
    auto: { gjort: 60, maal: 500 },
  });

  // Arena-statistikk
  const arenaData: Record<ArenaMiljo, { navn: string; gjort: number; maal: number; beskrivelse: string }> = {
    NETT: {
      navn: "I nett",
      gjort: 220,
      maal: 300,
      beskrivelse: "Fokus på bevegelsesfølelse og tekniske drills uten å se ballflukt.",
    },
    TRACKMAN: {
      navn: "På TrackMan",
      gjort: 160,
      maal: 400,
      beskrivelse: "Måling og bekreftelse av Club Path (+2.5°) og Face to Path (-1.2°).",
    },
    RANGE: {
      navn: "På treningsfelt / Range",
      gjort: 50,
      maal: 200,
      beskrivelse: "Visuell bekreftelse av 5 meter draw i luften med flaggsikte.",
    },
    BANE: {
      navn: "Ute på golfbanen",
      gjort: 10,
      maal: 100,
      beskrivelse: "Anvendelse i reelle slagsituasjoner under press.",
    },
  };

  // P1 til P10 definisjoner
  const pPosisjoner: PPositionData[] = [
    {
      pNum: "P1.0",
      navn: "Adresse & Oppstilling",
      fokus: false,
      status: "FERDIG",
      sjekkpunkter: [
        "Balansert trykkfordeling 50/50 på fotballene",
        "Tilt i bekken og ryggrad 8–10° fra målet med driver/7-jern",
        "Nøytralt to-knoker venstrehåndsgrep",
      ],
      trenerTips: "God balanse i oppstillingen er forutsetningen for stabil rotasjon.",
      referanseBildeUrl: "/referanser/p1-oppstilling.jpg",
      referanseVideoTittel: "Anders demonstrerer perfekt P1-vinkel og sikte",
    },
    {
      pNum: "P2.0",
      navn: "Kølle parallell tilbake",
      fokus: false,
      status: "FERDIG",
      sjekkpunkter: [
        "Kølleskaft parallelt med tålinjen",
        "Køllebladet matcher ryggradsvinkelen (lett lukket mot vertikal)",
        "Brystkassen starter tilbakesvingen samlet",
      ],
      trenerTips: "Unngå å rulle håndleddene innover bak kroppen her.",
      referanseBildeUrl: "/referanser/p2-takeaway.jpg",
      referanseVideoTittel: "Takeaway i ett stykke — brystrotasjon",
    },
    {
      pNum: "P3.0",
      navn: "Venstre arm parallell",
      fokus: false,
      status: "FERDIG",
      sjekkpunkter: [
        "Venstre arm parallell med bakken",
        "90° vinkel mellom venstre underarm og kølleskaft",
        "Kølleskaft peker mot ballinjen",
      ],
      trenerTips: "Skap bredde i svingen tidlig uten å løfte skuldrene.",
      referanseBildeUrl: "/referanser/p3-arm-parallell.jpg",
      referanseVideoTittel: "Bredde og heving av armer i P3",
    },
    {
      pNum: "P4.0",
      navn: "Topp av baksving",
      fokus: true,
      status: "PAGAAR",
      sjekkpunkter: [
        "Flat eller svakt bøyd venstre håndledd (unngå cupping)",
        "90° full brystrotasjon med dyp høyre hofte",
        "Køllebladet peker 45° mot himmelen (nøytral til lukket)",
      ],
      trenerTips:
        "Dette er hovedfokuset i planen! Hold venstre håndledd flatt ved toppen for å sikre at køllebladet ikke åpner seg for mye, slik at vi får en naturlig draw uten overkompensasjon.",
      referanseBildeUrl: "/referanser/p4-topp-referanse.jpg",
      referanseVideoTittel: "Fasit P4: Anders forklarer håndledd og brystvinkel",
      spillerSisteVideoTittel: "Magnus_P4_analyse_24sep.mp4",
      spillerSisteVideoDato: "24.09.2026 kl. 16:30",
    },
    {
      pNum: "P5.0",
      navn: "Tidlig nedsving (arm parallell)",
      fokus: false,
      status: "PLANLAGT",
      sjekkpunkter: [
        "Vektforskyvning mot venstre fot (65 % trykk)",
        "Beholde vinkelen i håndleddene (lag)",
        "Køllen faller i plan uten å kastes ut over skuldrene",
      ],
      trenerTips: "Initier nedsvingen fra bakken og hoftene, ikke med hendene.",
      referanseBildeUrl: "/referanser/p5-nedsving.jpg",
      referanseVideoTittel: "Overgang og bakketrykk i P5",
    },
    {
      pNum: "P6.0",
      navn: "Leveringsposisjon (kølle parallell)",
      fokus: true,
      status: "PAGAAR",
      sjekkpunkter: [
        "Kølleskaft parallelt med bakken og rett over tålinjen",
        "Køllehodet er svakt bak hendene sett fra bakfra (in-to-out levering)",
        "Brystkassen begynner å åpne seg mot målet",
      ],
      trenerTips:
        "For å sikre +2.5° Club Path in-to-out, må køllehodet komme svakt bak hendene ved P6.",
      referanseBildeUrl: "/referanser/p6-levering-referanse.jpg",
      referanseVideoTittel: "P6 Levering: Slik skaper vi 2.5° in-to-out bane",
      spillerSisteVideoTittel: "Magnus_P6_slowmo_23sep.mp4",
      spillerSisteVideoDato: "23.09.2026 kl. 17:15",
    },
    {
      pNum: "P7.0",
      navn: "Impact (treffpunkt)",
      fokus: false,
      status: "PLANLAGT",
      sjekkpunkter: [
        "Hendene foran ballen (Forward shaft lean 4–6° med 7-jern)",
        "Brystkasse og hofter er åpne mot målet (30–40° hofterotasjon)",
        "Rent ball-før-bakke treff med -3.5° attack angle",
      ],
      trenerTips: "Treffpunktet er et resultat av gode P4- og P6-posisjoner.",
      referanseBildeUrl: "/referanser/p7-impact.jpg",
      referanseVideoTittel: "Kompresjon og skaftvinkel i treffet",
    },
    {
      pNum: "P8.0",
      navn: "Kølle parallell etter treff",
      fokus: false,
      status: "PLANLAGT",
      sjekkpunkter: [
        "Begge armer strake gjennom ballen",
        "Høyre hånd roterer naturlig over venstre for stabil kurve",
        "Balanse opprettholdes over venstre fot",
      ],
      trenerTips: "La køllehodet følge svakt ut mot høyre i mållinjen for draw.",
      referanseBildeUrl: "/referanser/p8-gjennomgang.jpg",
      referanseVideoTittel: "Bredde etter treff og rotasjonsutgang",
    },
    {
      pNum: "P9.0",
      navn: "Høyre arm parallell opp",
      fokus: false,
      status: "PLANLAGT",
      sjekkpunkter: [
        "Høyre arm parallell med bakken",
        "Brystkassen peker forbi målet mot venstre",
        "Kølleskaft vinkler opp naturlig",
      ],
      trenerTips: "Fullfør rotasjonen uten å bremse kroppen.",
      referanseBildeUrl: "/referanser/p9-followthrough.jpg",
      referanseVideoTittel: "Fri rotasjon gjennom målet",
    },
    {
      pNum: "P10.0",
      navn: "Finish & Balanse",
      fokus: false,
      status: "PLANLAGT",
      sjekkpunkter: [
        "90 % av vekten på venstre hæl, høyre fot opp på tåtuppen",
        "Beltespenne og brystkasse peker fullt mot målet",
        "Holde balansen i 3 sekunder etter slaget",
      ],
      trenerTips: "En god finish viser at kreftene ble frigjort i balanse.",
      referanseBildeUrl: "/referanser/p10-finish.jpg",
      referanseVideoTittel: "Stabilitet og holdt finish",
    },
  ];

  const aktivP = pPosisjoner.find((p) => p.pNum === valgtPNum) || pPosisjoner[3];

  // Beregn total progresjon
  const totalGjort = repsData.utenBall.gjort + repsData.lavFart.gjort + repsData.auto.gjort;
  const totalMaal = repsData.utenBall.maal + repsData.lavFart.maal + repsData.auto.maal;
  const totalProsent = Math.round((totalGjort / totalMaal) * 100);

  // Håndter loggføring
  const handleLoggfoer = (e: React.FormEvent) => {
    e.preventDefault();
    if (loggSteg === "UTEN_BALL") {
      setRepsData((prev) => ({
        ...prev,
        utenBall: { ...prev.utenBall, gjort: prev.utenBall.gjort + loggReps },
      }));
    } else if (loggSteg === "LAV_FART") {
      setRepsData((prev) => ({
        ...prev,
        lavFart: { ...prev.lavFart, gjort: prev.lavFart.gjort + loggReps },
      }));
    } else {
      setRepsData((prev) => ({
        ...prev,
        auto: { ...prev.auto, gjort: prev.auto.gjort + loggReps },
      }));
    }
    setLoggSuksess(true);
    setTimeout(() => {
      setLoggSuksess(false);
      setVisLoggModal(false);
      setLoggNotat("");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#141413] font-sans antialiased p-4 sm:p-6 lg:p-8 space-y-6">
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER: SPILLERKONTEKST, PLANSTATUS & MÅLSETNING
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-lg border border-[#DDD9D1] p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#B83217] font-bold">
              TEKNISK PLAN · AK GOLF HQ
            </span>
            <span className="text-xs text-[#DDD9D1]">|</span>
            <span className="text-[11px] font-mono text-[#736E65] flex items-center gap-1">
              <User size={12} />
              Magnus Aasheim (Trener: Anders Kristiansen)
            </span>
            <span className="text-xs text-[#DDD9D1]">|</span>
            <span className="text-[11px] font-mono text-[#0D6338] bg-[#0D6338]/10 px-2 py-0.5 rounded font-medium">
              Fase 2: Innarbeides (Lav fart)
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#141413] tracking-tight mt-1.5">
            Grunnslag: 5 meter draw (7-jern / Driver)
          </h1>
          <p className="text-xs sm:text-sm text-[#736E65] mt-1 max-w-2xl">
            Systematisk innarbeiding av svingretning, nøytralt P4-håndledd og P6-levering for å etablere en forutsigbar 5 meter kurve mot målet.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs font-mono text-[#736E65]">
            <span className="flex items-center gap-1.5">
              <Calendar size={13} className="text-[#B83217]" />
              Måldato: <strong className="text-[#141413]">15. februar 2027</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={13} className="text-[#736E65]" />
              Gjenværende tid: <strong>20 uker</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Target size={13} className="text-[#0D6338]" />
              Fokusområder: <strong>P4.0 Topp & P6.0 Levering</strong>
            </span>
          </div>
        </div>

        {/* Progresjon & Handlingsknapp */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0 bg-[#FAF8F3] p-4 rounded-lg border border-[#DDD9D1] min-w-[260px]">
          <div className="w-full">
            <div className="flex justify-between items-center text-xs font-mono mb-1.5">
              <span className="text-[#736E65]">TOTAL PROGRESJON</span>
              <span className="font-bold text-[#141413]">
                {totalGjort} / {totalMaal} reps ({totalProsent} %)
              </span>
            </div>
            <div className="w-full h-2.5 bg-[#E8E4DC] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#141413] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, totalProsent)}%` }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setVisLoggModal(true)}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-mono font-bold bg-[#B83217] hover:bg-[#9B2415] text-white rounded transition-colors shadow-2xs"
          >
            <Plus size={14} />
            Loggfør repetisjoner i treningsdagboka
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. SEKSJON: TRACKMAN RADARMÅL & TOLERANSER
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-lg border border-[#DDD9D1] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8E4DC] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Compass size={16} className="text-[#B83217]" />
              <h2 className="text-sm sm:text-base font-bold text-[#141413] tracking-tight">
                TrackMan Radarmål & Toleranser (5 meter draw)
              </h2>
            </div>
            <p className="text-xs text-[#736E65] mt-0.5">
              Nøkkeltall som bekrefter at svingen produserer ønsket startlinje og 5 meters draw-kurve.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono">
            <span className="inline-flex items-center gap-1 text-[#0D6338] bg-[#0D6338]/10 px-2 py-0.5 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D6338]" />
              Grønn = Innenfor toleranse
            </span>
            <span className="inline-flex items-center gap-1 text-[#B85D19] bg-[#B85D19]/10 px-2 py-0.5 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B85D19]" />
              Gul = Må justeres
            </span>
          </div>
        </div>

        {/* Rutenett med TrackMan-parametere */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-[#FAF8F3] p-3 rounded-md border border-[#DDD9D1]">
            <span className="text-[10px] font-mono text-[#736E65] uppercase block">Swing Direction</span>
            <div className="text-xl font-mono font-bold text-[#141413] mt-0.5">+3.0°</div>
            <div className="text-[10px] font-mono text-[#736E65] mt-1">Toleranse: +2.0° til +4.0°</div>
            <div className="mt-2 text-[11px] font-mono font-medium text-[#0D6338] bg-white border border-[#DDD9D1] px-1.5 py-0.5 rounded text-center">
              Snitt: +2.8° ✓
            </div>
          </div>

          <div className="bg-[#FAF8F3] p-3 rounded-md border border-[#DDD9D1]">
            <span className="text-[10px] font-mono text-[#736E65] uppercase block">Club Path</span>
            <div className="text-xl font-mono font-bold text-[#141413] mt-0.5">+2.5°</div>
            <div className="text-[10px] font-mono text-[#736E65] mt-1">Toleranse: +1.5° til +3.5°</div>
            <div className="mt-2 text-[11px] font-mono font-medium text-[#0D6338] bg-white border border-[#DDD9D1] px-1.5 py-0.5 rounded text-center">
              Snitt: +2.4° ✓
            </div>
          </div>

          <div className="bg-[#FAF8F3] p-3 rounded-md border border-[#DDD9D1]">
            <span className="text-[10px] font-mono text-[#736E65] uppercase block">Face to Path</span>
            <div className="text-xl font-mono font-bold text-[#141413] mt-0.5">-1.2°</div>
            <div className="text-[10px] font-mono text-[#736E65] mt-1">Toleranse: -0.8° til -1.6°</div>
            <div className="mt-2 text-[11px] font-mono font-medium text-[#B85D19] bg-[#B85D19]/10 border border-[#B85D19]/30 px-1.5 py-0.5 rounded text-center">
              Snitt: -1.9° (Justeres)
            </div>
          </div>

          <div className="bg-[#FAF8F3] p-3 rounded-md border border-[#DDD9D1]">
            <span className="text-[10px] font-mono text-[#736E65] uppercase block">Attack Angle</span>
            <div className="text-xl font-mono font-bold text-[#141413] mt-0.5">-3.5°</div>
            <div className="text-[10px] font-mono text-[#736E65] mt-1">Toleranse: -2.5° til -4.5°</div>
            <div className="mt-2 text-[11px] font-mono font-medium text-[#0D6338] bg-white border border-[#DDD9D1] px-1.5 py-0.5 rounded text-center">
              Snitt: -3.2° ✓
            </div>
          </div>

          <div className="bg-[#FAF8F3] p-3 rounded-md border border-[#DDD9D1]">
            <span className="text-[10px] font-mono text-[#736E65] uppercase block">Club Speed (7I)</span>
            <div className="text-xl font-mono font-bold text-[#141413] mt-0.5">88 mph</div>
            <div className="text-[10px] font-mono text-[#736E65] mt-1">Toleranse: 86–90 mph</div>
            <div className="mt-2 text-[11px] font-mono font-medium text-[#0D6338] bg-white border border-[#DDD9D1] px-1.5 py-0.5 rounded text-center">
              Snitt: 88.4 mph ✓
            </div>
          </div>

          <div className="bg-[#FAF8F3] p-3 rounded-md border border-[#DDD9D1]">
            <span className="text-[10px] font-mono text-[#736E65] uppercase block">Smash Factor</span>
            <div className="text-xl font-mono font-bold text-[#141413] mt-0.5">1.38</div>
            <div className="text-[10px] font-mono text-[#736E65] mt-1">Toleranse: &gt; 1.36</div>
            <div className="mt-2 text-[11px] font-mono font-medium text-[#0D6338] bg-white border border-[#DDD9D1] px-1.5 py-0.5 rounded text-center">
              Snitt: 1.39 ✓
            </div>
          </div>
        </div>

        {/* Ballbane-forklaring */}
        <div className="bg-[#FAF8F3] p-3 rounded-md border border-[#DDD9D1] flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#B83217]" />
            <span className="font-mono text-[#141413]">
              <strong>Målbilde ballflukt:</strong> Ballen starter <strong>+1.5° høyre</strong> for flagget, stiger til <strong>28 m topphøyde</strong>, og kurver <strong>5 meter mot venstre</strong> med myk landing på green.
            </span>
          </div>
          <span className="text-[11px] font-mono text-[#736E65] shrink-0">
            Kølle: 7-jern · Carry 158 m
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. SEKSJON: P1–P10 SVINGTIDSLINJE & SPESIFIKKE OPPGAVER
         ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Venstre kolonne: P-posisjonstidslinje (5 av 12 kolonner) */}
        <div className="lg:col-span-5 bg-white rounded-lg border border-[#DDD9D1] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8E4DC] pb-3">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#141413] tracking-tight">
                P-posisjoner (P1–P10)
              </h2>
              <p className="text-xs text-[#736E65]">
                Velg en posisjon for å inspisere oppgaven, trenerens fasit og spillerens video.
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-[#FAF8F3] border border-[#DDD9D1] px-2 py-1 rounded">
              10 Posisjoner
            </span>
          </div>

          <div className="space-y-1.5">
            {pPosisjoner.map((p) => {
              const erValgt = p.pNum === valgtPNum;
              return (
                <button
                  key={p.pNum}
                  type="button"
                  onClick={() => setValgtPNum(p.pNum)}
                  className={`w-full text-left p-2.5 rounded-md border transition-all flex items-center justify-between ${
                    erValgt
                      ? "bg-[#141413] text-white border-[#141413] shadow-xs"
                      : "bg-[#FAF8F3] hover:bg-white text-[#141413] border-[#DDD9D1]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        erValgt
                          ? "bg-white text-[#141413]"
                          : p.fokus
                          ? "bg-[#B83217] text-white"
                          : "bg-[#E8E4DC] text-[#736E65]"
                      }`}
                    >
                      {p.pNum}
                    </span>
                    <div>
                      <div className="text-xs font-semibold leading-tight flex items-center gap-1.5">
                        {p.navn}
                        {p.fokus && (
                          <span
                            className={`text-[9px] font-mono uppercase px-1 py-0.2 rounded font-bold ${
                              erValgt ? "bg-[#B83217] text-white" : "bg-[#B83217]/15 text-[#B83217]"
                            }`}
                          >
                            Hovedfokus
                          </span>
                        )}
                      </div>
                      <div
                        className={`text-[10px] mt-0.5 line-clamp-1 ${
                          erValgt ? "text-[#DDD9D1]" : "text-[#736E65]"
                        }`}
                      >
                        {p.sjekkpunkter[0]}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {p.status === "FERDIG" && (
                      <CheckCircle2
                        size={14}
                        className={erValgt ? "text-emerald-400" : "text-[#0D6338]"}
                      />
                    )}
                    {p.status === "PAGAAR" && (
                      <span
                        className={`w-2 h-2 rounded-full animate-pulse ${
                          erValgt ? "bg-amber-400" : "bg-[#B85D19]"
                        }`}
                      />
                    )}
                    <ChevronRight
                      size={14}
                      className={erValgt ? "text-white" : "text-[#736E65]"}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Høyre kolonne: Detaljvisning med video, bilde og oppgavedetaljer (7 av 12 kolonner) */}
        <div className="lg:col-span-7 bg-white rounded-lg border border-[#DDD9D1] p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8E4DC] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold bg-[#B83217] text-white px-2 py-0.5 rounded">
                  {aktivP.pNum}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-[#141413]">
                  {aktivP.navn}
                </h3>
              </div>
              <p className="text-xs text-[#736E65] mt-1">
                Oppgavespesifikasjon og sjekkliste for riktig bevegelsesmønster.
              </p>
            </div>
            <span
              className={`text-xs font-mono px-2.5 py-1 rounded font-medium shrink-0 self-start sm:self-center ${
                aktivP.status === "FERDIG"
                  ? "bg-[#0D6338]/10 text-[#0D6338]"
                  : aktivP.status === "PAGAAR"
                  ? "bg-[#B85D19]/10 text-[#B85D19]"
                  : "bg-[#736E65]/10 text-[#736E65]"
              }`}
            >
              {aktivP.status === "FERDIG" && "Godkjent av trener"}
              {aktivP.status === "PAGAAR" && "Aktivt innarbeides"}
              {aktivP.status === "PLANLAGT" && "Neste fase"}
            </span>
          </div>

          {/* Video & Bilde seksjon (Side-om-side: Fasit vs Spiller) */}
          <div className="space-y-3">
            <span className="text-[10px] font-mono text-[#736E65] uppercase tracking-wider block font-bold">
              VISUELL KONTROLL & SAMMENLIGNING (SPLIT-SCREEN)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Trenerens Fasit */}
              <div className="bg-[#141413] text-white rounded-lg p-3 relative overflow-hidden flex flex-col justify-between aspect-video sm:aspect-4/3 group">
                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase bg-[#B83217] text-white px-2 py-0.5 rounded font-bold">
                    Trenerens Fasit
                  </span>
                  <Camera size={14} className="text-[#DDD9D1]" />
                </div>

                {/* Sentrert Play-knapp */}
                <div className="relative z-10 flex flex-col items-center justify-center my-auto text-center">
                  <button
                    type="button"
                    className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-xs flex items-center justify-center text-white transition-transform hover:scale-105"
                  >
                    <Play size={20} className="ml-1 fill-white" />
                  </button>
                  <span className="text-xs font-mono text-white/90 mt-2 font-medium">
                    {aktivP.referanseVideoTittel}
                  </span>
                </div>

                <div className="relative z-10 text-[10px] font-mono text-[#DDD9D1] flex justify-between">
                  <span>Modell: Anders Kristiansen</span>
                  <span>4K 120 FPS</span>
                </div>

                {/* Bakgrunns-overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-black/20" />
              </div>

              {/* Spillerens Siste Video */}
              <div className="bg-[#FAF8F3] border border-[#DDD9D1] rounded-lg p-3 relative overflow-hidden flex flex-col justify-between aspect-video sm:aspect-4/3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase bg-[#141413] text-white px-2 py-0.5 rounded font-bold">
                    Magnus Siste Logg
                  </span>
                  <span className="text-[10px] font-mono text-[#736E65]">
                    {aktivP.spillerSisteVideoDato || "Ingen video ennå"}
                  </span>
                </div>

                {aktivP.spillerSisteVideoTittel ? (
                  <div className="flex flex-col items-center justify-center my-auto text-center">
                    <button
                      type="button"
                      className="w-12 h-12 rounded-full bg-[#141413] hover:bg-[#333] flex items-center justify-center text-white transition-transform hover:scale-105"
                    >
                      <Play size={20} className="ml-1 fill-white" />
                    </button>
                    <span className="text-xs font-mono text-[#141413] mt-2 font-medium">
                      {aktivP.spillerSisteVideoTittel}
                    </span>
                    <span className="text-[10px] text-[#0D6338] font-mono mt-0.5 font-bold">
                      Evaluert av trener: 8.5/10
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center my-auto text-center p-4">
                    <Upload size={24} className="text-[#736E65] mb-2" />
                    <span className="text-xs font-mono text-[#736E65]">
                      Ingen video registrert for denne posisjonen ennå.
                    </span>
                    <button
                      type="button"
                      onClick={() => setVisLoggModal(true)}
                      className="mt-2 text-xs font-mono font-bold text-[#B83217] hover:underline"
                    >
                      Last opp svingvideo her
                    </button>
                  </div>
                )}

                <div className="text-[10px] font-mono text-[#736E65] flex justify-between">
                  <span>iPhone 15 Pro</span>
                  <span>Face-on vinkel</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sjekkpunkter og Trener-instruks */}
          <div className="space-y-3 pt-2">
            <span className="text-[10px] font-mono text-[#736E65] uppercase tracking-wider block font-bold">
              TEKNISKE SJEKKPUNKTER
            </span>
            <div className="space-y-2">
              {aktivP.sjekkpunkter.map((punkt, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 text-xs bg-[#FAF8F3] p-2.5 rounded border border-[#DDD9D1]"
                >
                  <CheckCircle2
                    size={14}
                    className="text-[#B83217] shrink-0 mt-0.5"
                  />
                  <span className="text-[#141413] font-medium">{punkt}</span>
                </div>
              ))}
            </div>

            {/* Trenernotat */}
            <div className="bg-[#FAF8F3] border-l-4 border-[#B83217] p-3 rounded-r-md text-xs mt-3">
              <div className="flex items-center gap-1.5 font-mono font-bold text-[#B83217] mb-1">
                <Sparkles size={13} />
                TRENERNOTAT FRA ANDERS
              </div>
              <p className="text-[#141413] leading-relaxed">{aktivP.trenerTips}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. SEKSJON: DE 3 MOTORISKE LÆRINGSSTEGENE (REPETISJONSKRAV)
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-lg border border-[#DDD9D1] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8E4DC] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-[#B83217]" />
              <h2 className="text-sm sm:text-base font-bold text-[#141413] tracking-tight">
                De 3 Motoriske Læringsstegene (Repetisjonskrav)
              </h2>
            </div>
            <p className="text-xs text-[#736E65] mt-0.5">
              Hvert steg krever dokumenterte repetisjoner før spilleren rykker opp til neste hastighet og press.
            </p>
          </div>
          <span className="text-xs font-mono text-[#736E65]">
            Totalt mål: <strong>1 000 reps</strong> for full automatisering
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Steg 1: Uten ball */}
          <div className="bg-[#FAF8F3] p-4 rounded-lg border border-[#0D6338] relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase font-bold text-[#0D6338] bg-[#0D6338]/10 px-2 py-0.5 rounded">
                Steg 1 · Fullført ✓
              </span>
              <CheckCircle2 size={16} className="text-[#0D6338]" />
            </div>
            <h3 className="text-sm font-bold text-[#141413]">Uten ball (Slow-motion & speil)</h3>
            <p className="text-xs text-[#736E65] mt-1">
              Innøve følelse og posisjon i speil/drills uten ballkontakt eller distraksjon fra ballflukt.
            </p>

            <div className="mt-4 pt-3 border-t border-[#DDD9D1]">
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-[#736E65]">Gjennomført:</span>
                <span className="font-bold text-[#0D6338]">
                  {repsData.utenBall.gjort} / {repsData.utenBall.maal} reps (100 %)
                </span>
              </div>
              <div className="w-full h-2 bg-[#E8E4DC] rounded-full overflow-hidden">
                <div className="h-full bg-[#0D6338] w-full" />
              </div>
            </div>
          </div>

          {/* Steg 2: Lav hastighet */}
          <div className="bg-[#FAF8F3] p-4 rounded-lg border-2 border-[#B83217] relative shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase font-bold text-white bg-[#B83217] px-2 py-0.5 rounded">
                Steg 2 · Aktivt fokus
              </span>
              <span className="text-xs font-mono font-bold text-[#B83217]">50–70 % FART</span>
            </div>
            <h3 className="text-sm font-bold text-[#141413]">Lav hastighet med ball</h3>
            <p className="text-xs text-[#736E65] mt-1">
              Slag med ball i kontrollert tempo på TrackMan og i nett. Bekrefte svingretning og P4/P6-kontroll.
            </p>

            <div className="mt-4 pt-3 border-t border-[#DDD9D1]">
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-[#736E65]">Gjennomført:</span>
                <span className="font-bold text-[#B83217]">
                  {repsData.lavFart.gjort} / {repsData.lavFart.maal} reps (
                  {Math.round((repsData.lavFart.gjort / repsData.lavFart.maal) * 100)} %)
                </span>
              </div>
              <div className="w-full h-2 bg-[#E8E4DC] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#B83217] transition-all"
                  style={{
                    width: `${(repsData.lavFart.gjort / repsData.lavFart.maal) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Steg 3: Automatikk */}
          <div className="bg-[#FAF8F3] p-4 rounded-lg border border-[#DDD9D1] relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase font-bold text-[#736E65] bg-[#E8E4DC] px-2 py-0.5 rounded">
                Steg 3 · Neste fase
              </span>
              <span className="text-xs font-mono text-[#736E65]">100 % FART</span>
            </div>
            <h3 className="text-sm font-bold text-[#141413]">Automatikk & Konkurranse</h3>
            <p className="text-xs text-[#736E65] mt-1">
              Full hastighet under press på rangen og ute på banen. Slagene utføres på ren underbevisst intuisjon.
            </p>

            <div className="mt-4 pt-3 border-t border-[#DDD9D1]">
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-[#736E65]">Gjennomført:</span>
                <span className="font-bold text-[#141413]">
                  {repsData.auto.gjort} / {repsData.auto.maal} reps (
                  {Math.round((repsData.auto.gjort / repsData.auto.maal) * 100)} %)
                </span>
              </div>
              <div className="w-full h-2 bg-[#E8E4DC] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#141413] transition-all"
                  style={{
                    width: `${(repsData.auto.gjort / repsData.auto.maal) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          5. SEKSJON: HVOR SKAL DET GJØRES? (ARENA & TRENINGSMILJØ)
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-lg border border-[#DDD9D1] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8E4DC] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-[#B83217]" />
              <h2 className="text-sm sm:text-base font-bold text-[#141413] tracking-tight">
                Hvor skal det gjøres? (Treningsarenaer & Fordeling)
              </h2>
            </div>
            <p className="text-xs text-[#736E65] mt-0.5">
              Teknikken må testes og herdes på tvers av ulike treningsmiljøer for å overføres til spill under press.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(Object.keys(arenaData) as ArenaMiljo[]).map((key) => {
            const arena = arenaData[key];
            const prosent = Math.round((arena.gjort / arena.maal) * 100);
            return (
              <div
                key={key}
                className="bg-[#FAF8F3] p-4 rounded-lg border border-[#DDD9D1] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-[#141413] font-mono">{arena.navn}</span>
                    <span className="text-[11px] font-mono font-bold text-[#736E65]">
                      {prosent} %
                    </span>
                  </div>
                  <p className="text-xs text-[#736E65] leading-relaxed min-h-[40px]">
                    {arena.beskrivelse}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#DDD9D1]">
                  <div className="flex justify-between text-[11px] font-mono mb-1">
                    <span className="text-[#736E65]">Repetisjoner:</span>
                    <span className="font-bold text-[#141413]">
                      {arena.gjort} / {arena.maal}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#E8E4DC] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#141413] rounded-full"
                      style={{ width: `${Math.min(100, prosent)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          6. SEKSJON: LOGGFØRTE ØKTER & TRENERFEEDBACK (HISTORIKK)
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-lg border border-[#DDD9D1] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8E4DC] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-[#B83217]" />
              <h2 className="text-sm sm:text-base font-bold text-[#141413] tracking-tight">
                Treningsdagbok: Siste tekniske økter & Trenerfeedback
              </h2>
            </div>
            <p className="text-xs text-[#736E65] mt-0.5">
              Hver økt registreres med antall repetisjoner, arena, læringssteg og videoopplasting.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setVisLoggModal(true)}
            className="text-xs font-mono font-bold text-[#B83217] hover:underline flex items-center gap-1 self-start sm:self-center"
          >
            <Plus size={14} /> Ny registrering
          </button>
        </div>

        <div className="space-y-3">
          {/* Økt 1 */}
          <div className="bg-[#FAF8F3] p-4 rounded-lg border border-[#DDD9D1] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold bg-[#141413] text-white px-2 py-0.5 rounded">
                  25.09.2026
                </span>
                <span className="text-xs font-bold text-[#141413]">
                  TrackMan · 40 repetisjoner (Lav fart 60 %)
                </span>
                <span className="text-[10px] font-mono text-[#0D6338] bg-[#0D6338]/10 px-2 py-0.5 rounded font-bold">
                  Godkjent av Anders
                </span>
              </div>
              <p className="text-xs text-[#736E65]">
                Fokus på P4 topp: Flat venstre håndledd. Siste 15 slag med club path stabilt på +2.6° in-to-out.
              </p>
              <div className="text-[11px] font-mono text-[#141413] bg-white p-2 rounded border border-[#DDD9D1] mt-2">
                <strong>Trenerkommentar Anders:</strong> «Veldig god fremgang på håndleddet i P4! Du henger ikke igjen med hoftene lenger. Fortsett med 50 reps på 70 % fart i morgen.»
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="bg-black text-white px-3 py-2 rounded text-center font-mono">
                <span className="text-[10px] text-white/70 block uppercase">Video</span>
                <span className="text-xs font-bold flex items-center gap-1">
                  <Play size={10} className="fill-white" /> 00:42
                </span>
              </div>
            </div>
          </div>

          {/* Økt 2 */}
          <div className="bg-[#FAF8F3] p-4 rounded-lg border border-[#DDD9D1] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold bg-[#736E65] text-white px-2 py-0.5 rounded">
                  23.09.2026
                </span>
                <span className="text-xs font-bold text-[#141413]">
                  I nett · 60 repetisjoner (Uten ball & speil)
                </span>
                <span className="text-[10px] font-mono text-[#0D6338] bg-[#0D6338]/10 px-2 py-0.5 rounded font-bold">
                  Godkjent av Anders
                </span>
              </div>
              <p className="text-xs text-[#736E65]">
                P6 leveringsdrills foran speil. Arbeidet med å beholde køllehodet bak hendene.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="bg-black text-white px-3 py-2 rounded text-center font-mono">
                <span className="text-[10px] text-white/70 block uppercase">Video</span>
                <span className="text-xs font-bold flex items-center gap-1">
                  <Play size={10} className="fill-white" /> 01:15
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MODAL: LOGGFØR REPETISJONER I TRENINGSDAGBOKA
         ───────────────────────────────────────────────────────────── */}
      {visLoggModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#DDD9D1] shadow-xl max-w-lg w-full p-6 space-y-4 animate-in fade-in-0 zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#E8E4DC] pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#B83217] font-bold">
                  TRENINGSDAGBOK · LOGGFØRING
                </span>
                <h3 className="text-lg font-bold text-[#141413]">
                  Registrer tekniske repetisjoner
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setVisLoggModal(false)}
                className="text-[#736E65] hover:text-[#141413] p-1 rounded"
              >
                ✕
              </button>
            </div>

            {loggSuksess ? (
              <div className="p-6 text-center space-y-2">
                <CheckCircle2 size={40} className="text-[#0D6338] mx-auto" />
                <h4 className="text-base font-bold text-[#141413]">Repetisjoner loggført!</h4>
                <p className="text-xs text-[#736E65]">
                  {loggReps} reps lagret i treningsdagboka og sendt til trener Anders.
                </p>
              </div>
            ) : (
              <form onSubmit={handleLoggfoer} className="space-y-4 text-xs">
                {/* Arena-velger */}
                <div>
                  <label className="block font-mono text-[11px] text-[#736E65] uppercase mb-1 font-bold">
                    Hvor ble det gjort? (Arena)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(arenaData) as ArenaMiljo[]).map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setLoggArena(key)}
                        className={`p-2 rounded border text-left font-mono transition-colors ${
                          loggArena === key
                            ? "bg-[#141413] text-white border-[#141413] font-bold"
                            : "bg-[#FAF8F3] text-[#141413] border-[#DDD9D1]"
                        }`}
                      >
                        {arenaData[key].navn}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Motorisk steg-velger */}
                <div>
                  <label className="block font-mono text-[11px] text-[#736E65] uppercase mb-1 font-bold">
                    Motorisk læringssteg
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setLoggSteg("UTEN_BALL")}
                      className={`p-2 rounded border text-center font-mono ${
                        loggSteg === "UTEN_BALL"
                          ? "bg-[#141413] text-white border-[#141413] font-bold"
                          : "bg-[#FAF8F3] text-[#141413] border-[#DDD9D1]"
                      }`}
                    >
                      Uten ball
                    </button>
                    <button
                      type="button"
                      onClick={() => setLoggSteg("LAV_FART")}
                      className={`p-2 rounded border text-center font-mono ${
                        loggSteg === "LAV_FART"
                          ? "bg-[#B83217] text-white border-[#B83217] font-bold"
                          : "bg-[#FAF8F3] text-[#141413] border-[#DDD9D1]"
                      }`}
                    >
                      Lav fart (50 %)
                    </button>
                    <button
                      type="button"
                      onClick={() => setLoggSteg("AUTO")}
                      className={`p-2 rounded border text-center font-mono ${
                        loggSteg === "AUTO"
                          ? "bg-[#141413] text-white border-[#141413] font-bold"
                          : "bg-[#FAF8F3] text-[#141413] border-[#DDD9D1]"
                      }`}
                    >
                      Auto (100 %)
                    </button>
                  </div>
                </div>

                {/* Antall repetisjoner */}
                <div>
                  <label className="block font-mono text-[11px] text-[#736E65] uppercase mb-1 font-bold">
                    Antall repetisjoner: {loggReps} reps
                  </label>
                  <div className="flex items-center gap-2">
                    {[15, 30, 50, 75, 100].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setLoggReps(num)}
                        className={`flex-1 py-1.5 rounded border text-xs font-mono ${
                          loggReps === num
                            ? "bg-[#141413] text-white border-[#141413] font-bold"
                            : "bg-[#FAF8F3] text-[#141413] border-[#DDD9D1]"
                        }`}
                      >
                        +{num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Video / Bilde opplasting */}
                <div>
                  <label className="block font-mono text-[11px] text-[#736E65] uppercase mb-1 font-bold">
                    Last opp video eller bilde av økten (P-posisjon)
                  </label>
                  <div className="border-2 border-dashed border-[#DDD9D1] rounded-lg p-4 text-center bg-[#FAF8F3] hover:bg-white cursor-pointer transition-colors">
                    <Upload size={20} className="mx-auto text-[#736E65] mb-1" />
                    <span className="text-xs font-medium text-[#141413] block">
                      Klikk for å velge svingvideo fra mobil / datamaskin
                    </span>
                    <span className="text-[10px] text-[#736E65] font-mono">
                      MP4, MOV eller JPG (maks 150 MB)
                    </span>
                  </div>
                </div>

                {/* Egenvurdering og notater */}
                <div>
                  <label className="block font-mono text-[11px] text-[#736E65] uppercase mb-1 font-bold">
                    Øktnotat til treneren
                  </label>
                  <textarea
                    rows={2}
                    value={loggNotat}
                    onChange={(e) => setLoggNotat(e.target.value)}
                    placeholder="Hvordan føltes håndleddet og rotasjonen? Noen spesifikke tall fra TrackMan?"
                    className="w-full bg-[#FAF8F3] border border-[#DDD9D1] rounded p-2 text-xs text-[#141413] focus:outline-hidden focus:border-[#141413]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setVisLoggModal(false)}
                    className="px-4 py-2 border border-[#DDD9D1] text-[#736E65] hover:text-[#141413] rounded font-mono text-xs"
                  >
                    Avbryt
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#B83217] hover:bg-[#9B2415] text-white rounded font-mono font-bold text-xs"
                  >
                    Lagre i treningsdagboka
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
