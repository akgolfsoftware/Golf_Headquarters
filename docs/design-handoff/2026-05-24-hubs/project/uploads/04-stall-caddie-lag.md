# Prompt — Stall, Caddie-hub og Lag-snitt (CoachHQ komplett)

> **Bruk:** Lim inn `00-design.md` FØRST i Claude Design (eller v3-bundlens design-system). Deretter lim inn alt etter linjen nedenfor.

---

Lag én komplett, standalone HTML-fil for **AK Golf CoachHQ — Stall, Caddie-hub og Lag-snitt** (4 skjermer i samme dokument, koblet via toggling-state). Desktop-skjerm 1600×variabel høyde. Single self-contained `.html` med inline `<style>`, Google Fonts via `<link>`, alle ikoner inline SVG (Lucide-stil stroke 1.75).

**Følg AK Golf design system STRENGT** (cream `#FAFAF7`, forest `#005840`, lime `#D1F843`, Inter Tight + Inter + JetBrains Mono + Instrument Serif italic, Lucide-ikoner stroke 1.75, INGEN emojier, norsk bokmål).

## Hva skjermen er

4 skjermer i CoachHQ som henger sammen som Anders sin operasjonelle ryggrad. Bruker bytter mellom dem via tab-bar i hero — kan også linkes direkte via rute.

1. **`/admin/stall`** — komplett roster av Anders' 38 spillere
2. **`/admin/agencyos/caddie`** — caddie-hub (alle caddier under AgencyOS)
3. **`/admin/agencyos/caddie/aktivitet`** — caddie-aktivitet-feed
4. **`/admin/lag-snitt`** — lag-statistikk-dashboard (gjennomsnitt + benchmark)

**Persona:** Anders Kristiansen — Head coach AK Golf Academy, 38 aktive spillere, default Performance Studio på GFGK.

## Layout (felles chrome for alle 4 skjermer)

### Chrome
- **Sidebar 220px** (forest bg): "AK GOLF / COACHHQ · PRO" + Anders-profil + nav-grupper
  - DAGLIG (Hub, I dag)
  - OPERASJON (Anlegg, Stall [aktiv], AgencyOS [aktiv ved caddie-skjermer])
  - INNSIKT (Lag-snitt [aktiv på lag-skjerm], Økonomi)
- **Topbar 56px**: ⌘K + breadcrumb dynamisk + role-toggle (Coach/DL/Admin)

### Hero (80px, dynamisk per skjerm)
Title med Instrument Serif italic på ett ord per skjerm:
- Stall: `Min ` + italic `*stall*` + ` — 38 spillere, kontrakt og inntekt`
- Caddie: `AgencyOS ` + italic `*caddie*` + ` — bookinger, kommisjon og dekning`
- Aktivitet: `Caddie-` + italic `*aktivitet*` + ` — feed siste 30 dager`
- Lag-snitt: `Lag-` + italic `*snitt*` + ` — pyramide, HCP-distribusjon, benchmark`

### Tab-bar under hero (44px)
Segmented control som styrer hvilken av de 4 skjermene som vises:
- `STALL` (default)
- `CADDIE-HUB`
- `CADDIE-AKTIVITET`
- `LAG-SNITT`

---

## SKJERM 1: `/admin/stall` — Roster (default)

### Eyebrow + hero-actions
- Eyebrow JetBrains Mono uppercase: `STALL · 38 SPILLERE · 32 AKTIVE KONTRAKTER · 4 PROSPEKTER · 2 PAUSE`
- 4 hero-actions:
  1. `+ Legg til spiller` (lime, primary)
  2. `Eksporter roster` (forest)
  3. `Filtre` (outline)
  4. `Bulk-handlinger` (outline)

### Filter-bar (60px)
6 grupper:
1. **Status**: Alle · Aktiv · Pause · Prospekt · Avsluttet
2. **Tier**: Alle · Pro 300 kr · Gratis · Pro Annual
3. **Kategori**: A1 · A2 · B1 · B2 · B3 (pills)
4. **Coach**: Anders · Erik · Maja · Alle
5. **HCP-spenn**: range-slider `−5,0` til `36,0`
6. **Søk**: tekstfelt med Lucide Search

### Roster-tabell (full bredde)
Klikkbar rad → spiller-detalj (peker til `/admin/spiller/[id]`).

Kolonner (sorterbare):
1. **Spiller** — portrett 32px (sirkel) + navn Inter Tight 14px + initialer fallback
2. **Kategori** — pill (A1=lime, A2=forest, B1=cream, B2=muted, B3=outline)
3. **HCP** — mono `+3,5` / `−1,2` / `12,4` (minus-tegn `−`)
4. **Hjemmebane** — small mono (GFGK, Bossum, Onsoy)
5. **Kontrakt** — badge (`AKTIV` lime · `PAUSE` cream · `PROSPEKT` outline · `AVSLUTTET` muted)
6. **Tier** — pill mono (`PRO 300/mnd` forest · `GRATIS` outline · `PRO ANNUAL` lime)
7. **Neste turnering** — dato mono `16. juni` + sub navn
8. **Inntekt MTD** — mono `4 800 kr` (høyrejustert)
9. **Siste aktivitet** — mono relativ `for 2 t siden` / `i går 14:30`
10. **Handling** — Lucide MoreHorizontal (åpner kontekst-meny)

### Eksempel-rader (vis 12 av 38, med "Vis 26 til")

| Spiller | Kat | HCP | Hjemme | Kontrakt | Tier | Neste turnering | MTD | Sist |
|---|---|---|---|---|---|---|---|---|
| Markus Røinås Pedersen | A1 | +3,5 | GFGK | AKTIV | PRO 300 | 16. juni · Sørlandsåpent | 4 800 kr | for 2 t siden |
| Joachim Tangen | A1 | +1,2 | GFGK | AKTIV | PRO 300 | 22. juli · NM Slag | 3 600 kr | for 6 t siden |
| Henrik Vorli | A1 | +0,4 | Bossum | AKTIV | PRO 300 | 3. juni · Srixon Tour 2 | 3 600 kr | i går 18:20 |
| Øyvind Røhjan | A1 | +3,5 | GFGK | AKTIV | PRO ANNUAL | 11. juli · Nordic Junior | 0 kr | 18. mai |
| Ida Mathisen | A2 | 3,1 | GFGK | AKTIV | PRO 300 | 14. mai · Vår-cup GFGK | 2 400 kr | for 4 t siden |
| Emma Sundsdal | A2 | 4,8 | Onsoy | AKTIV | PRO 300 | 28. mai · Onsoy Open | 2 400 kr | i går 16:40 |
| Sigrid Berg | B1 | 8,2 | GFGK | AKTIV | PRO 300 | 18. juni · Bossum Open | 2 400 kr | for 8 t siden |
| Nora Lillevold | B2 | 12,4 | GFGK | AKTIV | GRATIS | — | 0 kr | 16. mai |
| Tobias Vinje | A1 | +2,1 | GFGK | PROSPEKT | GRATIS | 16. juni · Sørlandsåpent | 0 kr | i dag 09:14 |
| Lars Mehus | A2 | 5,4 | Onsoy | PAUSE | PRO 300 | — | 0 kr | 12. mai |
| Pia Solberg | B1 | 9,7 | GFGK | AKTIV | PRO 300 | 2. juli · Asker Sommer | 2 400 kr | for 1 t siden |
| Vetle Aabø | B2 | 14,2 | Bossum | AKTIV | GRATIS | — | 0 kr | 17. mai |

### Bunn-rad (sticky under tabell)
- Venstre: `38 spillere · 32 aktive · 6 inaktive · Total MTD: 92 400 kr` mono
- Senter: pyramide-balanse-bar (5 disipliner gjennomsnitt på tvers av stallen)
- Høyre: `Eksporter til Notion` (outline) + `Send månedsrapport` (forest)

---

## SKJERM 2: `/admin/agencyos/caddie` — Caddie-hub

### Eyebrow + hero-actions
- Eyebrow: `AGENCYOS · CADDIE · 11 CADDIER · 7 AKTIVE BOOKINGER · KOMMISJON MTD 14 200 KR`
- Actions:
  1. `+ Ny caddie` (lime, primary)
  2. `Match caddie til turnering` (forest)
  3. `Filtre` (outline)
  4. `Eksporter` (outline)

### Layout
To-kolonne grid: venstre 60% caddie-liste, høyre 40% detalj-panel.

### Venstre: Caddie-cards (én per caddie)

Hver card (rounded-lg 16px, hvit bg, border):

**Topp-rad (32px):**
- Venstre: portrett 36px (sirkel) + navn Inter Tight 16px + initialer mono small under
- Senter: tilgjengelighet-badge (`LEDIG` lime · `BOOKET` forest · `UNDER FORHANDLING` cream · `UTILGJENGELIG` muted)
- Høyre: kommisjons-status mono `+2 400 kr i juni`

**Hovedrad (~70px):**
- Discipline-fokus pills: `SLAG` `SPILL` (det caddien er sterk på)
- Stat-strip mono: `12 turneringer · snitt T14 · 4 hovedmål-bookinger`
- Hjemmeklubb og base: `GFGK · Fredrikstad-området`

**Neste turnering-rad (40px):**
- Lucide Calendar-ikon + dato mono `16. juni 2026`
- Sub: `Sørlandsåpent · Markus Røinås Pedersen · 3 dager · 8 400 kr brutto`
- Status-pill `BEKREFTET` lime

**Action-rad bunn:**
- `Detaljer` (outline)
- `Book til turnering` (outline)
- `Send melding` (outline)
- `Avregn kommisjon` (forest)

### Eksempel-data (11 caddier, vis 6 + "Vis 5 til")

1. **Tobias Vinje** — `LEDIG` (men `BOOKET` 16.-18. juni for Markus) — SLAG, SPILL — 12 turneringer · snitt T14 · 4 hovedmål · neste: 16. juni Sørlandsåpent med Markus R.P. · `+2 400 kr i juni`
2. **Aksel Strand** — `BOOKET` — TEK, SLAG — 8 turneringer · snitt T22 · neste: 22. juli NM Slag med Joachim T. · `+1 800 kr i juni`
3. **Mari Eide** — `LEDIG` — SLAG, TURN — 6 turneringer · snitt T18 · neste: 3. juni Srixon Tour 2 med Henrik V. · `+0 kr i juni`
4. **Sondre Vik** — `UNDER FORHANDLING` — SLAG, SPILL — 9 turneringer · snitt T25 · neste: 28. mai Onsoy Open med Emma S. · `+0 kr i juni`
5. **Live Holm** — `LEDIG` — SPILL, TURN — 4 turneringer · snitt T20 · neste: — · `+0 kr i juni`
6. **Jonas Riise** — `UTILGJENGELIG` (skadet til 1. juli) — SLAG — 7 turneringer · snitt T16 · neste: — · `+0 kr i juni`

### Høyre: Detalj-panel (når caddie valgt)

Header med portrett + navn Inter Tight 22px + status-badge.

**Stat-grid (4 KPI-bobler):**
- Turneringer i år: `12`
- Snitt-plassering: `T14`
- Hovedmål-bookinger: `4`
- Kommisjon YTD: `18 400 kr`

**Kommende bookinger (liste, max 5):**
- 16. juni — Sørlandsåpent — Markus R.P. — `BEKREFTET` lime — 8 400 kr brutto
- 11. juli — Nordic Junior — Øyvind R. — `FORESPURT` cream — 6 200 kr brutto

**Match-vurdering (AI-strip lime-pastell):**
> **Anders sier:** Tobias har solid SLAG-track-record på Mandalkrysset (T8, T12 i 2024-2025). God match for Markus' Sørlandsåpent.

**Historikk-tabell (siste 5 turneringer):**
| Dato | Turnering | Spiller | Plass | Brutto |
|---|---|---|---|---|
| 12. mai | Vår-cup GFGK | Markus R.P. | T4 | 1 800 kr |
| 28. apr | Påske-cup | Joachim T. | T8 | 1 800 kr |
| 18. apr | GFGK Open | Markus R.P. | T2 | 2 200 kr |
| 5. apr | Sesong-åpning | Ida M. | T11 | 1 600 kr |
| 28. mar | Vinter-cup | Henrik V. | T6 | 1 800 kr |

**Action-rad:**
- `Send forespørsel` (lime, primary)
- `Se kalender` (outline)
- `Endre tilgjengelighet` (outline)

---

## SKJERM 3: `/admin/agencyos/caddie/aktivitet` — Aktivitet-feed

### Eyebrow + hero-actions
- Eyebrow: `AKTIVITET · 142 HENDELSER SISTE 30 DAGER · 4 KREVER HANDLING`
- Actions:
  1. `Filtre` (outline)
  2. `Marker alle som lest` (outline)
  3. `Eksporter feed` (outline)
  4. `Auto-regler` (forest)

### Filter-bar (50px)
Segmented:
- **Type**: Alle · Booking · Score · Betaling · Melding · Konflikt
- **Caddie**: dropdown multiselect
- **Periode**: I dag · Uke · Måned · Sesong
- **Status**: Alle · Krever handling · Behandlet

### Feed-layout
To-kolonne: venstre 65% feed-liste, høyre 35% detalj/handling.

### Feed-elementer (kronologisk omvendt)

Hver rad (60-80px):
- **Venstre 80px**: Tidsstempel mono `i dag 14:32` / `i går 09:14` / `18. mai 22:10` + relativ small under
- **Senter 36px**: Lucide-ikon i sirkel basert på type:
  - Booking: `CalendarCheck` lime bg
  - Score: `Trophy` forest bg
  - Betaling: `CreditCard` lime bg
  - Melding: `MessageSquare` cream bg
  - Konflikt: `AlertTriangle` rød bg
- **Hovedinnhold**: 
  - Tittel Inter 14px: `Tobias Vinje bekreftet booking 16. juni`
  - Sub mono 12px: `Sørlandsåpent · Markus Røinås Pedersen · 8 400 kr`
- **Høyre**: action-knapp eller status-pill

### Eksempel-feed (10 elementer)

1. `i dag 14:32` · **Booking** · Tobias Vinje bekreftet booking 16. juni — Sørlandsåpent · Markus R.P. · 8 400 kr · `BEKREFTET` lime
2. `i dag 12:18` · **Score** · Aksel Strand rapporterte score for Vår-cup GFGK — Joachim T. T6 (−1, +0) · `SE DETALJER` outline
3. `i dag 09:14` · **Melding** · Mari Eide spurte om endring av tid 3. juni — Henrik V. · Srixon Tour 2 · `SVAR` lime
4. `i går 22:10` · **Betaling** · Kommisjon 1 800 kr utbetalt til Tobias Vinje — Vår-cup GFGK · `FERDIG` muted
5. `i går 18:40` · **Konflikt** · Sondre Vik dobbelt-booket 28. mai — Onsoy Open + Tirsdagsturnering · `LØS NÅ` rød
6. `i går 14:02` · **Booking** · Live Holm sendte forespørsel — 18. juni Bossum Open · Sigrid B. · `VURDER` cream
7. `18. mai 16:20` · **Score** · Tobias Vinje rapporterte Påske-cup — Markus R.P. T4 (−2, −1) · `SE DETALJER` outline
8. `18. mai 11:14` · **Betaling** · Faktura sendt til Markus R.P. for caddie-tjenester april · 7 200 kr · `BETALT` lime
9. `17. mai 19:50` · **Booking** · Aksel Strand avbestilte 21. mai Tirsdagsturnering — Joachim T. · `AVBESTILT` muted
10. `17. mai 09:00` · **Melding** · Daglig-leder GFGK ba om caddie-statistikk Q2 · `LASTET NED` muted

### Høyre: Detalj-panel (når event valgt)
Vis full kontekst:
- Hvilken caddie, hvilken spiller, hvilken turnering
- Hele meldings-tråden hvis melding-type
- Score-detaljer hvis score-type
- Faktura-detaljer hvis betaling-type
- Action-knapper: `Svar`, `Marker som behandlet`, `Eskaler til Anders`, `Arkiver`

---

## SKJERM 4: `/admin/lag-snitt` — Lag-statistikk-dashboard

### Eyebrow + hero-actions
- Eyebrow: `LAG-SNITT · 38 SPILLERE · 5 KATEGORIER · BENCHMARK MOT 4 AKADEMIER`
- Actions:
  1. `Eksporter PDF` (lime, primary)
  2. `Sammenlign perioder` (forest)
  3. `Filtre` (outline)
  4. `Del med klubbstyret` (outline)

### Layout
Grid 12-kolonner med fire seksjoner:

### Seksjon 1: Pyramide-balanse (12 kol bred, 280px høy)
Custom SVG horisontal stacked bar:
- Tittel Inter Tight 18px: `Pyramide-balanse — gjennomsnitt hele stallen`
- 5 segmenter (FYS, TEK, SLAG, SPILL, TURN) med diskiplin-farger
- Eksempel-fordeling: FYS 18% · TEK 28% · SLAG 24% · SPILL 18% · TURN 12%
- Hver segment har label mono inni + spillere-bidrag tooltip on hover
- Under: sub-bars per kategori (A1, A2, B1, B2, B3) — vis hvordan balansen varierer
- Mini-legende: hvor balansen avviker fra ideal-balanse

### Seksjon 2: HCP-distribusjon (6 kol, 320px høy)
Custom SVG histogram:
- X-akse: HCP-bins (`−5 til −2` · `−2 til 0` · `0 til 3` · `3 til 6` · `6 til 12` · `12 til 18` · `18+`)
- Y-akse: antall spillere mono
- Bar-farge: forest med lime-highlight på modus-bar
- Eksempel-fordeling:
  - −5 til −2: 4 spillere
  - −2 til 0: 6 spillere
  - 0 til 3: 9 spillere (modus, lime)
  - 3 til 6: 7 spillere
  - 6 til 12: 8 spillere
  - 12 til 18: 3 spillere
  - 18+: 1 spiller
- Median-linje vertikal mono label `Median: 2,4`
- Snitt-linje stiplet mono label `Snitt: 3,8`

### Seksjon 3: Kategori-fordeling (6 kol, 320px høy)
Custom SVG donut chart:
- 5 segmenter (A1, A2, B1, B2, B3)
- Eksempel: A1 26% (10 sp) · A2 21% (8 sp) · B1 24% (9 sp) · B2 21% (8 sp) · B3 8% (3 sp)
- Senter mono `38 / SPILLERE`
- Legende høyre med spillere per kategori og inntekt-bidrag MTD

### Seksjon 4: Benchmark mot andre akademier (12 kol, 360px høy)
Custom SVG radar chart eller grouped bar:
- 5 akser: FYS · TEK · SLAG · SPILL · TURN
- AK Golf Academy (lime, fyllt) vs benchmark-snitt (forest stiplet)
- Sammenlignings-akademier: Norsk Eliteklubb-snitt · Olympiatoppen junior · Internasjonal akademi-benchmark
- Tabell under radar (4 rader x 5 kolonner) med eksakte tall mono:

| Akademi | FYS | TEK | SLAG | SPILL | TURN |
|---|---|---|---|---|---|
| AK Golf Academy | 7,2 | 8,1 | 7,8 | 6,9 | 7,4 |
| Norsk Elite-snitt | 6,8 | 7,4 | 7,1 | 6,8 | 6,2 |
| Olympiatoppen Jr. | 8,4 | 8,2 | 7,9 | 7,6 | 8,1 |
| Internasjonal Ø1 | 8,8 | 8,6 | 8,2 | 7,9 | 8,4 |

### AI-insight-strip (lime-pastell, 80px under benchmark)
> **Anders sier:** Stallen er sterk på TEK og SLAG sammenlignet med norsk elite-snitt, men ligger 0,8 under Olympiatoppen på FYS. Anbefaler å øke FYS-andel fra 18% til 22% over neste 6 måneder.
> CTA: `Lag oppfølgings-plan` (lime) · `Vis spillere med svak FYS` (outline)

---

## Sticky footer (64px, felles for alle 4 skjermer)

- **Venstre**: Mini-pyramide-balanse-bar (5 disipliner gjennomsnitt på tvers av stallen) med prosent-labels
- **Senter**: Kontekst-status:
  - Stall-skjerm: `38 spillere · 32 aktive · MTD 92 400 kr`
  - Caddie-skjerm: `11 caddier · 7 aktive bookinger · Kommisjon MTD 14 200 kr`
  - Aktivitet-skjerm: `142 hendelser · 4 krever handling`
  - Lag-snitt-skjerm: `Snitt-HCP 3,8 · 26% i A1-kategori · Benchmark: +0,4 over norsk elite`
- **Høyre**: 
  - `Spør Coach Anders` (outline + Sparkles)
  - Kontekst-CTA (lime): `+ Spiller` / `+ Caddie` / `Marker alle lest` / `Eksporter PDF`

---

## Modaler (vis minst 2)

### Modal 1: + Legg til spiller (fra Stall-skjerm)
Felt:
1. Navn — fritekst
2. E-post + mobil
3. HCP — mono number
4. Hjemmebane — søk klubb
5. Kategori — A1/A2/B1/B2/B3 radio
6. Coach — Anders default, Erik, Maja
7. Tier — Gratis / Pro 300 kr / Pro Annual
8. Discipline-fokus — multiselect (FYS/TEK/SLAG/SPILL/TURN)
9. Notat — fritekst
CTA: `Legg til + send velkomst` (lime) · `Legg til` (forest) · `Avbryt` (outline)

### Modal 2: Avregn kommisjon (fra Caddie-hub)
Felt:
1. Caddie — pre-utfylt
2. Periode — mai 2026 dropdown
3. Bookinger inkludert — multiselect (default: alle ubehandlede)
4. Brutto-sum — auto-beregnet mono
5. Kommisjons-prosent — slider (default 20%)
6. Netto-utbetaling — mono auto
7. Utbetalings-metode — Vipps / Konto / Stripe
CTA: `Utbetal nå` (lime) · `Planlegg neste fredag` (forest) · `Avbryt` (outline)

---

## Branding (følger AK Golf design system)

- BG cream `#FAFAF7`
- Card hvit `#FFFFFF` med border `#E5E3DD`
- Primary forest `#005840`, accent lime `#D1F843`
- Discipline-pills bruker FYS/TEK/SLAG/SPILL/TURN-farger
- Kategori-farger: A1 lime · A2 forest · B1 cream · B2 muted · B3 outline
- Inter Tight (titler), Inter (UI), JetBrains Mono (alle tall, dato, klokkeslett, score, beløp)
- Instrument Serif italic sparsomt — kun ett ord per hero
- 16px radius cards, 12px buttons, 999px pills
- INGEN emojier, kun Lucide-ikoner stroke 1.75
- Norsk bokmål gjennomgående

## Tekniske krav

- Single self-contained `.html`
- Inline `<style>` block
- Google Fonts via `<link>`
- All icons inline Lucide SVG (stroke 1.75)
- Custom SVG for: pyramide-bar, HCP-histogram, kategori-donut, benchmark-radar
- Tab-bar styrer hvilken av de 4 skjermene som vises (kan vises alle ved siden av hverandre i én lang scroll om enklere)
- ~2200-2800 linjer HTML

## Constraints

- INGEN emojier
- ALL UI på norsk bokmål
- Diskipliner uppercase: FYS, TEK, SLAG, SPILL, TURN
- Kategorier uppercase: A1, A2, B1, B2, B3
- Tall norsk format: `+3,5`, `−1,2`, `12,4`, `92 400 kr`
- Minus-tegn `−` (U+2212), ikke bindestrek `-`
- Klokkeslett 24h: `09:00`, `14:32`
- Dato: `16. juni 2026`, `18. mai 22:10`
- Inntekt i hele kroner med ikke-brekkende mellomrom som tusenskiller: `92 400 kr`
- Relativ tid: `for 2 t siden`, `i går 14:30`, `i dag 09:14`

Output: én komplett HTML-fil. Begin `<!DOCTYPE html>`, end `</html>`. Ingen forklaring utenfor kode-blokken.
