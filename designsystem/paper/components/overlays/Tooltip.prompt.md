# Tooltip

Ren teksthjelp ved hover og fokus. Mono, blekk-flate, ingen handlinger.

## Regelen som bestemmer bruken
**Ingen informasjon får finnes kun i en tooltip.** Den er repetisjon eller
presisering av noe som allerede står, eller en hurtigtast. Grunnen er målt inn
i CSS-en: ved grov peker finnes ingen hover, og laget skjules i
`akhq-container`. Skjules noe som var eneste kilde til meningen, er skjermen
ødelagt på telefon uten at noen ser det på desktop.

## Kontrakt
- `aria-describedby` kobler teksten til utløseren mens den vises.
- Escape lukker (WCAG 1.4.13), og teksten har ingen auto-skjuling på tid.
- `pointer-events: none` på laget: tooltipen stjeler aldri et klikk.
- Nøyaktig ett fokuserbart barn. Er barnet ikke fokuserbart, når ingen
  teksten med tastatur, og du skal skrive den i innholdet i stedet.
- Aldri handlinger, lenker eller skjemafelt inni → `Popover`.

## Målt
Skjult ved `pointer: coarse` [målt 31.07]. Ingen treffmålskrav — laget mottar
ingen klikk.
