# P09/J07 — spørsmål-tråd tilgang, teknisk kontroll 12.09.2026

Gren: `grok/p09-sporsmal-tilgang-2026-09-12`. Ingen visuell portering. Ingen migrasjon, produksjonsdata, betaling eller utrulling.

## Valgt pakke

P0-TEST isolert restore er i main via PR #862. Åpne PR-er #858, #859, #861 og #863 røres ikke. Neste hull: spørsmål-tråden lastet innhold på id alene, så en innlogget bruker kunne lese en annens spørsmål.

## Hva som er rettet

Tråden vises bare for den som spurte, tildelt coach, admin, eller coach med tilgang når spørsmålet er i åpen kø. Svar og liste følger samme grense. Navn hentes først etter tilgangssjekk.

## Ikke påstått

- Binding av spørsmål til en konkret økt.
- Innlogget Next-reise.
- Visuell godkjenning.
- Masterplan er ikke oppdatert her, fordi #863 allerede endrer de filene.
