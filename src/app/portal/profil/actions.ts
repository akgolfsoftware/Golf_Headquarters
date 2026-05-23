"use server";

/**
 * Server actions for spillerprofil (`/portal/profil`).
 *
 * - `lagreFasiliteter` — oppdaterer `User.tilgjengeligeFasiliteter` for
 *   innlogget spiller. Validerer mot DrillFasilitet-enum.
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

const GYLDIGE_FASILITETER = [
  "RADAR",
  "MAT_NET",
  "BUNKER",
  "KAMERA",
  "PUTTING_GREEN_KORT",
  "PUTTING_GREEN_LANG",
  "SHORT_GAME_AREA",
  "DRIVING_RANGE",
  "BANE",
  "SIMULATOR",
  "VEKTSTANG",
  "TRAPBAR",
  "LOPEBANE",
  "MED_BALL",
] as const;

const FasilitetListeSchema = z.array(z.enum(GYLDIGE_FASILITETER));

type ActionResult = { ok: true } | { ok: false; error: string };

export async function lagreFasiliteter(fasiliteter: unknown): Promise<ActionResult> {
  const user = await requirePortalUser({ allow: ["PLAYER", "PARENT", "COACH", "ADMIN"] });

  const parsed = FasilitetListeSchema.safeParse(fasiliteter);
  if (!parsed.success) {
    return {
      ok: false,
      error: `Ugyldige fasiliteter: ${parsed.error.issues.map((i) => i.message).join(", ")}`,
    };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { tilgjengeligeFasiliteter: parsed.data },
  });

  revalidatePath("/portal/drills");
  revalidatePath("/portal/profil");

  return { ok: true };
}
