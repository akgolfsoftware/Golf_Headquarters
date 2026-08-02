# DatePicker

Datovelger for en norsk, ukebasert planleggingshverdag.

## Tre valg som ikke er stil
- **Mandag først.** Norsk kalender. Å arve søndag-først fra et amerikansk
  bibliotek er en feil som overlever i årevis fordi den ser ut som en detalj.
- **Ukenummeret er synlig** både i utløseren og i foten. Periodeplanen,
  ukeplanen og budsjettlinjen teller uker; en dato uten uke må oversettes i
  hodet hver gang.
- **«Neste mandag» som snarvei.** Det er den vanligste datoen i systemet:
  planer publiseres til uken som kommer.

## Kontrakt
- Fokus: `useOverlayLayer` med `initialFocus: "layer"`, så skjermleseren
  hører dialogens navn før rutenettet.
- Rutenettet er roving tabindex: én dag er tabbbar, piltastene flytter
  (PageUp/PageDown fire uker), Enter velger. Måneden følger etter fokus.
- Sperrede datoer er `disabled`, ikke skjult — å skjule dem gjør det umulig å
  se hvorfor.
- Alle treffmål 44 px ved grov peker via `::after`-sone: dagene beholder sine
  34 px synlige ruter, så rutenettet ikke sprenger panelbredden.
- Ingen farge. Valgt dag er blekk på papir, i dag er en tynn ramme.

## Målt
Dag 34,0 px synlig / 44,0 px sone, utløser 36,0/44,0, navigasjonsknapp
28,0/44,0 ved grov peker [måles i `forms-p2.card.html`].
