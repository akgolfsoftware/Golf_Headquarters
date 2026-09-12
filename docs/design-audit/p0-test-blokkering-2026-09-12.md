# P0-TEST — blokkering 12.09.2026

Porten P0-TEST er **blokkert** på denne maskinen. R-E del 1 (PR #845) og Caddie-eierregelen (PR #846) er i main. Innlogget Next-/databasereise er ikke erklært ferdig.

## Eksakt blokkering

[Oppskriften](../utvikling/lokal-testdatabase.md) gjelder bare en tom Cursor Cloud-VM med Docker og lokal Supabase. Kontroll 12.09.2026:

- Docker-daemon var ikke tilgjengelig (`docker info` feilet).
- Ingen Postgres svarte på `127.0.0.1:54322` eller `127.0.0.1:5432`.
- `.env.local` peker på hostet base og skal ikke kopieres inn i worktree eller brukes til seed/`db push`.

Derfor er det ikke startet isolert testdatabase, syntetiske innloggede roller mot Next, eller e2e som krever ekte innlogging.

## Hva som likevel er prøvd uten database

- R-E: samme økt-ID gjennom I dag → Plan → øktark → Live → oppsummering for tre modeller, med avviste roller. [Kontroll](playerhq-r-e-spillerreise-2026-09-12.md).
- Caddie: kø og telling bruker eier; ukjent databasefritekst sendes ikke til modellen. PR #846.

## Neste når Docker er oppe

Følg oppskriften for tom lokal stack, opprett syntetiske spiller-/coach-/avviste roller, og kjør den innloggede R-E-reisen og Caddie-godkjenning mot den basen. Kritiske prøver skal feile stengt hvis oppsettet mangler, ikke hoppes over.
