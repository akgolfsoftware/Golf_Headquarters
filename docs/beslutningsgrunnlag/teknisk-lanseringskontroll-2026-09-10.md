# Teknisk lanseringskontroll — 10. september 2026

Status: samlet lokal kandidat er bygget og testet på `codex/samlet-lanseringskontroll-2026-09-10`, basert på `main` etter DataGolf/GolfBox. Tidligere kontrollresultater nedenfor er historikk; sluttresultatet for samlingen står i siste avsnitt. Appen er ikke klarert for åpen lansering.

## Rettet i denne arbeidsøkten

- De 27 beregnbare Team Norway-variantene kan tildeles før noen har tatt testen. Uavklarte varianter kan ikke tildeles som ferdige tester. Fullføring kobler én åpen tildeling og ett coachvarsel atomisk til resultatet; gjentatt fullføring dobler ikke registreringen. Spilleren ser egne tildelinger og frister i testoversikten.
- Talentberegningen tar med nye TN-resultater med riktig enhet og forbedringsretning. Versjon, variant, antall og enhet må samsvare for en trend. Nye tester får ingen oppdiktede nasjonale nivågrenser. Eldre resultater blir ikke omberegnet.
- Coachens resultatvisning sjekker nå konkret tilknytning til spilleren før person- og testdata hentes. Nye TN-resultater vises med variant, antall og enhet.
- Coach får avslag ved forsøk på å tildele andre eieres private tester. Ugyldig frist avvises. Eksisterende kontroll av coachens spilleromfang beholdes.
- Gjennomføring av Workbench-økter krever publisert/pågående status, synlighet og avklart godkjenning. Fullført/avlyst/hoppet over kan ikke startes på nytt gjennom disse handlingene. Gjentatt identisk handling skriver ikke på nytt. Endret status eller revisjon mellom lesing og skriving gir avslag.
- Stripe-bekreftelsen kontrollerer lagret beløp i øre og NOK før booking bekreftes. Forsinket betalingsbekreftelse bruker samme kontroll. Eksisterende vern mot duplikate varsler beholdes. Offentlig booking viser en forståelig feilmelding fremfor interne unntak.
- Ny miljøkontroll: `node scripts/launch-preflight.mjs`. Den skriver ingen nøkler eller tilkoblingsstrenger, gjennomfører ingen betaling og endrer ingen innstillinger.

## Kontroll mot aktiv database og lokalt miljø

Tilgangsmetadata er lest, og klientlesing er kontrollert under `anon` og `authenticated`. Ingen spiller-, kunde- eller helserader er returnert eller endret i kontrollen.

| Observasjon | Betydning |
|---|---|
| Supabase har ingen egen testgren; isolert lokal PostgreSQL 17 er nå opprettet | Åtte databasereiser er prøvd med syntetiske brukere. Ekte Supabase-innlogging og gjennomgående nettleserreise gjenstår |
| `booking_coach_no_overlap` finnes i aktiv database | Databasevern mot overlapp for samme coach/plass finnes; samtidig kjøp er fortsatt ikke prøvd i nettleser |
| Ni tabeller hadde RLS avslått; RLS er nå aktivert etter Anders’ godkjenning | 18 klientlesinger gir null synlige rader. Appens faktiske servertilkobling beholder tilgang til alle ni |
| 13 helsefunksjoner uten egen tilgangskontroll, tre saksfunksjoner med NULL-svakhet og én trenerfunksjon er undersøkt | Konkret retting er laget og testet lokalt. Produksjonskjøringen ble avvist av automatisk godkjenningskontroll og venter på konkret godkjenning |
| Varsel om lekkede passord: beskyttelse avslått | Innloggingsoppsettet krever egen kontroll |
| Lokalt miljø har Stripe live-nøkkel og nødvendige variabelnavn | Ingen testbetaling er gjennomført; variabeltilstedeværelse beviser ikke at integrasjonene fungerer |
| `BOOKING_PUBLIC` er ikke aktivert | Offentlig åpning er ikke utført |

Tabellene er `datagolf_tak`, `datagolf_tak_band`, `position_task_maal`, `tn_posts`, `tn_post_vedlegg`, `tn_post_lesekvitteringer`, `kondisjon_segmenter`, `daily_active_users`, `drift_rutiner`.

Den konkrete rettingen i [SQL-filen](../../scripts/sql/launch-server-tables-rls.sql) er **utført i produksjon etter Anders’ eksplisitte «Godkjent»**. Migrasjon: `20260910095823_launch_server_tables_rls` i Golf_Headquarters. Den første kjøringen ble avvist av automatisk godkjenningskontroll; godkjent gjenforsøk bestod. Alle ni tabeller har nå RLS uten klientpolicyer.

[Lesebasert etterkontroll](../../scripts/sql/verify-launch-server-tables-rls.sql) bestod: begge klientroller har aktivt radvern og null synlige rader på alle ni tabeller. Serverrollen beholder tilgang. I tillegg er **appens faktiske DATABASE_URL-tilkobling** prøvd i en skrivebeskyttet transaksjon: SELECT/INSERT/UPDATE/DELETE-rettigheter finnes for hver tabell, og serveren blir ikke radbegrenset. Ingen prøvedata er skrevet. Supabase-kontrollen viser nå **ingen `rls_disabled_in_public`-funn**. INFO om RLS uten policy er forventet for disse serverbetjente tabellene. De øvrige funksjons- og innloggingsvarslene gjenstår.

Funksjonskroppene er kontrollert uten å hente helse- eller saksrader. Kjent klient i `training_dashboard/lib/helse.ts` og `lib/oktlogg.ts` bruker `service_role`; denne tilgangen beholdes. [Tilgangsrettingen](../../scripts/sql/launch-function-access.sql) stenger 13 funksjoner for klientroller og binder trenerkontrollen til innlogget identitet. [Nøkkel-/søkestirettingen](../../scripts/sql/launch-function-search-path-and-keys.sql) avviser manglende forventet nøkkel i tre funksjoner og fastsetter fire tidligere åpne søkestier. Lokal kontroll med ekte Postgres-roller bestod. Automatisk godkjenningskontroll avviste produksjonskjøringen: tidligere generell godkjenning dekket ikke det konkrete omfanget og mulig virkning på ukjente klienter. Konkret godkjenningsspørsmål er sendt; ingen av disse funksjonsendringene er utført i produksjon.

Tilgangsmodellen er kontrollert mot [Supabases RLS-dokumentasjon](https://supabase.com/docs/guides/database/postgres/row-level-security). [Forklaring av RLS-varselet](https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public) og [offentlig kjørbare privilegerte funksjoner](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable).

## Gjenstående lanseringsbevis

1. Stripe-testnøkler og et miljø med ekte testinnlogging. Lokal testdatabase er klar; ingen ekte kunder eller betalinger er brukt.
2. RLS-tiltaket på ni tabeller er utført og kontrollert. Avklar de delte privilegerte funksjonene og øvrige sikkerhetsvarsler; gjennomgående brukerreiser gjenstår.
3. Coach → utkast → publisert økt → spiller → gjennomført er prøvd mot lokal Postgres med appens faktiske serverfunksjoner. Kontroller fortsatt samme reise i nettleser med testinnlogging, inkludert I dag, Plan og historikk.
4. Kjør faktisk testkjøp, avbrutt betaling, utløpt betaling, forsinket bekreftelse og to samtidige bestillinger. Kontroller beløp, bestilling, kvittering, varsler og kalender. Særlig sen betaling etter avlyst booking og feil etter opprettet Stripe-session trenger gjennomgående prøving.
5. Test tillatt og avvist tilgang med to spillere, to coacher og to foreldrerelasjoner i nettleser/API. Kodebaserte tester erstatter ikke dette.
6. Fullfør språkgjennomgangen av alle valgte skjermer, feil, e-post og tomtilstander mot fagfasiten. Se [språkrapporten](sprak-og-treningskvalitet-2026-09-10.md).
7. Dokumenter gjenoppretting og varslingsprøve etter [driftsoppskriften](../drift/lansering-og-gjenoppretting.md), og godkjenn ferdig design med faktiske skjermbilder.

Ingen commit, push, produksjonsutrulling eller åpning av offentlig booking er utført i denne arbeidsøkten.

## Tidligere sluttkontroll, før utvidet arbeid

- `npm run verify`: bestått i isolert kopi, inkludert produksjonsbygg og Serwist.
- `npm test`: 2225 tester bestått, ingen feil, i samme kopi etter avsluttet bygg.
- Typekontroll og målrettede tilgangs-/status-/betalingskontroller: bestått.
- `npm run prosjekt:sjekk` og `git diff --check`: bestått.
- Én parallell kjøring ga fem importfeil mens Prisma-klienten ble regenerert. Ingen testkrav ble svekket; sekvensiell sluttkjøring bestod.
- Dette er lokal verifikasjon med syntetisk oppsett. CI, ny produksjonsutrulling, komplette nettleserreiser og pikselgodkjenning er ikke verifisert.

## Produksjonsoppfølging etter godkjenning

10.09.2026: Bare det konkret godkjente RLS-tiltaket på ni tabeller er publisert til databasen. Appkodeendringene under er lokale. Ny sikkerhetsmigrasjon er ikke kjørt etter avvisningen. Ingen apputrulling, offentlig åpning eller Stripe-betaling er utført.


## Utvidet teknisk arbeid etter «fortsett»

- **Tilgjengelighet:** bestilling må treffe et faktisk tilbudt tidspunkt, riktig coach, aktiv tjeneste, gyldig tidsvindu og ledig kapasitet. En annen coaches booking skjuler ikke en ledig coach. En delt økt med to plasser beholder den andre plassen til den faktisk er tatt. Bookinger som går over midnatt tas med i overlappskontrollen.
- **Opprettelse av betalingslenke:** en entydig feil kansellerer bare en ventende booking. En opprettet betalingslenke må være utløpt hos Stripe før tiden frigjøres ved feil. Ukjent nettutfall eller feilet utløping beholder reservasjonen for oppfølging. En feilet revisjonslogg fratar ikke kunden en allerede opprettet betalingslenke.
- **Betalingslagring:** checkout, betalingsforsøk, faktura og refusjon kobles etter alle tilgjengelige Stripe-identiteter i en kort databasetransaksjon. Duplikater og vanlige hendelser i motsatt rekkefølge gir én betalingsrad. Forsinkede hendelser nedgraderer ikke betalt/refundert status eller reduserer refusjonsbeløpet. Motstridende eldre betalingsrader slettes eller slås ikke sammen i stillhet; hendelsen feiler for avstemming gjennom eksisterende oppfølgingskø.
- **Webhook:** betaling lagres før bookingbekreftelse og kvittering til Stripe. Betalt beløp og NOK valideres. Ubetalt checkout bekrefter ikke booking; forsinket vellykket betaling og mislykket betaling håndteres. Betalt etter kansellering beholdes som en faktisk betaling og krever oppfølging; kansellert booking gjenopplives ikke.
- **Klokkeslett:** appens eksisterende lagringskonvensjon for Oslo-veggklokke beholdes. Bookingtid overføres til nettleseren uten et misvisende UTC-suffiks. Valg, bekreftelse og betalingsbeskrivelse gjør ikke en ekstra Oslo-konvertering. Faktiske tidspunkt brukes for kalenderlenker og 24-timersfristen, inkludert sommer-/vintertid. Databasen er ikke tidsmigrert.

Stripe garanterer ikke hendelsesrekkefølge; implementeringen er kontrollert mot [offisiell webhook-dokumentasjon](https://docs.stripe.com/webhooks) og [kravene til bekreftelse av Checkout](https://docs.stripe.com/checkout/fulfillment).

### Lokale databasetester

PostgreSQL 17.8 på loopback-port 54379, separat database `ak_hq_launch_tests`. Ingen produksjonsdata er kopiert. Gjeldende Prisma-skjema er brukt; bare to vektorkolonner er erstattet med vanlige tallarrayer i det midlertidige testskjemaet fordi pgvector ikke er installert. Booking-/trenings-/betalingstabeller og bookingens eksklusjonsregel er uendret. Vektorsøk er ikke prøvd.

- `tests/integration/launch-database.test.ts`: åtte underprøver bestod med ekte Prisma/Postgres. Samtidige bookinger, coachvalg, delte plasser, faktisk Workbench-reise, avvist coach/forelder, samtidig TN-fullføring, forsinket betaling og refusjoner. Bare testidentitet og eksterne utsendinger er erstattet; faktisk Supabase-innlogging er ikke prøvd.
- `tests/integration/function-security.test.mjs`: fem underprøver bestod. SQL-filene ble kjørt to ganger, rettigheter ble prøvd som klient/server, nøkkelvakt ble prøvd med manglende rad/NULL/feil/riktig nøkkel, treneridentitet ble kontrollert, søkestier ble kontrollert. Helsefunksjonene hadde syntetiske testkropper; ingen helsedata ble lest.
- `tests/integration/backup-restore.test.mjs`: sikkerhetskopi og gjenoppretting bestod med 196 tabeller, bevart bekreftet booking og fortsatt avvisning av overlapp. Kopiering/gjenoppretting/kontroll tok 2,59 sekunder for den lille lokale testdatabasen. Dette er ikke målt gjenopprettingstid for produksjon, og omfatter ikke Supabase Auth, Storage, filvedlegg eller produksjonens sikkerhetskopi. Prøvedatabasen og prøveradene ble ryddet bort.

### Ny sluttkontroll

- `npm run verify`: bestått i isolert kopi, inkludert typekontroll, lint, prosjektkontroller, produksjonsbygg og Serwist.
- `npm test`: **2 257 tester bestått**, fordelt på 2 254 kildekodetester og tre komponenttester. Ingen feil, hoppet over eller avbrutte tester. Kjørt etter avsluttet bygg, med eget generert Prisma-klientoppsett.
- De separate integrasjonsprøvene bestod: åtte databasereiser (ni testnoder), fem sikkerhetsprøver (seks testnoder) og én gjenopprettingsprøve. Disse kommer i tillegg til `npm test`.
- `npm run prosjekt:sjekk` og `git diff --check`: bestått i den faktiske prosjektmappen. `.worktrees/` er nå klassifisert som ignorerte arbeidskopier, uten inngrep i den parallelle oppgaven.
- Kontrastkontrollen rapporterer **12 eksisterende avvik** som ikke stanser bygg. Grønt bygg er derfor ikke en tilgjengelighets- eller designgodkjenning.

Kontrollen gjelder den isolerte kildekopien av de lokale endringene. Ingen testbetaling hos Stripe, samlet nettleserreise mot ekte testinnlogging, ny CI-kjøring eller apputrulling er gjennomført. Full språk- og skjermkontroll gjenstår. Den midlertidige lokale PostgreSQL-tjenesten er stoppet etter prøvene; testklyngen er bevart lokalt.

### Designpakken som kom under arbeidet

[ZIP (3)-kontrollen](claude-design-zip-3-review-2026-09-10.md) bekrefter forbedret kildelesing og blocked-rekkefølge, men også feil ved korrigering av resultater. [Ferdig tilbakemelding til Claude Design](../design-system/claude-design-zip-3-tilbakemelding.md) følger med. Ingen ny designversjon er automatisk valgt for bygging.


## Samlet arbeidsrunde etter godkjent plan

Arbeidskopi: `.worktrees/samlet-lanseringskontroll`. Utgangspunkt `50e64ae07` fra oppdatert `origin/main`. Endringssettene `664ca2118`, `c43aabf22`, `0c645d3fc` og `706c21fd3` er tatt inn i rekkefølge uten å endre den opprinnelige grenen. Vedlegg og historiske grener er bevart.

131 lokale filendringer ble sammenlignet: 100 kunne kopieres, 26 var allerede identiske og fem krevde særskilt vurdering. De nyere DataGolf/GolfBox-utvidelsene i komponent og datalastere er beholdt etter konkret sammenligning. Filregisteret er regenerert, og gjeldende statusdokumenter fra begge arbeidsløpene er bevart. Ingen av de nyere DataGolf/GolfBox-kildefilene er endret av samlingen.

### Nye rettinger funnet i sammenhengskontrollen

- Abonnementsbooking bruker samme valgte/faste coach i tilgjengelighet, låsing, lagret booking og revisjonslogg. Samtidige forsøk kan ikke bruke siste coaching-time to ganger.
- En bekreftet abonnementsbooking returneres fortsatt som vellykket når etterfølgende logg eller varsel feiler. Feil rapporteres så langt feilloggen er tilgjengelig. Dette garanterer ikke levering av e-post eller varsler; gjennomgående utsendingsprøve gjenstår.
- Coachvarsler sendes til coachen som faktisk er lagret på bookingen, med tjenestecoach som reserve for eldre bookinger. Klokkeslettet forskyves ikke en ekstra gang. Én feilet mottaker hindrer ikke de øvrige.
- E-postens 24-timersfrist bruker samme reelle tidsberegning som avbestillingsregelen, også ved overgang til sommer-/vintertid.
- Fullførte og ubesvarte økter foreslås ikke som neste startbare økt. En økt som spilleren har skjult, kan ikke åpnes gjennom spillerens direkte detaljlenke.
- Måldetalj krever eierskap, administrator eller konkret coachtilknytning. Fremdrift og stige bruker mål-eierens handicap, ikke den innloggede coachens. Ukjent handicap blir ikke presentert som null.
- Gammel høyere-er-bedre-poengberegning brukes ikke på nye Team Norway-mål. Resultatene er fortsatt tilgjengelige i testhistorikken; automatisk målfremdrift venter på en uttrykkelig kontrakt for variant, antall, enhet, retning og utgangspunkt.

### Språk og faglig avgrensning

Synlige tekster er gjennomgått i de berørte booking-, forelder-, mål- og gjennomføringsreisene, samt kodebaserte booking-/planvarsler. «Staff», «resettes», «seed-data» og rå engelske valideringsfeil er erstattet i de berørte inngangene. Avbestillingsteksten omfatter nå også nøyaktig 24 timer, i samsvar med uendret forretningsregel. Gjeldende «coach» og «drill» beholdes; et eventuelt generelt navnebytte må samordnes med designarbeidet.

Dette er ikke en godkjenning av all tekst på 479 ruter. Aktive e-postmaler ligger også i databasen og er ikke hentet eller endret. Samtykketekster og full visuell kontroll gjennomgås med valgt design og riktig testinnlogging.

Mål, planer og Workbench er fortsatt forskjellige modeller. `SESSION_FREQUENCY` teller gjennomføringslogger fra TrainingPlanSession, mens Workbench mangler et eget varig fullføringstidspunkt. Denne samlingen gjetter ikke fullføringsdato fra planlagt dato eller sist redigert tidspunkt. En komplett kobling til frekvensmål krever eget avklart datagrunnlag. Ingen ny databasekolonne eller omberegning av historikk er utført. De 11 uavklarte TN-variantene forblir råutkast.

### Sluttresultat for samlet kandidat

- `npm run verify`: bestått, inkludert typekontroll, lint, øvrige prosjektkontroller, Next-produksjonsbygg og Serwist.
- `npm test`: **2 283 tester bestått** (2 280 kildekodetester og tre komponenttester), null feil eller hoppet over. Kjørt etter avsluttet verify.
- Lokale integrasjonsprøver: ti databasereiser (11 testnoder), fem funksjonssikkerhetsprøver (seks testnoder) og én gjenopprettingsprøve bestod. Disse er separate fra `npm test` og ble kjørt sekvensielt etter testpakken.
- 2 986 kilde-/testfiler er kontrollert uendret mellom sluttbygg og testavslutning. Samlet kildefingeravtrykk: `4022ffbff823601ad5e8075be38c061bc7018f43b9dbd63b4491e53a7e439b8e`.
- Alle 131 opprinnelige filendringer i hovedarbeidsmappen er kontrollert uendret. De 49 kildefilene fra DataGolf/GolfBox i main er identiske med `50e64ae07`.
- Prosjektstruktur, dokumentlenker og diffkontroll bestod. Ingen private miljøfiler er kopiert til arbeidskopien. Ingen kunde-/spillerdata er brukt i testene.
- Tolv eksisterende kontrastavvik rapporteres fortsatt av kontrollen; dette er ikke en visuell godkjenning.

Kandidaten overleveres stabil til merge-oppgaven. Etterfølgende kontrast- og GolfBox-historikkpatcher tilhører den oppgaven og krever ny samlet sluttkontroll før publisering. Denne oppgaven har ikke utført commit, push, PR, merge, produksjonsendring eller åpning av booking. Lokal testdatabase er stoppet etter prøvene; testklyngen er bevart.


## Sluttkontroll etter samling av grenrester

Den stabile kandidaten over er supplert med 150 filer med kontrastretting fra den eldre kontrastgrenen, seks GolfBox-filer for sesongstøtte, og arkiv/oversikt over alle gamle grener og fire stasher. Nyere TallHero og #833s GolfBox-identitet er bevart. Detaljer: [grenregnskap](grener-og-main-2026-09-10.md).

- Full `npm run verify` bestod på denne sluttkoden: Prisma, typer, lint, prosjektporter, Next-produksjonsbygg og Serwist.
- Deretter bestod `npm test`: **2 290 tester** (2 287 kildekodetester og tre komponenttester), null feil eller hoppet over.
- Deretter bestod ti lokale databasereiser (11 testnoder), fem funksjonssikkerhetsprøver (seks testnoder) og én gjenopprettingsprøve. Gjenopprettingen bevarte 196 tabeller, booking og kollisjonsvern; den lille lokale prøven tok 0,946 sekunder, ikke en måling av produksjonsgjenoppretting.
- 3 104 src-/test-/Prisma-/byggkonfigurasjonsfiler er uendret under sluttkontrollen. Fingeravtrykk: `d4bd39a3d6393bc437e8bd5fd3f9b2ac2e140ff8c60f5b8b7839546979379ee6`. GolfBox-oppgavens seks filer er også uavhengig kontrollert byte-identiske med dens testede patch.
- Kontrastens begrensede komponentprøve ved 390/1440 px i lyst/mørkt tema bestod; se grenrapporten. Dette er ikke en helskjerm- eller designgodkjenning. De tolv kjente avvikene i selve fargeparene er fortsatt rapportert, siden tokenverdiene er uendret.
- Ingen skjemamodell, produksjonskonfigurasjon eller `vercel.json` er endret. CI får den samme prosjektstruktur-/dokumentlenkekontrollen som lokalt. Ingen import, testbetaling eller produksjons-SQL er kjørt.

Kjøringene er logget separat under `/tmp/ak-hq-final-*.log` med egne resultatfiler. Etterfølgende dokumentoppdatering beskriver disse resultatene; kildekoden beholdes uendret. GitHub-kontroll, Vercel-preview og faktisk produksjonscommit må dokumenteres separat av publiseringsoppgaven. Åpne fag-, design-, testinnloggings- og lanseringspunkter fra rapporten er fortsatt åpne.
