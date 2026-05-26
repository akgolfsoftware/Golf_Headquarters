# Pixel-perfect screen-mapping (design ↔ kode)

Mapping mellom 43 design-filer (34 `playerhq/` + 8 `planlegge/` + 1 root) i Claude local-agent-mode-output og 142 `page.tsx`-ruter under `src/app/portal/`.

**Designkilde:** `~/Library/Application Support/Claude/local-agent-mode-sessions/.../outputs/akgolf-hq-screens/`

## Sammendrag i tall

| Kategori | Antall |
|---|---|
| Design-filer (playerhq + planlegge + root) | **43** |
| Kode-ruter under `src/app/portal/` | **142** |
| ✅ Match med høy tillit | **34** |
| 🟡 Match med lav tillit (variant-eksplorasjon / overlap) | **4** |
| 🔴 Design uten rute (modal / wrong-scope / kontroll) | **5** |
| 🟢 Rute uten matching design fra disse to mappene | **~104** |

---

## ✅ Match med høy tillit (34)

Filnavn + `<title>` + `<h1>` matcher klart en eksisterende rute.

### playerhq/ (28)

| Design-fil | Kode-rute | Tema |
|---|---|---|
| `bane-detalj.html` ("GFGK Old Course") | [src/app/portal/mal/baner/[id]/page.tsx](src/app/portal/mal/baner/[id]/page.tsx) | Bane-detalj |
| `coach-profil-hub.html` | [src/app/portal/coach/[coachId]/page.tsx](src/app/portal/coach/[coachId]/page.tsx) | Coach-profil |
| `coach-svar-sporsmal.html` ("grep-trykk") | [src/app/portal/coach/sporsmal/[id]/page.tsx](src/app/portal/coach/sporsmal/[id]/page.tsx) | Spørsmål-svar |
| `drill-bibliotek.html` | [src/app/portal/drills/page.tsx](src/app/portal/drills/page.tsx) | Drill-bibliotek |
| `faktura-detalj.html` ("#2026-0247") | [src/app/portal/meg/abonnement/faktura/[id]/page.tsx](src/app/portal/meg/abonnement/faktura/[id]/page.tsx) | Faktura-detalj |
| `fys-plan-liste.html` | [src/app/portal/tren/fys-plan/page.tsx](src/app/portal/tren/fys-plan/page.tsx) | FYS-plan-liste |
| `legg-til-runde.html` | [src/app/portal/mal/runder/ny/page.tsx](src/app/portal/mal/runder/ny/page.tsx) | Ny runde |
| `meldingstrad-detalj.html` ("Hans Brennum") | [src/app/portal/coach/melding/[id]/page.tsx](src/app/portal/coach/melding/[id]/page.tsx) | Meldingstråd |
| `ny-okt-wizard.html` | [src/app/portal/ny-okt/page.tsx](src/app/portal/ny-okt/page.tsx) | Økt-wizard |
| `okt-detalj-planlagt.html` ("Wedge-presisjon 50–80m") | [src/app/portal/tren/[sessionId]/planlagt/page.tsx](src/app/portal/tren/[sessionId]/planlagt/page.tsx) | Planlagt økt |
| `ovelses-bibliotek.html` | [src/app/portal/tren/ovelser/page.tsx](src/app/portal/tren/ovelser/page.tsx) | Øvelsesbibliotek |
| `plan-liste.html` ("Tekniske planer") | [src/app/portal/tren/teknisk-plan/page.tsx](src/app/portal/tren/teknisk-plan/page.tsx) | Plan-liste |
| `resultater-stats.html` | [src/app/portal/statistikk/page.tsx](src/app/portal/statistikk/page.tsx) | Stats-hjem |
| `resultater-tester.html` | [src/app/portal/tren/tester/page.tsx](src/app/portal/tren/tester/page.tsx) | Test-resultater |
| `resultater-turneringer.html` | [src/app/portal/tren/turneringer/page.tsx](src/app/portal/tren/turneringer/page.tsx) | Turnerings-resultater |
| `runde-detalj.html` ("Larvik GK · 18.05.2026") | [src/app/portal/mal/runder/[id]/page.tsx](src/app/portal/mal/runder/[id]/page.tsx) | Runde-detalj |
| `sammenlign-statistikk.html` | [src/app/portal/statistikk/sammenlign/page.tsx](src/app/portal/statistikk/sammenlign/page.tsx) | Sammenligne |
| `spiller-plan-detalj.html` | [src/app/portal/coach/plans/[planId]/page.tsx](src/app/portal/coach/plans/[planId]/page.tsx) | Spiller-plan |
| `statistikk-drill-down.html` ("Approach i tall") | [src/app/portal/statistikk/[metric]/page.tsx](src/app/portal/statistikk/[metric]/page.tsx) | Metric-detalj |
| `test-detalj.html` ("Counter Movement Jump") | [src/app/portal/tren/tester/[testId]/page.tsx](src/app/portal/tren/tester/[testId]/page.tsx) | Test-detalj |
| `tournament-sorlandsapent.html` | [src/app/portal/tren/turneringer/[id]/page.tsx](src/app/portal/tren/turneringer/[id]/page.tsx) | Turnering-detalj |
| `trackman-koller.html` ("Snitt & Køller") | [src/app/portal/mal/trackman/[id]/page.tsx](src/app/portal/mal/trackman/[id]/page.tsx) | Trackman-detalj |
| `trackman-okter.html` | [src/app/portal/mal/trackman/page.tsx](src/app/portal/mal/trackman/page.tsx) | Trackman-økt-liste |
| `turneringsplanlegger.html` | [src/app/portal/tren/turneringer/page.tsx](src/app/portal/tren/turneringer/page.tsx) | (overlap m/ resultater-turneringer) |
| `varsel-senter.html` | [src/app/portal/varsler/page.tsx](src/app/portal/varsler/page.tsx) | Varsler |
| `workbench-v2.html` ("God morgen, …") | [src/app/portal/workbench-v2/page.tsx](src/app/portal/workbench-v2/page.tsx) eller [src/app/portal/page.tsx](src/app/portal/page.tsx) | Hjem/workbench |

### planlegge/ (7)

| Design-fil | Kode-rute |
|---|---|
| `ai-foresla-drill.html` | [src/app/portal/ai/foresla-drill/page.tsx](src/app/portal/ai/foresla-drill/page.tsx) |
| `ai-foresla-turnering.html` | [src/app/portal/ai/foresla-turnering/page.tsx](src/app/portal/ai/foresla-turnering/page.tsx) |
| `ai-mal-bygger.html` | [src/app/portal/ai/mal-bygger/page.tsx](src/app/portal/ai/mal-bygger/page.tsx) |
| `index.html` ("Batch A · Planlegge + AI") | [src/app/portal/planlegge/page.tsx](src/app/portal/planlegge/page.tsx) |
| `planlegge-arsplan.html` | [src/app/portal/tren/aarsplan/page.tsx](src/app/portal/tren/aarsplan/page.tsx) |
| `planlegge-mal.html` ("Sesong-mål") | [src/app/portal/mal/page.tsx](src/app/portal/mal/page.tsx) |
| `planlegge-turneringer.html` | [src/app/portal/tren/turneringer/page.tsx](src/app/portal/tren/turneringer/page.tsx) (overlap) |

### Root (1)

| Design-fil | Kode-rute |
|---|---|
| `Live Test Scoring.html` ("NGF 20-test-battery") | [src/app/portal/(fullscreen)/test/[testId]/live/page.tsx](src/app/portal/(fullscreen)/test/[testId]/live/page.tsx) |

---

## 🟡 Match med lav tillit (4)

Filnavn ligner, men det kan være overlap eller flere mulige kode-ruter.

| Design-fil | Mulig kode-rute | Grunn til usikkerhet |
|---|---|---|
| `fys-plan-builder.html` ("Vinter-grunntrening 2026") | [src/app/portal/tren/fys-plan/[planId]/page.tsx](src/app/portal/tren/fys-plan/[planId]/page.tsx) | "Builder" kan også være coach-side under `coach/plans/`. Krever innholds-sammenligning |
| `plan-builder.html` ("Teknisk Utviklingsplan") | [src/app/portal/tren/teknisk-plan/[planId]/page.tsx](src/app/portal/tren/teknisk-plan/[planId]/page.tsx) eller [src/app/portal/coach/plans/[planId]/ny-okt/page.tsx](src/app/portal/coach/plans/[planId]/ny-okt/page.tsx) | Builder-flyt finnes på coach-siden også |
| `planlegge-treningsplan.html` ("Treningsplan") | [src/app/portal/coach/plans/page.tsx](src/app/portal/coach/plans/page.tsx) eller [src/app/portal/tren/teknisk-plan/page.tsx](src/app/portal/tren/teknisk-plan/page.tsx) | "Treningsplan" er overlap mellom coach-side og spiller-side |
| `fys-analyse.html` ("FYS-progresjon · CoachHQ") | Ingen direkte portal-rute | Tittel sier "CoachHQ" — designet ligger feilplassert i `playerhq/`-mappen. Spillerens versjon finnes ikke som egen rute |

---

## 🔴 Design uten rute (5)

| Design-fil | Hvorfor ingen rute |
|---|---|
| `global-sok.html` ("Søk") | **Modal**, ikke egen rute. Implementert som [src/components/portal/global-search-modal.tsx](src/components/portal/global-search-modal.tsx) |
| `foreldre-portal.html` ("ForeldrePortal — Tone Berg") | **Utenfor portal-scope.** Tilhører [src/app/forelder/page.tsx](src/app/forelder/page.tsx) (forelder-portal er separat) |
| `KONTROLL-workbench-a.html` ("Variant A · Stack (mobile-first)") | **Design-eksplorasjon** av workbench-v2. Beholdes som referanse, ikke produksjon |
| `KONTROLL-workbench-b.html` ("Variant B · Editorial luxury") | Samme — variant-utforskning |
| `KONTROLL-workbench-c.html` ("Variant C · Dashboard data-dense") | Samme |

---

## 🟢 Rute uten matching design (~104)

Av 142 portal-ruter er ~38 dekket av disse to design-mappene. Resten (~104) er enten:
- Designet i en annen mappe under `outputs/akgolf-hq-screens/` (f.eks. `coachhq/`, `workspace/`, `flyter/`)
- Ikke designet ennå
- Sub-flyt av en designet feature (f.eks. booking-bekreftelse er del av booking-design som ikke ligger i playerhq/)

Grupper uten design fra dette settet:

### Booking-flyt (8 ruter)
`booking/page.tsx`, `booking/ny/page.tsx`, `booking/[bookingId]/`, `booking/anlegg/[anleggId]/`, `booking/coach/[coachId]/`, `booking/ny/bekreft/`, `booking/bekreftet/`, `meg/bookinger/`

### SG-hub (10 ruter)
`mal/sg-hub/page.tsx`, `mal/sg-hub/[club]/`, `mal/sg-hub/best-vs-now/`, `mal/sg-hub/conditions/`, `mal/sg-hub/equipment/`, `mal/sg-hub/strategy/`, `mal/sg-hub/yardage/`, + 3 coach-varianter

### Meg / profil / innstillinger (16 ruter)
`meg/page.tsx`, `meg/abonnement/*` (6), `meg/innstillinger/*` (8), `meg/helse/*` (2), `meg/dokumenter/`, `meg/help/*` (4), `meg/feedback/`, `meg/foreldre/`, `meg/profil/rediger/`, `meg/sikkerhet/*` (2), `meg/utstyrsbag/`

### Coach-relaterte (utenfor coach-profil-hub)
`coach/melding/ny/`, `coach/melding/[id]/vedlegg/`, `coach/notes/*` (2), `coach/ovelser/*` (3), `coach/videoer/`, `coach/plans/perioder/`, `coach/plans/[planId]/ny-okt/`, `coach/ai/`

### Talent + utfordringer (8 ruter)
`talent/*` (5: hjem, min-plan, mitt-niva, roadmap, sammenligning), `utfordringer/*` (3)

### Mål-detalj + spesielle (10 ruter)
`mal/goal/[id]/`, `mal/leaderboard/`, `mal/milepaeler/`, `mal/statistikk/`, `mal/bygger/`, `mal/runder/[id]/shot-by-shot/`, `mal/baner/page.tsx`, `tren/feiring/[planId]/`, `tren/turneringer/ny/`, `tren/kalender/`

### Live-flyt fullscreen (6 ruter)
`(fullscreen)/live/[sessionId]/*` — root + brief, active, logger, summary, tapper

### Diverse (~14 ruter)
`onskeligokt/*` (2), `analyse/`, `analysere/`, `gjennomfore/`, `kalender/`, `reach/`, `agent-pipeline/`, `spiller/[spillerId]/`, `(fullscreen)/tren/`, `(fullscreen)/test/[testId]/summary/`, `statistikk/runder/[runId]/del/`, `stats/`, `tren/tester/katalog/`, `tren/tester/ny/`, `tren/tester/ny/egen/`, `tren/[sessionId]/`, `tren/aarsplan/periode/[id]/rediger/`

---

## Anbefalt pixel-perfect-rekkefølge

Basert på trafikk og konvertering — første-skjerm > daglig bruk > spesialtilfeller.

### Tier 1 — Brukerens første møte (HØYESTE prioritet)
| # | Kode-rute | Design |
|---|---|---|
| 1 | `portal/page.tsx` (hjem) | `workbench-v2.html` |
| 2 | `portal/varsler/page.tsx` | `varsel-senter.html` |
| 3 | `portal/planlegge/page.tsx` | `planlegge/index.html` |
| 4 | `portal/mal/page.tsx` | `planlegge-mal.html` |

### Tier 2 — Daglig bruk (HØY)
| # | Kode-rute | Design |
|---|---|---|
| 5 | `portal/ny-okt/page.tsx` | `ny-okt-wizard.html` |
| 6 | `portal/tren/[sessionId]/planlagt/page.tsx` | `okt-detalj-planlagt.html` |
| 7 | `portal/drills/page.tsx` | `drill-bibliotek.html` |
| 8 | `portal/tren/ovelser/page.tsx` | `ovelses-bibliotek.html` |
| 9 | `portal/tren/aarsplan/page.tsx` | `planlegge-arsplan.html` |
| 10 | `portal/tren/turneringer/page.tsx` | `planlegge-turneringer.html` + `resultater-turneringer.html` + `turneringsplanlegger.html` |

### Tier 3 — Mål + statistikk (HØY)
| # | Kode-rute | Design |
|---|---|---|
| 11 | `portal/mal/runder/[id]/page.tsx` | `runde-detalj.html` |
| 12 | `portal/mal/runder/ny/page.tsx` | `legg-til-runde.html` |
| 13 | `portal/statistikk/page.tsx` | `resultater-stats.html` |
| 14 | `portal/statistikk/[metric]/page.tsx` | `statistikk-drill-down.html` |
| 15 | `portal/statistikk/sammenlign/page.tsx` | `sammenlign-statistikk.html` |

### Tier 4 — Trackman + tester (MEDIUM)
| # | Kode-rute | Design |
|---|---|---|
| 16 | `portal/mal/trackman/page.tsx` | `trackman-okter.html` |
| 17 | `portal/mal/trackman/[id]/page.tsx` | `trackman-koller.html` |
| 18 | `portal/tren/tester/page.tsx` | `resultater-tester.html` |
| 19 | `portal/tren/tester/[testId]/page.tsx` | `test-detalj.html` |
| 20 | `portal/(fullscreen)/test/[testId]/live/page.tsx` | `Live Test Scoring.html` |
| 21 | `portal/tren/turneringer/[id]/page.tsx` | `tournament-sorlandsapent.html` |

### Tier 5 — Coach + meldinger (MEDIUM)
| # | Kode-rute | Design |
|---|---|---|
| 22 | `portal/coach/[coachId]/page.tsx` | `coach-profil-hub.html` |
| 23 | `portal/coach/melding/[id]/page.tsx` | `meldingstrad-detalj.html` |
| 24 | `portal/coach/sporsmal/[id]/page.tsx` | `coach-svar-sporsmal.html` |

### Tier 6 — AI + plans (LAV-MEDIUM)
| # | Kode-rute | Design |
|---|---|---|
| 25 | `portal/ai/foresla-drill/page.tsx` | `ai-foresla-drill.html` |
| 26 | `portal/ai/foresla-turnering/page.tsx` | `ai-foresla-turnering.html` |
| 27 | `portal/ai/mal-bygger/page.tsx` | `ai-mal-bygger.html` |
| 28 | `portal/coach/plans/[planId]/page.tsx` | `spiller-plan-detalj.html` |
| 29 | `portal/tren/teknisk-plan/page.tsx` | `plan-liste.html` |
| 30 | `portal/tren/teknisk-plan/[planId]/page.tsx` | `plan-builder.html` (🟡) |
| 31 | `portal/tren/fys-plan/page.tsx` | `fys-plan-liste.html` |
| 32 | `portal/tren/fys-plan/[planId]/page.tsx` | `fys-plan-builder.html` (🟡) |

### Tier 7 — Bane + faktura (LAV)
| # | Kode-rute | Design |
|---|---|---|
| 33 | `portal/mal/baner/[id]/page.tsx` | `bane-detalj.html` |
| 34 | `portal/meg/abonnement/faktura/[id]/page.tsx` | `faktura-detalj.html` |

### Forelder-portal (separat — utenfor src/app/portal/)
| # | Rute | Design |
|---|---|---|
| 35 | `forelder/page.tsx` | `foreldre-portal.html` |

### Modaler (komponent-nivå, ikke rute-nivå)
| Komponent | Design |
|---|---|
| [src/components/portal/global-search-modal.tsx](src/components/portal/global-search-modal.tsx) | `global-sok.html` |

### Workbench-design-eksplorasjoner (referanse, ikke pixel-perfect)
- `KONTROLL-workbench-a.html` — Variant A: Stack (mobile-first)
- `KONTROLL-workbench-b.html` — Variant B: Editorial luxury
- `KONTROLL-workbench-c.html` — Variant C: Dashboard data-dense

Beholdes som design-arkiv for fremtidige iterasjoner av workbench. Ikke å implementere som egen rute.

---

## Hva mappingen IKKE dekker

- Andre design-mapper i `outputs/akgolf-hq-screens/`: `coachhq/`, `workspace/`, `flyter/`, `marketing-pages.jsx`, `manglende-hubs/`, `pr1/`, `pr2/`, `test-modul/` — krever egen mapping
- Visuell pixel-sammenligning (krever browser-rendering av HTML mot rute)
- ~104 portal-ruter uten matching design fra disse to mappene

## Neste steg

Når design-mapping av andre mapper trengs, lag tilsvarende mapping mot:
- `src/app/admin/` ← `outputs/akgolf-hq-screens/coachhq/`
- `src/app/(marketing)/` ← marketing-design
- `src/app/booking/` ← `outputs/akgolf-hq-screens/flyter/` eller egen booking-mappe
