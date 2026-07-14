> STATUS: skrevet før designsystem-revisjonen juli 2026 — gjeldende kanon: `.claude/rules/design-system-regel.md`

# AK-formel — komplett review (styrker/svakheter + kode-endringer + design-prompt)

> Forankret i koden (verifisert 2026-06-28): TechnicalPlan/PositionTask, taxonomy.ts,
> ak-taxonomy.ts, cs-progression.ts, periode-constraints.ts, feature-flags.ts, schema.prisma.
> Mål: gjøre L-faser, club speed, miljø og belastning tydeligere, enklere, mer effektivt — 10/10.

## 0. Hva AK-formelen ER i dag (kort)
Teknisk plan per spiller → `TechnicalPlanPosition` (P1–P10) → `PositionTask`, der hver oppgave er
kodet med de **fire aksene**: `lFase` × `cs` × `miljo` × `prPress`, pluss `koller`, `slagType`, og
rep-mål i **tre farter** (`repsMaalDry/Lav/Full` → `RepHastighet` DRY/LAV/FULL), med TrackMan-mål
per oppgave (`PositionTaskTmGoal`). Alt innenfor spillerens **kategori A–K** og
**fasilitets-begrensninger** (`User.tilgjengeligeFasiliteter`).

## 1. STYRKER (ærlig — dette er reelt verdensklasse-tenkning)
- **4-akse-koding** (L-fase × CS × Miljø × Press) er sjeldent presist. Få akademier koder en øvelse så fullstendig.
- **Teknisk plan P1–P10 → oppgaver → 3-farts rep-logging + TrackMan-mål-protokoller** (ROLLING_WINDOW/STREAK/SESSION_GATE) er ekte dybde, ikke pynt.
- **L-fase → utstyr → CS-progresjon** er pedagogisk riktig motorisk læring (kropp → arm → kølle → ball → auto).
- **Periode-constraints** (volum-tak, CS-tak, pyramide-fordeling per GRUNN/SPES/TURN/EVAL/FERIE) gir innebygd sikkerhet mot feil-dosering.

## 2. SVAKHETER + FORBEDRINGER

### A. CLUB SPEED — størst svakhet (din innsikt treffer)
**Funn:** `CSNivaa` (CS50–CS100) er definert, men **IKKE kalibrert til mph**. Det finnes INGEN
`maxClubSpeed` på spilleren. Schema-kommentaren sier RepHastighet er «basert på Club Speed vs. spillers max»
— men den maks-verdien lagres ingen steder, så sammenligningen kan ikke skje. «CS70» betyr derfor ulikt for hver spiller.
**Problem 2 (ditt poeng):** «50 % driver» er umulig å føle. Prosent er feil mentalt verktøy for full sving.
**Forbedring (tydeligere/enklere/bedre):**
1. **Onboarding-kalibrering:** mål spillerens MAX club speed per kølle (TrackMan) og lagre. Da blir CS% → faktisk mph-mål automatisk («CS70, 7-jern = 66 mph»).
2. **Tempo-soner i stedet for bare %:** for full sving vis felt innsats — f.eks. SAKTE · KONTROLL · NORMAL · NESTEN · FULL — som hver mapper til et mph-bånd. **Tallet bak, følelsen foran.** Behold CS% i data.
3. **CS gjelder kun fra L_KOLLE** (når kølla er med). L_KROPP/L_ARM = «uten kølle / uten ball» → CS er N/A og skal skjules, ikke vises som en fart. (Dette er nøyaktig «uten kølle, uten ball, deretter club speed».)

### B. L-FASER ↔ UTSTYR — gjør det eksplisitt
**Funn:** utstyr (uten kølle / uten ball / kølle+skum / kølle+ball / full bag) er definert i taxonomy
PER L-FASE, men lagres **ikke** per oppgave (`PositionTask` har ingen `utstyr`-felt). Hovedmålet ditt —
ikke lære ny bevegelse for fort — **håndheves ikke** i dag.
**Forbedring:** utled utstyr + «fart gjelder/gjelder ikke» automatisk fra L-fasen i UI, og **lås for høy fart for tidlig**:
- L_KROPP → «uten kølle, ingen fart» (skjul CS).
- L_ARM → «uten ball» (skjul CS / kun DRY-reps).
- L_KOLLE → kølle + skumball, lav fart (tempo-sone Sakte/Kontroll).
- L_BALL/L_AUTO → full fart tillatt.
Advar/blokker hvis valgt CS > `LFASE_ANBEFALT_CS` for fasen.

### C. MILJØ (M) + PRESS (PR) — bra, men forenkle visuelt
**Funn:** M0–M5 og PR1–PR5 er klare, men oppleves overlappende (begge handler om «hvor ekte/krevende»).
**Forbedring:** behold begge i data, men vis dem som ÉN **kontekst-stige** i UI (studio/ingen press → turnering/full press), så coach koder raskere uten å tenke på to akser.

### D. SPILLER-BEGRENSNINGER (onboarding) — mangler
**Funn:** fasiliteter lagres (`tilgjengeligeFasiliteter`, `FacilityPrefs`), men IKKE «kan/kan ikke trene disse slagene»
(ikke bunker >20 m, ikke putt >15 m). Generatoren kan dermed foreslå umulige øvelser.
**Forbedring:** ny modell `PlayerShotConstraint` (treningsområde, maxDistance, grunn). Samles i onboarding,
redigerbar i spillerprofil, og **respekteres av øvelses- og plan-generatoren**.

### E. BELASTNING — størst MANGEL (din automatiserings-visjon)
**Funn:** `load-calendar` VISER CTL/ATL/TSB, men det finnes **ingen motor** som regner dem. Ingen agent leser
`HealthEntry` (søvn/puls) eller volum mot periode-grenser. Ingen ikke-golf-last (løping/konkurranse/skole).
Agentene itererer **ALLE** spillere — ingen coach-scope. CS-skadevarsel (`MULIG_SKADE`) finnes, men isolert.
**Forbedring (kode + agent + regler):**
1. **`LoadMetric`-motor (cron):** regn CTL/ATL/TSB fra `TrainingLog` + økt-varighet (+ søvn som RPE-proxy), lagre per spiller/uke.
2. **`ExternalActivityLog` + `PlayerContext`:** ikke-golf-last (løping, annen idrett, konkurranse-uker, skole/eksamen) så hele bildet teller. Utvid `HealthEntry` med `soreness` + `mood`.
3. **Belastnings-agent med REGLER** (dine eksempler): rødt flagg når f.eks. søvn <5 t + høy ATL, ELLER volum > periode-maks, ELLER >1 konkurranse/helg over tid, ELLER ekstern last (løping 10 km/dag) + golfrunde daglig. Varsler deg via `PlanAction`/`Notification` → Handlingssenter.
4. **Tier-scoping (kritisk, ditt poeng):** agenten overvåker KUN spillere du coacher (`PlayerEnrollment.coachId` = deg) eller i dine grupper (`Group.coachId` = deg). Skill **300 kr-PlayerHQ-betalende** (`Subscription`) vs. **dine coachede** vs. **uten relasjon** (`PLATFORM_ONLY` = usynlig). Du får varsler kun for «dine» utøvere. (Alle agenter bør få samme coach-scope-filter — i dag mangler det.)

## 3. KODE-ENDRINGER (konkret, til Claude Code)
- **[NY]** `PlayerClubSpeed` (userId, club, maxMph, measuredAt) + onboarding-kalibrering via TrackMan. + helper `csTilMph(cs, maxMph)`.
- **[NY]** Tempo-soner (mapping CS% → sone + mph-bånd) for full sving; brukt i UI.
- **[ENDRE]** `PositionTask`-UI: utled utstyr av L-fase, skjul/lås CS for L_KROPP/L_ARM, advar ved CS > anbefalt.
- **[NY]** `PlayerShotConstraint` (userId, omrade, maxDistanceM, reason); respekteres i generatorer.
- **[NY]** `LoadMetric` (userId, weekStart, ctl, atl, tsb, flags) + cron-motor.
- **[NY]** `ExternalActivityLog` + `PlayerContext`; utvid `HealthEntry` (soreness, mood).
- **[NY]** `belastnings-agent.ts` med regelsett + **coach-scope** (PlayerEnrollment/Group); legg coach-scope-filter på alle agenter.
- Additivt mønster (CREATE TABLE IF NOT EXISTS via db execute) per gotchas.md.

## 4. Claude Design-prompt (kodeklare skjermer for dette)
Lim blokken inn i Claude Design (samme handover-grade-regler som de andre promptene):

```
Oppdrag: Design KODEKLARE AgencyOS-skjermer (mørkt terminal-tema) for AK-formelen og belastning.
Følg handover-grade (ingen stubs, alle tilstander, desktop+mobil, eksakte tokens, norsk bokmål) og
domene-vokabular (kategori A–K, pyramide FYS/TEK/SLAG/SPILL/TURN, L-faser L_KROPP→L_AUTO, CS, M0–M5, PR1–PR5).
Tokens: bg #0A0B0A · tile #171817 · linje #1B1C1A · tekst #F0F0F0 · dempet #7E807A · lime #D1F843 (signal).
Fonter Inter / Inter Tight / JetBrains Mono. Lucide. Lime kun som signal. ADHD: én ting i fokus.

1. KODE EN ØVELSE (AK-formel-koder): velg pyramide → treningsområde → L-fase. UI utleder UTSTYR av
   L-fasen og styrer fart: L_KROPP «uten kølle, ingen fart» (skjul CS), L_ARM «uten ball», L_KOLLE+ →
   vis TEMPO-SONE (Sakte/Kontroll/Normal/Nesten/Full) MED kalibrert mph-mål under («CS70 · 7-jern · 66 mph»).
   Advarsel hvis fart > anbefalt for L-fasen. Sett Miljø+Press som ÉN kontekst-stige. Vis kategori-spenn A–K
   og spillerens slag-begrensninger (grået ut det som ikke er lov). Reps i tre farter (DRY/LAV/FULL).
2. CLUB SPEED-KALIBRERING (onboarding + profil): spiller måler max club speed per kølle via TrackMan;
   vis tabell kølle → max mph → og hva hver CS-sone blir i mph. Tom/laster/feil-tilstander.
3. SLAG-BEGRENSNINGER (onboarding + profil): per treningsområde, maks distanse + grunn (f.eks. «ikke bunker >20 m»).
4. BELASTNINGS-DASHBOARD (coach): per utøver CTL/ATL/TSB-kurve, søvn/puls-trend, ekstern last (løping/konkurranse/skole),
   med RØDE FLAGG og AI-agent-varsler («Sigrid: søvn 4 t + ATL høy + konkurranse i helga → reduser last»).
   Vis tydelig hvilke utøvere du coacher (filter: dine spillere / grupper) vs. betalende PlayerHQ uten coaching.
5. AGENT-REGLER (innstilling): coach setter terskler for belastnings-varsler (søvn-min, volum-maks, konkurranse-tetthet).
Lever alle fem kodeklare, alle tilstander, desktop + mobil.
```
