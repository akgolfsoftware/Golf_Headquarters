# Teknisk plan — videreutvikling via eksisterende funksjoner (2026-06-28)

> Hvordan den tekniske planen kan bli kraftigere ved å koble den til funksjoner som ALLEREDE finnes
> i prosjektet. «Ny kobling» = funksjonen finnes, men er ikke knyttet til teknisk plan ennå.

## 1. Data-drevet diagnose → foreslåtte oppgaver (TrackMan + SG + tester)
Finnes: TrackMan (`TrackManShot`/`ClubMetricTrend`: clubPath, faceAngle, smash, strikePattern, faceToPath),
`trackman-agent` (lager `SgInsight`), SG-diagnose (`diagnostiserSg`/krise), NGF-tester (`TestResult`).
**Kobling:** la trackman-/test-/SG-signaler **foreslå konkrete `PositionTask`** — f.eks. «faceAngle drifter åpen
→ oppgave i P6/P7», «SG-ARG i krise → kortspill-teknikk», «test X svak → mobilitet». Coach godkjenner (gjenbruk
`PlanAction`/godkjenningsflyt). Da bygges planen *fra spillerens faktiske data*, ikke bare magefølelse.

## 2. AI-generert teknisk plan (AI-plan-generator + agent-team + øvelsesbank)
Finnes: `src/lib/ai-plan/generate.ts` (lager planer), agent-team, øvelsesbank-generator.
**Kobling:** auto-**utkast** av en teknisk plan fra nå-situasjonen (TM + SG + kategori A–K) → coach redigerer/godkjenner.
Agent-team/øvelsesbank kan **finne drills + video** for hver P-oppgave automatisk.

## 3. Lukk loopen: live-logging + TrackMan-bevis → fremdrift + stagnasjon-varsel
Finnes: live-økt-logger (`TrainingSessionV2`/`SessionDrillInstance`), `PositionTaskLog` (auto-oppdaterer reps),
TM-mål-protokoller (`PositionTaskTmGoal`: ROLLING_WINDOW/STREAK/SESSION_GATE), `trackStatus` PÅ_VEI/STAGNERER/FERDIG.
**Kobling:** logg tekniske reps i live-økt → fremdrift oppdateres → TM-import etter økt **måler om endringen sitter**
→ agent flagger **stagnasjon** (STAGNERER) til Handlingssenter. «Repeterbar levering» blir faktisk målt over tid.

## 4. Periodisering + konkurranse + belastning
Finnes: `PeriodBlock`/`PERIODE_CONSTRAINTS` (CS-tak, volum, tillatte L-faser per fase), `TournamentEntry`,
`TrainingCamp`, CS-progresjon (`MULIG_SKADE`), belastnings-arbeidet (vår review).
**Kobling:** planen **respekterer periode-reglene** automatisk (store tekniske endringer i GRUNN, ikke i TURNERING;
CS-tak per fase), **timer tekniske endringer mot konkurranser** (ikke rett før turnering), og **tekniske rep-volum
(f.eks. 1500 «bare kropp») mater belastnings-monitoren**.

## 5. Drill-bank + video-analyse
Finnes: `ExerciseDefinition` (drill-bank m/ videoUrl), media på oppgave (`bildeUrl`/`videoUrl`), film-vinkel (ny del).
**Kobling:** koble hver `PositionTask` til en eller flere **drills fra banken** (gjenbruk i stedet for fritekst),
og **før/etter-video** per P-posisjon + vinkel for visuell progresjon.

## 6. Benchmark mot nivå (kategori A–K)
Finnes: WAGR-benchmark, talent-radar, SG-baselines (PGA Top 40 → Scratch), kategori A–K.
**Kobling:** vis hvor **stabil/god** spillerens levering er vs sin kategori og vs nivået over — så tekniske mål
settes ift. hvor spilleren skal, ikke bare hvor hen er.

## 7. Coach-effektivitet (Caddie + agenter + godkjenning + grupper)
Finnes: AI-Caddie (draft→godkjenn), agenter, `/admin/godkjenninger`, grupper (`Group`/`GroupMember`).
**Kobling:** Caddie kan **utkaste en teknisk plan / neste oppgave**; **mal til en hel gruppe** (bulk, med
godkjenn-kø per spiller); agenter løfter **stagnerende oppgaver** til Handlingssenter slik at ingenting glemmes.

## 8. Mål + sportsplan (Goal)
Finnes: `Goal`-modell, sportsplan/sesongmål.
**Kobling:** knytt den tekniske planen til **sesongmål** — hver P-oppgave bidrar til et tydelig mål, og fremdrift
ruller opp til målet (og til Utøver-360 + cockpit).

## Oppsummert — størst verdi først
1. **Data → foreslåtte oppgaver** (TM/SG/tester) — gjør planen evidensbasert. 2. **Lukk loopen** (live-logg + TM-bevis
+ stagnasjon-varsel) — gjør «repeterbar levering» målbar. 3. **Periodisering/konkurranse/belastning** — riktig timing
og dosering. 4. **AI-utkast + drill/video-kobling** — fart og dybde. 5. Benchmark, gruppe-mal, sesongmål.
