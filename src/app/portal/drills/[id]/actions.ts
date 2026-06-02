"use server";

/**
 * PlayerHQ · Drill-detalj · Server actions
 *
 * - `registrerMestringsOkt` — logg en mestrings-økt med csScore og kommentar.
 *   Setter mestret=true dersom csScore >= csTarget for spillerens kategori.
 * - `rateDrill` — lagre en spiller-rating (aha, utfordrende, etc.) for en drill.
 *
 * Tilgang: kun PLAYER og PARENT.
 */

import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { kategoriFraHcp } from "@/lib/ai-plan/context";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type ActionResult<T extends object = {}> =
  | ({ ok: true } & T)
  | { ok: false; error: string };

// DrillMestringsLogg/DrillRating finnes ikke i Prisma-schemaet ennå (planlagt
// migrasjon). Guard hindrer runtime-krasj (kall på undefined delegate) inntil da.
const MODELL_IKKE_KLAR = "Denne funksjonen aktiveres i en kommende oppdatering.";
function drillModellKlar(navn: "drillMestringsLogg" | "drillRating"): boolean {
  return Boolean((prisma as unknown as Record<string, unknown>)[navn]);
}

/**
 * Registrerer en mestrings-økt for en drill.
 * Sjekker om csScore >= csTarget for spillerens kategori og setter mestret=true.
 */
export async function registrerMestringsOkt(
  drillId: string,
  csScore: number | null,
  kommentar: string | null,
): Promise<ActionResult<{ mestret: boolean }>> {
  const user = await requirePortalUser({ allow: ["PLAYER", "PARENT"] });

  const drill = await prisma.exerciseDefinition.findUnique({
    where: { id: drillId },
    select: {
      id: true,
      csTargetByKategori: true,
      csMin: true,
      csMax: true,
    },
  });

  if (!drill) return { ok: false, error: "Drill ikke funnet" };

  // Beregn om spilleren har mestret drillen.
  let mestret = false;
  if (csScore !== null) {
    const spillerKategori = kategoriFraHcp(user.hcp);

    // Hent csTarget fra kategorisert map, fall tilbake til csMax.
    let csTarget: number | null = null;
    if (
      spillerKategori !== null &&
      drill.csTargetByKategori &&
      typeof drill.csTargetByKategori === "object" &&
      !Array.isArray(drill.csTargetByKategori)
    ) {
      const map = drill.csTargetByKategori as Record<string, unknown>;
      const v = map[spillerKategori];
      if (typeof v === "number") csTarget = v;
    }
    if (csTarget === null && drill.csMax !== null) csTarget = drill.csMax;
    if (csTarget === null && drill.csMin !== null) csTarget = drill.csMin;

    if (csTarget !== null && csScore >= csTarget) {
      mestret = true;
    }
  }

  if (!drillModellKlar("drillMestringsLogg"))
    return { ok: false, error: MODELL_IKKE_KLAR };

  // @ts-expect-error – DrillMestringsLogg er planlagt i neste Prisma-migrasjon
  await prisma.drillMestringsLogg.create({
    data: {
      drillId,
      userId: user.id,
      csScore: csScore ?? null,
      kommentar: kommentar?.trim() || null,
      mestret,
      dato: new Date(),
    },
  });

  revalidatePath(`/portal/drills/${drillId}`);
  revalidatePath("/portal/drills");

  return { ok: true, mestret };
}

/**
 * Lagrer en spiller-rating for en drill.
 * Type: "aha" | "utfordrende" | "passe" | "kjedelig" | "for_vanskelig"
 * rating: tall som reflekterer typen (aha=5, utfordrende=4, passe=3, kjedelig=2, for_vanskelig=1)
 */
export async function rateDrill(
  drillId: string,
  rating: number,
  type: string,
  kommentar: string | null,
): Promise<ActionResult> {
  const user = await requirePortalUser({ allow: ["PLAYER", "PARENT"] });

  const drill = await prisma.exerciseDefinition.findUnique({
    where: { id: drillId },
    select: { id: true },
  });
  if (!drill) return { ok: false, error: "Drill ikke funnet" };

  const spillerKategori = kategoriFraHcp(user.hcp);

  if (!drillModellKlar("drillRating"))
    return { ok: false, error: MODELL_IKKE_KLAR };

  // @ts-expect-error – DrillRating er planlagt i neste Prisma-migrasjon
  await prisma.drillRating.create({
    data: {
      drillId,
      userId: user.id,
      rating,
      type,
      kommentar: kommentar?.trim() || null,
      kategori: spillerKategori ?? null,
    },
  });

  revalidatePath(`/portal/drills/${drillId}`);
  revalidatePath("/portal/drills");

  return { ok: true };
}
