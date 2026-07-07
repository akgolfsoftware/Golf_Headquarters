import { CalendarClock, MapPin } from "lucide-react";

import { hentGruppeKalenderData } from "@/lib/gruppe-kalender/hent-data";
import { FlereGrupperKalender } from "@/components/gruppe-kalender/flere-grupper-kalender";
import { EmptyState } from "@/components/shared/empty-state";

export const revalidate = 300; // 5 min — nok fersk for en foreldre-/spiller-oversikt

const GFGK_GRUPPER = [
  "GFGK Junior Mini U10",
  "GFGK Junior Basis U13",
  "GFGK Junior Utvikling U15",
  "GFGK Junior Elite U19",
];

export default async function GfgkJuniorPage() {
  const grupper = (
    await Promise.all(GFGK_GRUPPER.map((navn) => hentGruppeKalenderData(navn)))
  ).filter((g): g is NonNullable<typeof g> => g !== null);

  if (grupper.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState
          icon={CalendarClock}
          titleItalic="Ingen"
          titleTrail="treningsplan tilgjengelig ennå"
          sub="GFGK Junior-gruppene er ikke satt opp i systemet ennå."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:py-14">
      <header className="space-y-2">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          GFGK Junior — Gamle Fredrikstad Golfklubb
        </span>
        <h1 className="font-display text-3xl font-bold tracking-[-0.02em] text-foreground sm:text-4xl">
          Treningsplan
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Løpende oversikt over faste treningstider per gruppe — Mini, Basis, Utvikling og Elite.
          Ingen personlig spillerinformasjon vises her. Din egen plan finner du innlogget i PlayerHQ.
        </p>
      </header>

      <FlereGrupperKalender grupper={grupper} />

      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-2 flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} />
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            Sted
          </span>
        </div>
        <p className="text-sm text-foreground">
          Gamle Fredrikstad Golfklubb (GFGK) — tirsdager og torsdager, se valgt gruppe over for
          nøyaktig tid.
        </p>
      </section>
    </div>
  );
}
