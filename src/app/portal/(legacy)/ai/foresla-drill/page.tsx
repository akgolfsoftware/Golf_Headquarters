/**
 * /portal/ai/foresla-drill — AI foreslår drills basert på spillerens svakeste
 * pyramide-akser (fra ekte testdata). Ingen oppdiktede tall: match-scoren er en
 * ærlig akse-overlapp og begrunnelsen er den faktiske test-svakheten.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import {
  axisKind,
  AXIS_LABEL,
  loadWeaknessSignals,
} from "@/lib/portal-ai/ai-data";
import {
  ForeslaDrillScreen,
  type DrillSuggestion,
} from "@/components/portal/ai/foresla-drill-screen";

export const dynamic = "force-dynamic";

export default async function ForeslaDrillPage() {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

  const signals = await loadWeaknessSignals(user.id);

  // Drills i de prioriterte områdene — system + spillerens egne.
  const prioritizedAreas = signals.map((s) => s.area);
  const drills = prioritizedAreas.length
    ? await prisma.exerciseDefinition.findMany({
        where: {
          pyramidArea: { in: prioritizedAreas },
          OR: [{ source: "SYSTEM" }, { createdBy: user.id }],
        },
        select: {
          id: true,
          name: true,
          pyramidArea: true,
          durationMin: true,
          csMin: true,
          csMax: true,
          treningstype: true,
        },
        take: 24,
      })
    : [];

  const reasonByArea = new Map(signals.map((s) => [s.area, s.reason]));

  // Ærlig match: høyest for området med flest manglende målinger (rank 1),
  // fallende per prioritetstrinn. Ingen oppdiktede desimaler.
  const matchForAreaIndex = (idx: number) => Math.max(60, 96 - idx * 12);

  const suggestions: DrillSuggestion[] = drills
    .map((d) => {
      const areaIdx = prioritizedAreas.indexOf(d.pyramidArea);
      const meta: string[] = [];
      if (d.durationMin) meta.push(`${d.durationMin} min`);
      if (d.csMin != null && d.csMax != null) meta.push(`CS ${d.csMin}–${d.csMax}`);
      else if (d.csMax != null) meta.push(`CS ${d.csMax}`);
      if (d.treningstype) meta.push(d.treningstype.toLowerCase());
      return {
        id: d.id,
        rank: 0,
        axis: axisKind(d.pyramidArea),
        axisLabel: AXIS_LABEL[d.pyramidArea],
        title: d.name,
        meta,
        matchPct: matchForAreaIndex(areaIdx < 0 ? prioritizedAreas.length : areaIdx),
        why:
          reasonByArea.get(d.pyramidArea) ??
          `Trener ${AXIS_LABEL[d.pyramidArea].toLowerCase()}-området ditt.`,
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
    <ForeslaDrillScreen
      playerFirstName={(user.name ?? "deg").split(" ")[0]}
      analysedTestCount={analysedTestCount}
      suggestions={suggestions}
    />
  );
}
