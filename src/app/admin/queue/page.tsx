import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export default async function OppfolgingsKo() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  // Spillere som krever oppfølging:
  // - Ingen aktive planer
  // - Ikke logget inn på 14 dager
  // - SG-trend negativ siste 30 dager
  const fjorten = new Date();
  fjorten.setDate(fjorten.getDate() - 14);

  const players = await prisma.user.findMany({
    where: { role: "PLAYER" },
    include: {
      trainingPlans: { where: { isActive: true }, select: { id: true } },
      signals: {
        where: { kind: "SG_TOTAL" },
        orderBy: { computedAt: "desc" },
        take: 1,
      },
    },
  });

  const oppfølging = players
    .map((p) => {
      const grunner: string[] = [];
      if (p.trainingPlans.length === 0) grunner.push("Ingen aktiv plan");
      if (!p.lastLoginAt || p.lastLoginAt < fjorten)
        grunner.push("Ikke aktiv 14d");
      const sigSg = p.signals[0]?.value;
      if (sigSg != null && sigSg < -0.5) grunner.push(`SG ${sigSg.toFixed(1)}`);
      return { player: p, grunner };
    })
    .filter((r) => r.grunner.length > 0)
    .sort((a, b) => b.grunner.length - a.grunner.length);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="CoachHQ · Oppfølgingskø"
        titleItalic="Spillere"
        titleTrail="som trenger oppfølging"
        sub={`${oppfølging.length} spillere matcher minst ett follow-up-kriterie.`}
      />

      {oppfølging.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          titleItalic="Alt under"
          titleTrail="kontroll"
          sub="Ingen spillere trenger oppfølging akkurat nå."
        />
      ) : (
        <ul className="space-y-2">
          {oppfølging.map(({ player, grunner }) => (
            <li
              key={player.id}
              className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-card p-4"
            >
              <Link
                href={`/admin/elever/${player.id}`}
                className="font-medium text-foreground hover:text-primary"
              >
                {player.name}
              </Link>
              <div className="flex flex-wrap gap-2">
                {grunner.map((g, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-destructive/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-destructive"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
