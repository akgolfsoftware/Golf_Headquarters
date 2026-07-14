# Master-skjermplan — AK Golf HQ

> Autoritativ oversikt over alle skjermer i plattformen. Én plass å se alt. **Sist oppdatert: 6. juli 2026.**

> **OPPDATERT KANON (2026-07-08):** Design-kanon er nå UTELUKKENDE det levende Claude Design-
> prosjektet (`claude.ai/design/p/bb9b2b1d-ce2b-4757-be37-ee2096ba9d0d`), hentet direkte via
> DesignSync — se `.claude/rules/design-system-regel.md`. Ingen "andre lag"-unntak for
> driftsskjermer lenger; alt bygges mot dette til slutt. «Design=✓» måler mot faktisk 1:1-
> komposisjon fra `src/components/athletic/golfdata/` (portet fra prosjektets `components/`).
>
> **2026-07-08 update:** Alle /admin og /portal skjermer har nå .golfdata-scope via AdminShell + PortalShell (v13 tokens aktivert). Komposisjon med golfdata-komponenter (Button, Card, Eyebrow, SpillerTilstandKort, OektKort, KpiTile, kalendere, SG-kort osv) + ingen hex. Design=✓ satt for alle produksjonsskjermer som bruker kanon-komponentene (batch). Se PORTING.md + design-system-regel.md. Drop-off reduseres fortløpende.
> `plans/design-bolgeplan.md` (D0–D5) er slettet — se aktiv plan-fil for gjeldende bølge-rekkefølge
> (E-serien). Bekreftet på kanon i dag: PlayerHQ Hjem/Planlegge/Gjennomføre/Analysere/Meg +
> AgencyOS Spillere/Spiller-analyse. Resten gjenstår.

> **Optimalisering juli 2026:** Navigasjon strammet for færre klikk og skjermer. 
> PlayerHQ: 5 faste seksjoner (Hjem–Plan–Gjør–Analyse–Meg) + Workbench som ett trykkpunkt for alt planlegging, Analysere som samlet analyseflate. 
> Direkte hurtighandlinger fra Hjem. 
> AgencyOS: Flate primær-punkter for Planlegge og Kalender&Bookinger, sterk cockpit med "Ett klikk"-bar. Duplikate adresser og dype grupper redusert. Logisk sted å trykke = alltid hovedseksjonene eller synlige hurtigknapper. Se også .claude/rules/arkitektur.md.

**Booking:** Acuity (`akgolfgroup.as.me`) er midlertidig booking frem til HQ-bookingen lanseres. Sett `BOOKING_ACTIVE=true` i Vercel for å aktivere den innebygde flyten.

---

## Slik bruker vi denne (regel)

Før noen rører en skjerm: finn raden her, jobb mot den, oppdater hakene i samme commit. En skjerm er ikke ferdig før alle seks haker er grønne (✓). Alt Claude Design har tegnet skal kobles — sjekk «drop-off»-lista.

**Låst regel:** enhver funksjon/skjerm som bygges skal optimaliseres for mobil, iPad OG desktop i SAMME leveranse — uansett produkt. Mobile-first/desktop-first (`.claude/rules/arkitektur.md`, `skjermkomposisjon.md`) styrer kun rekkefølgen man bygger førsteutkastet i, ikke hvilke formater som til slutt skal virke. Hake 2 under er verifikasjonen av dette — ikke en unnskyldning for å utsette det ene formatet til en senere økt.

**De seks hakene:**
1. **Design** — ser ut som den skal (riktig utseende, riktig oppsett)
2. **Mob/Desk/iPad** — fungerer fint på tre størrelser. Tre tegn, f.eks. `✓✓–` = mobil og desktop OK, iPad ikke sjekket
3. **Adresse-ok** — riktig nettadresse, ikke bare forhåndsvisning
4. **Flyt** — knappene tar deg dit de skal
5. **Data** — viser ekte tall fra databasen
6. **Funker** — testet, knekker ikke

Tegnforklaring: ✓ = ferdig · ~ = delvis / i arbeid · – = ikke startet

† = bygd + koblet til ekte data + tsc/build grønt — men ikke nettleser-testet ende-til-ende ennå

★ = kjerneskjerm (høy prioritet for design og data)

---

## Status akkurat nå — 17. juni 2026

### Kodebase (kartlagt 17. juni)

**404 sider implementert i Next.js App Router:**

| Type | Antall | Forklaring |
|---|---|---|
| FULL | 383 | Ekte innhold, koblet til data |
| STUB | 17 | Minimal placeholder — trenger ferdigstilling |
| SHELL | 3 | Tomt skall — trenger bygging |
| REDIRECT | 1 | `/admin/spillere/[id]/fremgang` → redirect |

**Backend:** 48 API-endepunkter · 23 cron-agenter (Vercel Cron) · 120+ server-action-filer · ~170 Prisma-modeller

### Design-status (v13-baseline, 6. juli 2026)

Bekreftet komponert fra v13-kit (Design=✓):
- **PlayerHQ:** Hjem (`/portal`) · Planlegge · Gjennomføre · Analysere · Meg
- **AgencyOS:** Spillere (`/admin/spillere`) · Spiller-analyse (`/admin/spillere/[id]/analyse`)

Alt annet er funksjonelt bygget (se FULL-tellingen over), men ikke re-komponert mot dagens
golfdata-kanon ennå. Rekkefølge og fremdrift styres av den aktive E-serie-planen (se plan-fil).

**Mangler design (–):** de fleste sub-sider og sekundærskjermer — se tabellene nedenfor.

---

## Design-fokus for neste sprint

Skjermer som er implementert i kode men IKKE ferdig gjennom design-porting-gaten. Prioritert rekkefølge for Claude Design-arbeid.

### Prioritet 1 — Sub-sider til allerede portede kjerneskjermer

| Område | Skjermer (–) | Data tilgjengelig i Prisma |
|---|---|---|
| PlayerHQ Planlegge | Mål-hub, Mål-bygger, Teknisk plan, Fys-plan, Utfordringer, AI-assistenter | `Goal`, `TechnicalPlan`, `FysiskPlan`, `DrillChallenge`, `SeasonPlan`, `PeriodBlock` |
| PlayerHQ Analysere | SG-Hub sub-sider (equipment/yardage/strategy/conditions/benchmark), Slag-for-slag, TrackMan-sesjon-detalj, Statistikk sub-sider | `Shot`, `HoleScore`, `BrukerSgInput`, `SgInsight`, `ClubMetricTrend`, `TrackManSession`, `TrackManShot` |
| PlayerHQ Gjennomføre | Ny økt (handlingsvalg), Ønsket økt, Økt-detalj, Kalender, Feiring | `TrainingSessionV2`, `SessionParticipant`, `TrainingPlanSessionLog` |
| PlayerHQ Booking | Booking-detalj, Ny booking bekreft, Coach-profil (booking), Anlegg-detalj | `Booking`, `CoachingSession`, `ServiceType`, `Facility`, `Payment` |
| AgencyOS Stall | Spiller-profil, Ny spiller, Tildel test (skjema) | `User`, `Group`, `GroupMember`, `TestAssignment`, `TalentTracking` |
| AgencyOS Planlegge | Plan-mal detalj, Drill-detalj, Teknisk plan, Ny turnering | `TrainingPlan`, `PlanTemplate`, `PlanEffectiveness`, `TechnicalPlan`, `Tournament` |

### Prioritet 2 — Coach-seksjonen (PlayerHQ) — hele seksjonen mangler design

Spillerens kontakt med coachen er implementert i kode men har **Design=– på samtlige skjermer**.

| Skjerm | Adresse | Data |
|---|---|---|
| Coach-hub | `/portal/coach` | `CoachingSession`, `SessionRequest`, `Document` |
| Meldinger (innboks) | `/portal/coach/melding` | `CaddieMessage`, `Notification` |
| Meldingstråd | `/portal/coach/melding/[id]` | `CaddieMessage`, `Document` |
| Coach-planer | `/portal/coach/plans/[planId]` | `TrainingPlan`, `PeriodBlock`, `PlanSession` |
| Coach-øvelser | `/portal/coach/ovelser` | `ExerciseDefinition`, `CoachDrillDirectiv`, `DrillMal` |
| Coach-videoer | `/portal/coach/videoer` | `SessionVideo`, `SessionRecording` |
| Spørsmål til coach | `/portal/coach/sporsmal/[id]` | `CoachNote`, `Document` |

### Prioritet 3 — AgencyOS sekundærskjermer

| Område | Mangler design | Data |
|---|---|---|
| Innsikt | Innsikt-hub, Runder, Tilstander, Analytics | `SgInsight`, `Signal`, `Round`, `HealthEntry` |
| Admin/org | Team, AI-agenter, E-postmaler, Audit-log, Klubb-innstillinger | `ApiKey`, `AuditLog`, `AgentRun`, `EmailTemplate` |
| Gjennomføre | Daglig drift-hub, Ny booking, TrackMan på tvers | `TrainingSessionV2`, `TrackManSession` |
| Workspace | Workspace-hub | `OppgaveCache`, `ProsjektCache`, `NotionConnection` |

### Prioritet 4 — Booking-flyt (selvstendig)

`/booking/[slug]` (ekstern booking via slug) + full intern booking-flyt i portal. Egne server actions for kreditbooking.

### Prioritet 5 — Marketing-sider

`/om-oss` · `/coaching` · `/priser` · `/playerhq` · `/cases` · `/suksess` · `/treningsfilosofi` · blogg-layout · coacher-profil

---

## Skjermene — PlayerHQ

PlayerHQ er spillerens eget verktøy: «hva skal JEG gjøre i dag?» Adressene begynner med `/portal`.

### Hjem

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Hjem (Workbench-hjem) ★ | `/portal` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | Complete v13 (golfdata scope + components)
| Varsler ★ | `/portal/varsler` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | v13 golfdata-scope + Eyebrow/Card primitives (full composition)

### Planlegge

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Planlegge (= Workbench mobil) ★ | `/portal/planlegge` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | Complete v13 (golfdata scope + OektKort etc)
| **Workbench (planlegging)** ★ | `/portal/planlegge/workbench` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | 2026-07-13: mobil-flyt fikset — økt-trykk åpner BunnArk (Start/Se/flytt/slett), årsplan = tappbar liste (ikke 860px-canvas), måned = ukeliste (MndNivaaMobil), ark er bunn-forankret på mobil. Samme dag (kveld): økt-arket har ekte dato-felt (±52 uker, ikke bare ukedag) + «Ny øvelse»-knapp som bytter arkets innhold (ingen modal-i-modal). Samme dag (sent): «...»-overflow-meny på økt-detaljen (erstatter knapperad), Dag-pillen relabelt, og tre nye mobil-only zoom-nivåer — 2 dager (ToDagerNivaa), Liste (ListeNivaaMobil, akse-farget agenda gruppert per dag) og Kanban (KanbanNivaaMobil, Planlagt/Pågår/Fullført) |
| · Plan-bygger (v2 wizard) | `/portal/planlegge/bygger` | – | ✓✓– | ✓ | ✓ | ✓ | ✓ | v2 2026-07-10: 5-stegs wizard per godkjent mockup (phq-plan-bygger); deler kjerner med legacy mal/bygger via lib/plan-builder
| Årsplan | `/portal/tren/aarsplan` | – | ✓✓– | ✓ | ~ | ✓ | ✓ |
| · Rediger periode | `/portal/tren/aarsplan/periode/[id]/rediger` | ~ | --- | ✓ | ✓ | ✓ | ~ |
| · Ny periode | `/portal/tren/aarsplan/periode/ny` | ~ | --- | ✓ | ✓ | ✓ | ~ |
| Teknisk plan (liste) | `/portal/tren/teknisk-plan` | UTGÅTT | --- | → | ✓ | – | ✓ | <!-- redirect til Workbench (next.config) — død listeside slettet 2026-07-11 -->
| · Teknisk plan detalj | `/portal/tren/teknisk-plan/[planId]` | – | --- | ✓ | ~ | ~ | ✓ |
| Fys-plan (liste) | `/portal/tren/fys-plan` | ✓ | ✓✓– | ✓ | ✓ | ✓ | † |
| · Fys-plan detalj/bygger | `/portal/tren/fys-plan/[planId]` | – | --- | ✓ | ~ | ~ | ✓ |
| Drills (bibliotek) | `/portal/drills` | – | ✓✓– | ✓ | ✓ | ✓ | ✓ | 2026-07-13: «Ny øvelse» virker (NyOvelseArk, mobil+desktop); «Legg i økt» → Workbench; død «Dupliser» fjernet; TrainingDrillV2↔bank-FK + plan-driller speiles til live-økta |
| · Drill-detalj | `/portal/drills/[id]` | – | ✓✓– | ✓ | ~ | ✓ | ✓ |
| Mål-hub | `/portal/mal` | – | --- | ✓ | ~ | ~ | ✓ | 2026-07-13: CTA heter nå «Legg til målsetning»; samme inngang lagt på Hjem (rad) og i Workbench-Balanse (NyttMaalArk-hurtigskjema → createGoal) |
| · Mål-bygger (wizard) | `/portal/mal/bygger` | – | --- | ✓ | ~ | ~ | ~ |
| · Mål-detalj | `/portal/mal/goal/[id]` | – | --- | ✓ | ~ | ~ | ~ |
| · Milepæler | `/portal/mal/milepaeler` | – | --- | ✓ | ~ | ~ | ~ |
| · Leaderboard | `/portal/mal/leaderboard` | – | --- | ✓ | ~ | ~ | ~ |
| Turneringer (mine) ★ | `/portal/tren/turneringer` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ |
| · Turnering-detalj | `/portal/tren/turneringer/[id]` | – | ✓✓– | ~ | ~ | – | ~ |
| · Ny turnering | `/portal/tren/turneringer/ny` | – | --- | ✓ | ~ | ~ | ~ |
| Utfordringer | `/portal/utfordringer` | ~ | --- | ✓ | ~ | ~ | ~ |
| · Ny utfordring (wizard) | `/portal/utfordringer/ny` | – | --- | ✓ | ~ | ~ | ~ |
| · Utfordring-detalj | `/portal/utfordringer/[id]` | ✓ | ✓✓– | ✓ | ✓ | ✓ | † |
| AI: mål-bygger | `/portal/ai/mal-bygger` | – | --- | ✓ | ~ | ~ | ~ |
| AI: foreslå drill | `/portal/ai/foresla-drill` | – | --- | ✓ | ~ | ~ | ~ |
| AI: foreslå turnering | `/portal/ai/foresla-turnering` | – | --- | ✓ | ~ | ~ | ~ |

### Gjennomføre (inkl. live-økt)

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Gjennomføre (I dag/Kalender/Booking) ★ | `/portal/gjennomfore` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ |
| · Økt-detalj (V2-økt fra coach) | `/portal/gjennomfore/[id]` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ |
| Kalender | `/portal/kalender` | ✓ | --- | ✓ | ~ | ~ | ✓ | v13 composed (golfdata calendars + scope)
| Kalender (alt. adresse) | `/portal/tren/kalender` | – | --- | ✓ | ~ | ~ | ✓ |
| Ny økt (handlingsvalg) | `/portal/ny-okt` | – | --- | ✓ | ~ | ~ | ✓ |
| Logg treningsøkt (volum per SG) † | `/portal/trening/logg` | – | ✓✓– | ✓ | ✓ | ✓ | ~ |
| **Putte-laboratoriet** (3 verktøy) | `/portal/trening/putte-laboratoriet` | – | ✓✓– | ✓ | ✓ | – | ✓ |
| **Break-tabell** (3 varianter) | `/portal/trening/break-tabell` | – | ✓✓– | ✓ | ✓ | – | ✓ |
| Ønsket økt (be coach) | `/portal/onskeligokt` | – | --- | ✓ | ~ | ~ | ~ |
| · Ønsket økt bekreftet | `/portal/onskeligokt/bekreftet` | – | --- | ✓ | ~ | ~ | ~ |
| Live-økt: brief † | `/portal/(fullscreen)/live/[sessionId]/brief` | – | ✓✓– | ✓ | ✓ | ✓ | ✓ |
| Live-økt: aktiv † | `/portal/(fullscreen)/live/[sessionId]/active` | – | ✓✓– | ✓ | ✓ | ✓ | ✓ | 2026-07-13: bilde/video-opplasting utenfor AI-panelet, kommentar per drill, TrackMan-import (inkl. skjermbilde→AI-vision m/ forhåndsvisning + bilde-fallback), «Ny øvelse» inn i økta, feilsti ved lagringsfeil (aldri stille datatap) |
| Live-økt: oppsummering † | `/portal/(fullscreen)/live/[sessionId]/summary` | – | ✓✓– | ✓ | ✓ | ✓ | ✓ | 2026-07-13: viser media + drill-kommentarer; TrackMan-import i etterkant |
| Live-økt: drill-logger | `/portal/(fullscreen)/live/[sessionId]/logger` | – | ✓✓– | ✓ | ~ | ~ | ✓ |
| Live-økt: score-tapper | `/portal/(fullscreen)/live/[sessionId]/tapper` | – | ✓✓– | ✓ | ~ | ~ | ✓ |
| Tren (fullskjerm) | `/portal/(fullscreen)/tren` | – | --- | ✓ | ~ | ~ | ~ |
| Økt-detalj | `/portal/tren/[sessionId]` | – | --- | ✓ | ~ | ~ | ✓ |
| · Planlagt økt | `/portal/tren/[sessionId]/planlagt` | – | --- | ✓ | ~ | ~ | ✓ |
| Feiring (etter plan ferdig) | `/portal/tren/feiring/[planId]` | – | --- | ✓ | ~ | ~ | ~ |

### Analysere

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Analysere = «Min golf» (6 faner: SG · Fokus · Runder · Baggen · Putting · Nivå — v13 golfdata, bølge 1 2026-07-04) ★ | `/portal/analysere` | ✓ | ✓✓– | ✓ | ✓ | ✓ | † |
| · Hull-analyse | `/portal/analysere/hull` | – | ✓✓– | ✓ | ~ | ✓ | ✓ |
| Statistikk (oversikt) | `/portal/statistikk` | ~ | ✓✓– | ✓ | ✓ | ✓ | ✓ |
| · Metrikk-detalj | `/portal/statistikk/[metric]` | – | --- | ✓ | ~ | ~ | ~ |
| · Sammenlign | `/portal/statistikk/sammenlign` | – | --- | ✓ | ~ | ~ | ~ |
| · Del runde | `/portal/statistikk/runder/[runId]/del` | – | --- | ✓ | ~ | ~ | ~ |
| **SG-Hub (Strokes Gained)** ★ | `/portal/mal/sg-hub` | – | ✓✓– | ✓ | ✓ | ✓ | ✓ |
| · Kølle-detalj | `/portal/mal/sg-hub/[club]` | – | --- | ✓ | ~ | ~ | ~ |
| · Benchmark | `/portal/mal/sg-hub/benchmark` | – | --- | ✓ | ~ | ✓ | ✓ |
| · Best vs nå | `/portal/mal/sg-hub/best-vs-now` | – | --- | ✓ | ~ | ~ | ~ |
| · Utstyr | `/portal/mal/sg-hub/equipment` | – | --- | ✓ | ~ | ~ | ~ |
| · Avstander (yardage) | `/portal/mal/sg-hub/yardage` | – | --- | ✓ | ~ | ~ | ~ |
| · Forhold (vær/bane) | `/portal/mal/sg-hub/conditions` | – | --- | ✓ | ~ | ~ | ~ |
| · Strategi | `/portal/mal/sg-hub/strategy` | – | --- | ✓ | ~ | ~ | ~ |
| · Coach ser spiller-SG | `/portal/mal/sg-hub/coach/[spillerId]` | – | --- | ✓ | ~ | ~ | ~ |
| · Coach: kølle | `/portal/mal/sg-hub/coach/[spillerId]/[club]` | – | --- | ✓ | ~ | ~ | ~ |
| · Coach: utstyr | `/portal/mal/sg-hub/coach/[spillerId]/equipment` | – | --- | ✓ | ~ | ~ | ~ |
| Runder (liste) | `/portal/mal/runder` | – | ✓✓– | ✓ | ~ | ✓ | ✓ |
| · Runde-detalj ★ | `/portal/mal/runder/[id]` | ✓ | ✓✓– | ✓ | ✓ | ✓ | † |
| · Slag-for-slag (visning) | `/portal/mal/runder/[id]/shot-by-shot` | – | --- | ✓ | ~ | ~ | ~ |
| · Avansert slag-redigering (legacy wizard + UpGame-import) | `/portal/mal/runder/[id]/slag` | ✓ | ✓-- | ✓ | ✓ | ✓ | † |
| · Fullfør kjeden (import/hurtig → slag-kjede per hull) ★ | `/portal/mal/runder/[id]/fullfor` | ~ | --- | ✓ | ✓ | ✓ | ~ | <!-- fra main, v13/golfdata — gjenstår v2-port -->
| · Logg ny runde (hurtig score) ★ | `/portal/mal/runder/ny` | ✓ | ✓✓– | ✓ | ✓ | ✓ | † |
| · Live slag-for-slag-føring ★ | `/portal/runde/live` | ✓ | ✓✓– | ✓ | ✓ | ✓ | ✓ |
| · Etterregistrering slag for slag ★ | `/portal/runde/logg` | ✓ | ✓✓– | ✓ | ✓ | ✓ | ✓ |
| TrackMan (liste) | `/portal/mal/trackman` | ✓ | ✓✓– | ✓ | ~ | ✓ | † |
| · TrackMan-sesjon | `/portal/mal/trackman/[id]` | ✓ | ✓✓– | ✓ | ~ | ~ | † |
| · TrackMan (alt. adresse) | `/portal/trackman/[sessionId]` | – | ✓✓– | ✓ | ~ | ~ | ~ |
| Baneguide (baneliste) | `/portal/baneguide` | ✓ | ✓✓– | ✓ | ✓ | ✓ | † |
| · Banekart-oversikt | `/portal/baneguide/[baneId]` | ✓ | ✓✓– | ✓ | ✓ | ✓ | † |
| · Hull-detalj (dispersion) | `/portal/baneguide/[baneId]/hull/[nr]` | ✓ | ✓✓– | ✓ | ✓ | ✓ | † |
| Tester (oversikt) ★ | `/portal/tren/tester` | – | ✓✓~ | ✓ | ✓ | ✓ | ✓ |
| · Test-detalj ★ | `/portal/tren/tester/[testId]` | ✓ | ✓✓– | ✓ | ✓ | ✓ | † |
| · Test-gjennomføring (scorekort) ★ | `/portal/tren/tester/[testId]/gjennomfor` | – | ✓✓~ | ✓ | ✓ | ✓ | ✓ |
| · Test-katalog (NGF) | `/portal/tren/tester/katalog` | – | --- | ✓ | ~ | ~ | ~ |
| · Ny test | `/portal/tren/tester/ny` | – | --- | ✓ | ~ | ~ | ~ |
| · Ny egen test | `/portal/tren/tester/ny/egen` | – | --- | ✓ | ~ | ~ | ~ |
| · Test live (fullskjerm) | `/portal/(fullscreen)/test/[testId]/live` | – | --- | ✓ | ~ | ~ | ~ |
| · Test oppsummering | `/portal/(fullscreen)/test/[testId]/summary` | – | --- | ✓ | ~ | ~ | ~ |
| Bane-bibliotek | `/portal/mal/baner` | – | --- | ✓ | ~ | ~ | ~ |
| · Bane-detalj | `/portal/mal/baner/[id]` | – | --- | ✓ | ~ | ~ | ~ |
| Statistikk-side (gml.) | `/portal/mal/statistikk` | – | --- | ✓ | ~ | ~ | ~ |

### Coach (spillerens kontakt med coach)

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Coach-hub | `/portal/coach` | ~ | --- | ✓ | ~ | ~ | ✓ |
| · Coach-profil | `/portal/coach/[coachId]` | – | --- | ✓ | ~ | ~ | ~ |
| Meldinger (innboks) | `/portal/coach/melding` | ~ | --- | ✓ | ~ | ~ | ✓ |
| · Ny melding | `/portal/coach/melding/ny` | – | --- | ✓ | ~ | ~ | ~ |
| · Meldingstråd | `/portal/coach/melding/[id]` | – | --- | ✓ | ~ | ~ | ~ |
| · Vedlegg | `/portal/coach/melding/[id]/vedlegg` | – | --- | ✓ | ~ | ~ | ~ |
| Coach-planer | `/portal/coach/plans` | ~ | --- | ✓ | ~ | ~ | ~ |
| · Plan-detalj | `/portal/coach/plans/[planId]` | – | --- | ✓ | ~ | ~ | ~ |
| · Ny økt i plan | `/portal/coach/plans/[planId]/ny-okt` | – | --- | ✓ | ~ | ~ | ~ |
| · Perioder | `/portal/coach/plans/perioder` | – | --- | ✓ | ~ | ~ | ~ |
| Coach-øvelser | `/portal/coach/ovelser` | ~ | --- | ✓ | ~ | ~ | ~ |
| · Ny øvelse | `/portal/coach/ovelser/ny` | – | --- | ✓ | ~ | ~ | ~ |
| · Rediger øvelse | `/portal/coach/ovelser/[id]/rediger` | – | --- | ✓ | ~ | ~ | ~ |
| Coach-videoer | `/portal/coach/videoer` | ~ | --- | ✓ | ~ | ~ | ~ |
| Coach-notater | `/portal/coach/notes` | – | --- | ✓ | ~ | ~ | ~ |
| · Notat-detalj | `/portal/coach/notes/[noteId]` | – | --- | ✓ | ~ | ~ | ~ |
| Spørsmål til coach (liste løftet D3; [id]-tråd ikke løftet) | `/portal/coach/sporsmal/[id]` | ~ | --- | ✓ | ~ | ~ | ~ |
| Coach-AI | `/portal/coach/ai` | – | --- | ✓ | ~ | ~ | ~ |

### Meg (profil og innstillinger)

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Meg (profil) ★ | `/portal/meg` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ |
| Rediger profil ★ | `/portal/meg/profil` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ |
| Abonnement ★ | `/portal/meg/abonnement` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ |
| · Oppgrader | `/portal/meg/abonnement/oppgrader` | – | --- | ✓ | ~ | ~ | ~ |
| · Oppgrader-flyt | `/portal/meg/abonnement/oppgrader/flyt` | – | --- | ✓ | ~ | ~ | ~ |
| · Avbestill | `/portal/meg/abonnement/avbestill` | – | --- | ✓ | ~ | ~ | ~ |
| · Nytt kort | `/portal/meg/abonnement/kort/ny` | – | --- | ✓ | ~ | ~ | ~ |
| · Faktura-detalj | `/portal/meg/abonnement/faktura/[id]` | – | --- | ✓ | ~ | ~ | ~ |
| Mine bookinger | `/portal/meg/bookinger` | – | --- | ✓ | ~ | ~ | ~ |
| · Endre tid | `/portal/meg/bookinger/reschedule/[bookingId]` | – | --- | ✓ | ~ | ~ | ~ |
| Helse ★ | `/portal/meg/helse` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ |
| · Nytt symptom | `/portal/meg/helse/symptom/ny` | – | --- | ✓ | ~ | ~ | ~ |
| Innstillinger ★ | `/portal/meg/innstillinger` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ |
| · Varsler | `/portal/meg/innstillinger/varsler` | – | --- | ✓ | ~ | ~ | ~ |
| · Personvern | `/portal/meg/innstillinger/personvern` | – | --- | ✓ | ~ | ~ | ~ |
| · Sikkerhet | `/portal/meg/innstillinger/sikkerhet` | – | --- | ✓ | ~ | ~ | ~ |
| · Språk | `/portal/meg/innstillinger/sprak` | – | --- | ✓ | ~ | ~ | ~ |
| · Anlegg | `/portal/meg/innstillinger/anlegg` | – | --- | ✓ | ~ | ~ | ~ |
| · Integrasjoner | `/portal/meg/innstillinger/integrasjoner` | – | --- | ✓ | ~ | ~ | ~ |
| · Eksport | `/portal/meg/innstillinger/eksport` | – | --- | ✓ | ~ | ~ | ~ |
| · Økter | `/portal/meg/innstillinger/okter` | – | --- | ✓ | ~ | ~ | ~ |
| Sikkerhet | `/portal/meg/sikkerhet` | – | --- | ✓ | ~ | ~ | ~ |
| · To-faktor (2FA) | `/portal/meg/sikkerhet/2fa` | – | --- | ✓ | ~ | ~ | ~ |
| Utstyrsbag ★ | `/portal/meg/utstyrsbag` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ |
| Dokumenter ★ | `/portal/meg/dokumenter` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ |
| Foreldre (foresatt-info) | `/portal/meg/foreldre` | – | ✓✓– | ✓ | ~ | ✓ | ✓ |
| Feedback | `/portal/meg/feedback` | – | --- | ✓ | ~ | ~ | ~ |
| Hjelpesenter ★ | `/portal/meg/help` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ |
| · Hjelp-artikkel | `/portal/meg/help/artikkel/[slug]` | – | --- | ✓ | ~ | ~ | ~ |
| · Hjelp-kategori | `/portal/meg/help/kategori/[slug]` | – | --- | ✓ | ~ | ~ | ~ |
| · Kontakt | `/portal/meg/help/kontakt` | – | --- | ✓ | ~ | ~ | ~ |

### Booking

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Booking-hub | `/portal/booking` | – | ✓✓– | ~ | ~ | ✓ | ✓ |
| · Ny booking (wizard) | `/portal/booking/ny` | – | ✓✓– | ~ | ~ | ✓ | ✓ |
| · Ny booking bekreft | `/portal/booking/ny/bekreft` | – | --- | ✓ | ~ | ~ | ~ |
| · Booking-detalj | `/portal/booking/[bookingId]` | – | --- | ✓ | ~ | ~ | ~ |
| · Coach-profil (booking) | `/portal/booking/coach/[coachId]` | – | --- | ✓ | ~ | ~ | ~ |
| · Anlegg-detalj (booking) | `/portal/booking/anlegg/[anleggId]` | – | --- | ✓ | ~ | ~ | ~ |
| · Bekreftet | `/portal/booking/bekreftet` | – | --- | ✓ | ~ | ~ | ~ |

### Talent (elite-spor — egen del av PlayerHQ)

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Talent-hub | `/portal/talent` | ✓ | ✓✓– | ✓ | ~ | ~ | † |
| · Min plan | `/portal/talent/min-plan` | – | --- | ✓ | ~ | ~ | ~ |
| · Mitt nivå | `/portal/talent/mitt-niva` | – | --- | ✓ | ~ | ~ | ~ |
| · Roadmap | `/portal/talent/roadmap` | – | --- | ✓ | ~ | ~ | ~ |
| · Sammenligning | `/portal/talent/sammenligning` | – | --- | ✓ | ~ | ~ | ~ |

> Merknad: Talent-delen er knyttet til «Elite Fase 2», som er bevisst utsatt. Disse adressene finnes, men er ikke prioritert nå.

### Aliaser og hjelpe-ruter (PlayerHQ)

Disse finnes i appen, men er enten eldre kortadresser som peker videre, eller små hjelpe-sider. Tatt med for å være komplett.

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Stats (alt. → redirect) | `/portal/stats` | – | --- | ✓ | ✓ | – | ✓ |
| Analyse (alt. → redirect) | `/portal/analyse` | – | --- | ✓ | ✓ | – | ✓ |
| Reach (oppsøk-verktøy) | `/portal/reach` | – | --- | ✓ | ~ | ~ | ~ |
| Agent-pipeline (AI internt) | `/portal/agent-pipeline` | – | --- | ✓ | ~ | ~ | ~ |
| Se annen spiller | `/portal/spiller/[spillerId]` | – | --- | ✓ | ~ | ~ | ~ |
| Øvelser (alt. → redirect) | `/portal/tren/ovelser` | – | --- | ✓ | ✓ | – | ✓ |
| · Øvelse-detalj (alt. → redirect) | `/portal/tren/ovelser/[id]` | – | --- | ✓ | ✓ | – | ✓ |

> Merknad: `/portal/stats` og `/portal/analyse` er kortadresser for `/portal/statistikk` og `/portal/analysere`, og `/portal/tren/ovelser` overlapper med `/portal/drills`. Disse bør ryddes til én adresse hver — se «Veien til 100%» (Bolk 4).

---

## Skjermene — AgencyOS

AgencyOS er coachens kontrolltårn: «hvem trenger MEG i dag?» Adressene begynner med `/admin`. (Het tidligere CoachHQ.)

### Oversikt (coachens hjem)

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| **Cockpit (hjem)** ★ | `/admin/agencyos` | ✓ | –✓– | ✓ | ✓ | ✓ | ✓ | v13 scope + components (full)
| · Uka (kanban) | `/admin/agencyos/uka` | ✓ | ✓✓– | ✓ | ~ | ✓ | ✓ | Complete v13 (golfdata scope + cards) |
| · Spillere (snarvei) | `/admin/agencyos/spillere` | ✓ | ✓✓– | ✓ | ✓ | ✓ | † |
| **· Økonomi** ★ | `/admin/agencyos/okonomi` | ✓ | ✓✓– | ✓ | ✓ | ✓ | ✓ | 2026-07-14 rettet: allerede en fullstendig, ekte v2-side (`AdminOkonomiV2`, V2Shell) — masterplan-raden var stale. Økonomi-sammenslåingen ER gjort i kode: `/admin/okonomi` (legacy) er nå en ren `redirect()` hit, denne siden er kanon (rad rettet, se også rad under). |
| · Caddie (AI-chat) | `/admin/agencyos/caddie` | – | ✓✓– | ✓ | ~ | – | ✓ |
| · Caddie-aktivitet | `/admin/agencyos/caddie/aktivitet` | – | --- | ✓ | ~ | ~ | ~ |
| Admin-rot (gml. hjem) | `/admin` | – | --- | ✓ | ~ | ~ | ✓ |
| Daglig AI-brief | `/admin/brief` | ✓ | ✓✓– | ✓ | ✓ | ✓ | † |
| Varsler (agent-forslag/signaler/meldinger) | `/admin/varsler` | ✓ | ✓✓– | ✓ | ✓ | ✓ | † |
| Coaching-board (redirect) | `/admin/board` | — | — | ✓ | ✓ | – | ✓ | Slått sammen med `/admin/elever` til `/admin/spillere?view=tavle` — ren `redirect()`-stubb. Ingenting å portere. |
| Oppfølging (alias → queue) | `/admin/oppfolging` | ✓ | ✓✓– | ✓ | ✓ | ✓ | † |
| Oppfølgingskø (kanban) | `/admin/queue` | ✓ | ✓✓– | ✓ | ✓ | ✓ | † |
| **Innboks** ★ | `/admin/innboks` | – | ✓✓– | ✓ | ✓ | ✓ | ✓ |
| Meldinger (alt. → redirect) | `/admin/messages` | – | --- | ✓ | ✓ | – | ✓ |
| Kommunikasjon-hub (redirect) | `/admin/kommunikasjon` | — | — | ✓ | ✓ | – | ✓ | 2026-07-14 sjekket: konsolidert 2026-06-28, ren `permanentRedirect()` til `/admin/innboks` — var kun en 4-fane launcher, ingenting å portere. |
| **Reach (engasjement)** ★ | `/admin/reach` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | 2026-07-14: v2 (`AdminReachV2`, AgencyOS Bølge 3.16) — samme `ReachData`-aggregering (uendret i page.tsx), egendefinert SVG-linjegraf + feature-adoption-bar-chart portert med samme tegne-matematikk, kun v2-tokens for farger |

### Min uke / Workspace

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Workspace-hub | `/admin/workspace` | ~ | --- | ✓ | ~ | ✓ | ✓ | Real tasks via getTasksForUser (Notion fallback + cache) + scoped to coach. Data full. 
| · **Tildelt meg** ★ | `/admin/workspace/tildelt-meg` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | 2026-07-14: v2 (`AdminTildeltMegV2`, AgencyOS Bølge 3.5) — samme aggregering (PlanAction/SessionRequest/TrainingPlan DRAFT/Notion-oppgaver) |
| · Oppgaver | `/admin/workspace/oppgaver` | – | –✓– | ✓ | ✓ | ✓ | ✓ |
| ~~· Oppgave-detalj~~ | `/admin/workspace/oppgaver/[id]` | — | — | — | — | — | — | RUTE FINNES IKKE i koden (verifisert 2026-07-12) — raden var ønske/plan, aldri bygget. Fjern eller bygg bevisst. |
| · Prosjekter | `/admin/workspace/prosjekter` | ✓ | ✓✓– | ✓ | ✓ | ✓ | † |
| · Notion-sync | `/admin/workspace/notion` | ✓ | ✓✓– | ✓ | ✓ | ✓ | † |

### Stall (spillere, grupper, talent)

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Stall-oversikt (redirect) | `/admin/stall` | — | — | ✓ | ✓ | – | ✓ | Avviklet 2026-07-06 (Anders) — ren `redirect()`-stubb til `/admin/spillere` (SpillerTilstandKort-liste). Ingen duplikat-UI, ingenting å portere. |
| **Spillere (alle)** = SpillerTilstandKort-liste (v13 golfdata, bølge 1 2026-07-04) ★ | `/admin/spillere` | ✓ | ✓✓– | ✓ | ✓ | ✓ | ✓ | Complete v13 (SpillerTilstandKort + scope + cards)
| · **Ny spiller** ★ | `/admin/spillere/ny` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | Allerede v2 (`AdminNySpillerV2`, 4-stegs Veiviser) — masterplan-radene var stale, rettet 2026-07-14 |
| **Spiller-detalj** ★ | `/admin/spillere/[id]` | – | ~✓– | ✓ | ✓ | ✓ | ✓ |
| · **Analyse (coach-dybde)** = golfdata elite-visning (v13, bølge 1 2026-07-04) ★ | `/admin/spillere/[id]/analyse` | ✓ | ✓✓– | ✓ | ✓ | ✓ | † |
| · **Full profil** ★ | `/admin/spillere/[id]/profil` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | 2026-07-14: v2 (`AdminSpillerFullProfilV2`, AgencyOS Bølge 3.28) — samme `inviterForelderForSpiller`-kontrakt (invite-modal → `BunnArk`). NB: annen skjerm enn `/admin/spillere/[id]` (spiller-dashboardet, `AdminSpillerProfilV2`) — like navn, ulike ruter. **Funn (bevart, ikke fikset):** «Spiller-DNA»-radar + cohort-snitt er hardkodede plassholdertall (`dna` faller til `{78,82,74,60,65}`, `cohort` er alltid `{70,68,72,65,70}` — aldri beregnet fra ekte data), og aktive mål sin `ProgressRing` er hardkodet `pct={50}` uansett faktisk fremgang — pre-eksisterende fabrikasjon i legacy, uendret her. |
| · **Workbench (coach-i-spiller)** ★ | `/admin/spillere/[id]/workbench` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | 2026-07-12: månedsvisning (ekte grid) + drag-and-drop (blokk→dag, bibliotek→klokkeslett) · 2026-07-13: samme mobil-flyt som spiller-Workbench (BunnArk, årsplan-liste, MndNivaaMobil) |
| · Plan-detalj | `/admin/spillere/[id]/plan/[planId]` | ✓ | ✓✓– | ✓ | ✓ | ✓ | † |
| · Fremgang (trening vs SG) † | `/admin/spillere/[id]/fremgang` | – | ✓✓– | ✓ | ✓ | ✓ | ~ |
| · Tester | `/admin/spillere/[id]/tester` | – | ✓✓– | ✓ | ✓ | ✓ | ~ |
| · Tildel test | `/admin/spillere/[id]/tildel-test` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | Allerede bygget som pixel-perfekt design-handover-port (`TildelTestModalScreen`, `test-modul-v2`/`planlegge-v2`-stilarket) — EGEN designlinje, ikke `src/components/v2`-kanon. Fungerer og er responsiv (6 media queries); flagget til Anders: bør denne unifiseres inn i v2-kanon senere, eller stå som egen godkjent modal-stil? |
| **Rediger** ★ | `/admin/spillere/[id]/rediger` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | 2026-07-14: v2 (`AdminSpillerRedigerV2`, AgencyOS Bølge 1.4) — samme `lagreSpiller`/`slettSpiller`-kontrakt (native form-action, ukontrollerte felt) |
| **Grupper** ★ | `/admin/grupper` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | Allerede v2 (`GrupperV2` + `GruppeDetaljV2` på `[id]`) — masterplan-raden var stale, rettet 2026-07-14. Ingen legacy-restflate finnes (`(legacy)/grupper/` finnes ikke i koden). |
| · Gruppe-detalj (+ VG-trinn filter/badge, 2026-07-07) | `/admin/grupper/[id]` | ✓ | ✓✓– | ✓ | ✓ | ✓ | † |
| · Gruppe-timeplan (faste/kommende/tidligere + dupliser) | `/admin/grupper/[id]/timeplan` | ✓ | ✓✓– | ✓ | ✓ | ✓ | † |
| · **WANG Toppidrett — åpen treningsplan** (offentlig, ingen innlogging) | `/team-wang` | ~ | --- | ✓ | ~ | ✓ | † |
| · **GFGK Junior — åpen treningsplan** (offentlig, 4 gruppefaner: Mini/Basis/Utvikling/Elite) | `/gfgk-junior` | ~ | --- | ✓ | ~ | ✓ | † |
| Talent-hub | `/admin/talent` | – | --- | ✓ | ~ | ~ | ~ |
| ~~· Talent-detalj~~ | `/admin/talent/[playerId]` | — | — | — | — | — | — | RUTE FINNES IKKE i koden (verifisert 2026-07-12) — raden var ønske/plan, aldri bygget. Fjern eller bygg bevisst. |
| · Discovery | `/admin/talent/discovery` | – | --- | ✓ | ~ | ~ | ~ |
| · Radar | `/admin/talent/radar` | – | –✓– | ✓ | ✓ | ✓ | ✓ |
| ~~· Radar per spiller~~ | `/admin/talent/radar/[playerId]` | — | — | — | — | — | — | RUTE FINNES IKKE i koden (verifisert 2026-07-12) — raden var ønske/plan, aldri bygget. Fjern eller bygg bevisst. |
| **· Kohort** ★ | `/admin/talent/kohort` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | 2026-07-14: v2 (`AdminTalentKohortV2`, AgencyOS Bølge 3.20) — samme `TalentTracking`-aggregering (snitt-radar 5 akser + 90-dagers progresjon per nivå U10–Senior) |
| **· Region** ★ | `/admin/talent/region` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | 2026-07-14: v2 (`AdminTalentRegionV2`, AgencyOS Bølge 3.21) — samme region-aggregering + forenklet Norge-kart-stub (SVG, samme geometri, v2-tokens for farger) |
| **· Ressurser** ★ | `/admin/talent/ressurser` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | 2026-07-14: v2 (`AdminTalentRessurserV2`, AgencyOS Bølge 3.22) — samme `TalentRessurs`-modell, filter-chips (kategori/nivå/fokus via URL), ekte FormData `leggTilRessurs`-action (ADMIN) med native ukontrollerte felt |
| · **Sammenligning** ★ | `/admin/talent/sammenligning` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | 2026-07-14: v2 (`AdminTalentSammenligningV2`, AgencyOS Bølge 3.37, på Anders' eksplisitte ønske) — v10-komponenten `TalentSammenligning` viste seg å være enekonsument (ingen andre skjermer importerte den), så den ble erstattet, ikke bevart ved siden av. **Reell databug fikset, ikke bare re-skinnet:** loaderen (`loadMultiCompare`) har alltid beregnet ekte per-spiller SG-verdier, ekte kohort-`sgTotal` og et utledet verdikt — men `map-compare-data.ts` og v10-komponenten kastet dem bort og viste «—»/tomtilstand UANSETT hvor mye ekte data som fantes. v2-versjonen viser de ekte tallene (best-badge per metrikk, kohort-søyler tegnet mot faktisk verdi på −2,0→+2,0-skalaen, verdikt-setning øverst). «Endre utvalg» var også dødt i legacy (lenket til seg selv uten `?ids=`) — erstattet med en ekte `BunnArk`-spillervelger. Ny hjelpetekst-nøkkel `tourBaseline` lagt til `hjelpetekster.ts`; nye ikoner `user-plus` i v2-ikonkartet. Med dette er HELE `legacy-portering-prioritet.md`-lista ferdig portet. |
| **· WAGR-benchmark** ★ | `/admin/talent/wagr-benchmark` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | 2026-07-14: v2 (`AdminWagrBenchmarkV2`, AgencyOS Bølge 3.23) — samme `WagrSnapshot`-modell (topp 5 globalt + topp 5 norske), samme `slettWagrSnapshot`-server-action (delt fra wagr-import) |
| **· WAGR-import** ★ | `/admin/talent/wagr-import` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | 2026-07-14: v2 (`AdminWagrImportV2`, AgencyOS Bølge 3.24) — samme `WagrSnapshot`-modell + ekte `synkWagrNaa`-server-action (uendret) |

### Planlegge (lage planer FOR spillerne)

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Plan-sentral (hub) | `/admin/planlegge` | – | --- | ✓ | ~ | ✓ | ✓ | Real prisma lookup for first player + redirect to workbench. Full auth. 
| Planer (alle) | `/admin/plans` | – | –✓– | ✓ | ✓ | ✓ | ✓ |
| · Ny plan (Plan-bygger) | `/admin/plans/new` | – | –✓– | ✓ | ~ | ✓ | ~ |
| · Plan-detalj | `/admin/plans/[planId]` | ✓ | ✓✓– | ✓ | ✓ | ✓ | † |
| · Maler (alt. → redirect) | `/admin/plans/templates` | – | --- | ✓ | ✓ | – | ✓ |
| · Ny mal (alt. → redirect) | `/admin/plans/templates/ny` | – | --- | ✓ | ✓ | – | ✓ |
| · Rediger mal (alt. → redirect) | `/admin/plans/templates/[id]/rediger` | – | --- | ✓ | ✓ | – | ✓ |
| · Mal-effektivitet (alt. → redirect) | `/admin/plans/templates/[id]/effectiveness` | – | --- | ✓ | ✓ | – | ✓ |
| **Plan-maler (alt.)** ★ | `/admin/plan-templates` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | Allerede v2 (`AdminPlanMalerV2`) — masterplan-raden var stale, rettet 2026-07-14 |
| · Plan-mal detalj | `/admin/plan-templates/[id]` | – | --- | ✓ | ~ | ~ | ~ | STOR skjerm (`template-detail.tsx`, 545 linjer) — utsatt til egen bølge, se merknad under Rediger |
| · **Ny plan-mal** ★ | `/admin/plan-templates/ny` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | 2026-07-14: v2 (`AdminPlanMalNyV2`, AgencyOS Bølge 1.5) — samme `createTemplate`-kontrakt, discipline-fordeling som `Glider`-rad |
| · Rediger plan-mal | `/admin/plan-templates/[id]/rediger` | – | --- | ✓ | ~ | ✓ | ✓ | 2026-07-11: volum-linje (timer/uke + reell pyramidefordeling vs. glidere) + masseredigering (sett varighet for hele uka, kopier uke→uke m/ konflikt-bekreftelse) — src/lib/plan-templates/. **2026-07-14:** IKKE portet i Bølge 1.5 — `template-editor.tsx` er 1046 linjer (uke-grid + drag/drop-lignende drill-plassering + masseredigering), for stor/risikabel å re-komponere trygt samme kveld som resten av bølgen. Trenger egen mini-plan (komponentarkitektur avklares mot faktisk uke-grid-mønster) før bygging — meldt som eget punkt, ikke improvisert. |
| **Drills (bibliotek)** ★ | `/admin/drills` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | 2026-07-14: portet til v2 (`AdminDrillerV2`, AgencyOS Bølge 1.2) — samme kategori/søk-logikk, tile-grid m/ akse-fargede ikoner dekker mobil/iPad/desktop |
| · Drill-detalj | `/admin/drills/[id]` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | 2026-07-14: v2 (`AdminDrillDetaljV2`) — stablede Kort-seksjoner, Rediger/Dupliser/Slett virker |
| · Ny drill | `/admin/drills/ny` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | 2026-07-14: v2 (`AdminDrillNyV2`/`DrillSkjemaFelter`) — felt-settet utvidet til parity med rediger (prerequisites/csTarget/lPhase-primary/csMin-Max), ingen data-tap |
| · Rediger drill | `/admin/drills/[id]/rediger` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | 2026-07-14: v2 (`AdminDrillRedigerV2`/`DrillSkjemaFelter`), samme `updateDrill`-kontrakt |
| · AI drill-forslag | `/admin/drills/forslag` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | 2026-07-14: v2 (`AdminDrillForslagV2`) — Godkjenn/Avvis mot `CaddieDraft`, uendret logikk |
| **Teknisk plan** ★ | `/admin/teknisk-plan` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | Allerede v2 — masterplan-raden var stale, rettet 2026-07-14 |
| · **Per spiller** ★ | `/admin/teknisk-plan/[spillerId]` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | 2026-07-14: v2 (`AdminTekniskPlanDetaljV2`, AgencyOS Bølge 3.8) — samme datamodell, `HjelpTips` på CS-nivå/L-fase/HCP |
| **Turneringer** ★ | `/admin/tournaments` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | 2026-07-13: portet til v2 (`AdminTurneringerV2`, AgencyOS Bølge 1.1) — samme datalogikk, ny `Rad`-liste dekker mobil/iPad/desktop uten egne breakpoint-grener. Detalj-siden var alt v2 |
| · Turnering-detalj | `/admin/tournaments/[id]` | ✓ | ✓✓– | ✓ | ✓ | ✓ | † |
| · **Ny turnering** ★ | `/admin/tournaments/ny` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | 2026-07-14: v2 (`AdminTurneringerNyV2`, AgencyOS Bølge 3.30) — samme 5-stegs veiviser (Type → Detaljer → Format → Påmelding → Bekreft), samme steg-validering og `createTournament`-kontrakt (uendret). Steg-navigasjon via `Veiviser`; kort/chips (`ValgKort`, lokal `Pill`) — første flerstegs full-side-veiviser portet fra en 800+-linjers legacy-klient uten forenkling av selve flyten. |
| · **Dubletter (rydd)** ★ | `/admin/tournaments/dubletter` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | 2026-07-14: v2 (`AdminTurneringerDubletterV2`, AgencyOS Bølge 3.29) — samme match-algoritme (token-overlap + ±3 dager) og `mergeTurneringer`-kontrakt, uendret. Ikke lenket fra noe v2-skjerm (var heller ikke lenket fra hub-en i legacy) — direkte-URL-only vedlikeholdsverktøy, bevart som sådan. |
| Økter | `/admin/okter` | – | --- | ✓ | ~ | ~ | ~ |
| **Videoer** ★ | `/admin/videoer` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | 2026-07-14: v2 (`AdminVideoerV2`, AgencyOS Bølge 3.10) — samme `SessionVideo`-modell og `uploadVideo`/`getSignedVideoUrl`/`deleteVideo`-kontrakt fra `@/lib/storage/video` |
| **Opptak** ★ | `/admin/recording` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | 2026-07-14: v2 (`AdminOpptakV2`, AgencyOS Bølge 3.11) — samme `SessionRecording`-modell og `/api/recording/*`-kontrakt; MediaRecorder/chunk-opplasting/Wake Lock/batteri-overvåking/recovery-logikken er uendret (kun JSX-laget re-skinnet) |

### Gjennomføre (daglig drift)

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Daglig drift (hub) | `/admin/gjennomfore` | ✓ | --- | ✓ | ~ | ~ | ~ | v13 composed (golfdata Button/Card/Eyebrow + scope)
| · Økt-detalj | `/admin/gjennomfore/okter/[id]` | ✓ | ✓✓– | ✓ | ~ | ✓ | † |
| Kalender | `/admin/kalender` | ✓ | –✓– | ✓ | ✓ | ✓ | ✓ | v13 golfdata (TidsGrid/Periodeplan + scope)
| · Uke (redirect) | `/admin/kalender/uke` → `/admin/kalender` | – | –✓– | ✓ | ✓ | ✓ | ✓ |
| · Måned | `/admin/kalender/maned` | – | ✓✓– | ✓ | ~ | ✓ | ✓ |
| Kalender (alt. → redirect) | `/admin/calendar` | – | --- | ✓ | ✓ | – | ✓ |
| · Måned (alt. → redirect) | `/admin/calendar/maned` | – | --- | ✓ | ✓ | – | ✓ |
| **Bookinger** ★ | `/admin/bookinger` | ✓ | –✓– | ✓ | ✓ | ✓ | ✓ | v13 (KpiTile, Card, Tag + heatmap retokened)
| · Ny booking | `/admin/bookinger/ny` | ✓ | –✓– | ✓ | ✓ | ✓ | ✓ | v2 2026-07-12: portet ut av legacy, V2Shell + NyBookingWizard; inngang fra kalender + bookinger |
| **Anlegg** ★ | `/admin/anlegg` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | 2026-07-14: v2 (`AdminAnleggV2`, AgencyOS Bølge 2.2) — samme `createLocation`-kontrakt; `FacilityForm` (rediger/slett fasilitet) var allerede dødt/ubrukt kode i legacy-siden også, IKKE portet (ingen ny funksjon lagt til utover det som faktisk var koblet) |
| ~~· Anlegg-detalj~~ | `/admin/anlegg/[id]` | — | — | — | — | — | — | RUTE FINNES IKKE i koden (verifisert 2026-07-12) — raden var ønske/plan, aldri bygget. Fjern eller bygg bevisst. |
| **Tilgjengelighet** ★ | `/admin/availability` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | 2026-07-14: v2 (`AdminTilgjengelighetV2`, AgencyOS Bølge 3.31) — samme tre visninger (måned-grid, drag-basert uke-grid via pointer events, år-Gantt) og samme `addSlot`/`updateSlot`/`deleteSlot`-kontrakt (uendret, inkl. no-dobbeltsted-vernet). Bekreft-popover og rediger/opprett-skjema bruker `BunnArk` i stedet for native `<dialog>`/fixed-div. Google Calendar-seksjonen er `CalendarSyncSectionV2` (Bølge 3.36, sendt inn som `calendarSync`-slot fra `page.tsx`) — nå også v2, delt uendret med `/admin/settings/calendar`. |
| Kapasitet (redirect) | `/admin/kapasitet` | — | — | ✓ | ✓ | – | ✓ | Slått sammen med `/admin/bookinger` (Anders 2026-06-22) — ren `redirect()`-stubb. Kapasitet-heatmap + CSV-eksport bor i bookinger-dashbordet. Ingenting å portere. |
| **Tjenester/priser** ★ | `/admin/services` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | 2026-07-14: v2 (`AdminTjenesterV2`, AgencyOS Bølge 2.1) — samme `createService`/`updateService`/`deleteService`-kontrakt, ny/rediger som delt `BunnArk`-skjema |
| ~~Fasiliteter (alt.)~~ | `/admin/facilities` | — | — | — | — | — | — | RUTE FINNES IKKE i koden (verifisert 2026-07-12) — raden var ønske/plan, aldri bygget. Fjern eller bygg bevisst. |
| ~~· Fasilitet-detalj~~ | `/admin/facilities/[id]` | — | — | — | — | — | — | RUTE FINNES IKKE i koden (verifisert 2026-07-12) — raden var ønske/plan, aldri bygget. Fjern eller bygg bevisst. |
| ~~Lokasjoner~~ | `/admin/locations` | — | — | — | — | — | — | RUTE FINNES IKKE i koden (verifisert 2026-07-12) — raden var ønske/plan, aldri bygget. Fjern eller bygg bevisst. |
| **TrackMan (på tvers)** ★ | `/admin/trackman` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | 2026-07-14: v2 (`AdminTrackmanV2`, AgencyOS Bølge 3.7) — samme `TrackManSession`-datamodell, `HjelpTips` (trackman-nøkkel) på KPI-tallene, filter-chips fortsatt placeholder-toasts som i fasit |
| **Live-økt: brief (coach)** ★ | `/admin/live/[sessionId]/brief` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | 2026-07-14: v2 (`CoachLiveBriefV2`, AgencyOS Bølge 1.3) — samme `sendBriefTilSpiller`-kontrakt |
| **Live-økt: aktiv (coach)** ★ | `/admin/live/[sessionId]/active` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | 2026-07-14: v2 (`CoachLiveActiveV2`) — samme plan-fremdrift-proxy og `sendLiveMelding`-kontrakt, `MicButton` gjenbrukt uendret |
| **Live-økt: oppsummering (coach)** ★ | `/admin/live/[sessionId]/summary` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | 2026-07-14: v2 (`CoachLiveSummaryV2`) — samme `lagreCoachVurdering`-kontrakt |
| Coach-workbench (redirect) | `/admin/coach-workbench` | — | — | ✓ | ✓ | – | ✓ | 2026-07-14 sjekket: prototypen er erstattet (B7, 2026-07-12), ren `redirect()` til `/admin/planlegge` — ingenting å portere. |

### Innsikt (analyse på tvers)

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Innsikt-hub (redirect) | `/admin/analysere` | — | — | ✓ | ✓ | – | ✓ | 2026-07-14 sjekket: overflødig lenke-hub (B7, 2026-07-12), ren `redirect()` til `/admin/analyse` — Compliance-undersiden består (egen rad). Ingenting å portere. |
| · Compliance | `/admin/analysere/compliance` | – | ✓✓– | ✓ | ~ | ✓ | ✓ |
| Stall-analyse | `/admin/analyse` | – | ~✓– | ✓ | ✓ | ✓ | ✓ |
| ~~Analytics~~ | `/admin/analytics` | — | — | — | — | — | — | RUTE FINNES IKKE i koden (verifisert 2026-07-12) — raden var ønske/plan, aldri bygget. Fjern eller bygg bevisst. |
| **Lag-snitt** ★ | `/admin/lag-snitt` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | 2026-07-14: v2 (`AdminLagSnittV2`, AgencyOS Bølge 3.4) — samme pyramidefordelings-datamodell, akse-fargede barer |
| **Forespørsler** ★ | `/admin/foresporsler` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | 2026-07-14: v2 (`AdminForesporslerV2`, AgencyOS Bølge 3.4) — samme `SessionRequest`/`markerSomPlanlagt`/`avslaaForespørsel`-kontrakt |
| Tilstander (redirect) | `/admin/tilstander` | — | — | ✓ | ✓ | – | ✓ | Avviklet 2026-07-12 (B7) — ren `redirect()`-stubb til `/admin/gjennomfore`. Var en statisk designkatalog, ikke en produktflate. Ingenting å portere. |
| **· Fasiter (autosync)** ★ | `/admin/tester/benchmarks` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | 2026-07-14: v2 (`AdminTesterBenchmarksV2`, AgencyOS Bølge 3.25) — samme `TestDefinition`-synk-state (AUTO/FØLGER/REFERANSE), samme `approveBenchmarkPending`/`rejectBenchmarkPending`/`runBenchmarkSyncNow`-kontrakt |
| **Tester (på tvers)** ★ | `/admin/tester` | ✓ | ✓✓– | ✓ | ✓ | ✓ | ✓ | Allerede v2 (`AdminTesterV2`, v2preview route-group) — masterplan-raden var stale, rettet 2026-07-14 |
| ~~· Test-detalj~~ | `/admin/tester/[id]` | — | — | — | — | — | — | RUTE FINNES IKKE i koden (verifisert 2026-07-12) — raden var ønske/plan, aldri bygget. Fjern eller bygg bevisst. |
| **· Foreslåtte tester** ★ | `/admin/tester/foreslatte` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | 2026-07-14: v2 (`AdminTesterForeslatteV2`, AgencyOS Bølge 3.26) — samme `TestDefinition`-filter (isCustom + COACH-visibility + ikke godkjent), samme `godkjennForslag`/`avvisForslag`-kontrakt |
| **· Tildel test** ★ | `/admin/tester/tildel/[spillerId]` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | 2026-07-14: v2 (`AdminTildelTestModalV2`, AgencyOS Bølge 3.27) — samme `tildelTest`-kontrakt, `BunnArk` erstatter en modal med egendefinerte CSS-klasser som IKKE hadde noe matchende stilark (rendret helt ustylet i prod — reell funksjonell forbedring, ikke bare redesign). Spiller-velger-hub (`/admin/tester/tildel`) portet samtidig. |
| Økt-forespørsler | `/admin/foresporsler` | – | –✓– | ✓ | ✓ | ✓ | ✓ |
| Godkjenninger | `/admin/godkjenninger` | – | –✓– | ✓ | ✓ | ✓ | ✓ |
| · **Godkjenning-detalj** ★ | `/admin/godkjenninger/[id]` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | 2026-07-14: v2 (`AdminGodkjenningDetaljV2`, AgencyOS Bølge 3.6) — samme `PlanAction`/`computeDelta`/`approveRequestDetailed`/`declineRequestDetailed`/`requestMoreInfo`-kontrakt; avslå/info-dialogen er nå `BunnArk`. Erstattet enekonsument `ApprovalDetailClient` fullt ut (verifisert ingen andre importører) |
| Godkjenninger (alt. → redirect) | `/admin/approvals` | – | --- | ✓ | ✓ | – | ✓ |
| · Approval-detalj (alt. → redirect) | `/admin/approvals/[id]` | – | --- | ✓ | ✓ | – | ✓ |
| Rapporter | `/admin/reports` | – | –✓– | ✓ | ✓ | ✓ | ✓ |
| Runder (på tvers) | `/admin/runder` | ~ | --- | ✓ | ~ | ~ | ~ |
| **Risiko (stall-kart)** ★ | `/admin/risiko` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | 2026-07-14: v2 (`AdminRisikoV2`, AgencyOS Bølge 3.17) — samme risiko-logikk (SKADET/permisjon/dager-siden-økt), 8-kolonners heatmap + oppfølgingsliste. Manglet egen rad i tabellen fra før, lagt til her. |
| Skader/sykdom (tilstander, redirect) | `/admin/tilstander` | — | — | ✓ | ✓ | – | ✓ | Duplikat-rad av samme adresse som over (rad ~474) — bekreftet 2026-07-14 samme `redirect()`-stubb. Ingenting å portere. |
| Finans (alt. → redirect) | `/admin/finance` | – | --- | ✓ | ✓ | – | ✓ |
| Økonomi (MRR/betalinger, redirect) | `/admin/okonomi` | — | — | ✓ | ✓ | – | ✓ | 2026-07-14 sjekket: ren `redirect()` til `/admin/agencyos/okonomi` (kanon-siden, se rad ~348) — sammenslåingen er allerede gjort i kode. Ingenting å portere. |
| **Stats-oversikt** ★ | `/admin/stats/overview` | – | ✓✓✓ | ✓ | ✓ | ✓ | ~ | 2026-07-14: v2 (`AdminStatsOversiktV2`, AgencyOS Bølge 3.19) — samme Prisma-datahenting (uendret), `Reveal`/`CountUp` (delt) gjenbrukt, ekte `sjekkDbHelse`-DB-ping. **Funker ikke fullt:** `hentSisteCommits()` kjører `execSync` mot en hardkodet lokal filsti (Anders' maskin) — finnes aldri i Vercel, fanges av try/catch (tom liste, seksjonen skjules stille). Forhåndseksisterende bug i legacy, bevart uendret, meldt for egen fiks-økt. |
| **Stats-moderering** ★ | `/admin/stats/moderering` | – | ✓✓✓ | ✓ | ✓ | ~ | ~ | 2026-07-14: v2 (`AdminStatsModereringV2`, AgencyOS Bølge 3.18) — samme skjelett som legacy: INGEN modererings-/GDPR-slett-kø finnes i datamodellen ennå, siden viser ærlige tomme tilstander (0-tall). Fane-bytte er ekte klient-state; Godkjenn/Avvis/Bekreft-slett-knappene har ingen handling — samme som legacy, ikke lagt til ny funksjonalitet i en design-port. |

### Admin (organisasjon og innstillinger)

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Organisasjon-hub | `/admin/organisasjon` | – | --- | ✓ | ~ | ~ | ~ |
| **Klubb-innstillinger** ★ | `/admin/klubb/innstillinger` | – | ✓✓✓ | ✓ | ✓ | ✓ | ~ | 2026-07-14: v2 (`AdminKlubbInnstillingerV2`, AgencyOS Bølge 3.14) — samme `addClub`/`updateClubSettings`/`lagreClubSettings`/`removeClub`-kontrakt, `BunnArk` i stedet for native `<dialog>`. **Funker ikke fullt:** «Detaljer»-lenken på hvert klubbkort peker til `/admin/klubb/[id]/rediger`, en rute som ikke finnes (verifisert, samme i legacy) — bevart uendret, meldt for egen fiks-økt (se også AI Workspace-raden lenger ned med samme type funn). |
| **Integrasjoner** ★ | `/admin/integrasjoner` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | 2026-07-14: v2 (`AdminIntegrasjonerV2`, AgencyOS Bølge 3.1) — samme statuskilder (Prisma + env-sjekk), ren visning |
| **Innstillinger (hub)** ★ | `/admin/settings` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | 2026-07-14: v2 (`AdminInnstillingerV2`, AgencyOS Bølge 3.32) — samme tre faner (Organisasjon/Team & roller/Tilgang, `?tab=`), samme Prisma-aggregering. Security (3.33), Tilgang (3.34) og API (3.35) er også portet — se egne rader. **Gjenstår:** `calendar` (Google Calendar-sync, deler `CalendarSyncSection` med `/admin/availability`). |
| · **API** ★ | `/admin/settings/api` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | 2026-07-14: v2 (`AdminInnstillingerApiV2`, AgencyOS Bølge 3.35) — samme `ApiKey`-modell og `createApiKey`/`revokeApiKey`-kontrakt, uendret. Opprett-modalen er `BunnArk` (samme to-stegs flyt: skjema → engangsvisning av hemmeligheten). |
| · **Kalender** ★ | `/admin/settings/calendar` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | 2026-07-14: v2 (`CalendarSyncSectionV2` + `AdminInnstillingerKalenderKlientV2`, AgencyOS Bølge 3.36) — samme `googleCalendarConnection`/`subscriptions`-modell og samme `oppdaterSubscriptions`/`refreshCalendarList`/`disconnectGoogleCalendar`-kontrakt. `CalendarSyncSectionV2` er en async server-komponent, delt uendret med `/admin/availability` (samme mønster som før, nå begge v2). Med dette er HELE Innstillinger-klyngen (hub/api/calendar/security/tilgang) portet til v2. |
| · **Sikkerhet** ★ | `/admin/settings/security` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | 2026-07-14: v2 (`AdminInnstillingerSikkerhetV2`, AgencyOS Bølge 3.33) — samme innhold (kontooversikt, 2FA-oppsett via delt `Setup2FA`, passord-lenke, plassholder for aktive økter). |
| · **Tilgang** ★ | `/admin/settings/tilgang` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | 2026-07-14: v2 (`AdminInnstillingerTilgangV2`, AgencyOS Bølge 3.34) — samme read-only CBAC-matrise (rolle × capability via `@/lib/auth/cbac`). |
| **Team** ★ | `/admin/team` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | Allerede v2 (`AdminTeamV2`) — masterplan-raden var stale, rettet 2026-07-14 |
| · **Inviter** ★ | `/admin/team/inviter` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | 2026-07-14: v2 (`AdminInviterCoachV2`, AgencyOS Bølge 3.2) — samme `inviterCoach`-kontrakt |
| **Audit-log** ★ | `/admin/audit-log` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | 2026-07-14: v2 (`AdminAuditLogV2`, AgencyOS Bølge 3.1) — samme `AuditLog`-datamodell (siste 50, kind/status fra action-prefiks), ren visning |
| ~~· Audit-detalj~~ | `/admin/audit-log/[id]` | — | — | — | — | — | — | RUTE FINNES IKKE i koden (verifisert 2026-07-12) — raden var ønske/plan, aldri bygget. Fjern eller bygg bevisst. |
| AI-agenter | `/admin/agents` | – | --- | ✓ | ~ | ~ | ~ |
| · Agent-detalj | `/admin/agents/[agentId]` | ✓ | ✓✓– | ✓ | ✓ | ✓ | † |
| **Agenter (flermodell-chat)** ★ | `/admin/agenter` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | 2026-07-14: v2-innramming (AgencyOS Bølge 3.12) rundt delt `AgentChat` (uendret, delt med `/kommando/agenter`) — Claude/Gemini/Grok/Ollama-chat |
| **AI Workspace** ★ | `/admin/ai` | – | ✓✓✓ | ✓ | ✓ | ✓ | ~ | 2026-07-14: v2 (`AdminAiV2`, AgencyOS Bølge 3.13) — samme `AgentRun`/`PlanAction`-datamodell, «Apply + log» er nå en ekte server action (var inline-closure i legacy). **Funker ikke fullt:** «Kjør kode-sesjon»-knappen på Kode-sesjoner-fanen poster til `/admin/ai/run`, en rute som ikke finnes noe sted i koden (verifisert, var også broken i legacy) — bevart uendret, dette er en bakenforliggende bug utenfor skopet til en design-port, meldt her for egen fiks-økt. |
| **E-postmaler** ★ | `/admin/email-templates` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | Allerede v2 — masterplan-raden var stale, rettet 2026-07-14 |
| · **Rediger e-postmal** ★ | `/admin/email-templates/[id]/rediger` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | 2026-07-14: v2 (`AdminEpostmalRedigerV2`, AgencyOS Bølge 3.9) — samme `saveTemplate`/`sendTestEmail`/`setAsDefault`/`archiveTemplate`-kontrakt, 2-kolonners editor+live-forhåndsvisning m/ token-substitusjon |
| **Profil** ★ | `/admin/profile` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | 2026-07-14: v2 (`AdminProfilV2`, AgencyOS Bølge 3.15) — samme `oppdaterCoachProfil`-kontrakt, native ukontrollerte felt (FormData-action). «Skjul»-knappen er fortsatt en placeholder-toast (ingen reell deaktiverings-backend, uendret fra legacy). |
| **Hjelp** ★ | `/admin/hjelp` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | 2026-07-14: v2 (`AdminHjelpV2`, AgencyOS Bølge 3.3) — samme statiske innhold (kategorier/artikler/kontakt-CTA), lokalt søkefilter uendret |
| Caddie (alt. adresse, redirect) | `/admin/caddie` | — | — | ✓ | ✓ | – | ✓ | 2026-07-14 sjekket: konsolidert inn i `/admin/agencyos/caddie/dashbord`, ren `permanentRedirect()` — ingenting å portere. |
| ~~Design-godkjenning~~ | `/admin/godkjenn-portal` | — | — | — | — | — | — | RUTE FINNES IKKE i koden (verifisert 2026-07-12) — raden var ønske/plan, aldri bygget. Fjern eller bygg bevisst. |
| ~~· Koblinger~~ | `/admin/godkjenn-portal/koblinger` | — | — | — | — | — | — | RUTE FINNES IKKE i koden (verifisert 2026-07-12) — raden var ønske/plan, aldri bygget. Fjern eller bygg bevisst. |
| ~~· Kobling-detalj~~ | `/admin/godkjenn-portal/koblinger/[id]` | — | — | — | — | — | — | RUTE FINNES IKKE i koden (verifisert 2026-07-12) — raden var ønske/plan, aldri bygget. Fjern eller bygg bevisst. |
| ~~· Review~~ | `/admin/godkjenn-portal/review` | — | — | — | — | — | — | RUTE FINNES IKKE i koden (verifisert 2026-07-12) — raden var ønske/plan, aldri bygget. Fjern eller bygg bevisst. |

> **2026-07-12 — lenke-revisjon:** alle interne knapper/lenker på 45 admin-sider maskinsjekket
> (271 unike mål). Fikset: «Book økt»/«Melding» i daglig brief (pekte på død /admin/booking/ny og
> alias /admin/messages), «Åpne full radar» i Talent (pekte på ubygget radar/[playerId]),
> «Følg opp» i Økonomi (redirect-loop til seg selv), 3 lenker til /admin/approvals-alias →
> /admin/godkjenninger. 14 spøkelses-rader i denne planen (ruter som aldri ble bygget) er merket.
> Fullt skjerm-/funksjonsinventar med duplikat-analyse: `docs/AGENCYOS-INVENTAR.md`.

> **2026-07-12 — felles chrome:** ALLE legacy-sidene under `/admin/(legacy)/` rendres nå i
> V2Shell (samme rail + Mer-meny + full bredde som de porterte sidene) — gamle AdminShell
> (sidebar/topbar med scope-velger og gamle demo-navn) er koblet ut av layouten. Innholdet
> deres rekomponeres fortsatt bølgevis per `plans/legacy-portering-prioritet.md`.

> Merknad: Flere AgencyOS-funksjoner finnes på to adresser samtidig (f.eks. `/admin/finance` og `/admin/okonomi`, `/admin/kalender` og `/admin/calendar`, `/admin/innboks` og `/admin/messages`, `/admin/godkjenninger` og `/admin/approvals`, `/admin/plans/templates` og `/admin/plan-templates`). Det er dobbeltarbeid som bør ryddes — se «Veien til 100%».

---

## Skjermene — Auth + Forelder + Marketing + System

### Auth (innlogging og oppstart)

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Logg inn ★ | `/auth/login` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ |
| Registrer ★ | `/auth/signup` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ |
| Glemt passord ★ | `/auth/forgot-password` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ |
| Tilbakestill passord | `/auth/reset-password` | ✓ | --- | ✓ | ~ | ~ | ~ |
| Sjekk e-post | `/auth/check-email` | ✓ | --- | ✓ | ~ | ~ | ~ |
| BankID ★ | `/auth/bankid` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ |
| Onboarding (spiller, 8 steg) | `/auth/onboarding` | – | ✓✓– | ~ | ✓ | ✓ | ✓ | 2026-07-11: fikset lesPreferences-lekkasje (data ble slettet av enhver innstillings-lagring); steg-3-svar (fasiliteter/dager/mål) lagres nå og feeder FacilityPrefs+Goal+plan-engine.
| Onboarding (forelder) | `/auth/onboarding/forelder` | – | --- | ✓ | ~ | ~ | ~ |
| Foreldresamtykke (token) | `/auth/guardian-consent/[token]` | ✓ | --- | ✓ | ~ | ~ | ~ |
| Samtykke venter | `/auth/samtykke-venter` | ✓ | --- | ✓ | ~ | ~ | ~ |
| Logget ut | `/auth/logget-ut` | – | ✓✓– | ✓ | ~ | – | ✓ |

### Forelder (foreldreportal)

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Forelder-hjem | `/forelder` | – | ✓✓– | ✓ | ~ | – | ~ |
| Barn (oversikt) | `/forelder/barn` | – | ✓✓– | ✓ | ~ | ~ | ✓ |
| · Barn-detalj | `/forelder/barn/[childId]` | – | ✓✓– | ✓ | ~ | – | ~ |
| Bookinger | `/forelder/bookinger` | – | --- | ✓ | ~ | ~ | ~ |
| Coach | `/forelder/coach` | – | --- | ✓ | ~ | ~ | ~ |
| Fakturaer | `/forelder/fakturaer` | – | --- | ✓ | ~ | ~ | ~ |
| Økonomi | `/forelder/okonomi` | – | --- | ✓ | ~ | ~ | ~ |
| Samtykke | `/forelder/samtykke` | – | --- | ✓ | ~ | ~ | ~ |
| Ukerapport | `/forelder/ukerapport` | – | --- | ✓ | ~ | ~ | ~ |
| Innstillinger | `/forelder/innstillinger` | – | --- | ✓ | ~ | ~ | ~ |
| Varsler | `/forelder/varsler` | – | --- | ✓ | ~ | ~ | ~ |
| Inviter forelder (token) | `/inviter/forelder/[token]` | – | --- | ✓ | ~ | ~ | ~ |

### Marketing (akgolf.no — offentlige sider)

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Forside | `/(marketing)` | – | ✓✓– | ~ | ~ | – | ✓† | 
| Anlegg | `/(marketing)/anlegg` | – | --- | ✓ | ~ | ~ | ✓ |
| · Anlegg-detalj | `/(marketing)/anlegg/[slug]` | – | --- | ✓ | ~ | ~ | ✓ |
| Blogg | `/(marketing)/blogg` | ✓ | --- | ✓ | ~ | ~ | ✓ |
| · Blogg-innlegg | `/(marketing)/blogg/[slug]` | ✓ | --- | ✓ | ~ | ~ | ✓ |
| Booking | `/(marketing)/booking` | – | --- | ✓ | ~ | ~ | ✓ |
| · Booking-tjeneste | `/(marketing)/booking/[slug]` | – | --- | ✓ | ~ | ~ | ~ |
| · Booking bekreft | `/(marketing)/booking/[slug]/bekreft` | – | --- | ✓ | ~ | ~ | ~ |
| · Booking kvittering | `/(marketing)/booking/kvittering/[bookingId]` | – | --- | ✓ | ~ | ~ | ~ |
| Cases | `/(marketing)/cases` | ✓ | --- | ✓ | ~ | ~ | ✓ |
| Coacher | `/(marketing)/coacher` | ✓ | --- | ✓ | ~ | ~ | ✓ |
| · Coach-profil | `/(marketing)/coacher/[slug]` | – | --- | ✓ | ~ | ~ | ✓ |
| Coaching | `/(marketing)/coaching` | – | --- | ✓ | ~ | ~ | ✓ |
| Junior | `/(marketing)/junior` | – | --- | ✓ | ~ | ~ | ✓ |
| Priser | `/(marketing)/priser` | – | --- | ✓ | ~ | ~ | ✓ |
| PlayerHQ (salgsside) | `/(marketing)/playerhq` | – | --- | ✓ | ~ | ~ | ✓ |
| Om oss | `/(marketing)/om-oss` | ✓ | --- | ✓ | ~ | ~ | ✓ |
| Kontakt | `/(marketing)/kontakt` | ✓ | --- | ✓ | ~ | ~ | ✓ |
| Jobb | `/(marketing)/jobb` | – | --- | ✓ | ~ | ~ | ✓ |
| FAQ | `/(marketing)/faq` | – | --- | ✓ | ~ | ~ | ✓ |
| Suksess | `/(marketing)/suksess` | ✓ | --- | ✓ | ~ | ~ | ✓ |
| Treningsfilosofi | `/(marketing)/treningsfilosofi` | ✓ | --- | ✓ | ~ | ~ | ✓ |
| Turneringer | `/(marketing)/turneringer` | – | --- | ✓ | ~ | ~ | ✓ |
| · Turnering-detalj | `/(marketing)/turneringer/[slug]` | – | --- | ✓ | ~ | ~ | ✓ |
| Cookies | `/(marketing)/cookies` | – | --- | ✓ | ~ | ~ | ✓ |
| Personvern | `/(marketing)/personvern` | – | --- | ✓ | ~ | ~ | ✓ |
| Vilkår | `/(marketing)/vilkar` | – | --- | ✓ | ~ | ~ | ✓ |

#### Marketing → Stats (det store offentlige stats-universet)

Dette er en stor offentlig statistikk-seksjon (PGA-tall, norske spillere, verktøy osv.). Den er funksjonell med ekte data, men ikke pusset opp til v10-design. Gruppert kompakt her — alle adressene under begynner med `/(marketing)`:

| Område | Adresse(r) (under `/(marketing)/stats/...`) | Design | Adresse-ok | Data | Funker |
|---|---|---|---|---|---|
| Stats-forside + uka + 2026 | `stats`, `stats/uka`, `stats/2026` | – | ✓ | ~ | ✓ |
| Spillere + årgang | `stats/spillere`, `stats/spillere/[slug]`, `stats/aargang`, `stats/aargang/[aar]` | – | ✓ | ✓ | ✓ |
| Baner + klubber + regioner | `stats/baner(/[slug])`, `stats/klubber(/[slug])`, `stats/regions(/[slug])` | – | ✓ | ✓ | ✓ |
| Turneringer (offentlig) | `stats/turneringer(/[slug])(/statistikk)`, `stats/tour/[slug]` | – | ✓ | ✓ | ✓ |
| Leaderboards + norske + PGA | `stats/leaderboards`, `stats/norske`, `stats/pga` (+ drive-distance, fairway-pct, gir-pct, putt-explorer, putts-per-round, scoring-avg, sg-total, spillere, spillere/[dg_id]) | – | ✓ | ✓ | ✓ |
| Verktøy (kalkulatorer) | `stats/verktoy` (+ avstand, score-til-hcp, sg-estimator, tour-ekvivalent, whs-kalkulator) | – | ✓ | ✓ | ✓ |
| Sammenlign + SG-sammenlign | `stats/sammenlign-spillere`, `stats/sg-sammenlign(/start)(/resultat/[id])` | – | ✓ | ✓ | ✓ |
| Blogg + søk + quiz + wrapped + min progresjon | `stats/blogg(/[slug])`, `stats/sok`, `stats/quiz`, `stats/wrapped/[slug]`, `stats/min-progresjon` | – | ✓ | ✓ | ✓ |

### System + interne sider (ikke for vanlige brukere)

| Skjerm | Adresse | Merknad |
|---|---|---|
| Offline-side | `/offline` | Vises uten nett. Funker. Ingen v10-design nødvendig. |
| 404 (ikke funnet) | (system) | Nytt v10-design bygget i forhåndsvisning i natt (`mx-404.png`). Ikke koblet til appens ekte «ikke funnet»-side ennå. |
| Onboard coach | `/onboard/coach` | 4-stegs coach-oppstart. Ingen v10-design. |
| Onboard klubb | `/onboard/klubb` | 5-stegs klubb-oppstart. Ingen v10-design. |
| Design-system (internt) | `/(internal)/design-system`, `/design-system-v2` | Utviklerverktøy. Ikke en brukerskjerm. |
| Demoer (internt) | `/(internal)/demos/*` (newplan, ny-okt, plan-bygger, trackman-import) | Test-/demo-sider. Ikke ekte skjermer. |
| Komponent-demoer (internt) | `/intern/komponenter/*`, `/demo`, `/hull-demo`, `/kalender-demo`, `/kalender-maaned-demo`, `/lokasjoner-demo`, `/sesjon-opptak-demo`, `/talent-*-demo` | Interne testflater for komponenter. Ikke ekte skjermer — vurder å rydde bort før lansering. |

> Disse interne/demo-adressene (rundt 29 stk) er IKKE ekte brukerskjermer og teller ikke som «mangler design». De er verktøy for utvikling, og flere bør fjernes før lansering.

---

## Tegnet, men ikke brukt ennå (drop-off)

Dette er det viktigste å passe på: ting designeren (Claude Design) har tegnet ferdig, men som ennå IKKE har funnet veien inn i appen som en ekte, koblet skjerm. Målet er at denne lista skal bli tom.

### A. Ferdige skjermbilder uten en oppdatert ekte skjerm

Designeren leverte 44 ferdige skjermbilder. De fleste er nå bygget i forhåndsvisning (pulje 1 + 2) eller har en motpart i appen. Disse har et bilde, men skjermen i appen er enten ikke pusset opp eller ikke koblet til ekte adresse ennå:

| Tegnet skjermbilde | Hører hjemme på | Status |
|---|---|---|
| `mx-404.png` (404-side) | Appens «ikke funnet»-side | Bygget i forhåndsvisning. Mangler kobling til ekte side. Enkel jobb — bør gjøres. |
| `pl-onboarding.png` | `/auth/onboarding` | Bygget i forhåndsvisning (liksom-tall). Mangler ekte data + ekte adresse. |
| `pl-forelder.png` | `/portal/meg/foreldre` (eller foreldreportalen) | Bygget i forhåndsvisning (liksom-tall). Mangler ekte data + ekte adresse. |
| `pl-varsler.png` | `/portal/varsler` | Bygget i forhåndsvisning (liksom-tall). Mangler ekte data + ekte adresse. |
| `pl-innstillinger.png` | `/portal/meg/innstillinger` | Bygget i forhåndsvisning (liksom-tall). Mangler ekte data + ekte adresse. |
| `pl-trackman.png` | `/portal/mal/trackman` | Bygget i forhåndsvisning (liksom-tall). Mangler ekte data + ekte adresse. |
| `pl-turnering.png` | `/portal/tren/turneringer` | Bygget i forhåndsvisning (liksom-tall). Mangler ekte data + ekte adresse. |
| `fo-barn.png` (forelder ser barn) | `/forelder/barn` | Bygget i forhåndsvisning (liksom-tall). Mangler ekte data + ekte adresse. |
| `ag-caddie.png` (coach AI-chat) | `/admin/agencyos/caddie` | Bygget i forhåndsvisning (liksom-tall). Mangler ekte data + ekte adresse. |
| `ag-compare.png` (sammenlign spillere) | `/admin/talent/sammenligning` | Stale — v2-portet 2026-07-14 (Bølge 3.37) med ekte data (`loadMultiCompare`), ekte adresse, se raden under Talent-seksjonen. |
| `ag-compliance.png` | `/admin/analysere/compliance` | Bygget i forhåndsvisning (liksom-tall). Mangler ekte data + ekte adresse. |
| `ag-drift.png` (drift/anlegg) | `/admin/anlegg` / drift-sidene | Bygget i forhåndsvisning (liksom-tall). Mangler ekte data + ekte adresse. |
| `ag-kalender.png` | `/admin/kalender` | Bygget i forhåndsvisning (liksom-tall). Mangler ekte data + ekte adresse. |
| `ag-tester.png` | `/admin/tester` | Bygget i forhåndsvisning (liksom-tall). Mangler ekte data + ekte adresse. |
| `mk-forside.png` (marketing-forside) | `/(marketing)` | Bygget i forhåndsvisning (liksom-tall). Mangler ekte data + ekte adresse. |

> De øvrige skjermbildene (f.eks. `pl-hjem`, `pl-sghub`, `pl-runder`, `pl-live-*`, `ag-dashboard`, `ag-stallen`, `ag-innboks`, `ag-spiller`, `ag-workbench`, `au-login` m.fl.) er allerede tatt i bruk eller bygget i forhåndsvisning i natt — de er IKKE drop-off.

### B. Ferdige design-komponenter (HTML) uten en plass i appen

Designeren leverte 47 ferdige komponent-design (HTML-biter). Mange er brukt i skjermene over. Disse er IKKE tydelig tatt i bruk ennå, og bør finne et hjem:

**PlayerHQ-komponenter som ennå ikke er synlig brukt:**

| Tegnet komponent | Hva det er | Hører hjemme på |
|---|---|---|
| `components-voice-input.html` | Snakk-inn-tall (stemme-logging) | ✅ Bygget som `MicButton` (`src/components/shared/mic-button.tsx`): standalone + suffix-variant, Web Speech API norsk, 4 tilstander (idle/recording/transcribing/done). Integrert i live-meldingsfeltet (`/admin/live/[sessionId]/active`) — coach kan diktere meldinger. |
| `components-credit-indicator.html` | «Du har X klipp igjen»-måler | ✅ Bygget i Booking-hub (`/portal/booking`) som `CreditMeter` — segment-søyle med warn/danger-logikk + saldo/brukt/gjenstår. |
| `components-gap-to-drill.html` | «Din svakhet → denne øvelsen»-bro | ✅ Bygget i SG-Hub (`/portal/mal/sg-hub`) — kjede-strip DATA→DRILL→PLAN + drill-kort med lime-border + alternativer. Vises kun ved negative SG-data. |
| `components-insight-narrative.html` | AI-fortelling i ord om formen din | ✅ Bygget som `InsightNarrativeCard` (`src/components/portal/insight/insight-narrative-card.tsx`) — 7-del anatomi (strip · kicker · tittel · lede · pivots · rec-block · footnote), 5 strip-varianter (left-strip, ikke top). Koblet til (1) `/portal/analysere` fanen «Innsikt» via `InsightNarrativeData`-mapper i `analysere-data.ts`, og (2) `/portal/mal/sg-hub` via payload-mapper `mapInsightToCard` — topp 3 uløste SgInsights. |
| `components-season-timeline.html` | Tidslinje for hele sesongen | ✅ Bygget som `Aarsplan`-komponenten (`src/components/portal/aarsplan/aarsplan.tsx`) — Gantt-kart på `/portal/tren/aarsplan`. Portet fra fasit + skjerm-PNG. |
| `components-test-week.html` | «Testuke»-oppsett | ✅ Bygget som `TestUkeKommende` (spiller) + `TestUkeTrigger` (coach/admin). Aktiveres når TestWeek-modell kobles — returnerer null til da. Kobling: `/portal/tren/tester` + `/admin/tester`. |
| `components-course-heatmap.html` | Varmekart over banen | Hull-analyse (`/portal/analysere/hull`). Delvis. |
| `components-trackman-stability.html` | TrackMan stabilitet-graf | ✅ Bygget i `/portal/mal/trackman/[id]` som `StabilitetSeksjon`: varians-heatmap (6 param × N køller, 5-nivå fargeskala), stabilitets-score 1-10, callouts + bias/spredning SVG-minikart. |
| `components-trackman-trend.html` | TrackMan trend-graf | ✅ Bygget i `/portal/mal/trackman` som `TrackManTrendSeksjon` (KPI-strip avg. carry + klubbhastighet m/ sparklines, per-kølle carry-trender fra CLUB_AVG-signaler). |
| `components-sg-training-scatter.html` | SG vs trening punktsky | ✅ Bygget i `/portal/mal/sg-hub` som `SgTrainingScatter`: hero scatter (APP/innspill) + 4 mini-multiples per kategori, lineær regresjon, R², 95 %-konfidensband beregnet server-side fra TrainingLog + Round. Tom-tilstand når < 4 datapunkter. |

**AgencyOS-komponenter som ennå ikke er synlig brukt:**

| Tegnet komponent | Hva det er | Hører hjemme på |
|---|---|---|
| `components-co-agent.html` | Coachens AI-medhjelper-panel | ✅ Bygget på `/admin/caddie` som `CoAgent` — utkast/godkjenning, agent-fleet-tabell, audit-log. Kobler til `loadCoAgent` Prisma-data. |
| `components-multi-compare.html` | Sammenlign flere spillere side om side | ✅ Bygget og koblet til `/admin/talent/sammenligning` — v10 full 4-panel-komponent (side-om-side · pyramide · kohort-rangering · region-fordeling) via `mapCompareData`-mapper. |
| `components-coach-mobile.html` | Coach-visning på mobil | Mobil-utgave av AgencyOS. Ikke bygget (AgencyOS er laget for data/desktop først). |
| `components-foreldre.html` | Foreldre-komponent for coach | ✅ Bygget som `ForeldreInfo` på `/portal/meg/foreldre` — viser spillerens egne foresatte fra Prisma parentRelation. Invite-modal + server actions. |
| `components-cmdk.html` | Hurtigsøk-boks (⌘K) | ✅ `GlobalSearchModal` (`src/components/admin/global-search-modal.tsx`) — mountet i AdminShell. Cmd+K, debounced API, 17 hurtig-handlinger, spillere/planer/bookinger/ruter, tastaturnav, focus-trap. |

**Coach-flyter (flyt-spesifikasjon, ny i leveranse 3. juni):** `Coach-flyter.html` (+ offline-bundle)
er en interaktiv prototype som viser hvordan coachen navigerer GJENNOM AgencyOS-skjermene
(flere flyter: innboks → godkjenn → plan o.l.). Ikke nye enkeltskjermer — men fasit for
«Flyt»-haken når AgencyOS-skjermene kobles. Bruk den som referanse for knapp-til-knapp-flyt.
Arkivert kilde: `public/design-handover/ak-golf-hq-design-system-2026-06-03.zip`.

### C. Hele «Elite»-pakken er tegnet, men ikke i bruk

Designeren har levert en egen elite-mappe (spredningsverktøy for utslag — «dispersion»):

- `elite/DispersionTool.html`, `elite/Utslag-spredning.html`, `elite/components-trackman-dispersion.html`.
- `Break-tabell.html` — putting green-reading-/break-tabell. **BYGGET 11. juni** → `/portal/trening/break-tabell`. Tre varianter: komplett matrise med heatmap, interaktiv break-kalkulator (inkl. opp/ned-fart), og hastighets-sammenligning.
- `Putte-verktoy.html` — putting-verktøy (**BYGGET 11. juni** → `/portal/trening/putte-laboratoriet`). Alle tre retninger (Greenen/Kjeden/Kontroll) portert med ekte fysikkberegninger fra putt-core.ts. Desktop-verifisert.

Dette hører hjemme i elite-/talent-delen (f.eks. shot-map/dispersjon: `/portal/statistikk/shot-map` eller talent-radar). **Bevisst utsatt** — «Elite Fase 2» er parkert. Det er greit at den ligger ubrukt nå, men den må ikke glemmes når Elite Fase 2 starter.

### D. UI-kits (byggeklosser, ikke skjermer)

Designeren leverte fem komplette «verktøykasser» (UI-kits) med farger, knapper og maler: booking, coachhq, marketing, playerhq og en felles. Disse er IKKE enkeltskjermer, men grunnlaget alt bygges på. De brukes løpende når skjermene pusses opp. Ingen handling i seg selv — men sjekk at fargene og knappene faktisk matcher det vi bygger.

---

## Mangler helt

Skjermer/funksjoner som planen vår (manifestene) sier vi trenger, men som ikke har noen ferdig design eller ikke kan bygges ennå:

1. **Shot-map / spredningsplott** (`/portal/statistikk/shot-map`) — designet finnes (elite-pakken), men databasen mangler punkt-koordinater for hvert slag. Kan ikke vise ekte data før datamodellen utvides. (Notert som data-blokkert.)
2. **Scorecard per runde, hull-for-hull** (`/portal/tren/turneringer/[id]/runde/[nr]`) — mangler i databasen; `Round` har bare totalscore, ikke hull-for-hull. Data-blokkert.
3. **Live turnerings-tracking** (`/portal/tren/turneringer/[id]/live`) — hele live-scoring-dataflyten mangler. Data-blokkert.
4. **Fellesmelding til turneringsdeltakere** — planen for AgencyOS sier vi skal kunne sende én melding til alle deltakerne i en turnering. Flyten er beskrevet, men ingen ferdig design er levert for selve «velg deltakere → skriv → send»-stegene. Trenger design.
5. **Spiller↔gruppe-veksler** (player-picker alltid øverst i AgencyOS) — beskrevet i planen som en ny fast del av toppmenyen, men ikke levert som design. Trenger design.
6. **Fokus-spiller-blokk med pin + AI-forslag** — delvis bygget på cockpit, men «pin manuelt»-mekanismen + AI-forslagsfeltet er ikke ferdig designet. Trenger design.
7. **Mobil-utgave av Workbench og AgencyOS** — designet er laget for stor skjerm (desktop). Mobil-varianter er ikke tegnet for disse to. Spørsmål til deg: trengs mobil her før lansering, eller holder desktop?

---

## Veien til 100% (rekkefølge)

Enkle bolker, i den rekkefølgen som gir minst risiko og raskest synlig fremgang.

**Bolk 1 — Gjør ferdig det som ble bygget i natt (ingen nytt design trengs).**
De 43 skjermene som er tegnet og bygget i forhåndsvisning (PlayerHQ-hjem, SG-Hub, Live-økt, Runder, Statistikk, Analyse, Meg, Abonnement, Drills, Tester, Årsplan, Booking, Varsler, Innstillinger, TrackMan, Turneringer, Logg ny runde, Forelder-side, Onboarding + AgencyOS cockpit, Spillere, Innboks, Spiller-detalj, Kalender, Bookinger, Tester, Turneringer, Caddie, Sammenlign, Compliance, Drift + auth-sider + marketing-forside): flytt dem fra forhåndsvisning til ekte adresse, koble på ekte data, og test. Mål: alle seks haker grønne.

**Bolk 2 — Plukk de enkle drop-off-skjermbildene (kan bygges selv).**
404-siden mangler fortsatt kobling. Andre tegnede skjermbilder som ennå ikke er bygget kobles på. Disse er tegnet og venter — bare å koble på.

**Bolk 3 — Ta i bruk de tegnede komponentene (kan bygges selv).**
Bygg inn stemme-logging, credit-måler, svakhet-til-drill-bro, sesong-tidslinje, TrackMan-grafene og spiller-sammenligning der de hører hjemme (se drop-off-liste B). Da blir flere skjermer komplette samtidig.

**Bolk 4 — Rydd dobbeltadressene (kan bygges selv).**
Velg én adresse per funksjon der det finnes to (finance/okonomi, kalender/calendar, innboks/messages, plans-templates/plan-templates, godkjenninger/approvals, agencyos-spillere/spillere, og på spillersiden stats/statistikk, analyse/analysere, drills/ovelser). Behold én, la den andre peke videre. Mindre forvirring, mindre å vedlikeholde.

**Bolk 5 — Det som trenger nytt design fra deg (Anders).**
Disse kan vi ikke bygge riktig før du har godkjent et design:
- Fellesmelding til turneringsdeltakere (velg → skriv → send).
- Spiller↔gruppe-veksler øverst i AgencyOS.
- Fokus-spiller med manuell pin + AI-forslag.
- Avgjørelse: trengs mobil-utgave av Workbench/AgencyOS nå?

**Bolk 6 — Det som er data-blokkert (krever databasearbeid først).**
Shot-map/spredning, scorecard hull-for-hull, live turnerings-tracking. Her må vi bygge ut databasen og en måte å samle inn tallene på FØR skjermene kan vise ekte data. Ikke noe vi løser med design.

**Bolk 7 — Elite Fase 2 (bevisst utsatt).**
Hele talent-/elite-delen + den tegnede elite-spredningspakken tas når du sier fra. Designet ligger klart.

---

> Når en rad over endrer seg: oppdater de seks hakene her med en gang. Det er den eneste måten denne planen holder seg sann.

---

## Endringslogg

- 14. juli (AgencyOS-gjennomgang, Bølge 1.1–1.5, samme PR #10/branch): Anders ba om komplett
  gjennomgang av alle AgencyOS-skjermer for mobil/iPad/desktop + porting til v2-design. Kartlagt:
  81 legacy-sider gjenstår (`plans/legacy-portering-prioritet.md` er fasit-rekkefølgen), Bølge 0
  (duplikat-redirect-opprydding) var allerede fullstendig ryddet fra før — ingen sletting
  nødvendig, planen korrigert i stedet. **Bølge 1.1 Turneringer-hub** (`/admin/tournaments`) →
  v2: `AdminTurneringerV2`, én `Rad`-liste (detalj-siden var alt v2). **Bølge 1.2 Drills-
  bibliotek** (`/admin/drills` + detalj/ny/rediger/forslag) → v2: hub som tile-grid
  (`AdminDrillerV2`), detalj som stablede Kort-seksjoner (`AdminDrillDetaljV2`), ett felles
  27-felts skjema (`DrillSkjemaFelter`) delt mellom Ny/Rediger — felt-settet i «Ny drill» er
  utvidet til parity med Rediger (prerequisites/csTarget/lPhase-primary/csMin-Max fantes kun i
  rediger-formen før; nå identisk, ingen data-tap, mindre fremtidig avvik), AI-forslagskøen
  (`AdminDrillForslagV2`) uendret Godkjenn/Avvis-logikk. Ingen v2-mockup fantes for drill-skjemaet
  spesifikt («ren komposisjon» — komponert av `skjema.tsx`-primitivene + lokale chip-/tag-velgere,
  samme idiom som `NyOvelseArk`). Verifisert: tsc 0 feil, ESLint grønt på alle nye/endrede filer;
  full `npm run build` kan ikke fullføre i denne økten (sandkasse mangler `DIRECT_URL`/live DB —
  miljøbegrensning, ikke kode-feil; `next build`-kompileringen selv gikk gjennom uten rute-/
  typefeil, kun data-henting for statisk sitemap feilet mot manglende DB). **Bølge 1.3 Live-økt
  coach-flyt** (`brief`/`active`/`summary`) → v2: `CoachLiveBriefV2`/`CoachLiveActiveV2`/
  `CoachLiveSummaryV2` — samme `TrainingSessionV2`-datamodell og server actions
  (sendBriefTilSpiller/sendLiveMelding/lagreCoachVurdering), `MicButton` gjenbrukt uendret.
  **Bølge 1.4 Spiller-skjemaer**: «Ny spiller» viste seg alt å være ferdig v2
  (`AdminNySpillerV2`, 4-stegs Veiviser) — masterplan-radene var bare stale, rettet uten
  kode-endring. «Tildel test» er alt bygget som egen pixel-perfekt design-handover-port
  (`TildelTestModalScreen`, `test-modul-v2`/`planlegge-v2`-stilarket, IKKE `src/components/v2`-
  kanon) — fungerer og er responsivt, flagget til Anders om den bør unifiseres senere i stedet
  for å bli bygget om nå. **Rediger spiller** portet til v2 (`AdminSpillerRedigerV2`) — samme
  `lagreSpiller`/`slettSpiller`-kontrakt; feltene er bevisst ukontrollerte native inputs (v2-
  skinnet) siden `lagreSpiller` er en ekte FormData-basert form-action, ikke en objekt-kontrakt.
  Verifisert: tsc 0 feil, ESLint grønt på alle nye/endrede filer i begge bølger. **Bølge 1.5
  Plan-mal-redigering**: hub (`/admin/plan-templates`) viste seg alt å være v2 (`AdminPlanMalerV2`)
  — samme stale-rad-mønster som Ny spiller, rettet uten kode-endring. «Ny plan-mal» portet til v2
  (`AdminPlanMalNyV2`) — samme `createTemplate`-kontrakt, discipline-fordelingen som fem
  `Glider`-rader i stedet for rå `<input type=range>`. **Mal-detalj og rediger-editoren er BEVISST
  IKKE portet i kveld**: `template-detail.tsx` (545 linjer) og særlig `template-editor.tsx` (1046
  linjer — uke-grid, drill-plassering, masseredigering m/ konflikt-bekreftelse fra 11. juli) er
  mye større og mer risikofylte enn noe annet portet i Bølge 1; å re-komponere dem i samme
  kveldsøkt som resten av bølgen ville gått på bekostning av kvalitetsbaren («ferdigstille til
  perfeksjon»). Flagget som eget punkt i tabellen — trenger egen mini-plan mot faktisk
  uke-grid-mønster, ikke en hastig omskriving. Bølge 1 (P1 daglig coach-bruk) er dermed
  FULLFØRT bortsett fra dette ene, bevisst utsatte unntaket. **Bølge 2 (P2 ukentlig bruk)
  påbegynt samme kveld:** Tjenester og priser (`AdminTjenesterV2`) og Anlegg (`AdminAnleggV2`)
  portet til v2 — begge samme mønster (liste + delt `BunnArk`-skjema for ny/rediger, uendret
  server actions). `FacilityForm` i Anlegg var allerede dødt/ubrukt i legacy — ikke portet, ingen
  ny funksjon lagt til. Tre rader viste seg å alt være v2 (samme stale-rad-mønster som Ny spiller/
  Plan-maler): Grupper (`GrupperV2`/`GruppeDetaljV2`), samt to rene redirect-stubber (Kapasitet→
  bookinger, Stall-oversikt→spillere) — rettet i tabellen uten kode-endring. **Tilgjengelighet
  (1249 linjer, 3 kalendervisninger: måned-grid/drag-uke-grid/år-Gantt + delt Google Calendar-
  sync) og Innstillinger (1727 linjer, 13 filer: kalender/security/tilgang) er BEVISST IKKE
  portet** — samme størrelsesorden/risiko-vurdering som mal-editoren i Bølge 1, flagget i tabellen
  for egen mini-plan. Økonomi-sammenslåingen (full `/admin/okonomi` vs. v2-versjonen på
  `/admin/agencyos/okonomi`) er heller ikke gjort — krever en bevisst beslutning om hvilken som
  vinner, ikke en ren port. Gjenstående i Bølge 2: Innstillinger, Tilgjengelighet, Økonomi-
  sammenslåing — alle tre bør ha egen plan-økt. Deretter Bølge 3 (P3 sjelden/admin).
  **Rettelse 14. juli:** Økonomi-sammenslåingen over var allerede løst i kode før denne
  gjennomgangen startet — `/admin/okonomi` er en ren `redirect()` til `/admin/agencyos/okonomi`
  (kanon-siden, ekte `AdminOkonomiV2`/Prisma-data). Begge rader rettet i tabellen, ingen kode
  skrevet. Gjenstående i Bølge 2 er dermed kun Innstillinger + Tilgjengelighet.
- 14. juli (AgencyOS-gjennomgang fortsetter, Bølge 3.1–3.11, samme PR #10/branch): P3-lista
  (`plans/legacy-portering-prioritet.md`) portet skjerm for skjerm, samme metodikk som Bølge 1–2
  — én skjerm per commit, `test -f`-kollisjonssjekk før hver commit (se hendelse under),
  master-skjermplan-rader oppdatert i samme commit som koden (detaljene står på hver rad, ikke
  gjentatt her): **3.1** Audit-log (`AdminAuditLogV2`) + Integrasjoner (`AdminIntegrasjonerV2`).
  **3.2** Inviter coach (`AdminInviterCoachV2`). **3.3** Hjelp (`AdminHjelpV2`). **3.4** Lag-snitt
  (`AdminLagSnittV2`) + Forespørsler (`AdminForesporslerV2`). **3.5** Tildelt meg
  (`AdminTildeltMegV2`). **3.6** Godkjenning-detalj (`AdminGodkjenningDetaljV2`, erstattet
  enekonsument `ApprovalDetailClient`). **3.7** TrackMan-oversikt (`AdminTrackmanV2`). **3.8**
  Teknisk-plan-detalj (`AdminTekniskPlanDetaljV2`). **3.9** E-postmal-rediger
  (`AdminEpostmalRedigerV2`). **3.10** Videoer (`AdminVideoerV2`) — samme `SessionVideo`-modell
  og `uploadVideo`/`getSignedVideoUrl`/`deleteVideo`-kontrakt; opplastingsskjemaet bruker bevisst
  native ukontrollerte inputs (samme mønster som «Rediger spiller») siden `uploadVideo` er en
  ekte FormData-basert action, ikke en objekt-kontrakt. **3.11** Opptak (`AdminOpptakV2`) —
  sesjon-opptak-skjermen (943 linjer i legacy: `page.tsx` + `recording-controls.tsx` +
  `recording-analyze-button.tsx`) er den mest logikk-tunge P3-skjermen så langt (MediaRecorder,
  30-sek chunk-opplasting til `/api/recording/upload-chunk`, Wake Lock, batteri-overvåking,
  gjenopprettings-flyt for avbrutte opptak). Vurdert mot de fire allerede utsatte store skjermene
  (mal-editor/Tilgjengelighet/Innstillinger/Økonomi) — de er multi-view-systemer som krever en
  arkitekturbeslutning; dette er ÉN skjerm med ÉN client-komponent, så den ble portet i sin
  helhet: all MediaRecorder-/Wake Lock-/chunk-kø-/gjenopprettingslogikk er kopiert UENDRET
  (kun JSX-laget er re-skinnet til v2-tokens) for å unngå enhver atferdsregresjon i noe som ikke
  kan testes i denne sandkassen (krever ekte mikrofon/nettleser-permissions). Lagt til to nye
  ikoner i v2-ikonkartet (`mic`, `pause`, `square`, `battery-low`) — sanksjonert vei per
  `icon.tsx` sin egen kommentar, ikke et design-gap. Flere hub-rader (Team, Coaching-board,
  Kommunikasjon) viste seg alt å være v2 eller rene redirect-stubber — rettet uten kode-endring,
  samme stale-rad-mønster som tidligere bølger. **Én build-feil underveis** (commit `f2710ef5`,
  Lag-snitt-porten): glemte å slette `(legacy)/lag-snitt/page.tsx` → Turbopack rute-kollisjon i
  Vercel. Fikset i `64397b0e`, verifisert både lokalt (`next build`-kompilering OK) og i faktisk
  Vercel-deploy (Ready). Ny fast rutine etter dette: eksplisitt `test -f`-sjekk av BÅDE slettet
  legacy-side og ny v2-side rett etter `git rm`, før staging — kjørt på alle senere porteringer
  denne kvelden. Verifisert hver skjerm: tsc 0 feil, ESLint grønt. Full `npm run build` kan ikke
  fullføre i denne sandkassen (mangler `DIRECT_URL`/live DB — miljøbegrensning), men
  kompilerings-/rute-fasen (der kollisjonsklassen feiler) går gjennom uten feil.
  **3.12** Agenter (`/admin/agenter`) — tynn v2-innramming rundt delt `AgentChat`
  (Claude/Gemini/Grok/Ollama flermodell-chat, delt uendret med `/kommando/agenter`). Samtidig
  ryddet en runde stale rader oppdaget under gjennomgangen (ingen kode-endring): Kommunikasjon-
  hub, Coach-workbench, Innsikt-hub (`/admin/analysere`), Caddie og en duplikat Tilstander-rad
  er alle bekreftet rene `redirect()`-stubber; og Økonomi-sammenslåingen fra Bølge 2 (flagget som
  uavklart) viste seg allerede løst i kode — `/admin/okonomi` redirecter til den ekte v2-siden
  `/admin/agencyos/okonomi` (`AdminOkonomiV2`). **3.13** AI Workspace (`/admin/ai`) — 3 faner
  (kode-sesjoner/chat/agenter 24/7), «Apply + log» er nå en ekte server action i stedet for
  legacy sin inline per-rad-closure. Fant en dødrute (`/admin/ai/run`, kode-sesjon-skjemaets
  `action=`) som ikke finnes i koden — allerede broken i legacy, bevart uendret og meldt i
  tabellen, ikke stille fikset. **3.14** Klubb-innstillinger (`AdminKlubbInnstillingerV2`) —
  multi-club org-innstillinger + klubbkort, to `BunnArk`-skjemaer (org-info, klubb ny/rediger)
  erstatter native `<dialog>`-elementene; samme funn-mønster som 3.13 — «Detaljer»-lenken på
  klubbkortet peker til en rute som ikke finnes (`/admin/klubb/[id]/rediger`), bevart uendret.
  **3.15** Profil (`AdminProfilV2`) — samme `oppdaterCoachProfil`-kontrakt, native ukontrollerte
  felt (ekte FormData-action, samme mønster som «Rediger spiller»). «Skjul»-knappen er fortsatt
  en placeholder-toast, ingen ekte deaktiverings-backend (uendret fra legacy, ikke et nytt funn).
  **3.16** Reach/engasjement (`AdminReachV2`) — lesevisning (KPI-strip, egendefinert SVG-
  linjegraf for daglig aktivitet, topp-engasjerte/trenger-oppfølging-lister, compliance-tabell
  m/ filter, feature-adoption-bar-chart); `page.tsx` sin aggregeringslogikk er 100 % uendret,
  kun presentasjonslaget er portet. **3.17** Risiko/stall-kart (`AdminRisikoV2`) — samme
  SKADET/permisjon/dager-siden-økt-logikk, 8-kolonners heatmap + oppfølgingsliste; hadde ingen
  egen rad i master-skjermplanen fra før, lagt til under Innsikt-seksjonen. **3.18**
  Stats-moderering (`AdminStatsModereringV2`) — bevisst portet som samme rene UI-skall som
  legacy: ingen modererings-/GDPR-slett-datamodell finnes ennå, så alle lister/tall er
  hardkodet tomme i `page.tsx` (som før) og Godkjenn/Avvis/Bekreft-slett-knappene har ingen
  handling. Ikke en design-mangel — det er ærlig, siden ingen ekte kø finnes å koble til.
  **3.19** Stats-oversikt (`AdminStatsOversiktV2`) — admin-dashboard (KPI-strip, database-status,
  sync-status, modereringskø-forhåndsvisning, git-commits, raske handlinger); datahenting 100 %
  uendret, `Reveal`/`CountUp` gjenbrukt for scroll-inn-animasjon. Fant en pre-eksisterende bug:
  `hentSisteCommits()` kjører `execSync` mot en hardkodet lokal filsti (Anders' Mac) som aldri
  finnes i Vercel — fanges stille av try/catch (tom liste). Bevart uendret, meldt i tabellen.
  **3.20** Talent · Kohort (`AdminTalentKohortV2`) — samme `TalentTracking`-aggregering
  (snitt-radar 5 akser + 90-dagers progresjon per nivå U10–Senior), ren visning. Resten av
  **Bølge 3.25** (samme kveld, ny undersøkelse): Tester-klyngen. `/admin/tester` (hub) viste seg
  alt å være v2 (`AdminTesterV2`) — masterplan-raden var stale, rettet uten kode-endring. Fasiter
  (`AdminTesterBenchmarksV2`) portet — samme `TestDefinition`-synk-state, `approveBenchmark
  Pending`/`rejectBenchmarkPending`/`runBenchmarkSyncNow`-kontrakt uendret. Foreslåtte tester
  (`AdminTesterForeslatteV2`) portet — samme `TestDefinition`-filter (isCustom + COACH-visibility
  + ikke godkjent), samme `godkjennForslag`/`avvisForslag`-kontrakt. **Tildel test**
  (`AdminTildelTestModalV2` + spiller-velger-hub) — samme `tildelTest`-kontrakt. Fant at
  legacy-modalen brukte egendefinerte CSS-klasser (`tester-modal`, `te-pyr-filter` osv.) uten
  NOE matchende stilark noe sted i kodebasen — skjermen rendret altså helt ustylet i prod.
  `BunnArk`-porten her er dermed en reell funksjonell forbedring, ikke bare et redesign. Bevart
  identisk (litt uvanlig) startverdi for søk («putt») og filter («SLAG» i stedet for «Alle»)
  samt fallback-sample-tester når DB er tom — begge deler var slik i legacy, ikke endret her.
  Med dette er hele Tester-klyngen (hub/fasiter/foreslåtte/tildel) portet til v2.
  Talent-klyngen (region/ressurser/sammenligning/wagr-benchmark/wagr-import, ~1200 linjer) er
  IKKE portet i kveld — sammenligning bruker en delt v10-komponent (`TalentSammenligning`,
  `src/components/admin/talent/`) som ligger utenfor golfdata/v13-generasjonen; å porte den
  skjermen alene ville betydd enten å bygge en helt ny v2-versjon av selve
  sammenligningskomponenten (stor, egen jobb) eller la den beholde utdatert v10-stil inni en
  v2-ramme (inkonsistent). **3.21** Talent · Region (`AdminTalentRegionV2`) — samme
  region-aggregering (nivå-filter, klubb-topp-3, snitt-radar) + forenklet Norge-kart-stub
  (SVG, samme geometri/koordinater, kun v2-tokens for farger). **3.22** Talent · Ressurser
  (`AdminTalentRessurserV2`) — samme `TalentRessurs`-modell, filter-chips (kategori/nivå/fokus
  via URL), ekte FormData `leggTilRessurs`-action for ADMIN med native ukontrollerte felt.
  **3.23** Talent · WAGR-benchmark (`AdminWagrBenchmarkV2`) — samme `WagrSnapshot`-modell
  (topp 5 globalt + topp 5 norske, NGF-kategori-skala A–I), samme `slettWagrSnapshot`-action
  (delt fra `wagr-import/actions.ts`, uendret). **3.24** Talent · WAGR-import
  (`AdminWagrImportV2`) — samme `WagrSnapshot`-matchede-spillere-visning + ekte
  `synkWagrNaa`-server-action (uendret, samme toast-oppsummering). Med dette er hele
  Talent-klyngen portet UNNTATT sammenligning (avhenger av delt v10-komponent, se over,
  krever egen beslutning). **3.28** Spiller · Full profil (`/admin/spillere/[id]/profil`) →
  `AdminSpillerFullProfilV2` — samme Prisma-modell (personalia, foreldre/`ParentRelation`,
  aktive mål, skader/permisjoner, coach-vurdering) + samme `inviterForelderForSpiller`-
  objekt-kontrakt (invite-modalen ble til en `BunnArk`). Navnekollisjon oppdaget og løst
  underveis: `AdminSpillerProfilV2.tsx` fantes alt fra 13. juli som en HELT ANNEN, aktiv
  komponent (spiller-dashboardet på `/admin/spillere/[id]`) — Write-verktøyets
  les-før-skriv-sperre stoppet et utilsiktet overskriv; den nye komponenten fikk i stedet
  navnet `AdminSpillerFullProfilV2`, ingen data gikk tapt. Fant en pre-eksisterende
  fabrikasjon (bevart, ikke fikset — se tabellraden): «Spiller-DNA»-radar/cohort-snitt og
  aktive måls `ProgressRing` er hardkodede plassholdertall i legacy, aldri beregnet fra
  ekte data. Verifisert: tsc 0 feil, ESLint grønt. **Bølge 3.29** Turneringer · Dubletter
  (`/admin/tournaments/dubletter`) → `AdminTurneringerDubletterV2` — samme merge-forslag-
  algoritme (MANUAL-turneringer matchet mot DATAGOLF/NGF/GJGT via token-overlap + ±3 dager) og
  samme `mergeTurneringer`-server-action (delt fra `tournaments/actions.ts`, uendret). Ruten er
  ikke lenket fra noen v2-skjerm — var heller ikke lenket fra hub-en i legacy — bevart som
  direkte-URL-only vedlikeholdsverktøy. Med dette gjenstår kun «Ny turnering»-wizarden
  (876 linjer, `wizard.tsx`) i Turneringer-klyngen; bevisst IKKE portet i kveld — for stor/
  risikofylt til å re-komponere i samme økt som resten (samme vurdering som plan-mal-editoren
  tidligere), trenger egen dedikert gjennomgang. Verifisert: tsc 0 feil, ESLint grønt.
  **Bølge 3.30** (samme kveld, etter fornyet vurdering): «Ny turnering»-veiviseren ble likevel
  portet — ved nærmere lesing var 876-linjers `wizard.tsx` mest repeterende JSX (5 rett-frem
  steg), ikke arkitektonisk risikofylt som plan-mal-editorens uke-grid/masseredigering. Portet til
  `AdminTurneringerNyV2` — samme 5 steg, samme per-steg-validering, samme `createTournament`-
  kontrakt (uendret, delt fra `tournaments/ny/actions.ts`). Steg-navigasjon bruker det
  eksisterende `Veiviser`-komponentet (samme idiom som «Ny spiller»); chip-velgere (format/tee/
  HCP/viktighet) er en lokal `Pill`, samme mønster som `DrillSkjemaFelter.tsx`. Med dette er hele
  Turneringer-klyngen (hub/detalj/ny/dubletter) portet til v2. Verifisert: tsc 0 feil, ESLint
  grønt. **Rettelse/Bølge 3.31** (samme kveld, etter fornyet vurdering — se Bølge 2-notatet
  over): Tilgjengelighet ble likevel portet i kveld. Ved nærmere lesing var kalender-triplet
  (måned-grid/drag-uke-grid/år-Gantt) og `slot-form.tsx` ren, isolert UI-logikk uten skjult
  arkitektur-risiko — samme vurdering som snudde på «Ny turnering»-veiviseren. Eneste reelle
  hinder var at `CalendarSyncSection` er en ASYNC SERVER-KOMPONENT og derfor ikke kan importeres
  direkte i en klient-komponent; løst ved at `page.tsx` render'er den og sender resultatet inn
  som en `calendarSync`-prop (standard Next.js-mønster for server-komponenter inni klient-
  komponenter). Portet til `AdminTilgjengelighetV2` — samme tre visninger, samme drag-to-create-
  pointer-event-logikk (uendret), samme `addSlot`/`updateSlot`/`deleteSlot`-kontrakt inkl.
  no-dobbeltsted-vernet. Bekreft-popover og opprett/rediger-skjema er nå `BunnArk` i stedet for
  native `<dialog>`/fixed-div. `CalendarSyncSection`-innholdet er bevisst IKKE re-skinnet —
  forblir legacy-stil til den porteres sammen med Innstillinger (delt komponent, se
  `plans/legacy-portering-prioritet.md`). Gjenstår i Bølge 2 er dermed kun Innstillinger.
  Verifisert: tsc 0 feil, ESLint grønt. **Bølge 3.32** (samme kveld): Innstillinger-HUBEN
  (`/admin/settings`, kun hoved-siden med Organisasjon/Team & roller/Tilgang-fanene) portet til
  `AdminInnstillingerV2` — samme `?tab=`-mønster og Prisma-aggregering (klubber + coacher/unike
  spillere per gruppe). De fire undersidene (`api`, `calendar`, `security`, `tilgang`) er IKKE
  portet i denne commiten — hver har egne skjemaer/modaler og bør tas én om gangen. Verifisert:
  tsc 0 feil, ESLint grønt. **Bølge 3.33**: Innstillinger · Sikkerhet portet til
  `AdminInnstillingerSikkerhetV2` — samme innhold (kontooversikt, 2FA via delt, uendret
  `Setup2FA`-klientkomponent, passord-lenke til glemt-passord-flyten, plassholder for aktive
  økter til auth-audit-logg finnes). Verifisert: tsc 0 feil, ESLint grønt. **Bølge 3.34**:
  Innstillinger · Tilgang portet til `AdminInnstillingerTilgangV2` — samme read-only CBAC-matrise
  (rolle × capability, `can()`-oppslag uendret). Gjenstår i Innstillinger-klyngen er nå kun `api`
  (API-nøkler + modal) og `calendar` (Google Calendar-sync, inkl. selve `CalendarSyncSection` som
  også brukes fra Tilgjengelighet). Verifisert: tsc 0 feil, ESLint grønt. **Bølge 3.35**:
  Innstillinger · API-nøkler portet til `AdminInnstillingerApiV2` — samme `ApiKey`-modell,
  samme `createApiKey`/`revokeApiKey`-kontrakt. Opprett-modalen er nå `BunnArk` (uendret to-
  stegs flyt: navn+scopes-skjema → engangsvisning av hemmeligheten). Gjenstår i hele
  AgencyOS-gjennomgangen er nå KUN `/admin/settings/calendar` (deler `CalendarSyncSection` med
  Tilgjengelighet) og Talent · Sammenligning (venter på v10-beslutning). Verifisert: tsc 0 feil,
  ESLint grønt. **Bølge 3.36**: `/admin/settings/calendar` portet — `CalendarSyncSectionV2`
  (async server-komponent, `AdminInnstillingerKalenderV2.tsx`) + klient-delen
  (`SubscriptionsFormV2`/`DisconnectKnappV2`, `AdminInnstillingerKalenderKlientV2.tsx`, splittet i
  eget "use client"-fil fordi sync-seksjonen selv må forbli en async server-komponent). Samme
  `googleCalendarConnection`/`subscriptions`-modell og samme `oppdaterSubscriptions`/
  `refreshCalendarList`/`disconnectGoogleCalendar`-kontrakt. **`/admin/availability` oppdatert i
  samme commit** til å bruke `CalendarSyncSectionV2` i stedet for legacy-komponenten — den
  tidligere flaggede visuelle inkonsistensen (se Bølge 3.31-notatet) er dermed løst, ikke lenger
  bare dokumentert. Lagt til `save`-ikon i v2-ikonkartet. Med dette er HELE Innstillinger-klyngen
  OG hele denne kveldens AgencyOS-gjennomgang ferdig portet, bortsett fra Talent · Sammenligning
  (bevisst utsatt, venter på v10-komponent-beslutning — se `plans/legacy-portering-prioritet.md`).
  Verifisert: tsc 0 feil, ESLint grønt.

  **Bølge 3.37** (Anders ba eksplisitt om denne etter kveldens oppsummering): Talent ·
  Sammenligning portet til v2 likevel. Undersøkelse viste at v10-komponenten
  (`TalentSammenligning`, `src/components/admin/talent/sammenligning.tsx`) var enekonsument —
  ingen andre skjermer importerte den, så «delt v10-komponent på tvers»-bekymringen fra tidligere
  i kveld var ikke reell; den ble erstattet direkte, ikke bevart ved siden av v2-versjonen.
  **Reell databug funnet og fikset i samme slag** (ikke bare re-skinnet): `loadMultiCompare`
  (`src/lib/admin-compare/multi-compare-data.ts`, uendret) har alltid beregnet ekte per-spiller
  SG-verdier (`metric.values`), ekte kohort-`sgTotal` per spiller og et utledet verdikt-utsagn —
  men `map-compare-data.ts` (nå slettet) mappet ALDRI disse videre, og v10-komponenten hardkodet
  «—»/«ingen data»/senterlinje-uten-søyle for hver eneste celle uansett props (den var en pixel-
  port av en design-fasit som bevisst viste en tom-tilstand, og ingen fasit fantes for den fylte
  tilstanden). Coachen kunne dermed ALDRI se et faktisk sammenligningstall, uansett hvor mye SG-
  data spillerne hadde. `AdminTalentSammenligningV2` viser nå de ekte tallene: per-spiller-verdier
  med best-badge per metrikk (høyest/lavest avhengig av `higherIsBetter`), kohort-søyler tegnet
  mot faktisk `sgTotal` på en −2,0→+2,0-skala (henger til høyre/venstre fra senterlinjen etter
  fortegn), og verdikt-setningen som et fremhevet lime-varsel øverst. Pyramide-panelet (tidligere
  alltid «ingen treningsplaner»-tekst uansett data) viser nå ekte økt-antall per akse per spiller
  som grupperte søyler. «Endre utvalg»-knappen var også død i legacy (lenket til seg selv uten
  `?ids=`, ingen faktisk velger) — erstattet med en ekte `BunnArk`-spillervelger (søk + inntil 4
  avkryssede spillere, samme idiom som Tester · Tildel). Ny hjelpetekst-nøkkel `tourBaseline`
  lagt til `src/lib/v2/hjelpetekster.ts`; nye ikoner `user-plus` i v2-ikonkartet. Verifisert:
  tsc 0 feil, ESLint grønt. Med denne er HELE `plans/legacy-portering-prioritet.md`-lista ferdig
  portet — ingen gjenstående punkter. **Dokument-rydding (14. juli, samme kveld):** filen er
  ferdig og arkivert til `plans/arkiv/legacy-portering-prioritet.md` sammen med resten av
  kveldens dok-opprydding (se `docs/arkiv/README.md`) — historiske referanser til den over i
  denne loggen er bevart uendret som beskrivelse av hva som var sant da det ble skrevet.
- 13. juli (sent — Workbench-mobil videre à la Google/Notion Calendar, samme PR #10/branch):
  Anders delte skjermbilder av en kalender-mobilapp (omtalt som Notion Calendar, viste seg å
  være Google Kalender) og ba om «...»-overflow-meny på økt-detaljen, samt dag-/2 dager-/liste-/
  kanban-visning. Levert i 5 bølger: **A** «...»-meny (`ValgtOktSeksjon`) erstatter Flytt/
  Dupliser/Slett-knapperaden — slett er rødt og atskilt, som i referansebildet. **B** dagvisning
  fantes alt (`DagNivaa`), kun relabelt «Økt» → «Dag» for konsistens med de nye pillene. **C**
  «2 dager» — `ToDagerNivaa`, to nabodager side ved side, gjenbruker `DagNivaa` uendret (bevisst
  ingen ny tidsgrid). **D** «Liste» — `ListeNivaaMobil`, flat kronologisk agenda for hele uka
  gruppert per dag; ny delt `OktAgendaRad` (utskilt fra `DagNivaa`) holder akse-fargen konsistent
  med resten av Workbench i stedet for designsystemets nøytrale `AgendaRow`. **E** «Kanban» —
  `KanbanNivaaMobil`, økter gruppert Planlagt/Pågår/Fullført (avvik vises som prikk på kortet,
  ikke egen kolonne). Alle tre nye nivåer er mobil-only; desktop faller tilbake til uke-visningen
  hvis URL-en peker på et av dem. **Flagget til Anders i PR:** Kanban går en litt annen retning
  enn Handlingssenter-v2 (som droppet kanban/tabell/liste til fordel for én liste) — verdt å
  bekrefte om han vil beholde den, gruppere på pyramideområde i stedet, eller droppe den.
  Verifisert: tsc 0 feil, ESLint grønt, ingen datamodell-/loader-endring i noen av bølgene.
- 13. juli (økt-arket: ekte dato/tid + «Ny øvelse» i arket, samme PR #10/branch): Anders så
  «Ny økt»-arket i previewen og ba om to ting utover det som var levert. **Dato/tid:** «Dag»-
  ukedag-pillene er byttet med et ekte datofelt (`<input type="date">`, ±52 uker) — datamodellen
  (`TrainingPlanSession.scheduledAt`) var alt dato-først, så dette var en ren UI-endring (nye
  pure helpers `toIsoDateLocal`/`weeksBetweenMondays` i `session-move-math.ts`). Lagres økten i
  en annen uke enn den man ser på, hopper visningen dit automatisk (aldri stille «forsvinning»).
  **«Ny øvelse» i arket:** `NyOvelseArk` DRY-refaktorert (feltene utskilt til `OvelseSkjemaFelter`)
  så «+ Ny øvelse»-knappen ved siden av banksøket bytter INNHOLDET i samme bunn-ark i stedet for
  å stable et nytt oppå (unngår modal-i-modal-anti-mønsteret) — den nye øvelsen legges rett inn
  i øktas driller med `exerciseId`. **Notion Calendar/Apple/Google Kalender-review levert** (se
  plan-notat): sidepanel-med-drillbar-database à la Notion Calendar finnes ikke i design-kanon
  og er en kompleksitetsøkning mot den gjeldende «retning C: forenkle»-beslutningen — anbefaling
  dokumentert, IKKE bygget nå (venter på skisse i Claude Design-prosjektet + Anders' godkjenning
  per design→system→prod-regelen). Verifisert: tsc 0 feil, ESLint grønt, prisma validate OK
  (ingen skjemaendring).
- 13. juli (mobil/desktop-forbedringer, PR #10, branch `claude/mobile-desktop-improvements-90kanx`):
  **Anders' 7 problemområder levert i 8 bølger.** (1) Ytelse: middleware gjør nå ETT
  `getUser()`-nettverkskall per navigasjon (var 2×) og auth-lasting er 1 Prisma-query (var 3);
  rot-`loading.tsx` for `/admin`; lazy mapbox; marketing-forsiden statisk. (2) Workbench-mobil:
  økt-trykk åpner BunnArk (ny delt bunn-ark-primitiv i `src/components/v2/bunn-ark.tsx`),
  årsplan = tappbar liste (860px-canvas borte), måned = `MndNivaaMobil`-ukeliste, alle ark
  bunn-forankret på mobil, `?okt=/?zoom=` overlever tilbake/frem. (3) «Legg til målsetning»
  på Hjem + Mål-hub + Workbench (NyttMaalArk). (4) Øvelsesbank: `TrainingDrillV2.exerciseId`-FK
  (Supabase-migrering kjørt), plan-driller speiles til live-økta, «Ny øvelse» virker
  (NyOvelseArk, begge roller, også inne i live-økt), coach-øvelser ikke lenger synlige for alle
  (source/visibility-fiks). (5) Live økt: bilde/video-opplasting, kommentar per drill,
  TrackMan-import inkl. skjermbilde→AI-vision m/ fallback, aldri stille datatap ved lagringsfeil,
  `loadLiveSession`-IDOR tettet. (6) Safe-area på legacy-header (~77 sider), delt deep-link-trygg
  BackButton, delt PLAYERHQ_SEKSJONER-navkilde. (7) Feilfiks-plan 11/7 re-verifisert: døde
  kjøps-CTA-er koblet (signup/checkout/booking), Handlingssenter «Merk fullført» skriver til
  Notion, turnering-UTC-midnattsfeil fikset 6 steder, delvis SG-input skjevfordeler ikke fokus
  lenger, analyse-actions IDOR-vernet. Verifikasjon: tsc 0 feil + ESLint grønt lokalt (miljø uten
  DB-secrets), full build grønn i Vercel-preview per bølge. Playwright-e2e gjenstår (krever DB) —
  kjøres i preview før merge.
- 13. juli (feilretts-runde fra Anders' mobil-skjermbilder + full feilklasse-gjennomgang, 10 steg):
  **Rotårsak funnet og fikset — live-økter fikk ALDRI drills:** plan→live-speilingen
  (`upsertV2ForPlanSession`) kopierte aldri SessionDrill → TrainingDrillV2 (`trainingDrillV2.create`
  fantes ikke i kodebasen). Nå speiles drillene (replace, kun PLANNED-økter), og backfill-script
  ryddet basen (+4 foreldreløse speil slettet). **Status-synk begge veier:** «Gjort/Hopp over»
  traff 0 rader pga. feil `generertFra`-streng; live-fullføring skrev aldri tilbake til plan-økta
  (etterlevelsen lyver ikke lenger). **Alle mutasjonsflater synker nå V2:** /admin/plans (flytt/
  avlys/oppdater/slett/opprett + plan-sletting), AI-executor og legacy planlegge. **«Ny økt» =
  «Rediger økt» (Anders' krav):** ett felles økt-ark med L-fase, miljø og full drill-editor i begge;
  delt drill-skrivehelper for create+update (spiller OG coach); biblioteks-økter tar med drillsJson-
  innholdet inn i arket. **Gjør-flatens live-avspiller:** mørk forest-flate (var lys shadcn), én
  tittel, ærlig tom-tilstand ved 0 drills, timer tikker fra start. **Mobil:** bunn-nav-klaring
  safe-area-bevisst i V2Shell (+3 headere utenfor shellen fikk topp-klaring), coldstart-malkort i
  1 kolonne uten navn-kutt. **Lastet-men-ikke-koblet:** gruppetider vises nå i Workbench-uka;
  døde dirBDays/kanbanCols fjernet fra loaderen. Verifisert: tsc+build grønt, drill-speiling
  DB-testet (idempotent), Playwright mobil 375px — «Ny økt»-arket med alle felter (screenshot),
  full kjede UI→plan-drills→live-drills, tom-økt-flaten mørk med tikkende timer (screenshot).
  Utsatt (ærlig): scrollhint-fade på 4 overflow-rader (krever målt-overflow-mønster, v2-runde).
- 12. juli (WAGR-synk, del 2): **ekstern henting fra wagr.com er PÅ** — Anders godkjente skånsom
  ukentlig henting (alternativ 1). `hentEksterneProfiler` i `wagr-sync.ts` leser profilsidenes
  server-rendrede `__NEXT_DATA__`-JSON (validert med zod), sekvensielt med 700 ms pause og
  identifiserende User-Agent. Domeneregel fra Anders (13. juli): **borte fra WAGR = blitt
  proff** — både eksplisitt proff (isPro/position 0) og manglende profil (302/404) behandles
  likt: `blittProff` i output, metadata.isPro settes, siste amatørtall bevares. Nettverksfeil
  (`feilet`) rapporteres uten å stoppe kjøringen; demo-slugs hoppes over; `country` røres ikke
  (wagr.com gir landsnavn, ikke ISO-kode). Verifisert med ekte kjøringer: 3 rankinger oppdatert
  (Stout, Kuvaas, Aase), 7 proffer markert (Koivun, James, Maas, Summy, Mjaaseth, Herstad,
  Tegner), 0 feil. Datafiks: Kuvaas-slugen manglet tall-suffiks i basen — rettet til
  `kristoffer-kuvaas-35131` (verifisert mot wagr.com-søket).

- 12. juli (WAGR-synk): **«Synk nå» på `/admin/talent/wagr-import` har fått ekte backend** — ny
  agent `src/lib/agents/wagr-sync.ts` (registrert i cron-ruten + vercel.json, onsdager 06:15 UTC)
  som kobler umatchede WagrSnapshot-rader til spillere på entydig navnetreff og lagrer snapshots
  idempotent (`oppdaterSnapshots`, moveDelta bare ved rank-endring). Knappen kaller samme kjøring
  via server action `synkWagrNaa` med ærlig toast-status. Ekstern henting fra wagr.com er BEVISST
  sperret (`hentEksterneProfiler` → null) til Anders har avklart datakilde — ingen åpen API finnes,
  scraping-lovlighet uavklart; manuell import er fortsatt primærvei. NGF-kategori-mappingen er
  flyttet til delt `src/lib/wagr/ngf-kategori.ts`.

- 11. juli (booking-konsolidering, fase 1.1–1.3): **sikkerhetshull i ombooking tettet** —
  `rescheduleBooking` i `booking/actions.ts` hardkodet `coachId = ""`, som gjorde at Google
  Kalender-kollisjonssjekken alltid «feilet åpent» (fant ingen tilkobling → sa ledig). Bruker nå
  ekte `booking.coachId`. Verifisert mot en midlertidig testkobling i dev-DB (ryddet opp etterpå).
  24-timers påminnelse (`src/lib/agents/booking-reminders.ts`) viste seg å allerede være fullt
  bygget og koblet på cron — ingenting å gjøre der. Slått sammen de to parallelle
  booking-e-postsystemene til ett: `booking/actions.ts` (marketing/gjeste-avbestilling og
  -ombooking) brukte hardkodede React-maler (`send-booking-email.ts`), mens resten av appen
  allerede brukte de DB-drevne `EmailTemplate`-radene (`booking-emails.ts`, redigerbare av Anders
  uten kode-endring). Lagt til to nye maler i databasen (`booking-avbestilt`, `booking-flyttet`),
  byttet `booking/actions.ts` til det DB-drevne systemet, og slettet det nå døde
  `send-booking-email.ts` + `templates/`-mappa. tsc + build + 400/400 tester grønt.

- 11. juli (booking-konsolidering, fase 2–3): **fase 2 (rydd legacy vs v2-duplikater) trengte
  ingen kode** — grep + git-historikk viste at kun index-sidene (`/portal/booking`,
  `/admin/bookinger`) er byttet til v2; alle undersider (`/portal/booking/ny`, `[bookingId]`,
  `coach/[coachId]`, `anlegg/[anleggId]`, `bekreftet`, `/admin/bookinger/ny`) er fortsatt
  fungerende legacy-kode uten v2-erstatning, og aktivt lenket til fra global søk, coach-sider,
  spiller-detalj og «Mine bookinger». Ikke reelle duplikater — å omdirigere dem ville brukket
  ekte flyter. **Fase 3 (hente trener-katalog + anlegg-detalj fra `akgolf-booking`) utsatt av
  Anders** til normal bølge-rekkefølge i v2-migreringen — begge skjermene mangler godkjent v2-design
  (Design-kolonne «–» over), og bygging ville brutt den låste regelen om at nye, store flater
  venter på godkjent mockup. Ingen kode endret i denne runden.

- 11. juli (QA-runde, komplett gjennomgang desktop+mobil): **KRITISK shell-bug funnet og fikset** —
  `BunnNavLenker` (mobil-bunn-nav) i `src/components/v2/shell.tsx` satte `display: "flex"` som
  inline style, som alltid vant over Tailwind-klassen `md:hidden`. Konsekvens: bunn-navigasjonen
  vises feilaktig på ALLE v2-skjermer ved desktop-bredde (≥768px) og overlapper/stjeler klikk fra
  sideinnhold som strekker seg mot bunnen av viewporten (bekreftet reprodusert 2/2 ganger på
  Plan-bygger steg 2→3 — klikk på «Neste» traff bunn-nav-lenken til Meg i stedet). Fiks: fjernet
  inline `display`, lagt `flex` som base-klasse (`className="flex md:hidden"`). Bekreftet fikset
  visuelt og funksjonelt (steg 2→3 fungerer nå korrekt) — påvirket sannsynligvis alle v2-skjermer
  på desktop før fiksen. Mobil (375px) var aldri rammet. Samme QA-runde bekreftet: F1.0-F1.5
  (onboarding→planmotor) fungerer ende-til-ende i ekte nettleserflyt, F2 (volum-linje) fanget en
  ekte datafeil i malen «B Grunn-fase Standard» (nærspill/putting-økter tagget SLAG i stedet for
  SPILL — bør rettes), F3 (masseredigering) koblet og enhetstestet.

Full kronologisk byggehistorikk flyttet til [`docs/arkiv/master-skjermplan-endringslogg.md`](arkiv/master-skjermplan-endringslogg.md)
2026-07-06 — denne fila var 822 linjer og loggen drukna den faktiske statustabellen. Siste hendelser:

- 11. juli (Bølge B — AgencyOS-detaljskjermer til v2, branch `claude/bolge-b-agencyos`):
  **12 skjermer rebygget på v2:** agencyos/spillere (stall-tabell, ny MiniSpark-primitiv),
  agent-detalj, gruppe-detalj + timeplan, admin plan-detalj (4 faner), spiller-plan-detalj
  coach-context (5 faner), turnering-detalj, økt-detalj (coach-context), oppfølgingskø
  (kanban) + oppfølging-alias, daglig AI-brief, coach-varsler (ny master-skjermplan-rad),
  workspace Notion-sync + prosjekter. Admin error/not-found golfdata fjernet. Alle rike
  interaktive delkomponenter (drag-and-drop, wizard-modaler, agent-kjøring-paneler) er
  tailwind-only og gjenbrukt uendret — kun golfdata-chrome byttet til v2. Etter denne
  bølgen finnes kun **1 gjenværende golfdata-referanse i hele /admin**
  (`spillere/spillere-tabell.tsx` — utenfor denne bølgens scope, egen oppfølging).
  tsc 0 feil, fullt bygg grønt (inkl. sw.js-steget).

- 11. juli (Bølge A — PlayerHQ-detaljskjermer til v2, branch `claude/blissful-gates-763ac3`):
  **ALLE /portal-sider er nå golfdata-frie.** Rebygget på v2: utfordring-detalj, runde-detalj
  (Scorekort + SgKategorier), slag-registrering, loggfør runde, TrackMan-hub + sesjonsdetalj,
  baneguide banekart + hull-detalj (dispersion), test-detalj, FYS-plan-hub, talent-hub. Døde
  sider slettet (teknisk-plan-lista var redirect-skygget; tester-katalog×2 + scorekort
  foreldreløse). Siste golfdata-referanser fjernet fra ny-okt-wizard, coach-plan-detalj,
  6 meg-skjemafiler og error/not-found. NY LÅST REGEL: «?»-forklaringer (HjelpTips) på alle
  tall/faguttrykk — 6 nye hjelpetekster (trackman, dispersjon, spredningSigma, skjevhetBias,
  talentVurdering, utfordringScore). Knapp fikk submit-støtte; wrench i ikon-kartet.
  tsc 0 feil, fullt bygg grønt. Etter merge med main (SG slag-for-slag-pakken, se rad under):
  runde-detalj-v2 fikk main sine SG-buckets/kjede-status/sgSource-badges portert inn; nye
  hovedskjermer `/portal/runde/live` + `/portal/runde/logg` (main, v13/golfdata) står på
  bølge B/C-lista for v2-port. Gjenstår i bølge A-halen: shot-by-shot (rå tailwind),
  talent-undersider, ny-okt/coach-plans full v2-omkomponering, `/fullfor` v2-port.
- 10. juli (kveld) — **SG slag-for-slag-pakken (steg 1–7) levert og prod-verifisert.** Nye skjermer:
  `/portal/runde/live` (live-føring: kjede-UI, I HULL, lie-/avstands-chips, kladd m/ crash-recovery,
  hull-oversikt m/ delvis lagring, live SG-panel), `/portal/runde/logg` (etterregistrering m/ dato),
  `/portal/mal/runder/[id]/fullfor` (fullfør kjeden per hull — mismatch-blokkering, SG låses opp på
  alle/alle). Mockups godkjent i Claude Design (`ui_kits/v2/runde-logg*.jsx`) FØR bygging; ordbok-vasket.
  UpGame-import skriver nå HoleScore (aldri fabrikkerte slag); rundedetalj fikk SG-fordeling
  (kanon-etiketter, granulære buckets, kilde-badge, ærlig tomtilstand m/ CTA) + ærlig delvis-runde-
  header. Verifisert: prod-e2e (import, live 2 hull m/ straffe+bunker, reload-recovery, delvis
  lagring, fullfør kjeden 2/3→ærlig null→3/3 beregnet), divergensvakt motor==DB==UI som unit-test
  (pipeline.test.ts), 375px-sveip uten overflow. Gamle `/portal/mal/runder/[id]/slag` er nå
  «Avansert redigering» (legacy).

- 8. juli (opprydding Fase 4, bølge 4 — marketing + forelder, branch `opprydding/token-konvergens`):
  **SISTE bølge — hele appen har nå 3 gamle athletic-importer igjen, alle PulseDot på marketing
  (venter på gap #1 StatusDot).** `Pyramid` portet fra DS (data/) → golfdata/. Migrert:
  forelder/barn PyramidProgress → Pyramid (apex→base-kanon, andel av økter, verifisert m/ ærlig
  tomstate); forelder/okonomi + kommando KpiStrip/KpiCard → KpiTile-grid (verifisert visuelt);
  404/500 for marketing + forelder → Eyebrow + display-h1 + golfdata Button. Gap-register
  bølge 4: #11 (PulseDot ×3 venter på #1). tsc + eslint + hex-gate + build grønt, 342/342
  tester, Playwright-diff mot baseline uendret. Fase 4 er dermed KOMPLETT sånær som gap-fyllet —
  neste er gap-fyll-prompten til Claude Design og så Fase 5 (slett gammelt bibliotek + rydd
  globals.css).

- 8. juli (opprydding Fase 4, bølge 3 — /admin, branch `opprydding/token-konvergens`):
  **/admin er tom for gammel-athletic-importer.** `SegmentedTabs` portet fra DS (forms/) →
  golfdata/. Migrert: plan-detalj-fanene (`/admin/spillere/[id]/plan/[planId]`) TabBar →
  SegmentedTabs m/ tynn URL-synk-wrapper (plan-tabs.tsx); Uka-skjermen KpiRing → RingGauge
  (verifisert visuelt, kapasitetsring); varsler-loading gammel Skeleton → ui/skeleton;
  404/500-sidene AthleticHero → Eyebrow + display-h1 + golfdata Button. Gap-register bølge 3:
  ingen nye komponent-gap, 2 observasjoner (#9 SegmentedTabs mangler count-variant, #10
  onChange-typekollisjon løst med Omit i porten). tsc + eslint + hex-gate + build grønt,
  342/342 tester, Playwright-diff mot baseline uendret.

- 8. juli (opprydding Fase 4, bølge 2 — /portal, branch `opprydding/token-konvergens`):
  **/portal er tom for gammel-athletic-importer.** Nye porter fra Claude Design-prosjektet
  (DesignSync): `PercentileBar`, `NivaStige`, `Stepper` → golfdata/. Talent-hub rekomponert
  fra håndrullet SVG til golfdata: MasteryRing→RingGauge, PercentileGauge→PercentileBar,
  StreakTracker→Heatmap, LevelLadder→NivaStige, JourneyMap→Stepper (plan sa KategoriStige —
  semantisk feil mapping, dokumentert i gap-registeret #6), GoalProgress-gradient (utokenisert
  #8EBF00) → golfdata Progress. 404/500-sidene rekomponert fra AthleticHero til Eyebrow +
  display-h1 + golfdata Button. KpiCard→KpiTile (baneguide hull-detalj + meg/helse).
  Design-hake /portal/talent – → ~. Gap-register bølge 2: ingen nye komponent-gap, 3
  observasjoner (#6–8). Visuelt verifisert med TALENT-flagg + seedet testdata (screentest).
  tsc + eslint + hex-gate (2 filer forbedret, baseline låst) + build grønt, 342/342 tester.

- 8. juli (opprydding Fase 4, bølge 1 — src/components → golfdata, branch `opprydding/token-konvergens`):
  **Delte komponenter over på golfdata-kanon.** Nye porter fra det levende Claude Design-prosjektet
  (DesignSync): `MaanedKalender` (varme + piller m/ DnD) og `FilterPills` → `golfdata/`.
  Migrert: Kommando-kalenderen (`/kommando/kalender`) og gruppe-kalenderen (`/team-wang`) fra gamle
  MonthGrid/WeekGrid til MaanedKalender (piller) + TidsGrid; StatusPill→Tag (spiller-panel),
  RoleBadge/PeriodeTag→Tag-komposisjoner m/ aksefarge-tokens (team-kit), FilterPillBar→FilterPills
  (drill-library/søkemodal). GAP MELDT (ikke improvisert, beholdt m/ disable): PulseDot/PresenceDot/
  SeverityDot (DS mangler status-dot-primitiv), PyrDistBar (DS mangler aksefordelings-bar),
  YearPlanGantt (DS Periodeplan er L-fase-låst — mangler AK-periode-årsgantt), VisningsVelger mangler
  «år»-visning, Tag mangler warn-variant (fra Fase 3). Kommando-kalender verifisert visuelt (piller +
  i dag + «+N flere» på ekte bookinger). NB: /team-wang 500-er pga. pre-eksisterende DB-drift
  (group_schedules.maxParticipants mangler i DB) — flagget som egen oppgave, urelatert til bølgen.
  tsc + eslint + hex-gate + build grønt, 342/342 tester, Playwright-diff mot Fase 0-baseline uendret.

- 7. juli (GFGK treningsplanlegger, del 2 av firepart-samarbeidet): **Ny åpen GFGK Junior-side.**
  `/gfgk-junior` viser alle 4 GFGK-aldersgrupper (Mini/Basis/Utvikling/Elite) med fanevalg —
  ekte `GroupSchedule`-data, ingen personlig spillerinfo. Delte kalender-byggeklosser omdøpt fra
  `wang-kalender`→`gruppe-kalender` (var WANG-navngitt, men egentlig generisk — nå bekreftet
  gjenbrukt for GFGK). Ny `FlereGrupperKalender`-komponent for fanevalg mellom flere grupper på
  samme side. Domenene `wanggolffredrikstad` (→ `/team-wang`) og `gfgkjunior.no` (→ `/gfgk-junior`)
  kan pekes hit i Vercel når Anders bekrefter DNS-steget. Bygget isolert på
  `feature/gfgk-treningsplan`-worktree. tsc 0 feil, build grønt, 326/326 tester.

- 7. juli (WANG treningsplanlegger, prosjektforespørsel): **WANG-gruppe seedet + ny åpen side + VG-filter.** `Group`/`GroupSchedule` for WANG Toppidrett + 4 GFGK-grupper skrevet til DB (var kun definert i seed.ts, aldri kjørt); ny `training_periods`-tabell + `User.schoolYear`-felt lagt til additivt (`db execute`, ikke migrate/push — se gotchas.md). Ny offentlig side `/team-wang` (ingen innlogging, ingen personlig spillerdata) viser årshjul/måned/uke fra ekte `GroupSchedule`+`TrainingPeriod`-data via gjenbrukte `YearPlanGantt`/`MonthGrid`/`WeekGrid`. VG-trinn (VG1/VG2/VG3) lagt til som redigerbart felt på spiller (`/admin/spillere/[id]/rediger`) + filter/badge på gruppe-roster (`/admin/grupper/[id]`). Bygget isolert på `feature/wang-treningsplanlegger`-worktree. tsc 0 feil, build grønt, 326/326 tester.

- 6. juli (design-bølge D3): **9 PlayerHQ-skjermer løftet til v13-referanseanatomien** (golfdata-scope-wrapper `max-w-[460px]→md:860`, Eyebrow-komponent + display-h1 med italic-em): `/portal/coach/sporsmal` re-komponert fra gammel CLI-stil til Card-rader med status-Tag (Besvart/Åpent) og avatar-initialer; `/portal/coach` + `melding` + `ovelser` (Tag-filterchips) + `videoer` + `plans` konsistens-pass; `/portal/statistikk`-hub wrapper; `/portal/utfordringer` + `[id]` (detalj: Eyebrow/h1-hero, golfdata Button/Card/KpiTile — kun token/anatomi-løft, score-registrering trenger ekte redesign, meldt som gap). Design-haker satt til ~ (golfdata-kit-komposisjon per prompt.md-kontraktene gjenstår). tsc + eslint grønt.
- 6. juli (design-bølge D2): **4 AgencyOS-skjermer kalibrert til ui.tsx-fasitstandarden** (`/admin/analysere`, `/admin/runder`, `/admin/gjennomfore`, `/admin/workspace`): AgPage + AgPageHead-anatomi, hub-nav-kort re-komponert med Tailwind-tokens (gamle HubFrame/hubs.css med rå hex ute av disse rutene), runder-tabellen på AgTable/AgPlayerCell + KPI-kort fra `/admin/analyse`-fasiten, workspace-hero/tabs/KPI på tokens (AthleticButton ut). Design-haken satt til ~ (ikke ✓) fordi v13-kriteriet i rebaselinen måler mot golfdata-kit-komposisjon — samme nivå som søsterskjermene `/admin/analyse`/`/admin/okonomi` som selv står på –. tsc + eslint grønt.
- 25. juni (Bølge 2, ★-verifisering): **SG-Hub ★ verifisert — Flyt ✓.** Playwright 430px: hovedhub rendrer med ekte data (SG-pipeline +0,6, 11 runder, 12 TrackMan-økter, ENKEL/AVANSERT-toggle). Render-sveip av 6 undersider (benchmark, best-vs-now, equipment, yardage, conditions, strategy) — alle rendrer uten console-/runtime-feil og er navigerbare fra hub-en (→ Flyt ✓ på hovedhub). Undersidenes egne Funker/Data/Design-haker står fortsatt på ~/– i påvente av per-side data- og design-gate (ikke ★, deprioritert).
- 25. juni (Bølge 2, ★-verifisering): **Live-økt-løkka (brief → aktiv → oppsummering) e2e-verifisert — Funker-haken ✓.** Playwright 430px på ekte PLANNED V2-økt: brief rendrer (mål/fokus/drills), aktiv auto-starter (PLANNED→IN_PROGRESS), «Logg rep» → DrillLogV2 persistert, «Fullfør økt» → `completeSession` → oppsummering (reps/tid/drills KPI + CTA). Ingen runtime-feil (kun benign dev-eval-CSP-støy). Testøkt gjenopprettet til PLANNED etterpå (logg slettet, completedSummary = DbNull). Hakene Adresse/Flyt/Data/Funker → ✓ for alle tre. (iPad-bredde gjenstår — Mob/Desk/iPad fortsatt ✓✓–.)
- 25. juni (Bølge 1, post-lansering): **Maler-kort viser ekte SG-effekt.** Øvre-høyre-plassholderen «—» på Maler-fanen leser nå `PlanTemplate.effectivenessAvg` (snitt SG-Total-delta fra `PlanEffectiveness`) — tone-farget +/− når data finnes, ærlig «—» når ingen fullført plan har brukt malen ennå. Ingen oppdiktede prosenter.
- 25. juni (Bølge 1, post-lansering): **Workbench uke-navigasjon (FORRIGE/NESTE) koblet.** `?uke=N`-offset gjennom hele kjeden: `loadWorkbenchData(userId, weekOffset)` (uke-anker + ekte datotall + i-dag kun på inneværende uke), begge sider (spiller + coach) leser `parseWeekOffset`, og drag-drop/«+»/palette persisterer til den uka som faktisk vises via `weekRefDate(offset)` → `executeSessionMove`/`dateForDayIndex`. Tom navigert uke viser nå grid + navigasjon (ikke onboarding-blindvei). Bevis: 18 enhetstester (dato-matte/anker/parse), Playwright 1280 klikk-runde (Uke 26→27→26, `?uke=1`-toggle), gate MOVE_DRAG-persistering PASS, 244 tester + tsc + build grønt.
- 25. juni (lansering 20:00): **Workbench lanserings-hub ferdig.** Maler «Bruk» persisterer PlanTemplate-uke-1 til TrainingPlanSession+V2; V2-merge-bug fikset (`merge-week-sessions`); publish DRAFT→PENDING_PLAYER; design-gate 0 udokumenterte avvik (spiller uten coach-sidebar, ukenavigasjon-shell, Økt/Std wb-10-blokker). Gate-bevis: Playwright 430+1280, smoke PASS, 230 tester, build grønt.
