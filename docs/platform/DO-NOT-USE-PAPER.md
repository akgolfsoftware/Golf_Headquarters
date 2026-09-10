# Paper er avviklet

Paper er fjernet som designgrunnlag for hele plattformen, også markedssidene (Anders 30.08.2026). Bruk [designfasit per flate](../../designsystem/README.md).

Ikke gjenopprett `designsystem/paper/`, `src/lib/v2/tokens.ts`, `--p-*` eller det gamle markedssettet. Historiske Paper-verktøy ligger sperret i `scripts/arkiv/design-foer-train-lock/`. Den gamle offentlige tokenfilen ligger i dokumentarkivet, utenfor `public/`.

`scripts/check-ingen-paper.mjs` kontrollerer forbudte importer, variabler og filnavn i `src/`. Det er en teknisk kontroll, ikke en vurdering av om en skjerm ser riktig ut. Følg `tests/visual/README.md` for den visuelle kontrollen.
