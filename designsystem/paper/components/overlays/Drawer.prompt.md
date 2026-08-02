# Drawer

Modalt sidelag. En midlertidig arbeidsflate — filtersett med mange felt, en
editor åpnet fra en rad — som eier oppmerksomheten til den lukkes.

## Forvekslingen som må unngås
**Artefaktpanelet er ikke en Drawer.** Panelet krymper hovedkolonnen, legger
seg ikke over den, og er aldri modalt (skallet, handoverens avsnitt 3). Det er
`Panel` på desktop og `BottomSheet` på mobil, og de to skal aldri divergere i
innhold. Drawer brukes når innholdet *skal* stenge resten ute.

## Kontrakt
- `useOverlayLayer` med `modal: true`: inert + aria-hidden på bakgrunnen,
  scroll-lås, fokusfelle, Escape og klikk utenfor på øverste lag, fokus
  tilbake til utløseren.
- Laget har `tabIndex={-1}` og får fokus når det ikke finnes noe å fokusere
  inni — samme rettelse som BottomSheet 0.4.
- Lukkeknapp 32 px synlig, 44 px `::after`-sone ved grov peker.
- Fotraden ligger utenfor skrollområdet: en handling skal aldri kreve at man
  skroller til bunns for å finnes.
- Oransje kun hvis skuffens ene viktigste handling er skjermens viktigste — og
  da har flaten bak ingen.

## Under 880 px
`akhq-container` legger skuffen i full bredde, men det er en ærlig
mellomstilling, ikke målet: konsumenten skal bytte til `BottomSheet`. Regelen
står i skallet, ikke i komponenten, fordi det er skallet som eier viewport.

## Målt
Lukkeknapp 32,0 px synlig / 44,0 px sone ved grov peker [målt 31.07].
Fokusnode til stede i laget [målt 31.07].
