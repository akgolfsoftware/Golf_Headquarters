/**
 * Målmatrisen — motorikk × belastning per teknisk arbeidsoppgave.
 *
 * Anders 20.08: rep-målet settes ikke bare per motorikk-trinn, men fordelt på
 * kontekst. UTEN_BALL: 500 innendørs + 500 på bane. Omgivelsene endrer
 * opplevelsen (ballflukt, lys, skyggen over ballen), så teknikken må trenes i
 * alle kontekster for å holde.
 *
 * Reglene her BESKRIVER fremdrift. Ingenting sperrer: en oppgave uten mål er
 * like gyldig som en med, og et overskredet mål er ikke en feil.
 *
 * Loggene er alltid fasit — `gjortReps` i basen er en avledet cache som skal
 * rekalkuleres fra loggene ved enhver redigering (risiko 5 i analysen: en
 * teller som drifter fra loggene er en stille tillitsdreper).
 */

import {
  BELASTNING_KODER,
  MOTORIKK_KODER,
  type BelastningKode,
  type MotorikkKode,
} from "@/lib/domain/ak-formel-v2";

export type MatriseCelle = {
  motorikk: MotorikkKode;
  belastning: BelastningKode;
  maalReps: number;
  gjortReps: number;
};

export type CelleNokkel = `${MotorikkKode}:${BelastningKode}`;

export function celleNokkel(m: MotorikkKode, b: BelastningKode): CelleNokkel {
  return `${m}:${b}`;
}

/** Alle 12 cellene, i fast rekkefølge. Celler uten mål er med som nuller. */
export function fullMatrise(celler: readonly MatriseCelle[]): MatriseCelle[] {
  const kart = new Map<CelleNokkel, MatriseCelle>(
    celler.map((c) => [celleNokkel(c.motorikk, c.belastning), c]),
  );
  const ut: MatriseCelle[] = [];
  for (const motorikk of MOTORIKK_KODER) {
    for (const belastning of BELASTNING_KODER) {
      ut.push(
        kart.get(celleNokkel(motorikk, belastning)) ?? {
          motorikk,
          belastning,
          maalReps: 0,
          gjortReps: 0,
        },
      );
    }
  }
  return ut;
}

/**
 * En logget rep-post fra en fullført drill. `belastning: null` betyr ukjent
 * kontekst (eldre logger) — telles mot motorikk-totalen, aldri mot en celle.
 */
export type RepPost = {
  motorikk: MotorikkKode;
  belastning: BelastningKode | null;
  reps: number;
};

/**
 * Teller loggede reps mot riktig celle. Rekalkulering, ikke inkrementering:
 * kall alltid med HELE loggsettet for oppgaven, slik at cachen ikke kan drifte.
 */
export function tellMotMatrise(
  maal: readonly Pick<MatriseCelle, "motorikk" | "belastning" | "maalReps">[],
  logger: readonly RepPost[],
): MatriseCelle[] {
  const talt = new Map<CelleNokkel, number>();
  for (const post of logger) {
    if (!post.belastning || post.reps <= 0) continue;
    const n = celleNokkel(post.motorikk, post.belastning);
    talt.set(n, (talt.get(n) ?? 0) + post.reps);
  }
  return fullMatrise(
    maal.map((m) => ({
      motorikk: m.motorikk,
      belastning: m.belastning,
      maalReps: m.maalReps,
      gjortReps: talt.get(celleNokkel(m.motorikk, m.belastning)) ?? 0,
    })),
  );
}

export type MatriseFremdrift = {
  maalTotalt: number;
  gjortTotalt: number;
  /** 0–1. Null mål gir 0 — aldri deling på null, aldri «100 % ferdig» av tomt. */
  andel: number;
  /** Alle celler med mål > 0 er nådd. Falsk når det ikke finnes mål i det hele tatt. */
  alleMaalNaadd: boolean;
  /** Celler som fortsatt mangler reps — grunnlaget for «hva står igjen». */
  gjenstaaende: MatriseCelle[];
};

export function fremdrift(celler: readonly MatriseCelle[]): MatriseFremdrift {
  const medMaal = celler.filter((c) => c.maalReps > 0);
  const maalTotalt = medMaal.reduce((sum, c) => sum + c.maalReps, 0);
  // Reps utover målet i én celle skal ikke dekke over en celle som mangler.
  const gjortTotalt = medMaal.reduce((sum, c) => sum + Math.min(c.gjortReps, c.maalReps), 0);
  const gjenstaaende = medMaal.filter((c) => c.gjortReps < c.maalReps);
  return {
    maalTotalt,
    gjortTotalt,
    andel: maalTotalt > 0 ? gjortTotalt / maalTotalt : 0,
    alleMaalNaadd: medMaal.length > 0 && gjenstaaende.length === 0,
    gjenstaaende,
  };
}

/**
 * Skal hovedcoachen varsles nå? Sant kun når alle rep-mål er nådd OG varselet
 * ikke allerede er sendt — statusrapporten skal komme én gang per oppnåelse,
 * ikke ved hver eneste logging etterpå.
 */
export function skalVarsleHovedcoach(
  celler: readonly MatriseCelle[],
  alleredeVarsletAt: Date | null | undefined,
): boolean {
  return fremdrift(celler).alleMaalNaadd && !alleredeVarsletAt;
}

// ---------------------------------------------------------------------------
// Prioritetsfarge
// ---------------------------------------------------------------------------

/**
 * Fargekoden fra spec-en (valgt av Claude på Anders' delegasjon 20.08).
 * Aldri rød — rød betyr feil og skaper stress, og reserveres for ekte feil.
 */
export type PrioritetFarge = "CLAY" | "BLEKK" | "DEMPET" | "GRONN";

export const PRIORITET_LABEL: Record<PrioritetFarge, string> = {
  CLAY: "Denne uken",
  BLEKK: "I køen",
  DEMPET: "Hviler",
  GRONN: "Fullført",
};

export type BlokkType = "UTVIKLING" | "FORBEREDELSER" | "KONKURRANSE";

/**
 * Fargen for én oppgave. `rangering` er oppgavens plass i coachens
 * drag-and-drop-rekkefølge (0 = øverst).
 *
 * I en KONKURRANSE-blokk vises maks to oppgaver i clay og resten dempes —
 * veiledning, aldri sperre (18.08). Spilleren kan trene nøyaktig hva hen vil;
 * fargen sier bare hva coachen har prioritert.
 */
export function prioritetFarge(input: {
  rangering: number;
  hviler: boolean;
  fremdrift: MatriseFremdrift;
  blokkType?: BlokkType | null;
}): PrioritetFarge {
  if (input.fremdrift.alleMaalNaadd) return "GRONN";
  if (input.hviler) return "DEMPET";
  const clayPlasser = input.blokkType === "KONKURRANSE" ? 2 : 3;
  if (input.rangering < clayPlasser) return "CLAY";
  return input.blokkType === "KONKURRANSE" ? "DEMPET" : "BLEKK";
}
