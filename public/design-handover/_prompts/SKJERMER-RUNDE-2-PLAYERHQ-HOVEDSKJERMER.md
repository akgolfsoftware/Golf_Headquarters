# Runde 2 — PlayerHQ etter login (18 skjermer)

**Plattform:** Mobil-first (430px). Desktop = 720px sentrert med max-width, samme komponenter.
**Bunn-nav:** 4 tabs (Hjem · Plan · Stats · Profil) alltid synlig nederst
**Status:** Klar til Claude Design

---

## Skjerm-oversikt

| # | Rute | Hva | Hovedkomponenter |
|---|---|---|---|
| 1 | /portal | Hjem-dashboard | player-mobile, featured, kpi, pyramid |
| 2 | /portal/planlegge/workbench | Workbench (kalender) | workbench-sidebar, workbench-week, workbench-day |
| 3 | /portal/stats | Stats-oversikt (default-tab) | stats-sg, kpi, tabbar |
| 4 | /portal/stats/sg | Stats > Strokes Gained | stats-sg, sg-waterfall |
| 5 | /portal/stats/trackman | Stats > TrackMan | trackman-dispersion, trackman-stability, trackman-trend |
| 6 | /portal/stats/tester | Stats > Tester | test-week, queue |
| 7 | /portal/stats/runder | Stats > Runder | sg-waterfall, course-heatmap |
| 8 | /portal/meg | Profil-oversikt | featured, kpi |
| 9 | /portal/meg/innboks | Profil > Innboks | inbox-rader (queue) |
| 10 | /portal/meg/fakturaer | Profil > Fakturaer | queue, subscription |
| 11 | /portal/meg/abonnement | Profil > Abonnement | subscription, credit-indicator |
| 12 | /portal/meg/innstillinger | Profil > Innstillinger | inputs, drag-slider |
| 13 | /portal/runder/ny | Legg til runde (modal) | inputs, course-heatmap |
| 14 | /portal/runder/[id] | Runde-detalj | sg-waterfall, course-heatmap |
| 15 | /portal/drills | Drill-bibliotek | hover-preview, queue |
| 16 | /portal/drills/[id] | Drill-detalj | okt-detail |
| 17 | /portal/tournament/[id] | Turnering-detalj | featured, kpi |
| 18 | /portal/varsler | Varsel-senter | notifications |

---

## 1. /portal — Hjem (dashboard)

**Hva:** Spillerens daglige landing. Dagens økt, KPI, pyramide, neste tee.

### Wireframe (mobil 430px)
```
┌────────────────────────────────────┐
│ [Foto-hero 320px høyde]            │
│  Eyebrow: ONS 28 MAI · OSLO GK     │
│  Pulse-dot + 12°C · vind 3 m/s    │
│                                    │
│  God morgen, Anders                │  ← italic
│  Innspill er der det               │
│  skjer i dag.                      │  ← italic "der", 28px display
│                                    │
├────────────────────────────────────┤
│ FEATURED CARD (full-bredde)        │
│ ┌──────────────────────────────┐  │
│ │ [pulse] DAGENS ØKT · 14:30   │  │  ← lime eyebrow
│ │ Innspill 50-80m               │  │  ← display italic-aksent
│ │ 60 min · 4 drills · CS 80    │  │
│ │ [Start økt →]    (lime pill) │  │
│ └──────────────────────────────┘  │
├────────────────────────────────────┤
│ KPI-STRIP (2 cols mobil)           │
│ ┌──────────┬──────────┐            │
│ │ SG App   │ Drive    │            │
│ │ +0,42    │ 268 m    │            │
│ │ ↑ +0,18  │ ↑ Tour+4 │            │
│ ├──────────┼──────────┤            │
│ │ Fairway  │ Putt 3m  │            │
│ │ 71 %     │ 52 %     │            │
│ │ ↓ −3 %   │ ↑ Tour+4 │            │
│ └──────────┴──────────┘            │
│                                    │
│ [Se alt →]                         │
├────────────────────────────────────┤
│ PYRAMIDE-CARD                       │
│ ┌──────────────────────────────┐  │
│ │ UKE 22 · PYRAMIDEN           │  │
│ │                              │  │
│ │ ████░░░░░░ TURNERING 38 %    │  │
│ │ █████░░░░░ SPILL     52 %    │  │
│ │ ██████░░░░ SLAG      64 %    │  │
│ │ ███████░░░ TEK       72 %    │  │
│ │ ████████░░ FYS       88 %    │  │
│ │                              │  │
│ │ ↑ 4 punkt fra forrige uke    │  │
│ └──────────────────────────────┘  │
├────────────────────────────────────┤
│ NESTE TEE                           │
│ ┌──────────────────────────────┐  │
│ │ FRE 30          OSLO GK      │  │
│ │ Oslo GK · 18 hull            │  │
│ │ 11:24 · Hvit tee · m/ Anders │  │
│ │                            > │  │
│ └──────────────────────────────┘  │
├────────────────────────────────────┤
│ [Bunn-nav 4 tabs]                  │
│  Hjem*  Plan   Stats   Profil      │
└────────────────────────────────────┘
```

### Komponenter brukt
- **components-player-mobile** (foto-hero + greeting m/ italic) — full-bleed bilde med dark gradient
- **components-featured** (dagens økt-card med forest-gradient + lime ball + CTA)
- **components-kpi** (KPI-strip i 2-col mobil, 4-col desktop, mono tall, delta-piler)
- **components-pyramid** (5 horisontale bars i pyramide-aksefarger, tall høyre)
- **components-daycal** (forenklet "neste tee"-rad — dato-blokk venstre + info + chevron)

### Bunn-nav
4 tabs alltid synlig: Hjem (Home-ikon), Plan (Calendar), Stats (BarChart3), Profil (User). Aktiv = lime underline + lime ikon, inaktiv = muted ikon.

### States
- Default (med data): som vist
- Tomstate (ny bruker, 0 økter/runder): se /portal tomstate-spec under
- Loading: skeleton-shimmer på alle cards

### Tomstate (ny bruker)
```
┌────────────────────────────────────┐
│ [Forenklet foto-hero, ingen vær]   │
│  Velkommen, Anders                 │
│  La oss bygge planen din.          │  ← italic
│                                    │
│ [Featured card]                    │
│  Vi har laget en startplan.        │
│  [Se planen →]                     │
│                                    │
│ KPI: alle viser "—"                │
│                                    │
│ PYRAMIDE: tomme bars + tekst       │
│  "Pyramide bygges når du har       │
│   loggført økter."                 │
│                                    │
│ NESTE TEE: "Ingen booking ennå"    │
│  [Book time →]                     │
└────────────────────────────────────┘
```

### Desktop-tilpasning
720px sentrert. KPI-strip blir 4-col i stedet for 2-col. Pyramide og Neste tee kan ligge side-by-side i 2-col grid på desktop.

### Claude Design-prompt
```
Design /portal — PlayerHQ Hjem dashboard. Mobil-first 430px.

Layout (vertikal stack):
1. Foto-hero (player-mobile): 320px høyde, golden-hour fairway, dark gradient overlay
   - Eyebrow lime caps: "ONS 28 MAI · OSLO GK" + pulse-dot + vær-info
   - Greeting italic: "God morgen, [Fornavn]"
   - Display 28px italic-aksent: "Innspill er der det skjer i dag." (italic på "der", primary)

2. Featured card (components-featured): forest-gradient + lime ball blur
   - Eyebrow med pulse-dot: "DAGENS ØKT · 14:30"
   - Tittel italic-aksent
   - Meta: "60 min · 4 drills · CS 80"
   - CTA "Start økt →" (lime pill)

3. KPI-strip (components-kpi): 2-col mobil, 4 KPI:
   - SG App: +0,42 (↑ +0,18 vs forrige)
   - Drive: 268 m (↑ Tour+4)
   - Fairway: 71 % (↓ −3 %)
   - Putt 3m: 52 % (↑ Tour+4)
   "Se alt →" lenke

4. Pyramide-card (components-pyramid): UKE 22-eyebrow + 5 horisontale bars (TURN/SPILL/SLAG/TEK/FYS) + "↑ 4 punkt"-trend

5. Neste tee-card (daycal-rad): dato-blokk + bane + tid + spiller-ref + chevron

6. Bunn-nav: 4 tabs (Hjem/Plan/Stats/Profil), Hjem aktiv

Tomstate (ingen data): forenklet hero uten vær, "Vi har laget en startplan"-melding, KPI alle "—", pyramide tom + forklarende tekst, "Book time"-CTA på Neste tee.

DS-tokens. 8pt-grid. Tabular-nums på alle tall. Norsk komma.
```

---

## 2. /portal/planlegge/workbench — Workbench (kalender)

**Hva:** Mobil-versjon av Workbench. Forenklet — viser uke-visning som default. Sidemeny som slide-over fra venstre.

### Wireframe (mobil)
```
┌────────────────────────────────────┐
│ [☰] WORKBENCH · UKE 22    [+]     │  ← hamburger + ny økt
│ Plan A | Plan B (toggle)           │
├────────────────────────────────────┤
│ Zoom: [År] [Mnd] [Uke*] [Dag]     │  ← pills
│ ← Uke 22                       →   │
├────────────────────────────────────┤
│ UKE-GRID (man-søn vertikal stack)  │
│                                    │
│ MAN 26                             │
│ ┌──────────────────────────────┐  │
│ │ ■ SLAG · Innspill 50-80m     │  │  ← venstre border pyramide-farge
│ │ 60 min · 4 drills · 14:30    │  │
│ │              [Start økt →]    │  │
│ └──────────────────────────────┘  │
│                                    │
│ TIR 27 — Ingen økt                 │  ← hviledag muted
│                                    │
│ ONS 28                             │
│ ┌──────────────────────────────┐  │
│ │ ■ TEK · Sekvens P4-P8        │  │
│ │ 45 min · 3 drills · 16:00    │  │
│ └──────────────────────────────┘  │
│ ┌──────────────────────────────┐  │
│ │ [WANG] ■ SPILL · Gruppeøkt   │  │  ← gruppe-badge
│ │ 90 min · 17:00               │  │
│ │ [✓ Godkjenn] [Avslå]         │  │  ← godkjenn/avslå for gruppe
│ └──────────────────────────────┘  │
│                                    │
│ TOR 29                             │
│ ┌──────────────────────────────┐  │
│ │ ■ FYS · Rotasjonsstyrke      │  │
│ │ 30 min · 08:00               │  │
│ └──────────────────────────────┘  │
│                                    │
│ FRE 30                             │
│ 🏆 Srixon Tour #2 · R1            │
│                                    │
│ ...                                │
├────────────────────────────────────┤
│ [Bunn-nav]                          │
│  Hjem  Plan*  Stats  Profil        │
└────────────────────────────────────┘
```

### Sidemeny-slide-over (åpnes ved klikk på ☰)
```
┌────────────────────────────────────┐
│ [✕] WORKBENCH                      │
│                                    │
│ ▾ Sesong 2026               6 PER │
│   ▸ P1 Forberedelse                │
│   ▼ P3 Bygging mot turnering       │
│     Uke 19                         │
│     Uke 20                         │
│     ● Uke 21 (aktiv)               │
│     Uke 22 · Sør Åpent             │
│                                    │
│ ▾ STANDARDØKTER          + Ny     │
│   ▸ Wedge 50-80m            [≡]   │
│   ▸ Putting 3m              [≡]   │
│                                    │
│ ▾ TURNERINGER · 2026               │
│   Srixon Tour #2          J10     │
│   Nordic League           A40     │
│                                    │
│ ▾ TRENINGSPLANER         + Ny     │
│   ▼ Teknisk                        │
│     ● Sving-optimalisering AKTIV   │
│   ▼ Fysisk                         │
│     ● Vinter-grunntrening AKTIV    │
│                                    │
│ ▾ MÅL                              │
│   HCP < 4 ▓▓▓▓▓▓░░ 72 %           │
│   200 t/år ▓▓▓▓░░░░ 48 %          │
│                                    │
│ ▾ STATS · PYRAMIDE                 │
│   [Komplett pyramide-visning]      │
└────────────────────────────────────┘
```

### Komponenter brukt
- **components-workbench-sidebar** (Notion-stil sidemeny med 7 dropdown-seksjoner)
- **components-workbench-week** (uke-grid, mobil-versjon = vertikal stack per dag i stedet for kolonner)
- **components-workbench-day** (dag-tidslinje 04:00–22:00, brukes når zoom=dag)
- Økt-blokk (venstre-border pyramide-akse, gruppe-badge for gruppetreninger)

### Mobil-tilpasning av Workbench
Den fulle Workbench (sidemeny + kalender + inspector) er desktop-tung. Mobil:
- Sidemeny som slide-over (hamburger åpner)
- Inspector flyttet til separat skjerm (klikk på økt → ny side med detaljer)
- Default zoom = uke (mobil-vennlig), år/måned/dag som alternativer

### Tomstate
Tom uke = "Ingen økter denne uka. Coachen din bygger plan, eller bygg din egen."

### Claude Design-prompt
```
Design /portal/planlegge/workbench for mobil 430px.

Topbar:
- Hamburger (åpner sidemeny som slide-over)
- "WORKBENCH · UKE 22" mono caps
- "+" knapp (ny økt)
- Plan A/B toggle under

Zoom-bar:
- Pills: År / Mnd / Uke (aktiv) / Dag
- Naviger uke: ← Uke 22 →

Uke-grid (vertikal stack på mobil — én dag per blokk):
- Hver dag: dato-eyebrow + økt-cards
- Økt-card: venstre border 3px pyramide-akse-farge + tittel + meta + "Start økt →"
- Gruppetreninger: gruppe-badge (WANG/GFGK/AKA) + godkjenn/avslå-knapper
- Turneringer: full-bredde med Flag-ikon + turnerings-navn
- Hviledag: muted "Ingen økt"

Sidemeny (slide-over fra venstre):
- 7 dropdown-seksjoner: Sesong-tre, Planer A/B, Standardøkter (drag), Turneringer, Treningsplaner, Mål, Stats/pyramide
- Bruker components-workbench-sidebar mønster

Klikk på økt → /portal/tren/[id] (separat skjerm)

DS-tokens. Pyramide-aksefarger på økt-borders.
```

---

## 3. /portal/stats — Stats-oversikt (default)

**Hva:** Default landing på Stats-tab. Toppnivå-KPI + tab-bar til undertabs.

### Wireframe (mobil)
```
┌────────────────────────────────────┐
│ STATS · 2026 · 14 RUNDER           │  ← lime eyebrow
│                                    │
│ HCP −2,6 siden januar.             │  ← display, italic på tallet
├────────────────────────────────────┤
│ [Oversikt*] SG TrackMan Tester Run │  ← tab-bar, scroll-horiz
├────────────────────────────────────┤
│ KPI-STRIP (4 cols 2x2 mobil)       │
│ ┌──────────┬──────────┐            │
│ │ HCP      │ SG TOTAL │            │
│ │ 4,2      │ +0,95    │            │
│ │ ↓ −2,6   │ ↑ +0,3   │            │
│ ├──────────┼──────────┤            │
│ │ RUNDER   │ SNITT    │            │
│ │ 14       │ 73,2     │            │
│ │ siste 90 │ ↓ −1,4   │            │
│ └──────────┴──────────┘            │
├────────────────────────────────────┤
│ HCP-TREND                           │
│ ┌──────────────────────────────┐  │
│ │  [Sparkline + dots]   4,2    │  │
│ │  6,8 ╲                       │  │
│ │   ╲ 6,0                      │  │
│ │    ╲╱ 5,4                    │  │
│ │      ╲ 4,8 ● 4,2 (lime dot)  │  │
│ │  Jan Feb Mar Apr Mai Jun     │  │
│ └──────────────────────────────┘  │
├────────────────────────────────────┤
│ SG-FORDELING · SISTE 5             │
│ ┌──────────────────────────────┐  │
│ │ OTT    ████████░░░░  +0,18  ↑│  │  ← horisontale bars
│ │ APP    ████████████  +0,42  ↑│  │
│ │ ARG    ░░░░████░░░░  −0,12  ↓│  │
│ │ PUTT   ██████░░░░░░  +0,08  →│  │
│ │        ←taper  0  tjener→    │  │
│ └──────────────────────────────┘  │
│ Klikk → drill-down til kategori    │
├────────────────────────────────────┤
│ BROADIE-KONTEKST                    │
│ ┌──────────────────────────────┐  │
│ │ HCP 4,2 → SG Total ≈ −4,0    │  │
│ │                              │  │
│ │ Hvor du taper mest:          │  │
│ │ APP  35 % ████████████        │  │
│ │ OTT  25 % ████████            │  │
│ │ ARG  20 % ██████              │  │
│ │ PUTT 20 % ██████              │  │
│ └──────────────────────────────┘  │
├────────────────────────────────────┤
│ [Bunn-nav]                          │
│  Hjem  Plan  Stats*  Profil        │
└────────────────────────────────────┘
```

### Komponenter
- **components-tabbar** (5 tabs scroll-horiz på mobil, fast på desktop)
- **components-kpi** (2x2 mobil, 4-col desktop)
- HCP-sparkline (custom, eller fra components-trackman-trend mønster)
- **components-stats-sg** (horisontale SG-bars, klikkbare)

### Tomstate
"Statistikk vises når du har logget runder. [Logg første runde →]"

### Claude Design-prompt
```
Design /portal/stats — default landing på Stats-tab.

Header:
- Eyebrow lime: "STATS · 2026 · 14 RUNDER"
- Display 28px italic-aksent: "HCP −2,6 siden januar." (italic på "−2,6", primary)

Tab-bar (components-tabbar):
- 5 tabs: Oversikt (aktiv) / Strokes Gained / TrackMan / Tester / Runder
- Mobil: scroll-horiz, accent-underline aktiv

KPI-strip 2x2 mobil:
- HCP 4,2 (↓ −2,6 i år)
- SG Total +0,95 (↑ +0,3 trend)
- Runder 14 (siste 90 d)
- Snitt 73,2 (↓ −1,4 vs 25)

HCP-trend-card:
- Sparkline SVG, 6 punkter (Jan-Jun), siste = lime dot
- Stort tall høyre: "4,2"
- Klikkbare punkter (popover med dato + score + bane)

SG-fordeling-card:
- 4 horisontale bars (OTT/APP/ARG/PUTT)
- Bars går fra senter (0) — positive høyre primary, negative venstre destructive
- Tall + delta-pil høyre
- Klikk på bar → drill-down til kategori (slide-over panel)

Broadie-kontekst-card:
- "HCP 4,2 → SG Total ≈ −4,0"
- Hvor taper mest: APP/OTT/ARG/PUTT med prosentbars

Bunn-nav: Stats aktiv.

DS-tokens. Mono tabular-nums.
```

---

## 4-7. Stats-undertabs

For å spare plass: hver undertab følger samme topbar (eyebrow + tittel + tab-bar), kun innholdet under endrer seg.

### /portal/stats/sg — Strokes Gained dyp analyse
**Komponenter:** components-stats-sg (radar), components-sg-waterfall (per-hull), components-sg-training-scatter (SG vs trening)

### /portal/stats/trackman — TrackMan dispersion + stability + trend
**Komponenter:** components-trackman-dispersion, components-trackman-stability, components-trackman-trend, components-trackman (sesjonsoversikt)

### /portal/stats/tester — Test-historikk
**Komponenter:** components-test-week, components-queue (tester-liste)

### /portal/stats/runder — Runde-liste + detalj
**Komponenter:** components-queue (rundeliste), components-sg-waterfall (klikk en runde), components-course-heatmap

### Claude Design-prompt (samlet for 4 undertabs)
```
Design 4 undertabs av /portal/stats. Hver bruker samme topbar + tab-bar fra hovedskjermen, kun innholdet under endrer seg.

1. /portal/stats/sg (Strokes Gained):
   - Radar 4 akser (OTT/APP/ARG/PUTT) — components-stats-sg
   - Granulære bøtter (klikkbare bars per kategori med drilldown)
   - Sammenligning mot PGA/KFT/HCP-snitt

2. /portal/stats/trackman:
   - Dispersion-plot (components-trackman-dispersion) — scatter med ellipse
   - Stability-tabs (Bag/Stabilitet/Trend/Sammenlign — components-trackman-stability)
   - Trend per kølle (components-trackman-trend)
   - Drift-deteksjon 12 uker

3. /portal/stats/tester:
   - Tester-liste (components-queue mønster) m/ filter per pyramide-akse
   - Hver test-rad: navn, akse-farge, siste verdi, delta, progresjon-bar
   - Klikk → utvider inline med historikk + sparkline
   - "PLANLAGT · KOMMENDE TESTER"-seksjon nederst

4. /portal/stats/runder:
   - Runde-liste (components-queue) m/ "+ Legg til runde"-CTA top
   - Hver runde: dato + bane + score + SG + ★ for beste
   - Klikk → utvider inline med hull-for-hull SG-fordeling (components-sg-waterfall)
   - "Se slag-for-slag →"-lenke for detaljert kart (components-course-heatmap)

Hver undertab har samme topbar/tab-bar som /portal/stats. Bunn-nav: Stats aktiv.
```

---

## 8. /portal/meg — Profil-oversikt

### Wireframe (mobil)
```
┌────────────────────────────────────┐
│ [Avatar 80px] Anders Kristiansen   │
│ HCP 4,2 · GFGK · Pro 2/4 credits   │
│                                    │
│ Performance Pro · 1300 kr/mnd      │  ← badge
├────────────────────────────────────┤
│ KPI-strip (3 cols)                 │
│ Runder 25  | Beste 68  | Snitt 73,2│
├────────────────────────────────────┤
│ [Innboks 3]  Lucide Inbox + badge │  ← klikkbar rad
│ Coach Markus sendte tilbakemelding │
│ 2 timer siden                      │
├────────────────────────────────────┤
│ [Fakturaer 3 utestående]           │
│ Coaching mai · 3 200 kr · forfall  │
├────────────────────────────────────┤
│ [Bookinger]                         │
│ Tirs 28/5 · Markus · Oslo GK · 14:30│
├────────────────────────────────────┤
│ [Innstillinger →]                  │
│ Profil, fasiliteter, varsler       │
├────────────────────────────────────┤
│ [Abonnement →]                     │
│ Endre plan, betaling, oppgrader    │
├────────────────────────────────────┤
│ [Logg ut]   (destructive, ghost)   │
├────────────────────────────────────┤
│ [Bunn-nav]                          │
│  Hjem  Plan  Stats  Profil*        │
└────────────────────────────────────┘
```

### Komponenter
- **components-player-mobile** (header med avatar + HCP + tier)
- **components-kpi** (3-col KPI)
- **components-queue** (rader til undersider)
- **components-credit-indicator** (badge i header)

### Claude Design-prompt
```
Design /portal/meg — Profil-landing.

Header (player-mobile):
- Avatar 80px sirkulær
- Navn (Inter Tight 24px)
- Meta: "HCP 4,2 · GFGK · Pro 2/4 credits"
- Subscription-badge: "Performance Pro · 1300 kr/mnd"

KPI 3-col: Runder / Beste / Snitt

Liste av klikkbare rader (queue-mønster):
1. Innboks (med badge-tall hvis uleste)
2. Fakturaer (med tall hvis utestående)
3. Bookinger (neste booking-info)
4. Innstillinger
5. Abonnement

Footer:
- "Logg ut" ghost button destructive-farge

Hver rad har Lucide-ikon venstre + tittel + meta-info + chevron-right.

Bunn-nav: Profil aktiv.
```

---

## 9-12. Profil-undersider

### /portal/meg/innboks
**Komponenter:** queue med filter-pills (Alle/Godkjenning/Forespørsel/Råd/Melding)
Inboks-rader: type-ikon + avsender + emne + tid + ulest-dot
Klikk: utvider inline med detalj + svar-felt

### /portal/meg/fakturaer
**Komponenter:** queue av fakturaer (referanse + beskrivelse + beløp + status-badge)
Status: Betalt (ok), Forfaller (warn), Forsinket (urgent)

### /portal/meg/abonnement
**Komponenter:** components-subscription (gjeldende plan-card) + "Endre plan"-lenke
Credit-saldo synlig (components-credit-indicator)

### /portal/meg/innstillinger
**Komponenter:** inputs + drag-slider for fasilitets-profil + checkboxer for varsler

### Claude Design-prompt
```
Design 4 profil-undersider. Hver har topbar med "← Profil" + tittel.

1. /portal/meg/innboks:
   - Filter-pills: Alle / Godkjenning / Forespørsel / Råd / Melding
   - Innboks-rader (queue): type-ikon Lucide + avsender + emne + tid + ulest-dot
   - Klikk = inline expand med full melding + svar-felt + handlingsknapper

2. /portal/meg/fakturaer:
   - Filter: Alle / Utestående / Betalt
   - Faktura-rader: ref + beskrivelse + beløp (mono) + status-badge
   - Klikk = åpne faktura-detalj

3. /portal/meg/abonnement:
   - Gjeldende plan-card (subscription-mønster) med pris + features
   - Credit-saldo (credit-indicator) "2 av 4 credits"
   - "Endre plan →" lenke til abonnement-velger
   - "Avbestill abonnement" (ghost-destructive nederst)

4. /portal/meg/innstillinger:
   - Seksjoner: Profil (navn/e-post/bilde), Fasiliteter (drag-slidere), Varsler (checkboxer), Personvern (lenke til GDPR-side)

Alle med "← Profil" tilbake-link top. Bunn-nav: Profil aktiv.
```

---

## 13. /portal/runder/ny — Legg til runde (modal)

**Komponenter:** components-inputs (bane-søk + dato + score per hull) + course-heatmap (hull-velger)

### Wireframe (mobil, modal)
```
┌────────────────────────────────────┐
│ [✕]  LEGG TIL RUNDE                │
│                                    │
│ BANE                                │
│ ┌──────────────────────────────┐  │
│ │ 🔍 Søk bane...                │  │  ← autocomplete
│ └──────────────────────────────┘  │
│                                    │
│ DATO                                │
│ ┌──────────────────────────────┐  │
│ │ 28.05.2026                    │  │
│ └──────────────────────────────┘  │
│                                    │
│ SCORE PER HULL                      │
│ ┌──────────────────────────────┐  │
│ │ 1  2  3  4  5  6  7  8  9     │  │  ← tall-grid
│ │ 4  3  5  4  4  3  4  5  4     │  │
│ │ ─────────────────────────     │  │
│ │ 10 11 12 13 14 15 16 17 18    │  │
│ │ 4  4  3  5  4  4  5  3  4     │  │
│ └──────────────────────────────┘  │
│                                    │
│ SCORE TIL PAR                       │
│ +2 (74)                            │  ← auto-beregnet
│                                    │
│ SG-INPUT (manuelt, valgfritt)      │
│ OTT  [+0,18]                       │
│ APP  [+0,42]                       │
│ ARG  [−0,12]                       │
│ PUTT [+0,08]                       │
│                                    │
│ NOTAT (valgfritt)                  │
│ ┌──────────────────────────────┐  │
│ │ Beste runden i år, godt på   │  │
│ │ innspill...                  │  │
│ └──────────────────────────────┘  │
│                                    │
│ [Lagre runde →]                    │
└────────────────────────────────────┘
```

### Claude Design-prompt
```
Design /portal/runder/ny som modal/full-screen-skjerm på mobil.

Topbar: ✕ + "LEGG TIL RUNDE"

Form:
- Bane (autocomplete-input m/ Lucide Search)
- Dato (date input)
- Score per hull (9+9 grid med numerisk input)
- Auto-beregnet: Score til par (mono)
- SG-input (valgfri, 4 felt for OTT/APP/ARG/PUTT)
- Notat (textarea)

"Lagre runde →" primary CTA nederst.

Tastatur-optimalisert: numerisk keyboard på score-felt. Stor touch-target per felt.
```

---

## 14. /portal/runder/[id] — Runde-detalj

**Komponenter:** sg-waterfall + course-heatmap + queue (slag-for-slag)

### Wireframe (mobil)
```
┌────────────────────────────────────┐
│ ← Runder                            │
│                                    │
│ LARVIK GK · 18 MAI 2026             │  ← lime eyebrow
│ 72 (−1)  ★ Beste                   │  ← display + badge
├────────────────────────────────────┤
│ SG-FORDELING                        │
│ OTT  +0,32                          │
│ APP  +0,65                          │
│ ARG  −0,15                          │
│ PUTT +0,38                          │
│ Total +1,20                         │
├────────────────────────────────────┤
│ HULL-FOR-HULL (waterfall)           │
│ [components-sg-waterfall:           │
│  18 hull med SG-bar per hull,       │
│  kumulativ linje]                   │
│ Klikk hull → drill til slag         │
├────────────────────────────────────┤
│ BANE-HEATMAP                        │
│ [components-course-heatmap:         │
│  18 mini-greens med SG-tap fargekod]│
│ Klikk → forhåndsvisning             │
├────────────────────────────────────┤
│ [Se slag-for-slag →]                │
│ [Del runde]   [Eksporter]           │
└────────────────────────────────────┘
```

### Claude Design-prompt
```
Design /portal/runder/[id] — runde-detalj.

Topbar: ← Runder

Header:
- Eyebrow lime: "LARVIK GK · 18 MAI 2026"
- Display: "72 (−1)" + AthleticBadge "★ Beste" hvis aktuelt

SG-fordeling-card: 4 verdier + total

SG-waterfall:
- 18 vertikale bars (én per hull), bars over/under 0-linje (positive/negative)
- Kumulativ linje overlay
- Front/Back-toggle
- Hover på hull = SG-bryting (tee/app/arg/putt) + hva som skjedde

Bane-heatmap:
- Mini-heatmap-rekke (18 hull som små greens) med SG-tap fargekodet
- Hover/klikk = forhåndsvisning av hullet

Footer-actions:
- "Se slag-for-slag →" (primary, åpner detaljert kart)
- "Del runde" + "Eksporter" (secondary/ghost)

Bruk components-sg-waterfall + components-course-heatmap.
```

---

## 15-16. /portal/drills og /portal/drills/[id]

### /portal/drills — Drill-bibliotek

**Komponenter:** components-queue + hover-preview + filter-pills per pyramide-akse

### Wireframe (mobil)
```
┌────────────────────────────────────┐
│ DRILL-BIBLIOTEK · 67 DRILLS         │
│                                    │
│ 🔍 Søk drill...                     │
│                                    │
│ Filter:                             │
│ [Alle] FYS TEK SLAG SPILL TURN     │  ← akse-pills
│ [Vanskelighet ▾] [Anlegg ▾]        │
├────────────────────────────────────┤
│ ┌──────────────────────────────┐  │
│ │ ■ SLAG · Innspill            │  │
│ │ Wedge presisjon 50-80m        │  │
│ │ 60 min · 4 trinn · CS 80      │  │
│ │ ★★★★☆ (4,2)                  │  │
│ └──────────────────────────────┘  │
│                                    │
│ ┌──────────────────────────────┐  │
│ │ ■ TEK · Sekvens              │  │
│ │ Stopp-på-toppen P4            │  │
│ │ 30 min · 3 trinn              │  │
│ │ ★★★★★ (4,8)                  │  │
│ └──────────────────────────────┘  │
│                                    │
│ ┌──────────────────────────────┐  │
│ │ ■ FYS · Power                │  │
│ │ Kettlebell-sving              │  │
│ │ 4×8 · 16 kg · rotasjonell    │  │
│ │ ★★★★★ (4,9)                  │  │
│ │ ⚡ Sterk CHS-kobling          │  │
│ └──────────────────────────────┘  │
└────────────────────────────────────┘
```

### /portal/drills/[id] — Drill-detalj
**Komponenter:** components-okt-detail (drill-detalj med trinn-beskrivelse + media)

### Claude Design-prompt
```
Design /portal/drills (bibliotek) + /portal/drills/[id] (detalj).

Bibliotek:
- Header: tittel + tall (67 DRILLS)
- Søkefelt
- Filter-rad: pyramide-akse-pills (Alle/FYS/TEK/SLAG/SPILL/TURN) + vanskelighet + anlegg
- Drill-cards: venstre-border pyramide-farge + tittel + meta + rating-stars
- CHS-kobling-badge ("⚡ Sterk CHS-kobling") for relevante FYS-drills
- Klikk = /portal/drills/[id]

Detalj (components-okt-detail mønster):
- Topbar: ← Bibliotek + drill-navn
- Hero: pyramide-akse-farge banner + tittel italic-aksent + meta
- Beskrivelse-tekst
- Trinn-liste (numerisk)
- Media: foto/video hvis tilgjengelig
- Parametere-tabell: reps, tid, CS, kølle, miljø
- "Legg til i plan →" primary CTA
- Coach-notater hvis tilgjengelig

Filtrer drills basert på spillerens fasilitets-profil (skjul/dim de som krever utstyr de ikke har).
```

---

## 17. /portal/tournament/[id] — Turnering-detalj

### Wireframe (mobil)
```
┌────────────────────────────────────┐
│ ← Turneringer                       │
│                                    │
│ 🏆 SRIXON TOUR #2                   │
│ 30 MAI — 1 JUN · OSLO GK            │
│                                    │
│ [Featured banner med bane-foto]    │
│                                    │
│ STATUS: PÅMELDT ✓                   │
│ START: FREDAG 11:24                 │
├────────────────────────────────────┤
│ DIN STATUS                          │
│ Klasse: Herre A                     │
│ Tee: Hvit                           │
│ Forventet HCP-utvikling: +0,2       │
├────────────────────────────────────┤
│ FORBEREDELSE                        │
│ ☑ Banerecon utført                  │
│ ☑ Pre-shot rutine trent             │
│ ☐ Pakke utstyr                      │
│ ☐ Sjekk vær (oppdatert daglig)      │
├────────────────────────────────────┤
│ HISTORISK ALLE TIDLIGERE TURNERINGER │
│ 2025  topp 8                        │
│ 2024  topp 14                       │
├────────────────────────────────────┤
│ [Avmeld] [Se starttid]              │
└────────────────────────────────────┘
```

### Claude Design-prompt
```
Design /portal/tournament/[id] — turnering-detalj.

Header:
- ← Turneringer
- Trophy-ikon + navn
- Dato + bane

Featured-banner med foto.

Status-card: PÅMELDT (ok-badge) + start-tid

Din status-card: klasse, tee, forventet HCP-effekt

Forberedelse-checklist (interaktiv — krysse av etter hvert som ting gjøres)

Historisk-card: hvis spilleren har spilt turneringen før, vis tidligere resultater

Footer: "Avmeld" (ghost destructive) + "Se starttid" (primary)
```

---

## 18. /portal/varsler — Varsel-senter

**Komponenter:** components-notifications

### Wireframe (mobil)
```
┌────────────────────────────────────┐
│ ← Tilbake                           │
│                                    │
│ VARSLER · 7 NYE                     │
├────────────────────────────────────┤
│ I DAG                               │
│ ┌──────────────────────────────┐  │
│ │ ⚡ Plan-vakten              ●│  │  ← ulest dot
│ │ Plan justert: fjernet         │  │
│ │ overlapp i uke 22             │  │
│ │ 2 t siden                     │  │
│ └──────────────────────────────┘  │
│                                    │
│ ┌──────────────────────────────┐  │
│ │ 🏆 Turnering-agent            │  │
│ │ Srixon Tour #2 påmelding      │  │
│ │ stenger om 3 dager            │  │
│ │ 5 t siden                     │  │
│ └──────────────────────────────┘  │
│                                    │
│ I GÅR                               │
│ ┌──────────────────────────────┐  │
│ │ 📊 Runde-agent                │  │
│ │ Larvik GK 72 (−1) · +1,20 SG │  │
│ │ ★ Beste runde i år            │  │
│ │ 1 d siden                     │  │
│ └──────────────────────────────┘  │
│                                    │
│ [Vis eldre →]                       │
└────────────────────────────────────┘
```

### Claude Design-prompt
```
Design /portal/varsler — varsel-senter.

Topbar: ← Tilbake + "VARSLER · 7 NYE"

Grupper varsler per tid: I DAG / I GÅR / DENNE UKA / ELDRE.

Varsel-card (components-notifications):
- Agent-ikon Lucide (Zap for plan-vakt, Trophy for turnering, BarChart3 for runde, etc.)
- Agent-navn (mono caps eyebrow)
- Beskrivelse av varselet
- Tidsstempel relativt
- Ulest-dot lime hvis ulest

"Vis eldre →" footer-lenke.

Klikk på varsel = utfører handling (se plan, åpne runde, etc.)
```

---

## Leveranse-status

**Levert Runde 2:** 18 PlayerHQ-skjermer etter login.

**Total levert hittil:** 31 skjermer (Runde 1: 13 + Runde 2: 18).

**Neste (Runde 3):** Live Session fullscreen (4 skjermer) — mobil-kritisk, separat fra Workbench.

Si "OK Runde 2" så starter Runde 3.
