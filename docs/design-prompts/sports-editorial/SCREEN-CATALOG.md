# AK Golf HQ — Screen Catalog & Redesign-roadmap

> Komplett oversikt over alle skjermer som skal redesignes i Sports Editorial-stil
> for desktop, iPad og iPhone. Prioritert i 4 bølger.

**Sist oppdatert:** 17. mai 2026

---

## Slik bruker du dette

Hver skjerm har en egen prompt-fil i `prompts/`-mappen. For å designe en skjerm:

1. Åpne `claude.ai/new` (Sonnet 4.6 eller Opus, design-mode)
2. Lim inn HELE `design.md` (Sports Editorial design system)
3. Trykk Enter to ganger
4. Lim inn `prompts/[skjerm-id].md`
5. Claude leverer ÉN HTML-fil med desktop + iPad + iPhone vertikalt stablet
6. Lagre som `_outputs/[skjerm-id].html`

---

## Bølge 1 — Kjerneflater (10 skjermer)

Disse åpnes daglig. Må sitte perfekt før resten.

### PlayerHQ Kjerne (5)

| # | Skjerm | URL | Status | Prompt-fil |
|---|---|---|---|---|
| 01 | **Dashboard** | `/portal` | 🟡 v1 ferdig | `01-playerhq-dashboard.md` |
| 02 | **Trening** | `/portal/tren` | ⚪ | `02-playerhq-tren.md` |
| 03 | **Mål** | `/portal/mal` | ⚪ | `03-playerhq-mal.md` |
| 04 | **Coach** | `/portal/coach` | ⚪ | `04-playerhq-coach.md` |
| 05 | **Live Session** | `/portal/live/[id]` | 🟡 v1 ferdig (iPad-only) | `05-playerhq-live.md` |

### CoachHQ Kjerne (5)

| # | Skjerm | URL | Status | Prompt-fil |
|---|---|---|---|---|
| 06 | **AgencyOS Hub** | `/admin/agencyos` | 🟡 v1 ferdig | `06-coachhq-hub.md` |
| 07 | **Kalender Årsplan** | `/admin/kalender?view=ar` | 🟡 v1 ferdig | `07-coachhq-kalender.md` |
| 08 | **Spillere** | `/admin/spillere` | ⚪ | `08-coachhq-spillere.md` |
| 09 | **Krysstabell** | `/admin/analyse?view=krysstabell` | 🟡 v1 ferdig | `09-coachhq-krysstabell.md` |
| 10 | **Caddie Chat** | `/admin/agencyos/caddie` | ⚪ | `10-coachhq-caddie.md` |

---

## Bølge 2 — Sub-flater (15 skjermer)

Hyppig brukte funksjonelle skjermer.

### PlayerHQ Sub (8)

| # | Skjerm | URL | Prompt-fil |
|---|---|---|---|
| 11 | Runder-liste | `/portal/mal/runder` | `11-playerhq-runder.md` |
| 12 | Runde-detalj | `/portal/mal/runder/[id]` | `12-playerhq-runde-detalj.md` |
| 13 | Statistikk | `/portal/mal/statistikk` | `13-playerhq-statistikk.md` |
| 14 | Trackman | `/portal/mal/trackman` | `14-playerhq-trackman.md` |
| 15 | SG Hub | `/portal/mal/sg-hub` | `15-playerhq-sg-hub.md` |
| 16 | SG Hub per-kølle | `/portal/mal/sg-hub/[club]` | `16-playerhq-sg-club.md` |
| 17 | Profil (Meg) | `/portal/meg` | `17-playerhq-meg.md` |
| 18 | Innstillinger | `/portal/meg/innstillinger` | `18-playerhq-settings.md` |

### CoachHQ Sub (7)

| # | Skjerm | URL | Prompt-fil |
|---|---|---|---|
| 19 | Kalender Måned | `/admin/kalender?view=maaned` | `19-coachhq-maaned.md` |
| 20 | Kalender Uke | `/admin/kalender?view=uke` | `20-coachhq-uke.md` |
| 21 | Spiller-detalj | `/admin/spillere/[id]` | `21-coachhq-spiller-detalj.md` |
| 22 | Treningsplaner | `/admin/plans` | `22-coachhq-plans.md` |
| 23 | Plan-detalj | `/admin/plans/[id]` | `23-coachhq-plan-detalj.md` |
| 24 | Analyse Oversikt | `/admin/analyse?view=oversikt` | `24-coachhq-analyse.md` |
| 25 | Økonomi | `/admin/finance` | `25-coachhq-finance.md` |

---

## Bølge 3 — Spesialflater (15 skjermer)

Mindre frekvente men viktige skjermer.

### PlayerHQ (7)

| # | Skjerm | URL | Prompt-fil |
|---|---|---|---|
| 26 | Goal-detalj | `/portal/mal/goal/[id]` | `26-playerhq-goal-detalj.md` |
| 27 | Milepæler | `/portal/mal/milepaeler` | `27-playerhq-milepaeler.md` |
| 28 | Leaderboard | `/portal/mal/leaderboard` | `28-playerhq-leaderboard.md` |
| 29 | Booking | `/portal/booking` | `29-playerhq-booking.md` |
| 30 | Turneringer | `/portal/tren/turneringer` | `30-playerhq-turneringer.md` |
| 31 | Tester | `/portal/tren/tester` | `31-playerhq-tester.md` |
| 32 | Meldinger | `/portal/coach/melding` | `32-playerhq-meldinger.md` |

### CoachHQ (8)

| # | Skjerm | URL | Prompt-fil |
|---|---|---|---|
| 33 | Forespørsler | `/admin/foresporsler` | `33-coachhq-foresporsler.md` |
| 34 | Innboks | `/admin/innboks` | `34-coachhq-innboks.md` |
| 35 | Anlegg | `/admin/anlegg` | `35-coachhq-anlegg.md` |
| 36 | Tjenester | `/admin/services` | `36-coachhq-services.md` |
| 37 | Turneringer | `/admin/tournaments` | `37-coachhq-turneringer.md` |
| 38 | Analytics | `/admin/analytics` | `38-coachhq-analytics.md` |
| 39 | Rapporter | `/admin/reports` | `39-coachhq-rapporter.md` |
| 40 | Talent | `/admin/talent` | `40-coachhq-talent.md` |

---

## Bølge 4 — Administrasjon & innstillinger (20+ skjermer)

Lavt-frekvente admin-skjermer. Designes sist.

### PlayerHQ Settings (10)

- Abonnement (`/portal/meg/abonnement`)
- Bookinger (`/portal/meg/bookinger`)
- Foreldre (`/portal/meg/foreldre`)
- Helse (`/portal/meg/helse`)
- Utstyrsbag (`/portal/meg/utstyrsbag`)
- Dokumenter (`/portal/meg/dokumenter`)
- Sikkerhet (`/portal/meg/sikkerhet`)
- Hjelp (`/portal/meg/help`)
- Varsler (`/portal/varsler`)
- Notater (`/portal/coach/notes`)

### CoachHQ Settings (12)

- AI-agenter (`/admin/agents`)
- Videoer (`/admin/videoer`)
- E-postmaler (`/admin/email-templates`)
- Team (`/admin/team`)
- Integrasjoner (`/admin/integrasjoner`)
- Innstillinger (`/admin/settings`)
- Tilgang (`/admin/settings/tilgang`)
- API-nøkler (`/admin/settings/api`)
- Godkjenninger (`/admin/godkjenninger`)
- Bookinger (`/admin/bookinger`)
- Hjelp (`/admin/hjelp`)
- Notion-prosjekter (`/admin/notion-prosjekter`)

---

## Status-legende

| Symbol | Betydning |
|---|---|
| ✅ | Ferdig — alle 3 enheter levert + godkjent |
| 🟢 | Designet — alle 3 enheter klare, venter godkjenning |
| 🟡 | v1 ferdig — Bloomberg+NYT-versjon eksisterer, må re-designes i Sports Editorial × 3 enheter |
| 🟠 | Pågår |
| ⚪ | Ikke startet |

---

## Bygge-strategi

### Trinn 1 — Lock dashboard-prompten

Bygg `01-playerhq-dashboard.md` fullt ut. Test i Claude Design. Iterer til
desktop + iPad + iPhone alle sitter. Det er **malen** for resten.

### Trinn 2 — Mass-produser bølge 1

Bruk dashboard-prompten som mal. Skriv 9 til (02-10). Hver tar 10-15 min
å skrive når malen er låst.

### Trinn 3 — Test bølge 1 i Claude Design

Send hver prompt til Claude Design. Lagre HTML-er i `_outputs/`. Anders
ser gjennom, gir feedback per skjerm.

### Trinn 4 — Bølge 2-4 parallelt

Når bølge 1 er godkjent, jobb gjennom resten. Kan kjøres parallelt med
implementasjon i kodebasen.

---

## Tidsestimater

| Bølge | Antall | Snitt-tid per prompt | Total |
|---|---|---|---|
| 1 — Kjerneflater | 10 | 30 min skrive + 15 min iterere | ~7,5 t |
| 2 — Sub-flater | 15 | 15 min skrive + 10 min iterere | ~6 t |
| 3 — Spesialflater | 15 | 15 min skrive + 10 min iterere | ~6 t |
| 4 — Admin | 22 | 10 min skrive + 5 min iterere | ~5,5 t |
| **Total** | **62** | — | **~25 t** |

Spredt over 2-3 uker med iterasjon mellom Anders og Claude Design.

---

## Hvordan prompt-filene er strukturert

Hver prompt-fil følger denne malen:

```markdown
# Prompt: [SKJERM-NAVN] — Sports Editorial

## Slik bruker du dette i Claude Design

1. Lim inn HELE design.md som design-system-kontekst
2. Trykk Enter to ganger
3. Lim inn alt fra "Du er senior visuell designer..." og nedover
4. Claude leverer HTML
5. Lagre som _outputs/[id].html

---

## PROMPT (kopier alt under)

Du er senior visuell designer for AK Golf Group.

Du har akkurat fått hele Sports Editorial design-systemet over. Følg det.

# SKJERM: [Navn]

URL: [/path/to/screen]
Bruker: [Markus / Anders / annen]
Brukerspørsmål: [Hva trenger jeg fra denne skjermen?]

## Realistisk data
[Spesifikke navn, datoer, tall som matcher onsdag 17. mai 2026]

## Spreads (komponer fra arketyper)
[Hvilke spreads denne skjermen trenger]

## Multi-device-output
Lever ÉN HTML-fil med tre seksjoner stablet vertikalt:
- Desktop 1440×900
- iPad 1024×768
- iPhone 393×852

Følg responsive-spec i design.md seksjon 26.

## Command palette ⌘K
[20+ kommandoer spesifikke for denne skjermen]

## Etter levering
- 3 designvalg som styrker skjermen
- Hva ville blitt løftet i neste iterasjon
- Hva du er usikker på
```
