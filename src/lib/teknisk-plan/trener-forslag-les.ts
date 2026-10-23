import "server-only";

import { prisma } from "@/lib/prisma";
import { TEKNISK_PLAN_FORSLAG_TYPE, TekniskPlanForslagSchema, beskrivTekniskPlanForslag } from "./trener-forslag";

export type TekniskPlanForslagRad = { id: string; trener: string; tekst: string; opprettet: string };

/** Spillerens egne, ubesvarte trenerforslag på én teknisk plan. Kun `userId = spillerId`, aldri andres. */
export async function hentTekniskPlanForslag(spillerId: string, planId: string): Promise<TekniskPlanForslagRad[]> {
  const rader = await prisma.planAction.findMany({
    where: { userId: spillerId, actionType: TEKNISK_PLAN_FORSLAG_TYPE, status: "PENDING", planId },
    orderBy: { createdAt: "desc" },
    take: 30,
    select: { id: true, coachId: true, suggestion: true, createdAt: true },
  });
  const trenerIder = [...new Set(rader.map((r) => r.coachId).filter((id): id is string => Boolean(id)))];
  const trenere = await prisma.user.findMany({ where: { id: { in: trenerIder } }, select: { id: true, name: true } });
  const navn = new Map(trenere.map((t) => [t.id, t.name ?? "Treneren"]));
  return rader.flatMap((r) => {
    const parsed = TekniskPlanForslagSchema.safeParse(r.suggestion);
    if (!parsed.success) return [];
    return [{ id: r.id, trener: navn.get(r.coachId ?? "") ?? "Treneren", tekst: beskrivTekniskPlanForslag(parsed.data), opprettet: r.createdAt.toISOString() }];
  });
}
