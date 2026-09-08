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

## Gyldighetssjekk før måling

Fire av sju mislykkede målinger (01.–02.09.2026) skyldtes tegningen, ikke koden.
Derfor: sjekk at fasiten er dagens kanon FØR du måler. Hver rad har `fasitDato`
(git-dato for fasitfila; 25.08.2026 er bulk-importdatoen fra PR #581, så en fil med
den datoen kan være tegnet 23.–24.08 — datoen betyr «ikke nyere enn»). Datoen alene
avgjør ikke; se på innholdet med kommandoen i tabellen.

| Gjelder | Regel | Sjekk | Kilde |
|---|---|---|---|
| Rail/tabbar i en AgencyOS-fasit | Tegnet før 25.08.2026 = utdatert. AX-01 har fem destinasjoner: Stall · Workbench · Kø · Jarvis · Meg | `grep -L "Jarvis" "designsystem/train-lock/<fil>"` skriver filnavnet hvis railen mangler Jarvis (69 av AgencyOS-filene gjør det per 05.09) | `.claude/rules/beslutninger.md` §A1, overstyrt 25.08 |
| Pris/tier (ME-03, oppgrader, abonnement) | Tegnet før 16.08.2026 = utdatert. Kun TALENT (gratis) og FULL (299 kr/mnd, 2 690 kr/år). «Elite» og «PRO» finnes ikke | `grep -c "Elite\|PRO" "designsystem/train-lock/<fil>"` skal gi 0 | `docs/platform/BUSINESS-RULES.md` §Abonnement |
| Stall-rad (AG-04 og alt som lister spillere) | Tegnet før 30.08.2026 (beslutning 6.5) = utdatert: raden er navn · neste økt · siste aktivitet · én prikk — ikke HCP/SG | `grep -c "HCP\|SG" "designsystem/train-lock/<fil>"` > 0 i en spillerliste = utdatert | `.claude/rules/beslutninger.md` §GRILLINGEN RUNDE 6 pkt 5 |

Treffer en regel: raden får `status: "ukalibrert"` og `aarsak: "fasit-utdatert"`. Mål
gjerne likevel — tallet er dokumentasjon, ikke signal — og bestill omtegning. Tilpass
aldri koden til en utdatert tegning.

**Ingen rad får `status: "kalibrert"` uten eksplisitt avviksliste i filhodet til
komponenten raden måler:** ` * Avvik: …`-linjer rett under ` * Fasit: …` i
komponentens JSDoc-hode, én linje per kjent avvik. Prosenttallet sier ikke HVA som
avviker; lista gjør. Mangler lista, står raden som ukalibrert til den er skrevet.
Eksempel: `src/components/admin/v2/agenticos/AdminAgenticosKo.tsx` (økt 4).

## Panel-modus — innebygde paneler (AO-03, AO-08 m.fl.)

Noen fasitrammer er tegnet som paneler (AO-03: 760×640, AO-08: 620 px bred) ment å
stå inni en større canvas, ikke som hel skjerm. Satt som viewport trigger de appens
mobil-brekkpunkt (bredde < 700). Raden setter derfor `viewport` (appens ekte visning)
og `selector` (elementet som tilsvarer rammen); riggen rendrer appen i den
viewporten og klipper et utsnitt fra elementets øvre venstre hjørne med
fasitrammens bredde og høyde:

```bash
node scripts/train-lock-pixel-diff.mjs "AO-03 Ko 1440" "/admin/ko?fane=agentko" dark 0 \
  --viewport=1440x900 --selector='[data-screen-label="AO-03 Ko"]'
```

`cropTop` er alltid 0 i panel-modus (ingen bakt statuslinje). Er appens element
bredere enn fasitrammen (AO-03: 1144 px i V2Shell ved 1440 mot 760 i fasiten), faller
høyre del utenfor utsnittet — det er et avvik som skal stå i notatet og avvikslista,
ikke en feil i riggen. Finnes ikke selectoren (appen viser f.eks. tom tilstand med
en annen `data-screen-label`), stopper riggen og sier det: seed først.

## Kjøre en kalibrert skjerm

```bash
npx tsx scripts/seed-ph01-signoff-fixture.ts      # én gang, idempotent
node scripts/train-lock-pixel-diff.mjs "PH-01 I dag" "/portal" dark 54
SHOT_BRUKER=coachtest@akgolf.test node scripts/train-lock-pixel-diff.mjs "AO-03 Ko 1440" "/admin/ko?fane=agentko" dark 0 --viewport=1440x900 --selector='[data-screen-label="AO-03 Ko"]'   # panel-modus, AgencyOS
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
brukere kan aldri sette sin egen dato. Koblet inn i `src/app/portal/page.tsx`
(PH-01) og, via `getDashboardData()`s `naa`-parameter (fase 1, økt 3),
`src/app/portal/planlegge/page.tsx` (PH-07) — koble inn per skjerm etter
behov, ikke forhåndsinnfør på skjermer som ikke trenger det. Kjent, IKKE
koblet unntak: `/portal/analysere/actions.ts` har sine egne tre `new Date()`
og påvirker TM-04a-radens restavvik (se raden i `skjerm-mapping.ts`).

`train-lock-pixel-diff.mjs` sin `TEST_NAA`-konstant kan overstyres med
miljøvariabelen `SHOT_DATO=<ISO-datotid>` for en rad med et `testDato` ulikt
standarden 22.08.2026 (`tests/visual/skjerm-mapping.ts`, fase 1 økt 3) — de
fleste rader trenger den aldri (mønster: `SHOT_BRUKER`/`SHOT_BASE`).

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

## ME-03 Abonnement (Ø3, 02.09.2026) — tiende skjerm, ukalibrert

Samme klasse funn som P-05/AO-01: fasiten («AK Academy · Elite», egen
kr/måned-pris på pakken) er fra FØR 16.08.2026-omleggingen av
abonnementsmodellen — «Elite» er et dødt enum CLAUDE.md forbyr i UI. Målt
pixel-diff (9,93 %) er misvisende lav og skal ikke tolkes som nært; se notat
i `skjerm-mapping.ts`. Ingen ny fasit-tegning bestilt ennå.

`/oppgrader/flyt` (selve kjøpsflyten) mangler egen fasit-ramme og kunne ikke
skjermbildes for `screentest` (allerede PRO+pakke → redirectes bort) uten
TALENT-tier-sonden — den krever Anders' ja (se MASTERPLAN Ø1) og ble derfor
ikke forsøkt. Kodegjennomgang av `oppgrader-flyt-wizard.tsx` fant og rettet
én reell feil uavhengig av fasit-spørsmålet: funksjons-chippene hadde
identisk tekst- og bakgrunnsfarge (`color: TL.fill` på `background: TL.fill`)
— usynlig tekst i enhver rendering, uavhengig av brukertilstand.

## AO-03 / AO-08 — panel-modus, målt 08.09.2026 (fase 1, økt 4)

Første måling av innebygde fasitpaneler, mot prod som `coachtest@akgolf.test`:

- **AO-03 Ko 1440** — 4,76 % (23 140/486 400 px, ramme 760×640)
- **AO-08 Godkjenn 1440** — 6,65 % (24 377/366 300 px, ramme 660×555)

Begge står som `ukalibrert` / `kjent-layoutavvik`: appens panel er bredere enn
fasitrammen og har annen seksjons-/datasammensetning, så tallet er dokumentasjon,
ikke et signal. Kommandoer, bilder og begrunnelse:
[`docs/design-audit/2026-09-08/rigg-panelmodus-ao/`](../../docs/design-audit/2026-09-08/rigg-panelmodus-ao/README.md).
