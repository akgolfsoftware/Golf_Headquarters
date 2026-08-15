"use server";

/**
 * D6 · bekreft skoletid for inneværende semester.
 *
 * Kun forelderen til barnet kan bekrefte, og bare for eget barn. Bekreftelsen
 * gjelder ett semester og arves aldri videre — se src/lib/domain/skoletid.ts.
 */

import { revalidatePath } from "next/cache";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentBarnForForelder } from "@/lib/forelder";
import { prisma } from "@/lib/prisma";
import { semesterFor } from "@/lib/domain/skoletid";

export async function bekreftSkoletidAction(
  playerId: string,
): Promise<{ ok: boolean; melding: string }> {
  const user = await requirePortalUser({ allow: ["PARENT"] });

  // Forelderen kan kun bekrefte for sine egne barn.
  const barn = await hentBarnForForelder(user.id);
  if (!barn.some((b) => b.child.id === playerId)) {
    return { ok: false, melding: "Du kan bare bekrefte skoletid for egne barn." };
  }

  const semester = semesterFor(new Date());

  await prisma.skoletidBekreftelse.upsert({
    where: { playerId_semester: { playerId, semester: semester.kode } },
    // Allerede bekreftet: behold det opprinnelige tidspunktet. Å skyve det
    // fram ville gjort loggen usann om når foresatte faktisk sto inne for
    // tidene.
    update: {},
    create: { playerId, bekreftetAvId: user.id, semester: semester.kode },
  });

  revalidatePath("/forelder/barn");

  return {
    ok: true,
    melding: `Timeplanen er bekreftet for ${semester.visning}.`,
  };
}
