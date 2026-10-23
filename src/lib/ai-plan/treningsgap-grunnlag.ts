import type { SgCategory } from "@/generated/prisma/client";
import { MIN_SG_RUNDER, sgSammenligningsnokkel, sgSnapshot, type SgKilde, type RoundSg } from "@/lib/ai-plan/analyse-grunnlag";
import type { UkeVolum } from "@/lib/training/volum";

export const TRENINGS_GAP_VERSJON = "2026-10-23.1";
export const TRENINGS_GAP_TERSKEL = 0.2;
const omraader: SgCategory[] = ["OTT", "APP", "ARG", "PUTT"];
const label: Record<SgCategory, string> = { OTT: "Utslag (OTT)", APP: "Innspill (APP)", ARG: "Nærspill (ARG)", PUTT: "Putting" };
type Runde = SgKilde & RoundSg & { id: string; playedAt: Date };

/** Beskrivende observasjon, ikke årsak, effekt eller anbefalt treningsdose. */
export function vurderTreningsgap(alleRunder: readonly Runde[], volum: readonly UkeVolum[]) {
  const sortert = [...alleRunder].sort((a,b) => b.playedAt.getTime()-a.playedAt.getTime() || b.id.localeCompare(a.id));
  const siste = sortert.find(r => sgSammenligningsnokkel(r) !== null);
  const key = siste ? sgSammenligningsnokkel(siste) : null;
  const runder = key ? sortert.filter(r => sgSammenligningsnokkel(r) === key &&
    [r.sgOtt,r.sgApp,r.sgArg,r.sgPutt].every(v => v !== null && Number.isFinite(v))) : [];
  if (runder.length < MIN_SG_RUNDER) return null;
  const snitt = sgSnapshot(runder);
  if (snitt.sgOtt === null || snitt.sgApp === null || snitt.sgArg === null || snitt.sgPutt === null) return null;
  const sg = { OTT: snitt.sgOtt, APP: snitt.sgApp, ARG: snitt.sgArg, PUTT: snitt.sgPutt };
  if (Object.values(sg).some(v => !Number.isFinite(v))) return null;
  const svakest = omraader.reduce((a,b) => sg[b] < sg[a] ? b : a);
  const gyldige = volum.filter(v => omraader.includes(v.sgArea) && Number.isFinite(v.minutter) && v.minutter >= 0);
  const total = gyldige.reduce((s,v) => s+v.minutter,0);
  if (total <= 0 || !Number.isFinite(total)) return null;
  const minutter = gyldige.filter(v => v.sgArea === svakest).reduce((s,v) => s+v.minutter,0);
  const andel = minutter/total;
  if (andel >= TRENINGS_GAP_TERSKEL) return null;
  return {
    svakestOmraade: svakest, svakestLabel: label[svakest], snittSg: Number(sg[svakest].toFixed(3)),
    andelTrening: Number(andel.toFixed(3)), registrerteSgMinutter: total, svakestRegistrerteSgMinutter: minutter,
    antallRunder: runder.length, sammenligningsgrunnlag: key, analyseVersjon: TRENINGS_GAP_VERSJON,
    forklaring: `${label[svakest]} har lavest SG-snitt (${sg[svakest].toFixed(2).replace(".", ",")}) i ${runder.length} sammenlignbare runder siste 8 uker, og ${Math.round(andel*100)} % av registrert SG-merket treningstid siste 4 uker. Dette dekker ikke all trening og viser ikke hva som forårsaker resultatene. Treneren vurderer datadekning og behov; ingen økter endres automatisk.`,
    rader: runder.map(r => ({ id: r.id, dato: r.playedAt.toISOString() })),
  };
}
