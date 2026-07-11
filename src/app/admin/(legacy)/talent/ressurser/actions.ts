"use server";

/**
 * Server actions for /admin/talent/ressurser.
 * Krever ADMIN-rolle for å legge til/slette ressurser. COACH kan lese.
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

const KATEGORIER = ["video", "artikkel", "podcast"] as const;
const NIVAER = ["U10", "U12", "U14", "U16", "U18", "Senior"] as const;
const FOKUS = ["teknikk", "mental", "taktikk", "fysisk", "motivasjon"] as const;

const RessursSchema = z.object({
  tittel: z.string().min(2).max(200),
  kategori: z.enum(KATEGORIER),
  url: z.string().url(),
  niva: z.enum(NIVAER).optional(),
  fokus: z.enum(FOKUS).optional(),
  beskrivelse: z.string().max(1000).optional(),
});

export async function leggTilRessurs(formData: FormData) {
  await requirePortalUser({ allow: ["ADMIN"] });

  const parsed = RessursSchema.safeParse({
    tittel: formData.get("tittel"),
    kategori: formData.get("kategori"),
    url: formData.get("url"),
    niva: formData.get("niva") || undefined,
    fokus: formData.get("fokus") || undefined,
    beskrivelse: formData.get("beskrivelse") || undefined,
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
  }

  await prisma.talentRessurs.create({
    data: parsed.data,
  });

  revalidatePath("/admin/talent/ressurser");
}
