# Backlog — AK Golf HQ (oppdatert)

**Sist oppdatert:** 2026-05-25 kveld (etter 2 store sprint-er på 5 spor hver)

## Hva er gjort siden forrige backlog (24-25 mai)

### Sprint A — 5-spors beta-prep
- 11 duplikat-sider slettet
- 130+ sider mobile-responsive
- Mock-data fjernet fra 13 sider
- 17 redirects i next.config.ts
- Auth-layout med `robots: noindex`
- 190 demo-ruter under `(internal)/demos/`

### Sprint B — 4 mobile/desktop-spor
- PlayerHQ trenings-flyt iPhone-optimalisert
- PlayerHQ booking/coach/meg mobile
- CoachHQ admin desktop polish
- 36 felles komponenter responsive

### Sprint C — Fase 7 audit (4 agenter)
- 307 ruter auditert
- 229 OK (74.6%)
- 21 Bug, 18 Stub, 12 Redirect

### Sprint D — 5-spors sprint #1
- **FYS-plan modul:** Prisma + 5 komponenter + 3 sider + actions
- **A11y WCAG 2.1 AA:** 35+ fixes, docs/audit/a11y-2026-05-25.md
- **CI/CD + Playwright:** 150 e2e-tester, GitHub Actions
- **Beta-import-script:** klar for 20 spillere

### Sprint E — 5-spors sprint #2
- **Auth:** 2FA via Supabase MFA, Google OAuth, Apple-skjelett, Re-auth-modal
- **Onboarding:** Coach + klubb-wizards + tutorial-overlay
- **Storage + Push:** 8 buckets, Prisma PushSubscription, service worker, klient-toggle
- **AI Coach foundation:** Skills + Tools + Caddie agent + tester
- **Docs:** runbook.md, sla.md, sidemeny-fix, Notion OAuth, safe-url

**Total: ~70+ commits siden 24. mai**

---

# Gjenstående backlog

## TIER 0 — I MORGEN TIDLIG (kritisk for beta-onboarding)

| # | Oppgave | Tid | Notater |
|---|---|---|---|
| 1 | `npm install web-push @types/web-push` | 1 min | Aktivér push |
| 2 | `npx web-push generate-vapid-keys` | 2 min | Legg keys i `.env.local` |
| 3 | Fjern stub-blokk i `src/lib/push/send.ts` | 2 min | Aktivér push-sending |
| 4 | `npx tsx scripts/create-storage-buckets.ts` | 2 min | Opprett 8 Supabase Storage-buckets |
| 5 | CSV-importere 20 beta-spillere | 5 min | `npx tsx scripts/import-beta-users.ts data/beta-users.csv` |
| 6 | Smoke-test onboarding-flyt med én testbruker | 10 min | Førende sanity-test |
| 7 | Beta-velkomst-melding (Slack/SMS/e-post-eks) | 15 min | Informer beta-spillere de er klare |

**Total: ~40 min arbeid.**

---

## TIER 1 — KORTE OPPGAVER (1-3 timer hver)

| # | Oppgave | Tid | Trigger |
|---|---|---|---|
| 8 | Beta-feedback-monitorering (Plausible-eventer + survey) | 1t | Etter onboarding |
| 9 | Beta-feedback-survey-skjema i `/portal/meg/feedback` | 30 min | Etter onboarding |
| 10 | Reach-modul polish | 1t | Når relevant |
| 11 | Pre-existing TS-fixes (`klubb-wizard`, `twofa-client` har småfeil) | 30 min | Quick win |
| 12 | Stripe Connect-integrasjon for klubb-onboarding | 2-3t | Etter beta-stabil |
| 13 | Aktivér push-notifikasjoner i prod (VAPID + test) | 30 min | Avh. tier 0 #1-3 |
| 14 | Coach AI-feedback-loop (tomle opp/ned per Caddie-forslag) | 2-3t | Bruker AI foundation |
| 15 | `data-tour`-attributter på navigasjons-elementer | 1t | Aktiverer tutorial-overlay |
| 16 | ak-second-brain pgvector + RAG-utility | 2-3t | Foundation for AI |
| 17 | 5-6 ekstra Skills i AI-foundation | 2t | Utvider Caddie-kapabilitet |

**Estimert total: ~16 timer**

---

## TIER 2 — MELLOMSTORE FEATURES (3-6 timer hver)

| # | Oppgave | Tid | Prisma? | Avhengighet |
|---|---|---|---|---|
| 18 | **Egen-test + egen-challenge** i test-batteri | 5.5t | Ja | Standalone |
| 19 | **Trene sammen-feature** (delte økter + invitasjoner) | 5t | Ja | Standalone |
| 20 | **FYS-plan v2** (Bompa-kobling, auto-progresjon, Sett×Reps-bygger, video, øvelses-bytte) | 4-6t | Lett-utvidelse | Krever Claude Design |
| 21 | Plan-revisjon under turnering (AI-foreslår fokus) | 4t | Lett-utvidelse | Bruker AI |
| 22 | HCP-projeksjon-graf på spiller-profil | 3t | Nei | Bruker domain-logikk |
| 23 | Mental-state-tracking (humør før/etter økt) | 3t | Ja | Standalone |
| 24 | Treningskompis-koordinering på Workbench | 3t | Ja | Etter #19 |

**Estimert total: ~30 timer**

---

## TIER 3 — STORE FEATURES (1+ dag hver)

| # | Oppgave | Tid | Beskrivelse |
|---|---|---|---|
| 25 | **Workbench-arkitektur v2** | 22-28t | Multi-view kalender, drag-drop, recurring (RRULE), samlinger, turneringsplanlegger, WANG-program-tilknytning |
| 26 | **AI Coach-trening alle 24 agenter** | 3-4 uker | Foundation klar; trenger Caddie + plan + SG + brief + vinn-tilbake + 19 til |
| 27 | **Auto-data-import (Garmin/Apple Watch/Apple Health)** | 2-3 uker | Wearable-integrasjon |
| 28 | **TrackMan live + Arccos shot-tracking** | 2-3 uker | Radar + sensor-data |
| 29 | **AI swing-pattern-analyse (video)** | 4-6 uker | Demokratiserer ekspert-coaching |
| 30 | **3D bane-visualisering + course management** | 3-4 uker | Strategi-fordel |
| 31 | **Skadeforebyggende ML** | 2-3 uker | HRV + smerte-logg + treningsbelastning |
| 32 | **TPI-screen ved onboarding** | 2 uker | Personlig FYS-plan fra dag 1 |
| 33 | **Performance peaking-predictor** | 1-2 uker | Peake til riktig turnering |
| 34 | **Mentor-matching** | 2 uker | Sosial bonding + retention |
| 35 | **Akademi-feed** (Strava-style) | 2 uker | Sosial + motivasjon |

---

## TIER 4 — DESIGN-AVHENGIGE (venter på Claude Design)

| # | Skjerm | Problem | Forslag |
|---|---|---|---|
| 36 | `/portal/tren/aarsplan` | Horisontal Gantt-tidslinje | Vertikal måned-liste på mobile |
| 37 | `/portal/(fullscreen)/tren` | Komplekst 3-pane layout | Dedikert mobile-view |
| 38 | `/portal/(fullscreen)/test/[testId]/live` | 5-slag tabell | Vertikal stack på mobile |
| 39 | `/portal/tren/teknisk-plan/[planId]` | `.tp-p-head` 5-kol grid | Vertikalt kort |
| 40 | `/portal/booking/anlegg/[anleggId]` | Tilgjengelighet-grid | Vertikal dag-velger + tider |
| 41 | `/admin/agencyos` | Stor dashboard | Lg:grid 2-kol timeline + tasks |
| 42 | `/admin/spillere/[id]/rediger`, `/profil`, `/plan/[planId]` | Hex-palett + radar | Bredere refaktor |
| 43 | `/admin/availability` | Uke-layout | Vertikal liste iPhone |
| 44 | `/admin/calendar` | Dag-vy | Auto-switch ved smal viewport |
| 45 | FYS-plan v2 (alle 5 skjermer) | Krever nye design | — |

---

## TIER 5 — IKKE PRIORITERT (vurder senere)

| # | Oppgave | Grunn |
|---|---|---|
| 46 | Apple OAuth | Krever Apple Developer-konto |
| 47 | SMS-notifikasjoner via Twilio | Vent til vi vet push fungerer |
| 48 | AR-drill-instruksjoner | Krever research |
| 49 | Akademi-feed (Strava-style) | Krever personvern-vurdering |
| 50 | Equipment-tracking | Lavt brukerbehov nå |
| 51 | Ernærings-tracker | Utenfor coaching-scope |

---

## ANBEFALT PROGRESJONSPLAN

### Uke 1 (26. mai - 1. juni)
- **Mandag (26. mai):** Beta-onboarding + Tier 0 quick wins (~1t)
- **Tirsdag:** Beta-feedback-survey + monitorering (#8-9)
- **Onsdag:** Egen-test + egen-challenge (#18, 5.5t)
- **Torsdag:** Trene sammen-feature (#19, 5t)
- **Fredag:** FYS-plan v2 oppstart (#20, 3-4t)
- **Helg:** Coach AI-feedback-loop + 5 nye Skills (#14, 17)

### Uke 2 (2-8. juni)
- Workbench-arkitektur fase 1 (multi-view kalender + drag-drop)
- HCP-projeksjon-graf (#22)
- ak-second-brain pgvector (#16)
- Stripe Connect (#12)

### Uke 3-4 (juni)
- Workbench fase 2 (recurring, samlinger, turneringsplanlegger)
- AI Coach-trening: utvide til 6 agenter
- Beta-feedback-fixes (basert på rapporter)

### Måned 2-3 (juli-august)
- Auto-data-import (Garmin/Apple/TrackMan)
- AI swing-pattern-analyse
- 3D bane-visualisering
- Skadeforebyggende ML

---

## STATUS-SAMMENDRAG

### Plattformen i dag (per 25. mai)
- **307 ruter** auditert, 74.6% OK
- **150 e2e-tester** kjører i CI
- **Mobile-responsive** på 130+ sider
- **WCAG 2.1 AA** stort sett oppfylt
- **AI foundation** klar med 3 Skills + 4 Tools + Caddie
- **Auth komplett** med 2FA + OAuth + re-auth
- **Storage + Push** klar (krever VAPID-keys-aktivering)
- **Onboarding-wizards** klare for coach + klubb
- **FYS-plan modul** live
- **Backup + DR-dokumentasjon** komplett
- **Beta-import-script** klar for 20 spillere

### Antall gjenstående backlog-poster
- Tier 0: 7 (40 min total)
- Tier 1: 10 (16 timer)
- Tier 2: 7 (30 timer)
- Tier 3: 11 (3-4 måneder)
- Tier 4: 10 (design-avhengig)
- Tier 5: 6 (ikke prioritert)

### Total estimert tid til "verdens beste"
~3-4 måneder fokusert arbeid med 1-2 utviklere fulltid.

---

## KONTAKT + KILDER

- **Master-plan:** `/Users/anderskristiansen/.claude/plans/fancy-dancing-aho.md`
- **AI trenings-plan:** `docs/ai-coach-trenings-plan.md`
- **Workbench-review:** `docs/workbench-verdens-beste-2026-05-25.md`
- **A11y-audit:** `docs/audit/a11y-2026-05-25.md`
- **Total audit:** `docs/audit/audit-2026-05-24-totalt.md`
- **Mobile design-needed:** `docs/audit/mobile-design-needed.md`
- **Runbook:** `docs/runbook.md`
- **SLA:** `docs/sla.md`
- **Glossary:** `docs/ordliste-ak-golf.md`
