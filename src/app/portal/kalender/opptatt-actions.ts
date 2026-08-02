/**
 * Server actions for spillerens egen opptatte tid (PlayerBusyBlock).
 *
 * Sikkerhet: userId tas ALDRI fra klienten. Alle spørringer scopes til den
 * innloggede brukeren via requirePortalUser — en spillers personlige avtaler
 * er hans egne, og skal ikke kunne opprettes eller endres av andre. Coachen
 * ser tiden gjennom tilgjengelighet.ts, ikke gjennom disse actionene.
 */

"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

const KIND = ["SKOLE", "JOBB", "AVTALE", "REISE", "ANNET"] as const;

const opptattSchema = z
  .object({
    title: z.string().trim().min(1, "Tittel mangler").max(120),
    startAt: z.coerce.date(),
    endAt: z.coerce.date(),
    kind: z.enum(KIND).default("AVTALE"),
    recurring: z.enum(["WEEKLY", "NONE"]).default("NONE"),
    isPrivate: z.boolean().default(false),
    note: z.string().trim().max(500).nullish(),
  })
  .refine((v) => v.endAt > v.startAt, {
    message: "Slutt må være etter start",
    path: ["endAt"],
  });

export type OpptattInput = z.input<typeof opptattSchema>;

export type ActionResultat =
  | { ok: true; id: string }
  | { ok: false; feil: string };

export async function leggTilOpptattTid(
  input: OpptattInput,
): Promise<ActionResultat> {
  const user = await requirePortalUser();
  const parsed = opptattSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, feil: parsed.error.issues[0]?.message ?? "Ugyldig input" };
  }

  const rad = await prisma.playerBusyBlock.create({
    data: { ...parsed.data, note: parsed.data.note ?? null, userId: user.id },
    select: { id: true },
  });

  revalidatePath("/portal/kalender");
  return { ok: true, id: rad.id };
}

export async function endreOpptattTid(
  id: string,
  input: OpptattInput,
): Promise<ActionResultat> {
  const user = await requirePortalUser();
  const parsed = opptattSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, feil: parsed.error.issues[0]?.message ?? "Ugyldig input" };
  }

  // updateMany med userId i where: treffer 0 rader hvis blokken tilhører noen
  // andre, i stedet for å oppdatere den. Ingen lekkasje av om id-en finnes.
  const res = await prisma.playerBusyBlock.updateMany({
    where: { id, userId: user.id },
    data: { ...parsed.data, note: parsed.data.note ?? null },
  });
  if (res.count === 0) return { ok: false, feil: "Fant ikke avtalen" };

  revalidatePath("/portal/kalender");
  return { ok: true, id };
}

export async function slettOpptattTid(id: string): Promise<ActionResultat> {
  const user = await requirePortalUser();

  const res = await prisma.playerBusyBlock.deleteMany({
    where: { id, userId: user.id },
  });
  if (res.count === 0) return { ok: false, feil: "Fant ikke avtalen" };

  revalidatePath("/portal/kalender");
  return { ok: true, id };
}

export type OpptattRad = {
  id: string;
  title: string;
  startAt: Date;
  endAt: Date;
  kind: string;
  recurring: string | null;
  isPrivate: boolean;
  note: string | null;
};

/** Spillerens egne avtaler i et tidsrom — kun egne rader. */
export async function hentEgenOpptattTid(
  fra: Date,
  til: Date,
): Promise<OpptattRad[]> {
  const user = await requirePortalUser();
  return prisma.playerBusyBlock.findMany({
    where: { userId: user.id, startAt: { lte: til }, endAt: { gte: fra } },
    orderBy: { startAt: "asc" },
    select: {
      id: true,
      title: true,
      startAt: true,
      endAt: true,
      kind: true,
      recurring: true,
      isPrivate: true,
      note: true,
    },
  });
}
