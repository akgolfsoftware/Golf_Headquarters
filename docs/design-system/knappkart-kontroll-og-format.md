# Knappkart: lesing og kontroll

Kartgeneratoren i `scripts/design/precision-control-map.cjs` analyserer eksporterte designkilder uten å kjøre dem. Kartet skal lages på nytt fra den valgte sluttversjonen. Et tidligere mellomkart er ikke bevis for senere skjermendringer.

## Hvilken kontroll er dette?

Hver regel har en stabil kontroll-ID, vert (`PH`, `AG` eller `FO`), rotens skjerm-ID, native element, opprinnelig komponent, kildefil, SHA-256 og kildeposisjon. Betingelser beskriver når kontrollen finnes. Løkkeregler og bindinger beskriver hvilket faktisk objekt som må følge valget; de er ikke en liste over alle mulige brukerobjekter.

Følg hele callback-kjeden til navigasjon, lokal tilstand eller modelloperasjon. Les argumentene og objektvalget sammen med mål, retur, avbryt og kildevakter. Ikke behandle en foreldercallback som en ferdig skjermkobling. Et varsel alene beviser ikke lagring, import, publisering eller utsendelse.

## Skjema og deaktivert kontroll

`forms`, `formAssociation` og `formAction` kobler native submit/reset til omsluttende skjema eller eksplisitt `form`-ID, også når skjemaet kommer senere i kilden. Standard submit-type og hele onSubmit/onReset-bindingen registreres. Det følger ingen antakelse om faktisk lagring av en native skjemaaksjon.

`activity` skiller kjent deaktivert kontroll fra aktiv eller betinget kontroll. Native disabled og fieldset-arv med første-legend-unntaket vurderes; deaktiverte callbacks beholdes som kildebevis i `inactiveCallbackBindingGaps`, uten aktive strict-avvik. Dynamiske/tvetydige skjema-ID-er, ukjent type og komplisert legend-rekkefølge forblir uttrykkelig uavklart. Motorens37enhetstester kontrollerer disse avgrensede kildeforholdene, ikke faktisk nettleseratferd.

## Kompakt format

`precision-control-map-normalized-v1` er et tapsfritt format med felles tekst-, objekt- og listetabeller. `controlIndex` finner en kontroll eller skjerm uten å utvide hele kartet. `expandNormalized()` i generatoren leser fullstendig innhold fra `ruleRef`; `screenMap()` lager et selvstendig skjermuttrekk. Normalisering anonymiserer ikke innhold. Råkart, komplette kildeutdrag og eksportarkiver skal fortsatt lagres privat.

Fra prosjektroten:

```bash
node scripts/design/precision-control-map.cjs EKSPORTROT PRIVAT-KART.json --normalized --gzip --strict
node scripts/design/precision-control-map.cjs --screen-file PRIVAT-KART.json PRIVAT-PH11.json --host PH --screen PH-11 --gzip --strict
node --test scripts/design/precision-control-map.test.cjs
```

Argumentene over er plassholdere. Den konkrete overleveringen skal angi faktisk eksportrot, filnavn og SHA-256. `PRECISION_NODE_MODULES_ROOT` kan peke til en prosjektrot med Babel-avhengighetene.

## Hva er kontrollert?

`coverageInventory` skiller deklarerte skjerm-/JSX-funksjoner, oppnådde komponenter, overstyrte kilder og uoppnådde definisjoner. Uoppnådd kode er ikke automatisk utgående. Verifiser katalogen, aliasene, lastingens rekkefølge og hvilken registrering som faktisk vinner før en kilde arkiveres.

`--strict` gir exitkode 3 ved oppførte kilde- eller handlingsavvik. Exitkode 0 er verken en fungerende brukerreise, en visuell godkjenning eller bevis på full JavaScript-semantikk. Ukjente dynamiske betingelser, modellregler og objektvalg må fortsatt kontrolleres med konkrete brukerreiser.

Den valgte versjonen trenger tre separate bevis:

1. Kildekontroll: alle aktive kataloginnganger, faktisk valgt registrering, komplette native kontroller, bindinger, retur og kildehash.
2. Funksjonskontroll: reelle valg med flere objekter/eiere, feil, retry, avbryt og negative tilfeller. Testdata ligger i avgrenset testområde, med separate oppgave- og publiseringsrevisjoner.
3. Visuell kontroll: faktisk valgt skjerm, relevante tilstander, mobil 390 px og desktop. Anders godkjenner skjermen; grønne tester gir ikke den godkjenningen.

Kodebyggeren skal implementere funksjonene etter produktreglene og dagens appkode. Prototypens lokale lagring, eksempelkilder og testvakter er ikke produksjonslagring eller ferdig tilgangskontroll.

## Uavhengig modellkontroll

`node scripts/design/precision-wb-model-check.cjs EKSPORTROT --out NY-PRIVAT-RESULTAT.json` prøver 63 avgrensede modelltilfeller med syntetiske data i separate, tidsbegrensede VM-er uten nett, filtilgang eller importer i kjøringsmiljøet. Ukjent API blir `SKIPPED`, unntak blir `ERROR`, og slike resultater teller ikke som bestått. Kilde- og kontrollskriptets SHA følger beviset.

Eksport 25 og 26 ga 63 PASS, 0 FAIL, 0 SKIPPED og 0 ERROR. Prøvene omfatter år/uke/kilderegler, TEK, full oppgave-/egenversjonskopi, fast requestfingerprint, gruppetilgang uten gammel publikasjonsfallback og ærlig feil/reload/retry i rolle- og delte lagre. Dette kontrollerer bare den navngitte modellkilden. Riktig objekt fra en knapp, fungerende retur, nettleserlagring og apprettigheter trenger egne bevis. Den lokale skjermreisen i eksport 25 ga 79/0; den er heller ikke en samlet designgodkjenning.
