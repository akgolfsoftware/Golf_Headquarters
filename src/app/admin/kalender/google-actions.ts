"use server";

/**
 * Steg 4 (2026-07-27): opprett, endre og slett Google-hendelser direkte fra
 * AgencyOS-kalenderen — uten å bytte til Google Calendar.
 *
 * Selve Google-kallene og eierskapsvalideringen ligger i
 * google-calendar-rediger.ts. Her gjøres auth, validering av input og
 * cache-invalidering.
 */

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import {
  opprettHendelseIGoogle,
  oppdaterHendelseIGoogle,
  slettHendelseIGoogle,
  hentSkrivbareKalendere,
  type RedigerResultat,
} from "@/lib/google-calendar-rediger";

const FelterSchema = z
  .object({
    tittel: z.string().trim().min(1, "Tittel mangler").max(300),
    startAt: z.coerce.date(),
    endAt: z.coerce.date(),
    sted: z.string().trim().max(500).optional().nullable(),
    notat: z.string().trim().max(4000).optional().nullable(),
    heldag: z.boolean().optional(),
  })
  .refine((v) => v.endAt > v.startAt, {
    message: "Slutt må være etter start",
    path: ["endAt"],
  });

export type HendelseFelterInput = z.input<typeof FelterSchema>;

function feil(melding: string): RedigerResultat {
  return { ok: false, feil: melding };
}

export async function opprettGoogleHendelse(
  subscriptionId: string,
  input: HendelseFelterInput,
): Promise<RedigerResultat> {
  const bruker = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const parsed = FelterSchema.safeParse(input);
  if (!parsed.success) {
    return feil(parsed.error.issues.map((i) => i.message).join("; "));
  }

  const res = await opprettHendelseIGoogle(
    bruker.id,
    subscriptionId,
    parsed.data,
  );
  if (res.ok) revalidatePath("/admin/kalender");
  return res;
}

export async function oppdaterGoogleHendelse(
  mirrorId: string,
  input: HendelseFelterInput,
): Promise<RedigerResultat> {
  const bruker = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const parsed = FelterSchema.safeParse(input);
  if (!parsed.success) {
    return feil(parsed.error.issues.map((i) => i.message).join("; "));
  }

  const res = await oppdaterHendelseIGoogle(bruker.id, mirrorId, parsed.data);
  if (res.ok) revalidatePath("/admin/kalender");
  return res;
}

export async function slettGoogleHendelse(
  mirrorId: string,
): Promise<RedigerResultat> {
  const bruker = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const res = await slettHendelseIGoogle(bruker.id, mirrorId);
  if (res.ok) revalidatePath("/admin/kalender");
  return res;
}

/** Kalendervalg til «ny hendelse»-skjemaet. */
export async function hentKalendervalg(): Promise<
  Array<{ id: string; navn: string; farge: string | null }>
> {
  const bruker = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  return hentSkrivbareKalendere(bruker.id);
}
