# AI-treningsmotor — DataGolf + drill/test-generator + SG/TrackMan-planlegger (13. juni 2026)

> **Oppdrag (Anders):** (1) Implementere DataGolf-API-ene fullt ut. (2) Bygge en AI-modul som
> GENERERER øvelser, tester og driller basert på Strokes Gained + TrackMan-data (ikke tekniske
> svingting — datadrevet). (3) Gjøre Master Brain-innholdet om til en AI-treningsplanlegger som
> anbefaler riktig trening basert på statistikk, SG, spillemengde og hvor god spilleren er.
>
> Kodeverifisert (fil+linje) + Master Brain lest (`~/Downloads/MasterBrain`). Designsystem LÅST.
> Ingen kodeendringer her. Søster-dok: `verdensledende-treningsapp-plan-2026-06-13.md`.

---

## 0. Kjernegrep

Vi har **tre lag som nesten møtes, men ikke er koblet**: (a) deterministisk svakhets-deteksjon
(SG + TrackMan, ferdig), (b) en regelmotor med coach-kunnskap (Master Brain + AK-formel + invarianter),
og (c) et drill/test-bibliotek med full match-metadata. **AI-treningsmotoren er limet:** den oppdager
svakheten deterministisk, velger trening innenfor harde regler, og lar AI komponere + lære av resultat.

**Viktig avstemming:** Master Brain-planen (`processed/komplett-plan-...`) er skrevet mot KimiCode-repoet
+ et separat talent-dashboard (Drizzle/Python). KimiCode er pensjonert ([[project_akgolf_booking_prototype]]
-mønsteret) — **alt bygges i akgolf-hq**, som allerede har AI-plan-generator + DataGolf-client + SgBaseline.

---

## 1. Hva vi har å bygge på (kodeverifisert)

**AI-plan-generator (finnes):** `src/lib/ai-plan/generate.ts` (`genererPlan`) — Anthropic Claude Sonnet,
`tool_use` → `PlanForslag` (periode + økter + drills). Henter spillerens NGF-kategori-filtrerte drill-liste
(`context.ts:228`), bruker `PlanTemplate` (kodifisert coach-erfaring per kategori × L-fase) som baseline,
og læringssløyfe via `PlanEffectiveness` (pre/post SG-delta). **Gap: drills returneres som NAVN, ikke
exerciseId** (risiko for fabrikerte navn), **ingen TrackMan-signaler** mates inn, **ingen deterministisk
svakhet→drill-matcher** (LLM velger fritt). Nyere lett variant: `week-suggest.ts` (AI Gateway + zod).

**Svakhets-deteksjon (ferdig, deterministisk):** `sg-hub/insight-engine` (10 kategorier m/ strukturert
payload: distansegap, strike, d-plane-drift, fatigue, consistency …), granulære `Round.sg*`-bånd
(sgApp200/150/100/50, sgPutt-bøtter), `Signal` (SG_AREA/CLUB_AVG), `ClubMetricTrend`. **Disse er ikke
koblet til generatoren.**

**Drill/test-modell (ferdig match-metadata):** `ExerciseDefinition` (pyramidArea, skillArea, lFase/lPhases,
kategori-range, csTargetByKategori, environment, fasilitetKrav, prerequisites, morad). `gapToDrill`
(SG→akse, deterministisk) finnes. **`PositionTaskTmGoal` HIT_RATE-motor** (8/10 innenfor ±2°, rolling/
streak/best-of-N) = perfekt mål-output-format — men **evaluerings-motoren mangler** (re-beregner aldri
currentHits fra TrackManShot). `TestDefinition.protocol` (Json steps + benchmarks) er fleksibel nok for
AI-generert protokoll; `isCustom`/`createdById` gir lovlig skrivemål. **Test-generering finnes ikke.**

**Ferdig UI venter på ekte motor:** `components/ai-foreslag/foresla-drill-modal.tsx` har akkurat output-
formen (drill + «Hvorfor denne?» + rep-mål + TM-badge + multi-select) — men kjører hardkodede `SUGGESTIONS`
+ falsk timer. Bare å koble på en ekte motor.

**DataGolf (delvis koblet):** `lib/datagolf/client.ts` — koblet: `getSchedule`, `getNorwegianPlayers`,
`live-tournament-stats`, `getSkillRatings`. Ubrukt: `getTournamentField` (definert, aldri kalt).
Direkte-fetch utenfor client (bør konsolideres): `/preds/approach-skill` (to steder). Ikke koblet:
historical-raw-data, player-decompositions, in-play, fantasy. Putt-distance finnes ikke i DataGolf (bruker
Broadie-estimat). Tabeller: `SgBaseline`, `PgaPlayerSeason`, `PgaApproachDistance`, `PgaPuttDistance`.

---

## 2. Master Brain-kunnskapen som skal operasjonaliseres

Master Brain (`~/Downloads/MasterBrain`) inneholder den **autoritative SG/TrackMan-kunnskapen + en ferdig
spesifikasjon** for nettopp denne motoren (`Spesifikasjon_ Strokes Gained-drevet Treningsplanlegging`):

- **Konfidens-protokoll (hard regel):** aldri anbefal trening på <8 runder. Terskler: Total 8 · T2G/OTT/APP 12 · ARG/PUTT 24 runder. Språk: «retningssignal» / «pålitelig trend» / «statistisk signifikant».
- **Truth Layer (TrackMan vs on-course):** liten differanse (≤0,3 SG, Combine bedre) → teknisk problem → SLAG/TEK-økter. Stor differanse (>0,5, Combine bedre) → mentalt/strategisk → TURN + DECADE-strategi. Motsatt → flagg for coach.
- **SG→pyramide-mapping:** OTT→TEK(+TURN) · APP→SLAG(+TURN) · ARG→SPILL · PUTT→SPILL.
- **AK-formel-øktgenerering:** `SLAG_FAIRWAY_L-BALL_CS70_M3_PR2` — parametre utledes fra SG + pyramide-mapping.
- **Invarianter (CANON v3.5):** min 15% TEK, CS50 min for balltrening, junior-aldersregler, L-fase overstyrer SG i tidlige faser, sum pyramide = 100%.
- **4-fase øktstruktur:** oppvarming 5 min · teknisk 25% · ferdighetsspill/utfordring 50% · press-trening 15%.
- **Skill Load / Challenge Point:** juster underlag/rekkefølge(blokk-seriell-random)/mål/feedback/press; tilpass etter readiness (HRV).
- **5 nye APP-bånd:** 200+, 150-200, 100-150, 50-100, <50 (granulær approach-baseline fra DataGolf).
- **Contextual bandit + embedding** (`raw/.../Replace the Scoring Engine...`): den dokumenterte ML-veien for å la motoren LÆRE hvilken drill som flytter SG mest per spiller-kontekst (utover regler + LLM).
- **Evidensbasert treningsvolum/kvalitet** + **talentutvikling fra bredde til elite** (LTAD-faser) — volum/dosering per nivå.

---

## 3. Tre moduler (dekomponert)

### Modul A — DataGolf fullt implementert
1. **Konsolider** alle DataGolf-kall i `client.ts` (flytt de to `/preds/approach-skill`-direktefetchene inn). **[S]**
2. **5 APP-bånd:** utvid `syncPgaApproach` til å aggregere `/preds/approach-skill` per de 5 båndene (fairway + rough) → `SgBaseline`/`PgaApproachDistance` med source + confidence + validFrom. **[M]**
3. **Koble ubrukte endepunkt** der de gir verdi: `getTournamentField` (pre-turnering felt/odds → turneringsforberedelse), vurder `player-decompositions` (SG-dekomponering per spiller for benchmark). **[M]**
4. **Baselines med kilde+konfidens** overalt (PGA Tour / HCP-matchet / AK Norsk) per Master Brain §2.2. **[S–M]**

### Modul B — AI Treningsplanlegger (operasjonaliser SG-spesifikasjonen)
**Mønster:** deterministisk deteksjon → harde regler (constraints) → AI-komposisjon → læring.
1. **Input-profil:** SG-profil (granulær, m/ konfidens per kategori), TrackMan-signaler (insight-engine), L-fase, periode (GRUNN/SPES/TURN), A-K-nivå/HCP, **spillemengde + readiness** (HRV/HealthEntry). **[M]**
2. **Deterministisk svakhet + Truth Layer:** velg fokus fra laveste SG-bånd *over konfidens-terskel*; kjør Truth Layer (Combine vs on-course) → teknisk vs mentalt. **[M]**
3. **Constraint-lag (harde regler fra Master Brain):** L-fase overstyrer SG tidlig, min 15% TEK, CS-tak, pyramide=100%, junior-vern, volum-tak per nivå/periode. **[M]**
4. **AI-komposisjon:** LLM (`tool_use`/`generateObject`) fyller AK-formel + 4-fase-struktur, **men returnerer exerciseId-er** (ikke navn) fra den filtrerte katalogen → ingen fabrikerte drills. **[M]**
5. **Forklarbarhet:** hver anbefaling viser «Hvorfor (SG-funn + konfidens) → forventet effekt». **[S]**
6. **Læring (senere):** contextual bandit på `PlanEffectiveness` + SG-delta (Master Brain-doc) — motoren lærer hvilken drill som flytter nålen per kontekst. **[L]**

### Modul C — Drill/Test/Øvelse-generator (SG/TrackMan-drevet)
1. **Koble den ferdige mock-UI-en** (`foresla-drill-modal.tsx`) til en ekte motor: svakhet (insight-engine/gapToDrill) → match `ExerciseDefinition` (pyramidArea/skillArea/lFase/csTargetByKategori) → topp-N med «Hvorfor» + rep-mål + TM-badge. **[M]**
2. **Rep-mål som `PositionTaskTmGoal` (HIT_RATE):** generer presise mål («8/10 innenfor ±2° face angle») + **bygg evaluerings-motoren** som re-beregner currentHits/progressPct fra `TrackManShot`. **[M–L]**
3. **Test-generator:** foreslå/generer `TestDefinition.protocol` (steps + scoring) fra svakhet → skriv som `isCustom`-test. **FYS-referanseverdier hardkodes IKKE — plassholder til Anders gir grønt lys** (låst regel). **[M]**
4. **Fyll `TrackManShot`** fra `rawJson` → gjør de 15 sg-hub-modulene query-bare som generator-input (avansert, men låser opp alt). **[M]**

---

## 4. Datagrunnlag — Master Brain som «fusion layer» (i akgolf-hq)

Master Brain er kilden; den bør destilleres til maskinlesbare regler + RAG + treningsdata som motoren bruker:
- **Regler → kode/JSON:** pyramide-%, L-fase-tabell, calculateDistribution-prioritet, AK-formel, volum-tak, invarianter → `src/lib/domain/`-konstanter eller `processed/rules/*.json` (finnes alt: `l-faser.json`, `pyramide.json`).
- **RAG-korpus:** chunked Master Brain-markdown m/ tags (l-fase, sg-band, pyramid, source) for AI-kontekst.
- **Treningsdata (labels):** `AiPlanGeneration` (historiske prompts/forslag) + `PlanEffectiveness` (SG-delta) + readiness → JSONL for bandit-læring.
- **Pipeline:** behold Master Brain raw→processed-flyten, men la motoren i akgolf-hq lese de prosesserte reglene (ikke KimiCode/Drizzle). En liten `scripts/import-masterbrain-rules.ts` kan seede `SgBaseline` + regel-konstanter.

---

## 5. Arkitektur (ett bilde)

```
SG (granulær Round-bånd + DataGolf-baseline)  ┐
TrackMan (insight-engine: strike/d-plane/      ├─► DETERMINISTISK SVAKHET + Truth Layer (teknisk vs mentalt)
  dispersion/fatigue) + ClubMetricTrend        ┘                │
Spillemengde + A-K-nivå + readiness (HRV) ──────────────────────┤
                                                                 ▼
   HARDE REGLER (Master Brain/CANON): L-fase>SG tidlig · 15% TEK · CS-tak · pyramide=100% · junior · volum-tak
                                                                 ▼
   AI-KOMPOSISJON (LLM tool_use → exerciseId-er): AK-formel + 4-fase-struktur + Skill Load
                                                                 ▼
   OUTPUT: TrainingPlan/økter (Workbench) · genererte driller m/ rep-mål (PositionTaskTmGoal) · tester (TestDefinition)
                                                                 ▼
   LÆRING: PlanEffectiveness (pre/post SG-delta) → contextual bandit (hvilken drill flytter nålen per kontekst)
```

---

## 6. Veikart (faser, bygger på det som finnes)

- **Fase 1 (raskest verdi):** Modul C steg 1 — koble mock-drill-UI til ekte SG/insight→ExerciseDefinition-matcher (deterministisk, ingen LLM-risiko). + Modul A steg 1–2 (konsolider DataGolf + 5 APP-bånd). **[M]**
- **Fase 2:** Modul B steg 1–5 — AI-planleggeren med constraints + exerciseId-binding + forklarbarhet + Truth Layer. Destiller Master Brain-regler til `processed/rules` + RAG (Fase 4 i Master Brain-planen). **[L]**
- **Fase 3:** Modul C steg 2+4 — `TrackManShot`-fylling + HIT_RATE-evalueringsmotor (låser opp presise rep-mål + de 15 modulene). **[L]**
- **Fase 4:** Modul C steg 3 (test-generator) + Modul B steg 6 (contextual bandit-læring). **[L]**

---

## 7. Vakter (kritisk — ellers blir motoren upålitelig)
- **Konfidens:** aldri anbefal på <8 runder; vis konfidens-språk per kategori.
- **L-fase overstyrer SG** i tidlige faser (KROPP/ARM/KØLLE → teknikk-tungt) — selv om SG sier noe annet.
- **exerciseId-binding:** AI velger fra katalog, aldri fritekst-drill → ingen fabrikerte øvelser.
- **FYS-referanseverdier låst** (plassholder til Anders).
- **Invarianter valideres** på hvert forslag (15% TEK, CS50, pyramide=100%, junior-regler).
- **Truth Layer** før teknisk konklusjon (skill du tekniske fra mentale problemer).

---

## 8. Åpne spørsmål
1. **Master Brain-regler:** OK at jeg destillerer reglene (pyramide/L-fase/AK-formel/volum) til `src/lib/domain/`-konstanter + `docs/`/`processed`-JSON i akgolf-hq (ikke KimiCode/Drizzle/Python-dashboard)?
2. **Generator-rekkefølge:** start med deterministisk drill-matcher (Fase 1, ingen LLM-risiko) før AI-komposisjon (Fase 2) — enig?
3. **Contextual bandit (Fase 4):** ambisjonsnivå nå — bygge enkел regel+LLM først og bandit senere, eller designe for bandit fra start?
4. **«Trackman-tall»-mappen du legger inn snart:** når den kommer, kobler jeg den inn som ny baseline-kilde + generator-input (samme mønster som DataGolf-approach-skill).

*Kilder: kodeverifisert 13. juni (fil+linje) + Master Brain (`~/Downloads/MasterBrain`: SG-spesifikasjon, data-organiseringsplan, evidensbasert grunnmur, contextual-bandit-doc).*
