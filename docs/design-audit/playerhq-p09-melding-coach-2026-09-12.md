# P09/J07 — melding til riktig coach, teknisk kontroll 12.09.2026

Gren: `grok/p09-melding-riktig-coach-2026-09-12`. Ingen visuell portering. Ingen migrasjon, produksjonsdata, betaling eller utrulling.

## Valgt pakke

P0-TEST mot isolert base pågår i PR #862 og dupliseres ikke her. J05, P09-økt og J14 ligger i åpne PR-er. Neste uavhengige hull: spiller kunne sende coach-melding til en vilkårlig coach-id, og siden falt tilbake til første coach i systemet.

## Hva som er rettet

Meldingen krever aktiv tildeling til akkurat den coachen, og at mottakeren er coach. Uten tildeling vises eksisterende tom tilstand. Ingen tilfeldig coach velges.

## Bevisstatus

Bygget og testet i denne leveransen. Ikke innlogget prøvd. Ikke sett av Anders. Ikke flettet. Ikke publisert.

## Ikke påstått

- Binding av fri melding til en konkret økt (krever produktvalg og sannsynlig skjema).
- Innlogget Next-reise.
- Visuell godkjenning.
