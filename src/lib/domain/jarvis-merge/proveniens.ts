/**
 * Merge-proveniens (C6 / JV-03). Jarvis merger aldri — kun coach.
 * Denne fila skriver ikke til Workbench; den avviser rød eval og
 * returnerer kvittering hvis eval er ÅPEN.
 */

import type { JarvisEval } from "./eval";

export type JarvisMergeAktør = "coach";

export type JarvisMergeKvittering = {
  ok: true;
  forslagId: string;
  utførtAv: JarvisMergeAktør;
  utførtAtIso: string;
  evalStatus: "AAPEN";
  acwrDetalj: string | null;
};

export type JarvisMergeAvvist = {
  ok: false;
  grunn: "STENGT" | "IKKE_COACH";
};

export function kanMerge(ev: JarvisEval): boolean {
  return ev.status === "AAPEN";
}

/**
 * Registrer at coachen utførte merget. `utførtAv` er låst til "coach" —
 * å sende noe annet er avvist (Jarvis merger aldri).
 */
export function registrerMerge(input: {
  forslagId: string;
  eval: JarvisEval;
  utførtAv: string;
  utførtAtIso: string;
}): JarvisMergeKvittering | JarvisMergeAvvist {
  if (input.utførtAv !== "coach") return { ok: false, grunn: "IKKE_COACH" };
  if (!kanMerge(input.eval)) return { ok: false, grunn: "STENGT" };
  const acwr = input.eval.sjekker.find((s) => s.id === "ACWR");
  return {
    ok: true,
    forslagId: input.forslagId,
    utførtAv: "coach",
    utførtAtIso: input.utførtAtIso,
    evalStatus: "AAPEN",
    acwrDetalj: acwr?.detalj ?? null,
  };
}
