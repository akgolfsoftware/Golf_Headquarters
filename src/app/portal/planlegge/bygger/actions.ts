"use server";

// Server actions for v2 plan-byggeren (/portal/planlegge/bygger).
// Tynne wrappers rundt src/lib/plan-builder/ — samme kjerner som legacy-ruten.
// NB: ingen type-re-eksporter her (Turbopack feiler på ikke-funksjons-
// eksporter i "use server"-filer) — typene importeres fra @/lib/plan-builder.

import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import {
  anbefalMalCore,
  genererPlanForslagCore,
  lagrePlanForslagCore,
  type ByggerMaltype,
  type AnbefalingerResultat,
  type GenerertForslag,
  type LagrePlanInput,
} from "@/lib/plan-builder";

export async function anbefalMalV2(input: {
  maltype: ByggerMaltype;
  turneringId?: string | null;
}): Promise<AnbefalingerResultat> {
  const user = await requirePortalUser({ allow: ["PLAYER", "PARENT"] });
  return anbefalMalCore(user, input);
}

export async function genererPlanForslagV2(input: {
  maltype: ByggerMaltype;
  turneringId?: string | null;
  egendefinertTekst?: string;
}): Promise<{ ok: true; forslag: GenerertForslag } | { ok: false; error: string }> {
  const user = await requirePortalUser({ allow: ["PLAYER", "PARENT"] });
  try {
    const forslag = await genererPlanForslagCore(user, input);
    return { ok: true, forslag };
  } catch (e) {
    console.error("[bygger-v2] generering feilet", e);
    return {
      ok: false,
      error: "Kunne ikke generere planen akkurat nå. Prøv igjen om litt — eller bygg uka manuelt i Workbench.",
    };
  }
}

export async function lagrePlanV2(
  input: LagrePlanInput,
): Promise<{ ok: true; planId: string } | { ok: false; error: string }> {
  const user = await requirePortalUser({ allow: ["PLAYER", "PARENT"] });
  try {
    const res = await lagrePlanForslagCore(user, input);
    revalidatePath("/portal/planlegge");
    revalidatePath("/portal/planlegge/workbench");
    return { ok: true, planId: res.planId };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Kunne ikke lagre planen." };
  }
}
