"use server";

// Server actions for LockedAnchor (faste tidsavtaler i ukestrukturen).
// Eksempel: "WANG Toppidrett 08-10 hver mandag".

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PyramidAreaSchema } from "@/lib/portal/training/ak-taxonomy";
import type { LockedAnchor, PyramidArea } from "@/generated/prisma/client";

// ---------------------------------------------------------------------------
// Skjemaer
// ---------------------------------------------------------------------------

const OpprettSchema = z.object({
  studentId: z.string().cuid(),
  navn: z.string().min(1).max(120),
  pyramide: PyramidAreaSchema,
  ukedag: z.number().int().min(1).max(7),
  startTid: z.string().regex(/^\d{2}:\d{2}$/),
  sluttTid: z.string().regex(/^\d{2}:\d{2}$/),
  startDato: z.coerce.date(),
  sluttDato: z.coerce.date(),
  varighetMin: z.number().int().min(1).max(600),
  beskrivelse: z.string().max(1000).optional(),
  fysMuskelgruppe: z.string().nullable().optional(),
  fysTreningstype: z.string().nullable().optional(),
});

const OppdaterSchema = OpprettSchema.partial().omit({ studentId: true });

// ---------------------------------------------------------------------------
// Returtyper
// ---------------------------------------------------------------------------

export type AnkerResultat = { ok: true; anker: LockedAnchor } | { ok: false; feil: string };
export type SlettResultat = { ok: true } | { ok: false; feil: string };

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export async function opprettAnker(input: z.input<typeof OpprettSchema>): Promise<AnkerResultat> {
  const bruker = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const parsed = OpprettSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, feil: parsed.error.issues.map((i) => i.message).join("; ") };
  }
  const data = parsed.data;

  const anker = await prisma.lockedAnchor.create({
    data: {
      studentId: data.studentId,
      navn: data.navn,
      pyramide: data.pyramide as PyramidArea,
      ukedag: data.ukedag,
      startTid: data.startTid,
      sluttTid: data.sluttTid,
      startDato: data.startDato,
      sluttDato: data.sluttDato,
      varighetMin: data.varighetMin,
      beskrivelse: data.beskrivelse ?? null,
      fysMuskelgruppe: data.fysMuskelgruppe ?? null,
      fysTreningstype: data.fysTreningstype ?? null,
    },
  });

  await audit({
    actorId: bruker.id,
    action: "anker.create",
    target: anker.id,
    metadata: { studentId: data.studentId, navn: data.navn, ukedag: data.ukedag },
  });
  revalidatePath("/admin/kalender");
  return { ok: true, anker };
}

export async function oppdaterAnker(
  id: string,
  input: z.input<typeof OppdaterSchema>,
): Promise<AnkerResultat> {
  const bruker = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const parsed = OppdaterSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, feil: parsed.error.issues.map((i) => i.message).join("; ") };
  }
  const data = parsed.data;

  const anker = await prisma.lockedAnchor.update({
    where: { id },
    data: {
      ...(data.navn && { navn: data.navn }),
      ...(data.pyramide && { pyramide: data.pyramide as PyramidArea }),
      ...(data.ukedag !== undefined && { ukedag: data.ukedag }),
      ...(data.startTid && { startTid: data.startTid }),
      ...(data.sluttTid && { sluttTid: data.sluttTid }),
      ...(data.startDato && { startDato: data.startDato }),
      ...(data.sluttDato && { sluttDato: data.sluttDato }),
      ...(data.varighetMin !== undefined && { varighetMin: data.varighetMin }),
      ...(data.beskrivelse !== undefined && { beskrivelse: data.beskrivelse ?? null }),
      ...(data.fysMuskelgruppe !== undefined && { fysMuskelgruppe: data.fysMuskelgruppe ?? null }),
      ...(data.fysTreningstype !== undefined && { fysTreningstype: data.fysTreningstype ?? null }),
    },
  });

  await audit({
    actorId: bruker.id,
    action: "anker.update",
    target: id,
  });
  revalidatePath("/admin/kalender");
  return { ok: true, anker };
}

export async function slettAnker(id: string): Promise<SlettResultat> {
  const bruker = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  try {
    await prisma.lockedAnchor.delete({ where: { id } });
    await audit({
      actorId: bruker.id,
      action: "anker.delete",
      target: id,
    });
    revalidatePath("/admin/kalender");
    return { ok: true };
  } catch (err) {
    console.error("[ankere.slettAnker]", err);
    return { ok: false, feil: "Kunne ikke slette anker" };
  }
}

export async function hentAnkereForSpiller(studentId: string) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  return prisma.lockedAnchor.findMany({
    where: { studentId },
    orderBy: [{ ukedag: "asc" }, { startTid: "asc" }],
  });
}
