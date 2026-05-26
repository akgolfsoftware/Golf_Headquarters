# AK Golf Platform — Wireframe Build List

Klassifisert 2026-05-10 fra inventory-filene.

## Sammendrag

| Metrikk | Verdi |
|---|---|
| **Totalt unike skjermer** | 146 |
| **READY** (klar for wireframe) | 94 (64%) |
| **PARTIAL** (mangler kritisk detalj) | 28 (19%) |
| **GAP** (kun navn) | 24 (16%) |

### READY per arketype

| Arketype | Antall | Beskrivelse |
|---|---|---|
| **A — Dashboard** | 5 | KPI-kort, moduler, feed |
| **B — List + filter** | 18 | Rader, status-pills, søk, filtre |
| **C — Detail + tabs** | 15 | Header + tabs + tab-innhold |
| **D — Wizard / Form** | 12 | Multi-step eller enkelt-skjema |
| **E — Fullscreen / Live** | 8 | Tapper-mode, fullscreen, modaler |
| **F — Settings / Profile** | 19 | Innstillinger, preferanser, profil |
| **G — Other** | 17 | Spesialvisninger (eksport, taksonomi-displays, mm.) |
| **SUM READY** | **94** | |

---

## CoachHQ (37 skjermer)

| # | Skjerm | URL | Arketype | Status | Modul | Notater |
|---|---|---|---|---|---|---|
| 1 | Hub Dashboard | /admin/hub | A | READY | I dag | KPI + moduler + feed |
| 2 | Daglig Brief | /admin/brief | A | GAP | I dag | Personaliserings-motor uspes |
| 3 | Treningsplaner (liste) | /admin/plans | B | READY | Planlegg | List + filter |
| 4 | Plan-detalj | /admin/plans/:id | C | READY | Planlegg | Tabs: Øvelser, Notater, Rapport |
| 5 | Ny plan-wizard | /admin/plans/new | D | READY | Planlegg | 6 steg, alle handlinger spesifisert |
| 6 | Plan-maler | /admin/plans/templates | B | READY | Planlegg | Template-bibliotek |
| 7 | Kalender | /admin/calendar | G | READY | Planlegg | Måneds/uke-visning |
| 8 | Kapasitet | /admin/capacity | G | PARTIAL | Planlegg | Hovedview ok, detalj mangler |
| 9 | Økter | /admin/sessions | B | READY | Planlegg | Sesjon-liste m. tier-gating |
| 10 | Elever (spillerliste) | /admin/elever | B | READY | Følg opp | Filter, status-pills, KPI |
| 11 | 360-profil | /admin/elever/:id | C | READY | Følg opp | Tabs: Basis, Plan, Sessions, Tester, TrackMan |
| 12 | Coaching Board | /admin/board | G | READY | Følg opp | Kanban-lignende flyt |
| 13 | Godkjenninger | /admin/approvals | B | READY | Følg opp | Agent-foreslåtte PlanActions |
| 14 | Oppfølgingskø | /admin/queue | B | GAP | Følg opp | Kun navn referert |
| 15 | Talent | /admin/talent | C | READY | Analyse | Talent-pipeline detail |
| 16 | Analytics | /admin/analytics | A | READY | Analyse | Performance dashboard |
| 17 | Rapporter | /admin/reports | B | READY | Analyse | Eksporterbare rapporter |
| 18 | Turneringer | /admin/tournaments | B | READY | Analyse | Turneringsliste + resultat |
| 19 | Bookinger | /admin/bookings | B | READY | Drift | Booking-administrasjon |
| 20 | Tilgjengelighet | /admin/availability | F | READY | Drift | Coach-kalender-styring |
| 21 | Tjenester | /admin/services | B | READY | Drift | Service-types CRUD |
| 22 | Økonomi | /admin/finance | A | READY | Drift | Inntekt + utestående |
| 23 | Fasiliteter | /admin/facilities | A | READY | Drift | Facility Manager dashboard (5 views) |
| 24 | Lokasjoner | /admin/locations | B | READY | Drift | Locations CRUD |
| 25 | Team | /admin/team | B | READY | Verktøy | Coach-team-administrasjon |
| 26 | Meldinger | /admin/messages | B | PARTIAL | Verktøy | Liste ok, compose/detalj uklart |
| 27 | E-postmaler | /admin/email-templates | B | READY | Verktøy | Mal-bibliotek |
| 28 | Agenter | /admin/agents | G | READY | Verktøy | Agent-pipeline-visning |
| 29 | Teknisk Plan | /admin/teknisk-plan | C | PARTIAL | Verktøy | Hovedview ok, sub-skjermer mangler |
| 30 | Grupper | /admin/groups | B | READY | Verktøy | Gruppe-administrasjon |
| 31 | Coach-profil | /admin/profile | F | READY | Settings | Edit profil + credentials |
| 32 | Bruker-innstillinger | /admin/settings | F | READY | Settings | Generelle preferanser |
| 33 | Sikkerhet | /admin/settings/security | F | READY | Settings | 2FA, passord, SSO |
| 34 | API-nøkler | /admin/settings/api | F | READY | Settings | Key management |
| 35 | Revisjonslogg | /admin/audit | B | READY | Settings | Audit log m. filter |
| 36 | Sesjon-opptak | /admin/recording | E | GAP | Sesjon | Deepgram pipeline UI uspes |
| 37 | Coach-agent chat | /admin/elever/:id/ai | E | GAP | Følg opp | AI chat i 360-profil uspes |

**CoachHQ status:** 28 READY, 4 PARTIAL, 5 GAP

---

## PlayerHQ (22 skjermer)

| # | Skjerm | URL | Arketype | Status | Tab | Tier | Notater |
|---|---|---|---|---|---|---|---|
| 1 | Hjem-dashboard | /portal/hjem | A | READY | Hjem | Alle | SG-radar, pyramide, neste økt |
| 2 | Treningsplan | /portal/tren/plan | C | READY | Tren | Pro | Tabs: Aktiv, Historisk |
| 3 | Kalender | /portal/tren/kalender | G | READY | Tren | Alle | Måneds/uke-view |
| 4 | Øvelser | /portal/tren/ovelser | B | READY | Tren | Alle | Bibliotek + filter |
| 5 | Tester | /portal/tren/tester | B | READY | Tren | Alle | Test-bibliotek |
| 6 | Test-detalj | /portal/tren/tester/:id | C | READY | Tren | Alle | Tabs: Beskrivelse, Resultater |
| 7 | Ny økt-wizard | /portal/sessions/new | D | READY | Tren | Alle | 6 steg, alle handlinger |
| 8 | Live Session | /portal/live/:id | E | READY | Tren | Alle | Fullscreen tapper-mode |
| 9 | Mål-oversikt | /portal/mal | A | READY | Mål | Alle | Goals + tier-gating |
| 10 | Runder | /portal/mal/runder | B | READY | Mål | Alle | Round history + SG |
| 11 | TrackMan | /portal/mal/trackman | B | READY | Mål | Pro | TrackMan-økter |
| 12 | Baner | /portal/mal/baner | B | READY | Mål | Alle | Course library |
| 13 | Coach (tier-gatet) | /portal/coach | C | READY | Coach | Pro/Elite | Coach-info + meldinger |
| 14 | Send melding | /portal/coach/message | D | PARTIAL | Coach | Pro/Elite | Compose ok, historikk uklar |
| 15 | Coaching-planer | /portal/coach/plans | B | READY | Coach | Pro/Elite | Aktive planer |
| 16 | Notater fra coach | /portal/coach/notes | B | READY | Coach | Pro/Elite | Coach-notater |
| 17 | Meg-profil | /portal/meg | F | READY | Meg | Alle | Edit profil + tier |
| 18 | Helse-innstillinger | /portal/meg/helse | F | READY | Meg | Alle | Helsedata + integrasjoner |
| 19 | Notifikasjon-innstillinger | /portal/meg/notif | F | PARTIAL | Meg | Alle | Liste ok, toggles uklare |
| 20 | Abonnement | /portal/meg/sub | F | READY | Meg | Alle | Tier display + oppgrader |
| 21 | Hjelp & Support | /portal/meg/help | G | PARTIAL | Meg | Alle | Topics ok, detalj uklart |
| 22 | Leaderboard | /portal/mal/leaderboard | B | PARTIAL | Mål | Pro/Elite | Live-feed delvis spes |

**PlayerHQ status:** 17 READY, 4 PARTIAL, 1 GAP

---

## Tverrgående / shared (25 hovedflater fra cross-cutting)

| # | Skjerm | Arketype | Status | Område | Notater |
|---|---|---|---|---|---|
| 1 | Agent-pipeline-visning | E | READY | Agents | 15 signal-typer, 6 skills, 5 agenter |
| 2 | Periodiserings-agent UI | E | READY | Agents | 4 lag, JSON-struktur spes |
| 3 | Notifikasjons-taxonomy | G | READY | System | 6 typer, 10+ maler |
| 4 | Modal-katalog | G | READY | System | 25+ modal-varianter |
| 5 | Innstillings-flater | F | READY | Settings | Layout + alle settings-grupper |
| 6 | Onboarding-flow | D | READY | Auth | 4-step welcome wizard |
| 7 | Facility Manager dashboard | A | READY | Admin | 5-view dashboard |
| 8 | CBAC-matrise | G | READY | System | 6 roller, 43+ capabilities |
| 9 | Login | D | READY | Auth | Standard login-flow |
| 10 | Signup | D | READY | Auth | Registreringsflow |
| 11 | Forgot password | D | READY | Auth | Reset-flow |
| 12 | SSO-setup | D | PARTIAL | Auth | Setup wizard delvis |
| 13 | 2FA-setup | D | READY | Auth | 2FA wizard |
| 14 | Datakilder-matrise | G | READY | System | API endpoints per skjerm |
| 15 | Signal-typer-display | G | READY | System | 15 signaler m. definisjoner |
| 16 | Plan-aksjon-typer | G | READY | System | 10 action types |
| 17 | Designsystem-tokens | G | READY | System | Colors, spacing, radius |
| 18 | Tilgangskontroll-UI | G | PARTIAL | System | CBAC matrise delvis |
| 19 | Varslingssentral / Inbox | B | PARTIAL | System | Liste ok, detalj uklart |
| 20 | Import-assistenter | D | PARTIAL | System | Wizards delvis |
| 21 | Error-modaler | G | READY | System | 8+ error-states |
| 22 | Loading-states | G | READY | System | Skeleton screens |
| 23 | Bekreftelses-dialogs | G | READY | System | 5+ confirm-typer |
| 24 | Inline-editing | G | PARTIAL | System | Basic edits ok, komplekse uklart |
| 25 | Eksport-funksjoner | G | READY | System | CSV/JSON/PDF |

**Tverrgående status:** 18 READY, 6 PARTIAL, 0 GAP

---

## Gap-bunke (krever spec før wireframe)

24 skjermer. Sortert etter prioritet:

| # | Skjerm | Hva mangler | Prioritet |
|---|---|---|---|
| 1 | Coach-agent chat (CoachHQ) | Hele AI-chat-interaksjon: input, history, mode-toggle | HØY |
| 2 | Sesjon-opptak (CoachHQ) | Deepgram + Claude pipeline UI, opptak-kontroll, transkripsjon-visning | HØY |
| 3 | Daglig Brief (CoachHQ) | Personaliseringsmotor — hva vises, hvilken rekkefølge, format | HØY |
| 4 | Auto-charge payment flow | Subscription renewal-flyt, retry-logikk | MED |
| 5 | Signal-til-handling-mapping | Visuell signal → action-flyt for coach | MED |
| 6 | Oppfølgingskø (CoachHQ) | Hele konseptet — hva er en kø-oppføring, hvilke handlinger | MED |
| 7 | Auto-belastning | Auto-charge-flyt | LAV |
| 8 | Google Calendar sync UI | Sync-status, mapping, konfliktløsning | LAV |
| 9 | PlayerHQ-integrering | Cross-app data-flyt-UI | LAV |
| 10 | Pushvarslinger | Settings, history, opt-in flow | LAV |
| 11–24 | Mindre gap | Detaljer på partial-skjermer | LAV |

**Settings-flater og empty/error states har lavere gap-rate enn forventet** — cross-cutting-inventoryen avdekket at modal-katalog og notif-taxonomy faktisk er ganske godt dokumentert.

---

## Anbefalt batch-rekkefølge

**Batch 1 — Dashboard (5 skjermer):**
Hub, Hjem-dashboard, Mål-oversikt, Analytics, Økonomi, Fasiliteter (+ FacMan dash) → tester at arketype-A-templaten holder

**Batch 2 — List + filter (18 skjermer):**
Spillerlister, plan-lister, booking-lister, alle B-skjermer på begge sider

**Batch 3 — Detail + tabs (15 skjermer):**
360-profil, plan-detalj, øvelse-detalj, etc.

**Batch 4 — Wizard / Form (12 skjermer):**
Ny plan-wizard, ny økt-wizard, auth-flows, onboarding

**Batch 5 — Fullscreen / Live (8 skjermer):**
Live Session, agent-pipeline, modal-katalog

**Batch 6 — Settings / Profile (19 skjermer):**
Alle innstillinger på begge sider

**Batch 7 — Other (17 skjermer):**
Eksport, taksonomy-displays, kalendere, etc.

**Total:** 94 READY-skjermer i 7 batches.
