"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Calendar, MapPin, Download, ArrowRight, ShieldCheck } from "lucide-react";

export interface BookingKvitteringPrecisionProps {
  bekreftet: boolean;
  guestEmail: string | null;
  innlogget: boolean;
  signupHref: string;
  detaljer: {
    bestillingRef: string;
    tjeneste: string;
    dato: string;
    klokkeslett: string;
    sted: string;
    prisTekst: string;
    startDatoIso?: string;
    varighetMin?: number;
  };
}

export function BookingKvitteringPrecision({
  bekreftet,
  guestEmail,
  innlogget,
  signupHref,
  detaljer,
}: BookingKvitteringPrecisionProps) {
  const [lastetNed, setLastetNed] = useState(false);

  // Generer Apple / iCal .ics fil
  const lastNedIcsFil = () => {
    const start = detaljer.startDatoIso ? new Date(detaljer.startDatoIso) : new Date();
    const durationMs = (detaljer.varighetMin || 50) * 60 * 1000;
    const end = new Date(start.getTime() + durationMs);

    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    const formatIcsDate = (d: Date) =>
      `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(
        d.getUTCHours()
      )}${pad(d.getUTCMinutes())}00Z`;

    const nowStr = formatIcsDate(new Date());
    const startStr = formatIcsDate(start);
    const endStr = formatIcsDate(end);

    const icsData = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//AK Golf Academy//Booking//NB",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:booking-${detaljer.bestillingRef.replace("#", "")}@akgolf.no`,
      `DTSTAMP:${nowStr}`,
      `DTSTART:${startStr}`,
      `DTEND:${endStr}`,
      `SUMMARY:AK Golf: ${detaljer.tjeneste}`,
      `DESCRIPTION:Personlig coachingtime med Coach Anders Kristiansen.\\nSted: ${detaljer.sted}\\nReferanse: ${detaljer.bestillingRef}`,
      `LOCATION:${detaljer.sted}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsData], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ak-golf-time-${detaljer.bestillingRef.replace("#", "")}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setLastetNed(true);
  };

  // Generer Google Calendar URL
  const genererGoogleCalendarUrl = () => {
    const start = detaljer.startDatoIso ? new Date(detaljer.startDatoIso) : new Date();
    const durationMs = (detaljer.varighetMin || 50) * 60 * 1000;
    const end = new Date(start.getTime() + durationMs);

    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    const formatUtc = (d: Date) =>
      `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(
        d.getUTCHours()
      )}${pad(d.getUTCMinutes())}00Z`;

    const title = encodeURIComponent(`AK Golf: ${detaljer.tjeneste}`);
    const dates = `${formatUtc(start)}/${formatUtc(end)}`;
    const details = encodeURIComponent(
      `Coachingtime med Coach Anders Kristiansen.\nReferanse: ${detaljer.bestillingRef}`
    );
    const location = encodeURIComponent(detaljer.sted);

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-[#DDD9D1] bg-white p-6 sm:p-8 shadow-sm">
        {/* Statusikon & Tittel */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 border border-emerald-300">
            <CheckCircle2 className="h-8 w-8 text-emerald-800" />
          </div>

          <span className="mt-4 block font-mono text-xs font-semibold text-black/50">
            Bestillingsreferanse: {detaljer.bestillingRef}
          </span>
          <h1 className="mt-1 font-sans text-2xl sm:text-3xl font-bold tracking-tight text-[#141413]">
            {bekreftet ? "Timen er bekreftet!" : "Bestillingen behandles..."}
          </h1>
          <p className="mt-2 font-sans text-sm text-black/60">
            Vi har sendt en bekreftelse på e-post {guestEmail ? `til ${guestEmail}` : ""}.
          </p>
        </div>

        {/* Detaljkort */}
        <div className="mt-8 rounded-xl border border-[#DDD9D1] bg-[#FAF8F3] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#DDD9D1] pb-3">
            <div>
              <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-black/50">
                Tjeneste
              </span>
              <h3 className="font-sans text-base font-bold text-[#141413] mt-0.5">
                {detaljer.tjeneste}
              </h3>
            </div>
            <span className="font-mono text-base font-bold text-[#141413]">
              {detaljer.prisTekst}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <div className="flex items-center gap-1.5 font-sans font-semibold text-black/60 mb-1">
                <Calendar className="h-3.5 w-3.5 text-black/40" />
                <span>Tidspunkt</span>
              </div>
              <span className="font-mono font-bold text-[#141413] block">
                {detaljer.dato}
              </span>
              <span className="font-mono text-black/70 block mt-0.5">
                kl. {detaljer.klokkeslett}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5 font-sans font-semibold text-black/60 mb-1">
                <MapPin className="h-3.5 w-3.5 text-black/40" />
                <span>Oppmøte</span>
              </div>
              <span className="font-sans font-bold text-[#141413] block">
                {detaljer.sted}
              </span>
              <span className="font-sans text-[11px] text-black/50 block mt-0.5">
                Gamle Fredrikstad Golfklubb
              </span>
            </div>
          </div>
        </div>

        {/* Kalenderknapper (Apple .ics & Google) */}
        <div className="mt-6 border-t border-[#DDD9D1] pt-6">
          <span className="block font-sans text-xs font-bold text-[#141413] mb-3 text-center sm:text-left">
            Legg timen til i din kalender
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={lastNedIcsFil}
              className="flex items-center justify-center gap-2 rounded-lg border border-[#DDD9D1] bg-[#FAF8F3] px-4 py-2.5 font-sans text-xs font-semibold text-[#141413] hover:bg-[#F1EEE8] transition-colors"
            >
              <Download className="h-4 w-4 text-black/60" />
              <span>{lastetNed ? "Lastet ned (.ics)" : "Apple / Outlook (.ics)"}</span>
            </button>

            <a
              href={genererGoogleCalendarUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-lg border border-[#DDD9D1] bg-[#FAF8F3] px-4 py-2.5 font-sans text-xs font-semibold text-[#141413] hover:bg-[#F1EEE8] transition-colors"
            >
              <Calendar className="h-4 w-4 text-[#9B2415]" />
              <span>Google Kalender</span>
            </a>
          </div>
        </div>

        {/* Gjest til konto eller innlogget CTA */}
        <div className="mt-8 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-emerald-800 shrink-0" />
            <div className="text-xs">
              <span className="font-sans font-bold text-emerald-950 block">
                {innlogget ? "Klar til økten!" : "Opprett gratis spillerprofil"}
              </span>
              <p className="font-sans text-emerald-900 mt-0.5">
                {innlogget
                  ? "Timen er lagt inn i din treningsplan på PlayerHQ."
                  : "Få direkte tilgang til TrackMan-analyser, trenernotater og øvelser."}
              </p>
            </div>
          </div>

          <Link
            href={innlogget ? "/portal" : signupHref}
            className="rounded-lg bg-[#141413] px-4 py-2 font-sans text-xs font-semibold text-white hover:bg-black transition-colors shrink-0 flex items-center gap-1.5"
          >
            <span>{innlogget ? "Gå til PlayerHQ" : "Aktiver konto"}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
