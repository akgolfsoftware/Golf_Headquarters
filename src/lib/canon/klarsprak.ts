// CANON klarspråk — UI-lag-oppslag (additiv, ingen backend-endring).
//
// brudd.melding fra motoren er teknisk («TEK er 8% (min 15% …)»). Spilleren skal
// se lesbar tekst uten invariant-IDer. Her mapper vi invariantId → spiller-melding,
// og invariantId → hvilke AK-formel-chip-felt bruddet hører til (for rød/amber kant).

import type { DimField } from "@/components/workbench-hybrid/taxonomy";

/** Spiller-vendt klarspråk per invariant. Faller tilbake til teknisk melding hvis ukjent. */
const KLARSPRAK: Record<string, string> = {
  "tek-min": "Denne perioden mangler teknisk trening",
  "cs50-ballkontakt": "En slag-økt mangler køllehastighet",
  "alder-timer": "For mange treningstimer denne uka for alderen",
  "maks-2-svingendringer-turnering": "For mange svingendringer i turneringsfasen",
  "cs-tak": "En økt slår hardere enn perioden tillater",
  "l-fase-tillatt": "En økt bruker en L-fase som ikke passer perioden",
  "pyramide-maks": "Ett treningsområde fyller for mye av perioden",
  "volum-uke-maks": "For høyt treningsvolum denne uka",
  "hviledager-min": "For få hviledager denne uka",
};

/** Lesbar melding for spiller (faller tilbake til motorens melding). */
export function klarsprak(invariantId: string, teknisk: string): string {
  return KLARSPRAK[invariantId] ?? teknisk;
}

/** Hvilke inspektør-chip-felt et invariant-brudd hører til (for kant-markering). */
const INVARIANT_TIL_FELT: Record<string, DimField[]> = {
  "tek-min": ["cat"],
  "pyramide-maks": ["cat"],
  "cs50-ballkontakt": ["cs"],
  "cs-tak": ["cs"],
  "l-fase-tillatt": ["lfase"],
  "maks-2-svingendringer-turnering": ["lfase"],
  // alder-timer, volum-uke-maks, hviledager = uke-scope, ingen enkelt-chip.
};

export function feltForInvariant(invariantId: string): DimField[] {
  return INVARIANT_TIL_FELT[invariantId] ?? [];
}
