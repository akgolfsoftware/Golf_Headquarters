# 05 — Layout Patterns

## Container-strukturer

### Standard side-layout

```
┌──────────────────────────────────────┐
│ TopBar (sticky, 64px)                 │
├────────┬─────────────────────────────┤
│        │                              │
│Sidebar │  Content                     │
│256px   │  (max-w-7xl mx-auto)         │
│        │                              │
│        │                              │
└────────┴─────────────────────────────┘
```

### Mobile-layout

```
┌──────────────────────────────────────┐
│ TopBar (sticky, 56px) + hamburger    │
├──────────────────────────────────────┤
│                                       │
│ Content (px-4)                        │
│                                       │
│                                       │
├──────────────────────────────────────┤
│ BottomNav (5 tabs, 56px)              │
└──────────────────────────────────────┘
```

### FullScreen (live-økt)

```
┌──────────────────────────────────────┐
│ X-knapp top-right                     │
│                                       │
│ Full-screen content                   │
│ Ingen sidebar, ingen topbar           │
│                                       │
└──────────────────────────────────────┘
```

## Page-mønstre

### Hub-side (dashboard)
- Hero (eyebrow + tittel + subtitle + actions)
- KPI-rad (4 cards)
- Card-grid 3-kol (HubCards med ikon + eyebrow + title + data + CTA)
- Sticky topbar action på toppen

### Detail-side
- Breadcrumb
- Hero (tittel + statusPill + actions)
- KPI-rad (2-4 cards)
- Tabs
- Tab-content
- Sticky bottom-actions (mobil)

### List-side
- Filter-bar (chips, søk, sortering)
- Tabell (desktop) eller card-stack (mobile)
- Pagination
- "+ Ny X"-CTA øverst

### Form/Wizard-side
- max-w-2xl sentrert
- Steg-indikator øverst (hvis multi-step)
- Felt-grupper med headings
- Sticky save-bar nederst

## Sidemeny-strukturer

### PlayerHQ (7 seksjoner)

```
PLAYERHQ · PRO
├── Oversikt (/portal)
├── Planlegge (/portal/planlegge)
│   ├── Treningsplaner
│   ├── Teknisk plan
│   ├── FYS-plan
│   ├── Drill-bibliotek
│   ├── Turneringer
│   └── Mål
├── Gjennomføre (/portal/gjennomfore)
│   ├── Kalender
│   ├── Live-økt
│   └── Bookinger
├── Analysere (/portal/analysere)
│   ├── Statistikk
│   ├── SG-hub
│   ├── Runder
│   ├── TrackMan
│   └── Tester
├── Coach (/portal/coach)
│   ├── Min coach
│   ├── Meldinger
│   ├── Notater fra coach
│   └── Tildelte øvelser
├── Talent (/portal/talent)
└── Meg (/portal/meg)
    ├── Profil
    ├── Innstillinger
    ├── Sikkerhet
    ├── Abonnement
    └── Foreldre
```

### CoachHQ (6 seksjoner)

```
COACHHQ · HEAD COACH
[+ Ny plan] (rask handling)
├── Oversikt (/admin/agencyos)
│   ├── Dashboard
│   ├── Min uke
│   ├── Oppgaver
│   └── Tildelt meg
├── Stall (/admin/stall)
│   ├── Alle spillere
│   ├── Grupper
│   ├── Talent-radar
│   ├── Sammenligning
│   └── WAGR-import
├── Planlegge (/admin/planlegge)
│   ├── Treningsplaner
│   ├── Plan-maler
│   ├── Drill-bibliotek
│   └── Turneringer
├── Gjennomføre (/admin/gjennomfore)
│   ├── Kalender
│   ├── Bookinger
│   ├── Anlegg
│   ├── Tilgjengelighet
│   └── Tjenester
├── Innsikt (/admin/analysere)
│   ├── Stall-analyse
│   ├── Lag-snitt
│   ├── Tester
│   ├── Forespørsler
│   ├── Godkjenninger
│   └── Rapporter
└── Admin (/admin/organisasjon)
    ├── Innboks
    ├── E-postmaler
    ├── AI-agenter
    ├── Team
    ├── Økonomi
    ├── Integrasjoner
    ├── Audit-log
    └── Innstillinger
```

### Foreldreportal (5 seksjoner — enklere)

```
FORELDREPORTAL · FORELDER
├── Oversikt (/forelder)
├── Barnet (/forelder/barn/[id])
├── Bookinger (/forelder/bookinger)
├── Økonomi (/forelder/okonomi)
└── Innstillinger (/forelder/innstillinger)
```

## Responsive-regler

| Viewport | Sidebar | Topbar | Layout |
|---|---|---|---|
| 393px (iPhone) | Sheet (hamburger) | 56px sticky | 1-kol stack |
| 810px (iPad portrait) | Sheet (hamburger) eller smal sidebar | 64px sticky | 2-kol grid |
| 1180px (iPad landscape) | Sticky 256px | 64px sticky | 2-3-kol grid |
| 1440px (desktop) | Sticky 256px | 64px sticky | 3-kol grid + sub-areas |
| 1920px (large desktop) | Sticky 280px | 64px sticky | Multi-kol + side-paneler |
