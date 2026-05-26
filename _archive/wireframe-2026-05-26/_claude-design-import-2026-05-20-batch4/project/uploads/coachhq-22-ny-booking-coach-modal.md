# CoachHQ — Ny booking (coach-modal)

**Trigger:** "Ny booking" på bookinger-side.

## Kontekst
Anders booker på vegne av spiller (vanlig ved telefonhenvendelser, eller for grupper).

## Formål
- Hurtigflyt for coach-skapt booking
- Override-tilgang (ignorer kapasitet, gi rabatt)
- Send bekreftelse til spiller

## Layout
Modal 640px bredde.

**Header:**
- "Ny booking" Inter Tight 600 22px
- X høyre

**Form (vertikal):**
- Spiller: søk-dropdown over alle aktive
- Tjeneste-type: 1-til-1 Putt · 1-til-1 Iron · Gruppe · Range-økt (chip-velger)
- Dato + tid (date + time picker, sjekker konflikt live)
- Varighet (60 min default dropdown)
- Lokasjon: dropdown (filtreres etter tjeneste)
- Coach (default Anders)
- Pris (auto-utfyllt fra tjeneste, kan overstyres)
- Rabatt-felt (valgfri, prosent eller fast NOK)
- Notat-felt (vises bare for coach)

**Override-toggles (collapsed seksjon):**
- Ignorer kapasitet
- Ikke send bekreftelse-e-post
- Ikke krev betaling

**Konflikt-varsel:**
Hvis valgt slot kolliderer: rød info-bar "Konflikt med eksisterende økt 16:00-17:00 (Mikkel)" + "Erstatt" / "Velg annet tidspunkt"-link.

**Footer:**
- Outline "Avbryt"
- Filled forest "Opprett booking"

## Branding
Cream modal, hvit innhold, forest CTA, lime konflikt-fri.
