> **Versjon:** kodeverifisert 14. juni 2026 (orkestrert workflow: 4 verifiseringsagenter + syntese).
> Forankrer Anders Workbench-utviklingsvisjon i FAKTISK kode (fil+linje). Designsystemet er LÅST
> (ingen nye farger/fonter). Ingen kodeendringer i denne planen.
>
> Kryss-referanser: docs/ai-treningsmotor-plan-2026-06-13.md (treningsmotoren Workbench KONSUMERER),
> docs/forenklingsplan-2026-06-13.md, docs/verdensledende-treningsapp-plan-2026-06-13.md.

Bekreftet mot kildekoden: SESSION_SELECT mangler `status` og `TrainingPlanSessionLog`-join (ingen planlagt-vs-faktisk), header er ærlig om at dette utelates, alle 4 AI-chips i topbar er hardkodet `disabled title="Kommer"`, og både `performance-peaking` og `plan-revision` har null consumers i app/components. Funn-settene holder. Her er planen.

---

# Workbench (PlayerHQ) — beslutningsklar utviklingsplan

*Senter for «den levende planen». Syntese av 4 kodeverifiserte funn-sett, 2026-06-14.*

---

## 1. Sannheten i dag

**Den delte kjernen er ekte.** `load-workbench.ts` + `workbench.tsx` henter virkelig planlagte økter (TrainingPlanSession + SessionDrill + Goal + TournamentEntry) og projiserer dem i uke/tidslinje/kanban/dashboard, rolle-parametrisert for spiller og coach. Loaderen er **ærlig** i sin egen header (linje 9-21): den sier rett ut hvilke felter den ikke har kilde til. Det er en sunn grunnmur — ikke en fasade.

**Men nesten all «intelligens» og «direkte manipulasjon» er attrapp.** Tre ting gir falskt inntrykk av ferdig funksjon:

1. **De 4 AI-chipene i topbaren** («Generér uke», «Balansér», «Foreslå taper», «Fyll standardøkter») er hardkodet `disabled title="Kommer"` (`topbar.tsx:130-141`, verifisert). De *ser* ut som motoren er der — den er ikke koblet.
2. **`workbench-client.tsx` (~2021 linjer)** er en komplett hardkodet design-demo for Øyvind/Uke 21. Alt er statisk. Den må aldri forveksles med den delte kjernen — den representerer **null** kjørende logikk.
3. **De 6 coach-handlingene i inspektoren** svarer «Registrert. Lagring kobles til når økt-dataen er på plass» (`_coach-actions.tsx:273-284`). Rotårsaken er konkret: valgt økt har **ingen DB-id** — `SelectedSession.key` er syntetisk `"{dow}-{h}"` (`data.ts:405`). Ingenting kan muteres før økter har ekte id.

**To kraftige motorer er fullt bygd, men har null consumers** (verifisert med grep — ingen treff i `src/app` eller `src/components`):
- `performance-peaking.ts:74-243` — komplett deterministisk Bompa-periodisering (GRUNN→OPPBYGGING→SPESIALISERING→TAPER, baklengs fra turneringsdato).
- `plan-revision.ts` — taper/skade/runde-revisjon.
- `cs-progression.ts:87-171` — TrackMan klubbhastighet-trend + skade-varsel. Også orphan.

**Den ENESTE ekte, koblede data-loopen:** training-gap-agenten (`training-gap.ts`) skriver `PlanAction` når svakeste SG-område får <20 % treningstid, og SG-hub har en ekte «Gap→drill»-bro som lenker til Workbench (`sg-hub.tsx:552-558`). Men broen **stopper ved en navigeringslenke** — den legger ikke drill-blokken inn i uka.

**Kort sagt:** grunnmuren bærer. Det som mangler er (a) ekte økt-id på valgt blokk, (b) mutasjons-handlinger (flytt/resize/opprett/slett), og (c) ledninger fra ferdige motorer til UI. «Den levende planen» er i dag en plan du kan **se**, ikke en du kan **røre**.

---

## 2. Gap-analyse per visjonsområde

### Klynge WB — strukturell canvas/plan-redskap

| Feature | Status | Fil:linje | Gap | Omf. |
|---|---|---|---|---|
| Periode-canvas | MANGLER | workbench:187 | Ingen periode-akse å arbeide på | L |
| Generér uke | DELVIS | topbar:130 | Chip disabled, ingen diff-flyt | L |
| Årsvisning | DELVIS | topbar:158 | Ingen drag | L |
| Standardøkter | DELVIS | OktMalLib | Mal-bibliotek finnes men er orphan | M |
| Mal-deling | MANGLER | topbar:241 | Ingen delefunksjon | L |
| Plan A/B | DELVIS | actions:103 | Ingen diff mellom varianter | M |

### §1–§7 — intelligens, data-loop, samarbeid, interaksjon

| # | Feature | Status | Fil:linje (bevis) | Gap | Omf. |
|---|---|---|---|---|---|
| §1 | **Balansér (AI)** — ett-trykk-omfordeling mot pyramide-mål | DEMO | topbar:133-135 (disabled); dir-b-tidslinje:43-46 (ingen onClick); pyramid-weighting:136-167 (kun tekst-anbefaling) | Mangler mutasjons-action + lås-flagg på blokker + omfordelings-algoritme | L |
| §2a | **Foreslå taper** — fjern minst verdifulle økter | DEMO | topbar:137-139 (disabled); plan-revision:381-407 (faselogikk, 0 consumers) | Ingen verdi-score per økt, ingen fjern-operasjon | L |
| §2b | **Auto-periodisering fra mål** (Bompa baklengs) | DELVIS | performance-peaking:74-243 (ferdig, **0 consumers**); tournament-prep koblet KUN i turnering-detalj (actions.ts:66-85) | Motoren aldri kalt fra Workbench — mangler action + UI-inngang som materialiserer faser som økter | M |
| §2c | **Vær-bevissthet** | MANGLER | v6-fixtures:186 (statisk WEATHER_DATA); session har environment-felt | Ingen værkilde (yr/met.no), ingen flytt-ute-økt-logikk | M |
| §3 | **Mål→drill-bro** | DELVIS | sg-hub/page:287-307 (ekte gapToDrill); sg-hub:552-558 (Link til /portal/planlegge) | Broen stopper ved navigering — legger ikke SessionDrill-blokk inn i uka | M |
| §4 | **Planlagt vs faktisk** — utført-skygge på blokk | DEMO | load-workbench SESSION_SELECT (selecter ikke status, joiner ikke …Log — **verifisert**); …Log finnes i schema:1057-1076 | Legg status + …Log i SELECT, rend logget-vs-planlagt-prosent per blokk | M |
| §5 | **Test-drevet planlegging** (test→pyramide-omfarging) | MANGLER | test-agent.ts:1-50 (skriver Signal TEST_TREND); 0 UI-treff; week-progress:103-105 (teller hardkodet 0 tester) | Ingen kobling test→pyramide; signalet leses ingen steder | M |
| §6 | **TrackMan→fys-volum-nudge** | DEMO | cs-progression:87-171 (ferdig, **0 prod-consumers**); trend-seksjon:227 (KPI uten kobling) | Ingen agent som leser CS-trend og foreslår fys-volum-justering | M |
| §7 | **Hva-om-simulator** (SG/hcp-projeksjon m/ konfidensbånd) | MANGLER | sg-scatter/compute:218-237 (computeConfBand — kun bakover på historikk) | Ingen framtidsprojeksjon; regresjon brukes bare beskrivende | L |

### §4 Coach-samarbeid + §5 Interaksjon & hastighet

| Feature | Status | Fil:linje | Gap | Omf. |
|---|---|---|---|---|
| Sanntids-forslag + venter-godkjenning | DEMO | _coach-actions:273-284 (tomme stubs); PlanChangeRequest finnes schema:3031-3050; spiller oppretter (coach/actions:262) | Ingen coach-flate setter APPROVED/REJECTED (0 treff `planChangeRequest.update`); valgt økt mangler sessionId (data.ts:405); ingen sanntid | L |
| Delt markør / presence | MANGLER | supabase/client:2 (kun kommentar); 0 `.channel()`/presence | Hele funksjonen mangler | L |
| Forelder-vindu (read-only uke) | DELVIS | forelder/barn:82-346; ukerapport:66-104 | Er per-barn-profil m/ fortid, ikke 1:1 read-only utdrag av kommende uke | M |
| Command palette (utfør kommando) | DELVIS | global-search-modal (begge produkter); cmd-palette:34-55; WB-søk readOnly (workbench-client:558-560) | Kan navigere/søke, ikke parse «legg approach-økt onsdag 14:30» → mangler intent-parser + action | L |
| Tastatur overalt | MANGLER | week-view:135-143 (kun Enter/Space); kun Cmd+D ellers | Ingen globalt hotkey-lag (piltaster, N, G, 1-4) | M |
| Resize = varighet | MANGLER | week-view:130 (statisk høyde); @dnd-kit finnes i plans/[planId] | Ingen resize-håndtak + action som oppdaterer durationMin | M |
| Multi-select & bulk | MANGLER | workbench:119 (én selectedSession) | Ingen fler-valg + bulk-meny + actions | M |
| Optimistisk & offline | MANGLER | 0 `useOptimistic` i hele src | Ingen skeleton/optimistisk UI i Workbench | L |
| Undo / redo | MANGLER | workbench:104-234 | Forutsetter at mutasjoner persisteres først | L |

### §6 belastning + §7 visninger

| Feature | Status | Fil:linje | Gap | Omf. |
|---|---|---|---|---|
| 6.1 ACWR / 6.2 Restitusjon | MANGLER | cs-progression:156-160; load-calendar:20-45 (aldri importert); HealthEntry schema:583 | Ingen ACWR-motor, ingen HRV, ingen hvile-aksetype | L |
| 6.3 Skade-aware drills | DEMO | plan-revision:367-381 (0 UI-kall); rehabPlan leses aldri | Ingen Leave→drill-kobling | L |
| 7.4 Dag-visning overlapp | DELVIS | day-view:114-118 (kun demo) | Ingen overlapp-håndtering, ingen ekte data-prop | M |
| **7.5 Kanban + Dashboard** | **REELL** | kanban-view:18; dashboard-view:60; workbench:191-193 | Trender/balanse/SG fortsatt demo; kanban uten drag | S |
| 7.6 Heatmap 52uker×5akser | MANGLER | heatmap-calendar:19-26 (26 uker, 1 verdi, aldri importert) | Ikke koblet i Workbench | M |
| 7.7 Fokus-modus | MANGLER | workbench:219-227; 0 `hideSidebar` | Ingen knapp som skjuler sidebar/inspector | S |

> **Kryss-referanse — ikke dupliser AI-motoren.** §1, §2a, §2b, §3, §5, §6, §7 KONSUMERER motoren i `docs/ai-treningsmotor-plan-2026-06-13.md` (mål→drill, SG↔trening, generator). Workbench skal **ikke** eie generering/scoring — den skal kalle den motoren via server-actions og **materialisere resultatet som TrainingPlanSession-blokker**. Workbench er konsument og redigeringsflate; treningsmotoren er produsent.

---

## 3. Byggesekvens (MVP+ / V2 / V3)

Rangert etter verdi × nærhet til byggekloss. **[KOBLE]** = lav risiko, motor/data finnes. **[NYBYGG]** = ny logikk.

### Grunnstein (blokkerer alt annet — gjør først)
- **G0. Ekte sessionId på valgt blokk [KOBLE].** Fiks `SelectedSession.key` (data.ts:405) til å bære ekte `TrainingPlanSession.id`. **Dette låser opp ALL mutasjon** — uten det er ingen coach-handling, drag, resize eller undo mulig. Liten endring, enorm hevarm.

### MVP+ (de tingene som gjør planen «levende» — størst verdi per krone)
1. **§4 Planlagt-vs-faktisk-skygge [KOBLE].** Legg `status` + `TrainingPlanSessionLog` (totalReps/completedAt) i SESSION_SELECT (load-workbench), rend logget-vs-planlagt-% på hver blokk. Data finnes i schema:1057-1076. *Gjør planen til en levende loop — du ser hva som faktisk skjedde.*
2. **§3 Mål→drill legger ekte blokk [KOBLE+lite nybygg].** La «Legg til i Workbench» (sg-hub:552-558) kalle en action som oppretter TrainingPlanSession + SessionDrill i inneværende uke, i stedet for bare å navigere. *Fullfører den ene ekte loopen vi har.*
3. **Resize + flytt = varighet/tid [NYBYGG, men @dnd-kit finnes].** Drag/resize på EventBlock → action som oppdaterer scheduledAt/durationMin. Mønsteret finnes i `plans/[planId]/draggable-sessions.tsx`. *Kjernen i «direkte manipulerbart».*
4. **§2b Auto-periodisering fra mål [KOBLE].** Action + UI-inngang i Workbench som kaller ferdig `foreslaPeakingPlan` og materialiserer fasene som økter. Motoren er 100 % bygd (peaking:74-243). *Høyeste verdi/innsats i hele lista — ren ledning.*
5. **Optimistisk UI + skeleton [NYBYGG].** `useOptimistic` på øktmutasjonene (forutsetter G0+pkt 3). Skeleton-komponenter finnes i 27 andre filer. *Gjør manipulasjon rask nok til å føles direkte.*

### V2 (intelligens-laget — koble de orphanede motorene)
6. **§1 Balansér (AI) [KOBLE+nybygg].** `vurderPyramide` (pyramid-weighting:136-167) gir avviket; bygg mutasjons-action som flytter ikke-låste økter mot idealfordeling. Krever et **lås-flagg** på blokker (nytt). Koble til topbar-chip + tidslinje-knapp.
7. **§6 TrackMan→fys-nudge [KOBLE].** Agent som leser `beregnCsProgresjon` (NED/MULIG_SKADE) → skriver PlanAction (samme mønster som training-gap). Motoren er ferdig.
8. **§5 Test→pyramide [KOBLE].** La UI lese TEST_TREND-signalet (test-agent) og fargelegge svakeste akse i pyramide-kortet; fiks den hardkodede «0 tester» (week-progress:103-105).
9. **§4 Coach godkjennings-løkke [NYBYGG].** Coach-flate som setter PlanChangeRequest APPROVED/REJECTED (modellen finnes, schema:3031-3050). Lukker den halvt-koblede løkken.
10. **§2a Foreslå taper [KOBLE+nybygg].** Verdi-score per økt + fjern-operasjon, drevet av plan-revision/peaking-TAPER-faser.
11. **Undo/redo + multi-select/bulk [NYBYGG].** Forutsetter at mutasjoner (pkt 3) persisteres.

### V3 (premium-følelse + avanserte motorer)
12. **§7 Hva-om-simulator [NYBYGG].** Ekstrapoler `computeConfBand` (sg-scatter:218-237) framover; interaktivt panel: planlagt volum → projisert SG/hcp m/ 95 %-bånd.
13. **§6.1/6.2 ACWR + restitusjon [NYBYGG].** Importer ubrukt LoadCalendar, ny hvile-aksetype, evt. HRV.
14. **§2c Vær-bevissthet [NYBYGG].** met.no/yr-integrasjon flytter BANE/RANGE-økter.
15. **Delt presence + live cursor [NYBYGG].** Supabase Realtime — ren ny funksjon.
16. **Maldeling, periode-canvas, command-palette-utfør, tastatur-lag, heatmap 52u, fokus-modus** — lavere haste, polér når kjernen lever.

---

## 4. Topp 3 høyeste hevarm (raskest demo→reell verdi)

1. **G0: Ekte sessionId på valgt blokk.** Én liten fiks (data.ts:405) som låser opp *alle* mutasjoner og dreaktiverer 6 døde coach-handlinger. Uten den er resten umulig. Start her.
2. **§2b: Koble `foreslaPeakingPlan` til en Workbench-knapp.** En komplett Bompa-periodiseringsmotor (170 linjer) ligger død. Én action + én knapp gjør «auto-plan fra måldato» ekte. Mest ferdig verdi per time i hele prosjektet.
3. **§4: Legg status + …Log i SESSION_SELECT.** To linjer mer i et eksisterende SELECT + en prosent-skygge per blokk forvandler planen fra «statisk plan» til «levende loop» (planlagt vs faktisk). Data finnes allerede.

Fellesnevner: alle tre er **koble eksisterende**, ikke nybygg. Den dyreste delen av visjonen er allerede betalt — den er bare ikke plugget i.

---

## 5. Claude Design-prompter som trengs

Nye/ombygde Workbench-flater (designsystemet er LÅST — port til eksisterende tokens):

1. **Blokk-tilstander på kalender/tidslinje** — EventBlock med: utført-skygge/prosent-fyll (§4), lås-ikon (§1), resize-håndtak nedre kant, drag-grep, multi-select-markering. Alle varianter på én skjerm.
2. **AI-handlingsbånd (topbar-chips aktive)** — «Generér uke / Balansér / Foreslå taper / Auto-periodiser fra mål» i aktiv tilstand + **diff/forhåndsvisnings-modal** som viser hva AI vil endre før godkjenning (AI foreslår, overstyrer aldri).
3. **Auto-periodiser-inngang (§2b)** — velg mål/turnering m/ måldato → forhåndsvis Bompa-faser → materialiser. Liten wizard eller sheet.
4. **Hva-om-simulator-panel (§7)** — skyvere for planlagt volum per akse → projisert SG/hcp-bane m/ 95 %-konfidensbånd. Gjenbruk SgTrainingScatter-visualet.
5. **Coach-godkjenning av planendring (§4)** — coach-side: liste over ventende PlanChangeRequest m/ Godkjenn/Avvis + diff av hva spilleren ber om.
6. **Belastnings-/restitusjons-widget (§6.1/6.2)** — ACWR-måler + hvile-blokk-tilstand i dashboard-fanen.

> §5 (test→pyramide) og §3 (mål→drill) trenger **ingen** ny design — de gjenbruker eksisterende pyramide-kort og drill-blokk; kun ledningen mangler.

---

## 6. Åpne spørsmål til Anders

1. **Lås-mekanikk for §1 Balansér:** Skal en låst økt være eksplisitt (spiller/coach trykker hengelås), eller skal alt coachen har lagt inn være automatisk låst mot AI-omfordeling? Dette avgjør datamodellen (nytt `locked`-felt vs. avled fra `createdByRole`).

2. **AI-forhåndsvisning — alltid diff, eller direkte for «trygge» grep?** Visjonen sier «AI foreslår, overstyrer aldri». Skal *alle* AI-grep (også Balansér/Auto-periodiser) gå via en godkjennings-diff, eller kan f.eks. «Fyll standardøkter i tom uke» skje direkte? Påvirker hvor mange diff-modaler vi designer.

3. **§4 planlagt-vs-faktisk — hvilken sannhet?** Det finnes to logge-spor (TrainingPlanSessionLog og TrainingSessionV2/WeekProgressCard — Spor A/B sameksisterer bevisst). Hvilket skal styre blokk-skyggen i Workbench? Anbefaling: TrainingPlanSessionLog, siden den er per-økt og fryses ved fullføring.

4. **§2c Vær — verdt det nå?** Værstyrt flytting av ute-økter er kult, men krever ekstern API og er ikke nær noen byggekloss (helt fraværende). Skal den vente til V3, eller er det en signatur-feature du vil ha tidlig?

5. **Sanntid/presence — for hvem?** Delt cursor (§4) gir mening når coach + spiller redigerer samme plan samtidig. Skjer det i praksis, eller er asynkron forslag-og-godkjenn (PlanChangeRequest) nok? Presence er stor (L) og lett å nedprioritere hvis svaret er «asynkront holder».

---

**Relevante filer (alle absolutte):**
- Kjerne: `/Users/anderskristiansen/Developer/akgolf-hq/src/lib/workbench/load-workbench.ts`, `/Users/anderskristiansen/Developer/akgolf-hq/src/components/workbench/workbench.tsx`
- Blokkerer mutasjon: `/Users/anderskristiansen/Developer/akgolf-hq/src/components/workbench/data.ts:405`
- Døde motorer å koble: `/Users/anderskristiansen/Developer/akgolf-hq/src/lib/ai/agents/performance-peaking.ts`, `…/src/lib/ai/agents/plan-revision.ts`, `…/src/lib/domain/cs-progression.ts`, `…/src/lib/domain/pyramid-weighting.ts`
- Disabled AI-chips: `/Users/anderskristiansen/Developer/akgolf-hq/src/components/workbench/topbar.tsx:130-141`
- Ekte loop (mal): `/Users/anderskristiansen/Developer/akgolf-hq/src/lib/agents/training-gap.ts`, `…/src/app/portal/mal/sg-hub/sg-hub.tsx:552-558`
- Kryss-ref motor: `/Users/anderskristiansen/Developer/akgolf-hq/docs/ai-treningsmotor-plan-2026-06-13.md`
