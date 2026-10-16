"use server";

import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { opprettTrenerInvitasjon, trekkTrenerDeling, hentEgenTrenerdeling } from "@/lib/deling/navngitt";

async function krevDelingskonto() {
  // Konto-/samtykkeadministrasjon må være tilgjengelig også etter utløpt abonnement.
  await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN", "PARENT"], kreverTilgang: "INGEN" });
}
export async function opprettNavngittDelingAction(input: unknown) {
  await krevDelingskonto();
  const r = await opprettTrenerInvitasjon(input);
  if (r.ok) revalidatePath("/portal/meg/deling");
  return r;
}
export async function trekkNavngittDelingAction(input: unknown) {
  await krevDelingskonto();
  const r = await trekkTrenerDeling(input);
  if (r.ok) revalidatePath("/portal/meg/deling");
  return r;
}
export async function hentNavngittDelingAction(input: unknown) {
  await krevDelingskonto();
  return hentEgenTrenerdeling(input);
}
