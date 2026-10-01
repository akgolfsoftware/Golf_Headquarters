/**
 * /portal/ai/foresla-drill — AI foreslår drills — v2.
 * v2-port 16. juli 2026: `ForeslaDrillV2` erstatter foresla-drill-screen (v10),
 * ruten flyttet ut av (legacy). Auth-guard, Prisma-queries, svakhets-signaler
 * og den ærlige match-scoren (akse-overlapp, aldri oppdiktede tall) uendret.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import {
  axisKind,
  AXIS_LABEL,
  loadWeaknessSignals,
} from "@/lib/portal-ai/ai-data";
import { foreslaGodkjenteOvelsesbankElementer } from "@/lib/masterbrain";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import {
  ForeslaDrillV2,
  type DrillSuggestion,
} from "@/components/portal/v2/ForeslaDrillV2";
import type { PyramidArea } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

export default async function ForeslaDrillPage() {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

  const [signals, dbUser] = await Promise.all([
    loadWeaknessSignals(user.id),
    prisma.user.findUnique({
      where: { id: user.id },
      select: {
        tilgjengeligeFasiliteter: true,
        playerFacilities: {
          select: {
            name: true,
            capabilities: true,
            rangeLengdeM: true,
            maksPuttLengdeM: true,
          },
        },
      },
    }),
  ]);

  // Godkjente Masterbrain-øvelser i prioriterte pyramideområder, filtrert på
  // spillerens faktiske fasiliteter og lengdegrenser.
  const prioritizedAreas = signals.map((s) => s.area);
  const drills =
    prioritizedAreas.length === 0
      ? []
      : foreslaGodkjenteOvelsesbankElementer({
          pyramidAreas: prioritizedAreas,
          fasilitetProfil: {
            tilgjengeligeFasiliteter: dbUser?.tilgjengeligeFasiliteter ?? [],
            playerFacilities:
              dbUser?.playerFacilities.map((f) => ({
                name: f.name,
                capabilities: f.capabilities,
                rangeLengdeM: f.rangeLengdeM,
                maksPuttLengdeM: f.maksPuttLengdeM,
              })) ?? [],
          },
          limit: 24,
        });

  const reasonByArea = new Map(signals.map((s) => [s.area, s.reason]));

  // Ærlig match: høyest for området med flest manglende målinger (rank 1),
  // fallende per prioritetstrinn. Ingen oppdiktede desimaler.
  const matchForAreaIndex = (idx: number) => Math.max(60, 96 - idx * 12);

  const suggestions: DrillSuggestion[] = drills
    .map((d) => {
      const pyramidArea = d.akFormel?.pyramidArea as PyramidArea | undefined;
      const areaIdx = pyramidArea ? prioritizedAreas.indexOf(pyramidArea) : -1;
      const meta: string[] = [];
      if (d.akFormel?.omraade) meta.push(d.akFormel.omraade);
      if (d.treningstype) meta.push(d.treningstype.toLowerCase());
      const longest = d.facilityRequirements?.longestShotM;
      if (typeof longest === "number") meta.push(`maks ${longest.toLocaleString("nb-NO")} m`);
      return {
        id: d.id ?? "",
        rank: 0,
        axis: axisKind(pyramidArea ?? "SLAG"),
        axisLabel: AXIS_LABEL[pyramidArea ?? "SLAG"],
        title: d.navn ?? d.id ?? "Godkjent øvelse",
        meta,
        matchPct: matchForAreaIndex(areaIdx < 0 ? prioritizedAreas.length : areaIdx),
        why:
          (pyramidArea ? reasonByArea.get(pyramidArea) : null) ??
          `Godkjent i Masterbrain og mulig på dine registrerte fasiliteter.`,
        href: "/portal/drills",
        _areaIdx: areaIdx,
      };
    })
    .sort((a, b) => b.matchPct - a.matchPct || a.title.localeCompare(b.title, "nb-NO"))
    .slice(0, 6)
    .map(({ _areaIdx, ...rest }, i) => {
      void _areaIdx;
      return { ...rest, rank: i + 1 };
    });

  const analysedTestCount = await prisma.testDefinition.count({
    where: { OR: [{ isCustom: false }, { createdById: user.id }] },
  });

  return (
    <V2Shell bredde="kolonne" aktiv="gjor" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/portal/drills">Øvelsesbank</TilbakeLenke>
      <ForeslaDrillV2
        data={{
          playerFirstName: (user.name ?? "deg").split(" ")[0],
          analysedTestCount,
          suggestions,
        }}
      />
    </V2Shell>
  );
}
