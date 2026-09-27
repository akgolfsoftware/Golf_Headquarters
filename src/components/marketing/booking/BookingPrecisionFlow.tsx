"use client";

import React, { useState } from "react";
import { formaterTall } from "@/lib/format-tall";
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  ChevronLeft,
} from "lucide-react";
import { createBookingCheckout } from "@/app/(marketing)/booking/[slug]/bekreft/actions";

export interface BookingPrecisionTjeneste {
  slug: string;
  navn: string;
  coachNavn: string | null;
  pris: number;
  enhet: string;
  varighetMin: number;
  beskrivelse: string | null;
}

export interface BookingPrecisionFlowProps {
  tjenester: BookingPrecisionTjeneste[];
  lokasjon: string;
  nesteLedigInit?: string | null;
}

export function BookingPrecisionFlow({
  tjenester,
  lokasjon,
  nesteLedigInit,
}: BookingPrecisionFlowProps) {
  const [steg, setSteg] = useState<1 | 2 | 3 | 4>(1);
  const [valgtTjeneste, setValgtTjeneste] = useState<BookingPrecisionTjeneste>(
    tjenester[0] || {
      slug: "coaching-50",
      navn: "Personlig Coaching 50 min",
      coachNavn: "Anders",
      pris: 1350,
      enhet: "kr",
      varighetMin: 50,
      beskrivelse: "Målrettet teknikk og svinganalyse med TrackMan 4.",
    }
  );

  // Simulerte tilgjengelige datoer og tidsluker
  const [valgtDato, setValgtDato] = useState<string>("2026-09-28");
  const [valgtTid, setValgtTid] = useState<string>("14:00");

  // Brukerdetaljer
  const [navn, setNavn] = useState("");
  const [epost, setEpost] = useState("");
  const [telefon, setTelefon] = useState("");
  const [notater, setNotater] = useState("");

  const [laster, setLaster] = useState(false);
  const [feilmelding, setFeilmelding] = useState<string | null>(null);

  const tidsluker = ["09:00", "10:30", "13:00", "14:30", "16:00", "17:30"];
  const dager = [
    { dato: "2026-09-28", ukedag: "Man", dagNum: "28. sep" },
    { dato: "2026-09-29", ukedag: "Tir", dagNum: "29. sep" },
    { dato: "2026-09-30", ukedag: "Ons", dagNum: "30. sep" },
    { dato: "2026-10-01", ukedag: "Tor", dagNum: "1. okt" },
    { dato: "2026-10-02", ukedag: "Fre", dagNum: "2. okt" },
  ];

  const handleFullfor = async (e: React.FormEvent) => {
    e.preventDefault();
    setLaster(true);
    setFeilmelding(null);

    try {
      const isoStart = `${valgtDato}T${valgtTid}:00.000Z`;
      const res = await createBookingCheckout({
        slug: valgtTjeneste.slug,
        start: isoStart,
        coachId: "coach-anders",
        name: navn,
        email: epost,
        phone: telefon,
        notes: notater,
      });

      if (res.ok) {
        window.location.href = res.url;
      } else {
        setFeilmelding(res.error || "Kunne ikke starte betaling. Vennligst prøv igjen.");
      }
    } catch (_err) {
      setFeilmelding("En uventet feil oppstod. Vennligst prøv igjen.");
    } finally {
      setLaster(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Steg-indikator */}
      <div className="mb-8 border-b border-[#DDD9D1] pb-4">
        <div className="flex items-center justify-between text-xs font-sans font-semibold">
          <div className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-mono font-bold ${
                steg >= 1 ? "bg-[#141413] text-white" : "bg-[#DDD9D1] text-black/50"
              }`}
            >
              1
            </span>
            <span className={steg === 1 ? "text-[#141413] font-bold" : "text-black/50"}>
              Tjeneste
            </span>
          </div>

          <div className="h-0.5 w-8 bg-[#DDD9D1] hidden sm:block" />

          <div className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-mono font-bold ${
                steg >= 2 ? "bg-[#141413] text-white" : "bg-[#DDD9D1] text-black/50"
              }`}
            >
              2
            </span>
            <span className={steg === 2 ? "text-[#141413] font-bold" : "text-black/50"}>
              Tidspunkt
            </span>
          </div>

          <div className="h-0.5 w-8 bg-[#DDD9D1] hidden sm:block" />

          <div className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-mono font-bold ${
                steg >= 3 ? "bg-[#141413] text-white" : "bg-[#DDD9D1] text-black/50"
              }`}
            >
              3
            </span>
            <span className={steg === 3 ? "text-[#141413] font-bold" : "text-black/50"}>
              Kontakt
            </span>
          </div>

          <div className="h-0.5 w-8 bg-[#DDD9D1] hidden sm:block" />

          <div className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-mono font-bold ${
                steg >= 4 ? "bg-[#141413] text-white" : "bg-[#DDD9D1] text-black/50"
              }`}
            >
              4
            </span>
            <span className={steg === 4 ? "text-[#141413] font-bold" : "text-black/50"}>
              Betaling
            </span>
          </div>
        </div>
      </div>

      {/* Steg 1: Velg tjeneste */}
      {steg === 1 && (
        <div className="space-y-6">
          <div>
            <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-black/50">
              Steg 1 av 4
            </span>
            <h1 className="font-sans text-2xl font-bold tracking-tight text-[#141413]">
              Velg coachingtjeneste
            </h1>
            <p className="font-sans text-xs text-black/60 mt-1">
              Personlig coaching med Coach Anders Kristiansen ved {lokasjon}
            </p>
          </div>

          {nesteLedigInit && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-900 flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-700" />
              <span>Neste ledige time: <strong>{nesteLedigInit}</strong></span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tjenester.map((t) => {
              const erValgt = valgtTjeneste.slug === t.slug;
              return (
                <div
                  key={t.slug}
                  onClick={() => setValgtTjeneste(t)}
                  className={`cursor-pointer rounded-xl border p-5 transition-all ${
                    erValgt
                      ? "border-[#141413] bg-white ring-2 ring-[#141413] shadow-sm"
                      : "border-[#DDD9D1] bg-white hover:border-black/40"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-sans text-[11px] font-semibold text-black/50">
                        {t.varighetMin} minutter
                      </span>
                      <h3 className="font-sans text-base font-bold text-[#141413] mt-0.5">
                        {t.navn}
                      </h3>
                    </div>
                    <span className="font-mono text-base font-bold text-[#141413]">
                      {formaterTall(t.pris, 0)} {t.enhet}
                    </span>
                  </div>

                  <p className="font-sans text-xs text-black/70 mt-2">
                    {t.beskrivelse || "Personlig veiledning og TrackMan analyse."}
                  </p>

                  <div className="mt-4 flex items-center justify-between border-t border-[#DDD9D1] pt-3 text-[11px] text-black/50">
                    <span>Coach: {t.coachNavn || "Anders"}</span>
                    {erValgt ? (
                      <span className="flex items-center gap-1 font-bold text-[#141413]">
                        <CheckCircle className="h-3.5 w-3.5" />
                        Valgt
                      </span>
                    ) : (
                      <span className="font-semibold text-black/40">Klikk for å velge</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={() => setSteg(2)}
              className="flex items-center gap-2 rounded-lg bg-[#141413] px-6 py-2.5 font-sans text-xs font-bold text-white hover:bg-black transition-colors"
            >
              <span>Neste: Velg tidspunkt</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Steg 2: Velg tidspunkt */}
      {steg === 2 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-black/50">
                Steg 2 av 4
              </span>
              <h1 className="font-sans text-2xl font-bold tracking-tight text-[#141413]">
                Velg dag og tidspunkt
              </h1>
              <p className="font-sans text-xs text-black/60 mt-1">
                {valgtTjeneste.navn} · {valgtTjeneste.varighetMin} min
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSteg(1)}
              className="flex items-center gap-1 font-sans text-xs font-semibold text-black/60 hover:text-black"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Tilbake</span>
            </button>
          </div>

          {/* Dagsvelger */}
          <div>
            <label className="block font-sans text-xs font-bold text-[#141413] mb-2">
              Tilgjengelige dager
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {dager.map((d) => {
                const erValgt = valgtDato === d.dato;
                return (
                  <button
                    key={d.dato}
                    type="button"
                    onClick={() => setValgtDato(d.dato)}
                    className={`rounded-lg border p-3 text-center transition-all ${
                      erValgt
                        ? "border-[#141413] bg-[#141413] text-white shadow-xs"
                        : "border-[#DDD9D1] bg-white text-black/80 hover:bg-[#FAF8F3]"
                    }`}
                  >
                    <span className="block font-mono text-[11px] font-semibold uppercase">
                      {d.ukedag}
                    </span>
                    <span className="block font-mono text-xs font-bold mt-0.5">
                      {d.dagNum}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tidsluker */}
          <div>
            <label className="block font-sans text-xs font-bold text-[#141413] mb-2">
              Ledige klokkeslett
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {tidsluker.map((t) => {
                const erValgt = valgtTid === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setValgtTid(t)}
                    className={`rounded-lg border p-3 text-center font-mono text-xs font-bold transition-all ${
                      erValgt
                        ? "border-[#141413] bg-[#141413] text-white shadow-xs"
                        : "border-[#DDD9D1] bg-white text-black/80 hover:bg-[#FAF8F3]"
                    }`}
                  >
                    kl. {t}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-[#DDD9D1]">
            <span className="font-sans text-xs text-black/60">
              Valgt: {valgtDato} kl. {valgtTid}
            </span>
            <button
              type="button"
              onClick={() => setSteg(3)}
              className="flex items-center gap-2 rounded-lg bg-[#141413] px-6 py-2.5 font-sans text-xs font-bold text-white hover:bg-black transition-colors"
            >
              <span>Neste: Dine opplysninger</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Steg 3: Kontaktinformasjon */}
      {steg === 3 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-black/50">
                Steg 3 av 4
              </span>
              <h1 className="font-sans text-2xl font-bold tracking-tight text-[#141413]">
                Dine opplysninger
              </h1>
              <p className="font-sans text-xs text-black/60 mt-1">
                Vi sender bekreftelse og forberedelser på e-post og SMS
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSteg(2)}
              className="flex items-center gap-1 font-sans text-xs font-semibold text-black/60 hover:text-black"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Tilbake</span>
            </button>
          </div>

          <div className="rounded-xl border border-[#DDD9D1] bg-white p-5 space-y-4">
            <div>
              <label className="block font-sans text-xs font-bold text-[#141413] mb-1">
                Fullt navn *
              </label>
              <input
                type="text"
                required
                value={navn}
                onChange={(e) => setNavn(e.target.value)}
                placeholder="Ola Nordmann"
                className="w-full rounded-lg border border-[#DDD9D1] bg-[#FAF8F3] px-3 py-2 font-sans text-xs text-[#141413] focus:border-[#141413] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-sans text-xs font-bold text-[#141413] mb-1">
                  E-postadresse *
                </label>
                <input
                  type="email"
                  required
                  value={epost}
                  onChange={(e) => setEpost(e.target.value)}
                  placeholder="ola@eksempel.no"
                  className="w-full rounded-lg border border-[#DDD9D1] bg-[#FAF8F3] px-3 py-2 font-sans text-xs text-[#141413] focus:border-[#141413] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-sans text-xs font-bold text-[#141413] mb-1">
                  Mobilnummer *
                </label>
                <input
                  type="tel"
                  required
                  value={telefon}
                  onChange={(e) => setTelefon(e.target.value)}
                  placeholder="+47 900 00 000"
                  className="w-full rounded-lg border border-[#DDD9D1] bg-[#FAF8F3] px-3 py-2 font-sans text-xs text-[#141413] focus:border-[#141413] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-sans text-xs font-bold text-[#141413] mb-1">
                Hva ønsker du spesielt å jobbe med? (Valgfritt)
              </label>
              <textarea
                rows={3}
                value={notater}
                onChange={(e) => setNotater(e.target.value)}
                placeholder="F.eks. driverkontakt, wedge-lengdekontroll eller putting-sikte..."
                className="w-full rounded-lg border border-[#DDD9D1] bg-[#FAF8F3] px-3 py-2 font-sans text-xs text-[#141413] focus:border-[#141413] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-[#DDD9D1]">
            <span className="font-sans text-xs text-black/50">
              * Obligatoriske felter
            </span>
            <button
              type="button"
              disabled={!navn || !epost || !telefon}
              onClick={() => setSteg(4)}
              className="flex items-center gap-2 rounded-lg bg-[#141413] px-6 py-2.5 font-sans text-xs font-bold text-white hover:bg-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Neste: Oppsummering & Betaling</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Steg 4: Oppsummering & Betaling */}
      {steg === 4 && (
        <form onSubmit={handleFullfor} className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-black/50">
                Steg 4 av 4
              </span>
              <h1 className="font-sans text-2xl font-bold tracking-tight text-[#141413]">
                Bekreft og betal
              </h1>
              <p className="font-sans text-xs text-black/60 mt-1">
                Sikker betaling med Stripe eller Vipps
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSteg(3)}
              className="flex items-center gap-1 font-sans text-xs font-semibold text-black/60 hover:text-black"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Tilbake</span>
            </button>
          </div>

          {feilmelding && (
            <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-900">
              {feilmelding}
            </div>
          )}

          {/* Sammendragskort */}
          <div className="rounded-xl border border-[#DDD9D1] bg-white p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#DDD9D1] pb-3">
              <div>
                <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-black/50">
                  Valgt økt
                </span>
                <h3 className="font-sans text-base font-bold text-[#141413] mt-0.5">
                  {valgtTjeneste.navn}
                </h3>
              </div>
              <span className="font-mono text-xl font-bold text-[#141413]">
                {formaterTall(valgtTjeneste.pris, 0)} {valgtTjeneste.enhet}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-black/40" />
                <span>{valgtDato} kl. {valgtTid}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-black/40" />
                <span>{lokasjon}</span>
              </div>
              <div className="flex items-center gap-2 sm:col-span-2">
                <Clock className="h-4 w-4 text-black/40" />
                <span>Varighet: {valgtTjeneste.varighetMin} minutter</span>
              </div>
            </div>

            <div className="border-t border-[#DDD9D1] pt-3 text-xs text-black/70">
              <span className="font-bold text-[#141413]">Spiller:</span> {navn} · {epost} · {telefon}
            </div>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-emerald-800 shrink-0" />
            <span className="font-sans text-xs text-emerald-950">
              Avbestilling inntil 24 timer før timen refunderes 100 % automatisk.
            </span>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={laster}
              className="flex items-center gap-2 rounded-lg bg-[#141413] px-8 py-3 font-sans text-sm font-bold text-white hover:bg-black transition-colors disabled:opacity-50"
            >
              <CreditCard className="h-4 w-4" />
              <span>{laster ? "Behandler..." : `Fullfør betaling (${formaterTall(valgtTjeneste.pris, 0)} kr)`}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
