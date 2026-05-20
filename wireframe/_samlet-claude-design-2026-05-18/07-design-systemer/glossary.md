# AK Golf Platform — Wireframe Glossary

Kanonisk terminologi som SKAL brukes konsistent på tvers av alle wireframes.

## Domene-vokabular

| Bruk dette | IKKE | Notat |
|---|---|---|
| **taper-fase** | taper-uke, taper-prep, peak-prep | Periode før peak |
| **pyramide-adherence** | pyramide-treff, pyramide-match | % som matcher allokering |
| **pyramide-allokering** | pyramide-fordeling | Hvor mye tid per område |
| **Spiller** | Elev (i CoachHQ) | Konsistent på tvers. «Elever» som modulnavn er OK fordi det er etablert. Elementer/data sier «spiller». |
| **Coach** | Trener, instruktør | «Coach» dekker alle. «Instruktør» kun ved rolle-kontekst. |
| **Treningsplan** | Plan (alone), trenings-plan | Full ord, ikke shortform alene |
| **Treningsøkt** | Sesjon, økt | «Økt» OK som shortform. «Sesjon» KUN for live-coaching-flyt. |
| **Påmelding** | Tilmelding, melding på | Til turnering / økt |
| **Booking** | Reservasjon, time | Booking er etablert begrep |
| **Lokasjon** | Anlegg, sted | Parent-entity (GFGK, Mulligan) |
| **Fasilitet** | Lokale, område | Child-entity (Performance Studio, Putting Green) |
| **HCP** | Handicap (i kort tekst) | Skrives «HCP 7,4» i tabeller. «Handicap» kun i lange tekster. |
| **Periodisering** | Plan-syklus | Sesong-strukturen |
| **Plan-aksjon** | Forslag, Action | Det agenter genererer |
| **Godkjenning** | Approval, bekreftelse | Inbox-element |

## Tier-navn (PlayerHQ)

- **Gratis** (ikke «Free»)
- **Pro** (ikke «Premium»)
- **Elite** (ikke «Premium Plus»)

## Pyramide-områder (rekkefølge nederst → øverst)

1. **FYS** (Fysisk)
2. **TEK** (Teknisk — sving, grep)
3. **SLAG** (Slag — korthold, pitch, putt)
4. **SPILL** (Spill — banetilpasning, bunker, rough)
5. **TURN** (Turnering — konkurranseerfaring)

## SG-områder (Strokes Gained)

- **OTT** (Off the Tee)
- **APP** (Approach)
- **ARG** (Around the Green)
- **PUTT** (Putting)

## A-K-kategorier

- **A1** Elite
- **A2** Topp
- **A3** Konkurranse
- **A4** Trening
- **A5** Mosjon

## Agent-navn

- **plan-watcher** (cron man 06:00)
- **round-agent** (umiddelbar etter runde)
- **tournament-agent** (dag 07:00)
- **test-agent** (umiddelbar etter test)
- **trackman-agent** (umiddelbar etter TrackMan-økt)
- **periodiseringsagent** (når plan opprettes/endres)

## Plan-aksjon-typer (action-type-pills)

`PYRAMID_ADJUST` · `SESSION_ADD` · `SESSION_REMOVE` · `INTENSITY_ADJUST` · `TAPER_ENGAGE` · `WITHDRAW` · `DRILL_SUGGEST` · `TEST_SCHEDULE` · `PEER_COMPARE` · `RECOVERY_ADD`

## Tone

- **CoachHQ:** teknisk, kortfattet, handlingsorientert (engelsk-influerte action-verbs OK: «Godkjenn», «Trekk», «Endre serie»)
- **PlayerHQ:** motiverende, personlig, italic editorial-elementer (dash-hero, «Min plan», «Mine runder»)
- **Auth/System:** nøytral, vennlig

## Datoformater

- **Lang:** «12. mai 2026»
- **Kort:** «12.05» (i tabeller)
- **Tid:** «14:00» (24h, kolon-skille)
- **Periode:** «12.05–18.05» (em-dash)
- **Ukenummer:** «uke 21»

## Tall

- **Desimaltegn:** komma («7,4 HCP», «+1,2 SG»)
- **Tusenskille:** mellomrom («14 200 kr»)
- **Tallformat:** alltid `class="num"` eller font-family JetBrains Mono i wireframes

## Cross-links (når wireframe har lenker)

| Fra | Til |
|---|---|
| Hub modul-kort: Godkjenninger | `coachhq/approvals.html` |
| Hub modul-kort: Uleste meldinger | (gap — bruk `#` til vi har messages-skjerm) |
| Hub modul-kort: Spillere uten plan | `coachhq/elever.html` |
| Hub modul-kort: Tester forfaller | `coachhq/sessions.html` |
| Hub modul-kort: Utestående faktura | `coachhq/finance.html` |
| Hub modul-kort: Tournament-watch | `coachhq/tournaments.html` |
| Elever-rad | `coachhq/360-profil.html` |
| Plans-kort | `coachhq/plan-detalj.html` |
| 360-profil → plan | `coachhq/plan-detalj.html` |
| 360-profil → tester | `coachhq/test-detalj.html` (PlayerHQ-fil OK å lenke til) |
| Approvals-rad | `coachhq/plan-detalj.html` (med agent-justering-seksjon) |
| Coach-team-kort | `coachhq/coach-profil.html` |
| Plan-detalj «Endre allokasjon» | `coachhq/plan-edit.html` |
| Plan-detalj «Plan-builder» | `coachhq/plan-builder.html` |
| Booking-event | `coachhq/spiller-detalj.html` (eller 360) |
| PlayerHQ Hjem → coach-melding | `playerhq/coach-detalj.html` |
| PlayerHQ Hjem → mål-progress | `playerhq/mal-oversikt.html` |
| PlayerHQ Treningsplan → fase | `playerhq/coaching-detail.html` |
| PlayerHQ Mål-oversikt → mål-detalj | `playerhq/mal-detalj.html` |
| PlayerHQ Tester → test-detalj | `playerhq/test-detalj.html` |
| PlayerHQ Coach-notes → notat | `playerhq/notater-detalj.html` |
| PlayerHQ Coaching-planer → detail | `playerhq/coaching-detail.html` |
| Auth Login → app | `coachhq/hub.html` (default) |
| Auth Signup → onboarding | `auth/onboarding.html` |

## Spacing-regler (verifiseres)

- **2-kolonne med drawer:** main + drawer skal ha tilnærmet samme høyde. Hvis drawer er kort, utvid med relevant kontekst. Hvis main er kort, trim drawer eller stable seksjoner.
- **Card-grid:** 3 kolonner som default på desktop (16px gap). Asymmetri OK (én hero-card spanner 2 kolonner).
- **Action-strip:** alltid mellom page-head og hovedinnhold. Maks 5 chips + 1-2 primary-knapper.
- **Section-gaps:** 24-32px mellom seksjoner. Ikke 16px (det er for tett).

## Anti-patterns (sjekk og fjern)

- Tabular layout der pattern egentlig skal være kalender/kanban/grid
- Statiske KPI-strips som ikke driver handling
- Modaler i stedet for drawers
- Emojis (kun ↻ ★ tekst-symboler)
- Lorem ipsum
- Hardkodede hex i stedet for var(--…)
