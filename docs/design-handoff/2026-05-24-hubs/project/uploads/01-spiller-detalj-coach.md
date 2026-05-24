# Prompt — CoachHQ Spiller-detalj (Coach Workbench Pro)

> **Bruk:** Lim inn `00-design.md` FØRST i Claude Design (eller v3-bundlens design-system). Deretter lim inn alt etter linjen nedenfor.

---

Lag én komplett, standalone HTML-fil for **AK Golf CoachHQ — Spiller-detalj (Markus Røinås Pedersen)**. Desktop-skjerm 1600×variabel høyde. Single self-contained `.html` med inline `<style>`, Google Fonts via `<link>`, alle ikoner inline SVG (Lucide-stil stroke 1.75).

**Følg AK Golf design system STRENGT** (cream `#FAFAF7`, forest `#005840`, lime `#D1F843`, Inter Tight + Inter + JetBrains Mono + Instrument Serif italic, Lucide-ikoner, INGEN emojier, norsk bokmål).

## Hva skjermen er

Coach Anders sin detalj-side for én spesifikk spiller (Markus). Det er full **TPK04 Coach Workbench Pro-overhaul** — én skjerm som samler alt coach trenger for å lede én spiller:

1. **Hero med profilbilde** + identitet + HCP + kategori + status pills
2. **KPI-strip** — 6 cards med utvikling, snitt-score, neste turnering, ukens fullført, SG-trend, fakturastatus
3. **AI-coach-strip** — kontekstuell anbefaling basert på spillerens aktuelle situasjon
4. **3-panels Coach Workbench Pro-layout** (oversikt | mål+plan | innsikt+SG)
5. **Tab-system med 10 tabs** — Oversikt, Mål, Plan, Statistikk, Runder, SG, Turneringer, Notater, Meldinger, Forelder
6. **Sticky footer** — pyramide-balanse + 3 action-buttons

**Rute:** `/admin/spillere/[id]` (her: `/admin/spillere/markus-roinas-pedersen`)

**Persona (coach):** Anders Kristiansen — Head coach AK Golf Academy, 38 aktive spillere.
**Persona (spiller):** Markus Røinås Pedersen — HCP +3,5, kategori A1, hjemmebane GFGK.

## Layout

Følger TPK04 Coach Workbench Pro-mønster: Linear sidebar + topbar + hero + KPI-strip + AI-strip + 3-panels + tabs + sticky footer.

### Chrome
- **Sidebar 220px** (forest bg): "AK GOLF / COACHHQ · PRO" + Anders-profil + nav-grupper (DAGLIG / OPERASJON / SPILLERE [aktiv, expanded med 38 spillere — Markus uthevet] / INNSIKT)
- **Topbar 56px**: ⌘K + breadcrumb "Spillere / Markus Røinås Pedersen" + role-toggle (Coach/DL) + Anders-avatar

### Hero (komprimert 80px)
Tre-kolonne hero:
- **Venstre 80px**: Profilbilde i sirkel (cream gradient placeholder med initialer "MRP" forest)
- **Senter (flex)**: 
  - Eyebrow JetBrains Mono uppercase: `SPILLER · A1 · HJEMMEBANE GFGK · MEDLEM SIDEN 2023`
  - Title Inter Tight 32px: `Markus ` + Instrument Serif italic `*Røinås Pedersen*`
  - Sub-strip mono 11px: `HCP +3,5 · 17 ÅR · TONE BERG (FORELDRE) · ABONNEMENT PRO · NESTE ØKT TIRSDAG 09:00`
  - 4 status-pills horisontalt:
    - Lime "AKTIV" (puls)
    - Forest "PRO 300 KR/MND"
    - Cream "2/4 CREDITS BRUKT"
    - Outline "SAMTYKKER OK"
- **Høyre**: 4 actions rounded-pill stacked:
  1. `Book ny økt` (lime, primary)
  2. `Send melding` (forest)
  3. `Endre HCP` (outline)
  4. `…` (kebab) → Arkiver / Eksporter rapport / Slett (destructive)

### KPI-strip (120px) — 6 cards horisontalt

Hver card 16px radius, hvit bg, border, 16px padding:

1. **HCP-utvikling** (forest accent)
   - Stor mono `+3,5`
   - Sub mono small `Δ −1,2 siste 6 mnd`
   - Mini-sparkline (forest linje, 80×30px)
   - Label "HCP siden januar"

2. **Snitt score** (cream)
   - Stor mono `72,4`
   - Sub mono small `siste 8 runder · sub-par i 5 av 8`
   - Pill "−0,8 vs forrige periode" lime
   - Label "Slag-snitt"

3. **Neste turnering** (lime accent)
   - Stor Inter Tight 18px `Sørlandsåpent`
   - Sub mono `om 21 dager · 16. juni`
   - Forberedelses-bar 78%
   - Label "Hovedmål"

4. **Fullført denne uka** (forest)
   - Stor mono `4 / 5`
   - Sub mono small `1 økt gjenstår · torsdag`
   - Mini-segmenter (FYS/TEK/SLAG/SPILL/TURN status-prikker)
   - Label "Ukens plan"

5. **SG-trend** (cream)
   - Stor mono `+0,42`
   - Sub mono small `Strokes Gained Total · siste 10 runder`
   - Mini-graf 80×30 (lime trend)
   - Label "SG-Total"

6. **Faktura-status** (cream)
   - Stor mono `0 kr`
   - Sub mono small `forfalt · neste 1. juni`
   - Pill lime "AJOUR"
   - Label "Utestående"

### AI-coach-strip (60px, under KPI)
Lime-pastell pastel-stripe med Lucide Sparkles-ikon:

> **Sentinel sier:** Markus har levert 4 av 5 økter denne uka og SG-trenden er +0,42. Iron-progresjonen flater ut — anbefaler å bytte fra repetisjon til scenario-trening på hull 4/5 førstkommende økt. Skal jeg foreslå justering i planen?
>
> CTA: `Ja, foreslå justering` (lime) · `Vis SG-detaljer` (outline) · `Avvis` (outline)

### Tab-bar (48px, sticky under AI-strip)
10 tabs Inter Tight, lime underline på aktiv. Aktiv default: **Oversikt**.
- `Oversikt` (aktiv) · `Mål` · `Plan` · `Statistikk` · `Runder` · `SG` · `Turneringer` · `Notater` · `Meldinger` · `Forelder`

Hver tab har full bredde under tab-bar (ikke split). Beskrivelser nedenfor for Oversikt + kort for hver av de andre.

---

## TAB 1: OVERSIKT (default, full Coach Workbench Pro 3-panels)

### 3-panels horisontalt (alle 100% høyde, scrollable internt)

#### Panel 1 — Spiller-oversikt (33%, venstre)

**Identitet-card (200px):**
- Foto stort (cream gradient + initialer)
- Navn + HCP-blokk
- Kategori, alder, klubb
- Kontakt: e-post + telefon (kopier-knapp)
- Foreldre: Tone Berg (link → forelder-tab)
- Tilgang-info: "PlayerHQ-tilgang aktiv · sist innlogget i går 21:14"

**Historikk-tidslinje (auto-høyde):**
Vertikal timeline med 8 hendelser siste 90 dager:
- 18. mai · HCP justert +3,5 → +3,5 (uendret)
- 14. mai · Runde GFGK · 71 (E)
- 10. mai · Plan oppdatert · "Spesialisering vår"
- 5. mai · Påske-cup GFGK · T4
- 28. april · Privat-økt Anders · TEK iron
- 24. april · SG-rapport oppdatert
- 18. april · Påske-cup GFGK · T4 · −2/−1
- 14. april · Foreldre-samtykke fornyet (Tone)

Hver hendelse: ikon (Lucide) + dato (mono) + tittel (Inter Tight 13px) + sub (mono small)

**Stamdata-card:**
- Adresse, fødselsdato (mono)
- Foreldre-kontakt (Tone Berg, mor) + ev. far
- Skole/idrettsskole: WANG Toppidrett Fredrikstad
- Tilknytning: Junior-elite, NGF-merket

#### Panel 2 — Mål + Plan (33%, senter)

**Mål-card (top, 200px):**
- Tittel Inter Tight 18px "Sesongmål 2026"
- 3 hovedmål:
  1. **HCP** → 0 innen oktober (nå +3,5) — progress 70%
  2. **NM Slag** → kvalifisere (cut Top 30) — status "på vei"
  3. **Klubbmesterskap GFGK** → vinne — status "ikke startet trening"
- Lime CTA "Sett nytt mål" (åpner Sett mål-modal)

**Aktiv plan-card:**
- Tittel "Aktiv plan: Spesialisering vår 2026"
- Periode mono `1. mai – 30. juni 2026`
- Progress-bar 68% lime
- Sub mono `12 av 17 økter fullført · 5 gjenstår`
- 5 disipliner med mini-progress:
  - FYS 12% (2 av 17) · forest bar
  - TEK 35% (6 av 17) · lime bar
  - SLAG 24% (4 av 17) · forest bar
  - SPILL 18% (3 av 17) · cream bar
  - TURN 11% (2 av 17) · cream bar
- Action-rad: `Endre plan` (outline) · `Tildel ny plan` (lime, primary)

**Kommende økter (3 stk):**
Liste:
1. **Tirsdag 21. mai 09:00–10:00** · Performance Studio · TEK iron-progresjon · "Mål: 5-PW konsistens innenfor 8m"
2. **Torsdag 23. mai 16:00–17:30** · Nærspillsområde · SLAG putting + chip
3. **Lørdag 25. mai 10:00–12:00** · 9-hullsbanen · SPILL course management

#### Panel 3 — Innsikt + SG (33%, høyre)

**SG-radar (200px):**
SVG radar-chart med 6 akser:
- SG-OTT (Off the Tee): +0,15
- SG-APP (Approach): +0,28
- SG-ARG (Around the Green): −0,12
- SG-PUTT (Putting): +0,11
- SG-T2G (Tee to Green): +0,31
- SG-TOT (Total): +0,42

Radar lime-fill med forest border. Norsk benchmark forest dashed-linje.

**Styrke-strip:**
3 pills "Sterkest" lime:
- TEK iron-spill (+0,32 vs gjennomsnitt)
- TEK driver-konsistens (+0,28)
- SPILL strategi (+0,19)

3 pills "Svakest" cream:
- SLAG bunker (−0,18)
- SLAG putting >4m (−0,15)
- TURN mental konsistens (−0,11)

**Form-kurve-card:**
Linje-graf (120px høy) over 90 dager:
- X: dato (mono)
- Y: HCP-justert SG-Total
- Lime stipplet linje = mål
- Forest solid = faktisk
- Lime puls-prikker på siste 3 målinger

**Innsikt-AI-card (cream bg, Sparkles-ikon):**
> "Markus' SG-APP er +0,28, betydelig over gjennomsnitt. Han skiller seg ut der. Bunker (-0,18) er hans svakeste — anbefales 2 fokus-økter før Sørlandsåpent (mye bunker på Mandalkrysset)."

CTA: `Skreddersy ukens plan` (lime) · `Vis SG-historikk` (outline)

---

## TAB 2: MÅL

Full-bredde liste over alle mål (sesongmål + delmål + per-turnering):

- **Sesongmål 2026** (3 stk, hver med progress-card)
- **Per-turnering-mål** (Sørlandsåpent: Top 10 · NM Slag: kvalifisere · Klubbmesterskap: vinne)
- **Personlige mål** (HCP-mål, SG-mål)
- **Foreldre-godkjente mål** (med Tone Berg-signatur-badge)

Hver mål-card:
- Ikon + tittel + mål-verdi
- Progress + sub "12 av 17 mål-økter fullført"
- Forfall (dato mono)
- Action-rad: Rediger / Marker fullført / Slett

CTA bunn: `+ Sett nytt mål` (lime)

---

## TAB 3: PLAN

Detaljert plan-visning:
- Tidslinje horisontalt jan→des med periode-blokker (Mac O'Grady-faser)
- Aktiv periode: "Spesialisering vår" (forest highlight)
- Per-uke breakdown: 17 økter listet
- Status per økt (fullført lime / planlagt cream / forsinket destructive)
- CTA: `Tildel ny plan` (lime) · `Bytt mal` (outline) · `Eksporter til Markus` (outline)

---

## TAB 4: STATISTIKK

KPI-grid 12-kolonne:
- Runder spilt siste 12 mnd: 47
- Snitt score: 72,4
- Beste runde: 67 (−4)
- Antall sub-par-runder: 11
- HCP-utvikling: graf 12 mnd
- FIR (Fairways in Regulation): 68%
- GIR (Greens in Regulation): 62%
- Putts per runde: 30,1
- Up-and-down: 54%
- Scrambling: 48%
- Sand saves: 41%
- 3-putts per runde: 1,2

---

## TAB 5: RUNDER

Tabell over siste 30 runder:
| Dato | Bane | Score | Til par | FIR | GIR | Putts | SG-Tot |
|---|---|---|---|---|---|---|---|
| 14. mai 2026 | GFGK | 71 | E | 71% | 67% | 29 | +0,4 |
| 7. mai 2026 | GFGK | 70 | −1 | 75% | 72% | 30 | +0,8 |
| 28. april 2026 | Onsoy GK | 73 | +2 | 64% | 56% | 31 | −0,2 |
…

Klikk på rad → åpner runde-detalj-modal med hull-for-hull og SG-breakdown.

---

## TAB 6: SG (Strokes Gained)

Dyp SG-visning:
- Stor radar-chart (400px) sentralt
- Trend-grafer per kategori (OTT, APP, ARG, PUTT)
- Sammenligning mot:
  - PGA Tour-benchmark
  - Norsk elite-benchmark
  - Egen baseline 12 mnd siden
- Filter: siste 5 / 10 / 20 / 50 runder

---

## TAB 7: TURNERINGER

Sesongoversikt — samme stil som Spiller Turneringsplanlegger, men i coach-context:
- 14 turneringer 2026
- Hovedmål merket lime stjerne
- Forberedelse-status per turnering
- Resultat-historikk forrige sesong
- CTA: `Endre prioritet` (åpner modal — se nedenfor)

---

## TAB 8: NOTATER

Tidssortert coach-journal:
- Hver notat = card med dato, type-tag (TEK/SLAG/PRIV/FYS/MED), brødtekst
- Filter: type · forfatter · dato
- Søk
- CTA: `+ Nytt notat` (lime)

Eksempel:
- **18. mai 2026 · TEK** · "Iron-progresjonen flater ut. Trenger scenario-trening fremfor repetisjon."
- **12. mai 2026 · MED** · "Lett irritasjon i venstre håndledd — følges opp."
- **5. mai 2026 · PRIV** · "Markus stresset før påske-cup. Mental rutine før første tee må forsterkes."

---

## TAB 9: MELDINGER

Chat-tråd mellom Anders og Markus (+ ev. Tone som CC):
- Avatar + navn + timestamp
- Lime bobler = Anders (coach)
- Cream bobler = Markus
- Forest dashed = Tone (forelder, CC)
- Input bunn: tekstfelt + vedlegg + Send-knapp
- Sub: "Tone Berg er CC på denne tråden"

---

## TAB 10: FORELDER

- **Tone Berg** card (foto + kontakt)
- Samtykke-status: GDPR / foto-bruk / deling med klubb — alle aktive
- Faktura-status: ajour
- Godkjenningshistorikk: 12 godkjenninger siste 12 mnd
- Direkte-melding-CTA: `Send melding til Tone` (lime)

---

## Sticky footer (64px)

- **Venstre**: Pyramide-balanse-bar (5 disipliner FYS/TEK/SLAG/SPILL/TURN) — "Markus' kommende uke: FYS 15% · TEK 30% · SLAG 25% · SPILL 20% · TURN 10%"
- **Senter**: Mini-status mono — "Neste hovedmål: Sørlandsåpent · om 21 dager · 78% forberedt"
- **Høyre**: 3 actions:
  - `Be om plan-justering` (outline + Sparkles)
  - `Send melding` (outline)
  - `Book ny økt` (lime, primary)

---

## Modal: Endre HCP

- Nåværende HCP-display mono stor "+3,5"
- Input: ny HCP (number, +/−)
- Årsak (dropdown): Runde-justering · NGF-revisjon · Manuell coach-overstyring
- Notat (fritekst)
- Effekt-preview: "Δ −0,2 → ny HCP +3,3"
- CTA: `Lagre HCP-endring` (lime) · `Avbryt` (outline)

## Modal: Sett mål

- Type (radio): Sesongmål · Turnerings-mål · Personlig · Foreldre-godkjent
- Mål-tekst (fritekst, eks. "Kvalifisere til NM Slag")
- Forfall (datovelger)
- Måle-kriterium (fritekst)
- Knytt til plan (dropdown)
- Knytt til turnering (dropdown valgfri)
- CTA: `Lagre mål` (lime) · `Lagre + send til Markus` (lime + Send-ikon) · `Avbryt`

## Modal: Tildel plan

- Velg mal (dropdown): Spesialisering vår · Konkurranseperiode · Overgangsfase · Hvile-uke · Egendefinert
- Periode (dato fra–til)
- Override discipline-fordeling (5 slidere FYS/TEK/SLAG/SPILL/TURN, sum = 100%)
- Påvirker eksisterende økter? (warning hvis ja)
- CTA: `Tildel plan` (lime) · `Tildel + send til Markus` (lime) · `Avbryt`

## Modal: Send melding

- Mottakere: Markus (default check), Tone Berg (forelder, valgfri check)
- Emne (fritekst)
- Brødtekst (textarea)
- Vedlegg (filopplaster)
- Send-tidspunkt: Nå / Planlagt (datovelger)
- CTA: `Send` (lime) · `Lagre som utkast` (outline) · `Avbryt`

## Modal: Endre prioritet på turneringer

Liste over alle 14 turneringer med radio HOVEDMÅL / MAJOR / NORMAL / LOCAL per rad. Live-validering på "max 4 hovedmål". CTA: `Lagre prioritet` (lime).

---

## Tilstander å vise

1. **Default**: Tab Oversikt aktiv, full 3-panels visning
2. **Tab byttet**: Annet innhold rendres under tab-bar
3. **Modal åpen**: Endre HCP-modal som primær demo
4. **Hover på KPI-card**: subtil skygge + lime border-shift
5. **AI-strip dismissed**: liten "Vis AI-anbefalinger igjen"-link

---

## Eksempel-spillere (sidebar context — 38 spillere, Markus uthevet)

Top 8 i sidebar-listen:
- Markus Røinås Pedersen (+3,5, A1) ← AKTIV
- Joachim Tangen (+1,2, A1)
- Henrik Vorli (+0,4, A1)
- Øyvind Røhjan (+3,5, A1)
- Emma Sundsdal (4,8, A2)
- Ida Mathisen (3,1, A2)
- Sigrid Berg (8,2, B1)
- Nora Lillevold (12,4, B2)

"+ 30 til" footer-link i sidebar.

---

## Branding (følger AK Golf design system)

- BG cream `#FAFAF7`
- Card hvit `#FFFFFF` med border `#E5E3DD`
- Primary forest `#005840`, accent lime `#D1F843`
- Discipline-pills bruker FYS/TEK/SLAG/SPILL/TURN-farger
- Inter Tight (titler), Inter (UI), JetBrains Mono (alle tall, HCP, score, SG-verdier, klokkeslett)
- Instrument Serif italic sparsomt — på etternavnet `Røinås Pedersen` i hero
- 16px radius cards, 12px buttons, 999px pills
- INGEN emojier, kun Lucide-ikoner stroke 1.75
- Norsk bokmål gjennomgående

## Tekniske krav

- Single self-contained `.html`
- Inline `<style>` block
- Google Fonts via `<link>`
- All icons inline Lucide SVG (stroke 1.75)
- Interaktive tabs (CSS-only eller minimal JS)
- SVG radar-chart for SG-visualisering
- ~2000–2400 linjer HTML

## Constraints

- INGEN emojier
- ALL UI på norsk bokmål
- Diskipliner uppercase: FYS, TEK, SLAG, SPILL, TURN
- Tall norsk format: HCP `+3,5`, score `−2`, plassering `T4`, SG `+0,42`
- Minus-tegn `−` ikke bindestrek `-` for negative tall
- Klokkeslett 24h: `09:00`
- Dato: `21. mai 2026`
- Penger: `300 kr/mnd`, `47 250 kr`
- SG-verdier alltid med komma som desimalskille: `+0,42`, `−0,18`

Output: én komplett HTML-fil. Begin `<!DOCTYPE html>`, end `</html>`. Ingen forklaring utenfor kode-blokken.
