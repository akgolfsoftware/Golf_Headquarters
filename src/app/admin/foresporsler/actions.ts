"use server";

import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

/**
 * Marker en økt-forespørsel som avslått.
 */
export async function avslaaForespørsel(requestId: string) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  await prisma.sessionRequest.update({
    where: { id: requestId },
    data: { status: "DECLINED", respondedAt: new Date() },
  });

  revalidatePath("/admin/foresporsler");
}

/**
 * Marker en økt-forespørsel som planlagt (SCHEDULED).
 * Brukes når coach har booket tid og vil kvittere ut forespørselen.
 */
export async function markerSomPlanlagt(requestId: string) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  await prisma.sessionRequest.update({
    where: { id: requestId },
    data: { status: "APPROVED", respondedAt: new Date() },
  });

  revalidatePath("/admin/foresporsler");
}
