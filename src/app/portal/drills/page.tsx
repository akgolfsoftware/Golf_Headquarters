/**
 * PlayerHQ · Drill-bibliotek
 *
 * Server-component som henter alle ExerciseDefinition + spillerens kategori
 * + brukerens egen drill-historikk (SessionDrill + SessionDrillInstance).
 * Sender data ned i `DrillsLibraryClient` for filtrering og interaksjon.
 *
 * Persona: Markus Røinås Pedersen (A1-kategori, NGF E-G default).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { kategoriFraHcp } from "@/lib/ai-plan/context";
import { PlayerHero as PageHeader } from "@/components/portal/player-hero";
import { AgentStrip } from "@/components/coachhq/agent-strip";
import type { DrillFasilitet, NgfKategori } from "@/generated/prisma/client";
import { DrillsLibraryClient } from "./drills-client";

const KATEGORI_RANK: Record<NgfKategori, number> = {
  A: 0,
  B: 1,
  C: 2,
  D: 3,
  E: 4,
  F: 5,
  G: 6,
  H: 7,
  I: 8,
  J: 9,
  K: 10,
  L: 11,
};

function antallRelevante(
  drills: Array<{
    minKategori: NgfKategori | null;
    maxKategori: NgfKategori | null;
  }>,
  spillerKategori: NgfKategori | null,
): number {
  if (spillerKategori === null) return drills.length;
  const rank = KATEGORI_RANK[spillerKategori];
  return drills.filter((d) => {
    const minR = d.minKategori !== null ? KATEGORI_RANK[d.minKategori] : 0;
    const maxR = d.maxKategori !== null ? KATEGORI_RANK[d.maxKategori] : 11;
    return rank >= minR && rank <= maxR;
  }).length;
}

export default async function DrillsLibraryPage() {
  const user = await requirePortalUser({ allow: ["PLAYER", "PARENT"] });

  const spillerKategori = kategoriFraHcp(user.hcp);

  // Hent tilgjengelige fasiliteter for spilleren
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { tilgjengeligeFasiliteter: true },
  });
  const spillerFasiliteter: DrillFasilitet[] = dbUser?.tilgjengeligeFasiliteter ?? [];

  // Hent alle drills + brukerens historikk + mestrede drills i parallell.
  const [drills, mineSessionDrills, mineDrillInstances, coachAnbefaltIds] =
    await Promise.all([
      prisma.exerciseDefinition.findMany({
        orderBy: [{ pyramidArea: "asc" }, { name: "asc" }],
      }),
      prisma.sessionDrill.findMany({
        where: { session: { plan: { userId: user.id } } },
        select: { exerciseId: true, csTarget: true },
      }),
      prisma.sessionDrillInstance.findMany({
        where: {
          session: { studentId: user.id },
          drillId: { not: null },
        },
        select: { drillId: true },
      }),
      // Drills som er foreslått eller approved i pending session-requests
      // (vi bruker dette for å markere "coach-anbefalt" — Anders har lagt dem inn
      // i en aktiv plan eller foreslått dem).
      prisma.sessionDrill
        .findMany({
          where: {
            session: {
              plan: {
                userId: user.id,
                status: { in: ["ACTIVE", "PENDING_PLAYER", "ACCEPTED"] },
              },
            },
          },
          select: { exerciseId: true },
        })
        .then((rows) => new Set(rows.map((r) => r.exerciseId))),
    ]);
  // Mestrede drills for innlogget spiller.
  // @ts-expect-error – DrillMestringsLogg er planlagt i neste Prisma-migrasjon
  const mestretLogg = await prisma.drillMestringsLogg.findMany({
    where: { userId: user.id, mestret: true },
    select: { drillId: true },
  });

  // Tell antall ganger hver drill er trent.
  const gangerPerDrill = new Map<string, number>();
  const csPerDrill = new Map<string, number[]>();
  for (const sd of mineSessionDrills) {
    gangerPerDrill.set(
      sd.exerciseId,
      (gangerPerDrill.get(sd.exerciseId) ?? 0) + 1,
    );
    if (sd.csTarget !== null) {
      const arr = csPerDrill.get(sd.exerciseId) ?? [];
      arr.push(sd.csTarget);
      csPerDrill.set(sd.exerciseId, arr);
    }
  }
  for (const di of mineDrillInstances) {
    if (di.drillId) {
      gangerPerDrill.set(
        di.drillId,
        (gangerPerDrill.get(di.drillId) ?? 0) + 1,
      );
    }
  }

  // Mestrede drill-ids som array (Set kan ikke serialiseres over server-boundary).
  const mestretIds = [
    ...new Set((mestretLogg as { drillId: string }[]).map((l) => l.drillId)),
  ];

  // Bygg DrillRow-objekter til klienten.
  const drillRows = drills.map((d) => {
    let csForMeg: number | null = null;
    if (
      spillerKategori !== null &&
      d.csTargetByKategori &&
      typeof d.csTargetByKategori === "object" &&
      !Array.isArray(d.csTargetByKategori)
    ) {
      const map = d.csTargetByKategori as Record<string, unknown>;
      const v = map[spillerKategori];
      if (typeof v === "number") csForMeg = v;
    }
    if (csForMeg === null && d.csMin !== null && d.csMax !== null) {
      csForMeg = Math.round((d.csMin + d.csMax) / 2);
    } else if (csForMeg === null && d.csMax !== null) {
      csForMeg = d.csMax;
    } else if (csForMeg === null && d.csMin !== null) {
      csForMeg = d.csMin;
    }

    return {
      id: d.id,
      name: d.name,
      description: d.description,
      pyramidArea: d.pyramidArea,
      skillArea: d.skillArea,
      morad: d.morad,
      durationMin: d.durationMin,
      csMin: d.csMin,
      csMax: d.csMax,
      defaultRepsSets: d.defaultRepsSets,
      environment: d.environment,
      fasilitetKrav: d.fasilitetKrav as DrillFasilitet[],
      minKategori: d.minKategori,
      maxKategori: d.maxKategori,
      videoUrl: d.videoUrl,
      coachAnbefalt: coachAnbefaltIds.has(d.id),
      ganger: gangerPerDrill.get(d.id) ?? 0,
      csForMeg,
    };
  });

  const totalDrills = drills.length;
  const relevanteForMeg = antallRelevante(drills, spillerKategori);
  const coachAnbefaltCount = coachAnbefaltIds.size;

  const eyebrow = `DRILLS · ${relevanteForMeg} RELEVANTE FOR DEG · ${coachAnbefaltCount} FORESLÅTT AV ANDERS`;

  // Velg en anbefaling-tekst basert på pyramide-fordeling.
  const puttingDrills = drillRows.filter(
    (d) => d.skillArea === "PUTTING",
  ).length;
  const agentTekst =
    puttingDrills > 0
      ? `Putting <2,5m bør prioriteres denne uka — vi har ${puttingDrills} putting-drills som passer for deg.`
      : `Du har ${relevanteForMeg} drills tilpasset ditt nivå (${spillerKategori ?? "ukjent"}). Velg en å be om i neste plan.`;

  // Tier-cast: respekter ELITE i typen sjøl om vi ikke bruker den lenger.
  const tier = user.tier as "GRATIS" | "PRO" | "ELITE";

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        eyebrow={eyebrow}
        titleLead="Mitt"
        titleItalic="drill-bibliotek"
        sub={`${totalDrills} drills totalt · ${relevanteForMeg} matcher ditt nivå`}
      />

      <AgentStrip label="Anders sier">{agentTekst}</AgentStrip>

      <DrillsLibraryClient
        drills={drillRows}
        spillerKategori={spillerKategori}
        tier={tier}
        spillerFasiliteter={spillerFasiliteter}
        mestretIds={mestretIds}
      />
    </div>
  );
}
