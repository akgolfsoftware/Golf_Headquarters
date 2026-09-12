# P0-TEST — status 12.09.2026 kveld

Porten P0-TEST er **ikke bestått**. R-E del 1 (PR #845) og Caddie-eierregelen (PR #846) er i main. Innlogget Next mot lokal Supabase-innlogging er ikke kjørt.

## Eksakt blokkering for innlogget Next

[Oppskriften](../utvikling/lokal-testdatabase.md) gjelder en tom lokal Supabase-stack for HQ. Kontroll 12.09 kveld:

- Docker kjører. Stacken som svarer på 54321–54324 heter `wang-toppidrett`.
- Den har 122 `public`-tabeller og ingen `public.users`. HQ-skjema er ikke lagt inn.
- `.env.local` peker på hostet base og skal ikke kopieres inn i worktree eller brukes til seed/`db push`.

Derfor er det ikke startet HQ-Supabase, syntetiske innloggede roller mot Next, eller e2e som krever ekte innlogging.

## Hva som er prøvd i isolert Postgres

Isolert HQ-testdatabase på `127.0.0.1:54379` ble startet på nytt. Gjenoppretting, funksjonssikkerhet og 11 lanseringsreiser med testidentitet bestod. [Kontroll](docker-launch-tester-2026-09-12.md). Det erstatter ikke innlogget nettleserreise.

## Neste for P0-TEST

Egen tom HQ-Supabase-stack, syntetiske spiller-/coach-/avviste roller, og innlogget R-E-reise mot den basen. Ikke bruk WANG-stacken. Kritiske prøver skal feile stengt hvis oppsettet mangler, ikke hoppes over.
