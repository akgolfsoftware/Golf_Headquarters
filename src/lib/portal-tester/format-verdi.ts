/**
 * format-verdi.ts — den ENE kilden for hvordan en testverdi vises.
 *
 * Bakgrunn: `TestResult.score` lagres som RÅVERDI i testens egen enhet. For
 * PEI-tester er råverdien en brøk (nærhet ÷ lengde), f.eks. 0,038 = 3,8 %.
 * Fram til 22.09.2026 viste appen den brøken direkte på de fleste flater, ofte
 * med én desimal, slik at 3,8 % ble til «0,0». To steder sammenlignet dessuten
 * brøken mot en terskel satt i prosent, slik at hver eneste PEI-test traff
 * øverste benchmark-nivå.
 *
 * Regelen nå: ingen flate leser `score` og formaterer selv. Alle går gjennom
 * `formaterTestVerdi`, som kjenner scoring-typen og dermed enheten.
 *
 * PEI vises som prosent med to desimaler («3,80 %»). Den gamle to-talls-
 * visningen «3,80 % · 0,04» er borte — halehenget ER brøken vi ikke vil vise.
 */

import type { ScoringKind } from "./test-scoring";

/**
 * PEI finnes historisk lagret både som brøk (0,057) og som prosent (5,7).
 * Alt som skal vises eller sammenlignes må normaliseres til prosent først.
 *
 * Heuristikken er terskelen 1,5: en PEI på 1,5 betyr at restavstanden var
 * halvannen gang målavstanden — en så dårlig måling at den i praksis ikke
 * forekommer, mens 1,5 % er en svært god måling. Grensen er derfor trygg i
 * begge retninger. Kilde: `normalizeMeasured` i src/lib/admin/test-benchmarks.ts,
 * som denne funksjonen nå er den felles implementasjonen for.
 */
export function peiSomProsent(verdi: number): number {
  return verdi <= 1.5 ? verdi * 100 : verdi;
}

export function erPeiKind(kind: ScoringKind): boolean {
  return kind === "pei_average" || kind === "pei_total";
}

function tall(n: number, desimaler: number, minDesimaler = 0): string {
  return n.toLocaleString("nb-NO", {
    maximumFractionDigits: desimaler,
    minimumFractionDigits: minDesimaler,
  });
}

/**
 * Visningstekst for en testverdi, inkludert enhet.
 *
 * `shotsCount` brukes kun av `count_ok` («7 OK av 10»); uten den vises «7 OK».
 */
export function formaterTestVerdi(params: {
  kind: ScoringKind;
  verdi: number | null;
  shotsCount?: number;
}): string {
  const { kind, verdi, shotsCount } = params;
  if (verdi == null || !Number.isFinite(verdi)) return "—";

  switch (kind) {
    case "pei_average":
    case "pei_total":
      return `${tall(peiSomProsent(verdi), 2, 2)} %`;
    case "count_ok":
      return shotsCount && shotsCount > 0
        ? `${tall(verdi, 0)} OK av ${shotsCount}`
        : `${tall(verdi, 0)} OK`;
    case "hit_rate":
      return `${tall(verdi, 0)} %`;
    case "points_total":
    case "sum":
      return `${tall(verdi, 0)} p`;
    case "carry_average":
    case "distance_average":
    case "spread_stddev":
      return `${tall(verdi, 1)} m`;
    case "time_seconds":
      return `${tall(verdi, 2)} s`;
    default:
      return tall(verdi, 2);
  }
}

/**
 * Visningstekst for endringen mellom to målinger, med fortegn.
 *
 * Fortegnet er nøytralt — det sier hvilken vei tallet gikk, ikke om det var
 * bra. Retningen eies av `lavereErBedre()` i test-scoring.ts, og kallstedet
 * bestemmer farge/tone ut fra den.
 *
 * For PEI er enheten prosentpoeng, ikke prosent: går en spiller fra 4,00 % til
 * 3,00 % er endringen «−1,00 pp». Å skrive det som «−1 %» ville betydd noe
 * annet (en prosentvis endring av selve prosenten).
 */
export function formaterTestDelta(params: {
  kind: ScoringKind;
  delta: number;
}): string {
  const { kind, delta } = params;
  if (!Number.isFinite(delta)) return "—";

  // Ekte minus (U+2212), jf. docs/skjermtekst/skjerm-tekst-hovedskjermer.md.
  const fortegn = delta < 0 ? "−" : "+";
  const storrelse = Math.abs(delta);

  if (erPeiKind(kind)) return `${fortegn}${tall(peiSomProsent(storrelse), 2, 2)} pp`;

  return `${fortegn}${formaterTestVerdi({ kind, verdi: storrelse })}`;
}
