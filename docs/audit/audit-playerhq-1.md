# Audit PlayerHQ Del 1 — 2026-05-24

## Partisjon
Workbench + Planlegge + Gjennomføre + Analysere + Coach + Tren + Drills + Utfordringer + AI + Innsikt + Analyse + Agent-pipeline + Spiller

## Sammendrag
- Totalt: 50 ruter
- OK: 35
- Bug/Sidebar-feil: 5
- Stub/Demo-data: 4
- Form/Action: 6 (ny/wizard/rediger-sider)
- Redirect: 0

## Topp 10 prioriterte fixes

1. `/portal/coach/melding/[id]` — hardkodet `bg-[#22C55E]` og `text-[#22C55E]` (live-status indicator) — bryter token-regel
2. `/portal/coach/melding/[id]` — sidebar viser "AK GOLF · PlayerHQ" — bryter SidebarBrand-regel
3. `/portal/coach/melding/[id]/vedlegg` — sidebar viser "AK GOLF · PlayerHQ" — bryter SidebarBrand-regel
4. `/portal/coach/melding/ny` — sidebar viser "AK GOLF · PlayerHQ" — bryter SidebarBrand-regel
5. `/portal/coach/sporsmal/[id]` — sidebar viser "AK GOLF · PlayerHQ" — bryter SidebarBrand-regel
6. `/portal/coach/notater` — eksplisitt "Hardkodet eksempel-data" iht. kommentar — ingen Prisma-binding
7. `/portal/tren/aarsplan/periode/[id]/rediger` — "Hardkodet demo-data — i produksjon hentes fra prisma.periodBlock"
8. `/portal/tren/turneringer/[id]` — viser "hardkodet Sørlandsåpent-eksempel uavhengig av [id]"
9. `/portal/tren/[sessionId]/planlagt` — Wedge-presisjon hardkodet, ignorerer session-data
10. `/portal/drills` — bruker MOCK_DRILLS, ikke Prisma — markert i kommentar

## Per rute (gruppert etter top-level)

### /portal (Workbench)
| Rute | Status | Shell | Merknader |
|---|---|---|---|
| `/portal` | OK | WorkbenchShell | Hjem-spesifikk shell, live Prisma-data, rolle-redirect |

### /portal/planlegge
| Rute | Status | Shell | Merknader |
|---|---|---|---|
| `/portal/planlegge` | OK | PlanleggeShell / Screen | Tab-router; flere screens |

### /portal/gjennomfore
| Rute | Status | Shell | Merknader |
|---|---|---|---|
| `/portal/gjennomfore` | OK | HubFrame | Bundle-3 hub-design |

### /portal/analysere
| Rute | Status | Shell | Merknader |
|---|---|---|---|
| `/portal/analysere` | OK | HubFrame | Bundle-3 hub-design |

### /portal/coach + sub-ruter
| Rute | Status | Shell | Merknader |
|---|---|---|---|
| `/portal/coach` | OK | HubFrame | Coach-hub |
| `/portal/coach/[coachId]` | OK | PageHeader | Coach-profil, tier-gate |
| `/portal/coach/ai` | OK | PageHeader | AI-coach chat, tier-gate |
| `/portal/coach/melding` | OK | PageHeader | Meldingsliste, tier-gate |
| `/portal/coach/melding/[id]` | Bug | Custom nav | "AK GOLF" + hex #22C55E |
| `/portal/coach/melding/[id]/vedlegg` | Bug | Custom nav | "AK GOLF" i sidebar |
| `/portal/coach/melding/ny` | Bug | Custom nav | "AK GOLF" i sidebar |
| `/portal/coach/notater` | Stub | PageHeader | Hardkodet NOTATER-array |
| `/portal/coach/notater/[id]` | Stub | Custom | Hardkodet demo-data |
| `/portal/coach/notes` | OK | PageHeader | Live Prisma-data |
| `/portal/coach/notes/[noteId]` | OK | PageHeader | Live Prisma + tier-gate |
| `/portal/coach/ovelser` | OK | PageHeader | Coach-only liste |
| `/portal/coach/ovelser/ny` | Form | PageHeader | DrillEditor create |
| `/portal/coach/ovelser/[id]/rediger` | Form | PageHeader | DrillEditor edit |
| `/portal/coach/plans` | OK | PageHeader | Tier-gate, live data |
| `/portal/coach/plans/[planId]` | OK | PageHeader | Periodiserings-view |
| `/portal/coach/plans/[planId]/ny-okt` | Form | PageHeader | AddSessionWizard |
| `/portal/coach/plans/perioder` | OK | PageHeader | Periode-editor |
| `/portal/coach/sporsmal/[id]` | Bug | Custom nav | "AK GOLF" + demo-data |
| `/portal/coach/videoer` | OK | PageHeader | Live SessionVideo |

### /portal/tren + sub-ruter
| Rute | Status | Shell | Merknader |
|---|---|---|---|
| `/portal/tren/aarsplan` | OK | PageHeader | Live SeasonPlan |
| `/portal/tren/aarsplan/periode/[id]/rediger` | Stub | PageHeader | Hardkodet demo-data |
| `/portal/tren/kalender` | OK | PageHeader | Live uke-data |
| `/portal/tren/teknisk-plan` | OK | PageHead | Custom Plan-liste design |
| `/portal/tren/teknisk-plan/[planId]` | OK | PageHead | Plan-builder, "AK GOLF"-streng er kommentar/enum |
| `/portal/tren/turneringer` | OK | PageHeader | Live tournaments |
| `/portal/tren/turneringer/[id]` | Stub | Custom | Hardkodet Sørlandsåpent |
| `/portal/tren/ovelser` | OK | Custom (4 faner) | Live ExerciseDefinition |
| `/portal/tren/ovelser/[id]` | OK | Custom | DrillDetail |
| `/portal/tren/tester` | OK | TesterDashboardScreen | Pixel-perfekt port |
| `/portal/tren/tester/ny` | Form | PageHeader | NyTestWizard |
| `/portal/tren/tester/[testId]` | OK | TesterDetaljScreen | Live TestDefinition |
| `/portal/tren/feiring/[planId]` | OK | PageHeader | Plan-fullført feiring |
| `/portal/tren/[sessionId]` | OK | PageHeader | Live session-data |
| `/portal/tren/[sessionId]/planlagt` | Stub | Custom hero | Hardkodet Wedge-presisjon |

### /portal/drills + utfordringer + ai + innsikt + analyse + agent-pipeline + spiller
| Rute | Status | Shell | Merknader |
|---|---|---|---|
| `/portal/drills` | Stub | Custom (DrillGrid) | MOCK_DRILLS array |
| `/portal/drills/[id]` | OK | PageHeader | Live ExerciseDefinition |
| `/portal/utfordringer` | OK | PageHeader | Live DrillChallenge |
| `/portal/utfordringer/[id]` | OK | PageHeader | Live data |
| `/portal/utfordringer/ny` | Form | PageHeader | Server action |
| `/portal/ai/foresla-drill` | OK | FullScreen | Pixel-perfekt port |
| `/portal/ai/foresla-turnering` | OK | FullScreen | Pixel-perfekt port |
| `/portal/ai/mal-bygger` | OK | FullScreen | Pixel-perfekt port |
| `/portal/innsikt` | OK | InnsiktShell | Tab-router, live data |
| `/portal/analyse` | OK | Custom sidebar | 6 visninger, tier-gate |
| `/portal/agent-pipeline` | OK | PageHeader | Live Signal/PlanAction |
| `/portal/spiller/[spillerId]` | OK | Client component | Live profil + rounds |

## Detaljerte funn

### Sidebar/header med "AK GOLF · PlayerHQ" (4 ruter — bryter sidebar-merkevare-regel)
- `src/app/portal/coach/melding/[id]/page.tsx:86`
- `src/app/portal/coach/melding/[id]/vedlegg/page.tsx:25`
- `src/app/portal/coach/melding/ny/page.tsx:48`
- `src/app/portal/coach/sporsmal/[id]/page.tsx:34`

Regel sier: "ALLE sidebars bruker `<SidebarBrand>` med subtitle `<MODUL> · <ROLLE>` (PLAYERHQ · PRO ...). Aldri 'AK GOLF'-tekst." Disse fire bruker custom `<nav>` med hardkodet `AK GOLF · PlayerHQ`.

### Hardkodede hex-farger (1 rute)
- `src/app/portal/coach/melding/[id]/page.tsx:100,105` — `bg-[#22C55E]` og `text-[#22C55E]` (online-indikator). Bør være `bg-primary` eller token.

### Stub/demo-data uten Prisma
- `src/app/portal/coach/notater/page.tsx` — hardkodet `NOTATER`-array (kommentar bekrefter)
- `src/app/portal/coach/notater/[id]/page.tsx` — hardkodet demo-notat
- `src/app/portal/tren/aarsplan/periode/[id]/rediger/page.tsx` — kommentar sier "Hardkodet demo-data"
- `src/app/portal/tren/turneringer/[id]/page.tsx` — viser hardkodet "Sørlandsåpent" uavhengig av ID
- `src/app/portal/tren/[sessionId]/planlagt/page.tsx` — Wedge-presisjon hero hardkodet
- `src/app/portal/drills/page.tsx` — `MOCK_DRILLS` (kommentar markerer pending Prisma-modell-utvidelse)

### Ingen forbudte stub-strenger
Søk etter `kommer snart`, `WIP`, `placeholder` ga ingen treff i denne partisjonen. `TODO`-treffene er enten kode-kommentarer (ai/page.tsx, melding/form.tsx) eller status-enum-verdier (`TODO` i teknisk-plan), ikke UI-stub-tekst.

### Ingen forbudte shells
Søk etter `CoachhqStubsShell`/`CoachhqStubShell` ga ingen treff.

### Lucide-ikoner
Alle ruter importerer kun fra `lucide-react`. Ingen emoji i UI-tekst.

### Språk
Norsk bokmål med æ/ø/å gjennomgående.

## Anbefalt fix-rekkefølge

1. **Quick win** — bytt 4 sidebar-strings ("AK GOLF · PlayerHQ") til `<SidebarBrand subtitle="PLAYERHQ · COACH" />` eller fjern hardkodet nav helt og la layout håndtere det
2. **Token-fix** — erstatt `#22C55E` med `text-primary`/`bg-primary` (eller introduser `--color-online` token)
3. **Data-binding** — koble 5 demo-sider mot Prisma (aarsplan/periode rediger, turneringer/[id], tren/[sessionId]/planlagt, coach/notater, drills)
4. **Avklar** — `drills/page.tsx` venter på modell-utvidelse iht. kode-kommentar; bekreft med Anders før Prisma-arbeid
