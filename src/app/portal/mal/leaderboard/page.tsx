/**
 * PlayerHQ · Mål · Leaderboard
 *
 * Migrert til produksjonsdesign med PageHeader (italic Instrument Serif),
 * semantiske tokens og 8pt-grid. EmptyState når ingen rangering finnes.
 */

import { Trophy } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export default async function LeaderboardPage() {
  const user = await requirePortalUser();

  // V1: aggregert SG-snitt per Pro-bruker (siste 30 dager). Vennenivå kommer i v2.
  const tretti = new Date();
  tretti.setDate(tretti.getDate() - 30);

  const proBrukere = await prisma.user.findMany({
    where: { tier: "PRO", role: "PLAYER" },
    select: {
      id: true,
      name: true,
      hcp: true,
      rounds: {
        where: { playedAt: { gte: tretti }, sgTotal: { not: null } },
        select: { sgTotal: true },
      },
    },
  });

  const rangering = proBrukere
    .map((b) => {
      const sg = b.rounds.length
        ? b.rounds.reduce((s, r) => s + (r.sgTotal ?? 0), 0) / b.rounds.length
        : null;
      return {
        id: b.id,
        navn: b.id === user.id ? `${b.name} (du)` : b.name,
        hcp: b.hcp,
        sg,
        antallRunder: b.rounds.length,
      };
    })
    .filter((b) => b.sg != null)
    .sort((a, b) => (b.sg ?? -99) - (a.sg ?? -99))
    .slice(0, 25);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="PlayerHQ · Leaderboard · siste 30 dager"
        titleLead="Hvordan står"
        titleItalic="du"
        titleTrail="mot andre?"
        sub="Pro-brukere rangert etter snitt SG-total siste 30 dager. Venn-rangering kommer senere."
      />

      {rangering.length === 0 ? (
        <EmptyState
          icon={Trophy}
          titleItalic="Ingen rangering"
          titleTrail="ennå"
          sub="Ingen Pro-brukere har registrert SG-data ennå. Når flere har spilt runder dukker rangeringen opp her."
        />
      ) : (
        <ol className="overflow-hidden rounded-lg border border-border bg-card">
          {rangering.map((r, i) => {
            const erMeg = r.id === user.id;
            return (
              <li
                key={r.id}
                className={`flex items-center gap-4 border-b border-border/60 px-4 py-4 last:border-0 ${
                  erMeg ? "bg-primary/5" : ""
                }`}
              >
                <span className="w-8 text-center font-mono text-sm font-semibold tabular-nums text-muted-foreground">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-foreground">{r.navn}</div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                    {r.antallRunder} runder
                    {r.hcp != null &&
                      ` · HCP ${r.hcp.toFixed(1).replace(".", ",")}`}
                  </div>
                </div>
                <span className="font-display text-base font-semibold tabular-nums text-foreground">
                  {r.sg! >= 0 ? "+" : ""}
                  {r.sg!.toFixed(1).replace(".", ",")}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
