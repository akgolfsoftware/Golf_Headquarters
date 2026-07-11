"use server";

// Server action for å lagre coach-feedback (tommel opp/ned + kommentar) på
// en konkret agent-kjøring. Lagres som ny audit-rad med referanse til
// originalen, slik at vi kan trene/tune agentene på sikt.

import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { audit } from "@/lib/audit";

type Result = { ok: true } | { ok: false; feil: string };

export async function gisFeedback(
  auditId: string,
  rating: 1 | -1,
  comment?: string,
): Promise<Result> {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  if (!auditId || (rating !== 1 && rating !== -1)) {
    return { ok: false, feil: "Ugyldig input." };
  }

  const trimmet = (comment ?? "").trim().slice(0, 1000);

  await audit({
    actorId: user.id,
    action: "agent.feedback",
    target: auditId,
    metadata: {
      targetAuditId: auditId,
      rating,
      comment: trimmet || null,
    },
  });

  revalidatePath("/admin/agents");
  return { ok: true };
}
