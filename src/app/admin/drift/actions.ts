"use server";

/**
 * Drift (AG-24): GDPR-behandling i to steg, samme som i Kø/Moderering.
 * Steg 1 godkjenner forespørselen, steg 2 utfører anonymiseringen. Bare admin.
 * Selve logikken (statusvakter, anonymisering, audit) ligger i moderering-actions.
 */

import { revalidatePath } from "next/cache";
import { requireAdminActionUser } from "@/lib/auth/action-guards";
import { godkjennSak, utforGdprSletting } from "@/app/admin/(legacy)/stats/moderering/actions";

export type DriftHandlingResultat = { ok: true } | { ok: false; feil: string };

async function kjor(handling: () => Promise<unknown>): Promise<DriftHandlingResultat> {
  try {
    await handling();
    revalidatePath("/admin/drift");
    revalidatePath("/admin/gdpr");
    return { ok: true };
  } catch (e) {
    return { ok: false, feil: e instanceof Error ? e.message : "Handlingen feilet." };
  }
}

export async function godkjennGdprForesporsel(id: string): Promise<DriftHandlingResultat> {
  await requireAdminActionUser();
  return kjor(() => godkjennSak(id));
}

export async function utforGdprForesporsel(id: string): Promise<DriftHandlingResultat> {
  await requireAdminActionUser();
  return kjor(() => utforGdprSletting(id));
}
