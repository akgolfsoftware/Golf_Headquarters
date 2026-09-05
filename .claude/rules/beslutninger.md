# Låste beslutninger — AK Golf HQ

Gjeldende beslutninger fra Anders. Gjelder til han endrer dem. Nyeste først.

**Historikk og supersederte beslutninger:** `docs/arkiv/beslutninger-historikk.md`. Denne fila
lastes i hver eneste økt — hold den til det som gjelder NÅ. Blir en beslutning overstyrt, flytt
den til arkivet, ikke la den ligge merket «SUPERSEDERT».

**Ny beslutning registreres med `/beslutning`** — den skriver både hit OG inn i
`docs/MASTERPLAN-GJENSTAAENDE.md` som nummerert arbeid. En beslutning som bare står her, blir
aldri bygget (målt 30.08.2026: sju av ni beslutninger fra 26.–30.08 fantes ikke i planen).

> **Eierskap (Anders 2026-08-03):** `docs/platform/BUSINESS-RULES.md` eier **produkt- og
> forretningsregler** — for slike er listen under sammendrag, og ved konflikt vinner
> BUSINESS-RULES.md. Denne fila eier **arbeids- og designprosess-beslutninger**. Ikke dupliser
> regler på tvers.

> **PAPER ER FJERNET FRA HELE PLATTFORMEN (Anders 30.08.2026).** Ordrett: «Paper skal ett hundre
> prosent bort fra hele plattformen, uansett hva regler og diverse sier.» Utført samme dag:
> `designsystem/paper/`, `src/lib/v2/tokens.ts` (`T`) og alle Paper-CSS-filene slettet, `--p-*`
> erstattet med `--tl-*` i hele `src/`. Domeneverdier (pyramideakser, tee-farger, merkefarger) er
> flyttet ORDRETT til `src/lib/v2/ak-palett.ts` (`AK`) — ingen verdi endret.
> **Vakt:** `scripts/check-ingen-paper.mjs` kjører i `npm run verify`. Ikke deaktiver den uten ny
> beslutning. Paper-omtaler i eldre dokumenter er historikk, aldri byggeordre.

> ⚠ **FYS-formel + A–K-nivåtall** er ikke avklart (deltråder: onboarding steg 6 + drill-retag) —
> ikke håndhev som låst. De tre andre klyngene fra 2026-06-22 er avklart og bygget.

## Beslutningene (september 2026)

- **FORSIDETEKSTEN LÅST — SVARTIDSLØFTET VENTER PÅ JARVIS (Anders 05.09.2026, i økt):** sju
  svar på `docs/marketing/tekstplan-forside-2026-09-05.md` §2. (1) Bunnen oppgir rollene
  **«sportslig ansvarlig i Gamle Fredrikstad Golfklubb og sportssjef ved WANG Toppidrett
  Fredrikstad»** — overstyrer kitets «sportssjef i GFGK og coach ved WANG». (2) `post@akgolf.no`
  finnes og brukes. (3) **«Vi svarer innen én virkedag» loves ikke før Jarvis er i drift** —
  Anders: «Når komplette Jarvis-systemet er oppe så gjør vi det.» Gjelder alle markedsflater
  (bunn, `/kontakt`-hero, `/junior`-avslutning, e-postmalen «Påmelding åpen»), ikke bare forsiden.
  (4) «Skriftlig plan» etter kartleggingsøkta står. (5) Talleblokken «Slik leser du tallet»
  bygges med synlig «Eksempel»-merke til basen har målte tall (MASTERPLAN 0.14/0.15). (6) Køller
  til lån t.o.m. U12 stemmer. (7) Bildeteksten «Trackman står i hver økt» tas ut.
  **Kitet i masteren (`designsystem/ak-golf/ui_kits/markedsside/`) avviker på 1, 3 og 7 —
  planen vinner; masteren rettes av Anders i Claude Design, speilet redigeres ikke.**
  **Gjort 05.09:** bunnen (`MarkedFot.tsx`) rettet på 1 og 3, hero-rollene i
  `MarkedForsideReise.tsx`/`MarkedForside.tsx` rettet på 1. **Arbeidet:** MASTERPLAN 18.33 rad 1
  (teksten låst) og ny rad 18.34 (løftet inn igjen når Jarvis er i drift).

- **MARKEDSSIDENE PORTERES TIL MASTER AK GOLF — ALLE 22, FULL PORT (Anders 04.09.2026, i økt):**
  de 22 markedssidene under `src/app/(marketing)/` bygges om til AK Golf-masteren
  (`designsystem/ak-golf/`, speil av Claude Design-prosjektet `3e5c851c`): verkstedpalett, IBM
  Plex, instrumentlag og masterens komponenter. Målt 04.09 før beslutningen: **ingen** `--ak-*`
  brukt i `src/`; sidene sto på to Paper-tidens systemer (`--mk-*` i `globals.css` for forside/
  skall, `pk-*`/`--mkit-*` i `marked-kit.css` for de 21 andre). Anders valgte **full port** framfor
  rent fargebytte og framfor hybrid (fargebytte + seks sider). Omfanget er kun markedsflaten —
  alternativet «hele plattformen» ble lagt fram og avvist.
  **Utenfor:** `/stats/*` (W7, eget skall), `/booking` når åpen (Train-lock, 28.08), produktet
  (invariant 2 og «tokens aldri» 03.09 står uendret), `/team-norway/*` (Claw).
  **Lys er standard, ingen bryter** — landingssidene er låst lyse i `tema-default.ts`; mørk finnes
  i tokene (`data-ak-flate="mork"`) men kobles ikke til.
  **Overstyrer:** «Marketing/landingssider har egen fasit (ak-golf-website)» i CLAUDE.md
  invariant 2 — masteren er nå fasit for landingssidene. Rettet samme dag.
  **To ting avgjøres når Anders ser dem, ikke nå:** forsiden («Reisen» 28.08 mot kitets stillere
  forside — begge vises på preview) og `/cases` (masteren forbyr sitater/vitnesbyrd, 01.09).
  **Løkke per side:** canvas → ja → bygg → `/impeccable audit` → skjermbilde 390+1440 → merge.
  Aldri batch. Spec: `docs/superpowers/specs/2026-09-04-marked-ak-golf-port-design.md`, plan:
  `docs/superpowers/plans/2026-09-04-marked-ak-golf-port.md`.
  **Arbeidet:** `docs/MASTERPLAN-GJENSTAAENDE.md` STEG 18.33 (fundament levert 04.09, 18 sider +
  opprydding gjenstår).

- **TM-03: MODALEN BESTÅR — OG FÅR AI-VISION (Anders 03.09.2026, i økt):** svar på beslutningskø
  D4. Spørsmålet var om TrackMan-importen skulle beholde dagens 4-stegs modal
  (`src/components/shared/trackman-import-modal.tsx`, 774 linjer, fungerer) eller bygges om til
  fasitens helskjerm-tilstander C1–C4. **Svar: behold modalen** — de fire tilstandene portes inn i
  den, og det er `TM-03 Ingest-tilstander.dc.html` som justeres, ikke koden.
  **Omfanget ble utvidet i samme økt:** da det viste seg at D4 ikke var en restyle av CSV/HTML-flyten,
  men krevde en helt ny kapasitet, valgte Anders **«Bygg også bilde-avlesning (AI-vision)»** framfor
  det smale alternativet. Levert samme dag som PR
  [#768](https://github.com/akgolfsoftware/Golf_Headquarters/pull/768): ny «Foto av skjerm»-kilde i
  modalen, `src/lib/trackman/parse-photo.ts` (Claude vision via `src/lib/ai/client.ts` + zod-validering),
  HEIC/HEIF avvist client-side. **TruthLayer-kravet er bygget inn:** system-prompten forbyr å gjette
  tall — en parameter som ikke kan leses av bildet returneres som `null`, aldri som et anslag.
  Feilteksten er fasitens ordrett («Fant ingen tall. Rett på kortet. HEIC → JPG.»).
  **Bevisst ikke bygget:** fasitens C4-suksesskjerm (median-fliser, scatter-plot, Kilde/Funn-panel) —
  gjenbruker modalens generiske steg 3 og 4, samme mønster som CSV/HTML allerede bruker.
  **Krever ingen ytterligere kodeendring** — beslutningen er implementert.
  **Registrert i ettertid (03.09 kveld):** beslutningen ble tatt muntlig i økt og bygget samme dag,
  men aldri skrevet inn her — den lå kun i en øktlogg og i MASTERPLAN-raden. Fanget under
  statusgjennomgangen 03.09. Samme feilklasse som `/beslutning`-regelen er laget for å hindre, bare
  motsatt vei: her ble noe bygget uten registrert beslutning, mens D8/D9 samme døgn IKKE ble bygget
  fordi beslutningen manglet. **Arbeidet:** `docs/MASTERPLAN-GJENSTAAENDE.md` Ø27 og 1C rad D4.

- **KONTRAST-REGEL I STEDET FOR NY FASIT + TALLHERO SLUTTER Å TELLE (Anders 03.09.2026, i økt):**
  svar på beslutningskø punkt 25 og 26 (STEG 19.6/19.7), begge anbefalt vei valgt.
  1. **Kontrast i Train-lock lys modus — Vei A (regel, ingen token endres).** `check-tl-kontrast.mjs`
     fant 12 par under kravet i lys modus (verst: `ok` på scene/elev 2,2:1/2,0:1, `warn` på
     scene/elev 1,4:1/1,3:1 — krav 4,5:1/3,0:1). Disse signalfargene (`danger`/`ok`/`warn`/
     `viz-target`/`mute`/`dim`) skal aldri brukes som ren tekst på hvit/nøytral bunn — kun i
     par som allerede består (hvit tekst på fylt flate, ikon+bakgrunnsflate). **Ingen
     `--tl-*`-verdi endres** — CLAUDE.md invariant 2 og Train-lock-fasiten står uendret.
  2. **`TallHero` (`src/components/v2/core.tsx`, 13 bruksfiler) slutter å telle opp.** Fjern
     `useCountUp`-kallet i `TallHero` — målte tall vises direkte, ikke med 600ms opptelling fra
     0, jf. AK Golf-masterens prinsipp «målt tall er et faktum, ikke dramatisert»
     (§DESIGNKVALITET-beslutningen under). `useCountUp` (`src/lib/v2/hooks.ts`) har tre andre
     kallere (`KpiTile.tsx`, `MegV2.tsx`, `WorkbenchV2.tsx`) — de er IKKE del av denne
     beslutningen og røres ikke; hooken beholdes til de er vurdert separat.
  **Krever kodeendring** — ført inn som STEG 19.6/19.7 i MASTERPLAN (rader oppdatert fra
  «venter på Anders» til klar for bygging). Beslutningskø punkt 25 og 26 er lukket.

- **DESIGNKVALITET: MASTEREN ER KILDE, PRINSIPPER INN, TOKENS ALDRI (Anders 03.09.2026, i økt):**
  etter impeccable-audit av tre tilfeldige skjermer (14/12/16 av 20) spurte Claude hvilket
  designsystem som skulle brukes til å heve hele appen. Anders svarte **«Master AK Golf»** —
  Claude Design-prosjektet `3e5c851c-4b78-41ab-8ced-7b11048838f9`, speilet i `designsystem/ak-golf/`.
  **Kanalen avgjøres av masteren selv:** `guidelines/10-forbudt.md` sier «AK Golf-tokens skal
  aldri inn i en produktskjerm». Derfor tas kun *prinsippene* inn (målt kontrast, én kilde med
  vakt, redusert bevegelse uten tapt tilbakemelding, hover aldri i JavaScript, tall alltid med
  dato og kilde), aldri farge, font, radius eller avstand. **Ingen `--tl-*`-verdi endres av
  denne beslutningen** — CLAUDE.md invariant 2 står. Bygget samme dag: `scripts/design-audit.mjs`
  (mekanisk poeng per skjermfamilie), `scripts/check-tl-kontrast.mjs` (måler Train-lock, fant 12
  brudd — se beslutningskø pkt. 25) og `docs/design-audit/ak-golf-til-train-lock-bro-2026-09-03.md`.
  **Arbeidet:** `docs/MASTERPLAN-GJENSTAAENDE.md` STEG 19.

- **WANG FÅR EGET MERKEVARESYSTEM — OVERSTYRER PARAPLY-BESLUTNINGENS WANG-KLAUSUL (Anders
  02.09.2026, i økt):** under avklaring av PORTPLAN §A1.5 (gruppe-fane-arkitektur) ble
  beslutningskø punkt 22 (WANG-flatens stil) lagt frem på nytt med tre valg. Anders valgte
  **eget merkevaresystem, samme skala som Team Norway** (`designsystem/team-norway/`, Claw) —
  og bekreftet eksplisitt, da konflikten ble flagget, at dette er en bevisst omgjøring av
  31.08-vedtaket, ikke en glipp.
  **Overstyrer:** §AK GOLF BLIR PARAPLYMERKE FOR HELE KONSERNET (31.08.2026), punktet
  «Konsekvens for beslutningskøen punkt 22» — der het det at «muligheten WANG får eget
  merkevaresystem som Team Norway er UTE», og at WANG-coachingen skulle være variant
  «Organisasjon» `#4E6A7E` under paraplyen. Den klausulen er
  **[SUPERSEDERT 02.09.2026 — se dette punktet]**. Resten av paraply-beslutningen (Academy,
  Junior Academy, Mulligan, Skarpnord Golf Products som varianter; merkelaget ligger uendret
  over Train-lock; tre-systemer-konfliktregelen AK Golf → Train-lock → Claw) står ved lag —
  kun WANG er tatt ut av paraplyen igjen.
  **Ingen kode før en egen designrunde er kjørt** — samme mønster som Team Norway (Anders
  oppretter et eget Claude Design-prosjekt, master der, `designsystem/wang/` som speil i
  repoet), jf. «TEGN SKJERMEN FØR DU BYGGER DEN» (30.08.2026). Produktskjermene i
  PlayerHQ/AgencyOS/Forelder er urørt — dette gjelder kun merkelaget for WANG som ekstern
  flate/materiell, ikke Train-lock.
  **Arbeidet:** `docs/MASTERPLAN-GJENSTAAENDE.md` STEG 18.32 (ny rad), STEG 18.3 (WANG-delen
  merket supersedert), beslutningskø punkt 22 oppdatert.

- **AK-FORMEL V3 SKROTET (Anders 02.09.2026, i økt):** v3-strukturen (full datamodell
  pyramide → område → delferdighet → betinget P-posisjon-slot → motorikk/belastning/press,
  dokumentert 03.08.2026) bygges ikke. Bekreftet under avklaring av beslutningskø punkt 15,
  etter at det ble verifisert i kode at v3 aldri er implementert (0 treff på
  `PYRAMIDE_OMRADE_MOTORIKK`/tilsvarende i `src/`). Formelen består som **fri merkelapp** —
  pyramide, område, motorikk, belastning og press er vokabular appen kan vise, ikke en fast,
  håndhevet struktur. Konsistent med §ALLE TRENINGSPLANREGLER LÅST OPP (18.08.2026): å bygge
  en ny fast datamodell for formelen nå ville gått imot ånden i den opplåsingen.
  **Krever ingen kodeendring.** De 13 tidligere åpne punktene rundt v3 (innspill-
  navnekonvensjon, P-format `P1.0` vs `P1`, m.fl.) er dermed også moot.
  **Arbeidet:** `docs/MASTERPLAN-GJENSTAAENDE.md` STEG 14.3 (rettet), beslutningskø punkt 15
  lukket.

- **PLAN-FASIT, WORKBENCH-KANON OG BETALINGSTEST (Anders 02.09.2026, i økt):** tre svar som låser
  datoene i MASTERPLAN STEG 1B (veien til «FULL lanserbar», milepæl 24.09.2026).
  1. **`/portal/planlegge` porter mot `PH-07 Plan` + `PH-08 Plan tom uke`, ikke `P-05 iPhone Agenda`.**
     P-05 er UTGÅTT som fasit for Plan-skjermen: den tegner CS/M-vokabular (CS60·M3) fra før
     opplåsingen 18.08 og en annen IA (ukenavigasjon, ÅRSPLAN/MÅNED/UKE/ØKT-faner) — målt i
     sign-off-riggen 01.09 (`tests/visual/skjerm-mapping.ts`, status «ukalibrert»). Ingen omtegning.
     P-05 består kun som fasit for telefon-*Workbench* (agenda med «Start banespill»), ikke for Plan.
  2. **Coachens Workbench: WB-serien (WB-01–WB-10, «komplett Workbench» 24.08) er kanon for struktur
     og brekkpunkter; A-serien (A-01…A-18) er kun Mac-pikselfasit der WB mangler detalj.** Overstyrer
     dagens kode, som siterer A-01/A-12/A-13/A-07/A-08 som fasit (`src/components/workbench/WorkbenchUke.tsx`).
     Løser revisjonens åpne «WB- vs. A-serien»-spørsmål (01.09).
  3. **Betalingskjeden verifiseres med ekte kjøp i prod** (Anders' eget kort, 299 kr, refunderes) —
     ikke kun Stripe test-clock, som ikke dekker live-nøkler, webhook-URL og e-postkvittering. Kjøres
     som Ø2 (fredag 04.09). Målt 02.09: prod-Stripe står allerede i LIVE.
  **Arbeid:** MASTERPLAN STEG 1B Ø2, Ø4, Ø9–Ø10 (ublokkert) og STEG 1C D1/D2/D10 (svart). Ingen kode
  følger av selve beslutningen — Ø4 bytter riggens P-05-rad til PH-07, Ø9 bytter fasit-siteringene i
  `WorkbenchUke.tsx`. SCREEN-INDEX «Kjente hull» er oppdatert.

## Beslutningene (august 2026)

- **AK GOLF HØRER HJEMME I ET VERKSTED — PALETTEN LAGT OM (Anders 01.09.2026, i økt):**
  Anders presiserte hva Academy står for: **«langsiktig utvikling, oppfølging, og å trene
  optimalt og spesifikt, uavhengig av hvilket nivå golfspilleren er på.»** Den siste delen
  velter fargevalget.
  **Hvorfor de forrige forslagene bommet:** åtte palettforslag ble avvist. De første fire var
  alle mørke og premium — de sier «dette er for de seriøse». Det er stikk i strid med «uavhengig
  av nivå». De fleste golfmerker signaliserer eksklusivitet (dyp grønn, gull, marmor, seriffer)
  og sier dermed «her må du være god nok» før noen har lest et ord.
  **Valget:** av fire rom — klubbhuset, laboratoriet, verkstedet, naturen — valgte Anders
  **verkstedet**. Et sted der noe blir gjort, ikke der noen blir servert.
  **Paletten (alle kontrasttall MÅLT 01.09):**
  - Grunn **varm betonggrå `#E8E4DC`** · ark `#FFFFFF` · senket `#DDD8CE`
  - Tekst `#1F1D1A` (13,3:1) · dempet `#57534B` (6,0:1) · svak `#8B857A` (2,9:1 — **aldri
    brødtekst**)
  - **Signal `#B83217`** (4,7:1), fyll `#C4361B`, hvit tekst på fyllet (6,0:1)
  - Fag `#2C6E63` (4,7:1) — andrestemme for metoden, ikke for målingen
  - Varianttoner: Junior `#4A6B33` · Academy låner signalet · HQ `#2B5F87` ·
    Organisasjon `#4A4F58` · Products `#7A5A22`
  - Mørk variant: varm mørk grå `#22201C` — verkstedet om kvelden. **Lys er standard.**
  **REGELEN SOM BÆRER PALETTEN: rødt betyr «se her».** En måling, et tall, en handling. Aldri
  dekor, aldri stemning, aldri fem røde ting på samme flate. Mister rødt den betydningen, mister
  paletten poenget sitt.
  **Fonten:** hele **IBM Plex-familien** — Sans Condensed (overskrift), Sans (brødtekst), Mono
  (målt). Én familie, tre roller. Testet mot Archivo Narrow + Poppins: Plex Sans er tettere, og
  brødtekst som bryter til tre linjer i Poppins klarer seg på to. **Poppins og Lora er ute av
  merket.** Dette overstyrer font-delen av instrument-beslutningen samme dag.
  **Tekstkonseptet er skrevet:** `docs/merkevare/ak-golf-tekstkonsept-2026-09-01.md` +
  `designsystem/ak-golf/tekstkonsept.html` — ferdig tekst til seks markedssider, seks
  innleggstyper for sosiale medier, seks e-postmaler og seks toneregler. Ny hovedlinje:
  **«Uansett hvor du står, vet du hva du trener på.»**
  **TRACKMAN-PARAMETERE SKRIVES PÅ ENGELSK (Anders 01.09.2026):** alle TrackMan-parametere
  beholder sitt engelske navn OG skrives med **stor forbokstav overalt** — i løpende tekst, i
  tabeller, i etiketter, i dataflater. Det heter **Attack Angle**, aldri «angrepsvinkel» og aldri
  «attack angle». Samme gjelder Club Path, Face Angle, Face to Path, Dynamic Loft, Smash Factor,
  Ball Speed, Club Speed, Launch Angle, Spin Rate, Spin Axis, Carry, Total, Dispersion,
  Landing Angle, Low Point, Swing Direction. **Grunnen:** det engelske navnet ER navnet — spilleren ser det på skjermen i
  økta og i rapporten, og en norsk oversettelse skaper et andre vokabular som ingen andre bruker.
  **Slik gjøres det:** behold parameteren på engelsk med stor forbokstav, forklar hva den betyr på
  norsk i setningen etter. Norsk bruker normalt ikke versaler i substantiv — det er et bevisst
  brudd, fordi stor forbokstav viser at dette er navnet på en måling og ikke et vanlig ord. **Gjelder ikke golfspråket ellers** — kølle, sving, green, tee og
  fairway skrives på norsk som før. Full liste: `designsystem/ak-golf/guidelines/08-sprak.md`.
  Rettet fem steder i tekstkonseptet samme dag, deriblant en toneregel som sa det motsatte.

  **MERKET BRUKER IKKE VITNESBYRD (Anders 01.09.2026):** ingen spillersitater, ingen
  anmeldelser, ingen stjerner — ikke på nettsidene, ikke i sosiale medier, ikke i presentasjoner.
  Begrunnelsen er konsistens, ikke beskjedenhet: et sitat er per definisjon synsing, og et merke
  som sier «vi måler, vi synser ikke» blir svakere av å be folk om ros. **Målingen vises i
  stedet.** Konsekvens: innleggstypen «Sitat fra spiller» er byttet mot **«Slik leser du tallet»**
  (én måling forklart — fagkunnskap ingen kan kopiere uten å faktisk måle), og kravet om ett ekte
  spillersitat er **strøket** fra lanseringssperrene. Igjen står kun: fremgangstallene i
  eksemplene må erstattes med målte tall fra basen.
  **UENDRET:** instrumentlaget (rutenett, målestokk, kryss), romskalaen, radius, logoen og
  logofamilien, og at merkelaget aldri rører produktskjermene. **Train-lock og CLAUDE.md
  invariant 2 står — ingen skjerm bytter font eller farge av denne beslutningen.**

- **AK GOLF-MERKET LEGGES OM TIL INSTRUMENT-RETNINGEN (Anders 01.09.2026, i økt):**
  merkevaresystemet fra 31.08 var bygget rolig og forsiktig. Anders leverte seksten
  referansebilder; opptalt ga de tolv med rust/rød som eneste aksent, ni med enorm kondensert
  typografi, sju med synlige tekniske markører og fjorten med hard kontrast. **Bare to av sytten
  var rolige — og begge var golfklubber.** Anders valgte full omlegging.
  **Skillet som ble gjort:** referansene delte seg i «ropet» (GRO, Nike «PLAY LOUD», gym-plakater
  — energi og revet papir) og «instrumentet» (POLYMER 48, Thegrafx, Design Signals, Narka — stor
  type som bærer data, rutenett som konstruksjon). **Instrumentet ble valgt fordi ropet motsier
  løftet:** et merke som sier «vi måler, vi synser ikke» kan ikke rope.
  **Fire endringer, alle i `designsystem/ak-golf/`:**
  1. **Archivo Narrow (600/700) er ny display-font. Lora er ute.** Fortsatt tre fonter — rollen er
     byttet. Valgt fordi kondensert type får plass til flere tegn per linje på 390 px, og mobil er
     merkets viktigste flate. Testet mot Archivo, Barlow Condensed, Oswald, Saira Condensed, Chivo
     og Anton i norsk tekst. **700 er kun Archivo Narrow; Poppins går aldri over 600.**
  2. **Instrumentlaget innført** (`tokens/instrument.css`, `guidelines/11-instrumentet.md`):
     rutenett 56 px (7 × 8, samme åtte-basis som romskalaen), målestokk, kryss. Dette **besvarer
     det åpne spørsmålet** fra merkeboka om merket trenger et grafisk element utover logoen.
     **Regelen som holder det ærlig:** instrumentlaget skal aldri gi inntrykk av å vise data som
     ikke finnes — rutenett med tall på aksene er en påstand og krever målte tall med dato og
     kilde. Ingen kurver uten data, ingen akser uten enhet.
  3. **5 %-regelen for identitetsfarge er OPPHEVET.** Clay bæres nå av hele flater og dekker minst
     18 % av visningen. Består: én identitetsfarge om gangen, aldri farge alene som informasjon.
  4. **Typeskalaen utvidet til ti trinn** (opp til 112 px), display-linjeavstand 0,94.
  **UENDRET:** krem `#FAF9F5`, blekk `#141413`, clay `#D97757`, de fem identitetsfargene med sine
  målte kontrasttall, romskalaen, radius, logoen og logofamilien. **Fundamentet står — det er
  temperamentet som er lagt om.**
  **GJELDER KUN MERKET.** Produktskjermene i PlayerHQ, AgencyOS og Forelder bruker fortsatt
  Poppins gjennom Train-lock. **Ingen skjerm bytter font av denne beslutningen** — CLAUDE.md
  invariant 2 står uendret. Dette overstyrer «ingen fjerde font»-formuleringen fra 25.08 kun for
  merkelaget: Lora byttes mot Archivo Narrow, antallet er det samme.

- **LOGOEN RYDDES, TEGNES IKKE OM (Anders 31.08.2026, i økt):** ligaturen og ballen i
  `public/logos/` er uendret. Det som manglet var ikke kvalitet — filene er ekte vektor og
  skalerer rent — men **familien**. Utført samme økt, avledet fra nøyaktig samme former:
  - `ak-golf-merke-kvadrat.svg` — profilbilder, 78 % dekning, **skarpe hjørner** (plattformen
    runder selv; innebygd radius ville blitt rundet to ganger).
  - `ak-golf-favicon.svg` — 94 % dekning på krem flate. Valgt etter test av fire utkast på
    16/20/32/48/180 px mot lys, mørk og hvit fanebakgrunn. **Utslagsgivende: mørk strek på lys
    flate holder seg lesbar der lys-på-mørk tetter seg igjen.** Den lyse flaten gjør også at
    ikonet virker på en mørk fane, der en gjennomsiktig versjon ville forsvunnet.
  - `ak-golf-laas-{academy,junior-academy,hq,products,organisasjon}.svg` — logo + navn låst
    sammen, teksten konvertert til former så filene ikke krever at Poppins er installert.
  **Navnelåsen er presisert:** navnet står i **Poppins 400 i 40 % av logoens høyde**, ikke 500.
  Vekten er lettere med vilje — settes navnet tyngre, leser man navnet før merket, og da er det
  ikke lenger en lås. Organisasjonslåsen snur rekkefølgen: kunden først, «coaching ved [logo]»
  under.
  **Klaringssonen er gjort målbar:** halve logoens høyde på alle fire sider (var «høyden av
  ballen», som ikke stemte med tegningen i merkeboka). Minstemål 24 px skjerm / 12 mm trykk.
  **Gjenstår, men haster ikke:** PNG-eksporter for flater uten SVG-støtte, og Pantone/CMYK for
  clay og blekk — som skal måles mot et fysisk prøvetrykk, aldri konverteres fra RGB.

- **KARTLEGGINGSØKTA ER IKKE GRATIS — 90 MINUTTER TIL VANLIG TIMEPRIS (Anders 31.08.2026, i økt):**
  førstegangsøkta bookes som en helt vanlig time. Anbefalt lengde er **90 minutter**, og prisen er
  den ordinære timeprisen for den lengden hos den aktuelle coachen — ingen egen kartleggingspris,
  ingen rabatt, ingen gratisøkt. **Ordet «gratis» skal ut av all publikumsvendt tekst om
  kartleggingsøkt.**
  **Prisen skal ikke hardkodes i markedstekst.** `ServiceType.priceOre` i basen er eneste
  priskilde, og booking-flaten viser den. Markedssidene sier «90 minutter, til vanlig timepris»
  og lenker til `/booking`. Verifisert i basen 31.08: eneste aktive 90-minutters enkelttime er
  `anders-flex-90` (2 500 kr); Markus har ingen aktiv 90-minutters, så ett fast tall på forsiden
  ville vært feil for halve staben.
  **Utført i samme økt:** «gratis» fjernet fire steder i produksjon
  (`src/components/marketing/v2/MarkedCasesV2.tsx` ×3, `MarkedKontaktV2.tsx` ×1), 90-minutters-
  anbefalingen lagt inn i kartleggingsavsnittet på begge forsidevariantene
  (`MarkedForside.tsx`, `MarkedForsideReise.tsx`), og `[DIN PRIS] kr`-plassholderen fjernet fra
  landingsside-kanvasen (`designsystem/canvas/landingsside-akgolf/`).
  **Konsekvens:** «pris på kartleggingsøkt» var én av to ting som sperret lansering av den nye
  landingssiden. Den sperren er borte. Igjen står ett ekte spillersitat med samtykke.

- **MERKEPLATTFORMEN LÅST — JUNIOR- OG SPILLERUTVIKLING ER MÅLET, MORAD NEVNES ALDRI OFFENTLIG (Anders 31.08.2026, i økt):**
  fire svar som lukker STEG 18.1. Fullt grunnlag: `docs/merkevare/ak-golf-merkeplattform-2026-08-31.md`.

  1. **Junior- og spillerutvikling er det sentrale målet.** Primærpublikum er junioren og
     forelderen som betaler; den ambisiøse voksne følger etter med samme løfte. **Konsekvens
     som må håndteres i 18.9:** forelderen er kjøperen, ikke spilleren — tyngdepunktet i
     prisingen flyttes fra 299 kr/mnd på egen hånd til gruppeplass, semesterpris og
     foreldreportal, og foreldreflaten blir en salgsflate, ikke bare innsyn.
  2. **Løftet er godkjent:** «Du skal aldri lure på hva du skal trene på, eller hvorfor.»
     Alt markedsmateriell måles mot denne setningen.
  3. **MORAD og Mac O'Grady skal ALDRI nevnes i publikumsvendt tekst** — ikke på nettsidene,
     ikke i markedsføring, ikke i coach-biografier, ikke i onboarding. Tre brudd i produksjon
     ble rettet samme dag: `src/app/(marketing)/om-oss/page.tsx` (meta-beskrivelse),
     `src/app/(marketing)/coacher/[slug]/page.tsx` (bio) og
     `src/app/auth/onboarding/onboarding-wizard.tsx` (coach-meta). **P-posisjoner og MORAD som
     internt fagspråk i produktet består** — det er metodikk, ikke merkevarebygging. Denne
     regelen gjelder også Claude Design-kanvaser og alt nytt markedsmateriell.
  4. **Mulligan Indoor Golf knyttes IKKE direkte til AK Golf-merket.** Ingen «en del av
     AK Golf»-avsender. Anlegget beholder egen identitet og egne kunder; AK Golf **promoterer**
     Mulligan — lenker dit, anbefaler det som treningssted — men merkene blandes ikke.

  **Krever kodeendring:** kun de tre rettelsene i punkt 3, utført 31.08. Resten er føringer for
  STEG 18.3–18.10.

- **AK GOLF BLIR PARAPLYMERKE FOR HELE KONSERNET — MERKELAGET LIGGER OVER TRAIN-LOCK (Anders 31.08.2026, i økt):**
  Tre valg tatt i samme økt, som ett svar på «videreutvikle konseptet AK Golf».

  1. **Omfang: paraply over alt.** Ett AK Golf-merkevaresystem dekker hele konsernet —
     AK Golf Academy, AK Golf Junior Academy, Mulligan Indoor Golf, Skarpnord Golf Products
     og WANG-coachingen. Hver virksomhet er en **variant** under samme skjelett: egen
     identitetsfarge og tone, felles logobruk, typografi, romskala og geometri. Ikke fem
     merkevarer, og ikke ett uttrykk som viser bort forskjellene.
  2. **Merkelaget ligger OVER Train-lock — produktskjermene røres ikke.** AK Golf-systemet
     eier merket: logo, farge, typografi, tone, foto, marked og materiell. **Train-lock
     består uendret som fasit for alle skjermer i PlayerHQ, AgencyOS og Forelder**
     (CLAUDE.md invariant 2 gjelder som før). Ingen skjerm skal portes om av denne
     beslutningen, og ingen `--tl-*`-verdi endres. Merkelaget er det som ligger utenpå og
     rundt produktet, ikke inni det.
  3. **Businessplanen bygges i tre trinn, i rekkefølge:** (a) prioritering av de fem
     virksomhetene mot 500 000 USD-målet, (b) prising og pakketering, (c) formell plan for
     ekstern leser. Trinn (a) er beslutningsunderlag for Anders selv, ikke et dokument til
     andre.

  **Masteren bor i Claude Design.** Anders oppretter selv designsystem-prosjektet som er
  master for AK Golf; `designsystem/ak-golf/` i repoet er speilet koden leser — samme
  arbeidsdeling som Claw/Team Norway (`designsystem/team-norway/`, 30.08).

  **Tre systemer, én konfliktregel.** `AK Golf` (merket, alle flater) → `Train-lock`
  (produktskjermene i PlayerHQ/AgencyOS/Forelder) → `Claw` (kun `/team-norway/*`).
  Ved konflikt om en **produktskjerm** vinner Train-lock; om **merket** vinner AK Golf;
  Team Norways egne skjermer er unntatt begge og følger Claw. **Ingen skjerm har to fasiter.**

  **Konsekvens for beslutningskøen punkt 22 (WANG-flatens stil):** delvis løst. Muligheten
  «WANG får eget merkevaresystem som Team Norway» er **ute** — WANG-coachingen er en variant
  under AK Golf-paraplyen, ikke et eget merke. WANG-skjermene i produktet følger derfor
  Train-lock som N7 opprinnelig sa. Gjenstår: om dagens `src/styles/wang-tokens.css` (10
  skjermer i produksjon, enpalett lys) blir variantens identitetsfarge eller erstattes.

  **Arbeidet:** `docs/MASTERPLAN-GJENSTAAENDE.md` STEG 18.
- **ANALYSE OG DATAGOLF FOR TEAM NORWAY ER TRAIN-LOCK MED TN-SKINN, IKKE EGNE CLAW-SKJERMER
  (Anders 31.08.2026, i økt):** løser presist den uavklarte «arbeidsdelingen mot Train-lock» i
  `designsystem/team-norway/readme.md` (skrevet der som «en anbefaling som må bekreftes»), og
  presiserer N7/N12 i MASTERPLAN STEG 11.

  **Analyse** (AnalyseTerminal, SpredningsAnalyse, KohortUtvikling, ResultatVsFelt) og **DataGolf**
  (DataGolfProfil, TruthLayer) skal IKKE tegnes som egne Claw-skjermer for Team Norway. De er
  Train-lock-fasit, som resten av PlayerHQ/AgencyOS — Team Norway arver kun logo, skinnefarge
  (navy `#012B5D` / rød `#D70232`) og handlingsfarge oppå. Ingen egen tegning av selve
  analyse-/DataGolf-innholdet.

  **Begrunnelse (Anders' avveining, etter side-ved-side-sammenligning publisert som artifact
  31.08.2026):** en TN-spiller er samtidig vanlig PlayerHQ-bruker med ett DataGolf-kort/én
  analyseflate — to fasiter for samme funksjon ville gitt spilleren to ulike skjermer avhengig av
  inngang (`/portal` vs. `/team-norway`), og dobbel vedlikeholdsjobb hver gang datamodellen
  (f.eks. `hentDataGolf()`) endres. Train-lock-versjonen finnes allerede i kode og er live
  (`src/components/portal/v2/DataGolfV2.tsx`, `src/app/portal/analysere/datagolf/page.tsx`,
  levert som del av T6 16.08.2026) — «Train-lock med TN-skinn» krever ingen ny tegnejobb for
  selve innholdet, kun at organisasjonens logo/aksentfarge legges oppå.

  **Upåvirket:** de 8 TN-egne skjermene levert 31.08 (Oversikt, Fellestesting, Uttak, Rangliste,
  Skoleoversikt, Protokollbibliotek/-detalj, org-skallet) har intet PlayerHQ/AgencyOS-motstykke —
  de forblir egne Claw-tegninger, uendret av denne beslutningen.

  **Arbeid:** `docs/MASTERPLAN-GJENSTAAENDE.md` STEG 11, rad N12 (utvidet) og ny rad N12b
  (TN-skinn på Analyse/DataGolf-rutene).

- **SG-STIGEN: NORSK JUNIORSCORE KALIBRERES MOT EKTE DATAGOLF-SG (Anders 31.08.2026, i økt):**
  norsk turneringsscore skal plasseres på **samme SG-skala som proffene**, kalibrert gjennom
  spillere som faktisk har spilt begge steder — ikke gjennom en publisert tabell.
  **Overstyrer bruken av `src/lib/stats/sg-estimator.ts` som referanse:** den bygger på
  Broadie (2014) «Every Shot Counts», en hardkodet HCP-tabell med sju rader og forutsetning
  «standard PGA-bane, par 72, ~7 200 yds» (verifisert i koden 31.08). Den er et ballpark-estimat
  om en gjennomsnittlig amatør, ikke en måling av en norsk junior. Filen slettes ikke — den
  beholdes til den er erstattet, og alt den produserer merkes **estimat** (TruthLayer, PRODUKTRETNING
  pkt. 7) inntil kalibreringen er på plass.
  - **Broen finnes allerede i basen (målt 30.08):** alle **22 529 Nordic League-rader har `dg_id`**,
    og `dashboard.dg_rounds` har **komplett SG på 962 208 runder** fordelt på 21 tourer.
    Kalibreringen går derfor gjennom ekte mennesker med data på begge sider, ikke gjennom antakelser.
  - **Grunnvalutaen er feltstyrke-justert score:** spillerens til-par mot feltsnittet i samme
    turnering, lest fra `dashboard.mv_topar_grunnlag` (STEG 16.1, 123 257 rader). Dette er den
    eneste størrelsen som er sammenlignbar på tvers av bane, tee, klasse og år.
    **Plassering er fortsatt forbudt som persentil** (uendret fra DATAKARTLEGGING).
  - **Hvorfor dette er fortrinnet:** DataGolf kan kjøpes av hvem som helst og GolfBox-resultater er
    offentlige. Det ingen andre har, er at begge lagene ligger i samme base om de samme menneskene.
    Koblingen er produktet — ikke datakilden.
  - **Tre grenser som SKAL sies i UI, ikke skjules:** (a) norsk data har score, aldri SG-fordeling —
    vi kan si «hvor», aldri «hvorfor» fra en GolfBox-runde; fordelingen finnes kun for egne spillere
    (TrackMan/runderegistrering) og for proffer. (b) Jenter har ingen proffreferanse: alle 26 tourer
    i lageret er herretourer. (c) Aldersstigen gjelder fra 16 år og oppover.
  - **Tallet oppgis alltid med usikkerhet.** Ett punktestimat uten spenn er TruthLayer-brudd —
    samme grunn som opprykksanalysen ble lukket 30.08.
  - **Arbeid:** `docs/MASTERPLAN-GJENSTAAENDE.md` STEG 16.9–16.11.

- **TEAM NORWAY-SKJERMENE DESIGNES I CLAW-BRANDINGEN, IKKE TRAIN-LOCK (Anders 30.08.2026, i økt):**
  Anders leverte TN-brandingsystemet han varslet 30.08 (17.6), og valgte det som fasit for Team
  Norways egne skjermer. Fasit er Claude Design-prosjektet **«Claw Design — Team Norway Golf»**
  (`a03bf94a-c923-4c04-82ff-415773557e37`), speilet i repoet som `designsystem/team-norway/`.
  - **Verdier:** navy `#012B5D` + rød `#D70232` (begge målt fra logofilen) · Schibsted Grotesk
    (display + body) + IBM Plex Mono (alt som måles) · lys flate er standard, **mørk `#06111F` er
    en ROLLE** — hero, seksjonsskille, presentasjon — aldri et tema · radius 6/10/14/20/28/999 ·
    tre skyggenivåer · romskala 2→128 · diagonalen (56px) på hero og seksjonsskille, aldri på kort
    eller kontroller · aldri `ease-in` på grensesnitt.
  - **`--ink-400` (`#647280`) er lyseste gråtone som får bære tekst.** `--ink-300` og lysere er
    kanter og linjer. Gjelder også 9–11px etiketter.
  - **Merkevarerød er identitet, aldri status.** Logo, skinne, «denne utøveren» i data. Status
    bruker `#C2352B` sammen med grønn og ravgul. Dette er samme regel som N-D2 — de to systemene
    landet uavhengig på den.
  - **Konsekvens:** `templates/tn-workdesk/TnBatch1.dc.html` (TN-01 Hjem, TN-02 Gruppe/spillerliste,
    TN-03 Spiller-ark) er tegnet i Train-lock mørk og **skal tegnes om** i Claw-stil. Verifisert
    i prosjektet 30.08: filen bruker `#000000`, Poppins, `#8E8E93` og rail 232px.
  - **Arbeidsdelingen mot Train-lock:** Train-lock eier plattformflatene (PlayerHQ, AgencyOS,
    Forelder). Claw eier `/team-norway/*`. **Ingen skjerm har to fasiter.** Dette overstyrer
    N7-formuleringen «tegn organisasjonsflaten i Train-lock» for Team Norways del.
    **Presisert 31.08.2026** for Analyse og DataGolf spesifikt — se §ANALYSE OG DATAGOLF FOR
    TEAM NORWAY ER TRAIN-LOCK MED TN-SKINN over: de er delte plattformflater (Train-lock), ikke
    `/team-norway/*`-egne skjermer, selv om TN-menyen lenker til dem.
  - **`SKILL.md` i Claw-pakken er UTDATERT og skal ikke følges.** Den sier «ingen skygger, ingen
    piller» og oppgir Jost + Public Sans. Systemet slik det faktisk er bygget har tre skyggenivåer,
    `--radius-full` og Schibsted Grotesk. `readme.md` + `tokens/` er fasit.
  - **Uavklart, ikke antatt:** WANG-flatenes stil er IKKE avgjort av denne beslutningen. WANG har
    eget system (`src/styles/wang-tokens.css`, `.wang-tp`, enpalett lys). Se beslutningskøen.

- **TN-RØDT LÅST TIL `#D70232` (Anders 30.08.2026, i økt):** målt fra logofilen
  (`designsystem/team-norway/assets/logo/team-norway-golf-original.jpg`) — eneste verdi med
  sporbar opprinnelse i selve merket. **Overstyrer N-D2s `#D50431`**, som ikke har oppgitt kilde
  og ligger 2 % unna. Navy er `#012B5D` av samme grunn.
  De to andre verdiene som sirkulerer i `akgolfsoftware/talenthq` er **plassholdere, ikke logoen**:
  `#BA0C2F`/`#00205B` er Pantone 200/281 — det norske flaggets spesifikasjon, ordrett. `#EF2B2D`/
  `#002868` er «Old Glory Red»/«Old Glory Blue» — det amerikanske flagget. Begge SVG-ene er
  dessuten håndtegnede tilnærminger med feil strekproporsjoner.
  **Gjenstår:** ekte vektorlogo fra NGF. Dagens PNG er beskåret fra en JPEG med
  kompresjonsartefakter. Til da er den fasit.

- **TEGN SKJERMEN FØR DU BYGGER DEN (Anders 30.08.2026, i økt):** hver skjerm som skal
  bygges eller bygges om, tegnes først som en Claude Design-canvas Anders ser og godkjenner.
  Ordrett: «Dette du nå har gjort skal vi gjøre for alle skjermer videre.» Utløst av
  Kø-canvasen (MASTERPLAN 15.1) — den ble tegnet fordi det ikke fantes noen Train-lock-fasit
  for en samlet Kø-side, og Anders valgte tegning framfor at det ble bygget på gjetning.

  **Slik gjøres det, hver gang:**
  1. **Verdiene hentes fra koden, ikke fra hukommelsen** — `src/styles/train-lock-tokens.css`
     og komponenten som allerede finnes for nærmeste skjerm. Aldri en farge eller et mål
     «omtrent».
  2. **Fire visninger på en BYGGEKLAR canvas:** Mac 1440 og mobil 390, lys og mørk.
     Beslutningen 26.08 («alle skjermer skal ha lys og mørk») gjør begge obligatoriske,
     og 6.1 gjør mobil til den viktigste — Anders skanner stående på treningsfeltet.
     **Et RETNINGSUTKAST** — bredt, mange skjermer, for å velge inndeling før noe bygges —
     klarer seg med Mac, pluss mobil for skjermene Anders bruker daglig. Får utkastet ja,
     tegnes det ferdig i bygge-PR-en. Skillet er presisert 30.08.2026 og står i
     `designsystem/canvas/README.md`; uten det ville regelen stoppet bredden.
  3. **Tom tilstand tegnes på byggeklar canvas.** Det er den han møter når arbeidet er
     unnagjort.
  4. **Ekte norsk skjermtekst.** Aldri lorem ipsum. Tall som ikke er målt i basen,
     sies eksplisitt å være eksempler.
  5. **Arbeidsfilene bor i repoet**, `designsystem/canvas/<skjerm>/` — ikke i en
     scratchpad. Uten det dør tegningen ved neste `/clear` og neste økt starter på nytt.
  6. **URL-en sendes i samtalen.** Anders jobber ofte fra mobil; en filsti når ham ikke.

  **Forholdet til de to andre design-reglene:** finnes en tegnet Train-lock-fasit for
  skjermen, er den fortsatt fasit (CLAUDE.md invariant 2) — canvasen gjenskaper den i den
  sammenhengen skjermen faktisk skal stå i. Skjermbilde-gaten (04.08) gjelder uendret, men
  ETTER bygging: canvas før, skjermbilde av den kjørende appen etter. De erstatter ikke
  hverandre.

  **Konsekvens for planen:** STEG 2.6 var blokkert av «Anders + designer» fordi 38 ruter
  manglet design. Tegningen skjer nå i økten, så den blokkeringen faller bort for skjermer
  uten fasit. Se MASTERPLAN STEG 2.6 og 2.11.

- **DATAKARTLEGGING — fire svar + bindende dataregler (Anders 2026-08-30, i økt):**
  fullt grunnlag med alle måletall: `docs/beslutningsgrunnlag/datakartlegging-2026-08-30.md`.
  **Arbeidet er ført inn i `docs/MASTERPLAN-GJENSTAAENDE.md` STEG 16 — bygg derfra.**

  **Anders' fire svar:** (1) `/stats/aargang` flyttes bak innlogging — den er en åpen
  kohort-utforsker for 2000–2012, altså nøyaktig det barnevern-regelen forbyr; den slettes ikke,
  men flyttes til gratis-konto-laget. (2) **Kjønn SKAL legges til som felt** — først i
  datamodellen, så manuelt for Anders' egne spillere (WANG, GFGK, Academy), så utledning fra
  klassekode som EKSPLISITT MERKET supplement (dekker kun 26 % og gir systematisk skjevhet:
  200 jenter mot 2 066 gutter), med NGF/GolfBox som mål. Uten kjønn er enhver kullsammenligning
  villedende for halve gruppen. (3) **Fail-closed på fødselsår gjelder KUN ikke-DataGolf-spillere**
  — norske turneringsspillere må ha fødselsår OG være myndige for åpen visning; DataGolf-proffer
  er voksne på offentlige tourer og unntas. (4) **Stripe-koblingen sikres framover, historikken
  godtas** — webhooken fikses nå; de 49 betalingene før 1. sep forblir uten kobling.

  **Bindende dataregler — brytes disse, blir tallene feil:**
  - **Til-par leses fra `public_player_entries.scoreToPar`** (utfylt på 97,5 % av gyldige norske
    runder, allerede banenormalisert). **Par skal ALDRI utledes fra `public.baner` og påføres
    juniorrunder** — treffer i 39,7 %, systematisk avvik −1,02 slag fordi juniorer spiller kortere
    tee. Ville framstilt juniorer 1–7 slag dårligere.
  - **Netto-filter er en HVITLISTE av 13 faktiske nettokoder, aldri mønsteret «ender på N».**
    Mønsteret treffer også `Open` (22 529 rader), `Mann` og `A-klassen` — 26 % av tabellen.
    Klassekode finnes KUN i `dashboard.tournament_results`, ikke i `public`-tabellene appen leser.
  - **`position` skal ALDRI brukes som persentil** — det er plassering INNEN KLASSE, og 1 976 av
    2 044 norske turneringer har flere enn én på plass 1. Bruk feltstyrke-justert score.
  - **Aldersstige bygges fra 16 år og oppover** — under 16 er den ikke monoton (tee-effekt).
  - **Volumtall til NGF sies som +24,3 %** (målt på OLYO alene), ikke +54 % som flerkilde-tallet gir.
  - **Datahelse leses fra `public.agent_runs`**, ikke `dg_sync_state` (sistnevnte rapporterer 0 %
    feil og er ikke til å stole på).
  - **`mv_cohort_baselines` skal IKKE vises før den er rettet** — flerrundetotaler behandlet som
    enkeltrunder (J19 2025: snitt 155,3).
  - **Klubb og klassekode kastes i scraperen** (`src/lib/scrapers/golfbox.ts:223` parser
    `ClubName` og forkaster det). Én pipeline-endring gir både klubbdimensjonen og ekte
    brutto-garanti.

  **Ikke bygg:** plassering som persentil · par påført fra baneregisteret · aldersstige under
  16 år · sesongform som populasjonskurve · regionkart presentert som nasjonalt · banevanskelighets-
  indeks per bane · kohort-persentil til spiller/forelder/åpen flate (svar 3 i PRODUKTRETNING) ·
  odds/prognoser/fantasy. Proffreferanse for jenter er ikke mulig — alle 26 tourer i lageret er
  herretourer; det er et produktvalg, ikke en skjerm som kan bygges.

  **Opprykksanalysen — LUKKET 30.08.2026, skal ikke bygges som tall.** Etterprøvd i basen samme
  dag: valget «ett nivå eller flere per spiller-år» var ikke problemet. Juniorer forbedrer seg
  hvert år uansett nivå — opprykkere −1,64 slag, men de som ble værende −1,13 og de som rykket ned
  −1,14. Netto effekt ~0,5 slag, ikke 2, og med alder inne **skifter den fortegn** (+1,99 ved 14 år,
  −1,16 ved 18, 10–96 spillere per alderstrinn). Å publisere ett tall her ville vært TruthLayer-brudd.
  Står nå på «Ikke bygg». Ønskes den likevel: kontrollgruppe + aldersjustering + usikkerhet oppgitt.

  **Venter på Anders:** MD-fila med turneringer og lenker. Blokkerer nå KUN lenkene per turnering
  (`dashboard.tournament_links` er tom) — resten av landskapsanalysen kan bygges uten den, se
  MASTERPLAN 17.5a.
- **GRILLINGEN RUNDE 6 — Anders' arbeidsdag og AgencyOS-arkitekturen (Anders 2026-08-30, i økt):**
  ni svar som låser hva AgencyOS skal være. Fullt grunnlag med alle måletall og begrunnelser:
  `docs/beslutningsgrunnlag/grillingen-runde6-2026-08-30.md`.
  **Arbeidet er ført inn i `docs/MASTERPLAN-GJENSTAAENDE.md` STEG 15 — bygg derfra.**

  **Forbehold Anders ga:** ingenting i AgencyOS-/PlayerHQ-arkitekturen er låst — heller ikke
  railens fem punkter. Svarene er retningsgivende produktbeslutninger, ikke en fredet IA.

  1. **Mandagen begynner ikke foran en skjerm.** 08:00–10:00 trening med WANG, ettermiddag/kveld
     privattimer. Maskinen åpnes i mellomrommene. **AgencyOS' morgenflate er en mobilflate** —
     den skal kunne skannes stående på treningsfeltet, ikke være en dashboard-vegg.
  2. **Kø = alt som krever Anders i dag.** Ikke bare ja/nei-saker: e-post, SMS, forespørsler,
     tilbakemeldinger, oppfølginger og godkjenninger. Stedet han kommer à jour.
  3. **Spillerplanen er alltid kanonisk; gruppe er en planleggingsmodus.** Gruppeøkta planlegges
     i grupperegi, men lagres i hver spillers plan med alle detaljer. **Én økt kan være delt** —
     WANG 08:00–10:00 kan ha første time individuell og siste 45 min felles. Hver blokk
     spesifiserer ansvarlig trener (AK Golf Academy / Team Norway / annen WANG-trener).
  4. **Workbench åpner på spillerlisten med ukestatus** (uendret fra PRODUKTRETNING pkt. 6).
  5. **Stall-lista: navn, neste økt, siste aktivitet, én varsel-prikk.** SG-form, plan-etterlevelse,
     hcp, pakke og skyldig beløp flyttes inn i spillerkortet — de er lese-informasjon, ikke
     skanne-informasjon. Prikk: fylt = trenger deg, åpen = følg med, ingen = på planen.
  6. **Oppgaver og Kø er to ulike ting, skilt av TID.** Kø = i dag, krever meg. **Oppgaver** =
     prosjektstyring og rutiner (Notion-modellen): oppgaver knyttet til prosjekt, pluss
     gjentakende rutiner (daglig/ukentlig/månedlig) som «rydd driving range». Hver rutine merkes
     **kan automatiseres** eller **må gjøres fysisk**. `/admin/queue` (spiller-signaler) er verken
     Kø eller Oppgaver — det er oppfølging, og hører hjemme i Stall.
  7. **Jarvis forbereder alt, sender ingenting.** Gjør selv uten å spørre: sortere e-post/SMS inn
     i Kø, skrive svarutkast, foreslå økter, oppdage avvik, forberede møteunderlag, rydde data.
     **Krever ALLTID Anders' ja:** sende e-post/SMS, bekrefte booking, publisere økt til spiller,
     dele noe med forelder, og alt som koster penger. Regelen i én setning: **alt som forlater
     huset eller endrer noe for et menneske, krever ja.**
  8. **Push-varsler til coach — tre kategorier:** (a) noen venter på svar nå, (b) dagen endrer seg,
     (c) penger. **Spillerens fremgang og avvik skal IKKE pushes** — det haster aldri i minutter
     og hører hjemme i Stall.
  9. **ÉN INNGANG PER FUNKSJON.** Anders avviste kutt som mål: «målet er ikke nødvendigvis å
     kutte, men at vi har alt forenklet, slik at det ikke er fem forskjellige innganger til samme
     funksjon». **Regel: hver funksjon har nøyaktig én adresse. Det som i dag er egne sider blir
     faner eller paneler inne i den ene siden. Ingen funksjonalitet fjernes; alle gamle adresser
     blir redirects.** Konsolideringslista (42 skjermer → 10 funksjoner) og rekkefølgen står i
     MASTERPLAN STEG 15. `/admin/talent/*` er per beslutningen 26.08 uansett feilplassert —
     talent-flatene skal bo under `/innsyn`, aldri i AgencyOS-menyen.
- **GRILLINGEN RUNDE 2 — fire svar + nullstilt base (Anders 2026-08-30, i økt):**
  **Arbeidet er ført inn i MASTERPLAN: bruksmåling = STEG 16.3, foreldre-booking = STEG 9.8,
  DataGolf-attribusjon = STEG 0.9 (gjort). Nullstillingen er utført og krever ingen bygging.**
  oppfølging av 112-spørsmålsdokumentet («Grillingen», artifact `6ef6f807`). Alle
  målinger verifisert i produksjonsdatabasen 30.08.2026 før beslutning.

  1. **BRUKERBASEN ER NULLSTILT FØR LANSERING (utført 30.08.2026).** Alle brukere
     slettet unntatt Anders (`akgolfgroup@gmail.com`), Markus (`markus@akgolf.no`)
     og demo-spilleren Øyvind Rohjan (`screentest@akgolf.test`, beholdt fordi
     skjermbilde-gaten krever innlogget testbruker med data). 42 app-brukere,
     28 auth-kontoer og all eid data (runder, tester, TrackMan-økter, bookinger,
     abonnement-rader) er slettet; foreldreløse testbookinger ryddet i samme økt.
     Grunnlag: hele basen var verifisert testdata — 0 av 38 spillere innlogget
     siste døgn, 0 Stripe-abonnement, eneste spiller med treningsdata var
     demo-brukeren. Turneringsbasen (7 274 turneringer, 941 245 resultater)
     er uberørt. Konsekvens: 1. september starter med reell base = 0, og
     spørsmålet «hva skjer med eksisterende gratisbrukere» (grillingen 11.5)
     er bortfalt. Kjent skavank fra før: screentest-brukerens `authId` peker
     ikke på noen auth-konto — skjermtest-innlogging må verifiseres ved neste
     skjerm-PR.
  2. **Bruksmåling bygges nå (grillingen 1.7).** Minimal daglig aktiv-måling:
     én rad per bruker per aktiv dag (userId + dato), skrevet ved innlasting av
     `/portal`, pluss et lite kort i AgencyOS («X brukte appen i går / denne uka /
     ikke åpnet på 30 dager»). Ingen tredjepartsverktøy, ingen cookies. Motivasjon:
     aktivering og frafall må måles fra dag én av betalt drift, ikke gjettes.
  3. **DataGolf-attribusjon fikses denne uka (grillingen 9.8).** «Powered by
     Data Golf» inn på alle offentlige statistikksider (~45) og på spillerens
     DataGolf-kort. Dette er et løpende lisenskrav uavhengig av live-siden.
  4. **Foreldre skal kunne booke time for barnet (grillingen 11.2).** Full
     booking-opprettelse fra forelderportalen (ikke bare forespørsel), bygges
     etter 1. september. Forelderen er ofte den som faktisk administrerer
     juniorens timer, og booking av enkelttimer ligger i gratisnivået.

- **LIVE-SIDEN: TO-LAGS-MODELL (Anders 2026-08-30, i økt):** besvarer grillingen
  9.1, 9.2, 9.5, 9.6 og 9.7 i én beslutning.

  1. **Åpent lag (uten innlogging):** DataGolf-proffdata (alltid med «Powered by
     Data Golf»), egne spillere med aktivt samtykke, og myndige spillere. Formål:
     rekruttering og synlighet — siden skal selge gratisnivået, ikke være en
     nøytral resultattjeneste.
  2. **Barnevern-regel på ALLE åpne flater:** spillere født 2008 eller senere
     uten aktivt samtykke vises aldri offentlig; mangler fødselsår → vises ikke.
     Gjelder også de eksisterende ~45 offentlige statistikksidene, som må få
     samme filter.
  3. **Gratis konto-laget:** norske turneringer i bredden, juniorresultater og
     «følg spiller» ligger bak gratis innlogging. Registreringen er trakten mot
     299 kr/mnd, og innlogget visning til berørte (forelder/trener/spiller) er
     juridisk en tjeneste, ikke masse-republisering.
  4. **GolfBox:** offisiell avtale søkes via Anders' NGF-kontaktpunkter FØR bred
     åpen visning av GolfBox-data. Intern/innlogget bruk fortsetter som i dag.
     Begrunnelse: databasevernet beskytter GolfBox' samling selv om hvert
     resultat er offentlig, og en konflikt ville truffet Team Norway-relasjonene.
     E-postutkast til NGF: Anders ba om det senere, ikke i denne økten.
  5. **Datahygiene (grillingen 9.10) anses løst:** selvhelbredende
     turneringsstatus virker — 30.08 står 5 turneringer som pågående, ingen med
     passert sluttdato, og «AVLYST»-raden er korrekt CANCELLED.

- **FORRETNINGSMODELL: SPILLERLISENSER (Anders 2026-08-30, i økt):** binder
  sammen PlayerHQ-abonnementet og organisasjonene (WANG/Team Norway). Kjernen:
  spilleren eier profilen og abonnementet — organisasjonene betaler aldri for
  plattformen, kun for spillerlisenser.

  1. **Gratis PlayerHQ-profil** = testdata, turneringsdata og statistikk — og
     det er GRATIS å dele dette trinnet til organisasjoner. Plattformen fungerer
     dermed som kartleggingsverktøy for WANG/TN uten betalingsterskel.
  2. **FULL (299 kr/mnd)** = alle funksjoner + mulighet for komplett
     profildeling.
  3. **Deling i to trinn per organisasjon** (grillingen 7.4 avgjort): trinn 1 =
     tester + turneringer + statistikk (gratis å dele); trinn 2 = komplett
     profil — treningsplan, TrackMan, analyse, fremgang (krever FULL). Spilleren
     (forelder for mindreårige) styrer trinn per organisasjon og kan trekke når
     som helst. To brytere, aldri ti.
  4. **Team Norway-spillere har KRAV om komplett PlayerHQ (FULL).** TN eller
     WANG kan betale lisensen for spilleren — organisasjonsbetalt abonnement er
     lisensmodellen. Organisasjonene betaler aldri for Workdesk/plattform i seg
     selv.
  5. **WANG Fredrikstad er gratis** — Anders jobber der og har private spillere
     der; inkludert i kontrakten. **Alle andre WANG-skoler betaler** —
     spillerlisenser til øvrige WANG-skoler er et eget B2B-marked.
  6. TN-farge/branding: Anders lager komplett brandingsystem selv (leveres
     separat, samme dag) — TN-bølgen tegner ingenting før det foreligger.

- **INNSIKT PER SPILLER — de fire spørsmålene (Anders 2026-08-30, grillingen
  10.1):** coach-flaten Innsikt bygges for å svare på disse, i denne rekkefølgen.
  Alle fire har ferdigbygd eller eksisterende datagrunnlag.

  1. **Utvikler hen seg raskt nok?** Vekstrate år for år mot eget utgangspunkt,
     med kohortens snitt som coachens (skjulte) referanse — analysen ligger
     ferdigbygd uten skjerm.
  2. **Hvor kan hen nå?** Spillerens bane lagt oppå historiske løp («slik lå
     Hovland/Reitan da de var 17») — godkjent for spillerflaten i
     produktretning pkt. 4, bygges også i coach-visning.
  3. **Tåler hen konkurranse?** Gapet mellom turneringsscore og trenings-/
     testnivå, og om gapet øker eller minker over tid.
  4. **Riktig turneringsprogram?** Konkurransevolum og motstandsnivå målt mot
     utviklingen, koblet til A/B/C-prioriteringen som finnes i modellen.

- **TEAM NORWAY-WORKDESK — spesifikasjon (Anders 2026-08-30, i økt):**
  **Arbeidet er ført inn i `docs/MASTERPLAN-GJENSTAAENDE.md` STEG 17 — bygg derfra.** TN-siden
  utvikles til et komplett arbeidsområde som erstatter Messenger-grupper, e-post
  og Word/Excel. Bygger på org-flate-grunnmuren fra bølge N og samtykke-stakken
  (`src/lib/auth/ekstern-leser-scope.ts`).

  1. **Pilot høsten 2026:** Anders + 2–5 navngitte TN-trenere får konto, med
     tilgang kun til egne grupper; spillere inn via samtykke. Bevis på én
     samling før utrulling.
  2. **Forretningsmodell: gratis pilot 2026/27 → avtale fra 2027** hvis TN tar
     den i bruk — sies høyt fra start. NGF som referansekunde er inngangen til
     klubbmarkedet (Fredrikstad Total-sporet). PRESISERT senere samme økt:
     avtalen gjelder SPILLERLISENSER, ikke plattformleie — se blokken
     «FORRETNINGSMODELL: SPILLERLISENSER».
  3. **Dataansvar: AK Golf eier alt.** (Anders valgte bort «organisasjonen
     eier»-modellen.) Konsekvens: hver TN-spiller/forelder samtykker direkte til
     AK Golf, og GolfBox-bruken forblir AK Golfs ansvar (innlogget bruk = lav
     risiko; avtale søkes per live-siden-beslutningen). Dataansvaret må
     avtalefestes når lisensavtalen kommer i 2027.
  4. **Rekkefølge: egen TN-bølge ETTER bølge N-kjernen.** Lansering 1. sep og
     bølge N går først; denne spesifikasjonen er byggeordren for TN-bølgen.
     WANG-elevene onboardes i september uavhengig av dette (PlayerHQ, ikke
     Workdesk).
  5. **Kommunikasjon: poster, ikke chat.** Trener poster til gruppe og til
     enkeltspiller — med video, bilder, lenker og vedlegg (flybilletter,
     hotellreservasjoner o.l.). Coach jobber direkte i plattformen, aldri via
     Word-vedlegg. Ingen fri chat. 1:1-poster til mindreårige skal være
     sporbare og synlige for forelder (idrettens åpenhetsprinsipp).
  6. **Testprotokoller deles på tvers av AK Golf, WANG og Team Norway:** en ny
     protokoll (f.eks. putt- eller TrackMan-test) opprettes én gang og deles
     mellom organisasjonene. Driftsmodellen for endringer SKAL spesifiseres i
     planen (Anders eksplisitt): anbefalt løsning er versjonerte protokoller
     som låses ved første bruk — resultater peker på versjonen, endring gir ny
     versjon, eierorganisasjonen endrer, delte mottakere bruker.
  7. **«Kartlegging av spillere» = landskapsanalyse av norsk juniorgolf**, ikke
     internt register: antall Olyo Tour-/Srixon Tour-spillere per region, nivå,
     konkurranser per år, hvilke klubber som har flest spillere per klasse.
     Datagrunnlaget finnes (941k resultater + ferdigbygde klubbaggregater og
     kohortanalyser uten skjerm). Anders leverer MD-fil med alle turneringer og
     lenker som spesifikasjon — bygging venter på den.
  8. **Dokumenter: fildeling per gruppe MED lesekvittering** («12 av 14 har
     åpnet uttakskriteriene») og «sist oppdatert»-merking.

- **WANG/TEAM NORWAY — fire svar (Anders 2026-08-30, i økt):** grillingen runde 7.

  1. **WANG-elevene og GFGK-juniorene blir fulle PlayerHQ-brukere i høst (7.2):**
     foreldresamtykke først, deretter invitasjon til gratisnivået; Anders
     planlegger øktene deres i Workbench; organisasjonsflaten leser via
     samtykkemodellen. De er de første ekte brukerne, før markedsføringen starter.
  2. **«Karaktermatrisen» er Anders' egen sportslige vurdering — IKKE
     skolekarakterer (7.7).** Bygges som coach-vurdering i elevoppfølgingen.
     Heter «vurdering» i UI, aldri «karakterer». Skolens karakterer holdes helt
     utenfor appen (skolens domene).
  3. **Test-føringsskjermen bygges, med fysiske tester som primærcase (7.5):**
     på testdager føres fysiske tester i bulk — 10+ elever etter tur på samme
     øvelse (benkpress-eksempelet). Øvrige protokoller føres oftest én-til-én,
     men parallellføring skal være mulig for alle protokoller. Design: velg
     protokoll → før spiller for spiller i kø.
  4. **NGF-samarbeidet er produktleveranse, ikke rapportplikt (7.3):** ingen har
     bestilt data av Anders. Produktet lages på vegne av WANG Toppidrett og
     NGF-samarbeidet, der Anders er ressurs for begge. Ambisjonen: Team
     Norway-siden utvikles til et komplett arbeidsområde («Workdesk») — tester,
     DataGolf-integrering, GolfBox-resultater, kartlegging av spillere, grupper
     med kommunikasjon, egne tester, dokumentdeling, samlingspunkt — som
     erstatter e-post/Word/Excel. Egen grilling/spesifikasjon kjørt samme økt;
     svarene låses i egen blokk.

- **PRODUKTRETNING — åtte svar (Anders 2026-08-30, i økt):**
  **Datagrunnlaget er STEG 16; Innsikt-skjermene er N12 (STEG 11).** Grunnlaget for Innsikt
  (AgencyOS) og Analyse (PlayerHQ). Bygg mot disse, ikke mot gjetning.

  1. **Coachens hovedspørsmål er «hvor taper spilleren slag».** Innsikt bygges rundt
     slagfordeling som oversettes til trening — ikke rundt etterlevelse, ikke rundt
     rangering. De andre spørsmålene kan finnes, men de eier ikke skjermen.
  2. **Slagtapet måles mot SPILLEREN SELV over tid**, ikke mot proffnivå, ikke mot
     jevnaldrende, ikke mot coach-satte mål. «Hvor har hen blitt bedre eller
     dårligere enn seg selv.» Konsekvens: kjernen i Innsikt trenger KUN spillerens
     egne runder — den er ikke blokkert av identitetslaget.
  3. **Kohort-sammenligning er coachens verktøy alene.** Spilleren ser ikke sin
     persentil i årskullet. Foreldre og eksterne lesere ser den ikke. Anders
     formidler den muntlig når han vil.
  4. **Spillerens «hvor står jeg» = egen utvikling + egen turneringshistorikk +
     veien til de som lyktes.** Historiske baner for navngitte spillere (Hovland,
     Reitan: «slik lå de da de var 17») er GODKJENT for spillerflaten. Det er ikke
     i strid med punkt 3: å speile seg i en historisk karriere er noe annet enn å
     bli rangert mot sitt eget kull.
  5. **AgencyOS-morgenskjerm: kø øverst, dagens plan under.** Kø er handlingslista
     og hovedsaken; dagen er orientering. Avvik nås via Stall, ikke her.
  6. **Workbench åpner på spillerlisten med ukestatus** (planlagt/utkast/publisert
     per spiller), ikke på en mellomside og ikke på sist brukte spiller.
  7. **TruthLayer = målte tall, aldri synsing.** Ikke en skjerm og ikke et
     produkt: et kvalitetsprinsipp for hele plattformen. Alt appen påstår om en
     spiller skal kunne spores til en måling med **dato og kilde**, og estimerte
     tall skal merkes eksplisitt som estimat. Gjelder Innsikt, Analyse, tester,
     fys-score og alt annet som viser et tall om et menneske.
  8. **Prøveuka krever kort og bor i Stripe** (samme dag, se BUSINESS-RULES
     §Abonnement). Gratisnivået — testbatteri, DataGolf-verktøy, runde- og
     statistikkføring, booking av enkelttimer — er permanent og er
     hovedbudskapet i markedsføringen, ikke prøveperioden.

  **Rekkefølge-konsekvens:** fordi referansen er spilleren selv (punkt 2), kan
  Innsikt bygges FØR identitetslaget. Identitetslaget kreves fortsatt for punkt 4
  (spillerens egen turneringshistorikk + historiske baner) og for coachens
  kohorttall (punkt 3), men det blokkerer ikke kjernen lenger.

- **TALENTHQ AVVIKLES SOM EGET PRODUKT — ALT SAMLES I PLAYERHQ (Anders 26.08.2026,
  rest-låst 28.08):** den gamle appen (`akgolfsoftware/talenthq`, mappe
  `~/Developer/ak-golf-talenthq`) skal ikke utvikles videre. Merkenavn: alt heter
  PlayerHQ; «talent» kun som ord på skjermer. Gratis-brukeren er PlayerHQ sitt
  TALENT-nivå (`resolveTilgang`). WANG og Team Norway får **egne flater** (utvidelse
  av `/innsyn`), aldri AgencyOS-menyen. PEI = nærhet ÷ lengde, lavere er bedre.
  Pipelines bor i `akgolfsoftware/ak-golf-pipelines`. Team Norway-rød kun på logo
  og skinne (ikke som status). ~23 skjermer skal med, ikke 70. **Arkiveres ikke** før
  datahenting har kjørt grønt minst én uke fra pipeline-repoet og skjermene er inne.
  Fasit og 10-stegs rekkefølge: `natt/BOLGE-N-TALENTHQ-INN-2026-08-26.md`.
- **ALLE SKJERMER I PLAYERHQ, AGENCYOS OG FORELDER SKAL HA LYS OG MØRK MODUS
  (Anders 2026-08-26, i økt):** løser forelder-omfangsspørsmålet (T4 i AAPNE-SPORSMAAL) —
  forelder-appen er IKKE unntatt Train-lock, hele appen porter med fungerende
  lys/mørk-toggle, ikke bare ett kort. Konsekvens for T-bølgens lys-spørsmål (T-S5):
  siden bare 9 av 39 AgencyOS-skjermer med fasit har tegnet lys, er **mekanisk avledet
  lys fra `--tl-*`-tokensettet godkjent** som metode der ingen tegnet lys-fasit finnes —
  å vente på 30+ nye tegninger er ikke forenlig med kravet om lys+mørk overalt. Se
  `docs/natt/D-LYS-OG-5T-BESLUTNING.md` for grunnlaget. Denne beslutningen sier at BEGGE
  moduser må virke — den endrer ikke hvilken modus som er *default* uten cookie noe sted.
- **MØRK DEFAULT PÅ /portal OG /admin (Anders 2026-08-25, i økt):** produktflatene er
  mørke uten cookie. Train-lock er mørk-først (scene `#000000`, lys er varianten), og
  lys-defaulten fra 25.07 — begrunnet med «mørk skjerm er vanskelig å lese utendørs i
  sollys» — er nå brukerens valg via bryteren, ikke appens default. Dette besvarer åpent
  spørsmål 1 i `natt/D2-TOKENS-DONE.md`. Regelen bor i **`src/lib/v2/tema-default.ts`**
  (`onsketTema`), kalt av både rot-layout (SSR) og `V2Shell` (rute-veksling) — den var
  duplisert i to filer, som er en driftsfelle. **Uendret:** `/auth` er LYS (låst PP-A/A4
  16.08), landingssidene alltid lyse, resten mørk som før. `/forelder` er fortsatt LYS
  som default uten cookie (uendret av 26.08-beslutningen over — kun kravet om at mørk
  MÅ virke der også, er nytt). Bryteren (`ak-v2-tema`) vinner over defaulten begge veier.
  Låst av `src/lib/__tests__/tema-default.test.ts`.
- **FONT: POPPINS BEHOLDES — OGSÅ I PRODUKTET (Anders 2026-08-25, i økt):** fasitens
  «SF Pro Display/Text» tas IKKE i bruk. Poppins/Lora/IBM Plex Mono består som appens
  eneste fonter; fra Train-lock arves skala, vekter og tracking, ikke familien.
  `--tl-font-sans` → `var(--font-poppins)`, `--tl-font-mono` → `var(--font-ibm-plex-mono)`
  (`src/styles/train-lock-tokens.css`). Dette overstyrer #588-svaret «SF Pro i produktet»
  (D2-UNDERLAG §5) fra tidligere samme dag. Ikke gjeninnfør en fjerde font.
  Train-lock er eneste designfasit for hele produktet — både PlayerHQ og AgencyOS, alle
  skjermer. Claude Paper (`605a48cc` / `designsystem/paper/`) er HISTORIKK/arkiv, aldri
  bygg-fasit. Dette superseder «Design-fasit er Claude Paper 1:1» (04.08), «Design-kilde —
  PAPER VINNER ALLTID» (05.08) og look/palett-delene av PP-A (16.08) — PP-A sine
  IA-/strukturbeslutninger (A1 rail-struktur, A2 master–detalj-mønsteret, desktop=fasitens
  visning, landscape-overlay) står inntil Train-lock-fasiten sier noe annet. Skjermbilde-gaten
  (04.08) og «Enkelhet/færrest trykk» gjelder uendret. **Begge forutsetningene er levert 25.08:**
  fasiten ligger i `designsystem/train-lock/` (D3, 180 skjermer), og tokensettet i kode
  (D2, PR #586) — `src/styles/train-lock-tokens.css` + `src/lib/v2/train-lock.ts`, med kilder
  og ti åpne spørsmål i `natt/D2-TOKENS-DONE.md`. Selve skjermporten gjenstår (B8 +
  bølge T), og mørk-som-default er fortsatt uavklart (åpent spørsmål 1 der). Marketing/
  landingssider beholder egen fasit (ak-golf-website). Forelder-portalens omfang: uavklart,
  spør Anders. Konfliktregel: sier et dokument/skill noe annet enn Train-lock for
  produktflatene, vinner Train-lock — og dokumentet rettes.
- **ALLE TRENINGSPLANREGLER LÅST OPP (Anders 2026-08-18, i økt — «Ingenting skal være låst
  eller canon. Spiller står helt fritt»):** All regel-håndheving i planlegging er SLETTET fra
  koden (gren `feat/laas-opp-alle-regler`): de 9 invariantene (`src/lib/canon/` — hele mappen),
  PERIODE_CONSTRAINTS med min/maks-prosenter/volumtak/CS-tak/L-fase-fordeling,
  plan-validering av AI-forslag mot regler, junior-guard-sperren, admin-siden for
  periode-fordeling, og «CANON anbefaler»-hint. **CANON som overstyrende fasit-begrep er
  pensjonert.** Vokabularet består (pyramide, områder, motorikk/belastning/press, perioder,
  blokk-typer, kategorier) — som frie merkelapper, aldri krav. Eneste regler som gjenstår er
  tekniske forretningsregler (dobbelbooking-sperre, credits, GDPR) — de er ikke treningsregler.
  Fasit for ordforrådet: `docs/vokabular-planlegging-2026-08-18.md`. Gjeninnfør ALDRI en
  treningsregel (tak, minimum, sperre, «invariant», validering av plan mot metodikk) uten ny,
  eksplisitt beslutning fra Anders. Utgått samtidig: L-fasene (både L-CTRL/L-BALL/L-COMP og
  L_KROPP…L_AUTO som UI-begrep), CS-nivåer, M0–M5, PR1–PR5 — formelen er
  `PYRAMIDE_OMRADE_MOTORIKK_BELASTNING_PRESS` med motorikk UTEN_BALL/LAV_HAST/AUTO og press
  ALENE/OBSERVERT/KONKURRANSE/TURNERING.
- **Beslutningsgaten PP-A besvart (Anders 2026-08-16, i økt — låser pixel-portens systemfikser):**
  - **A1 · Admin-rail = FASE2-railen.** ⚠ **HELT OVERSTYRT 25.08.2026 (kveld):** railen
    følger nå **`AX-01 Skall rail og tabbar.dc.html`** i Train-lock-fasiten, ikke fase2-railen.
    **Fem destinasjoner, identisk på mobil og Mac: Stall · Workbench · Kø · Jarvis · Meg.**
    Konsoll, Økonomi og Kalender er rader under Meg, aldri faner. **Mac-rail 232 px med
    tekst** (`#1C1C1E`, aktiv = tekst `#F5F5F5` på `#2C2C2E`), ingen kollapset variant.
    De sju punktene under, og rail-en i A-/AG-skjermene (7 ikoner i 64 px), er UTDATERT.
    Fasit og begrunnelse: `docs/natt/D2-UNDERLAG-2026-08-25.md` §5.6.
    Opprinnelig tekst: Fase2-fasitenes rail (7 punkter, Cockpit/Stall/Plan…,
    fasitens casing) vinner over fase1-railen/dagens kode. Implementeres én gang i `V2Shell`
    (PP-B1) — alle admin-flater arver. Fase1-fasitenes rail-avvik er dermed avgjort, ikke en
    konflikt: admin-skjermer måles heretter mot fase2-skallet.
  - **A2 · Master–detalj = fasitens inspektørpanel.** Godkjenninger, planbibliotek og bookinger
    bygger 380px-inspektørpanelet (desktop) slik fasitene tegner det; mobil beholder
    liste→detalj. Ikke tegn fasitene om.
  - **A3 · Clay-normen bekreftet.** Clay `#D97757` KUN i «Én ting nå»-kortet + fokus-tilstander.
    Skjermens øvrige handlinger («Ny plan», «Ny booking» osv.) er ink-knapper i topplinjen.
    `enTing`-som-liste-CTA er et brudd — sweep (PP-B2) + variant-dokumentene rettes.
  - **A4 · Innlogging/auth = LYS** (Paper `#FAF9F5`, slik prod er — målt i #484).
  - **Desktop-bredde = fasitens d1280 per skjerm.** «Full bredde» betyr å bygge nøyaktig
    fasitens desktop-visning (paneler/kolonner der fasiten har det) — aldri strekke innhold
    utover det fasiten tegner, og aldri smalere enn fasiten.
  - **iPhone landscape = «Vri telefonen»-overlay.** Mobil i liggende (Safari-fane) får et
    Paper-stilet overlay; innholdet designes alltid for stående. PWA-manifestets
    `orientation: "portrait"` består (og legges også i team-wang/gfgk-manifestene).
    Overlayet treffer kun lav høyde (telefon-landscape), aldri iPad.
- **Navigasjon følger Paper: FIRE PlayerHQ-faner (Anders 2026-08-05).** «I dag · Plan ·
  Analyse · Meg» — per `fase1/KONTRAKT.md` §10. Fanen **«Gjør» utgår som egen fane**;
  gjennomføring (live-økt, runde, test) åpnes fra Hjem eller Plan, ikke fra bunn-navigasjonen.
  **IMPLEMENTERT (verifisert mot kode 17.08.2026):** `PLAYERHQ_NAV` i `src/components/v2/shell.tsx`
  har nøyaktig de fire fanene. (`PORTAL_TABS`-symbolet finnes ikke lenger.)
  Bakgrunn: navnene spriker i tre kilder (KONTRAKT §10 · fasit-HTML · `kodeordre-agencyos.md`),
  og skallet ligger på hver eneste skjerm — spriket måtte lukkes før skjerm-PR-ene kunne kjøre.
  AgencyOS-railen er nå avklart: se **A1-beslutningen 2026-08-16** øverst (fase2-railen vinner).
- **Kort-ramme (K2): golfdata-kortene er rammeløse (Anders 2026-08-05).** `Panel` eier flaten;
  kortene er innholdslag uten egen ramme. Dette er allerede byggets standard i alle 12
  golfdata-komponenter, så beslutningen bekrefter tilstanden framfor å endre den. Aldri legg
  ramme på et golfdata-kort som ligger i et Panel — det gir dobbel kant.
- **LFaseBadge tas IKKE i bruk (Anders 2026-08-05).** Den viser de 5 L-fasene, som er
  AK-formel v1. v2 (bekreftet 2026-08-03) har ikke L-faser. Appen har allerede riktig
  erstatning: de tre motorikk-stegene i `src/lib/ak-formel-visning.ts` (Vei B). Komponenten
  blir liggende ubrukt i Paper-biblioteket — ikke plasser den på noen flate.
- **AK-formel v2 — press-navnene følger Paper (Anders 2026-08-05):** `ALENE · OBSERVERT ·
  KONKURRANSE · TURNERING` (hvem som ser på), IKKE appens gamle `FRI · KRAV · UTFORDRING ·
  KONKURRANSE`. Fire nivåer begge steder, så det er ren omdøping.
  **Motorikk-stegene er allerede riktige:** Paper skriver `UTEN_BALL / LAV_HAST / AUTO`, appens
  Vei B har `UTEN_BALL / LAV_HASTIGHET / AUTO` — samme tre steg, kun `LAV_HAST`-skrivemåten
  skiller. Full v2-formel: `PYRAMIDE_OMRADE_MOTORIKK_BELASTNING_PRESS`, f.eks.
  `TEK_CHIP_LAV_HAST_TRENINGSOMRADE_ALENE` (kilde: `fase1/workbench-mobil.html`).
  Databasen beholder de finkornede enum-verdiene — `ak-formel-visning.ts` er fortsatt broen.
- **Skjermbilde-gate (Anders 2026-08-04, FAST REGEL — presisert samme dag):** ingen skjerm-PR
  i designporten merges uten at Anders har SETT skjermen. Konkret leveranse per ferdig skjerm:
  (1) faktisk skjermbilde av den kjørende appen (Vercel-preview, innlogget testbruker med ekte
  data) — **sendes direkte i samtalen** slik at det er synlig fra iPhone (Anders jobber ofte
  remote fra mobil; en GitHub-lenke alene er ikke nok), (2) mobil **390px** ALLTID (det er
  førsteinntrykket på iPhone) + desktop 1280px, (3) lys OG mørk modus (kjent felle:
  primary=accent-kollisjonen), (4) fasitens tilsvarende skjerm ved siden av. CI måler typer og
  bygg — ikke layout. Dette tetter hullet som lot PR1–PR4 passere som «ferdige».
  Ferdig-definisjonen per skjerm er denne blokken selv (§Skjermarbeid i `CLAUDE.md` finnes ikke —
  død referanse rettet 30.08.2026). Fra 30.08 gjelder i tillegg §TEGN SKJERMEN FØR DU BYGGER DEN:
  canvas godkjent FØR koding, skjermbilde-gaten ETTER.
- **Tester planlegges i Workbench, resultat synces til spillerens talentprofil
  (Anders 2026-08-04, oppdatert 28.08):** TalentHQ som eget produkt er avviklet
  (se beslutningen øverst). Når en test logges (`/portal/tren/tester/[testId]/gjennomfor`),
  skrives resultatet til `TalentTracking.testNivaaer` via `src/lib/talent/test-sync.ts` +
  `src/lib/domain/talent-sync.ts` (T4, 16.08). `/portal/talent/mitt-niva` leser feltet.
  Huben `/portal/talent` redirecter til «Mitt nivå». Workbench testbatteri-ark gjenstår
  (N8/N10 i `natt/BOLGE-N-TALENTHQ-INN-2026-08-26.md`).
  **Protokoll-avklaringen er LØST 2026-08-16 (T5):** spilleren ser 21 CANON-rader (20 protokoller;
  Putt Speed Control har to gjennomføringsvarianter) + egne tester — kodet i
  `src/lib/portal-tester/test-tilgang.ts`. **Fasit for test-gjennomføringsskjermen finnes nå**
  (`playerhq-test-gjennomfor.html`, levert 2026-08-04, viser TN Putt Gate) — men avklaringen over
  blokkerer fortsatt PR-en, se `kart/status-gjennomfore-2026-08-04.md` i Claude Design-prosjektet.
- **AI-laget samles på ÉN adresse (Anders 2026-08-04, Fase 1):** fasiten
  `agencyos-agenticos.html` bygges som ny samleflate som erstatter spredningen over
  `/admin/agent-team`, `/admin/agents`, `/admin/godkjenninger` og AI-panelet på konsollen —
  de gamle adressene blir redirects dit. Kun redesign av agent-team alene er IKKE beslutningen.
  **Status 17.08.2026:** `/admin/agenticos` er bygget; `agent-team` og `agents` redirecter.
  Gjenstår: `/admin/godkjenninger` (fortsatt egen side) og konsollens AI-panel — se
  `plan-agenticos-jarvis-2026-08-17.md`.
- **Turneringsplanlegging inn i Workbench (Anders 2026-08-04, Fase 1):** fasiten
  `workbench-turnering.html` bygges som del av `WorkbenchV2` (coach planlegger turnering samme
  sted som trening) — ikke som ombygging av `/admin/tournaments`.
- **DataGolf-skjermene skal inn i PlayerHQ (Anders 2026-08-04):** i dag ligger de under
  marketing (`/stats/*` — spillere, turneringer, sg-sammenlign, verktøy m.fl.); `/portal/stats`
  er kun en redirect ut av portalen, og `/portal/datagolf` er én enkelt side. Skjermene skal
  finnes i PlayerHQ. Omfang/plassering (egen flate vs. faner i Analyse) er ikke avgjort — legges
  inn i porteringsplanens steg 7-omfang som egen avklaring.
  **Status 17.08.2026:** første skjerm flyttet (T6, 16.08) — `/portal/analysere/datagolf` er ekte
  skjerm med SG-bro fra runder; `/portal/stats` redirecter nå inn i portalen. Resten av
  `/stats/*`-flyttingen venter fortsatt på PR-F-plasseringsbeslutningen (PORTPLAN §A1).

## Beslutningene (juni–juli 2026)
- **Invarianter er anbefalinger, aldri sperrer:** ingenting i appen blokkerer trening. Avvik fra
  plan/regel vises i klarspråk til brukeren; sterkt avvik varsler coach. Aldri skriv «kan ikke
  brytes»-kode eller -tekst.
- **App-navn:** Coach-appen heter **AgencyOS** (`/admin`). «CoachHQ» er gammelt — ikke bruk i ny UI-tekst.
- **Navne-kanon (demo):** spiller = **Øyvind Rohjan**, coach = **Anders Kristiansen** — alltid fulle
  navn, gamle demo-navn skal bort. Unntak: ekte coach **«Markus Røinås Pedersen»** på markedssidene,
  ikke bytt ham ut.
- **Enkelhet og færrest trykk (2026-07-21, fortsatt gjeldende produktprinsipp):** Behold alle
  funksjoner, men minst mulig trykk og super enkelt UI. Vanskelig å forstå = feil design
  (ikke «brukeren er dum»). Én primær CTA per skjerm; 5-sekunders-test; tom tilstand med én vei videre.
- **Planlegge → Workbench:** All planlegging går gjennom Workbench. Planlegge er **ett trykkpunkt**
  dit, ikke en meny av 6 kort. Samme i coachens spiller-Workbench.
- **Analyse samlet:** Analysere + TrackMan + Runder + SG er én flate med faner — ikke separate
  moduler. Mål bor i Oversikt, redigeres i Workbench.
- **Abonnement og tilgang (OPPDATERT 2026-08-16 — fasit er BUSINESS-RULES §Abonnement og tilgang):**
  tre tilgangsnivåer **FULL / TALENT / INGEN**, avgjort av `resolveTilgang` i `src/lib/feature-flags.ts`
  (eneste sannhetskilde). **TALENT** (gratis, utløper aldri) åpner KUN testbatteriet (CANON),
  stats-/analyse-lesing, SG-/runderegistrering, DataGolf-sammenligning, talent-flatene, booking av
  enkelttimer og konto — alt annet låst med oppgraderingsvei (fail-closed i `requirePortalUser`).
  Pris FULL: **299 kr/mnd eller 2 690 kr/år**. FULL gratis ved: 1 mnd prøveperiode, ELLER
  coaching-pakke (Performance / Performance Pro), ELLER AK-administrert gruppe, ELLER
  lanseringsvinduet til 1. sep 2026 (`gratisForAlle`). «Performance / Performance Pro» er
  **coaching-pakker** (antall økter), IKKE app-nivåer. **ELITE finnes ikke** (dødt Prisma-enum —
  vis aldri i UI). Én `Subscription`-rad per `(userId, kind)` — COACHING og PLAYERHQ kan sameksistere.
- **FYS-resultatformel avventer:** Bygg testskjermer med plassholder-tall. Ikke hardkod
  referanseverdier før Anders gir grønt lys.
- **Skjermtekst (copy-kilde):** `docs/skjermtekst/` — ekte norsk UI-tekst per hovedskjerm +
  design-brief. Kopier derfra, ikke dikt opp ny tekst.
- Aldri referer til `wireframe/`, gamle `design-package/` eller `design-files-v2/` i
  produksjonsfiler — disse er slettet fra prosjektet.
- **Skill-rensing (2026-07-19, Agentic OS):** generiske design-skills (`frontend-design`,
  `design-vendor`) er fjernet fra repoets `.claude/skills/`. **Oppdatering 2026-07-25:** også
  `ak-designekspert` og `ak-design-evolution` er fjernet — de var låst til den gamle kanonen.
  `webapp-testing` beholdes for e2e. **Delvis omgjort 02.09.2026:** `frontend-design` er lagt
  tilbake (fra anthropics/skills) som del av plugin-oppsettet i CLAUDE.md §Skill-bruk —
  brukes nå for generell designretning, men Train-lock overstyrer alltid dens konkrete valg.
  `design-vendor` er fortsatt fjernet.
