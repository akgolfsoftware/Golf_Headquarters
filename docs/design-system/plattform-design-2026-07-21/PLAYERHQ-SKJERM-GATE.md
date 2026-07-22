# PlayerHQ skjerm-gate

Oppdatert 2026-07-22 (komplett redesign-gate).

**Mål:** Alle PlayerHQ-ruter = V2/B eller redirect til V2.

## Resultat: 0 GAP

| Kategori | Antall | Status |
|---|---|---|
| Aktive sider (ikke legacy) | 130 | V2, redirect eller fullskjerm live |
| Legacy-ruter | 35 | 32 redirect + 3 allerede V2 i legacy-mappe |
| V2-komponenter | 117 | `src/components/portal/v2/` |
| Gammel PlayerHero-UI på aktive sider | 0 | — |

## Ferdig definisjon (oppfylt)

1. Spilleren lander **ikke** på gammel legacy-UI.
2. Kjerneflyter (Hjem, Plan, Gjør, Analyse, Meg, Booking, Coach, Talent) er B-design.
3. Live/runde/test-gjennomføring er fullskjerm med v2-tokens.
4. Typecheck grønn.

## Legacy → moderne (eksempler)

- `/portal/ny-okt` → workbench
- `/portal/statistikk` → analysere
- `/portal/mal/sg-hub/*` → coach/sg-hub
- `/portal/tren/aarsplan` → workbench årsplan
- Coach notes/melding/øvelser → coach-hub

## Allerede V2 (bor i legacy-mappe, men er redesignet)

- `/portal/tren/aarsplan/periode/ny` — PeriodeFormV2
- `/portal/tren/aarsplan/periode/[id]/rediger` — PeriodeFormV2
- `/portal/mal/sg-hub/equipment` — UtstyrHelseV2

## Fullskjerm (ikke «gammel UI»)

Live-økt, runde live/logg, test-gjennomføring — moderne stack, v2-tokens.
