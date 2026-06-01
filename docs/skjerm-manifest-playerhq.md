# Skjerm-manifest — PlayerHQ

> Generert 2026-06-01 · Design-intensjon (fasit for redesign), ikke nåværende implementasjon.
> For hver skjerm: **inngang** · **hva er synlig** · **knapper → destinasjon** · wireframe på nøkkelskjermer.
>
> Design-DNA: "DataGolf møter The Athletic, på Linear." Forest #005840 · Lime #D1F843 (kun aksent) · Cream #FAFAF7 side-bg.
> Logikk: utøveren utfører og følger EGEN progresjon. "Hva gjør JEG i dag?"

---

## 0. AUTH — innlogging og onboarding

### `/auth/login` — Logg inn
**Inngang:** Direkte URL, eller redirect fra gated rute. "Logg inn" i marketing-header.
**Hva er synlig:**
- Sentrert kort på cream bakgrunn
- AK-logo (sentrert) + "PLAYERHQ"-eyebrow (lime, mono)
- "Velkommen tilbake" (Inter Tight, italic "Velkommen")
- E-post-felt + passord-felt (med Eye-toggle)
- "Husk meg" checkbox · "Glemt passord?" lenke
- Primær lime-knapp "Logg inn"
- "Har du ikke konto? Registrer deg"

**Knapper → destinasjon:**
| Knapp | Går til |
|---|---|
| Logg inn (suksess) | `/portal` (spiller) eller `/admin/agencyos` (coach) |
| Glemt passord? | `/auth/forgot-password` |
| Registrer deg | `/auth/signup` |

```
┌─────────────────────────────────────┐
│                                     │
│              [ak-logo]              │
│            PLAYERHQ · PRO           │
│                                     │
│      Velkommen tilbake             │
│   Logg inn for å fortsette         │
│                                     │
│   E-POST                           │
│   ┌───────────────────────────┐    │
│   │ navn@eksempel.no          │    │
│   └───────────────────────────┘    │
│   PASSORD                          │
│   ┌─────────────────────── 👁 ┐    │
│   │ ••••••••                  │    │
│   └───────────────────────────┘    │
│   ☐ Husk meg      Glemt passord?   │
│   ┌───────────────────────────┐    │
│   │       Logg inn            │ ◄ lime
│   └───────────────────────────┘    │
│   Har du ikke konto? Registrer     │
└─────────────────────────────────────┘
```

### `/auth/signup` — Registrer
**Inngang:** "Registrer deg" fra login. CTA fra marketing.
**Hva er synlig:** Tier-valg (Performance Pro / Performance / PlayerHQ), e-post + passord, vilkår-checkbox.
**Knapper:** Opprett konto → `/auth/onboarding` · Tilbake → `/auth/login`

### `/auth/forgot-password` — Glemt passord
**Synlig:** E-post-felt, "Send tilbakestillingslenke". → bekreftelse-skjerm.

### `/auth/onboarding` — Onboarding-wizard (8 steg)
**Inngang:** Etter signup.
**Steg:** Navn → HCP → fødselsdato (GDPR-sjekk <16 → foreldresamtykke) → klubb → mål → fasiliteter → coaching-ønske → ferdig.
**Slutt → `/portal`.**

---

## 1. WORKBENCH — hjem (`/portal`)

**Inngang:** Logg inn → lander her. Sidebar: "Oversikt" (alltid topp).
**Dette er hjertet i PlayerHQ — "Spotify Now Playing for trening".**

**Hva er synlig (topp → bunn):**
1. **Topbar:** ak-logo + "PLAYERHQ · PRO" · søk (⌘K) · "Tilbake til CoachHQ" (kun hvis coach ser som spiller) · varsler-bjelle · profil-meny
2. **Live-bar:** Live-indikator + klokke (NÅ 00:00:00) + sted/vær (GFGK 14°C SOL)
3. **Hero (foto-bakgrunn):** avatar i sirkel + "Hei, [Navn]." (Inter Tight, italic navn, lime) + PRO-badge + "HCP [x] · [n] DAGER TIL [neste turnering]"
4. **Programmet i dag:** "I dag" + dagens økter (eller empty-state "Ingen økter planlagt") + "Full kalender →"
5. **AI-Innsikt:** 3 kort (Caddie-forslag basert på SG/trening)
6. **Ukas progresjon:** pyramide-vekting (FYS/TEK/SLAG/SPILL/TURN bars med %)
7. **Snarveier:** 8-grid (Ny økt, Logg runde, SG Hub, Tester, Drills, Booking, Plan, Mål)
8. **Treningskompiser:** rad med partnere (når data)
9. **Neste turnering:** countdown-kort
10. **Velvære:** (når wearable koblet — ellers skjult)

**Knapper → destinasjon:**
| Knapp | Går til |
|---|---|
| Ny økt (sidebar topp) | `/portal/ny-okt` |
| Full kalender | `/portal/kalender` |
| Søk (⌘K) | global søk-modal |
| Snarvei: SG Hub | `/portal/mal/sg-hub` |
| Snarvei: Logg runde | `/portal/mal/runder/ny` |
| Snarvei: Booking | `/portal/booking` |
| Hero-turnering | `/portal/tren/turneringer/[id]` |
| Varsler-bjelle | `/portal/varsler` |
| Profil-meny | `/portal/meg` |

```
┌──────────┬────────────────────────────────────────────────┐
│ ak       │  [Søk ⌘K]      [Tilbake CoachHQ] 🔔  [A] Anders │
│ PLAYERHQ │ ──────────────────────────────────────────────  │
│ ·PRO     │ ● Live   NÅ 00:53:40            GFGK 14°C SOL    │
│          │ ┌────────────────────────────────────────[AK]┐  │
│ + Ny økt │ │ PRO · SESONG 2026                          │  │
│          │ │                                            │  │
│ ▸Oversikt│ │  Hei, Anders.                              │  │
│  Planleg │ │  HCP — · 76 DAGER TIL OLYO JUNIORTOUR      │  │
│  Gjennom │ └────────────────────────────────────────────┘  │
│  Analyse │  ── PROGRAMMET I DAG ──        [Full kalender →] │
│  Coach   │  I dag                                           │
│          │  ┌────────────────────────────────────────────┐ │
│          │  │   Ingen økter planlagt i dag               │ │
│          │  └────────────────────────────────────────────┘ │
│          │  AI-INNSIKT   [kort] [kort] [kort]               │
│          │  UKAS PROGRESJON  FYS▓▓ TEK▓▓▓ SLAG▓ SPILL▓ TURN│
│          │  SNARVEIER  [8-grid med ikoner]                  │
└──────────┴────────────────────────────────────────────────┘
```

---

## 2. PLANLEGGE — utviklingsverktøy

### `/portal/planlegge` — Planlegge-hub
**Inngang:** Sidebar "Planlegge".
**Synlig:** Hub med kort/tabs: Årsplan · Treningsplan · Mål · Turneringer · Drills. Hver leder til sin seksjon.
**Knapper:** Tabs → `?tab=arsplan` / `?tab=treningsplan` / `?tab=mal` / `?tab=turneringer` / `?tab=drills`

### `/portal/planlegge/workbench` — Workbench Plan A
**Inngang:** Fra planlegge-hub "Åpne Workbench". **DELT KJERNE med coach.**
**Synlig:** Topbar (crumbs, Plan A/B, fasiliteter, del) · Zoombar (År/Periode/Måned/Uke/Dag) · AI-bar (Caddie-chips) · Sidebar (sesong-tre, perioder, turneringer, samlinger) · Canvas (5 akse-lanes × uker) · Inspector (pyramide-pie, test-snarveier).
**Knapper:** Zoom-tabs → bytt canvas · Økt-klikk → session-drawer · "+ Ny periode" → modal · Fasiliteter → modal.

### `/portal/tren/aarsplan` — Årsplan
**Synlig:** Gantt-kart hele året med faser (perioder farget per pyramide-akse). Klikk periode → rediger.
**Knapper:** Periode-klikk → `/portal/tren/aarsplan/periode/[id]/rediger`

### `/portal/tren/teknisk-plan` — Teknisk plan liste
**Synlig:** Liste planer gruppert per periodefase (Spesialisering/Turnering/Grunntrening). "Ny plan"-knapp.
**Knapper:** Plan-kort → `/portal/tren/teknisk-plan/[planId]` · Ny plan → Workbench

### `/portal/tren/teknisk-plan/[planId]` — Teknisk plan detalj
**Synlig:** P-posisjoner, oppgaver, hit-rate (Mekanisme 7), reps-teller, oppgave-modal.

### `/portal/tren/fys-plan` + `/[planId]` — Fys-plan liste + builder
**Synlig:** Liste fysiske planer · builder med øvelser/sett/reps.

### `/portal/drills` + `/[id]` — Drill-bibliotek + detalj
**Synlig:** Grid/liste med drills · søk/filter · detalj som slide-in panel med video + beskrivelse.

### `/portal/mal` + `/mal/bygger` + `/mal/goal/[id]` + `/mal/milepaeler`
**Synlig:** Mål-hub · AI mål-bygger (5-stegs wizard) · mål-detalj · milepæler-tidslinje.

### `/portal/tren/turneringer` + `/[id]` — Turneringer
**Synlig:** Liste spillerens turneringer · detalj med bane, dato, resultat.

### `/portal/utfordringer` + `/ny` + `/[id]` — Utfordringer
**Synlig:** Liste · egen-challenge wizard (6 steg) · utfordring-detalj.

### `/portal/ai/mal-bygger` · `/ai/foresla-drill` · `/ai/foresla-turnering` — AI-verktøy
**Synlig:** AI-genererte forslag basert på spillerens data.

---

## 3. GJENNOMFØRE — utførelse

### `/portal/gjennomfore` — hub
**Synlig:** Dagens gjennomføring, neste økt, snarvei til live.

### `/portal/kalender` + `/portal/tren/kalender` — Kalender
**Synlig:** Uke/måned-visning av økter. Klikk økt → detalj.

### `/portal/ny-okt` — Ny økt
**Inngang:** "+ Ny økt" (sidebar topp, alltid synlig).
**Synlig:** Handlingsvalg: Logg runde · Planlegg økt i Workbench · Be om økt fra coach.

### `/portal/onskeligokt` + `/bekreftet` — Ønsket økt
**Synlig:** Skjema for å be coach om spesifikk økt · bekreftelse.

### Live-økt (fullscreen) — `/portal/(fullscreen)/live/[sessionId]/...`
| Rute | Skjerm |
|---|---|
| `/brief` | Pre-økt brief — mål, fokus, coach-kommentar |
| `/active` | Live-økt aktiv — timer, dagens drills |
| `/logger` | Drill-logger — registrer reps/resultat |
| `/tapper` | Score-tapper — slag-for-slag |
| `/summary` | Post-økt summary — statistikk + følelse |

---

## 4. ANALYSERE — egen progresjon

### `/portal/analysere` + `/analysere/hull` — Analyse-hub
**Synlig:** Analyse-oversikt · hull-for-hull-analyse.

### `/portal/statistikk` + `/[metric]` + `/sammenlign` — Statistikk
**Synlig:** Nøkkeltall-oversikt · metrikk-drilldown · sammenlign mot PGA-spiller.

### `/portal/mal/sg-hub` — Strokes Gained Hub (NØKKELSKJERM)
**Inngang:** Sidebar "Strokes gained". Snarvei fra Workbench.
**Synlig:**
- 4 SG-kategori-kort: OTT / APP / ARG / PUTT (med +/- verdi mot PGA Top 40)
- SG-total trend-linje
- Per-kølle-grid (klikk → klubb-detalj)
- Lenker: Benchmark, Best vs Now, Equipment, Yardage, Conditions, Strategy

**Knapper → destinasjon:**
| Knapp | Går til |
|---|---|
| Kølle-kort | `/portal/mal/sg-hub/[club]` |
| Benchmark | `/portal/mal/sg-hub/benchmark` |
| Best vs Now | `/portal/mal/sg-hub/best-vs-now` |
| Equipment | `/portal/mal/sg-hub/equipment` |
| Yardage | `/portal/mal/sg-hub/yardage` |

```
┌──────────────────────────────────────────────────────┐
│  STROKES GAINED · vs PGA Tour Top 40                  │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐          │
│  │  OTT   │ │  APP   │ │  ARG   │ │  PUTT  │          │
│  │ +0,42  │ │ −0,18  │ │ +0,05  │ │ +0,31  │          │
│  └────────┘ └────────┘ └────────┘ └────────┘          │
│  SG-TOTAL TREND   ╱╲    ╱╲╱                            │
│                  ╱  ╲╱╲╱                               │
│  PER KØLLE  [Driver][3w][5i][7i][9i][PW][SW][Putter]  │
│  [Benchmark] [Best vs Now] [Equipment] [Yardage]      │
└──────────────────────────────────────────────────────┘
```

### `/portal/mal/sg-hub/[club]` — Klubb-detalj
**Synlig:** D-Plane (face vs path), strike-heatmap, trend per metrikk.

### `/portal/mal/runder` + `/[id]` + `/[id]/shot-by-shot` + `/ny` — Runder
**Synlig:** Rundeliste · runde-detalj (score + SG) · slag-for-slag · logg ny runde.

### `/portal/mal/trackman` + `/[id]` — TrackMan
**Synlig:** Sesjonsliste · dispersjon-plot + per-slag-data.

### `/portal/tren/tester` + `/[testId]` + `/katalog` + `/ny` — Tester
**Synlig:** Test-oversikt · test-detalj · NGF-katalog · ny test-wizard. Live test-modus i fullscreen.

---

## 5. COACH — kommunikasjon

### `/portal/coach` — Coach-hub
**Inngang:** Sidebar "Coach".
**Synlig:** Min coach (profil), meldinger-snarvei, planer coach har lagt til, øvelser/videoer fra coach.

### `/portal/coach/melding` + `/ny` + `/[id]` — Meldinger
**Synlig:** Innboks · ny melding · meldingstråd med vedlegg.

### `/portal/coach/plans` + `/[planId]` — Coach-planer
**Synlig:** Planer coachen har laget for meg.

### `/portal/coach/ovelser` · `/videoer` · `/notes` · `/sporsmal/[id]` · `/ai`
**Synlig:** Coach-øvelser · video-bibliotek · notater · spørsmål-svar · AI-anbefalinger.

---

## 6. MEG — profil og innstillinger

### `/portal/meg` — Profil
**Inngang:** Profil-meny (topbar).
**Synlig:** Profilbilde + navn + HCP, abonnement-status, snarveier til innstillinger.

### `/portal/meg/abonnement` (+ avbestill/oppgrader/kort/faktura)
**Synlig:** GRATIS/PRO-status, oppgrader til PRO (Stripe), kort, fakturaer, avbestill.

### `/portal/meg/innstillinger` (+ undersider)
**Synlig:** Varsler · personvern (GDPR) · sikkerhet/2FA · språk · anlegg · integrasjoner · eksport · økter.

### `/portal/meg/bookinger` + `/reschedule/[id]` — Mine bookinger
**Synlig:** Bookinghistorikk · endre tid.

### `/portal/meg/helse` + `/symptom/ny` — Helse
**Synlig:** Helse-logger · legg til symptom.

### `/portal/meg/dokumenter` · `/utstyrsbag` · `/foreldre` · `/feedback` · `/help`
**Synlig:** Dokumenter · utstyrsbag · foresatt-info · feedback · hjelpesenter.

---

## 7. BOOKING — book coaching

### `/portal/booking` — Booking-hub
**Inngang:** Sidebar "Booking". Snarvei fra Workbench.
**Synlig:** "Book time"-CTA, mine credits (Performance=2/Pro=4/mnd), kommende bookinger.

### `/portal/booking/ny` (+ /bekreft) — Ny booking wizard (5 steg)
**Synlig:** Velg coach → velg anlegg → velg tjeneste → velg tid → bekreft.

### `/portal/booking/[bookingId]` · `/coach/[coachId]` · `/anlegg/[anleggId]` · `/bekreftet`
**Synlig:** Booking-detalj · coach-profil · anleggs-detalj · bekreftelse.

---

## Sammendrag — PlayerHQ skjerm-hierarki

```
PlayerHQ (PLAYERHQ · PRO)
├── /portal ················ Workbench (hjem) ★ NØKKEL
├── PLANLEGGE
│   ├── /planlegge ········· hub
│   ├── /planlegge/workbench  Plan A ★ DELT med coach
│   ├── /tren/aarsplan ····· Gantt
│   ├── /tren/teknisk-plan · P-posisjoner + hit-rate
│   ├── /tren/fys-plan ····· builder
│   ├── /drills ············ bibliotek
│   ├── /mal ··············· mål + AI-bygger
│   └── /utfordringer ······ challenges
├── GJENNOMFØRE
│   ├── /gjennomfore ······· hub
│   ├── /kalender ·········· uke/måned
│   ├── /ny-okt ············ handlingsvalg
│   └── (fullscreen)/live · brief→active→logger→tapper→summary
├── ANALYSERE
│   ├── /statistikk ········ nøkkeltall
│   ├── /mal/sg-hub ········ Strokes Gained ★ NØKKEL
│   ├── /mal/runder ········ runder + shot-by-shot
│   ├── /mal/trackman ······ dispersjon
│   └── /tren/tester ······· NGF-tester
├── COACH
│   ├── /coach ············· hub
│   └── /coach/melding ····· meldinger
├── MEG
│   ├── /meg ··············· profil
│   ├── /meg/abonnement ···· PRO + Stripe
│   └── /meg/innstillinger · varsler/sikkerhet/personvern
└── BOOKING
    └── /booking ··········· book coaching m/ credits
```

**Status:** Manifest ferdig for PlayerHQ. AgencyOS-manifest følger i neste dokument.
