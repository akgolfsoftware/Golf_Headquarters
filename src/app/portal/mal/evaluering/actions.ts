"use server";

import { revalidatePath } from "next/cache";
import { requireSpillerActionUser } from "@/lib/auth/action-guards";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { lagreEgenIup, hentEgenIup } from "@/lib/iup/lagring";
import { finnEgenIup } from "@/lib/iup/oversikt";

async function krevEgenSpillerflate() {
  await requireSpillerActionUser();
  // Samme Full-grense som siden; en direkte POST kan ikke omgå abonnementet.
  await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
}

export async function lagreIupAction(input: unknown) {
  await krevEgenSpillerflate();
  const resultat = await lagreEgenIup(input);
  if (resultat.ok) revalidatePath("/portal/mal/evaluering");
  return resultat;
}

export async function finnIupAction(input: unknown) {
  await krevEgenSpillerflate();
  return finnEgenIup(input);
}

export async function hentIupHistorikkAction(input: unknown) {
  await krevEgenSpillerflate();
  return hentEgenIup(input);
}
