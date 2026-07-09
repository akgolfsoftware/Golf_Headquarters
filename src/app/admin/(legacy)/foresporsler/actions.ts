"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

const RequestIdSchema = z.string().min(1, "Forespørsel-ID er påkrevd");

/**
 * IDOR-vern: en COACH kan kun besvare forespørsler rettet til seg selv eller i
 * den åpne køen (coachId = null). ADMIN kan besvare alle.
 */
async function assertKanBesvare(
  requestId: string,
  user: { id: string; role: string },
): Promise<void> {
  const req = await prisma.sessionRequest.findUnique({
    where: { id: requestId },
    select: { coachId: true },
  });
  if (!req) throw new Error("not_found");
  if (user.role !== "ADMIN" && req.coachId !== null && req.coachId !== user.id) {
    throw new Error("forbidden");
  }
}

/**
 * Marker en økt-forespørsel som avslått.
 */
export async function avslaaForespørsel(requestId: string) {
  RequestIdSchema.parse(requestId);
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  await assertKanBesvare(requestId, user);

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
  RequestIdSchema.parse(requestId);
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  await assertKanBesvare(requestId, user);

  await prisma.sessionRequest.update({
    where: { id: requestId },
    data: { status: "APPROVED", respondedAt: new Date() },
  });

  revalidatePath("/admin/foresporsler");
}
