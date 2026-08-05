# Baneguide i PlayerHQ — komplett produktdokument

> Skrevet 2026-08-02. Forankret i kodebasen slik den faktisk er (verifisert mot `prisma/schema.prisma`,
> `src/lib/gameplan/`, `src/lib/runde-logg/`, `src/lib/domain/sg.ts`, `docs/port/plan-designport-alle-skjermer.md` og
> `docs/plan-baneguide-dispersion.md`). Dokumentet er skrevet slik at designer og utvikler kan starte
> direkte. Ingen kopiering av UpGame/Trackman — kun samme problemklasse, løst selvstendig.

---

## 1. Executive Summary

**Baneguide er ikke et nytt prosjekt fra null.** Fundamentet er allerede i produksjon under navnet
**Gameplan** (`/portal/gameplan`, omdøpt fra «Baneguide» 16. juli 2026):

Allerede bygget og i drift:
- Mapbox-banekart med satellitt (`src/components/gameplan/course-map.tsx`), CSP-whitelistet i `proxy.ts`
- Banegeometri fra OSM/Overpass (`scripts/import-bane-osm.ts`), 9 baner importert, `Bane.geojson` + `CourseHole` med tee/green/pin-koordinater
- GPS-felter på `Shot` (`startX/Y`, `endX/Y`, `targetX/Y`) + kart-tapping av landingspunkt i slag-wizard
- Full dispersion-motor (`src/lib/gameplan/dispersion.ts`): haversine, bearing, kovarians-ellipse, sikteramme, `andelISone`
- Gameplan per hull: sikte (`GameplanHull`) + bra/aldri-soner (`GameplanSone`) med prosent-av-ellipse-beregning
- Komplett SG-motor (`src/lib/domain/sg.ts`) + runde-logg-pipeline med 21 granulære SG-felter på `Round`
- Slag-for-slag live-føring (`/portal/runde/live`) med kladd, tommel-sone og SG-oppsummering

**Gapet** — det dette dokumentet spesifiserer:
1. **Live GPS på banen** — `navigator.geolocation` brukes ingen steder i kodebasen i dag
2. **Kart i runde-føringen** — `/portal/runde/live` er tekstbasert; kartet lever kun i legacy-slag-wizarden
3. **Offline** — runde-kladd i localStorage finnes, men ingen offline-kart og ingen IndexedDB-kø for slag
4. **Dispersion per kølle («Map My Bag»)** — motoren finnes, skjermen finnes ikke
5. **Rikere gameplan** — i dag ett sikte + sirkelsoner + fritekst; mangler kølle-valg og plan B
6. **Coach-flater** — spillerens baneguide/dispersion sett fra AgencyOS finnes ikke

**Anbefaling i én setning:** Behold Mapbox + OSM-fundamentet, bygg live-baneguiden som en kart-modus
inne i eksisterende `RundeLoggKlient`-flyt (ikke en parallell flyt), og lever i tre faser der MVP =
GPS-avstander + kart-slaglogging under runde.

---

## 2. Produktvisjon

**Én flate som følger spilleren gjennom hele konkurranseløpet på banen — FØR, UNDER og ETTER:**

- **FØR runden (Gameplan):** Spilleren åpner banen, ser hvert hull på satellitt, ser sin *faktiske*
  spredningsellipse lagt over hullet, og bestemmer sikte, soner og kølle. Strategien er datadrevet:
  «14 % av dine driver-slag lander i aldri-sonen på hull 3 — sikt lenger venstre eller slå 3-wood.»
- **UNDER runden (Live baneguide):** Telefonen viser hullet, GPS-posisjonen og avstander til green
  front/midt/bak og til sikte. Spilleren logger hvert slag med ett trykk på kartet (eller lar GPS
  foreslå posisjonen). Gameplanen for hullet ligger ett sveip unna — «du planla 3-wood mot venstre kant».
- **ETTER runden (Analyse):** SG beregnes automatisk fra slagskjeden (som i dag), men nå med ekte
  posisjoner: dispersion per kølle vokser for hver runde, gameplan-etterlevelse måles («traff du
  siktet ditt?»), og coach ser det samme i AgencyOS.

Dette lukker sløyfen som gjør PlayerHQ unik: **planen (Workbench) → strategien (Gameplan) →
gjennomføringen (Live) → analysen (SG) → tilbake til planen.** Ingen konkurrent kobler baneguide
til et helhetlig treningssystem med coach i loopen.

Kobling til CANON: Baneguiden operasjonaliserer strategi-biblioteket (DECADE-tenkning, presisjons-
strategi med buffer, 8-sekundersregelen) — men **anbefalinger sperrer aldri** (invariant 1): appen
foreslår, spilleren bestemmer.

---

## 3. Komplett funksjonsliste

### MVP (Fase 1 — «Live på banen»)

| # | Funksjon | Status i dag |
|---|---|---|
| M1 | Banebibliotek med kartstatus per bane | ✅ Finnes (`/portal/gameplan`) |
| M2 | Banekart-oversikt per bane (alle hull) | ✅ Finnes (`/portal/gameplan/[baneId]`) |
| M3 | Hull-detalj med dispersion-ellipse og landingspunkter | ✅ Finnes (`/portal/gameplan/[baneId]/hull/[nr]`) |
| M4 | Gameplan per hull: sikte + bra/aldri-soner + notat | ✅ Finnes (Planlegg-fanen) |
| M5 | **Live GPS-posisjon på hullkartet under runde** | ❌ Ny |
| M6 | **Avstander live: green front/midt/bak + til sikte** | ❌ Ny |
| M7 | **Kart-modus i runde-føringen: logg slag ved trykk på kart** (GPS-posisjon som forhåndsutfylt forslag) | ❌ Ny (kart-tapping finnes kun i legacy-wizard) |
| M8 | **Gameplan-overlay under runde** (sikte + soner synlig på live-kartet) | ❌ Ny |
| M9 | Slag-kø i IndexedDB med synk ved dekning (mønster fra `recording-chunk-queue.ts`) | ❌ Ny |
| M10 | Forhåndslasting av banedata (GeoJSON + hull) før runde | ❌ Ny |
| M11 | SG-oppsummering etter runde (uendret pipeline, nå med GPS på alle slag) | ✅ Finnes |

### Fase 2 — «Forstå spillet ditt»

| # | Funksjon |
|---|---|
| F2.1 | **Dispersion per kølle («Min bag»)** — `/portal/mal/sg-hub/dispersion`: ellipse, snittlengde, bias per kølle, bygget av `Shot`-GPS + `TrackManShot` (side/carry) via eksisterende adaptere `shotsToPoints`/`trackmanToPoints` |
| F2.2 | Rikere gameplan per hull: køllevalg per slag, plan B, strukturert strategi (erstatter fritekst-notat) |
| F2.3 | Gameplan-etterlevelse i rundeoppsummeringen: avstand faktisk landing ↔ sikte, treff i soner |
| F2.4 | Coach-flate i AgencyOS: spillerens baneguide + dispersion (`/admin/spillere/[id]/baneguide`) |
| F2.5 | Auto-utledede «aldri»-soner fra banegeometri (vann/bunker/OB → `GameplanSone.laast = true` — flagget er modellert, utlederen mangler) |
| F2.6 | Banedata-admin med rette-editor (`/admin/baner`): flytt tee/green/pin, tegn manglende geometri |
| F2.7 | Tee-støtte: lengde og utslagskoordinat per tee-farge (ny `CourseTee`-modell) |

### Fase 3 — «Presisjon og skala»

| # | Funksjon |
|---|---|
| F3.1 | Pin-posisjoner per dag/turnering (bruk + utvid `CourseHole.pinLat/pinLng` som i dag er ubrukt) |
| F3.2 | TrackMan-beriket baneguide: forventet carry per kølle fra `TrackManShot`-data direkte i køllevalget |
| F3.3 | Polygon-soner (i dag kun sirkler) og høydeprofil per hull |
| F3.4 | Turneringsmodus: forenklet UI, kun avstander + score (regelverk: GPS-avstand er lov, råd er ikke lov i mange turneringer — se §13) |
| F3.5 | Delt gameplan i grupper (WANG/GFGK): coach publiserer bane-strategi til hele stallen |
| F3.6 | Skala: selvbetjent baneimport (spiller søker bane → OSM-import on demand) |

---

## 4. Brukerflyter (detaljerte)

### Flyt A — Planlegg runden (FØR, finnes i dag, beholdes)
1. `/portal/gameplan` → velg bane (viser `holesMapped`, `hasGeometry`, `playerRounds`)
2. Banekart-oversikt → velg hull
3. Hull-detalj: segment-pills `utslag / innspill / putt / planlegg`
4. Planlegg-modus: trykk kart for sikte → ellipsen flytter seg → % i bra/aldri-soner oppdateres live
5. Lagre skjer per handling (`lagreSikte`, `leggTilSone`) — ingen «lagre»-knapp

### Flyt B — Start runde med baneguide (UNDER, ny — MVP-kjernen)
1. `/portal/runde/live` → oppsett-steg som i dag (bane, antall hull) + **nytt:** appen forhåndslaster
   `Bane.geojson` + alle `CourseHole` til IndexedDB og ber om GPS-tillatelse (med klar forklaring)
2. Hull 1 åpner i **kart-modus** (ny visning i `RundeLoggKlient`, ved siden av dagens `foring`):
   - Satellittkart rotert slik at spilleretningen (tee → green) peker opp
   - Blå prikk = spillerens GPS-posisjon; avstandskort: green front / midt / bak + til sikte
   - Gameplan-overlay: siktemarkør + soner fra Flyt A (om de finnes)
3. Spilleren slår → trykker «Logg slag»:
   - GPS-posisjon foreslås som slagets startpunkt (forhåndsutfylt, justerbar ved å dra)
   - Velg kølle (hurtigvelger, husker forrige) → lie utledes fra geometri der mulig, ellers ett trykk
4. Ved green: putt logges som i dag (antall + lengde), ikke kart-trykk (GPS er ubrukelig på 3 m)
5. Hull ferdig → score bekreftes (auto-summert fra slag) → neste hull
6. Dårlig GPS eller dødt kart? **Fallback er dagens tekstflyt** — spilleren bytter til `foring`-visning
   med ett trykk og mister ingenting (samme kladd, samme datamodell)
7. Runde ferdig → oppsummering med SG (som i dag) — slagene har nå GPS, så dispersion vokser gratis

### Flyt C — Etterregistrer med kart (finnes delvis)
1. `/portal/runde/logg` (etterpå-modus) — som i dag, men med samme kart-modus tilgjengelig:
   spilleren tapper slagene på satellitt fra minnet (dagens `slag-wizard`-mønster, flyttet inn i hovedflyten)
2. Dette er **primærflyten for GPS-data i praksis** (låst beslutning fra `docs/plan-baneguide-dispersion.md`:
   etter-runde-plotting på satellitt er primær, live-GPS er bonus) — MVP bygger begge, men designes slik at
   etterregistrering er like god

### Flyt D — Se dispersion per kølle (Fase 2)
1. SG-hub → «Min bag» → liste over køller med antall datapunkter
2. Velg kølle → spredningsplott i sikteramme (lateral × lengde), ellipse 1σ/2σ, bias-tekst i klarspråk
   («Du misser systematisk 8 m høyre med driver»)
3. Datakilder kombineres: `Shot`-GPS (banen) + `TrackManShot` (simulator) med kilde-badge

### Flyt E — Coach ser spillerens baneguide (Fase 2)
1. AgencyOS → spiller → «Baneguide»-fane: samme hull-detalj og dispersion, lesevisning
2. Coach kan kommentere gameplan (eksisterende coach-meldingsmønster), aldri overstyre den
   (auth: `assertCanViewPlayerData()` — mønsteret finnes i `src/lib/auth/assert-own-or-coached.ts`)

---

## 5. Informasjonsarkitektur & navigasjon

**Prinsipp: ingen ny toppnivå-flate.** Baneguide er ikke en femte tab — den bor der oppgavene bor:

```
FØR    /portal/gameplan                      (finnes — banebibliotek)
       /portal/gameplan/[baneId]             (finnes — banekart-oversikt)
       /portal/gameplan/[baneId]/hull/[nr]   (finnes — hull-detalj + planlegg)

UNDER  /portal/runde/live                    (finnes — får kart-modus, fullscreen-gruppen)
       /portal/runde/logg                    (finnes — etterregistrering, får samme kart-modus)

ETTER  /portal/mal/runder/[id]               (finnes — rundedetalj + SG)
       /portal/mal/sg-hub/dispersion         (NY fase 2 — «Min bag»)

COACH  /admin/spillere/[id]/baneguide        (NY fase 2)
       /admin/baner                          (NY fase 2 — banedata-admin + rette-editor)
```

- `/portal/baneguide/**` er allerede redirects til `/portal/gameplan/**` — behold dem
- Navnespørsmålet (Gameplan vs. Baneguide i UI) er en åpen beslutning → §13
- Nye skjermer måles mot ferdig-definisjonen i `docs/port/plan-designport-alle-skjermer.md`
  §Ferdig-definisjon per skjerm; sjekk `docs/port/fasit-liste-paper.md` for om Gameplan-flatene har fasit

---

## 6. Designspesifikasjon

### 6.1 Designprinsipper

**Designfasit er Claude Paper** (Open Design `be6bdcb8` / Claude Design `605a48cc`) — alt nytt
design-arbeid skjer der. **Produksjonskoden i pilotperioden følger «C, smalt»** (låst 2026-07-31):
v2-tokens (`src/lib/v2/tokens.ts`), Inter/Familjen Grotesk/JetBrains Mono, og `--handling` `#D97757`
kun for skjermens ene primærhandling. Designeren tegner i Paper; utvikleren porter til v2-tokens til
full Paper-port er besluttet etter pilot. PlayerHQ er alltid lys.

1. **Én ting nå.** Under runden finnes nøyaktig én primærhandling per øyeblikk: «Logg slag»
   (`--handling`-oransje). Alt annet er sekundært. ADHD-vennlig, hanske-vennlig, sol-vennlig.
2. **Anti-paralyse.** Aldri mer enn ett valg om gangen i live-flyten: kart → kølle → bekreft.
   Lie, avstand og SG regnes for spilleren, aldri av spilleren. Alle felter har smarte defaults
   (forrige kølle, GPS-posisjon, lie fra geometri).
3. **Anbefalinger sperrer aldri** (invariant 1). Aldri-sonen er rød veiledning, ikke en sperre.
   Ingen «du burde ikke»-modaler.
4. **Tommel-sonen.** Alt interaktivt under runde ligger i nedre tredjedel (mønsteret finnes
   allerede i `runde-logg/tommel-sone`). Kartet er øvre 2/3, handlinger nederst.
5. **Norsk bokmål, klarspråk.** «152 m til midten av green», ikke «DTG 152». Kopi hentes fra
   `docs/skjermtekst/`-mønsteret, aldri improvisert engelsk golfsjargong.
6. **Lucide-ikoner, aldri emoji.** Kart-markører følger `map-colors.ts`-unntaket (Mapbox-canvas
   kan ikke lese CSS-variabler — dokumentert unntak fra hex-forbudet).

### 6.2 Nøkkel-skjermer med anatomi

#### S1 — Live hull-skjerm (NY, MVP — den viktigste skjermen i hele leveransen)
Fullscreen (`(fullscreen)`-gruppen, ingen shell/tab-bar). Portrett, mobil-først.

```
┌─────────────────────────────┐
│ ‹ Hull 7 · Par 4 · 348 m   │  Topplinje: hullnr, par, lengde. Tilbake = hull-oversikt.
│                             │
│                             │
│        [SATELLITTKART]      │  Rotert: spilleretning opp. Lag (nedenfra og opp):
│     green → fairway →       │  geometri-fill → soner (bra/aldri, 20–30 % opacity) →
│     bunkere → soner →       │  siktelinje tee→sikte→green → siktemarkør →
│     sikte ◎ → GPS-prikk ●   │  loggede slag (nummererte punkter + strek) → GPS-prikk
│                             │  med nøyaktighetsring.
│                             │
│ ┌─────────────────────────┐ │
│ │  148    152    157      │ │  Avstandskort (JetBrains Mono, store tall):
│ │ front   midt   bak      │ │  green front/midt/bak fra GPS. Under: «Til sikte: 195 m».
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ Slag 2 · [Driver ▾]     │ │  Kølle-hurtigvelger (husker forrige per slagtype).
│ │ ┌─────────────────────┐ │ │
│ │ │      Logg slag      │ │ │  PRIMÆRHANDLING (--handling #D97757). Én per skjerm.
│ │ └─────────────────────┘ │ │
│ │  På green · Liste-modus │ │  Sekundært (tekstknapper): hopp til putt / bytt visning.
│ └─────────────────────────┘ │
└─────────────────────────────┘
```
- «Logg slag» → GPS-posisjon settes som startpunkt; kartet viser en flyttbar markør i 2 sekunder
  («dra for å justere») → auto-bekreft. Null obligatoriske ekstra-trykk.
- GPS-status vises kun ved problem: gult banner «Unøyaktig GPS (±25 m) — trykk på kartet der du står».
- Gameplan-fravær: uten gameplan vises kart uten sikte/soner — ingen tom-tilstand-mas. Diskret
  «Planlegg dette hullet»-lenke i hull-oversikten, ikke her.

#### S2 — Hull-detalj / Planlegg (finnes — utvides i fase 2)
Dagens anatomi beholdes: kart øverst, segment-pills (`utslag/innspill/putt/planlegg`), statistikk under.
Fase 2 legger til i planlegg-modus: køllevalg per slag (chips under kartet) og plan B-linje.
Prosent-i-sone-tallene (`pctAldri`/`pctBra`) beholdes — de er produktets skarpeste innsikt.

#### S3 — «Min bag» / dispersion per kølle (NY, fase 2)
- Toppen: kølleliste som horisontale chips med datapunkt-antall (grå ut køller med < 15 punkter:
  «Trenger flere slag for pålitelig bilde» — aldri vis en ellipse bygget på 4 slag)
- Midten: spredningsplott i sikteramme — SVG/Recharts, IKKE kart (avstand lateralt × lengde,
  origo = sikte). 1σ-ellipse fylt, 2σ stiplet, hvert punkt fargekodet etter kilde (bane/TrackMan)
- Bunnen: tre KPI-kort (mono-tall): snittlengde · bias side · bias lengde, med klarspråk-setning
  under («8 m høyre-bias — legg siktet i venstre kant»)

#### S4 — Rundeoppsummering med gameplan-etterlevelse (finnes — utvides i fase 2)
Dagens SG-oppsummering + ny seksjon «Planen din»: per hull med gameplan — avstand landing↔sikte,
treff i bra/aldri-soner, én rad per hull, grønn/rød prikk. Ingen ny skjerm, én ny seksjon.

### 6.3 Komponentbehov

| Komponent | Status | Merknad |
|---|---|---|
| `CourseMap` | ✅ Finnes | Utvides med: `gpsPosisjon`-prop (prikk + nøyaktighetsring), `rotasjon` (bearing tee→green), `onSlagMarkert` |
| `GameplanPlanlegger` | ✅ Finnes | Fase 2: køllevalg + plan B |
| `AvstandsKort` | ❌ Ny | Front/midt/bak + til sikte. Mono-tall, `T`-tokens |
| `KolleVelger` | ❌ Ny | Hurtigchips, husker sist brukt per `ShotType`; gjenbrukes i S1 og S3 |
| `SlagMarkoer` | ❌ Ny | Flyttbar kartmarkør med auto-bekreft |
| `GpsStatusBanner` | ❌ Ny | Vises kun ved accuracy > terskel eller avslått tillatelse |
| `DispersionPlott` | ❌ Ny | SVG i sikteramme; datainput fra `computeDispersion` (finnes) |
| `RundeLoggKlient` | ✅ Finnes | Får `kart`-visning ved siden av `foring`; stegmaskinen er uendret |
| Kladd/kø | Delvis | `draft.ts` (localStorage) beholdes for runde-state; NY `shot-sync-queue.ts` i `src/lib/offline-queue/` etter `recording-chunk-queue.ts`-mønsteret |

---

## 7. Banekart & verktøy

### 7.1 Anbefalt kartløsning: **behold Mapbox GL JS** (allerede valgt og integrert)

| Kriterium | Mapbox GL JS (i dag) | MapLibre + egne tiles | Google Maps |
|---|---|---|---|
| Satellittkvalitet Norge | God (`satellite-streets-v12`) | Krever egen tile-kilde (Norge i bilder/Kartverket — merarbeid) | God, men dyrere vektor-API |
| Allerede integrert | ✅ `mapbox-gl@3.23`, CSP, token, `course-map.tsx` | ❌ Bytte = omskriving | ❌ |
| GeoJSON-lag/custom rendering | Utmerket | Utmerket | Begrenset |
| Kostnad | 50k gratis map loads/mnd — langt over dagens behov | «Gratis», men drift av tiles koster tid | Dyrest |
| Offline | Begrenset av ToS (se 7.4) | Full frihet | Nei |

**Beslutning: Mapbox beholdes.** Bytte gir null produktverdi nå. MapLibre + Kartverket-flyfoto er
en dokumentert exit hvis Mapbox-kostnad eller offline-behov tvinger det (API-et er nesten identisk,
`course-map.tsx` er eneste kartkomponent — byttekostnaden er isolert til én fil).

### 7.2 Banedata (hull, tees, green, hazards)

Dagens pipeline beholdes og utvides:
1. **Kilde: OSM via Overpass** (`scripts/import-bane-osm.ts`) — `golf=green/tee/bunker/fairway/hole`
   → `Bane.geojson` (FeatureCollection) + `CourseHole` (tee/green/pin-koordinater per hull,
   `geometrySource: "osm"`). Idempotent upsert; 9 baner inne.
2. **Fase 2: rette-editor i `/admin/baner`** — OSM-data er ujevn (feil tee-punkt, manglende bunkere).
   Editoren gjenbruker `CourseMap` i interactive-modus: dra tee/green/pin-markører, tegn/slett
   polygoner, `geometrySource: "manual"` vinner alltid over ny OSM-import.
3. **Tees (fase 2):** ny `CourseTee`-modell (per hull × farge, se §8) — i dag finnes tee-farger kun
   som UI-tokens. Avstander regnes fra spillerens valgte tee.
4. **Broen bane↔runde:** `Round → CourseDefinition → baneId? → Bane`. MVP-krav: alle baner spillerne
   faktisk logger runder på skal ha `baneId` satt (engangs-oppryddingsscript + admin-kobling i
   rette-editoren). Runder uten bro får dagens tekstflyt — aldri en blokkering.

### 7.3 Slag på kart og dispersion

- **Markering:** trykk = sett punkt, dra = juster. Under runde forhåndsutfylles punktet fra GPS
  (S1). Lagring: `Shot.startX/Y` (der slaget slås fra) og `endX/Y` settes automatisk = neste slags
  startpunkt (posisjonskjede-modellen i `runde-logg/types.ts` er allerede bygget slik).
- **Konvensjon (finnes):** X=lng, Y=lat (`src/lib/gameplan/shot-coords.ts`). NB: schema-kommentaren
  i `prisma/schema.prisma` peker fortsatt på gammel sti `lib/baneguide/shot-coords.ts` — rettes.
- **Dispersion:** all matematikk finnes i `dispersion.ts` — `projectToAimFrame` (GPS → lateral/lengde),
  `computeDispersion` (kovarians → egenvektor-ellipse, 95 % konfidens), `ellipseGpsPunkter` (ellipse →
  GPS mot nytt sikte), `andelISone`. På kart tegnes ellipsen som GeoJSON-polygon (dagens mønster);
  i «Min bag» tegnes den i SVG-sikteramme. Minimum 15 datapunkter per kølle før ellipse vises.
- **Kildekombinasjon:** `shotsToPoints` (bane-GPS) + `trackmanToPoints` (side/carry) finnes allerede
  som adaptere — «Min bag» konsumerer begge.

### 7.4 GPS-håndtering

- **API:** `navigator.geolocation.watchPosition` med `enableHighAccuracy: true`, innkapslet i én hook
  `useGpsPosisjon()` (`src/lib/baneguide/use-gps.ts`): returnerer `{ posisjon, accuracy, status }`,
  starter kun i live-modus, stopper ved unmount/skjult fane (batteri).
- **Nøyaktighetsregler:**
  - accuracy ≤ 15 m → normal drift, prikk + ring
  - 15–30 m → gult banner, GPS-forslag vises men «dra for å justere» fremheves
  - > 30 m eller ingen fix → GPS-forslag skrus av; kart-tapping er eneste input (= dagens modell,
    som fungerer). Avstandskortet skjules fremfor å vise feil tall — **aldri vis et tall vi ikke tror på**
  - Avslått tillatelse → hele kart-modusen fungerer med tapping; ingen masing, én forklaringslinje
- **Ingen dead reckoning/Kalman i MVP** — kompleksitet uten bevist behov. Rå posisjon + accuracy-terskler
  holder for avstander på 100+ m. Putting bruker aldri GPS.
- **Regulatorisk (golfregel 4.3):** avstandsmåling er lovlig; råd (køllevalg basert på vind o.l.) kan
  være ulovlig i turnering → turneringsmodus i fase 3 skjuler anbefalinger, viser kun avstander.

### 7.5 Offline

Golfbaner har notorisk dårlig dekning. Strategi i tre lag:

1. **Banedata (kritisk, MVP):** ved rundestart forhåndslastes `Bane.geojson` + `CourseHole[]` +
   spillerens `GameplanHull`/`GameplanSone` til IndexedDB (`bane-cache.ts` i `src/lib/offline-queue/`).
   All avstandsberegning er klient-side (haversine finnes) — **hele S1 fungerer uten nett** så lenge
   kartbildene mangler.
2. **Slag (kritisk, MVP):** hvert logget slag → IndexedDB-kø (`shot-sync-queue.ts`, kopier mønsteret
   fra `recording-chunk-queue.ts`: objectStore med nøkkel, `tomKo(uploadFn)` ved dekning/`online`-event).
   Runde-state fortsetter i localStorage-kladden (`draft.ts`) som i dag — den har allerede
   «Fortsett fra hull N?»-gjenopptak.
3. **Kartfliser (best effort):** Mapbox ToS tillater ikke persistent tile-lagring utenfor deres SDK-er.
   Vi lener oss på nettleserens HTTP-cache (flisene for banen er typisk nylig lastet fra
   forhåndsvisningen) + et **skjematisk offline-fallback**: hullet tegnet fra `Bane.geojson` i SVG
   (geometrien HAR vi lokalt — fairway/green/bunkere som former uten satellittbilde). Spilleren mister
   bakgrunnsbildet, aldri funksjonen. Full offline-satellitt (egne tiles via MapLibre) er exit-kortet
   i 7.1, ikke MVP.
4. **Serwist:** dagens runtime-caching (NetworkFirst API, SWR bilder) beholdes; `api.mapbox.com`
   legges IKKE i precache (ToS + størrelse).

### 7.6 Biblioteker/tjenester — ingen nye avhengigheter i MVP

`mapbox-gl` (finnes), rå IndexedDB (mønster finnes), `navigator.geolocation` (nettleser-API),
Recharts/SVG for dispersjonsplott (finnes). Fase 2-kandidat: `@turf/boolean-point-in-polygon` e.l.
for auto-soner fra polygoner — vurderes da; `andelISone` med sirkler klarer seg uten.

---

## 8. Datamodell (konkret)

### 8.1 Finnes allerede (gjenbrukes uendret)

- `Bane` — `geojson Json?`, `geometrySource`, lat/lng, `holes CourseHole[]`
- `CourseHole` — `teeLat/Lng`, `greenLat/Lng`, `pinLat/Lng` (ubrukt i dag — tas i bruk), `geojson`, `par`, `lengthMeter`
- `Shot` — `startX/Y`, `endX/Y`, `targetX/Y`, `club`, `lie ShotLie`, `shotType`, `distanceToPin`, `mentalScore`
- `Round` — 21 SG-felter, `sgSource ("manual"|"beregnet")`, `HoleScore[]`
- `GameplanHull` — sikte per (hull, spiller): `siktLat/Lng`, `notat`
- `GameplanSone` — `type ("bra"|"aldri")`, senter+radius, `laast`
- `TrackManSession`/`TrackManShot` — `side` + `carryDistance` gir dispersjonspunkter

### 8.2 Nye/utvidede modeller

Alle endringer er **additive** — følg gotcha «Schema-endringer»: modell i `schema.prisma` +
kirurgisk `CREATE TABLE IF NOT EXISTS` via `prisma db execute`/tsx mot `DIRECT_URL` (migrate dev og
db push er begge blokkert). Nye tabeller får RLS + `timestamp(3)` (jf. memory-notat). Plain
`userId String` uten `@relation` for isolasjon.

```prisma
// FASE 1 — utvidelse av GameplanHull (kolonner, ikke ny tabell)
model GameplanHull {
  // ... eksisterende felter ...
  kolle       String?   // planlagt kølle for utslaget, f.eks. "Driver", "3W"
  planB       String?   // kort tekst: hva gjør du når plan A ryker
}

// FASE 2 — tees
model CourseTee {
  id           String   @id @default(cuid())
  holeId       String   // CourseHole.id (plain id)
  farge        String   // "hvit" | "gul" | "rod" — matcher T.tee-tokens
  lat          Float
  lng          Float
  lengdeMeter  Int?
  createdAt    DateTime @default(now())
  @@unique([holeId, farge])
  @@map("course_tees")
}

// FASE 3 — pin-posisjoner per dato (CourseHole.pinLat/pinLng forblir "standard-pin")
model PinPosisjon {
  id         String   @id @default(cuid())
  holeId     String
  gyldigFra  DateTime @db.Date
  lat        Float
  lng        Float
  kilde      String   // "manuell" | "turnering"
  createdAt  DateTime @default(now())
  @@index([holeId, gyldigFra])
  @@map("pin_posisjoner")
}
```

**Bevisst IKKE ny modell for:** slagposisjoner (bor på `Shot`), runde-state offline (localStorage-kladd +
IndexedDB-kø er klient-side), gameplan-etterlevelse (deriveres ved lesing fra `Shot` × `GameplanHull` —
aldri denormaliser noe som kan regnes ut).

**Kjent hull som IKKE fikses nå:** `logRoundManual` mottar tee/vær/spilltype uten å persistere dem.
Hvis tee-valg skal styre avstander (F2.7) må `Round` få `teeFarge String?` — tas i fase 2 sammen med
`CourseTee`.

### 8.3 Dataintegritet

- `@@unique([roundId, holeNumber, shotNumber])` på `Shot` (finnes) gjør slag-synk idempotent —
  offline-køen kan trygt re-sende (upsert på nøkkelen)
- SG server-side er fasit (dagens regel) — klientens live-SG er kun visning
- `sgSource: "manual"` overskrives aldri av reberegning (dagens regel i `recomputeRoundSg`)

---

## 9. Teknisk arkitektur & kode-anbefalinger

### 9.1 Mapper/struktur

```
src/lib/gameplan/            (finnes — FØR-domenet: dispersion, queries, actions, map-colors, shot-coords)
src/lib/baneguide/           (NY — UNDER-domenet)
├── use-gps.ts               # useGpsPosisjon() — eneste sted navigator.geolocation røres
├── avstander.ts             # ren funksjon: posisjon × CourseHole → {front, midt, bak, tilSikte}
│                            # (green front/bak fra geojson-polygon langs spilleretningen; kun haversine/bearing
│                            #  fra dispersion.ts — ingen nye geo-primitiver)
└── bane-cache.ts            # IndexedDB: forhåndslast/les banedata for offline
src/lib/offline-queue/
└── shot-sync-queue.ts       # NY — kø for slag, mønster fra recording-chunk-queue.ts
src/components/gameplan/     (finnes — CourseMap utvides her)
src/components/portal/runde-logg/
├── kart-foring.tsx          # NY — S1-visningen, monteres i RundeLoggKlient ved siden av hull-foring
├── avstands-kort.tsx        # NY
├── kolle-velger.tsx         # NY
└── gps-status-banner.tsx    # NY
```

**Regler:** domenelogikk kun i `src/lib/` (invariant 5). `kart-foring.tsx` inneholder null geometri-
matte — alt via `avstander.ts`/`dispersion.ts`, som får enhetstester i `node:test`-mønsteret
(vitest finnes ikke). All dato/tid via `uke-helpers.ts` ved behov. `next/dynamic` med `ssr: false`
for kartkomponenten (mapbox-gl er klient-eneste — dagens `course-map.tsx`-mønster).

### 9.2 API / server actions

Server actions, ikke REST — dagens mønster (`requirePortalUser()` + zod + `revalidatePath`):

| Action | Fil | Merknad |
|---|---|---|
| `hentBaneguidePakke(baneId)` | `src/lib/baneguide/actions.ts` (NY) | Alt S1 trenger i ett kall: geojson + hull + gameplan — mates rett i `bane-cache` |
| `synkSlag(roundId, slag[])` | samme | Batch-upsert på `(roundId, holeNumber, shotNumber)`; kalles av `shot-sync-queue.tomKo()` |
| `lagreSikte` / `leggTilSone` / `fjernSone` | `src/lib/gameplan/actions.ts` | ✅ Finnes |
| `lagreLoggetRunde` | `runde-logg (…)/actions.ts` | ✅ Finnes — utvides ikke; GPS følger med i `byggShotRader`-input |
| `oppdaterGameplanPlan(holeId, {kolle, planB})` | `src/lib/gameplan/actions.ts` | Fase 2 |

Zod-schemaer bor ved domenet (dagens praksis): `src/lib/baneguide/schema.ts` for synk-payload
(lat/lng-bounds-sjekk: lat ∈ [-90,90], lng ∈ [-180,180], maks 25 slag per hull — samme grense som
`hullSchema`).

### 9.3 Integrasjon mot SG og spillerdata

**Null endring i SG-pipelinen.** `lagreLoggetRunde` → `byggShotRader` → `beregnGranulaerSgFraShots`
er urørt; kart-modusen produserer samme `LoggetRunde`-struktur som tekst-modusen, bare med
posisjoner på slagene. Det er hele poenget med å bygge inne i `RundeLoggKlient` i stedet for en
parallell flyt: én kladd, én lagringsvei, én SG-beregning, `triggerRoundAgent` fyrer som før.

Dispersion leser `Shot` via eksisterende `getHoleDetail`-mønster i `queries.ts`; «Min bag» får en
ny query `getKolleDispersion(userId, klubb)` samme sted.

### 9.4 Ytelse

- `Bane.geojson` for en 18-hulls bane er 100–500 KB — én lasting per runde, caches i IndexedDB; aldri
  i React-state ukomprimert på liste-sider (banebiblioteket bruker allerede bare metadata)
- `watchPosition` maks 1 oppdatering/2 s inn i React (throttle i hooken) — kartprikk-flytting via
  Mapbox `setData`, ikke re-render av komponenttreet (dagens sone-mønster)
- Slag-skriving er lokal-først: UI bekrefter fra IndexedDB-køen umiddelbart, synk skjer bak
- Ett kart-instans per skjerm; `CourseMap` gjenbrukes mellom hull ved å flytte kamera, ikke remounte

---

## 10. Personvern & juridiske hensyn

1. **GPS-posisjon er personopplysning.** Den samles kun under aktiv runde-føring, kun for spillerens
   egen analyse, og lagres kun som slagposisjoner (`Shot.startX/Y` osv.) — aldri som kontinuerlig
   bevegelsesspor. `watchPosition`-strømmen forkastes; bare punktene spilleren logger persisteres.
2. **Samtykke og rettsgrunnlag:** runde-lagring går allerede gjennom `requireConsentingUser()`.
   GPS-tillatelsen forklares i klarspråk ved rundestart («Brukes til avstander og slagposisjoner.
   Lagres kun når du logger et slag.»). Posisjonsdata omfattes av eksisterende sletteflyt
   (runde slettes → slag slettes, cascade finnes).
3. **Mindreårige (WANG/GFGK):** posisjonsdata for mindreårige behandles som øvrig spillerdata —
   coach-innsyn kun via `assertCanViewPlayerData()`, aldri sanntidsposisjon (vi bygger bevisst IKKE
   «se hvor spilleren er nå»), foreldreportal ser aggregater, ikke kart.
4. **Tredjeparter:** Mapbox mottar IP + tile-forespørsler (standard kartlasting) — inn i
   personvernerklæringen; **Mapbox telemetry skrus av** i kartconfig. Ingen posisjonsdata sendes til
   Anthropic/OpenAI — AI-funksjoner over rundedata følger eksisterende pseudonymiserings-regime
   (`pseudonym.ts`).
5. **GDPR-dokumentasjon:** `docs/gdpr/` er sperret for agenter — utkast til oppdatert
   behandlingsoversikt skrives utenfor repoet og leveres Anders separat når fase 1 bygges.
6. **Golfregler:** avstandsinfo er lovlig (regel 4.3a); anbefalinger kan rammes i turnering →
   turneringsmodus (F3.4) viser kun avstander. UI-tekst sier aldri «lovlig i turnering» uten forbehold.

---

## 11. Implementeringsplan i faser

### Fase 1 — MVP «Live på banen» (est. 2–3 ukers kodeøkter)

| Steg | Leveranse | Verifikasjon |
|---|---|---|
| 1.1 | `src/lib/baneguide/avstander.ts` + tester | `npm test` grønn; kjente koordinater → kjente avstander |
| 1.2 | `use-gps.ts` + `GpsStatusBanner` | Manuell test på telefon (felt-test, ikke bare simulator) |
| 1.3 | `bane-cache.ts` + `hentBaneguidePakke` | Flymodus etter forhåndslasting → hull-data tilgjengelig |
| 1.4 | `CourseMap`-utvidelser (GPS-prikk, rotasjon, slagmarkør) | Visuell verifisering i preview |
| 1.5 | `kart-foring.tsx` inn i `RundeLoggKlient` (visnings-toggle kart/liste) | Full runde i test: kart-logget runde gir identisk `LoggetRunde` som tekst-logget |
| 1.6 | `shot-sync-queue.ts` + `synkSlag` | Flymodus midt i runde → slag i kø → synk ved dekning; idempotens-test |
| 1.7 | GameplanHull-utvidelse (`kolle`, `planB`) + overlay i S1 | Kirurgisk `db execute`; sikte/soner synlige live |
| 1.8 | Skjematisk offline-fallback (SVG fra geojson) | Kart uten nett viser hull-form |
| 1.9 | Ferdig-definisjon per skjerm + `npm run verify && npm test` + felt-test på ekte bane | Skjermbilder godkjent av Anders; Anders spiller 9 hull med appen |

### Fase 2 — «Forstå spillet ditt» (etter MVP-evaluering)
«Min bag»-dispersion (F2.1) → gameplan-etterlevelse (F2.3) → coach-flate (F2.4) → rette-editor +
`CourseTee` (F2.6/F2.7) → auto-soner (F2.5). Rekkefølgen kan endres etter pilot-læring.

### Fase 3 — «Presisjon og skala»
Pin-posisjoner, TrackMan-carry i køllevalg, turneringsmodus, delt gameplan, selvbetjent baneimport.

**Git-flyt per steg (standard):** egen gren `feature/baneguide-<steg>`, commit per ferdig steg,
`npm run verify && npm test` før push, PR mot main — aldri merge rødt. DB-endringer og nye
dependencies avklares med Anders først (arbeidsregel 2).

---

## 12. Anbefalt første byggeordre

Første kodeøkt, i rekkefølge (alle uten DB-endringer og uten nye dependencies — kan starte umiddelbart):

1. **`avstander.ts` + enhetstester** — ren funksjon, null risiko, låser geometri-kontrakten
2. **`use-gps.ts`** — hooken med accuracy-terskler og throttling
3. **`CourseMap`: GPS-prikk + rotasjon** — utvidelse av eksisterende komponent bak nye props
   (eksisterende gameplan-skjermer urørt)
4. **`kart-foring.tsx` skjelett** — S1 med avstandskort og «Logg slag» koblet til dagens kladd-state
5. **Felt-test** på Onsøy (banen har geometri): avstander mot laser/kjente merker før noe mer bygges

Begrunnelse: dette er den korteste veien til å **verifisere den største risikoen** — GPS-nøyaktighet
og avstandskvalitet på ekte bane — før vi investerer i offline-kø og gameplan-overlay. Punkt 5 er
go/no-go for resten av fase 1-rekkefølgen.

---

## 13. Åpne beslutninger (Anders)

| # | Spørsmål | Anbefaling |
|---|---|---|
| B1 | **Navn i UI:** «Gameplan» (dagens, omdøpt 16. juli) eller «Baneguide» som paraply for FØR+UNDER? | Behold **Gameplan** for FØR-flaten; live-skjermen trenger ikke eget produktnavn (den heter «Hull 7») — unngå ny omdøping |
| B2 | GPS-forslag auto-bekreftes etter 2 s, eller alltid eksplisitt bekreft? | Auto-bekreft med dra-for-å-justere (færrest trykk, jf. enkelhet-prinsippet) |
| B3 | Skal kart-modus være default i `/portal/runde/live` når banen har geometri? | Ja — med synlig liste-toggle; tekstflyten er fallback, ikke sidestilt valg |
| B4 | `CourseTee` i fase 2 eller skyves til fase 3? | Fase 2 kun hvis WANG/GFGK-spillerne faktisk spiller ulike tees i pilot; ellers fase 3 |
| B5 | Mapbox-kostnadstak: sette opp usage-alert på Mapbox-kontoen før pilot? | Ja (5 min jobb, gjøres av Anders — krever konto-innlogging) |
| B6 | Felt-test-bane og -dato for steg 5 i byggeordren | Onsøy, første ledige formiddag etter steg 1–4 |

---

## 14. Suksesskriterier for MVP

**Produkt (målt i pilot med Anders + 2–3 spillere):**
1. En full 18-hulls runde kan logges i kart-modus uten at spilleren noen gang taster en avstand manuelt
2. Avstand til green midt avviker < 5 m fra laser på 10 stikkprøver (felt-testen i §12)
3. Runde logget i kart-modus gir identisk SG-resultat som samme runde logget i tekst-modus (automatisert test)
4. En runde påbegynt med dekning og fullført i flymodus mister null slag (kø-testen i 1.6)
5. Tid per logget slag ≤ 5 sekunder (unntatt selve golfslaget) — målt i felt-test
6. Etter 5 runder har spilleren ≥ 15 GPS-punkter på driver → «Min bag» (fase 2) har data fra dag én

**Teknisk:**
7. `npm run verify && npm test` grønn; ingen nye dependencies i fase 1; null endringer i SG-motoren
8. Eksisterende gameplan-skjermer og tekst-basert runde-logging fungerer uendret (regresjonssjekk)

**Adopsjon (første 30 dager etter pilot-godkjenning):**
9. ≥ 50 % av nye runder fra pilotgruppen logges med posisjoner (mot ~0 % i dag utenfor legacy-wizard)
10. Anders bruker gameplan-overlayet selv i én konkurranserunde og vurderer det som konkurransedyktig
    med kommersielle baneguide-apper — ellers har vi bygget feil ting

---

*Vedlikehold: dette dokumentet beskriver målbildet per 2026-08-02. Ved bygging gjelder
`docs/port/plan-designport-alle-skjermer.md` for skjermstatus og `.claude/rules/gotchas.md` for tekniske feller.
Kjente doc-avvik funnet under research (rettes separat): `docs/platform/DATA-MODEL.md` sier 14
SG-felter (er 21) og utelater Shot-GPS-feltene; schema-kommentaren på `Shot` peker på utdatert sti
`lib/baneguide/shot-coords.ts` (er `src/lib/gameplan/shot-coords.ts`).*
