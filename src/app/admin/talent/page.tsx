import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

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

const KATEGORI_HCP: Record<(typeof KATEGORIER)[number], string> = {
  A1: "HCP ≤ 4",
  A2: "HCP 5–12",
  A3: "HCP 13–20",
  A4: "HCP 21–30",
  A5: "HCP 30+",
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

  const totalt = players.filter((p) => p.hcp != null).length;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="CoachHQ · Talent"
        titleLead="A-K"
        titleItalic="kategorier"
        sub={`${totalt} spillere fordelt på HCP-baserte talentkategorier (AK Golf-standard).`}
      />

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {KATEGORIER.map((kat) => {
          const isElite = kat === "A1";
          return (
            <div
              key={kat}
              className={`rounded-lg border p-6 ${
                isElite ? "border-primary/40 bg-card shadow-sm" : "border-border bg-card"
              }`}
            >
              <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                {kat} · {KATEGORI_LABEL[kat]}
              </div>
              <div
                className={`mt-2 font-mono text-[28px] font-semibold leading-none tabular-nums ${
                  isElite ? "text-primary" : ""
                }`}
              >
                {grupper[kat].length}
              </div>
              <div className="mt-2 font-mono text-[10px] text-muted-foreground">
                {KATEGORI_HCP[kat]}
              </div>
            </div>
          );
        })}
      </section>

      {totalt === 0 ? (
        <EmptyState
          icon={TrendingUp}
          titleItalic="Ingen spillere"
          titleTrail="med HCP ennå"
          sub="Spillere må ha HCP registrert for å plasseres i kategori. Importer fra GolfBox eller registrer manuelt."
        />
      ) : (
        KATEGORIER.map((kat) => (
          <section key={kat}>
            <h3 className="mb-4 font-display text-lg font-semibold tracking-tight">
              {kat} — {KATEGORI_LABEL[kat]}{" "}
              <span className="font-normal text-muted-foreground">({grupper[kat].length})</span>
            </h3>
            {grupper[kat].length === 0 ? (
              <p className="rounded-md border border-dashed border-border bg-card/40 p-4 text-sm text-muted-foreground">
                Ingen spillere i denne kategorien.
              </p>
            ) : (
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {grupper[kat].map((p) => {
                  const initial = (p.name ?? "?").trim().charAt(0).toUpperCase();
                  return (
                    <li
                      key={p.id}
                      className="rounded-md border border-border bg-card p-4"
                    >
                      <div className="flex items-start gap-3">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary font-mono text-[11px] font-semibold text-primary-foreground">
                          {initial}
                        </span>
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/admin/elever/${p.id}`}
                            className="font-medium text-foreground hover:text-primary"
                          >
                            {p.name}
                          </Link>
                          <div className="mt-1 flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                            <span>HCP {p.hcp?.toFixed(1).replace(".", ",") ?? "—"}</span>
                            {p.playingYears && <span>· {p.playingYears} år</span>}
                            <span>· {p.tier}</span>
                          </div>
                          {p.ambition && (
                            <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                              {p.ambition}
                            </p>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        ))
      )}
    </div>
  );
}
