// Server-only: testresultatene WANG-treneren får se i trenerflaten (pakke 4 Tester).
// Tilgangen går alltid gjennom hentWangTestresultatSkolerForTrener: bare elever i
// gruppa som har gyldig testsamtykke (D-55, forelder under 16). Trekkes samtykket,
// faller resultatene ut med en gang. Ingen andre skolers elever.

import "server-only";

import type { UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { formaterLagretTestResultat } from "@/lib/portal-tester/resultat-visning";
import {
  hentWangTestdeling,
  hentWangTestresultatSkolerForTrener,
} from "@/lib/portal-tester/wang-resultat-tilgang";
import type { WangSamtykkeStatus, WangTesterData } from "./wang-tester-visning";

const MAKS_RESULTATER = 500;

export async function hentWangTesterData(
  bruker: { id: string; role: UserRole },
  gruppeId: string,
): Promise<WangTesterData> {
  const skoler = await hentWangTestresultatSkolerForTrener(bruker);
  const skole = skoler.find((s) => s.groupId === gruppeId);
  const delerIder = skole?.playerIds ?? [];
  if (delerIder.length === 0) return { delerIder: [], resultater: [] };

  const rader = await prisma.testResult.findMany({
    where: { userId: { in: delerIder } },
    orderBy: [{ takenAt: "desc" }, { id: "desc" }],
    take: MAKS_RESULTATER,
    select: {
      id: true,
      userId: true,
      testId: true,
      takenAt: true,
      score: true,
      details: true,
      recordedById: true,
      witnessStatus: true,
      test: { select: { name: true, protocol: true, pyramidArea: true } },
    },
  });

  return {
    delerIder,
    resultater: rader.map((r) => ({
      id: r.id,
      elevId: r.userId,
      testId: r.testId,
      testNavn: r.test.name,
      akse: r.test.pyramidArea,
      datoIso: new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo" }).format(r.takenAt),
      verdi: formaterLagretTestResultat({
        testId: r.testId,
        score: r.score,
        details: r.details,
        protocol: r.test.protocol,
      }),
      kontrollert: r.recordedById !== null || r.witnessStatus === "ATTESTED",
      avvist: r.witnessStatus === "REJECTED",
    })),
  };
}

/**
 * Testsamtykket per elev i gruppa (Administrasjon › Samtykke, bare for sportssjef). Viser bare status,
 * aldri innhold. Elever uten aktivt WANG-medlemskap får «IKKE_SVART».
 */
export async function hentWangSamtykkeStatus(
  elevIder: string[],
  gruppeId: string,
): Promise<Record<string, WangSamtykkeStatus>> {
  const svar = await Promise.all(
    elevIder.map(async (id) => {
      const deling = (await hentWangTestdeling(id)).find((d) => d.gruppeId === gruppeId);
      return [id, deling?.status ?? "IKKE_SVART"] as const;
    }),
  );
  return Object.fromEntries(svar);
}
