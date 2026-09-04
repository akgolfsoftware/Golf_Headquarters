/**
 * Aggregerte betalingssummer per barn til foreldreøkonomisiden (FO-07).
 *
 * STEG 19.3-fiks (04.09.2026): summene kommer fra `groupBy` i basen, ikke fra
 * en `findMany(take: 30)` som ble filtrert i appen. Cap-en kuttet stille bort
 * eldre betalinger (inkl. tidlig i inneværende år) så snart en familie hadde
 * over 30 betalinger totalt på tvers av barna — betalingslisten vises aldri i
 * UI, kun de aggregerte tallene, så cap-en tjente ingen formål. Årsgrensen er
 * Oslo-korrekt (`startOfYear`/`endOfYear`) i stedet for rå `getFullYear()`,
 * som leste serverens (UTC) år, ikke Oslo-året.
 */

import { prisma } from "@/lib/prisma";
import { startOfYear, endOfYear } from "@/lib/uke-helpers";
import type { PaymentStatus } from "@/generated/prisma/client";

const UBETALT: PaymentStatus[] = ["PENDING", "FAILED"];

export interface BarnOkonomiSummer {
  betaltIAarOre: number;
  utestaaendeOre: number;
}

export async function hentBarnOkonomiSummer(
  childIds: string[],
  naa: Date = new Date()
): Promise<Map<string, BarnOkonomiSummer>> {
  if (childIds.length === 0) return new Map();

  const [betaltIAar, utestaaende] = await Promise.all([
    prisma.payment.groupBy({
      by: ["userId"],
      where: {
        userId: { in: childIds },
        status: "SUCCEEDED",
        createdAt: { gte: startOfYear(naa), lt: endOfYear(naa) },
      },
      _sum: { amountOre: true },
    }),
    prisma.payment.groupBy({
      by: ["userId"],
      where: { userId: { in: childIds }, status: { in: UBETALT } },
      _sum: { amountOre: true },
    }),
  ]);

  const betaltMap = new Map(betaltIAar.map((g) => [g.userId, g._sum.amountOre ?? 0]));
  const utestaaendeMap = new Map(
    utestaaende.map((g) => [g.userId, g._sum.amountOre ?? 0])
  );

  const resultat = new Map<string, BarnOkonomiSummer>();
  for (const childId of childIds) {
    resultat.set(childId, {
      betaltIAarOre: betaltMap.get(childId) ?? 0,
      utestaaendeOre: utestaaendeMap.get(childId) ?? 0,
    });
  }
  return resultat;
}
