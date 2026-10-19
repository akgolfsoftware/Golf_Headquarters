# Nattkjøring 18.–19.10.2026: WANG og Team Norway fullføres

Bestilt av Anders 18.10: «fullfør nå alle oppgaver nå. legg til at auto godkjenning i hele prosjektet
i natt så alle sessions kan jobbe.» Fullmakten står i `CLAUDE.md` §Nattkjøring 18.–19.10 og
`beslutninger.md` §NATTKJØRING 18.–19.10.

## 1. Utgangspunkt (målt 18.10 mot main)

WANG pakke 2–8 og 10 og Team Norway pakke 1–5 og 9 er bygget etter utkast 2. Det som mangler, er
funksjoner uten data. Kilden er avviksfeltene i #1402, #1406 og #1411 og filhodene i komponentene.

## 2. Regler for økta

1. Én gren fra `origin/main` og én PR per pakke. Auto-merge (squash) når PR-en er laget.
2. `npm run verify` grønn lokalt før PR. Aldri `--no-verify`.
3. Additive skjemaendringer via `db execute` (gotchas §Database), skript i `scripts/`, RLS på nye tabeller.
   Rebase mot `origin/main` rett før PR, fordi flere pakker rører `prisma/schema.prisma`.
4. Skjermregisteret røres ikke (gotchas §Arbeidsmåte).
5. Ingen demodata. Mangler et tall, vises «—». Elevdata om mindreårige følger `ak-personvern`.
6. Målt i 360/390/1280 uten sidelengs rulling og uten konsollfeil før PR.
7. Hvert valg økta tar selv, føres i §4 med pakke og kort grunn.

## 3. Arbeidspakker

| Pakke | Innhold | Ferdig når | Status |
|---|---|---|---|
| W1 WANG plandeling | Spilleren kan dele planen (ikke bare testene) med WANG-treneren via `DelingsSamtykke`. Etterlevelse (tid mot plan, fire uker) og morgentrening i I dag, Trening og Elever leser delt plan. «Deler testene» blir «Har delt med deg» når planen er delt. | En trener ser etterlevelse for en elev som har delt, «—» for en som ikke har, låst med test | |
| W2 WANG elevdata og Fireukerssjekk | Klasse, kategori A–K og HCP på eleven, klassefilter i Elevlista. Fireukerssjekken fra PlayerHQ (PH-IUP-01) vises for treneren i Elever › Fireukerssjekk (WANG-45) når eleven har delt. | Filteret virker og fireukerssjekken vises med ekte svar, låst med test | |
| W3 WANG opptak og skolene | Opptak med plasser og kandidater (WANG-31, -32). Koordinering mellom skolene (WANG-33): stjernemarkering per skole og kontaktlogg (skole, person, tidspunkt, mottaker), aldri meldingsinnhold. | Sportssjef kan legge til kandidat, stjernemerke og logge kontakt; trener får «Denne siden er lukket», låst med test | |
| W4 WANG tilgang og Data Golf | Inviter trener og nytt unntak i Administrasjon (sportssjef). Invitasjonen lages som lenke; ingen e-post sendes til ekte personer i natt. DG-08 Norske proffer får live-stilling når turneringen pågår. | Sportssjef kan lage invitasjonslenke og unntak; trener avvises, låst med test | |
| T1 TN uttak | Frist og antall plasser på uttaket, vist i helteflaten og lista (`/team-norway/uttak`). | Frist og plasser lagres og vises, låst med test | |
| T2 Timer per akse i månedsplanen | Timer per akse FYS · TEK · SLAG · SPILL · TURN per uke i månedsplanen, arvet fra perioden (§PLANNIVÅENE HENGER SAMMEN punkt 1–2). Brukes av TN `/team-norway/manedsplan`; PlayerHQ og AgencyOS leser samme felt. | En periode med timer per akse gir tall i TN-månedsplanen, låst med test | |
| T3 Data Golf resten | DG-05 Spiller mot proff, DG-06 Innspill-tak og DG-07 Fra funn til forslag i Team Norway (og WANG hvis de mangler der), etter `utkast-agencyos/datagolf.html`. Bare for `kanSeDataGolf`. | Skjermene finnes og en spiller avvises, låst med test | |
| K Kontroll | Når W1–T3 er lagt inn: alle `/team-wang`- og `/team-norway`-ruter åpnet i nettleser i 390 og 1280, tom/laster/feil, ingen sidelengs rulling, ingen konsollfeil. | Måling ført i §5 | |

## 4. Avgjort i natt

(Hver økt fører sine valg her: pakke · valg · grunn.)

- **W2 · Ingen skjemaendring.** Klasse (`User.schoolYear`) og HCP (`User.hcp`) fantes allerede; kategori A–K regnes som i `hentSpillerAkKategori` (snitt brutto i år, ellers HCP-estimat). Grunn: ikke lage dobbelt lagring av noe som finnes.
- **W2 · Klasse vises alltid, HCP og kategori bare ved deling.** Klasse er skoleopplysning ført av coach/admin; HCP, kategori og Fireukerssjekk er elevens data og krever navngitt deling til akkurat denne treneren (`navngittTrenerHarTilgang`, forelder under 16, aktivt WANG-medlemskap). Grunn: §KODEGJENNOMGANGEN 06.10, WANG-trenere ser bare det eleven har delt.
- **W2 · Kategorien bruker bare runder eleven har delt med coach** («Bare deg»-runder teller ikke). Grunn: en privat runde skal ikke lekke via et utledet tall.
- **W2 · Klassefilteret er knapper (Alle · VG1 · VG2 · VG3 · Uten klasse), bare klassene som finnes i gruppa.** Vises ikke når gruppa bare har én klasse. Grunn: brekker om på 360 px, ingen nedtrekksliste å lete i.
- **W2 · Fireukerssjekken viser elevens leverte svar, ikke trenerens vurdering.** Knappen «Lagre vurderingen» er fjernet; teksten sier at vurderingen føres i IUP-samtalen. Grunn: ingen lagring for trenervurdering finnes, og en død knapp lover noe som ikke virker.
- **W2 · Trener uten verifisert @wang.no-adresse (også admin) ser «Ikke delt» for alle.** Grunn: delingen er knyttet til trenerens e-post; ingen kan arve innsyn gjennom rolle.
- **T2 · Ingen skjemaendring.** `PeriodBlock.axisMinutes`/`axisMinutesLight`, `GroupPeriodBlock.axisMinutes`/`axisMinutesLight` og `MonthPlan.weekAxisMinutes` finnes allerede i main (#1243 m.fl.). Pakken leser dem; grunn: punkt 1–2 var alt bygget i datamodellen, bare visningen manglet.
- **T2 · Én felles regel** `timerPerAksePerUke` (`src/lib/workbench/timer-per-akse.ts`): uka hører til måneden og perioden der torsdagen ligger, månedens overstyring vinner, lett uke bruker periodens lette tall. Spillerens leser er `hentTimerPerAkse` (`maanedsplan-core.ts`), som PlayerHQ og AgencyOS kan bruke; grunn: samme regel som `ukerForPeriode` og månedsskjemaet, så tallene ikke spriker.
- **T2 · TN-månedsplanen leser gruppas perioder, uten månedsoverstyring og lette uker.** Gruppa har ingen månedsplan og ingen markering av lett uke i datamodellen; utkastet sier «Arvet fra gruppas årsplan. Spillerne tilpasser sin egen plan i PlayerHQ». Alle uker bruker periodens vanlige uke. Grunn: en gruppemånedsplan ville kreve ny tabell, og utkastet ber ikke om den.
- **T2 · Timene står som en linje under ukebåndet**, ikke som stablede ukesøyler, så kalenderen og lista beholdes. Helteflaten viser fordelte timer og aksefordelingen når periodene har timer, ellers økter som før. Grunn: minst mulig endring av en skjerm som alt er godkjent.
- **T2 · Neste steg (ikke i pakken):** skriving nedover til `WeekPlan` når en gruppeperiode endres (punkt 3–4) og kvittering ved lagring (punkt 6); lett uke og månedsoverstyring for gruppa, hvis Anders vil ha det.
- Booking steg 6 (duo) · en tjeneste er duo når kategorien er «duo» eller navnet inneholder ordet «duo», uansett kategori · de ekte tjenestene «Flex Duo 50/90 min — Anders» står som drop-in i basen, så kategorien alene fant dem aldri. Skriptet `scripts/add-booking-duo-deltaker-2026-10-18.ts` (to tomme felt på `bookings`) er kjørt mot produksjon 19.10 og bekreftet med lesespørring.
- **W4 · Invitasjonslenken sendes ikke på e-post.** Sportssjefen kopierer lenken og sender den selv. Grunn: ingen e-post til ekte personer (AGENTS.md §Stående forhåndsgodkjenning).
- **W4 · Lenken gjelder i sju dager, for én e-postadresse, og kan brukes én gang.** Bare SHA-256 av lenken lagres. Grunn: som delingslenken (beslutninger 28.09).
- **W4 · «Endre rolle», «Fjern tilgang» og «Flytt morgentreningen» er ikke med.** Grunn: utenfor W4; rollen endres aldri fra lenken.
- **W4 · Tabellene `wang_trener_invitasjoner` og `wang_timeplan_unntak` fantes allerede i basen** (lesespørring 19.10, RLS på). Skriptet `scripts/add-wang-trenerinvitasjon-og-unntak-2026-10-18.ts` trengte ikke kjøres på nytt.

## 5. Morgenrapport

(Skrives av koordinatoren når K er ferdig.)
