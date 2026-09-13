# P0-TEST — status 12.09.2026 natt

Porten P0-TEST er **bestått lokalt på arbeidsgrenen**, men er ikke ferdigregistrert før endringen er godkjent og merget. Egen HQ-Supabase og alle tre innloggede øktreiser er prøvd. [Kontroll](p0-test-innlogget-reise-2026-09-12.md).

## Hva som er på plass

- Docker kjører. WANG-stacken eier 54321–54324 og er urørt.
- HQ-stacken eier 54421/54422 med HQ-skjema (196 tabeller) og syntetiske roller.
- `.env.local` leses ikke. Innlogget Portal krever `VEDLIKEHOLD=0` i Next-prosessen.

## Isolert Postgres uten innlogging

Isolert HQ-testdatabase på `127.0.0.1:54379` er fortsatt evidens for gjenoppretting og lanseringsreiser uten GoTrue. [Kontroll](docker-launch-tester-2026-09-12.md).

## Neste for P0-TEST

Kjør full prosjektgate og få arbeidsgrenen godkjent. Etter merge kan masterplan og Notion oppdateres som ferdig. Kritiske prøver skal fortsatt feile stengt hvis oppsettet mangler, ikke hoppes over.
