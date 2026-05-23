"use server";

/**
 * Server action for rediger spiller-profil.
 * Validerer input med zod, oppdaterer Prisma, revalidates relevante stier.
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

const Schema = z.object({
  id: z.string().min(1),
  fornavn: z.string().min(1).max(80),
  etternavn: z.string().min(0).max(120),
  fodselsdato: z.string().optional(),
  telefon: z.string().max(40).optional(),
  email: z.string().email(),
  hjemmeklubb: z.string().max(80).optional(),
  skole: z.string().max(80).optional(),
  hcp: z
    .string()
    .optional()
    .transform((v) => (v && v.length > 0 ? Number(v.replace(",", ".")) : null))
    .pipe(z.number().min(-10).max(54).nullable()),
  ambisjon: z.string().max(500).optional(),
  notater: z.string().max(2000).optional(),
});

export async function lagreSpiller(formData: FormData): Promise<void> {
  const actor = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const raw = {
    id: String(formData.get("id") ?? ""),
    fornavn: String(formData.get("fornavn") ?? ""),
    etternavn: String(formData.get("etternavn") ?? ""),
    fodselsdato: formData.get("fodselsdato")?.toString() || undefined,
    telefon: formData.get("telefon")?.toString() || undefined,
    email: String(formData.get("email") ?? ""),
    hjemmeklubb: formData.get("hjemmeklubb")?.toString() || undefined,
    skole: formData.get("skole")?.toString() || undefined,
    hcp: formData.get("hcp")?.toString() || undefined,
    ambisjon: formData.get("ambisjon")?.toString() || undefined,
    notater: formData.get("notater")?.toString() || undefined,
  };

  const parsed = Schema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(
      `Ugyldig input: ${parsed.error.issues.map((i) => i.message).join("; ")}`,
    );
  }

  const data = parsed.data;
  const name = [data.fornavn, data.etternavn].filter((s) => s && s.length > 0).join(" ");
  const dateOfBirth = data.fodselsdato ? new Date(data.fodselsdato) : null;

  try {
    await prisma.user.update({
      where: { id: data.id },
      data: {
        name,
        email: data.email,
        phone: data.telefon ?? null,
        homeClub: data.hjemmeklubb ?? null,
        school: data.skole ?? null,
        hcp: data.hcp ?? null,
        ambition: data.ambisjon ?? null,
        ...(dateOfBirth ? { dateOfBirth } : {}),
      },
    });

    await audit({
      actorId: actor.id,
      action: "PLAYER_UPDATED",
      target: `user:${data.id}`,
      metadata: { name, hcp: data.hcp },
    });

    revalidatePath(`/admin/spillere/${data.id}`);
    revalidatePath(`/admin/spillere/${data.id}/profil`);
    revalidatePath(`/admin/spillere/${data.id}/rediger`);
  } catch (e) {
    if (e instanceof Error && e.message.includes("NEXT_REDIRECT")) throw e;
    throw new Error(e instanceof Error ? e.message : "Ukjent feil");
  }

  redirect(`/admin/spillere/${data.id}`);
}
