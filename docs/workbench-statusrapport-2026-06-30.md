# AK Golf HQ — Workbench statusrapport

> Read-only kartlegging 2026-06-30. Ingen kode skrevet, ingen commit. Hver påstand peker på fil/linje.
> Metode: direkte kodelesing av `workbench-hybrid/`-kjernen + skjema + nav, + 2 parallelle kartleggingsagenter
> (19-funksjonskatalog, spiller-paritet) med egen verifikasjon. Ett Next.js 16-repo (`src/`-layout).
> NB: `docs/component-library.md` (pålagt lest) **finnes ikke** i repoet — referert i WORKLOG, men fil mangler.

## Sammendrag
1. Workbench er **én delt klient-komponent** (`src/components/workbench-hybrid/WorkbenchHybrid.tsx`) med en `role`-prop (`"player" | "coach"`, linje 539/553). Ekte på begge flater: coach `/admin/spillere/[id]/workbench`, spiller `/portal/planlegge/workbench`.
2. Alle **7 hub-faner + 5 zoom-nivåer finnes i kode** og leser ekte Prisma-data (`src/lib/workbench/load-workbench.ts`), med ærlige tom-tilstander (ingen oppdiktede økter).
3. **Største gap:** AK-formelen persisteres ikke fra Workbench — `addWorkbenchSession` skriver kun `pyramidArea` (actions.ts:442); `lPhase`/`environment`/`pressureLevel`-kolonnene er aldri skrevet, og **CS (club speed) + P-posisjon mangler helt** på øktmodellen.
4. Av 19 katalogfunksjoner: **5 finnes, 7 delvis, 7 mangler** (mikrosyklus, vær-flytt, ACWR, plateau, hva-hvis, versjonering/angre, multi-select).
5. **IA-drift + datafragmentering:** mobil bottom-nav (Hjem/Plan/Gjør/Analyse/Meg) ≠ desktop-sidebar (eldre `/tren/*` + `/mal`); tre parallelle øktmodeller (`TrainingPlanSession`/`TrainingSessionV2`/`PlanSession`).

---

## A. Flate-inventar

| Rute | Overflate | Fil | Status | Data |
|---|---|---|---|---|
| `/admin/spillere/[id]/workbench` | coach | `src/app/admin/spillere/[id]/workbench/page.tsx` | **EKTE** | Prisma via `loadWorkbench`, `role="coach"` (auth ADMIN/COACH, ellers redirect — page.tsx:30-33) |
| `/portal/planlegge/workbench` | spiller | `src/app/portal/planlegge/workbench/page.tsx` | **EKTE** | Prisma, `role="player"` (requirePortalUser, redirect GUEST/PARENT — page.tsx:31-34) |
| `/admin/planlegge` | coach | `src/app/admin/planlegge/page.tsx` | **REDIRECT** → `/admin/spillere/{førsteSpiller}/workbench` | Prisma (finn første PLAYER). «Ett trykkpunkt»-beslutning realisert |
| `/portal/planlegge` | spiller | `src/app/portal/planlegge/page.tsx` | **REDIRECT** → `/portal/planlegge/workbench` | (GUEST→/admin/kalender, PARENT→/forelder) |
| `/admin/coach-workbench` | coach | `src/app/admin/coach-workbench/page.tsx` | **REDIRECT (legacy)** → per-spiller workbench | — |
| `/admin/plan-templates` (+`ny`,`[id]`,`[id]/rediger`,`[id]/effectiveness`) | coach | `src/app/admin/plan-templates/*` | **EKTE** | Prisma (2 kall i page) |
| `/admin/okter` | coach | `src/app/admin/okter/page.tsx` (439 l) | **EKTE** | Prisma |
| `/admin/teknisk-plan` (+`[spillerId]`) | coach | `src/app/admin/teknisk-plan/*` (232 l) | **EKTE** | Prisma (2 kall) |
| `/portal/tren/teknisk-plan` (+`[planId]`) | spiller | `src/app/portal/tren/teknisk-plan/*` | **EKTE** (detalj ikke fullverifisert) | ukjent, må verifiseres |
| `/admin/plans/new` | coach | `src/app/admin/plans/new/*` | **EKTE** | Fritekst AI-plan-bygger (agent C) |
| `/portal/mal/bygger`, `/portal/ai/mal-bygger` | spiller | `src/app/portal/mal/bygger`, `src/app/portal/ai/mal-bygger` | **DELVIS** | Strukturerte felt (ikke fritekst); detalj ikke fullverifisert |

**Arkitektur:** WorkbenchHybrid er én klient-komponent montert via to entry-server-sider (ulik `role`-prop). Coach-modus er innleiret i AdminShell (mørk chrome), spiller-modus er standalone lyst (`WorkbenchHybrid.tsx:944-957`).

---

## B. Fane- og zoom-status

**7 hub-faner** (`HubTabRail.tsx:8-16`), valgt via `?tab=`-param (`WorkbenchHybrid.tsx:556-560`):

| Fane | Fil | Status | Datakilde | Server action | Døde knapper |
|---|---|---|---|---|---|
| Teknisk plan (`tek`) | `TekniskPlanTab.tsx` | EKTE | `tekniskPlan`-ctx (load-workbench/teknisk-plan) | — (lese) | — |
| Sesongmål (`seson`) | `SesongmalTab.tsx` | EKTE | `mapGoals(data)` | — | — |
| Maler (`maler`) | `MalerTab.tsx` | EKTE | `data.planTemplates` | `applyWorkbenchTemplate` / `coachApplyWorkbenchTemplate` | — (diff-visning mangler) |
| Standardøkter (`std`) | `StdTab.tsx` | EKTE | `palette = mapPalette(data)` (build-seed.ts:23) | palette redigeres klient-side | — |
| Gantt (År) (`gantt`) | → `ArsplanView.tsx` (via `hubTabToZoom→arsplan`, HubTabRail.tsx:105) | **DELVIS** | `seasonPhases` (`mapSeasonPhases`) | — | **`onPhaseClick` = no-op (WorkbenchHybrid.tsx:1024)**. NB: ikke ekte Gantt, men periodiserings-bånd (ArsplanView, 181 l) |
| Uke (`uke`) | `UkeView.tsx` | EKTE | `state.week` (fra data, drag-drop) | `moveWorkbenchSession`/`addWorkbenchSession`/`removeWorkbenchSession` (+`coach*`-varianter) | — |
| Økt (`okt`) | `OktDetailTab.tsx` | EKTE/DELVIS | valgt økt | `resolvePlanSessionLiveHref` | coach-chrome gated (notat/SG-paneler er coach-only) |

**5 zoom-nivåer** (`WorkbenchHybrid.tsx:93`, render `centerView` 969-1044):

| Zoom | Komponent | Status | Datakilde | Handler | Døde knapper |
|---|---|---|---|---|---|
| `arsplan` | `ArsplanView` | DELVIS | `seasonPhases` | — | `onPhaseClick` no-op (1024) |
| `ar` | `ArView` | EKTE | `seasonPhases` | `onMonthClick→openMonth` | — |
| `maned` | `ManedView` | EKTE | `seasonPhases`+`week`+`tournaments` | `onDayClick→dag` | — |
| `uke` | `UkeView` | EKTE | `state.week` | drag-drop persist | — |
| `dag` | `DagView` / `OktDetailTab` | EKTE | dagens økter | `onTimelineDrop` | — |

**Andre stubs/no-ops i Workbench:**
- `CoachSkillWizard.tsx:12` — eksplisitt **stub** («ingen DB-skriving»).
- `generateWeekWithCaddie` (`portal/planlegge/workbench/actions.ts:173-184`) — **stub** («Caddie-integrasjon kommer post-launch»).
- KPI-strip: `adherence` + `sg` settes til `null` → ærlig «—» (`WorkbenchHybrid.tsx:1051-1053`), ingen datamodell ennå.
- `AiPlanPanel` er derimot **ekte** — kaller `/api/admin/ai-plan` (`AiPlanPanel.tsx:106`), men sender kun `{ playerId }` (default-prompt, ikke fritekst).
- Hardkodede dagnavn `DAY_NAMES` («Man 9. jun» …) i `WorkbenchHybrid.tsx:123-131` — display-labels, ukedato følger ikke faktisk uke (kosmetisk gap, må verifiseres mot UkeView som bruker `weekStartISO`).

---

## C. Funksjonskatalog (19)

| # | Funksjon | Fase | Status | Fil / referanse |
|---|---|---|---|---|
| 1 | Naturlig språk → plan | Planlegging | **finnes** | `src/lib/ai-plan/generate.ts`, `src/app/api/admin/ai-plan/route.ts`. Fritekst: `admin/plans/new/ai-panel.tsx:176`. NB: Workbench-panelet sender default-prompt (`AiPlanPanel.tsx:106`) |
| 2 | Regelmotor | Planlegging | **delvis** | `src/lib/portal/training/periode-constraints.ts` (`validateSessionConstraints`). Deterministisk, ikke coach-konfigurerbar. `src/lib/ai/get-workbench-insights.ts` (hardkodet, TODO→LLM) |
| 3 | Mikrosyklus-bibliotek | Planlegging | **mangler** | 0 treff. Kun makro-periodisering (`PeriodeType`-enum) |
| 4 | Skole-/hvileblokker | Planlegging | **delvis** | Hvile/ferie: `PeriodeType.FERIE` (schema:267) + `periode-constraints.ts:97`. Skoleblokk mangler |
| 5 | Vær-flytt | Planlegging | **mangler** | Vær = statiske fixtures (`src/lib/v2-fixtures.ts:453`). Ingen værmotor/auto-flytt |
| 6 | Offline-modus | Gjennomføring | **finnes** | Serwist PWA: `src/app/sw.ts`, `public/sw.js`, `sw-register.tsx`, `src/app/offline/page.tsx` |
| 7 | Kommentar-tråd (coach↔spiller↔forelder) | Gjennomføring | **delvis** | 2-parts coach↔spiller: `portal/coach/MessageThread.tsx`. 3-parts m/forelder mangler; `coachhq/workbench/panels/kommunikasjon-panel.tsx:12` TODO «Message-modell finnes ikke» |
| 8 | «Ønsk økt»-kø | Gjennomføring | **finnes** | `model SessionRequest` (schema:1508). Spiller `app/portal/onskeligokt/`, coach `app/admin/foresporsler/` |
| 9 | ACWR-belastning | Analysering | **mangler** | 0 treff. Kun volum/pyramide, ikke akutt:kronisk-ratio |
| 10 | Plateau-deteksjon | Analysering | **mangler** | 0 reelle treff |
| 11 | Hva-skjer-hvis-simulering | Analysering | **mangler** | Ingen scenario-/what-if-motor |
| 12 | Auto-rapport (uke/måned/periode) | Evaluering | **delvis** | Forelder-ukerapport: `src/lib/forelder.ts:329`. Coach-facing måneds-/periode-rapport mangler |
| 13 | Versjonering & angre | Evaluering | **mangler** | 0 undo/version/history i Workbench. `plan-revisjon-agent.ts` = AI-forslag, ikke versjonskontroll |
| 14 | ⌘K kommandopalett | Effektivitet | **finnes** | `admin/global-search-modal.tsx`, `portal/global-search-modal.tsx`, `stats/stats-cmd-k.tsx`. App-bred, ikke Workbench-spesifikk |
| 15 | Multi-select økter | Effektivitet | **mangler** | 0 treff i Workbench. Reduceren er single-select (`selectedId`) |
| 16 | Mal-arv med diff | Effektivitet | **delvis** | Mal-arv: `PlanTemplate` + `apply-template-actions.ts`. Effekt: `PlanEffectiveness` (schema:1031). **Diff-visning mangler** |
| 17 | Sammenlign perioder | Effektivitet | **delvis** | `athletic/calendars/compare-calendar.tsx` finnes ferdig, men **ikke wiret inn** (død eksport). Spiller-sammenligning finnes (`/admin/talent/sammenligning`) |
| 18 | Eksport (PDF/iCal) | Effektivitet | **delvis** | PDF: **finnes** (`src/lib/pdf/plan-document.tsx`). iCal/.ics: **mangler** (kun Google Calendar-sync) |
| 19 | Batch-godkjenning | Effektivitet | **finnes** | `admin/approvals/actions.ts:74 batchApproveLowRisk` + `batch-approve-button.tsx`, montert i `admin/godkjenninger/page.tsx:209` |

**Helt manglende (7):** mikrosyklus (3), vær-flytt (5), ACWR (9), plateau (10), hva-hvis (11), versjonering/angre (13), multi-select (15).
**Viktigste delvis-nyanser:** (16) mal-arv finnes men diff-delen mangler; (17) `CompareCalendar` er kodet men ubrukt; (18) iCal mangler helt; (7) kommentar-tråd kun 2-parts.

---

## D. Spiller-paritet

**Modell:** Én delt komponent, `role`-prop (`types.ts:68`, default `"player"`) → `isCoach = role === "coach"` (`WorkbenchHybrid.tsx:553`). Coach-siden sender `role="coach"` + `currentPlayerId`/`players`/`coachName` (page.tsx:66); spiller-siden `role="player"` + egen `subjectPlayerId`.

| Affordance | Synlig for spiller | Gating-mekanisme | Fil:linje |
|---|---|---|---|
| Scope-velger (bytt spiller) | **Nei** | `isCoach`-sjekk i topbar (coach=PlayerSelector, spiller=statisk pill) | `Topbar.tsx:134`, `MobileTopbar.tsx:85` |
| Publiser plan | **Ja, men status-gated** | Ikke role-gated; vises hvis `onPublish && planStatus ∈ {DRAFT,REJECTED}`. Server håndhever rolle separat | `Topbar.tsx:83,310`; `WorkbenchHybrid.tsx:1158,1237`; `publish-actions.ts:22-29` |
| PaletteSidebar | **Nei** | Betinget render `!showPlanningTab && isCoach` | `WorkbenchHybrid.tsx:1165` |
| Bulk/multi-select | **Finnes ikke (noen)** | Affordansen er ikke bygget (single-select reducer) | `WorkbenchHybrid.tsx:151,174-206` |
| Mal-redigering | **Nei** | `isCoach`-prop til `MalerTab`/`StdTab` (coach får «Ny/Rediger») | `MalerTab.tsx:119,177,263`; `StdTab.tsx:84,211`; sendt `WorkbenchHybrid.tsx:1074,1082` |
| AK-formel-editor | **Delvis JA** | **Inspector er IKKE role-gated** → spiller kan endre formel-chips. Kun OktDetailTab-chrome er `isCoach`-gated | `Inspector.tsx:319-320` (ingen gating); `OktDetailTab.tsx:148,206,372,396` (coach-gated) |

**Nyanse (hull):** Inspector/MobileInspectorSheet redigerer AK-formel-dimensjonene (område, M, PR, CS, L-fase, praksis) **uten rolle-sjekk** — en spiller kan i prinsippet endre AK-formelen på en valgt økt. Hvis spilleren skal ha en ren lese-/«legg i plan»-flate, er dette et hull som bør verifiseres mot ønsket regel. (Persistering er uansett begrenset — se E.)

---

## E. Datakontrakt

**Modeller (verifisert i `prisma/schema.prisma`):** `TrainingPlan` (787), `TrainingPlanSession` (855), `PlanTemplate` (969), `PlanTemplateSession` (1006), `TrainingPlanSessionLog` (1066), `PlanAction` (1398), `TrainingSessionV2` (2499), `PlanSession` (brukt i `actions.ts:142/157`), `TechnicalPlan` (3340) + `TechnicalPlanPosition` (3445) + `PositionTask` (3467) + `PositionTaskLog/TmGoal/ClubTarget/Audit`.

- **`TrainingPlanWeek` finnes IKKE** — uker utledes fra `TrainingPlanSession.scheduledAt` (`@@index([planId, scheduledAt])`, linje 877).
- **AK-formel-felt på `TrainingPlanSession` (855-867):** `pyramidArea` ✓ (862), `lPhase?` ✓ (865), `environment` (SessionEnvironment) ✓ = miljø (864), `pressureLevel?` ✓ (866), `skillArea?` (863).
  - **MANGLER CS (club speed):** ingen felt på øktmodellen (kun `ExerciseDefinition.csMin/csMax`, 889-890).
  - **MANGLER P-posisjon:** `pPosisjoner` finnes på `TrainingSessionV2`-området (2606), ikke på `TrainingPlanSession`.
  - AK-formel-enumene finnes: `PyramidArea` (69), `LFase`/`LPhase` (221), `MMiljo`/`SessionEnvironment` (238), `PRPress`/`PressureLevel` (201/247).
- **KRITISK — persistering:** `addWorkbenchSession` (actions.ts:442-463) og `coachAddWorkbenchSession` (session-actions.ts:92) skriver KUN `title/scheduledAt/durationMin/pyramidArea/status`. `lPhase`/`environment`/`pressureLevel`-kolonnene **skrives aldri** fra Workbench → AK-formel-redigering i inspektøren persisteres ikke. (Form-actionen `createTrainingPlanSession`, 270-317, skriver `pyramidArea`+`environment`, men ikke `lPhase`/`pressureLevel`/CS.)
- **Øktstatus-enum `SessionStatus` (39-47):** `PLANNED, ACTIVE, PAUSED, COMPLETED, ABANDONED, SKIPPED, CANCELLED`. **Avviker fra** ønsket `PLANLAGT→BOOKET→KLAR→PÅGÅR→LOGGET→VURDERT→LUKKET` — det norske 7-trinns livsløpet finnes ikke (ingen BOOKET/KLAR/LOGGET/VURDERT/LUKKET). `SessionStatusV2` (51): `PLANNED/IN_PROGRESS/COMPLETED/CANCELLED/SKIPPED`. `PlanStatus` (209) styrer plan-nivå (DRAFT/PENDING_PLAYER…).
- **Tre parallelle øktmodeller** = datafragmentering: `TrainingPlanSession` (Workbench drag-drop), `TrainingSessionV2` (speiles via `upsertV2ForPlanSession`, `v2-sync.ts`), `PlanSession` (`actions.ts` `listPlanSessions`/`moveSessionAction`, felt `axis/week/day`). Hvilken er kanon = ukjent, må avklares.

---

## F. IA-konflikt — faktisk navigasjon i kode

- **Mobil bottom-nav** (`src/components/portal/bottom-nav.tsx:21-27`): **Hjem · Plan · Gjør · Analyse · Meg** → `/portal`, `/portal/planlegge`, `/portal/gjennomfore`, `/portal/analysere`, `/portal/meg`. Dette er **PLAN/GJØR/ANALYSE-familien** (sentence-case), ikke «Hjem/Tren/Mål/Coach/Meg». Nærmest «HJEM/PLAN/GJØR/ANALYSE/MEG».
- **Desktop-sidebar** (`src/components/portal/sidebar.tsx:35-56`): Hjem + Plan(`/portal/planlegge`), men under-elementene peker på **ELDRE struktur**: Årsplan (`/portal/tren/aarsplan`), Treningsplan (`/portal/tren/teknisk-plan`), Fysplan (`/portal/tren/fys-plan`), Mål (`/portal/mal`), Turneringer (`/portal/tren/turneringer`), Drills, Coach-planer, Coach-meldinger. → **IA-drift: mobil og desktop er ikke samme IA.**
- **Workbench-inngang:** via «Plan»-fanen → `/portal/planlegge` → redirect → `/portal/planlegge/workbench`. Workbench er **ikke en egen tab** — den ligger under Plan. Coach-side: `/admin/planlegge` → redirect → `/admin/spillere/[id]/workbench`.

---

## Åpne spørsmål til Anders (blokkerer prioritering)

1. **AK-formel-persistering:** Skal `lPhase`/`environment`/`pressureLevel` (+ nye **CS** og **P-posisjon**) faktisk lagres fra Workbench-inspektøren? I dag er de klient-only/uskrevne. Krever utvidet add/move-action + 2 nye øktfelt.
2. **Øktstatus-livsløp:** Ønsker du det 7-trinns norske livsløpet (PLANLAGT→BOOKET→KLAR→PÅGÅR→LOGGET→VURDERT→LUKKET)? Dagens enum er engelsk og kortere — avvik må avklares før noe bygges på det.
3. **Tre øktmodeller** (`TrainingPlanSession`/`TrainingSessionV2`/`PlanSession`): tilsiktet, eller skal de konsolideres? Hvilken er kanon?
4. **IA-drift:** Skal desktop-sidebar (eldre `/tren/*` + `/mal`) bringes i samsvar med mobil-IA (Plan/Gjør/Analyse)?
5. **AK-formel-editor ikke rolle-gated** (Inspector): skal spiller kunne endre formelen, eller skal det låses til lese-/«legg i plan»?
6. **«Gantt (År)»** viser periodiserings-bånd (ArsplanView), ikke ekte Gantt; `onPhaseClick` er no-op. Skal det bygges ekte Gantt + periode-inspektør?
7. **Stubs:** CoachSkillWizard + `generateWeekWithCaddie` skriver ingenting. Prioritet?
8. **Manglende katalogfunksjoner** (mikrosyklus, vær-flytt, ACWR, plateau, hva-hvis, versjonering/angre, multi-select, iCal): hvilke er reelt ønsket vs. wishlist?
9. `docs/component-library.md` (pålagt lest) **mangler** i repoet — finnes den et annet sted, eller skal den gjenopprettes?
