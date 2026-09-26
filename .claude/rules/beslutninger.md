# Beslutninger — AK Golf HQ

Kun det som gjelder nå. Full historikk (1 207 linjer, alle overstyrte valg): [beslutninger-full.md](../../docs/arkiv/instruks-2026-09-21/beslutninger-full.md). Gamle blokker der er historikk, aldri byggeordre.
Ny beslutning registreres med `/beslutning` (skriver hit). `docs/MASTERPLAN-GJENSTAAENDE.md` ble fjernet i b700ce008 — krever en beslutning bygging, skriver den det eksplisitt i sin egen blokk.
Produkt- og forretningsregler eies av `docs/platform/BUSINESS-RULES.md`; ved konflikt vinner den.

## FARGE BETYR AKSE, OG INGENTING ANNET (Anders 26.09.2026, bindende)

Workbench blandet svart-hvitt (årskurve, periodefelt) med sterke farger (ukefordeling, øktkort).
Anders: «den ser både svart hvit og med farger». Regelen gjelder hele Precision Athletics.

- Farge betyr alltid aksen FYS · TEK · SLAG · SPILL · TURN.
- Årskurven viser aksefordelingen per uke i aksefargene, dempet. Periodene er et tynt tekstbånd,
  ikke fylte blokker.
- Øktkort er nøytrale med aksefarget stripe på venstre kant, ikke fargede flater.
- Fremdriftsstreker er grafitt. Grønt og rødt er bare statussignal.

**Arbeidet dette utløser:** rettes i Claude Design-prosjektet `7d7c2994` i runde 5 (alle tegnede
skjermer + guidelines). I koden gjelder regelen når Workbench-skjermene porteres (AG-11, PH-11).

## «Venter på coach» er et statusord, og en test teller bare med alle slag (Anders 26.09.2026, bindende)

Avklart etter runde 3 i Precision Athletics (PH-11, PH-12, PH-15).

- **«Venter på coach»** er statusen på en plan spilleren har sendt til coach for godkjenning.
  Det står ved siden av «Venter på spiller» i `docs/ordbok.md` §5, rad Plan.
- **En test teller bare når alle slag er registrert.** Avsluttes testen før, blir det ikke noe
  resultat. PH-15 er tegnet med 10 slag. Koden gjør dette allerede for Team Norway-scorekortet:
  `saveTnTest` lagrer et `TestResult` bare når `tnValidate` godtar alle forsøk, ellers blir
  økten `ABORTED` uten resultat.

Krever ingen kodeendring — bekrefter dagens tilstand. Ordboka er rettet i samme PR. I Claude
Design-prosjektet (`7d7c2994`) fjernes merket «Uavklart — venter på Anders» på begge punktene.

## PIPELINES ER ENESTE KILDE FOR TURNERINGSRESULTATER (Anders 26.09.2026, bindende)

**`ak-golf-pipelines` er det eneste som henter inn turneringsresultater. HQ sin egen
GolfBox-skraper slutter å skrive resultater.** Anders: «Så vi ikke gjør dobbelt med arbeid i
fremtiden.» Bakgrunn: analysen 26.09 fant at to systemer skriver samme GolfBox-turnering til
`public.tournaments` med ulik nøkkel (HQ: GolfBox-RID; pipelines: internt løpenummer), og at
nivåtallene (mot feltet, slag bak vinner, justert for vanskelighet) bare finnes i pipelines'
rålager. Kilde: `docs/beslutningsgrunnlag/turneringsdata-spillerprofiler-analyse-2026-09-26.md`.

- **Resultater** (deltakelser, runder, plassering, score, nivåtall) skrives til `public.*` kun
  av `pipelines/golfbox/writers/public_db.py`, hver mandag. HQ-jobben
  `.github/workflows/scrape-golfbox.yml` (hver time 06–20 UTC, `syncGolfBoxLeaderboards`)
  skal ikke lenger skrive resultater.
- **Kalender og frister** (kommende turneringer, `entryCloses`, `registrationUrl`) beholdes i
  HQ: Vercel-cron `turneringer-ngf` (`syncGolfBoxSchedules`) og `norge-mandag-sync`. De henter
  ikke resultater i dag heller.
- **WANG-profiler vises i HQ `/team-wang`**, mot samme base. `wang-toppidrett` er et annet
  prosjekt med egen base og holdes utenfor. Anders: «WANG Toppidrett-appen er et komplett annet
  prosjekt som ikke har med WANG-skjermen i AK Golf å gjøre.»
- **«AK12»** i bestillingen 26.09 utgår — Anders vet ikke selv hva det var. Skjermlisten er
  PlayerHQ, AgencyOS, Team Norway, WANG og rangskjermene.

**Overstyrer:** «to eiere»-oppsettet fra 15.09 i `docs/turnering-datakilder.md` (HQ-cron eide rå
GolfBox-resultater) og «Kodet»-raden for GolfBox i `docs/PLATTFORM-KART.md`. Begge rettet 26.09.

**Arbeidet dette utløser** — ingen arbeidsliste finnes etter b700ce008, derfor står den her.
Rekkefølge og kontroller står i analysen §7; her er det beslutningen krever:

1. **Mål dublettene før byttet.** Spørringen i analysen §4b mot `public.tournaments`. Ferdig
   når tallet er kjent og eksisterende dubletter er slått sammen via `mergedIntoId`
   (`/admin/tournaments/dubletter`).
2. **Pipelines bruker samme nøkkel som HQ:** GolfBox-RID som `sourceId`, funn på tvers av
   opphav, i `pipelines/golfbox/writers/public_db.py` (i dag: `dashboard.tournaments.id`).
   Ferdig når spørringen i §4b gir 0 rader etter en mandagskjøring.
3. **Identitet og beregning inn i mandagsjobben:** `pipelines.identity` → `pipelines.sg` →
   `refresh_views` i `junior-tours-sync.yml`. Ferdig når `dashboard.modell_kjoring` får ny rad
   hver mandag.
4. **Pipelines dekker det HQ-skraperen dekket:** `SOURCE_TO_ORIGIN` utvides med ren «golfbox»
   (NM, senior, midam, klubb), `regions_tour` og `manual`; `tour` settes per kilde, ikke fast
   `junior-no`. Ferdig når hvert `sourceOrigin` HQ skrev i dag har en pipelines-kilde.
5. **HQ slutter å skrive resultater:** `scrape-golfbox.yml` settes til `--mode=schedule`
   (eller slås av), `syncGolfBoxLeaderboards` fjernes fra `scripts/scrape-golfbox.ts`, og
   `scripts/backfill-golfbox-results.ts` arkiveres. Skjer først når 1–4 er grønne, ikke før.
   Ferdig når ingen `public_player_entries` får `updatedAt` fra HQ etter byttet.
6. **Vakt:** HQ `sync-vaktbikkje` (mandag 08:00) varsler når pipelines' mandagskjede mangler
   eller er rød. Ferdig når simulert rød kjøring gir varsel.
7. **WANG-profil i `/team-wang`** bygges fra samme datamodul som PlayerHQ og AgencyOS
   (analysen §6 og §7 steg 6 og 10). Ingen kobling mot `wang-toppidrett`.

Uendret: `public.*` er fortsatt det appen leser; Prisma eier kolonnene, og pipelines legger
aldri til kolonner. DataGolf vises aldri for andre enn Anders.

## PRECISION ATHLETICS ER DESIGNSYSTEMET FOR AK GOLF HQ (Anders 26.09.2026, bindende)

**Claude Design-prosjektet «AK Golf Precision Athletics» (`7d7c2994-cf63-4c5f-9bdc-fdaf67655a70`)
er visuell fasit for AK Golf HQ** — PlayerHQ (`/portal`), AgencyOS (`/admin`), forelder, `/auth`,
booking og statistikk. Anders: «det designsystemet er for selve AK Golf HQ, både player og
agency OS». Det erstatter «AK Golf Design System» (`87aa23fb`) og «App design» (`830e7bce`) som
fasit. «App design» finnes ikke lenger i Claude Design (`get_project`: not found, 26.09.2026).
Team Norway og WANG er utenfor; de har egne systemer og egne arbeidsmapper.

- **Rust er signal, ikke handling.** Primærknappen er grafitt `#141413` med hvit tekst. Rust
  `#9B2415` brukes bare på det som haster eller ødelegger (sletting, trekk tilbake), Live-pillen
  og tellere som krever coachens handling — maks én per skjerm. Overstyrer «Rust følger
  handlingen, ikke ordet» (22.09).
- **Lyst tema er standard** i `/portal` og `/admin`. Nattema (`data-theme="night"`) brukes i
  Live-økt og slagregistrering ute; brukeren kan bytte tema selv. Overstyrer «Mørk er standard på
  `/portal` og `/admin`» (21.09).
- Markedssidene venter fortsatt (23.09); de beholder verksted-uttrykket til Anders sier noe annet.
- Uavklart: prosjektets `guidelines/ordmaster.md` (25.09) og `docs/ordbok.md` er to ordlister.
  Til Anders har valgt, gjelder `docs/ordbok.md` (§Treningsfag).
- Uendret: aldri sidelengs rulling, port 7 (Anders har sett skjermen), Codex bygger i appkoden.

**Arbeidet dette utløser** — ingen arbeidsliste finnes etter b700ce008, derfor står den her:

1. **Fullfør designsystemet** i `7d7c2994`: rett knapper/tema etter punktene over, legg til
   manglende komponenter (tabell som blir kortrader, ark, tidslinje, graf-grunnstykker, felt med
   feilmelding, tom/laster/feil). Fjern Toppidrett- og WANG-kitene fra prosjektet. Ferdig når
   `readme.md` og komponentkortene dekker alt skjermene under trenger.
2. **Skjermliste fra appen:** alle `page.tsx` under `/portal`, `/admin`, `/forelder`, `/auth`,
   booking og `/stats` som ikke er videresendinger, gruppert i skjermtyper. Ferdig når hver rute
   peker på én skjermtegning i prosjektet.
3. **Tegn alle skjermene** i mobil 390, iPad 768/1024 og desktop 1280/1440, lys og natt, tom,
   laster og feil. Claude Code styrer prosjektet via Chrome. Ferdig per skjerm når målingen viser
   `scrollWidth === clientWidth` i alle bredder og Anders har sett den (port 7).
4. **Temastandard i koden:** `erMorkFlate()` i `src/lib/v2/tema-default.ts` gjør `/admin` mørk
   uten lagret valg — skal bli lys. Nattema for Live-økt og slagregistrering bygges sammen med
   de skjermene.
5. **38 skjermer fra «App design» må tegnes på nytt.** Blokken «AG-03b» under viser til dem,
   men prosjektet er borte. Funksjonsfunnene i den blokken (datamodell, navnevalg, hull) står
   fortsatt; bare tegningene mangler. Dekkes av punkt 3.

Pekerne er rettet i samme PR: `design-autoritet.md`, `designsystem/README.md`, `ak-hq-design`-skillen.


## AG-03b Oppfølgingskø: «Løst» blir egen status, og designrunden for PlayerHQ/AgencyOS er ferdig (Anders 23.09.2026, bindende)

**Oppfølgingskøens «Løst»-kolonne får en eksplisitt status på saken i basen, satt av coach
med ett trykk — aldri avledet automatisk av at spilleren igjen følger planen.** Kolonnen har
stått tom siden AG-03b ble kartlagt, fordi ingen modell fanger at en sak er løst. Foreslått
til Codex: én additiv tabell `FollowUpCase` (`userId` unik, `status`:
`RISK | WATCH | CHECK | RESOLVED`, `reasonKey`, `setById`, `setAt`, `resolvedAt`,
`resolvedById`), opprettet kirurgisk med `CREATE TABLE IF NOT EXISTS` — se gotchas §Database.
Detaljer og ytterligere fjorten funn (bl.a. at dagens `Signal`-baserte tilnærming glemmer en
løst sak etter sju dager, og ikke vet hvem som satte statusen): `agencyos-handover/AG-03b-manifest.md`.

**Samtidig: designrunden startet 21.09 er nå ferdig for tre av fem områder.** PlayerHQ (18
skjermer), AgencyOS (19 skjermer) og Lag-og-skole-koblingen (LS-03 GFGK Junior) har alle
bevis for de seks første portene i `DEKNINGSREGISTER.md` (Claude Design-prosjektet
«App design», `830e7bce`) — 38 skjermer totalt. Markedsområdet (MK-01–06, ~70 ruter) er
bevisst ikke tegnet ennå (Anders 23.09: «vent med markedssidene») og blokkerer ikke
porting av de tre ferdige områdene.

**Arbeidet dette utløser** — ingen arbeidsliste finnes etter b700ce008, derfor står den her:

1. **Port 7 må gjøres først, skjerm for skjerm.** Ingen av de 38 skjermene har Anders' ja
   ennå. Gjennomgangen skjer i Claude Design-prosjektet «App design» (`830e7bce`) — mobil
   390 px og desktop, lys og mørk, tom/laster/feil. Uten dette kan Codex ikke starte porting
   av en gitt skjerm, uansett hvor ferdig designet er.
2. **Fire datamodell-tillegg må inn før tilhørende skjerm kan kobles til ekte data**
   (additive, kirurgisk `db execute`, aldri `migrate`/`db push` — se gotchas §Database):
   - `FollowUpCase`-tabellen over, for AG-03b.
   - `ExerciseDefinition`: nye felt for treningsområde, motorikk, belastning og press (AK-formel
     v2), som i dag ligger på økten, ikke på øvelsen — kreves for AG-11b.
   - GFGK Junior: `hent-gfgk-data.ts` må slå opp på kanonisk gruppe-slug fra `bootstrap.ts`,
     ikke på tekststrengen «GFGK Junior Mini U10» — ellers faller fire offentlige sider
     stille tilbake til designtekst ved en omdøping. Se `gfgk-handover/LS-03-manifest.md`.
   - Caddie-samtale: `getOrCreateActiveConversation()` har null kallere i dag, og eneste
     chat-kaller sender tom `conversationId` — uten dette kan forslagsflyten i AG-14 aldri
     lagre et utkast. Se `agencyos-handover/AG-14-manifest.md`.
3. **Fire navnevalg venter på Anders før tekst fryses i kode** — hver er én linje å rette
   når svaret foreligger:
   - «Watch»-kolonnen i AG-03b: behold engelsk, eller bytt til «Følg med»?
   - Caddie-navnet i UI: koden sier «Coach AI», «AI-coach» og «AI om {fornavn}» om hverandre
     for samme funksjon (PH-16). Ordboken sier «Caddie».
   - «Merge» (AG-04) vs. «Slå sammen» (AG-10) er samme handling med to navn og to rust-svar.
   - PS-01 (ny spillerprofil-side) overlapper med spillerkortet i AG-03s inspektør — behold
     begge og koble dem (anbefalt), eller slå sammen til én?
4. **Fire «ingen kan gjøre X»-hull må bygges sammen med skjermen, ikke bare tegnes rundt**,
   ellers ser skjermen ferdig ut uten å virke:
   - Administrator-Caddie (AG-14): fire API-ruter og seksten verktøy finnes i koden, men
     ingen side har noensinne rendret dem.
   - Øvelsesredigering (AG-11b): ingen kan i dag opprette eller endre en øvelse noe sted i
     appen, verken admin eller coach.
   - Bookingbekreftelse i AgencyOS (AG-06, eldre funn, ikke løst i denne runden): en coach
     kan ikke bekrefte eller avvise en booking noe sted i AgencyOS.
   - Utfordringer (PH-15): kodesiden er bygget (PR #948), men selve ny-skjermen fra
     tegningen er ikke portert ennå.
5. **Selve portingen:** hver av de 38 skjermene bygges fra sitt manifest
   (`playerhq-handover/`, `agencyos-handover/`, `auth-handover/`, `gfgk-handover/` i
   Claude Design-prosjektet) til ekte Next.js-kode, koblet til de delte skallmodulene som
   allerede er spesifisert (`fo-skall.js`, `ag-mobilmeny.css/.js`, `ag-hurtigknapp.css/.js`).
6. **Etter porting, før lansering:** full `npm run verify`, skjermsammenligning mot valgt
   Claude Design-versjon (`designsystem/README.md`-mønsteret), og Stripe-live/røyktest
   sist, som BUSINESS-RULES krever.

## Utfordringer skal leve (Anders 22.09.2026, bindende)

**Utfordringsfunksjonen beholdes og bygges ferdig.** I dag er den død: `opprettUtfordring`
i `src/app/portal/(legacy)/utfordringer/actions.ts` er ferdig skrevet med revisjonsspor og
automatisk deltakelse for eier, men **har ingen kallere** — `/portal/utfordringer/ny` er en
videresending rett tilbake til lista. Ingen kan opprette en utfordring, og finnes det ingen
utfordringer, er hele flaten tom.

- **Deltakere velges fra venner og gruppa, aldri ved delt lenke.** Du huker av hvem som skal
  få utfordringen, og de får varsel i appen. Kilder: `Friendship` med `status = "ACCEPTED"`,
  og `GroupMember` med `endedAt: null` i gruppene du selv er med i. En coach kan i tillegg
  velge fra stallen sin. **Ingen lenke som åpner en utfordring for hvem som helst** — de
  fleste deltakerne er mindreårige, og en delbar lenke omgår samtykket.
- **Scoren får en retning.** `reberegnRanger` sorterer i dag alltid synkende, og skjemaet sier
  «Høyere er bedre». Det gjør «færrest putter» og «kortest samlet avstand» umulig å rangere
  riktig. `DrillChallenge` trenger et felt som sier om høyest eller lavest vinner, satt når
  utfordringen lages.
- **«Opprett utfordring» bærer rust.** Handlingen forplikter: den lager noe andre blir med i
  og rangert i, på linje med Publiser og Send. Dette er en anvendelse av
  §Rust følger handlingen, ikke ordet — ikke et unntak fra den. **Avslutt utfordring er
  grafitt** i et kort med rustkant, som alle avslutninger.
- **En avsluttet utfordring heter «Avsluttet», ikke «Fullført».** Den er avsluttet av eieren;
  den er ikke nødvendigvis fullført av deg.
- **Utfordringer teller ikke som trening.** De går ikke inn i planen, ikke i analysene og ikke
  til coachen. Registrert score lever bare i utfordringen.

Tegningen er PH-15 i Claude Design-prosjektet «App design» (`830e7bce`), med manifest i
`playerhq-handover/PH-15-manifest.md`. Port 7 gjenstår.

**Arbeidet dette utløser** — ingen arbeidsliste finnes etter b700ce008, derfor står den her:

1. **Bygg `/portal/utfordringer/ny` som ekte skjerm** og kall `opprettUtfordring`. Fjern
   videresendingen i `src/app/portal/(legacy)/utfordringer/ny/page.tsx`. Ferdig når en spiller
   kan lage en utfordring og lande på detaljen for den, som deltaker.
2. **Legg til deltakervelgeren** i ny-skjermen: venner (`Friendship` ACCEPTED) og medlemmer av
   egne grupper (`GroupMember`, `endedAt: null`), med varsel via `notify()` til hver valgt.
   Coach ser i tillegg stallen sin. Ferdig når ingen kan bli med uten å ha blitt valgt.
3. **Gi scoren en retning** i `DrillChallenge` (additiv kolonne via `db execute`, se
   gotchas §Database), og la `reberegnRanger` sortere etter den. Ferdig når en utfordring der
   lavest vinner får riktig resultatliste.
4. **Legg en inngang fra Meg.** `/portal/utfordringer` har tilbakelenke til `/portal/meg`, men
   ingenting i Meg lenker dit — eneste veier inn er Cmd+K og `/portal/utenfor-banen`.
5. **Rett språket:** «Fullført» → «Avsluttet» i `UtfordringerV2` og `UtfordringDetaljV2`;
   manglende plassering vises som tankestrek, ikke bindestrek; fjern «Del utfordringen og
   inviter andre til å bli med» fra tomteksten, som lover noe som ikke finnes.
6. **Notatfeltet over flere linjer.** Et notat på to setninger kan i dag skrives, men ikke
   leses tilbake — feltet er enlinjes og ruller sitt eget innhold.

Port 7 (Anders har sett skjermen) gjelder som for alle andre skjermer.

## TEAM NORWAY-APPEN BYTTER DESIGNSPRÅK (Anders 22.09.2026, bindende)

**Det skarpe Team Norway-språket eier `/team-norway/*`. Claw er utgående for appen.** Fasit blir et nytt Claude Design-prosjekt «Team Norway App», avledet av «Team Norway Golf Design System» (`3416f258`): Jost display, Lato brødtekst, IBM Plex Mono på tall, hjørner 0 · 2 · 4, ingen skygger, ingen sirkler, kvadratisk avatar, lukket ikonsett på 20.

- **Rød er `#D70232`** — målt fra logofilen. Kommunikasjonssystemets `#d40e3a` gjelder ikke i appen og rettes ved avledningen. Navy `#012B5D` er uendret i begge.
- **Sidemenyen er full navy `#012B5D`**, hvit tekst, lysere navy bak aktiv rad, rød markør. Den bor bare i `TnShell`/`TnRail` — aldri bygget på nytt per side.
- «Team Norway Golf Design System» beholder kommunikasjonsflatene (brev, e-post, plakat, presentasjon, rapport, sosiale). App-UI hører ikke hjemme der; dets egen beslutningslogg forbyr det.
- Claw (`a03bf94a`) og speilet `designsystem/team-norway/` er funksjonsinventar og historikk for appen, ikke visuell fasit. Spør ikke om dette på nytt.

**Overstyrer:** «Team Norway: eget Claw-system» under §Merke og tekst, og `designsystem/team-norway/LES-MEG.md` §Myndighet. Rødverdien er uendret fra 30.08.2026.

**Arbeidet dette utløser** — ingen arbeidsliste finnes etter b700ce008, derfor står den her:

1. Nytt prosjekt «Team Norway App»: tokens avledet av `3416f258` med rød rettet, skall TN-01 med navy sidemeny, mobil 390 px.
2. De fire internskjermene (Venter på meg, Analyse, Lisens og økonomi, Organisasjonsoppsett) tegnes om mot skallet — tokens i stedet for ~150 hardkodede farger, responsiv i stedet for fast 1440 px, menypunkter som matcher `tnHovedmeny`.
3. `src/styles/team-norway-tokens.css`: skrifter, hjørner, skygger, farger. Jost og Lato lastes i `src/app/team-norway/layout.tsx` i stedet for Schibsted Grotesk.
4. `src/components/team-norway/core.tsx`: de 18 `radius.full`-formene blir firkantede, avataren kvadratisk, `TnRail` navy.
5. Fem skjermer bygger skallet for hånd og spriker — `/team-norway`, `[groupId]`, `[groupId]/dokumenter`, `spiller/[spillerId]`, `tilgang`: to organisasjonsnavn, fire undertitler, tre innholdsbredder. Alle over på `TnShell`.
6. Maskinell måling av alle 21 TN-ruter i 390 px og desktop, tom/laster/feil: ingen sidelengs rulling, ingen node utenfor rammen, treffmål minst 44 px, kontrast godkjent på navy.
7. Rett `designsystem/team-norway/LES-MEG.md` og `ak-merkevare`-skillen — begge peker i dag på Claw for TN.

Ferdig skjerm krever fortsatt at Anders har sett den (port 7).

## AK-stigen har fire trinn, og Knøtt får egen gruppe (Anders 22.09.2026, bindende)

**Knøtt (11–12 år) er ikke et trinn i AK-stigen.** Stigen er Mini → Basis → Utvikling →
Elite. Aldersgruppen skal likevel ha sin egen gruppe, og den gruppen hører hjemme **ved siden
av stigen** — sammen med WANG Toppidrett — ikke som et hull i den.

**Rollen ASSISTANT heter «Assist Coach» på skjerm.** Tidligere sto det «Hjelpecoach» og
«Hjelpetrener» om hverandre i koden. Coach heter «Coach», spiller heter «Spiller».

Gjennomført i denne beslutningen: `AK_STIGEN_TRINN` har fire trinn, `vedSidenAv` erstatter
`overStigen` (liste, ikke ett felt), og rolleordene i `GruppeDetaljV2` er rettet. Tegningen er
AG-03c i Claude Design-prosjektet «App design».

**Gjenstår:** gruppen «GFGK Junior Knøtt U12» finnes ikke i basen ennå. Den må opprettes —
enten manuelt, eller ved at den legges inn i `GFGK_BOOTSTRAP_GRUPPER` med egen kanonisk slug.
Uavklart: om den offentlige juniorsiden (`/junior`), som i dag beskriver **fem** trinn med
Knøtt som det andre, skal skrives om. Den endrer publisert markedstekst og venter på Anders.

## Design (Anders 21.09.2026, bindende)

**Designsystemet er «AK Golf Precision Athletics» — se §PRECISION ATHLETICS øverst.** Train-lock og Paper er utgående: ingen visuell fasit, bare funksjonsinventar. Spør aldri på nytt om dette. Kilde og ID-er: [design-autoritet.md](../../docs/design-system/design-autoritet.md).
- Kode med Train-lock-/Paper-/`v2`-navn beholdes til funksjonene er flyttet. Navnene gir ingen autoritet.
- Claude Code/Design eier designet; Codex bygger det i appkoden.
- Konkret skjermvariant innen systemet kan Anders fortsatt velge før bygging.
- Ferdig skjerm = funksjonen virker og Anders har sett den (mobil 390 px + desktop, lys og mørk, tom/laster/feil).
- Paper er fjernet fra plattformen; vakten `scripts/check-ingen-paper.mjs` kjører i `npm run verify`.
- Ingen `className="dark"`; tema styres bare av `data-v2-tema` på `<html>`. Lys er standard overalt; natt i Live-økt og slagregistrering (`src/lib/v2/tema-default.ts`, se §PRECISION ATHLETICS punkt 4).
- Ikke bruk `accent` som tekstfarge på `primary`; bruk `-foreground`-paret.

## Aldri sidelengs rulling (Anders 22.09.2026, bindende)

Ingen skjerm, flate, rad, liste eller egen struktur skal kreve at brukeren drar skjermen
sidelengs. Gjelder alle områder (`/portal`, `/admin`, `/forelder`, marked, `/auth`, WANG,
Team Norway), alle bredder og alle tilstander — også piller, faner, tabeller, kortrader og
verktøyrader vi bygger selv.

- Løsningen er ombrekking (`flex-wrap`), stabling, kortere kolonner eller oppdeling.
  Aldri `overflow-x:auto` på en rad brukeren må se hele.
- Flex- og grid-beholdere med tekst som ikke brytes MÅ ha `minWidth: 0` (se gotchas §UI).
- Kontrolleres maskinelt per skjerm i begge bredder og hver tilstand: ingen node utenfor
  rammen, og `scrollWidth === clientWidth`. Bevis føres i skjermens manifest, port 4.
- Trengs sidelengs rulling likevel, er det et avvik som legges fram for Anders før det
  bygges — ikke et valg som tas underveis.

## Hurtigknappen gjelder alle AgencyOS-skjermer (Anders 22.09.2026, bindende)

Den flyttbare svarte hurtigknappen skal finnes på **alle skjermer i AgencyOS**, ikke bare Hjem.
Fire hurtighandlinger: ny økt i Workbench · ny melding til spiller · registrer runde · spør
Jarvis.

- Den bor i **én delt modul**, ikke som kopiert kode per skjerm: i designprosjektet
  `agencyos-handover/ag-hurtigknapp.css` og `.js`. Bygges den i appen, skal den være én
  komponent brukt av skallet — ikke én per side.
- Faste regler: 56 × 56 px grafitt, radius 2 · kan dras hvor som helst og klemmes 8 px fra
  hver kant · drag åpner ikke menyen (under fem piksler er et trykk) · menyen snur når den
  ellers ville gått utenfor flaten.
- **Ikke avklart: om den også gjelder PlayerHQ.** Legg den ikke på spillerflaten før Anders
  har sagt det.

Byggeoppgave når AgencyOS-skallet bygges: knappen hører til skallet (`src/components/v2/shell.tsx`),
ikke til den enkelte siden. Ferdig når den står på hver `/admin`-side, husker posisjonen sin,
og ikke kan dras ut av syne.

## Treningsfag

- Ingen treningsregel er låst: ingen invarianter, tak, minimum eller plan-validering mot metodikk (18.08). Vokabularet består som frie merkelapper. Gjeninnfør aldri en regel uten ny beslutning.
- AK-formel v2: `PYRAMIDE_OMRADE_MOTORIKK_BELASTNING_PRESS`. Motorikk UTEN_BALL/LAV_HAST/AUTO, press ALENE/OBSERVERT/KONKURRANSE/TURNERING. L-faser, CS, M0–M5 og PR1–PR5 er utgått. v3 er skrotet.
- Ordbok: `docs/ordbok.md` (erstatter `ordbok-master-trening.md`; `docs/ordbok.json` genereres).
- TrackMan-parametere på engelsk med stor forbokstav (Attack Angle, Club Path, Smash Factor).
- Valgtreet fra årsplan til øvelse (åtte trinn) eies av `docs/treningsplanlegging-og-sprak-gjennomgang.md` (22.09). Puttingavstand i fot, meter kan vises i parentes. Måleutstyr er en fast liste (TrackMan og annen radar). Teknisk fokus per område er eget felt på oppgaven i teknisk plan.
- Tester planlegges i Workbench; resultat synkes til talentprofilen.

## Workbench

- Spillerens `WorkbenchV2` er den ene motoren; coach får samme komponent med stall-velger og gruppe-modus. `WorkbenchUke` bygges ikke videre.
- `WorkbenchSession` er den ene økt-tabellen (OW-3).
- Ny uke starter aldri tom: «kopier forrige uke» er standard.
- Flytting av økt skal være ekte dra-og-slipp, også på mobil (17.09).

## Produkt og tilgang

- Nivåer FULL / TALENT / INGEN, avgjort av `resolveTilgang` i `src/lib/feature-flags.ts`. FULL: 299 kr/mnd eller 2 690 kr/år. ELITE finnes ikke. Detaljer: BUSINESS-RULES §Abonnement.
- PlayerHQ har fire faner: I dag · Plan · Analyse · Meg. Coach-menyen følger prototypen fra 02.09 (Cockpit, Innboks, Stall, Kalender, Workbench + Mer).
- Én inngang per funksjon: én adresse, gamle adresser blir redirects, ingenting fjernes.
- Coachflaten kalles AgencyOS (`/admin`), aldri CoachHQ. Demo: spiller Øyvind Rohjan, coach Anders Kristiansen.
- Jarvis forbereder alt og sender ingenting. Alt som forlater huset eller endrer noe for et menneske krever Anders' ja.
- Forelderen er kjøperen for juniorer; forelder kan booke for barnet.
- Stripe-live og ekte kjøp verifiseres sist, rett før røyktesten.

## Merke og tekst

- MORAD og Mac O'Grady nevnes aldri offentlig. P-posisjoner som internt fagspråk består.
- Ingen vitnesbyrd, sitater eller stjerner. Vis målingen.
- Kartleggingsøkt er ikke gratis: 90 min til vanlig timepris. Prisen leses fra `ServiceType.priceOre`, aldri hardkodet.
- Mulligan knyttes ikke direkte til AK Golf-merket; AK Golf promoterer bare.
- Ingen «Vi svarer innen én virkedag» før Jarvis er i drift.
- Team Norway: eget system, rød `#D70232`, navy `#012B5D`, kun for `/team-norway/*` — visuell fasit er §TEAM NORWAY-APPEN BYTTER DESIGNSPRÅK, ikke Claw. Analyse og DataGolf for TN er delte plattformflater.
- WANG har eget system (`src/styles/wang-tokens.css`). Junior Academy og GFGK Junior er ulike ting.

## Data (brytes disse, blir tallene feil)

- Kun brutto. Netto filtreres med hviteliste av faktiske nettokoder, aldri «ender på N».
- Til-par fra `public_player_entries.scoreToPar`; par utledes aldri fra baneregisteret.
- `position` er aldri persentil. Aldersstige bare fra 16 år.
- Barnevern: spillere født 2008 eller senere uten samtykke vises aldri åpent; manglende fødselsår vises ikke.
- Alt appen sier om en spiller skal ha måling, dato og kilde (TruthLayer); estimat merkes.
- Kohortsammenligning er kun coachens verktøy. «Powered by Data Golf» på alle offentlige statistikkflater.
- Økonomitall leses fra Tripletex-eksport, aldri estimert.

## Åpent (ikke besluttet, ikke bygg som fasit)

- FYS-formel og A–K-nivåtall. Dosefelter på `WorkbenchDrill` før OW-3 fase 3.
- WANG-/TN-felles kjerne (menystruktur foreslått av Codex 21.09, ikke vedtatt).
