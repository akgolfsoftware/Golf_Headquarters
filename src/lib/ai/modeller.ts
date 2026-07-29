// Modellvalg per agent — én kilde for hvilken Claude-modell en agent kjører på.
//
// Før 2026-07-29 hardkodet både `src/lib/ai/client.ts` (AI_MODEL) og
// `src/lib/anthropic.ts` (COACH_MODEL) samme streng, med kommentaren «holdes
// synkronisert manuelt». To kilder som skal holdes like for hånd er én kilde
// som er feil halve tiden. Nå bor valget her, og begge importerer herfra.
//
// Modell-IDene er verifisert mot `anthropic.models.list()` 2026-07-29 — ikke
// skrevet fra hukommelsen. Gotchas-fila har en egen seksjon om nettopp dette:
// en ID som ikke finnes gir 404 først i runtime, ikke ved bygg.

import "server-only";

/** Verifisert tilgjengelige 2026-07-29. Ikke endre uten å kjøre models.list(). */
export const MODELL = {
  opus: "claude-opus-5",
  sonnet: "claude-sonnet-4-6",
  haiku: "claude-haiku-4-5-20251001",
} as const;

export type ModellNivaa = keyof typeof MODELL;

/**
 * Tung analyse og resonnering — agenter der et dårlig svar koster en
 * coaching-beslutning, ikke bare en melding.
 */
const OPUS_AGENTER = new Set([
  "plan-revisjon",
  "plan-revision-actions",
  "sg-analyse-ekspert",
  "peaking-agent",
  "swing-video-analyst",
  "plan-effectiveness-agent",
  "ai-code-reviewer",
]);

/**
 * Mekanisk arbeid: synkronisering, purringer og overvåking. Kort kontekst,
 * forutsigbart format, høy frekvens — der er haiku både raskere og billigere.
 */
const HAIKU_AGENTER = new Set([
  "notion-sync",
  "calendar-sync",
  "wagr-sync",
  "betalings-purring",
  "lead-oppfolging",
  "meg-loftesjekk",
  "meg-crm-nudge",
]);

/** Mønstre for agenter som navngis i familier. Eksakt treff vinner over disse. */
const HAIKU_MONSTRE = [/^booking-.*-monitor$/, /^availability-.*-monitor$/];
const SONNET_MONSTRE = [/^meg-/];

/**
 * Modellen en agent skal kjøre på. Ukjent agent → sonnet.
 *
 * Presedens er bevisst: eksakt treff slår mønster. `meg-*` er sonnet som
 * familie, men `meg-loftesjekk` og `meg-crm-nudge` er rene varslingsjobber og
 * står eksplisitt på haiku. Uten denne rekkefølgen ville familien overstyrt
 * unntakene, og de to hadde stille kjørt dyrere enn de trenger.
 */
export function modelFor(agentId: string): string {
  if (OPUS_AGENTER.has(agentId)) return MODELL.opus;
  if (HAIKU_AGENTER.has(agentId)) return MODELL.haiku;
  if (HAIKU_MONSTRE.some((m) => m.test(agentId))) return MODELL.haiku;
  if (SONNET_MONSTRE.some((m) => m.test(agentId))) return MODELL.sonnet;
  return MODELL.sonnet;
}

/** Nivået en agent havner på — for logging, proveniens og kostnadsoversikt. */
export function nivaaFor(agentId: string): ModellNivaa {
  const m = modelFor(agentId);
  return (Object.keys(MODELL) as ModellNivaa[]).find((k) => MODELL[k] === m) ?? "sonnet";
}
