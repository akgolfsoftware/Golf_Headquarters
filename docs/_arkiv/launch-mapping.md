# Launch-mapping — 15 kjerne-skjermer (design → rute → status)

> Fase A-leveranse 2026-06-01. Kobler hver launch-skjerm til v10-design-kilde + eksisterende rute.
> v10-design ligger i `public/design-handover/v10/` (gitignored). Disse 15 prioriteres for
> **pixel-perfekt** porting. Resten av plattformen forblir **funksjonell** og poleres post-launch.

## PlayerHQ (primær: mobil)

| # | Skjerm | Rute | v10-kilde (`playerhq-app/`) | Status |
|---|---|---|---|---|
| 1 | Hjem / Oversikt | `/portal` | `HomeScreen` (screens-main) | ⏳ port mot v10 |
| 2 | I dag (gjennomføre) | `/portal/gjennomfore` | `TodayScreen` | ⏳ |
| 3 | Kalender | `/portal/kalender` | `CalendarScreen` | ⏳ |
| 4 | Treningsplan | `/portal/tren/teknisk-plan` | `TrainingPlanScreen` | ⏳ |
| 5 | Mål | `/portal/mal` | `GoalsScreen` | ⏳ |
| 6 | Strokes gained | `/portal/mal/sg-hub` | `SGScreen` | ⏳ |
| 7 | Runder | `/portal/mal/runder` (+ `[id]`) | `RoundsScreen` + `RoundDetailScreen` | ⏳ |
| 8 | Meldinger | `/portal/coach/melding` | `MessagesScreen` | ⏳ |
| 9 | Profil + abonnement | `/portal/meg` | `ProfileScreen` | ⏳ |

## AgencyOS (primær: desktop)

| # | Skjerm | Rute | v10-kilde (`agencyos-app/`) | Status |
|---|---|---|---|---|
| 10 | Dashboard (cockpit) | `/admin/agencyos` | `DashboardScreen` (screens-dashboard) | ⏳ |
| 11 | Spillere (stall) | `/admin/spillere` | `PlayersScreen` (screens-stable) | ⏳ |
| 12 | Spillerprofil 360 | `/admin/spillere/[id]` | `PlayerProfileScreen` | ⏳ |
| 13 | Kalender | `/admin/kalender` | `CalendarScreen` (screens-ops) | ⏳ |
| 14 | Treningsplaner | `/admin/plans` | `TrainingPlansScreen` | ⏳ |
| 15 | Bookinger + forespørsler | `/admin/bookinger` | `BookingsScreen` + `RequestsScreen` | ⏳ |

## Prinsipp (ikke skjuling — prioritering)

De resterende ~130 skjermene **forblir synlige og funksjonelle** (de gir verdi til betalende kunder — tester, turneringer, drills osv.). Vi skjuler dem IKKE. Vi prioriterer de 15 for pixel-perfekt mot v10 først, lanserer, og poleres resten i ro etterpå mot v10-fasiten.

## Når Claude Design leverer en modul-zip
→ `public/design-handover/<modul>/` → jeg porter mot de riktige athletic-komponentene (komponent-katalogen) → DONE-gate (tsc + eslint + screenshot mot v10) → din godkjenning per batch på 3.
