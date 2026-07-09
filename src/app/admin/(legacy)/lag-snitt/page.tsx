/**
 * AgencyOS — Lag-snitt (ANALYSERE · LAG-SNITT), /admin/lag-snitt.
 *
 * Port av fasit `agencyos-app/screens-analyze.jsx` → TeamAverageScreen
 * (mørkt tema, desktop 1280): PageHead («Pyramide per gruppe.») +
 * 3-kolonners grid av gruppekort (navn + medlemstall-chip + pyramide-barer).
 *
 * Datakilde: prisma.group → members → COMPLETED TrainingPlanSession gruppert
 * på pyramidArea per gruppe (samme grunnlag som /admin/analyse). Prosent =
 * andel av gruppas fullførte økter per akse. Grupper uten loggede økter viser
 * «—» per akse — aldri liksom-tall.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AgChip, AgPage, AgPageHead } from "@/components/admin/agencyos/ui";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

/** Pyramide-aksene i fasit-rekkefølge (topp → bunn). */
const AKSER = [
  { key: "TURN", label: "Turnering", cls: "bg-pyr-turn" },
  { key: "SPILL", label: "Spill", cls: "bg-pyr-spill" },
  { key: "SLAG", label: "Golfslag", cls: "bg-pyr-slag" },
  { key: "TEK", label: "Teknisk", cls: "bg-pyr-tek" },
  { key: "FYS", label: "Fysisk", cls: "bg-pyr-fys" },
] as const;

type AkseKey = (typeof AKSER)[number]["key"];

// ── Pyramide-barer (fasit PyramidBars / .pyr-row) ───────────────
function PyramidBars({
  rows,
}: {
  rows: { label: string; pct: number; value: string; cls: string }[];
}) {
  return (
    <div>
      {rows.map((r) => (
        <div
          key={r.label}
          className="grid grid-cols-[72px_1fr_48px] items-center gap-3 py-[6px] leading-none"
        >
          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
            {r.label}
          </span>
          <span className="h-[7px] overflow-hidden rounded-full bg-muted">
            <span
              className={cn("block h-full rounded-full", r.cls)}
              style={{ width: `${r.pct}%` }}
            />
          </span>
          <span className="text-right font-mono text-[11px] font-bold text-foreground">
            {r.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export default async function LagSnittPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const grupper = await prisma.group.findMany({
    select: { id: true, name: true, members: { select: { userId: true } } },
    orderBy: { name: "asc" },
  });

  const lag = await Promise.all(
    grupper.map(async (g) => {
      const memberIds = g.members.map((m) => m.userId);
      const counts: Record<AkseKey, number> = { TURN: 0, SPILL: 0, SLAG: 0, TEK: 0, FYS: 0 };

      if (memberIds.length > 0) {
        const grouped = await prisma.trainingPlanSession.groupBy({
          by: ["pyramidArea"],
          _count: { _all: true },
          where: { status: "COMPLETED", plan: { userId: { in: memberIds } } },
        });
        for (const row of grouped) counts[row.pyramidArea as AkseKey] = row._count._all;
      }

      const total = AKSER.reduce((s, a) => s + counts[a.key], 0);
      const rows = AKSER.map((a) => {
        const pct = total > 0 ? Math.round((counts[a.key] / total) * 100) : 0;
        return { label: a.label, pct, value: total > 0 ? `${pct} %` : "—", cls: a.cls };
      });
      return { id: g.id, navn: g.name, n: memberIds.length, rows };
    }),
  );

  return (
    <AgPage>
      <AgPageHead
        eyebrow="Analysere · Lag-snitt"
        title="Pyramide"
        italic="per gruppe."
        lead="Slik fordeler treningsbalansen seg i hver gruppe. Bruk det til å justere gruppeprogrammene."
      />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {lag.length === 0 && (
          <div className="md:col-span-3 rounded-xl border border-border bg-card px-[18px] py-10 text-center text-sm text-muted-foreground">
            Ingen grupper opprettet ennå — opprett en gruppe under Stall for å sammenligne lag-snitt.
          </div>
        )}
        {lag.map((t) => (
          <div key={t.id} className="rounded-xl border border-border bg-card p-[18px]">
            <div className="mb-[14px] flex items-center justify-between">
              <span className="font-display text-[15px] font-bold leading-[1.2] text-foreground">{t.navn}</span>
              <AgChip tone="neu">{t.n}</AgChip>
            </div>
            <PyramidBars rows={t.rows} />
          </div>
        ))}
      </div>
    </AgPage>
  );
}
