"use server";

import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

/** Marker en AppFeedback-rad (tilbakemelding/support) som sett. */
export async function markerAppFeedbackSett(id: string): Promise<{ ok: boolean }> {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  await prisma.appFeedback.updateMany({
    where: { id, status: "NY" },
    data: { status: "SETT" },
  });
  revalidatePath("/admin/innboks");
  return { ok: true };
}
