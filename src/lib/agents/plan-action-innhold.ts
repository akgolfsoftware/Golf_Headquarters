/**
 * Vakt mot tomme forslag i godkjenningskøen (audit 20.10.2026, A4).
 *
 * Innboksen og Kø viser `forklaring`, `detail`, `title`, `tittel` eller `note`
 * fra PlanAction.suggestion. Et forslag uten noen av dem vises som «—», og
 * 24-7-booking-alerts la 3 500 slike i køen før noen merket det. Agenter som
 * skriver PlanAction skal gå gjennom denne før `planAction.create`.
 */

const TEKSTFELT = ["forklaring", "detail", "title", "tittel", "note"] as const;

/** Sann når forslaget har minst ett lesbart tekstfelt som ikke er tomt. */
export function harLesbartForslag(suggestion: unknown): boolean {
  if (suggestion == null || typeof suggestion !== "object" || Array.isArray(suggestion)) return false;
  const s = suggestion as Record<string, unknown>;
  return TEKSTFELT.some((felt) => typeof s[felt] === "string" && s[felt].trim().length > 0);
}

/** Kaster når forslaget mangler tekst. Agentens navn står i feilmeldingen, så AgentRun viser hvem. */
export function kravLesbartForslag(agentName: string, suggestion: unknown): void {
  if (!harLesbartForslag(suggestion)) {
    throw new Error(`${agentName}: forslaget mangler lesbar tekst (forklaring/detail/title/tittel/note) og ble ikke opprettet`);
  }
}
