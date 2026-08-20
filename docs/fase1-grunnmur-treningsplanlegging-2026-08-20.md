# Fase 1 — grunnmur i kode for treningsplanlegging

**Levert 20.08.2026.** Utfører fase 1 i
`docs/plan-treningsplanlegging-til-kode-2026-08-20.md`. Ingen synlig UI-endring:
alt her er datamodell og domenelogikk som skjermene i fase 2–3 bygger på.

**Kilder:** `docs/spec-treningsplanlegging-2026-08-19.md` ·
`docs/relevans-matrise-treningsplanlegging-2026-08-20-v2.md` (fasit for
relevans) · `docs/FASIT-AK-GOLF-HQ.md` (19 områder) ·
`docs/gap-evaluering-treningsplanlegging-2026-08-20.md` §2 (AI-kravene) ·
`docs/analyse-treningsplanlegger-2026-08-20.md`.

---

## To beslutninger Anders tok før arbeidet startet

1. **Punkt 1.1 er delt ut.** «Fjern dobbeltskrivingen til de andre
   øktfamiliene» treffer 88 filer (62 leser `TrainingPlanSession`, 26 skriver
   til den) og kan umulig gjøres uten synlig UI-endring. Denne økta gjør i
   stedet V2-familien kanonisk for alt nytt: **alle v2-akser ligger KUN på
   `TrainingDrillV2`/`TrainingSessionV2`**, aldri på de gamle. Selve fjerningen
   av den gamle familien er en egen, planlagt jobb.
2. **Modellvalgene** (motorikk kun fullsving, mapping fra v1-vokabularet,
   hovedcoach) er godkjent som foreslått — se hver seksjon under.

## Databasen var praktisk talt tom

Målt før migrering: 17 v2-økter, 27 driller, **0** drill-logger, **0** tekniske
planer, **0** fasiliteter. Backfillen fra v1-vokabularet traff derfor 5 rader
totalt. Det som kunne blitt en tung datamigrering var et ikke-problem — men
nettopp derfor er det avgjørende at v2-vokabularet står i basen **før**
loggevolumet kommer.

---

## Det som er bygget

### Vokabularet — `src/lib/domain/ak-formel-v2.ts`

Kanonisk AK-formel v2: `PYRAMIDE_OMRAADE_MOTORIKK_BELASTNING_PRESS`.

- **19 treningsområder** etter fasiten rettet 20.08 (seks puttebånd, tre
  FYS-områder). Merk at `src/lib/taxonomy.ts` fortsatt bærer den eldre listen
  (INNSPILL_0_50, sju puttebånd, MOBILITET) — den driver eksisterende UI og er
  bevisst ikke rørt. `fraGammelOmraadekode()` er broen mellom dem.
- **Belastning er en helt ny akse** — den fantes ikke i v1 i noen form.
- Broer fra v1: L-fase → motorikk, M0–M5 → belastning, PR1–PR5 → press.
  CS-nivåene har ingen arvtaker og blir stående som historisk lesefelt.
- Formelstrengen hopper over akser som ikke gjelder området: en putt-drill blir
  `TEK_PUTT_5_10_TRENINGSOMRAADE_ALENE`, aldri med et tomt motorikk-ledd.

### Relevans-matrisen — `src/lib/domain/omrade-relevans.ts`

Hvilke felter et område i det hele tatt har. Et visningsfilter, aldri en regel.

- Motorikk gjelder **kun de fem fullsving-områdene**. Nærspill, bunker, putt,
  FYS og bane har feltet skjult — det lagres aldri.
- **Én** teknikk-dimensjon per drill (analysens sjette akse), med lovlig liste
  per område. Rekkefølgen bærer vektingen fra matrisen: korte putter starter på
  ballstart, lange på lengdekontroll.
- Bunker har sand-trappen som eget felt, atskilt fra motorikk.
- FYS skjuler belastning og press i UI, men lagrer dem som default
  (`INNENDORS`/`ALENE`) slik at FYS kan summeres på samme akser som resten.
- `vaskMotRelevans()` fjerner verdier som ikke hører til området — en putt-drill
  kan ikke overleve med motorikk fra da den var en chip-drill.

### Målmatrisen — `src/lib/domain/teknisk-maalmatrise.ts` + `PositionTaskMaal`

Motorikk × belastning per teknisk arbeidsoppgave, 12 celler. Ny tabell, én rad
per celle.

- Tellingen er **rekalkulering, ikke inkrementering**: loggene er alltid fasit,
  `gjortReps` er en avledet cache. En teller som drifter fra loggene er en
  stille tillitsdreper (risiko 5 i analysen).
- Overskudd i én celle dekker aldri over en celle som mangler.
- Hovedcoach varsles **én gang** når alle rep-mål er nådd
  (`repsMaalNaaddVarsletAt`), ikke ved hver logging etterpå.
- Prioritetsfargen: clay/blekk/dempet/grønn, aldri rød. I konkurranseblokk vises
  maks to i clay og resten dempes — veiledning, aldri sperre.

### Gruppesynk — `src/lib/domain/gruppesynk.ts`

Løsrivelses-regelen som kode. Hver handling er plassert eksplisitt i én av tre
klasser, så ingen ny funksjon kan bryte lenken ved et uhell.

- Oppmøte og gjennomføring løsriver aldri; planendring løsriver permanent.
- Opphavsstempelet (`sourceGroupId`) slettes aldri — kalenderen kan alltid si
  hvilken gruppe økta kom fra, også etter løsrivelse.
- Coach-endring når kun lenkede, uberørte økter. Fullført økt er frossen historikk.
- Ved gruppe-exit slettes kun fremtidige lenkede kopier. Innmelding synker kun
  fremover.

### Øktstatus og etterlevelse — `src/lib/domain/okt-status.ts`

- Avlyst med årsak (`SYK/SKADE/REISE/VAER/ANNET`) vises, men telles aldri som
  avvik. En sykeuke gir `andel: null`, ikke «0 % gjennomført».
- Hoppet over **uten** årsak er derimot et ekte avvik — det er nettopp den
  forskjellen analysen skal kunne se.
- Selvvurderingen FOKUS/GJENNOMFØRING/MESTRING: tomt lagres som tomt, aldri som
  3, og snittet følges alltid av svarandelen.

---

## De kritiske AI-radene — hvor de nå ligger

Gap-evalueringen §2 lister åtte ting v1-skjemaet MÅ ha fordi v2 aldri kan
rekonstruere dem. Status etter denne økta:

| Krav | Hvor |
|---|---|
| (a) TrackMan-nøkkel per innslag | `TrainingDrillV2.trackManSessionId` + `trackManShotIds` + `trackManMaales` |
| (b) Full v2-formel typet per drill | `omraadeKode` · `motorikk` · `belastning` · `press` · `dimensjon` · `sandTrinn` |
| (c) Fasilitets-dimensjoner | `PlayerFacility.type` · `rangeLengdeM` · `maksPuttLengdeM` · `radarMerke` |
| (d) Trening/konkurranse på runder | `Round.roundType` fantes fra før — **fri tekst, ikke typet** (se under) |
| (e) Hoppet over + spontan | `TrainingDrillV2.hoppetOver` · `erSpontan` |
| (f) Målmatrisene strukturert | `PositionTaskMaal` (taskId × motorikk × belastning) |
| (g) Fysiske tester typet | **Ikke gjort** — se under |
| (h) Tidsstempler | `detachedAt`, `repsMaalNaaddVarsletAt`, eksisterende `createdAt`/`loggedAt` |

I tillegg: treningstid-estimatet fra onboarding (`User.treningTimerPerUke` +
`treningOkterPerUke`) som AI-kravet «plan-generering» avhenger av.

## Det som bevisst IKKE er gjort

1. **Fjerning av dobbeltskrivingen** (punkt 1.1) — delt ut, se øverst.
2. **`Round.roundType` er ikke typet.** Feltet finnes og bærer
   `'turnering'|'trening'`, men som fri tekst. Å gjøre det til en enum krever
   endring i alle skrivere, og faller inn under samme opprydding som 1.1.
   Dataene finnes, så AI-kravet er dekket — men typingen gjenstår.
3. **Fysiske tester som typede felter** (AI-krav g). Testmodellen
   (`TestDefinition`/`TestResult`) er ikke rørt — den henger sammen med
   FYS-programmet og FYS-øvelsesbanken, som fortsatt er under arbeid i fase 0
   (`docs/fys-ovelsesbank-2026-08-20.md`). Bør tas som én sammenhengende jobb.
4. **Loggeenhet for KONDISJON** er kodet som `MINUTTER` i `repsEnhet`, men
   relevans-matrisen v2 merker dette som uavklart. Endres uten datamigrering
   siden ingenting er logget ennå.
5. **`src/lib/taxonomy.ts` er ikke oppdatert til fasiten.** Fasiten sier den
   skal det; det er et bredere inngrep i eksisterende UI og hører hjemme i
   samme opprydding som 1.1.

## Migrering

`scripts/fase1-treningsplanlegging-2026-08-20.ts` — kirurgisk DDL mot
`DIRECT_URL`, idempotent. `prisma migrate dev`/`db push`/`migrate deploy` er
alle blokkert i dette prosjektet (gotchas §Schema-endringer).

Kjørt 20.08.2026: 9 nye enums, 35 nye kolonner, 1 ny tabell, verifisert mot
`information_schema`. Backfill: 4 belastning + 1 press fra v1-verdier.

## Tester

37 nye enhetstester i fem filer (`ak-formel-v2` · `omrade-relevans` ·
`teknisk-maalmatrise` · `gruppesynk` · `okt-status`). `npm run verify` og
`npm test` (1526 tester) grønt.
