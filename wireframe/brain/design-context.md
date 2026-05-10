# Design Context — AK Golf HQ

Generated: 2026-05-10

## App Overview

AK Golf HQ er én unified plattform med fire overflater i samme kodebase:
- **PlayerHQ** — spillerportalen (12–70 år) for treningsplanlegging, gjennomføring og analyse
- **CoachHQ** — operativsystemet for coacher og admin (19 modulgrupper, ~180 server actions)
- **Booking** — offentlig booking-flate
- **Website** — landingssider og marketing

Domenet er golfcoaching: spillere har handicap, slår runder, registrerer Strokes Gained, gjør tester og TrackMan-økter. Coacher genererer periodiserte planer per spiller, godkjenner agent-foreslåtte plan-endringer, og kjører live coaching-økter.

## Target Platform

**Desktop / Web** primært (PlayerHQ + CoachHQ er begge web-apper med sidebar-navigasjon). Responsive på mobil for spillere som logger økter på driving range.

## Layout Patterns

- **Sidebar + content** — fast venstre sidebar (240px), scrollbart hovedinnhold
- **12-kolonne bento grid** — asymmetrisk på dashboards, ikke 3×1 uniform
- **Asymmetri-prinsipp** — ALDRI lik bredde på alle moduler. Bevisst hierarki: ett hero-element + 2–4 støtteelementer i variert størrelse
- **Maks 3 lime (`#D1F843`)-elementer synlige per skjerm** — accent skal være sjelden
- **Kort-typer:** Flush (ingen padding/border, hele bredden), Standard (16px radius, hvit bg, subtil border), Featured (gradient eller accent-stripe)

## Navigation

- **PlayerHQ sidebar** (5 hovedtabs): Hjem, Tren, Mål, Coach (tier-gatet Pro/Elite), Meg
- **CoachHQ sidebar:** Hub, Daglig Brief, Spillere, Coaching Board, Godkjenninger, Plans, Tests, Bookinger osv.
- **Sidebar-aktiv:** PlayerHQ bruker `#005840`-stripe; CoachHQ bruker `#D1F843`-stripe
- **Bunnav på mobil:** ikoner + label, fast nederst

## Page Types

### Dashboard (Hjem)
- Struktur: Hero-greeting (italic display) → KPI-strip (asymmetrisk) → moduler i bento → aktivitets-feed
- Hovedelementer: HCP-trend, SG-radar, pyramide-ringer (FYS/TEK/SLAG/SPILL/TURN), neste økt, streak, ukens fokus

### Detail/Profile (360-profil)
- Struktur: Header med avatar + basic stats → tabs (Oversikt/Plan/Sessions/Tests/TrackMan) → tilhørende innhold
- Hovedelementer: Pyramide-ringer, periodiserings-tidslinje, test-deltas

### List (Spillerliste)
- Struktur: Filter-chips horisontalt → tabell med avatar + status-pills + KPI-tall
- Hovedelementer: Søk, filtre (rolle, klubb, tier), sortering, status-indikatorer (grønn/gul/rød)

### Live Session (fullscreen)
- Struktur: Tapper-mode for rask logging av slag. Fullscreen, minimal UI, store tap-targets
- Hovedelementer: Slag-counter, øvelse-progresjon, timer, save-button

## Interaction Patterns

- **Wizard-flyt:** 6-stegs «ny økt» med progress dots, ikke linær progressbar
- **Inline-redigering:** klikk på et tall → edit-modus
- **Tapper-mode:** stor knapp for raskt input (live session)
- **Tabs:** underordnet navigasjon med 2px aktiv-stripe
- **Filter-chips:** horisontal pill-rekke over lister, multi-select
- **Status-pills:** brøk-format (12/16) heller enn prosent

## Content Hierarchy

- **Hero-greeting:** Inter Tight italic, 36px, -0.02em letter-spacing — én per skjerm
- **Seksjonstittler:** Inter Tight bold, 24px, -0.01em
- **KPI-tall:** JetBrains Mono medium, 32–48px, tabular-nums
- **Body:** Inter regular, 15px
- **Labels:** Inter medium uppercase, 12px, 0.04em letter-spacing

## Color Palette

- **Primary:** `#005840` (dyp grønn) — sidebar, primary buttons, aktiv state
- **Accent:** `#D1F843` (lime) — KUN for hero-CTA og kritisk fokus, maks 3 per skjerm
- **Background:** `#FAFAF7` (varm off-white) — hovedflate
- **Card:** `#FFFFFF` — kort
- **Sidebar (PlayerHQ):** `#0A1F18` (mørk grønn-svart)
- **Sidebar (CoachHQ):** `#061210` (enda dypere)
- **Border:** `#E5E7EB`
- **Tekst primær:** `#0A1F17` (nesten svart-grønn)
- **Tekst sekundær:** `#6B7280`
- **Status:** success `#10B981`, warning `#F59E0B`, danger `#EF4444`, info `#3B82F6`

## Screenshot Observations

### hjem-v5-final.html / hjem-v6-glass.html / hjem-v7-alive.html
- 7 iterasjoner av PlayerHQ Hjem eksisterer som HTML
- v6 har glassmorphism (rgba cards + backdrop-blur), v7 har «alive» feel
- **Brukerens kritikk:** «Ser standard AI ut» — for symmetrisk, for generisk dashboard-mønster, for mye lime, ikke nok personlighet

### branding-style-guide.html
- Bekrefter Inter Tight + Inter + JetBrains Mono som kanonisk fontstack
- Anti-AI-regler: asymmetri, sjelden bruk av lime, ekte personlighet (italic editorial element)

## UX Conventions

- **Norsk bokmål** i all UI-tekst (æ, ø, å)
- **Komma som desimaltegn** (78,5 ikke 78.5)
- **Dato:** «7. mai 2026» (norsk format)
- **Tidsformat:** 24-timer (14:00 ikke 2:00 PM)
- **Brøker over prosent:** «12/16 økter» heller enn «75 %»
- **Lucide React** eneste ikon-bib (1.75 stroke)
- **8pt-grid** — alle spacing er multipler av 8px
- **Radius:** 16px på kort, 20px på pills/knapper
- **Anti-AI-regler:**
  - ALDRI 3×1 eller 4×1 uniform grid
  - ALDRI flat avatar-row som primærmønster
  - ALDRI «Welcome back, [Name]!» — bruk italic editorial greeting i stedet
  - Streak-grids og uke-pills foretrukket fremfor generiske progress bars
  - Asymmetrisk bento, ett hero-element, kontrastert hierarki

## Optimization Goal for This Wireframe Pass

Kritikk fra Anders: «Nåværende wireframing ser standard AI ut.»

Mål: lag distinct, editorial, anti-template wireframes som skiller seg fra generiske AI-dashboards. Bryt med 3-kort-rad-mønsteret. Legg inn mer personlighet, asymmetri, og bevisst whitespace. Hver opsjon må svare på «hvordan unngår vi standard AI-look?» med en distinkt strategi.
