import Link from "next/link";
import { Users } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

type Status = "Ny" | "Aktiv" | "Fokus" | "Pause";

function bestemStatus(player: {
  lastLoginAt: Date | null;
  trainingPlans: { isActive: boolean }[];
  rounds: { playedAt: Date }[];
}): Status {
  const idag = new Date();
  const sistInne = player.lastLoginAt
    ? (idag.getTime() - player.lastLoginAt.getTime()) / 86400000
    : Infinity;
  const harAktivPlan = player.trainingPlans.some((p) => p.isActive);
  const sisteRunde = player.rounds[0]?.playedAt;
  const dagerSidenRunde = sisteRunde
    ? (idag.getTime() - sisteRunde.getTime()) / 86400000
    : Infinity;

  if (sistInne > 30) return "Pause";
  if (!harAktivPlan) return "Ny";
  if (dagerSidenRunde < 7) return "Fokus";
  return "Aktiv";
}

const KOLONNER: Status[] = ["Ny", "Aktiv", "Fokus", "Pause"];

const KOLONNE_STIL: Record<Status, string> = {
  Ny: "border-accent/40 bg-accent/5",
  Aktiv: "border-primary/30 bg-primary/5",
  Fokus: "border-primary bg-primary/10",
  Pause: "border-border bg-secondary/40",
};

export default async function CoachingBoard() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const players = await prisma.user.findMany({
    where: { role: "PLAYER" },
    include: {
      trainingPlans: { select: { isActive: true } },
      rounds: { select: { playedAt: true }, orderBy: { playedAt: "desc" }, take: 1 },
    },
    orderBy: { name: "asc" },
  });

  const grupper: Record<Status, typeof players> = {
    Ny: [],
    Aktiv: [],
    Fokus: [],
    Pause: [],
  };
  for (const p of players) grupper[bestemStatus(p)].push(p);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="CoachHQ · Coaching board"
        titleItalic="Status"
        titleTrail="per spiller"
        sub="Auto-klassifisering basert på siste aktivitet og aktive planer."
      />

      {players.length === 0 ? (
        <EmptyState
          icon={Users}
          titleItalic="Ingen spillere"
          titleTrail="enda"
          sub="Boardet fylles ut når spillere er registrert i systemet."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          {KOLONNER.map((kol) => (
            <div
              key={kol}
              className={`rounded-lg border-2 ${KOLONNE_STIL[kol]} p-4`}
            >
              <div className="mb-4 flex items-baseline justify-between">
                <span className="font-display text-base font-semibold">{kol}</span>
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                  {grupper[kol].length}
                </span>
              </div>
              {grupper[kol].length === 0 ? (
                <p className="rounded-md border border-dashed border-border bg-card/40 px-4 py-6 text-center font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Tom
                </p>
              ) : (
                <ul className="space-y-2">
                  {grupper[kol].map((p) => (
                    <li
                      key={p.id}
                      className="rounded-md border border-border bg-card p-4"
                    >
                      <Link
                        href={`/admin/elever/${p.id}`}
                        className="font-medium text-foreground hover:text-primary"
                      >
                        {p.name}
                      </Link>
                      <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                        {p.hcp != null && `HCP ${p.hcp.toFixed(1).replace(".", ",")}`}
                        {p.hcp != null && " · "}
                        {p.tier}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
