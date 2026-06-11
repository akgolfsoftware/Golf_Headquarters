# GODMODE Platform Plan — Design Spec
*AK Golf HQ · 11. juni 2026*

## Mål

Transformere AK Golf HQ fra 43 løse preview-skjermer til en komplett, produksjonsklar plattform — med null avvik, ekte data overalt og en Platform Intelligence-grunnmur som gjør at enhver AI-agent kan jobbe med full kontekst fra dag én.

Standard: **Borris Chesny** — ingen snarvei, ingen «nesten ferdig», kritiker-gate bestått per skjerm.

---

## Valgt tilnærming

**Option C — Full Platform Intelligence i én Workflow, alle dokumenter simultant.** Deretter 6-fase eksekvering av alle 7 bolker. Fase 0 er en forutsetning for alle påfølgende faser: alle bolk-agenter leser disse dokumentene som kontekst.

---

## Fase 0 — Platform Intelligence System

### Formål
Bygge den institusjonelle kunnskapen som AI-agenter trenger for å produsere world-class output. En ny agent som leser `docs/platform/AGENT-BRIEF.md` skal ha full kontekst på 5 minutter.

### Utførelse
Ett Workflow-kall med parallelle agenter. Discovery-fase leses ferdig før generering starter.

### Discovery-agens (sekvensielle, rask)
Syv agenter leser inn kildedata:
1. Hele Prisma-schema (`prisma/schema.prisma`)
2. Alle route-filer (`src/app/` — rute-tre)
3. Design-handover README + manifest (`public/design-handover/`)
4. MASTER-SKJERMPLAN.md
5. Alle eksisterende CLAUDE.md-filer
6. Supabase RLS-regler (`scripts/audit-rls.ts`-output)
7. Eksisterende business-logikk (`src/lib/domain/`)

### Generer-agens (parallelle, tunge)
Seks agenter skriver hvert sitt dokument simultant basert på discovery-output:

| Dokument | Plassering | Innhold |
|---|---|---|
| `PLATFORM-PRD.md` | `docs/platform/` | Visjon, 4 brukertyper, hva hvert produkt løser, suksesskriterier |
| `AGENT-BRIEF.md` | `docs/platform/` | Lese-start for nye agenter: låste beslutninger, fallgruver, gjeldende mønstre |
| `BUSINESS-RULES.md` | `docs/platform/` | SG-kalibrering, abonnement (gratis vs 300kr), booking-regler, tier-logikk |
| `DATA-MODEL.md` | `docs/platform/` | Prisma-entiteter forklart i domene-språk, kritiske relasjoner, RLS-oversikt |
| `USER-FLOWS/` | `docs/platform/user-flows/` | Tre interaktive HTML-er: PlayerHQ-reise, AgencyOS-reise, Booking-flyt |
| `SCREEN-CONTEXT/` | `docs/platform/screen-context/` | Én `.md` per nøkkelskjerm (de 30 viktigste): formål, data inn/ut, fasit-peker |

### Kritiker-agens (parallelle, per dokument)
Seks adversariske agenter — én per dokument — leter etter:
- Feil eller inkonsekvenser mot kildekoden
- Utdaterte antagelser
- Manglende kritiske regler
- Vaghet som vil forvirre en ny agent

Loop til 0 funn per dokument.

### Output
- `docs/platform/` med alle 6 dokumenter, commit-et
- `docs/platform/AGENT-BRIEF.md` er «les dette først» for alle fremtidige agenter

---

## Fase 1 — Bolk 1 + 4 (parallell Workflow)

### Formål
Koble alle 43 forhåndsvisningsskjermer til ekte adresse og ekte data. Rydde dobbeltadresser.

### Porting-gate (ufravikelig, per skjerm)
1. **Bygg fra kilden** — les design JSX + PNG, lag element-liste, bygg fra lista
2. **Screenshot** — Playwright mot riktig bredde (430px mobil, 1280px desktop)
3. **Adversarisk diff** — uavhengig agent leter etter avvik
4. **Fiks** — rett hvert avvik
5. **Loop** — repeat steg 2–4 til diff-agent finner 0 avvik

### Workflow-struktur
```
Discovery (1 agent) → strukturert liste: skjerm → design-fil → rute → data-behov
  ↓
pipeline(43 skjermer, port, screenshot, diff, fiks)   ← ingen barriere mellom steg
  + parallel agent for Bolk 4 (duplicate cleanup)
  ↓
Per ferdig skjerm: oppdater MASTER-SKJERMPLAN (6 haker grønne)
  ↓
tsc + build grønn etter hver batch
```

### Bolk 4 (parallelt med Bolk 1)
Én dedikert agent velger kanonisk URL per dobbeltpar, setter redirect, fjerner duplikat-fil:
- `finance` / `okonomi` → `okonomi` vinner
- `kalender` / `calendar` → `kalender` vinner
- `innboks` / `messages` → `innboks` vinner
- `godkjenninger` / `approvals` → `godkjenninger` vinner
- `plans/templates` / `plan-templates` → `plan-templates` vinner
- `stats` / `statistikk` (portal) → `statistikk` vinner
- `analyse` / `analysere` (portal) → `analysere` vinner
- `drills` / `tren/ovelser` → `drills` vinner

### Kvalitetsgate (ikke-forhandlbar)
Ingen skjerm merkes ferdig uten alle seks haker: Design ✓ · Mob/Desk/iPad ✓✓✓ · Adresse ✓ · Flyt ✓ · Data ✓ · Funker ✓.

---

## Fase 2 — Bolk 2 + 3 (parallell Workflow)

### Formål
Tømme drop-off-lista. Integrere alle tegnede komponenter.

### Bolk 2: 15 drop-off skjermbilder
Alle via standard porting-gate:
`mx-404`, `pl-onboarding`, `pl-forelder`, `pl-varsler`, `pl-innstillinger`, `pl-trackman`, `pl-turnering`, `fo-barn`, `ag-caddie`, `ag-compare`, `ag-compliance`, `ag-drift`, `ag-kalender`, `ag-tester`, `mk-forside`

### Bolk 3: 14 tegnede komponenter
**PlayerHQ (10):** stemme-logging (live-økt), credit-indicator (booking-hub), gap-to-drill (SG-hub), season-timeline (årsplan), TrackMan stability-graf, TrackMan trend-graf, test-week (tester-oversikt), insight-narrative (hjem/analyse), course-heatmap (hull-analyse), SG-training scatter (SG-hub)

**AgencyOS (4):** co-agent panel (Caddie), multi-compare (talent-sammenligning), foreldre-komponent (coach), ⌘K-hurtigsøk (verifiser kobling)

*Merk: `trackman-dispersion` hører til Elite Fase 2 (`elite/`-mappen) — ikke Bolk 3. `coach-mobile` er AgencyOS-mobil som avventer Fase 4.*

---

## Fase 3 — Bolk 5 (trigger-basert, blokkert på Anders)

**Trigger:** Anders leverer JSX-fasit i Claude Design for:
1. Fellesmelding til turneringsdeltakere (velg → skriv → send)
2. Spiller↔gruppe-veksler øverst i AgencyOS
3. Fokus-spiller: manuell pin + AI-forslag

Når fasit foreligger: standard porting-gate Workflow som Fase 1.

---

## Fase 4 — Bolk 6 (trigger-basert, blokkert på DB-arbeid)

**Trigger:** Anders godkjenner DB-arkitektur for:
1. **Shot-map** — ny `ShotCoordinate`-modell i Prisma (x/y/z per slag)
2. **Scorecard hull-for-hull** — `Round`-modell utvides med `holes: HoleScore[]`
3. **Live turnering** — Supabase Realtime + GolfBox-scraper på cron

Rekkefølge: Prisma-migrasjon → seed → skjerm via porting-gate.

---

## Fase 5 — Bolk 7 Elite (trigger-basert, bevisst utsatt)

**Trigger:** Anders sier «Elite Fase 2 kan starte».

Filer klare i `public/design-handover/elite/`: DispersionTool, Utslag-spredning, Break-tabell, Putte-verktøy, trackman-dispersion.

---

## Kvalitetslov (alle faser)

```
Per skjerm:
  kritiker-agent finner 0 avvik
  ekte data — ingen placeholder eller mock
  alle 6 haker grønne i MASTER-SKJERMPLAN
  tsc + build grønn

Per fase:
  MASTER-SKJERMPLAN oppdatert i real-time
  Dokumenterte unntak i design-porting-gate.md
  Ingen skjerm merkes ferdig uten nettleser-test
```

---

## Dokumenter som produseres

| Dokument | Fase | Plassering |
|---|---|---|
| PLATFORM-PRD.md | 0 | docs/platform/ |
| AGENT-BRIEF.md | 0 | docs/platform/ |
| BUSINESS-RULES.md | 0 | docs/platform/ |
| DATA-MODEL.md | 0 | docs/platform/ |
| USER-FLOWS/ | 0 | docs/platform/user-flows/ |
| SCREEN-CONTEXT/ | 0 | docs/platform/screen-context/ |
| Oppdatert MASTER-SKJERMPLAN | løpende | docs/ |

---

## Ikke i scope

- Elite Fase 2 (Fase 5) kjøres ikke uten Anders' klarsignal
- Bolk 5 og 6 kjøres ikke uten trigger
- Ingen refaktorering av kode som ikke er direkte berørt
- Ingen nye funksjoner utover det som er i design-handover
