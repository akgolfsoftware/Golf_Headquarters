# Kodeordre: AgencyOS — fra designfasit til Golf_Headquarters

Kjøres i Claude Code mot `~/Developer/akgolf-hq` (repo: akgolfsoftware/Golf_Headquarters).
Sjekk først: `git remote -v`. Designfasit: `agencyos-hq.html`.
Rekkefølgen er avhengighetsstyrt. CLAUDE.md-regel gjelder: ingen nye parallelle
token-systemer før Open Design er avklart — alt under er logikk og struktur.

## 1 · AiMemory i Prisma (blokkerer alt minnearbeid)
- `prisma/schema.prisma`: modell `AiMemory { id, userId, key, value, updatedAt }`, unique (userId, key). Migrasjon.
- `src/lib/ai/memory.ts`: in-memory-Map → Prisma. API-et (rememberFact m.fl.) er riktig; kallerne endres ikke.
- Verifiser: Caddie husker en beslutning over server-restart.

## 2 · modelFor(agent) i stedet for COACH_MODEL
- `src/lib/ai/client.ts`: konstant → `modelFor(agentId): string` + register:
  - **opus**: plan-revisjon, sg-interpretation, performance-peaking, swing-video-analyst, plan-effectiveness, ai-code-reviewer
  - **sonnet** (default): caddie, caddie-proactive, daily-brief, meg-*, live-coach-agent, demand-predictor
  - **haiku**: notion-sync, calendar-sync, wagr-sync, betalings-purring, lead-oppfolging, booking-*-monitor, meg-loftesjekk, meg-crm-nudge
- `src/lib/anthropic.ts`: fjern dobbeltkilden, importer fra client.ts.

## 3 · CANON-invariantene på Workbench
- `src/lib/canon/` er skrevet og testet, null importer utenfor mappa.
- Koble `validateSessionConstraints` inn i TrainingSessionV2-lagringsstien og i ukeberegningen Workbench bruker.
- `session-generator.ts` returnerer hardkodet tom `regelBrudd` — fjern hardkodingen.
- Kontrakt: brudd er ANBEFALING med «overstyr med begrunnelse» (InvariantOverride-logg), aldri sperre.
  Budsjettlinje: «CANON x/9 · \<brudd\>» og «CANON x/9 · overstyrt».

## 4 · Én pyramidefordeling
- Fire kilder i dag: STANDARD_MAL, STANDARD_PYRAMIDE, PERIODE_CONSTRAINTS, fritekst i AI-prompt.
- Velg PERIODE_CONSTRAINTS som eneste kilde, eksporter fra ett sted i `src/lib/canon/`,
  la agenter/plan-generator/validering importere derfra.

## 5 · Proveniens på PlanAction/Signal
- Kontrakt: hvert forslag i Kø har «Hvorfor?» — agent, kjøretid, modell, datagrunnlag, regel.
- Schema: `provenance Json` på PlanAction og Signal (agentId, ranAt, model, facts[], rule).
- Agentene fyller det ved opprettelse; `byggAiDispatch` sender videre til klienten.

## 6 · Kalender/Workbench-tidsgrid
- 04:00–23:00, 20-min snap, 1px = 1min, drag/resize/piltaster, bakgrunnslag for skole og booking, låste ankere.
- Gjelder `/admin`-kalenderen og TrainingSessionV2-Workbench.
- Datamodellen har alt (LockedAnchor, CoachAvailability, SchoolScheduleEntry) — ren UI-jobb i eksisterende tokensystem.

## 7 · Nav-kutt og Alt-indeksen
- `/admin/agencyos`-nav: Hjem, Kø, Stall, Kalender, Workbench, Alt.
- Alt-flaten = samme registerdata som Cmd+K (én kilde), med nivå-badge (samtale/artefakt/flate) per rad.
- Statuslinje nederst på desktop: versjon · uke · periode | agentfeil | MRR | innsikter | CANON-status. Alle klikkbare.

## Ikke i denne ordren
- Tokens/Claude Paper — venter på Open Design-beslutningen.
- Varelager/faktura/timeliste — trenger datamodellbeslutning først.
- P0-listen (DKIM, DNS, Stripe live, Google-reauth) — manuelle oppgaver, ikke kode.
