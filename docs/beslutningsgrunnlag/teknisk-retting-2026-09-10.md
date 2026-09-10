# Teknisk retting mens design revideres — 10.09.2026

Bestilling: fullfør teknisk arbeid parallelt med Claude Design. Arbeidet er lokalt på `codex/prosjektopprydding-2026-09-10`. Ingen produksjonsdata, betalinger, utsendinger, push, merge eller deploy inngår. Design er fortsatt åpent.

## Endret kode

| Funn | Retting | Avgrensning |
|---|---|---|
| R1 | Felles kontroll av eier/coachtilknytning i tapper, brief, oppsummering, live-ruting, planlesing og V2-lesing/skriving/video. Deltaker må selv være akseptert eller møtt. | Ikke en full revisjon av alle 478 ruter eller produksjonens RLS. |
| R2 | Sluttelling og fullført-status i én transaksjon. Feil beholder brukeren på siden; retry overskriver ikke sluttresultatet. Plan- og Workbench-oppsummering leser tellingene. | Tapper lagrer slag per kølle, ikke treffkvalitet eller faktisk tid. Målt tid vises derfor ikke. V2-funksjonalitet beholdt. |
| R3 | Ukeoversikten henter også spillerens synlige Workbench-økter med samme ID/status. Norske datoer/klokkeslett brukes. | Publiserte økter som venter på spillerens godkjenning er fortsatt egne forslag. Ingen datamodeller slått sammen. |
| R5 | Løst coach-ID følger tilgjengelighet, reservasjon, kollisjonskontroll, lagring og Checkout-metadata. | Stripe er erstattet med testdobbel i regresjonstesten; ekte betaling ikke prøvd. |
| R6 | TALENT-hjem kaller ikke den FULL-beskyttede Workbench-loaderen. FULL-kravet er beholdt for treningsfunksjonen. | Full nettleserreise med reell TALENT-testkonto gjenstår. |
| R7 | Fjernet motsatt videresending fra `/portal/ny-okt`; gjenværende kjede ender i Workbench. | Gamle permanente videresendinger kan ligge i nettlesercache. |
| R8 | Hele utvalget valideres før skriving. Én transaksjon ruller tilbake ved feil; endring siden lesing avvises. | Testdobbel prøver feil under andre skriving. Faktisk databasekonkurranse ikke kjørt. |

## Kontroller

2 164 enhetstester og 3 komponenttester bestod, ingen hoppet over. Typekontroll, lint og samtlige verify-trinn bestod. Produksjonsbygg og Serwist bestod i isolert kopi med dummyverdier og uten produksjonsnøkler. Under bygg kunne databaseavhengige statiske oppslag ikke nå den bevisst utilgjengelige testadressen; dette er ikke en test av databaseinnhold eller komplette kundereiser.

Kvalitetsgaten ble fullført i flere kjøringer: sandkassen stoppet først lokal nettserver, og testkopiens manglende/tomme Git-indeks måtte deretter korrigeres for at baseline-kontrollene skulle kjøre riktig. Etter rettingen bestod alle gjenværende trinn. Ingen kvalitetsvakt er omgått. Den endelige kildekoden er kontrollert byte for byte mot den bygde kopien. De 12 eksisterende kontrastavvikene er fortsatt rapportert av den ikke-blokkerende kontrollen. Ingen skjerm er visuelt godkjent av denne tekniske rettingen.

Nye regresjonstester kjører faktiske server actions mot syntetiske brukere og kontrollerte testdobler for database/leverandører. De dekker uvedkommende coach, en annens invitasjon, tillatt tilgang, atomisk avslutning, retry, avvist status, samlet publisering og valgt coach. Ren mapping testes for norsk sommer-/vintertid og identitet/status mellom I dag og Plan.

## Gjenstår før komplett app

- R4: implementere offentlig booking og øvrige skjermer mot designversjonen Anders velger.
- R9: prøve betaling, ventende/feilet/avbrutt betaling, bekreftelse og administrasjon samlet i et eksplisitt testmiljø; kontrollere gjenoppretting og driftsbevis.
- Prøve de endrede brukerreisene i nettleser med syntetiske kontoer og database, inkludert offline/gjenopptak og samtidige klienter.
- Hele arbeidslisten inneholder mer produkt- og designarbeid. Denne rettingen er ikke en påstand om at alt utenom design er ferdig.

## Claude Design H2

OM-01 H1 er lest som underlag. Refererte H1-DEKNINGSREGISTER.csv og H0-KILDEKOBLING.md følger ikke med standalone-filen og er ikke uavhengig verifisert. Ny prompt ber om å korrigere gamle designlåser, avstemme dekningspåstander og levere faktiske wireframes, UI og klikkbare reiser for trening, coachpublisering og gjestebooking. Hele appomfanget består.

Ny H2-01-leveranse er senere lest og rendret lokalt. Den har 26 wireframekort, men ingen fungerende knapper/felt i standalone-filen. Oppfølgingsprompt H2-02 retter data-/statusmotsigelser, negativ opacity, publisering mot varselstatus og bookingantakelser før klikkbar UI bygges.
