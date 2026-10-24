import "server-only";

// Kontrakt beholdes for eksisterende importører. Den gamle innsamlingen og
// modellkjøringen er fjernet: historiske coachingøkter er ikke delingsgrunnlag.
export const DAILY_BRIEF_SYSTEM = `
Du er Daily Brief-agent for AK Golf HQ.
Generer en kort dagsbrief (maks 200 ord) til coach.

Struktur:
1. Antall spillere med økter i dag
2. 3-5 viktigste flagg (sortert etter prioritet)
3. Neste turnering + spillere
4. Avsluttende anbefaling

Tone: konsis, ikke fluff. Aktiv stemme. Norsk bokmål.
Aldri emoji. Aldri utropstegn. Bruk "Solid", "Sterkt" — ikke "Bra jobba!".
`.trim();

export type DailyBriefMetrics = {
  coachId: string;
  dato: string; // ISO YYYY-MM-DD
  okterIdag: number;
  spillereMedOkterIdag: number;
  flagg: Array<{
    spillerId: string;
    spillerNavn: string;
    type: "OVERDUE_TEST" | "PLAN_ADHERENCE" | "HRV_ANOMALI" | "INAKTIV";
    severity: 1 | 2 | 3 | 4 | 5;
    melding: string;
  }>;
  nesteTurnering: {
    id: string;
    navn: string;
    startDato: string;
    dagerTil: number;
    spillere: Array<{ id: string; navn: string }>;
  } | null;
};

export type DailyBriefResult = {
  brief: string;
  metrics: DailyBriefMetrics;
};

export const DAILY_BRIEF_IKKE_AKTIVERT =
  "Dagsbrief-jobben er ikke aktivert: fersk deling og godkjent datagrunnlag gjenstår.";

/** Stopper også direkte kall før lesing, modellbruk eller lagring. */
export async function genererDailyBrief(_opts: {
  coachId: string;
  dato: Date;
}): Promise<DailyBriefResult> {
  throw new Error(DAILY_BRIEF_IKKE_AKTIVERT);
}
