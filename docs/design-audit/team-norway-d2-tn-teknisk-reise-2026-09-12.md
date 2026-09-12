# D2-TN — teknisk test- og innsynsreise, 12.09.2026

Gren: `grok/d2-tn-teknisk-reise-2026-09-12`. Ingen visuell portering. Ingen migrasjon, produksjonsdata, betaling eller utrulling.

## Hva som er prøvd

Teknisk reise uten nytt skjermuttrykk: oversikt → gruppeposter/dokumenter → spillerpost → testføring i PlayerHQ → historikk.

- Samme protokoll, antall forsøk og versjon følger et lagret resultat. Eldre testregler telles ikke som samme variant.
- Testlenken i oversikten er bare for spillerrollen.
- Poster, dokumenter og tidslinje avviser en annen kanonisk gruppe (for eksempel WANG) selv om innlogget er trener der.
- 1:1-poster krever trener og spiller i Team Norway-gruppen, ikke et vilkårlig felles gruppemedlemskap.

Oversiktstilgang og egen testlagring fantes fra før (PR #842 og `saveTnTest`).

## Isolert testdatabase — blokkering

Samme som [R-E-kontrollen](playerhq-r-e-spillerreise-2026-09-12.md): Docker og lokal tom testdatabase mangler. Innlogget nettleserreise er ikke bevis.

## Ikke påstått

- Full visuell Team Norway-port eller D3-pilot.
- Trenerens komplette fellestestingsflate. Testføring skjer i PlayerHQ.
- Innlogget isolert reise.
