# Turneringsresultater og verifisert spilleridentitet — 02.10.2026

## Endring

HQ koblet tidligere en ny eller eksisterende PlayerHQ-konto automatisk til en PublicPlayer når normaliserte navn ga nøyaktig én kandidat. Navn alene beviser ikke at profilene gjelder samme person, særlig i juniorgolf. Koblingen kunne derfor føre en annen spillers turneringsresultater inn på feil konto.

Koblingsjobben teller nå entydige navnekandidater som trenger identitetskontroll, men endrer aldri User.publicPlayerId ut fra navn. Kontoer med en eksisterende publicPlayerId fortsetter å få turneringsresultater speilet automatisk. Denne rettingen beviser ikke hvordan eldre koblinger ble etablert; de er ikke revidert. Uten en kobling returnerer profiloppdateringen statusen needsVerifiedLink og leser ikke kandidatens turneringsresultater.

## Verifisering

- Målrettede syntetiske prøver dekker navnelikhet med én kandidat, duplikate navn, konto uten verifisert kobling og fortsatt speiling for en eksisterende kobling.
- Nattens synkrapport viser antall navn som må kontrolleres uten å inkludere navn eller andre personopplysninger.
- Ingen produksjonsdata ble lest eller skrevet, og ingen pipeline ble kjørt.
- Målrettede prøver: 9 bestått. Full lokal npm run verify bestod med Node 24.21.0 og utvidet TypeScript-minne; bygg av 348 sider og Service Worker bestod. Diffkontroll og npm run prosjekt:sjekk bestod.

## Gjenstående for automatisk kobling

User.publicPlayerId er fortsatt HQs kanoniske turneringskobling. Det finnes ikke et bekreftet identitetsfelt eller en brukerreise som kobler en spiller til GolfBox/turneringsprofilen. Derfor kan ikke nye, ukoblede kontoer få automatisk resultatimport bare fra navnelikhet. Eldre koblingers opphav er heller ikke dokumentert her, og må revideres før de omtales som verifiserte. Neste arbeid må definere og bygge en verifiserbar koblingsmåte, for eksempel spillerens kontobekreftede kobling til en unik turneringsprofil. Den må være brukerstyrt, kunne trekkes/korrigeres med historikk og prøves mot to personer med samme navn før ny automatisk speiling aktiveres.

Hovedplanens mål om automatisk oppdatering er dermed delvis oppfylt: automatisk speiling virker for profiler med eksisterende User.publicPlayerId; trygg identitetskobling for nye kontoer og revisjon av gamle koblinger gjenstår.
