# Skjermer som ikke er utviklet ennå

**Sist oppdatert:** 2026-05-11

## Sammendrag

| Kategori | Trengs | Levert | Mangler | Dekning |
|---|---|---|---|---|
| CoachHQ | 42 | 24 | **18** | 57 % |
| PlayerHQ | 30 | 15 | **15** | 50 % |
| Auth + System | 9 | 9 | 0 | 100 % ✅ |
| Onboarding | 5 | 5 | 0 | 100 % ✅ |
| Foreldreportal | 7 | 7 | 0 | 100 % ✅ |
| Klubb-admin | 6 | 6 | 0 | 100 % ✅ |
| Edge cases | 6 | 6 | 0 | 100 % ✅ |
| Shared modaler | 28 | 1 | **27** | 4 % |
| Shared tverrgående | 25 | 6 | **19** | 24 % |
| Web (akgolf.no) | 30 | 4 | **26** | 13 % |
| Booking-flyt | 30 | 2 | **28** | 7 % |
| **TOTAL** | **218** | **85** | **133** | **39 %** |

**Vi mangler 133 enheter** for komplett dekning.

---

## CoachHQ — 18 manglende skjermer

Kritiske for daglig coach-bruk. Prioritert rekkefølge:

| Skjerm | URL | Hva det er |
|---|---|---|
| **360-profil** | `/admin/elever/:id` | Coachens hovedview av spiller (pyramide + tabs) |
| **Plan-builder** | `/admin/plans/new` | 6-step wizard for ny plan |
| **Plan-detalj** | `/admin/plans/:id` | Detalj av eksisterende plan |
| **Plan-edit** | `/admin/plans/:id/edit` | Rediger plan |
| **Plan-templates** | `/admin/plans/templates` | Mal-bibliotek |
| **Daglig brief** | `/admin/brief` | Morgenrapport for coach |
| **Facilities** | `/admin/facilities` | Live-status av baner/simulatorer |
| **Analytics-v2** | `/admin/analytics/v2` | Stallen samlet |
| **Audit** | `/admin/audit` | Revisjonslogg |
| **Kalender** | `/admin/calendar` | Måneds/uke-kalender |
| **Kapasitet** | `/admin/capacity` | Coach-belegg |
| **Lag-snitt** | `/admin/lag-snitt` | Sammenligning |
| **Meldinger** | `/admin/messages` | Innboks |
| **Oppfolgingsko** | `/admin/queue` | Action-kø |
| **Periodisering-agent** | `/admin/agents/periodisering` | Diff-view (i redesign-arketype-e) |
| **Reports** | `/admin/reports` | Genererte rapporter |
| **Spiller-detalj (light)** | `/admin/elever/:id/light` | Hurtigvisning |
| **Talent** | `/admin/talent` | A1-A5 pipeline |

---

## PlayerHQ — 15 manglende skjermer

| Skjerm | URL | Hva det er |
|---|---|---|
| **Baner** | `/portal/mal/baner` | Kart + liste over banar |
| **Coach-detalj** | `/portal/coach` | Player ser sin coach |
| **Coach-message-compose** | `/portal/coach/message` | Skriv melding |
| **Coach-notes** | `/portal/coach/notes` | Notatfeed |
| **Coaching-detail** | `/portal/coach/plans/:id` | Plan-detalj fra player-side |
| **Coaching-planer** | `/portal/coach/plans` | Liste over planer |
| **Mal-detalj** | `/portal/mal/:id` | HCP-trend detail |
| **Mal-leaderboard** | `/portal/mal/leaderboard` | Pro-låst |
| **Notater-detalj** | `/portal/coach/notes/:id` | Åpen notat-tråd |
| **Ny økt-wizard** | `/portal/sessions/new` | 6-step wizard |
| **Onskeligokt** | `/portal/coach/request` | Be om økt |
| **Test-detalj** | `/portal/tren/tester/:id` | Last vs best |
| **TrackMan-analyse** | `/portal/mal/trackman/analyse` | Pro-låst |
| **Tren-kalender** | `/portal/tren/kalender` | Måneds/uke-view |
| **Treningsdetalj** | `/portal/sessions/:id` | Post-økt detalj |

Pluss **Treningsplan** (`/portal/tren/plan`) hvis ikke dekket i Coaching-planer ovenfor.

---

## Shared Modaler — 27 manglende

Bare `live-intro` og `avatar-upload` levert. Mangler:

### Plan-relaterte (5)
- **NewPlanModal** — Coach lager ny plan (4-step wizard)
- **EditPlanModal** — Rediger eksisterende plan
- **PlanApprovalModal** — Spiller godkjenner coach-plan
- **PlanShareModal** — Coach deler plan med gruppe
- **PlanActionDetailModal** — Agent-anbefaling detalj
- **TemplateSelectorModal** — Velg plan-mal
- **AIPlanGeneratorModal** — AI genererer plan

### Live Session (3 av 4)
- **LiveActiveModal** — Screen 2 (rep-logging)
- **LiveBetweenModal** — Screen 3 (between-exercise)
- **LiveSummaryModal** — Screen 4 (økt-oppsummering)

### Booking (3)
- **BookSessionModal** — Velg dato/tid/fasilitet
- **RescheduleBookingModal** — Flytt booking
- **FacilityDetailModal** — Side-panel detalj
- **BookingConfirmationModal** — Endelig bekreftelse

### Agent/Actions (2)
- **BulkApproveModal** — Multi-godkjenning
- **AgentFeedbackModal** — Coach gir feedback

### Round/Analysis (4)
- **RoundDetailModal** — Scorecard + SG
- **RoundInsightModal** — AI insight post-runde
- **TrackManImportModal** — CSV / OCR
- **ComparisonModal** — Egne vs peer

### Challenges (3)
- **DrillChallengeModal** — Lag eller bli med
- **ChallengeDetailModal** — Leaderboard
- **LeaderboardModal** — Friends/club/global

### Messages/Notifications (2)
- **MessageDetailModal** — Tråd-utvidelse
- **NotificationCenterModal** — Inbox

### Tier/Payment (2)
- **PaymentModal** — Tier-oppgradering (Stripe)
- **VideoUploadModal** — Swing-video

---

## Shared Tverrgående — 19 manglende

Levert: 6 (agent-pipeline-overview, periodiserings-agent, design-tokens, cbac-matrise, tilgangskontroll, innstillings-layout). Mangler:

| Flate | Hva det er |
|---|---|
| **Confirm-dialogs** | 5+ varianter (delete, save, etc.) |
| **Datakilder-matrise** | API endpoints per skjerm |
| **Eksport-funksjoner** | CSV/JSON/PDF |
| **Empty-states** | Katalog per arketype |
| **Error-modal-katalog** | 8+ error-states |
| **Facility-manager** | 5-view dashboard |
| **Import-assistent** | 3-step wizard |
| **Inline-editing** | 4 felt-typer × 4 states |
| **Loading-skeletons** | Skeleton-bibliotek |
| **Mobile-gestures** | Swipe, long-press, etc. |
| **Modal-katalog** | Oversikt over 25+ modaler |
| **Notifikasjons-taxonomy** | 6 notif-typer |
| **Onboarding-full** | 4-step welcome flow |
| **Plan-aksjon-typer** | 10 action-types |
| **Sidebar-patterns** | Player vs Coach sammenligning |
| **Signal-typer** | 15 signaler |
| **Toast-system** | 4 toast-varianter |
| **Topbar-breadcrumbs** | Header-mønstre |
| **Varslingssentral** | Inbox/varsler |

---

## Web (akgolf.no) — 26 manglende

Levert: forside + 3 andre (om, coaches, coach-profil, tjenester). Mangler:

| Side | URL |
|---|---|
| **Anlegg** | `/anlegg` |
| **Anlegg-detalj** | `/anlegg/:slug` |
| **Blogg** | `/blogg` |
| **Blogg-artikkel** | `/blogg/:slug` |
| **Cases** | `/cases` |
| **Case-detalj** | `/cases/:slug` |
| **Cookies** | `/cookies` |
| **FAQ** | `/faq` |
| **Footer-mega** | (komponent) |
| **For-bedrifter** | `/for-bedrifter` |
| **For-klubber** | `/for-klubber` |
| **Header-nav** | (komponent) |
| **Jobb** | `/jobb` |
| **Junior** | `/junior` |
| **Kontakt** | `/kontakt` |
| **Newsletter** | `/newsletter` |
| **Personvern** | `/personvern` |
| **Priser** | `/priser` |
| **Sammenlign** | `/sammenlign` |
| **Sponsorer** | `/sponsorer` |
| **Talent** | `/talent` |
| **Tjeneste-detalj** | `/tjenester/:slug` |
| **Vilkår** | `/vilkar` |
| **404** | `/404` |
| **500** | `/500` |

---

## Booking-flyt — 28 manglende

Levert: 2 (anlegg + ett til). Mangler hele flyten:

### Hovedflyt (~17 sider)
| Side | URL |
|---|---|
| **Forside** | `/` |
| **Coach-velger** | `/coaches` |
| **Coach-detalj** | `/coaches/:slug` |
| **Anlegg-detalj** | `/anlegg/:slug` |
| **Kalender (måned)** | `/book/:id/kalender` |
| **Kalender (uke)** | `/book/:id/uke` |
| **Tids-velger** | `/book/:id/tider` |
| **Pakke-velger** | `/book/:id/pakke` |
| **Tillegg** | `/book/:id/tillegg` |
| **Kunde (eksisterende)** | `/book/:id/kunde` |
| **Kunde (ny)** | `/book/:id/ny-kunde` |
| **Spiller-info** | `/book/:id/spiller` |
| **Sammendrag** | `/book/:id/sammendrag` |
| **Betaling (Stripe)** | `/book/:id/betaling` |
| **Betaling (Vipps)** | `/book/:id/betaling-vipps` |
| **Bekreftelse** | `/book/:id/bekreftelse` |
| **Feil-betaling** | `/book/:id/feil` |

### Min side (4 sider)
| Side | URL |
|---|---|
| **Min booking-oversikt** | `/min-side/bookinger` |
| **Min booking-detalj** | `/min-side/bookinger/:id` |
| **Fakturaer** | `/min-side/fakturaer` |
| **Faktura-detalj** | `/min-side/fakturaer/:id` |
| **Klippekort** | `/min-side/klippekort` |

### Modaler/e-post (6 stk)
- Rabattkode-modal
- Avbestill-modal
- Endre-booking-modal
- Login-popup
- Email-bekreftelse
- Email-påminnelse

---

## Anbefalt prioritering

### MVP-blokk 1 (kritisk for å kjøre CoachHQ i prod)
17 skjermer: alle 18 CoachHQ-mangler unntatt Periodiserings-agent (under redesign).

### MVP-blokk 2 (kritisk for PlayerHQ i prod)
15 PlayerHQ-mangler.

### MVP-blokk 3 (modaler kjernen)
10 kritiske modaler: NewPlan, EditPlan, BookSession, BulkApprove, LogRound (PlayerHQ-add), PaymentModal, LiveActive/Between/Summary, TemplateSelector.

### MVP-blokk 4 (Live + Agent — under redesign)
10 skjermer i `redesign-arketype-e/` — venter på Claude Design.

### Marketing (kan vente)
26 web + 28 booking. Krever ikke samme designkvalitet — kan bygges som mal-baserte sider direkte i React.

### Polish (kan vente)
19 tverrgående katalog-flater. Disse er dokumentasjons-stil, ikke produksjons-skjermer.

---

## Total status

```
Levert + produksjons-klart:    85 enheter
Mangler (krever Claude Design): ~57 (CoachHQ + PlayerHQ + modaler + agent-redesign)
Mangler (kan bygges direkte):   ~76 (web + booking + tverrgående)
TOTAL TRENGS:                   218
```

**Vi har 39 % dekning** av produkt-funksjonalitet. For å komme til MVP-nivå for CoachHQ + PlayerHQ trenger vi ~52 nye design-leveranser.
