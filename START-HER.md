# AgencyOS-sporet — START HER

Dette er den **isolerte worktreen for AgencyOS** (coach-appen, `/admin`). Egen gren: **`design/agencyos`**.
PlayerHQ-sporet jobber parallelt i `~/Developer/akgolf-hq` på `design/komplett` — ikke rør hverandres filer.

## Kjør (denne sesjonen)
```bash
npm run dev -- -p 3001     # MÅ være 3001 (PlayerHQ bruker 3000)
```
Appen: http://localhost:3001/admin

## Innlogging (coach/admin)
- **coachtest@akgolf.test** / **Screentest123!** (Anders Kristiansen, ADMIN — full /admin-tilgang)
- (PlayerHQ-spilleren screentest@akgolf.test er PLAYER og når ikke /admin.)

## Oppgave
Fase 3 + 4 i `docs/plan-komplett-skjermer-2026-06-10.md`:
- **Fase 3 — AgencyOS desktop:** port alle ~26 nav-skjermer fra fasiten
  `public/design-handover/AK Golf HQ Design System/agencyos-app/` (mørkt tema, desktop-only).
  Følg `.claude/rules/design-porting-gate.md` — kritiker-agent per skjerm → 0 avvik.
- **Fase 4 — AgencyOS mobil:** NET-NEW (ingen fasit). Bygg fra designsystem + desktop-innhold
  + PlayerHQ-mobilmønstre (mørkt). Selv-review + brand-enforcer i stedet for paritet-gate.

## Verktøy
- `scripts/agencyos-shot.mjs` finnes (window.__ag-basert — sjekk om den må byttes til klikk-nav som design-shot.mjs).
- `scripts/app-shot.mjs` tar app-skjermbilder (desktop 1280) — login + ruter. Bruk coach-login + /admin-ruter.

## Filgrenser (unngå konflikt med PlayerHQ-sporet)
- DITT: `src/app/admin/`, `src/components/admin*`, AgencyOS-spesifikke lib-er.
- IKKE RØR: `src/app/portal/`, `src/components/portal*`.
- Delt (vær forsiktig — koordiner): `src/app/globals.css`, `src/components/athletic/`, `prisma/`.

## Når ferdig
Merge `design/agencyos` → `design/komplett`. Dobbeltsjekk at du ikke drar inn utdaterte filer.
