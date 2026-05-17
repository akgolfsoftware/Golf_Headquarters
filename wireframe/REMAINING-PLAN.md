# Resterende Design + Build — Plan

Generert 2026-05-18 etter Bølge A komplett. Status: foundation + cross-check av 18 hovedsider er ferdig. Dette dokumentet samler **alt som faktisk gjenstår**.

---

## Sammendrag

Etter cross-check av `final/` + `coachhq-A/` + `playerhq-C/` (Bølge A) er hovedflaten på plattformen visuelt aligned med design-pakken. Det som gjenstår er **3 kategorier**:

1. **Nybygg admin-sider** som mangler ruter
2. **Modaler, drawers og spesialvisninger** fra design-pakken
3. **Pilot-konsepter** (hub, hjem, analytics, finance) — fremtidig retning

---

## Bølge B — Nybygg manglende admin-sider (3-4 timer)

Ruter som ikke eksisterer ennå, men har designet klart:

| Rute | Design-fil | Foretrukket implementering |
|---|---|---|
| `/admin/grupper` | `final/09-grupper.html` | Liste av treningsgrupper m/ medlems-avatars |
| `/admin/tester` | `final/12-tester.html` | Coach-view av spillertester (motstykke til portal) |
| `/admin/runder` | `final/13-runder.html` | Coach-view av spillerrunder (motstykke til portal) |
| `/admin/trackman` | `final/14-trackman.html` | Coach-view av TrackMan-økter |

**Forutsetning:** Bekreft at disse skal være CoachHQ-versjoner (admin-view av spillerdata) og ikke duplikater av eksisterende `/portal/mal/*`-ruter. Hvis bekreftet:
- Bygg page.tsx fra design-HTML
- Hent data via Prisma (samme modeller som portal: Round, TestResult, TrackManSession)
- Filter på alle spillere coach har tilgang til (ikke kun innlogget bruker)

**Hvis IKKE ønsket:** marker som "skipped — exists only as PlayerHQ" og fjern fra plan.

---

## Bølge C — Coach-kalendere + dagsbrief (3-4 timer)

Design-pakken har 6 kalender-relaterte filer som dekker dag/uke/måned-view + dagsbrief:

| Design-fil | Mål-rute |
|---|---|
| `01-daglig-brief-default.html` / `-dark.html` | `/admin/agencyos` (eller ny `/admin/brief`) |
| `01-kalender-uke.html` | `/admin/calendar?view=week` |
| `02-maanedsplan.html` | `/admin/calendar?view=month` |
| `03-ukeplan.html` | `/admin/calendar?view=week` (alt-versjon) |
| `04-dagsplan.html` | `/admin/calendar/dag` |
| `07-kalender-maaned.html` | `/admin/calendar?view=month` |
| `09-kalender-dark.html` | Dark mode variant av `/admin/calendar` |

**Tilnærming:**
- Eksisterende `/admin/calendar` er allerede match (per Batch 1) — utvid med view-toggle `?view=week|month|day`
- Daglig-brief som ny widget på Hub eller egen `/admin/brief` rute

---

## Bølge D — Spesialvisninger og modaler (4-5 timer)

| Design-fil | Mål |
|---|---|
| `01-aarsplan.html` + `AK Golf - Årsplan 2026 (standalone).html` | `/portal/tren/aarsplan` (Gantt-årsoversikt) |
| `02-fasiliteter-default.html` / `-dark.html` | `/admin/anlegg/[id]` detail |
| `02-kapasitet.html` + `06-dark-kapasitet.html` | `/admin/kapasitet` (ny) |
| `03-analytics-v2-default.html` / `-dark.html` | `/admin/analytics` (utvid eksisterende) |
| `03-lag-snitt.html` | `/admin/lag-snitt` (utvid eksisterende) |
| `04-meldinger.html` | `/admin/innboks` (utvid eksisterende) |
| `04-revisjonslogg-default.html` / `-dark.html` | `/admin/audit-log` (ny) |
| `05-oktplan-modal.html` | Modal: rediger plan på timeplan |
| `05-oppfolgingsko.html` | `/admin/oppfolging` (ny) |
| `05-rapporter-default.html` / `-dark.html` | `/admin/reports` (utvid eksisterende) |
| `06-periode-modal.html` | Modal: rediger periode i plan-bygger |
| `07-live-okt-brief.html` | `/admin/sessions/[id]/brief` (pre-økt) |
| `08-live-okt-aktiv.html` | `/admin/sessions/[id]/live` (under økt) |
| `08-tilstander.html` | Empty/loading/error states (komponent-bibliotek) |
| `14b-trackman-okt-detalj.html` | `/portal/mal/trackman/[id]` (utvid) |

**Tilnærming:** Hver modal kan bygges som inline drawer / dialog via shadcn/ui. Nye ruter krever Prisma-data — sjekk eksisterende modeller før implementering.

---

## Bølge E — Plan-bygger og ny-økt wizards (3-4 timer)

Wizards er bevisst utelatt fra cross-check i Bølge A (per Anders' direktiv).

| Design-fil | Eksisterende rute | Status |
|---|---|---|
| `coachhq-A/02-plan-bygger-steg-1.html` til `steg-6.html` | `src/app/admin/plans/new/wizard.tsx` | LÅST |
| `coachhq-A/02-plan-bygger.html` (samlet) | same | LÅST |
| `coachhq-A/04-plan-edit.html` | `/admin/plans/[planId]/edit` (?) | Sjekk om eksisterer |
| `playerhq-C/01-06-ny-okt-steg-*.html` | `/portal/ny-okt/*` | Sjekk om eksisterer |

**Forutsetning:** Anders må eksplisitt åpne for wizard-endringer. Tilnærming: forslag-PR med diff-preview før merge.

---

## Bølge F — Pilot-konsepter (vurdering)

`pilot/` inneholder 5 design-eksperimenter som kanskje skal bli neste-generasjons hovedsider:

| Design-fil | Mulig retning |
|---|---|
| `pilot/01-coachhq-hub.html` | Erstatte `/admin/agencyos` |
| `pilot/02-playerhq-hjem.html` | Erstatte `/portal/hjem` |
| `pilot/03-playerhq-mal-oversikt.html` | Erstatte `/portal/mal` |
| `pilot/04-coachhq-analytics.html` | Erstatte `/admin/analytics` |
| `pilot/05-coachhq-finance.html` | Erstatte `/admin/finance` |

**Anbefaling:** Vurdere om disse er bedre enn dagens implementasjoner. Hvis ja → planlegg som egen Sprint.

---

## Bølge G — Modal-pakken (booking flows)

`modal-C/` inneholder 12+ HTML-filer for booking-modaler:
- `01-book-session-steg1-{free,pro,locked}` — tier-gated booking-modal
- `01-book-session-steg2-{dark,loading,default}` — kalender-pick
- `01-book-session-steg3` — bekreft
- `02-reschedule-{confirm,dark,default}` — flytt booking
- (+ flere)

**Plassering:** Hører ikke til dette repoet — booking-flyt er i `akgolf-booking` (per CLAUDE.md scope-grense). Eksporter modal-pakken dit.

---

## Bølge H — Live session UI (PlayerHQ)

| Design-fil | Mål-rute |
|---|---|
| `playerhq-C/01-06-ny-okt-steg-*.html` | `/portal/ny-okt/[steg]` (wizard) |
| `screens/01-live-session.html` | `/portal/live/[sessionId]` |
| `screens/02-live-tapper.html` | `/portal/live/[sessionId]/tapper` (logging) |
| `screens/02-playerhq-live-tapper.html` | same |
| `screens/03-modal-live-intro.html` | Pre-økt intro-modal |
| `screens/03-playerhq-agent-pipeline.html` | AI-coaching feed under økt |

**Avhengighet:** Kjernen for live-session-logikk må være på plass (Prisma `Session.status = ACTIVE`, hendelses-logg).

---

## Bølge I — Profil og 360-view

| Design-fil | Mål |
|---|---|
| `coachhq-A/01-360-profil.html` | `/admin/spillere/[id]` (utvid eksisterende) |

Eksisterende spiller-detalj er sannsynligvis enklere enn 360-profilen — sjekk og berik med pyramide-ringer, test-tidslinje, runder-stats.

---

## Anbefalt rekkefølge

```
1.  Bølge B    (3-4t)  Nybygg admin-sider — krever Anders' bekreftelse på scope
2.  Bølge D    (4-5t)  Modaler + spesialvisninger — høy verdi, ingen breaking changes
3.  Bølge C    (3-4t)  Kalender-views — utvider eksisterende
4.  Bølge I    (2t)    360-profil — beriker eksisterende
5.  Bølge H    (5-6t)  Live session — krever data-modell-arbeid
6.  Bølge E    (3-4t)  Wizards — krever Anders' eksplisitte ja
7.  Bølge F    (vurdering)  Pilot-konsepter — beslutning om retning
8.  Bølge G    (skip)  Booking-modaler — eksporter til akgolf-booking
```

**Total estimat (uten Bølge F og G):** ~22-30 timer fokusert arbeid, fordelt over 5-7 sesjoner.

---

## Beslutninger Anders må ta før start

1. **Bølge B:** Skal `/admin/tester`, `/admin/runder`, `/admin/trackman` være CoachHQ-versjoner av spillerdata? Hvis ja, hvilke filter (alle spillere / mine spillere / klubb)?
2. **Bølge E:** Åpne for wizard-endringer? Hvilke steg er mest verdt å oppdatere?
3. **Bølge F:** Skal pilot-designene erstatte dagens hub/hjem/analytics, eller kun brukes som inspirasjon?
4. **Bølge G:** Eksporter booking-modaler til `akgolf-booking`-repo, eller integrere i denne plattformen?
5. **Bølge H:** Skal live-session-UI implementeres mot eksisterende Prisma-modeller, eller venter på data-arbeid først?

---

## Autonomi-regler ved fortsettelse

Samme som Bølge A:
- Aldri rør `wizard.tsx` uten eksplisitt ja
- Aldri endre Prisma queries / server actions / props uten åpenbar feil
- Norsk bokmål, Lucide stroke 1.75
- 0 TS-feil før commit
- Commit + push per bølge
- Vercel deploy etter hver bølge for iPad-test

---

## Status oversikt

| Bølge | Status |
|---|---|
| Foundation (tokens, fonter, AgentStrip) | ✓ Ferdig |
| Bølge A (cross-check 18 sider) | ✓ Ferdig |
| Bølge B-I | Avventer beslutning |

**Live URL:** https://akgolf-hq.vercel.app
