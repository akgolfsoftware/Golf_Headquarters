# Redis-gjenoppretting — 01.10.2026

## Årsak og tiltak

Upstash-kontoens Redis-liste viser «ak golf hq» som DELETED. Dialogen opplyser
at gratisdatabaser slettes automatisk etter 14 dager uten aktivitet. Produksjonen
logget `fetch failed` og brukte lokal reserve. Vercel-variablene finnes, men er
skjult; lokal CLI returnerer maskering, ikke de faktiske nøklene.

Gratis erstatning `akgolf-hq-rate-limit` er opprettet i London (eu-west-2),
samme region som den slettede tjenesten. Konto, abonnement og region er
kontrollert i Upstash. Ingen nøkkelverdier eller persondata er dokumentert.
Koblingen til Vercel er klargjort med kun prosjektet `akgolf-hq` valgt;
integrasjonsinstallasjon avventer særskilt tilgangsbekreftelse.

## Kode og kontroll

`src/lib/rate-limit.ts` prøver Redis igjen etter 60 sekunder ved feil.
Bare ett gjenforsøk kjører samtidig; øvrige kall bruker eksisterende lokal
reserve mens forsøket pågår. Redis-avslag returneres uendret. Lukket feilmodus
(`RATE_LIMIT_FAIL_CLOSED=1`) kaster fortsatt feil. Logger inneholder ikke rå
Redis-feil eller klientnøkler (som kan inneholde IP eller brukeridentifikator).

Seks nye tester kontrollerer Redis-avslag, lokal begrensning under avbrudd,
gjenoppretting, gjentatte feil, samtidige gjenforsøk, lukket feilmodus og logger.
Ni målrettede tester bestått, ingen hoppet over. Full `npm run verify` bestått
med Node 24.14.0: 3879 enhets-/modultester + 14 komponenttester (3893 totalt),
alle statiske kontroller, TypeScript/Next-bygg og Serwist. Ingen hoppede tester.
Ingen ekte booking, betaling eller utsending er brukt som prøve.

Den nye tjenesten svarer `PONG` på lesende `PING` i Upstash-konsollen.
Produksjonskobling og appens Redis-bruk er ennå ikke verifisert. Den gamle
sikkerhetskopien fra 07.09.2026 er bevart og ikke importert; ingen påstand om
gjenopprettet historikk. Gratisplanens inaktivitetsregel består; gjenforsøk i appen kan ikke
gjenopprette en tjeneste som leverandøren har slettet. Betalt abonnement er
ikke opprettet. Redis brukes også til korte bookingreservasjoner, telling av
bookinghendelser og begrensning av Slack-varsler; disse er ikke hoveddatabasen.
