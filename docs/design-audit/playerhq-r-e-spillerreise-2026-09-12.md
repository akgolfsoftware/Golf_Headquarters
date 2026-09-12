# R-E — innlogget spillerreise, teknisk kontroll 12.09.2026

Gren: `grok/r-e-innlogget-spillerreise-2026-09-12`. Ingen visuell portering. Ingen migrasjon, produksjonsdata, betaling eller utrulling.

## Hva som er prøvd

Samme økt-ID, modell og registrerte tall følges gjennom I dag → Plan → øktark (PH-04/brief) → Live (PH-05) → oppsummering (PH-06) → gjenåpning for **TrainingSessionV2**, **WorkbenchSession** og eldre **TrainingPlanSession**. Egen spiller og tillatt coach slipper inn. Uvedkommende coach/spiller avvises uten øktinnhold. Planlagt / pågående / fullført / avbrutt holdes atskilt fra usent / lagrer / lagret / feilet.

Kritiske prøver er enhetstester med syntetiske roller. De hopper ikke over manglende oppsett.

## Isolert testdatabase — blokkering

[Oppskriften](../utvikling/lokal-testdatabase.md) gjelder bare en tom Cursor Cloud-VM med Docker og lokal Supabase. På denne maskinen 12.09.2026:

- Docker-daemon var ikke tilgjengelig.
- Ingen Postgres svarte på `127.0.0.1:54322` eller `127.0.0.1:5432`.
- `.env.local` peker på den hostede basen og skal ikke kopieres inn i worktree eller brukes til seed/push.

Derfor er det **ikke** startet isolert Next-app mot tom testdatabase. Innlogget nettleserreise og e2e med `E2E_TEST_USER_*` er **ikke** bevis i denne leveransen. Eksisterende e2e `tests/e2e/idag-start-recap.spec.ts` hopper over uten innlogging og telles ikke som R-E-bevis.

## Teknisk retting

V2-øktarket `/portal/gjennomfore/[id]` slapp tidligere inn alle med rollen COACH eller ADMIN. Det er endret: innsyn krever eier, tildelt coach/vert, akseptert/møtt deltaker, eller `canAccessPlayer`. Avvist invitasjon gir ikke innsyn.

## Ikke påstått

- Visuell godkjenning eller valgt Claude Design-fasit.
- Full innlogget Next-/database-reise.
- Lanseringsklar app.
