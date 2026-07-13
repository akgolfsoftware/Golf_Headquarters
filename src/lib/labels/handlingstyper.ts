/**
 * KANONISK norsk ordbok for PlanAction.actionType (og beslektede
 * forslags-typer) — design-audit-funn 5: rå systemtyper som
 * «AVAILABILITY_SUGGEST» skal aldri vises i UI. Alle flater
 * (godkjenninger, varsler, innboks, caddie) leser HERFRA — aldri
 * egne lokale maps. Ny actionType → legg label her i samme commit.
 */

export const HANDLINGSTYPE_LABEL: Record<string, string> = {
  PYRAMID_ADJUST: "Juster pyramide",
  TRAINING_GAP: "Treningsgap",
  SESSION_ADD: "Legg til økt",
  SESSION_REMOVE: "Fjern økt",
  SESSION_SWAP: "Bytt økt",
  INTENSITY_ADJUST: "Juster intensitet",
  FOCUS_CHANGE: "Endre fokus",
  PERIOD_SWITCH: "Bytt periode",
  DRILL_SWAP: "Bytt drill",
  REST_DAY_ADD: "Hviledag",
  TAPER_ENGAGE: "Start nedtrapping",
  WITHDRAW: "Trekk fra turnering",
  DRILL_SUGGEST: "Drill-forslag",
  TEST_SCHEDULE: "Planlegg test",
  PEER_COMPARE: "Sammenlign spillere",
  RECOVERY_ADD: "Legg til restitusjon",
  ESCALATION: "Eskalering",
  DELOAD: "Pauseuke",
  TOURNAMENT_ENTRY: "Turneringspåmelding",
  PLAN_CHANGE: "Plan-endring",
  WEEK_SHIFT: "Flytt uke",
  WEEKLY_PROPOSAL: "Ukeforslag",
  CHURN_MESSAGE: "Frafalls-melding",
  PAYMENT_FOLLOWUP: "Betalings-oppfølging",
  AVAILABILITY_SUGGEST: "Ledig tid-forslag",
  CADDIE_DRAFT: "Caddie-forslag",
  SESSION_REQUEST: "Økt-forespørsel",
};

/** Label for en handlingstype — faller ærlig tilbake til «Forslag» i stedet
 *  for å lekke rå enum-tekst til brukeren. */
export function handlingstypeLabel(actionType: string): string {
  return HANDLINGSTYPE_LABEL[actionType] ?? "Forslag";
}
