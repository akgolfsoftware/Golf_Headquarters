"use client";

import React, { useState } from "react";
import {
  Calendar,
  User,
  Activity,
  Award,
  MapPin,
  CheckCircle2,
  FileCheck,
  Shield,
  Plane,
  ArrowRight,
  Layers,
  CheckSquare,
  Square,
  GraduationCap,
  Search,
  FileText,
} from "lucide-react";


export type TnSkjermId = "TN-01" | "TN-02" | "TN-03" | "TN-04" | "TN-05" | "TN-06";

export interface TeamNorwayAppViewProps {

  initialSkjerm?: TnSkjermId;
  visNavigasjon?: boolean;
}

export function TeamNorwayAppView({
  initialSkjerm = "TN-01",
  visNavigasjon = true,
}: TeamNorwayAppViewProps) {
  const [aktivSkjerm, setAktivSkjerm] = useState<TnSkjermId>(initialSkjerm);

  // TN-03 Tilstand for fellestesting
  const [valgtKlasse, setValgtKlasse] = useState<"GUTTER_U18" | "JENTER_U18" | "HERRER" | "DAMER">("HERRER");
  const [testResultater, setTestResultater] = useState<Record<string, number>>({
    trapbar: 180,
    kneboy: 140,
    treTusen: 660, // 11:00 min
    ballSpeed: 176,
    wedgeProximity: 4.4,
  });

  // TN-04 Tilstand for samling & pakkeliste
  const [valgtDag, setValgtDag] = useState<number>(1);
  const [pakkeliste, setPakkeliste] = useState<Record<string, boolean>>({
    pass: true,
    toey: true,
    trackman: true,
    dagbok: false,
    helsekort: true,
    regntoy: true,
  });

  // TN-05 Tilstand for uttak
  const [mesterskap, setMesterskap] = useState<"EM" | "VM">("EM");

  // TN-06 Tilstand for Toppidrettsskoler (WANG)
  const [valgtSkoleId, setValgtSkoleId] = useState<string>("wang-fredrikstad");
  const [skoleTypeFilter, setSkoleTypeFilter] = useState<"ALLE" | "VGS" | "UNG">("ALLE");
  const [skoleSok, setSkoleSok] = useState<string>("");

  // Navigasjonspunkter
  const menyPunkter: Array<{ id: TnSkjermId; tittel: string; kortTittel: string; icon: React.ReactNode }> = [
    { id: "TN-01", tittel: "Landslagsoversikt", kortTittel: "Oversikt", icon: <Layers className="w-4 h-4" /> },
    { id: "TN-02", tittel: "Spillerprofil & Ytelse", kortTittel: "Spiller", icon: <User className="w-4 h-4" /> },
    { id: "TN-03", tittel: "Fellestesting & Protokoller", kortTittel: "Testing", icon: <Activity className="w-4 h-4" /> },
    { id: "TN-04", tittel: "Samlinger & Månedsplan", kortTittel: "Samlinger", icon: <Calendar className="w-4 h-4" /> },
    { id: "TN-05", tittel: "Uttak & Kriterier", kortTittel: "Uttak", icon: <Award className="w-4 h-4" /> },
    { id: "TN-06", tittel: "Toppidrettsskoler (WANG)", kortTittel: "Skoler", icon: <GraduationCap className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#F2F7FC] text-[#0C1219] font-sans antialiased flex flex-col md:flex-row">
      {/* ─────────────────────────────────────────────────────────────
          NAVY SKALL (DESKTOP RAIL >= 860px)
         ───────────────────────────────────────────────────────────── */}
      {visNavigasjon && (
        <aside className="hidden md:flex w-64 bg-[#012B5D] text-white flex-col justify-between shrink-0 border-r border-[#01234C]">
          <div>
            {/* Team Norway Logo & Header */}
            <div className="p-6 border-b border-[#033C7A]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#D70232] rounded-[2px] flex items-center justify-center font-bold font-mono text-sm tracking-wider text-white">
                  TN
                </div>
                <div>
                  <h1 className="font-semibold text-sm tracking-wider uppercase text-white font-mono">
                    TEAM NORWAY
                  </h1>
                  <span className="text-[11px] text-[#7FA3C9] font-mono tracking-widest block">
                    NORGES GOLFFORBUND
                  </span>
                </div>
              </div>
            </div>

            {/* Navigasjonsmeny */}
            <nav className="p-3 space-y-1">
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#7FA3C9] px-3 py-2 font-semibold">
                Landslagsflater
              </div>
              {menyPunkter.map((punkt) => {
                const erAktiv = aktivSkjerm === punkt.id;
                return (
                  <button
                    key={punkt.id}
                    type="button"
                    onClick={() => setAktivSkjerm(punkt.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[2px] text-xs transition-colors relative text-left ${
                      erAktiv
                        ? "bg-[#0A5199] text-white font-medium"
                        : "text-[#E3ECF6] hover:bg-[#033C7A] hover:text-white"
                    }`}
                  >
                    {/* Rød vertikal indikator (KUN på aktiv rad) */}
                    {erAktiv && (
                      <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#D70232]" />
                    )}
                    <span className="flex items-center gap-2.5 pl-1">
                      {punkt.icon}
                      <span>{punkt.tittel}</span>
                    </span>
                    <span className="text-[10px] font-mono text-[#7FA3C9]">
                      {punkt.id}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bunn-brukerprofil i skinnen */}
          <div className="p-4 border-t border-[#033C7A] bg-[#01234C]/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[2px] bg-[#0A5199] text-white flex items-center justify-center font-mono font-bold text-xs border border-[#4A85C0]">
                ØR
              </div>
              <div>
                <div className="text-xs font-semibold text-white">Øyvind Rojahn</div>
                <div className="text-[10px] text-[#7FA3C9] font-mono">Head Coach · Herrer</div>
              </div>
            </div>
            <div className="w-2 h-2 rounded-full bg-[#0D6338]" title="Tilkoblet" />
          </div>
        </aside>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MOBIL TOPPLINJE (< 860px)
         ───────────────────────────────────────────────────────────── */}
      {visNavigasjon && (
        <header className="md:hidden bg-[#012B5D] text-white px-4 py-3 border-b border-[#033C7A] flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#D70232] rounded-[2px] flex items-center justify-center font-bold font-mono text-xs text-white">
              TN
            </div>
            <div>
              <div className="font-semibold text-xs tracking-wider uppercase font-mono">
                TEAM NORWAY GOLF
              </div>
              <span className="text-[10px] text-[#7FA3C9] font-mono">
                {menyPunkter.find((p) => p.id === aktivSkjerm)?.tittel}
              </span>
            </div>
          </div>
          <span className="text-[11px] font-mono text-[#7FA3C9] bg-[#033C7A] px-2 py-0.5 rounded-[2px]">
            {aktivSkjerm}
          </span>
        </header>
      )}

      {/* ─────────────────────────────────────────────────────────────
          HOVEDINNHOLD / SCENE
         ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-6xl mx-auto w-full pb-20 md:pb-8">
        {/* SKJERM TN-01: LANDSLAGSOVERSIKT */}
        {aktivSkjerm === "TN-01" && (
          <div className="space-y-6">
            {/* Tittelblokk */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E3ECF6] pb-4">
              <div>
                <span className="text-xs font-mono tracking-widest uppercase text-[#5E6E7F] block">
                  TN-01 · DASHBOARD
                </span>
                <h2 className="text-2xl font-bold tracking-tight text-[#0C1219]">
                  Landslagsoversikt
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono bg-white border border-[#E3ECF6] px-3 py-1 text-[#5E6E7F] rounded-[2px]">
                  Sesong 2026/2027
                </span>
              </div>
            </div>

            {/* Topp-kort: Neste samling (Mar Menor) */}
            <div className="bg-white border border-[#E3ECF6] rounded-[2px] p-6 shadow-2xs">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#D70232] text-white text-[10px] font-mono px-2 py-0.5 font-bold tracking-wider rounded-[2px]">
                      FRIST 14.10
                    </span>
                    <span className="text-xs font-mono text-[#5E6E7F]">Neste obligatoriske samling</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#0C1219]">
                    Høstsamling & TrackMan Benchmark · Mar Menor
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#5E6E7F] font-mono pt-1">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#012B5D]" />
                      18.–24. november 2026
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#012B5D]" />
                      Murcia, Spania
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Plane className="w-3.5 h-3.5 text-[#012B5D]" />
                      Fellesfly OSL – ALC kl. 09:20
                    </span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs font-mono text-[#5E6E7F]">Påmeldte utøvere</div>
                    <div className="text-xl font-bold font-mono text-[#012B5D]">16 av 18</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAktivSkjerm("TN-04")}
                    className="px-4 py-2 bg-[#012B5D] text-white text-xs font-medium rounded-[2px] hover:bg-[#033C7A] transition-colors flex items-center gap-1.5"
                  >
                    <span>Se program & pakkeliste</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* To-kolonners rutenett */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Fellestest-status */}
              <div className="bg-white border border-[#E3ECF6] rounded-[2px] p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#E3ECF6] pb-3">
                  <div>
                    <span className="text-[10px] font-mono tracking-widest uppercase text-[#5E6E7F] block">
                      PROTOKOLL HØST 2026
                    </span>
                    <h4 className="text-base font-bold text-[#0C1219]">Fellestest Status</h4>
                  </div>
                  <span className="bg-[#FAF8F3] text-[#D70232] border border-[#E3ECF6] text-[10px] font-mono px-2 py-0.5 font-bold rounded-[2px]">
                    STENGER 04.10
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-mono text-[#5E6E7F] mb-1">
                      <span>Innsendte protokoller</span>
                      <span className="font-bold text-[#0C1219]">24 / 28 (86 %)</span>
                    </div>
                    <div className="w-full h-2 bg-[#F2F7FC] rounded-[2px] overflow-hidden border border-[#E3ECF6]">
                      <div className="h-full bg-[#012B5D]" style={{ width: "86%" }} />
                    </div>
                  </div>

                  <ul className="text-xs space-y-2 pt-2 border-t border-[#E3ECF6]">
                    <li className="flex items-center justify-between">
                      <span className="text-[#0C1219]">Knebøy 1RM & Trapbar</span>
                      <span className="text-[#0D6338] font-mono text-[11px] font-semibold">26 godkjent</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-[#0C1219]">3000 meter løpetest</span>
                      <span className="text-[#0D6338] font-mono text-[11px] font-semibold">24 godkjent</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-[#0C1219]">TrackMan Combine 60–100m</span>
                      <span className="text-[#A80126] font-mono text-[11px] font-semibold">4 venter</span>
                    </li>
                  </ul>

                  <button
                    type="button"
                    onClick={() => setAktivSkjerm("TN-03")}
                    className="w-full mt-2 py-2 border border-[#E3ECF6] hover:bg-[#F2F7FC] text-xs font-medium text-[#012B5D] rounded-[2px] transition-colors"
                  >
                    Registrer eller se resultater →
                  </button>
                </div>
              </div>

              {/* Siste meldinger fra landslagsledelsen */}
              <div className="bg-white border border-[#E3ECF6] rounded-[2px] p-5 shadow-2xs space-y-4">
                <div className="border-b border-[#E3ECF6] pb-3">
                  <span className="text-[10px] font-mono tracking-widest uppercase text-[#5E6E7F] block">
                    KOMMUNIKASJON
                  </span>
                  <h4 className="text-base font-bold text-[#0C1219]">Meldinger fra ledelsen</h4>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-[#F2F7FC] border border-[#E3ECF6] rounded-[2px]">
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#5E6E7F] mb-1">
                      <span className="font-bold text-[#012B5D]">Øyvind Rojahn (Head Coach)</span>
                      <span>I går 16:45</span>
                    </div>
                    <p className="text-xs text-[#0C1219] leading-relaxed">
                      «Viktig at alle har oppdatert TrackMan-køllegapping før vi samles i Spania. Vi kjører wedge-matrisetest første formiddag.»
                    </p>
                  </div>

                  <div className="p-3 bg-[#F2F7FC] border border-[#E3ECF6] rounded-[2px]">
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#5E6E7F] mb-1">
                      <span className="font-bold text-[#012B5D]">Landslagsfysio</span>
                      <span>22. sep</span>
                    </div>
                    <p className="text-xs text-[#0C1219] leading-relaxed">
                      «Nye mobilitetsprotokoller for hofte og rotasjon er lastet opp. Gjennomfør 2 ganger per uke frem til samling.»
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SKJERM TN-02: SPILLERPROFIL & LANDSLAGSYTELSE */}
        {aktivSkjerm === "TN-02" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E3ECF6] pb-4">
              <div>
                <span className="text-xs font-mono tracking-widest uppercase text-[#5E6E7F] block">
                  TN-02 · UTØVERKORT
                </span>
                <h2 className="text-2xl font-bold tracking-tight text-[#0C1219]">
                  Eirik Lindstrøm
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono bg-[#012B5D] text-white px-2.5 py-1 rounded-[2px]">
                  Landslagsgruppe Herrer
                </span>
              </div>
            </div>

            {/* Utøverhead med kvadratisk avatar */}
            <div className="bg-white border border-[#E3ECF6] rounded-[2px] p-6 shadow-2xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="w-20 h-20 bg-[#012B5D] text-white rounded-[2px] flex items-center justify-center font-mono font-bold text-2xl border-2 border-[#E3ECF6] shrink-0">
                  EL
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-bold text-[#0C1219]">Eirik Lindstrøm</h3>
                    <span className="text-xs font-mono bg-[#F2F7FC] text-[#012B5D] border border-[#E3ECF6] px-2 py-0.5 rounded-[2px]">
                      20 år · Miklagard Golf
                    </span>
                  </div>
                  <p className="text-xs text-[#5E6E7F] font-mono">
                    Oklahoma State University (NCAA Div 1) · HCP: +4.8 · WAGR: #48
                  </p>
                </div>
                <div className="flex sm:flex-col gap-3 shrink-0 pt-2 sm:pt-0">
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-[#5E6E7F] block">BRUTTO SNITT</span>
                    <span className="text-lg font-bold font-mono text-[#012B5D]">70.8</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-[#5E6E7F] block">SAMLET TESTSCORE</span>
                    <span className="text-lg font-bold font-mono text-[#0D6338]">104 %</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Testresultater vs Landslagsstandard */}
            <div className="bg-white border border-[#E3ECF6] rounded-[2px] p-6 shadow-2xs space-y-4">
              <div className="border-b border-[#E3ECF6] pb-3">
                <h4 className="text-base font-bold text-[#0C1219]">
                  Offisielle testprotokoller (Høst 2026)
                </h4>
                <p className="text-xs text-[#5E6E7F]">
                  Målt mot Norges Golfforbunds referansekrav for herrelandslaget.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E3ECF6] text-[#5E6E7F] font-mono text-[11px]">
                      <th className="py-2.5">Testøvelse</th>
                      <th className="py-2.5">Målt verdi</th>
                      <th className="py-2.5">Landslagsstandard</th>
                      <th className="py-2.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E3ECF6]">
                    <tr>
                      <td className="py-3 font-semibold text-[#0C1219]">Trapbar markløft (1RM)</td>
                      <td className="py-3 font-mono font-bold text-[#012B5D]">185 kg</td>
                      <td className="py-3 font-mono text-[#5E6E7F]">Krav: 170 kg</td>
                      <td className="py-3 text-right">
                        <span className="inline-flex items-center gap-1 font-mono text-[#0D6338] bg-[#0D6338]/10 px-2 py-0.5 rounded-[2px]">
                          <CheckCircle2 className="w-3 h-3" /> Bestått (+15 kg)
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold text-[#0C1219]">Knebøy (1RM)</td>
                      <td className="py-3 font-mono font-bold text-[#012B5D]">145 kg</td>
                      <td className="py-3 font-mono text-[#5E6E7F]">Krav: 135 kg</td>
                      <td className="py-3 text-right">
                        <span className="inline-flex items-center gap-1 font-mono text-[#0D6338] bg-[#0D6338]/10 px-2 py-0.5 rounded-[2px]">
                          <CheckCircle2 className="w-3 h-3" /> Bestått (+10 kg)
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold text-[#0C1219]">3000 meter løpetest</td>
                      <td className="py-3 font-mono font-bold text-[#012B5D]">10:48 min</td>
                      <td className="py-3 font-mono text-[#5E6E7F]">Krav: 11:15 min</td>
                      <td className="py-3 text-right">
                        <span className="inline-flex items-center gap-1 font-mono text-[#0D6338] bg-[#0D6338]/10 px-2 py-0.5 rounded-[2px]">
                          <CheckCircle2 className="w-3 h-3" /> Bestått (-27s)
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold text-[#0C1219]">Ballhastighet Driver</td>
                      <td className="py-3 font-mono font-bold text-[#012B5D]">178 mph</td>
                      <td className="py-3 font-mono text-[#5E6E7F]">Krav: 172 mph</td>
                      <td className="py-3 text-right">
                        <span className="inline-flex items-center gap-1 font-mono text-[#0D6338] bg-[#0D6338]/10 px-2 py-0.5 rounded-[2px]">
                          <CheckCircle2 className="w-3 h-3" /> Toppnivå (+6 mph)
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold text-[#0C1219]">Wedge Proximity (50–100m)</td>
                      <td className="py-3 font-mono font-bold text-[#012B5D]">4.2 m</td>
                      <td className="py-3 font-mono text-[#5E6E7F]">Krav: 4.8 m</td>
                      <td className="py-3 text-right">
                        <span className="inline-flex items-center gap-1 font-mono text-[#0D6338] bg-[#0D6338]/10 px-2 py-0.5 rounded-[2px]">
                          <CheckCircle2 className="w-3 h-3" /> Bestått (-0.6m)
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Formell lisens og antidoping */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-[#E3ECF6] rounded-[2px] p-4 flex items-center gap-3">
                <Shield className="w-5 h-5 text-[#0D6338] shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-[#0C1219]">NIF Idrettslisens</div>
                  <div className="text-[10px] font-mono text-[#5E6E7F]">Gyldig 2026/2027</div>
                </div>
              </div>
              <div className="bg-white border border-[#E3ECF6] rounded-[2px] p-4 flex items-center gap-3">
                <FileCheck className="w-5 h-5 text-[#0D6338] shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-[#0C1219]">Helseattest</div>
                  <div className="text-[10px] font-mono text-[#5E6E7F]">Godkjent forbundslege</div>
                </div>
              </div>
              <div className="bg-white border border-[#E3ECF6] rounded-[2px] p-4 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#0D6338] shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-[#0C1219]">Antidoping-samtykke</div>
                  <div className="text-[10px] font-mono text-[#5E6E7F]">Signert WADA / ADNO</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SKJERM TN-03: FELLESTESTING & PROTOKOLLER */}
        {aktivSkjerm === "TN-03" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E3ECF6] pb-4">
              <div>
                <span className="text-xs font-mono tracking-widest uppercase text-[#5E6E7F] block">
                  TN-03 · PROTOKOLLER
                </span>
                <h2 className="text-2xl font-bold tracking-tight text-[#0C1219]">
                  Fellestesting & Nasjonal Standard
                </h2>
              </div>
              {/* Velger for aldersklasse */}
              <div className="flex items-center border border-[#E3ECF6] bg-white rounded-[2px] p-0.5 text-xs font-mono">
                {(["HERRER", "DAMER", "GUTTER_U18", "JENTER_U18"] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setValgtKlasse(k)}
                    className={`px-3 py-1 rounded-[2px] transition-colors ${
                      valgtKlasse === k
                        ? "bg-[#012B5D] text-white font-semibold"
                        : "text-[#5E6E7F] hover:text-[#0C1219]"
                    }`}
                  >
                    {k.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            {/* Interaktiv resultatregistrering */}
            <div className="bg-white border border-[#E3ECF6] rounded-[2px] p-6 shadow-2xs space-y-6">
              <div>
                <h3 className="text-base font-bold text-[#0C1219]">
                  Resultatpunching for {valgtKlasse.replace("_", " ")}
                </h3>
                <p className="text-xs text-[#5E6E7F]">
                  Fyll inn testverdier under samling. Systemet sammenligner umiddelbart mot nasjonal landslagsstandard.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Trapbar */}
                <div className="p-4 bg-[#F2F7FC] border border-[#E3ECF6] rounded-[2px] space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-[#0C1219]">Trapbar Markløft (1RM)</label>
                    <span className="text-[10px] font-mono text-[#5E6E7F]">Standard: 170 kg</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={testResultater.trapbar}
                      onChange={(e) =>
                        setTestResultater({ ...testResultater, trapbar: Number(e.target.value) })
                      }
                      className="w-28 bg-white border border-[#E3ECF6] rounded-[2px] px-3 py-2 text-base font-mono font-bold text-[#012B5D]"
                    />
                    <span className="text-xs text-[#5E6E7F] font-mono">kg</span>
                    <span
                      className={`text-xs font-mono font-semibold px-2 py-1 rounded-[2px] ${
                        testResultater.trapbar >= 170
                          ? "bg-[#0D6338]/10 text-[#0D6338]"
                          : "bg-[#A80126]/10 text-[#A80126]"
                      }`}
                    >
                      {testResultater.trapbar >= 170 ? "Bestått krav ✓" : "Under krav"}
                    </span>
                  </div>
                </div>

                {/* Knebøy */}
                <div className="p-4 bg-[#F2F7FC] border border-[#E3ECF6] rounded-[2px] space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-[#0C1219]">Knebøy (1RM)</label>
                    <span className="text-[10px] font-mono text-[#5E6E7F]">Standard: 135 kg</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={testResultater.kneboy}
                      onChange={(e) =>
                        setTestResultater({ ...testResultater, kneboy: Number(e.target.value) })
                      }
                      className="w-28 bg-white border border-[#E3ECF6] rounded-[2px] px-3 py-2 text-base font-mono font-bold text-[#012B5D]"
                    />
                    <span className="text-xs text-[#5E6E7F] font-mono">kg</span>
                    <span
                      className={`text-xs font-mono font-semibold px-2 py-1 rounded-[2px] ${
                        testResultater.kneboy >= 135
                          ? "bg-[#0D6338]/10 text-[#0D6338]"
                          : "bg-[#A80126]/10 text-[#A80126]"
                      }`}
                    >
                      {testResultater.kneboy >= 135 ? "Bestått krav ✓" : "Under krav"}
                    </span>
                  </div>
                </div>

                {/* 3000 meter */}
                <div className="p-4 bg-[#F2F7FC] border border-[#E3ECF6] rounded-[2px] space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-[#0C1219]">3000m Løp (sekunder)</label>
                    <span className="text-[10px] font-mono text-[#5E6E7F]">Standard: 675s (11:15)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={testResultater.treTusen}
                      onChange={(e) =>
                        setTestResultater({ ...testResultater, treTusen: Number(e.target.value) })
                      }
                      className="w-28 bg-white border border-[#E3ECF6] rounded-[2px] px-3 py-2 text-base font-mono font-bold text-[#012B5D]"
                    />
                    <span className="text-xs text-[#5E6E7F] font-mono">sek</span>
                    <span
                      className={`text-xs font-mono font-semibold px-2 py-1 rounded-[2px] ${
                        testResultater.treTusen <= 675
                          ? "bg-[#0D6338]/10 text-[#0D6338]"
                          : "bg-[#A80126]/10 text-[#A80126]"
                      }`}
                    >
                      {testResultater.treTusen <= 675 ? "Bestått krav ✓" : "Under krav"}
                    </span>
                  </div>
                </div>

                {/* Ballhastighet Driver */}
                <div className="p-4 bg-[#F2F7FC] border border-[#E3ECF6] rounded-[2px] space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-[#0C1219]">Ballhastighet Driver</label>
                    <span className="text-[10px] font-mono text-[#5E6E7F]">Standard: 172 mph</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={testResultater.ballSpeed}
                      onChange={(e) =>
                        setTestResultater({ ...testResultater, ballSpeed: Number(e.target.value) })
                      }
                      className="w-28 bg-white border border-[#E3ECF6] rounded-[2px] px-3 py-2 text-base font-mono font-bold text-[#012B5D]"
                    />
                    <span className="text-xs text-[#5E6E7F] font-mono">mph</span>
                    <span
                      className={`text-xs font-mono font-semibold px-2 py-1 rounded-[2px] ${
                        testResultater.ballSpeed >= 172
                          ? "bg-[#0D6338]/10 text-[#0D6338]"
                          : "bg-[#A80126]/10 text-[#A80126]"
                      }`}
                    >
                      {testResultater.ballSpeed >= 172 ? "Bestått krav ✓" : "Under krav"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E3ECF6] flex justify-end">
                <button
                  type="button"
                  onClick={() => alert("Testresultat lagret i Team Norway protokoll.")}
                  className="px-5 py-2.5 bg-[#012B5D] text-white text-xs font-medium rounded-[2px] hover:bg-[#033C7A] transition-colors"
                >
                  Lagre testprotokoll i databasen
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SKJERM TN-04: SAMLINGER & MÅNEDSPLAN */}
        {aktivSkjerm === "TN-04" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E3ECF6] pb-4">
              <div>
                <span className="text-xs font-mono tracking-widest uppercase text-[#5E6E7F] block">
                  TN-04 · TERMINLISTE & SAMLINGSPROGRAM
                </span>
                <h2 className="text-2xl font-bold tracking-tight text-[#0C1219]">
                  Samlinger & Månedsplan
                </h2>
              </div>
            </div>

            {/* Årshjul over måneder */}
            <div className="bg-white border border-[#E3ECF6] rounded-[2px] p-4 shadow-2xs">
              <span className="text-[10px] font-mono uppercase text-[#5E6E7F] block mb-2 font-semibold">
                Årshjul 2026/2027
              </span>
              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-1.5 text-center text-xs font-mono">
                {[
                  { mnd: "OKT", har: true, aktiv: false },
                  { mnd: "NOV", har: true, aktiv: true },
                  { mnd: "DES", har: false, aktiv: false },
                  { mnd: "JAN", har: true, aktiv: false },
                  { mnd: "FEB", har: true, aktiv: false },
                  { mnd: "MAR", har: false, aktiv: false },
                  { mnd: "APR", har: true, aktiv: false },
                  { mnd: "MAI", har: true, aktiv: false },
                  { mnd: "JUN", har: true, aktiv: false },
                  { mnd: "JUL", har: true, aktiv: false },
                  { mnd: "AUG", har: false, aktiv: false },
                  { mnd: "SEP", har: true, aktiv: false },
                ].map((item) => (
                  <div
                    key={item.mnd}
                    className={`py-2 px-1 rounded-[2px] border ${
                      item.aktiv
                        ? "bg-[#012B5D] text-white border-[#012B5D] font-bold"
                        : item.har
                        ? "bg-[#F2F7FC] text-[#012B5D] border-[#E3ECF6]"
                        : "bg-white text-[#5E6E7F]/40 border-transparent"
                    }`}
                  >
                    <span>{item.mnd}</span>
                    {item.har && (
                      <span
                        className={`block w-1.5 h-1.5 mx-auto mt-1 rounded-full ${
                          item.aktiv ? "bg-[#D70232]" : "bg-[#012B5D]"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Samlingsprogram med dagsfaner */}
            <div className="bg-white border border-[#E3ECF6] rounded-[2px] p-6 shadow-2xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E3ECF6] pb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#0C1219]">
                    Høstsamling Mar Menor · Dagsprogram
                  </h3>
                  <p className="text-xs text-[#5E6E7F] font-mono">
                    18.–24. november · Caleia Mar Menor Golf & Spa Resort
                  </p>
                </div>

                {/* Dagsfaner med rød aktiv fane */}
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5, 6].map((dagNr) => {
                    const erAktiv = valgtDag === dagNr;
                    return (
                      <button
                        key={dagNr}
                        type="button"
                        onClick={() => setValgtDag(dagNr)}
                        className={`px-3 py-1.5 text-xs font-mono rounded-[2px] transition-colors relative ${
                          erAktiv
                            ? "bg-[#012B5D] text-white font-bold"
                            : "bg-[#F2F7FC] text-[#5E6E7F] hover:bg-[#E3ECF6]"
                        }`}
                      >
                        {erAktiv && (
                          <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#D70232]" />
                        )}
                        <span>Dag {dagNr}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Timeplan for valgt dag */}
              <div className="space-y-3">
                <span className="text-xs font-mono uppercase tracking-wider text-[#5E6E7F] font-semibold block">
                  Tidsplan for Dag {valgtDag}
                </span>
                <div className="space-y-2">
                  {[
                    { tid: "07:30 – 08:30", tittel: "Frokost & Hydrering", sted: "Hotellrestauranten" },
                    { tid: "08:45 – 09:30", tittel: "Fysisk mobilitet & aktivering", sted: "Driving range studio" },
                    { tid: "09:45 – 13:30", tittel: "Banespill 18 hull (Score-protokoll)", sted: "Mar Menor Golf Course" },
                    { tid: "14:00 – 15:00", tittel: "Lunsj & restitusjon", sted: "Klubbhuset" },
                    { tid: "15:30 – 17:30", tittel: "TrackMan Wedge-Combine & Nærspill", sted: "Nærspillsområde" },
                    { tid: "19:00 – 20:30", tittel: "Felles middag & dagsgjennomgang", sted: "Møterom A" },
                  ].map((rad, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-[#F2F7FC] border border-[#E3ECF6] rounded-[2px] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-4">
                        <span className="font-mono font-bold text-[#012B5D] w-28 shrink-0">
                          {rad.tid}
                        </span>
                        <span className="font-semibold text-[#0C1219]">{rad.tittel}</span>
                      </div>
                      <span className="text-[#5E6E7F] font-mono text-[11px] hidden sm:block">
                        {rad.sted}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interaktiv pakkeliste */}
              <div className="pt-4 border-t border-[#E3ECF6] space-y-3">
                <span className="text-xs font-mono uppercase tracking-wider text-[#5E6E7F] font-semibold block">
                  Obligatorisk pakkeliste
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {[
                    { id: "pass", label: "Pass & europeisk helsetrygdkort" },
                    { id: "toey", label: "Offisielt Team Norway-tøy (rød/navy)" },
                    { id: "trackman", label: "TrackMan 4 radar & lader" },
                    { id: "dagbok", label: "Treningsdagbok / iPad med AK HQ" },
                    { id: "helsekort", label: "Antidopingbevis & reiseforsikring" },
                    { id: "regntoy", label: "Landslagsregntøy og ekstrasett" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        setPakkeliste({ ...pakkeliste, [item.id]: !pakkeliste[item.id] })
                      }
                      className="p-2.5 bg-white border border-[#E3ECF6] rounded-[2px] text-xs flex items-center gap-2.5 text-left hover:bg-[#F2F7FC] transition-colors"
                    >
                      {pakkeliste[item.id] ? (
                        <CheckSquare className="w-4 h-4 text-[#0D6338] shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-[#5E6E7F] shrink-0" />
                      )}
                      <span
                        className={
                          pakkeliste[item.id]
                            ? "text-[#0C1219] line-through text-[#5E6E7F]"
                            : "text-[#0C1219]"
                        }
                      >
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SKJERM TN-05: UTTAK & KRITERIER */}
        {aktivSkjerm === "TN-05" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E3ECF6] pb-4">
              <div>
                <span className="text-xs font-mono tracking-widest uppercase text-[#5E6E7F] block">
                  TN-05 · MESTERSKAPSUTTAK
                </span>
                <h2 className="text-2xl font-bold tracking-tight text-[#0C1219]">
                  Uttakskriterier & Rangliste
                </h2>
              </div>

              {/* Mesterskapsbryter: EM vs VM */}
              <div className="flex items-center border border-[#E3ECF6] bg-white rounded-[2px] p-0.5 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setMesterskap("EM")}
                  className={`px-4 py-1.5 rounded-[2px] transition-colors ${
                    mesterskap === "EM"
                      ? "bg-[#012B5D] text-white font-bold"
                      : "text-[#5E6E7F] hover:text-[#0C1219]"
                  }`}
                >
                  Lag-EM (6 utøvere)
                </button>
                <button
                  type="button"
                  onClick={() => setMesterskap("VM")}
                  className={`px-4 py-1.5 rounded-[2px] transition-colors ${
                    mesterskap === "VM"
                      ? "bg-[#012B5D] text-white font-bold"
                      : "text-[#5E6E7F] hover:text-[#0C1219]"
                  }`}
                >
                  VM Eisenhower (3 utøvere)
                </button>
              </div>
            </div>

            {/* Uttaksregler forklaring */}
            <div className="bg-white border border-[#E3ECF6] rounded-[2px] p-5 shadow-2xs">
              <div className="flex items-start gap-3">
                <Award className="w-5 h-5 text-[#012B5D] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-[#0C1219]">
                    Kvalifiseringsregler for {mesterskap === "EM" ? "Lag-EM Herrer" : "VM Lag"}
                  </h3>
                  <p className="text-xs text-[#5E6E7F] leading-relaxed">
                    {mesterskap === "EM"
                      ? "De 3 øverste utøverne på WAGR per 15. mai kvalifiserer seg automatisk. Resterende 3 plasser er kapteinsvalg basert på form, nasjonale tester og internasjonale resultater."
                      : "De 2 øverste utøverne på WAGR per 1. juli kvalifiserer seg automatisk. Siste plass tildeles etter landslagssjefens skjønn."}
                  </p>
                </div>
              </div>
            </div>

            {/* Ranglistetabell */}
            <div className="bg-white border border-[#E3ECF6] rounded-[2px] p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E3ECF6] pb-3">
                <h4 className="text-base font-bold text-[#0C1219]">
                  Offisiell Uttaksrangliste (Høst 2026)
                </h4>
                <span className="text-[10px] font-mono text-[#5E6E7F]">
                  Cut-off linje: Plass {mesterskap === "EM" ? "1–3" : "1–2"} er direkte kvalifisert
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E3ECF6] text-[#5E6E7F] font-mono text-[11px]">
                      <th className="py-2.5 w-12 text-center">Rank</th>
                      <th className="py-2.5">Utøver</th>
                      <th className="py-2.5">Klubb</th>
                      <th className="py-2.5">WAGR</th>
                      <th className="py-2.5">Snittscore</th>
                      <th className="py-2.5 text-right">Uttaksstatus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E3ECF6]">
                    {[
                      { rank: 1, navn: "Eirik Lindstrøm", klubb: "Miklagard Golf", wagr: "#48", score: "70.4", status: "Kvalifisert (Auto)" },
                      { rank: 2, navn: "Magnus Kristiansen", klubb: "Gamle Fredrikstad", wagr: "#92", score: "71.1", status: "Kvalifisert (Auto)" },
                      { rank: 3, navn: "Alexander Bøe", klubb: "Oslo Golfklubb", wagr: "#114", score: "71.6", status: mesterskap === "EM" ? "Kvalifisert (Auto)" : "Vurderes (Kaptein)" },
                      { rank: 4, navn: "Henrik Holthe", klubb: "Stavanger Golfklubb", wagr: "#145", score: "72.0", status: "Vurderes (Kaptein)" },
                      { rank: 5, navn: "Sindre Fredriksen", klubb: "Fana Golfklubb", wagr: "#188", score: "72.4", status: "Vurderes (Kaptein)" },
                      { rank: 6, navn: "Jonas Myhre", klubb: "Bærum Golfklubb", wagr: "#210", score: "72.8", status: "Reserve" },
                    ].map((spiller) => {
                      const erAuto = spiller.status.includes("Auto");
                      return (
                        <tr
                          key={spiller.rank}
                          onClick={() => {
                            if (spiller.rank === 1) setAktivSkjerm("TN-02");
                          }}
                          className={`hover:bg-[#F2F7FC] transition-colors cursor-pointer ${
                            spiller.rank === 1 ? "bg-[#F2F7FC]/50" : ""
                          }`}
                        >
                          <td className="py-3 text-center font-mono font-bold text-[#012B5D]">
                            #{spiller.rank}
                          </td>
                          <td className="py-3 font-semibold text-[#0C1219]">
                            <div className="flex items-center gap-2">
                              <span>{spiller.navn}</span>
                              {spiller.rank === 1 && (
                                <span className="text-[9px] font-mono text-[#D70232] border border-[#D70232]/30 px-1 rounded-[2px]">
                                  Vis profil
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 text-[#5E6E7F]">{spiller.klubb}</td>
                          <td className="py-3 font-mono font-bold text-[#012B5D]">{spiller.wagr}</td>
                          <td className="py-3 font-mono text-[#5E6E7F]">{spiller.score}</td>
                          <td className="py-3 text-right">
                            <span
                              className={`inline-flex items-center font-mono text-[11px] px-2 py-0.5 rounded-[2px] ${
                                erAuto
                                  ? "bg-[#0D6338]/10 text-[#0D6338] font-bold"
                                  : spiller.status.includes("Vurderes")
                                  ? "bg-[#012B5D]/10 text-[#012B5D]"
                                  : "text-[#5E6E7F]"
                              }`}
                            >
                              {spiller.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            TN-06: TOPPIDRETTSSKOLER (WANG) & TESTOVERSIKT
           ───────────────────────────────────────────────────────────── */}
        {aktivSkjerm === "TN-06" && (() => {
          const toppidrettsSkoler = [
            // WANG Toppidrett VGS (5 skoler)
            {
              id: "wang-fredrikstad",
              navn: "WANG Toppidrett Fredrikstad",
              kortNavn: "Fredrikstad VGS",
              type: "VGS" as const,
              sted: "Fredrikstad",
              sportssjef: "Anders Kristiansen",
              trener: "Anders Kristiansen",
              elever: 14,
              sistTest: "Høst 2026 (100% levert)",
              nesteTest: "15. nov 2026",
              dekning: 100,
              status: "Komplett levert",
              snittKneboy: 144,
              snittTrapbar: 186,
              snittTreTusen: "11:10",
              snittBallSpeed: 173,
              spillere: [
                { id: "s1", navn: "Magnus Kristiansen", trinn: "VG3", klasse: "Gutter U18", kneboy: 150, trapbar: 190, treTusen: "10:40", ballSpeed: 176, spenst: 59, wedge: 4.1, sisteTurnering: "Srixon Tour #4: 69 (-3)", status: "Oppfylt" },
                { id: "s2", navn: "Emilie Holst", trinn: "VG2", klasse: "Jenter U18", kneboy: 118, trapbar: 145, treTusen: "11:20", ballSpeed: 154, spenst: 52, wedge: 4.3, sisteTurnering: "NM Junior: 2. plass", status: "Oppfylt" },
                { id: "s3", navn: "Tobias Svendsen", trinn: "VG2", klasse: "Gutter U18", kneboy: 140, trapbar: 180, treTusen: "11:15", ballSpeed: 171, spenst: 55, wedge: 4.7, sisteTurnering: "Srixon Tour #3: 72 (E)", status: "Oppfylt" },
                { id: "s4", navn: "Sara Melle", trinn: "VG1", klasse: "Jenter U18", kneboy: 102, trapbar: 128, treTusen: "12:15", ballSpeed: 144, spenst: 45, wedge: 5.4, sisteTurnering: "Garmin NC: 77 (+5)", status: "Nær krav" },
              ],
            },
            {
              id: "wang-oslo",
              navn: "WANG Toppidrett Oslo",
              kortNavn: "Oslo VGS",
              type: "VGS" as const,
              sted: "Oslo",
              sportssjef: "Jørn Johnsen",
              trener: "Caroline Diethelm",
              elever: 22,
              sistTest: "Høst 2026 (100% levert)",
              nesteTest: "15. nov 2026",
              dekning: 100,
              status: "Komplett levert",
              snittKneboy: 142,
              snittTrapbar: 184,
              snittTreTusen: "11:15",
              snittBallSpeed: 172,
              spillere: [
                { id: "s5", navn: "Alexander Bøe", trinn: "VG3", klasse: "Gutter U18", kneboy: 150, trapbar: 195, treTusen: "10:45", ballSpeed: 175, spenst: 58, wedge: 4.2, sisteTurnering: "Srixon Tour #4: 71 (-1)", status: "Oppfylt" },
                { id: "s6", navn: "Sophia Lindqvist", trinn: "VG2", klasse: "Jenter U18", kneboy: 115, trapbar: 140, treTusen: "11:30", ballSpeed: 152, spenst: 49, wedge: 4.6, sisteTurnering: "Srixon Tour #3: 73 (+1)", status: "Oppfylt" },
                { id: "s7", navn: "Mats Hval", trinn: "VG1", klasse: "Gutter U18", kneboy: 130, trapbar: 165, treTusen: "11:50", ballSpeed: 166, spenst: 51, wedge: 5.1, sisteTurnering: "Garmin NC: 74 (+2)", status: "Nær krav" },
                { id: "s8", navn: "Celine Berntsen", trinn: "VG2", klasse: "Jenter U18", kneboy: 105, trapbar: 130, treTusen: "12:10", ballSpeed: 146, spenst: 46, wedge: 5.3, sisteTurnering: "Srixon Tour #4: 76 (+4)", status: "Nær krav" },
              ],
            },
            {
              id: "wang-romerike",
              navn: "WANG Toppidrett Romerike",
              kortNavn: "Romerike VGS",
              type: "VGS" as const,
              sted: "Romerike",
              sportssjef: "Niklas Diethelm",
              trener: "Niklas Diethelm",
              elever: 16,
              sistTest: "Høst 2026 (100% levert)",
              nesteTest: "15. nov 2026",
              dekning: 100,
              status: "Komplett levert",
              snittKneboy: 138,
              snittTrapbar: 178,
              snittTreTusen: "11:25",
              snittBallSpeed: 170,
              spillere: [
                { id: "s9", navn: "Eirik Lindstrøm", trinn: "VG3", klasse: "Gutter U18", kneboy: 155, trapbar: 205, treTusen: "10:20", ballSpeed: 178, spenst: 62, wedge: 3.9, sisteTurnering: "NM Match Miklagard: Seier", status: "Oppfylt" },
                { id: "s10", navn: "Casper Olsen", trinn: "VG2", klasse: "Gutter U18", kneboy: 135, trapbar: 175, treTusen: "11:40", ballSpeed: 168, spenst: 53, wedge: 4.8, sisteTurnering: "Srixon Tour #4: 73 (+1)", status: "Oppfylt" },
                { id: "s11", navn: "Julie Vik", trinn: "VG1", klasse: "Jenter U18", kneboy: 110, trapbar: 135, treTusen: "12:05", ballSpeed: 148, spenst: 47, wedge: 5.0, sisteTurnering: "Srixon Tour #3: 75 (+3)", status: "Nær krav" },
              ],
            },
            {
              id: "wang-tonsberg",
              navn: "WANG Toppidrett Tønsberg",
              kortNavn: "Tønsberg VGS",
              type: "VGS" as const,
              sted: "Tønsberg",
              sportssjef: "Knud Andreas Krokeide",
              trener: "Knud Andreas Krokeide",
              elever: 12,
              sistTest: "Høst 2026 (92% levert)",
              nesteTest: "15. nov 2026",
              dekning: 92,
              status: "Delvis levert (1 syk)",
              snittKneboy: 136,
              snittTrapbar: 174,
              snittTreTusen: "11:35",
              snittBallSpeed: 169,
              spillere: [
                { id: "s12", navn: "Felix Thoresen", trinn: "VG3", klasse: "Gutter U18", kneboy: 145, trapbar: 185, treTusen: "11:10", ballSpeed: 172, spenst: 56, wedge: 4.5, sisteTurnering: "Srixon Tour #4: 74 (+2)", status: "Oppfylt" },
                { id: "s13", navn: "Nora Bakke", trinn: "VG2", klasse: "Jenter U18", kneboy: 108, trapbar: 132, treTusen: "12:00", ballSpeed: 147, spenst: 48, wedge: 4.9, sisteTurnering: "Srixon Tour #3: 76 (+4)", status: "Nær krav" },
                { id: "s14", navn: "Vetle Johansen", trinn: "VG1", klasse: "Gutter U18", kneboy: 125, trapbar: 155, treTusen: "12:20", ballSpeed: 162, spenst: 48, wedge: 5.6, sisteTurnering: "Klubbmesterskap: 75 (+3)", status: "Under utvikling" },
              ],
            },
            {
              id: "wang-stavanger",
              navn: "WANG Toppidrett Stavanger",
              kortNavn: "Stavanger VGS",
              type: "VGS" as const,
              sted: "Stavanger",
              sportssjef: "Henning Lindanger",
              trener: "Are Friestad",
              elever: 18,
              sistTest: "Høst 2026 (95% levert)",
              nesteTest: "15. nov 2026",
              dekning: 95,
              status: "Komplett levert",
              snittKneboy: 140,
              snittTrapbar: 180,
              snittTreTusen: "11:18",
              snittBallSpeed: 171,
              spillere: [
                { id: "s15", navn: "Henrik Holthe", trinn: "VG3", klasse: "Gutter U18", kneboy: 148, trapbar: 188, treTusen: "10:55", ballSpeed: 174, spenst: 57, wedge: 4.3, sisteTurnering: "Srixon Tour #4: 70 (-2)", status: "Oppfylt" },
                { id: "s16", navn: "Mats Aas", trinn: "VG2", klasse: "Gutter U18", kneboy: 138, trapbar: 176, treTusen: "11:25", ballSpeed: 170, spenst: 54, wedge: 4.6, sisteTurnering: "Srixon Tour #3: 73 (+1)", status: "Oppfylt" },
                { id: "s17", navn: "Ingrid Solberg", trinn: "VG2", klasse: "Jenter U18", kneboy: 112, trapbar: 138, treTusen: "11:50", ballSpeed: 150, spenst: 50, wedge: 4.7, sisteTurnering: "Srixon Tour #4: 74 (+2)", status: "Oppfylt" },
                { id: "s18", navn: "Sander Eide", trinn: "VG1", klasse: "Gutter U18", kneboy: 128, trapbar: 160, treTusen: "12:05", ballSpeed: 164, spenst: 50, wedge: 5.2, sisteTurnering: "Garmin NC: 76 (+4)", status: "Nær krav" },
              ],
            },

            // WANG Ung (6 skoler)
            {
              id: "wang-ung-oslo",
              navn: "WANG Ung Oslo",
              kortNavn: "Oslo Ung",
              type: "UNG" as const,
              sted: "Oslo",
              sportssjef: "WANG Ung Ledelse",
              trener: "Caroline Diethelm",
              elever: 14,
              sistTest: "Vår 2026 (100% levert)",
              nesteTest: "20. nov 2026",
              dekning: 100,
              status: "Planlagt høsttest",
              snittKneboy: 95,
              snittTrapbar: 125,
              snittTreTusen: "12:10",
              snittBallSpeed: 155,
              spillere: [
                { id: "su1", navn: "Jens Løken", trinn: "10. trinn", klasse: "Gutter U15", kneboy: 105, trapbar: 135, treTusen: "11:45", ballSpeed: 160, spenst: 52, wedge: 4.6, sisteTurnering: "Narvesen Tour #5: 74 (+2)", status: "Oppfylt" },
                { id: "su2", navn: "Mia Berg", trinn: "9. trinn", klasse: "Jenter U15", kneboy: 85, trapbar: 115, treTusen: "12:35", ballSpeed: 142, spenst: 44, wedge: 5.0, sisteTurnering: "Narvesen Tour #4: 78 (+6)", status: "Nær krav" },
              ],
            },
            {
              id: "wang-ung-fredrikstad",
              navn: "WANG Ung Fredrikstad",
              kortNavn: "Fredrikstad Ung",
              type: "UNG" as const,
              sted: "Fredrikstad",
              sportssjef: "WANG Ung Ledelse",
              trener: "Anders Kristiansen",
              elever: 10,
              sistTest: "Vår 2026 (100% levert)",
              nesteTest: "20. nov 2026",
              dekning: 100,
              status: "Planlagt høsttest",
              snittKneboy: 92,
              snittTrapbar: 122,
              snittTreTusen: "12:15",
              snittBallSpeed: 154,
              spillere: [
                { id: "su3", navn: "Herman Bye", trinn: "10. trinn", klasse: "Gutter U15", kneboy: 100, trapbar: 130, treTusen: "11:55", ballSpeed: 158, spenst: 50, wedge: 4.8, sisteTurnering: "Narvesen Tour #5: 75 (+3)", status: "Oppfylt" },
                { id: "su4", navn: "Ella Halvorsen", trinn: "9. trinn", klasse: "Jenter U15", kneboy: 82, trapbar: 112, treTusen: "12:40", ballSpeed: 140, spenst: 43, wedge: 5.2, sisteTurnering: "Narvesen Tour #4: 80 (+8)", status: "Nær krav" },
              ],
            },
            {
              id: "wang-ung-romerike",
              navn: "WANG Ung Romerike",
              kortNavn: "Romerike Ung",
              type: "UNG" as const,
              sted: "Romerike",
              sportssjef: "WANG Ung Ledelse",
              trener: "Niklas Diethelm",
              elever: 8,
              sistTest: "Vår 2026 (100% levert)",
              nesteTest: "20. nov 2026",
              dekning: 100,
              status: "Planlagt høsttest",
              snittKneboy: 90,
              snittTrapbar: 118,
              snittTreTusen: "12:25",
              snittBallSpeed: 152,
              spillere: [
                { id: "su5", navn: "Simen Moen", trinn: "10. trinn", klasse: "Gutter U15", kneboy: 98, trapbar: 126, treTusen: "12:05", ballSpeed: 155, spenst: 49, wedge: 4.9, sisteTurnering: "Narvesen Tour #4: 76 (+4)", status: "Oppfylt" },
              ],
            },
            {
              id: "wang-ung-stavanger",
              navn: "WANG Ung Stavanger",
              kortNavn: "Stavanger Ung",
              type: "UNG" as const,
              sted: "Stavanger",
              sportssjef: "WANG Ung Ledelse",
              trener: "Are Friestad",
              elever: 12,
              sistTest: "Vår 2026 (100% levert)",
              nesteTest: "20. nov 2026",
              dekning: 100,
              status: "Planlagt høsttest",
              snittKneboy: 94,
              snittTrapbar: 124,
              snittTreTusen: "12:12",
              snittBallSpeed: 156,
              spillere: [
                { id: "su6", navn: "Markus Lie", trinn: "10. trinn", klasse: "Gutter U15", kneboy: 104, trapbar: 134, treTusen: "11:50", ballSpeed: 159, spenst: 51, wedge: 4.7, sisteTurnering: "Narvesen Tour #5: 73 (+1)", status: "Oppfylt" },
              ],
            },
            {
              id: "wang-ung-sandefjord",
              navn: "WANG Ung Sandefjord",
              kortNavn: "Sandefjord Ung",
              type: "UNG" as const,
              sted: "Sandefjord",
              sportssjef: "WANG Ung Ledelse",
              trener: "Knud Andreas Krokeide",
              elever: 6,
              sistTest: "Vår 2026 (100% levert)",
              nesteTest: "20. nov 2026",
              dekning: 100,
              status: "Planlagt høsttest",
              snittKneboy: 88,
              snittTrapbar: 115,
              snittTreTusen: "12:35",
              snittBallSpeed: 150,
              spillere: [
                { id: "su7", navn: "Oliver Hansen", trinn: "9. trinn", klasse: "Gutter U15", kneboy: 90, trapbar: 118, treTusen: "12:20", ballSpeed: 151, spenst: 47, wedge: 5.1, sisteTurnering: "Narvesen Tour #4: 79 (+7)", status: "Nær krav" },
              ],
            },
            {
              id: "wang-ung-follo",
              navn: "WANG Ung Follo",
              kortNavn: "Follo Ung",
              type: "UNG" as const,
              sted: "Follo",
              sportssjef: "WANG Ung Ledelse",
              trener: "Follo Trenerteam",
              elever: 8,
              sistTest: "Vår 2026 (100% levert)",
              nesteTest: "20. nov 2026",
              dekning: 100,
              status: "Planlagt høsttest",
              snittKneboy: 91,
              snittTrapbar: 120,
              snittTreTusen: "12:20",
              snittBallSpeed: 153,
              spillere: [
                { id: "su8", navn: "Kasper Vang", trinn: "10. trinn", klasse: "Gutter U15", kneboy: 96, trapbar: 124, treTusen: "12:10", ballSpeed: 154, spenst: 49, wedge: 4.9, sisteTurnering: "Narvesen Tour #5: 76 (+4)", status: "Oppfylt" },
              ],
            },
          ];

          const filtrerteSkoler = toppidrettsSkoler.filter((s) => {
            if (skoleTypeFilter === "VGS" && s.type !== "VGS") return false;
            if (skoleTypeFilter === "UNG" && s.type !== "UNG") return false;
            if (skoleSok.trim() !== "") {
              const q = skoleSok.toLowerCase();
              return (
                s.navn.toLowerCase().includes(q) ||
                s.sportssjef.toLowerCase().includes(q) ||
                (s.trener && s.trener.toLowerCase().includes(q)) ||
                s.sted.toLowerCase().includes(q)
              );
            }
            return true;
          });

          const valgtSkole =
            toppidrettsSkoler.find((s) => s.id === valgtSkoleId) ||
            toppidrettsSkoler[0];

          return (
            <div className="space-y-6">
              {/* Header */}
              <div className="border-b border-[#01234C]/20 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#D70232] font-semibold">
                      TN-06 · SAMARBEIDSSKOLER
                    </span>
                    <span className="text-[10px] font-mono text-[#5E6E7F]">|</span>
                    <span className="text-[10px] font-mono text-[#012B5D] font-bold">
                      WANG TOPPIDRETT & WANG UNG
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#012B5D] mt-1">
                    Toppidrettsskoler & Testprotokoller
                  </h2>
                  <p className="text-xs text-[#5E6E7F] mt-0.5">
                    Komplett nasjonal oversikt over fysiske tester levert, planlagte testdatoer og utøverresultater per skole.
                  </p>
                </div>

                {/* Pipeline statusindikator */}
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-[2px] border border-[#01234C]/15 shrink-0 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-[#0D6338] animate-pulse" />
                  <span className="text-[11px] font-mono text-[#012B5D] font-medium">
                    AK Golf Pipeline: <strong className="text-[#0D6338]">Tilkoblet</strong>
                  </span>
                </div>
              </div>

              {/* KPI Bånd */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white p-4 rounded-[2px] border border-[#01234C]/15 shadow-2xs">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#5E6E7F]">
                    SKOLER I PARTNERSKAP
                  </div>
                  <div className="text-2xl font-bold font-mono text-[#012B5D] mt-1">
                    11
                  </div>
                  <div className="text-[11px] text-[#5E6E7F] mt-0.5">
                    5 VGS Toppidrett + 6 WANG Ung
                  </div>
                </div>

                <div className="bg-white p-4 rounded-[2px] border border-[#01234C]/15 shadow-2xs">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#5E6E7F]">
                    REGISTRERTE UTØVERE
                  </div>
                  <div className="text-2xl font-bold font-mono text-[#012B5D] mt-1">
                    136
                  </div>
                  <div className="text-[11px] text-[#5E6E7F] mt-0.5">
                    Elever under nasjonal oppfølging
                  </div>
                </div>

                <div className="bg-white p-4 rounded-[2px] border border-[#01234C]/15 shadow-2xs">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#5E6E7F]">
                    TESTDEKNING HØST 2026
                  </div>
                  <div className="text-2xl font-bold font-mono text-[#0D6338] mt-1">
                    96%
                  </div>
                  <div className="text-[11px] text-[#5E6E7F] mt-0.5">
                    Levert innen nasjonal frist
                  </div>
                </div>

                <div className="bg-white p-4 rounded-[2px] border border-[#01234C]/15 shadow-2xs">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#5E6E7F]">
                    NESTE NASJONALE TEST
                  </div>
                  <div className="text-2xl font-bold font-mono text-[#D70232] mt-1">
                    15. nov
                  </div>
                  <div className="text-[11px] text-[#5E6E7F] mt-0.5">
                    Felles fysisk testdag v/ skolene
                  </div>
                </div>
              </div>

              {/* Filter- og søkebar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-3 rounded-[2px] border border-[#01234C]/15">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  <button
                    type="button"
                    onClick={() => setSkoleTypeFilter("ALLE")}
                    className={`px-3 py-1 text-xs font-mono rounded-[2px] transition-colors whitespace-nowrap ${
                      skoleTypeFilter === "ALLE"
                        ? "bg-[#012B5D] text-white font-bold"
                        : "bg-[#F2F7FC] text-[#5E6E7F] hover:text-[#0C1219]"
                    }`}
                  >
                    Alle skoler (11)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSkoleTypeFilter("VGS")}
                    className={`px-3 py-1 text-xs font-mono rounded-[2px] transition-colors whitespace-nowrap ${
                      skoleTypeFilter === "VGS"
                        ? "bg-[#012B5D] text-white font-bold"
                        : "bg-[#F2F7FC] text-[#5E6E7F] hover:text-[#0C1219]"
                    }`}
                  >
                    WANG Toppidrett VGS (5)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSkoleTypeFilter("UNG")}
                    className={`px-3 py-1 text-xs font-mono rounded-[2px] transition-colors whitespace-nowrap ${
                      skoleTypeFilter === "UNG"
                        ? "bg-[#012B5D] text-white font-bold"
                        : "bg-[#F2F7FC] text-[#5E6E7F] hover:text-[#0C1219]"
                    }`}
                  >
                    WANG Ung (6)
                  </button>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#5E6E7F]" />
                  <input
                    type="text"
                    placeholder="Søk skole, trener, sted..."
                    value={skoleSok}
                    onChange={(e) => setSkoleSok(e.target.value)}
                    className="w-full pl-8 pr-3 py-1 text-xs font-sans rounded-[2px] border border-[#01234C]/20 bg-[#F2F7FC] focus:bg-white focus:outline-none focus:border-[#012B5D]"
                  />
                </div>
              </div>

              {/* Rutenett over skoler */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filtrerteSkoler.map((skole) => {
                  const erValgt = skole.id === valgtSkole.id;
                  return (
                    <div
                      key={skole.id}
                      onClick={() => setValgtSkoleId(skole.id)}
                      className={`p-4 rounded-[2px] border cursor-pointer transition-all ${
                        erValgt
                          ? "bg-white border-[#012B5D] ring-2 ring-[#012B5D]/20 shadow-md"
                          : "bg-white border-[#01234C]/15 hover:border-[#012B5D]/40 shadow-2xs"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[9px] font-mono px-1.5 py-0.5 rounded-[2px] uppercase font-bold ${
                                skole.type === "VGS"
                                  ? "bg-[#012B5D] text-white"
                                  : "bg-[#7FA3C9]/30 text-[#012B5D]"
                              }`}
                            >
                              {skole.type}
                            </span>
                            <span className="text-[11px] font-mono text-[#5E6E7F]">
                              {skole.sted}
                            </span>
                          </div>
                          <h3 className="font-semibold text-sm text-[#012B5D] mt-1">
                            {skole.navn}
                          </h3>
                        </div>
                        {erValgt && (
                          <span className="w-2 h-2 rounded-full bg-[#D70232] shrink-0 mt-1" />
                        )}
                      </div>

                      {/* Ledelse */}
                      <div className="mt-3 pt-2 border-t border-[#01234C]/10 text-xs space-y-0.5 text-[#5E6E7F]">
                        <div className="flex justify-between">
                          <span>Sportssjef:</span>
                          <strong className="text-[#0C1219] font-medium">{skole.sportssjef}</strong>
                        </div>
                        {skole.trener && (
                          <div className="flex justify-between">
                            <span>Trener:</span>
                            <strong className="text-[#0C1219] font-medium">{skole.trener}</strong>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Utøvere:</span>
                          <span className="font-mono text-[#012B5D] font-bold">{skole.elever} elever</span>
                        </div>
                      </div>

                      {/* Teststatus */}
                      <div className="mt-3 pt-2 border-t border-[#01234C]/10 flex items-center justify-between text-[11px] font-mono">
                        <div>
                          <span className="text-[#5E6E7F] block text-[9px] uppercase">Neste test</span>
                          <span className="font-semibold text-[#D70232]">{skole.nesteTest}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[#5E6E7F] block text-[9px] uppercase">Sist levert</span>
                          <span className="text-[#0D6338] font-bold">{skole.dekning}% levert</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Detaljseksjon for valgt skole */}
              <div className="bg-white rounded-[2px] border border-[#01234C]/15 p-5 shadow-2xs space-y-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#01234C]/15 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-[#012B5D] text-white text-[10px] font-mono font-bold rounded-[2px] uppercase">
                        {valgtSkole.type} AVDELING
                      </span>
                      <span className="text-xs font-mono text-[#5E6E7F]">
                        Sportssjef: <strong>{valgtSkole.sportssjef}</strong> · Trener: <strong>{valgtSkole.trener || "Felles trenerteam"}</strong>
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-[#012B5D] mt-1">
                      {valgtSkole.navn} · Elevprotokoll & Testresultater
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => alert(`Eksporterer testprotokoll for ${valgtSkole.navn}`)}
                      className="px-3 py-1.5 bg-[#F2F7FC] hover:bg-[#E2EDF8] text-[#012B5D] text-xs font-mono font-medium rounded-[2px] border border-[#01234C]/15 flex items-center gap-1.5 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#012B5D]" />
                      <span>Eksporter protokoll</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => alert(`Varsel sendt til ${valgtSkole.sportssjef} for neste testdato: ${valgtSkole.nesteTest}`)}
                      className="px-3 py-1.5 bg-[#012B5D] hover:bg-[#01234C] text-white text-xs font-mono font-semibold rounded-[2px] flex items-center gap-1.5 transition-colors"
                    >
                      <Calendar className="w-3.5 h-3.5 text-white" />
                      <span>Innkall neste test ({valgtSkole.nesteTest})</span>
                    </button>
                  </div>
                </div>

                {/* Skolesnitt mot landslagsstandard */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F2F7FC] p-3 rounded-[2px] border border-[#01234C]/10">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#5E6E7F] block">Knebøy (snitt)</span>
                    <span className="text-lg font-mono font-bold text-[#012B5D]">{valgtSkole.snittKneboy} kg</span>
                    <span className="text-[10px] text-[#5E6E7F] block">Standard: 140 kg</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#5E6E7F] block">Trapbar (snitt)</span>
                    <span className="text-lg font-mono font-bold text-[#012B5D]">{valgtSkole.snittTrapbar} kg</span>
                    <span className="text-[10px] text-[#5E6E7F] block">Standard: 180 kg</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#5E6E7F] block">3000m (snitt)</span>
                    <span className="text-lg font-mono font-bold text-[#012B5D]">{valgtSkole.snittTreTusen}</span>
                    <span className="text-[10px] text-[#5E6E7F] block">Standard: 11:00</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#5E6E7F] block">Ball Speed Driver</span>
                    <span className="text-lg font-mono font-bold text-[#012B5D]">{valgtSkole.snittBallSpeed} mph</span>
                    <span className="text-[10px] text-[#5E6E7F] block">Standard: 170 mph</span>
                  </div>
                </div>

                {/* Spillerresultattabell for valgt skole */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono uppercase font-bold text-[#012B5D] tracking-wider">
                      Individuelle testresultater ({valgtSkole.spillere.length} spillere i visning)
                    </span>
                    <span className="text-[11px] text-[#5E6E7F] font-mono">
                      * Siste turnering synkroniseres automatisk via AK Golf Pipeline
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-[#01234C]/20 text-[#5E6E7F] font-mono uppercase text-[10px]">
                          <th className="py-2.5 font-semibold">Utøver</th>
                          <th className="py-2.5 font-semibold">Klasse</th>
                          <th className="py-2.5 font-semibold text-right">Knebøy</th>
                          <th className="py-2.5 font-semibold text-right">Trapbar</th>
                          <th className="py-2.5 font-semibold text-right">3000m</th>
                          <th className="py-2.5 font-semibold text-right">Ball Speed</th>
                          <th className="py-2.5 font-semibold text-right">Spenst</th>
                          <th className="py-2.5 font-semibold text-right">Wedge Prox</th>
                          <th className="py-2.5 font-semibold">Siste turnering (Pipeline)</th>
                          <th className="py-2.5 font-semibold text-right">Landslagsstandard</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#01234C]/10 font-sans">
                        {valgtSkole.spillere.map((spiller) => (
                          <tr
                            key={spiller.id}
                            className="hover:bg-[#F2F7FC]/70 transition-colors"
                          >
                            <td className="py-3 font-semibold text-[#0C1219]">
                              <button
                                type="button"
                                onClick={() => setAktivSkjerm("TN-02")}
                                className="text-left hover:text-[#D70232] transition-colors flex items-center gap-1 group"
                              >
                                <span>{spiller.navn}</span>
                                <span className="text-[9px] font-mono text-[#5E6E7F] group-hover:text-[#D70232]">
                                  ({spiller.trinn})
                                </span>
                              </button>
                            </td>
                            <td className="py-3 text-[#5E6E7F] font-mono text-[11px]">
                              {spiller.klasse}
                            </td>
                            <td className="py-3 font-mono text-right text-[#012B5D] font-medium">
                              {spiller.kneboy} kg
                            </td>
                            <td className="py-3 font-mono text-right text-[#012B5D] font-medium">
                              {spiller.trapbar} kg
                            </td>
                            <td className="py-3 font-mono text-right text-[#012B5D] font-medium">
                              {spiller.treTusen}
                            </td>
                            <td className="py-3 font-mono text-right text-[#012B5D] font-bold">
                              {spiller.ballSpeed} mph
                            </td>
                            <td className="py-3 font-mono text-right text-[#012B5D]">
                              {spiller.spenst} cm
                            </td>
                            <td className="py-3 font-mono text-right text-[#012B5D]">
                              {spiller.wedge} m
                            </td>
                            <td className="py-3 text-[11px] font-mono">
                              <span className="bg-[#F2F7FC] text-[#012B5D] px-2 py-0.5 rounded-[2px] border border-[#01234C]/10">
                                {spiller.sisteTurnering}
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              <span
                                className={`inline-flex items-center font-mono text-[10px] px-2 py-0.5 rounded-[2px] font-semibold ${
                                  spiller.status === "Oppfylt"
                                    ? "bg-[#0D6338]/10 text-[#0D6338]"
                                    : spiller.status === "Nær krav"
                                    ? "bg-[#012B5D]/10 text-[#012B5D]"
                                    : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {spiller.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Hjemmel og databehandling */}
                <div className="bg-[#F2F7FC] border border-[#01234C]/15 p-3 rounded-[2px] text-[11px] text-[#5E6E7F] flex items-start gap-2">
                  <Shield className="w-4 h-4 text-[#012B5D] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#012B5D]">Behandlingsgrunnlag og samarbeidsavtale:</strong> Testdata registreres under WANG Toppidretts og NGF Team Norways felles talentutviklingsprotokoll. Individuelle spillerprofiler synkroniseres med utøverens PlayerHQ profil i AK Golf.
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </main>

      {/* ─────────────────────────────────────────────────────────────
          MOBIL BUNN TAB-BAR (< 860px)
         ───────────────────────────────────────────────────────────── */}
      {visNavigasjon && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#012B5D] text-white border-t border-[#033C7A] flex items-center justify-around py-2 px-1 z-40">
          {menyPunkter.map((punkt) => {
            const erAktiv = aktivSkjerm === punkt.id;
            return (
              <button
                key={punkt.id}
                type="button"
                onClick={() => setAktivSkjerm(punkt.id)}
                className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-mono rounded-[2px] relative transition-colors ${
                  erAktiv ? "text-white font-bold" : "text-[#7FA3C9] hover:text-white"
                }`}
              >
                {erAktiv && (
                  <span className="absolute -top-2 left-2 right-2 h-[2px] bg-[#D70232]" />
                )}
                {punkt.icon}
                <span>{punkt.kortTittel}</span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}
