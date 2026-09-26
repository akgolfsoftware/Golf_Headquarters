# Kartlegging: slik planlegges trening i AK Golf HQ i dag

**Dato:** 26. september 2026  
**Git-branch:** `antigravity-forbedring`  
**Filer og mapper undersøkt:** `prisma/schema.prisma`, `prisma/seed.ts`, `prisma/seed-data/`, `scripts/seed-*`, `src/lib/domain/`, `src/lib/workbench/`, `src/lib/plan-engine/`, `src/lib/plan-builder/`, `src/lib/training/`, `src/lib/masterbrain/`, `src/lib/agents/`, `src/app/admin/workbench/`, `src/app/portal/`, `docs/treningsplanlegging.md`, `docs/treningsplanlegging-og-sprak-gjennomgang.md`, `docs/ordbok.md`, `docs/treningsplanlegger/wang-toppidrett/`, `docs/referanse/masterbrain-rebuild/`.

---

## Kort oppsummering

* **Ingen uke-modell i databasen:** Det finnes ingen tabell for en treningsuke. Uker utledes matematisk fra øktdatoer. De åtte uketypene i WANG-årshjulet (f.eks. Utviklingsuke og Pre-turnering) har ingen databasefelt.
* **Perioder er 100 % frie per spiller:** En periode (`PeriodBlock`) låses aldri til kalenderuker eller faste datoer; hver spiller har sitt eget datospenn.
* **Alder brukes ikke til planinnhold i koden:** Verken planbyggeren eller tilpasningsmotoren leser spillerens alder. Alt styres av snittscore (A–K-kategori) og svakeste Strokes Gained-område.
* **Tre måter å lagre volum på:** Totalvolum i perioder lagres i minutter (`weeklyVolMin`/`Max`), fordeling mellom FYS/TEK/SLAG/SPILL/TURN som prosenter i JSON eller øktbudsjett som heltall (antall økter).
* **Repetisjoner er dypt modellert i basen, men enkel i skjermen:** Modellen har felter for tørrtrening, lav fart, full fart og balltelling per kølle, men dagens skjema i Workbench har kun et åpent tekstfelt for mengde.
* **Belastningsstyring (ACWR og sRPE) finnes:** Koden regner akutt mot kronisk belastning (ACWR: siste 7 dager mot snittet av siste 28 dager) og sRPE (økt-RPE 1–10 ganget med minutter). I AK-formelen betyr derimot ordet «Belastning» treningsmiljø.
* **PGA Tour Top 40 er eneste SG-målestokk:** Juniorer måles mot samme profesjonelle baseline som voksne. Det finnes ingen egen junior-baseline i beregningsmotoren.
* **To motsatte A–K-skalaer i repoet:** Eldre CANON i Masterbrain definerte A som nybegynner og K som elite. Koden, databasen og gjeldende ordbok definerer A som verdenselite og K som nybegynner.
* **17 mot 19 treningsområder:** En eldre liste med 17 områder lever fortsatt i taksonomifilen, mens databasen og gjeldende planlegger har 19 områder (inkludert tre fysiske og banespill).
* **Teknisk plan kobles direkte til økter:** Oppgaver fra P-posisjonene (P1–P10) kan dras inn i økter, og repetisjoner logget i Live-økta skrives automatisk tilbake til oppgaven.

---

## 1. Datamodellen

Databasen (Prisma) har flere generasjoner planleggingsmodeller. Her er de sentrale modellene som styrer planlegging i dag:

### Årsplan og perioder
* **`SeasonPlan`** (`season_plans`): Knyttet til én spiller (`userId`) og ett år (`year Int`). Har påkrevd `startDate` og `endDate`, samt valgfrie `name` og `notes`. Relasjoner: `PeriodBlock[]`, `TournamentEntry[]`.
* **`PeriodBlock`** (`period_blocks`): Knyttet til `SeasonPlan`. Påkrevd `lPhase` (`LPhase`: `GRUNN`, `SPESIAL`, `TURNERING`, `EVALUERING`, `TESTUKE`, `FERIE`, `TRENINGSSAMLING`, `HELDAGSSAMLING`), `startDate` og `endDate`. Valgfritt: `focus` (fritekst), `weeklyVolMin` (minutter), `weeklyVolMax` (minutter), `weeklySessionBudget` (JSON-objekt med øktantall per pyramideområde, f.eks. `{"FYS":4,"TEK":2}`), `notes`, og `sourceGroupId` (sporer om blokken ble rullet ut fra en gruppe).
* **`GroupPeriodBlock`** (`group_period_blocks`): Gruppens egen årsplan med samme felter som over, knyttet til `groupId`.
* **`GroupPeriodGoal`** (`group_period_goals`): Elevens egne fokusområder per periodeblokk avtalt i IUP-samtalen. Påkrevd: `userId`, `periodBlockId`, `akse` (`PyramidArea`), `tittel`, `egentidMinUke` (planlagte minutter/uke som heltall), og `status` (`PeriodGoalStatus`: `IKKE_STARTET`, `PAA_VEI`, `NAADD`). Valgfritt: `maalemetode`, `egenvurdering` (1–5), `trenervurdering` (1–5), `kommentar`.
* **`TrainingPeriod`** (`training_periods`): Enklere gruppeperiode for skoleår (f.eks. WANG), med `schoolYear`, `name`, `startDate`, `endDate`, `tone` og `note`.

### Uke
* **Ingen tabell for treningsuker:** Det finnes ingen modell som representerer en kalenderuke. Uker oppstår dynamisk i koden (`src/lib/uke-helpers.ts`) ved å gruppere økter etter mandag-til-søndag. Unntaket er `FysUke` (`fys_uker`), som kun er en nummerert container for fysiske økter i en `FysiskPlan`.

### Økter og øvelser
* **`WorkbenchSession`** (`workbench_sessions`): Den gjeldende øktmodellen i Workbench. Påkrevd: `playerId`, `coachId`, `date` (`DateTime @db.Date`, midnatt UTC), `startMinute` (minutter fra midnatt, 0–1439), `durationMinutes`, `title`, `pyramid` (streng: "FYS", "TEK", etc.), `status` (streng: DRAFT, SCHEDULED, PUBLISHED, IN_PROGRESS, COMPLETED, CANCELLED, SKIPPED), `blockType` (OEKT, GRUPPEOEKT, SKOLE, etc.), `origin` (COACH, PLAYER, AGENT). Valgfritt: `environment`, `practiceType`, `location`, `notes`, `needsPlayerApproval` (boolean), `approvalStatus`, `publishedAt`, `seriesId` (for gjentakende økter), `hiddenByPlayer` (hvis spiller avviser gruppeøkt). Relasjon: `drills WorkbenchDrill[]`.
* **`WorkbenchDrill`** (`workbench_drills`): Øvelse i en Workbench-økt. Påkrevd: `sessionId`, `title`, `durationMinutes`, `akFormel` (JSON-validert av Zod), `sortOrder`. Valgfritt: `description`, `techniqueFocus`, `sourceId`.
* **`TrainingPlanSession`** (`training_plan_sessions`) og **`TrainingSessionV2`** (`training_sessions_v2`): To parallelle øktmodeller som er i ferd med å samles inn i `WorkbenchSession`. `TrainingPlanSession` har felter for `scheduledAt`, `durationMin`, `pyramidArea`, `liveSnapshot` (JSON), og relasjon til `SessionDrill[]`. `TrainingSessionV2` har felter for `startTime`, `endTime`, `vurderingFokus` (1–5), `vurderingGjennomforing`, `vurderingMestring`, og `avbruddAarsak`.
* **`SessionDrill`** (`session_drills`) / **`TrainingDrillV2`** (`training_drills_v2`): Detaljerte øvelsesrader. Har felter for `repType` (`RepType`), `repAntall` (svinger eller baller), `repMinutter`, `repSett`, `repReps`, `planRepsUtenBall`, `planRepsLavFart`, `planRepsAuto`, og `positionTaskId` (kobling mot teknisk plan).

### Maler
* **`PlanTemplate`** (`plan_templates`): Faste standardplaner. Påkrevd: `name`, `kategori` (`NgfKategori`: A–K), `lPhase` (`LPhase`), `varighetUker` (standard 4), `ukentligOktAntall` (standard 5), `disciplinFordeling` (JSON med prosenter 0–1, f.eks. `{"FYS":0.15,"TEK":0.25,...}`), `approved` (boolean). Valgfritt: `minAlder`, `maxAlder`, `effectivenessAvg`.
* **`PlanTemplateSession`** (`plan_template_sessions`): Øktmal i en mal. Har `ukeNr` (1–4), `dagNr` (1–7), `title`, `varighetMin`, `pyramidArea`, `skillArea`, `environment`.
* **`OktMal`** (`okt_maler`) og **`DrillMal`** (`drill_maler`): Coachens lagrede favorittøkter og øvelser.

### Teknisk plan (P-posisjoner)
* **`TechnicalPlan`** (`technical_plans`): Sesongplan for teknikk. Knyttet til `userId`, `periodBlockId` og `opprettetAvId`. Status: `DRAFT`, `ACTIVE`, `ARCHIVED`. Relasjon: `positions TechnicalPlanPosition[]`.
* **`TechnicalPlanPosition`** (`technical_plan_positions`): Representerer én av de ti svingposisjonene (`pNummer`: "P1.0" til "P10.0"), med `navn`, `sortOrder` og flagg for `hovedfokus`.
* **`PositionTask`** (`position_tasks`): Arbeidsoppgave under en P-posisjon. Påkrevd: `positionId`, `sortOrder`, `tittel`, `pyramide` (`PyramidArea`), `omraade` (tekst). Sentrale valgfrie felter: `slagNavn` (fritekst, f.eks. "7-jern"), `omraadeKode` (`Omraade`), `koller` (`String[]`), `motorikk` (`Motorikk`), `belastning` (`Belastning`), `press` (`Press`), `dimensjon` (`OmradeDimensjon`), `maaleutstyr` (`Maaleutstyr`), `repsMaalDry`, `repsMaalLav`, `repsMaalFull` og akkumulerte `repsGjortDry`, `repsGjortLav`, `repsGjortFull`.
* **`PositionTaskLog`** (`position_task_logs`): Hver loggførte treningsserie mot oppgaven med `reps`, `hastighet` (`RepHastighet`: DRY, LAV, FULL) og `belastning`.
* **`PositionTaskMaal`** (`position_task_maal`): Matrisen for planlagte repetisjoner per motorikksteg ganget med treningsmiljø.

### Fysisk plan
* **`FysiskPlan`** (`fysiske_planer`): Inneholder `FysUke[]`, som har `FysOkt[]`, som har `FysOvelseRad[]`. Sistnevnte har `sett`, `repsMin`, `repsMax`, `hvile`, `belastningPst`, `rir` (repetisjoner i reserve), `loggSettData` (JSON med vekt og reps per sett), og pulssone for intervaller.

### Turnering og tester
* **`Tournament`** (`tournaments`): Turneringskatalogen. Har `name`, `startDate`, `endDate`, `format`, `tour`, `tier` (1–5: major til klubb), `entryCloses`, `registrationUrl`.
* **`TournamentEntry`** (`tournament_entries`): Spillerens deltakelse. Har `priority` (`MAJOR`, `NORMAL`, `LOCAL`), `planTier` ("A" for hovedmål, "B" for backup, "C" for utvikling), `entryStatus` (`PLANNED`, `REGISTERED`, `CONFIRMED`, `WITHDRAWN`, etc.).
* **`TestDefinition`** (`test_definitions`): 20 testprotokoller (NGF/Team Norway), med `scoringRule` og `protocol` (JSON).

---

## 2. Faste verdier og begreper

Kilde: `prisma/schema.prisma` og `src/lib/domain/ak-formel-v2.ts`.

* **Periodetyper (`PeriodeType` og `LPhase`):**
  `GRUNN`, `SPESIAL`, `TURNERING`, `EVALUERING`, `TESTUKE`, `FERIE`, `TRENINGSSAMLING`, `HELDAGSSAMLING`.
* **Pyramideverdier (`PyramidArea`):**
  `FYS` (Fysisk), `TEK` (Teknisk), `SLAG` (Golfslag), `SPILL` (Spill), `TURN` (Turnering).
* **De 19 treningsområdene (`Omraade`):**
  *Fullsving:* `TEE_TOTAL`, `INNSPILL_200`, `INNSPILL_150`, `INNSPILL_100`, `INNSPILL_50`.  
  *Nærspill:* `CHIP`, `PITCH`, `LOB`, `BUNKER`.  
  *Putting:* `PUTT_0_3`, `PUTT_3_5`, `PUTT_5_10`, `PUTT_10_25`, `PUTT_25_40`, `PUTT_40_PLUSS` (alle i fot).  
  *Fysisk:* `STYRKE`, `KONDISJON`, `BEVEGELIGHET`.  
  *Bane:* `BANE`.
* **Læringssteg / Motorikk (`Motorikk` — kun for fullsving):**
  `UTEN_BALL` (Uten ball), `LAV_HAST` (Lav hastighet, 25–75 % fart), `AUTO` (Automatikk / normal fart).
* **Belastning (`Belastning` — betyr treningsmiljø i AK-formelen):**
  `INNENDORS`, `TRENINGSOMRAADE`, `BANE`, `KONKURRANSE`.
* **Press (`Press` — hvem som observerer):**
  `ALENE`, `OBSERVERT`, `KONKURRANSE`, `TURNERING`.
* **Måleutstyr (`Maaleutstyr`):**
  `TRACKMAN`, `FLIGHTSCOPE`, `GARMIN_R10`, `MEVO_PLUS`, `ANNET`, `UTEN`.
* **Tekniske dimensjoner (`OmradeDimensjon` — maks én per øvelse):**
  *Fullsving:* `SIKTE`, `STARTRETNING`, `KURVE`, `HOYDE`, `TREFFPUNKT`, `LENGDEKONTROLL`, `SPINN`.  
  *Nærspill:* `LANDINGSPUNKT`, `UTRULLING`, `KOLLEVALG`, `BOUNCE_BRUK`.  
  *Bunker:* `SANDINNGANG`, `LIE_VARIASJON`.  
  *Putting:* `GREENLESING`, `BALLSTART`.  
  *Banespill:* `SPILLEFORMAT`, `STRATEGIOPPGAVE`.
* **Sandtrinn (`SandTrinn` — bunkerens motorikk):**
  `UTEN_BALL_I_SAND`, `MED_BALL`.
* **Prioritetsnivåer for turnering (`priority` i `TournamentEntry`):**
  `MAJOR`, `NORMAL`, `LOCAL`. Plan-inndeling (`planTier`): `A`, `B`, `C`.
* **Nivåkategorier A–K (`NgfKategori` og `AkKategori`):**
  Elleve trinn fra best til svakest: `A` (< 68), `B` (68–72), `C` (72–74), `D` (74–76), `E` (76–78), `F` (78–80), `G` (80–85), `H` (85–90), `I` (90–95), `J` (95–100), `K` (100+).

---

## 3. Regler som ligger i koden

### Kategoriutledning fra score
* **Fil og funksjon:** `src/lib/domain/spiller-kategori.ts` -> `hentSpillerAkKategori()`, og `src/lib/domain/ak-kategori.ts` -> `kategoriFraSnittscore()`.
* **Regel:** Regner gjennomsnittlig brutto score for runder spilt i inneværende kalenderår (`hentSesongSnittscore`). Hvis ingen runder finnes, brukes handicap konvertert til forventet snittscore via Broadie-tabellen `avgScoreFromHcp`. Alder brukes aldri.
```typescript
// src/lib/domain/ak-kategori.ts linje 56-59
export function kategoriFraSnittscore(snittscore: number): AkBand {
  const band = AK_BANDS.find(
    (b) => (b.min == null || snittscore >= b.min) && (b.max == null || snittscore < b.max),
  );
```

### Volum- og øktbudsjett i standardplaner
* **Fil og funksjon:** `src/lib/plan-engine/standard-fordeling.ts` -> `fordelOkterPaaOmrader()`.
* **Regel:** Slår opp antall økter per uke (`STANDARD_OKT_ANTALL`) og varighet per økt (`STANDARD_VARIGHET_MIN`) for spillerens A–K-kategori og periode. Øktene fordeles på pyramiden ved hjelp av største brøks metode (*largest remainder*) mot prosentene i `STANDARD_PYRAMIDE`.
```typescript
// src/lib/plan-engine/standard-fordeling.ts linje 90-97
export function fordelOkterPaaOmrader(fordeling: PyramideFordeling, antall: number): PyramidArea[] {
  const raa = AREA_REKKEFOLGE.map((area) => ({
    area,
    eksakt: (fordeling[area] / 100) * antall,
  }));
```

### Tilpasningsmotoren for mal-uker
* **Fil og funksjon:** `src/lib/plan-engine/adapt-template.ts` -> `adaptTemplateWeek()`.
* **Regler (i prioritert rekkefølge):**
  1. *Fasilitetsfilter:* Fjerner økter som krever anlegg spilleren mangler tilgang til (f.eks. TrackMan, simulator, bunker).
  2. *Taper før turnering:* Hvis det er 7 eller færre dager til en turnering, kortes øktene ned med 25 % og fysiske økter fjernes helt.
  3. *Etterlevelsesskalering:* Hvis spilleren har gjennomført under 50 % av planen siste 28 dager, kuttes én økt og øvrige kortes ned med 20 %.
  4. *Fokusvridning:* Inntil to økter i uka vris mot spillerens svakeste SG-kategori eller coachens definerte fokus.
  5. *Dagflytting:* Flytter økter til spillerens foretrukne ukedager uten å endre antall økter.

### Akutt og kronisk belastning (ACWR)
* **Fil og funksjon:** `src/lib/workbench/load-workbench.ts` linje 712–724.
* **Regel:** Akutt belastning = sum planlagte minutter siste 7 dager. Kronisk belastning = sum minutter siste 28 dager delt på 4. Forholdstallet `acwr = akutt / kronisk`. UI-varsel: gult ved > 1,2, rødt ved > 1,4.

### Turneringskollisjon
* **Fil og funksjon:** `src/lib/workbench/turnering-plan.ts` -> `vurderKollisjon()`.
* **Regel:** En turnering flagges som kollisjon hvis den faller på en uke merket som `TESTUKE`, hvis den ligger utenfor sesongplanens perioder, eller hvis den ligger i en annen periode enn `TURNERING` (f.eks. i `GRUNN`). Kollisjonen er rådgivende og sperrer ikke lagring.

---

## 4. Coach-flyten i Workbench

Inngangsporten for coach er `/admin/workbench/[playerId]`. Skjermen styres av `src/app/admin/workbench/[playerId]/page.tsx` og støtter åtte visninger via URL-parameteren `?vis=`:

1. **År (`WorkbenchAar`):**
   * *Hva som virker:* Viser hele kalenderåret med tidslinje for perioder, månedsakse, gjennomført mot planlagt tid totalt og per pyramide, samt en tabell over alle perioder og turneringer. Høyre inspektørpanel viser periodesammendrag.
   * *Hva som mangler / er placeholder:* Drag-and-drop for å endre periodedatoer direkte på tidslinjen finnes ikke; coachen må redigere perioder via skjema.
2. **Periode (`WorkbenchPeriode`):**
   * *Hva som virker:* Viser alle uker i den valgte perioden, ukevolum i stolpediagram, periodens økter og statusfordeling. Har full publiseringsflyt (`PublishConfirmDialog`) som finner alle utkast og lar coachen publisere dem samlet.
3. **Måned (`WorkbenchManed`):**
   * *Hva som virker:* Månedskalender med prikker og fargekoder for planlagte økter per dag, og oppsummering av timer per pyramide.
4. **Uke (`WorkbenchUke` — standardvisningen):**
   * *Hva som virker:* Full interaktiv ukeplanlegger.
     - *Opprette:* Klikk i kalenderen åpner `CreateSessionModal` for ny økt.
     - *Kilder:* Venstrepanel (`SourcesPanel`) lister maler, standardøkter og oppgaver fra teknisk plan, som kan dras rett inn i uka.
     - *Inspektør:* Høyrepanel (`SessionInspector`) lar coachen flytte økt, endre varighet, slette (enkeltøkt eller serie), lagre som mal, og legge til/redigere øvelser via `DrillListEditor`.
     - *Publisering:* Enkeltøkter kan publiseres direkte, eller via knapp for å publisere hele uka.
   * *Hva som mangler / er ufullstendig:* `DrillListEditor` har nedtrekksmenyer for pyramide, område, motorikk, dimensjon, belastning og press, men *mengde* er kun et fritekstfelt. Å legge inn detaljerte sett/reps-rekker eller kondisjonsintervaller i selve Workbench-skjemaet er ikke ferdigbygget i dette panelet.
5. **Økt (`WorkbenchOkt`):** Detaljert gjennomgang av én enkelt økt med øvelsesliste.
6. **Live (`WorkbenchLive`):** Coachens sanntidsoversikt over en pågående økt.
7. **Godkjenningskø (`/admin/queue` og `/admin/approvals`):**
   * Viser forslag generert av AI-agenter (f.eks. forslag om å tette et treningsgap eller legge til en økt). Coachen kan godkjenne (`APPROVE`), avvise (`REJECT`) eller redigere forslaget. Ved godkjenning kjører `plan-action-executor.ts`, som oppretter eller oppdaterer faktiske `WorkbenchSession`-rader.

---

## 5. Spiller, Live og agenter

### Hvordan en plan når PlayerHQ
Spilleren ser planen på dashbordet (`/portal`), i kalenderen (`/portal/kalender`) og i dagsagendaen (`loadPlayerDay` i `src/lib/workbench/wb-actions.ts`).  
* **Regel:** Økter med status `DRAFT` er usynlige for spilleren. Først når coachen klikker «Publiser», endres status til `PUBLISHED` (eller `SCHEDULED`), og økten blir synlig i spillerens app.  
* **Spilleravvisning:** Hvis spilleren velger «Ikke delta» eller avviser en foreslått økt, settes `hiddenByPlayer = true`. Økten forsvinner fra spillerens visning, men slettes aldri fra basen; coachen ser den fortsatt i AgencyOS merket som skjult.

### Hva spilleren registrerer i Live-økta (`/portal/live/[sessionId]`)
Underveis i økta registreres fremdriften offline-først i nettleseren og synkroniseres til serveren:
1. **Reps og volum:** Spilleren trykker på tapper-knapper (+1, +5, timer) for å telle repetisjoner per øvelse. For fullsving deles dette på tørrtrening, lav fart og automatikk.
2. **Køllefordeling:** Baller slått per kølle logges og lagres i `SessionBallLog`.
3. **Pausetid:** Automatisk registrering av pauser mellom øvelsene (`totalPauseSek`).
4. **Øktslutt og evaluering:** Spilleren oppgir:
   - Tre selvvurderinger fra 1 til 5: Fokus, Gjennomføring og Mestring.
   - Anstrengelse (RPE fra 1 til 10), som systemet ganger med medgått tid for å regne ut sRPE-belastningspoeng.
   - Refleksjonsnotat (fritekst).
5. **Tilbakeskriving til teknisk plan:** Hvis øvelsen var lenket til en oppgave i teknisk plan (`positionTaskId`), opprettes en rad i `PositionTaskLog`, og oppgavens utførte repetisjoner oppdateres automatisk.

### Hva AI og bakgrunnsagenter leser og skriver
* **`training-gap`:** Kjører ukentlig. Leser spillerens SG-tall (krever minst 3 runder) og siste 4 ukers loggførte treningstid. Hvis svakeste SG-område har fått under 20 % av treningstiden, opprettes en `PlanAction` med type `TRAINING_GAP`.
* **`weekly-plan-proposals`:** Leser sesongplan, fasiliteter og SG-gap, og genererer utkast til neste ukes økter som legges i coachens godkjenningskø.
* **`caddie-proactive`:** Leser spillerens siste økter og kommende turneringer, og genererer korte råd og forberedelsesforslag til spiller og coach.
* **`plan-action-executor`:** Når coach godkjenner et tiltak, skriver agenten direkte til `WorkbenchSession` eller `TrainingPlanSession` med merket `isAgentProposal = true`.

---

## 6. Kunnskapskildene

| Kilde / Filsti | Versjon / Dato | Godkjent | Sammendrag |
|---|---|---|---|
| `docs/treningsplanlegging-og-sprak-gjennomgang.md` | Master · 22.09.2026 | Ja (Anders) | Gjeldende autoritet for hele valgtreet fra årsplan til øvelse (åtte trinn) og bindende begrepsvalg. |
| `docs/treningsplanlegging.md` | 22.09.2026 | Ja | Forenklet oversikt over planleggingsrekken, periodetyper, de 19 områdene og øvelsesstrukturen. |
| `docs/ordbok.md` | Master · 21.09.2026 | Ja (Anders) | Prosjektets eneste gjeldende ordbok. Definerer språk, A–K-skala (A=best), forbudte ord og TrackMan-standarder. |
| `docs/treningsplanlegger/wang-toppidrett/arshjul-2026-2027.md` | 23.09.2026 | Ja | 44-ukers årshjul for WANG Fredrikstad (VG1–VG3). Definerer datoer for GRUNN, SPES og TURN, samt 8 uketyper. |
| `docs/treningsplanlegger/wang-toppidrett/oktmal.md` | 21.09.2026 | Ja | Standard øktstruktur (7 seksjoner) for faste treninger (M/O/F 08:00–10:00) og mapping til AK-formelen. |
| `docs/treningsplanlegger/wang-toppidrett/grunnlag-funn.md` | 21.09.2026 | Ja | Analyse av kildedokumenter på disk (6-årsløp, læreplaner, to eldre årsplanutkast og avvikssjekk). |
| `src/lib/masterbrain/knowledge/concepts/canon-methodology.json` | v3.5.0 · 2026-06-16 | Historisk | Eldre CANON-spesifikasjon. Inneholder invertert A–K-skala (A=nybegynner) og 13 invarianter. |
| `src/lib/masterbrain/knowledge/concepts/mikroperiodisering-og-tidsdimensjon.json` | v1.0.0 · 2026-07-31 | Ja (drift) | 4-ukers mikrosyklus, volumfordeling per handicap-bracket, og oversettelsestabell for periodenavn. |
| `src/lib/masterbrain/knowledge/concepts/ltad-framework.json` | v1.0.0 · 2026-06-16 | Ja | Aldersmodell (ATK/LTAD) med timeanbefalinger for golf og fysisk trening per aldersgruppe. |
| `src/lib/masterbrain/knowledge/entities/positions.json` | v2.0.0 · 2026-07-31 | Ja | MORAD P1.0 til P10.0 svingposisjoner med 289 målefelter, toleranser og faseindeks. |
| `src/lib/masterbrain/knowledge/entities/faults.json` | v2.0.0 · 2026-07-31 | Ja | Ti svingfeil koblet mot P-posisjoner, symptomer og korreksjoner. |
| `docs/referanse/masterbrain-rebuild/00-SOURCE-INVENTORY.md` | 2026-08-07 | Ja | Kartlegging av ekstern kildedisk på 796 GB (Mac O'Grady-forelesninger, videoer, e-poster og artikler). |
| `region-satsing/kunnskap` | — | **Mangler** | Mappen finnes **ikke** i dette repoet. Ingen filer eller referanser funnet lokalt. |

---

## 7. Seed- og referansedata

* **Kompetansemål og skoleperioder (`prisma/seed.ts`):**
  Laster Udir LK20 kompetansemål for VG1, VG2 og VG3 (Toppidrett IDR05-02 og Kroppsøving KRO01-05). Laster også WANGs fem skoleperioder for 2026/2027 (`TURN-rest`, `Testuke`, `GRUNN`, `SPES`, `TURN`) inn i `TrainingPeriod`.
* **Standard planmaler (`scripts/seed-plan-templates.ts`):**
  Laster 33 `PlanTemplate`-rader (11 kategorier × 3 faser). Varighet er satt til 4 uker, med øktantall fra 2 til 6 per uke. Tallene er hardkodede verdier kalibrert per nivå, men i koden er det notert at tall for nye faser (Testuke, Samling) er foreløpige estimater. Skriptet inneholder en referanse til kategori `L`, selv om enumet i databasen stopper på `K`.
* **Team Norway testbatteri (`scripts/seed-test-definitions.ts`):**
  Laster 20 standard testdefinisjoner fra NGF-protokollen (inkludert 8-ball tester, driver-tester, wedge-variasjon og PGA Tour 27 shots).
* **Referansetall og konfidens (`prisma/seed-data/ngf-test-battery.json`):**
  Inneholder referanseverdier for testene fordelt på 7 nivåer (fra PGA topp 40 ned til Scratch). Hvert nivå er eksplisitt merket med datatillit (`confidence`):
  - PGA topp 40 og PGA-snitt er merket `"measured"` eller `"reference"`.
  - Challenge Tour, Nordic League, Norsk elitejunior og Scratch er eksplisitt merket `"estimated"`.

---

## 8. Statistikk og strokes gained

* **Lagring av runder og slag:**
  Runder lagres i `Round` (`rounds`). Slag lagres i `Shot` (`shots`) med startposisjon, sluttposisjon, lie (`ShotLie`), avstand til hull, og siktelinje (`targetX`/`targetY`). Putting lagres i `PuttDetail` med lengde i fot, break, helning og utfall.
* **To likeverdige innganger:**
  1. Ekte slag-for-slag ført i appens rundelogg.
  2. Ekstern hurtigutfylling av ferdige SG-tall fra UpGame, Arccos eller Shot Scope, lagret i `BrukerSgInput`.
* **Beregning av Strokes Gained:**
  Koden i `src/lib/domain/sg.ts` regner SG per slag etter standardformelen:  
  `SG = (Forventet slag fra startposisjon) − (Forventet slag fra sluttposisjon) − 1`  
  Baseline-tabellene i koden er:
  - OTT, APP og ARG: Mark Broadie (*Every Shot Counts*, 2014) PGA Tour-snitt, interpolert til meter-intervaller.
  - Putting: Team Norway IUP Ref-ark (2025) i meter (0–18 m).
* **Hvilken baseline brukes for juniorer?**
  Det finnes ingen egen junior-baseline. Alle spillere måles mot PGA Tour Top 40 / PGA Tour-snitt.
* **Hvor mange runder kreves før tall vises?**
  - I den kanoniske SG-velgeren (`src/lib/domain/spiller-sg.ts` line 33) brukes et rullende vindu på de siste **10 rundene** (`SPILLER_SG_RUNDER = 10`), men tall vises så snart minst **1 runde** med data foreligger.
  - For at bakgrunnsagenter skal varsle om treningsgap eller gi analyser (`src/lib/agents/training-gap.ts` line 25 og `treningsdata-ekspert.ts`), kreves minst **3 runder** med SG-data.

---

## Svar på de ti spørsmålene

| Nr | Spørsmål | Svar | Bevisende fil og linje |
|---|---|---|---|
| 1 | Hvilke uketyper støttes, og kan en uke bære et eget notat/merkelapp? | I databasen finnes ingen ukemodell eller uketyper. Koden (`standard-fordeling.ts`) har `BYGG`, `TOPP`, `DELOAD`. WANG-dokumentet har 8 typer (`Utviklingsuke`, `Pre-turnering`, `Turneringsuke`, etc.), men de mangler egne databasefelt og kan ikke lagres separat per uke i dag. | `src/lib/plan-engine/standard-fordeling.ts` linje 64; `docs/treningsplanlegger/wang-toppidrett/design-handoff-arsplan-2026-27-v2/kilde/03-ukeplan.md` linje 149; `prisma/schema.prisma` (ingen Week-modell). |
| 2 | Kommer periode-grenser fra en fast kalender, fra spillernivå, eller er de frie per spiller? | De er helt frie per spiller. Hver `PeriodBlock` har egne `startDate` og `endDate` koblet til spillerens personlige `SeasonPlan`. | `prisma/schema.prisma` linje 3243–3244; `docs/treningsplanlegging.md` linje 59 ("Perioder kan ha fritt datospenn. De er ikke låst til hele kalenderuker."). |
| 3 | Bruker koden spillerens alder, fremfor snittscore, til å bestemme planinnhold? | Nei. Planbyggeren og motoren matcher utelukkende på snittscore (A–K-kategori) og svakeste SG-område. Alder leses ikke ved valg eller generering av plan. | `src/lib/plan-builder/index.ts` linje 283–285; `src/lib/domain/ak-kategori.ts` linje 5 ("«Typisk alder» er kun kontekst, IKKE en del av formelen."). |
| 4 | Hvordan lagres timer per uke og per pyramide: absolutte timer, antall økter eller prosenter? | Alle tre brukes: `PeriodBlock` lagrer totalvolum i minutter og øktbudsjett som antall økter i JSON (`weeklySessionBudget`). `GroupPeriodGoal` lagrer minutter/uke. `PlanTemplate` lagrer prosenter i JSON (`disciplinFordeling`) og antall økter per uke (`ukentligOktAntall`). | `prisma/schema.prisma` linje 3246–3250, 3301, 1521–1524; `src/lib/plan-engine/standard-fordeling.ts` linje 15–43. |
| 5 | Finnes det noe begrep om repetisjoner (slag, putter, svinger uten ball) i modellen? | Ja, repetisjoner er modellert i stor detalj: `RepType` (svinger uten ball, baller slått, tid, sett/reps), egne felter for reps per motorikksteg i øvelser, live-telling av baller per kølle (`SessionBallLog`), og rep-målmatrise i teknisk plan (`PositionTaskMaal`). | `prisma/schema.prisma` linje 424–429 (`RepType`), linje 1486–1494 (`SessionDrill`), linje 1849–1859 (`SessionBallLog`), linje 4942–4950 (`PositionTask`). |
| 6 | Finnes det noe begrep om treningsbelastning, RPE eller akutt mot kronisk belastning? | Ja. Koden regner ACWR (akutt volum siste 7 dager mot kronisk snitt siste 28 dager) og sRPE (økt-RPE 1–10 × varighet i minutter). Merk at ordet «Belastning» i AK-formelen derimot betyr treningsmiljø. | `src/lib/workbench/load-workbench.ts` linje 101–104 og 712–724; `src/lib/training/srpe.ts` linje 5–15; `docs/treningsplanlegging.md` linje 154. |
| 7 | Hvordan representeres en turnering, og bærer den prioritet og formål (trening, utvikling, prestasjon)? | Representeres ved `Tournament` (arrangement) og `TournamentEntry` (påmelding). Har `priority` (`MAJOR`, `NORMAL`, `LOCAL`) og `planTier` (A=hovedmål, B=backup, C=utvikling). Den har ikke noe eget eksplisitt felt for formål (trening/utvikling/prestasjon). | `prisma/schema.prisma` linje 2876–2953 (`Tournament`) og 3316–3350 (`TournamentEntry`). |
| 8 | Hvilken strokes gained-baseline brukes for juniorer, og hvor er den definert? | Det finnes ingen egen junior-baseline. Alle spillere måles mot PGA Tour Top 40-baseline basert på Mark Broadie (2014) og Team Norway IUP Ref-ark (2025). | `src/lib/domain/sg.ts` linje 1–16 og linje 55–95. |
| 9 | Er periodemål og prosessmål modellert, eller bare sesongmål? | Både periodemål og prosessmål er modellert: `GroupPeriodGoal` modellerer mål per periodeblokk, mens `Goal` har et eget felt `category` som eksplisitt skiller mellom `OUTCOME` (resultatmål) og `PROCESS` (prosessmål). | `prisma/schema.prisma` linje 3293–3314 (`GroupPeriodGoal`) og linje 2235–2237 (`Goal.category`). |
| 10 | Hva lagrer teknisk plan (P-posisjoner) per oppgave, og hvordan flyttes en oppgave inn i en økt? | Lagrer svingposisjon (P1–P10), tittel, slagnavn, kølle, motorikksteg, teknisk dimensjon, måleutstyr, og rep-mål fordelt på tørt, lav fart og full fart. Coachen drar oppgaven inn i Workbench fra kildepanelet; det oppretter en øvelse med `positionTaskId`. Fullførte reps i Live-økta logges automatisk tilbake til oppgaven. | `prisma/schema.prisma` linje 4917–5010; `src/lib/workbench/teknisk-plan-panel.ts` linje 4–13 og 36–100; `prisma/schema.prisma` linje 5015–5040 (`PositionTaskLog`). |

---

## Motstrid mellom kilder

| Tema | Kilde A | Kilde B | Hvilken som ser nyest ut |
|---|---|---|---|
| **A–K-skalaens retning (polaritet)** | `canon-methodology.json` (16.06.2026): A er nybegynner (HCP 54+), K er elite. | `ak-kategori.ts` (22.06.2026), `schema.prisma`, `ordbok.md` (21.09.2026): A er World Elite (< 68), K er nybegynner (100+). | **Kilde B er gjeldende.** Kilde A er en utgått, invertert definisjon. |
| **Antall treningsområder** | `taxonomy.ts` (15.08.2026): 17 områder (ingen fysiske, ingen bane, 7 puttebånd). | `ak-formel-v2.ts` (20.08.2026), `schema.prisma`, `treningsplanlegging.md` (22.09.2026): 19 områder (inkl. Styrke, Kondisjon, Bevegelighet, Banespill og 6 puttebånd). | **Kilde B er gjeldende.** `ak-formel-v2.ts` fastslår at 19-listen vinner og at 17-listen kun er historisk. |
| **Periodenavn (staving)** | `mikroperiodisering-og-tidsdimensjon.json` (31.07.2026): CANON bruker `SPES`, LPhase bruker `SPESIAL`, PeriodeType brukte `SPESIALISERING`. | `schema.prisma` (OW-2, 15.09.2026), `ordbok.md` (21.09.2026): Både `LPhase` og `PeriodeType` har standardisert på `SPESIAL`. | **Kilde B er nyest.** Databasen er samkjørt på `SPESIAL`. |
| **4-ukers mikrosyklus** | `mikroperiodisering-og-tidsdimensjon.json` (31.07.2026): Strukturen er `["build", "peak", "deload", "test"]`. | `standard-fordeling.ts` (16.09.2026 linje 85): Strukturen er `["BYGG", "BYGG", "TOPP", "DELOAD"]`. | **Kilde B er nyest i kode.** Kilde A er eldre systemsak. |
| **WANG årshjul: start og testuker** | `grunnlag-funn.md` versjon B (juni 2026): GRUNN uke 42–8, SPES uke 10–17, tester i aug/feb. | `arshjul-2026-2027.md` (23.09.2026) og `prisma/seed.ts`: Testuke er uke 43, GRUNN er uke 44–10, SPES er uke 11–16, TURN er uke 17–24. | **Kilde B er gjeldende fasit.** Matcher Anders' uttrykkelige instruks. |
| **Betydningen av «Belastning»** | Tradisjonell treningslære / FYS: Fysisk anstrengelse, ytre motstand (kilo) eller RPE. | `ordbok.md` (21.09.2026), `treningsplanlegging.md` linje 154: Betyr utelukkende *treningsmiljø* (Innendørs, Treningsområde, Bane, Konkurranse). | **Kilde B er gjeldende i AK-formelen.** Fysisk motstand kalles i stedet vekt/belastning i FYS-grenen. |
| **SG-baseline kilde** | `docs/platform/DATA-MODEL.md`: Tabellen `SgBaseline` henter DataGolf-data, men brukes ikke til SG-beregning. | `src/lib/domain/sg.ts`: Bruker hardkodede tabeller fra Broadie og Team Norway ref-ark. | **Kilde B styrer faktisk beregning.** Tabellen `SgBaseline` er i praksis frakoblet. |

---

## Hull — det appen ikke kan uttrykke i dag

1. **Ingen uke-entitet i databasen:**  
   Appen kan ikke lagre et eget ukenotat, et ukemål eller en fast uketype (f.eks. «Utviklingsuke» eller «Pre-turnering») på en uke. Hvis Anders ønsker at en 16-årings plan skal merkes med uketyper fra WANG-årshjulet, må dette enten bygges som en ny modell, lagres i øktenes titler, eller utledes av regler.
2. **Ingen junior-baseline for Strokes Gained:**  
   En 16-åring med handicap 4 vil få kraftig negative tall på nesten alle slag fordi målestokken er PGA Tour Top 40. Appen har ingen beregningsmotor som måler mot junior-elitenivå (selv om referansetall finnes i frittstående JSON-filer for tester).
3. **Turneringens formål er ufullstendig:**  
   Appen skiller mellom prioriteter (`MAJOR`, `NORMAL`, `LOCAL`) og plan-nivåer (A/B/C), men mangler et formelt felt for om turneringen spilles for *trening*, *utvikling* eller *prestasjon*.
4. **Alder er frakoblet volumtaket i praksis:**  
   Olympiatoppens og Masterbrains regel om at ukentlig treningstid ikke skal overstige alder for utøvere under 18 år (16 år = maks 16 timer) håndheves ikke av koden. En 14-åring og en 20-åring i kategori E får nøyaktig samme timeforslag.
5. **Fritekst for mengde i Workbench-skjemaet:**  
   Selv om datamodellen har felter for repetisjoner fordelt på motorikksteg og tekniske dimensjoner, tilbyr dagens øvelseseditor i Workbench bare et enkelt tekstfelt for mengde når coachen planlegger manuelt.
6. **Mangler VG-kompetansemål for golfspesifikke øvelser:**  
   Udir-kompetansemål for Toppidrett VG1–VG3 ligger i databasen, men det finnes ingen maskinell mapping mellom en konkret golføvelse (f.eks. wedge-spredning) og et spesifikt kompetansemål; dette må legges inn manuelt som tekst i øktnotatene.

---

## Mine anbefalinger (kort, holdt utenfor kartleggingen)

1. **Behold 19-områders taksonomien og A–K (A=best):**  
   Ikke la eldre Masterbrain-dokumenter eller 17-listen forvirre standarden. Fasiten som ble spikret 20.–22. september 2026 er den mest gjennomarbeidede og må ligge til grunn for 16-årsplanen.
2. **Bruk `weeklySessionBudget` og prosentfordeling som mal-grunnlag:**  
   For en 16-åring (typisk kategori D, E eller F) bør standardmalen definere ukevolum i minutter og fordele prosentvis på de fem pyramideområdene (f.eks. 50 % FYS, 35 % TEK, 10 % SLAG, 5 % SPILL i GRUNN).
3. **Bygg en lettvekts `UkePlan`-kobling hvis uketyper er viktige:**  
   Hvis WANG-rytmen (Utviklingsuke vs. Pre-turnering vs. Testuke) skal styre øktforslagene automatisk, bør uketype legges til som et felt på sesongens uker, eller knyttes direkte til `PeriodBlock` som en ukematrise.
4. **Introduser en visuell junior-referanse for Strokes Gained:**  
   For å unngå demotiverende minus-tall hos en 16-åring bør visningslaget i PlayerHQ få en referanselinje for «Nordisk junior elite» (f.eks. snittscore 74–76 / Kategori D), selv om motoren bak fortsatt regner mot PGA Tour-tall.
5. **Bruk teknisk plan aktivt som oppgavebank:**  
   Siden koblingen mellom `PositionTask` og `SessionDrill` allerede fungerer og logger reps tilbake til P-posisjonene, bør 16-årsplanen bygges med standardiserte P-oppgaver (spesielt P1–P4 for grunnteknikk) som dras rett inn i øktene.
