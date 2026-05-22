/**
 * CoachHQ — Stall-oversikt
 *
 * Bredere/analytisk dashboard for hele stallen — kompletterer
 * /admin/spillere (som er liste/board/kort).
 *
 * Migrert fra public/design/batch4/coachhq-stall-oversikt.html.
 *
 * Server component — henter aggregerte tall fra Prisma, og passer
 * en typed snapshot videre til client-komponenten som håndterer
 * tabs (Aktivitet / Fremgang / Risiko), heat-map og row-selection.
 */
import { Download, UserPlus } from "lucide-react";
import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AdminHero as PageHeader } from "@/components/admin/admin-hero";
import { StallClient, type StallPlayer, type StallSnapshot } from "./stall-client";

type Tier = "GRATIS" | "PRO" | "ELITE";

function deriveCategory(hcp: number | null): "A1" | "A2" | "B1" | "B2" {
  if (hcp == null) return "B2";
  if (hcp <= 0) return "A1";
  if (hcp <= 4) return "A2";
  if (hcp <= 10) return "B1";
  return "B2";
}

function formatHcp(hcp: number | null): string {
  if (hcp == null) return "—";
  if (hcp <= 0) return `+${Math.abs(hcp).toFixed(1).replace(".", ",")}`;
  return hcp.toFixed(1).replace(".", ",");
}

function dagerSiden(d: Date | null): number {
  if (!d) return 999;
  return Math.floor((Date.now() - d.getTime()) / 86400000);
}

function sistAktivLabel(d: Date | null): string {
  if (!d) return "aldri";
  const dgr = dagerSiden(d);
  if (dgr === 0) return "i dag";
  if (dgr === 1) return "i går";
  if (dgr < 7) return `for ${dgr} dager`;
  if (dgr < 30) return `for ${Math.floor(dgr / 7)} uker`;
  return `for ${Math.floor(dgr / 30)} mnd`;
}

export default async function StallPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const players = await prisma.user.findMany({
    where: { role: "PLAYER" },
    select: {
      id: true,
      name: true,
      email: true,
      hcp: true,
      tier: true,
      lastLoginAt: true,
      trainingPlans: { select: { isActive: true } },
      rounds: {
        select: { playedAt: true, sgTotal: true },
        orderBy: { playedAt: "desc" },
        take: 30,
      },
      testResults: {
        select: { takenAt: true },
        orderBy: { takenAt: "desc" },
        take: 1,
      },
      groupMemberships: {
        select: { group: { select: { name: true } } },
        take: 1,
      },
    },
    orderBy: { name: "asc" },
    take: 300,
  });

  // Bygg StallPlayer-snapshot (alle datoer → ISO-string for client)
  // eslint-disable-next-line react-hooks/purity
  const naa = Date.now();
  const enriched: StallPlayer[] = players.map((p) => {
    const sgs = p.rounds
      .map((r) => r.sgTotal)
      .filter((v): v is number => v != null);
    const sgAvg =
      sgs.length > 0 ? sgs.reduce((a, b) => a + b, 0) / sgs.length : null;
    const sgTrend: number[] = sgs.length >= 2 ? [...sgs].slice(0, 12).reverse() : sgs;

    // Aktivitetsdager siste 30d — sett av playedAt + lastLoginAt
    const activeDays = new Set<number>();
    for (const r of p.rounds) {
      const days = Math.floor((naa - r.playedAt.getTime()) / 86400000);
      if (days >= 0 && days < 30) activeDays.add(days);
    }
    const days = dagerSiden(p.lastLoginAt);
    if (days >= 0 && days < 30) activeDays.add(days);

    // Heatmap-array: index 0 = i dag, index 29 = 29 dager siden
    const heat: number[] = [];
    for (let i = 0; i < 30; i += 1) {
      heat.push(activeDays.has(i) ? 1 : 0);
    }

    const harAktivPlan = p.trainingPlans.some((tp) => tp.isActive);
    const erInaktiv = days > 14;
    const trengerPlan = !harAktivPlan;
    const trengerOppmerksomhet = erInaktiv || trengerPlan;

    return {
      id: p.id,
      name: p.name,
      email: p.email,
      hcp: p.hcp,
      hcpLabel: formatHcp(p.hcp),
      tier: p.tier as Tier,
      category: deriveCategory(p.hcp),
      gruppe: p.groupMemberships[0]?.group.name ?? null,
      dagerSidenPalogging: days,
      sistAktivLabel: sistAktivLabel(p.lastLoginAt),
      harAktivPlan,
      erInaktiv,
      trengerOppmerksomhet,
      sgAvg,
      sgTrend,
      heat,
      antRunder30d: p.rounds.filter(
        (r) => (naa - r.playedAt.getTime()) / 86400000 < 30,
      ).length,
    };
  });

  const total = enriched.length;
  const aktive = enriched.filter((p) => !p.erInaktiv).length;
  const inaktive = enriched.filter((p) => p.erInaktiv).length;
  const trengerPlan = enriched.filter((p) => !p.harAktivPlan).length;
  const trengerOppmerksomhet = enriched.filter(
    (p) => p.trengerOppmerksomhet,
  ).length;

  // Kategori-fordeling
  const kategoriFordeling: Record<"A1" | "A2" | "B1" | "B2", number> = {
    A1: 0,
    A2: 0,
    B1: 0,
    B2: 0,
  };
  for (const p of enriched) kategoriFordeling[p.category] += 1;

  const hcpVerdier = enriched
    .map((p) => p.hcp)
    .filter((v): v is number => v != null);
  const snittHcp =
    hcpVerdier.length > 0
      ? hcpVerdier.reduce((a, b) => a + b, 0) / hcpVerdier.length
      : null;

  // Topp 10 % — basert på HCP (lavest)
  const sortertEtterHcp = [...hcpVerdier].sort((a, b) => a - b);
  const top10AntL = Math.max(1, Math.ceil(sortertEtterHcp.length * 0.1));
  const topp10 = sortertEtterHcp.length > 0
    ? enriched.filter(
        (p) => p.hcp != null && p.hcp <= sortertEtterHcp[top10AntL - 1],
      ).length
    : 0;

  const snapshot: StallSnapshot = {
    players: enriched,
    kpi: {
      total,
      aktive,
      inaktive,
      trengerPlan,
      trengerOppmerksomhet,
      snittHcp,
      snittHcpLabel: snittHcp != null ? formatHcp(snittHcp) : "—",
      kategoriFordeling,
      topp10,
    },
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`OPERASJON · ${total} AKTIVE SPILLERE`}
        titleLead="Stall"
        titleItalic="oversikt"
        sub={`${aktive} aktive · ${inaktive} inaktive · ${trengerPlan} mangler plan`}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <Download size={14} strokeWidth={1.75} />
              Eksporter
            </button>
            <Link
              href="/admin/elever/ny"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <UserPlus size={14} strokeWidth={1.75} />
              Ny spiller
            </Link>
          </div>
        }
      />

      <StallClient snapshot={snapshot} />
    </div>
  );
}
