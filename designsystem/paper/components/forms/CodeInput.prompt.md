# CodeInput

Engangskode i separate ruter. Bygget fordi Auth-malen krever den, og fordi
seks ruter uten limestøtte er verre enn ett felt.

## Det som gjør komponenten verdt å ha
Koden kommer fra en SMS eller en autentikator, og limes som én streng.
Fordeler den seg ikke over rutene selv, må folk klippe den i seks biter for
hånd. Liming i hvilken som helst rute fyller fremover derfra; `autocomplete:
one-time-code` på første rute gir iOS-forslaget over tastaturet.

## Kontrakt
- `role="group"` med skjult gruppeetikett («Engangskode, 6 siffer»), og hver
  rute annonsert som «Siffer 3 av 6». Uten det leses seks navnløse felt.
- Backspace i en tom rute går bakover og tømmer forrige — det er det folk
  forventer, og alternativet er en rute som ikke lar seg rette.
- Fokus markerer innholdet (`select()`), så et nytt siffer erstatter i stedet
  for å legges til.
- `inputMode="numeric"` gir talltastatur uten å sperre for autofyll.
- Høyden er gulvet: 52 px, og aldri under 44 px. Under 340 px container
  krymper skriftstørrelsen, ikke høyden.
- Feiltilstanden er `--dn` ramme. Rød finnes ikke i systemet.

## Målt
Rute 52,0 px høy [måles i `forms-p2.card.html`].
