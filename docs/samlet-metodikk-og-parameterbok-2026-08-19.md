# Samlet metodikk- og parameterbok — én lesing, én oppryddingsjobb

**Satt sammen:** 19.08.2026, av Claude Code. **Kilder (alle datert 18.08.2026, lest i sin
helhet før sammenslåing):**
`vokabular-planlegging-2026-08-18.md` · `kanon-revisjon-workbench-2026-08-18.md` ·
`metodikk-planlegging-komplett-2026-08-18.md` · `parameterbok-planlegging-2026-08-18.md` ·
`forslag-parameterbok-fasit-2026-08-18.md` · `forslag-workbench-kalender-optimal-2026-08-18.md`.
De seks originalene er ikke slettet — dette dokumentet er en lesbar inngang, ikke en erstatning.
Ved tvil om ordlyd: originalen har detaljene, dette dokumentet har prioriteringen og status.

**Hvordan dette dokumentet er organisert:** Kapittel 0 er det viktigste — les det først, det
endrer hvordan alt resten skal leses. Deretter: én seksjon per kildedokument, filtrert for det
som er avgjort/utdatert siden 18.08 kveld, og til slutt én samlet sjekkliste (kapittel 7) med
alt som fortsatt venter på et JA/NEI fra deg.

---

# 0. Konteksten som endrer alt — les dette først

**18.08.2026, samme kveld dokumentene under ble skrevet, tok du en beslutning midt i økten:**
«Ingenting skal være låst eller canon. Spilleren står helt fritt.» Dette ble implementert
og merget til main SAMME KVELD (PR #562, ~45 filer over 3 commits):

- `src/lib/canon/` — hele mappen, inkludert de 9 invariantene (`invarianter.ts`) — **slettet**
- `training/invariants.ts` — **slettet**
- `PERIODE_CONSTRAINTS` + `periode-constraints.ts` + admin-siden
  `/admin/settings/periode-fordeling` — **slettet**
- Junior-guard-sperren, periodiseringssperren for tekniske endringer — **slettet**
- Alle «CANON anbefaler»-hint — **fjernet**
- CANON som overstyrende fasit-begrep — **pensjonert** (vokabularet består som frie merkelapper)

**Konsekvens for dokumentene under:** `kanon-revisjon-workbench` (kapittel 2),
`metodikk-planlegging-komplett` (kapittel 3), `parameterbok-planlegging` (kapittel 4) og
`forslag-parameterbok-fasit` (kapittel 5) ble alle skrevet **mot koden som den var FØR
sletting** — flere av funnene og forslagene deres handler om regler som ikke lenger finnes.
Jeg har markert hvert punkt som **[SLETTET/UTDATERT]** der det gjelder selve
regel-håndhevingen (invarianter, min/maks-prosenter, tak, «Overstyr med begrunnelse»),
og latt punktene stå **åpne** der de handler om ren datamodell/navngiving/struktur som
fortsatt eksisterer (enums, kategorisystem, testantall, blokk-typer som *begrep*, osv.) —
det skillet er den viktigste jobben dette dokumentet gjør.

**Ny fasit for ordforrådet:** `docs/vokabular-planlegging-2026-08-18.md` (kapittel 1 under) —
upåvirket av slettingen, siden den aldri beskrev regler, kun merkelapper.

---

# 1. Vokabular — gjeldende ordforråd (upåvirket av opplåsingen)

Full tekst: `docs/vokabular-planlegging-2026-08-18.md`. Kort referanse:

- **Pyramide (5):** FYS · TEK · SLAG · SPILL · TURN (nedenfra og opp — visningsrekkefølge, ikke hierarki)
- **Områder (16, fra Paper):** TEE · INNSPILL_50/100/150/200 · CHIP · PITCH · LOB · BUNKER ·
  PUTT_0_3/3_5/5_10/10_40/40_PLUSS · STYRKE · MOBILITET · BANE
- **AK-formel v2:** `PYRAMIDE_OMRADE_MOTORIKK_BELASTNING_PRESS`
  - Motorikk: UTEN_BALL · LAV_HAST · AUTO
  - Belastning: INNENDORS · TRENINGSOMRADE · BANE · KONKURRANSE
  - Press: ALENE · OBSERVERT · KONKURRANSE · TURNERING
  - **Utgått, skal ikke brukes:** L-fasene (KROPP/ARM/KØLLE/BALL/AUTO), CS-nivåer, M0–M5, PR1–PR5
- **Periodisering (8):** GRUNN · SPESIALISERING · TURNERING · EVALUERING · TESTUKE · FERIE ·
  TRENINGSSAMLING · HELDAGSSAMLING — merkelapper på kalenderen, ingen begrensning
- **Kategorier:** A–L, 12 nivåer (A = elite) — **NB, avvik fra global CLAUDE.md** som fortsatt
  sier «A–K, 11 nivåer» under §Faglig grunnlag. Se punkt 11 i sjekklisten (kapittel 7).
- **Blokk-typer (9, som begrep/visning i Workbench):** Økt · Skole · Booking · Turnering ·
  Reise · Test · Sjekkpunkt · Helse · Gruppeøkt
- **Tester:** 31 protokoller i databasen (spilleren ser 21 CANON-rader + egne, per T5 16.08)

---

# 2. Kanon-revisjon av Workbench-fasitene — status etter PR #561

Original: `docs/kanon-revisjon-workbench-2026-08-18.md`. Dette var en lese-jobb (ingen filer
endret) som fant tre RØDE avvik i seks Paper-HTML-filer. **Alle tre er siden rettet i PR #561
(merget):**

| Sjekkpunkt | Funn 18.08 | Status nå |
|---|---|---|
| 11. Navnekanon | «Emma Sæther» i `workbench-stall.html`, `workbench-stall-mobil.html`, `AgencyosWorkbench.dc.html` | **[FIKSET, PR #561]** → Øyvind Rohjan, 3 filer |
| 8. Raster og tid | `workbench-stall-mobil.html`: «06:00–22:00» to steder | **[FIKSET, PR #561]** → 05:00–23:00 |
| 4. L-faser/ID-mønster | `AgencyosWorkbench.dc.html`: L-CTRL/L-BALL/L-COMP + utdatert ID `TEK_TEE_L-BALL_CS60_M2_PR2` | **[FIKSET, PR #561]** → v2-formelen |

**Ikke bekreftet rettet — sjekk ved neste anledning:**

| Sjekkpunkt | Funn | Merknad |
|---|---|---|
| 5. Agentflyt | `AgencyosWorkbench.dc.html:68` — «Godkjenn»-knapp uten synlig «Avvis»/«Hvorfor?» i samme utsnitt | Kan være utenfor grep-vinduet — bør sjekkes mot full komponentkilde |
| 9. Roller | `workbench-desktop.html`/`workbench-mobil.html`: 0 treff på «coach eier» (finnes kun i stall-filene) | Uklart om bevisst utelatt (fase1 ikke ferdig) eller reelt hull |
| 10. Språk | `⚠`/`✓` som Unicode-dingbats i stedet for Lucide-ikoner (`AlertTriangle`/`Check`) — fire steder | Global CLAUDE.md: aldri emoji/dingbat i UI |
| 12. Tokens | Ingen `--p-*`-prefiks i workbench-HTML-ene (bruker eget inline `:root` med `--bg/--fg/--accent`) | **Konflikt B i originalen** — uklart om `--p-*` faktisk er påkrevd her; ikke avgjort |
| 2. Budsjett | KPI-stripe viser kun målte tall, ingen «9 t av 5–8 t»-nevner | **[SLETTET/UTDATERT]** — budsjett-/regelvisning var allerede fjernet fra UI 01.08, og selve regelgrunnlaget (invariantene) er nå borte fra koden også. Ikke noe å rette — dette ER riktig tilstand nå. |

**Åpent, avklares med deg (ikke et sikkert brudd):** `workbench-turnering.html` bruker egne
demo-navn (Max Risvåg, Sondre U. Thøgersen) — bevisst fordi turneringsvisning har flere
deltakere, eller bør Øyvind Rohjan vises der også? Se også kapittel 3 punkt 7.

---

# 3. Metodikk vs. kode — hva er faktisk avgjort

Original: `docs/metodikk-planlegging-komplett-2026-08-18.md`. Filtrert for opplåsingen —
regel-relaterte funn er markert utdatert, resten står som reelle åpne spørsmål.

## 3.1 Kan lukkes nå — koden/beslutningen har allerede valgt

1. **Kategoriretning A–K vs. A–L:** koden (`ak-kategori.ts`) og ak-second-brain er enige om
   A=elite. Masterbrains `canon-methodology.json` har fortsatt motsatt retning (A=nybegynner,
   handicap-basert) — **rett den filen**, ingen ny beslutning nødvendig.
2. **v2 vs. v3-navn:** avgjort i økten 18.08 — **v2**. Rett ak-second-brains tre filer
   (`ak-formelen.md`, `ak-golf-canon.md`, `iup-kategorisystem.md`) fra «v3». Allerede brukt i
   PR #561.
3. **Drill-navnene i ak-second-brain:** `morad-common-faults.md`, `morad-diagnostiske-regler.md`,
   `morad-drill-bibliotek.md` refererer fortsatt 9 drill-navn Masterbrains bank fjernet
   31.07.2026 (selvmotsigende CS/pyramide-data). Koden (`drill-forslag-agent.ts`) nekter
   allerede å bruke dem («never-invent-loven»). **Rett de tre filene** til å matche.
4. **Testprotokoll-antall:** database har 31, ikke 20/21/36. Oppdater kunnskapsfilene med
   forklaring (15 NGF-oppdaterte + 5 nye + 11 øvrige, per seedskriptet godkjent 23.05.2026).

## 3.2 [SLETTET/UTDATERT av opplåsingen 18.08] — ikke lenger relevant å avgjøre

- Invariant-antall (9 vs. 13 vs. 7) — **hele `invarianter.ts` er slettet.** Spørsmålet
  bortfaller.
- TEK-minimum periodeavhengig (15–25 %) vs. flatt 15 % i CLAUDE.md — **PERIODE_CONSTRAINTS er
  slettet**, det finnes ikke lenger noe periodeavhengig tall i kode å sammenligne mot. CLAUDE.md
  sin gamle «TEK min 15 %»-linje under §Faglig grunnlag bør uansett merkes utdatert siden hele
  invariant-rammeverket er borte — se punkt 13 i sjekklisten.
- Periodiseringsmodell (CANON/IUP/GFGK vs. `LPhase`) — `LPhase`-enumet i databasen **består**
  (det er datalagring, ikke et regelverk), men spørsmålet om «hvilken modell skal vinne» var
  primært knyttet til hvordan periode-constraints tolket dem. Fortsatt verdt å avklare som
  **navnekonsolidering** (se punkt 6), men ikke som regelspørsmål.

## 3.3 Krever et faktisk valg fra deg

5. **Målestokk for kategori** — snittscore, handicap, eller begge med omregningstabell?
6. **Periodisering, navnekonsolidering** — `LPhase` (database, i drift) vs. `PeriodeType`
   (kun brukt av det nå slettede constraint-systemet — trolig moden for fjerning eller
   sammenslåing rett inn i `LPhase`, siden dens eneste bruker er borte). Bør revurderes i lys
   av at `PeriodeType` kanskje ikke lenger trengs i det hele tatt.
7. **Turneringsplanlegging inn i Workbench** — beslutning 04.08.2026 sier
   `workbench-turnering.html` skal bygges som DEL av `WorkbenchV2`. Koden har fortsatt
   `TurneringPlanleggerV2.tsx` som frittstående, ikke integrert komponent. Samme punkt som
   kapittel 6.
8. **895 drill-kandidater** — gå gjennom nå, eller vente til punkt 5/6 er avklart?
9. **Ordbok-attribusjon** — «Mac O'Grady» (rettet fra «Mac Malaska» 31.07.2026), men filen
   markerer selv `uverifisert_av_anders: true`. Bekreft (ditt eget treningsmateriale 2011–2016).
10. **CS-nivåene** — bekreftet 18.08: fjernes fra alt nytt inntil videre. Brukes fortsatt i
    gammel kode/kunnskapsfiler — se punkt 14 for konkret opprydding.

## 3.4 Nye funn fra kodegjennomgangen (ikke regel-relatert, fortsatt gyldig)

11. **Press-navn i `ak-formel-visning.ts`:** koden bruker fortsatt `FRI/KRAV/UTFORDRING/
    KONKURRANSE`, ikke den vedtatte `ALENE/OBSERVERT/KONKURRANSE/TURNERING` (Anders 05.08).
    Ren omdøping — trenger en liten kodeendring, ikke en ny beslutning.
12. **`SkillArea`-enumet** (5 verdier) er mye grovere enn AK-formelens OMRÅDE-liste
    (16 verdier). Se forslaget i kapittel 5, punkt 1.
13. **Turneringsplanlegging** — se punkt 7 over.
14. **`ExerciseDefinition.lPhase`** kan være en navnekollisjon mellom periodiserings-`LPhase`
    og motorikk-steget (UTEN_BALL/LAV_HAST/AUTO) — bør avklares før driller kobles til periode.

---

# 4. Parameterbok — datamodellen som faktisk kjører (referanse)

Original: `docs/parameterbok-planlegging-2026-08-18.md` (den markerer seg selv **HISTORISK**
øverst for §4.1/§6-regeltallene — bekreftet riktig markering). Alt i denne seksjonen er
**enums og datastruktur**, ikke regler — disse eksisterer fortsatt i skjemaet uavhengig av
opplåsingen. Bruk denne som oppslag når du krysser av i kapittel 7, ikke som pensum å lese
lineært.

**Fortsatt i drift (upåvirket):**
- `PyramidArea` (5), `SkillArea` (5, grov), OMRÅDE-listen (16, finkornet — kun i formelstreng)
- `FaseSteg`/motorikk-bro i `ak-formel-visning.ts`, gamle `LFase`-enum (L_KROPP…L_AUTO) som
  lagringsformat bak broen
- `MMiljo` (M0–M5) som lagringsformat, `CSNivaa` (CS50–100)
- `LPhase` (periodisering, 7 verdier) og `PeriodeType` (5 verdier, delvis overlapp) — se punkt 6
- `NgfKategori` (A–L, 12), `STANDARD_PYRAMIDE`/`STANDARD_OKT_ANTALL` per kategori
- `PracticeType`/`DrillPracticeType` (RANDOM vs. VARIABEL — to navn, se punkt 7 kap. 5)
- `SessionStatus` + `SessionStatusV2` (to parallelle enums, se punkt 8 kap. 5)
- `TestDefinition` (31 rader), `TournamentEntry`/`TournamentPreparation`, `ExerciseDefinition`
- `PlayerBusyBlock.kind` (fritekst, 5 verdier) vs. fasitens 9 blokk-typer — se punkt 16 kap. 5
- `Group.level` (A1–A5, eget nivåsystem — kolliderer navnemessig med spillerkategori A–L)
- `PlayerProgram` (9 verdier) vs. AK-stigens navn (Mini/Basis/Utvikling/Elite) — se punkt 18 kap. 5

**[SLETTET/UTDATERT]:** §4.1 (PERIODE_CONSTRAINTS-tabellene: pyramide-min/maks per periode,
L-fase-fordeling per periode, praksistype-fordeling, ukevolum min/maks) og §6 (de 9
invariantene i `invarianter.ts`) i originaldokumentet — begge filene disse tallene kom fra er
slettet fra koden. Tallene har ingen kjørende motpart lenger.

---

# 5. Forslag til fasit — filtrert etter opplåsingen

Original: `docs/forslag-parameterbok-fasit-2026-08-18.md`, 26 punkter. **[DITT VALG]**,
**[DOKUMENT-RETTING]**, **[KODE-ENDRING]**-merkingen fra originalen er beholdt der forslaget
fortsatt er relevant.

## 5.1 Fortsatt relevante forslag (datamodell/navngiving, ikke regelhåndheving)

1. **Områder (5 vs. 16):** [DITT VALG] behold begge — `SkillArea` grov database-akse,
   16-listen som eget `omrade`-felt (zod-validert, ikke Prisma-enum) på `TrainingPlanSession`,
   med automatisk utledning til `SkillArea`.
2. **Motorikk-stavemåte:** [DOKUMENT-RETTING] `LAV_HAST` vinner (Paper), rename i
   `ak-formel-visning.ts`.
3. **Gamle L-faser i DB:** [DITT VALG] behold som lagringsformat bak broen, ikke migrer nå.
5. **Press-navn:** [KODE-ENDRING] implementer 05.08-vedtaket
   (FRI→ALENE, KRAV→OBSERVERT, UTFORDRING→KONKURRANSE, KONKURRANSE→TURNERING). Vær
   oppmerksom på at gammelt og nytt «KONKURRANSE» betyr ulike PR-nivåer (PR3 vs. PR4/5) —
   søk gjennom all sammenlignende kode før merge.
7. **RANDOM vs. VARIABEL:** [DITT VALG] VARIABEL vinner (norsk fagbegrep), enumene slås sammen.
8. **To session-status-enums:** [KODE-ENDRING] konsolider til `SessionStatusV2`.
11. **A–K vs. A–L:** [DITT VALG] A–L (12) — databasen vinner, kunnskapsfiler + CLAUDE.md rettes.
12. **Masterbrains kategoriretning:** [DOKUMENT-RETTING] rett `canon-methodology.json`.
13. **Tre kategorimålestokker:** [DITT VALG] snittscore primær, handicap som inngangsproxy.
16. **Blokk-typer (9 vs. 5 fritekst):** [KODE-ENDRING] innfør fasitens 9 som enum, migrer
    fritekst. Merk: flere av de 9 er egne modeller (BOOKING, TURNERING, TEST, GRUPPEOKT), ikke
    busy-blokker — enumet er visningslag, ikke lagringstabell.
17. **Group.level A1–A5:** [DITT VALG] behold, men omdøp til G1–G5 så «A» kun betyr
    spillerkategori.
18. **GFGK-programnavn:** [DITT VALG] utvid `PlayerProgram` til å matche AK-stigen
    (GFGK_MINI/BASIS/UTVIKLING/ELITE), behold BREDDE/JENTER som organisasjonsformer ved siden
    av — sjekk radantall i produksjon før du bestemmer om de faktisk brukes.
19. **To pyramidefordelings-tabeller (alders- vs. kategoribasert):** [DITT VALG] begge
    beholdes — foreslått regel: gruppens alderstabell vinner for gruppeøkter, individets
    kategoritabell for egentrening.
20. **Turnering ikke integrert i Workbench:** [KODE-ENDRING, alt vedtatt 04.08] gjennomfør
    integrasjonen — se kapittel 3 punkt 7 og kapittel 6.
21. **Testantall 31 vs. 20/21/36:** [DITT VALG] 31 er fasit; legg til `opphav`-felt
    (IUP/TEAM_NORWAY/AK_EGEN) så begge systemer er synlige uten å tvinges sammen.
22. **TestResult → TalentHQ-sync:** [KODE-ENDRING, alt vedtatt 04.08] bygg synken, blokkert av
    punkt 21.
23. **`ExerciseDefinition.lPhase`:** [KODE-ENDRING] avklar ved inspeksjon om feltet er periode
    eller læringsfase, omdøp deretter.
24. **Drill-navn i ak-second-brain:** [DOKUMENT-RETTING] — se kapittel 3 punkt 3.
25. **895 drill-kandidater:** [DITT VALG] strukturert inntak ETTER at 1, 6, 23 er avgjort.
26. **Kurs-modell finnes ikke:** [DITT VALG] bygg enkel `Kurs`→`KursOkt`→`KursPamelding`-modell
    — men bekreft først at kurs faktisk skal planlegges i plattformen i 2026.

## 5.2 [SLETTET/UTDATERT av opplåsingen] — forslagene under handlet om regelverk som ikke finnes

- Punkt 4 (bygg bro for Belastning M0–M5 → 4 nye verdier) — broen skulle mate invariantene;
  uten invarianter er det fortsatt en display-oversettelse som *kan* være nyttig for UI-visning,
  men ikke lenger for regelhåndheving. Vurder om den fortsatt er ønsket rent visningsmessig.
- Punkt 6 (CS-skalaen, formalisering «invariant 2 og 5 omformuleres») — invariant 2 og 5
  finnes ikke lenger. CS forblir uavklart og ubrukt i nytt, som allerede bekreftet 18.08 —
  ingen kodeendring gjenstår her.
- Punkt 9 (slå sammen `LPhase`/`PeriodeType` til ett konsolidert enum med
  `PERIODE_CONSTRAINTS`-utvidelse for TESTUKE/SAMLING) — selve begrunnelsen for
  konsolideringen var constraint-systemet. Enum-sammenslåingen kan fortsatt være en god idé
  for ren datahygiene (se kapittel 3 punkt 6), men «TESTUKE arver EVALUERING-raden»-delen av
  forslaget bortfaller siden det ikke finnes rader å arve fra lenger.
- Punkt 10 (CANON/IUP/GFGK som pedagogiske kalendere «oppå» `PERIODE_CONSTRAINTS`) — selve
  strukturidéen (tre kalendere for ulike målgrupper) består, men koblingen til
  constraint-validering bortfaller.
- Punkt 14 (invariant-antall, 7 aktive + 2 suspenderte + agentregler i eget dokument) —
  hele invariant-lista er slettet, ikke suspendert. Forslaget er overtatt av selve
  opplåsingsbeslutningen.
- Punkt 15 (TEK-minimum periodeavhengig som fasit for CLAUDE.md) — se kapittel 3.2.

---

# 6. Workbench/kalender-konsolidering — fortsatt relevant, men lag 1 må skrives om

Original: `docs/forslag-workbench-kalender-optimal-2026-08-18.md`. **Kjernediagnosen og
konsolideringsforslaget (12 kalenderimplementasjoner → én motor, tre komponenter) er ikke
berørt av opplåsingen** — det er en ren kodearkitektur-observasjon. **Én justering nødvendig:**
forslagets «LAG 1 Data/regler» i arkitekturskissen (§2.1) listet opp
`PERIODE_CONSTRAINTS · invarianter · PlanAction · blokk-typer · ghost` — de to første
finnes ikke lenger. Lag 1 blir dermed `PlanAction · blokk-typer · ghost`, uten regelvalidering.
Tilsvarende bortfaller «ÅrsTidslinje validerer mot PERIODE_CONSTRAINTS» (§2.2, §2.6, §2.7
etappe 5) som mål — årsplanen kan fortsatt vise perioder og markører, men ikke lenger flagge
regelbrudd, siden ingen regler finnes å bryte.

**Resten av forslaget står som skrevet:**
- Kjernediagnose: designsystemet har allerede løst dette (én motor, elleve komponenter,
  moduser); produksjonskoden har 12 uavhengige implementasjoner fordi hver flate ble bygget
  separat.
- Alvorligste avvik: coach-workbenchen (`coach-workbench.tsx`) porter en fasit som ble
  avviklet 03.07.2026 — mangler Innboks, Caddie, PlanAction-diff, ghost-blokker, stall-moduser,
  feil raster (07–21 mot fasitens 05–23).
- Foreslått rekkefølge (7 etapper, uendret av opplåsingen): motor ut av WorkbenchV2 → coach-WB
  bygges ny på motoren → turnering inn i Workbench → testbatteri-ark → årsplan+tidslinje →
  kalender som leseflate → booking/availability over på samme motor.

**Verdt å sjekke fra egen 18.–19.08-økt:** er navnekanon/raster/L-fase-rettingene fra PR #561
allerede riktige i `coach-workbench.tsx`, eller må samme rydding gjøres der når porten når dit?

---

# 7. Samlet sjekkliste — alt som venter på JA/NEI fra deg

Deduplisert på tvers av alle seks dokumenter, sortert etter innsats. Kryss av i Typora.

## Kan lukkes raskt (dokumentretting, ingen kode)

1. [ ] Masterbrains `canon-methodology.json`: rett kategoriretning til A=elite
2. [ ] ak-second-brain, tre filer: «v3» → «v2» (`ak-formelen.md`, `ak-golf-canon.md`,
      `iup-kategorisystem.md`)
3. [ ] ak-second-brain, tre MORAD-filer: fjern de 9 drill-navnene banken ikke lenger har
4. [ ] Kunnskapsfiler: oppdater testantall til 31 (med opphavsforklaring 15+5+11)
5. [ ] Global CLAUDE.md §Faglig grunnlag: «A–K (11 nivåer)» → «A–L (12 nivåer)»
6. [ ] Global CLAUDE.md §Faglig grunnlag: merk «TEK min 15 %»-linjen utgått (hele
      invariant-rammeverket den stammer fra er slettet) — se kapittel 3.2
7. [ ] Bekreft ordbok-attribusjon «Mac O'Grady» (ditt eget materiale, 2011–2016)

## Trenger et faktisk valg fra deg

8. [ ] Målestokk for kategori — snittscore / handicap / begge med omregningstabell?
9. [ ] Periodisering — konsolider `LPhase`/`PeriodeType` til ett enum nå som
      constraint-systemet (eneste bruker av `PeriodeType`) er borte?
10. [ ] Områder — utvid `SkillArea` til 16-listen, eller eget `omrade`-felt ved siden av
       (forslag i kapittel 5.1 punkt 1)?
11. [ ] RANDOM vs. VARIABEL — slå sammen `PracticeType`/`DrillPracticeType` til én, med
       VARIABEL som navn?
12. [ ] To session-status-enums — konsolider til `SessionStatusV2`?
13. [ ] Group.level A1–A5 — omdøp til G1–G5 for å unngå kollisjon med spillerkategori A?
14. [ ] GFGK-programnavn — utvid `PlayerProgram` til AK-stigens navn, behold BREDDE/JENTER?
15. [ ] To pyramidefordelings-tabeller (alders- vs. kategoribasert) — begge består, med
       regelen «gruppens tabell vinner for gruppeøkter, individets for egentrening»?
16. [ ] Blokk-typer — innfør fasitens 9 som formelt enum/visningslag?
17. [ ] 895 drill-kandidater — gå gjennom nå eller vent til punktene over er avklart?
18. [ ] Kurs-modell — bekreft om kurs faktisk skal planlegges i plattformen i 2026 før noe bygges
19. [ ] `ExerciseDefinition.lPhase` — periode eller læringsfase? (avklares ved kodeinspeksjon,
       ikke bare beslutning)
20. [ ] `workbench-turnering.html` sine egne demo-navn (Max Risvåg, Sondre U. Thøgersen) —
       bevisst, eller bør Øyvind Rohjan vises der også?

## Vedtatt, men ikke bygget (egen PR per punkt, ingen ny beslutning)

21. [ ] Press-navn i `ak-formel-visning.ts`: FRI/KRAV/UTFORDRING/KONKURRANSE →
       ALENE/OBSERVERT/KONKURRANSE/TURNERING (05.08-vedtaket)
22. [ ] Turneringsplanlegging inn i `WorkbenchV2` som fane (04.08-vedtaket)
23. [ ] TestResult → TalentHQ-sync (04.08-vedtaket, blokkert av punkt 21 over — testvisning)
24. [ ] Motorikk-stavemåte: `LAV_HASTIGHET` → `LAV_HAST` i `ak-formel-visning.ts`

## Verifiseringsoppgaver (ikke beslutning — bare sjekk)

25. [ ] `AgencyosWorkbench.dc.html:68` — finnes Avvis/Hvorfor-knappene utenfor grep-vinduet?
26. [ ] `⚠`/`✓`-dingbats → Lucide-ikoner (`AlertTriangle`/`Check`), fire steder
27. [ ] Er PR #561-rettingene (navnekanon/raster/L-fase) allerede riktige i
       `coach-workbench.tsx`, eller trengs samme rydding der når porten når dit?
28. [ ] `--p-*`-prefiks på workbench-HTML-ene — reelt krav eller ikke? (Konflikt B, uavklart
       kildehenvisning)

## Stor strukturell jobb (egen prosess, ikke ett avkrysningspunkt)

29. [ ] Workbench/kalender-konsolidering — 7-etappers plan i kapittel 6. Etappe 1–2
       (motor ut av WorkbenchV2, coach-WB bygges ny) er fundamentet.

---

*Ingen kode eller kunnskapsfil er endret som del av denne sammenslåingen — kun lesing og
organisering av de seks originaldokumentene. Marker punktene i Typora, så tas oppryddingen
i rekkefølgen du prioriterer.*
