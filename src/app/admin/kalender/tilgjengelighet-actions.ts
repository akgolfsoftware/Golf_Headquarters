"use server";

/**
 * Bookingplanen steg 3 (natt 17.10): tilgjengelighet i AgencyOS, fanen
 * «Tilgjengelighet» i AG-05. Coachen oppretter, endrer og sletter vinduer, setter
 * en hel uke på én gang og legger inn fridager, uten å forlate AgencyOS.
 *
 * - Vinduer går gjennom de uendrede `addSlot`/`updateSlot`/`deleteSlot`
 *   (eierskap og «aldri to steder samtidig» der).
 * - En fridag er en heldags `CalendarEvent` for coachen med tittel «Fridag»
 *   (src/lib/booking/fridag.ts). Lukeberegningen fjerner tid som overlapper en
 *   hendelse for coachen, så fridagen tar bort all tid den dagen.
 * - Bufferen lagres på coachen (`users.bookingBufferMin`) og gjelder i tillegg
 *   til tjenestens buffer; den største vinner (src/lib/booking/availability.ts).
 */

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireCoachActionUser } from "@/lib/auth/action-guards";
import { prisma } from "@/lib/prisma";
import { FRIDAG_TITTEL } from "@/lib/booking/fridag";
import { addSlot, deleteSlot, updateSlot, type SlotInput } from "@/app/admin/(legacy)/availability/actions";

export type TilgResultat = { ok: true } | { ok: false; feil: string };

function revalider() {
  revalidatePath("/admin/bookinger");
  revalidatePath("/admin/kalender");
}

function melding(e: unknown, standard: string): string {
  if (!(e instanceof Error)) return standard;
  if (e.message === "forbidden" || e.message === "not-found") return "Fant ikke tidsvinduet.";
  return e.message;
}

const Klokke = z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/);
const IsoDato = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const VinduSchema = z.object({
  id: z.string().min(1).optional(),
  weekday: z.number().int().min(0).max(6).nullable(),
  date: IsoDato.nullable(),
  startTime: Klokke,
  endTime: Klokke,
  locationId: z.string().min(1).nullable(),
  validFrom: IsoDato.nullable(),
  validTo: IsoDato.nullable(),
  recurrenceInterval: z.number().int().min(1).max(4).nullable(),
  active: z.boolean(),
});

export type VinduInput = z.infer<typeof VinduSchema>;

/** Opprett (uten id) eller endre (med id) ett vindu. */
export async function lagreVindu(input: VinduInput): Promise<TilgResultat> {
  await requireCoachActionUser();
  const p = VinduSchema.safeParse(input);
  if (!p.success) return { ok: false, feil: "Kontroller dag, tid og periode." };
  const { id, ...rest } = p.data;
  const slot: SlotInput = rest;
  try {
    if (id) await updateSlot(id, slot);
    else await addSlot(slot);
  } catch (e) {
    return { ok: false, feil: melding(e, "Vinduet kunne ikke lagres.") };
  }
  revalider();
  return { ok: true };
}

export async function slettVindu(id: string): Promise<TilgResultat> {
  await requireCoachActionUser();
  try {
    await deleteSlot(id);
  } catch (e) {
    return { ok: false, feil: melding(e, "Vinduet kunne ikke slettes.") };
  }
  revalider();
  return { ok: true };
}

const UkeSchema = z.object({
  dager: z.array(z.number().int().min(0).max(6)).min(1).max(7),
  startTime: Klokke,
  endTime: Klokke,
  locationId: z.string().min(1).nullable(),
});

/**
 * Sett en hel uke på én gang: samme tid på hver valgt ukedag. Dager som alt har
 * nøyaktig dette vinduet (samme tid og sted, uten periode), hoppes over, så
 * knappen kan trykkes to ganger uten å lage dubletter.
 */
export async function settHelUke(input: z.infer<typeof UkeSchema>): Promise<TilgResultat & { opprettet?: number }> {
  const user = await requireCoachActionUser();
  const p = UkeSchema.safeParse(input);
  if (!p.success) return { ok: false, feil: "Velg minst én dag og en gyldig tid." };
  const { dager, startTime, endTime, locationId } = p.data;
  if (startTime >= endTime) return { ok: false, feil: "Sluttid må være etter starttid." };

  const finnes = await prisma.coachAvailability.findMany({
    where: { coachId: user.id, weekday: { in: dager }, date: null, startTime, endTime, locationId, validFrom: null, validTo: null },
    select: { weekday: true },
  });
  const har = new Set(finnes.map((f) => f.weekday));
  let opprettet = 0;
  try {
    for (const weekday of [...new Set(dager)].sort()) {
      if (har.has(weekday)) continue;
      await addSlot({ weekday, date: null, startTime, endTime, active: true, locationId, validFrom: null, validTo: null, recurrenceInterval: null });
      opprettet += 1;
    }
  } catch (e) {
    revalider();
    return { ok: false, feil: melding(e, "Uka kunne ikke lagres.") };
  }
  revalider();
  return { ok: true, opprettet };
}

const FridagSchema = z.object({ dato: IsoDato, grunn: z.string().trim().max(120).optional() });

/** Fridag: heldags hendelse for coachen. Lagret tid er naiv Oslo-veggklokke (policy.ts). */
export async function leggTilFridag(input: { dato: string; grunn?: string }): Promise<TilgResultat> {
  const user = await requireCoachActionUser();
  const p = FridagSchema.safeParse(input);
  if (!p.success) return { ok: false, feil: "Velg en dato." };
  const [y, m, d] = p.data.dato.split("-").map(Number);
  const startAt = new Date(Date.UTC(y, m - 1, d));
  if (startAt.toISOString().slice(0, 10) !== p.data.dato) return { ok: false, feil: "Ugyldig dato." };
  const endAt = new Date(Date.UTC(y, m - 1, d + 1));

  const finnes = await prisma.calendarEvent.findFirst({
    where: { coachId: user.id, title: { startsWith: FRIDAG_TITTEL }, startAt, endAt },
    select: { id: true },
  });
  if (finnes) return { ok: false, feil: "Datoen er allerede fridag." };

  await prisma.calendarEvent.create({
    data: {
      coachId: user.id,
      title: p.data.grunn ? `${FRIDAG_TITTEL} · ${p.data.grunn}` : FRIDAG_TITTEL,
      startAt,
      endAt,
    },
  });
  revalider();
  return { ok: true };
}

export async function slettFridag(id: string): Promise<TilgResultat> {
  const user = await requireCoachActionUser();
  const res = await prisma.calendarEvent.deleteMany({
    where: { id, coachId: user.id, title: { startsWith: FRIDAG_TITTEL } },
  });
  if (res.count === 0) return { ok: false, feil: "Fant ikke fridagen." };
  revalider();
  return { ok: true };
}

/** Coachens buffer mellom to timer, 0–120 minutter. */
export async function settBuffer(minutter: number): Promise<TilgResultat> {
  const user = await requireCoachActionUser();
  if (!Number.isInteger(minutter) || minutter < 0 || minutter > 120) return { ok: false, feil: "Bufferen må være mellom 0 og 120 minutter." };
  await prisma.user.update({ where: { id: user.id }, data: { bookingBufferMin: minutter } });
  revalider();
  return { ok: true };
}
