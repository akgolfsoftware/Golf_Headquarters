# OW-3 — én økt-modell: migreringsplan

Skrevet 16.09.2026. Ingen kode er endret av dette dokumentet — det er research og en plan til
godkjenning, per Anders' beskjed («skriv en detaljert plan først, ingen kode»).

Kilde for oppdraget: `docs/MASTERPLAN-GJENSTAAENDE.md` OW-3 og
`.claude/rules/beslutninger.md` §WORKBENCH-MOTOREN (15.09.2026): «`WorkbenchSession` er
tabellen som overlever; `TrainingPlanSession`-økter migreres inn. Avgjør samtidig hva som
skjer med `TrainingSessionV2` (gjennomføring/live).» Allerede notert i
`docs/platform/BUSINESS-RULES.md` §Live-økter — tre datamodeller.

## 1. Hvorfor dette er en kode-risiko, ikke en data-risiko

Basen ble nullstilt 30.08.2026 (kun testdata siden). Målt i produksjonsdatabasen 16.09.2026:

| Tabell | Rader | Status-fordeling |
|---|---|---|
| `workbench_sessions` | 9 | 7 PUBLISHED, 1 IN_PROGRESS, 1 COMPLETED |
| `training_plan_sessions` | 12 | 12 PLANNED (alle daterte mai–juni 2026 — eldre enn nullstillingen) |
| `training_sessions_v2` | 21 | 8 PLANNED, 3 IN_PROGRESS, 10 COMPLETED |
| `session_drills` | 0 | — |
| `training_plan_session_logs` | 0 | — |
| `clubs_practiced` | 0 | — |
| `session_participants` | 0 | — |
| `workbench_drills` | 11 | — |

**Konsekvens:** selve datamigreringen er triviell — 12 rader, ingen barn-rader å flette. Den
reelle risikoen er at **40+ kodefiler** leser/skriver disse modellene i dag (planlegger,
live-økter, agent-pipeline, statistikk, forelderportal, Caddie-verktøy, GDPR-anonymisering),
og at tre parallelle datamodeller i dag løses opp i sekvens av `resolve-live-session.ts`
(`TrainingSessionV2` → `TrainingPlanSession` → `WorkbenchSession`). En feil her rammer ikke
gamle rader — den rammer NESTE spiller som logger inn.

## 2. Navneforvirringen som må ryddes samtidig

Kildekoden har i dag TO kodeveier som begge heter «workbench», men peker på ulike modeller:

- **`src/lib/workbench/wb-actions.ts` + `src/lib/domain/workbench/operations.ts`** — den
  faktiske `WorkbenchSession`-motoren. Betjener `/admin/workbench/[playerId]`,
  `/portal/(fullscreen)/tren/wb`, `/portal` (hjem/«I dag»), `WorkbenchV2`.
- **`src/app/portal/planlegge/workbench/actions.ts` + `src/lib/workbench/session-actions.ts`,
  `session-update.ts`, `session-move.ts`, `duplicate-week.ts`, `duplicate-session.ts`,
  `apply-template-actions.ts`, `load-workbench.ts`** — bruker faktisk `TrainingPlanSession`,
  til tross for filnavnet. Betjener ruten `/portal/planlegge/workbench`.

Migreringen løser denne forvirringen som en bieffekt: når `TrainingPlanSession` fases ut,
peker ALT som heter «workbench» i filsystemet på `WorkbenchSession`.

## 3. Målbilde — feltene `WorkbenchSession` må dekke

`WorkbenchSession` mangler i dag feltene som gjør `TrainingPlanSession` nyttig for eldre
planer og live-visning. Nye, valgfrie felt (additiv migrering):

| Nytt felt på `WorkbenchSession` | Kilde i `TrainingPlanSession` | Kommentar |
|---|---|---|
| `planId String?` | `planId` (påkrevd der) | Valgfri — kun eldre planer har den |
| `rationale String?` | `rationale` | Fritekst-begrunnelse |
| `skillArea SkillArea?` | `skillArea` | |
| `environment SessionEnvironment?` | `environment` | `WorkbenchSession.environment` er i dag `String?` — vurder om det skal bli samme enum, eller om enumet konverteres til String slik resten av WorkbenchSession gjør (se §6) |
| `lFase LFase?`, `miljo MMiljo?`, `csNivaa CSNivaa?` | samme | Utgåtte v1-koder (§17 i ordbok-masteren) — vurder om disse i det hele tatt skal videreføres, eller om de kun leses historisk og aldri skrives nytt (se åpent spørsmål 4) |
| `pPosisjoner String[]` | `pPosisjoner` | |
| `maalsetning String?` | `maalsetning` | |
| `liveSnapshot Json?` | `liveSnapshot` | Brukt av live-visning |
| `pressureLevel PressureLevel?` | `pressureLevel` | |

Barn-tabeller: `SessionDrill` (0 rader), `TrainingPlanSessionLog` (0 rader),
`ClubsPracticed` (0 rader) har alle relasjon til `sessionId`. Siden alle er tomme, trenger de
ingen datamigrering — kun at `WorkbenchDrill` (11 rader i dag) evt. utvides til å dekke det
`SessionDrill` kunne uttrykke, eller at de tre barnetabellene re-pekes til
`WorkbenchSession`/`WorkbenchDrill` via en ny valgfri FK.

## 4. `TrainingSessionV2` — anbefalt disposisjon

`TrainingSessionV2` er gjennomførings-/live-laget og har egne konsepter `WorkbenchSession`
ikke har: delte økter (`SessionParticipant`, `isShared`, `hostId`), rekurrens (`rrule`,
`recurringGroupId`), pause-tid, vurdering (fokus/gjennomføring/mestring), og et unikt
generert-fra-par `(generertFra, generertFraId)` som i dag speiles fra `TrainingPlanSession`
via `src/lib/workbench/v2-sync.ts`.

**Anbefaling: `TrainingSessionV2` består som eget lag for gjennomføring/live — det slås IKKE
sammen med `WorkbenchSession`.** Begrunnelse: delte økter og rekurrens er ekte,
brukte konsepter uten motstykke i `WorkbenchSession`, og en sammenslåing ville tvunget
`WorkbenchSession` (spillerens PLAN) til å bære live-gjennomføringsfelter den ikke trenger for
90 % av radene. Dette er konsistent med `BUSINESS-RULES.md`s opprinnelige begrunnelse for at
de tre modellene «sameksisterer bevisst».

**Det som endres:** `v2-sync.ts` sin kilde re-pekes fra `TrainingPlanSession` til
`WorkbenchSession` — når en `WorkbenchSession` publiseres, speiles den til
`TrainingSessionV2` på samme måte som `TrainingPlanSession` gjør i dag.
`resolve-live-session.ts` forenkles fra tre til to trinn: `TrainingSessionV2` →
`WorkbenchSession`.

Dette **er** en beslutning om V2, som masterplanen ber om — men den bør bekreftes av Anders
før bygging, ikke antas.

## 5. Faseplan

Hver fase avsluttes med `npm run verify` grønt og egen commit/PR. Ingen fase sletter
`TrainingPlanSession`-modellen før alle lesere er flyttet og verifisert.

1. **Skjemautvidelse (additiv).** Legg de nye valgfrie feltene fra §3 til `WorkbenchSession`
   (og evt. barnetabell-utvidelse). Kjøres kirurgisk mot `DIRECT_URL`
   (`ALTER TABLE ... ADD COLUMN IF NOT EXISTS`), aldri `migrate dev`/`db push`/`migrate deploy`
   (gotchas.md). Ingen lesere/skrivere endres ennå.
2. **Datamigrering (12 rader).** Ett engangsskript kopierer de 12 `training_plan_sessions`-
   radene inn i `workbench_sessions` med feltmapping fra §3. Idempotent, kjørbart flere ganger
   (skip rader som allerede har en matchende `WorkbenchSession`, f.eks. via et midlertidig
   `migrertFraTrainingPlanSessionId`-felt som fjernes i fase 6).
3. **Ny-skriving stanses mot `TrainingPlanSession`.** `/portal/planlegge/workbench/actions.ts`
   og støttefilene (`session-actions.ts`, `session-update.ts`, `session-move.ts`,
   `duplicate-week.ts`, `duplicate-session.ts`, `apply-template-actions.ts`) skrives om til å
   bruke `wb-actions.ts`/`domain/workbench/operations.ts` i stedet for å konstruere egne
   `TrainingPlanSession`-spørringer. Dette er den STØRSTE enkeltfasen — samme rute
   (`/portal/planlegge/workbench`), ny modell under.
4. **`v2-sync.ts` re-pekes.** Speilingen til `TrainingSessionV2` bytter kilde fra
   `TrainingPlanSession` til `WorkbenchSession`. `resolve-live-session.ts` går fra tre til to
   trinn.
5. **Lesere flyttes, gruppevis.** ~35 gjenværende lesefiler flyttes i temagrupper, hver egen
   PR med egen verifisering:
   - Gruppe A — live-flyt: `/portal/(fullscreen)/live/[sessionId]/*`, `portal-live/*`,
     `portal-gjennomfore/*`, `portal-okt/*`.
   - Gruppe B — agent-pipeline: `lib/agents/live-coach-agent.ts`, `plan-action-executor.ts`,
     `round-agent.ts`, `maanedsrapport.ts`, `plan-engine/load-signals.ts`, `ai-plan/*`.
   - Gruppe C — statistikk/rapporter: `admin/analyse/*`, `admin/ukesrapport.ts`,
     `admin-compliance/*`, `admin-spiller/*`, `widgets/stall-okter-data.ts`, `health/*`.
   - Gruppe D — forelder + Caddie: `app/forelder/*`, `lib/forelder.ts`, `caddie/tools/read.ts`,
     `portal-chat/tools.ts`, `ai/live-coach-context.ts`.
   - Gruppe E — resten (portal-lesere, kalender, mål, GDPR-anonymisering).
6. **Opprydding.** Fjern midlertidig migreringsfelt, fjern `TrainingPlanSession`-modellen
   (og barnetabellene, alle fortsatt tomme) fra schema når gruppe A–E er verifisert i
   produksjon en periode. `resolve-live-session.ts` renskrives til kun `TrainingSessionV2` →
   `WorkbenchSession`.

## 6. Åpne spørsmål til Anders (må avklares før fase 1–3 starter)

1. **Enum vs. String på `WorkbenchSession`.** `WorkbenchSession` lagrer i dag `status`,
   `blockType`, `environment`, `practiceType` som rå `String` («for å slippe å utvide et delt
   enum i prod», ifølge feltkommentaren). `TrainingPlanSession` bruker ekte Prisma-enumer.
   Skal de nye feltene (`skillArea`, `environment` osv.) være ekte enumer eller strenger på
   `WorkbenchSession`? Ekte enum gir typesikkerhet; streng er konsistent med resten av
   modellen og unngår en ny «utvid delt enum i prod»-runde.
2. **L-fase/M-miljø/CS-nivå — skal de videreføres i det hele tatt?** Dette er utgåtte v1-koder
   (§17 i ordbok-masteren). De 12 gamle radene kan ha verdier her, men skal ny kode noensinne
   kunne SKRIVE dem på en `WorkbenchSession`, eller kun lese dem historisk (frosset)?
3. **`generertFraId`-formatet i `v2-sync.ts`.** I dag pekes `TrainingSessionV2` mot en
   `TrainingPlanSession.id`. Når kilden blir `WorkbenchSession`, må eksisterende
   `training_sessions_v2`-rader med `generertFra: WORKBENCH_PLAN` (4 rader i dag) vurderes:
   peker de allerede mot riktig id-rom, eller må de også migreres?
4. **Rekkefølge på fase 5-gruppene.** Foreslått A→E over følger «det som er synlig for
   spilleren/coachen først». Er det en annen rekkefølge Anders vil prioritere (f.eks.
   agent-pipelinen før statistikken, siden agentene skriver tilbake til planen)?
5. **Ferdig-kriterium per fase.** Skal hver av de 5 lesegruppene i fase 5 skjermbilde-testes
   (jf. skjermbilde-gaten i CLAUDE.md) før commit, eller holder komponent-/enhetstester siden
   dette er en bakenforliggende datakilde-bytte uten UI-endring?

## 7. Ikke i denne planen

- Selve implementasjonen — ingen av fasene over er startet.
- WANG/GFGK-spesifikke konsekvenser er ikke undersøkt separat; samme faseplan antas å dekke
  dem siden de bruker samme modeller.
- Ingen beslutning om hvorvidt `OW-3b` (coach bruker `WorkbenchV2`, se masterplanen) skal
  bygges parallelt eller etter denne migreringen — de er koblet (samme motor), men er egne
  rader i arbeidslisten.
