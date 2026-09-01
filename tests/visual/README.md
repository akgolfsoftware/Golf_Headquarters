# Train-lock sign-off-rigg

Løser PORTING.md §5 sitt savn: en maskinell pixel-nærhets-sjekk mellom en
Train-lock-fasit (`.dc.html`) og den faktisk bygde skjermen — ikke bare
øyemål på et rått galleri-skjermbilde (`scripts/signoff-trainlock.mjs`, som
fortsatt er nyttig for RASK visuell oversikt, men ikke måler noe).

## Hvorfor ikke Playwright `toHaveScreenshot()` (som `tests/e2e/paper-visual/`)?

To grunner:
1. **Asymmetrisk beskjæring.** Fasit-rammene for telefon baker inn en falsk
   iOS-statuslinje (dynamic island, klokke, batteri) øverst i selve
   `data-screen-label`-elementet — appen har ingen tilsvarende, siden ekte
   enhets-statuslinje ligger UTENFOR siden. Skal de to sammenlignes presist,
   må fasitens topp kuttes og appens BUNN kuttes tilsvarende (se
   `train-lock-pixel-diff.mjs`) — `toHaveScreenshot()` sammenligner hele
   elementet, ikke et beskåret utsnitt av to ulike kilder.
2. **Fasiten rendres på nytt hver kjøring**, ikke lagres som delt
   snapshot-fil. `paper-visual/README.md` dokumenterer at delte
   snapshot-PNG-er ikke er bærbare mellom maskiner (font-rendering varierer) —
   derfor er de gitignorerte og lokale. Å rendre `.dc.html`-fasiten FERSK i
   samme kjøring (samme Chromium, samme maskin, samme øyeblikk) unngår
   akkurat det problemet uten å måtte lagre og committe bilder.

## Kjøre en kalibrert skjerm

```bash
npx tsx scripts/seed-ph01-signoff-fixture.ts      # én gang, idempotent
node scripts/train-lock-pixel-diff.mjs "PH-01 I dag" "/portal" dark 54
```

Bildene havner i `tests/visual/ut/` (gitignorert — arbeidsfiler, ikke fasit).
Terskelen er IKKE en hard pass/fail-grense ennå (se under) — les
prosenttallet og se på diff-bildet selv.

## Realistisk terskel — IKKE 0,1 %

Opprinnelig plan antok en streng 0,1 %-terskel (PORTING.md §5s tekst). Det
holder ikke i praksis, av samme grunn som `paper-visual` selv satte sin
terskel til 4 % («fonter/anti-aliasing varierer selv når layout er
identisk»): PH-01 er i tillegg en DATAAVHENGIG skjerm — SG-verdi, antall
økter denne uken og «neste økt»-kortet er avledet fra annen historikk enn
selve seed-fixturen, og vil aldri bli pikselidentisk uten mye dypere seeding
(hele ukens økt-historikk + TrackMan/SG-grunnlag). Kalibrert restavvik for
PH-01 etter riktig beskjæring og korrekt fixture: **~11 %** — ned fra 15,8 %
(feil datatilstand) og enda høyere (feil databasetabell, se under).

Bruk dette tallet som PH-01s egen baseline. Stiger det vesentlig over 11 %
ved neste kjøring uten at noen bevisst har endret fixture-dataen, er det et
reelt signal — men jag ALDRI mot 0 % uten å seede alt PH-01 faktisk viser.

## To reelle feller denne riggen allerede har avslørt

1. **Feil tabell.** `/portal` («I dag») leser `WorkbenchSession`
   (`loadPlayerDay()` i `wb-actions.ts`), IKKE `TrainingSessionV2` — økt-data
   er fragmentert over flere tabeller (kjent fra
   `docs/arkitektur-kartlegging-2026-08-30.md`). Første seed-forsøk denne
   økten traff feil tabell og ga et resultat som så riktig ut i loggen, men
   aldri viste seg i appen.
2. **Status styrer HELE kort-varianten, ikke bare et tall.**
   `status: "IN_PROGRESS"` gir LIVE-kortet (Fortsett/Avslutt,
   nedtellingsprogresjon) — `status: "PUBLISHED"` med økten i tidsvinduet gir
   NÅ-kortet (Start økt), som er det PH-01-fasiten faktisk tegner. Feil status
   ga en strukturelt annen komponent, ikke bare andre tall.

## Test-dato-overstyring

Appen viser alltid ekte `Date.now()` server-side — en fasit tegnet for en
fastdatert eksempeldag («22. august») kan aldri matches uten å fryse «i dag»
for testkjøringen. Løst i `src/lib/testing/dato-override.ts`: header
`x-screentest-naa` overstyrer KUN for `screentest@akgolf.test`-kontoen — ekte
brukere kan aldri sette sin egen dato. Foreløpig koblet inn kun i
`src/app/portal/page.tsx` (PH-01) — koble inn per skjerm etter behov, ikke
forhåndsinnfør på skjermer som ikke trenger det.

## Status etter 8-skjermers kalibreringsrunde (01.09.2026 kveld)

Alle ni skjermer i `skjerm-mapping.ts` er nå undersøkt. Fem er kalibrert
(PH-01, TE-01, TM-04a, TM-01a — 5,6–14,4 % restavvik, alle med kjent,
dokumentert årsak). **Fire kunne IKKE kalibreres — ikke fordi riggen mangler
noe, men fordi det de skulle måles mot ikke var klart til å måles mot:**

- **P-05 og AO-01: fasiten selv er utdatert.** P-05 bruker CS/M-vokabular fra
  før 18.08-opplåsingen og en helt annen IA enn dagens `/portal/planlegge`.
  AO-01 viser en pensjonert AgenticOS-rail — appen har alt AX-01s fem
  destinasjoner (dagens kanon). Pixel-diff mot en fasit ingen lenger bygger
  mot, er ikke et signal — det er støy. Disse må tegnes om FØR de er
  kalibrerbare.
- **RU-04: allerede kjent, dokumentert avvik** (revisjonsrapportens
  statusmatrise, kategori c) — bunn-ark i fasit vs. egen helside i koden.
  Ikke noe nytt denne runden fant.
- **AO-03 og AO-08: metodikkhull i RIGGEN, ikke i appen.** Disse
  fasit-rammene er tegnet som INNEBYGDE PANELER (760×640 / 620px bred, ingen
  full enhets-viewport) ment å vises inni en større canvas — ikke som en hel
  skjerm. Satt direkte som browser-viewport trigger feil breakpoint i appen
  (mobil bunn-nav i stedet for sidebar ved 760px). Riggen må utvides til å
  rendre appen ved sin EKTE viewport og klippe ut det tilsvarende panelet,
  ikke bruke fasit-rammens egen (mindre) deklarerte størrelse direkte.

**SHOT_BRUKER=coachtest@akgolf.test** kobler inn for AgencyOS-skjermer (krever
ADMIN) — default er `screentest@akgolf.test` (PLAYER).

## Neste skjermer

For nye skjermer utover disse ni, oppskriften er:
1. Finn hvilken tabell/loader skjermen faktisk leser (ikke anta — se felle 1
   under, og AO-01/P-05 over: sjekk OGSÅ at fasiten selv er dagens kanon,
   ikke bare at ruta finnes).
2. Skriv et idempotent seed-script i `scripts/` (mønster:
   `seed-ph01-signoff-fixture.ts`) hvis skjermen er dataavhengig.
3. Koble `hentEffektivNaa()` inn i den skjermens `page.tsx` hvis den viser
   dato/tid.
4. Kjør `train-lock-pixel-diff.mjs` med økende `cropTop` til avviket
   flater ut (ikke gjett — søk, som PH-01s kalibrering over).
5. Legg inn i `skjerm-mapping.ts` med `status: "kalibrert"` og målt
   restavvik + notat om hva som gjenstår.
