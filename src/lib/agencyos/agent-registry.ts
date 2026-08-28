/**
 * AgencyOS — agent-register. Kanonisk kilde, flyttet hit fra
 * `src/app/admin/agents/page.tsx` (PR «feature/agenticos-hub», 2026-08-13) da
 * /admin/agents ble en ren redirect til /admin/agenticos og trengte ETT sted
 * å lese registreringen fra i stedet for at hub-siden importerte fra en
 * redirect-side.
 *
 * H6 (2026-08-17): utvidet fra 13 til hele agent-flåten i `src/lib/agents/`
 * — kanonisk slug er navnet agenten faktisk logger som i AgentRun
 * (agentName). Detaljsidens gamle AGENT_KONFIG er samtidig slått inn hit
 * (feltet `langBeskrivelse`), så /admin/agents/[agentId] leser samme kilde.
 *
 * AVGRENSNING: cron-jobber UTENFOR `src/lib/agents/` (sg-insights,
 * datagolf-sync, club-trends, benchmark-sync, turneringer-*, pga-*,
 * meg-*-briefs, dedupe-player-names, norge-mandag-sync m.fl.) er BEVISST
 * ikke registrert — de er datasyncs, og om de skal regnes som agenter er en
 * Anders-beslutning. Ikke legg dem inn uten den.
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
export const AGENTER_UTEN_TIDSPLAN = [
  "booking-optimizer",
  "availability-24-7-monitor",
  "social-media",
];

/** Bakoverkompatibelt navn — samme innhold som AGENTER_UTEN_TIDSPLAN. */
export const MANUELLE_AGENTER = AGENTER_UTEN_TIDSPLAN;

export type AgentStatus = "aktiv" | "beta" | "planlagt";

export type AgentInfo = {
  navn: string;
  trigger: string;
  beskrivelse: string;
  /** Lengre beskrivelse for detaljsiden (/admin/agents/[agentId]) — faller tilbake til `beskrivelse`. */
  langBeskrivelse?: string;
  /** Statusmerke på detaljsiden. Utelatt = "aktiv". */
  status?: AgentStatus;
  /**
   * Andre agentName-verdier SAMME fil logger under i AgentRun (f.eks.
   * purring/bekreftet-kjøringer). Statistikk aggregeres inn under denne
   * raden — aliasene skal aldri fremstå som egne agenter i tabellen.
   */
  aliaser?: string[];
};

export const AGENT_INFO: Record<string, AgentInfo> = {
  // ── Spillerdata-agenter (event-trigget fra triggers.ts) ──────────────
  "round-agent": {
    navn: "Round Agent",
    trigger: "Etter ny runde",
    beskrivelse: "Beregner SG-snitt siste 30 dager og skriver til Signal.",
    langBeskrivelse:
      "Beregner SG-snitt siste 30 dager og skriver SG_TOTAL/OTT/APP/ARG/PUTT til Signal-tabellen etter at spiller logger en ny runde.",
  },
  "test-agent": {
    navn: "Test Agent",
    trigger: "Etter ny test",
    beskrivelse: "Trend-analyse per test (siste vs snitt forrige 3).",
    langBeskrivelse:
      "Sammenligner siste testresultat mot snitt av forrige 3 og skriver TEST_TREND-signal. Krever minst 1 tidligere resultat.",
  },
  "trackman-agent": {
    navn: "TrackMan Agent",
    trigger: "Etter CSV-import",
    beskrivelse: "Per-kølle-statistikk fra rawJson.",
    langBeskrivelse:
      "Grupperer slag per kølle fra rawJson etter CSV-import og skriver CLUB_AVG-signal per kølle.",
  },
  "sg-analyse-ekspert": {
    navn: "SG-analyse-ekspert",
    trigger: "Etter ny runde",
    beskrivelse:
      "Dypere SG-tolkning etter Round Agent: flagger SG-områder under terskel (siste 30 dager) og foreslår treningsfokus med MORAD-feilkandidater. Varsler coach.",
  },
  "treningsdata-ekspert": {
    navn: "Treningsdata-ekspert",
    trigger: "Etter runde/test",
    beskrivelse:
      "Korrelerer treningsvolum mot SG-utvikling siste 30 dager (krever minst 3 runder) og foreslår justering til coach ved svak sammenheng.",
  },
  "achievement-agent": {
    navn: "Achievement Agent",
    trigger: "Etter round/test",
    beskrivelse: "Sjekker streak/SG/first-time-milepæler.",
    langBeskrivelse:
      "Sjekker milepæler (FIRST_ROUND, FIRST_TEST, SG_POSITIVE_30D, STREAK_7/14) etter runde eller test. Dedup mot eksisterende achievements.",
  },
  "live-coach-agent": {
    navn: "Live Coach",
    trigger: "Ved start av live-økt",
    beskrivelse:
      "Finner/oppretter økt-bundet CoachingSession (LIVE) og sender velkomstmelding fra AI Golf Coach — idempotent per økt, kun in-app-varsel.",
  },
  "swing-video-analyst": {
    navn: "Swing Video Analyst",
    trigger: "Ved swing-video i live-økt",
    beskrivelse:
      "Bekrefter mottak av swing-video i LIVE-tråden. Ingen bildeanalyse ennå (stub).",
    status: "beta",
  },

  // ── Plan-agenter ─────────────────────────────────────────────────────
  "plan-watcher": {
    navn: "Plan Watcher",
    trigger: "Cron mandag 06:00",
    beskrivelse: "Sjekker forrige uke, genererer PYRAMID_ADJUST-forslag ved avvik.",
    langBeskrivelse:
      "Sjekker forrige ukes pyramide-fordeling mot måltall (FYS15/TEK20/SLAG35/SPILL20/TURN10). Genererer PYRAMID_ADJUST-forslag ved >8 pp avvik.",
  },
  periodiseringsagent: {
    navn: "Periodiseringsagent",
    trigger: "Ved ny TrainingPlan",
    beskrivelse: "Foreslår initial uke-allokering for nye planer.",
    langBeskrivelse:
      "Foreslår initial uke-allokering for nye treningsplaner basert på MAL_PROSENT-fordeling. Kjører kun for planer uten eksisterende økter.",
  },
  "training-gap": {
    navn: "Training Gap",
    trigger: "Cron mandag 06:30",
    beskrivelse:
      "Finner svakeste SG-område og genererer TRAINING_GAP-forslag hvis det får < 20 % av treningstid.",
    langBeskrivelse:
      "Finner svakeste SG-område og sjekker om spillere trener nok der. Genererer TRAINING_GAP-forslag hvis svakeste område får < 20 % av treningstid.",
  },
  "turnering-agent": {
    navn: "Turnering-agent",
    trigger: "Cron daglig 07:00",
    beskrivelse: "Spillere med turnering innen 7 dager får PERIOD_SWITCH-forslag.",
  },
  "weekly-plan-proposals": {
    navn: "Ukeforslag",
    trigger: "Cron søndag 18:00",
    beskrivelse:
      "Genererer ukeforslag for neste uke per coachet spiller med aktiv plan og legger det som WEEKLY_PROPOSAL i godkjenningskøen — aldri auto-lagring.",
  },
  "plan-effectiveness-agent": {
    navn: "Plan-effektivitet",
    trigger: "Cron søndag 20:00",
    beskrivelse:
      "Flagger planer med lav gjennomføring (< 55 %) eller negativ SG-effekt siste 60 dager og varsler coach.",
  },
  "plan-revisjon": {
    navn: "Plan-revisjon",
    trigger: "Manuell (velg plan)",
    beskrivelse:
      "Foreslår konkrete plan-justeringer for en valgt treningsplan og trigger (siste runde / skade / turneringsprep). Kjøres fra agent-detaljene.",
    langBeskrivelse:
      "Foreslår konkrete plan-justeringer for en valgt treningsplan og trigger (siste runde / skade / turneringsprep). Velg plan under og kjør.",
  },
  peaking: {
    navn: "Peaking",
    trigger: "Manuell (velg spiller)",
    beskrivelse:
      "Foreslår uke-for-uke periodisering (Bompa) frem mot en valgt turnering for en spiller. Kjøres fra agent-detaljene.",
    langBeskrivelse:
      "Foreslår uke-for-uke periodisering (Bompa) frem mot en valgt turnering for en spiller. Velg spiller og turnering under og kjør.",
  },

  // ── Spiller-loop og kundeoppfølging ──────────────────────────────────
  ukesoppsummering: {
    navn: "Ukesoppsummering",
    trigger: "Cron søndag 17:00",
    beskrivelse:
      "Søndagsoppsummering til hver spiller med aktiv plan (økter gjennomført + neste uke) som in-app-varsel og web-push. Samtykke-gatet for mindreårige.",
  },
  "churn-radar": {
    navn: "Churn-radar",
    trigger: "Cron mandag 06:00",
    beskrivelse:
      "Fanger coachede spillere med ≥ 14 dager uten innlogging og legger ferdig meldingsutkast i godkjenningskøen — sendes aldri automatisk.",
  },
  "winback-agent": {
    navn: "Winback",
    trigger: "Cron daglig 05:30",
    beskrivelse:
      "Vinn-tilbake-tilbudet når en spiller sier opp coaching-pakken (behold PlayerHQ): tilbud, påminnelse og utløp — alle trinn idempotente, foresatt-e-post for mindreårige.",
  },
  "betalings-purring": {
    navn: "Betalings-purring",
    trigger: "Cron daglig 05:00",
    beskrivelse:
      "Trapp på utestående betalinger: purring 1 (≥ 3 dg), purring 2 (≥ 10 dg), deretter kø-sak til menneske (≥ 17 dg). Mindreårig → e-post til foresatt, aldri barnet.",
  },
  "lead-oppfolging": {
    navn: "Lead-oppfølging",
    trigger: "Cron daglig 06:00",
    beskrivelse:
      "Gjennomførte gjeste-bookinger (prøvetimer) legges i Lead-pipelinen, og coachen varsles med ferdig pakketilbud-tekst. Sending gjøres alltid av et menneske.",
  },
  "caddie-proactive": {
    navn: "Proaktiv Caddie",
    trigger: "Cron mandag 07:00",
    beskrivelse:
      "Skanner etter inaktive spillere og lager CaddieDraft-forslag i Caddie-dashbordet — Anders åpner i samtale eller avviser. Idempotent per spiller.",
  },

  // ── Booking og drift ─────────────────────────────────────────────────
  "calendar-sync": {
    navn: "Calendar Sync",
    trigger: "Cron hvert 15. min",
    beskrivelse:
      "2-veis synkronisering med Google Calendar: henter endringer (pull) og pusher bookinger uten event-ID (repair).",
    langBeskrivelse:
      "2-veis synkronisering med Google Calendar hvert 15. minutt. Pull: henter events oppdatert siden siste sync og reflekterer kansellering/tidsendring tilbake til Booking-tabellen. Push: reparerer bookinger som mangler googleEventId (missede push-forsøk).",
  },
  "refresh-calendar-watches": {
    navn: "Calendar Watch-fornyer",
    trigger: "Cron daglig 02:00",
    beskrivelse:
      "Fornyer Google Calendar push-varsler som utløper innen 24 timer (Google tillater maks 7 dager per watch). Idempotent per subscription.",
  },
  "booking-reminders": {
    navn: "Booking-påminnelser",
    trigger: "Cron hver time",
    beskrivelse:
      "Sender 24-timers e-postpåminnelse for bekreftede bookinger som starter om 23–25 timer. Idempotent per booking via audit-loggen.",
  },
  "booking-conflict-monitor": {
    navn: "Booking-konfliktvakt",
    trigger: "Cron hvert 30. min",
    beskrivelse:
      "Skanner kommende bookinger (PENDING/CONFIRMED) for tidsoverlapp på samme fasilitet og flagger konflikter.",
  },
  "24-7-booking-alerts": {
    navn: "Proaktive booking-varsler",
    trigger: "Cron hvert 20. min",
    beskrivelse:
      "Foreslår proaktive booking-fremstøt når mange slots står ledige og få bookinger venter.",
  },
  "availability-gap-filler": {
    navn: "Availability Gap Filler",
    trigger: "Cron daglig 07:00",
    beskrivelse:
      "Finner ukedager med lav booking siste 14 dager og foreslår å fylle mer availability der (PlanAction).",
  },
  "availability-24-7-monitor": {
    navn: "Availability Monitor",
    trigger: "Manuell (Kjør nå)",
    beskrivelse:
      "Sjekker at hver coach har nok aktive availability-slots (< 5 gir varsel-forslag). Ingen tidsplan — kjøres fra Mission Control.",
  },
  "booking-optimizer": {
    navn: "Booking Optimizer",
    trigger: "Manuell (Kjør nå)",
    beskrivelse:
      "Analyserer siste 30 dagers bookinger per ukedag og foreslår bedre availability. Ingen tidsplan — kjøres fra Mission Control.",
  },
  "demand-predictor": {
    navn: "Demand Predictor",
    trigger: "Cron daglig 05:00",
    beskrivelse:
      "Grov ukesprediksjon av bookingetterspørsel fra siste 30 dager — forslag om å justere availability deretter.",
  },
  "cleanup-recordings": {
    navn: "Opptaksrydding",
    trigger: "Cron daglig 03:00",
    beskrivelse:
      "Sletter lydfiler fra Supabase Storage når retentionUntil er passert — transkript og AI-analyse beholdes. Idempotent.",
  },
  "ai-code-reviewer": {
    navn: "AI Code Reviewer",
    trigger: "Cron mandag 03:00",
    beskrivelse:
      "Periodisk forslagsliste for booking/AI-koden som PlanAction — statisk liste i dag, ment å trigge AI workspace.",
    status: "beta",
  },

  // ── Rapportering og briefer ──────────────────────────────────────────
  "daily-brief": {
    navn: "Daily Brief",
    trigger: "Cron daglig 05:30",
    beskrivelse:
      "Genererer morgenbrief per coach (økter, flagg, neste turnering). Varsler coach + Anders på Telegram ved hastefunn (severity 4+).",
    langBeskrivelse:
      "Genererer morgenbrief per coach (dagens økter, flagg, neste turnering) og varsler coach + Anders på Telegram ved hastefunn (severity 4+).",
  },
  maanedsrapport: {
    navn: "Månedsrapport",
    trigger: "Cron den 1. kl 04:00",
    beskrivelse:
      "Bygger forrige måneds nøkkeltall per lokasjon (bookinger, innbetalt, nye spillere, økter) og arkiverer i monthly_reports. Kronetall bak VIEW_FINANCE-gaten.",
  },

  // ── Øvelses-motoren (radar → fabrikk → media-løfte → rapport) ────────
  radar: {
    navn: "Radar",
    trigger: "Cron mandag 07:45",
    beskrivelse:
      "Samler inspirasjon til øvelser/tester fra YouTube-søk og RSS (golf.com, golfwrx.com) — lagrer rå funn i RadarFunn, kopierer aldri innhold.",
  },
  fabrikk: {
    navn: "Fabrikk",
    trigger: "Cron mandag 07:50",
    beskrivelse:
      "Leser ubehandlede radar-funn og genererer øvelses-utkast — men KUN når drill-banken har FASIT-drills (hard law: tom bank → ingen generering).",
  },
  "drill-forslag": {
    navn: "Drill-forslag",
    trigger: "Cron mandag 08:00",
    beskrivelse:
      "Finner stallens svakeste SG-område siste 60 dager og foreslår 5 driller via Claude (med YouTube-video når YOUTUBE_API_KEY er satt). Godkjennes på /admin/drills/forslag.",
    langBeskrivelse:
      "Finner stallens svakeste SG-område siste 60 dager og foreslår 5 driller via Claude (YouTube-video når YOUTUBE_API_KEY er satt). Godkjennes på /admin/drills/forslag.",
  },
  "media-lofte": {
    navn: "Media-løfte",
    trigger: "Cron mandag 08:15",
    beskrivelse:
      "Finner øvelser uten video i banken og foreslår én YouTube-video per øvelse (batch på 15) — godkjennes på /admin/drills/forslag.",
  },
  "ukesrapport-ovelser": {
    navn: "Ukesrapport øvelser",
    trigger: "Cron mandag 08:30",
    beskrivelse:
      "Ukentlig oppsummering av hele øvelses-motoren (radar → fabrikk → media-løfte → godkjenningskø) til Telegram og in-app. Ren rapportering, ingen handling.",
  },

  // ── Anders' virksomhets-rytmer (Tripletex / GFGK / Mulligan) ─────────
  "tripletex-lonn-sjekkliste": {
    navn: "Tripletex lønn",
    trigger: "Cron den 3. kl 06:00 (purring den 6.)",
    beskrivelse:
      "Lønnssjekkliste til Anders den 3. hver måned, purring den 6. hvis ikke bekreftet. Utfører aldri lønnskjøringer — bekreftelse skjer manuelt.",
    aliaser: ["tripletex-lonn-purring", "lonn-bekreftet"],
  },
  "tripletex-maanedsavslutning": {
    navn: "Tripletex månedsavslutning",
    trigger: "Cron den 2. kl 06:00",
    beskrivelse:
      "Sender forrige måneds resultattall fra Tripletex — eller en tydelig «tall mangler»-melding. Budsjett-avviket (> 10 %) venter på en budsjettkilde.",
  },
  "gfgk-ballplukking-sjekk": {
    navn: "GFGK ballplukking",
    trigger: "Cron onsdag 09:00",
    beskrivelse:
      "Sjekker onsdag at ansvarlig for torsdagens ballplukking er bekreftet — uten bekreftelse går ett varsel til Anders, aldri til juniorer.",
    aliaser: ["ballplukking-bekreftet"],
  },
  "mulligan-vaskeliste-sjekk": {
    navn: "Mulligan vaskeliste",
    trigger: "Cron mandag 08:00",
    beskrivelse:
      "Sjekker at ukas vaskeliste-ansvar er bekreftet (rullering Anders/Christoffer) og varsler Anders — systemet gjetter aldri hvem sin tur det er.",
    aliaser: ["vaskeliste-bekreftet"],
  },

  // ── Systemvakter ─────────────────────────────────────────────────────
  "sync-vaktbikkje": {
    navn: "Sync-vaktbikkje",
    trigger: "Cron mandag 08:00",
    beskrivelse:
      "Sjekker at eksterne data-syncer (turneringer, SG-baseline, PGA-sesong) faktisk har levert ferske data, og varsler Anders i klarspråk når en synk står.",
  },
  "wagr-sync": {
    navn: "WAGR-synk",
    trigger: "Cron onsdag 06:15",
    beskrivelse:
      "Henter WAGR-rankinger fra wagr.com (skånsom ukentlig henting) og kobler snapshots til spillere på entydig navn. Borte fra WAGR = blitt proff.",
  },

  "social-media": {
    navn: "SoMe-utkast",
    trigger: "Manuell (Kjør nå)",
    beskrivelse:
      "Lager Instagram- og Facebook-utkast fra nylige treninger og legger dem i godkjenningskøen. Publiserer aldri selv.",
    langBeskrivelse:
      "Leser økter siste 7 dager (tittel og pyramide, uten navn) og skriver PENDING SOCIAL_POST i /admin/godkjenninger. Ingen auto-publisering.",
  },
};

/** Oppslag alias-agentName → kanonisk slug (bygget én gang fra AGENT_INFO). */
const ALIAS_TIL_SLUG: Record<string, string> = {};
for (const [slug, info] of Object.entries(AGENT_INFO)) {
  for (const alias of info.aliaser ?? []) ALIAS_TIL_SLUG[alias] = slug;
}

/** Kanonisk slug for et agentName fra AgentRun — aliaser mappes til hovedagenten. */
export function kanoniskSlug(agentName: string): string {
  return ALIAS_TIL_SLUG[agentName] ?? agentName;
}

/** Alle agentName-verdier en registrert agent logger under (hovedslug + aliaser). */
export function agentNavnFor(slug: string): string[] {
  return [slug, ...(AGENT_INFO[slug]?.aliaser ?? [])];
}
