"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import type { Prisma } from "@/generated/prisma/client";
import { nonEmpty, email, phone, optStr } from "@/lib/validation/schemas";

const LeggTilSpillerSchema = z.object({
  navn: nonEmpty(200),
  epost: email,
  alder: z.number().int().min(5, "Alder må være minst 5").max(120, "Alder må være maks 120").nullable().optional(),
  klubb: optStr(200),
  gruppe: optStr(200),
});

const OppdaterSpillerSchema = z.object({
  userId: z.string().min(1, "Bruker-ID er påkrevd"),
  navn: nonEmpty(200),
  epost: email,
  phone: phone.optional().or(z.literal("")),
  klubb: optStr(200),
  ambition: optStr(1000),
});

async function krevCoach() {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");
  if (user.role !== "COACH" && user.role !== "ADMIN") throw new Error("forbidden");
  return user;
}

export type LeggTilSpillerResult = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  userId?: string;
}

export async function leggTilSpiller(
  formData: FormData,
): Promise<LeggTilSpillerResult> {
  const me = await krevCoach();

  const navn = String(formData.get("navn") ?? "").trim();
  const epost = String(formData.get("epost") ?? "").trim().toLowerCase();
  const alderRaw = String(formData.get("alder") ?? "").trim();
  const klubb = String(formData.get("klubb") ?? "").trim();
  const gruppe = String(formData.get("gruppe") ?? "").trim();

  const alder = alderRaw === "" ? null : Number(alderRaw);
  if (alderRaw !== "" && Number.isNaN(alder)) {
    return { ok: false, error: "Alder må være et tall" };
  }

  const zodResult = LeggTilSpillerSchema.safeParse({
    navn,
    epost,
    alder,
    klubb: klubb || null,
    gruppe: gruppe || null,
  });
  if (!zodResult.success) {
    const fieldErrors: Record<string, string> = {};
    for (const err of zodResult.error.issues) {
      const field = err.path[0];
      if (field) fieldErrors[String(field)] = err.message;
    }
    return { ok: false, fieldErrors };
  }

  // Sjekk duplikat på e-post
  const eksisterende = await prisma.user.findUnique({ where: { email: epost } });
  if (eksisterende) {
    return {
      ok: false,
      fieldErrors: { epost: "E-posten kan ikke brukes. Prøv en annen eller kontakt support." },
    };
  }

  // Placeholder authId — coach oppretter spiller før Supabase-invitasjon.
  // Spilleren får ekte authId når hen logger inn første gang.
  // Vi prefikser med "pending:" for å gjøre det enkelt å finne dem senere.
  const placeholderAuthId = `pending:${crypto.randomUUID()}`;

  const ny = await prisma.user.create({
    data: {
      authId: placeholderAuthId,
      email: epost,
      name: navn,
      role: "PLAYER",
      homeClub: klubb || null,
      // Alder lagres ikke direkte — vi har playingYears som proxy hvis det
      // ønskes. Holder det enkelt og lagrer i preferences for nå.
      preferences: alder !== null ? { alder } : undefined,
    },
  });

  // Hvis gruppe er angitt og finnes, legg til medlemskap.
  if (gruppe) {
    const gruppeMatch = await prisma.group.findFirst({
      where: { name: { equals: gruppe, mode: "insensitive" } },
    });
    if (gruppeMatch) {
      await prisma.groupMember.create({
        data: { groupId: gruppeMatch.id, userId: ny.id, role: "PLAYER" },
      });
    }
  }

  await audit({
    actorId: me.id,
    action: "user.created",
    target: `User:${ny.id}`,
    metadata: { role: "PLAYER", email: epost },
  });

  revalidatePath("/admin/spillere");
  return { ok: true, userId: ny.id };
}

export type OppdaterSpillerResult = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function oppdaterSpiller(
  userId: string,
  formData: FormData,
): Promise<OppdaterSpillerResult> {
  const me = await krevCoach();

  const navn = String(formData.get("navn") ?? "").trim();
  const epost = String(formData.get("epost") ?? "").trim().toLowerCase();
  const phoneFelt = String(formData.get("phone") ?? "").trim();
  const klubb = String(formData.get("klubb") ?? "").trim();
  const hcpRaw = String(formData.get("hcp") ?? "").trim();
  const ambition = String(formData.get("ambition") ?? "").trim();
  const alderRaw = String(formData.get("alder") ?? "").trim();

  const alder = alderRaw === "" ? null : Number(alderRaw);
  if (alderRaw !== "" && Number.isNaN(alder)) {
    return { ok: false, error: "Alder må være et tall" };
  }

  const hcp = hcpRaw === "" ? null : Number(hcpRaw.replace(",", "."));
  if (hcpRaw !== "" && Number.isNaN(hcp)) {
    return { ok: false, error: "Handicap må være et tall" };
  }

  const zodResult = OppdaterSpillerSchema.safeParse({
    userId,
    navn,
    epost,
    phone: phoneFelt || undefined,
    klubb: klubb || null,
    ambition: ambition || null,
  });
  if (!zodResult.success) {
    const fieldErrors: Record<string, string> = {};
    for (const err of zodResult.error.issues) {
      const field = err.path[0];
      if (field) fieldErrors[String(field)] = err.message;
    }
    return { ok: false, fieldErrors };
  }

  const eksisterende = await prisma.user.findFirst({
    where: { email: epost, NOT: { id: userId } },
  });
  if (eksisterende) {
    return {
      ok: false,
      fieldErrors: { epost: "E-posten kan ikke brukes. Prøv en annen eller kontakt support." },
    };
  }

  const eksisterendeBruker = await prisma.user.findUnique({
    where: { id: userId },
    select: { preferences: true },
  });
  const existingPrefs =
    eksisterendeBruker?.preferences &&
    typeof eksisterendeBruker.preferences === "object" &&
    !Array.isArray(eksisterendeBruker.preferences)
      ? (eksisterendeBruker.preferences as Record<string, unknown>)
      : {};
  const nyPrefs: Record<string, unknown> = { ...existingPrefs };
  if (alder !== null) nyPrefs.alder = alder;
  else delete nyPrefs.alder;

  await prisma.user.update({
    where: { id: userId },
    data: {
      name: navn,
      email: epost,
      phone: phoneFelt || null,
      homeClub: klubb || null,
      hcp,
      ambition: ambition || null,
      preferences:
        Object.keys(nyPrefs).length > 0
          ? (nyPrefs as Prisma.InputJsonValue)
          : undefined,
    },
  });

  await audit({
    actorId: me.id,
    action: "user.updated",
    target: `User:${userId}`,
    metadata: { email: epost },
  });

  revalidatePath(`/admin/elever/${userId}`);
  revalidatePath("/admin/spillere");
  return { ok: true };
}
