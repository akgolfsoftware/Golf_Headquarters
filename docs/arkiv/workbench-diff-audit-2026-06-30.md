# Workbench — diff-audit mot funksjonskart

> Read-only 2026-06-30. Ingen kode, ingen commit. Fasit = `docs/design-inventory/funksjonskart-agencyos.md`
> (kode-verifisert, område #4 = ~24 skjermer/~55 handlinger — ikke gjenoppdaget). Forslag/planer:
> `funksjonsforslag-10-10-agencyos.md` + `implementeringsplan-agencyos.md` — deres «status i dag» er VERIFISERT
> mot kode, ikke antatt. Coach-Workbench bekreftet under `src/app/admin/*`. Hver påstand peker på fil/linje.
> NB: `docs/component-library.md` (pålagt lest) finnes ikke i repoet.

## Sammendrag
1. **Tre av dokumentenes «status i dag»-påstander er UTDATERTE:** A3-hullet (Tier 1 #4) er **lukket** (`acceptPlanAction` endrer planen), #11 dispersion er **bygd** (ikke plan-stadiet), og `plans/templates→plan-templates`-redirecten er **fjernet** (live dublett, ikke konsolidert).
2. **Workbench-rammen er ekte:** 7 hub-faner + 5 zoom leser Prisma. Men prototypens 8-fane-liste avviker — ingen «Driller»- eller «Plan»-fane i kode; «Sesongmål» finnes i stedet; «Gantt» er periodiserings-bånd, ikke ekte Gantt.
3. **Datakontrakt-gap:** AK-formelen persisteres ikke fra Workbench (kun `pyramidArea` skrives); **CS + P-posisjon mangler** i øktmodellen; status-enum avviker fra PLANLAGT→…→LUKKET.
4. **Konsolidering ikke påbegynt:** alle 5 plan-ruter (`plans`/`plan-templates`/`drills`/`okter`/`teknisk-plan`) lever **standalone** (0 redirect inn i Workbench) → 5/5 må flyttes inn ved IA-rewrite.
5. **19 prototypefunksjoner:** 5 finnes, 7 delvis, 7 mangler.

---

## Hull 1 — UI-datastatus (per fane/zoom)

Prototypens 8-fane-liste (funksjonskart:122) avbildet mot faktisk kode (`HubTabRail.tsx:8-16` har 7 faner: tek/seson/maler/std/gantt/uke/okt):

| Prototype-fane | Faktisk i kode | Fil | Ekte/mock | Døde knapper |
|---|---|---|---|---|
| Plan | ingen egen «Plan»-fane → uke/gantt-zoom | `WorkbenchHybrid.tsx` centerView (969-1044) | **EKTE** (Prisma via `load-workbench.ts`) | — |
| Maler | `maler`-fane | `MalerTab.tsx` | **EKTE** (`data.planTemplates`) | diff-visning mangler |
| Driller | **ikke Workbench-fane** → standalone `/admin/drills` + `OvelsesbankModal` | `admin/drills/page.tsx` (203 l, 4 prisma), `OvelsesbankModal.tsx` | **EKTE** | — |
| Standardøkter | `std`-fane | `StdTab.tsx` | **EKTE** (`mapPalette(data)`, build-seed.ts:23) | — |
| Teknisk | `tek`-fane | `TekniskPlanTab.tsx` | **EKTE** (`tekniskPlan`-ctx) | — |
| Gantt | `gantt`→`arsplan`-zoom | `ArsplanView.tsx` (181 l) | **DELVIS** — periodiserings-bånd, ikke ekte Gantt | **`onPhaseClick` no-op** (`WorkbenchHybrid.tsx:1024`) |
| Uke | `uke`-fane | `UkeView.tsx` | **EKTE** (drag-drop persist) | — |
| Økt | `okt`-fane | `OktDetailTab.tsx` | **EKTE/DELVIS** | coach-chrome gated |
| *(Sesongmål — i kode, ikke i prototype-lista)* | `seson`-fane | `SesongmalTab.tsx` | **EKTE** (`mapGoals(data)`) | — |

**Stubs/ærlige tomtilstander (begge roller):** `CoachSkillWizard.tsx:12` (stub, ingen DB-skriving); `generateWeekWithCaddie` (`portal/planlegge/workbench/actions.ts:173`, stub «post-launch»); KPI `adherence`+`sg` = `null`→«—» (`WorkbenchHybrid.tsx:1051`); hardkodede dagnavn `DAY_NAMES` (`WorkbenchHybrid.tsx:123`). `AiPlanPanel` er ekte (`/api/admin/ai-plan`, AiPlanPanel.tsx:106) men sender default-prompt.

---

## Hull 2 — Spiller-paritet

Modell: **én delt komponent** `WorkbenchHybrid` med `role`-prop (`types.ts:68`) → `isCoach` (`:553`). Coach-side `/admin/spillere/[id]/workbench/page.tsx:66` (`role="coach"`, auth ADMIN/COACH); spiller-side `/portal/planlegge/workbench/page.tsx:43` (`role="player"`).

| Affordance | Synlig for spiller | Gating-mekanisme | Fil:linje |
|---|---|---|---|
| Scope-velger (bytt spiller) | Nei | `isCoach` i topbar | `Topbar.tsx:134`, `MobileTopbar.tsx:85` |
| Publiser plan | Ja, status-gated | Ikke role-gated; vises hvis `onPublish && planStatus∈{DRAFT,REJECTED}`; server håndhever rolle | `Topbar.tsx:310`; `publish-actions.ts:22-29` |
| PaletteSidebar | Nei | `!showPlanningTab && isCoach` | `WorkbenchHybrid.tsx:1165` |
| Bulk/multi-select | Finnes ikke (noen) | Single-select reducer | `WorkbenchHybrid.tsx:151` |
| Mal-redigering | Nei | `isCoach`-prop til `MalerTab`/`StdTab` | `MalerTab.tsx:119,177`; `StdTab.tsx:84,211` |
| AK-formel-editor | **Delvis ja** | **Inspector IKKE role-gated** (spiller kan endre); kun OktDetailTab-chrome `isCoach`-gated | `Inspector.tsx:319`; `OktDetailTab.tsx:148,206,372,396` |

**Hull:** Inspector lar spiller endre AK-formel-chips uten rolle-sjekk. Bør verifiseres mot ønsket regel.

---

## Hull 3 — Datakontrakt

**Modeller (`prisma/schema.prisma`):** `TrainingPlan` (787), `TrainingPlanSession` (855), `PlanTemplate` (969), `PlanTemplateSession` (1006), `TrainingPlanSessionLog` (1066), `PlanAction` (1398), `TrainingSessionV2` (2499), `PlanSession` (brukt i `actions.ts:142`), `TechnicalPlan`/`Position`/`PositionTask` (3340/3445/3467).
- **`TrainingPlanWeek` finnes IKKE** — uker utledes fra `TrainingPlanSession.scheduledAt` (`@@index`, :877).
- **AK-formel på `TrainingPlanSession` (855-867):** `pyramidArea`✓, `lPhase?`✓, `environment`✓ (=miljø), `pressureLevel?`✓, `skillArea?`. **MANGLER CS (club speed)** (kun på `ExerciseDefinition.csMin/csMax`, 889). **MANGLER P-posisjon** (kun på `TrainingSessionV2`-området, 2606).
- **KRITISK:** `addWorkbenchSession` (`actions.ts:442`) + `coachAddWorkbenchSession` (`session-actions.ts:92`) skriver KUN `title/scheduledAt/durationMin/pyramidArea/status`. `lPhase`/`environment`/`pressureLevel`-kolonnene **skrives aldri** fra Workbench → AK-formel-redigering i inspektøren persisteres ikke.
- **Status-enum `SessionStatus` (39-47):** `PLANNED/ACTIVE/PAUSED/COMPLETED/ABANDONED/SKIPPED/CANCELLED`. **Avviker fra** PLANLAGT→BOOKET→KLAR→PÅGÅR→LOGGET→VURDERT→LUKKET — det norske 7-trinns livsløpet finnes ikke.
- **Tre parallelle øktmodeller** (`TrainingPlanSession`/`TrainingSessionV2`/`PlanSession`) = datafragmentering; kanon ukjent.

---

## Hull 4 — 19 prototypefunksjoner vs. kode (+ Tier-match)

| # | Funksjon | Status | Fil | Tier-match (funksjonsforslag) |
|---|---|---|---|---|
| 1 | Naturlig språk→plan | finnes | `lib/ai-plan/generate.ts`, `api/admin/ai-plan/route.ts` (Workbench-panel = default-prompt) | løst #1/#4 (T1) |
| 2 | Regelmotor | delvis | `lib/portal/training/periode-constraints.ts` | (del av #4 T1) |
| 3 | Mikrosyklus-bibliotek | **mangler** | — (kun makro `PeriodeType`) | — |
| 4 | Skole-/hvileblokker | delvis | `PeriodeType.FERIE` (schema:267); skole mangler | — |
| 5 | Vær-flytt | **mangler** | vær = `v2-fixtures.ts:453` (statisk) | — |
| 6 | Offline-modus | finnes | Serwist: `app/sw.ts`, `public/sw.js`, `app/offline/page.tsx` | — |
| 7 | Kommentar-tråd (3-parts) | delvis | `portal/coach/MessageThread.tsx` (kun 2-parts); `Message`-modell mangler (TODO `kommunikasjon-panel.tsx:12`) | jf. #7 (T2 video) |
| 8 | «Ønsk økt»-kø | finnes | `SessionRequest` (schema:1508); `portal/onskeligokt/`, `admin/foresporsler/` | — |
| 9 | ACWR-belastning | **mangler** | 0 treff | **#9 Tier 2** |
| 10 | Plateau-deteksjon | **mangler** | 0 treff | — |
| 11 | Hva-skjer-hvis-simulering | **mangler** | 0 treff (what-if) | — |
| 12 | Auto-rapport | delvis | forelder-ukerapport `lib/forelder.ts:329`; coach måneds/periode mangler | — |
| 13 | Versjonering & angre | **mangler** | 0 undo/version i Workbench | — |
| 14 | ⌘K-palett | finnes | `admin/global-search-modal.tsx`, `portal/global-search-modal.tsx` | — |
| 15 | Multi-select økter | **mangler** | single-select reducer | — |
| 16 | Mal-arv med diff | delvis | `apply-template-actions.ts`, `PlanEffectiveness` (schema:1031); **diff-visning mangler** | — |
| 17 | Sammenlign perioder | delvis | `athletic/calendars/compare-calendar.tsx` finnes men **ubrukt** | — |
| 18 | Eksport (PDF/iCal) | delvis | PDF: `lib/pdf/plan-document.tsx` ✓; **iCal mangler** (kun Google Calendar-sync) | — |
| 19 | Batch-godkjenning | finnes | `admin/approvals/actions.ts:74`, montert `admin/godkjenninger/page.tsx:209` | jf. #4 godkjenning |

**Sum:** 5 finnes · 7 delvis · 7 mangler. NB: prototype-katalogen og Tier-forslagene (#1–#15) er ulike taksonomier — Tier-match kun der den er entydig.

---

## Hull 5 — Verifiserte kodehull

**a) A3-hullet — `acceptPlanAction` bare status-bytte? → AVKREFTET.**
`acceptPlanAction` (`lib/agents/actions.ts:8`) → `acceptAndApplyPlanAction` (`accept-plan-action.ts:14`) → `executePlanAction` (`plan-action-executor.ts:627`): `computeDelta(...)` + **`applyExecutorDelta(delta, ctx)` (:671)** persisterer `sessionsToAdd/Remove/Modify` + lager `Notification`. Planen ENDRES (med periodiserings- + junior-guard-gater som kan blokkere). Dokumentenes «bytter bare status i dag» (Tier 1 #4 / implementeringsplan:79) er **utdatert** — apply-halvdelen er bygd. *(Trigger-halvdelen — harde signaler som auto-genererer PlanAction — er ikke verifisert her; det er en separat del av #4.)*

**b) #12 Drill-discovery — påbegynt? → BEKREFTET.**
`lib/agents/drill-forslag-agent.ts` + `lib/agents/youtube-search.ts` + `app/admin/drills/forslag/actions.ts` finnes (svakeste SG → AI-drill → `CaddieDraft` → godkjenn → `ExerciseDefinition`). Full loop (web/IG/TikTok-søk + test-generering) gjenstår. Samsvarer med doc-claim.

**c) #11 Dispersion / course management — kun plan-stadiet? → AVKREFTET.**
Betydelig kode finnes: `lib/baneguide/{dispersion.ts (191 l), shot-coords.ts, queries.ts}` + `components/baneguide/{course-map.tsx (204 l), shot-plot-map.tsx (146 l)}` + ruter `/portal/baneguide/*`, `/app/dev-banekart`, `portal/mal/trackman/[id]/dispersion-plot.tsx`. Spredningskart/dispersion er bygd. *Course-management/EV-tee-strategi (DECADE-stil) = ukjent omfang, må verifiseres.* Dokumentenes «på plan-stadiet» er utdatert.

---

## Hull 6 — Faktisk IA

- **Mobil bottom-nav** (`portal/bottom-nav.tsx:21-27`): **Hjem · Plan · Gjør · Analyse · Meg** (`/portal`, `/portal/planlegge`, `/portal/gjennomfore`, `/portal/analysere`, `/portal/meg`). PLAN/GJØR/ANALYSE-familien (sentence-case) — ikke «Hjem/Tren/Mål/Coach/Meg».
- **Desktop-sidebar** (`portal/sidebar.tsx:35-56`): bruker ELDRE struktur (`/portal/tren/aarsplan`, `/portal/tren/teknisk-plan`, `/portal/mal`, …) → **IA-drift mobil vs desktop.**
- **Workbench-inngang:** via «Plan» → `/portal/planlegge` → redirect → `/portal/planlegge/workbench`. Ikke egen tab. Coach: `/admin/planlegge` → redirect → `/admin/spillere/[id]/workbench`.

---

## Hull 7 — Konsolideringsstatus

| Rute | Status | Redirect inn i Workbench? |
|---|---|---|
| `/admin/plans` (229 l, 3 prisma) | STANDALONE EKTE | **Nei** |
| `/admin/plan-templates` (117 l, 2 prisma) | STANDALONE EKTE | **Nei** |
| `/admin/drills` (203 l, 4 prisma) | STANDALONE EKTE | **Nei** |
| `/admin/okter` (439 l, 1 prisma) | STANDALONE EKTE | **Nei** |
| `/admin/teknisk-plan` (232 l, 2 prisma) | STANDALONE EKTE | **Nei** |

→ **5 av 5 må flyttes inn i hub-en. 0 allerede konsolidert** (utover at `/admin/planlegge` selv redirecter inn).

**Dubletter:**
- `/admin/calendar/*` → `/admin/kalender/*`: **aktiv redirect** (`next.config.ts:43-44`). Skyggefilen `src/app/admin/calendar/page.tsx` ligger igjen (død, skygget av redirect).
- `/admin/plans/templates/*` vs `/admin/plan-templates/*`: funksjonskartet PÅSTÅR redirect (linje 123), men **redirecten er FJERNET** (`next.config.ts:60`: «redirecten til /admin/plans/templates er fjernet») → **LIVE DUBLETT** (begge trær lever). Avvik mot fasit.
- `/admin/queue` vs `/admin/oppfolging`: `oppfolging` **re-eksporterer** `queue` (én kilde, ikke redirect).
- Andre relevante redirects: `/portal/tren` → `/portal/planlegge/workbench?tab=uke` (`next.config.ts:88`), `/portal/tren/ovelser` → `/portal/drills` (:83).

---

## Åpne spørsmål til Anders

1. **AK-formel-persistering:** skal `lPhase`/`environment`/`pressureLevel` (+ nye **CS**, **P-posisjon**) lagres fra Workbench? I dag klient-only/uskrevet.
2. **Øktstatus-livsløp:** ønsker du PLANLAGT→…→LUKKET? Dagens enum avviker.
3. **Tre øktmodeller** — konsolideres? Hvilken er kanon?
4. **A3/#4:** apply-halvdelen er bygd — er det **trigger-loopen** (auto-generer PlanAction fra signaler) som gjenstår? Skal dokumentene oppdateres?
5. **#11 dispersion:** spredningskart er bygd — er det **EV-/tee-strategi-laget** (DECADE-stil) som gjenstår?
6. **IA-rewrite:** flytte alle 5 standalone-ruter inn i hub-en + rydde live-dubletten `plans/templates` + skyggefilen `calendar/page.tsx`?
7. **«Gantt»** er periodiserings-bånd (no-op klikk) — bygge ekte Gantt + periode-inspektør?
8. `docs/component-library.md` (pålagt lest) mangler — gjenopprettes?

---

## De 3 viktigste avvikene mot funksjonskartet
1. **Tre statuspåstander er utdaterte:** A3-hullet (Tier 1 #4) er LUKKET (`executePlanAction` endrer planen), #11 dispersion er BYGD (ikke plan-stadiet), og `plans/templates`-redirecten er FJERNET (live dublett, ikke konsolidert som kartet påstår).
2. **Prototypens 8-fane-Workbench matcher ikke koden:** ingen «Driller»- eller «Plan»-fane (Driller = standalone `/admin/drills`); «Sesongmål» finnes i stedet; «Gantt» er periodiserings-bånd, ikke ekte Gantt.
3. **Konsolidering er ikke påbegynt:** 5/5 plan-ruter lever standalone — funksjonskartets «Workbench er allerede X, men Y lever ved siden av» bekreftes fullt ut.
