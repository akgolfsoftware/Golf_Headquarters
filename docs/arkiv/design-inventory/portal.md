# PlayerHQ — skjerm- & interaksjons-inventar (`/portal`)

> READ-ONLY (BASISPASS). 153 `page.tsx`-ruter verifisert via `find src/app/portal -name page.tsx` (153).
> Hver påstand `fil:linje`, ellers `UVERIFISERT`/`MANGLER`. Samme skjema som `auth.md`/`auth.json`.
> P0 = ★ kjerne i `MASTER-SKJERMPLAN.md`. Element-detalj (knapp-for-knapp) for de 5 hovedskjermene +
> SG-Hub + Live-aktiv er fullt sporet page→klient; øvrige P0 er merket **element-detalj: TODO**.

## Shell-arketype (alle `/portal`-skjermer arver dette)
- **Mobil:** én kolonne + fast bunn-nav, 5 seksjoner (Hjem · Plan · Gjør · Analyse · Meg) — `src/components/portal/bottom-nav.tsx:21`.
- **Desktop:** venstre sidebar-rail (`PortalSidebar`) + header — `src/components/portal/portal-shell.tsx:59,63`.
- **`(fullscreen)` / `(fullscreen-test)`-ruter** dropper shell+bunn-nav (egen layout).
- Default-arketype under = **mobil-kolonne+bunnnav** der ikke annet er utledet fra faktisk layout.

## Verifiserte avvik mot MASTER-SKJERMPLAN
- **Filer som finnes, men IKKE i MASTER PlayerHQ-seksjon:** `baneguide/` (3 ruter), `coach/sg-hub`, `coach/sporsmal` + `coach/sporsmal/ny`, `meg/innstillinger/ai-coach`.
- **MASTER-ruter UTEN matchende fil:** `/portal/mal/baner` + `/portal/mal/baner/[id]` (kun `baneguide/*` finnes), `/portal/statistikk/sammenlign`, `/portal/(fullscreen)/test/[testId]/live` + `/summary` (kun `(fullscreen-test)/tren/tester/[testId]/gjennomfor` finnes).
- **MASTER «Rediger profil ★» = `/portal/meg/profil`**, men ekte redigerings-fil er `meg/profil/rediger/page.tsx`; `/portal/meg/profil` er egen visningsside.
- **Uventede redirect-mål i kode:** `planlegge/workbench` og `analysere` redirecter coach/admin til `/admin/kalender`; `portal/page.tsx` redirecter forelder til `/forelder`.
- **`loading`-state mangler bredt:** de fleste portal-sider er server-rendret uten `loading.tsx`/Suspense (unntak: Workbench bruker Suspense). Markert `MANGLER` der ikke funnet.

---

## Skjermer — Hjem

| id | Rute | Fil | Jobb | Arketype | Desk/Mob | Gating | States (L/E/Err/Suc) | Pri |
|---|---|---|---|---|---|---|---|---|
| portal.hjem | `/portal` | `page.tsx:1` → `dashboard/HybridHomePage.tsx` | Spiller-hjem (dagens økt, SG, coach-notat) | mobil-kolonne+bunnnav | ✓✓✓ | auth-player (forelder→/forelder) | MANGLER · finnes · UVERIFISERT · render | **P0** |
| portal.varsler | `/portal/varsler` | `varsler/page.tsx:235` → `VarslerMarkerKnapp` | Varselliste + marker-lest | mobil-kolonne+bunnnav | ✓✓✓ | auth-player | MANGLER · finnes · UVERIFISERT · render | **P0** |

## Skjermer — Planlegge

| id | Rute | Fil | Jobb | Arketype | Desk/Mob | Gating | States | Pri |
|---|---|---|---|---|---|---|---|---|
| portal.planlegge | `/portal/planlegge` | `planlegge/page.tsx:10` | Inngang til Workbench (mobil) | mobil-kolonne+bunnnav | ✓✓✓ | auth-player (coach/admin→/admin/kalender) | MANGLER · — · UVERIFISERT · render | **P0** |
| portal.workbench | `/portal/planlegge/workbench` | `workbench/page.tsx:26` → `workbench-hybrid` | Workbench lanserings-hub (hub-faner/zoom/Gantt/Uke/palette) | split | ✓✓✓ | auth-player (coach/admin→/admin/kalender) | finnes(Suspense) · finnes · UVERIFISERT · render | **P0** |
| portal.tren.aarsplan | `/portal/tren/aarsplan` | `tren/aarsplan/page.tsx:1` | Årsplan-oversikt | mobil-kolonne+bunnnav | ✓✓– | auth-player | MANGLER · finnes · UVERIFISERT · render | P1 |
| portal.tren.aarsplan.rediger | `/portal/tren/aarsplan/periode/[id]/rediger` | `…/rediger/page.tsx:1` | Rediger periode | wizard | ––– | auth-player | MANGLER · finnes · UVERIFISERT | P2 |
| portal.tren.teknisk-plan | `/portal/tren/teknisk-plan` | `tren/teknisk-plan/page.tsx:1` | Teknisk plan-liste | tabell-tett | ––– | auth-roller | MANGLER · UVERIFISERT · UVERIFISERT | P2 |
| portal.tren.teknisk-plan.detalj | `/portal/tren/teknisk-plan/[planId]` | `…/[planId]/page.tsx:1` | Teknisk plan-detalj | fluid-editorial | ––– | auth-roller | MANGLER · finnes · finnes | P2 |
| portal.tren.fys-plan | `/portal/tren/fys-plan` | `tren/fys-plan/page.tsx:1` | Fys-plan-liste | tabell-tett | ––– | auth-roller | MANGLER · finnes · UVERIFISERT | P2 |
| portal.tren.fys-plan.detalj | `/portal/tren/fys-plan/[planId]` | `…/[planId]/page.tsx:1` | Fys-plan detalj/bygger | wizard | ––– | auth-roller | MANGLER · UVERIFISERT · finnes | P2 |
| portal.drills | `/portal/drills` | `drills/page.tsx:1` | Drill-bibliotek | mobil-kolonne+bunnnav | ✓✓– | auth-player | MANGLER · finnes · UVERIFISERT · render | P1 |
| portal.drills.detalj | `/portal/drills/[id]` | `drills/[id]/page.tsx:1` | Drill-detalj | fluid-editorial | ✓✓– | auth-roller (PLAYER,PARENT) | MANGLER · finnes · UVERIFISERT | P1 |
| portal.mal | `/portal/mal` | `mal/page.tsx:1` | Mål-hub | mobil-kolonne+bunnnav | ––– | auth-player | MANGLER · finnes · UVERIFISERT | P1 |
| portal.mal.bygger | `/portal/mal/bygger` | `mal/bygger/page.tsx:1` | Mål-bygger (wizard, stub) | wizard | ––– | auth-player | MANGLER · UVERIFISERT · UVERIFISERT | P2 |
| portal.mal.goal.detalj | `/portal/mal/goal/[id]` | `mal/goal/[id]/page.tsx:1` | Mål-detalj | fluid-editorial | ––– | auth-player | MANGLER · finnes · UVERIFISERT | P2 |
| portal.mal.milepaeler | `/portal/mal/milepaeler` | `mal/milepaeler/page.tsx:1` | Milepæler | mobil-kolonne+bunnnav | ––– | auth-roller | MANGLER · finnes · UVERIFISERT | P2 |
| portal.mal.leaderboard | `/portal/mal/leaderboard` | `mal/leaderboard/page.tsx:1` | Leaderboard | tabell-tett | ––– | auth-player | MANGLER · finnes · finnes | P2 |
| portal.turneringer | `/portal/tren/turneringer` | `tren/turneringer/page.tsx:1` | Mine turneringer | mobil-kolonne+bunnnav | ✓✓✓ | auth-player | MANGLER · finnes · UVERIFISERT · render | **P0** |
| portal.turneringer.detalj | `/portal/tren/turneringer/[id]` | `…/[id]/page.tsx:1` | Turnering-detalj | fluid-editorial | ✓✓– | auth-roller | MANGLER · finnes · finnes | P1 |
| portal.turneringer.ny | `/portal/tren/turneringer/ny` | `…/ny/page.tsx:1` | Ny turnering | wizard | ––– | auth-roller | MANGLER · UVERIFISERT · UVERIFISERT | P2 |
| portal.utfordringer | `/portal/utfordringer` | `utfordringer/page.tsx:1` | Utfordringer-liste | mobil-kolonne+bunnnav | ––– | auth-roller | MANGLER · finnes · finnes | P2 |
| portal.utfordringer.ny | `/portal/utfordringer/ny` | `utfordringer/ny/page.tsx:1` | Ny utfordring | wizard | ––– | auth-roller | MANGLER · UVERIFISERT · UVERIFISERT | P2 |
| portal.utfordringer.detalj | `/portal/utfordringer/[id]` | `utfordringer/[id]/page.tsx:1` | Utfordring-detalj | fluid-editorial | ––– | auth-roller | MANGLER · finnes · finnes | P2 |
| portal.ai.mal-bygger | `/portal/ai/mal-bygger` | `ai/mal-bygger/page.tsx:1` | AI: mål-bygger | wizard | ––– | auth-roller | UVERIFISERT ×3 | P2 |
| portal.ai.foresla-drill | `/portal/ai/foresla-drill` | `ai/foresla-drill/page.tsx:1` | AI: foreslå drill | wizard | ––– | auth-roller | UVERIFISERT · finnes · UVERIFISERT | P2 |
| portal.ai.foresla-turnering | `/portal/ai/foresla-turnering` | `ai/foresla-turnering/page.tsx:1` | AI: foreslå turnering | wizard | ––– | auth-roller | UVERIFISERT ×3 | P2 |

## Skjermer — Gjennomføre (inkl. live-økt)

| id | Rute | Fil | Jobb | Arketype | Desk/Mob | Gating | States | Pri |
|---|---|---|---|---|---|---|---|---|
| portal.gjennomfore | `/portal/gjennomfore` | `gjennomfore/page.tsx:13` → `gjennomfore-faner.tsx` | I dag / Kalender / Booking (faner) | mobil-kolonne+bunnnav | ✓✓✓ | auth-player | MANGLER · finnes(:192) · UVERIFISERT · render | **P0** |
| portal.gjennomfore.detalj | `/portal/gjennomfore/[id]` | `gjennomfore/[id]/page.tsx:1` | Økt-detalj (V2-økt fra coach) | fluid-editorial | ✓✓✓ | auth-player | MANGLER · finnes · finnes · render | P1 |
| portal.kalender | `/portal/kalender` | `kalender/page.tsx:1` | Kalender | mobil-kolonne+bunnnav | ––– | auth-roller | MANGLER · finnes · UVERIFISERT · render | P1 |
| portal.tren.kalender | `/portal/tren/kalender` | `tren/kalender/page.tsx:1` | Kalender (alt. adresse) | mobil-kolonne+bunnnav | ––– | auth-player | MANGLER · finnes · UVERIFISERT | P2 |
| portal.ny-okt | `/portal/ny-okt` | `ny-okt/page.tsx:1` | Ny økt (handlingsvalg) | modal | ––– | auth-player | MANGLER · finnes · UVERIFISERT · render | P1 |
| portal.trening.logg | `/portal/trening/logg` | `trening/logg/page.tsx:1` | Logg treningsøkt (volum per SG) † | wizard | ✓✓– | auth-player | MANGLER · UVERIFISERT · finnes · render | P1 |
| portal.trening.putte-laboratoriet | `/portal/trening/putte-laboratoriet` | `…/page.tsx:1` | Putte-laboratoriet (3 verktøy) | fluid-editorial | ✓✓– | auth-player | MANGLER · — · UVERIFISERT · render | P1 |
| portal.trening.break-tabell | `/portal/trening/break-tabell` | `…/page.tsx:1` | Break-tabell (3 varianter) | fluid-editorial | ✓✓– | auth-player | MANGLER · — · UVERIFISERT · render | P1 |
| portal.onskeligokt | `/portal/onskeligokt` | `onskeligokt/page.tsx:1` | Ønsket økt (be coach) | wizard | ––– | auth-player | MANGLER · UVERIFISERT · UVERIFISERT | P2 |
| portal.onskeligokt.bekreftet | `/portal/onskeligokt/bekreftet` | `…/bekreftet/page.tsx:1` | Ønsket økt bekreftet | fluid-editorial | ––– | auth-player | MANGLER · finnes · UVERIFISERT | P2 |
| portal.live.root | `/portal/(fullscreen)/live/[sessionId]` | `…/[sessionId]/page.tsx:1` | Live-økt rot (router) | fluid-editorial (fullscreen) | — | fullscreen+auth-roller (→/meg/abonnement) | MANGLER · finnes · finnes(notFound) | P1 |
| portal.live.brief | `/portal/(fullscreen)/live/[sessionId]/brief` | `…/brief/page.tsx:1` | Live-økt: brief † | fluid-editorial (fullscreen) | ✓✓– | fullscreen+auth-roller (→/planlegge/workbench) | MANGLER · finnes · finnes · render | P1 |
| portal.live.active | `/portal/(fullscreen)/live/[sessionId]/active` | `…/active/page.tsx:13` → `live/LiveActive.tsx` | Live-økt: aktiv (timer/reps/logg) † | fluid-editorial (fullscreen) | ✓✓– | fullscreen+auth-roller (→/meg/abonnement) | MANGLER · finnes · finnes(notFound) · render | **P0** |
| portal.live.summary | `/portal/(fullscreen)/live/[sessionId]/summary` | `…/summary/page.tsx:1` | Live-økt: oppsummering † | fluid-editorial (fullscreen) | ✓✓– | fullscreen+auth-roller (→/planlegge) | MANGLER · finnes · finnes · render | P1 |
| portal.live.logger | `/portal/(fullscreen)/live/[sessionId]/logger` | `…/logger/page.tsx:1` | Live-økt: drill-logger | fluid-editorial (fullscreen) | ✓✓– | fullscreen (auth UVERIFISERT) | MANGLER · UVERIFISERT · UVERIFISERT | P1 |
| portal.live.tapper | `/portal/(fullscreen)/live/[sessionId]/tapper` | `…/tapper/page.tsx:1` | Live-økt: score-tapper | fluid-editorial (fullscreen) | ✓✓– | fullscreen+auth-roller (→/planlegge/workbench) | MANGLER · finnes · finnes · render | P1 |
| portal.fullscreen.tren | `/portal/(fullscreen)/tren` | `(fullscreen)/tren/page.tsx:1` | Tren fullskjerm (redirect-stub) | fluid-editorial | ––– | redirect-stub → /planlegge/workbench | — · — · — · redirect | P2 |
| portal.tren.session | `/portal/tren/[sessionId]` | `tren/[sessionId]/page.tsx:1` | Økt-detalj (legacy) | fluid-editorial | ––– | auth-player (→/portal/tren) | MANGLER · finnes · finnes · render | P1 |
| portal.tren.session.planlagt | `/portal/tren/[sessionId]/planlagt` | `…/planlagt/page.tsx:1` | Planlagt økt | fluid-editorial | ––– | auth-player | MANGLER · finnes · finnes | P1 |
| portal.tren.feiring | `/portal/tren/feiring/[planId]` | `…/feiring/[planId]/page.tsx:1` | Feiring (plan ferdig) | fluid-editorial | ––– | auth-player (→/portal/tren) | MANGLER · finnes · finnes | P2 |

## Skjermer — Analysere

| id | Rute | Fil | Jobb | Arketype | Desk/Mob | Gating | States | Pri |
|---|---|---|---|---|---|---|---|---|
| portal.analysere | `/portal/analysere` | `analysere/page.tsx:13` → `analytics/HybridAnalysePage.tsx` | Les tallene (SG/Runder/TrackMan/Tester-faner) | mobil-kolonne+bunnnav | ✓✓✓ | auth-player (coach/admin→/admin/kalender) | MANGLER · finnes(:634/450/483) · UVERIFISERT · render | **P0** |
| portal.analysere.hull | `/portal/analysere/hull` | `analysere/hull/page.tsx:1` | Hull-analyse | tabell-tett | ✓✓– | auth-player | MANGLER · finnes · UVERIFISERT · render | P1 |
| portal.statistikk | `/portal/statistikk` | `statistikk/page.tsx:1` | Statistikk-oversikt | tabell-tett | ✓✓– | auth-player | MANGLER · finnes · UVERIFISERT · render | P1 |
| portal.statistikk.metric | `/portal/statistikk/[metric]` | `statistikk/[metric]/page.tsx:1` | Metrikk-detalj (935 l.) | tabell-tett | ––– | auth-player | MANGLER · finnes · finnes | P2 |
| portal.statistikk.sammenlign | `/portal/statistikk/sammenlign` | **MANGLER (MASTER-rute, ingen fil)** | Sammenlign | UVERIFISERT | ––– | UVERIFISERT | MANGLER ×3 | P2 |
| portal.statistikk.runder.del | `/portal/statistikk/runder/[runId]/del` | `…/del/page.tsx:1` | Del runde | modal | ––– | auth-player | MANGLER · finnes · finnes | P2 |
| portal.sg-hub | `/portal/mal/sg-hub` | `mal/sg-hub/page.tsx:382` → `sg-hub/sg-hub.tsx` | SG-Hub (Strokes Gained) hovedflate | tabell-tett | ✓✓– | auth-player | MANGLER · finnes · UVERIFISERT · render | **P0** |
| portal.sg-hub.club | `/portal/mal/sg-hub/[club]` | `…/[club]/page.tsx:1` | Kølle-detalj | tabell-tett | ––– | auth-player | MANGLER · finnes · UVERIFISERT | P2 |
| portal.sg-hub.benchmark | `/portal/mal/sg-hub/benchmark` | `…/benchmark/page.tsx:1` | Benchmark | tabell-tett | ––– | auth-player | MANGLER · finnes · UVERIFISERT | P2 |
| portal.sg-hub.best-vs-now | `/portal/mal/sg-hub/best-vs-now` | `…/best-vs-now/page.tsx:1` | Best vs nå | tabell-tett | ––– | auth-player | MANGLER · finnes · UVERIFISERT | P2 |
| portal.sg-hub.equipment | `/portal/mal/sg-hub/equipment` | `…/equipment/page.tsx:1` | Utstyr | tabell-tett | ––– | auth-player | MANGLER · finnes · finnes | P2 |
| portal.sg-hub.yardage | `/portal/mal/sg-hub/yardage` | `…/yardage/page.tsx:1` | Avstander (yardage) | tabell-tett | ––– | auth-player | MANGLER · finnes · UVERIFISERT | P2 |
| portal.sg-hub.conditions | `/portal/mal/sg-hub/conditions` | `…/conditions/page.tsx:1` | Forhold (vær/bane) | tabell-tett | ––– | auth-player | MANGLER · finnes · UVERIFISERT | P2 |
| portal.sg-hub.strategy | `/portal/mal/sg-hub/strategy` | `…/strategy/page.tsx:1` | Strategi | tabell-tett | ––– | auth-player | MANGLER · finnes · UVERIFISERT | P2 |
| portal.sg-hub.coach | `/portal/mal/sg-hub/coach/[spillerId]` | `…/coach/[spillerId]/page.tsx:1` | Coach ser spiller-SG | tabell-tett | ––– | auth-player (COACH/ADMIN) | MANGLER · finnes · UVERIFISERT | P2 |
| portal.sg-hub.coach.club | `/portal/mal/sg-hub/coach/[spillerId]/[club]` | `…/[club]/page.tsx:1` | Coach: kølle | tabell-tett | ––– | auth-player | MANGLER · finnes · UVERIFISERT | P2 |
| portal.sg-hub.coach.equipment | `/portal/mal/sg-hub/coach/[spillerId]/equipment` | `…/equipment/page.tsx:1` | Coach: utstyr (stub) | tabell-tett | ––– | auth-player | MANGLER · UVERIFISERT · UVERIFISERT | P2 |
| portal.runder | `/portal/mal/runder` | `mal/runder/page.tsx:1` | Runder-liste | mobil-kolonne+bunnnav | ✓✓– | auth-player | MANGLER · finnes · UVERIFISERT · render | P1 |
| portal.runder.detalj | `/portal/mal/runder/[id]` | `mal/runder/[id]/page.tsx:1` | Runde-detalj | fluid-editorial | ✓✓✓ | auth-player | MANGLER · finnes · finnes(notFound) · render | **P0** |
| portal.runder.shot-by-shot | `/portal/mal/runder/[id]/shot-by-shot` | `…/shot-by-shot/page.tsx:1` | Slag-for-slag visning | tabell-tett | ––– | auth-player | MANGLER · finnes · finnes | P2 |
| portal.runder.slag | `/portal/mal/runder/[id]/slag` | `…/slag/page.tsx:1` | Slag-registrering (wizard+UpGame) | wizard | ✓-- | auth-player | MANGLER · finnes · finnes · render | P1 |
| portal.runder.ny | `/portal/mal/runder/ny` | `mal/runder/ny/page.tsx:1` | Logg ny runde | wizard | ✓✓✓ | auth-player | MANGLER · — · UVERIFISERT · render | **P0** |
| portal.trackman | `/portal/mal/trackman` | `mal/trackman/page.tsx:1` | TrackMan-liste | mobil-kolonne+bunnnav | ✓✓– | auth-player | MANGLER · finnes · UVERIFISERT · render | P1 |
| portal.trackman.detalj | `/portal/mal/trackman/[id]` | `…/[id]/page.tsx:1` | TrackMan-sesjon | tabell-tett | ✓✓– | auth-player | MANGLER · finnes · finnes | P2 |
| portal.trackman.alt | `/portal/trackman/[sessionId]` | `trackman/[sessionId]/page.tsx:1` | TrackMan (alt. adresse) | tabell-tett | ✓✓– | auth-player | MANGLER · finnes · finnes | P2 |
| portal.tester | `/portal/tren/tester` | `tren/tester/page.tsx:1` | Tester-oversikt | mobil-kolonne+bunnnav | ✓✓~ | auth-roller | MANGLER · finnes · UVERIFISERT · render | **P0** |
| portal.tester.detalj | `/portal/tren/tester/[testId]` | `…/[testId]/page.tsx:1` | Test-detalj | fluid-editorial | ✓✓~ | auth-player | MANGLER · finnes · finnes · render | **P0** |
| portal.tester.gjennomfor | `/portal/(fullscreen-test)/tren/tester/[testId]/gjennomfor` | `…/gjennomfor/page.tsx:1` | Test-gjennomføring (scorekort) | fluid-editorial (fullscreen) | ✓✓~ | fullscreen (auth UVERIFISERT) | MANGLER · finnes · finnes · render | **P0** |
| portal.tester.katalog | `/portal/tren/tester/katalog` | `…/katalog/page.tsx:1` | Test-katalog (NGF) | mobil-kolonne+bunnnav | ––– | auth-roller | MANGLER · finnes · UVERIFISERT | P2 |
| portal.tester.ny | `/portal/tren/tester/ny` | `…/ny/page.tsx:1` | Ny test | wizard | ––– | auth-player | MANGLER · UVERIFISERT · UVERIFISERT | P2 |
| portal.tester.ny.egen | `/portal/tren/tester/ny/egen` | `…/ny/egen/page.tsx:1` | Ny egen test | wizard | ––– | auth-roller | MANGLER · finnes · UVERIFISERT | P2 |
| portal.baner | `/portal/mal/baner` | **MANGLER (MASTER-rute, ingen fil)** | Bane-bibliotek | UVERIFISERT | ––– | UVERIFISERT | MANGLER ×3 | P2 |
| portal.baner.detalj | `/portal/mal/baner/[id]` | **MANGLER (MASTER-rute, ingen fil)** | Bane-detalj | UVERIFISERT | ––– | UVERIFISERT | MANGLER ×3 | P2 |
| portal.mal.statistikk | `/portal/mal/statistikk` | `mal/statistikk/page.tsx:1` | Statistikk-side (gml.) | tabell-tett | ––– | auth-roller | MANGLER · finnes · UVERIFISERT | P2 |

## Skjermer — Baneguide (IKKE i MASTER, finnes i kode)

| id | Rute | Fil | Jobb | Arketype | Gating | States | Pri |
|---|---|---|---|---|---|---|---|
| portal.baneguide | `/portal/baneguide` | `baneguide/page.tsx:1` | Baneguide-liste | mobil-kolonne+bunnnav | auth (UVERIFISERT) | MANGLER · finnes · UVERIFISERT | P2 |
| portal.baneguide.detalj | `/portal/baneguide/[baneId]` | `…/[baneId]/page.tsx:1` | Baneguide-detalj | fluid-editorial | auth (UVERIFISERT) | MANGLER · finnes · finnes | P2 |
| portal.baneguide.hull | `/portal/baneguide/[baneId]/hull/[nr]` | `…/hull/[nr]/page.tsx:1` | Baneguide hull-detalj | fluid-editorial | auth (UVERIFISERT) | MANGLER · finnes · finnes | P2 |

## Skjermer — Coach (spillerens kontakt med coach)

| id | Rute | Fil | Jobb | Arketype | Gating | States | Pri |
|---|---|---|---|---|---|---|---|
| portal.coach.hub | `/portal/coach` | `coach/page.tsx:1` | Coach-hub | mobil-kolonne+bunnnav | auth-roller | MANGLER · finnes · UVERIFISERT · render | P1 |
| portal.coach.profil | `/portal/coach/[coachId]` | `coach/[coachId]/page.tsx:1` | Coach-profil | fluid-editorial | auth-player | MANGLER · finnes · finnes | P2 |
| portal.coach.melding | `/portal/coach/melding` | `coach/melding/page.tsx:1` | Meldinger (innboks) | split | auth-roller (+PARENT) | MANGLER · finnes · UVERIFISERT · render | P1 |
| portal.coach.melding.ny | `/portal/coach/melding/ny` | `…/ny/page.tsx:1` | Ny melding | wizard | auth-roller | MANGLER · finnes · UVERIFISERT | P2 |
| portal.coach.melding.detalj | `/portal/coach/melding/[id]` | `…/[id]/page.tsx:1` | Meldingstråd | split | auth-roller | MANGLER · finnes · UVERIFISERT | P2 |
| portal.coach.melding.vedlegg | `/portal/coach/melding/[id]/vedlegg` | `…/vedlegg/page.tsx:1` | Vedlegg | modal | auth-roller | MANGLER · finnes · finnes | P2 |
| portal.coach.plans | `/portal/coach/plans` | `coach/plans/page.tsx:1` | Coach-planer | mobil-kolonne+bunnnav | auth-player | MANGLER · finnes · UVERIFISERT | P2 |
| portal.coach.plans.detalj | `/portal/coach/plans/[planId]` | `…/[planId]/page.tsx:1` | Plan-detalj | fluid-editorial | auth-player | MANGLER · finnes · finnes | P2 |
| portal.coach.plans.ny-okt | `/portal/coach/plans/[planId]/ny-okt` | `…/ny-okt/page.tsx:1` | Ny økt i plan | wizard | auth-roller (COACH/ADMIN) | MANGLER · finnes · finnes | P2 |
| portal.coach.plans.perioder | `/portal/coach/plans/perioder` | `…/perioder/page.tsx:1` | Perioder | tabell-tett | auth-roller (COACH/ADMIN) | MANGLER · finnes · UVERIFISERT | P2 |
| portal.coach.ovelser | `/portal/coach/ovelser` | `coach/ovelser/page.tsx:1` | Coach-øvelser | mobil-kolonne+bunnnav | auth-roller | MANGLER · finnes · UVERIFISERT | P2 |
| portal.coach.ovelser.ny | `/portal/coach/ovelser/ny` | `…/ny/page.tsx:1` | Ny øvelse | wizard | auth-roller (COACH/ADMIN) | MANGLER · UVERIFISERT · UVERIFISERT | P2 |
| portal.coach.ovelser.rediger | `/portal/coach/ovelser/[id]/rediger` | `…/rediger/page.tsx:1` | Rediger øvelse | wizard | auth-roller (COACH/ADMIN) | MANGLER · finnes · finnes | P2 |
| portal.coach.videoer | `/portal/coach/videoer` | `coach/videoer/page.tsx:1` | Coach-videoer | mobil-kolonne+bunnnav | auth-roller | MANGLER · finnes · UVERIFISERT | P2 |
| portal.coach.notes | `/portal/coach/notes` | `coach/notes/page.tsx:1` | Coach-notater | mobil-kolonne+bunnnav | auth-player | MANGLER · finnes · UVERIFISERT | P2 |
| portal.coach.notes.detalj | `/portal/coach/notes/[noteId]` | `…/[noteId]/page.tsx:1` | Notat-detalj | fluid-editorial | auth-player | MANGLER · finnes · finnes | P2 |
| portal.coach.sporsmal.detalj | `/portal/coach/sporsmal/[id]` | `…/[id]/page.tsx:1` | Spørsmål til coach (tråd) | split | auth-roller (+PARENT) | MANGLER · finnes · finnes | P2 |
| portal.coach.sporsmal | `/portal/coach/sporsmal` | `coach/sporsmal/page.tsx:1` | Spørsmål-liste (IKKE i MASTER) | mobil-kolonne+bunnnav | auth-roller (COACH/ADMIN) | MANGLER · finnes · UVERIFISERT | P2 |
| portal.coach.sporsmal.ny | `/portal/coach/sporsmal/ny` | `…/ny/page.tsx:1` | Nytt spørsmål (IKKE i MASTER) | wizard | auth-roller (PLAYER/PARENT) | MANGLER · finnes · UVERIFISERT | P2 |
| portal.coach.ai | `/portal/coach/ai` | `coach/ai/page.tsx:1` | Coach-AI | fluid-editorial | auth-roller (+PARENT) | UVERIFISERT · finnes · UVERIFISERT | P2 |
| portal.coach.sg-hub | `/portal/coach/sg-hub` | `coach/sg-hub/page.tsx:1` | Coach SG-hub (IKKE i MASTER) | tabell-tett | auth-roller | MANGLER · finnes · UVERIFISERT | P2 |

## Skjermer — Meg (profil og innstillinger)

| id | Rute | Fil | Jobb | Arketype | Desk/Mob | Gating | States | Pri |
|---|---|---|---|---|---|---|---|---|
| portal.meg | `/portal/meg` | `meg/page.tsx:23` → `meg/meg-hybrid.tsx` | Profil + meny til subsider | mobil-kolonne+bunnnav | ✓✓✓ | auth-player | MANGLER · — · UVERIFISERT · render | **P0** |
| portal.meg.profil | `/portal/meg/profil` | `meg/profil/page.tsx:1` | Profil (visning) | fluid-editorial | ✓✓✓ | auth-player | MANGLER · finnes · UVERIFISERT · render | **P0** |
| portal.meg.profil.rediger | `/portal/meg/profil/rediger` | `…/rediger/page.tsx:1` | Rediger profil (skjema) | wizard | ✓✓✓ | auth-player | MANGLER · finnes · UVERIFISERT · render | **P0** |
| portal.meg.abonnement | `/portal/meg/abonnement` | `meg/abonnement/page.tsx:1` | Abonnement (gratis/300kr, fakturaer) | fluid-editorial | ✓✓✓ | auth-player | MANGLER · finnes · finnes · render | **P0** |
| portal.meg.abonnement.oppgrader | `/portal/meg/abonnement/oppgrader` | `…/oppgrader/page.tsx:1` | Oppgrader (redirect-stub) | fluid-editorial | ––– | redirect-stub → /flyt | — · — · — · redirect | P2 |
| portal.meg.abonnement.oppgrader.flyt | `/portal/meg/abonnement/oppgrader/flyt` | `…/flyt/page.tsx:1` | Oppgrader-flyt | wizard | ––– | auth-player | MANGLER · finnes · finnes | P2 |
| portal.meg.abonnement.avbestill | `/portal/meg/abonnement/avbestill` | `…/avbestill/page.tsx:1` | Avbestill | wizard | ––– | auth-player | MANGLER · finnes · UVERIFISERT | P2 |
| portal.meg.abonnement.kort.ny | `/portal/meg/abonnement/kort/ny` | `…/kort/ny/page.tsx:1` | Nytt kort | wizard | ––– | auth-player | MANGLER · finnes · finnes | P2 |
| portal.meg.abonnement.faktura | `/portal/meg/abonnement/faktura/[id]` | `…/faktura/[id]/page.tsx:1` | Faktura-detalj | fluid-editorial | ––– | auth-player | MANGLER · finnes · finnes | P2 |
| portal.meg.bookinger | `/portal/meg/bookinger` | `meg/bookinger/page.tsx:1` | Mine bookinger | mobil-kolonne+bunnnav | ––– | auth-roller | MANGLER · finnes · UVERIFISERT · render | P2 |
| portal.meg.bookinger.reschedule | `/portal/meg/bookinger/reschedule/[bookingId]` | `…/reschedule/[bookingId]/page.tsx:1` | Endre tid | wizard | ––– | auth-roller (→?error=24t) | MANGLER · finnes · finnes | P2 |
| portal.meg.helse | `/portal/meg/helse` | `meg/helse/page.tsx:1` | Helse (symptomer/belastning) | mobil-kolonne+bunnnav | ✓✓✓ | auth-player | MANGLER · finnes · UVERIFISERT · render | **P0** |
| portal.meg.helse.symptom.ny | `/portal/meg/helse/symptom/ny` | `…/symptom/ny/page.tsx:1` | Nytt symptom | wizard | ––– | auth-player | MANGLER · finnes · UVERIFISERT | P2 |
| portal.meg.innstillinger | `/portal/meg/innstillinger` | `meg/innstillinger/page.tsx:1` | Innstillinger-hub | mobil-kolonne+bunnnav | ✓✓✓ | auth-player | MANGLER · finnes · finnes · render | **P0** |
| portal.meg.innstillinger.varsler | `/portal/meg/innstillinger/varsler` | `…/varsler/page.tsx:1` | Varsel-innstillinger | fluid-editorial | ––– | auth-player | MANGLER · finnes · UVERIFISERT | P2 |
| portal.meg.innstillinger.personvern | `/portal/meg/innstillinger/personvern` | `…/personvern/page.tsx:1` | Personvern | fluid-editorial | ––– | auth-player | MANGLER · finnes · UVERIFISERT | P2 |
| portal.meg.innstillinger.sikkerhet | `/portal/meg/innstillinger/sikkerhet` | `…/sikkerhet/page.tsx:1` | Sikkerhet (innstillinger) | fluid-editorial | ––– | auth-player | MANGLER · finnes · UVERIFISERT | P2 |
| portal.meg.innstillinger.sprak | `/portal/meg/innstillinger/sprak` | `…/sprak/page.tsx:1` | Språk | fluid-editorial | ––– | auth-player | MANGLER · finnes · UVERIFISERT | P2 |
| portal.meg.innstillinger.anlegg | `/portal/meg/innstillinger/anlegg` | `…/anlegg/page.tsx:1` | Anlegg | fluid-editorial | ––– | auth-roller (alle) | MANGLER · finnes · UVERIFISERT | P2 |
| portal.meg.innstillinger.integrasjoner | `/portal/meg/innstillinger/integrasjoner` | `…/integrasjoner/page.tsx:1` | Integrasjoner (523 l.) | fluid-editorial | ––– | auth-player | MANGLER · finnes · finnes | P2 |
| portal.meg.innstillinger.eksport | `/portal/meg/innstillinger/eksport` | `…/eksport/page.tsx:1` | Eksport (redirect-stub) | fluid-editorial | ––– | redirect-stub → /personvern | — · — · — · redirect | P2 |
| portal.meg.innstillinger.okter | `/portal/meg/innstillinger/okter` | `…/okter/page.tsx:1` | Økter (innstilling) | fluid-editorial | ––– | auth-player | MANGLER · finnes · UVERIFISERT | P2 |
| portal.meg.innstillinger.ai-coach | `/portal/meg/innstillinger/ai-coach` | `…/ai-coach/page.tsx:1` | AI-coach-innstilling (IKKE i MASTER) | fluid-editorial | ––– | auth-player | MANGLER · finnes · UVERIFISERT | P2 |
| portal.meg.sikkerhet | `/portal/meg/sikkerhet` | `meg/sikkerhet/page.tsx:1` | Sikkerhet | fluid-editorial | ––– | auth-player | MANGLER · finnes · UVERIFISERT | P2 |
| portal.meg.sikkerhet.2fa | `/portal/meg/sikkerhet/2fa` | `…/2fa/page.tsx:1` | To-faktor (2FA, stub) | wizard | ––– | auth-player | MANGLER · UVERIFISERT · UVERIFISERT | P2 |
| portal.meg.utstyrsbag | `/portal/meg/utstyrsbag` | `meg/utstyrsbag/page.tsx:1` | Utstyrsbag | mobil-kolonne+bunnnav | ✓✓✓ | auth-roller | MANGLER · finnes · UVERIFISERT · render | **P0** |
| portal.meg.dokumenter | `/portal/meg/dokumenter` | `meg/dokumenter/page.tsx:1` | Dokumenter | mobil-kolonne+bunnnav | ✓✓✓ | auth-player | MANGLER · finnes · UVERIFISERT · render | **P0** |
| portal.meg.foreldre | `/portal/meg/foreldre` | `meg/foreldre/page.tsx:1` | Foreldre (foresatt-info) | fluid-editorial | ✓✓– | auth-roller (PLAYER) | MANGLER · finnes · UVERIFISERT · render | P1 |
| portal.meg.feedback | `/portal/meg/feedback` | `meg/feedback/page.tsx:1` | Feedback | wizard | ––– | auth-player | MANGLER · UVERIFISERT · UVERIFISERT | P2 |
| portal.meg.help | `/portal/meg/help` | `meg/help/page.tsx:1` | Hjelpesenter | mobil-kolonne+bunnnav | ✓✓✓ | auth-player | MANGLER · finnes · finnes · render | **P0** |
| portal.meg.help.artikkel | `/portal/meg/help/artikkel/[slug]` | `…/artikkel/[slug]/page.tsx:1` | Hjelp-artikkel | fluid-editorial | ––– | auth-player | MANGLER · finnes · finnes | P2 |
| portal.meg.help.kategori | `/portal/meg/help/kategori/[slug]` | `…/kategori/[slug]/page.tsx:1` | Hjelp-kategori | mobil-kolonne+bunnnav | ––– | auth-player | MANGLER · finnes · finnes | P2 |
| portal.meg.help.kontakt | `/portal/meg/help/kontakt` | `…/kontakt/page.tsx:1` | Kontakt | wizard | ––– | auth-player | MANGLER · UVERIFISERT · UVERIFISERT | P2 |

## Skjermer — Booking

| id | Rute | Fil | Jobb | Arketype | Gating | States | Pri |
|---|---|---|---|---|---|---|---|
| portal.booking | `/portal/booking` | `booking/page.tsx:1` | Booking-hub | mobil-kolonne+bunnnav | auth-roller | MANGLER · finnes · UVERIFISERT · render | P1 |
| portal.booking.ny | `/portal/booking/ny` | `booking/ny/page.tsx:1` | Ny booking (wizard, 576 l.) | wizard | auth-roller (→/coaching) | MANGLER · finnes · finnes · render | P1 |
| portal.booking.ny.bekreft | `/portal/booking/ny/bekreft` | `…/bekreft/page.tsx:1` | Ny booking bekreft | wizard | auth-roller (→/coaching) | MANGLER · finnes · finnes | P2 |
| portal.booking.detalj | `/portal/booking/[bookingId]` | `…/[bookingId]/page.tsx:1` | Booking-detalj | fluid-editorial | auth-roller | MANGLER · finnes · finnes | P2 |
| portal.booking.coach | `/portal/booking/coach/[coachId]` | `…/coach/[coachId]/page.tsx:1` | Coach-profil (booking) | fluid-editorial | auth-roller | MANGLER · finnes · finnes | P2 |
| portal.booking.anlegg | `/portal/booking/anlegg/[anleggId]` | `…/anlegg/[anleggId]/page.tsx:1` | Anlegg-detalj (booking) | fluid-editorial | auth-roller | MANGLER · finnes · finnes | P2 |
| portal.booking.bekreftet | `/portal/booking/bekreftet` | `…/bekreftet/page.tsx:1` | Bekreftet | fluid-editorial | auth-roller | MANGLER · finnes · finnes | P2 |

## Skjermer — Talent (Elite Fase 2 — utsatt)

| id | Rute | Fil | Jobb | Arketype | Gating | States | Pri |
|---|---|---|---|---|---|---|---|
| portal.talent.hub | `/portal/talent` | `talent/page.tsx:1` | Talent-hub | mobil-kolonne+bunnnav | auth-player | MANGLER · finnes · UVERIFISERT | P3 |
| portal.talent.min-plan | `/portal/talent/min-plan` | `talent/min-plan/page.tsx:1` | Min plan | fluid-editorial | auth-roller (PLAYER) | MANGLER · finnes · UVERIFISERT | P3 |
| portal.talent.mitt-niva | `/portal/talent/mitt-niva` | `talent/mitt-niva/page.tsx:1` | Mitt nivå | fluid-editorial | auth-roller (PLAYER) | MANGLER · UVERIFISERT · UVERIFISERT | P3 |
| portal.talent.roadmap | `/portal/talent/roadmap` | `talent/roadmap/page.tsx:1` | Roadmap | fluid-editorial | auth-roller (PLAYER) | MANGLER · finnes · UVERIFISERT | P3 |
| portal.talent.sammenligning | `/portal/talent/sammenligning` | `talent/sammenligning/page.tsx:1` | Sammenligning | tabell-tett | auth-roller (PLAYER) | MANGLER · finnes · UVERIFISERT | P3 |

## Skjermer — Aliaser og hjelpe-ruter

| id | Rute | Fil | Jobb | Arketype | Gating | States | Pri |
|---|---|---|---|---|---|---|---|
| portal.stats.alias | `/portal/stats` | `stats/page.tsx:1` | Alias → /portal/statistikk | fluid-editorial | redirect-stub | redirect | P2 |
| portal.analyse.alias | `/portal/analyse` | `analyse/page.tsx:1` | Alias → /portal/analysere | fluid-editorial | redirect-stub | redirect | P2 |
| portal.tren.ovelser.alias | `/portal/tren/ovelser` | `tren/ovelser/page.tsx:1` | Alias → /portal/drills | fluid-editorial | redirect-stub | redirect | P2 |
| portal.tren.ovelser.detalj.alias | `/portal/tren/ovelser/[id]` | `…/[id]/page.tsx:1` | Øvelse-detalj alias → redirect | fluid-editorial | redirect-stub | redirect | P2 |
| portal.reach | `/portal/reach` | `reach/page.tsx:1` | Reach (oppsøk-verktøy) | fluid-editorial | auth-player | MANGLER · finnes · UVERIFISERT | P2 |
| portal.agent-pipeline | `/portal/agent-pipeline` | `agent-pipeline/page.tsx:1` | Agent-pipeline (AI internt) | tabell-tett | auth (UVERIFISERT) | MANGLER · finnes · UVERIFISERT | P2 |
| portal.spiller | `/portal/spiller/[spillerId]` | `spiller/[spillerId]/page.tsx:1` | Se annen spiller | fluid-editorial | auth (UVERIFISERT, COACH/ADMIN) | MANGLER · finnes · finnes | P2 |

---

# Element-detalj (P0 — page → klient-komponent)

> Linjenr peker klient-komponenten. Tilstander = kun det som er synlig i kode. Responsiv = `md:`/`lg:`/`max-md:`-forskjell, ellers «lik».
> **Fullt sporet:** Hjem, Analysere, Workbench (hoved-chrome), Gjennomføre, Meg, SG-Hub, Live-aktiv.
> **Element-detalj: TODO** (P0 uten full element-sporing i denne kjøringen): Varsler, Turneringer, Runde-detalj, Logg ny runde, Tester (oversikt/detalj/gjennomfør), Meg-subsidene (profil/rediger/abonnement/helse/innstillinger/utstyrsbag/dokumenter/help), Workbench-modaler.

## `portal.hjem` — `dashboard/HybridHomePage.tsx`
| id | Type | Etikett | Ikon | Komponent | Handling | Tilstander | Responsiv | Kilde |
|---|---|---|---|---|---|---|---|---|
| hjem.lnk.start-okt | link | Start/Fortsett dagens økt | Play | next/link | route → today.href | default/hover | lik | `HybridHomePage.tsx:358` |
| hjem.lnk.plan-row | card-link | {session.title} | Activity | next/link | route → session.href | default/hover | lik | `:210` |
| hjem.lnk.hva-nytt | card-link | {a.drillName} | Activity | next/link | route → a.href | default/hover | lik | `:238` |
| hjem.lnk.send-melding | link | Send melding → | — | next/link | route → /portal/coach/melding/ny | default/hover | lik | `:273` |
| hjem.lnk.coach-note | card-link | {message.coachName} | — | next/link | route → message.href | default/hover | lik | `:286` |
| hjem.lnk.planlegg-okt | link | Planlegg økt | ArrowRight | next/link | route → /portal/planlegge | default/hover | lik | `:396` |

Tomtilstander: ingen økt → «Planlegg økt» (`:380`); ingen coach-melding → «Send melding» (`:263`); ingen SG-data → «Ingen SG-data ennå …» (`:196`). `loading`/`error` UVERIFISERT.

## `portal.analysere` — `analytics/HybridAnalysePage.tsx`
| id | Type | Etikett | Ikon | Komponent | Handling | Tilstander | Responsiv | Kilde |
|---|---|---|---|---|---|---|---|---|
| analysere.lnk.tilbake | link | Tilbake | ChevronLeft | next/link | route → /portal | default/hover | lik | `:595` |
| analysere.tab.sg | tab | SG | — | native button | client onChange('sg') | default/active/hover/focus | lik | `:81` |
| analysere.tab.runder | tab | Runder | — | native button | client onChange('runder') | default/active/hover/focus | lik | `:81` |
| analysere.tab.trackman | tab | TrackMan | — | native button | client onChange('trackman') | default/active/hover/focus | lik | `:81` |
| analysere.tab.tester | tab | Tester | — | native button | client onChange('tester') | default/active/hover/focus | lik | `:81` |
| analysere.lnk.round-card | card-link | {courseName} | — | next/link | route → /portal/analysere/runder/{id} | default/hover | lik | `:347` |
| analysere.lnk.trackman | card-link | {s.source} | — | next/link | route → /portal/analysere/trackman/{id} | default/hover | lik | `:455` |
| analysere.lnk.logg-runde | link | Logg runde → | — | next/link | route → /portal/mal/runder/ny | default/hover | lik | `:637` |
| analysere.lnk.se-alle-tester | link | Se alle tester → | — | next/link | route → /portal/analysere/tester | default/hover | lik | `:486` |

Tomtilstander per fane: ingen runder (`:634`), ingen TrackMan (`:450`), ingen tester (`:483`), <2 runder → «Trenger minst 2 runder …» (`:209`). NB: round-/trackman-kort-lenker peker `/portal/analysere/runder|trackman/...` (egne ruter — verifiser eksistens separat).

## `portal.workbench` — `workbench-hybrid/` (hoved-chrome)
| id | Type | Etikett | Ikon | Komponent | Handling | Tilstander | Responsiv | Kilde |
|---|---|---|---|---|---|---|---|---|
| wb.zoom | button | Årsplan/År/Måned/Uke/Dag | — | native button | client setLevel | default/active | desktop Topbar / mobil zoom-rail | `Topbar.tsx:190` / `MobileTopbar.tsx:279` |
| wb.tab.hub | tab | Teknisk plan/Sesongmål/Maler/Standardøkter/Gantt/Uke/Økt | — | native button | client setHubTabWithUrl | default/active | full label desktop, compact mobil | `HubTabRail.tsx:74` |
| wb.btn.publiser | button | Publiser | Send | native button | server-action publishWorkbenchPlan (skriver plan-status) | default/hover/loading/disabled | desktop `Topbar.tsx:310` / mobil 44px `:148` | `Topbar.tsx:310` |
| wb.btn.ny-okt | button | Ny økt | Plus | native button | client handleAddSession | default/hover | desktop `:337` / mobil 44px `:232` | `Topbar.tsx:337` |
| wb.btn.ai | button | AI-periodiser (spiller) / Generer plan + Coach-Skill (coach) | Bot/Sparkles | native button | client onOpenAiPlan/onOpenAiPeriodiser | default/hover | desktop `:235` / mobil `:171` | `Topbar.tsx:235` |
| wb.kpi.tiles | button | Volum uke / Pyramide-balanse / Plan-adherence / Strokes Gained | — | native button | client onOpen → KpiDetailModal | default/hover | lik | `KpiStrip.tsx:53` |
| wb.uke.week-nav | button | Forrige/Neste (uke) | ChevronLeft/Right | native button | client onPrevWeek/onNextWeek (ingen dataflyt v1) | default/disabled/hover | lik | `UkeView.tsx:152` |
| wb.uke.session-card | card-link | {session.title} + drag | GripVertical | div onClick/draggable | client onSessionClick + onSessionDragStart | default/selected/hover/dragging | lik | `UkeView.tsx:343` |

Tomtilstand: tom uke → `EmptyPlanState` (`WorkbenchHybrid.tsx:971`). Modaler (DimPicker, OktplanOverlay, AiPlanPanel, CoachSkillWizard, MobilePaletteSheet m.fl.) — **element-detalj: TODO**.

## `portal.gjennomfore` — `gjennomfore/gjennomfore-faner.tsx`
| id | Type | Etikett | Ikon | Komponent | Handling | Tilstander | Responsiv | Kilde |
|---|---|---|---|---|---|---|---|---|
| gj.lnk.start | link | Start/Fortsett økt | Play | next/link | route → o.href | default/hover | lik | `:90` |
| gj.lnk.rest-start | link | Start (resten av dagen) | Play | next/link | route → o.href | default/hover | lik | `:123` |
| gj.lnk.logg | link | Logg (fullført økt) | Pencil | next/link | route → {o.href}?logg=1 | default/hover | lik | `:152` |
| gj.lnk.tom-planlegg | link | Planlegg i Workbench | ArrowRight | next/link | route → /portal/planlegge | default/hover | lik | `:176` |

Tomtilstand: ingen økt i dag → `TomTilstand` (`:192`). «Logget»-badge for ferdiglogget økt (`:160`).

## `portal.meg` — `meg/meg-hybrid.tsx`
| id | Type | Etikett | Ikon | Komponent | Handling | Tilstander | Responsiv | Kilde |
|---|---|---|---|---|---|---|---|---|
| meg.nav.rediger-profil | link | Rediger profil | User | LinkRow | route → /portal/meg/profil | default/hover | lik | `:264` |
| meg.nav.subsider | link | Sikkerhet/Utstyrsbag/Helse/Dokumenter/Bookinger/Innstillinger/Hjelp | (per rad) | LinkRow | route → /portal/meg/* | default/hover | lik | `:271–344` |
| meg.toggle.push | toggle | Push-varsler | Bell | ToggleRow | client togglePush (skriver preferences) | checked/pending | lik | `:284` |
| meg.toggle.epost | toggle | E-postvarsler | Mail | ToggleRow | client toggleEpost (skriver preferences) | checked/pending | lik | `:292` |
| meg.lnk.oppgrader | link | Oppgrader til PRO | CircleDollarSign | LinkRow | route → /portal/meg/abonnement/oppgrader | default/hover | lik | `:350` |
| meg.btn.logout | button | Logg ut | AlertCircle | form submit | server-action onLogout (Supabase sign out) | default | lik | `:357` |

## `portal.sg-hub` — `sg-hub/sg-hub.tsx`
| id | Type | Etikett | Ikon | Komponent | Handling | Tilstander | Responsiv | Kilde |
|---|---|---|---|---|---|---|---|---|
| sg.lnk.log-runde | link | Logg runde (tom-CTA) | Plus | TomTilstandCta | route → cta.knapp.href | default/hover | lik | `:247` |
| sg.lnk.disiplin-kort | card-link | {eyebrow}/{value} (SG-disiplin) | ArrowUpRight | DisiplinKort | route → href | default/hover/tom/negativ/positiv | lik | `:266` |
| sg.lnk.verktoy-kort | card-link | {verktøy} Åpne → | (per kort) | VerktoyKort | route → href | default/hover/live-badge | desktop grid-2 / mobil grid-1 | `:350` |
| sg.lnk.gap-drill-add | link | Legg til i Workbench | Plus | GapToDrillSeksjon | route → /portal/planlegge | default/hover | lik | `:552` |
| sg.lnk.gap-drill-alle | link | Se alle drills / {drill.title} | — | GapToDrillSeksjon | route → /portal/drills | default/hover | lik | `:559` |

Tomtilstander: hero (`:203`), disiplin-kort «—» (`:286`), TrackMan-kort uten data (`:250`), per-kølle dashed (`:667`).

## `portal.live.active` — `live/LiveActive.tsx` (fullscreen)
| id | Type | Etikett | Ikon | Komponent | Handling | Tilstander | Responsiv | Kilde |
|---|---|---|---|---|---|---|---|---|
| live.btn.close | icon-button | Lukk økt | X | native button | client setShowConfirm/router | default | 44px | `:79` |
| live.btn.pause | icon-button | Pause/Fortsett økt | Pause/Play | native button | client togglePause | paused/toggling | 44px | `:89` |
| live.btn.rep-plus | button | +5 / +10 / +25 (reps) | — | native button | client addReps(n) (lokal state) | active:scale-95 | lik | `:176` |
| live.btn.rep-undo | button | 1 rep angre | Undo2 | native button | client addReps(-1) | default/hover | lik | `:190` |
| live.btn.log | button | Video/Foto/Notat | Video/Camera/FileText | LogButton | client → DrillLogger | default/hover | lik | `:202` |
| live.btn.complete-drill | button | Fullfør drill / Fullfør økt | Check | native button | client handleCompleteDrill (skriver drill-progress) | default/disabled(isCompleting) | lik | `:496` |
| live.btn.see-summary | button | Se oppsummering | — | native button | client completeSession → route summary | default | lik | `:472` |
| live.btn.confirm-end | button | Avslutt og lagre / Fortsett økt | — | ConfirmOverlay | client router.replace / setShowConfirm(false) | default | lik | `:71` |

Overlays/states: `paused` pause-overlay (`:233`), `showConfirm` «Avslutt økt?» (`:387`), `showDrillLogger` fullskjerm logger (`:343`), `allDone`-banner (`:463`). Wake-lock + vibrasjon i kode (`:38`) — UVERIFISERT effekt.

---

## Status denne kjøringen
- ✅ **153 PlayerHQ-skjermer** på basispass-nivå (id/rute/fil/jobb/arketype/desk+mob/roller/gating/states/pri).
- ✅ **Element-detalj** fullt sporet for 7 flater: Hjem, Analysere, Workbench (hoved-chrome), Gjennomføre, Meg, SG-Hub, Live-aktiv.
- ⏳ **Element-detalj: TODO** for resten av P0: Varsler, Turneringer, Runde-detalj, Logg ny runde, Tester ×3, Meg-subsider, Workbench-modaler.
- ⚠ **UVERIFISERT/MANGLER:** `loading`-states bredt MANGLER (server-rendret uten Suspense, unntak Workbench). 4 MASTER-ruter uten fil (`mal/baner` ×2, `statistikk/sammenlign`, `(fullscreen)/test/*`). 6 kode-ruter ikke i MASTER (baneguide ×3, coach/sg-hub, coach/sporsmal ×2, meg/innstillinger/ai-coach). Flere `error`/`empty` markert UVERIFISERT der ikke åpnet på element-nivå.
