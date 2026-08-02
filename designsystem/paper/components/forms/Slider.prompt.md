# Slider

Skyvekontroll for omtrentlige verdier, alltid med tallet ved siden av.

## Når den ikke skal brukes
Når tallet må treffes eksakt. En slider som krever presisjon er et tastatur
uten taster — da er kontrollen et tallfelt. Ukevolum 4–8 t er en slider;
klubbhastighet 41,3 m/s er det ikke.

## Kontrakt
- Avlesningen er obligatorisk og mono med tabulære siffer, så tallet ikke
  hopper mens man drar.
- `aria-valuetext` gjentar verdien med enhet — skjermleseren skal ikke lese
  «6» når skjermen sier «6 t».
- Sporet er 4 px, håndtaket 18 px, men treffsonen er inputens egen høyde:
  24 px synlig, 44 px ved grov peker via `max()`.
- `tone` er datasemantikk, ikke dekor: bruk den bare når verdien i seg selv
  er over eller under et krav.
- `note` bærer konsekvensen («periodens maks er 8 t»), ikke en gjentakelse
  av tallet.

## Målt
Input 24,0 px synlig / 44,0 px ved grov peker [måles i `forms-p2.card.html`].
