import type { Metadata } from "next";
import { CalendarClock, MapPin } from "lucide-react";

import { hentGruppeKalenderData } from "@/lib/gruppe-kalender/hent-data";
import { FlereGrupperKalender } from "@/components/gruppe-kalender/flere-grupper-kalender";
import { EmptyState } from "@/components/shared/empty-state";

import { GfgkFooter } from "../_components/gfgk-footer";
import { GfgkHeader } from "../_components/gfgk-header";
import { GRUPPE_DB_NAVN } from "../_data/hent-gfgk-data";

export const revalidate = 300; // 5 min — nok fersk for en foreldre-/spiller-oversikt

// Detaljert driftskalender (foreldre-/spillerverktøy) — holdes utenfor indeksering,
// forsiden og gruppesidene er de offentlige inngangene.
export const metadata: Metadata = {
  title: "Treningskalender",
  description:
    "Løpende oversikt over treningstider og sesongperioder for GFGK Junior — Mini, Basis, Utvikling og Elite.",
  robots: { index: false, follow: false },
};

export default async function GfgkJuniorKalenderPage() {
  const grupper = (
    await Promise.all(
      Object.values(GRUPPE_DB_NAVN).map((navn) =>
        hentGruppeKalenderData(navn).catch(() => null),
      ),
    )
  ).filter((g): g is NonNullable<typeof g> => g !== null);

  return (
    <div>
      <GfgkHeader aktiv="kalender" />
      {grupper.length === 0 ? (
        <div className="mx-auto max-w-3xl px-4 py-16">
          <EmptyState
            icon={CalendarClock}
            titleItalic="Ingen"
            titleTrail="treningsplan tilgjengelig ennå"
            sub="GFGK Junior-gruppene er ikke satt opp i systemet ennå — planen publiseres fra AgencyOS."
          />
        </div>
      ) : (
        <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:py-14">
          <header className="space-y-2">
            <span
              className="text-[11px] font-semibold uppercase tracking-[0.12em]"
              style={{ fontFamily: "var(--font-jr-mono)", color: "var(--fg-3)" }}
            >
              GFGK Junior — Gamle Fredrikstad Golfklubb
            </span>
            <h1
              className="text-3xl font-bold tracking-[-0.02em] sm:text-4xl"
              style={{ color: "var(--ink)" }}
            >
              Treningskalender
            </h1>
            <p className="max-w-2xl text-sm" style={{ color: "var(--fg-2)" }}>
              Løpende oversikt over faste treningstider per gruppe — Mini, Basis, Utvikling og
              Elite. Ingen personlig spillerinformasjon vises her. Din egen plan finner du
              innlogget i PlayerHQ.
            </p>
          </header>

          <FlereGrupperKalender grupper={grupper} />

          <section
            className="rounded-2xl bg-white p-6"
            style={{ boxShadow: "var(--shadow-md)" }}
          >
            <div className="mb-2 flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5" style={{ color: "var(--fg-3)" }} strokeWidth={1.75} />
              <span
                className="text-[10px] font-semibold uppercase tracking-[0.10em]"
                style={{ fontFamily: "var(--font-jr-mono)", color: "var(--fg-3)" }}
              >
                Sted
              </span>
            </div>
            <p className="text-sm" style={{ color: "var(--ink)" }}>
              Gamle Fredrikstad Golfklubb (GFGK) — tirsdager og torsdager, se valgt gruppe over
              for nøyaktig tid.
            </p>
          </section>
        </div>
      )}
      <GfgkFooter />
    </div>
  );
}
