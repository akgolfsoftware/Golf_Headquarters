# P0 — streng innlogget reise 13.09.2026

Den strenge reisen ble kjørt mot isolert lokal HQ-Supabase og syntetiske brukere. Første kjøring viste en feil i testens nye nettadresseforventning. Etter modellspesifikk retting bestod alle fire prøver på 3,1 minutter.

## Dette bevises

- Workbench, V2 og eldre planøkt går fra I dag via Plan og produktets egen Start økt-lenke til Live og oppsummering.
- Workbench og eldre plan kontrollerer eksakt antall lagrede slag. V2 kontrollerer eksakte repetisjoner og treff både ved fullføring og gjenåpning.
- V2 og eldre plan gjenåpnes via Til planen og Se oppsummering. Workbench gjenåpnes via Se recap fra I dag.
- Tillatt coach ser Workbench-oppsummeringen.
- Fremmed spiller og fremmed coach prøver hovedrute, brief, modellens aktive rute og oppsummering for alle tre modeller. Alle 24 direkte besøk avvises til forventet Plan- eller Workbench-side uten øktinnhold.

## Sikker kjøring

- Ingen navigasjonsfeil repareres med direkte `goto`; feil i produktreisen skal gjøre prøven rød.
- Runneren stopper hvis port 3010 er opptatt. Den dreper ikke andre prosesser.
- Runneren avviser automatiske miljøfiler og videresender bare navngitte systemvariabler, lokale Supabase-verdier og syntetiske P0-felt. Betalings-, e-post- og AI-nøkler arves ikke.
- Nettleserspor starter etter innlogging og lagres bare under `/tmp/ak-hq-p0-streng-playwright-results`. Sporene kan inneholde lokale økttokens og skal aldri legges i Git eller deles eksternt.

## Avgrensning

Pakken er et innlogget desktop-bevis for spillerreisen og lesetilgang. Den er ikke mobil- eller visuell godkjenning. Skriveforsøk fra uvedkommende dekkes av egne handlingstester, ikke disse nettleserprøvene.

Hovedagenten kjører samme strenge reise, full `npm run verify` og full testpakke på den samlede mergekandidaten før lagring.
