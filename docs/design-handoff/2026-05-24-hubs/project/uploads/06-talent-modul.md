# Prompt — Talent-modul (PlayerHQ + CoachHQ komplett)

> **Bruk:** Lim inn `00-design.md` FØRST i Claude Design (eller v3-bundlens design-system). Deretter lim inn alt etter linjen nedenfor.

---

Lag én komplett, standalone HTML-fil for **AK Golf Talent-modul** (4 skjermer i samme dokument: 3 i PlayerHQ + 1 i CoachHQ). Desktop-skjerm 1600×variabel høyde. Single self-contained `.html` med inline `<style>`, Google Fonts via `<link>`, alle ikoner inline SVG (Lucide-stil stroke 1.75).

**Følg AK Golf design system STRENGT** (cream `#FAFAF7`, forest `#005840`, lime `#D1F843`, Inter Tight + Inter + JetBrains Mono + Instrument Serif italic, Lucide-ikoner stroke 1.75, INGEN emojier, norsk bokmål).

## Hva skjermen er

Talent-modulen viser spilleren hvor de står i utviklings-løypa, hvor de kan gå, og hvordan de sammenligner seg med andre i kategorien. 4 skjermer:

1. **`/portal/talent/mitt-niva`** — Nivå-meter med sub-vurderinger og AI-vurdering
2. **`/portal/talent/min-plan`** — 12-måneders talent-utviklings-roadmap
3. **`/portal/talent/sammenligning`** — Kvartil-plot og percentile-rank mot kategori
4. **`/admin/talent`** — Coach-side: alle 38 spillere plottet på 2D talent-kart

**Personas:**
- Spiller (PlayerHQ): Markus Røinås Pedersen — HCP +3,5, kategori A1, hjemmebane GFGK
- Coach (CoachHQ): Anders Kristiansen

**Kategori-skala:** A1 (elite) · A2 (sub-elite) · B1 (utvikling-høy) · B2 (utvikling-medium) · B3 (utvikling-lav)

## Layout (felles chrome)

### Chrome
- **Sidebar 220px** (forest bg): "AK GOLF / PLAYERHQ · PRO" eller "AK GOLF / COACHHQ" + profil + nav (Talent aktiv)
- **Topbar 56px**: ⌘K + dynamisk breadcrumb

### Hero (80px, dynamisk)
Title med Instrument Serif italic:
- Mitt nivå: `Mitt ` + italic `*nivå*` + ` — A1 elite junior`
- Min plan: `Min ` + italic `*talent-plan*` + ` — 12 måneder fremover`
- Sammenligning: `Hvor jeg ` + italic `*står*` + ` — kvartil-plot mot kategori`
- Coach-talent: `Stall-` + italic `*talent*` + ` — 38 spillere på 2D-kart`

### Tab-bar (44px)
Segmented: `MITT NIVÅ` · `MIN PLAN` · `SAMMENLIGNING` · `COACH-OVERSIKT`

---

## SKJERM 1: `/portal/talent/mitt-niva`

### Eyebrow + actions
- Eyebrow: `TALENT · KATEGORI A1 · 11 PERCENTIL FRA KATEGORI-SNITT · NESTE MILEPÆL OM 8 MÅNEDER`
- Actions:
  1. `Be om ny vurdering` (lime, primary)
  2. `Se historikk` (forest)
  3. `Del med foreldre` (outline)
  4. `Eksporter` (outline)

### Hovedlayout: nivå-meter senter, sub-vurderinger rundt

### Custom SVG: Stort nivå-meter (full bredde, 380px høyt)

Stor visuell trapp/skala fra B3 → A1:
- 5 trinn horisontalt med kategori-bokser (B3, B2, B1, A2, A1)
- Hver boks med kategori-farge (A1=lime, A2=forest, B1=cream, B2=muted, B3=outline)
- Hver boks viser kategori-navn + HCP-spenn (eks. `A1 · +5 til +1` · `A2 · 0 til 4` · `B1 · 5 til 10` · `B2 · 11 til 18` · `B3 · 19+`)
- Markus-markør (lime sirkel 40px med portrett) plassert i A1-boksen mot venstre kant
- Pil-stiplet linje fra Markus-markør til neste milepæl (`+1 HCP-grense`) med label `Neste mål: HCP +5 · estimert 8 måneder`
- Under skalaen: stor mono `KATEGORI A1` + Inter Tight 18px `Elite junior`

### Sub-vurderinger (5 cards grid, 3+2 layout)

Hver disiplin har en sub-card (rounded-lg, hvit bg, 220px høy):

**Card-innhold:**
- Disiplin-badge stor topp
- Tittel Inter Tight 16px (eks. `TEK — Teknikk`)
- Custom SVG: cirkulær progress-ring (140×140) som viser kategori-progress
  - Lime-fyll = din score
  - Forest-streng = A1-mål
  - Senter mono stor: `87%`
- Sub mono: `+12% over B1-kategori · −5% under A1-snitt`
- Mini-trend pil: ↑ +3% siste måned
- CTA-rad bunn: `Se detalj` (outline)

**Eksempel-data for Markus:**

1. **TEK — Teknikk: `87%`** — +12% over B1, −5% under A1-snitt, trend ↑
2. **SLAG — Slagteknikk: `94%`** — +18% over B1, +3% over A1-snitt, trend ↑↑
3. **FYS — Fysisk: `78%`** — +8% over B1, −12% under A1-snitt, trend →
4. **SPILL — Spillforståelse: `82%`** — +14% over B1, −3% under A1-snitt, trend ↑
5. **TURN — Turneringsmodus: `81%`** — +11% over B1, −4% under A1-snitt, trend ↑

### Neste milepæl-strip (lime-accent, 120px)

Stor visuell:
- Tittel Inter Tight 20px: `Neste milepæl`
- Mono stor: `HCP +5`
- Sub: `Norgesrangering topp-200 junior · estimert 8 måneder fra i dag`
- Progress-bar (gradient lime→forest): 68% mot målet
- Sub-mål-checklist:
  - ✓ TEK 7-jern smash > 1,36 (lime checkmark)
  - ✓ SLAG Putting 1,5m > 92% (lime checkmark)
  - ○ FYS VO2max > 55 (outline sirkel)
  - ✓ SPILL Course management > 80% (lime checkmark)
  - ○ TURN MTQ-score 8+ (outline sirkel)

### AI-vurdering-strip (lime-pastell, 140px)

> **Anders sier:** Markus, du er sterkt plassert i A1-kategorien — spesielt SLAG hvor du ligger 3% over kategori-snittet. For å nå neste milepæl (HCP +5) trenger du å løfte FYS-andelen og oppnå MTQ-score 8+. Anbefalt fokus de neste 8 ukene: VO2max-trening + mental rutine for turnering.
> 
> CTA-knapper: `Vis 8-ukers plan` (lime) · `Be om mental coaching` (forest) · `Spør detalj` (outline)

### Historikk-mini (60px under)

Kompakt timeline:
- B2 (mai 2024) → B1 (oktober 2024) → A2 (mars 2025) → A1 (november 2025) → A1 nå (mai 2026)
- Lime-markører på overganger med dato mono

---

## SKJERM 2: `/portal/talent/min-plan`

### Eyebrow + actions
- Eyebrow: `TALENT-PLAN · MAI 2026 → MAI 2027 · 4 FASER · 6 EVALUERINGS-PUNKTER`
- Actions:
  1. `Lagre plan-versjon` (lime, primary)
  2. `Del med foreldre` (forest)
  3. `Endre milepæler` (outline)
  4. `Eksporter PDF` (outline)

### Hero-sammendrag (12 kol, 120px)
3-bobler horisontalt:
- **Mål neste 12 mnd:** mono stor `HCP +5` + sub `Norgesrangering topp-200 junior`
- **Faser:** mono stor `4` + sub `Grunntrening → Oppbygging → Spesialisering → Konkurranse`
- **Evaluering:** mono stor `6 punkter` + sub `Hver 2. måned`

### Custom SVG: 12-måneders roadmap (full bredde, 380px)

Horisontal tidslinje mai 2026 → mai 2027 med:

**Måneds-strip (toppen, 30px):**
- 12 måneds-blokker mono `MAI` `JUN` `JUL` `AUG` `SEP` `OKT` `NOV` `DES` `JAN` `FEB` `MAR` `APR`
- Today-pin (vertikal lime linje) på i dag (mai 2026)

**Fase-blokker (140px høyde):**
4 faser som horisontale fargede blokker:
- **Mai-juni: GRUNNTRENING** (lys grønn) — `Volum, FYS-base, teknisk basis`
- **Juli-september: OPPBYGGING** (medium grønn) — `Spesifikk styrke, putting-konsistens`
- **Oktober-januar: SPESIALISERING** (forest) — `Turn-fokus, mental, spillforståelse`
- **Februar-mai: KONKURRANSE** (lime) — `Hovedmål-turneringer, finstilling`

**Milepæl-markører (vertikale, 80px):**
6 evaluerings-punkter som lime-stjerner med dato + tittel mono small:
1. **Juli 2026:** Re-vurdering FYS + TEK (etter 8 ukers grunntrening)
2. **September 2026:** Mid-sesong evaluering (etter NM Slag + Srixon Tour)
3. **November 2026:** Off-season planning
4. **Januar 2027:** Vinter-test-runde (alle 14 tester på nytt)
5. **Mars 2027:** Pre-sesong evaluering
6. **Mai 2027:** Års-evaluering + ny 12-måneders plan

**Hovedmål-strip (bunn, 30px):**
- Turnerings-markører plassert på dato — lime stjerner for hovedmål:
  - 16. juni: Sørlandsåpent
  - 22. juli: NM Slag
  - 28. aug: Klubbmesterskapet GFGK
  - 5. sep: Srixon Tour final

### Fase-detalj-cards (4 cards stacket vertikalt)

Hver fase som expandable card:

**Fase-header (60px):**
- Fase-navn Inter Tight 18px + dato-spenn mono
- Status-pill (`AKTIV` lime · `KOMMER` cream · `FULLFØRT` muted)
- Sub: hovedfokus i én setning

**Mål for fasen (liste):**
- 4-5 konkrete mål med discipline-pill
- Progress-bar per mål
- Checkmark hvis fullført, ellers progress

**Eksempel — Fase 1: GRUNNTRENING (mai-juni):**

Hovedfokus: `Volum-bygging og teknisk basis før sommer-turneringer`

Mål:
1. **FYS** VO2max 52 → 55 ml/kg/min — 60% progress
2. **TEK** 7-jern smash 1,34 → 1,37 — 80% progress
3. **SLAG** Putting 1,5m 92% → 95% konsistens — 100% (oppnådd 18. mai)
4. **TURN** Pre-shot rutine 84% → 90% konsistens — 40% progress
5. **SPILL** D-Plane quiz 78% → 85% — 30% progress

Tilknyttede økter denne fasen: `28 økter planlagt · 18 fullført · 10 gjenstår`
Tilknyttede tester: `14 tester planlagt · 12 tatt`

**Fase 2: OPPBYGGING (juli-september):**
Hovedfokus: `Spesifikk styrke + turnerings-readiness for NM Slag`
[5 mål]

**Fase 3: SPESIALISERING (oktober-januar):**
Hovedfokus: `Vinter-trening, mental og spillforståelse-fokus`
[5 mål]

**Fase 4: KONKURRANSE (februar-mai):**
Hovedfokus: `Finstilling, sesong-åpning, hovedmål-prep`
[5 mål]

### AI-strip (lime-pastell, 80px)
> **Anders sier:** Planen ditt er solid balansert — 40% TEK/SLAG, 25% FYS, 20% SPILL/TURN, 15% volum. Husk at oktober-januar er kritisk for HCP-progresjon. Skal jeg legge inn vinter-treningsleir i Spania?
> CTA: `Ja, foreslå datoer` (lime) · `Vurder først` (outline) · `Nei takk` (outline)

---

## SKJERM 3: `/portal/talent/sammenligning`

### Eyebrow + actions
- Eyebrow: `SAMMENLIGNING · A1-KATEGORI · 92. PERCENTIL · 10 SPILLERE OVER, 2 UNDER`
- Actions:
  1. `Endre kategori-fokus` (forest)
  2. `Sammenlign med andre kategorier` (forest)
  3. `Filtre` (outline)
  4. `Eksporter` (outline)

### Hero-kontekst (12 kol, 100px)
3-bobler:
- **Din percentile:** mono stor `92.` + sub `av 100 i A1-kategori`
- **Hvor du er sterk:** mono `SLAG` + sub `+18% over kategori-snitt`
- **Hvor du er svak:** mono `FYS` + sub `−12% under kategori-snitt`

### Custom SVG: Kvartil-plot per disiplin (full bredde, 460px)

5 horisontale rader (én per disiplin), hver rad 80px:

**Per rad:**
- Disiplin-label venstre 100px (Inter Tight 14px + badge)
- Box-plot grafikk (resten av bredden):
  - Hel boks (forest) = interkvartil-range (Q1 til Q3) for A1-kategori
  - Vertikal linje i boksen = median
  - Whiskers (forest tynne linjer) = min/max
  - Stor lime sirkel = Markus' posisjon
  - Mini-tekst over lime sirkel: percentil-rank (eks. `92.`)
- Høyre 120px: mono delta `+18%` (lime) eller `−12%` (rød) + sub small `vs kategori-snitt`

**Eksempel-rad-data:**

| Disiplin | Markus | Q1 | Median | Q3 | Min | Max | Percentil |
|---|---|---|---|---|---|---|---|
| FYS | 78% | 80% | 86% | 91% | 72% | 95% | 38. |
| TEK | 87% | 82% | 86% | 90% | 76% | 94% | 71. |
| SLAG | 94% | 86% | 89% | 92% | 80% | 96% | 96. |
| SPILL | 82% | 78% | 84% | 88% | 70% | 92% | 42. |
| TURN | 81% | 75% | 82% | 87% | 68% | 92% | 47. |

### Custom SVG: Radar-chart (12 kol, 320px)
5-akset radar:
- Akser: FYS, TEK, SLAG, SPILL, TURN
- Markus (lime fyll, opacity 60%, lime border)
- A1-snitt (forest stiplet outline)
- A1-topp-5-snitt (lime-stiplet inner outline)
- Skala 0-100% per akse
- Mono labels på hver akse

### Spillerliste — A1-kategori (10 spillere over Markus, vis topp 5 + Markus + 2 under)

Tabell:
| Rank | Spiller | HCP | FYS | TEK | SLAG | SPILL | TURN | Snitt | vs Markus |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Aksel Bø | +4,8 | 89% | 92% | 95% | 88% | 90% | 90,8% | +6,4% |
| 2 | Henrik Vorli | +0,4 | 84% | 91% | 94% | 86% | 88% | 88,6% | +4,2% |
| 3 | Joachim Tangen | +1,2 | 82% | 89% | 93% | 84% | 86% | 86,8% | +2,4% |
| 4 | Øyvind Røhjan | +3,5 | 80% | 88% | 94% | 83% | 84% | 85,8% | +1,4% |
| 5 | Iver Lien | +2,8 | 81% | 87% | 92% | 84% | 84% | 85,6% | +1,2% |
| ... | ... | ... | ... | ... | ... | ... | ... | ... | ... |
| **8** | **Markus Røinås Pedersen** | **+3,5** | **78%** | **87%** | **94%** | **82%** | **81%** | **84,4%** | **DEG** |
| 9 | Sondre Fjell | +2,1 | 77% | 86% | 91% | 80% | 82% | 83,2% | −1,2% |
| 10 | Vetle Aase | +1,8 | 76% | 84% | 90% | 81% | 80% | 82,2% | −2,2% |

(Markus' rad uthevet med lime venstre-border)

### AI-strip (lime-pastell, 100px)
> **Anders sier:** Du er #8 av 26 i A1 — solid topp-tredjedel. SLAG holder deg i toppen, men FYS trekker snitt-scoren ned. Aksel Bø leder fordi han har balansert alle 5 disiplinene over 88%. Anbefalt: bruk neste 8 uker på FYS-løft fra 78% til 84% — det vil løfte deg til #5-#6.
> CTA: `Lag FYS-plan` (lime) · `Sammenlign med Aksel` (forest) · `Detaljer` (outline)

---

## SKJERM 4: `/admin/talent` — Coach 2D-kart

### Eyebrow + actions
- Eyebrow: `STALL-TALENT · 38 SPILLERE · 5 KATEGORIER · 12 I VEKST · 4 I REGRESJON · 22 STABIL`
- Actions:
  1. `Eksporter kart` (lime, primary)
  2. `Endre akse-valg` (forest)
  3. `Filtre` (outline)
  4. `Sammenlign perioder` (outline)

### Akse-kontroll (50px)
Toppvelger for 2D-kart:
- **X-akse:** dropdown `HCP` (default) · `Alder` · `Talent-score` · `Måneder i akademiet`
- **Y-akse:** dropdown `Talent-score` (default) · `Potensial-vurdering` · `Vekst-rate siste 12 mnd` · `Inntekt MTD`
- **Farge-koding:** Kategori (A1-B3) eller Trend (vekst/stabil/regresjon)
- **Størrelse:** Antall økter siste 30 dager / fast / inntekt

### Custom SVG: 2D talent-kart (full bredde, 640px)

- X-akse: HCP fra `−5` til `+25`, mono labels
- Y-akse: Talent-score 0-100% mono
- Bakgrunns-gradient (cream til lime-pastell øverst høyre = "elite-sone")
- Akse-tekst Inter Tight 12px
- Grid-linjer (cream stiplet)
- Quadrant-labels:
  - Topp-venstre (lavt HCP, høy score): "ELITE — pleie og presentere"
  - Topp-høyre (høyt HCP, høy score): "DIAMANT — investér i utvikling"
  - Bunn-venstre (lavt HCP, lav score): "RIPING — hva mangler?"
  - Bunn-høyre (høyt HCP, lav score): "GRUNNNIVÅ — tål og bygg"

**38 spillere som klikkbare boble-markører:**
- Boble-størrelse skalert til antall økter siste 30 dager (12-40 px diameter)
- Farge basert på kategori (lime/forest/cream/muted/outline)
- Boble-border lime hvis trend ↑, forest hvis stabil, rød hvis trend ↓
- Initialer mono inni boblen
- Hover: tooltip med fullt navn + HCP + kategori + talent-score
- Klikk: åpner spiller-detalj-drawer fra høyre (400px bred)

**Eksempel-bobler (vis minst 12 navngitte):**

| Spiller | HCP (x) | Score (y) | Kat | Boble-størrelse | Trend |
|---|---|---|---|---|---|
| Aksel Bø | +4,8 | 91% | A1 | 36px | ↑ |
| Henrik Vorli | +0,4 | 89% | A1 | 32px | ↑ |
| Joachim Tangen | +1,2 | 87% | A1 | 30px | ↑ |
| Øyvind Røhjan | +3,5 | 86% | A1 | 28px | → |
| **Markus Røinås Pedersen** | **+3,5** | **84%** | **A1** | **34px (highlighted)** | **↑** |
| Tobias Vinje | +2,1 | 78% | A1 (prospect) | 16px | ↑ |
| Ida Mathisen | 3,1 | 76% | A2 | 24px | ↑ |
| Emma Sundsdal | 4,8 | 72% | A2 | 22px | → |
| Sigrid Berg | 8,2 | 64% | B1 | 20px | ↑ |
| Pia Solberg | 9,7 | 62% | B1 | 22px | ↑ |
| Nora Lillevold | 12,4 | 52% | B2 | 18px | ↓ |
| Vetle Aabø | 14,2 | 48% | B2 | 16px | → |

### Spiller-detalj-drawer (åpnes ved klikk, 400px fra høyre)

- Portrett 80px + navn Inter Tight 22px + HCP + kategori
- Mini-radar (sub-vurderinger 5 disipliner)
- Trend siste 6 måneder (mini-graf)
- Anbefalt fokus AI: én setning
- Actions: `Se hele talent-plan`, `Send melding`, `Endre kategori`, `Lukk`

### Stall-statistikk-strip (bunn, 80px)

5 bobler horisontalt:
- **Snitt-score stall:** `74%` + trend ↑ `+2,4% siste 30 d`
- **Spillere over 85%:** `4` (Aksel, Henrik, Joachim, Øyvind)
- **Vekst-stjerner:** `6 spillere` med trend ≥+5% siste måned
- **Regresjon-varsel:** `2 spillere` med trend ≤−3% siste måned
- **Spillere klar for kategori-opprykk:** `3 prospects` (Tobias V., Ida M., Sigrid B.)

### AI-stall-strip (lime-pastell, 100px)
> **Anders sier:** Stallen har 4 A1-spillere over 85% talent-score — sterkt nivå. Tobias Vinje (prospect) viser raskeste vekst siste 30 dager (+7%) og bør vurderes for A1-promovering i juni. Nora Lillevold viser regresjon (−4%) — anbefaler check-in.
> CTA: `Promover Tobias` (lime) · `Plan for Nora` (forest) · `Eksporter rapport` (outline)

---

## Modal: Be om ny vurdering (spiller-side)

### Felt
1. **Periode** — siste 4 uker / siste 8 uker / siste 12 uker (radio)
2. **Hva ønsker du vurdert?** — checkbox: FYS / TEK / SLAG / SPILL / TURN
3. **Notat til coach** — fritekst
4. **Vedlegg** — turnerings-resultater, video-økter

### CTA
- **Send forespørsel** (lime, primary)
- **Be om vurdering + møte** (lime + Calendar-ikon)
- **Avbryt** (outline)

---

## Modal: Endre kategori (coach-side)

For Anders å oppdatere en spillers kategori:

### Felt
1. **Spiller** — pre-utfylt
2. **Nåværende kategori** — read-only badge
3. **Ny kategori** — radio A1/A2/B1/B2/B3
4. **Begrunnelse** — fritekst (vises i spillerens historikk)
5. **Effektiv fra dato** — datovelger (default i dag)
6. **Send notifikasjon til spiller** — checkbox default på
7. **Send notifikasjon til foreldre** — checkbox

### CTA
- **Bekreft endring** (lime, primary)
- **Bekreft + send velkomst-til-A1-pakke** (lime)
- **Avbryt** (outline)

---

## Sticky footer (64px, dynamisk per skjerm)

- **Venstre**: Pyramide-balanse-bar (mini for spiller, snitt for coach)
- **Senter**:
  - Mitt nivå: `Kategori A1 · 92. percentil · Neste mål HCP +5 om 8 mnd`
  - Min plan: `4 faser · 18 av 28 økter fullført · neste evaluering juli`
  - Sammenligning: `#8 av 26 i A1 · sterk SLAG · svak FYS`
  - Coach: `38 spillere · 12 i vekst · 4 i regresjon · 3 klar for opprykk`
- **Høyre**:
  - `Spør Coach Anders` (outline + Sparkles)
  - Kontekst-CTA (lime): `Be om vurdering` / `Lagre plan` / `Eksporter`

---

## Branding (følger AK Golf design system)

- BG cream `#FAFAF7`
- Card hvit `#FFFFFF` med border `#E5E3DD`
- Primary forest `#005840`, accent lime `#D1F843`
- Discipline-pills bruker FYS/TEK/SLAG/SPILL/TURN-farger
- Kategori-farger: A1 lime · A2 forest · B1 cream · B2 muted · B3 outline
- Inter Tight (titler), Inter (UI), JetBrains Mono (alle tall, prosent, HCP, percentile)
- Instrument Serif italic sparsomt — kun ett ord per hero
- 16px radius cards, 12px buttons, 999px pills
- INGEN emojier, kun Lucide-ikoner stroke 1.75
- Norsk bokmål gjennomgående

## Tekniske krav

- Single self-contained `.html`
- Inline `<style>` block
- Google Fonts via `<link>`
- All icons inline Lucide SVG (stroke 1.75)
- Custom SVG for: stort nivå-meter med trapp, sirkulære progress-rings (5 sub-cards), 12-måneders roadmap-tidslinje, box-plots (5 disipliner), radar-chart, 2D talent-kart med bobler, mini-trend-grafer
- Tab-bar mellom 4 skjermer
- Klikkbare bobler i 2D-kart med drawer
- ~2400-3000 linjer HTML

## Constraints

- INGEN emojier
- ALL UI på norsk bokmål
- Diskipliner uppercase: FYS, TEK, SLAG, SPILL, TURN
- Kategorier uppercase: A1, A2, B1, B2, B3
- Tall norsk format: `+3,5`, `−1,2`, `87%`, `92.` (percentil)
- Minus-tegn `−` (U+2212), ikke bindestrek `-`
- Komma som desimalskille
- Klokkeslett 24h: `10:24`
- Dato: `18. mai 2026`, `mai 2026`, `juli 2026`
- HCP-format med fortegn alltid: `+3,5`, `−1,2`, `12,4` (positive HCP-er uten + når over 0)
- Percentil-format med punktum: `92.`, `38.`

Output: én komplett HTML-fil. Begin `<!DOCTYPE html>`, end `</html>`. Ingen forklaring utenfor kode-blokken.
