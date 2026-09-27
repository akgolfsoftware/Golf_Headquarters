"use client";

import React, { useState } from "react";
import { formaterTall } from "@/lib/format-tall";
import {
  Calendar,
  Activity,
  Dumbbell,
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle,
  Award,
  Plus,
} from "lucide-react";

interface FysiskTestDef {
  id: string;
  navn: string;
  enhet: string;
  spillerVerdi: number;
  nasjonaltSnitt: number;
  nasjonalTopp: number;
  kategori: string;
  beskrivelse: string;
}

export function WangToppidrettPrecisionView() {
  const [aktivFane, setAktivFane] = useState<"ukeplan" | "fysiske-tester">("ukeplan");

  // Ukesplan tilstand
  const [fraværsMeldinger, setFraværsMeldinger] = useState<Record<string, string>>({});
  const [visFraværsDialog, setVisFraværsDialog] = useState<string | null>(null);
  const [valgtAarsak, setValgtAarsak] = useState("Sykdom / forkjølelse");

  // 5 Nasjonale fysiske tester for WANG Toppidrett Golf
  const [tester, setTester] = useState<FysiskTestDef[]>([
    {
      id: "trapbar",
      navn: "Trapbar Markløft (relativ styrke)",
      enhet: "x KV",
      spillerVerdi: 1.75,
      nasjonaltSnitt: 1.60,
      nasjonalTopp: 2.10,
      kategori: "Maksimal styrke",
      beskrivelse: "Måler vertikal kraftutvikling i baksving og nedsving for økt køllehastighet.",
    },
    {
      id: "kneboy",
      navn: "Knebøy (relativ styrke)",
      enhet: "x KV",
      spillerVerdi: 1.45,
      nasjonaltSnitt: 1.40,
      nasjonalTopp: 1.85,
      kategori: "Bilateral beinstyrke",
      beskrivelse: "Stabilitet i kneledd og bekken under rotasjonsakselerasjon.",
    },
    {
      id: "benkpress",
      navn: "Benkpress (relativ styrke)",
      enhet: "x KV",
      spillerVerdi: 1.15,
      nasjonaltSnitt: 1.00,
      nasjonalTopp: 1.35,
      kategori: "Overkroppsstyrke",
      beskrivelse: "Stabilitet i bryst og skulderbue for presis køllebladskontroll.",
    },
    {
      id: "medisinball",
      navn: "Rotasjonskast m/ 3 kg medisinball",
      enhet: "meter",
      spillerVerdi: 14.2,
      nasjonaltSnitt: 12.5,
      nasjonalTopp: 16.5,
      kategori: "Rotasjonell eksplosivitet",
      beskrivelse: "Kjernemuskulaturens evne til å overføre bakkekraft til rotasjonshastighet.",
    },
    {
      id: "yoyo",
      navn: "Yo-Yo Utholdenhetstest / Bip",
      enhet: "nivå",
      spillerVerdi: 15.6,
      nasjonaltSnitt: 14.2,
      nasjonalTopp: 17.8,
      kategori: "Aerob kapasitet",
      beskrivelse: "Utholdenhet over 18 og 36 hull for å beholde kognitivt fokus og presisjon.",
    },
  ]);

  // Ny registrering av testverdi
  const [redigererTestId, setRedigererTestId] = useState<string | null>(null);
  const [nyVerdi, setNyVerdi] = useState<string>("");

  const lagreNyVerdi = (id: string) => {
    const numeric = parseFloat(nyVerdi);
    if (!numeric || numeric <= 0) return;
    setTester((prev) =>
      prev.map((t) => (t.id === id ? { ...t, spillerVerdi: numeric } : t))
    );
    setRedigererTestId(null);
    setNyVerdi("");
  };

  const okter = [
    {
      id: "man",
      dag: "Mandag",
      tid: "08:00 – 09:30",
      tittel: "Fysisk basis & Styrketester",
      sted: "WANG Toppidrett Treningssenter",
      fokus: "Trapbar, knebøy og kjerneeksplosivitet",
      trener: "Fysisk trener / Anders",
    },
    {
      id: "tir",
      dag: "Tirsdag",
      tid: "08:00 – 10:00",
      tittel: "TrackMan analyse & Nærspill",
      sted: "AK Golf Academy Studio",
      fokus: "Køllebanekontroll og wedge-dispersion",
      trener: "Coach Anders Kristiansen",
    },
    {
      id: "tor",
      dag: "Torsdag",
      tid: "08:00 – 10:00",
      tittel: "Banestrategi & Spilløvelser",
      sted: "Simulator / Fredrikstad GK",
      fokus: "Scorekortanalyse, Tiger 5 og pressøkter",
      trener: "Coach Anders Kristiansen",
    },
  ];

  const meldFravaer = (oktId: string) => {
    setFraværsMeldinger((prev) => ({
      ...prev,
      [oktId]: valgtAarsak,
    }));
    setVisFraværsDialog(null);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-6">
      {/* Toppseksjon */}
      <div className="rounded-2xl border border-[#DDD9D1] bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-black/50">
                WANG Toppidrett Fredrikstad · Golf
              </span>
              <span className="rounded-full bg-[#141413] px-2.5 py-0.5 font-mono text-[10px] font-bold text-white">
                Toppidrett 1–3
              </span>
            </div>
            <h1 className="font-sans text-2xl sm:text-3xl font-bold tracking-tight text-[#141413] mt-1">
              Treningsplan & Fysiske Tester
            </h1>
            <p className="font-sans text-xs text-black/60 mt-1">
              Ukentlige morgentreninger, fraværsregistrering og nasjonale benchmark-tester
            </p>
          </div>

          {/* Fanevelger */}
          <div className="flex rounded-lg border border-[#DDD9D1] bg-[#FAF8F3] p-1 shrink-0">
            <button
              type="button"
              onClick={() => setAktivFane("ukeplan")}
              className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 font-sans text-xs font-semibold transition-all ${
                aktivFane === "ukeplan"
                  ? "bg-[#141413] text-white shadow-xs"
                  : "text-black/70 hover:text-black"
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Ukesplan & Fravær</span>
            </button>

            <button
              type="button"
              onClick={() => setAktivFane("fysiske-tester")}
              className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 font-sans text-xs font-semibold transition-all ${
                aktivFane === "fysiske-tester"
                  ? "bg-[#141413] text-white shadow-xs"
                  : "text-black/70 hover:text-black"
              }`}
            >
              <Activity className="h-3.5 w-3.5" />
              <span>5 Fysiske tester</span>
            </button>
          </div>
        </div>
      </div>

      {/* Fane 1: Ukesplan for morgentreninger */}
      {aktivFane === "ukeplan" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-sans text-xs font-bold uppercase tracking-wider text-black/60">
              Faste morgenøkter (08:00 – 10:00)
            </span>
            <span className="font-sans text-xs text-black/50">
              Oppmøte registreres senest kl. 07:50
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {okter.map((okt) => {
              const harFravaer = fraværsMeldinger[okt.id];
              return (
                <div
                  key={okt.id}
                  className="rounded-xl border border-[#DDD9D1] bg-white p-5 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-[#DDD9D1] pb-3 mb-3">
                      <span className="rounded bg-[#141413] px-2.5 py-1 font-mono text-xs font-bold text-white">
                        {okt.dag}
                      </span>
                      <span className="font-mono text-xs font-bold text-black/70">
                        {okt.tid}
                      </span>
                    </div>

                    <h3 className="font-sans text-base font-bold text-[#141413]">
                      {okt.tittel}
                    </h3>

                    <div className="mt-3 space-y-1.5 text-xs text-black/70 font-sans">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-3.5 w-3.5 text-black/40 shrink-0 mt-0.5" />
                        <span>{okt.sted}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Dumbbell className="h-3.5 w-3.5 text-black/40 shrink-0 mt-0.5" />
                        <span>{okt.fokus}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock className="h-3.5 w-3.5 text-black/40 shrink-0 mt-0.5" />
                        <span>Trener: {okt.trener}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-[#DDD9D1] pt-3">
                    {harFravaer ? (
                      <div className="rounded bg-rose-50 border border-rose-200 p-2 text-xs flex items-center justify-between">
                        <span className="font-sans font-bold text-rose-900">
                          Meldt fravær: {harFravaer}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const oppdatert = { ...fraværsMeldinger };
                            delete oppdatert[okt.id];
                            setFraværsMeldinger(oppdatert);
                          }}
                          className="text-[11px] text-rose-700 underline font-semibold"
                        >
                          Angre
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 font-sans text-xs font-semibold text-emerald-800">
                          <CheckCircle className="h-3.5 w-3.5" />
                          Planlagt oppmøte
                        </span>
                        <button
                          type="button"
                          onClick={() => setVisFraværsDialog(okt.id)}
                          className="font-sans text-xs font-semibold text-[#9B2415] hover:underline"
                        >
                          Meld fravær
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Fane 2: De 5 Nasjonale fysiske testene */}
      {aktivFane === "fysiske-tester" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-[#DDD9D1] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#DDD9D1] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-[#9B2415]" />
                <h3 className="font-sans text-base font-bold text-[#141413]">
                  Nasjonale Fysiske Tester for Toppidrettsgolf
                </h3>
              </div>
              <span className="font-sans text-xs font-semibold text-black/50">
                WANG Toppidrett Nasjonal Benchmark
              </span>
            </div>

            <p className="font-sans text-xs text-black/60 mb-6">
              Sammenligning av golferens fysiske profil mot landsgjennomsnittet for WANG Toppidrett
              og nasjonal toppstandard for college-/tour-klare spillere.
            </p>

            {/* Testkort og søylediagram */}
            <div className="space-y-5">
              {tester.map((t) => {
                const prosentAvSnitt = Math.round((t.spillerVerdi / t.nasjonaltSnitt) * 100);
                const overSnitt = t.spillerVerdi >= t.nasjonaltSnitt;
                const prosentAvTopp = Math.min(100, Math.round((t.spillerVerdi / t.nasjonalTopp) * 100));

                return (
                  <div
                    key={t.id}
                    className="rounded-xl border border-[#DDD9D1] bg-[#FAF8F3] p-4 sm:p-5 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#DDD9D1] pb-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-sans text-sm font-bold text-[#141413]">
                            {t.navn}
                          </span>
                          <span className="rounded bg-black/10 px-2 py-0.5 font-sans text-[10px] font-semibold text-black/70">
                            {t.kategori}
                          </span>
                        </div>
                        <p className="font-sans text-xs text-black/60 mt-0.5">
                          {t.beskrivelse}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="block font-mono text-lg font-bold text-[#141413]">
                            {formaterTall(t.spillerVerdi, 2)} {t.enhet}
                          </span>
                          <span
                            className={`font-sans text-[11px] font-bold ${
                              overSnitt ? "text-emerald-800" : "text-amber-800"
                            }`}
                          >
                            {overSnitt ? `+${prosentAvSnitt - 100} % over snitt` : `${100 - prosentAvSnitt} % under snitt`}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setRedigererTestId(t.id);
                            setNyVerdi(String(t.spillerVerdi));
                          }}
                          className="rounded border border-[#DDD9D1] bg-white p-1.5 hover:bg-[#F1EEE8] text-black/70"
                          title="Registrer ny testverdi"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Redigeringsboks */}
                    {redigererTestId === t.id && (
                      <div className="mb-3 rounded-lg border border-[#DDD9D1] bg-white p-3 flex items-center gap-3">
                        <span className="font-sans text-xs font-semibold text-[#141413]">
                          Registrer nytt testresultat ({t.enhet}):
                        </span>
                        <input
                          type="number"
                          step="0.05"
                          value={nyVerdi}
                          onChange={(e) => setNyVerdi(e.target.value)}
                          className="w-24 rounded border border-[#DDD9D1] px-2 py-1 font-mono text-xs font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => lagreNyVerdi(t.id)}
                          className="rounded bg-[#141413] px-3 py-1 font-sans text-xs font-semibold text-white"
                        >
                          Lagre
                        </button>
                        <button
                          type="button"
                          onClick={() => setRedigererTestId(null)}
                          className="font-sans text-xs text-black/60 hover:underline"
                        >
                          Avbryt
                        </button>
                      </div>
                    )}

                    {/* Visuelt søylediagram sammenlignet med landssnitt og topp */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-mono text-[10px] text-black/50">
                        <span>0</span>
                        <span>Nasjonalt snitt: {formaterTall(t.nasjonaltSnitt, 2)}</span>
                        <span>Nasjonal topp: {formaterTall(t.nasjonalTopp, 2)}</span>
                      </div>

                      {/* Fremdriftsfelt */}
                      <div className="relative h-4 w-full rounded-full bg-[#DDD9D1] overflow-hidden">
                        {/* Spillerens verdi */}
                        <div
                          style={{ width: `${prosentAvTopp}%` }}
                          className={`h-full transition-all duration-500 ${
                            overSnitt ? "bg-emerald-600" : "bg-amber-600"
                          }`}
                        />
                        {/* Nasjonalt snitt linje */}
                        <div
                          style={{
                            left: `${Math.round((t.nasjonaltSnitt / t.nasjonalTopp) * 100)}%`,
                          }}
                          className="absolute top-0 bottom-0 w-0.5 bg-[#141413] z-10"
                        />
                      </div>

                      <div className="flex justify-between font-sans text-[11px]">
                        <span className="text-black/60">
                          Oppnådd: <strong className="font-mono text-[#141413]">{prosentAvTopp} %</strong> av nasjonal toppstandard
                        </span>
                        {overSnitt ? (
                          <span className="text-emerald-800 font-bold">Krav bestått</span>
                        ) : (
                          <span className="text-amber-800 font-bold">Utviklingspotensial</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Fraværsdialog modal */}
      {visFraværsDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl border border-[#DDD9D1] bg-white p-5 shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="h-5 w-5 text-[#9B2415]" />
              <h3 className="font-sans text-sm font-bold text-[#141413]">
                Meld fravær fra morgentrening
              </h3>
            </div>
            <p className="font-sans text-xs text-black/60 mb-4">
              Trener varsles automatisk slik at øktplanen tilpasses.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block font-sans text-[11px] font-semibold text-black/60 mb-1">
                  Årsak
                </label>
                <select
                  value={valgtAarsak}
                  onChange={(e) => setValgtAarsak(e.target.value)}
                  className="w-full rounded-lg border border-[#DDD9D1] bg-[#FAF8F3] px-3 py-2 font-sans text-xs"
                >
                  <option value="Sykdom / forkjølelse">Sykdom / forkjølelse</option>
                  <option value="Skole / tentamen / eksamen">Skole / tentamen / eksamen</option>
                  <option value="Turnering / reise">Turnering / reise</option>
                  <option value="Skade / restitusjon">Skade / restitusjon</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setVisFraværsDialog(null)}
                  className="rounded-lg border border-[#DDD9D1] px-3 py-1.5 font-sans text-xs font-semibold text-black/70"
                >
                  Avbryt
                </button>
                <button
                  type="button"
                  onClick={() => meldFravaer(visFraværsDialog)}
                  className="rounded-lg bg-[#9B2415] px-3 py-1.5 font-sans text-xs font-semibold text-white"
                >
                  Bekreft fravær
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
