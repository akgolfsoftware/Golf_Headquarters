"use server";

/**
 * AG-05 Flytt økt (pakke 3, natt 17.10): coachen flytter en Workbench-økt fra
 * kalenderen. Flyttingen lagres med en gang gjennom `moveSession` (samme tilgang
 * som i Workbench), men spilleren varsles først etter 10 sekunder, så «Angre»
 * kan flytte tilbake uten at noe er sendt (beslutninger.md §SKJERMENE … RUNDE 8,
 * Kalender: «Flytting av økt varsler spillerne automatisk, med angre i 10 sekunder»).
 *
 * Klienten kaller `varsleOktFlyttet` når angrefristen er ute, eller med en gang
 * hvis siden lukkes. Bookinger flyttes ikke her: der foreslår coachen ny tid, og
 * spilleren godtar (§COACH SOM AVLYSER, 15.10).
 */

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireCoachActionUser } from "@/lib/auth/action-guards";
import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notifications";
import { moveSession } from "@/lib/workbench/wb-actions";
import { fraDatoKolonne } from "@/lib/workbench/wb-map";

export type FlyttOktResultat =
  | { ok: true; fra: { dato: string; tid: string } }
  | { ok: false; feil: string };

const Input = z.object({
  oktId: z.string().min(1),
  dato: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  tid: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
});

const hhmm = (min: number) => `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

export async function flyttOktFraKalender(input: { oktId: string; dato: string; tid: string }): Promise<FlyttOktResultat> {
  await requireCoachActionUser();
  const p = Input.safeParse(input);
  if (!p.success) return { ok: false, feil: "Velg dato og klokkeslett." };

  const for_ = await prisma.workbenchSession.findUnique({ where: { id: p.data.oktId }, select: { date: true, startMinute: true } });
  if (!for_) return { ok: false, feil: "Fant ikke økta." };

  const [hh, mm] = p.data.tid.split(":").map(Number);
  const res = await moveSession({ sessionId: p.data.oktId, newDate: p.data.dato, newStartMinute: hh * 60 + mm });
  if (!res.ok) return { ok: false, feil: res.error };

  revalidatePath("/admin/kalender");
  return { ok: true, fra: { dato: fraDatoKolonne(for_.date), tid: hhmm(for_.startMinute) } };
}

/** Varsler spilleren om ny tid. Kalles når angrefristen på 10 sekunder er ute. */
export async function varsleOktFlyttet(oktId: string): Promise<{ ok: boolean }> {
  const user = await requireCoachActionUser();
  const okt = await prisma.workbenchSession.findUnique({
    where: { id: oktId },
    select: { id: true, playerId: true, title: true, date: true, startMinute: true },
  });
  if (!okt) return { ok: false };
  const tilgang = await prisma.user.count({ where: { AND: [{ id: okt.playerId }, coachScopedPlayerWhere(user)] } });
  if (tilgang === 0 || okt.playerId === user.id) return { ok: false };

  const dato = new Intl.DateTimeFormat("nb-NO", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(okt.date);
  await notify({
    userId: okt.playerId,
    type: "plan",
    title: "Økta er flyttet",
    body: `${okt.title}: ${dato} kl. ${hhmm(okt.startMinute)}.`,
    link: "/portal/planlegge/workbench",
  });
  return { ok: true };
}
