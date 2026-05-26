# CoachHQ — Tester (stall-side)

**Rute:** `/admin/tester`.

## Kontekst
Anders bruker faste tester for å måle fremgang (10m putt-test, 100m wedge-test, fysisk core-test). Hver spiller skal tas hver 4-8 uke. Side for å se hvem som er forfalt.

## Formål
- Liste alle tester med forfallsdato per spiller
- Markere kommende, forfalt, fullført
- Snabbsekken: "schedule for hele stallen denne uka"

## Layout

**Header:**
- "Tester" Inter Tight 700 32px
- "6 forfalt · 12 forfaller denne uka · 23 nylig fullført" mono
- "Schedule alle forfalt" forest fill

**Filter-strip:**
Status: Forfalt (6) | Forfaller (12) | Fullført (23) | Planlagte (8)
Test-type: Putt | Iron | Wedge | Driver | Fysisk | Mental

**Tabell:**
| Spiller | Test | Sist tatt | Forfaller | Sist resultat | Trend | Action |
|---|---|---|---|---|---|---|
| Markus | Putt 10m | 24. apr | i går (rød) | 7/12 | ↑ +1 | Schedule |

Forfalt-rader: lime-light bg.
Mono i alle tider/resultater. Hover: detalj-popover.

**Trend-mini-sparkline** i tabell-kolonne for siste 4 målinger.

**Tomtilstand:**
"Ingen tester opprettet. Definer første test for å begynne."

## Branding
Cream bg, hvit tabell, destructive-light bg på forfalt, lime trend-up.
