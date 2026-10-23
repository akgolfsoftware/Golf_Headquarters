"use server";

import { revalidatePath } from "next/cache";
import { requireSpillerActionUser, requireParentActionUser } from "@/lib/auth/action-guards";
import { settAkProfilValg } from "@/lib/deling/ak-profil-valg";

function oppdater() {
  revalidatePath("/portal/meg/innstillinger/personvern/deling");
  revalidatePath("/forelder/samtykke", "layout");
  revalidatePath("/admin/caddie", "layout");
}

export async function svarAkProfil(input: unknown) {
  const bruker = await requireSpillerActionUser();
  const resultat = await settAkProfilValg(bruker, bruker.id, input);
  if (resultat.ok) oppdater();
  return resultat;
}

export async function svarAkProfilForBarn(childId: string, input: unknown) {
  const bruker = await requireParentActionUser();
  const resultat = await settAkProfilValg(bruker, childId, input);
  if (resultat.ok) oppdater();
  return resultat;
}
