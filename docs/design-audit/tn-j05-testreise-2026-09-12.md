# J05 — Team Norway testreise, teknisk kontroll 12.09.2026

Gren: `grok/j05-tn-testreise-2026-09-12`. Ingen visuell portering. Ingen migrasjon, produksjonsdata, betaling eller utrulling.

## Valgt pakke

P0-TEST mot isolert Next-/database er fortsatt blokkert uten Docker. Denne leveransen tar neste uavhengige hull: J05, test tildeles → føres → korrigeres/angres → historikk. Den overlapper ikke PR #852–857 (forelder, booking, Plan/Live-frekvens, runde/SG/TrackMan, bred handlingstilgang, O13).

## Hva som er prøvd

Syntetiske roller uten personopplysninger: spiller, tillatt coach, annen spiller. Ingen testdatabase.

- Coach tildeler versjonert `tn-v3-putt-1-3m` til egen spiller og varsler med Team Norway-lenke.
- Uavklart protokoll, gammel TN-rad og spiller utenfor coachens omfang tildeles ikke.
- Spilleren kan rette utkast, angre med abort, og fullføre i en ny økt.
- Fullført økt kan ikke overskrives. Nytt forsøk legger til historikk og bevarer første resultat og tildelingens resultatkobling.
- Uvedkommende kan ikke føre den tildelte økta eller lukke tildelingen.
- Coach-listen viser bare sammenlignbare resultater for samme variant.

## Ikke påstått

- Innlogget Next-reise mot isolert testdatabase.
- Etterfølgende revisjonshistorikk i samme økt-rad (krever produktvalg og sannsynlig skjema).
- Visuell godkjenning eller valgt Claude Design-fasit.
