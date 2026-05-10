import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

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

const FARGE: Record<Status, string> = {
  Ny: "border-accent/40 bg-accent/5",
  Aktiv: "border-primary/30 bg-primary/5",
  Fokus: "border-primary bg-primary/10",
  Pause: "border-muted bg-muted/40",
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
    <div className="space-y-6">
      <header>
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Coaching board
        </span>
        <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight">
          <em className="font-normal text-primary md:italic">Status</em> per spiller
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Auto-klassifisering basert på siste aktivitet og aktive planer.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        {KOLONNER.map((kol) => (
          <div
            key={kol}
            className={`rounded-lg border-2 ${FARGE[kol]} p-4`}
          >
            <div className="mb-3 flex items-baseline justify-between">
              <span className="font-display text-base font-semibold">{kol}</span>
              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                {grupper[kol].length}
              </span>
            </div>
            <ul className="space-y-2">
              {grupper[kol].map((p) => (
                <li
                  key={p.id}
                  className="rounded-md border border-border bg-card p-3"
                >
                  <Link
                    href={`/admin/elever/${p.id}`}
                    className="font-medium text-foreground hover:text-primary"
                  >
                    {p.name}
                  </Link>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                    {p.hcp != null && `HCP ${p.hcp.toFixed(1).replace(".", ",")}`}
                    {p.hcp != null && " · "}
                    {p.tier}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
