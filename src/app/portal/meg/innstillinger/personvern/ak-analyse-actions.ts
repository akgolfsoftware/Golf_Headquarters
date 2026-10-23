"use server";

import { revalidatePath } from "next/cache";
import { requireSpillerActionUser, requireParentActionUser } from "@/lib/auth/action-guards";
import { settAkAnalyseValg } from "@/lib/deling/ak-gruppeanalyse";

function oppdater() {
  revalidatePath("/portal/meg/innstillinger/personvern/deling");
  revalidatePath("/forelder/samtykke", "layout");
  revalidatePath("/admin/grupper", "layout");
}

export async function svarAkAnalyse(input: unknown) {
  const bruker = await requireSpillerActionUser();
  const resultat = await settAkAnalyseValg(bruker, bruker.id, input);
  if (resultat.ok) oppdater();
  return resultat;
}

export async function svarAkAnalyseForBarn(childId: string, input: unknown) {
  const bruker = await requireParentActionUser();
  const resultat = await settAkAnalyseValg(bruker, childId, input);
  if (resultat.ok) oppdater();
  return resultat;
}
