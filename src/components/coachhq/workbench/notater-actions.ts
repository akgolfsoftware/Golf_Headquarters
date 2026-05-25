"use server";

/**
 * Server actions for CoachNote CRUD.
 *
 * Brukes fra Coach Workbench (NotaterPanel) for å opprette, oppdatere, slette
 * og hente coach-notater knyttet til en spiller. Kun forfatter (coachId) kan
 * redigere/slette egne notater.
 */

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

// ─── Schemas ─────────────────────────────────────────────────────────────────

const opprettNotatSchema = z.object({
  playerId: z.string().min(1),
  title: z.string().max(200).optional(),
  content: z.string().min(2).max(5000),
  tags: z.array(z.string().min(1).max(40)).max(20).default([]),
  isPrivate: z.boolean().default(true),
});

const oppdaterNotatSchema = opprettNotatSchema.partial().extend({
  id: z.string().min(1),
});

export type OpprettNotatInput = z.infer<typeof opprettNotatSchema>;
export type OppdaterNotatInput = z.infer<typeof oppdaterNotatSchema>;

// ─── Actions ─────────────────────────────────────────────────────────────────

export async function opprettCoachNotat(input: OpprettNotatInput) {
  const coach = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const parsed = opprettNotatSchema.parse(input);

  const notat = await prisma.coachNote.create({
    data: {
      coachId: coach.id,
      playerId: parsed.playerId,
      title: parsed.title,
      content: parsed.content,
      tags: parsed.tags,
      isPrivate: parsed.isPrivate,
    },
  });

  revalidatePath("/admin/coach-workbench");
  return { ok: true as const, id: notat.id };
}

export async function oppdaterCoachNotat(input: OppdaterNotatInput) {
  const coach = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id, ...data } = oppdaterNotatSchema.parse(input);

  // Authz: kun forfatter (coachId) kan redigere
  const eksisterende = await prisma.coachNote.findUnique({
    where: { id },
    select: { coachId: true },
  });
  if (!eksisterende || eksisterende.coachId !== coach.id) {
    throw new Error("Ikke tillatt");
  }

  await prisma.coachNote.update({
    where: { id },
    data,
  });

  revalidatePath("/admin/coach-workbench");
  return { ok: true as const };
}

export async function slettCoachNotat(id: string) {
  const coach = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const eksisterende = await prisma.coachNote.findUnique({
    where: { id },
    select: { coachId: true },
  });
  if (!eksisterende || eksisterende.coachId !== coach.id) {
    throw new Error("Ikke tillatt");
  }

  await prisma.coachNote.delete({ where: { id } });
  revalidatePath("/admin/coach-workbench");
  return { ok: true as const };
}

export async function hentCoachNotater(playerId: string) {
  const coach = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  return prisma.coachNote.findMany({
    where: { coachId: coach.id, playerId },
    orderBy: { createdAt: "desc" },
  });
}
