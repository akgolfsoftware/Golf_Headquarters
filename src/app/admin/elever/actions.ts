"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

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
};

// Lett, schema-fri validering. Vi har ikke zod i prosjektet — håndhever
// regler manuelt. Returnerer feltvise feilmeldinger ved behov.
function validate(input: {
  navn: string;
  epost: string;
  alder: number | null;
  klubb: string | null;
  gruppe: string | null;
}): { ok: true } | { ok: false; fieldErrors: Record<string, string> } {
  const fieldErrors: Record<string, string> = {};
  if (input.navn.trim().length < 2) {
    fieldErrors.navn = "Navn må være minst 2 tegn";
  }
  // Enkel e-post-validering: må inneholde @ og .
  const epost = input.epost.trim();
  if (!epost || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(epost)) {
    fieldErrors.epost = "Ugyldig e-postadresse";
  }
  if (input.alder !== null && (input.alder < 5 || input.alder > 120)) {
    fieldErrors.alder = "Alder må være mellom 5 og 120";
  }
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }
  return { ok: true };
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

  const v = validate({
    navn,
    epost,
    alder,
    klubb: klubb || null,
    gruppe: gruppe || null,
  });
  if (!v.ok) {
    return { ok: false, fieldErrors: v.fieldErrors };
  }

  // Sjekk duplikat på e-post
  const eksisterende = await prisma.user.findUnique({ where: { email: epost } });
  if (eksisterende) {
    return {
      ok: false,
      fieldErrors: { epost: "En bruker med denne e-posten finnes allerede" },
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

  revalidatePath("/admin/elever");
  return { ok: true, userId: ny.id };
}
