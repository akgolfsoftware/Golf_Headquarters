# Prompt 06 — Avbestill abonnement modal

## Hensikt

Når Markus klikker "Avbestill Pro" på `/portal/meg/abonnement`, åpnes en empatisk modal som forklarer hva han mister, tilbyr pause (1/3 mnd), og samler årsak.

## Trigger

Klikk på "Avbestill abonnement" lengst nede på abonnement-siden.

## Layout

- Modal 640 × auto, cream, `rounded-2xl`, `p-10`.
- Hero: Inter Tight 28 px "Sikker på at du vil *forlate Pro*?" (italic på siste 2 ord).
- Verdi-blokk muted card med 4 mistede features (Lucide ikoner):
  - AI-coach 24/7
  - Ubegrenset live-session logging
  - SG-hub access
  - Direkte coach-melding
- Pause-tilbud `bg-primary/10 border-primary/30 rounded-lg p-6`:
  - Lucide PauseCircle ikon
  - "Pause i stedet?" Inter Tight 18 px
  - "1, 2 eller 3 måneder — ingen gebyr"
  - 3 piller å velge mellom
  - CTA "Pause i 1 måned"
- Avbestill-form:
  - Årsak Select (Pris, Bruker ikke nok, Bytter coach utenfor, Skadet, Annet)
  - Fritekst textarea
- Bunn:
  - Primær (lime) "Pause i stedet"
  - Outline destructive "Avbestill helt"

## Komponenter

- `Dialog`, `RadioGroup`, `Select`, `Textarea`, `Button`
- Lucide: X, PauseCircle, Bot, Activity, BarChart3, MessageSquare

## Eksempel-data

```
Tier: PRO 300 kr/mnd
Aktiv siden: 12. januar 2026
Pause-tilbud: 1/2/3 mnd
Refusjon: ingen — Pro varer ut betalt periode (30. mai 2026)
```

## Branding-krav

- Pause-tilbud lime aksent (mildere enn destructive).
- Forest primær.
- Norsk bokmål.

## Tilstander

- **Pause valgt**: nytt skjermbilde "Pause aktiv — kommer tilbake 24. juni".
- **Avbestill bekreftet**: lukkes + redirect til "Vi savner deg"-side.
