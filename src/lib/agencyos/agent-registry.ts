/**
 * AgencyOS — agent-register (13 agenter). Kanonisk kilde, flyttet hit fra
 * `src/app/admin/agents/page.tsx` (PR «feature/agenticos-hub», 2026-08-13) da
 * /admin/agents ble en ren redirect til /admin/agenticos og trengte ETT sted
 * å lese registreringen fra i stedet for at hub-siden importerte fra en
 * redirect-side. `src/app/admin/agents/[agentId]/page.tsx` har fortsatt sin
 * egen `AGENT_KONFIG` (lengre beskrivelser) — se den filens kommentar for
 * hvorfor de to registrene ikke er slått sammen ennå (PR «agent-detalj»).
 *
 * MANUELLE_AGENTER speiler MANUELT-nøklene i
 * `src/app/admin/agents/actions.ts` — kan ikke importeres direkte derfra
 * fordi "use server"-filer kun kan eksportere async funksjoner, ikke
 * konstanter.
 */

export const MANUELLE_AGENTER = [
  "plan-watcher",
  "training-gap",
  "daily-brief",
  "drill-forslag",
  "booking-optimizer",
  "availability-24-7-monitor",
  "availability-gap-filler",
  "booking-conflict-monitor",
  "ai-code-reviewer",
  "demand-predictor",
  "24-7-booking-alerts",
];

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
