# Combobox

Fritekst som filtrerer et sett. Spillere, drills, fasiliteter, kunder.

## Fokusunntaket, forklart
Alle andre lag i systemet flytter fokus inn i seg selv gjennom
`useOverlayLayer`. Combobox gjør det ikke, og det er ikke en forglemmelse:
ARIA-mønsteret for combobox krever at fokus blir i feltet mens
`aria-activedescendant` peker på den aktive raden. Flyttes fokus, slutter
skriving å virke.

Regelen «skriv aldri en egen fokusfelle» brytes ikke: laget har ingen
tabbbare noder, så det finnes ingen felle å skrive. Escape og klikk utenfor
er implementert med samme oppførsel hooken gir de andre lagene.

## Kontrakt
- Feltet er styrt. Komponenten holder ingen skyggeverdi — konsumenten eier
  teksten, og filtreringen er avledet.
- Radene velges med `pointerdown` + `preventDefault`, ikke `click`, så
  feltet ikke mister fokus mellom trykk og valg.
- Tomt filter viser hele settet. Uten treff vises `emptyText` — aldri en tom
  boks.
- Gulv: felt 36 px, rad 32 px, begge til 44 px ved grov peker.

## Målt
Felt 36,0 / rad 32,0 px synlig, begge 44,0 px ved grov peker
[måles i `forms-p2.card.html`].
