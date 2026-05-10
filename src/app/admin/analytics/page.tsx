import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

export default async function Analytics() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const tretti = new Date();
  tretti.setDate(tretti.getDate() - 30);

  const [
    totalUsers,
    activeUsers30d,
    proUsers,
    totalRounds30d,
    totalSessions30d,
    totalTests30d,
    aiChatSessions,
    pendingApprovals,
    hcpFordelingRader,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "PLAYER" } }),
    prisma.user.count({ where: { role: "PLAYER", lastLoginAt: { gte: tretti } } }),
    prisma.user.count({ where: { role: "PLAYER", tier: "PRO" } }),
    prisma.round.count({ where: { playedAt: { gte: tretti } } }),
    prisma.trainingPlanSessionLog.count({ where: { startedAt: { gte: tretti } } }),
    prisma.testResult.count({ where: { takenAt: { gte: tretti } } }),
    prisma.coachingSession.count({ where: { kind: "AI" } }),
    prisma.planAction.count({ where: { status: "PENDING" } }),
    prisma.user.findMany({
      where: { role: "PLAYER", hcp: { not: null } },
      select: { hcp: true },
    }),
  ]);

  // HCP-bins: <0, 0-10, 10-20, 20-30, 30+
  const bins = [0, 0, 0, 0, 0];
  const binLabels = ["< 0", "0–10", "10–20", "20–30", "30+"];
  for (const u of hcpFordelingRader) {
    const h = u.hcp ?? 0;
    if (h < 0) bins[0]++;
    else if (h < 10) bins[1]++;
    else if (h < 20) bins[2]++;
    else if (h < 30) bins[3]++;
    else bins[4]++;
  }
  const maxBin = Math.max(...bins, 1);

  const proPercent = totalUsers > 0 ? Math.round((proUsers / totalUsers) * 100) : 0;
  const aktivPercent =
    totalUsers > 0 ? Math.round((activeUsers30d / totalUsers) * 100) : 0;

  return (
    <div className="space-y-6">
      <header>
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Analytics
        </span>
        <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight">
          <em className="font-normal text-primary md:italic">Plattform</em>-statistikk
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Aggregerte tall siste 30 dager.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="Totalt spillere"
          value={String(totalUsers)}
          sub="Alle PLAYER-konti"
        />
        <Stat
          label="Aktive (30d)"
          value={String(activeUsers30d)}
          sub={`${aktivPercent}% av totalt`}
        />
        <Stat
          label="Pro-abonnenter"
          value={String(proUsers)}
          sub={`${proPercent}% konvertert`}
        />
        <Stat
          label="Pending approvals"
          value={String(pendingApprovals)}
          sub="Krever handling"
        />
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Runder (30d)" value={String(totalRounds30d)} />
        <Stat label="Økter loggført (30d)" value={String(totalSessions30d)} />
        <Stat label="Tester (30d)" value={String(totalTests30d)} />
        <Stat label="AI-chat-sesjoner" value={String(aiChatSessions)} />
      </section>

      <section className="rounded-lg border border-border bg-card p-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          HCP-fordeling
        </span>
        <div className="mt-4 space-y-2">
          {bins.map((count, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-16 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                {binLabels[i]}
              </span>
              <div className="relative h-5 flex-1 overflow-hidden rounded-sm bg-border/40">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${(count / maxBin) * 100}%` }}
                />
              </div>
              <span className="w-10 text-right font-mono text-xs tabular-nums">
                {count}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-display text-2xl font-semibold tabular-nums text-foreground">
        {value}
      </div>
      {sub && <div className="mt-0.5 text-[11px] text-muted-foreground">{sub}</div>}
    </div>
  );
}
