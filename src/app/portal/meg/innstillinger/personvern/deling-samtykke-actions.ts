"use server";

/**
 * Server actions for spillerens EGET delingssamtykke (plan T8 — deling av
 * testresultater/stats til Team Norway/WANG-lesere).
 *
 * Foresatt-varianten ligger i src/app/forelder/samtykke/actions.ts — den
 * må verifisere ParentRelation, og hører derfor hjemme der.
 * Mønster: ./helse-samtykke-actions.ts.
 */

import { revalidatePath } from "next/cache";
import { requireSpillerActionUser } from "@/lib/auth/action-guards";
import { prisma } from "@/lib/prisma";
import { registrerDelingsSamtykke } from "@/lib/deling/samtykke";
import { erDelingScope } from "@/lib/deling/samtykke-regler";
import { aktivtSpillerMedlemskapWhere } from "@/lib/domain/grupper";

type Resultat = { ok: true } | { ok: false; feil: string };

/**
 * Spilleren gir eller trekker sitt eget samtykke mot én mottakergruppe.
 * Ingen userId-parameter: brukeren hentes fra sesjonen, så det finnes ingen
 * parameter å manipulere for å treffe en annen spiller. Mottakergruppen må
 * være en gruppe spilleren selv har aktivt medlemskap i.
 */
async function settEget(
  scope: string,
  mottakerGruppeId: string,
  gitt: boolean,
): Promise<Resultat> {
  const user = await requireSpillerActionUser();

  if (!erDelingScope(scope)) {
    return { ok: false, feil: "Ukjent samtykketype." };
  }

  const medlemskap = await prisma.groupMember.findFirst({
    where: {
      ...aktivtSpillerMedlemskapWhere(),
      userId: user.id,
      groupId: mottakerGruppeId,
    },
    select: { id: true },
  });
  if (!medlemskap) {
    return { ok: false, feil: "Du er ikke medlem av denne gruppen." };
  }

  try {
    await registrerDelingsSamtykke({
      userId: user.id,
      scope,
      mottakerGruppeId,
      gitt,
      gittAvUserId: user.id,
      gittAvRolle: "SELV",
    });
  } catch (err) {
    // Forventet tilfelle: mindreårig prøver å gi samtykke selv. Meldingen fra
    // regel-laget er allerede skrevet for å vises rett i UI.
    return {
      ok: false,
      feil: err instanceof Error ? err.message : "Kunne ikke lagre samtykket.",
    };
  }

  revalidatePath("/portal/meg/innstillinger/personvern");
  return { ok: true };
}

export async function giDelingsSamtykke(
  scope: string,
  mottakerGruppeId: string,
): Promise<Resultat> {
  return settEget(scope, mottakerGruppeId, true);
}

export async function trekkDelingsSamtykke(
  scope: string,
  mottakerGruppeId: string,
): Promise<Resultat> {
  return settEget(scope, mottakerGruppeId, false);
}
