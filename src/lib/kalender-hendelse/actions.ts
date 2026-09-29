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
import {
  pushKalenderHendelse,
  fjernKalenderHendelse,
} from "@/lib/google-calendar-kilder";

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
  /**
   * «YYYY-MM-DDTHH:mm» tolkes på serveren som naiv Oslo-veggklokke, samme
   * konvensjon som bookinger og availability.ts (Precision-skjemaet sender
   * streng). Et Date-objekt fra nettleseren godtas fortsatt.
   */
  startAt: Date | string;
  endAt: Date | string;
  notes?: string;
};

export async function opprettHendelse(input: OpprettHendelseInput) {
  const parsed = OpprettHendelseSchema.parse(input);
  const coach = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  const hendelse = await prisma.calendarEvent.create({
    data: {
      coachId: coach.id,
      title: parsed.title.trim(),
      startAt: parsed.startAt,
      endAt: parsed.endAt,
      notes: parsed.notes?.trim() || null,
    },
  });

  // Steg 3: ferie/stengt/møte skal også synes i Google-kalenderen, ikke bare
  // blokkere booking internt. Best-effort — hendelsen er allerede lagret.
  await pushKalenderHendelse(hendelse.id);

  revalidatePath("/admin/kalender");
  redirect("/admin/kalender");
}

/**
 * Endre en kalenderhendelse (Precision, 29.09.2026). Samme tilgangsregel som
 * sletting: COACH bare egne, ADMIN alle. Google-hendelsen oppdateres etterpå
 * (pushKalenderHendelse bruker den lagrede koblingen, best-effort).
 */
export async function oppdaterHendelse(id: string, input: OpprettHendelseInput) {
  const coach = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const parsed = OpprettHendelseSchema.parse(input);

  const hendelse = await prisma.calendarEvent.findUnique({
    where: { id },
    select: { coachId: true },
  });
  if (!hendelse) throw new Error("Hendelsen finnes ikke");
  if (coach.role !== "ADMIN" && hendelse.coachId !== coach.id) {
    throw new Error("Du har ikke tilgang til å endre denne hendelsen");
  }

  await prisma.calendarEvent.update({
    where: { id },
    data: {
      title: parsed.title.trim(),
      startAt: parsed.startAt,
      endAt: parsed.endAt,
      notes: parsed.notes?.trim() || null,
    },
  });

  await pushKalenderHendelse(id);

  revalidatePath("/admin/kalender");
  revalidatePath(`/admin/kalender/hendelse/${id}`);
  redirect(`/admin/kalender/hendelse/${id}`);
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

  // Fjern fra Google FØR lokal sletting — etterpå er coachId borte.
  await fjernKalenderHendelse(id, hendelse.coachId);

  await prisma.calendarEvent.delete({ where: { id } });

  revalidatePath("/admin/kalender");
  redirect("/admin/kalender");
}
