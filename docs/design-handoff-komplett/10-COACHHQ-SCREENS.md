# 10 — CoachHQ Screens

Komplett liste av alle CoachHQ-skjermer som må bygges i prototypen.

---

## STRUKTUR (6 hoveddeler)

### 1. AUTH (samme som PlayerHQ)
- Login
- Glemt passord
- Coach-onboarding wizard (4 steg)
- Klubb-onboarding wizard (5 steg)

### 2. OVERSIKT
- `/admin` — root redirect til `/admin/agencyos`
- `/admin/agencyos` — AgencyOS hjem (5 tabs)
  - I dag-tab
  - Uka-tab
  - Spillere-tab
  - Økonomi-tab
  - Caddie-tab
- `/admin/agencyos/uka` — uke-detalj
- `/admin/agencyos/spillere` — spiller-liste
- `/admin/agencyos/okonomi` — økonomi-detalj
- `/admin/agencyos/caddie` — Caddie-chat
- `/admin/agencyos/caddie/aktivitet` — Caddie-aktivitetslogg
- `/admin/brief` — Daglig brief (AI-generert)
- `/admin/board` — Coaching-board
- `/admin/oppfolging` — Oppfølging-pipeline
- `/admin/queue` — Oppgave-kø
- `/admin/workspace` — Workspace-hub
- `/admin/workspace/tildelt-meg` — Tildelt meg
- `/admin/workspace/oppgaver` — Oppgaver
- `/admin/workspace/oppgaver/[id]` — Oppgave-detalj
- `/admin/workspace/prosjekter` — Prosjekter
- `/admin/workspace/notion` — Notion-sync
- `/admin/innboks` — Innboks
- `/admin/kommunikasjon` — Kommunikasjon-hub

### 3. STALL (spillere + grupper)
- `/admin/stall` — Stall-oversikt (HubFrame)
- `/admin/spillere` — alle spillere (kort/tabell/tavle)
- `/admin/spillere/ny` — Ny spiller wizard
- `/admin/spillere/[id]` — Spiller-detalj (DetailShell)
- `/admin/spillere/[id]/profil` — Spiller-profil-tab
- `/admin/spillere/[id]/rediger` — Rediger spiller
- `/admin/spillere/[id]/tester` — Spiller-tester
- `/admin/spillere/[id]/tildel-test` — Tildel test
- `/admin/spillere/[id]/plan/[planId]` — Spiller-plan-detalj
- `/admin/grupper` — Grupper
- `/admin/grupper/[id]` — Gruppe-detalj
- `/admin/talent` — Talent-hub
- `/admin/talent/discovery` — Talent-discovery
- `/admin/talent/radar` — Talent-radar
- `/admin/talent/radar/[playerId]` — Radar for spiller
- `/admin/talent/[playerId]` — Talent-detalj
- `/admin/talent/kohort` — Kohort
- `/admin/talent/region` — Region
- `/admin/talent/ressurser` — Talent-ressurser
- `/admin/talent/sammenligning` — Talent-sammenligning
- `/admin/talent/wagr-benchmark` — WAGR-benchmark
- `/admin/talent/wagr-import` — WAGR-import

### 4. PLANLEGGE
- `/admin/planlegge` — Plan-sentral (HubFrame)
- `/admin/plans` — Alle planer
- `/admin/plans/new` — Ny plan (AI-wizard)
- `/admin/plans/[planId]` — Plan-detalj
- `/admin/plans/templates` — Plan-maler
- `/admin/plans/templates/ny` — Ny plan-mal
- `/admin/plans/templates/[id]/rediger` — Rediger plan-mal
- `/admin/plans/templates/[id]/effectiveness` — Mal-effekt
- `/admin/teknisk-plan` — Teknisk plan-oversikt
- `/admin/teknisk-plan/[spillerId]` — Teknisk plan for spiller
- `/admin/drills` — Drill-bibliotek
- `/admin/drills/[id]` — Drill-detalj
- `/admin/drills/[id]/rediger` — Rediger drill
- `/admin/tournaments` — Turneringer
- `/admin/tournaments/ny` — Ny turnering
- `/admin/tournaments/[id]` — Turnerings-detalj
- `/admin/okter` — Økter
- `/admin/videoer` — Videoer
- `/admin/recording` — Opptak

### 5. GJENNOMFØRE
- `/admin/gjennomfore` — Daglig drift (HubFrame)
- `/admin/gjennomfore/okter/[id]` — Økt-detalj
- `/admin/kalender` — Kalender
- `/admin/kalender/uke` — Uke-visning
- `/admin/kalender/maned` — Måned-visning
- `/admin/bookinger` — Alle bookinger
- `/admin/bookinger/ny` — Ny booking
- `/admin/anlegg` — Anlegg
- `/admin/anlegg/[id]` — Anleggs-detalj
- `/admin/availability` — Tilgjengelighet
- `/admin/kapasitet` — Kapasitet
- `/admin/services` — Tjenester (priser)
- `/admin/trackman` — TrackMan-sesjoner

### 6. INNSIKT
- `/admin/analysere` — Innsikt-hub (HubFrame)
- `/admin/lag-snitt` — Lag-snitt
- `/admin/tester` — Tester på tvers
- `/admin/tester/[id]` — Test-detalj
- `/admin/tester/tildel/[spillerId]` — Tildel test
- `/admin/tester/foreslatte` — Foreslåtte tester (coach-godkjenning)
- `/admin/godkjenninger` — Godkjenninger
- `/admin/godkjenninger/[id]` — Godkjenning-detalj
- `/admin/foresporsler` — Økt-forespørsler
- `/admin/reports` — Rapporter
- `/admin/runder` — Runder
- `/admin/tilstander` — Tilstander (skader, sykdom)
- `/admin/finance` — Finansiell oversikt

### 7. ADMIN (settings + organisasjon)
- `/admin/organisasjon` — Organisasjon-hub (HubFrame)
- `/admin/klubb/innstillinger` — Klubb-innstillinger
- `/admin/integrasjoner` — Tilkoblede tjenester
- `/admin/settings` — Innstillinger-hub
- `/admin/settings/api` — API-nøkler
- `/admin/settings/calendar` — Kalender-sync
- `/admin/settings/security` — Sikkerhet
- `/admin/settings/tilgang` — Tilgang
- `/admin/team` — Team
- `/admin/team/inviter` — Inviter team-medlem
- `/admin/audit-log` — Audit-log
- `/admin/audit-log/[id]` — Audit-detalj
- `/admin/agents` — AI-agenter (admin)
- `/admin/agents/[agentId]` — Agent-detalj
- `/admin/email-templates` — E-postmaler
- `/admin/email-templates/[id]/rediger` — Rediger mal
- `/admin/profile` — Min profil
- `/admin/reach` — Reach
- `/admin/hjelp` — Hjelp

### 8. COACH WORKBENCH (ny — fra Sprint 2)
- `/admin/coach-workbench?modus=individuelt&spiller=oyvind-rohjan` — Individuelt
- `/admin/coach-workbench?modus=gruppe&gruppe=gfgk-elite` — Gruppe
- 5 tabs per spiller: I dag · Plan · Analyse · Notater · Kommunikasjon

---

## SPESIELLE MODI

### Live-økt (coach-perspektiv)
- `/admin/live/[sessionId]/brief` — Pre-økt brief (coach)
- `/admin/live/[sessionId]/active` — Live-økt (coach)
- `/admin/live/[sessionId]/summary` — Post-økt summary (coach)

(Disse er duplikater av PlayerHQ-versjonene men med coach-controls)

---

## MODALER (CoachHQ-spesifikke)

- Ny gruppe-modal (fra Grupper)
- Tildel test-modal (fra Spiller-detalj)
- Send melding-modal (fra Spiller)
- Generer plan-modal (AI)
- Ny notat-modal (fra Coach Workbench)
- Ny booking-modal
- Inviter team-modal
- AI plan-forslag-modal (vis-eller-avvis)
- Approval-modal (godkjenn forslag)
- Caddie-chat-modal (inline på flere sider)
- Spiller-sammenlign-modal
- Print/eksport-modal (for rapporter)

---

## TOTALER

| Type | Antall |
|---|---|
| Toppnivå hubs | 6 |
| Sub-sider | ~110 |
| Coach Workbench-modi | 2 |
| Modaler | 12 |
| Live-økt-coach | 3 |
| **TOTALT CoachHQ-skjermer** | **~133** |

---

## NAVIGASJON-FLYT

### Desktop (primær for coach)
1. **Sidebar** (sticky 256px) — 6 toppnivå-seksjoner med sub-meny
2. **TopBar** med:
   - Klubb-velger (hvis multi-klubb)
   - Søk (⌘K)
   - Varsler-bell
   - Profile-menu
3. **⌘K** = global søk
4. **URL-state** for delbar lenke

### Mobile (sekundær — golfbane-bruk)
1. **Hamburger** → sheet med sidebar-strukturen
2. **Topbar** kompakt
3. Coach-modus optimalisert for kjapp tilgang:
   - "Min uke" som første tab
   - "Send melding" som primary action
   - "Bekreft booking" som quick-action

### iPad
- Sticky sidebar (smal) på landscape
- Hamburger på portrait
- Best for plan-bygger med drag-drop

---

## DUPLIKAT-RUTER (skal IKKE bygges — har redirects)

Disse er fjernet fra kode (Sprint 5-spors beta-prep) og redirected:
- `/admin/elever/*` → `/admin/spillere/*`
- `/admin/groups/*` → `/admin/grupper/*`
- `/admin/calendar/*` → `/admin/kalender/*`
- `/admin/bookings/*` → `/admin/bookinger/*`
- `/admin/capacity` → `/admin/kapasitet`
- `/admin/locations`, `/admin/facilities/*` → `/admin/anlegg/*`
- `/admin/analyse`, `/admin/analytics` → `/admin/analysere`
- `/admin/approvals/*` → `/admin/godkjenninger/*`
- `/admin/audit` → `/admin/audit-log`
- `/admin/plan-templates/*` → `/admin/plans/templates/*`
- `/admin/notion-prosjekter`, `/admin/notion-oppgaver` → `/admin/workspace/*`
- `/admin/messages` → `/admin/innboks`
- `/admin/meg` → `/admin/profile`
