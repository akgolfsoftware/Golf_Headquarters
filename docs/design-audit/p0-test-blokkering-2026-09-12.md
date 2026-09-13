# P0-TEST — status 12.09.2026 natt

Porten P0-TEST er **bestått i main via PR #865**. Egen HQ-Supabase og alle tre innloggede øktreiser er prøvd. [Kontroll](p0-test-innlogget-reise-2026-09-12.md).

## Hva som er på plass

- Docker kjører. WANG-stacken eier 54321–54324 og er urørt.
- HQ-stacken eier 54421/54422 med HQ-skjema (196 tabeller) og syntetiske roller.
- `.env.local` leses ikke. Innlogget Portal krever `VEDLIKEHOLD=0` i Next-prosessen.

## Isolert Postgres uten innlogging

Isolert HQ-testdatabase på `127.0.0.1:54379` er fortsatt evidens for gjenoppretting og lanseringsreiser uten GoTrue. [Kontroll](docker-launch-tester-2026-09-12.md).

## Neste for P0-TEST

P0-TEST er i main. Kritiske prøver skal fortsatt feile stengt hvis oppsettet mangler, ikke hoppes over. Notion kan merkes ferdig.
