import { CalendarClock, MapPin } from "lucide-react";

import { hentGruppeKalenderData } from "@/lib/gruppe-kalender/hent-data";
import { GruppeKalenderWrapper } from "@/components/gruppe-kalender/gruppe-kalender-wrapper";
import { EmptyState } from "@/components/shared/empty-state";

export const revalidate = 300; // 5 min — nok fersk for en foreldre-/spiller-oversikt

export default async function TeamWangPage() {
  const data = await hentGruppeKalenderData("WANG Toppidrett Fredrikstad");

  if (!data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState
          icon={CalendarClock}
          titleItalic="Ingen"
          titleTrail="treningsplan tilgjengelig ennå"
          sub="WANG Toppidrett-gruppen er ikke satt opp i systemet ennå."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:py-14">
      <header className="space-y-2">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          WANG Toppidrett Golf Fredrikstad
        </span>
        <h1 className="font-display text-3xl font-bold tracking-[-0.02em] text-foreground sm:text-4xl">
          Treningsplan
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Løpende oversikt over faste treningstider og sesongperioder — ingen personlig
          spillerinformasjon vises her. Din egen plan finner du innlogget i PlayerHQ.
        </p>
      </header>

      <GruppeKalenderWrapper data={data} />

      <section className="grid gap-4 rounded-2xl border border-border bg-card p-6 sm:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} />
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Ute-sesong
            </span>
          </div>
          <p className="text-sm text-foreground">
            Gamle Fredrikstad Golfklubb (GFGK), fra ca. 1.–10. april til utgangen av oktober.
          </p>
        </div>
        <div>
          <div className="mb-2 flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} />
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Inne-sesong
            </span>
          </div>
          <p className="text-sm text-foreground">
            «Treningslokalet» — 10 slagplasser i nett, putting 0–3 m for speed, ballstart på
            tutor. Trackman tilgjengelig for testing.
          </p>
        </div>
      </section>
    </div>
  );
}
