# Redis-gjenoppretting — 01.10.2026

## Årsak og tiltak

Upstash-kontoens Redis-liste viser «ak golf hq» som DELETED. Dialogen opplyser
at gratisdatabaser slettes automatisk etter 14 dager uten aktivitet. Produksjonen
logget `fetch failed` og brukte lokal reserve. Vercel-variablene finnes, men er
skjult; lokal CLI returnerer maskering, ikke de faktiske nøklene.

Gratis erstatning `akgolf-hq-rate-limit` er opprettet i London (eu-west-2),
samme region som den slettede tjenesten. Konto, abonnement og region er
kontrollert i Upstash. Ingen nøkkelverdier eller persondata er dokumentert.
Upstash-integrasjonen er installert med tilgang til kun prosjektet `akgolf-hq`.
Den opprettet `REDIS_URL` for Production og Preview. De eldre, manuelt
opprettede REST-variablene er bevart som reserve og er ikke lest eller logget.

## Kode og kontroll

`src/lib/rate-limit.ts` prøver Redis igjen etter 60 sekunder ved feil.
Bare ett gjenforsøk kjører samtidig; øvrige kall bruker eksisterende lokal
reserve mens forsøket pågår. Redis-avslag returneres uendret. Lukket feilmodus
(`RATE_LIMIT_FAIL_CLOSED=1`) kaster fortsatt feil. Logger inneholder ikke rå
Redis-feil eller klientnøkler (som kan inneholde IP eller brukeridentifikator).

En felles Redis-konfigurasjon prioriterer den nye integrasjonens krypterte
`REDIS_URL` og støtter eldre REST-variabler som reserve. Den brukes av
trafikkbegrensning, bookinghold, bookingmålinger og varselbegrensning. Ingen
nøkkelverdi sendes til klienten eller skrives til logg.

Seks gjenopprettingstester kontrollerer Redis-avslag, lokal begrensning under avbrudd,
gjenoppretting, gjentatte feil, samtidige gjenforsøk, lukket feilmodus og logger.
Fire nye konfigurasjonstester kontrollerer integrasjonsvariabel, prioritet,
reserve og avvisning av ukryptert/ufullstendig URL. Full `npm run verify` bestått
med Node 24.14.0: 3886 enhets-/modultester + 14 komponenttester (3900 totalt),
alle statiske kontroller, TypeScript/Next-bygg og Serwist. Ingen hoppede tester.
Ingen ekte booking, betaling eller utsending er brukt som prøve.

Den nye tjenesten svarer `PONG` på lesende `PING` i Upstash-konsollen. Appens
felles Redis-klient svarer også `PONG` med Preview-integrasjonens konfigurasjon.
En forhåndsvisning før kodekoblingen bekreftet forventet lokal reserve; ny
forhåndsvisning og produksjonsbruk skal kontrolleres etter commit. Den gamle
sikkerhetskopien fra 07.09.2026 er bevart og ikke importert; ingen påstand om
gjenopprettet historikk. Gratisplanens inaktivitetsregel består; gjenforsøk i appen kan ikke
gjenopprette en tjeneste som leverandøren har slettet. Betalt abonnement er
ikke opprettet. Redis brukes også til korte bookingreservasjoner, telling av
bookinghendelser og begrensning av Slack-varsler; disse er ikke hoveddatabasen.
