# AK Golf Platform — PlayerHQ — Hjem (dashboard)

## Identitet

- **Produkt:** PlayerHQ
- **URL:** `/portal/hjem`
- **Arketype:** A — Dashboard
- **Tier-gating:** Alle (Pro/Elite-features synlige men med lock-overlay for Free)
- **HTML-referanse:** `wireframe/screen-deck/playerhq/hjem.html` (lastet opp som vedlegg)
- **Tilhørende modaler i denne pilot-batchen:** Ingen — modaler kommer i egen batch (RescheduleSessionModal, StreakDetailModal, SessionDetailQuickModal)

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** (system-kontekst). Spesielt viktig:
- **PlayerHQ sidebar er LYS:** `--player-sidebar-bg` = `#FFFFFF`, høyre-border `#F0EDE5`. Active item: `rgba(0,88,64,0.08)` bg + `#005840` tekst
- Sidebar er ÉT-LAGS (220px), motsatt av CoachHQ som er to-lags
- Maks 3 lime per skjerm
- Tier-låste features dempes til 40% opacity + lucide `Lock`

**Spillerprofilen er Markus** (referanse-spiller i HTML). Bruk det navnet i greetings.

## Spec — hva skjermen er for

PlayerHQ Hjem er **spillerens daglige startpunkt**. Skal svare på: "Hva skal jeg gjøre i dag, og hvor står jeg?" Inneholder:

- Hero-greeting (italic editorial — IKKE "Welcome back, Markus!")
- KPI-strip (HCP, SG-trend, streak, pyramide-summary)
- Dagens fokus-card (planlagt økt med CTA)
- Pyramide-progresjon (FYS/TEK/SLAG/SPILL/TURN)
- SG-fordeling
- Sist registrert (3 siste runder/økter)
- Coach-melding-snippet med "Svar →"

## Layout-anvisning

- **Sidebar (220px, LYS `#FFFFFF` med `#F0EDE5` høyre-border)**
  - 5 nav-lenker med lucide-ikon: Hjem (active = `rgba(0,88,64,0.08)` bg + `#005840` tekst), Tren, Mål, Coach, Meg
  - Logo "AK Golf" øverst i Inter 14px
  - Avatar (Markus, profilbilde i sirkel) nederst med tier-badge (Pro)

- **Hovedinnhold**
  - **Hero**
    - Italic Inter Tight 36px: «{Editorial greeting}» — f.eks. *"Onsdag, Markus. To dager siden sist."* (kontekstavhengig — tilpasses dagsperiode)
    - Sub (caption muted): «{Dato} · {Aktivitet i dag eller "Ingen planlagt"}»
  - **KPI-strip (4 asymmetriske kort)** — alle klikkbare drilldown
    - HCP (stort): «12,4» (JetBrains Mono 48px) + sparkline + «↓ 0,3 siden januar»
    - SG (medium): SG-radar thumbnail + «+0,4 mot bench»
    - Streak (medium): «8 dager» (JetBrains Mono) + uke-pill-rad (siste 7 dager)
    - Pyramide-summary (medium): 5 mini-ringer i pyramide-fargene + label
  - **Dagens fokus-card (featured, hero-card)**
    - Bg: card med subtil accent-stripe (venstre)
    - Tittel (Inter Tight bold): «Dagens fokus — Putte-økt, 30 min»
    - Body: «Tre stasjoner: 2m, 5m, 10m. Mål: 70% gjennomsnitt»
    - To CTAs: **"Start økt →"** (primary, accent-pill) og **"Flytt"** (secondary)
  - **Bento-modulrad (3 kort, asymmetrisk)**
    - Stor (2-bred): Pyramide-progresjon — 5 ringer FYS/TEK/SLAG/SPILL/TURN med % i hver
    - Liten: SG-fordeling — mini-radar + tall per kategori
    - (Hvis Pro-låst feature for Free: vis med lock-overlay)
  - **Sist registrert (full bredde, 3 rader)**
    - Hver rad: tidsstempel, type-ikon (lucide `Activity`/`Target`/`TrendingUp`), kort beskrivelse, score/resultat
  - **Coach-melding-snippet (full bredde, kompakt card)**
    - Avatar Anders K. + utdrag av siste melding (2 linjer max)
    - "Svar →" CTA til høyre

## Klikkbare elementer som må designes (states)

| Element | States å designe |
|---|---|
| Sidebar-nav (5) | default, hover, active per lenke (primary-stripe) |
| Hver KPI-card | default, hover (subtil løft) |
| Dagens fokus "Start økt →" CTA | default, hover, active, focus, disabled (hvis ingen økt), loading |
| Dagens fokus "Flytt" CTA | default, hover, focus, klikk → modal-trigger (designes ikke her) |
| "Se planen"-link | default, hover, focus |
| Pyramide-card | default, hover, klikk → drilldown |
| Streak-card | default, hover, klikk → modal-trigger |
| SG-fordeling-card | default, hover, klikk → drilldown |
| Sist registrert-rad | default, hover, klikk → modal-trigger |
| "Svar →"-CTA | default, hover, focus |
| Avatar i sidebar | default, hover, popover-trigger |
| Tier-badge (Pro) | static, hover (tooltip "Pro — aktivt") |
| Lock-overlay (på Pro/Elite-låste cards for Free) | static + lucide Lock + CTA-link |

## Empty / loading / error-states

- **Empty (ny bruker uten data):** Hero viser «Velkommen, Markus. La oss komme i gang.» + onboarding-CTA i Dagens fokus («Sett opp første økt →»)
- **Empty per kort:**
  - Streak: «Ingen streak ennå — fullfør én økt for å starte»
  - Sist registrert: «Ingenting registrert ennå»
- **Loading:** Skeleton som matcher layout (KPI 4 grå, Dagens fokus grå, bento 3 grå, sist registrert 3 rader grå)
- **Error:** Per-kort error med retry, ikke full-page

## Ønsket output fra Claude Design

1. Hovedskjerm lyst tema (Pro-bruker — alle features synlige)
2. Hovedskjerm lyst tema (Free-bruker — Pro-features med lock-overlay)
3. Hovedskjerm mørkt tema
4. Hover-states på Dagens fokus-card og en KPI-card
5. Loading-state
6. Empty-state for ny bruker
7. Mobil-versjon (≤640px) — sidebar → bunnav, KPI 2×2, Dagens fokus full bredde

## Ikke-mål

- Ikke designe RescheduleSessionModal, StreakDetailModal eller SessionDetailQuickModal her — kommer i Batch B2
- Ikke endre tab-strukturen i sidebar (5 lenker er fast)

## Når du er ferdig

Lim **design-link** tilbake til Claude Code.
