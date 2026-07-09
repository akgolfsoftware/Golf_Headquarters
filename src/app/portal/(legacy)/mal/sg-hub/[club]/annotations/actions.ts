"use server";

// Server actions for ShotAnnotation (feature #12).
// Kun rolle COACH (eller ADMIN) med relasjon til spilleren kan skrive.
// Spilleren (data-eier) kan ikke skrive — de leser kun.
//
// Disse handlingene kalles fra ShotAnnotationPopover.tsx (client komponent).
// Når shot-annotasjons-UI senere skal bygges inn i /portal/mal/sg-hub/[club]/page.tsx,
// importeres disse server actions og komponenten direkte.

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { canCoachAccessPlayer } from "@/lib/sg-hub/coach-access";
import type { UserRole } from "@/generated/prisma/client";

const addSchema = z.object({
  trackmanSessionId: z.string().min(1),
  clubId: z.string().min(1),
  shotNumber: z.number().int().positive(),
  body: z.string().min(1).max(2000),
  videoUrl: z.string().url().optional().or(z.literal("")),
});

const editSchema = z.object({
  id: z.string().min(1),
  body: z.string().min(1).max(2000),
  videoUrl: z.string().url().optional().or(z.literal("")),
});

const deleteSchema = z.object({
  id: z.string().min(1),
});

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string };

async function authorizeCoachForSession(
  trackmanSessionId: string,
  coachId: string,
  coachRole: UserRole,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (coachRole !== "COACH" && coachRole !== "ADMIN") {
    return { ok: false, error: "Kun coach kan skrive notater." };
  }
  const session = await prisma.trackManSession.findUnique({
    where: { id: trackmanSessionId },
    select: { userId: true },
  });
  if (!session) {
    return { ok: false, error: "Fant ikke TrackMan-økten." };
  }
  const can = await canCoachAccessPlayer(coachId, session.userId, coachRole);
  if (!can) {
    return { ok: false, error: "Du har ikke tilgang til denne spilleren." };
  }
  return { ok: true };
}

export async function addAnnotation(
  input: z.infer<typeof addSchema>,
): Promise<ActionResult> {
  const parsed = addSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Ugyldig input." };
  }

  const user = await requirePortalUser();
  const role = user.role;

  const auth = await authorizeCoachForSession(
    parsed.data.trackmanSessionId,
    user.id,
    role,
  );
  if (!auth.ok) return auth;

  await prisma.shotAnnotation.create({
    data: {
      trackmanSessionId: parsed.data.trackmanSessionId,
      clubId: parsed.data.clubId,
      shotNumber: parsed.data.shotNumber,
      coachId: user.id,
      body: parsed.data.body,
      videoUrl: parsed.data.videoUrl || null,
    },
  });

  revalidatePath(`/portal/mal/sg-hub/${encodeURIComponent(parsed.data.clubId)}`);
  return { ok: true };
}

export async function editAnnotation(
  input: z.infer<typeof editSchema>,
): Promise<ActionResult> {
  const parsed = editSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Ugyldig input." };
  }

  const user = await requirePortalUser();
  const annotation = await prisma.shotAnnotation.findUnique({
    where: { id: parsed.data.id },
    select: { coachId: true, clubId: true, trackmanSessionId: true },
  });
  if (!annotation) return { ok: false, error: "Fant ikke notatet." };

  // Kun coach som eier notatet (eller ADMIN) kan redigere.
  if (annotation.coachId !== user.id && user.role !== "ADMIN") {
    return { ok: false, error: "Du eier ikke dette notatet." };
  }

  await prisma.shotAnnotation.update({
    where: { id: parsed.data.id },
    data: {
      body: parsed.data.body,
      videoUrl: parsed.data.videoUrl || null,
    },
  });

  revalidatePath(
    `/portal/mal/sg-hub/${encodeURIComponent(annotation.clubId)}`,
  );
  return { ok: true };
}

export async function deleteAnnotation(
  input: z.infer<typeof deleteSchema>,
): Promise<ActionResult> {
  const parsed = deleteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Ugyldig input." };
  }

  const user = await requirePortalUser();
  const annotation = await prisma.shotAnnotation.findUnique({
    where: { id: parsed.data.id },
    select: { coachId: true, clubId: true },
  });
  if (!annotation) return { ok: false, error: "Fant ikke notatet." };

  if (annotation.coachId !== user.id && user.role !== "ADMIN") {
    return { ok: false, error: "Du eier ikke dette notatet." };
  }

  await prisma.shotAnnotation.delete({
    where: { id: parsed.data.id },
  });

  revalidatePath(
    `/portal/mal/sg-hub/${encodeURIComponent(annotation.clubId)}`,
  );
  return { ok: true };
}
