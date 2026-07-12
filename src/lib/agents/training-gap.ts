// training-gap: cron-agent som varsler coach (via PlanAction) når en spillers
// svakeste SG-område får for lite oppmerksomhet i loggført treningsvolum.
//
// Logikk:
//   1. For hver aktive spiller (rolle PLAYER), beregn snitt-SG per kategori
//      siste 8 uker (krev minst 3 runder med SG-data).
//   2. Identifiser svakeste kategori (lavest snitt).
//   3. Hent loggført treningsvolum siste 4 uker, summer per SG-område.
//   4. Hvis totalt > 0 minutter og andelen på svakeste område < 20 %:
//      opprett PlanAction (TRAINING_GAP) hvis det ikke allerede finnes en
//      PENDING for samme bruker + område.

import { coachedPlayerWhere } from "@/lib/auth/coached";
import { prisma } from "@/lib/prisma";
import { hentTreningsVolum } from "@/lib/training/volum";
import type { SgCategory } from "@/generated/prisma/client";
import { runAgent, type AgentResult } from "./agent-runner";

export const AGENT_NAME = "training-gap";

const UKER_SG = 8;
const UKER_TRENING = 4;
const TERSKEL_ANDEL = 0.2; // < 20 % av treningstid på svakeste område => varsel
const MIN_RUNDER = 3;
const OMRAADER: SgCategory[] = ["OTT", "APP", "ARG", "PUTT"];

const OMRAADE_LABEL: Record<SgCategory, string> = {
  OTT: "Tee-slag (OTT)",
  APP: "Innspill (APP)",
  ARG: "Around-the-green (ARG)",
  PUTT: "Putting",
};

export async function runTrainingGap(): Promise<AgentResult> {
  return runAgent(AGENT_NAME, null, async () => {
    const spillere = await prisma.user.findMany({
      where: coachedPlayerWhere(),
      select: { id: true },
    });

    const sgGrense = new Date();
    sgGrense.setDate(sgGrense.getDate() - UKER_SG * 7);

    let varsler = 0;

    for (const spiller of spillere) {
      const runder = await prisma.round.findMany({
        where: {
          userId: spiller.id,
          playedAt: { gte: sgGrense },
          sgTotal: { not: null },
        },
        select: { sgOtt: true, sgApp: true, sgArg: true, sgPutt: true },
      });
      if (runder.length < MIN_RUNDER) continue;

      const sumSg: Record<SgCategory, number> = { OTT: 0, APP: 0, ARG: 0, PUTT: 0 };
      const tellerSg: Record<SgCategory, number> = { OTT: 0, APP: 0, ARG: 0, PUTT: 0 };

      for (const r of runder) {
        const vals: Record<SgCategory, number | null> = {
          OTT: r.sgOtt,
          APP: r.sgApp,
          ARG: r.sgArg,
          PUTT: r.sgPutt,
        };
        for (const a of OMRAADER) {
          const v = vals[a];
          if (v != null) {
            sumSg[a] += v;
            tellerSg[a]++;
          }
        }
      }

      // Krev minst én måling i hver kategori for å kunne kåre svakest
      const harAlle = OMRAADER.every((a) => tellerSg[a] > 0);
      if (!harAlle) continue;

      const snitt: Record<SgCategory, number> = {
        OTT: sumSg.OTT / tellerSg.OTT,
        APP: sumSg.APP / tellerSg.APP,
        ARG: sumSg.ARG / tellerSg.ARG,
        PUTT: sumSg.PUTT / tellerSg.PUTT,
      };

      const svakest = OMRAADER.reduce((best, curr) =>
        snitt[curr] < snitt[best] ? curr : best,
      );

      const volum = await hentTreningsVolum(spiller.id, UKER_TRENING);
      const totalMinutter = volum.reduce((s, v) => s + v.minutter, 0);
      if (totalMinutter <= 0) continue;

      const svakestMinutter = volum
        .filter((v) => v.sgArea === svakest)
        .reduce((s, v) => s + v.minutter, 0);
      const andel = svakestMinutter / totalMinutter;

      if (andel >= TERSKEL_ANDEL) continue;

      // Sjekk om aktiv PENDING TRAINING_GAP allerede finnes for denne spilleren
      const eksisterende = await prisma.planAction.findFirst({
        where: {
          userId: spiller.id,
          actionType: "TRAINING_GAP",
          status: "PENDING",
        },
      });
      if (eksisterende) {
        const eksSugg = eksisterende.suggestion as { svakestOmraade?: string } | null;
        if (eksSugg?.svakestOmraade === svakest) continue; // Allerede flagget for dette området

        // Svakeste område har endret seg — sett gammel action som SUPERSEDED
        // så coach ikke handler på utdatert info, og opprett ny for gjeldende område
        await prisma.planAction.update({
          where: { id: eksisterende.id },
          data: { status: "SUPERSEDED" },
        });
      }

      await prisma.planAction.create({
        data: {
          userId: spiller.id,
          actionType: "TRAINING_GAP",
          agentName: AGENT_NAME,
          suggestion: {
            svakestOmraade: svakest,
            svakestLabel: OMRAADE_LABEL[svakest],
            snittSg: Number(snitt[svakest].toFixed(3)),
            andelTrening: Number(andel.toFixed(3)),
            totalMinutterSiste4Uker: totalMinutter,
            svakestMinutterSiste4Uker: svakestMinutter,
            forklaring: `${OMRAADE_LABEL[svakest]} er svakeste SG-område siste ${UKER_SG} uker (snitt ${snitt[svakest].toFixed(2)}), men får bare ${Math.round(andel * 100)} % av treningstid siste ${UKER_TRENING} uker.`,
          },
        },
      });
      varsler++;
    }

    return { planActionsWritten: varsler };
  });
}
