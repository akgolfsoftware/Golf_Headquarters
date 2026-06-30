# Workbench — komplett funksjons-, data- & knappe-oversikt (rolledelt)

> **Hva dette er:** Alt som skal være i Workbench — hver funksjon, hvert datafelt, hver knapp — sone for sone,
> delt på **Coach** (AgencyOS, mørkt) og **Spiller** (PlayerHQ, lyst). Forankret i `workbench-fasit.md` +
> auditen (kode-verifisert) + CANON-invariant-laget (`src/lib/canon/`). Bygger på arbeidsbenk-modellen (LÅST).
> Generert 2026-06-30.
>
> **Rolle-kolonner:** **C** = coach, **S** = spiller. `✓` = full · `lese` = ser men kan ikke endre · `—` = skjult.
> Én delt komponent `WorkbenchHybrid` (`role`-prop → `isCoach`, `WorkbenchHybrid.tsx:553`); coach
> `/admin/spillere/[id]/workbench`, spiller `/portal/planlegge/workbench`.

---

## 1. Topp-sonen (`Topbar.tsx` / `MobileTopbar.tsx`)

| Element | Funksjon | Data | Knapp/handling | C | S |
|---|---|---|---|---|---|
| Scope/spiller-velger | Bytt hvilken spiller man planlegger for | Spillerliste (`players`) | dropdown → `/admin/spillere/{id}/workbench` | ✓ | — (statisk pill m/ eget navn) |
| Zoom-switcher | Bytt zoom-nivå | Aktivt nivå | Årsplan·År·Måned·Uke·Dag | ✓ | ✓ |
| Plan-status-pill | Vis planens livssyklus | `PlanStatus` (DRAFT/PENDING_PLAYER/…) | (visning) | ✓ | ✓ |
| Publiser plan | Send utkast til spiller | `planStatus ∈ {DRAFT,REJECTED}` | `publishWorkbenchPlan` (server håndhever rolle) | ✓ | ✓ (status-gated) |
| Ny økt | Legg til tom økt | — | `addWorkbenchSession`/`coachAddWorkbenchSession` | ✓ | ✓ |
| Generer plan (AI) | Naturlig språk → plan | `playerId` | `AiPlanPanel` → `/api/admin/ai-plan` | ✓ | — |
| AI-periodiser | AI-foreslå periodisering | — | `onOpenAiPeriodiser` | — | ✓ |
| Coach-Skill | Ferdighets-veiviser | — | `CoachSkillWizard` (**stub**, ingen DB) | ✓ | — |
| Palette-knapp (mobil) | Åpne bibliotek-ark | — | `setMobilePaletteOpen` | ✓ | — |
| **PLAN-KVALITET-score** (ny) | Vis plan-kvalitet 0–100 | `validatePlan(planId).score` | klikk → bruddliste | ✓ | ✓ (klarspråk) |

## 2. Palette / bibliotek (venstre — `PaletteSidebar.tsx`, coach-only)

Vises kun for coach (`!showPlanningTab && isCoach`, `WorkbenchHybrid.tsx:1165`). Dra/klikk inn i canvas.

| Sone | Funksjon | Data | Knapp/handling | C | S |
|---|---|---|---|---|---|
| Maler | Anvend ferdig plan-mal | `data.planTemplates` | `applyWorkbenchTemplate`; Ny/Rediger mal | ✓ | — |
| Standardøkter | Dra inn ferdig økt | `mapPalette(data)` | klikk/drag inn | ✓ | — |
| Driller | Dra inn øvelse (per-drill AK-formel) | `ExerciseDefinition` | `OvelsesbankModal`, drill-CRUD | ✓ | — |

> Spiller har **ingen palette** — ren ukeflate. Spiller-funksjoner for bibliotek begrenses til «legg i plan»-forespørsel (`requestDrillInPlan`).

## 3. Canvas (midt — `centerView`, `WorkbenchHybrid.tsx:969-1044`)

Selve planen, rendres per zoom-nivå (§7). Drag-drop persisteres.

| Funksjon | Data | Knapp/handling | C | S |
|---|---|---|---|---|
| Dra økt til tid/dag | `state.week` | `moveWorkbenchSession` | ✓ | ✓ |
| Velg økt → inspektør | valgt `selectedId` | klikk | ✓ | ✓ |
| Fjern økt | — | `removeWorkbenchSession` | ✓ | ✓ (egen plan) |
| Overlapp-lanes (uke) | posisjonerte kort | grip-håndtak | ✓ | ✓ |

## 4. Inspektør (høyre — `Inspector.tsx` / `MobileInspectorSheet.tsx`)

Detalj for valgt økt. **AK-formel-redigering er role-gated:** `readOnly={!isCoach}` (`WorkbenchHybrid.tsx:1214/1327`).

| Element | Funksjon | Data (felt) | Knapp/handling | C | S |
|---|---|---|---|---|---|
| Tittel/tid/varighet | Rediger metadata | `title/scheduledAt/durationMin` | inline | ✓ | lese |
| **AK-formel-chips** | Sett metodikk-akser | se §5 | klikk chip → endre | ✓ | lese («lese-visning») |
| Øvelsesliste | Driller i økta | `SessionDrill[]` | legg til / fjern / logg-intervall | ✓ | lese |
| Coach-notat / SG-kobling | Notat per økt | (coach-felt) | coach-chrome (`OktDetailTab` gated) | ✓ | — |
| Fjern økt | Slett | — | `onRemoveSession` | ✓ | ✓ (egen) |
| **Live invariant-varsel** (ny) | Vis brudd på valgt økt | `validateSession(id).brudd` | rød (hard)/amber (myk) kant + melding | ✓ | lese (klarspråk) |
| **Overstyr (ny)** | Overstyr hardt brudd m/ begrunnelse | `overstyrInvariant` | knapp + begrunnelse-felt (logges) | ✓ | — (kan aldri) |

## 5. AK-formelen — de 6 aksene (Inspektør-chips)

Persisteres på `TrainingPlanSession` (kanon). Coach setter, spiller leser.

| Akse | Felt | Enum/verdier | C | S |
|---|---|---|---|---|
| Pyramide | `pyramidArea` | FYS·TEK·SLAG·SPILL·TURN | ✓ | lese |
| L-fase | `lFase` | L_KROPP·L_ARM·L_KOLLE·L_BALL·L_AUTO | ✓ | lese |
| Miljø | `miljo` | M0–M5 | ✓ | lese |
| Køllehastighet | `csNivaa` | CS50–CS100 | ✓ | lese |
| Press | `pressureLevel` | PR1–PR5 | ✓ | lese |
| P-posisjon | `pPosisjoner` | P1–P10 (flere) | ✓ | lese |

Validering ved skriving: `sanitizeAkFormel` (`lib/workbench/ak-formel.ts`).

## 6. Foldbare kontekst-paneler (ikke faner)

| Panel | Funksjon | Data | C | S |
|---|---|---|---|---|
| Sesongmål | Vis/sett sesongens mål | `mapGoals(data)` | ✓ | lese |
| Teknisk plan | L-fase-periodiserte tekniske mål | `tekniskPlan`-ctx (`TechnicalPlan`) | ✓ | lese |
| ACWR-belastning (planlagt) | Akutt:kronisk last | **mangler datamodell** | (kommer) | (kommer) |
| Signal-feed (planlagt, Lag B) | Adaptive signaler | `Signal` | (kommer) | — |

## 7. Bunn-sonen (mobil — `Statusbar.tsx` / `MobileStatusbar.tsx`)

| Element | Funksjon | Data | C | S |
|---|---|---|---|---|
| Volum-bar | Ukens volum vs tak | sum `durationMin` vs `volumPerUke` | ✓ | ✓ |
| Kategori-chips | FYS/TEK/SLAG/SPILL-fordeling | pyramide-minutter | ✓ | ✓ |
| **TEK<15%-varsel** (ny) | Lys rødt når TEK under min | `tek-min`-invariant | ✓ | ✓ (klarspråk) |

## 8. Zoom-nivåene (hoved-navigasjon)

| Zoom | Viser | Interaksjon | Status | C | S |
|---|---|---|---|---|---|
| Årsplan | Periodiserings-bånd | `onPhaseClick` **no-op** (`:1024`) | DELVIS (ikke ekte Gantt) | ✓ | ✓ |
| År | Måned-for-måned | `onMonthClick→openMonth` | EKTE | ✓ | ✓ |
| Måned | Faser+økter+turneringer | `onDayClick→dag` | EKTE | ✓ | ✓ |
| Uke | **Hovedflate** — time-grid 07–22 | drag-drop persist | EKTE | ✓ | ✓ |
| Dag | Dagens økter / økt-detalj | `onTimelineDrop` | EKTE | ✓ | ✓ |

## 9. CANON-validering i benken (Lag A — backend ferdig)

De 9 invariantene (`src/lib/canon/invarianter.ts`) kjøres live mens man planlegger. Backend + override-tabell er bygd; UI-mounting gjenstår (kontrakt under).

| Invariant | Alvorlighet | Hvor det vises | C | S |
|---|---|---|---|---|
| TEK-min, pyramide-maks | hard | Pyramide-sone + plan-kvalitet | ✓ | lese (klarspråk) |
| CS50-ballkontakt, CS-tak, L-fase-tillatt | hard | Inspektør-chip (rød) | ✓ | lese |
| Aldersregel, volum-uke | hard | Uke-sone + plan-kvalitet | ✓ | lese |
| Maks-2-svingendringer | hard | Plan-kvalitet/periode | ✓ | lese |
| Hviledager | myk | Uke-sone (amber) | ✓ | lese |

**Coach-overstyring:** hardt brudd kan overstyres KUN av coach, krever begrunnelse, logges (`InvariantOverride`). **Spiller kan aldri overstyre** og ser bare klarspråk: «Denne uka mangler teknisk trening».

**Integrasjonskontrakt (UI → backend):**
- Chip endres → `validateSession(sessionId)` → `brudd[]` ({alvorlighet, melding, sessionIds}) → rød/amber kant.
- Plan-kvalitetskort → `validatePlan(planId)` → `score` + `brudd` (klikk → hopp via `sessionIds`).
- Overstyr → `overstyrInvariant({invariantId, sessionId|planId, begrunnelse})`.
- «Overstyrt»-tilstand → `hentOverrides({planId|sessionId})`.

---

## 10. Rolleforskjeller — sammendrag (audit D)

| Affordance | Coach | Spiller | Mekanisme |
|---|---|---|---|
| Scope-velger (bytt spiller) | ✓ | — | `isCoach` i topbar |
| Palette (bibliotek) | ✓ | — | `!showPlanningTab && isCoach` |
| Mal-/drill-redigering | ✓ | — | `isCoach`-prop til MalerTab/StdTab |
| AK-formel-redigering | ✓ | lese | `readOnly={!isCoach}` |
| Invariant-overstyring | ✓ | — | `requirePortalUser({allow:["COACH","ADMIN"]})` |
| Publiser plan | ✓ | ✓ (status-gated) | server håndhever rolle |
| Multi-select økter | — | — | finnes ikke (single-select reducer) |
| Live validering / plan-kvalitet | ✓ | lese (klarspråk) | samme motor, ulik visning |

**Spiller-essens:** ren ukeflate, leser plan + AK-formel + validerings-resultat i klarspråk, kan dra egne økter + be om endring (`createPlanChangeRequest`/`requestDrillInPlan`) + publiser-status — men redigerer ikke formel, ser ikke palette, kan ikke overstyre.

## 11. Komplett funksjonsliste (status + rolle)

Fra `workbench-fasit.md §4` (audit-verifisert). Status: ekte/delvis/mangler.

| Gruppe | Funksjon | Status | C | S |
|---|---|---|---|---|
| **A Plan** | Drag-drop økt, periodisering, publisering | ekte | ✓ | ✓ |
| | Mikrosyklus-bibliotek, vær-flytt | mangler | — | — |
| | Skole-/hvileblokker | delvis | ✓ | — |
| **B Bibliotek** | Maler (anvend), standardøkter, drill-CRUD | ekte | ✓ | — |
| | Mal-arv med diff-visning | delvis (diff mangler) | ✓ | — |
| | Drill-discovery (AI) | delvis | ✓ | — |
| **C Metodikk** | AK-formel rediger/persister (6 akser) | ekte | ✓ | lese |
| | Teknisk plan, sesongmål | ekte | ✓ | lese |
| | Coach-Skill-veiviser | stub | ✓ | — |
| **D Gjennomføring** | Live-økt, «ønsk økt», offline | ekte | — | ✓ |
| | Kommentar-tråd (3-parts m/forelder) | delvis (2-parts) | ✓ | ✓ |
| **E Analyse** | **CANON-validering + plan-kvalitet (Lag A)** | **ekte (backend)** | ✓ | lese |
| | ACWR, plateau, hva-hvis | mangler | — | — |
| | Auto-rapport, sammenlign perioder | delvis | ✓ | — |
| **F Effektivitet** | ⌘K-palett, batch-godkjenning | ekte | ✓ | ✓ |
| | Multi-select, versjonering/angre, iCal | mangler | — | — |
| | PDF-eksport | ekte | ✓ | — |
| **G AI/adaptiv** | NL→plan, regelmotor | ekte/delvis | ✓ | — |
| | Adaptiv apply (`acceptPlanAction`) | ekte | ✓ | — |
| | Adaptiv trigger-loop, Caddie-uke | mangler/stub | — | — |

## 12. Datakontrakt-referanse (felt som benken leser/skriver)

`TrainingPlanSession` (kanon): `id`, `planId`, `scheduledAt`, `durationMin`, `title`, `rationale`,
`pyramidArea`, `skillArea?`, `environment?`, `lPhase?`, `pressureLevel?`, **`lFase?`**, **`miljo?`**,
**`csNivaa?`**, **`pPosisjoner[]`**, `status`, `liveSnapshot?`. (De fire fete = AK-formel-akser Fase 0.)
Perioder: `SeasonPlan`/`PeriodBlock` (`lPhase` GRUNN/SPESIAL/TURNERING). Validering: `src/lib/canon/`.

---

## Hva som gjenstår å bygge (oppfølging)
1. **UI-mounting av CANON-validering** (Inspektør rød/amber · pyramide-sone · plan-kvalitetskort · spiller-klarspråk) — backend klart, kontrakt §9. *Koordiner med samtidig Workbench-økt.*
2. **Ekte Gantt + periode-inspektør** (`onPhaseClick` no-op i dag).
3. **Manglende funksjoner:** mikrosyklus, vær-flytt, ACWR, plateau, hva-hvis, multi-select, versjonering/angre, iCal, 3-parts kommentar-tråd.
4. **Stubs:** Coach-Skill-veiviser, `generateWeekWithCaddie`.
5. **De 4 manglende invariantene** (miljø/press/P-posisjon/praksis) — venter på CANON v3.5 fra Anders.
6. **IA:** flytt 5 standalone-ruter inn (plans/plan-templates/drills/okter/teknisk-plan); rydd live-dublett `plans/templates` + skyggefil `calendar/page.tsx`.
