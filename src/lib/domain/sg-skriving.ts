/**
 * SG-skrivepresedens — den rene beslutningen bak `recomputeRoundSg`.
 *
 * Reglene har ligget som privat logikk i en server action
 * (`src/app/portal/mal/runder/[id]/actions.ts`), altså utenfor både
 * domenelaget og testglobben. Beslutningen bor nå her (invariant 5:
 * domenelogikk i src/lib), mens actionen beholder prisma-I/O.
 *
 * Presedens (uendret oppførsel, AP0.3 i docs/plan-baneguide-sg-app-2026-08-16.md):
 *   1. `sgSource === "manual"` — håndtastede tall overskrives ALDRI.
 *   2. Komplett slagkjede → skriv 5 hovedfelter + 15 granulære, kilde "beregnet".
 *   3. Ufullstendig kjede, men feltene var "beregnet" → nullstill alt.
 *      Stale tall er verre enn ingen (samme ærlighetsregel som shots-til-sg).
 *   4. Ufullstendig kjede uten tidligere beregnede tall → ikke rør raden.
 *
 * `sgLob` settes bevisst aldri her — den krever kølledata kjeden ikke bærer.
 */

/** SG-hovedtall fra `beregnSgFraShots`. */
export type SgHovedtall = {
  total: number;
  ott: number;
  app: number;
  arg: number;
  putt: number;
};

/** Granulære buckets fra `beregnGranulaerSgFraShots` (alle valgfrie). */
export type SgGranulaer = Partial<{
  sgTee: number | null;
  sgApp200: number | null;
  sgApp150: number | null;
  sgApp100: number | null;
  sgApp50: number | null;
  sgChip: number | null;
  sgPitch: number | null;
  sgBunker: number | null;
  sgPutt0_3: number | null;
  sgPutt3_5: number | null;
  sgPutt5_10: number | null;
  sgPutt10_15: number | null;
  sgPutt15_25: number | null;
  sgPutt25_40: number | null;
  sgPutt40plus: number | null;
}>;

/** Alle SG-feltene på Round som beregningen eier (5 hoved + 15 granulære). */
export type SgFelter = {
  sgTotal: number | null;
  sgOtt: number | null;
  sgApp: number | null;
  sgArg: number | null;
  sgPutt: number | null;
  sgSource: string | null;
  sgTee: number | null;
  sgApp200: number | null;
  sgApp150: number | null;
  sgApp100: number | null;
  sgApp50: number | null;
  sgChip: number | null;
  sgPitch: number | null;
  sgBunker: number | null;
  sgPutt0_3: number | null;
  sgPutt3_5: number | null;
  sgPutt5_10: number | null;
  sgPutt10_15: number | null;
  sgPutt15_25: number | null;
  sgPutt25_40: number | null;
  sgPutt40plus: number | null;
};

export type SgSkriving =
  /** Rør ikke raden. */
  | { handling: "ingen"; grunn: "manuell" | "ufullstendig-uten-tidligere" }
  /** Skriv feltene (komplett kjede eller nullstilling). */
  | { handling: "skriv"; grunn: "beregnet" | "nullstill"; felter: SgFelter };

/** Alle beregnings-eide felter tomme — brukes ved nullstilling. */
export const TOMME_SG_FELTER: SgFelter = {
  sgTotal: null,
  sgOtt: null,
  sgApp: null,
  sgArg: null,
  sgPutt: null,
  sgSource: null,
  sgTee: null,
  sgApp200: null,
  sgApp150: null,
  sgApp100: null,
  sgApp50: null,
  sgChip: null,
  sgPitch: null,
  sgBunker: null,
  sgPutt0_3: null,
  sgPutt3_5: null,
  sgPutt5_10: null,
  sgPutt10_15: null,
  sgPutt15_25: null,
  sgPutt25_40: null,
  sgPutt40plus: null,
};

/**
 * Avgjør hva som skal skrives til `Round` etter en slag-endring.
 *
 * @param sgSource nåværende `Round.sgSource` ("manual" | "beregnet" | null)
 * @param sg       resultat fra `beregnSgFraShots` — null ved ufullstendig kjede
 * @param gran     resultat fra `beregnGranulaerSgFraShots` (kun lest når `sg` finnes)
 */
export function avgjorSgSkriving(
  sgSource: string | null,
  sg: SgHovedtall | null,
  gran: SgGranulaer | null,
): SgSkriving {
  // 1. Håndtastede tall er fasit — beregningen rører dem aldri.
  if (sgSource === "manual") return { handling: "ingen", grunn: "manuell" };

  // 2. Komplett kjede → skriv alt.
  if (sg) {
    return {
      handling: "skriv",
      grunn: "beregnet",
      felter: {
        ...TOMME_SG_FELTER,
        sgTotal: sg.total,
        sgOtt: sg.ott,
        sgApp: sg.app,
        sgArg: sg.arg,
        sgPutt: sg.putt,
        sgSource: "beregnet",
        sgTee: gran?.sgTee ?? null,
        sgApp200: gran?.sgApp200 ?? null,
        sgApp150: gran?.sgApp150 ?? null,
        sgApp100: gran?.sgApp100 ?? null,
        sgApp50: gran?.sgApp50 ?? null,
        sgChip: gran?.sgChip ?? null,
        sgPitch: gran?.sgPitch ?? null,
        sgBunker: gran?.sgBunker ?? null,
        sgPutt0_3: gran?.sgPutt0_3 ?? null,
        sgPutt3_5: gran?.sgPutt3_5 ?? null,
        sgPutt5_10: gran?.sgPutt5_10 ?? null,
        sgPutt10_15: gran?.sgPutt10_15 ?? null,
        sgPutt15_25: gran?.sgPutt15_25 ?? null,
        sgPutt25_40: gran?.sgPutt25_40 ?? null,
        sgPutt40plus: gran?.sgPutt40plus ?? null,
      },
    };
  }

  // 3. Ufullstendig kjede: nullstill kun det som faktisk var beregnet.
  if (sgSource === "beregnet") {
    return { handling: "skriv", grunn: "nullstill", felter: { ...TOMME_SG_FELTER } };
  }

  // 4. Ingenting å rydde opp i.
  return { handling: "ingen", grunn: "ufullstendig-uten-tidligere" };
}
