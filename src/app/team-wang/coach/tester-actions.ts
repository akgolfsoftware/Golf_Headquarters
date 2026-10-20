"use server";

/**
 * Tester › Til kontroll i WANG (designløftet 20.10.2026): treneren merker et egenført resultat som
 * kontrollert eller avviser det (beslutninger.md §TESTBATTERIET: «Resten fører spilleren som «Egenført»,
 * og treneren kan merke det kontrollert»).
 *
 * AgencyOS har `merkTestKontrollert`, men den bruker coachScopedPlayerWhere, som med vilje utelukker
 * WANG- og Team Norway-grupper. Her er tilgangen WANGs egen: treneren er trener i en WANG-gruppe, og
 * eleven deler testene med akkurat den gruppa (gyldig TEST_RESULTATER-samtykke). Verdiene i resultatet
 * endres aldri, og et resultat treneren selv har ført, er allerede kontrollert.
 */
import { z } from "zod";
import { revalidatePath } from "next/cache";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { hentWangTestTilgang } from "@/app/team-wang/_data/wang-testdag-data";

const Schema = z.object({
  resultatId: z.string().min(1).max(64),
  utfall: z.enum(["KONTROLLERT", "AVVIST"]),
});

export type WangKontrollSvar = { ok: true } | { ok: false; feil: string };

export async function kontrollerWangTest(input: z.infer<typeof Schema>): Promise<WangKontrollSvar> {
  const bruker = await requirePortalUser({ tillatDemo: true, allow: ["COACH", "ADMIN"] });
  const parsed = Schema.safeParse(input);
  if (!parsed.success) return { ok: false, feil: "Ugyldig test." };
  const tilgang = await hentWangTestTilgang(bruker);
  if (!tilgang) return { ok: false, feil: "Du er ikke trener i en WANG-gruppe." };

  const resultat = await prisma.testResult.findFirst({
    where: { id: parsed.data.resultatId, userId: { in: tilgang.delerIder } },
    select: { id: true, userId: true, recordedById: true, witnessStatus: true },
  });
  if (!resultat) return { ok: false, feil: "Fant ikke testen blant elevene som deler med WANG." };
  if (resultat.recordedById) return { ok: true };

  const status = parsed.data.utfall === "KONTROLLERT" ? "ATTESTED" : "REJECTED";
  if (resultat.witnessStatus !== status) {
    await prisma.testResult.update({
      where: { id: resultat.id },
      data: { witnessStatus: status, witnessUserId: bruker.id, attestationMode: "DIGITAL" },
    });
    await audit({
      actorId: bruker.id,
      action: status === "ATTESTED" ? "wang.test.kontrollert" : "wang.test.avvist",
      target: `TestResult:${resultat.id}`,
      metadata: { gruppeId: tilgang.gruppeId },
    });
  }
  revalidatePath("/team-wang/coach");
  return { ok: true };
}
