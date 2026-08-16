"use server";

/**
 * Lagre profilen (W3) — zod-validert grense foran den delte oppdaterProfil.
 * Fasit: designsystem/paper/fase2/playerhq/playerhq-profil.html
 *
 * HCP lagres bevisst IKKE her (vedtak: lesefelt, eies av forbundet).
 * E-post lagres heller ikke — den eies av Supabase Auth og endres i egen flyt.
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSpillerActionUser } from "@/lib/auth/action-guards";
import { oppdaterProfil } from "@/app/portal/meg/actions";

const LagreProfilSchema = z.object({
  navn: z.string().trim().min(2, "Navn må ha minst 2 tegn").max(120),
  /** ISO-dato (YYYY-MM-DD) eller null (uendret). */
  fodselsdato: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Dato må være på formatet ÅÅÅÅ-MM-DD")
    .nullable(),
  hjemmeklubb: z.string().trim().max(120).nullable(),
  maalTekst: z.string().trim().max(500).nullable(),
  mobil: z.string().trim().max(30).nullable(),
});

export type LagreProfilInput = z.infer<typeof LagreProfilSchema>;

export async function lagreProfil(
  input: LagreProfilInput,
): Promise<{ ok: true } | { ok: false; feil: string }> {
  // Auth-gate på grensen (defense in depth — oppdaterProfil sjekker også selv).
  await requireSpillerActionUser();

  const parsed = LagreProfilSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      feil: parsed.error.issues[0]?.message ?? "Ugyldig inndata",
    };
  }
  const p = parsed.data;

  // Dags-streng → UTC-midnatt (gotcha: aldri serverens lokale midnatt).
  let fodselsdato: Date | null = null;
  if (p.fodselsdato) {
    const [aar, mnd, dag] = p.fodselsdato.split("-").map(Number);
    fodselsdato = new Date(Date.UTC(aar, mnd - 1, dag));
  }

  // oppdaterProfil (delt action) eier auth + skriving: "" → null for
  // tømbare felter, null/undefined → behold eksisterende verdi.
  await oppdaterProfil({
    name: p.navn,
    phone: p.mobil ?? "",
    homeClub: p.hjemmeklubb ?? "",
    ambition: p.maalTekst ?? "",
    dateOfBirth: fodselsdato,
  });

  revalidatePath("/portal/meg/profil");
  return { ok: true };
}
