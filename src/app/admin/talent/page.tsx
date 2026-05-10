import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

// AK Golf A-K-kategorier basert på HCP
function bestemKategori(hcp: number | null): "A1" | "A2" | "A3" | "A4" | "A5" | "—" {
  if (hcp == null) return "—";
  if (hcp <= 4) return "A1"; // Elite
  if (hcp <= 12) return "A2"; // Topp
  if (hcp <= 20) return "A3"; // Konkurranse
  if (hcp <= 30) return "A4"; // Trening
  return "A5"; // Mosjon
}

const KATEGORIER = ["A1", "A2", "A3", "A4", "A5"] as const;

const KATEGORI_LABEL: Record<(typeof KATEGORIER)[number], string> = {
  A1: "Elite",
  A2: "Topp",
  A3: "Konkurranse",
  A4: "Trening",
  A5: "Mosjon",
};

export default async function Talent() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const players = await prisma.user.findMany({
    where: { role: "PLAYER" },
    select: {
      id: true,
      name: true,
      hcp: true,
      tier: true,
      playingYears: true,
      ambition: true,
    },
    orderBy: { hcp: "asc" },
  });

  const grupper: Record<(typeof KATEGORIER)[number], typeof players> = {
    A1: [],
    A2: [],
    A3: [],
    A4: [],
    A5: [],
  };
  for (const p of players) {
    const kat = bestemKategori(p.hcp);
    if (kat !== "—") grupper[kat].push(p);
  }

  return (
    <div className="space-y-6">
      <header>
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Talent-pipeline
        </span>
        <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight">
          <em className="font-normal text-primary md:italic">A-K</em>-kategorier
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Spillere fordelt på HCP-baserte talentkategorier (AK Golf-standard).
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {KATEGORIER.map((kat) => (
          <div key={kat} className="rounded-lg border border-border bg-card p-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              {kat} · {KATEGORI_LABEL[kat]}
            </div>
            <div className="mt-1 font-display text-2xl font-semibold tabular-nums">
              {grupper[kat].length}
            </div>
          </div>
        ))}
      </div>

      {KATEGORIER.map((kat) => (
        <section key={kat}>
          <h3 className="mb-3 font-display text-lg font-semibold tracking-tight">
            {kat} — {KATEGORI_LABEL[kat]} ({grupper[kat].length})
          </h3>
          {grupper[kat].length === 0 ? (
            <p className="rounded-lg border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
              Ingen spillere i denne kategorien.
            </p>
          ) : (
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {grupper[kat].map((p) => (
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
                  <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                    HCP {p.hcp?.toFixed(1).replace(".", ",") ?? "—"}
                    {p.playingYears && ` · ${p.playingYears}år`}
                    {" · "}
                    {p.tier}
                  </div>
                  {p.ambition && (
                    <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                      {p.ambition}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}
