/**
 * AgencyOS — agent-register (13 agenter). Kanonisk kilde, flyttet hit fra
 * `src/app/admin/agents/page.tsx` (PR «feature/agenticos-hub», 2026-08-13) da
 * /admin/agents ble en ren redirect til /admin/agenticos og trengte ETT sted
 * å lese registreringen fra i stedet for at hub-siden importerte fra en
 * redirect-side. `src/app/admin/agents/[agentId]/page.tsx` har fortsatt sin
 * egen `AGENT_KONFIG` (lengre beskrivelser) — se den filens kommentar for
 * hvorfor de to registrene ikke er slått sammen ennå (PR «agent-detalj»).
 *
 * MANUELLE_AGENTER (ryddet 2026-08-17): `src/app/admin/agents/actions.ts`
 * sin MANUELT-map lister 11 agent-slugs som ALLE kan tvinges i gang fra
 * Mission Control («Kjør nå») — men det er en annen egenskap enn å IKKE ha
 * en tidsplan. 9 av de 11 (plan-watcher, training-gap, daily-brief,
 * drill-forslag, availability-gap-filler, booking-conflict-monitor,
 * ai-code-reviewer, demand-predictor, 24-7-booking-alerts) har egen
 * cron-oppføring i `vercel.json` og kjører altså automatisk — å telle dem
 * som «manuelle» i KPI-en («N kan kjøres manuelt») ga coachen inntrykk av at
 * de MÅ trigges for hånd. MANUELLE_AGENTER speiler derfor ikke lenger
 * actions.ts 1:1 — den er kuttet ned til agentene som faktisk mangler en
 * tidsplan (se AGENTER_UTEN_TIDSPLAN under, samme innhold, eksportert under
 * begge navn for lesbarhet på kallstedet).
 */

/**
 * Agenter UTEN tidsplan: registrert i AGENTS-map
 * (`src/app/api/cron/[agent]/route.ts`) og i Mission Controls MANUELT-map
 * (kan tvinges i gang fra /admin/agents), men har INGEN oppføring i
 * `vercel.json` sine `crons` — kjører altså kun når noen trykker «Kjør nå».
 * Ikke legg dem i vercel.json uten Anders' eksplisitte beslutning.
 */
export const AGENTER_UTEN_TIDSPLAN = ["booking-optimizer", "availability-24-7-monitor"];

/** Bakoverkompatibelt navn — samme innhold som AGENTER_UTEN_TIDSPLAN. */
export const MANUELLE_AGENTER = AGENTER_UTEN_TIDSPLAN;

export const AGENT_INFO: Record<string, { navn: string; trigger: string; beskrivelse: string }> = {
  "round-agent": {
    navn: "Round Agent",
    trigger: "Etter ny runde",
    beskrivelse: "Beregner SG-snitt siste 30 dager og skriver til Signal.",
  },
  "test-agent": {
    navn: "Test Agent",
    trigger: "Etter ny test",
    beskrivelse: "Trend-analyse per test (siste vs snitt forrige 3).",
  },
  "trackman-agent": {
    navn: "TrackMan Agent",
    trigger: "Etter CSV-import",
    beskrivelse: "Per-kølle-statistikk fra rawJson.",
  },
  "plan-watcher": {
    navn: "Plan Watcher",
    trigger: "Cron mandag 06:00",
    beskrivelse: "Sjekker forrige uke, genererer PYRAMID_ADJUST-forslag ved avvik.",
  },
  periodiseringsagent: {
    navn: "Periodiseringsagent",
    trigger: "Ved ny TrainingPlan",
    beskrivelse: "Foreslår initial uke-allokering for nye planer.",
  },
  "achievement-agent": {
    navn: "Achievement Agent",
    trigger: "Etter round/test",
    beskrivelse: "Sjekker streak/SG/first-time-milepæler.",
  },
  "training-gap": {
    navn: "Training Gap",
    trigger: "Cron mandag 06:30",
    beskrivelse: "Finner svakeste SG-område og genererer TRAINING_GAP-forslag hvis det får < 20 % av treningstid.",
  },
  "turnering-agent": {
    navn: "Turnering-agent",
    trigger: "Cron daglig 07:00",
    beskrivelse: "Spillere med turnering innen 7 dager får PERIOD_SWITCH-forslag.",
  },
  "calendar-sync": {
    navn: "Calendar Sync",
    trigger: "Cron hvert 15. min",
    beskrivelse: "2-veis synkronisering med Google Calendar: henter endringer (pull) og pusher bookinger uten event-ID (repair).",
  },
  "daily-brief": {
    navn: "Daily Brief",
    trigger: "Cron daglig 05:30",
    beskrivelse: "Genererer morgenbrief per coach (økter, flagg, neste turnering). Varsler coach + Anders på Telegram ved hastefunn (severity 4+).",
  },
  "drill-forslag": {
    navn: "Drill-forslag",
    trigger: "Cron mandag 08:00",
    beskrivelse: "Finner stallens svakeste SG-område siste 60 dager og foreslår 5 driller via Claude (med YouTube-video når YOUTUBE_API_KEY er satt). Godkjennes på /admin/drills/forslag.",
  },
  "plan-revisjon": {
    navn: "Plan-revisjon",
    trigger: "Manuell (velg plan)",
    beskrivelse: "Foreslår konkrete plan-justeringer for en valgt treningsplan og trigger (siste runde / skade / turneringsprep). Kjøres fra agent-detaljene.",
  },
  peaking: {
    navn: "Peaking",
    trigger: "Manuell (velg spiller)",
    beskrivelse: "Foreslår uke-for-uke periodisering (Bompa) frem mot en valgt turnering for en spiller. Kjøres fra agent-detaljene.",
  },
};
