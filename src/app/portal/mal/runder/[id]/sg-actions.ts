"use server";

import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { synkroniserSgFraRunder } from "@/lib/portal-stats/sg-bro";
import { SG_ALLE_FELT, manuellSgSchema, validerManuellSg, type ManuellSgVerdier } from "@/lib/portal-runder/manuell-sg";

export type LagreManuellSgSvar =
  | { ok: true; verdier: ManuellSgVerdier }
  | { ok: false; melding: string };

/** Bare eieren endrer SG. Forventede verdier beskytter mot overskriving fra en gammel fane. */
export async function lagreManuellRundeSg(roundId: string, input: unknown, forventet: unknown): Promise<LagreManuellSgSvar> {
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  const sg = validerManuellSg(input);
  if (!sg.ok) return { ok: false, melding: sg.melding };
  if (!sg.harTall) return { ok: false, melding: "Fyll inn minst ett SG-tall." };
  const snapshot = manuellSgSchema.safeParse(forventet);
  if (!roundId || typeof roundId !== "string" || roundId.length > 200 || !snapshot.success ||
    SG_ALLE_FELT.some(({ key }) => snapshot.data[key] === undefined)) {
    return { ok: false, melding: "Last runden på nytt før du lagrer." };
  }
  try {
    const result = await prisma.round.updateMany({
      where: { id: roundId, userId: user.id, ...snapshot.data },
      data: { ...sg.verdier, sgSource: "manual" },
    });
    if (result.count !== 1) {
      const current = await prisma.round.findFirst({ where: { id: roundId, userId: user.id } });
      // Et mistet svar etter vellykket lagring kan prøves på nytt uten konflikt.
      if (!current || current.sgSource !== "manual" || SG_ALLE_FELT.some(({ key }) => current[key] !== sg.verdier[key])) {
        return { ok: false, melding: "Runden er endret eller ikke tilgjengelig. Last den på nytt før du prøver igjen. Tallene dine er beholdt her." };
      }
    }
  } catch {
    return { ok: false, melding: "Kunne ikke lagre SG-tallene. Tallene er beholdt. Prøv igjen." };
  }
  await synkroniserSgFraRunder(user.id);
  revalidatePath("/portal", "layout");
  revalidatePath(`/portal/mal/runder/${roundId}`);
  return { ok: true, verdier: sg.verdier };
}
