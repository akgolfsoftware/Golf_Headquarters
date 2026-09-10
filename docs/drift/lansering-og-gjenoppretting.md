# Lansering og gjenoppretting

Arbeidsoppskrift 10.09.2026. En lokal gjenopprettingsprøve med syntetiske data er gjennomført; produksjonsgjenoppretting og lansering er ikke gjennomført.

## Før åpning

- Kjør `node scripts/launch-preflight.mjs`. Rapporten viser bare tilstedeværelse og modus. Bruk separat testmiljø til prøver som skriver data.
- Kjør `npm test` og `npm run verify` på kandidaten. Registrer commit, tidspunkt og resultat i kontrollrapporten.
- Prøv bestilling/betaling og trening fra start til slutt med syntetiske testkontoer. Dokumenter test-IDer i et tilgangsbeskyttet system, aldri betalingsnøkler eller kundedata i repoet.
- Verifiser `/api/health`: 200 ved fungerende database, 503 ved utilgjengelig database i testmiljøet. Bekreft at en faktisk alarm kommer fram til driftsansvarlig. Ingen alarmtjeneste er opprettet av denne oppskriften.
- Kontroller planlagte jobber for bookingrydding og ny behandling av feilede betalingshendelser. Provoser en feil i testmiljøet og bekreft at jobben faktisk rydder/prøver på nytt.
- Bekreft sikkerhetskopiens tidspunkt, oppbevaring og hva den dekker i Supabase. Database, filvedlegg og miljøoppsett må vurderes hver for seg. Ikke anta at en databasekopi inkluderer lagrede filer.

## Gjenopprettingsprøve

1. Velg en separat tom testdatabase og en konkret sikkerhetskopi. Registrer starttid og forventet datatidspunkt.
2. Gjenopprett dit, uten å overskrive aktiv database. Migrasjonshistorikken i dette repoet er ikke tilstrekkelig til å bygge hele databasen fra null.
3. Kontroller tabeller, radbasert tilgang, funksjoner, relasjoner, innlogging og filvedlegg. Slå av e-post, kalender og ekte betaling i prøven.
4. Kjør testreisene og mål faktisk tid til brukbar app. Registrer siste bevarte data og avvik; Anders må vurdere om mulig datatap og gjenopprettingstid er akseptable.

## Tilbakeføring ved feil

- Behold identifikatoren til forrige verifiserte utrulling før ny kode publiseres.
- Steng nye offentlige bestillinger ved betalingsfeil; behold mottak og behandling av allerede innkomne betalingshendelser.
- Før tilbakeføring av appen: kontroller at tidligere kode fortsatt forstår nåværende skjema og lagrede data. En app-tilbakeføring tilbakefører ikke databasen.
- For RLS-rettingen i denne runden er opprinnelig tilstand registrert i kontrollrapporten. Ikke slå av tilgangsvernet som automatisk feilretting: det gjenåpner direkte datatilgang. Avklar berørt funksjon og rett riktig server-/klienttilgang først.
- Etter tilbakeføring: prøv innlogging, en lesereise, helsesjekk og håndtering av betalingshendelser. Registrer årsak, tidspunkt og hvem som besluttet tilbakeføringen.

## Bevis som må fylles inn

| Kontroll | Status |
|---|---|
| Varsling ved faktisk driftsfeil | Ikke prøvd |
| Ny behandling av feilet betaling i testmiljø | Ikke prøvd |
| Sikkerhetskopiens dekning og tidspunkt | Ikke verifisert |
| Gjenoppretting til separat miljø | Lokal prøve bestått: 196 tabeller, bevart booking og kollisjonsvern. Produksjonskopi gjenstår |
| Målt gjenopprettingstid og datatap | Lokal liten testdatabase: 2,59 sekunder, syntetisk booking bevart. Produksjon ikke målt |
| Tilbakeføring av utrulling med kompatibelt skjema | Ikke prøvd |


## Lokal testoppskrift og avgrensning

Testene ligger i `tests/integration/`. De krever eksplisitt `LAUNCH_TEST_DATABASE_URL`, og avviser andre mål enn `127.0.0.1:54379/ak_hq_launch_tests`. De leser ikke `.env.local`. Nettleserinnlogging er erstattet med en kontrollert testidentitet; e-post, Google Calendar og varsling er erstattet med testfunksjoner. Dette er en funksjonsprøve av server og database, ikke en bekreftelse på at eksterne integrasjoner virker.

Kjør `launch-database.test.ts` med Node, `--import tsx --conditions=react-server --experimental-test-module-mocks --test`. Sikkerhet og backup kjøres med `node --test` på hver `.mjs`-fil. Kjør filene sekvensielt. Backup krever også `LAUNCH_TEST_PG_BIN` med lokal PostgreSQL-verktøysti. URL/nøkler legges i prosessmiljøet fra tilgangsbeskyttet lokal fil, aldri i kommandohistorikk, dokumenter eller testlogger.

Den lokale klyngen ligger i `/tmp/ak-hq-launch-pg-20260910`. Appskjemaet ble generert fra Prisma med `migrate diff --from-empty --to-schema prisma/schema.prisma --script`; dette er lokal SQL-generering, ikke migrering av produksjon. pgvector er ikke installert lokalt; to vektorkolonner er substituert bare i testskjemaet. Bookingvernet `booking_coach_no_overlap` og `btree_gist` ble lagt til eksplisitt. En ny maskin trenger tilsvarende lokal rigg før testene kan kjøres.

Den midlertidige tjenesten er stoppet etter sluttkontrollen 10.09.2026. Klyngen og den beskyttede lokale testkonfigurasjonen er bevart for neste testøkt; ingen produksjonsnøkler er kopiert inn.

Før Vercel-utrulling anbefales oppgradering av CLI fra den meldte 56.3.1 til gjeldende 59.15.1 eller nyere med `npm i -g vercel@latest`. CLI er ikke oppgradert eller brukt til deploy i denne arbeidsøkten.
