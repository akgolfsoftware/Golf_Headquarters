# Radio

Ett valg av få, alle synlige samtidig.

## Valgregelen
- 2–4 korte alternativer der sammenligningen er poenget → **Radio**.
- Filter eller visning (Uke/Måned, Alle/Mine) → **SegmentControl**.
- Fast, langt sett → **Select**. Søkbart sett → **Combobox**.
- Av/på for én ting → **Toggle** (innstilling) eller **Checkbox** (skjema).

## Kontrakt
- `<label>` er treffmottakeren og har gulvet: 32 px synlig, 44 px ved grov
  peker. Inputen er visuelt skjult, aldri `display: none` — den må kunne
  fokuseres og annonseres.
- Fokusringen tegnes på merket via `:focus-visible` på inputen, så ringen
  følger tastaturet og ikke musa.
- `note` er mono og dempet: pris, varighet eller konsekvens av valget. Den
  erstatter ikke en hjelpetekst for hele gruppen — den hører i `FormField`.
- Ingen farge. Det valgte merket er blekk, som alt annet valgt i systemet.

## Målt
Label 32,0 px synlig / 44,0 px ved grov peker [måles i `forms-p2.card.html`].
