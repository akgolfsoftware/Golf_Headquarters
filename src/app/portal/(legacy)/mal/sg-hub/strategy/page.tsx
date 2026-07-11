import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { buildYardageRows } from "@/lib/sg-hub/yardage-calc";
import { StrategyCards } from "@/components/sg-hub/StrategyCards";

export default async function StrategyPage() {
  const user = await requirePortalUser();

  const [sessions, baselines] = await Promise.all([
    prisma.trackManSession.findMany({
      where: { userId: user.id },
      select: { rawJson: true },
      orderBy: { recordedAt: "desc" },
      take: 30,
    }),
    prisma.sgBaseline.findMany({
      where: { category: "APP" },
      select: { distanceBucket: true, expectedStrokes: true },
    }),
  ]);

  const rows = buildYardageRows(sessions);

  return (
    <div className="mx-auto max-w-[760px] space-y-6 px-4 pb-20 sm:px-6 md:pb-0">
      {/* Back link */}
      <Link
        href="/portal/mal/sg-hub"
        className="inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        SG-hub
      </Link>

      {/* Editorial header */}
      <div className="space-y-1">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
          Fase 3 · distanse og strategi
        </p>
        <h1 className="font-display text-3xl font-bold leading-tight tracking-[-0.02em] text-foreground">
          Same-Distance{" "}
          <em className="italic font-medium text-primary">
            strategi
          </em>
        </h1>
        <p className="max-w-xl pt-1 text-sm text-muted-foreground">
          For en gitt mål-distanse: hvilken kølle gir best Strokes Gained?
          Rangerer kandidater etter presisjon, apex og PGA Tour-benchmark.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center shadow-sm">
          <p className="text-sm text-muted-foreground">
            Ingen TrackMan-data ennå.{" "}
            <Link
              href="/portal/mal/trackman"
              className="text-primary underline-offset-2 hover:underline"
            >
              Importer din første økt
            </Link>{" "}
            for å se strategiforslag.
          </p>
        </div>
      ) : (
        <StrategyCards rows={rows} baselines={baselines} />
      )}
    </div>
  );
}
