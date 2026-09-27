"use client";

import React, { useState } from "react";
import {
  Calendar,
  Clock,
  Target,
  Dumbbell,
  Compass,
  TrendingUp,
  Sparkles,
} from "lucide-react";

export type PyramideNivaa = "TURN" | "SPILL" | "SLAG" | "TEK" | "FYS";

export interface PeriodeData {
  id: string;
  navn: string;
  typeKode: "GRUNN" | "SPESIAL" | "TURNERING" | "EVALUERING" | "TESTUKE" | "TRENINGSSAMLING" | "FERIE";
  typeNavn: string;
  fraDato: string;
  tilDato: string;
  uker: number;
  hovedfokus: string;
  ukevolumTimer: number;
  totaltTimerPlanlagt: number;
  timerGjennomfort: number;
  oktBudsjettPerUke: number;
  fordeling: {
    FYS: number; // prosent
    TEK: number;
    SLAG: number;
    SPILL: number;
    TURN: number;
  };
  periodemaal: string[];
}

const PERIODER: PeriodeData[] = [
  {
    id: "p1",
    navn: "Grunnperiode Vinter",
    typeKode: "GRUNN",
    typeNavn: "Grunnperiode",
    fraDato: "01.11.2026",
    tilDato: "15.01.2027",
    uker: 11,
    hovedfokus: "P4 topp-posisjon, ballhastighet driver og relativ styrke i trapbar",
    ukevolumTimer: 14,
    totaltTimerPlanlagt: 154,
    timerGjennomfort: 68,
    oktBudsjettPerUke: 6,
    fordeling: {
      FYS: 30,
      TEK: 35,
      SLAG: 20,
      SPILL: 10,
      TURN: 5,
    },
    periodemaal: [
      "Øke Driver Ball Speed fra 168 til 172 mph (TrackMan)",
      "Trapbar markløft 1RM økes fra 175 kg til 190 kg (> 2.3x kroppsvekt)",
      "P4 håndleddsvinkel: Nøytralisere cupping til flat venstre håndledd",
      "Kondisjon: Under 11:15 på 3000 meter i testuken",
    ],
  },
  {
    id: "p2",
    navn: "Spesialperiode Nærspill & Fart",
    typeKode: "SPESIAL",
    typeNavn: "Spesialperiode",
    fraDato: "16.01.2027",
    tilDato: "28.02.2027",
    uker: 6,
    hovedfokus: "Lengdekontroll wedger 50–100 m og TrackMan Club Speed",
    ukevolumTimer: 16,
    totaltTimerPlanlagt: 96,
    timerGjennomfort: 0,
    oktBudsjettPerUke: 7,
    fordeling: {
      FYS: 20,
      TEK: 40,
      SLAG: 25,
      SPILL: 10,
      TURN: 5,
    },
    periodemaal: [
      "Wedge proximity på 70m under 3.8 meter i snitt",
      "Rotasjonskast med 3 kg medisinball > 15.5 meter",
      "Optimalisere attack angle på driver til +3.5°",
    ],
  },
  {
    id: "p3",
    navn: "Treningssamling Mar Menor",
    typeKode: "TRENINGSSAMLING",
    typeNavn: "Treningssamling",
    fraDato: "01.03.2027",
    tilDato: "10.03.2027",
    uker: 1.5,
    hovedfokus: "Gresstrening, banespill, Tiger 5-strategi og scoring",
    ukevolumTimer: 24,
    totaltTimerPlanlagt: 36,
    timerGjennomfort: 0,
    oktBudsjettPerUke: 10,
    fordeling: {
      FYS: 15,
      TEK: 20,
      SLAG: 25,
      SPILL: 30,
      TURN: 10,
    },
    periodemaal: [
      "Overgang fra matte til gress med rene balltreff",
      "Gjennomføre 5 runder med full Tiger 5-statistikk",
      "Puttinghastighet på 11+ stimp",
    ],
  },
];

export function PeriodeplanPyramideView() {
  const [valgtPeriodeId, setValgtPeriodeId] = useState<string>("p1");
  const [aktivPyramideNivaa, setAktivPyramideNivaa] = useState<PyramideNivaa>("TEK");
  const [valgtPPos, setValgtPPos] = useState<string>("P4.0");
  const [valgtKolle, setValgtKolle] = useState<string>("Driver");
  const [valgtKurve, setValgtKurve] = useState<string>("Svak draw");

  const valgtPeriode =
    PERIODER.find((p) => p.id === valgtPeriodeId) || PERIODER[0];

  // Informasjon for hvert pyramidenivå
  const pyramideDetaljer = {
    TURN: {
      tittel: "TURN · Turnering & Konkurransepress",
      ingress: "Forberedelse, spillestrategi og gjennomføring med maksimalt press.",
      farge: "#9B2415",
      prosent: valgtPeriode.fordeling.TURN,
      okterEstimert: Math.round((valgtPeriode.oktBudsjettPerUke * valgtPeriode.fordeling.TURN) / 100),
      omraader: ["Turneringsspill", "Prøverundeprotokoll", "Pre-shot rutine under press", "Brutto scorekort"],
      param: "Turneringer: Srixon Tour, Norgescup, NM, WAGR-kvalifisering",
      formel: "TURN_BANE_KONKURRANSE_TURNERING",
    },
    SPILL: {
      tittel: "SPILL · Banespill & Banestrategi",
      ingress: "Anvende ferdighetene i reelle spillsituasjoner for optimal score.",
      farge: "#0D6338",
      prosent: valgtPeriode.fordeling.SPILL,
      okterEstimert: Math.round((valgtPeriode.oktBudsjettPerUke * valgtPeriode.fordeling.SPILL) / 100),
      omraader: ["Golfbane (18 hull)", "Korthullsbane", "Simulator banespill", "Tiger 5-protokoll"],
      param: "Fokus: Unngå doble bogeys, unngå 3-putts, unngå straffeslag",
      formel: "SPILL_BANE_BANE_OBSERVERT",
    },
    SLAG: {
      tittel: "SLAG · Golfslag & Ballkontroll",
      ingress: "Utvikle spesifikke slagtyper, ballbaner, lengdekontroll og utfall.",
      farge: "#B85D19",
      prosent: valgtPeriode.fordeling.SLAG,
      okterEstimert: Math.round((valgtPeriode.oktBudsjettPerUke * valgtPeriode.fordeling.SLAG) / 100),
      omraader: ["Utslag (Tee Total)", "Innspill 50–200m", "Nærspill (chip/pitch/lob/bunker)", "Putting (6 fot-bånd)"],
      param: "Treningsmåte: Blokktrening vs Variasjonstrening vs Ferdighetstest",
      formel: "SLAG_INNSPILL_150_AUTO_TRENINGSOMRAADE_ALENE",
    },
    TEK: {
      tittel: "TEK · Teknisk sving & Bevegelsesmønster",
      ingress: "Systematisk svingutvikling basert på P-posisjoner, svinghastighet og TrackMan.",
      farge: "#17446F",
      prosent: valgtPeriode.fordeling.TEK,
      okterEstimert: Math.round((valgtPeriode.oktBudsjettPerUke * valgtPeriode.fordeling.TEK) / 100),
      omraader: ["P1–P10 svingtidslinje", "Motoriske læringssteg", "TrackMan radarmålinger", "Kølle- og ballflukt"],
      param: "Læringssteg: Uten ball (drills) → Lav hastighet (50 %) → Automatikk (100 %)",
      formel: "TEK_UTSLAG_LAV_HAST_TRENINGSOMRAADE_OBSERVERT",
    },
    FYS: {
      tittel: "FYS · Fysisk kapasitet & Mobilitet",
      ingress: "Fundamentet for rotasjonskraft, stabilitet, svinghastighet og skadefrihet.",
      farge: "#4C1D95",
      prosent: valgtPeriode.fordeling.FYS,
      okterEstimert: Math.round((valgtPeriode.oktBudsjettPerUke * valgtPeriode.fordeling.FYS) / 100),
      omraader: ["Styrke (Trapbar, Knebøy, Chins)", "Kondisjon (3000m, Yo-Yo test)", "Bevegelighet (Rotasjonskast 3kg ball)"],
      param: "Styring: Serier × Repetisjoner, Vekt, RIR (reps i reserve), Pauser",
      formel: "FYS_STYRKE_INNENDORS_ALENE",
    },
  };

  const aktivInfo = pyramideDetaljer[aktivPyramideNivaa];

  // P-posisjoner liste
  const pPosisjoner = [
    { num: "P1.0", navn: "Adresse & Oppstilling", sjekk: "Balansert tyngdepunkt, hoftevinkel og nøytralt grep" },
    { num: "P2.0", navn: "Takeaway", sjekk: "Kølle parallelt med bakken og tåen svakt vinklet mot ballinjen" },
    { num: "P3.0", navn: "Venstre arm parallell", sjekk: "90° håndleddsknekk, brystrotasjon i rute" },
    { num: "P4.0", navn: "Topp av baksving", sjekk: "Full rotasjon, flat venstre håndledd, stabil høyre hofte" },
    { num: "P5.0", navn: "Nedsving", sjekk: "Venstre arm parallell ned, bakkekraft etableres, lag bevares" },
    { num: "P6.0", navn: "Leveringsposisjon", sjekk: "Kølle parallell nedsving, hofter åpne, køllehode bak hendene" },
    { num: "P7.0", navn: "Impact (treffpunkt)", sjekk: "Forward shaft lean, kompresjon, åpen brystkasse mot mål" },
    { num: "P8.0", navn: "Gjennomgang", sjekk: "Kølle parallelt etter treff, full ekstensjon av armer" },
    { num: "P9.0", navn: "Follow-through", sjekk: "Høyre arm parallell, rotasjon fullføres mot målet" },
    { num: "P10.0", navn: "Finish", sjekk: "Full balanse over venstre hæl, brystkasse vendt mot målet" },
  ];

  const valgtPObj = pPosisjoner.find((p) => p.num === valgtPPos) || pPosisjoner[3];

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#141413] font-sans antialiased p-4 sm:p-6 lg:p-8 space-y-6">
      {/* ─────────────────────────────────────────────────────────────
          TOPP-HEADER: PERIODEPLANLEGGING & SESONGSTYRING
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-lg border border-[#DDD9D1] p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#9B2415] font-bold">
              AK GOLF HQ · PERIODISERING
            </span>
            <span className="text-xs text-[#DDD9D1]">|</span>
            <span className="text-[11px] font-mono text-[#736E65]">
              SESONG 2026/2027
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#141413] tracking-tight mt-1">
            Periodeplan & Utviklingspyramiden
          </h1>
          <p className="text-xs sm:text-sm text-[#736E65] mt-1 max-w-2xl">
            Styrer spillerens volum, øktbudsjett og målsetninger. Trykk på pyramiden for å inspisere hva hvert nivå inneholder av svingposisjoner, radartall og fysiske krav.
          </p>
        </div>

        {/* Periode-velger */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
          <div className="bg-[#FAF8F3] p-1 rounded-md border border-[#DDD9D1] flex items-center gap-1">
            {PERIODER.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setValgtPeriodeId(p.id)}
                className={`px-3 py-1.5 text-xs font-mono rounded transition-colors whitespace-nowrap ${
                  valgtPeriodeId === p.id
                    ? "bg-[#141413] text-white font-bold shadow-2xs"
                    : "text-[#736E65] hover:text-[#141413]"
                }`}
              >
                {p.navn}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          PERIODE-KPIER: VOLUM, ØKTBUDSJETT OG STATUS
         ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-lg border border-[#DDD9D1] shadow-xs">
          <div className="text-[10px] font-mono uppercase text-[#736E65] flex items-center justify-between">
            <span>DATOSPENN & VARIGHET</span>
            <Calendar className="w-3.5 h-3.5 text-[#9B2415]" />
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-[#141413] mt-1">
            {valgtPeriode.fraDato} – {valgtPeriode.tilDato}
          </div>
          <div className="text-xs text-[#736E65] mt-0.5 font-mono">
            {valgtPeriode.uker} uker ({valgtPeriode.typeNavn})
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#DDD9D1] shadow-xs">
          <div className="text-[10px] font-mono uppercase text-[#736E65] flex items-center justify-between">
            <span>UKEVOLUM & MENGDE</span>
            <Clock className="w-3.5 h-3.5 text-[#141413]" />
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-[#141413] mt-1">
            {valgtPeriode.ukevolumTimer} timer / uke
          </div>
          <div className="text-xs text-[#736E65] mt-0.5">
            Totalt {valgtPeriode.totaltTimerPlanlagt}t planlagt ({valgtPeriode.timerGjennomfort}t gjennomført)
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#DDD9D1] shadow-xs">
          <div className="text-[10px] font-mono uppercase text-[#736E65] flex items-center justify-between">
            <span>ØKTBUDSJETT</span>
            <Target className="w-3.5 h-3.5 text-[#0D6338]" />
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-[#0D6338] mt-1">
            {valgtPeriode.oktBudsjettPerUke} økter / uke
          </div>
          <div className="text-xs text-[#736E65] mt-0.5">
            Fordelt på 5 pyramidenivåer
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#DDD9D1] shadow-xs">
          <div className="text-[10px] font-mono uppercase text-[#736E65] flex items-center justify-between">
            <span>HOVEDFOKUS</span>
            <Sparkles className="w-3.5 h-3.5 text-[#9B2415]" />
          </div>
          <div className="text-xs font-semibold text-[#141413] mt-1 line-clamp-2">
            {valgtPeriode.hovedfokus}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          HOVEDDEL: VISUELL PYRAMIDEFIGUR (VENSTRE) + UTVIKLINGSPOPUP (HØYRE)
         ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* VENSTRE: DEN FAKTISKE PYRAMIDEFIGUREN (5 kolonner) */}
        <div className="lg:col-span-5 bg-white rounded-lg border border-[#DDD9D1] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#DDD9D1] pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#9B2415] font-bold block">
                INTERAKTIV MODELL
              </span>
              <h2 className="text-base font-bold text-[#141413]">
                Utviklingspyramiden i perioden
              </h2>
            </div>
            <span className="text-[11px] font-mono text-[#736E65]">
              Trykk på et lag for å åpne
            </span>
          </div>

          {/* Pyramidefiguren - geometrisk trappetrinnspyramide */}
          <div className="py-4 px-2 flex flex-col items-center gap-2 select-none">
            {/* NIVÅ 5: TURN (Topp) */}
            <div
              onClick={() => setAktivPyramideNivaa("TURN")}
              className={`w-[45%] h-14 rounded-t-lg flex flex-col items-center justify-center cursor-pointer transition-all border ${
                aktivPyramideNivaa === "TURN"
                  ? "bg-[#9B2415] text-white border-[#7A1C10] shadow-md scale-105 z-10"
                  : "bg-[#FAF8F3] text-[#141413] border-[#DDD9D1] hover:border-[#9B2415]/50"
              }`}
            >
              <span className="text-[11px] font-mono font-bold tracking-wider">
                TURN · {valgtPeriode.fordeling.TURN}%
              </span>
              <span className={`text-[9px] font-mono ${aktivPyramideNivaa === "TURN" ? "text-white/80" : "text-[#736E65]"}`}>
                Turnering & Press
              </span>
            </div>

            {/* NIVÅ 4: SPILL */}
            <div
              onClick={() => setAktivPyramideNivaa("SPILL")}
              className={`w-[58%] h-14 flex flex-col items-center justify-center cursor-pointer transition-all border ${
                aktivPyramideNivaa === "SPILL"
                  ? "bg-[#0D6338] text-white border-[#0A4D2B] shadow-md scale-105 z-10"
                  : "bg-[#FAF8F3] text-[#141413] border-[#DDD9D1] hover:border-[#0D6338]/50"
              }`}
            >
              <span className="text-[11px] font-mono font-bold tracking-wider">
                SPILL · {valgtPeriode.fordeling.SPILL}%
              </span>
              <span className={`text-[9px] font-mono ${aktivPyramideNivaa === "SPILL" ? "text-white/80" : "text-[#736E65]"}`}>
                Banespill & Tiger 5
              </span>
            </div>

            {/* NIVÅ 3: SLAG */}
            <div
              onClick={() => setAktivPyramideNivaa("SLAG")}
              className={`w-[72%] h-14 flex flex-col items-center justify-center cursor-pointer transition-all border ${
                aktivPyramideNivaa === "SLAG"
                  ? "bg-[#B85D19] text-white border-[#944A13] shadow-md scale-105 z-10"
                  : "bg-[#FAF8F3] text-[#141413] border-[#DDD9D1] hover:border-[#B85D19]/50"
              }`}
            >
              <span className="text-[11px] font-mono font-bold tracking-wider">
                SLAG · {valgtPeriode.fordeling.SLAG}%
              </span>
              <span className={`text-[9px] font-mono ${aktivPyramideNivaa === "SLAG" ? "text-white/80" : "text-[#736E65]"}`}>
                Ballkontroll, Wedger & Putting
              </span>
            </div>

            {/* NIVÅ 2: TEK */}
            <div
              onClick={() => setAktivPyramideNivaa("TEK")}
              className={`w-[86%] h-14 flex flex-col items-center justify-center cursor-pointer transition-all border ${
                aktivPyramideNivaa === "TEK"
                  ? "bg-[#17446F] text-white border-[#0F2D4A] shadow-md scale-105 z-10"
                  : "bg-[#FAF8F3] text-[#141413] border-[#DDD9D1] hover:border-[#17446F]/50"
              }`}
            >
              <span className="text-[11px] font-mono font-bold tracking-wider">
                TEK · {valgtPeriode.fordeling.TEK}%
              </span>
              <span className={`text-[9px] font-mono ${aktivPyramideNivaa === "TEK" ? "text-white/80" : "text-[#736E65]"}`}>
                Sving, P1–P10 & TrackMan
              </span>
            </div>

            {/* NIVÅ 1: FYS (Bunn / Fundament) */}
            <div
              onClick={() => setAktivPyramideNivaa("FYS")}
              className={`w-[100%] h-14 rounded-b-lg flex flex-col items-center justify-center cursor-pointer transition-all border ${
                aktivPyramideNivaa === "FYS"
                  ? "bg-[#4C1D95] text-white border-[#3B1578] shadow-md scale-105 z-10"
                  : "bg-[#FAF8F3] text-[#141413] border-[#DDD9D1] hover:border-[#4C1D95]/50"
              }`}
            >
              <span className="text-[11px] font-mono font-bold tracking-wider">
                FYS · {valgtPeriode.fordeling.FYS}%
              </span>
              <span className={`text-[9px] font-mono ${aktivPyramideNivaa === "FYS" ? "text-white/80" : "text-[#736E65]"}`}>
                Styrke, Kondisjon & Bevegelighet
              </span>
            </div>
          </div>

          {/* Periodemål-boks */}
          <div className="bg-[#FAF8F3] p-4 rounded-md border border-[#DDD9D1] space-y-2">
            <span className="text-[10px] font-mono uppercase text-[#736E65] font-bold block">
              Målsetninger for {valgtPeriode.navn}:
            </span>
            <ul className="space-y-1.5 text-xs text-[#141413]">
              {valgtPeriode.periodemaal.map((maal, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9B2415] mt-1.5 shrink-0" />
                  <span>{maal}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* HØYRE: POP-UP / DETALJPANEL FOR VALGT PYRAMIDENIVÅ (7 kolonner) */}
        <div className="lg:col-span-7 bg-white rounded-lg border border-[#DDD9D1] p-5 sm:p-6 shadow-xs space-y-6">
          {/* Header for valgt nivå */}
          <div className="border-b border-[#DDD9D1] pb-4 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-mono font-bold text-white uppercase"
                  style={{ backgroundColor: aktivInfo.farge }}
                >
                  {aktivPyramideNivaa} · {aktivInfo.prosent}% AV PERIODEN
                </span>
                <span className="text-xs font-mono text-[#736E65]">
                  Ca. {aktivInfo.okterEstimert} økter / uke
                </span>
              </div>
              <h2 className="text-xl font-bold text-[#141413] mt-1.5">
                {aktivInfo.tittel}
              </h2>
              <p className="text-xs text-[#736E65] mt-0.5">
                {aktivInfo.ingress}
              </p>
            </div>

            {/* AK-Formelkoden */}
            <div className="bg-[#FAF8F3] px-3 py-1.5 rounded border border-[#DDD9D1] text-right shrink-0">
              <span className="text-[9px] font-mono uppercase text-[#736E65] block">AK-formel</span>
              <span className="text-[11px] font-mono font-bold text-[#141413]">{aktivInfo.formel}</span>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              SPESIFIKT INNHOLD NÅR TEK ER VALGT (P-POSISJONER, RADAR, KØLLER)
             ───────────────────────────────────────────────────────────── */}
          {aktivPyramideNivaa === "TEK" && (
            <div className="space-y-5">
              {/* Svingtidslinje P1 - P10 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase font-bold text-[#17446F]">
                    Svingposisjoner (MORAD P1.0 – P10.0)
                  </span>
                  <span className="text-[10px] font-mono text-[#736E65]">
                    Valgt: {valgtPObj.num} {valgtPObj.navn}
                  </span>
                </div>

                {/* Horisontal P-velger */}
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-1">
                  {pPosisjoner.map((p) => {
                    const erValgt = valgtPPos === p.num;
                    return (
                      <button
                        key={p.num}
                        type="button"
                        onClick={() => setValgtPPos(p.num)}
                        className={`py-2 px-1 rounded text-center font-mono text-xs transition-all ${
                          erValgt
                            ? "bg-[#17446F] text-white font-bold shadow-xs scale-105"
                            : "bg-[#FAF8F3] text-[#141413] border border-[#DDD9D1] hover:border-[#17446F]"
                        }`}
                      >
                        <span className="block text-[10px] font-semibold">{p.num.replace(".0", "")}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Sjekkpunkt for valgt P */}
                <div className="bg-[#FAF8F3] p-3 rounded border border-[#DDD9D1] text-xs">
                  <strong className="text-[#17446F] font-mono">{valgtPObj.num} {valgtPObj.navn}:</strong>{" "}
                  <span className="text-[#736E65]">{valgtPObj.sjekk}</span>
                </div>
              </div>

              {/* Kølle- og Ballbanevelger */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono uppercase text-[#736E65] font-bold block">
                    Kølle i teknisk fokus:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {["Driver", "3-tre", "5-jern", "7-jern", "PW", "58° Wedge"].map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setValgtKolle(k)}
                        className={`px-2.5 py-1 text-xs rounded font-mono transition-colors ${
                          valgtKolle === k
                            ? "bg-[#141413] text-white font-bold"
                            : "bg-[#FAF8F3] text-[#736E65] border border-[#DDD9D1]"
                        }`}
                      >
                        {k}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono uppercase text-[#736E65] font-bold block">
                    Ønsket kurve & høyde:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {["Svak draw", "Rett", "Svak fade", "Høy launch", "Lav penetrerende"].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setValgtKurve(c)}
                        className={`px-2.5 py-1 text-xs rounded font-mono transition-colors ${
                          valgtKurve === c
                            ? "bg-[#9B2415] text-white font-bold"
                            : "bg-[#FAF8F3] text-[#736E65] border border-[#DDD9D1]"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* TrackMan radarmål for teknikken */}
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase font-bold text-[#17446F] block">
                  TrackMan Måleverdier ({valgtKolle} · {valgtKurve})
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-[#FAF8F3] p-2.5 rounded border border-[#DDD9D1]">
                    <span className="text-[10px] font-mono uppercase text-[#736E65] block">Club Speed</span>
                    <span className="text-base font-mono font-bold text-[#141413]">114.5 mph</span>
                    <span className="text-[9px] text-[#0D6338] block">Mål: 116.0 mph</span>
                  </div>
                  <div className="bg-[#FAF8F3] p-2.5 rounded border border-[#DDD9D1]">
                    <span className="text-[10px] font-mono uppercase text-[#736E65] block">Club Path</span>
                    <span className="text-base font-mono font-bold text-[#141413]">+2.2° in-out</span>
                    <span className="text-[9px] text-[#0D6338] block">Nøytral draw-linje</span>
                  </div>
                  <div className="bg-[#FAF8F3] p-2.5 rounded border border-[#DDD9D1]">
                    <span className="text-[10px] font-mono uppercase text-[#736E65] block">Face to Path</span>
                    <span className="text-base font-mono font-bold text-[#141413]">-0.8° closed</span>
                    <span className="text-[9px] text-[#0D6338] block">Optimal start & kurve</span>
                  </div>
                  <div className="bg-[#FAF8F3] p-2.5 rounded border border-[#DDD9D1]">
                    <span className="text-[10px] font-mono uppercase text-[#736E65] block">Smash Factor</span>
                    <span className="text-base font-mono font-bold text-[#141413]">1.49</span>
                    <span className="text-[9px] text-[#0D6338] block">Tour-standard (1.48–1.52)</span>
                  </div>
                </div>
              </div>

              {/* De 3 motoriske læringsstegene */}
              <div className="bg-[#FAF8F3] p-3 rounded border border-[#DDD9D1] space-y-1.5">
                <span className="text-[11px] font-mono uppercase text-[#17446F] font-bold block">
                  3 Læringssteg i oppgaven:
                </span>
                <div className="grid grid-cols-3 gap-2 text-xs text-center font-mono">
                  <div className="bg-white p-2 rounded border border-[#DDD9D1]">
                    <span className="text-[10px] text-[#736E65] block">1. UTEN BALL</span>
                    <strong className="text-[#141413]">150 reps</strong>
                    <span className="text-[9px] text-[#736E65] block">Speil & Drills</span>
                  </div>
                  <div className="bg-white p-2 rounded border border-[#DDD9D1]">
                    <span className="text-[10px] text-[#736E65] block">2. LAV FART</span>
                    <strong className="text-[#141413]">250 reps</strong>
                    <span className="text-[9px] text-[#736E65] block">50 % hastighet</span>
                  </div>
                  <div className="bg-white p-2 rounded border border-[#DDD9D1]">
                    <span className="text-[10px] text-[#736E65] block">3. AUTOMATIKK</span>
                    <strong className="text-[#141413]">500 reps</strong>
                    <span className="text-[9px] text-[#736E65] block">100 % fart mot mål</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              SPESIFIKT INNHOLD NÅR FYS ER VALGT (STYRKE, KONDISJON, MOBILITET)
             ───────────────────────────────────────────────────────────── */}
          {aktivPyramideNivaa === "FYS" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#FAF8F3] p-3.5 rounded border border-[#DDD9D1] space-y-2">
                  <div className="flex items-center gap-1.5 text-[#4C1D95] font-mono text-xs font-bold uppercase">
                    <Dumbbell className="w-3.5 h-3.5" /> Styrketrening
                  </div>
                  <ul className="text-xs space-y-1 text-[#736E65]">
                    <li>• Trapbar markløft (190 kg mål)</li>
                    <li>• Knebøy: 4 serier × 5 reps @ 2 RIR</li>
                    <li>• Chins / pullups m/ vektvest</li>
                    <li>• Rotasjonskraft med kabel</li>
                  </ul>
                </div>

                <div className="bg-[#FAF8F3] p-3.5 rounded border border-[#DDD9D1] space-y-2">
                  <div className="flex items-center gap-1.5 text-[#4C1D95] font-mono text-xs font-bold uppercase">
                    <TrendingUp className="w-3.5 h-3.5" /> Kondisjon
                  </div>
                  <ul className="text-xs space-y-1 text-[#736E65]">
                    <li>• 3000 meter test (mål: &lt; 11:15)</li>
                    <li>• 4 × 4 min intervaller i Sone 4</li>
                    <li>• Yo-Yo intermittent test</li>
                    <li>• Lavintensiv restitusjon Sone 1</li>
                  </ul>
                </div>

                <div className="bg-[#FAF8F3] p-3.5 rounded border border-[#DDD9D1] space-y-2">
                  <div className="flex items-center gap-1.5 text-[#4C1D95] font-mono text-xs font-bold uppercase">
                    <Compass className="w-3.5 h-3.5" /> Bevegelighet
                  </div>
                  <ul className="text-xs space-y-1 text-[#736E65]">
                    <li>• Toraksmobilitet (brystrygg)</li>
                    <li>• Hofterotasjon og hoftebøyer</li>
                    <li>• Skulderbue og scapulakontroll</li>
                    <li>• Rotasjonskast m/ 3kg ball</li>
                  </ul>
                </div>
              </div>

              <div className="bg-[#FAF8F3] p-3 rounded border border-[#DDD9D1] text-xs text-[#736E65]">
                <strong className="text-[#4C1D95]">Belastningsstyring i perioden:</strong> Fysisk volum er beregnet til 30 % av perioden (ca. 4.2 timer per uke). Fysisk økt legges aldri rett før en svingteknisk økt for å unngå nevrologisk tretthet i finmotorikken.
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              SPESIFIKT INNHOLD NÅR SLAG ER VALGT
             ───────────────────────────────────────────────────────────── */}
          {aktivPyramideNivaa === "SLAG" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-[#FAF8F3] p-3 rounded border border-[#DDD9D1]">
                  <span className="font-mono text-[10px] font-bold uppercase text-[#B85D19] block mb-1">
                    Nærspill & Wedger
                  </span>
                  <p className="text-[#736E65] leading-relaxed">
                    Lengdekontroll 50m, 70m og 90m inn mot definerte målbånd. Chip med lav utrulling og bunker fra varierende sand-lies.
                  </p>
                </div>
                <div className="bg-[#FAF8F3] p-3 rounded border border-[#DDD9D1]">
                  <span className="font-mono text-[10px] font-bold uppercase text-[#B85D19] block mb-1">
                    Putting (6 fot-bånd)
                  </span>
                  <p className="text-[#736E65] leading-relaxed">
                    0–3 fot (100% krav), 3–5 fot og 5–10 fot (startlinje og fart), samt 25–40 fot (lag-putting for å unngå 3-putts).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              SPESIFIKT INNHOLD NÅR SPILL ER VALGT
             ───────────────────────────────────────────────────────────── */}
          {aktivPyramideNivaa === "SPILL" && (
            <div className="space-y-4">
              <div className="bg-[#FAF8F3] p-4 rounded border border-[#DDD9D1] space-y-2">
                <span className="font-mono text-xs font-bold uppercase text-[#0D6338] block">
                  Tiger 5 Banestrategi i perioden:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#141413]">
                  <div className="bg-white p-2 rounded border border-[#DDD9D1]">1. Unngå doble bogeys (0 per runde)</div>
                  <div className="bg-white p-2 rounded border border-[#DDD9D1]">2. Unngå 3-putts (maks 1 per runde)</div>
                  <div className="bg-white p-2 rounded border border-[#DDD9D1]">3. Unngå bogeys på par 5-hull</div>
                  <div className="bg-white p-2 rounded border border-[#DDD9D1]">4. Unngå straffeslag fra tee</div>
                  <div className="bg-white p-2 rounded border border-[#DDD9D1] sm:col-span-2">5. Slå innspill til trygg side av pinnen (aldri short-side)</div>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              SPESIFIKT INNHOLD NÅR TURN ER VALGT
             ───────────────────────────────────────────────────────────── */}
          {aktivPyramideNivaa === "TURN" && (
            <div className="space-y-4">
              <div className="bg-[#FAF8F3] p-4 rounded border border-[#DDD9D1] space-y-2">
                <span className="font-mono text-xs font-bold uppercase text-[#9B2415] block">
                  Turneringssimulering & Forberedelse:
                </span>
                <p className="text-xs text-[#736E65] leading-relaxed">
                  Prøverunder med notater i baneguide, slagplaner fra tee, og 9-hulls runder med maksimalt mentalt press hvor hvert slag telles og logges til spillerens brutto scorekort.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
