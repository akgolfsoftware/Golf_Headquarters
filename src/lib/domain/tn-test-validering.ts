/**
 * Validering av lagrede Team Norway-testresultater, delt av Tester, Haster, Referanse og Profil
 * (A10: «antall» betyr gyldige forsøk overalt). Ren funksjon uten database.
 */
import { tnScore, tnSameScore, TnResultSchema, type TnResult } from "@/lib/portal-tester/tn-scoring";
import { tnProtocol, tnVersion, type TnProtocol } from "@/lib/portal-tester/tn-catalog";

/**
 * Primær bedre-retning slik `tnScore` selv velger primærmetrikken — ALDRI
 * blindt `metrics[0]`. For 8-ball-protokoller er `metrics[0]` "Gjennomsnittlig
 * PEI" (lavere er bedre), men den faktiske primærscoren (`TnResult.score`,
 * altså tallet som faktisk sammenlignes/rangeres) er "Totalt antall poeng"
 * (HØYERE er bedre) — se `tnScore` i tn-scoring.ts. Returnerer `null` når
 * retningen ikke kan fastslås trygt (i stedet for å anta `true`).
 */
function tnPrimaerRetning(protokoll: TnProtocol, metrics: TnResult["metrics"]): boolean | null {
  if (protokoll.points8Ball) {
    const poeng = metrics.find((m) => m.label === "Totalt antall poeng");
    return poeng ? poeng.lowerIsBetter : null;
  }
  return metrics[0] ? metrics[0].lowerIsBetter : null;
}

export type TnRaRad = { id: string; takenAt: Date; score: number; details: unknown };

/**
 * Validerer HVER sammenlignet rad — ikke bare den nyeste — og reberegner
 * resultatet KANONISK fra de rå forsøksverdiene (`tnScore`) i stedet for å
 * stole på det som ble lagret (score, enhet OG retning kan i prinsippet
 * være feil/manipulert/fra en senere endret formel). En rad tas kun med
 * når (a) JSON-en parser som et gyldig `TnResult`, (b) er skrevet for
 * NØYAKTIG denne protokollen (`protocolId`) og den lagrede protokollversjonen,
 * (c) protokollen for radens EGET `count` faktisk finnes og har riktig
 * antall forsøksrader (variable-count-protokoller uten riktig antall er
 * ikke sammenlignbare), (d) `tnScore` kan beregnes fra de rå verdiene uten
 * feil, og (e) det reberegnede tallet OG enheten samsvarer med det som
 * faktisk står i `score`-kolonnen. Alt annet telles som "utelatt" og
 * forklares i UI — det skjuler ALDRI hele testen bare fordi én rad
 * (f.eks. den nyeste) er uforenlig.
 */
export function tnValiderRader<T extends TnRaRad>(rader: T[], protokoll: TnProtocol): { gyldige: (T & { parsed: TnResult; retning: boolean })[]; utelatt: number } {
  const gyldige: (T & { parsed: TnResult; retning: boolean })[] = [];
  let utelatt = 0;
  for (const r of rader) {
    const parsed = TnResultSchema.safeParse(r.details);
    if (!parsed.success || parsed.data.protocolId !== protokoll.id || parsed.data.version !== tnVersion(protokoll)) {
      utelatt += 1;
      continue;
    }
    const forventetProtokoll = protokoll.variableCount ? tnProtocol(protokoll.id, parsed.data.count, parsed.data.version) : protokoll;
    if (!forventetProtokoll || forventetProtokoll.rows.length !== parsed.data.count) {
      utelatt += 1;
      continue;
    }
    let kanonisk: TnResult;
    try {
      kanonisk = tnScore(forventetProtokoll, parsed.data.values);
    } catch {
      utelatt += 1;
      continue;
    }
    if (!tnSameScore(kanonisk.score, r.score) || kanonisk.unit !== parsed.data.unit) {
      utelatt += 1;
      continue;
    }
    const retning = tnPrimaerRetning(forventetProtokoll, kanonisk.metrics);
    if (retning === null) {
      utelatt += 1;
      continue;
    }
    gyldige.push({ ...r, parsed: parsed.data, retning });
  }
  return { gyldige, utelatt };
}
