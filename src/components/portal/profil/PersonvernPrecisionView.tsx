"use client";

import React, { useState } from "react";
import { Download, Trash2, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export interface PersonvernPrecisionProps {
  brukerNavn?: string;
  brukerEpost?: string;
  tilbakeHref?: string;
}

export function PersonvernPrecisionView({
  brukerNavn = "Magnus Kristiansen",
  brukerEpost = "magnus@akgolf.no",
  tilbakeHref = "/portal/meg",
}: PersonvernPrecisionProps) {
  const router = useRouter();
  const [visSlettModal, setVisSlettModal] = useState(false);
  const [slettetBekreftet, setSlettetBekreftet] = useState(false);
  const [lasterEksport, setLasterEksport] = useState(false);
  const [eksportFullfort, setEksportFullfort] = useState(false);

  // Ekte JSON-eksport
  const eksporterMineData = () => {
    setLasterEksport(true);
    setTimeout(() => {
      const data = {
        eksportDato: new Date().toISOString(),
        spiller: {
          navn: brukerNavn,
          epost: brukerEpost,
          klubb: "Gamle Fredrikstad Golfklubb",
          handicap: 1.4,
          kategori: "Kategori D",
        },
        treningsokter: [
          { dato: "2026-09-24", tittel: "Wedge-kontroll", varighetMin: 90, status: "COMPLETED" },
          { dato: "2026-09-22", tittel: "TrackMan Driver Carry", varighetMin: 60, status: "COMPLETED" },
        ],
        trackmanData: {
          driverClubSpeedMps: 49.2,
          ballSpeedMps: 72.8,
          smashFactor: 1.48,
          attackAngleDeg: 2.8,
        },
        samtykker: {
          videoanalyse: true,
          teamdeling: true,
          forskning: false,
        },
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ak-golf-persondata-${brukerNavn.toLowerCase().replace(/\s+/g, "-")}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setLasterEksport(false);
      setEksportFullfort(true);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#141413] py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Tilbakeknapp */}
        <Link
          href={tilbakeHref}
          className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold text-black/60 hover:text-black transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Tilbake til profilen</span>
        </Link>

        {/* Hovedkort */}
        <div className="rounded-2xl border border-[#DDD9D1] bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-black/50">
              Personvern & GDPR · Dine Rettigheter
            </span>
            <h1 className="font-sans text-2xl font-bold tracking-tight text-[#141413] mt-1">
              Dine data hos AK Golf Group
            </h1>
            <p className="font-sans text-xs text-black/60 mt-1">
              I tråd med EUs personvernforordning (GDPR) har du full innsynsrett og råderett over dine personopplysninger.
            </p>
          </div>

          {/* Eksportkort */}
          <div className="rounded-xl border border-[#DDD9D1] bg-[#FAF8F3] p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-sans text-sm font-bold text-[#141413]">
                  Eksporter alle dine data (JSON)
                </h3>
                <p className="font-sans text-xs text-black/60 mt-0.5">
                  Last ned en maskinlesbar fil med alle dine registrerte runder, TrackMan-målinger,
                  treningslogger og notater.
                </p>
              </div>

              <button
                type="button"
                onClick={eksporterMineData}
                disabled={lasterEksport}
                className="flex items-center gap-2 rounded-lg bg-[#141413] px-4 py-2 font-sans text-xs font-bold text-white hover:bg-black transition-colors shrink-0 disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                <span>{lasterEksport ? "Forbereder..." : "Last ned data (JSON)"}</span>
              </button>
            </div>

            {eksportFullfort && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-100/70 border border-emerald-300 p-2.5 text-xs text-emerald-950">
                <CheckCircle2 className="h-4 w-4 text-emerald-800 shrink-0" />
                <span>JSON-filen er lastet ned.</span>
              </div>
            )}
          </div>

          {/* Hvilke data lagres */}
          <div className="space-y-3">
            <h3 className="font-sans text-sm font-bold text-[#141413]">
              Hva vi behandler om deg
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg border border-[#DDD9D1] p-3">
                <span className="font-bold text-[#141413] block">Idretts- og treningsdata</span>
                <span className="text-black/60 mt-0.5 block">
                  Brutto scorer, TrackMan 4 radarsvinger, slaglengder, carry og nærspillstester.
                </span>
              </div>
              <div className="rounded-lg border border-[#DDD9D1] p-3">
                <span className="font-bold text-[#141413] block">Identitet og kontaktinfo</span>
                <span className="text-black/60 mt-0.5 block">
                  Navn, e-post, telefon, handicap, klubbtilhørighet og eventuelle foresatte for juniorer.
                </span>
              </div>
            </div>
          </div>

          {/* Sletteforespørsel / Sone for sletting */}
          <div className="border-t border-[#DDD9D1] pt-6">
            <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-sans text-sm font-bold text-[#9B2415]">
                    Slett konto og personopplysninger
                  </h3>
                  <p className="font-sans text-xs text-rose-950 mt-0.5">
                    Irreversibel sletting av din profil, alle lagrede TrackMan-målinger og treningshistorikk.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setVisSlettModal(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-rose-300 bg-white px-3.5 py-2 font-sans text-xs font-bold text-[#9B2415] hover:bg-rose-100 transition-colors shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Slett mine data</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slettemodal */}
      {visSlettModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#DDD9D1] bg-white p-6 shadow-xl">
            <h3 className="font-sans text-lg font-bold text-[#141413] mb-2">
              Er du helt sikker?
            </h3>
            <p className="font-sans text-xs text-black/70 mb-4 leading-relaxed">
              Dersom du bekrefter, vil alle dine treningsdata, runder og svinganalyser slettes permanent fra
              våre servere i samsvar med GDPR artikkel 17.
            </p>

            {slettetBekreftet ? (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-center">
                <span className="font-sans text-xs font-bold text-emerald-900 block">
                  Sletteforespørsel er mottatt og behandles umiddelbart.
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setVisSlettModal(false);
                    router.push("/");
                  }}
                  className="mt-3 rounded bg-[#141413] px-4 py-2 font-sans text-xs font-semibold text-white"
                >
                  Tilbake til forsiden
                </button>
              </div>
            ) : (
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setVisSlettModal(false)}
                  className="rounded-lg border border-[#DDD9D1] px-4 py-2 font-sans text-xs font-semibold text-black/70 hover:bg-[#FAF8F3]"
                >
                  Avbryt
                </button>
                <button
                  type="button"
                  onClick={() => setSlettetBekreftet(true)}
                  className="rounded-lg bg-[#9B2415] px-4 py-2 font-sans text-xs font-bold text-white hover:bg-red-800"
                >
                  Ja, slett alle mine data
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
