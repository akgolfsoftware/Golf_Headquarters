# Workbench-fasit (kanonisk) — AK Golf HQ

> **Det ene dokumentet alt Workbench-arbeid bygges fra.** Forsoner planlaget (funksjonskart/skisser —
> IKKE kodeverifisert) mot koden. **Der plan og kode er uenige vinner ALLTID den kode-verifiserte auditen**
> (`workbench-diff-audit-2026-06-30.md` + `workbench-statusrapport-2026-06-30.md`). Hver påstand peker fil/linje,
> verifisert mot live kode 2026-06-30. Erstatter planlagets fane-påstander.
>
> **Designmodellen er LÅST av Anders (se §1).** Tre planlag-feil er rettet (markert ⚠️ KORRIGERT).

---

## 1. Designmodell — ARBEIDSBENK, ikke hub med faner (LÅST)

Workbench er **én tett arbeidsbenk**, ikke en meny av faner. Bibliotek (palette), plan (canvas) og detalj
(inspektør) er **synlige samtidig**. Brukeren når alt uten å bytte fane. **Zoom** (årsplan/år/måned/uke/dag) er
hoved-navigasjonen. Kontekst-soner (sesongmål, teknisk plan, ACWR, signal-feed) **foldes inn/ut** — de er ikke
faner man bytter til.

**Implementasjon i dag:** Workbench er **én delt klient-komponent** `WorkbenchHybrid` med `role`-prop
(`types.ts:68` → `isCoach`, `WorkbenchHybrid.tsx:553`), montert via to server-sider: coach
`/admin/spillere/[id]/workbench/page.tsx:66` (auth ADMIN/COACH), spiller `/portal/planlegge/workbench/page.tsx:43`
(requirePortalUser). Coach = mørk AdminShell, spiller = lyst standalone (`WorkbenchHybrid.tsx:944-957`).

### ⚠️ KORRIGERT FEIL 1 — fanesett
Planlaget (funksjonskart:122) sier **8 «faner»** for AgencyOS og **7** for PlayerHQ. **Det er feil:** Workbench
er ÉN delt komponent (role-prop) — den kan ikke ha to fanesett. Koden har i dag **7 hub-faner** (`HubTabRail.tsx:8-16`:
tek/seson/maler/std/gantt/uke/okt), like for begge roller. **I arbeidsbenk-modellen er det uansett ikke faner.**
Dagens 7 faner avbildes til arbeidsbenk-soner slik:

| Dagens fane (kode) | Arbeidsbenk-rolle (LÅST mål) |
|---|---|
| `maler` (MalerTab), `std` (StdTab), **Driller** | **PALETTE-soner** (bibliotek man drar fra) |
| `tek` (TekniskPlanTab), `seson` (SesongmalTab) | **FOLDBARE KONTEKST-PANELER** (ikke faner) |
| Plan-livssyklus (publiser/status) | **INSPEKTØR-TILSTAND** |
| `gantt`→arsplan, `uke`, `okt` | **ZOOM-NIVÅER** (§3) |

- **Sesongmål SKAL beholdes** — planlaget droppet den feilaktig. Den er ekte i kode (`SesongmalTab.tsx`,
  `mapGoals(data)`, audit B/§statusrapport:44). Beholdes som foldbart kontekst-panel.
- **Driller flyttes inn** fra standalone `/admin/drills` (203 l, audit Hull 7) til **palette** (per-drill AK-formel
  finnes alt på `SessionDrill` etter «Del B etappe 1a»). Ikke en fane.

## 2. Sone-modell (hva ligger hvor)

| Sone | Innhold | Komponent (fil) |
|---|---|---|
| **Topp** | Scope/spiller-velger (coach), zoom-switcher, plan-status-pill, AI-handlinger, Publiser | `Topbar.tsx` / `MobileTopbar.tsx` |
| **Palette (venstre)** | Maler · Standardøkter · Driller — dra/klikk inn i canvas. Coach-only | `PaletteSidebar` (`WorkbenchHybrid.tsx:1165`, `!showPlanningTab && isCoach`) |
| **Canvas (midt)** | Selve planen på valgt zoom-nivå (årsplan-bånd → uke-time-grid → dag) | `centerView` (`WorkbenchHybrid.tsx:969-1044`) |
| **Inspektør (høyre)** | Detalj for valgt økt: AK-formel-chips, øvelser, plan-livssyklus | `Inspector.tsx` (desktop), `MobileInspectorSheet.tsx` (bunn-ark) |
| **Foldbare kontekst-paneler** | Sesongmål, Teknisk plan (+ planlagt: ACWR, signal-feed) | `SesongmalTab.tsx`, `TekniskPlanTab.tsx` |
| **Bunn (mobil)** | Volum-statusbar + kategori-chips | `MobileStatusbar` |
| **KPI/innsikt-stripe** | adherence/sg = `null`→«—» (ingen datamodell ennå) | `WorkbenchHybrid.tsx:1051-1053` |

## 3. Zoom-nivåene (hoved-navigasjon)

5 nivåer (`WorkbenchHybrid.tsx:93`, render `centerView` 969-1044):

| Zoom | Viser | Komponent | Status | Død knapp |
|---|---|---|---|---|
| `arsplan` | Periodiserings-bånd (faser over året) | `ArsplanView` (181 l) | **DELVIS** — *ikke ekte Gantt* | `onPhaseClick` **no-op** (`WorkbenchHybrid.tsx:1024`) |
| `ar` | Året, måned-for-måned | `ArView` | EKTE | — |
| `maned` | Måneden (faser+økter+turneringer) | `ManedView` | EKTE | — |
| `uke` | **Hovedflaten** — time-grid 07–22, dra-drop | `UkeView` | EKTE (drag-drop persist) | — |
| `dag` | Dagens økter / økt-detalj | `DagView` / `OktDetailTab` | EKTE | — |

> ⚠️ «Gantt (År)» i dagens UI er periodiserings-bånd, **ikke ekte Gantt**; klikk på fase er no-op. Ekte Gantt +
> periode-inspektør gjenstår (åpent spørsmål, ikke i datakontrakt-runden).

## 4. Funksjonsliste (rolle + datastatus + fil)

> Rolle: **C**=coach, **S**=spiller, **B**=begge. Status: ekte / delvis / mangler. Gruppene A–G er min syntese
> (ingen diskret «Anders' liste A–G» finnes i repoet); innholdet er audit-verifisert.

### A. Plan & periodisering
| Funksjon | Rolle | Status | Fil |
|---|---|---|---|
| Drag-drop økt i uke-grid | B | ekte | `UkeView.tsx`, `addWorkbenchSession`/`moveWorkbenchSession` (`portal/planlegge/workbench/actions.ts:423/406`) |
| Periodisering (makro-faser) | C | ekte | `ArsplanView.tsx`, `seasonPhases` (`mapSeasonPhases`) |
| Mikrosyklus-bibliotek | C | **mangler** | 0 treff (kun makro `PeriodeType`) |
| Skole-/hvileblokker | C | delvis | `PeriodeType.FERIE` (schema:267); skole mangler |
| Vær-flytt | C | **mangler** | vær = statisk `v2-fixtures.ts:453` |
| Plan-publisering (DRAFT→PENDING) | C (S status-gated) | ekte | `Topbar.tsx:310`, `publish-actions.ts:22-29` |

### B. Bibliotek (palette)
| Funksjon | Rolle | Status | Fil |
|---|---|---|---|
| Maler (anvend) | C | ekte | `MalerTab.tsx`, `applyWorkbenchTemplate`/`coachApplyWorkbenchTemplate` |
| Mal-arv med diff-visning | C | delvis | `apply-template-actions.ts`, `PlanEffectiveness` (schema:1031); **diff-visning mangler** |
| Standardøkter (palette) | C | ekte | `StdTab.tsx`, `mapPalette` (`build-seed.ts:23`) |
| Driller (bibliotek → palette) | C | ekte (standalone i dag) | `admin/drills/page.tsx` (203 l) → skal inn i palette |
| Drill-CRUD i økt | C | ekte | «Del B etappe 2+3» (`OktDetailTab`) |
| Drill-discovery (AI-forslag) | C | delvis | `lib/agents/drill-forslag-agent.ts`, `youtube-search.ts`, `admin/drills/forslag/actions.ts` (full web/IG/TikTok-loop gjenstår) |

### C. Metodikk (AK-formel · teknisk · sesongmål)
| Funksjon | Rolle | Status | Fil |
|---|---|---|---|
| AK-formel-redigering (6 akser) | C (S lese) | **ekte** | `Inspector.tsx` (chips), role-gate `readOnly={!isCoach}` (`WorkbenchHybrid.tsx:1214/1327`) |
| AK-formel-persistering (alle 6) | B | **ekte (Fase 0 ferdig)** | §5 — `createTrainingPlanSession`/`addWorkbenchSession`/`coachAddWorkbenchSession` |
| Per-drill AK-formel | C | ekte | `SessionDrill` («Del B etappe 1a») |
| Teknisk plan (L-fase-periodisert) | B | ekte | `TekniskPlanTab.tsx`, `tekniskPlan`-ctx |
| Sesongmål | B | ekte | `SesongmalTab.tsx`, `mapGoals(data)` |
| Coach-Skill-veiviser | C | **stub** | `CoachSkillWizard.tsx:12` (ingen DB-skriving) |

### D. Gjennomføring & logg
| Funksjon | Rolle | Status | Fil |
|---|---|---|---|
| Live-økt (brief→aktiv→logg→summary) | S | ekte | `portal/(fullscreen)/live/[sessionId]/*` |
| «Ønsk økt»-kø | B | ekte | `SessionRequest` (schema:1508); `portal/onskeligokt/`, `admin/foresporsler/` |
| Offline-modus (PWA) | B | ekte | Serwist: `app/sw.ts`, `public/sw.js`, `app/offline/page.tsx` |
| Kommentar-tråd (3-parts m/forelder) | B | delvis | 2-parts `portal/coach/MessageThread.tsx`; 3-parts/`Message`-modell mangler (`kommunikasjon-panel.tsx:12`) |

### E. Analyse & evaluering
| Funksjon | Rolle | Status | Fil |
|---|---|---|---|
| KPI adherence/SG i Workbench | B | **mangler** (ærlig «—») | `WorkbenchHybrid.tsx:1051-1053` (ingen datamodell) |
| ACWR-belastning | B | **mangler** | 0 treff |
| Plateau-deteksjon | B | **mangler** | 0 treff |
| Hva-skjer-hvis-simulering | C | **mangler** | 0 treff |
| Auto-rapport (uke/måned) | C | delvis | forelder-ukerapport `lib/forelder.ts:329`; coach-rapport mangler |
| Sammenlign perioder | C | delvis | `compare-calendar.tsx` finnes men **ubrukt** |

### F. Effektivitet & samarbeid
| Funksjon | Rolle | Status | Fil |
|---|---|---|---|
| ⌘K kommandopalett | B | ekte | `admin/global-search-modal.tsx`, `portal/global-search-modal.tsx` |
| Multi-select økter | B | **mangler** | single-select reducer (`WorkbenchHybrid.tsx:151`) |
| Versjonering & angre | B | **mangler** | 0 undo/version i Workbench |
| Eksport PDF / iCal | C | delvis | PDF `lib/pdf/plan-document.tsx` ✓; **iCal mangler** |
| Batch-godkjenning | C | ekte | `admin/approvals/actions.ts:74`, `admin/godkjenninger/page.tsx:209` |

### G. AI & adaptiv
| Funksjon | Rolle | Status | Fil |
|---|---|---|---|
| Naturlig språk → plan | C | ekte (panel=default-prompt) | `lib/ai-plan/generate.ts`, `api/admin/ai-plan/route.ts`, `AiPlanPanel.tsx:106` |
| Regelmotor (constraints) | C | delvis | `lib/portal/training/periode-constraints.ts` (ikke coach-konfigurerbar) |
| AI-plan generér via Caddie (uke) | S | **stub** | `generateWeekWithCaddie` (`portal/planlegge/workbench/actions.ts:173`) |
| Adaptiv plan-endring (apply) | C | **ekte** | `acceptPlanAction`→`applyExecutorDelta` (§ korrigert feil 3) |
| Adaptiv trigger-loop (auto-generér) | system | **mangler** | ingen harde signaler → auto-PlanAction ennå |

**Sum ~37 funksjoner:** ekte ~18 · delvis ~9 · mangler ~10. (Marker coach-only: Palette, mal-/drill-redigering,
scope-velger, AK-formel-redigering, AI-plan-generering, batch-godkjenning. Spiller får lese + «legg i plan» + publiser-status-gated + live-økt.)

## 5. Datakontrakt — `TrainingPlanSession` er KANON

**Modell `TrainingPlanSession` (schema:855-895).** Alle seks AK-formel-akser finnes og **persisteres** (verifisert 2026-06-30):

| AK-akse | Kolonne | Enum | Verifisert skrevet i |
|---|---|---|---|
| Pyramide | `pyramidArea` | `PyramidArea` (69) | alle tre skrivestiene |
| L-fase | `lFase` | `LFase` (221) | createTrainingPlanSession:318, addWorkbenchSession:470, coachAdd:108 |
| Miljø | `miljo` | `MMiljo` (238) | …:319 / :471 / :109 |
| Køllehastighet | `csNivaa` | `CSNivaa` (CS50–CS100) | …:320 / :472 / :110 |
| Press | `pressureLevel` | `PressureLevel` (201/247) | …:321 / (sanitize) / :111 |
| P-posisjon | `pPosisjoner` | `String[]` (P1–P10, validert) | …:322 / :474 / :112 |

- **Sentralisert validering:** `sanitizeAkFormel` (`lib/workbench/ak-formel.ts`) renser løse klient-strenger mot
  enum-verdiene før skriving. Brukt av alle tre actions.
- **Skrivestiene:** `createTrainingPlanSession` (actions.ts:271), `addWorkbenchSession` (actions.ts:423),
  `coachAddWorkbenchSession` (session-actions.ts:58). `moveWorkbenchSession`→`executeSessionMove`
  (session-move.ts:51) oppdaterer **kun `scheduledAt`** — nuller ikke AK-felt. ✓
- **Role-gate:** `Inspector`/`MobileInspectorSheet` får `readOnly={!isCoach}` (`WorkbenchHybrid.tsx:1214/1327`) —
  spiller leser («lese-visning»), coach redigerer.

> ⚠️ KORRIGERT vs auditen: auditen sa «CS + P-posisjon MANGLER» og «AK-formel persisteres ikke». **Utdatert** —
> live kode har gått forbi auditen (felt + DB-kolonner finnes, alle seks skrives). CS-enum heter `CSNivaa`
> (CS50–CS100), ikke planlagets `CsLevel{CS0..CS100}` — `CSNivaa` er etablert kanon (brukt av `TrainingDrillV2`).

### Flagget, IKKE løst i denne runden
- **Status-enum-avvik:** `SessionStatus` (schema:39-47) = `PLANNED/ACTIVE/PAUSED/COMPLETED/ABANDONED/SKIPPED/CANCELLED`.
  Ønsket norsk 7-trinns (PLANLAGT→BOOKET→KLAR→PÅGÅR→LOGGET→VURDERT→LUKKET) **finnes ikke**. Egen runde.
- **Tre-modell-fragmentering:** `TrainingPlanSession` (kanon) · `TrainingSessionV2` (speiles via `v2-sync.ts`,
  **kun `miljo` på session-nivå** — full formel bor på `TrainingDrillV2`/drill-nivå) · `PlanSession`
  (`actions.ts:142`, felt axis/week/day). Konsolidering = egen runde; de andre **røres ikke**.
- **v2-sync-beslutning:** session-nivå-speiling av `csNivaa`/`pPosisjoner` til `TrainingSessionV2` har **ingen
  target** (V2-session har kun `miljo`). Full AK-formel mot V2 = per-drill (`TrainingDrillV2`). **Speiling venter.**

## 6. Konsolidering — 5 standalone-ruter må flyttes inn (IKKE påbegynt)

5 plan-ruter lever **standalone** (0 redirect inn i Workbench, audit Hull 7):

| Rute | Status | Inn i |
|---|---|---|
| `/admin/plans` (229 l) | standalone ekte | Workbench canvas/inspektør |
| `/admin/plan-templates` (117 l) | standalone ekte | Palette (Maler) |
| `/admin/drills` (203 l) | standalone ekte | Palette (Driller) |
| `/admin/okter` (439 l) | standalone ekte | Workbench (uke/dag-zoom) |
| `/admin/teknisk-plan` (232 l) | standalone ekte | Foldbart kontekst-panel |

### ⚠️ KORRIGERT FEIL 2 — `plans/templates`
Planlaget (funksjonskart:123) sier `/admin/plans/templates → /admin/plan-templates` er «allerede konsolidert».
**Feil:** redirecten er **FJERNET** (`next.config.ts:60`) → **LIVE DUBLETT** (begge trær lever). Fasiten:
**må konsolideres, ikke ferdig.**

**Skyggefil:** `src/app/admin/calendar/page.tsx` ligger død (skygget av redirect `/admin/calendar/*`→`/admin/kalender/*`,
`next.config.ts:43-44`). Skal fjernes ved IA-rewrite.

> IA-rewrite (flytte de 5 inn + rydde live-dublett + skyggefil) er **egen fase**, ikke datakontrakt-runden.

### ⚠️ KORRIGERT FEIL 3 — `acceptPlanAction`
Planlaget (implementeringsplan:79) sier «bytter bare status i dag, trenger `plan_adjustment_proposal`». **Feil:**
`acceptPlanAction`→`acceptAndApplyPlanAction`→`executePlanAction`→**`applyExecutorDelta` (plan-action-executor.ts:671)**
**ANVENDER allerede** (persisterer sessionsToAdd/Remove/Modify + Notification). **Apply-halvdelen er bygd.** Kun
**trigger-loopen** (harde signaler → auto-generér PlanAction) gjenstår. Ingen ny `plan_adjustment_proposal`-tabell nødvendig.

---

## Oppsummering — hva som faktisk gjenstår
1. **Datakontrakt-Fase 0: FERDIG** (alle 6 AK-felt + persist + role-gate + move-trygghet, gate grønn).
2. **Status-enum** (norsk 7-trinns) — egen runde.
3. **Tre-modell-konsolidering** — egen runde.
4. **IA-rewrite** (5 standalone-ruter inn + live-dublett `plans/templates` + skyggefil `calendar/page.tsx`) — egen fase.
5. **Adaptiv trigger-loop** (apply er bygd; trigger gjenstår).
6. **Ekte Gantt + periode-inspektør** (`onPhaseClick` no-op i dag).
7. **Manglende katalogfunksjoner** (mikrosyklus, vær-flytt, ACWR, plateau, hva-hvis, versjonering, multi-select, iCal).
