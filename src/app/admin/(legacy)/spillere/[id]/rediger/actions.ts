"use server";

/**
 * Server action for rediger spiller-profil.
 * Validerer input med zod, oppdaterer Prisma, revalidates relevante stier.
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { requireCoachActionUser } from "@/lib/auth/action-guards";
import { assertCoachTilgangTilSpiller } from "@/lib/auth/coached";
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
  klassetrinn: z.enum(["VG1", "VG2", "VG3", ""]).optional(),
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
    klassetrinn: formData.get("klassetrinn")?.toString() ?? "",
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
  await assertCoachTilgangTilSpiller(actor, data.id);
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
        schoolYear: data.klassetrinn ? data.klassetrinn : null,
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

const ValgtCoachSchema = z.object({
  spillerId: z.string().min(1),
  coachId: z.string().min(1).nullable(),
});

/**
 * Sett spillerens valgte coach (plan G2). Skriver User.primaryCoachId —
 * feltet leses KUN via resolveValgtCoachId (src/lib/domain/valgt-coach.ts).
 * `coachId: null` fjerner valget (resolveren faller da tilbake til
 * enrollment/gruppe/plan-kjeden).
 */
export async function settValgtCoach(
  spillerId: string,
  coachId: string | null,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const actor = await requireCoachActionUser();
    const parsed = ValgtCoachSchema.parse({ spillerId, coachId });
    await assertCoachTilgangTilSpiller(actor, parsed.spillerId);

    if (parsed.coachId) {
      const coach = await prisma.user.findFirst({
        where: { id: parsed.coachId, role: { in: ["COACH", "ADMIN"] }, deletedAt: null },
        select: { id: true },
      });
      if (!coach) {
        return { ok: false, error: "Coachen finnes ikke eller mangler coach-rolle." };
      }
    }

    await prisma.user.update({
      where: { id: parsed.spillerId },
      data: { primaryCoachId: parsed.coachId },
    });

    await audit({
      actorId: actor.id,
      action: "PLAYER_VALGT_COACH",
      target: `user:${parsed.spillerId}`,
      metadata: { coachId: parsed.coachId },
    });

    revalidatePath(`/admin/spillere/${parsed.spillerId}`);
    revalidatePath(`/admin/spillere/${parsed.spillerId}/rediger`);

    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Ukjent feil" };
  }
}

/**
 * GDPR soft-delete av spiller (P20). KUN admin kan slette.
 * Setter User.deletedAt = now() — spilleren forsvinner fra stallen (alt
 * filtreres på deletedAt: null) men dataene beholdes og er reversible.
 * IKKE hard delete, IKKE kaskade.
 */
export async function slettSpiller(
  userId: string,
): Promise<{ ok: boolean; error?: string }> {
  const actor = await requirePortalUser({ allow: ["ADMIN"] });

  if (!userId) return { ok: false, error: "Mangler spiller-id" };

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });

    await audit({
      actorId: actor.id,
      action: "PLAYER_DELETED",
      target: `user:${userId}`,
    });

    revalidatePath("/admin/spillere");
    revalidatePath(`/admin/spillere/${userId}`);
    revalidatePath(`/admin/spillere/${userId}/rediger`);

    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Ukjent feil" };
  }
}
