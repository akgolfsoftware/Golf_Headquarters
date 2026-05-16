# Claude Design-prompter for AK Golf HQ

Komplett samling — **78 ferdige prompter** for hele plattformen. Lim inn i Claude Design for å få HTML-mockups klar til implementering.

## Slik bruker du dem

1. Åpne Claude Design (claude.ai med design-mode)
2. Velg én skjerm fra fillistene under
3. Kopier hele prompten **inkludert felles designspec** (00-shared-spec.md) øverst
4. Send til Claude — du får én HTML-fil med inline CSS, klar til Anders-review

## Komplett filoversikt

| Fil | Antall | Område |
|---|---|---|
| `00-shared-spec.md` | — | Felles designspec som limes øverst i HVER prompt |
| `01-treningsplanlegger.md` | 12 | Årsplan/Måned/Uke/Dag, PeriodeModal, VolumResept, FasteAvtaler, RepeterendeMønstre, Betingelser, SessionEditor, FysDrillEditor, MalBibliotek |
| `02-turneringsplanlegger.md` | 4 | TurneringsKalender, TurneringsDetalj, A/B-vurdering, WAGRBenchmark |
| `03-live-session.md` | 5 | LiveAktiv (tablet+mobil), PauseModal, Oppsummering, GodkjentBommetAnimasjon, CoachOvervåkning |
| `04-treningsanalyse.md` | 6 | Oversikt, **Krysstabell (VIKTIGST)**, Trender, SG-kobling, FYS-progresjon, Plan vs Faktisk |
| `05-coachhq-admin.md` | 9 | Caddie chat, Sesjonsopptak, Innstillinger, Tilgang/roller, MCP API-nøkler, E-postmaler, Integrasjoner, Innboks, AI-agenter |
| `06-coachhq-talent-reports.md` | 5 | Talent-oversikt, Talent-spillerprofil, WAGR-import, Lag-snitt, Rapporter |
| `07-playerhq-coach.md` | 8 | Coach-oversikt, Planer-liste, Plan-detalj, Plan-godkjenning, Meldinger, Notater, Videoer, AI-coach |
| `08-playerhq-meg.md` | 10 | Min profil, Abonnement, Bookinger, Reschedule, Foreldre, Helse, Dokumenter, Utstyrsbag, Innstillinger, Sikkerhet |
| `09-playerhq-tren-mal.md` | 9 | Trening-oversikt, Årsplan-player, Turneringer-player, Øvelser-bibliotek, Øvelse-detalj, SG-statistikk, Leaderboard, Milepæler, Mål-detalj |
| `10-utfordringer-sosial.md` | 5 | Utfordringer-oversikt, Utfordring-detalj, Ny utfordring, Achievements, Varsler |
| `11-marketing.md` | 5 | Anlegg-detalj, Om-oss, PlayerHQ-marketing, Booking offentlig, Coaching-oppdatering |

**Total: 78 skjermer i 12 filer**

## Anbefalt rekkefølge for design

### Topp 5 — kjerneskjermer (gjør disse først)

1. **Krysstabell** (`04-treningsanalyse.md` prompt 4.2) — Anders' kjerne-innsikt. Hvis denne ikke fungerer visuelt, må vi tenke om hele analysen.
2. **Årsplan** (`01-treningsplanlegger.md` prompt 1.1) — Fundamentet for hele planleggeren.
3. **Live session aktiv** (`03-live-session.md` prompt 3.1) — Kritisk for spilleren, brukes daglig.
4. **Turneringskalender** (`02-turneringsplanlegger.md` prompt 2.1) — Sentral oversikt for Anders.
5. **Caddie chat-side** (`05-coachhq-admin.md` første prompt) — Anders' AI-assistent, brukes 10+ ganger per dag.

### Topp 10 — kritiske flater

6. PlayerHQ Hjem (allerede implementert, men hvis ny iterasjon)
7. **Coach-oversikt** (`07-playerhq-coach.md`) — Spillerens første kontakt med coach
8. **Plan-detalj** (`07-playerhq-coach.md`) — Hovedflyten for å forstå treningsplan
9. **Min profil** (`08-playerhq-meg.md`) — Settings-hub for spilleren
10. **SG-statistikk** (`09-playerhq-tren-mal.md`) — Spillerens egen analyse

## Tematiske bunker

Lag designet i bolker etter brukerrolle:

**Coach (Anders) — 47 skjermer:**
- 01 (treningsplanlegger, 12)
- 02 (turneringsplanlegger, 4)
- 03 prompt 3.5 (live-overvåkning, 1)
- 04 (treningsanalyse, 6)
- 05 (admin, 9)
- 06 (talent + reports, 5)
- Marketing-coaching-update fra 11 (1)

**Spiller (Markus) — 31 skjermer:**
- 03 prompt 3.1–3.4 (live session, 4)
- 07 (coach-fanen, 8)
- 08 (meg, 10)
- 09 (tren + mål, 9)
- 10 (utfordringer + sosial, 5) — 4 av disse er for spiller, 1 for coach

**Marketing/offentlig — 5 skjermer:**
- 11 (anlegg-detalj, om-oss, playerhq-landing, booking-public, coaching-update)

## Estimater

- Design-tid: **5-10 minutter per skjerm i Claude Design**
- Total designtid: **6-13 timer**, kan batch-kjøres (~13 design-sesjoner)
- Med 3 parallelle Claude Design-vinduer: **~4-5 timer faktisk tid**

## Etter design er ferdig

Lever HTML-filene til Claude Code med:

> "Implementer skjermen fra `<filnavn>.html` i `/admin/...` eller `/portal/...` som Next.js Server Component, følg eksisterende mønster i `wireframe/design-files-v2/final/`. Bruk delte komponenter fra `src/components/shared/calendar/` og `src/components/analyse/` der relevant. Auth: `requirePortalUser()` eller `canAccessMissionControl()`."

## Status per skjerm (følg opp her)

| Fil | Designet | Implementert |
|---|---|---|
| 01 Treningsplanlegger | ☐ 0/12 | ✓ 12/12 (S8-12 fra Masterplan) |
| 02 Turneringsplanlegger | ☐ 0/4 | ☐ 0/4 |
| 03 Live session | ☐ 0/5 | ✓ 1/5 (eksisterende) |
| 04 Treningsanalyse | ☐ 0/6 | ✓ 6/6 (S13-14 fra Masterplan) |
| 05 CoachHQ admin | ☐ 0/9 | ✓ Caddie + MCP-keys delvis |
| 06 Talent + reports | ☐ 0/5 | ☐ 0/5 |
| 07 PlayerHQ Coach | ☐ 0/8 | ✓ Eksisterende delvis |
| 08 PlayerHQ Meg | ☐ 0/10 | ✓ 8/10 (eksisterende) |
| 09 PlayerHQ Tren/Mål | ☐ 0/9 | ✓ Eksisterende delvis |
| 10 Utfordringer | ☐ 0/5 | ✓ 2/5 (utfordringer-modul) |
| 11 Marketing | ☐ 0/5 | ✓ 3/5 (coaching, anlegg-liste, om-oss) |

## Designsystem-referanser

Alle prompter bygger på samme system. Detaljer i:

- `wireframe/design-files-v2/` — V2-designsystem (lyst tema + mørk sidebar, JetBrains Mono, Inter Tight, Instrument Serif)
- `wireframe/design-files-v2/uploads/design-system-v2.md` — Tokens + tone
- `wireframe/design-files-v2/uploads/branding-style-guide.html` — Visuelle eksempler
- `src/app/globals.css` — Faktiske CSS-tokens i prosjektet

## Endringslogg

- **2026-05-16** — Initial release med 27 skjermer (01-04)
- **2026-05-16** — Utvidet med 51 nye skjermer (05-11), total 78. Alle hovedflater dekket.
