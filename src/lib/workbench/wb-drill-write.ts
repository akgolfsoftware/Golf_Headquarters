/**
 * OW-3 fase 3 — skriv drills mot `WorkbenchDrill` fra planleggerens
 * `OktDrillInput`-kontrakt (session-update.ts). Speiler `skrivSessionDrills`
 * (samme fil) felt-for-felt, men mot den nye tabellen — inkludert den ekte
 * øvelseskoblingen (Anders 17.09.2026: «kun én database for øvelser —
 * WorkbenchDrills og øvelser skal være det eksakt samme»): hver drill peker
 * på en rad i exercise_definitions, akkurat som SessionDrill gjorde.
 *
 * Replace-all-semantikk: hele drill-lista for økten erstattes ved hvert
 * kall, samme kontrakt som skrivSessionDrills (økt-komponisten sender alltid
 * hele lista, aldri et enkelt-tillegg).
 */

import type { Prisma, PrismaClient, PyramidArea } from "@/generated/prisma/client";
import type { OktDrillInput } from "@/lib/workbench/session-update";

type PlanDb = PrismaClient | Prisma.TransactionClient;

const REP_TYPE = {
  UTEN: "SVINGER_UTEN_BALL",
  TID: "TID",
  SETT_REPS: "SETT_REPS",
  BALLER: "BALLER_SLATT",
} as const;

const MOTORIKK: Record<OktDrillInput["nivaa"], "UTEN_BALL" | "LAV_HAST" | "AUTO"> = {
  uten: "UTEN_BALL",
  lav: "LAV_HAST",
  vanlig: "AUTO",
};

/**
 * Erstatter HELE drill-lista på en WorkbenchSession. Kalles i samme
 * transaksjon som selve økt-skrivingen (opprett/rediger).
 */
export async function skrivWorkbenchDrills(
  tx: PlanDb,
  input: {
    sessionId: string;
    drills: OktDrillInput[];
    fallbackPyramidArea: PyramidArea;
    playerId: string;
    coachId?: string;
  },
): Promise<void> {
  const rows: Prisma.WorkbenchDrillCreateManyInput[] = [];

  for (let i = 0; i < input.drills.length; i++) {
    const d = input.drills[i];
    let exerciseId = d.exerciseId ?? null;
    let exercise: { name: string; durationMin: number | null; pyramidArea: PyramidArea } | null = null;

    if (exerciseId) {
      exercise = await tx.exerciseDefinition.findUnique({
        where: { id: exerciseId },
        select: { name: true, durationMin: true, pyramidArea: true },
      });
      if (!exercise) exerciseId = null; // Slettet øvelse — fall tilbake til nyNavn under, ev. hopp over.
    }

    if (!exerciseId && d.nyNavn) {
      // Egen drill havner i spillerens bank — samme regel som skrivSessionDrills:
      // delt med plattformen kun ved eksplisitt samtykke, ellers privat.
      const delerMedPlattform = input.coachId
        ? false
        : ((
            await tx.user.findUnique({
              where: { id: input.playerId },
              select: { drillDelingGodtatt: true },
            })
          )?.drillDelingGodtatt ?? false);
      const ny = await tx.exerciseDefinition.create({
        data: {
          name: d.nyNavn,
          description: d.nyBeskrivelse || null,
          pyramidArea: (d.nyPyramidArea ?? input.fallbackPyramidArea) as PyramidArea,
          source: input.coachId ? "COACH" : "PLAYER",
          visibility: delerMedPlattform ? "PLATFORM" : "PRIVATE",
          createdBy: input.coachId ?? input.playerId,
          defaultRepsUtenBall: d.planRepsUtenBall ?? null,
          defaultRepsLavFart: d.planRepsLavFart ?? null,
          defaultRepsAuto: d.planRepsAuto ?? null,
          ...(d.nyOmraade ? { tags: [d.nyOmraade] } : {}),
        },
        select: { id: true, name: true, durationMin: true, pyramidArea: true },
      });
      exerciseId = ny.id;
      exercise = ny;
    }
    if (!exerciseId || !exercise) continue;

    const durationMinutes = d.minutter ?? exercise.durationMin ?? 15;
    const pyramid = d.nyPyramidArea ?? exercise.pyramidArea ?? input.fallbackPyramidArea;
    const akFormel: Prisma.InputJsonObject = {
      pyramid,
      // "TEE" er den etablerte systemfallbacken for ukjent underområde
      // (parseAkFormel i domain/workbench/schemas.ts) — planleggeren samler
      // i dag ikke inn et spesifikt underområde per drill.
      area: "TEE",
      label: exercise.name,
      motorikk: MOTORIKK[d.nivaa],
    };

    rows.push({
      sessionId: input.sessionId,
      title: exercise.name,
      description: null,
      durationMinutes,
      akFormel,
      techniqueFocus: null,
      sourceId: null,
      exerciseId,
      sortOrder: i,
      repType: d.nivaa === "uten" ? REP_TYPE.UTEN : d.minutter != null ? REP_TYPE.TID : d.sett != null ? REP_TYPE.SETT_REPS : REP_TYPE.BALLER,
      repMinutter: d.minutter ?? null,
      repSett: d.sett ?? null,
      repReps: d.reps ?? null,
      planRepsUtenBall: d.planRepsUtenBall ?? null,
      planRepsLavFart: d.planRepsLavFart ?? null,
      planRepsAuto: d.planRepsAuto ?? null,
      positionTaskId: d.positionTaskId ?? null,
    });
  }

  await tx.workbenchDrill.deleteMany({ where: { sessionId: input.sessionId } });
  if (rows.length > 0) await tx.workbenchDrill.createMany({ data: rows });
}
