# Prompt — Tester-modul (CoachHQ + PlayerHQ komplett)

> **Bruk:** Lim inn `00-design.md` FØRST i Claude Design (eller v3-bundlens design-system). Deretter lim inn alt etter linjen nedenfor.

---

Lag én komplett, standalone HTML-fil for **AK Golf Tester-modul** (4 skjermer i samme dokument: 2 i CoachHQ + 2 i PlayerHQ). Desktop-skjerm 1600×variabel høyde. Single self-contained `.html` med inline `<style>`, Google Fonts via `<link>`, alle ikoner inline SVG (Lucide-stil stroke 1.75).

**Følg AK Golf design system STRENGT** (cream `#FAFAF7`, forest `#005840`, lime `#D1F843`, Inter Tight + Inter + JetBrains Mono + Instrument Serif italic, Lucide-ikoner stroke 1.75, INGEN emojier, norsk bokmål).

## Hva skjermen er

Tester-modulen er målestokken som binder coaching-arbeidet sammen. 4 skjermer:

1. **`/admin/tester`** — Coach Anders' oversikt: alle tester gruppert per disiplin
2. **`/admin/tester/[id]`** — Coach-detalj: spillerliste med score, trend, dato per test
3. **`/portal/tren/tester`** — Markus' tester-side: anbefalte + historikk
4. **`/portal/tren/tester/[id]`** — Spiller-detalj: din score + historikk + benchmark + AI-anbefaling

Test-typer (per disiplin):
- **TEK**: 7-jern smash, driver carry distance, wedge konsistens
- **FYS**: VO2max, plank, balanse-test, fart 30m
- **SLAG**: Putting 1,5m konsistens, chipping landingsone, bunkershot %
- **SPILL**: D-Plane forståelse, course management quiz
- **TURN**: Pre-shot rutine, MTQ stress-respons, fokus-test

**Personas:**
- Coach: Anders Kristiansen
- Spiller: Markus Røinås Pedersen (HCP +3,5, kategori A1, hjemmebane GFGK)

## Layout (felles chrome)

### Chrome
- **Sidebar 220px** (forest bg): "AK GOLF / COACHHQ" eller "AK GOLF / PLAYERHQ · PRO" + profil + nav
- **Topbar 56px**: ⌘K + dynamisk breadcrumb + role-toggle

### Hero (80px, dynamisk per skjerm)
Title Inter Tight 32px med Instrument Serif italic på ett ord:
- Coach-oversikt: `Tester ` + italic `*&*` + ` benchmarks — hele stallen`
- Coach-detalj: `Test-` + italic `*detalj*` + ` — alle spillere som har tatt`
- Spiller-oversikt: `Mine ` + italic `*tester*` + ` — anbefalt og historikk`
- Spiller-detalj: `Test-` + italic `*resultat*` + ` med benchmark og AI-anbefaling`

### Tab-bar (44px) — bytter mellom de 4 skjermene
Segmented: `COACH-OVERSIKT` · `COACH-DETALJ` · `SPILLER-OVERSIKT` · `SPILLER-DETALJ`

---

## SKJERM 1: `/admin/tester` — Coach-oversikt

### Eyebrow + actions
- Eyebrow: `TESTER · 5 DISIPLINER · 14 TESTER AKTIVE · 32 SPILLERE TESTET SISTE 30 DAGER`
- 4 hero-actions:
  1. `+ Ny test` (lime, primary)
  2. `Planlegg test-runde` (forest)
  3. `Filtre` (outline)
  4. `Eksporter benchmark-rapport` (outline)

### Filter-bar (50px)
- **Disiplin**: Alle · FYS · TEK · SLAG · SPILL · TURN (pills, multi-select)
- **Periode**: I uke · Måned · Kvartal · Sesong
- **Kategori-fokus**: Alle · A1 · A2 · B1 · B2 · B3
- **Status**: Aktiv · Pause · Arkivert

### Disiplin-grupper (5 seksjoner stacket vertikalt)

Hver disiplin-seksjon (~280px høy):

**Disiplin-header (40px):**
- Disiplin-badge stor (FYS=#3A6EAB · TEK=#A8327D · SLAG=#005840 · SPILL=#D1F843 · TURN=#C24914)
- Tittel Inter Tight 20px: `TEK — Teknikk`
- Sub mono: `3 tester · 28 spillere · 87 målinger siste 30 dager`
- Høyre: `Se alle TEK-tester` link

**Test-cards grid (3 kolonner per rad):**

Hvert test-card (rounded-lg 16px, hvit bg, border, 220px høy):

- **Topp-rad (32px):** Disiplin-pill liten + status-pill (`AKTIV` lime · `PAUSE` cream)
- **Tittel (Inter Tight 16px):** test-navn (klikkbar → coach-detalj)
- **Sub mono 12px:** kort beskrivelse av målemetode
- **Hovedmål-strip (50px):**
  - Lucide Target-ikon
  - Mål-verdi mono stor (f.eks. `≥ 92%`, `≥ 215 m`, `≤ 1,2 s`)
  - Label mono small: `Mål A1-kategori`
- **Sist tatt-rad:**
  - Antall spillere: `12 spillere har tatt` mono
  - Siste dato: `Sist 18. mai 2026` mono
- **Snitt-bar (gradient lime→forest):**
  - Stall-snitt vs A1-benchmark vs internasjonal-benchmark
  - Eksempel: `Stall: 87% · A1: 92% · Int.: 95%`
- **Action-rad bunn:** `Se spillere` (outline) · `Endre mål` (outline) · `Arkiver` (outline)

### Eksempel-data (per disiplin)

**FYS (4 tester):**
1. **VO2max** — Mål `≥ 55 ml/kg/min` for A1 · 24 spillere · stall-snitt 52,8
2. **Plank-tid** — Mål `≥ 3:00 min` · 30 spillere · stall-snitt 2:42
3. **Balanse-test** — Mål `≥ 45 s enkelt ben` · 28 spillere · stall-snitt 38 s
4. **Fart 30m** — Mål `≤ 4,2 s` for A1 · 22 spillere · stall-snitt 4,5 s

**TEK (3 tester):**
5. **7-jern smash factor** — Mål `≥ 1,36` for A1 · 28 spillere · stall-snitt 1,34
6. **Driver carry distance** — Mål `≥ 250 m` for A1 · 26 spillere · stall-snitt 245 m
7. **Wedge konsistens (50m)** — Mål `≤ 4 m spredning` · 30 spillere · stall-snitt 5,2 m

**SLAG (3 tester):**
8. **Putting 1,5m konsistens** — Mål `≥ 92%` for A1 · 32 spillere · stall-snitt 87%
9. **Chipping landingsone** — Mål `≥ 70% innenfor 1m` · 28 spillere · stall-snitt 64%
10. **Bunkershot %** — Mål `≥ 65% til 3m` · 24 spillere · stall-snitt 58%

**SPILL (2 tester):**
11. **D-Plane forståelse (quiz)** — Mål `≥ 85% korrekt` · 18 spillere · stall-snitt 78%
12. **Course management quiz** — Mål `≥ 80% korrekt` · 22 spillere · stall-snitt 74%

**TURN (3 tester):**
13. **Pre-shot rutine konsistens** — Mål `≥ 90% rutine fullført` · 16 spillere · stall-snitt 84%
14. **MTQ stress-respons** — Mål `score 7+ / 10` · 14 spillere · stall-snitt 6,2
15. **Fokus-test (Stroop)** — Mål `≤ 28 s` · 18 spillere · stall-snitt 31 s

---

## SKJERM 2: `/admin/tester/[id]` — Coach-detalj (eks. Putting 1,5m konsistens)

### Eyebrow + actions
- Eyebrow: `TEST · SLAG · PUTTING 1,5M KONSISTENS · 32 SPILLERE TESTET · OPPDATERT 18. MAI`
- Actions:
  1. `+ Registrer ny måling` (lime, primary)
  2. `Inviter spiller til test` (forest)
  3. `Endre mål` (outline)
  4. `Eksporter resultater` (outline)

### Topp-grid (4 KPI-bobler, 100px)
- **Stall-snitt:** mono stor `87%` + sub `Mål A1: 92%`
- **A1-snitt:** mono stor `91%` + sub `−1% under mål`
- **Beste resultat:** `97%` mono + sub `Markus R.P. · 18. mai`
- **Trend siste 30 d:** `+2,4%` lime + sub `Forbedring`

### Custom SVG: Distribusjons-plot (12 kol, 280px høy)
- X-akse: score 50% → 100%
- Y-akse: antall spillere mono
- Histogram-bars forest med lime-highlight på modus
- Vertikal lime-linje på A1-mål 92% (label mono)
- Vertikal forest-stiplet linje på stall-snitt 87%
- Tooltip on hover: viser hvilke spillere i hver bar

### Custom SVG: Trend-linje (12 kol, 200px høy)
- X-akse: siste 12 uker
- Y-akse: stall-snitt %
- Linje (forest) + område-fyll under (forest opacity 15%)
- Lime-markører på målepunkter
- A1-mål horisontal stiplet lime linje

### Spillerliste-tabell (full bredde)

Klikkbar rad → spillerprofil. Kolonner sorterbare:

1. **Spiller** — portrett 32px + navn Inter Tight 14px
2. **Kategori** — pill (A1=lime, A2=forest, B1=cream, B2=muted, B3=outline)
3. **HCP** — mono `+3,5`
4. **Siste score** — mono stor `97%` (høyrejustert)
5. **Dato** — mono `18. mai 2026`
6. **vs Mål** — mono `+5%` (lime) / `−4%` (rød)
7. **Trend (3 målinger)** — mini sparkline + retning-ikon (Lucide ArrowUp lime / ArrowDown rød / Minus muted)
8. **Antall målinger** — mono `12`
9. **Handling** — Lucide MoreHorizontal

### Eksempel-rader (vis 10 av 32)

| Spiller | Kat | HCP | Score | Dato | vs Mål | Trend | N |
|---|---|---|---|---|---|---|---|
| Markus Røinås Pedersen | A1 | +3,5 | 97% | 18. mai | +5% | ↑ | 14 |
| Henrik Vorli | A1 | +0,4 | 94% | 17. mai | +2% | ↑ | 12 |
| Joachim Tangen | A1 | +1,2 | 93% | 18. mai | +1% | → | 13 |
| Øyvind Røhjan | A1 | +3,5 | 95% | 16. mai | +3% | ↑ | 11 |
| Ida Mathisen | A2 | 3,1 | 88% | 17. mai | −4% | ↑ | 8 |
| Emma Sundsdal | A2 | 4,8 | 85% | 16. mai | −7% | → | 9 |
| Sigrid Berg | B1 | 8,2 | 81% | 15. mai | −11% | ↑ | 7 |
| Pia Solberg | B1 | 9,7 | 84% | 18. mai | −8% | ↑ | 6 |
| Nora Lillevold | B2 | 12,4 | 76% | 14. mai | −16% | ↓ | 5 |
| Vetle Aabø | B2 | 14,2 | 78% | 16. mai | −14% | → | 4 |

### AI-strip (lime-pastell, 80px)
> **Anders sier:** Markus har 97% på Putting 1,5m — på topp av kategorien. Anbefaler å øke målet til 95% for A1, og legge til 2,5m som ny test for utfordring.
> CTA: `Juster mål` (lime) · `Legg til 2,5m-test` (outline) · `Senere` (outline)

---

## SKJERM 3: `/portal/tren/tester` — Spiller-oversikt (Markus)

### Eyebrow + actions
- Eyebrow: `MINE TESTER · 14 TILGJENGELIGE · 12 TATT SISTE 30 DAGER · KATEGORI A1`
- Actions:
  1. `Ta ny test` (lime, primary)
  2. `Anbefalt rekkefølge` (forest)
  3. `Filtre` (outline)
  4. `Sammenlign med A1-kategori` (outline)

### Anbefalt nå-strip (lime-accent, 100px)
**Anders sier:** Du har ikke tatt VO2max på 6 uker — anbefaler i denne uka. Også: chipping landingsone er forbedret med 8% siden mars, gjenta for å bekrefte trenden.

3 anbefalte tester som cards horisontalt:
1. **VO2max** — `FYS` pill · sist tatt 8. apr 2026 · `Ta nå` (lime)
2. **Chipping landingsone** — `SLAG` pill · sist tatt 22. apr 2026 · `Ta nå` (lime)
3. **MTQ stress-respons** — `TURN` pill · aldri tatt · `Ta nå` (lime, accent-border)

### Disiplin-grupper (5 seksjoner)

Hver disiplin-seksjon (~260px):

**Header (40px):**
- Disiplin-badge + tittel Inter Tight 18px (eks. `SLAG — Slagteknikk`)
- Sub mono: `3 tester · siste oppdatering 18. mai 2026`

**Test-cards grid (3 per rad):**

Per card (rounded-lg, 200px høy):

- **Test-tittel** Inter Tight 16px (klikkbar → spiller-detalj)
- **Discipline-pill + status:** `AKTIV` lime / `IKKE TATT` outline
- **Din siste score** mono stor (eks. `97%`) + dato mono small
- **vs A1-benchmark** mono med farge: `+5%` lime / `−4%` rød
- **Mini sparkline (3-5 målinger):** custom SVG forest med lime endepunkt
- **CTA-rad:** `Ta på nytt` (outline) · `Detaljer` (forest, primary)

### Eksempel-cards for Markus (vis 6, resten under "Vis 8 til")

**TEK:**
- **7-jern smash factor:** `1,37` · 17. mai · +1% vs A1 (lime) · trend ↑
- **Driver carry:** `258 m` · 16. mai · +3% vs A1 (lime) · trend →

**SLAG:**
- **Putting 1,5m:** `97%` · 18. mai · +5% vs A1 (lime) · trend ↑
- **Chipping landingsone:** `72%` · 22. apr · +2% vs A1 (lime) · trend ↑

**FYS:**
- **VO2max:** `54 ml/kg/min` · 8. apr · −1 vs A1 (rød) · trend →
- **Plank:** `3:24 min` · 12. mai · +24 s vs A1 (lime) · trend ↑

---

## SKJERM 4: `/portal/tren/tester/[id]` — Spiller-detalj (eks. Putting 1,5m)

### Eyebrow + actions
- Eyebrow: `PUTTING 1,5M KONSISTENS · SLAG · 14 MÅLINGER · SIST 18. MAI 2026`
- Actions:
  1. `Ta ny måling nå` (lime, primary)
  2. `Sett påminnelse` (forest)
  3. `Del med coach` (outline)
  4. `Eksporter` (outline)

### Topp-grid (12 kol, 200px) — Hero-resultat
3 sammenlignings-cards side om side:

**Card 1: Din siste score (lime-accent)**
- Stor mono: `97%`
- Sub mono: `18. mai 2026 · Performance Studio`
- Custom progress-ring SVG (180×180) viser 97% (lime fyll mot cream bg)
- Under: `Beste resultat 2026 · trend ↑ siste 3 målinger`

**Card 2: A1-kategori benchmark (forest)**
- Stor mono: `91%`
- Sub: `Gjennomsnitt A1-spillere`
- Custom progress-ring (180×180) viser 91%
- Under: `Du er +6% over snittet`

**Card 3: A1-mål (forest dark)**
- Stor mono: `≥ 92%`
- Sub: `Coach Anders' mål for deg`
- Status-badge stor: `OPPNÅDD` (lime)
- Under: `Oppnådd siden 12. apr 2026 · 5 målinger over mål`

### Custom SVG: Historikk-graf (12 kol, 280px)
- X-akse: 14 målinger over 8 måneder
- Y-akse: score % (60-100%)
- Linje (lime) + område-fyll (lime opacity 15%)
- Lime-markører på målepunkter — størrelse skaleres med konsistens
- Horisontal stiplet linje på A1-mål 92% (lime stiplet)
- Horisontal stiplet linje på A1-snitt 91% (forest stiplet)
- Tooltip on hover: dato + score + lokasjon

### Custom SVG: Kvartil-plot mot A1 (12 kol, 240px)
Box-plot med:
- A1-kategori box (forest) med median, kvartiler, whiskers
- Din score (lime stor sirkel) plassert i percentil
- Label: `Du er i 92. percentil av A1-kategorien`
- Sub: `Topp 8% av A1-spillere`

### Detaljert måling-tabell (full bredde, 5 nyeste)

| Dato | Tid | Score | Lokasjon | Coach | Notat |
|---|---|---|---|---|---|
| 18. mai 2026 | 10:24 | 97% (29/30) | Performance Studio | Anders | Tre putts mistet — alle dro venstre |
| 12. mai 2026 | 14:10 | 93% (28/30) | Putting Green GFGK | Anders | Greener litt langsommere enn vanlig |
| 28. apr 2026 | 16:00 | 95% (28/30, 2 retake) | Performance Studio | Anders | Veldig stabilt — fokus på rytme |
| 12. apr 2026 | 11:30 | 93% (28/30) | Putting Green GFGK | Anders | Første gang over A1-mål |
| 28. mar 2026 | 09:15 | 87% (26/30) | Performance Studio | Anders | Tre putts mistet høyre — pre-shot rutine svak |

### AI-anbefaling-strip (lime-pastell, 100px)
> **Anders sier:** Du er konsistent over A1-målet siden april. Neste utfordring: legg til Putting 2,5m som ny test — A1-mål der er 78%. Vil du jeg setter den opp?
> CTA-knapper: `Sett opp 2,5m-test` (lime) · `Vis A1-rangering` (forest) · `Spør coach om detalj` (outline)

### Sammenligning med spillere i din kategori (200px)
Mini-tabell topp 5 i A1 på denne testen:
| Rank | Spiller | Snitt-score | Beste | Du |
|---|---|---|---|---|
| 1 | Markus Røinås Pedersen | 94% | 97% | DEG |
| 2 | Henrik Vorli | 93% | 96% | |
| 3 | Øyvind Røhjan | 92% | 95% | |
| 4 | Joachim Tangen | 91% | 94% | |
| 5 | Aksel Bø | 90% | 93% | |

---

## Modal: Ta ny test (åpnes fra "Ta nå" eller "+ Registrer ny måling")

### Felt
1. **Test** — pre-utfylt eller dropdown
2. **Dato + tid** — default nå
3. **Lokasjon** — dropdown (Performance Studio · Putting Green GFGK · Annet)
4. **Coach til stede** — dropdown (eller "Ingen — egen-test")
5. **Score** — mono input felt:
   - For prosent-tester: `___ / ___` (treff/forsøk)
   - For tid-tester: `_:__` (minutter:sekunder)
   - For distanse-tester: `___ m`
6. **Resultat** — auto-beregnet basert på input
7. **Notater** — fritekst (forhold, fokus, hva som gikk bra/dårlig)
8. **Vedlegg** — opp til 3 bilder/video

### CTA
- **Lagre måling** (lime, primary)
- **Lagre + be om coach-feedback** (lime + Send-ikon)
- **Avbryt** (outline)

Etter lagring:
- Resultat vises i historikk
- AI-strip oppdatert med ny anbefaling
- Auto-oppdatering av trend-sparkline og benchmark-posisjon

---

## Modal: + Ny test (coach-side)

For Anders å opprette ny test-mal:

### Felt
1. **Navn** — fritekst
2. **Disiplin** — radio FYS/TEK/SLAG/SPILL/TURN
3. **Beskrivelse** — fritekst (målemetode, oppsett, utstyr)
4. **Måle-enhet** — dropdown (prosent · sekunder · meter · score 1-10)
5. **Mål per kategori** — 5 felt:
   - A1-mål: ___
   - A2-mål: ___
   - B1-mål: ___
   - B2-mål: ___
   - B3-mål: ___
6. **Anbefalt frekvens** — dropdown (ukentlig · annenhver uke · månedlig · kvartalsvis)
7. **Standard-lokasjon** — dropdown av fasiliteter
8. **Tilknyttet plan-mål** — multiselect

### CTA
- **Opprett test** (lime, primary)
- **Opprett + tildel til hele stallen** (lime)
- **Avbryt** (outline)

---

## Sticky footer (64px, dynamisk per skjerm)

- **Venstre**: Pyramide-balanse-bar (5 disipliner som mini-strip med prosent)
- **Senter**: Kontekst-status:
  - Coach-oversikt: `14 tester aktive · 87 målinger siste 30 dager · 4 spillere over A1-mål`
  - Coach-detalj: `Putting 1,5m · 32 spillere · stall-snitt 87% · A1-snitt 91%`
  - Spiller-oversikt: `12 av 14 tester tatt siste 30 dager · 3 anbefales nå`
  - Spiller-detalj: `Putting 1,5m · 14 målinger · 5 over A1-mål · trend ↑`
- **Høyre**:
  - `Spør Coach Anders` (outline + Sparkles)
  - Kontekst-CTA (lime): `+ Ny test` / `+ Måling` / `Ta nå`

---

## Branding (følger AK Golf design system)

- BG cream `#FAFAF7`
- Card hvit `#FFFFFF` med border `#E5E3DD`
- Primary forest `#005840`, accent lime `#D1F843`
- Discipline-pills: FYS, TEK, SLAG, SPILL, TURN
- Kategori-farger: A1 lime · A2 forest · B1 cream · B2 muted · B3 outline
- Inter Tight (titler), Inter (UI), JetBrains Mono (alle tall, prosent, dato, score)
- Instrument Serif italic sparsomt — ett ord per hero
- 16px radius cards, 12px buttons, 999px pills
- INGEN emojier, kun Lucide-ikoner stroke 1.75
- Norsk bokmål gjennomgående

## Tekniske krav

- Single self-contained `.html`
- Inline `<style>` block
- Google Fonts via `<link>`
- All icons inline Lucide SVG (stroke 1.75)
- Custom SVG for: progress-rings (3 stk hero), historikk-graf, kvartil-plot/box-plot, distribusjons-histogram, trend-linje, mini-sparklines i cards
- Tab-bar mellom de 4 skjermene
- ~2400-3000 linjer HTML

## Constraints

- INGEN emojier
- ALL UI på norsk bokmål
- Diskipliner uppercase: FYS, TEK, SLAG, SPILL, TURN
- Kategorier uppercase: A1, A2, B1, B2, B3
- Tall norsk format: `+3,5`, `−1,2`, `97%`, `1,37`, `258 m`, `54 ml/kg/min`
- Minus-tegn `−` (U+2212), ikke bindestrek `-`
- Komma som desimalskille: `1,37` ikke `1.37`
- Klokkeslett 24h: `10:24`, `14:10`
- Dato: `18. mai 2026`, `28. apr 2026`
- Tid-format: `3:24 min`, `4,5 s`
- Prosent som hele tall: `97%`, ikke `0,97`

Output: én komplett HTML-fil. Begin `<!DOCTYPE html>`, end `</html>`. Ingen forklaring utenfor kode-blokken.
