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

- **W1 · Planen deles med eget samtykke, `TRENINGSPLAN`, ikke med testsamtykket eller KOMPLETT_PROFIL.** Grunn: testsamtykket (D-55) lover eleven at planen ikke deles, og KOMPLETT_PROFIL åpner også TrackMan og analyse. Minst mulig innsyn. Samme regler som testene: under 16 teller bare forelderens ja, et trekk virker med en gang.
- **W1 · Plandelingen gjelder bare WANG-skolen, aldri Team Norway.** Grunn: oppdraget gjaldt WANG-treneren; Team Norway får fortsatt bare testene.
- **W1 · Treneren ser tall, ikke økter.** Etterlevelse (gjennomført mot planlagt tid, fire uker), tid per akse og morgentrening. Ingen notater, øktnavn eller meldinger. Grunn: det er det skjermene trenger.
- **W1 · Morgentrening = gruppas økter i elevens plan** (Workbench-kopier med `groupId` lik WANG-gruppa), gjennomført mot planlagt tid. Grunn: oppmøte lagres ikke ennå, og WANG-gruppeøktene er morgentreningene.
- **W1 · Elevene sorteres i Trenger deg (under 80 % av planen eller morgentreningen), Følger planen og Ikke delt.** En elev som har delt, men ikke har forfalte økter, står i Følger planen med «—».
- **W1 · Eleven får forespørselen om å dele planen i I dag (til eleven har svart), under Personvern, og forelderen i foreldreportalen.** Grunn: samme steder som testsamtykket.
- **W1 · Ingen skjemaendring.** `delings_samtykker.scope` er tekst, så `TRENINGSPLAN` er en ny verdi, ikke en ny kolonne.

## 5. Morgenrapport

(Skrives av koordinatoren når K er ferdig.)
