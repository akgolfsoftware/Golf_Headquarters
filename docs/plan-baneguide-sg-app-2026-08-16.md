# Plan — Egen SG-app i PlayerHQ + utbedret baneguide

**Opprettet:** 2026-08-16 · **Status:** Forslag, venter på Anders · **Eier:** Anders Kristiansen

> Bestilling: «Komplett plan for utbedring av funksjon og design for baneguide og føringen av
> SG-data og stats, basert på UpGame-appen. Vi skal ha vår egen SG-data-app i PlayerHQ.»
>
> Grunnlaget er målt mot kodebasen og dokumentene 2026-08-16 (fem parallelle kartlegginger:
> baneguide-kode, SG-motor, Paper-fasit, dokumenter/datamodell, UpGame-research med kilder).
> **Juridisk/etisk ramme (uendret fra `docs/baneguide-produktdokument-2026-08-02.md`):
> ingen kopiering av UpGame — samme problemklasse, løst selvstendig.**

---

## 1. Sammendrag

**Dette er ikke et nytt prosjekt fra null.** SG-motoren er kalibrert og i drift, dispersionsmotoren
er komplett, Mapbox/OSM-banekartet har 9 baner, og runde-føringen finnes i tre nivåer. Det som
mangler for å være «vår egen SG-app» på UpGame-nivå er fire ting:

1. **Føringen er ikke kart-drevet.** UpGames viktigste grep er at kartet ER skjemaet: to
   dra-punkter per slag, og avstand/lie/gjenstående avledes automatisk. Hos oss tastes avstander
   manuelt, og kart-plotting av slag er strandet i en legacy-wizard (`/portal/mal/runder/[id]/slag`)
   utenfor hovedflyten. → Arbeidspakke **AP1 «Føring 2.0»** (planens viktigste leveranse).
2. **Baneguiden UNDER runden er ubygget.** Hele MVP-en fra `docs/baneguide-kjoreplan-2026-08-02.md`
   (GPS, avstander front/midt/bak, offline, kart-modus i live-føring) står på 0 av 7 økter.
   → **AP2** gjennomfører kjøreplanen som den står, med to UpGame-lærdommer lagt til.
3. **SG har én baseline og to sannheter.** Alt måles mot PGA Tour Top 40 (for en junior er alt
   rødt), referansene spriker til og med i Paper-fasiten (kat. D / Broadie scratch / HCP 12 /
   PGA-referansespiller), og spillerens SG hentes fra to konkurrerende kilder (`BrukerSgInput`
   vs. `Round.sg*`). → **AP0** (én sannhet) + **AP3** (benchmark-stige).
4. **Analysen forteller ikke spilleren hva den betyr.** UpGame har Insights («topp 3 / svakeste
   3»), proximity-statistikk og trender per kategori. Vi har motoren (insight-engine, granulære
   buckets) men flatene er delvis uportet og delvis utegnet. → **AP4**.

**Strategisk poeng:** WANG-elevenes IUP bruker i dag UpGame-statistikk som kilde
(`docs/treningsplanlegger/wang-toppidrett/grunnlag-funn.md`). Denne planen bygger erstatteren —
og vi har allerede UpGame-import (`upgame-parse.ts` + `importUpGameHoleScores`) som
migrasjonsbro for spillere som bytter. Vårt fortrinn er det UpGame kritiseres for å mangle:
treningen tilpasses ikke spillerens nivå/svakheter hos dem — hos oss lukker sløyfen seg
(Analyse → Plan/Workbench → økt → ny analyse) med coach i loopen.

---

## 2. Nåtilstand (målt 2026-08-16)

### 2.1 SG-motoren — sterk kjerne, smal referanse
- `src/lib/domain/sg.ts`: 4 kategorier (OTT/APP/ARG/PUTT — UI-navn «Tee-slag/Innspill/
  Nærspill/Putting»), Broadie-benchmarks for OTT/APP/ARG + **Team Norway IUP Ref-ark 2025** for
  putt (kalibrert 2026-06-10, `docs/platform/BUSINESS-RULES.md` §SG-kalibrering). Filhodet sier
  eksplisitt «Bare PGA Top 40-benchmarks (utvides senere med A1, A2, B1, B2)» — utvidelsen er
  aldri gjort.
- `Round` bærer 21 SG-felter (`sgTotal/sgOtt/sgApp/sgArg/sgPutt` + granulære buckets som
  `sgApp150`, `sgPutt3_5`; `sgLob` settes aldri — kølle brukes ikke i bucket-valget).
  `sgSource: "manual"` overskrives aldri av beregning (`recomputeRoundSg`).
- **Ærlighetsregelen** (`src/lib/runde-logg/shots-til-sg.ts`): ufullstendig slagkjede → null,
  aldri delvise tall. Riktig prinsipp — beholdes.
- **Kjente feil/gap i motoren:** (a) `SgBaseline`-semantikkfeil — `datagolf-sync.ts` lagrer
  DataGolf-feltet `sg_gained` i kolonnen `expectedStrokes`, mens `same-distance-strategy.ts`
  leser verdien som forventet antall slag; (b) trappetrinn uten interpolasjon mellom
  distansebuckets (synlig støy per slag); (c) baseline ignorerer lie — rough/bunker får
  fairway-forventning (CANON-invariant #8 «rough +0,15–0,25» er ikke kodehåndhevet);
  (d) ingen per-hull- eller per-slag-SG persisteres; (e) **to sannheter** — `sg-gap.ts` og
  hull-analysen prioriterer `BrukerSgInput` foran beregnede `Round.sg*`, mens Analysere/Hjem
  bruker Round-snitt (bryter NORDSTJERNE: «én SG-beregning, avledet data regenereres fra kilde»).

### 2.2 Føringen — tre innganger, to modeller, kartet på utsiden
- `/portal/runde/live` (stepper, hull for hull) og `/portal/runde/logg` (etterregistrering,
  «Hull for hull | Bare totalen») — Paper-portet, **null kart/GPS** (`navigator.geolocation`
  brukes ingen steder i kodebasen).
- `/portal/mal/runder/[id]/slag` (legacy `slag-wizard.tsx`, 633 linjer) — **eneste sted
  slag plottes på kart** (Mapbox → `Shot.startX/Y/endX/Y`), men avstander tastes fortsatt
  manuelt; GPS-koordinatene brukes aldri til å beregne `distanceToPin`.
- **To parallelle føringsmodeller:** ny posisjonskjede (`LoggetHull`/`LoggetSlag` — uten GPS)
  og gammel Shot-modell (med GPS/vind/mental). `distanceHit`, `windDir`, `mentalScore` og
  `targetX/Y` lagres men brukes ikke i noen beregning — vi fanger allerede intensjons- og
  mental-data UpGame er kjent for, uten å bruke dem.
- Hull-for-hull-score mates bevisst ikke inn i SG (`docs/AAPNE-SPORSMAAL.md` D6a) — SG krever
  komplett kjede.

### 2.3 Baneguide/Gameplan — FØR finnes, UNDER er ubygget
- FØR: `/portal/gameplan` (bibliotek) → `[baneId]` (banekart) → `hull/[nr]` (dispersjonsellipse,
  bra/aldri-soner, sikte — `GameplanPlanlegger`). Motor: `src/lib/gameplan/dispersion.ts`
  (haversine, kovarians-ellipse, `andelISone`) — komplett, men **uten enhetstester**.
- UNDER: hele MVP-en (GPS, avstandskort, kart-modus i runde-føring, offline-kø, forhåndslasting)
  er ubygget — `src/lib/baneguide/` finnes ikke, ingen felt-test er gjennomført.
- Data: 9 Østfold-baner med OSM-geometri; 33 seed-baner uten geometri (usynlige i biblioteket);
  `CourseDefinition.baneId`-broen settes aldri av kode; `CourseHole.pinLat/pinLng` ubrukt;
  ingen `CourseTee`, ingen rette-editor (`/admin/baner`).

### 2.4 Design/Paper-status (detaljert tabell i kartleggingen, hovedpunkter)
- Fasit finnes og er kodet `[~]` (venter pixel-sign-off, PP-bølge C5): analyse-hub, analyse-hull,
  runder-liste, runde-detalj, gameplan-liste, gameplan-banekart, datagolf, gapping, putte-lab,
  runde-live, runde-logg (sistnevnte reelt signert 13.08).
- **Fasit mangler helt for kjernen i denne planen:** slag-for-slag-føring med kart (runder-listens
  «Før slag for slag» har intet tegnet mål), gameplan hull-detalj (bevisst utsatt — «editor, ikke
  visning»), live-hull-skjermen med kart (S1), «Min bag» per-kølle-dispersion, `runder/ny`-skjemaet,
  alle coach-flater. Mapbox-kartet er stripet plassholder i fasiten.
- **Fasit-sprik som må rettes (fasiten rettes, jf. konfliktregelen):** SG-referansen varierer
  per fil (kat. D / Broadie scratch / HCP 12 / PGA-referansespiller) uten definert regel;
  demo-navnet «Emma Nyström» i datagolf-fasiten bryter navne-kanonen.
- Blokkerende beslutninger i porten: **PR-F** (DataGolf-plassering) og **A3** (Analyse-hub 5 vs. 3
  faner).

### 2.5 Øvrige stats-kilder
- DataGolf: benchmark-sync (mandager) → `SgBaseline`/`PgaPlayerSeason` m.fl.; «Deg mot touren»
  (`/portal/datagolf`) mot én referansespiller. Marketing `/stats/*` (~45 skjermer) er eksplisitt
  utenfor pixel-planen («W7-stats — tegnes før koding») — **denne planen er det dokumentet for
  PlayerHQ-delen.**
- TrackMan: import skriver nå `TrackManShot`; gapping + per-kølle-dispersion finnes; ingen kobling
  TrackMan → runde-SG (bevisst, forblir utenfor scope her).
- GolfBox-scraperen gir runde-scorer for turneringer (aldri slag) → kan mate snittscore/resultat,
  aldri SG.

---

## 3. UpGame-analysen — hva vi lærer, hva vi gjør annerledes

Kartlagt fra åpne kilder (upgame.app Knowledge Center, App Store/Play, uavhengige anmeldelser —
full kildeliste i kartleggingsrapporten). UpGame er i dag «Upgame Golf by Trackman» (partnerskap),
brukt av 25–40 forbund, 90+ collegelag og LET.

| UpGame-grep | Deres løsning | Vår respons |
|---|---|---|
| **To føringsnivåer, ett datasett** | Basic: hull-for-hull m/ putts (+/−). Pro: slag-for-slag på kart | **Adopteres som tre nivåer** (vi har alt tre innganger): Hurtig total · Hull for hull · Slag for slag. Aldri bak betalingsnivå slik UpGame kritiseres for (kølle av tee mangler i Basic) |
| **Kartet er skjemaet** | Dra ball + mål per slag; distanse/lie/gjenstående avledes automatisk | **Adopteres** (AP1). Vi har alt koordinatfangst + haversine — mangler bare koblingen til `distanceToPin` og lie-avledning fra geojson |
| **Logg intensjon, ikke bare resultat** | Target-punkt før ball-punkt → «Target Feet vs Distance» skiller strategifeil fra utførelsesfeil | **Adopteres.** `Shot.targetX/Y` finnes allerede — og vår Gameplan (sikte + soner FØR runden) er strukturelt sterkere enn deres per-slag-target |
| **Mental rating per slag** | Ett trykk (committed/usikker) → coach-innsikt | `Shot.mentalScore` finnes allerede — tas i bruk i føring + analyse (AP1/AP4) |
| **Benchmark-stige** | PGA/LPGA, D1 College, WAGR Top 15, U18 Europe, spillerprofiler, «deg selv på ditt beste» | **Adopteres i vår form** (AP3): PGA Top 40 (finnes) · Broadie scratch · **AK-kategori** (fasiten krever «kat. D-referansen») · egen historikk. Hcp-grupper har vi allerede tabell for (`BROADIE_HCP_TABLE`) |
| **Dashboard → Insights** | Automatisk «topp 3 / 3 svakeste» + nedbrytning per distanse/lie/slagform | **Adopteres** (AP4). Insight-engine + granulære buckets finnes; flaten mangler |
| **Én stolpe = én runde** i trender | Enkel lesbar konvensjon | Adopteres i grafene (dagens sparkline beholdes der fasiten sier det) |
| **Diamonds** (dispersjonsbasert sikteområde) | Diamantformet sone + «sikt 7 yards fra kanten» | Vi har bedre svar: ellipse + bra/aldri-soner + `pctAldri` i Gameplan. Utbedres, ikke erstattes |
| **Auto-deling til coach + feed** | Runden deles automatisk med coach | Finnes (fasit: «Anders ser den i stallen») — AgencyOS-flatene kompletteres (AP5) |
| **Practice challenges + leaderboard** | Bibliotek av spill, konkurrer i gruppe | Vi har testbatteri + drills; gruppe-leaderboard vurderes i AP6. **Deres svakhet — ingen nivåtilpasning, ingen kobling til treningsplan — er vårt fortrinn og skal forbli det** |
| **Kjent kostnad ved dybde** | Pro-føring er tidkrevende («scratch-to-10») | Designkrav: ≤ 5 sek per slag (suksesskriterium fra produktdokumentet), smarte defaults, alt valgfritt utover posisjon |

**Stats-katalogen deres vi skal dekke** (utover SG): GIR, fairways truffet (ekskl. par 3),
opp-og-ned, sand saves, proximity per distansevindu (mot flagg OG mot mål), miss-retning
(venstre/høyre/kort/langt), make-rate per puttlengde, 3-putt-andel, snittscore per par-type.
Nesten alt er deriverbart fra slagkjeden vi allerede lagrer (`deriver-hullscore.ts` finnes) —
dette er visningsarbeid + noen nye deriveringer, ikke ny datafangst. Putt-break-retning
(UpGames «Break Analysis») krever ett valgfritt trykk i føringen → beslutning PB6.

---

## 4. Målbildet — «SG-appen» i PlayerHQ

**Ingen ny toppnivå-flate.** BUSINESS-RULES §«Analyse samlet» er styrende: Analysere + TrackMan +
Runder + SG er ÉN flate med faner. «SG-appen» = **Analyse-fanen med full dybde**, pluss føringen
som mater den og baneguiden som gjør føringen automatisk:

```
FØRING   /portal/runde/live · /runde/logg · hurtig score     (tre nivåer, ett datasett)
   ↓            kartet er skjemaet — avstander/lie avledes, aldri tastes
BANEGUIDE /portal/gameplan (FØR) · kart-modus i runde (UNDER) (AP2 = kjøreplanen 02.08)
   ↓            hvert slag får posisjon → dispersion vokser gratis
SG-MOTOR  src/lib/domain/sg.ts + referansestige               (én sannhet, valgbar referanse)
   ↓
ANALYSE   /portal/analysere (hub + hull + putting + gapping + datagolf + Min bag + Insights)
   ↓
HANDLING  «Én ting nå» → Plan/Workbench → coach ser det samme i AgencyOS
```

Fire prinsipper låses for hele planen:
1. **Én SG-sannhet.** Én selector eier «spillerens SG nå»; `BrukerSgInput` er kun fallback når
   beregnede runder ikke finnes, og kilden merkes alltid i UI (tillitsnivå: TrackMan-verifisert /
   GPS-beregnet / selvrapportert — NORDSTJERNE-krav).
2. **Referansen er eksplisitt.** Hvert SG-tall viser hvilken referanse det måles mot («mot kat.
   D-referansen»), og referansevalget bor ett sted i domenelaget — aldri hardkodet per skjerm.
3. **Ærlighet foran dekning.** Ufullstendig kjede → ingen SG (dagens regel). Manglende data vises
   som «—» med forklaring. Minimum datapunkter før ellipser/varmekart (≥ 15 slag per kølle,
   ≥ 3 runder) håndheves overalt.
4. **Anbefalinger sperrer aldri** (invariant 1) — også i baneguide/turneringssammenheng
   (avstander er lov, råd skjules i turneringsmodus, fase 3).

---

## 5. Arbeidspakker

> Formen følger repoets prosess: én PR per skjerm/steg, `npm run verify && npm test` før hver
> push, skjermbilde-gaten for hver skjerm (mobil 390 først, desktop, lys+mørk, alle fire
> tilstander, fasit ved siden av), aldri merge uten Anders' «ja». DB-endringer er additive og
> kjøres kirurgisk (`db execute`-mønsteret) — og avklares med Anders FØR de kjøres.

### AP0 — Grunnmur og én sannhet (kode, ingen designavhengighet — kan starte nå)
| # | Leveranse | Detalj |
|---|---|---|
| 0.1 | **Én SG-selector** | Ny `hentSpillerSg(userId)` i `src/lib/domain/` med dokumentert kilderegel (beregnede `Round.sg*` primært; `BrukerSgInput` kun når runder mangler, alltid med kilde-merke). `sg-gap.ts`, hull-analysens loader, `load-min-golf.ts` og stall-visningen konsumerer den — dagens sprik lukkes |
| 0.2 | **`SgBaseline`-semantikk** | Verifiser/normaliser `sg_gained`-i-`expectedStrokes`-feilen i `datagolf-sync.ts` før noe nytt bygges på tabellen |
| 0.3 | **Tester som mangler** | Enhetstester for `dispersion.ts` (hele geometrikontrakten er utestet), `aggregateSg`, `sg-gap`, `recomputeRoundSg`-presedensen; første e2e-spec for føringsflyten (`tests/e2e/runde-foring.spec.ts`) |
| 0.4 | **Bro Round→Bane** | Rundeoppsett velger bane fra biblioteket og setter `CourseDefinition.baneId`; engangs oppryddingsscript for eksisterende runder. Uten broen er all bane-statistikk tom |
| 0.5 | **Doc-rettelser** | `DATA-MODEL.md` (21 SG-felter, Shot-GPS, server actions), schema-kommentaren `lib/baneguide/shot-coords.ts` → riktig sti, ordbok-oppføringer for gameplan/baneguide, STATUS-NÅ D8-linjen (9 baner HAR geometri), slett `/dev-banekart` |

### AP1 — Føring 2.0: «kartet er skjemaet» (planens hjerte)
Mål: slag-for-slag-føring der spilleren aldri taster en avstand — i hovedflyten, ikke i legacy.

| # | Leveranse | Detalj |
|---|---|---|
| 1.1 | **Én føringsmodell** | Posisjonskjeden (`LoggetSlag`) utvides med valgfri posisjon (`startX/Y` via kjeden), target og kølle; `byggShotRader` skriver som i dag. Kølle tas i bruk i bucket-valget (`sgLob` våkner). Legacy slag-wizard fryses (vedlikehold), avvikles når 1.2 er signert — ruten blir redirect |
| 1.2 | **Kart-modus i `/runde/logg` + `/runde/live`** | Tapp/dra ballpunkt per slag på satellitt (dagens `CourseMap` + ny flyttbar slagmarkør). Kjede-regelen finnes alt: forrige slags endepunkt = neste slags startpunkt. Etter-runde-plotting er primærflyt (låst beslutning 2026-06-28); live er bonus |
| 1.3 | **Avstander avledes, aldri tastes** | `distanceToPin` beregnes med haversine fra posisjon → green/pin; `distanceHit` fra kjeden. Manuell overstyring alltid mulig (og eneste vei på baner uten geometri — aldri en sperre) |
| 1.4 | **Lie avledes fra geometri** | Punkt-i-polygon mot `Bane.geojson` (fairway/green/bunker/rough) som forslag, ett trykk å endre. Vurder `@turf/boolean-point-in-polygon` (ny dependency → spør Anders) eller egen ray-casting i `src/lib/gameplan/` |
| 1.5 | **Putt-flyt** | På green: +/−-stepper for antall putter + valgfri lengde (ALLTID ft i UI, meter internt — BUSINESS-RULES). Valgfri break-retning hvis PB6 = ja. GPS/kart brukes aldri på green |
| 1.6 | **Intensjon + mental** | Target-punkt (valgfritt, forhåndsutfylt fra Gameplan-siktet når det finnes) og mentalScore (ett trykk, valgfritt) — feltene finnes, de kobles på |
| 1.7 | **Tre nivåer, ærlig merket** | Hurtig total (teller i snitt, ingen SG) · Hull for hull (+putts/FIR/GIR → klassisk statistikk, ingen SG) · Slag for slag (full SG). Fasit-teksten i `playerhq-runde-logg.html` («Hull for hull gir SG per hull») rettes til å stemme med ærlighetsregelen |

**Design:** slag-for-slag-flyten har ingen fasit — bestilles (se §6). SG-pipelinen endres ikke
(divergensvakt-testen «kart-logget = tekst-logget» fra produktdokumentet §14.3 gjelder).

### AP2 — Baneguide MVP «Live på banen»
Kjøreplanen `docs/baneguide-kjoreplan-2026-08-02.md` gjennomføres som den står (7 økter,
felt-test som go/no-go etter økt 3, Onsøy anbefalt). Ingen duplisering her — kun to tillegg
fra UpGame-læringen:

| # | Tillegg | Detalj |
|---|---|---|
| 2.A | **Pin-justering per runde** | Spilleren kan dra pin-markøren til dagens plassering (som UpGame) — `CourseHole.pinLat/Lng` er default, justeringen bor i runde-kladden og styrer avstander. Persistert pin-historikk (`PinPosisjon`) forblir fase 3 |
| 2.B | **Gameplan-target forhåndsutfylles** | Under runde er slagets target-forslag = Gameplan-siktet for hullet (kobler FØR→UNDER, gir etterlevelses-analysen data gratis) |

**Rekkefølge-avhengighet:** AP2 økt 4 («kart-føring i runde-klienten») og AP1 1.2 er samme
byggeplass — de kjøres som ETT spor: AP1 1.1–1.3 først (etterregistrering med kart), deretter
kjøreplanens GPS/offline-økter oppå (live).

### AP3 — SG-motor 2.0: referansestige og presisjon
| # | Leveranse | Detalj |
|---|---|---|
| 3.1 | **Referansestige i DB** | Ny tabell `SgReferanse` (nivå × kategori × distansebucket × lie): `PGA_TOP40` (dagens tabeller flyttes inn), `SCRATCH` (Broadie), `AK_KATEGORI` (A–K — fasiten måler alt «mot kat. D-referansen»), `EGEN` (rullerende egen-baseline). Hcp-grupper (`BROADIE_HCP_TABLE` finnes) legges til når AK-kategoriene er kalibrert. `src/lib/domain/sg.ts` får `referanse`-parameter; default per flate defineres ETT sted |
| 3.2 | **Interpolasjon** | Lineær interpolasjon mellom bucket-grensene — fjerner trappetrinnstøyen |
| 3.3 | **Lie-justering** | CANON #8 kodes: rough/bunker-tillegg på forventet slag. `SgBaseline` (DataGolf, har lie) kan kalibrere — etter 0.2 |
| 3.4 | **SG per slag + per hull persisteres** | `Shot.sg Float?` + derivert per-hull-SG i rundedetaljen — gjør hull-analysen og «SG per hull i Analyse» (fasit-løftet) ekte. Reberegning følger `recomputeRoundSg`-reglene (manual røres aldri) |
| 3.5 | **Kalibrering AK-kategori** | Referanseverdier per kategori må settes/godkjennes av Anders (samme prosess som IUP-putt-kalibreringen). FYS-regelen gjelder: plassholder til grønt lys |

**Alle 3.x-DB-endringer er additive og forhåndsavklares med Anders (PB7).**

### AP4 — Analyse- og statistikk-flatene (SG-appen blir synlig)
| # | Leveranse | Detalj |
|---|---|---|
| 4.1 | **Lukk C5-bølgen** | De 12 kodede W2-skjermene gjennom skjermbilde-gaten (pixel-planen eier denne — ingen dobbeltføring her, men AP4 bygger oppå dem) |
| 4.2 | **Rute-sanering** | Putte-lab → `/portal/analysere/putting`, gapping → kanonisk adresse (PB9), redirects fra gamle stier. Alle dybdeflater får «‹ Analyse»-inngang |
| 4.3 | **Insights-flate** | «Sterkeste 3 / svakeste 3»-kort på Analyse-huben fra insight-engine + granulære buckets; hver innsikt peker på handling (drill/økt i Plan) — aldri diagnose alene (CANON #6) |
| 4.4 | **Ny statistikk fra kjeden** | Proximity per distansevindu (mot flagg og mot target), miss-retning, opp-og-ned/sand saves, snittscore per par-type, mental-aggregat. Nye deriveringer i `src/lib/domain/`, visning i Analysere-fanene. Alt med «—» + forklaring når data mangler |
| 4.5 | **«Min bag»** | Per-kølle-dispersion (bane-GPS + TrackMan i ETT plott, kilde-badge, ≥ 15 punkter-regel) — S3 fra produktdokumentet. Trenger fasit |
| 4.6 | **Referansevelger** | Spilleren bytter referanse (stigen fra 3.1) i Analyse; valget følger alle SG-visninger og lagres som preferanse |
| 4.7 | **DataGolf-flaten** | Bygges der PR-F lander (anbefaling: dybdefane under Analyse — «Analyse samlet»-regelen). Fasit-demonavnet rettes til navne-kanon |
| 4.8 | **Benchmark i statistikk-drilldown** | `/portal/statistikk/[metric]` bytter hardkodede «A1-proxy»-tall mot referansestigen |

### AP5 — Coach-flatene (AgencyOS)
| # | Leveranse | Detalj |
|---|---|---|
| 5.1 | Spillerens SG-bilde i stallen | Samme «én sannhet»-selector som PlayerHQ (0.1) — coach og spiller ser identiske tall |
| 5.2 | `/admin/spillere/[id]/baneguide` + dispersion | Lesevisning av gameplan/Min bag via `assertCanViewPlayerData()`; coach kommenterer, overstyrer aldri |
| 5.3 | Gameplan-etterlevelse | Rundeoppsummeringens «Planen din»-seksjon (landing↔sikte, sone-treff) — spiller først, coach-speiling etterpå |
| 5.4 | Gruppebilde WANG/GFGK | SG-trend per gruppe (PII-reglene i `.claude/rules/` gjelder — aggregater, aldri sanntidsposisjon) |

### AP6 — Tester/practice-sløyfen (avgrenset her)
Testbatteriet, TestResult→TalentHQ-sync (blokkert av 21-vs-20-avklaringen) og eventuelt
gruppe-leaderboard er **egne beslutningsløp** — planen noterer kun koblingen: putte-labens
datakrav (30 putter/3 økter) mates av både runder (AP1) og puttetester, og UpGames svakhet
(test uten kobling til plan) skal forbli vårt fortrinn.

---

## 6. Designleveranser

> **ENDRET 25.08.2026:** Nye designbestillinger for PlayerHQ/AgencyOS-flater går mot
> Train-lock-fasiten, IKKE Claude Paper-prosjektet, og monsterdokumentet er arkivert.
> Bestillingslisten under beholdes som behovsliste (HVA som må tegnes), men leveransekanalen
> avklares med Anders sammen med D3 (fasit-zip) i `docs/natt/LAUNCH-PLAN-FULL-2026-08-25.md`.

Fasit-bestillinger (opprinnelig tiltenkt Claude Paper `605a48cc`):

1. **Slag-for-slag-føring med kart** (AP1) — den viktigste: kart-skjema per slag, ballmarkør,
   target, kølle-hurtigvelger, putt-flyt. Mål for runder-listens «Før slag for slag»-knapp.
2. **Live hull-skjerm S1** (AP2) — kart + avstandskort + «Logg slag» (anatomi-skisse finnes i
   produktdokumentet §6.2).
3. **Gameplan hull-detalj/editor** (bevisst utsatt i W2 — nå trengs den: sikte/soner/kølle/plan B).
4. **«Min bag» dispersion S3** (AP4.5).
5. **`runder/ny` hurtig-skjema** (§8-mønsteret i monsterdokumentet avklares samtidig).
6. **Insights-kort på Analyse-huben** (AP4.3) — kan trolig løses med eksisterende kortmønstre.
7. **Coach-flatene** (AP5.2–5.4).

**Fasit-rettelser** (Paper vinner over dokumenter — men BUSINESS-RULES/navne-kanon vinner over
fasit for forretningsregler): SG-referansetekstene harmoniseres med referansestigen (3.1),
«Emma Nyström» → navne-kanon, runde-logg-tekstens SG-løfte (1.7). Laster/Feil-tilstander
kompletteres i W2-filene (kjent bevisst avvik).

---

## 7. Datamodell-endringer (samlet, alle additive)

| Endring | AP | Merknad |
|---|---|---|
| `GameplanHull.kolle` + `planB` | AP2 (økt 6) | Forhåndsgodkjent i kjøreplanen |
| `SgReferanse` (nivå × kategori × bucket × lie) | AP3.1 | Ny tabell; dagens hardkodede tabeller blir seed |
| `Shot.sg Float?` | AP3.4 | Per-slag-SG |
| `Round.teeFarge String?` + `CourseTee` | Fase 2/3 | Kun hvis B4 = ja |
| `PinPosisjon` | Fase 3 | Pin-historikk; per-runde-justering (2.A) trenger den ikke |
| Ev. `LoggetSlag`-schema-utvidelser | AP1.1 | Klientmodell + zod, ikke DB |

Prosess per gotcha «Schema-endringer»: modell i `schema.prisma` + kirurgisk
`CREATE TABLE IF NOT EXISTS`/`ALTER TABLE ADD COLUMN IF NOT EXISTS` via tsx mot `DIRECT_URL`.
`migrate dev`/`db push`/`migrate deploy` er alle blokkert.

---

## 8. Beslutningspunkter til Anders (samlet)

| # | Spørsmål | Anbefaling | Blokkerer |
|---|---|---|---|
| PB1 | **PR-F:** DataGolf i PlayerHQ — egen flate eller dybde under Analyse? | Dybdefane/kort under Analyse («Analyse samlet»-regelen) | AP4.7 + hele W7-stats |
| PB2 | **A3:** Analyse-huben 5 faner (kode) vs. 3 (fasit)? | Fasitens 3 + dybdelenker til TrackMan/Statistikk (behold funksjoner, færre valg) | AP4-informasjonsarkitekturen |
| PB3 | **Referansestigen:** hvilke nivåer, og hva er default per flate? | PGA Top 40 · scratch · AK-kategori · egen historikk; default = spillerens AK-kategori | AP3.1/3.5, fasit-rettelsene |
| PB4 | **Freemium:** forslaget (2026-07-31) låser SG-detalj/spredning bak PRO — står det, nå som SG-appen er kjerneproduktet? | SG-basis (total + 4 kategorier, siste 10 runder) gratis; dybde (buckets, Min bag, Insights, historikk > 30 d) PRO | Tilgangsmodellen for alt i AP4 |
| PB5 | **B1–B6** fra produktdokumentet §13 (navn Gameplan/Baneguide, GPS auto-bekreft, kart som default, CourseTee-timing, Mapbox-alert, felt-test-bane) | Som produktdokumentet anbefaler | AP2 |
| PB6 | **Putt-break-registrering** (valgfritt trykk, gir break-statistikk à la UpGame)? | Nei i første runde — ett felt mindre; revurder etter pilot | AP1.5 |
| PB7 | **DB-endringene i §7** (særlig `SgReferanse` + `Shot.sg`) | Godkjennes samlet før AP3 | AP3 |
| PB8 | **Legacy slag-wizard avvikles** når Føring 2.0 er signert (ruter → redirect)? | Ja — én føringsflyt (UpGame-import-modalen flyttes med) | AP1.1 |
| PB9 | **Kanonisk adresse** for gapping (`/portal/analysere/gapping`?) og putte-lab | Begge under `/portal/analysere/` | AP4.2 |
| PB10 | **UpGame-import som migrasjonsbro** løftes frem i onboarding for WANG-spillere? | Ja — laveste terskel for å bytte fra dagens verktøy | Ingen (ren mulighet) |

---

## 9. Rekkefølge og PR-plan

**Spor A (kode, kan starte umiddelbart):** AP0 (2–3 PR-er) → AP1 1.1–1.3 (etterregistrering med
kart, 2–3 PR-er) → felt-testens forutsetninger.
**Spor B (design, parallelt):** fasit-bestillingene §6 pkt. 1–3 → Anders leverer zip → resynk
speilet → skjerm-PR-ene.
**Spor C (beslutninger):** PB1–PB10 — PB3/PB4/PB7 trengs før AP3/AP4 kan fullføres; resten
underveis.

Deretter: AP2 (kjøreplanens økter, felt-test som go/no-go) → AP3 → AP4 → AP5. Hver skjerm-PR
måles mot ferdig-definisjonen i `docs/port/plan-designport-alle-skjermer.md` og skjermbilde-gaten;
SG-endringer måles mot divergensvakt-testen (pipeline == direkteberegning).

Grov innsats (kodeøkter à ~2 t, samme skala som kjøreplanen): AP0 ≈ 4 · AP1 ≈ 6–8 · AP2 = 7
(kjøreplanen) · AP3 ≈ 5–6 · AP4 ≈ 8–10 · AP5 ≈ 4–5. Totalt ~35–40 økter — leveres som mange små
PR-er over flere uker, aldri én stor.

---

## 10. Suksesskriterier

**Produkt:**
1. En full 18-hulls runde føres slag for slag uten at spilleren taster én avstand (AP1+AP2);
   ≤ 5 sek per logget slag; flymodus mister null slag (arves fra produktdokumentet §14).
2. SG vises mot spillerens egen referanse (AK-kategori) med eksplisitt referansetekst — en
   14-åring ser «+0,4 mot kat. D», ikke «−9,8 mot PGA».
3. Analyse-fanen svarer på «hva bør jeg trene på» uten at spilleren er analytiker (Insights →
   «Én ting nå» → Plan) — sløyfen UpGame mangler.
4. En WANG-spiller kan erstatte UpGame: føring, SG, proximity/klassisk statistikk og
   coach-innsyn dekket, med UpGame-import som bro for historikken.
5. Coach og spiller ser identiske SG-tall (én sannhet, 0.1).

**Teknisk:**
6. `npm run verify && npm test` grønn per PR; divergensvakt + kart=tekst-testen grønn;
   dispersion-motoren har enhetstester; første e2e-spec for føring kjører i CI.
7. Ingen nye dependencies uten eksplisitt godkjenning (kandidat: turf point-in-polygon i 1.4).

**Adopsjon (30 dager etter AP1+AP2 i pilot):**
8. ≥ 50 % av pilotgruppens runder føres med posisjoner; «Min bag» har ≥ 15 driverpunkter for
   pilotspillerne; Anders bruker gameplan-overlayet i én konkurranserunde og vurderer det
   konkurransedyktig.

---

*Vedlikehold: dette dokumentet er planens toppnivå. Byggedetaljer for baneguiden bor i
`docs/baneguide-produktdokument-2026-08-02.md` + `docs/baneguide-kjoreplan-2026-08-02.md`
(begge gjelder fortsatt); skjermstatus bor i `docs/port/PIXEL-PERFECT-PLAN-COMPLETE.md`;
tekniske feller i `.claude/rules/gotchas.md`. UpGame-kartleggingen med kildeliste arkiveres
sammen med planen ved behov — be om den i økten som bygger AP1.*
