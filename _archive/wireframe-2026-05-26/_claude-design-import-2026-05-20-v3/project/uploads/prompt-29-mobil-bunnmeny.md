# Prompt 29 — Mobil-bunnmeny (sticky bar)

## Hensikt

På mobil (<768 px) er sidemeny ikke optimalt. Bunnmeny gir Markus rask tilgang til 5 viktigste områder + en sentral "Logg/Start"-CTA.

## Trigger

Permanent sticky på mobil. Skjules på desktop.

## Layout

- `fixed bottom-0 inset-x-0` 72 px høy, cream med subtil top-border + backdrop-blur.
- Safe-area inset bottom (iOS).
- 5 ikonell + 1 sentral floating action:
  - Hjem (Lucide Home)
  - Plan (Lucide Calendar)
  - **Sentral CTA** — stor lime sirkel 56×56, opphøyet -8 px, Lucide Plus
  - Mål (Lucide Target)
  - Coach (Lucide MessageSquare)
- Hver ikonell: vertikal stack ikon 24 + label Inter 10 px.
- Aktiv: ikon forest + label semibold + 4 px lime prikk under.
- Inaktiv: muted-foreground.

## Sentral-CTA-meny (når klikket)

- Sheet glider opp fra bunn:
  - "Logg runde" (Flag)
  - "Ny økt" (Dumbbell)
  - "Live session" (Activity)
  - "Send melding til coach" (MessageSquare)
  - "Logg TrackMan" (Target)
- Hver som stor pill, 56 px høy.

## Komponenter

- `Sheet` (bottom), `Button`
- Lucide: Home, Calendar, Plus, Target, MessageSquare, Flag, Dumbbell, Activity

## Eksempel-data

```
Aktiv rute: /portal
Notif-prikk på "Coach" (2 nye meldinger)
Booking-prikk på "Plan" (booking i dag)
```

## Branding-krav

- Cream bar, lime sentral-CTA, forest ikoner.
- Inter for labels.
- Norsk bokmål.

## Tilstander

- **Aktiv side**: lime prikk + forest ikon.
- **Notif-badge**: liten rød prikk over ikon.
- **Scroll ned**: auto-hide etter 100 px scroll, vises ved scroll opp.
