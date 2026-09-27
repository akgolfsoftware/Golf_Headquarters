import React from "react";
import Link from "next/link";
import { Compass, ArrowRight, Home } from "lucide-react";

export type IkkeFunnetProps = {
  hjemHref?: string;
  knappTekst?: string;
  tittel?: string;
  beskrivelse?: string;
  sekundarKnappTekst?: string;
  sekundarHref?: string;
};

export function IkkeFunnet({
  hjemHref = "/",
  knappTekst = "Til hjem",
  tittel = "Denne siden finnes ikke",
  beskrivelse = "Lenken kan være gammel, eller siden kan ha flyttet. Fant du den i en e-post fra oss, er den trolig utdatert.",
  sekundarKnappTekst = "Gå til I dag",
  sekundarHref = "/portal",
}: IkkeFunnetProps) {
  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#141413] flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-[#DDD9D1] bg-white p-8 shadow-sm text-center">
        {/* Teknisk kompass- / posisjonsfigur */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FAF8F3] border border-[#DDD9D1] mb-6">
          <Compass className="h-8 w-8 text-[#9B2415]" />
        </div>

        <span className="font-mono text-xs font-bold uppercase tracking-wider text-black/50">
          Feilkode 404 · Utenfor banekartet
        </span>

        <h1 className="mt-2 font-sans text-2xl font-bold tracking-tight text-[#141413]">
          {tittel}
        </h1>

        <p className="mt-3 font-sans text-xs text-black/65 leading-relaxed">
          {beskrivelse}
        </p>

        {/* Status og bekreftelse på at data er trygge */}
        <div className="mt-6 rounded-lg bg-[#FAF8F3] border border-[#DDD9D1] p-3 text-left">
          <span className="font-sans text-[11px] font-bold text-black/70 block mb-1">
            Status
          </span>
          <div className="flex justify-between font-mono text-[11px] text-black/60">
            <span>Dine registrerte økter</span>
            <span className="font-bold text-emerald-800">Lagret trygt</span>
          </div>
          <div className="flex justify-between font-mono text-[11px] text-black/60 mt-0.5">
            <span>Treningsplan og kalender</span>
            <span className="font-bold text-emerald-800">Aktiv</span>
          </div>
        </div>

        {/* CTA-knapper */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Link
            href={sekundarHref}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-[#141413] px-4 py-2.5 font-sans text-xs font-bold text-white hover:bg-black transition-colors"
          >
            <span>{sekundarKnappTekst}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>

          <Link
            href={hjemHref}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-[#DDD9D1] bg-[#FAF8F3] px-4 py-2.5 font-sans text-xs font-semibold text-[#141413] hover:bg-[#F1EEE8] transition-colors"
          >
            <Home className="h-3.5 w-3.5 text-black/60" />
            <span>{knappTekst}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
