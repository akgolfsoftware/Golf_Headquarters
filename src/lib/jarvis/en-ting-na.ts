// «Én ting nå» — Jarvis-hjemmets prioriteringsregel, portet verbatim fra
// footer-teksten i jarvis/meg-hjem.html: «VALGT: OVER FRIST VINNER → ELLERS
// MINST TID IGJEN → LIKT: ANROP FØRST».
//
// tidIgjenMs er negativ når saken er over frist, positiv når det gjenstår
// tid. Stigende sortering på tidIgjenMs gir derfor BEGGE de to første
// stegene i regelen i ett trinn: mest negativ (mest over frist) havner
// først, og blant de som ikke er over frist havner minst gjenværende tid
// først. Steg tre (ANROP før skriftlig) er ren tie-break ved eksakt likt
// tidspunkt.
import type { Sak } from "@/generated/prisma/client";
import { SakKanal, SakStatus } from "@/generated/prisma/enums";

/** Millisekunder til frist. Negativ = over frist. Null = ingen frist satt. */
export function tidIgjenMs(sak: Pick<Sak, "frist">, na: Date = new Date()): number | null {
  if (!sak.frist) return null;
  return sak.frist.getTime() - na.getTime();
}

/** Sammenligner to VENTER-saker etter Jarvis-hjemmets prioriteringsregel. */
export function sammenlignPrioritet(a: Sak, b: Sak, na: Date = new Date()): number {
  const tidA = tidIgjenMs(a, na);
  const tidB = tidIgjenMs(b, na);

  if (tidA === null && tidB !== null) return 1; // uten frist taper mot alt med frist
  if (tidB === null && tidA !== null) return -1;
  if (tidA !== null && tidB !== null && tidA !== tidB) return tidA - tidB;

  // Likt tidspunkt (eller begge uten frist): ANROP før skriftlige kanaler.
  const aAnrop = a.kanal === SakKanal.ANROP ? 0 : 1;
  const bAnrop = b.kanal === SakKanal.ANROP ? 0 : 1;
  return aAnrop - bAnrop;
}

/** Saken som skal vises i «Én ting nå»-kortet. Null når køen er tom. */
export function enTingNa(saker: Sak[], na: Date = new Date()): Sak | null {
  const ventende = saker.filter((s) => s.status === SakStatus.VENTER);
  if (ventende.length === 0) return null;
  return [...ventende].sort((a, b) => sammenlignPrioritet(a, b, na))[0];
}
