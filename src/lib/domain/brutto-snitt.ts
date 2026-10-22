/**
 * Brutto snitt, én definisjon for hele HQ (Anders 22.10.2026, beslutninger.md §TEAM NORWAY: DELING
 * ER ALT ELLER INGENTING, punkt 2): turneringsrunder i kalenderåret (Oslo-tid), bare brutto, og
 * nettoklasser tatt ut med hvitelisten (`erNettoKlasse`). Treningsrunder er et eget tall og teller
 * aldri i snittet.
 *
 * Turneringsrundene kommer fra spillerens bekreftede profilkobling (offentlige resultater), ikke fra
 * runder spilleren har ført selv. IUP, Rangliste, Uttak, Spiller 360, PlayerHQ og A–K-kategorien
 * leser alle herfra.
 */

import { erNettoKlasse } from "@/lib/stats/profil-resultater";
import { lesTurneringsresultat, type OffentligResultat } from "./turneringsresultat";

export type Snittall = { runder: number; snitt: number | null };
export type BruttoSnitt = { turnering: Snittall; trening: Snittall };

const osloAarFormat = new Intl.DateTimeFormat("en-GB", { year: "numeric", timeZone: "Europe/Oslo" });
export function osloAar(dato: Date): number {
  return Number(osloAarFormat.format(dato));
}

const snittAv = (slag: number[]): Snittall => ({
  runder: slag.length,
  snitt: slag.length ? slag.reduce((a, b) => a + b, 0) / slag.length : null,
});

/**
 * Bruttoslagene i turneringsresultatene: én verdi per fullført runde med ekte slag. Påmeldinger og
 * nettoklasser tas ikke med. Rangliste og snittet teller rundene her, så de kan ikke gli fra hverandre.
 */
export function bruttoRunder(resultater: readonly OffentligResultat[]): number[] {
  const slag: number[] = [];
  for (const entry of resultater) {
    if (entry.status === "REGISTERED" || erNettoKlasse(entry.klasseNavn)) continue;
    for (const runde of lesTurneringsresultat(entry).runder) {
      if (runde.brutto === null || runde.fullfort === false) continue;
      slag.push(runde.brutto);
    }
  }
  return slag;
}

/** Turneringene som startet i `aar` (Oslo). */
export function turneringerIAar<T extends { start: Date }>(turneringer: readonly T[], aar: number): T[] {
  return turneringer.filter((t) => osloAar(t.start) === aar);
}

export type Treningsrunde = { playedAt: Date; score: number; roundType: string | null; hull: number };

/** En runde spilleren har ført selv er trening, med mindre den er merket turnering. Bare 18 hull, så ni hull ikke trekker snittet ned. */
export function erTreningsrunde(r: Treningsrunde): boolean {
  return r.roundType !== "turnering" && r.hull === 18;
}

export function beregnBruttoSnitt(input: {
  turneringer: readonly { start: Date; resultat: OffentligResultat }[];
  treningsrunder: readonly Treningsrunde[];
  aar: number;
}): BruttoSnitt {
  return {
    turnering: snittAv(bruttoRunder(turneringerIAar(input.turneringer, input.aar).map((t) => t.resultat))),
    trening: snittAv(input.treningsrunder.filter((r) => erTreningsrunde(r) && osloAar(r.playedAt) === input.aar).map((r) => r.score)),
  };
}
