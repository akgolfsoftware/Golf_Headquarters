"use server";

/**
 * Per-drill pyramide-område — planleggings-handling for øktforhåndsvisningen.
 *
 * Syklende chip (FYS→TEK→SLAG→SPILL→TURN) på hver drill setter TrainingDrillV2
 * .pyramide direkte. Skrive-tilgang: spilleren som EIER økta (studentId) ELLER
 * en aktiv coach for den spilleren. Aldri en fabrikkert endring — feiler ærlig
 * hvis kjeden ikke finnes eller tilgang mangler.
 */

import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import type { PyramidArea } from "@/generated/prisma/client";

const GYLDIGE: PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];

export async function settDrillPyramide(
  drillId: string,
  pyramide: PyramidArea,
): Promise<{ ok: boolean; error?: string }> {
  if (!GYLDIGE.includes(pyramide)) return { ok: false, error: "Ugyldig område." };

  const user = await requirePortalUser();

  const drill = await prisma.trainingDrillV2.findUnique({
    where: { id: drillId },
    select: { id: true, sessionId: true, session: { select: { studentId: true } } },
  });
  if (!drill) return { ok: false, error: "Fant ikke øvelsen." };

  const studentId = drill.session.studentId;
  if (!studentId) return { ok: false, error: "Økta mangler eier." };
  const eier = studentId === user.id;
  const erCoach =
    !eier &&
    (await prisma.playerEnrollment.findFirst({
      where: { userId: studentId, coachId: user.id, endedAt: null },
      select: { id: true },
    })) !== null;

  if (!eier && !erCoach) return { ok: false, error: "Du kan ikke endre denne øvelsen." };

  await prisma.trainingDrillV2.update({
    where: { id: drillId },
    data: { pyramide },
  });

  revalidatePath(`/portal/gjennomfore/${drill.sessionId}`);
  revalidatePath("/portal/planlegge/workbench");
  return { ok: true };
}
