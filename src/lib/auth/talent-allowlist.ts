/**
 * Talent-allowlisten (plan A3/T2): rutene den GRATIS, LÅSTE TalentHQ-profilen
 * (tilgangsnivå TALENT) har tilgang til. ALT annet under /portal er låst —
 * fail-closed: en ny rute er låst til den eksplisitt legges hit.
 *
 * Besluttet av Anders 2026-08-16: åpent = testregistrering (kun CANON-20),
 * stats-lesing, SG-/runderegistrering, DataGolf-sammenligning, talent-flatene,
 * BOOKING (direkte inntektskanal — enkelttimer betales per stk) og konto.
 *
 * Prefiks-match: en oppføring dekker ruten selv og alt under.
 */

export const TALENT_APNE_PREFIKSER: readonly string[] = [
  // Hjem — nedtonet med låste kort (T2 bygger visningen).
  "/portal",
  // Testbatteriet (CANON-20 + egne tester).
  "/portal/tren/tester",
  // Stats og analyse — lesing.
  "/portal/analysere",
  // Gammel adresse for det samme: /portal/analyse er en ren redirect til
  // /portal/analysere. Aliaset viser ingenting selv, så det arver målrutens
  // nivå — ellers ville gamle bokmerker stengt en flate som ER åpen.
  "/portal/analyse",
  "/portal/statistikk",
  "/portal/stats",
  // SG-/runderegistrering. Registreringen skjer TO steder og begge må være
  // åpne: /portal/mal/runder er listen og etterregistreringen, mens selve
  // loggingen under spill bor i /portal/runde (live + logg, fullskjerm).
  // Rettet 2026-08-17: kun den første sto her, så en gratisprofil kunne se
  // runder den ikke hadde noen vei til å logge.
  "/portal/mal/runder",
  "/portal/runde",
  "/portal/datagolf",
  // Talent-flatene (det gamle TalentHQ-produktet).
  "/portal/talent",
  // Booking av enkelttimer (betalt per time — åpen som salgskanal).
  "/portal/booking",
  // Konto, abonnement (oppgraderingsveien MÅ alltid være nåbar), varsler.
  "/portal/meg",
  "/portal/varsler",
  "/portal/oppgrader",
] as const;

/**
 * Er ruten åpen for TALENT-profilen? "/portal" alene er hjem-skjermen —
 * eksakt match; andre oppføringer dekker undertrær.
 */
export function erApenForTalent(pathname: string): boolean {
  const ren = pathname.replace(/\/+$/, "") || "/";
  return TALENT_APNE_PREFIKSER.some((p) =>
    p === "/portal" ? ren === "/portal" : ren === p || ren.startsWith(`${p}/`),
  );
}
