"use client";

import { useEffect } from "react";
import Link from "next/link";
import { reportClientError } from "@/lib/report-client-error";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

/**
 * Segment-feilside (500) — Precision Athletics standard.
 * Håndterer uventede krasj og feil med automatisk feilrapportering,
 * tydelig statusindikator og mulighet til å laste siden på nytt via reset().
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportClientError({
      context: "segment-error",
      message: error.message,
      stack: error.stack,
      digest: error.digest,
    }).catch(() => {
      // Feilrapportering skal aldri krasje feilsiden selv
    });
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#141413] flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-[#DDD9D1] bg-white p-8 shadow-sm text-center">
        {/* Teknisk varselikon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 border border-rose-200 mb-6">
          <AlertTriangle className="h-8 w-8 text-[#9B2415]" />
        </div>

        <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#9B2415]">
          Feilkode 500 · Systemavvik
        </span>

        <h1 className="mt-2 font-sans text-2xl font-bold tracking-tight text-[#141413]">
          Noe feilet hos oss
        </h1>

        <p className="mt-3 font-sans text-xs text-black/65 leading-relaxed">
          Dette er ikke din feil, og ingenting du har registrert har gått tapt. Feilen er logget og vi
          jobber med å løse det.
        </p>

        {/* Trygghets- og statuspanel */}
        <div className="mt-6 rounded-lg bg-[#FAF8F3] border border-[#DDD9D1] p-3 text-left">
          <span className="font-sans text-[11px] font-bold text-black/70 block mb-1">
            Status
          </span>
          <div className="flex justify-between font-mono text-[11px] text-black/60">
            <span>Registrerte økter</span>
            <span className="font-bold text-emerald-800">Lagret trygt</span>
          </div>
          <div className="flex justify-between font-mono text-[11px] text-black/60 mt-0.5">
            <span>Dagens treningsplan</span>
            <span className="font-bold text-emerald-800">Aktiv</span>
          </div>
        </div>

        {/* Handling / Knapper */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={reset}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-[#141413] px-4 py-2.5 font-sans text-xs font-bold text-white hover:bg-black transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Last siden på nytt</span>
          </button>

          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-[#DDD9D1] bg-[#FAF8F3] px-4 py-2.5 font-sans text-xs font-semibold text-[#141413] hover:bg-[#F1EEE8] transition-colors"
          >
            <Home className="h-3.5 w-3.5 text-black/60" />
            <span>Til hjem</span>
          </Link>
        </div>

        {error.digest && (
          <p className="mt-6 font-mono text-[10px] text-black/40">
            Hendelse-ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
