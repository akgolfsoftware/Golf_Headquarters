# Plan — resterende skjermer (2026-06-01)

> Status: 40 hovedskjermer redesignet (hele Claude Design-handoveren). Denne planen dekker de
> **resterende brukervendte skjermene** i plattformen. Elite Fase 2 (video/mental) venter — se [todo.md](todo.md).

## Scope

Av 252 ikke-redesignede «ekte» skjermer:

| Spor | Antall | Plan |
|---|---|---|
| **PlayerHQ** /portal | 80 | ✅ I scope — redesign mot athletic |
| **AgencyOS** /admin | 85 | ✅ I scope — redesign mot athletic |
| **Foreldreportal** /forelder | 8 | ✅ I scope |
| **Auth** /auth | 8 | ✅ I scope (mest på-brand alt — kun finpuss) |
| Stats /stats | 32 | ⏭️ Eget spor — marketing-designlinje, ikke athletic. Egen beslutning. |
| Marketing/diverse | 26 | ⏭️ Eget spor — marketing-stil |
| Intern komponentgalleri | 8 | ❌ Ekskludert — dev-verktøy, ikke brukervendt |
| godkjenn-portal | 3 | ❌ Ekskludert — internt verktøy |

**Athletic-redesign-scope: ~181 skjermer.** MEN: v1.0-auditet viste ~75 % allerede OK — så de fleste trenger ikke full redesign. Derfor: **audit først, bygg bare det som faktisk trenger det.**

## Tilnærming (samme som de 40 ferdige)

- Les eksisterende side → port mot athletic-komponenter + DS-tokens → ekte Prisma-data.
- `[id]`-varianter arver automatisk når hovedskjermen i klyngen er bygd (95 varianter slipper eget arbeid).
- Parallell fan-ut, 5–6 subagenter per batch.
- DONE-gate per skjerm: tsc + eslint + build grønn + visuell sjekk mot mønster.
- Commit fortløpende.

## Faser (prioritert etter daglig brukerverdi)

**Fase 0 — Audit (1 batch, ~30 min).**
Klassifiser de ~181 brukervendte skjermene: ✅ på-brand (la stå) · 🔶 trenger redesign · 🔴 stub (bygg).
Resultat: presis arbeidsliste. Sannsynlig reelt arbeid: ~80–120 skjermer, ikke 181.

**Fase 1 — PlayerHQ-komplettering** (utøverne daglig). Klynger:
- `/portal/meg/*` (24) — abonnement-undersider, helse, bookinger, dokumenter, feedback
- `/portal/mal/*` (12) — sg-hub-undersider (club/benchmark/equipment), runder-detaljer
- `/portal/coach/*` (10) — coach-hub, meldinger, planer, øvelser, videoer, notes
- `/portal/tren/*` (10) — fys-plan, teknisk-plan, test-undersider
- `/portal/talent` (5) · `/portal/ai` (3) · utfordringer · onskeligokt

**Fase 2 — AgencyOS-komplettering** (coachene daglig). Klynger:
- `/admin/talent/*` (8) — discovery, radar, kohort, region, WAGR
- `/admin/workspace/*` (5) · `/admin/agencyos/*` (5 — uka, økonomi, caddie)
- `/admin/plans/*` (4) · `/admin/settings/*` (4) · tournaments · team · anlegg

**Fase 3 — Foreldre + auth-finpuss** (8 + 8). Mest justering, lite nybygg.

**Eget spor (egen beslutning, ikke nå):** Stats (32) + marketing (26). Disse har en egen visuell linje (DataGolf-aktig stats, editorial marketing). Avgjør separat om de skal trekkes inn i athletic-DNA eller beholde sin egen stil.

## Rekkefølge & omfang

0 → 1 → 2 → 3. Hver fase = flere fan-ut-batcher. Realistisk: Fase 0 raskt; Fase 1+2 er hoveddelen. Stats/marketing tas kun hvis besluttet.

## Forutsetning

Vercel auto-deploy henger (se todo.md) — må fikses eller manuelt deployes for at noe av dette blir synlig i prod.
