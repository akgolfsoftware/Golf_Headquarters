# Select

Naken valgkontroll på en ekte `<select>`. Etikett, hint og feil bor i
`FormField` — samme regel som `TextInput`.

## Hvorfor native
Systemets egen liste er raskere og mer tilgjengelig på telefon enn en tegnet
meny, og den følger tastatur, skjermleser og pekeroppførsel gratis. Et
designsystem tjener ingenting på å tegne den på nytt; det taper oppførsel.

Bytt til `Combobox` når listen trenger søk eller har mange rader, og til
`Radio` når valgene er få og skal sees samtidig (2–4, korte).

## Kontrakt
- Gulv: 36 px synlig, `max()` til 44 px ved grov peker.
- `aria-invalid` settes av `FormField`, aldri av kontrollen selv.
- Pilen er `pointer-events: none` og `aria-hidden` — den er dekor over en
  ekte kontroll, ikke en knapp.
- `placeholder` gir en tom `<option>`. Bruk den kun når «ikke valgt» er en
  gyldig tilstand; ellers er den en feilkilde.

## Målt
36,0 px synlig / 44,0 px ved grov peker [måles i `forms-p2.card.html`].
