"use server";

/**
 * AgencyOS · Caddie · Dashbord (v2) — server actions.
 * Flyttet fra src/app/admin/(legacy)/agencyos/caddie/dashbord/actions.ts ved
 * v2-portering — samme logikk, revalidatePath peker på den nye v2-ruten.
 */

import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { runCaddieProactive } from "@/lib/agents/caddie-proactive";

/** Kjør den proaktive Caddie-agenten nå (manuell trigger). ADMIN-only. */
export async function kjorCaddieProaktiv() {
  await requirePortalUser({ allow: ["ADMIN"] });
  const res = await runCaddieProactive();
  revalidatePath("/admin/agencyos/caddie/dashbord");
  return res;
}

/** Avvis et proaktivt forslag (PENDING → REJECTED). ADMIN-only. */
export async function avvisProaktivtForslag(draftId: string) {
  const user = await requirePortalUser({ allow: ["ADMIN"] });
  await prisma.caddieDraft.updateMany({
    where: { id: draftId, userId: user.id, status: "PENDING" },
    data: { status: "REJECTED", resolvedAt: new Date() },
  });
  revalidatePath("/admin/agencyos/caddie/dashbord");
  return { ok: true };
}
