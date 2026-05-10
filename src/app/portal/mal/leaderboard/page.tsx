import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

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
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-semibold leading-tight tracking-tight">
          Leaderboard · siste 30 dager
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Pro-brukere rangert etter snitt SG-total. Venn-rangering kommer senere.
        </p>
      </div>

      {rangering.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
          Ingen Pro-brukere har registrert SG-data ennå.
        </div>
      ) : (
        <ol className="overflow-hidden rounded-lg border border-border bg-card">
          {rangering.map((r, i) => {
            const erMeg = r.id === user.id;
            return (
              <li
                key={r.id}
                className={`flex items-center gap-4 border-b border-border/60 px-4 py-3 last:border-0 ${
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
                    {r.hcp != null && ` · HCP ${r.hcp.toFixed(1).replace(".", ",")}`}
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
