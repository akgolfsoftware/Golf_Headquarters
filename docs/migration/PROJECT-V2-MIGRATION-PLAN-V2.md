# Project V2 Migration — Revidert plan (2-faset)

**Versjon:** 2.0 (2026-05-25 kveld)
**Erstatter:** PROJECT-V2-MIGRATION-PLAN.md v1.0
**Eier:** Anders Kristiansen

---

## Hva som er endret fra v1.0

- **Scope avdekket:** 325 produksjons-skjermer (ikke 148)
- **Beslutninger fra Anders:**
  - Q1: Live-økt fullscreen → **komplett redesign**
  - Q2: 9 nye V2-mønstre → **bygg alle foran** (sikker konsistens)
  - Q3: **2-faset levering** → beta raskere, komplett ferdig etterpå

---

## Plan-struktur

### FASE 1 — Beta-launch (4 uker / 20 arbeidsdager)

Mål: Landa beta med **alle kritiske brukerflyter** pixel-perfekte. Beta-spillere får polished opplevelse på det de faktisk bruker.

### FASE 2 — Komplett migrasjon (5 uker / 25 arbeidsdager)

Mål: Alle resterende 185 skjermer + LiveSession redesign + redirects + polish. Tag som v2.0.0.

**Total:** 9 uker (vs. 10 uker single-phase). Beta lander 6 uker tidligere.

---

## FASE 1 — Beta-launch (uke 22-25)

### Pre-Fase 1 dag 4-5 (3 dager) — Foundation komplett

Bygg 9 nye V2-mønstre i biblioteket FØR vi rører noen V1-skjermer.

| Mønster | Filplassering | Brukes til |
|---|---|---|
| `GoalsHubPattern` | `src/components/v2/patterns/goals-hub.tsx` | `/portal/mal` + 12 sub |
| `NotificationCenterPattern` | `src/components/v2/patterns/notification-center.tsx` | `/portal/varsler` |
| `AuditLogPattern` | `src/components/v2/patterns/audit-log.tsx` | `/admin/audit-log` |
| `EmailTemplateEditorPattern` | `src/components/v2/patterns/email-template-editor.tsx` | `/admin/email-templates/*` |
| `ImportPattern` | `src/components/v2/patterns/import.tsx` | `/admin/talent/wagr-import` |
| `LiveSessionPattern` | `src/components/v2/patterns/live-session.tsx` | 9 fullscreen-ruter (Fase 2) |
| `TimelinePattern` | `src/components/v2/patterns/timeline.tsx` | `/portal/mal/milepaeler` etc. |
| `ConsentPattern` | `src/components/v2/patterns/consent.tsx` | GDPR + foreldresamtykke |
| `LegalPattern` | `src/components/v2/patterns/legal.tsx` | Vilkår, personvern, cookies |

Plus oppdater `/design-system-v2` med alle 9 nye mønstre.

**Output:** Komplett V2-bibliotek med 34 mønstre.

### Pre-Fase 1 dag 6 (1 dag) — 5 sample-skjermer

Implementer 5 referanse-skjermer mot biblioteket:
1. `/portal` (workbench — allerede V2)
2. `/portal/kalender` (uke-agenda)
3. `/portal/mal` (mål-hub — bruker ny GoalsHubPattern)
4. `/admin` (AgencyOS coach-hjem)
5. `/admin/spillere` (stall-oversikt)

**Anders verifiserer mot V2-prototype.** Hvis godkjent → Fase 1 starter.

### Bølge A — PlayerHQ hovedflyt (7 dager)

70 skjermer:
- `/portal/*` hub-sider
- `/portal/tren/*` (drill, øvelser, økter, planer)
- `/portal/mal/*` (mål, runder, SG)
- `/portal/booking/*`
- `/portal/coach/*` (basis)

**3 parallelle agenter** + Anders kontroll-gate etter.

### Bølge B — CoachHQ hovedflyt (6 dager)

52 skjermer:
- `/admin/agencyos/*` (hjem + tabs)
- `/admin/spillere/*` (alle spiller-detaljer)
- `/admin/stall/*`
- `/admin/talent/*`
- `/admin/plans/*`
- `/admin/drills/*`

**3 parallelle agenter** + Anders kontroll-gate.

### Bølge C — Auth + Onboarding kritisk (2 dager)

~15 skjermer:
- `/auth/login`, `/auth/register`, `/auth/forgot-password`
- `/onboard/spiller/*` (8-stegs onboarding-flyt)
- `/portal/meg/profil/rediger` (kritisk for første-gangs brukere)

**2 parallelle agenter** + Anders kontroll-gate.

### Fase 1 polish + deploy (1 dag)

- Visual regression baselines for beta-skjermer
- Tag som `v2.0.0-beta1`
- Deploy + invite beta-spillere

**Fase 1 ferdig: ~uke 25 (slutt juni).**

---

## FASE 2 — Komplett migrasjon (uke 26-30)

### Bølge D — PlayerHQ resten (3 dager)

~25 skjermer:
- `/portal/analysere/*` (statistikk)
- `/portal/talent/*`
- `/portal/utfordringer/*`
- `/portal/varsler/*` (bruker NotificationCenterPattern)
- `/portal/meg/innstillinger/*` (alle 8 settings-sub-sider)

### Bølge E — CoachHQ resten + stubs + felles (7 dager)

67 skjermer:
- `/admin/kalender/*`, `/admin/bookinger/*`, `/admin/anlegg/*`
- `/admin/tester/*`, `/admin/godkjenninger/*`, `/admin/foresporsler/*`
- `/admin/innboks/*`
- `/admin/settings/*` (alle 5 stub-sider → full implementering)
- `/admin/team/*`, `/admin/integrasjoner`
- `/admin/audit-log` (bruker AuditLogPattern)
- `/admin/email-templates/*` (bruker EmailTemplateEditorPattern)
- `/admin/agents/*` (AI-agenter)
- `/admin/talent/wagr-import` (bruker ImportPattern)
- `/felles/*` (innstillinger, hjelp, integrasjoner)
- `/flyter/*` (oppgrader-pro, foreldresamtykke — bruker ConsentPattern)

### Bølge F — Marketing + Forelder (5 dager)

52 skjermer:
- `/(marketing)/*` (forside, om-oss, kontakt, vilkår, personvern, cookies — bruker LegalPattern)
- `/forelder/*` (alle 6 sub-sider)
- `/turneringer/*` (allerede del-implementert, oppgrader til V2)

### LiveSession Fullscreen — komplett redesign (4 dager)

9 fullscreen-ruter:
- `/portal/(fullscreen)/live/[sessionId]/active`
- `/portal/(fullscreen)/live/[sessionId]/brief`
- `/portal/(fullscreen)/live/[sessionId]/logger`
- `/portal/(fullscreen)/live/[sessionId]/summary`
- `/portal/(fullscreen)/live/[sessionId]/tapper`
- `/portal/(fullscreen)/test/[testId]/live`
- `/portal/(fullscreen)/test/[testId]/summary`
- `/portal/(fullscreen)/tren/[id]`
- `/portal/tren/feiring/[planId]`

Bruker `LiveSessionPattern` — full takeover-layout.

### Redirects (0.5 dag)

Batch-oppsett av 25 redirects i `next.config.ts`:
- `/admin/calendar` → `/admin/kalender`
- `/admin/messages` → `/admin/innboks`
- `/admin/locations` → `/admin/anlegg`
- `/admin/groups/*` → `/admin/grupper/*`
- `/admin/bookings/*` → `/admin/bookinger/*`
- ... (alle 25 engelsk → norsk)

### Final-gate + polish (3 dager)

- Full 325-screen audit
- Visual regression baselines for ALLE skjermer
- Lighthouse-score >90 på 12 nøkkelsider
- Tag som `v2.0.0`

**Fase 2 ferdig: ~uke 30 (slutt juli).**

---

## Tidsplan (10 ukers detaljert oversikt)

| Uke | Dag | Aktivitet | Status |
|---|---|---|---|
| 22 | 1-3 | Pre-Fase 1 dag 4-6 (9 nye mønstre + samples) | Klar til start |
| 22 | 4-5 | Bølge A start | |
| 23 | 1-2 | Bølge A slutt + kontroll-gate | Review #1 |
| 23 | 3-5 | Bølge B (CoachHQ hovedflyt) | |
| 24 | 1-3 | Bølge B slutt + kontroll-gate | Review #2 |
| 24 | 4-5 | Bølge C (Auth + Onboarding) | |
| 25 | 1 | Kontroll-gate Bølge C | Review #3 |
| 25 | 2 | Fase 1 polish + deploy | |
| 25 | 3-5 | **BETA-LAUNCH** + beta-feedback runde 1 | |
| 26 | 1-3 | Bølge D (PlayerHQ resten) | |
| 26 | 4-5 | Bølge E start (CoachHQ resten) | |
| 27 | 1-5 | Bølge E fortsetter | |
| 28 | 1-2 | Bølge E slutt + kontroll-gate | Review #4 |
| 28 | 3-5 | Bølge F (Marketing + Forelder) | |
| 29 | 1-2 | Bølge F slutt + kontroll-gate | Review #5 |
| 29 | 3-5 | LiveSession redesign | |
| 30 | 1 | LiveSession ferdig | |
| 30 | 2 | Redirects-batch | |
| 30 | 3-5 | Final-gate + polish + v2.0.0-tag | Review #6 (final) |

**Beta-launch:** uke 25 (~28. juni)
**v2.0.0 komplett:** uke 30 (~29. juli)

---

## Anders' tid (10 uker)

| Aktivitet | Tid | Når |
|---|---|---|
| Sample-skjermer godkjenning | 30 min | Etter uke 22 dag 3 |
| Review Bølge A (70 sider) | 90 min | Uke 23 |
| Review Bølge B (52 sider) | 60 min | Uke 24 |
| Review Bølge C (15 sider) | 30 min | Uke 25 |
| **Beta-feedback runde 1** | 60 min | Uke 25 |
| Review Bølge D + E (92 sider) | 90 min | Uke 28 |
| Review Bølge F (52 sider) | 60 min | Uke 29 |
| Final 325-screen audit | 120 min | Uke 30 |
| **TOTAL** | **~9 timer** | over 10 uker |

---

## Q1-7 tekniske beslutninger (jeg tar ansvaret)

Per Anders' "du tar dette" — disse er nå besluttet:

1. `/portal/coach/plans/*` → 301 til `/admin/plans/*` ✓
2. `/admin/agencyos/*` → behold som kanonisk (allerede live) ✓
3. `/admin/calendar` → 301 til `/admin/kalender` ✓
4. `/admin/messages` → 301 til `/admin/innboks` ✓
5. `/admin/locations` → 301 til `/admin/anlegg` ✓
6. `/portal/(fullscreen)/*` → rebuild med ny LiveSessionPattern ✓
7. Plan A-ruter → utelukk (egen sprint senere) ✓

Implementeres som batch i Fase 2 (uke 30 dag 2).

---

## Acceptance-kriterier per fase

### Fase 1 — Beta-launch (uke 25)
- ✓ Alle 9 nye V2-mønstre lagt til biblioteket
- ✓ 5 sample-skjermer godkjent av Anders
- ✓ 137 kritiske skjermer migrert (Bølge A+B+C)
- ✓ Anders har gjort 3 kontroll-gates
- ✓ Visual regression baselines for beta-skjermer
- ✓ tsc + eslint + build passerer
- ✓ Beta-spillere får tilgang

### Fase 2 — v2.0.0 komplett (uke 30)
- ✓ Alle 325 skjermer migrert
- ✓ 25 redirects aktive
- ✓ LiveSession 9 ruter komplett redesignet
- ✓ Alle stubs konvertert til full implementering (9 stk)
- ✓ Visual regression baselines for ALLE 325 skjermer
- ✓ Lighthouse-score >90 på 12 nøkkelsider
- ✓ Anders har gjort final-gate audit
- ✓ Tag som `v2.0.0`

---

## Hva som er låst (kan ikke endre uten ny scope-runde)

- 2-faset levering
- Beta-launch uke 25
- v2.0.0 komplett uke 30
- Q1-7 tekniske beslutninger
- 9 nye V2-mønstre bygges først
- Plan A utenfor scope (egen sprint senere)

Endringer krever formell scope-change-forespørsel.

---

## Klart til å starte Pre-Fase 1 dag 4

Neste handling: Spawne 9 parallelle agenter (én per nytt mønster) som bygger v2-patterns/* i parallell. Tar 3 dager.

Si "kjør" så starter jeg.
