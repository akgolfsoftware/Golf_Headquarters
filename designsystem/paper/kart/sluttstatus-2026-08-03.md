# Sluttstatus 03.08.2026 (dag) — kompilering, verifikatørrunde, rigg og fikser

**Dekning: 27/223 skjermer · 137/151 komponenter.** Denne økten bygget ingenting nytt —
den kompilerte, verifiserte og rettet natten P4–P9-leveranse. Detaljert funnlogg:
`kart/verifikatorrapport-2026-08-03.md` (funnene der er nå LUKKET — se under).

## Sluttilstand, alt målt med rendret side og fersk bundel

1. **`_ds_bundle.js` kompilert** (×4 i økten, siste etter alle fikser): 145 komponenter ·
   101 kort · 132 tokens · 8 templates · 0 kritiske feil. Klasseinventar: **1148 navn, 0
   ulagrede** — `guidelines/klasseinventar.md` regenerert, sidelisten slettet.
2. **Alle 51 nye spesimenkort er HELGRØNNE** (312+ assertions sett kjøre). Sett-feile-kravet
   oppfylt i alle seks familiegrupper (naturlige røde + tvungne regresjoner på LiveStatus
   og PositionMarker som ble grønne igjen).
3. **Viewport strammet til målt + 10 %** i alle 51 kort (22 var deklarert for lave og klippet
   innhold). Frasen «Høyde målt 03.08 (+10 %)» står i linje 1.
4. **`guidelines/terskelrigg.html`: 122/122 grønne, dekning ok på 53 komponenter.**
   `?selvtest` og `?selvtest=dekning` gir begge rødt som de skal. Toleranse 0,05 px
   (begrunnet i fila). Komponenter uten container-terskel er dokumentert i riggen.
5. **readme.md**: «Kompilatet er i synk»-notat + seks nye familielinjer + P9-strøfiler +
   generert komponentindeks (alle 145 navn).

## Feil FUNNET OG RETTET i økten (forfatter-agenten i Claude Design, verifisert av meg)

| Feil | Type | Retting |
|---|---|---|
| DayStrip + VisningsVelger: død berøringsgulv-kode (manglende className, gulv-variabel på forelder) | kilde | className + `max(var(--x,fallback),var(--floor))` på elementet |
| MaanedKalender: dagcelle 31 px ved grov peker | kilde | samme gulv-mønster på dagcellen |
| LaunchWindowKort: `--vind` deklarert men aldri lest — terskelen fyrte aldri | kilde | `display:var(--vind)` på `.akhq-lwin-v` |
| AKFormelChip: container-terskel på inline chip (kollapser til 0 px) | design/kilde | terskelen FJERNET med begrunnelse i kilden: en chip som krymper rundt egen tekst har ingenting å respondere på; forelderen setter modifikator |
| **Backticks i CSS-kommentarer terminerte template-literaler** — ville kuttet `@layer akhq-modifier` for hele systemet ved neste kompilering | kilde (alvorlig) | fjernet + regel skrevet inn i kommentaren; hele components/ sveipet |
| Scorekort: testdata manglet ekte eagle; sum-assertion fulgte ikke med | kortdata | SLAG-endring som løser begge; fortegnsregel demonstrert |
| DiagnoseKort-kortet: `=== "52ch"` kan aldri bli sann (computed resolverer til px) | kort-assertion | måler nå mot probe med samme font |
| KolleStatKort-kortet: `=== "1px"` traff aldri (0,5556 px skalert hårlinje) | kort-assertion | `parseFloat(...) > 0` |
| Heatmap-kortet: forventet 2 maks-celler, dataene har 4 | kort-assertion | rettet til 4 med begrunnelse |
| Terskelrigg første utkast: 26 falske røde (feil subjekt/toleranse 0,5 px) | rigg | SPEC-saker korrigert mot kilden, toleranse 0,05 px, manglende subjekt = RIGGFEIL-kategori |

## Miljølærdom for fremtidige verifikatører

- **rAF fryses i skjulte faner/dokumenter** — kortenes assertions kjører aldri i bakgrunn.
  Runneren (`guidelines/verifikator-runner-2026-08-03.html`) stubber rAF med setTimeout før
  lasting. Forfatter-agentens forslag står notert i tråden: flytt kortenes selvtest til en
  setTimeout-only-variant i en egen runde hvis kortene skal være maskinlesbare headless.
- Nettleser-cache kan servere gammel bundel — mål alltid etter fersk hent (cache: no-store).

## Venter på Anders

1. **P7 craft-godkjenning** for alle 51 kort (alt teknisk er nå grønt og målt; craft/squint er eierens).
2. **LFaseBadge**: bygget på ordre, konflikt med Bølge 1-fjerningen flagget — brukes den på flater?
3. **K2 kort-chrome**: golfdata chromeless (Panel eier flaten) — står til annet sies.
4. **AK-formel v1-eksempler** i eldre kort — migreres til v2?
5. **DispersionMap-utvidelsen mangler spesimen** (baseline/hit-rate finnes i jsx, ikke i noe kort) — liten forfatterjobb.
6. **readme.md har to eldre tekstkorrupsjoner** (flagget i verifikatorrapporten) — eier bør se.

## Neste løp: artefakt-malene (~196 ruter)

Bevisst IKKE startet i denne økten: beslutningene 2–4 over avgjør hvordan flatene skal
komponeres (badge-bruk, kort-chrome, formelvisning), så å komponere før de faller er å
bygge på uavklart grunn. Biblioteket er nå komplett, kompilert og verifisert — alt malene
trenger. Suksesskriteriet står: komponer uten å finne på nye komponenter.
