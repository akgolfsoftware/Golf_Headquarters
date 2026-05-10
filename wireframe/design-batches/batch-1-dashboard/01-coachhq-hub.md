# AK Golf Platform — CoachHQ — Hub Dashboard

## Identitet

- **Produkt:** CoachHQ
- **URL:** `/admin/hub`
- **Arketype:** A — Dashboard
- **Tier-gating:** Ikke relevant (kun coach/admin har tilgang)
- **HTML-referanse:** `wireframe/screen-deck/coachhq/hub.html` (lastet opp som vedlegg)
- **Tilhørende modaler i denne pilot-batchen:** Ingen — modaler designes i egen batch

## Designsystem

Bruk `design-system-v2.md` som er lastet opp som system-kontekst. Eksakte token-navn — IKKE hardkode hex-verdier eller font-størrelser.

**Krav:**
- 8pt-grid for all spacing (8, 16, 24, 32, 40, 48, 64)
- Lucide-ikoner (24px, 1.5px stroke, currentColor)
- Norsk bokmål, æ/ø/å, komma som desimaltegn, 24-timer
- Ingen emojier
- Maks 3 lime (`accent`) elementer synlige
- Asymmetrisk bento-grid (ikke 3×1 uniform)

## Spec — hva skjermen er for

CoachHQ Hub er **morgen-checkpoint** for coach. Vises alltid først ved innlogging. Skal svare på: "Hva trenger jeg å gjøre i dag?" Inneholder:

- Hero-greeting (italic Inter Tight) — personlig, editorial
- KPI-strip (asymmetrisk 4 kort)
- Bento-modulrad — løse handlingsbare ting (godkjenninger, meldinger, spillere uten plan)
- Aktivitets-feed (siste 24 timer)

**Hovedformål:** Klikk → handling. Ingen "lesemodus" — alle kort er CTAs.

## Layout-anvisning (parsed fra HTML)

- **Sidebar (240px, `--color-coach-sidebar` = `#061210`)**
  - 12 nav-lenker med lucide-ikoner: Hub (active, accent-stripe), Daglig Brief, Treningsplaner, Elever, Coaching Board, Godkjenninger, Bookinger, Tester, Analytics, Økonomi, Fasiliteter, Innstillinger
  - Avatar nederst (Anders K.) med popover-trigger

- **Hovedinnhold**
  - **Hero (top)**
    - Italic Inter Tight 36px: «{Editorial-greeting basert på tid på dagen}» — f.eks. *"Onsdag morgen. 38 spillere venter."*
    - Sub: «{Dato} · {Antall} aktive økter i dag»
  - **KPI-strip (4 asymmetriske kort)**
    - Kort 1 (større): Aktive spillere — stort tall + brøk (32/38)
    - Kort 2: Snitt SG-trend — sparkline
    - Kort 3: Belegg neste 7 dager — % som donut
    - Kort 4: Inntekt MTD — JetBrains Mono tall + trend-pil
  - **Bento-modulrad (6 handlings-kort, asymmetrisk grid)**
    - Stor (2-bred): Godkjenninger · 3 plan-aksjoner venter
    - Liten: Uleste meldinger · 5 fra spillere
    - Liten: Spillere uten plan · 4 av 38
    - Liten: Tester forfaller · 7 denne uka
    - Liten: Utestående faktura · 3 200 kr
    - Liten: Tournament-watch · Sørlandsåpent (om 12 dager)
  - **Aktivitets-feed (full bredde, 5 siste rader)**
    - Hver rad: tidsstempel, ikon, beskrivelse, status-pill (Ny / Godkjent / Bekreftet / SLA-rød)
    - "Se alle →" link til `/admin/activity-log`

## Klikkbare elementer som må designes (states)

| Element | States å designe |
|---|---|
| Sidebar-lenker (12) | default, hover, active per lenke |
| Hver bento-card | default, hover (lift + accent-border), focus, loading (skeleton) |
| KPI-kort (klikkbare) | default, hover (subtil løft) |
| "Se alle →" link | default, hover, focus |
| Aktivitets-rad | default, hover, klikk → row-detail-popover |
| Status-pill | default-per-status (Ny/Godkjent/Bekreftet/SLA-rød) |
| Avatar (sidebar bunn) | default, hover, popover-open |
| Notifikasjons-pulse (rød prikk) | static + pulse-animasjon |

## Empty / loading / error-states

- **Empty (ingen aktivitet i dag):** Vis hero + KPI normalt, men aktivitets-feed viser empty-state med "Stille dag — ingen nye hendelser ennå" + lucide `Inbox`-ikon
- **Loading:** KPI-strip skeleton (4 grå kort), bento-cards skeleton (6 grå kort), feed skeleton (5 grå rader)
- **Error:** Per-kort error med retry-knapp ("Kunne ikke hente. Prøv igjen") — ikke full-page error

## Ønsket output fra Claude Design

1. Hovedskjerm i lyst tema (default)
2. Hovedskjerm i mørkt tema
3. Hover-states vist på en bento-card og en aktivitets-rad
4. Loading-state som egen variant
5. Empty-state-variant for aktivitets-feed
6. Mobil-versjon (≤768px) — sidebar collapsed til bunnav (hamburger top-left), KPI-strip stables 2×2, bento går til 1-kolonne

## Ikke-mål

- Ikke designe modaler i denne pakken (dekkes senere)
- Ikke endre IA fra HTML-wireframe (12 sidebar-lenker, 6 bento-cards, asymmetrisk struktur)

## Når du er ferdig

Lim **design-link** tilbake til Claude Code. Jeg setter status `REVIEW` i tracker.
