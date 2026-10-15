"use server";

/**
 * PH-13 Øvelsesbank: «Ny egen øvelse» (utkast-playerhq/ovelser.html).
 * Spilleren lager en øvelse med akse, treningsområde og navn. Øvelsen er privat
 * (bare spilleren og coachen ser den). Resten av de åtte trinnene fylles i Workbench.
 * Tilgang: innlogget spiller, og øvelsen eies alltid av den innloggede.
 */
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { logError } from "@/lib/error-tracking";
import { erOmraadeKode } from "@/lib/domain/ak-formel-v2";
import { OV_AKSER, OV_AKSE_KODE, omraadeHorerTil, skillAreaFor } from "@/lib/portal-drills/ovelser-visning";

const NyOvelseSchema = z.object({
  akse: z.enum(OV_AKSER as unknown as [string, ...string[]]),
  omraade: z.string().max(40),
  navn: z.string().trim().min(2, "Skriv et navn på øvelsen.").max(120, "Navnet er for langt."),
});

export async function opprettEgenOvelse(
  input: { akse: string; omraade: string; navn: string },
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const user = await requirePortalUser({ allow: ["PLAYER"] });
  const p = NyOvelseSchema.safeParse(input);
  if (!p.success) return { ok: false, error: p.error.issues[0]?.message ?? "Ugyldige felt." };
  const akse = p.data.akse as (typeof OV_AKSER)[number];
  const kode = p.data.omraade;
  if (!erOmraadeKode(kode) || !omraadeHorerTil(akse, kode)) return { ok: false, error: "Velg et treningsområde som hører til aksen." };
  try {
    const rad = await prisma.exerciseDefinition.create({
      data: {
        name: p.data.navn,
        pyramidArea: OV_AKSE_KODE[akse] as "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN",
        omraadeKode: kode,
        skillArea: skillAreaFor(kode),
        source: "PLAYER",
        visibility: "PRIVATE",
        createdBy: user.id,
      },
      select: { id: true },
    });
    revalidatePath("/portal/drills");
    return { ok: true, id: rad.id };
  } catch (error) {
    await logError({ context: "drills.opprettEgenOvelse", error, meta: { userId: user.id } });
    return { ok: false, error: "Øvelsen ble ikke lagret. Prøv igjen." };
  }
}
