"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import type { Prisma } from "@/generated/prisma/client";

async function krevCoach() {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");
  if (user.role !== "COACH" && user.role !== "ADMIN") throw new Error("forbidden");
  return user;
}

export type OppdaterCoachProfilResult = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

function parseChips(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export async function oppdaterCoachProfil(
  formData: FormData,
): Promise<OppdaterCoachProfilResult> {
  const me = await krevCoach();

  const navn = String(formData.get("navn") ?? "").trim();
  const epost = String(formData.get("epost") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const homeClub = String(formData.get("homeClub") ?? "").trim();
  const hcpRaw = String(formData.get("hcp") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const certificationsRaw = String(formData.get("certifications") ?? "");
  const languagesRaw = String(formData.get("languages") ?? "");
  const clubsRaw = String(formData.get("clubs") ?? "");

  const fieldErrors: Record<string, string> = {};
  if (navn.length < 2) fieldErrors.navn = "Navn må være minst 2 tegn";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(epost))
    fieldErrors.epost = "Ugyldig e-postadresse";
  if (bio.length > 280) fieldErrors.bio = "Maks 280 tegn";

  const hcp = hcpRaw === "" ? null : Number(hcpRaw.replace(",", "."));
  if (hcpRaw !== "" && Number.isNaN(hcp)) {
    fieldErrors.hcp = "Handicap må være et tall";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

  const annenMedEpost = await prisma.user.findFirst({
    where: { email: epost, NOT: { id: me.id } },
  });
  if (annenMedEpost) {
    return {
      ok: false,
      fieldErrors: { epost: "En annen bruker har allerede denne e-posten" },
    };
  }

  const eksisterende = await prisma.user.findUnique({
    where: { id: me.id },
    select: { preferences: true },
  });
  const existingPrefs =
    eksisterende?.preferences &&
    typeof eksisterende.preferences === "object" &&
    !Array.isArray(eksisterende.preferences)
      ? (eksisterende.preferences as Record<string, unknown>)
      : {};

  const nyPrefs: Record<string, unknown> = {
    ...existingPrefs,
    certifications: parseChips(certificationsRaw),
    languages: parseChips(languagesRaw),
    clubs: parseChips(clubsRaw),
  };

  await prisma.user.update({
    where: { id: me.id },
    data: {
      name: navn,
      email: epost,
      phone: phone || null,
      homeClub: homeClub || null,
      hcp,
      ambition: bio || null,
      preferences: nyPrefs as Prisma.InputJsonValue,
    },
  });

  await audit({
    actorId: me.id,
    action: "coach.profile.updated",
    target: `User:${me.id}`,
    metadata: { email: epost },
  });

  revalidatePath("/admin/profile");
  return { ok: true };
}
