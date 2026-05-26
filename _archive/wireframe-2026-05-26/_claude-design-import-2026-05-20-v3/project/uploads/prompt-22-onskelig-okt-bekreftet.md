# Prompt 22 — Ønskelig økt bekreftelses-side

## Hensikt

Etter at Markus sender inn `/portal/onskeligokt` (ønske om coach-økt), redirectes han til `/portal/onskeligokt/bekreftet` som viser kvittering, neste steg, og forventet respons-tid.

## Trigger

Server action submit fra ønske-skjema.

## Layout

- Full-page container 720 px, cream, sentrert, `py-16`.
- Hero-ikon: Lucide Send i lime-circle 80×80.
- Eyebrow "PLAYERHQ · ØNSKE SENDT".
- Tittel Inter Tight 32 px italic "*Sendt til coach*"
- Sub: "Anders K har fått ønsket ditt og svarer normalt innen 24 timer på hverdager."
- Sammendrag-card secondary:
  - Type økt (Performance / Pro / Live)
  - Foretrukne dager (pills)
  - Foretrukne tidspunkt (pills)
  - Fritekst-notat
- Tidslinje "Hva skjer nå":
  - Steg 1 ✓ "Du sendte ønske" (lime check)
  - Steg 2 "Coach foreslår tider" (kommer)
  - Steg 3 "Du bekrefter" (kommer)
  - Steg 4 "Time er booket" (kommer)
- Knapper:
  - Primær forest "Tilbake til hjem"
  - Outline "Send melding til coach"
  - Outline "Se andre coacher"

## Komponenter

- `Card`, `Timeline`, `Button`
- Lucide: Send, Check, Clock, MessageSquare, Home, Users

## Eksempel-data

```
Type: Performance Coaching 60 min
Dager: Tirsdag, Torsdag
Tidspunkt: 16:00–18:00
Notat: "Vil jobbe med iron contact før Olyo 5. juni"
Estimat respons: innen 24 t
Coach: Anders Kristiansen
```

## Branding-krav

- Lime sjekk-ikoner aktive steg, muted for fremtidige.
- Inter Tight italic på "Sendt til coach".
- Norsk bokmål.

## Tilstander

- **Coach allerede svart**: vis melding-snippet inline.
- **Mer enn 24 t**: gul-card "Tar lenger tid enn vanlig — vil du purre?"
