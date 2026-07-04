/**
 * AgencyOS — Full spilleranalyse i coach-dybde (/admin/spillere/[id]/analyse).
 * Bølge 1: SAMME golfdata-komponenter som PlayerHQ «Min golf», men alltid
 * nivaa="elite" (full dekomponering + fagkode-chips) — 30-sekunders årsaksfunn
 * via Neste fokus → SlagLekkasjeKart → DiagnoseKort.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { loadMinGolf } from "@/lib/min-golf/load-min-golf";
import { loadAnalyticsWorkbenchData } from "@/app/portal/analysere/actions";
import { MinGolfPage } from "@/components/portal/analytics/MinGolfPage";

export const dynamic = "force-dynamic";

export default async function SpillerAnalysePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id } = await params;

  const spiller = await prisma.user.findUnique({
    where: { id, role: "PLAYER" },
    select: { id: true, name: true },
  });
  if (!spiller) notFound();

  const [minGolf, workbench] = await Promise.all([
    loadMinGolf(spiller.id, "elite"),
    loadAnalyticsWorkbenchData(spiller.id),
  ]);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-16 pt-6">
      <div className="mb-2 flex items-center justify-between">
        <Link
          href={`/admin/spillere/${spiller.id}`}
          className="inline-flex min-h-11 items-center gap-1 font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft size={14} strokeWidth={1.5} aria-hidden />
          {spiller.name}
        </Link>
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          Analyse · coach-dybde
        </span>
      </div>
      <MinGolfPage
        data={minGolf}
        workbench={{ rounds: workbench.rounds, tests: workbench.tests }}
        visning="coach"
      />
    </div>
  );
}
