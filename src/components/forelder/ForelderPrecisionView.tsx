"use client";

import React, { useState } from "react";
import { formaterTall } from "@/lib/format-tall";
import {
  Calendar,
  Activity,
  ShieldCheck,
  CreditCard,
  MessageSquare,
  AlertTriangle,
  Send,
  Download,
  Clock,
  MapPin,
  CheckCircle,
} from "lucide-react";

export interface ForelderPrecisionProps {
  spillerNavn: string;
  spillerAlder?: number;
  dagensOkt?: {
    tittel: string;
    tidspunkt: string;
    sted: string;
    trener: string;
  } | null;
  ukensOkter?: Array<{
    dag: string;
    tittel: string;
    tid: string;
    fullfort: boolean;
  }>;
}

export function ForelderPrecisionView({
  spillerNavn = "Magnus Kristiansen",
  spillerAlder = 15,
  dagensOkt = {
    tittel: "Nærspill & Wedge-kontroll",
    tidspunkt: "16:30 – 18:00",
    sted: "Nærspillsgreen / TrackMan Studio 2",
    trener: "Coach Anders",
  },
  ukensOkter = [
    { dag: "Man", tittel: "Fysisk basisøkt (WANG)", tid: "08:00 – 09:30", fullfort: true },
    { dag: "Tir", tittel: "Nærspill & Wedge-kontroll", tid: "16:30 – 18:00", fullfort: false },
    { dag: "Tor", tittel: "Baneøkt 9 hull med analyse", tid: "16:00 – 18:30", fullfort: false },
    { dag: "Lør", tittel: "Egentrening: Putting-stige", tid: "10:00 – 11:30", fullfort: false },
  ],
}: ForelderPrecisionProps) {
  const [aktivFane, setAktivFane] = useState<"uke" | "samtykke" | "okonomi" | "dialog">("uke");

  // Fraværsskjema-tilstand
  const [visFravaerModal, setVisFravaerModal] = useState(false);
  const [fravaerAarsak, setFravaerAarsak] = useState("Sykdom / forkjølelse");
  const [fravaerMeldingSendt, setFravaerMeldingSendt] = useState(false);

  // Dialog-meldinger
  const [meldinger, setMeldinger] = useState([
    {
      id: "1",
      avsender: "Coach Anders",
      rolle: "Trener",
      tid: "I går kl. 19:15",
      tekst: "Magnus har hatt en meget god treningsuke på rangen. Svinghastigheten er stabil og balansen gjennom ballen er merkbart tryggere. Husk at vi har 9 hull baneøkt på torsdag!",
    },
    {
      id: "2",
      avsender: "Magnus",
      rolle: "Spiller",
      tid: "I går kl. 19:40",
      tekst: "Gleder meg til torsdag! Har terpet på putterutinene i helgen også.",
    },
    {
      id: "3",
      avsender: "Du (Foresatt)",
      rolle: "Forelder",
      tid: "I dag kl. 09:10",
      tekst: "Supert! Vi kjører direkte fra skolen på torsdag slik at han er på plass i god tid.",
    },
  ]);
  const [nyMeldingTekst, setNyMeldingTekst] = useState("");

  // Samtykker under 16 år
  const [samtykker, setSamtykker] = useState([
    {
      id: "video",
      tittel: "Video- og svinganalyse",
      beskrivelse: "Tillatelse til opptak og analyse av golfsving i TrackMan til internt treningsformål.",
      godkjent: true,
      oppdatert: "2026-08-15 av Forelder",
    },
    {
      id: "gruppe",
      tittel: "Deling i Team-gruppen",
      beskrivelse: "Synlighet for treningsresultater og øktoppmøte i WANG Toppidretts treningsgruppe.",
      godkjent: true,
      oppdatert: "2026-08-15 av Forelder",
    },
    {
      id: "reise",
      tittel: "Reisesamtykke for turneringer",
      beskrivelse: "Samtykke til fellestransport og reiseledelse under Srixon Tour / nasjonale mesterskap.",
      godkjent: false,
      oppdatert: "Venter på godkjenning",
    },
  ]);

  const sendMelding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nyMeldingTekst.trim()) return;
    setMeldinger((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        avsender: "Du (Foresatt)",
        rolle: "Forelder",
        tid: "Akkurat nå",
        tekst: nyMeldingTekst.trim(),
      },
    ]);
    setNyMeldingTekst("");
  };

  const toggleSamtykke = (id: string) => {
    setSamtykker((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              godkjent: !s.godkjent,
              oppdatert: `Endret ${new Date().toLocaleDateString("nb-NO")} av Forelder`,
            }
          : s
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Toppseksjon med profilbånd */}
      <div className="rounded-xl border border-[#DDD9D1] bg-white p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-black/50">
                Foreldreportal · Foresattvisning
              </span>
              {spillerAlder < 16 && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 font-sans text-[10px] font-bold text-amber-900">
                  Under 16 år ({spillerAlder} år)
                </span>
              )}
            </div>
            <h1 className="font-sans text-2xl font-bold tracking-tight text-[#141413]">
              {spillerNavn}
            </h1>
            <p className="font-sans text-xs text-black/60">
              AK Golf Academy · WANG Toppidrett Fredrikstad
            </p>
          </div>

          {/* Fanevelger */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setAktivFane("uke")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-sans text-xs font-semibold transition-all ${
                aktivFane === "uke"
                  ? "bg-[#141413] text-white shadow-xs"
                  : "bg-[#FAF8F3] border border-[#DDD9D1] text-black/70 hover:bg-[#F1EEE8]"
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Uke & Belastning</span>
            </button>

            <button
              type="button"
              onClick={() => setAktivFane("samtykke")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-sans text-xs font-semibold transition-all ${
                aktivFane === "samtykke"
                  ? "bg-[#141413] text-white shadow-xs"
                  : "bg-[#FAF8F3] border border-[#DDD9D1] text-black/70 hover:bg-[#F1EEE8]"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Samtykke</span>
            </button>

            <button
              type="button"
              onClick={() => setAktivFane("okonomi")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-sans text-xs font-semibold transition-all ${
                aktivFane === "okonomi"
                  ? "bg-[#141413] text-white shadow-xs"
                  : "bg-[#FAF8F3] border border-[#DDD9D1] text-black/70 hover:bg-[#F1EEE8]"
              }`}
            >
              <CreditCard className="h-3.5 w-3.5" />
              <span>Klippekort & Faktura</span>
            </button>

            <button
              type="button"
              onClick={() => setAktivFane("dialog")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-sans text-xs font-semibold transition-all ${
                aktivFane === "dialog"
                  ? "bg-[#141413] text-white shadow-xs"
                  : "bg-[#FAF8F3] border border-[#DDD9D1] text-black/70 hover:bg-[#F1EEE8]"
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Treparts dialog</span>
            </button>
          </div>
        </div>
      </div>

      {/* Fane 1: Ukeoversikt, ACWR Belastning og Dagens økt */}
      {aktivFane === "uke" && (
        <div className="space-y-6">
          {/* Dagens økt kort */}
          {dagensOkt ? (
            <div className="rounded-xl border border-[#DDD9D1] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#DDD9D1] pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-sans text-xs font-bold uppercase tracking-wider text-black/60">
                    Dagens økt
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setVisFravaerModal(true)}
                  className="font-sans text-xs font-semibold text-[#9B2415] hover:underline"
                >
                  Meld forfall / fravær
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-sans text-lg font-bold text-[#141413]">
                    {dagensOkt.tittel}
                  </h3>
                  <div className="mt-2 space-y-1 font-sans text-xs text-black/70">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-black/40" />
                      <span>{dagensOkt.tidspunkt}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-black/40" />
                      <span>{dagensOkt.sted}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-[#FAF8F3] p-3 border border-[#DDD9D1] flex flex-col justify-between">
                  <span className="font-sans text-[11px] font-semibold text-black/50">
                    Ansvarlig trener
                  </span>
                  <span className="font-sans text-sm font-bold text-[#141413]">
                    {dagensOkt.trener}
                  </span>
                  <span className="font-sans text-[10px] text-emerald-800 font-medium">
                    Oppmøte registreres automatisk i studio
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-[#DDD9D1] bg-white p-5 text-center text-xs text-black/60">
              Ingen planlagte fellestreninger i dag.
            </div>
          )}

          {/* ACWR Belastningsskala (Akutt:Kronisk) */}
          <div className="rounded-xl border border-[#DDD9D1] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#DDD9D1] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-[#141413]" />
                <h3 className="font-sans text-sm font-bold text-[#141413]">
                  ACWR Belastningsmonitor (Akutt : Kronisk ratio)
                </h3>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Ratio: 1,18 (Grønn sone)
              </span>
            </div>

            <p className="font-sans text-xs text-black/60 mb-4">
              Måler forholdet mellom de siste 7 dagers treningsmengde (akutt) mot de siste 28 dager (kronisk)
              for å forebygge overbelastning og skader i vekstfasen.
            </p>

            {/* Skala-graf */}
            <div className="space-y-2">
              <div className="relative h-6 w-full rounded-md bg-[#F1EEE8] overflow-hidden flex border border-[#DDD9D1]">
                {/* 0.0 - 0.8: Underbelastning */}
                <div style={{ width: "35%" }} className="bg-amber-100 flex items-center justify-center">
                  <span className="font-mono text-[9px] text-amber-900 font-bold">&lt; 0,8</span>
                </div>
                {/* 0.8 - 1.3: Grønn / Optimal sone */}
                <div style={{ width: "30%" }} className="bg-emerald-200 flex items-center justify-center">
                  <span className="font-mono text-[9px] text-emerald-950 font-bold">0,8 – 1,3 (Optimal)</span>
                </div>
                {/* 1.3 - 1.5: Økt risiko */}
                <div style={{ width: "15%" }} className="bg-amber-200 flex items-center justify-center">
                  <span className="font-mono text-[9px] text-amber-950 font-bold">1,3–1,5</span>
                </div>
                {/* > 1.5: Høy risiko */}
                <div style={{ width: "20%" }} className="bg-rose-200 flex items-center justify-center">
                  <span className="font-mono text-[9px] text-rose-950 font-bold">&gt; 1,5 Fare</span>
                </div>

                {/* Nåværende markør på 1.18 */}
                <div
                  style={{ left: "55%" }}
                  className="absolute top-0 bottom-0 w-1 bg-[#141413] shadow-md z-10"
                />
              </div>

              <div className="flex justify-between font-mono text-[10px] text-black/50">
                <span>0,0 (Lav)</span>
                <span className="text-emerald-800 font-bold">Magnus i dag: 1,18</span>
                <span>2,0+ (Kritisk)</span>
              </div>
            </div>

            {/* Historisk uke-varsel / Uke 35 spike */}
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50/60 p-3 flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 text-amber-800 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-sans font-bold text-amber-950">
                  Uke 35 loggnotis: Belastningstopp på 1,54 registrert
                </span>
                <p className="font-sans text-amber-900 mt-0.5">
                  Magnus hadde to turneringsrunder pluss dobbel treningsøkt uke 35. Coach Anders la inn
                  to dager aktiv restitusjon uken etter, og ratioen er nå tilbake i trygg grønn sone.
                </p>
              </div>
            </div>
          </div>

          {/* Ukens økter liste */}
          <div className="rounded-xl border border-[#DDD9D1] bg-white p-5 shadow-sm">
            <h3 className="font-sans text-sm font-bold text-[#141413] mb-3">
              Ukens treningsplan
            </h3>
            <div className="space-y-2">
              {ukensOkter.map((okt, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-[#DDD9D1] bg-[#FAF8F3] p-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-10 rounded bg-[#141413] py-1 text-center font-mono text-xs font-bold text-white">
                      {okt.dag}
                    </span>
                    <div>
                      <span className="font-sans font-bold text-[#141413]">{okt.tittel}</span>
                      <span className="block font-mono text-[11px] text-black/50">{okt.tid}</span>
                    </div>
                  </div>
                  {okt.fullfort ? (
                    <span className="flex items-center gap-1 font-sans text-[11px] font-bold text-emerald-800">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Fullført
                    </span>
                  ) : (
                    <span className="font-sans text-[11px] text-black/40">Kommende</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Siste notat fra Coach Anders */}
          <div className="rounded-xl border border-[#DDD9D1] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 border-b border-[#DDD9D1] pb-3 mb-3">
              <span className="font-sans text-xs font-bold text-[#141413]">
                Trenerens kommentar · Coach Anders
              </span>
              <span className="font-mono text-[10px] text-black/40">Oppdatert søndag</span>
            </div>
            <p className="font-sans text-xs text-black/80 leading-relaxed">
              «Magnus har vist kjempefin framgang i svingstabilitet de siste tre ukene. Vi jobber videre
              med å holde hofterotasjonen rolig i baksvingen for å øke treffsikkerheten med 7-jern og 6-jern.
              Husk nok søvn og restitusjon i turneringsuker!»
            </p>
          </div>
        </div>
      )}

      {/* Fane 2: Samtykke & GDPR */}
      {aktivFane === "samtykke" && (
        <div className="rounded-xl border border-[#DDD9D1] bg-white p-5 shadow-sm space-y-5">
          <div>
            <h3 className="font-sans text-base font-bold text-[#141413]">
              Samtykke for spiller under 16 år
            </h3>
            <p className="font-sans text-xs text-black/60">
              I henhold til Norges Idrettsforbund og personvernforordningen (GDPR) administreres
              samtykker direkte av foresatte.
            </p>
          </div>

          <div className="space-y-3">
            {samtykker.map((s) => (
              <div
                key={s.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-[#DDD9D1] bg-[#FAF8F3] p-4"
              >
                <div className="max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-sans text-sm font-bold text-[#141413]">
                      {s.tittel}
                    </span>
                    <span
                      className={`rounded px-2 py-0.5 font-sans text-[10px] font-bold ${
                        s.godkjent ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {s.godkjent ? "Aktivt samtykke" : "Ikke godkjent"}
                    </span>
                  </div>
                  <p className="font-sans text-xs text-black/70 mt-1">{s.beskrivelse}</p>
                  <span className="block font-mono text-[10px] text-black/40 mt-1">
                    {s.oppdatert}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => toggleSamtykke(s.id)}
                  className={`rounded-lg px-4 py-2 font-sans text-xs font-semibold transition-all shrink-0 ${
                    s.godkjent
                      ? "border border-[#DDD9D1] bg-white text-black/80 hover:bg-[#F1EEE8]"
                      : "bg-[#141413] text-white hover:bg-black"
                  }`}
                >
                  {s.godkjent ? "Trekk samtykke" : "Gi samtykke"}
                </button>
              </div>
            ))}
          </div>

          <div className="border-t border-[#DDD9D1] pt-4 flex items-center justify-between">
            <span className="font-sans text-xs text-black/50">
              Full revisjonslogg er tilgjengelig for nedlasting
            </span>
            <button
              type="button"
              onClick={() => alert("Revisjonslogg lastet ned som JSON.")}
              className="flex items-center gap-1.5 font-sans text-xs font-semibold text-[#141413] hover:underline"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Last ned GDPR-logg (JSON)</span>
            </button>
          </div>
        </div>
      )}

      {/* Fane 3: Klippekort & Fakturaer */}
      {aktivFane === "okonomi" && (
        <div className="space-y-6">
          {/* Klippekort status */}
          <div className="rounded-xl border border-[#DDD9D1] bg-white p-5 shadow-sm">
            <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-black/50">
              Aktiv treningspakke
            </span>
            <h3 className="font-sans text-lg font-bold text-[#141413] mt-0.5">
              Performance Junior 10-klipp
            </h3>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-lg bg-[#FAF8F3] p-3 border border-[#DDD9D1]">
                <span className="block font-sans text-[11px] text-black/50">Gjenstående klipp</span>
                <span className="font-mono text-2xl font-bold text-[#141413]">7 / 10</span>
              </div>
              <div className="rounded-lg bg-[#FAF8F3] p-3 border border-[#DDD9D1]">
                <span className="block font-sans text-[11px] text-black/50">Brukt denne måneden</span>
                <span className="font-mono text-2xl font-bold text-[#9B2415]">3 klipp</span>
              </div>
              <div className="rounded-lg bg-[#FAF8F3] p-3 border border-[#DDD9D1]">
                <span className="block font-sans text-[11px] text-black/50">Gyldig til</span>
                <span className="font-mono text-sm font-bold text-black/80 mt-1 block">
                  31. desember 2026
                </span>
              </div>
            </div>
          </div>

          {/* Fakturahistorikk */}
          <div className="rounded-xl border border-[#DDD9D1] bg-white p-5 shadow-sm">
            <h3 className="font-sans text-sm font-bold text-[#141413] mb-3">
              Fakturahistorikk
            </h3>
            <div className="divide-y divide-[#DDD9D1] rounded-lg border border-[#DDD9D1]">
              <div className="flex items-center justify-between p-3 text-xs bg-[#FAF8F3]">
                <div>
                  <span className="font-sans font-bold text-[#141413]">Faktura #1084 · Performance Junior</span>
                  <span className="block font-mono text-[11px] text-black/50">Dato: 15.08.2026 · Stripe</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-[#141413]">{formaterTall(7500, 0)} kr</span>
                  <span className="rounded bg-emerald-100 px-2 py-0.5 font-sans text-[10px] font-bold text-emerald-800">
                    Betalt
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 text-xs bg-[#FAF8F3]">
                <div>
                  <span className="font-sans font-bold text-[#141413]">Faktura #1021 · WANG Egentreningsavgift</span>
                  <span className="block font-mono text-[11px] text-black/50">Dato: 01.06.2026 · Bank</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-[#141413]">{formaterTall(2200, 0)} kr</span>
                  <span className="rounded bg-emerald-100 px-2 py-0.5 font-sans text-[10px] font-bold text-emerald-800">
                    Betalt
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fane 4: Treparts dialog */}
      {aktivFane === "dialog" && (
        <div className="rounded-xl border border-[#DDD9D1] bg-white p-5 shadow-sm space-y-4">
          <div className="border-b border-[#DDD9D1] pb-3">
            <h3 className="font-sans text-base font-bold text-[#141413]">
              Treparts dialog (Coach · Spiller · Forelder)
            </h3>
            <p className="font-sans text-xs text-black/60">
              Åpen kommunikasjonskanal for oppfølging av mål, turneringer og logistikk
            </p>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {meldinger.map((m) => (
              <div
                key={m.id}
                className={`rounded-lg p-3 text-xs border ${
                  m.rolle === "Trener"
                    ? "bg-[#FAF8F3] border-[#DDD9D1]"
                    : m.rolle === "Spiller"
                    ? "bg-sky-50/60 border-sky-200"
                    : "bg-emerald-50/60 border-emerald-200"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-sans font-bold text-[#141413]">{m.avsender}</span>
                    <span className="rounded bg-black/10 px-1.5 py-0.2 font-sans text-[10px] font-semibold text-black/70">
                      {m.rolle}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-black/40">{m.tid}</span>
                </div>
                <p className="font-sans text-black/80">{m.tekst}</p>
              </div>
            ))}
          </div>

          <form onSubmit={sendMelding} className="flex gap-2 pt-2 border-t border-[#DDD9D1]">
            <input
              type="text"
              placeholder="Skriv en melding til coach og spiller..."
              value={nyMeldingTekst}
              onChange={(e) => setNyMeldingTekst(e.target.value)}
              className="flex-1 rounded-lg border border-[#DDD9D1] bg-[#FAF8F3] px-3 py-2 font-sans text-xs text-[#141413] focus:border-[#141413] focus:outline-none"
            />
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg bg-[#141413] px-4 py-2 font-sans text-xs font-semibold text-white hover:bg-black"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      )}

      {/* Fraværs-modal */}
      {visFravaerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-[#DDD9D1] bg-white p-5 shadow-xl">
            <h3 className="font-sans text-base font-bold text-[#141413] mb-2">
              Meld forfall / fravær for dagens økt
            </h3>
            <p className="font-sans text-xs text-black/60 mb-4">
              Trener varsles umiddelbart. Fraværet registreres i oppmøtestatistikken.
            </p>

            {fravaerMeldingSendt ? (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-center">
                <span className="font-sans text-xs font-bold text-emerald-900 block">
                  Fraværet er registrert og trener er varslet.
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setVisFravaerModal(false);
                    setFravaerMeldingSendt(false);
                  }}
                  className="mt-3 rounded bg-[#141413] px-3 py-1.5 font-sans text-xs font-semibold text-white"
                >
                  Lukk
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block font-sans text-[11px] font-semibold text-black/60 mb-1">
                    Årsak til fravær
                  </label>
                  <select
                    value={fravaerAarsak}
                    onChange={(e) => setFravaerAarsak(e.target.value)}
                    className="w-full rounded-lg border border-[#DDD9D1] bg-[#FAF8F3] px-3 py-2 font-sans text-xs"
                  >
                    <option value="Sykdom / forkjølelse">Sykdom / forkjølelse</option>
                    <option value="Skole / tentamen">Skole / tentamen</option>
                    <option value="Skade / sårhet">Skade / sårhet (FYS varsles)</option>
                    <option value="Reise / privat">Reise / privat</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setVisFravaerModal(false)}
                    className="rounded-lg border border-[#DDD9D1] px-3 py-1.5 font-sans text-xs font-semibold text-black/70 hover:bg-[#FAF8F3]"
                  >
                    Avbryt
                  </button>
                  <button
                    type="button"
                    onClick={() => setFravaerMeldingSendt(true)}
                    className="rounded-lg bg-[#9B2415] px-3 py-1.5 font-sans text-xs font-semibold text-white hover:bg-red-800"
                  >
                    Send fraværsmelding
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
