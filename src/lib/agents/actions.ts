"use server";

import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { harCoachTilgangTilSpiller } from "@/lib/auth/coached";
import { prisma } from "@/lib/prisma";
import { acceptAndApplyPlanAction } from "./accept-plan-action";
import { settUtfall } from "@/lib/agenticos/logg";
import { AVVIS_GRUNNER, erAvvisGrunn, type AvvisGrunn } from "@/lib/agenticos";

/** Spiller eier egen action; coach/admin kun for coachede spillere (+ coachId-match). */
async function assertPlanActionAccess(
  user: { id: string; role: string },
  action: { userId: string; coachId: string | null },
): Promise<void> {
  if (action.userId === user.id) return;
  if (user.role === "ADMIN") return;
  if (user.role !== "COACH") throw new Error("forbidden");
  // Tildelt annen coach → nei
  if (action.coachId && action.coachId !== user.id) throw new Error("forbidden");
  if (!(await harCoachTilgangTilSpiller(user, action.userId))) {
    throw new Error("forbidden");
  }
}

export async function acceptPlanAction(actionId: string) {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

  const action = await prisma.planAction.findUnique({
    where: { id: actionId },
  });
  if (!action) throw new Error("not-found");
  await assertPlanActionAccess(user, action);
  if (action.status !== "PENDING") return;

  await acceptAndApplyPlanAction(actionId);
  await lukkLaeringslokke(action.interaksjonId, "GODKJENT");

  revalidatePath("/portal");
  revalidatePath("/portal/agent-pipeline");
  revalidatePath("/admin/godkjenninger");
  revalidatePath(`/admin/godkjenninger/${actionId}`);
  revalidatePath("/admin/approvals");
  revalidatePath("/portal/tren/teknisk-plan");
  revalidatePath("/portal/mal/trackman");
}

export async function rejectPlanAction(actionId: string, grunn?: AvvisGrunn) {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

  const action = await prisma.planAction.findUnique({
    where: { id: actionId },
  });
  if (!action) throw new Error("not-found");
  await assertPlanActionAccess(user, action);

  await prisma.planAction.update({
    where: { id: actionId },
    data: { status: "REJECTED" },
  });
  await lukkLaeringslokke(action.interaksjonId, "AVVIST", grunn);

  revalidatePath("/portal");
  revalidatePath("/portal/agent-pipeline");
  revalidatePath("/admin/godkjenninger");
}

/**
 * Melder utfallet tilbake til AgenticOS-loggen.
 *
 * Kun LLM-drevne agenter setter `interaksjonId` — de fleste agentene er
 * deterministiske regler uten modellkall, og har ingenting å melde tilbake.
 *
 * Ett modellkall kan produsere flere forslag som behandles hver for seg.
 * settUtfall rører kun rader som fortsatt står PENDING, så det FØRSTE
 * forslaget som avgjøres setter interaksjonens utfall — en senere godkjenning
 * overskriver ikke en tidligere avvisning. Samme regel som for Caddie-utkast.
 *
 * GDPR-porten står i settUtfall: begrunnelsen lagres aldri for en mindreårig.
 */
async function lukkLaeringslokke(
  interaksjonId: string | null,
  utfall: "GODKJENT" | "AVVIST",
  grunn?: AvvisGrunn,
): Promise<void> {
  if (!interaksjonId) return;
  // Kun kjente koder lagres — fritekst fra klienten slippes aldri rett inn.
  const begrunnelse = grunn && erAvvisGrunn(grunn) ? AVVIS_GRUNNER[grunn] : undefined;
  await settUtfall({ interaksjonId, utfall, begrunnelse });
}