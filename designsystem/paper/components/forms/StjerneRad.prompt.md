# StjerneRad

1–5-vurderingsrad med SVG-stjerner. Spillerens egen vurdering, aldri en
systemgenerert karakter.

## Når den ikke skal brukes
Objektive tall (SG, testresultat) — de vises som tall (`--mono`), ikke som
stjerner. Stjerner er kun for subjektiv egenvurdering.

## Kontrakt
- `role="radiogroup"` / `role="radio"` — ett valg, ikke flere stjerner
  trykkbare samtidig som et flervalg.
- Fylt stjerne er `--fg`. `--accent` (oransje) brukes aldri — den er
  reservert «Én ting nå»-kortet.
- Ingen minsteverdi og ingen valideringsfeil ved 0 — økten kan lagres uten
  at spilleren vurderer seg selv.
- Knappen er 32 px synlig, 44 px ved grov peker; selve SVG-stjernen er
  22 px inni knappen slik at treffsonen er større enn tegnet ikonet.

## Målt
Knapp 32,0 px synlig / 44,0 px ved grov peker. Stjerne-SVG 22×22 px.
