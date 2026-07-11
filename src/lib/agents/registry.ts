// Agent registry — én sannhetskilde for admin UI og cron-dokumentasjon.

export type AgentRegistryEntry = {
  slug: string;
  navn: string;
  trigger: string;
  beskrivelse: string;
  kategori: "coach" | "ops" | "llm";
};

export const AGENT_REGISTRY: AgentRegistryEntry[] = [
  {
    slug: "round-agent",
    navn: "Round Agent",
    trigger: "Etter ny runde",
    beskrivelse: "Beregner SG-snitt siste 30 dager og skriver til Signal.",
    kategori: "coach",
  },
  {
    slug: "test-agent",
    navn: "Test Agent",
    trigger: "Etter ny test",
    beskrivelse: "Trend-analyse per test (siste vs snitt forrige 3).",
    kategori: "coach",
  },
  {
    slug: "trackman-agent",
    navn: "TrackMan Agent",
    trigger: "Etter CSV-import",
    beskrivelse: "Per-kølle-statistikk fra rawJson.",
    kategori: "coach",
  },
  {
    slug: "sg-analyse-ekspert",
    navn: "SG-analyse-ekspert",
    trigger: "Etter round-agent",
    beskrivelse: "Dypere SG-tolkning og spillervennlig PlanAction-forslag.",
    kategori: "llm",
  },
  {
    slug: "treningsdata-ekspert",
    navn: "Treningsdata-ekspert",
    trigger: "Etter test/round (manuell)",
    beskrivelse: "Korrelasjon treningsvolum vs SG — flagger negativ effekt.",
    kategori: "llm",
  },
  {
    slug: "plan-effectiveness-agent",
    navn: "Plan-effectiveness",
    trigger: "Cron søndag 20:00",
    beskrivelse: "Flagger planer med lav completion eller negativ SG-effekt.",
    kategori: "coach",
  },
  {
    slug: "plan-watcher",
    navn: "Plan Watcher",
    trigger: "Cron mandag 06:00",
    beskrivelse: "Sjekker forrige uke, genererer PYRAMID_ADJUST-forslag ved avvik.",
    kategori: "coach",
  },
  {
    slug: "periodiseringsagent",
    navn: "Periodiseringsagent",
    trigger: "Ved ny TrainingPlan",
    beskrivelse: "Foreslår initial uke-allokering for nye planer.",
    kategori: "coach",
  },
  {
    slug: "achievement-agent",
    navn: "Achievement Agent",
    trigger: "Etter round/test",
    beskrivelse: "Sjekker streak/SG/first-time-milepæler.",
    kategori: "coach",
  },
  {
    slug: "training-gap",
    navn: "Training Gap",
    trigger: "Cron mandag 06:30",
    beskrivelse:
      "Finner svakeste SG-område og genererer TRAINING_GAP-forslag hvis det får < 20 % av treningstid.",
    kategori: "coach",
  },
  {
    slug: "turnering-agent",
    navn: "Turnering-agent",
    trigger: "Cron daglig 07:00",
    beskrivelse: "Spillere med turnering innen 7 dager får PERIOD_SWITCH-forslag.",
    kategori: "coach",
  },
  {
    slug: "calendar-sync",
    navn: "Calendar Sync",
    trigger: "Cron hvert 15. min",
    beskrivelse:
      "2-veis synkronisering med Google Calendar: henter endringer og pusher bookinger uten event-ID.",
    kategori: "ops",
  },
  {
    slug: "daily-brief",
    navn: "Daily Brief",
    trigger: "Cron daglig 05:30",
    beskrivelse:
      "Genererer morgenbrief per coach. Varsler ved hastefunn (severity 4+).",
    kategori: "llm",
  },
  {
    slug: "drill-forslag",
    navn: "Drill-forslag",
    trigger: "Cron mandag 08:00",
    beskrivelse: "Foreslår 5 driller basert på stallens svakeste SG-område.",
    kategori: "llm",
  },
  {
    slug: "plan-revisjon",
    navn: "Plan-revisjon",
    trigger: "Manuell (velg plan)",
    beskrivelse: "Foreslår plan-justeringer for valgt treningsplan.",
    kategori: "llm",
  },
  {
    slug: "peaking",
    navn: "Peaking",
    trigger: "Manuell (velg spiller)",
    beskrivelse: "Foreslår periodisering frem mot valgt turnering.",
    kategori: "llm",
  },
  {
    slug: "live-coach-agent",
    navn: "Live Coach Agent",
    trigger: "Ved start live økt",
    beskrivelse: "Oppretter økt-bundet AI-tråd og sender velkomst til spiller.",
    kategori: "llm",
  },
  {
    slug: "swing-video-analyst",
    navn: "Video-analytiker (stub)",
    trigger: "Ved video-opplasting i live-økt",
    beskrivelse: "Bekrefter mottak av swing-video i LIVE-tråden. Ingen bildeanalyse ennå.",
    kategori: "llm",
  },
];

export const AGENT_INFO = Object.fromEntries(
  AGENT_REGISTRY.map((a) => [
    a.slug,
    { navn: a.navn, trigger: a.trigger, beskrivelse: a.beskrivelse },
  ]),
) as Record<string, { navn: string; trigger: string; beskrivelse: string }>;