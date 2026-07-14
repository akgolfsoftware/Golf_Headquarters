"use server";

/**
 * I3 (Bølge 1) — opprett/slett kalenderhendelse (ferie, stengt anlegg,
 * møte). En hendelse blokkerer booking i sitt tidsrom — se
 * src/lib/booking/availability.ts for konflikt-sjekken.
 *
 * COACH kan kun slette egne hendelser. ADMIN kan slette alle.
 */

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { nonEmpty } from "@/lib/validation/schemas";

const OpprettHendelseSchema = z
  .object({
    title: nonEmpty(200),
    startAt: z.coerce.date(),
    endAt: z.coerce.date(),
    notes: z.string().max(2000).optional(),
  })
  .refine((v) => v.endAt > v.startAt, {
    message: "Slutt må være etter start",
    path: ["endAt"],
  });

export type OpprettHendelseInput = {
  title: string;
  startAt: Date;
  endAt: Date;
  notes?: string;
};

export async function opprettHendelse(input: OpprettHendelseInput) {
  const parsed = OpprettHendelseSchema.parse(input);
  const coach = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  await prisma.calendarEvent.create({
    data: {
      coachId: coach.id,
      title: parsed.title.trim(),
      startAt: parsed.startAt,
      endAt: parsed.endAt,
      notes: parsed.notes?.trim() || null,
    },
  });

  revalidatePath("/admin/kalender");
  redirect("/admin/kalender");
}

export async function slettHendelse(id: string) {
  const coach = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  const hendelse = await prisma.calendarEvent.findUnique({
    where: { id },
    select: { coachId: true },
  });
  if (!hendelse) throw new Error("Hendelsen finnes ikke");
  if (coach.role !== "ADMIN" && hendelse.coachId !== coach.id) {
    throw new Error("Du har ikke tilgang til å slette denne hendelsen");
  }

  await prisma.calendarEvent.delete({ where: { id } });

  revalidatePath("/admin/kalender");
  redirect("/admin/kalender");
}
