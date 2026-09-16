# R-C — innlogget ende-til-ende-kontroll av privat lokal lagring 14.09.2026

**Oppdatert:** flettet til `main` via PR #888, merge-commit `0fd4e593d`. Ingen visuell portering, ingen produksjonsdata, ingen betaling.

Gren (opprinnelig): `codex/etter-merge-2026-09-14`, oppå PR #886/#887.

Dette lukker det eksplisitte gapet fra [`lokal-lagring-personvern-2026-09-11.md`](lokal-lagring-personvern-2026-09-11.md): «Autentisert ende-til-ende-kontroll i en ekte brukerøkt gjenstår til pakken er integrert og et egnet testmiljø er tilgjengelig.» Det testmiljøet (isolert HQ-Supabase, samme som P0-TEST) er nå tilgjengelig.

## Hva som er prøvd

Ny spec: `tests/p0/lokal-lagring-innlogget.spec.ts`. Ett scenario, ekte to-brukers-sekvens på SAMME nettleser-context — bevisst UTEN å rydde `localStorage`/IndexedDB mellom innlogginger (det ville skjult akkurat den risikoen testen skal bevise: et delt device der ingen logger eksplisitt ut).

1. Spiller A logger inn, starter sin egen Workbench-økt (`LOKAL_WB_ID`, dedikert — se isolasjonsfunn under).
2. Nettverket simuleres borte (`page.context().setOffline(true)`), spiller A tapper ett slag.
3. Lagringen feiler mot serveren og faller tilbake til IndexedDB-køen (`akgolf-offline-ko` → `tapper-ko-v2`) — «Slagene ble ikke lagret»-varselet vises, som bekrefter at fallback-veien faktisk trigges.
4. IndexedDB leses direkte via `page.evaluate`: raden er navnerommet `${eierId}:${sessionId}` med `eierId === spillerA.id`, telling `driver: 1`.
5. Nettverket kommer tilbake. Spiller A logges IKKE eksplisitt ut.
6. En FREMMED, ekte spiller logger inn på samme side/context og åpner sin EGEN Workbench-økt.
7. Fremmeds teller viser `0` — arver aldri spiller A sin kølagte telling.
8. IndexedDB leses på nytt: spiller A sin rad ligger fortsatt urørt og uendret; enhver ny rad fra fremmeds besøk er navnerommet til fremmed selv, aldri til spiller A.

Alle åtte punktene bestått. Kjørt flere ganger, både isolert og i full pakke med de tre andre P0-spec-filene (10 tester totalt): konsistent grønt for denne testen.

## Isolasjonsfunn rettet underveis

Testen brukte først den delte `WB_ID` (samme økt-id som `spillerreise-innlogget.spec.ts`). Offline-tappingen endret status til `IN_PROGRESS` og la igjen en kølagt telling på den, som fikk den andre spec-filens «start på null»-forventning til å feile når hele pakken kjøres samlet (men ikke isolert — derfor ble det ikke fanget i første forsøk). Rettet med en dedikert `LOKAL_WB_ID` for spilleren, datert i GÅR (ikke i dag) slik at den heller ikke forstyrrer «I dag»-hjemskjermens ene-økt-antakelse i samme spec-fil.

## Pre-eksisterende funn (ikke forårsaket av denne endringen)

Samme flake som i de øvrige R-E-leveransene i dag: `spillerreise-innlogget.spec.ts` sin siste test feiler av og til på ett steg, uavhengig av dette arbeidet.

## Begrensninger

- `.env.local` leses ikke. Samme midlertidige-worktree-mønster som de øvrige R-E-leveransene.
- Dekker tapper-kø-mekanismen (IndexedDB, `tapper-ko-v2`) spesifikt — ikke de øvrige lagringsmekanismene nevnt i den forrige kontrollen (liveøkt-kø, lydklipp, rundekladd/testutkast i `localStorage`, øktnotater i `sessionStorage`, service worker-cache for private ruter). Disse deler samme `eier-scope.ts`-mekanisme og samme komponenttest-dekning, men har ikke hver sin egen innloggede ende-til-ende-reise.
- Beviser at UI-laget aldri VISER en annen brukers kølagte data. Beviser ikke kryptering — en person med direkte tilgang til nettleserens utviklerverktøy kan fortsatt lese rå IndexedDB-innhold, som i den forrige kontrollen.
- Ingen visuell godkjenning. Ingen produksjonsreise. Ingen reell betaling.

## Ikke påstått

- At de øvrige lokal-lagrings-mekanismene (lydklipp, rundekladd, øktnotater, service worker-cache) har egen innlogget ende-til-ende-kontroll.
- At data er kryptert på enheten.
- At dette er lansert eller produksjonsverifisert.
