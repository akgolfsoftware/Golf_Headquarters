// PlayerHQ · Hull-analyse — illustrativt top-down-kart med spillerens EKTE
// SG- og treningsdata per sone (Tee → Innspill → Nærspill → Putt).
// SG: BrukerSgInput. Trening: TrainingPlanSession per skillArea (siste 30 d).

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { HoleAnalysis, type HoleZone } from "@/components/hole-analysis/hole-analysis";

export const dynamic = "force-dynamic";

type Area = "TEE_TOTAL" | "TILNAERMING" | "AROUND_GREEN" | "PUTTING";

export default async function HullAnalysePage() {
  const user = await requirePortalUser();

  const tretti = new Date();
  tretti.setDate(tretti.getDate() - 30);

  const [sgInputs, sessions] = await Promise.all([
    prisma.brukerSgInput.findMany({
      where: { userId: user.id },
      orderBy: { dato: "desc" },
      take: 8,
      select: { sgOtt: true, sgApp: true, sgArg: true, sgPutt: true },
    }),
    prisma.trainingPlanSession.findMany({
      where: { plan: { userId: user.id }, scheduledAt: { gte: tretti } },
      select: { skillArea: true, durationMin: true },
    }),
  ]);

  // Trening per skillArea (siste 30 d) → økter + minutter.
  const trening: Record<Area, { okter: number; minutter: number }> = {
    TEE_TOTAL: { okter: 0, minutter: 0 },
    TILNAERMING: { okter: 0, minutter: 0 },
    AROUND_GREEN: { okter: 0, minutter: 0 },
    PUTTING: { okter: 0, minutter: 0 },
  };
  for (const s of sessions) {
    if (s.skillArea && s.skillArea in trening) {
      const t = trening[s.skillArea as Area];
      t.okter += 1;
      t.minutter += s.durationMin;
    }
  }

  const latest = sgInputs[0] ?? null;
  // sgInputs er nyeste først → reverser for trend (eldste → nyeste).
  const trendOf = (pick: (i: (typeof sgInputs)[number]) => number | null) =>
    [...sgInputs].reverse().map(pick).filter((v): v is number => v != null);

  const zones: HoleZone[] = [
    {
      id: "tee",
      label: "Tee total",
      sub: "Off the tee",
      x: 43,
      y: 80,
      sg: latest?.sgOtt ?? null,
      ...trening.TEE_TOTAL,
      trend: trendOf((i) => i.sgOtt),
    },
    {
      id: "app",
      label: "Innspill",
      sub: "Tilnærming",
      x: 52,
      y: 50,
      sg: latest?.sgApp ?? null,
      ...trening.TILNAERMING,
      trend: trendOf((i) => i.sgApp),
    },
    {
      id: "arg",
      label: "Nærspill",
      sub: "Rundt green",
      x: 62,
      y: 28,
      sg: latest?.sgArg ?? null,
      ...trening.AROUND_GREEN,
      trend: trendOf((i) => i.sgArg),
    },
    {
      id: "putt",
      label: "Putt",
      sub: "Putting",
      x: 69,
      y: 18,
      sg: latest?.sgPutt ?? null,
      ...trening.PUTTING,
      trend: trendOf((i) => i.sgPutt),
    },
  ];

  const harData = sgInputs.length > 0;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-[440px]">
        <div className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          PlayerHQ · hull-analyse
        </div>
        <h1 className="mb-5 font-display text-2xl font-bold tracking-tight text-foreground">
          Hvor taper du <em className="font-normal italic text-primary">slag</em>?
        </h1>

        <HoleAnalysis
          fairway={zones}
          putting={[]}
          green={null}
          holeLabel="Min SG-analyse"
          holeMeta={`${sgInputs.length} registreringer`}
          caption="Kartet er illustrativt — tallene er dine faktiske SG- og treningsdata per sone. Trykk en sone."
        />

        {!harData && (
          <div className="mx-auto mt-4 max-w-[440px] rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">
              Ingen SG-registreringer ennå. Logg en runde med Strokes Gained, så fylles sonene
              med dine faktiske tall.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
