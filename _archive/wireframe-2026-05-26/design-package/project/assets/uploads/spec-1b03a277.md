# Mini-batch coachhq-B - Operative dashboards

**5 skjermer i denne mini-batchen.** Felles moenster: aggregerte dashboards og
rapporter -- daglig brief, fasiliteter-konfig, analytics, revisjonslogg og
rapport-katalog. Anders Kristiansen er hovedaktoer.

**Generer alle 5 skjermer i denne sesjonen.** Foelg anti-state-katalog-regel
fra `felles-instruks.md` (last opp foerst) -- EEN produksjons-skjerm per HTML,
ikke captioned mini-mockups.

---

## Felles for CoachHQ-skjermer

- **Sidebar:** TO-LAGS. Smal moerk rail (56px, #061210) ytterst venstre + lys nav-kolonne (200px, #FAFAF7). Total bredde 256px. Active item i nav: rgba(209,248,67,0.30) bg + #0A1F18 tekst. ALDRI enkelt-lag lys sidebar.
- **Hero:** Italic Instrument Serif 36px observasjons-fragment (aldri "God morgen, Anders" eller "Welcome back"). Eksempler: *"Onsdag 11. mai. 6 oekter paa timeplanen."* / *"Hva trenger du aa rapportere?"*
- **Referanse-personer:**
  - Hovedcoach: Anders Kristiansen (NGF Trener IV)
  - Spillere: Markus Roinaas Pedersen, Henrik Nilsen, Anna Karlsen, Mads Roenning, Lise Sandberg, Joachim Tangen
- **Pyramide-farger:** FYS `#16A34A`, TEK `#005840`, SLAG `#D1F843`, SPILL `#F4C430`, TURN `#5E5C57`.
- **Lower-is-better metrics** (HCP, score): Nedgang = success-groenn.
- **Higher-is-better metrics** (SG, distanse, inntekt, belegg): Oppgang = success-groenn.
- **Tabular nums** (JetBrains Mono) paa alle score-, dato-, prosent- og inntekts-kolonner.
- **Komma som desimal** (12,4), **mellomrom som tusenseparator** (142 800 kr, ikke 142.800 / 142,800).
- **Maks 3 lime-elementer** synlig per skjerm. **Maks 1 italic** Instrument Serif per skjerm.
- 8pt-grid (8/16/24/32/40/48/64), Lucide-ikoner stroke 1.75.

---

## Pakker i denne mini-batchen

---

## Pakke 1/5: Daglig brief

# AK Golf Platform — CoachHQ — Daglig brief

## Identitet

- **Produkt:** CoachHQ
- **URL:** `/admin/daglig-brief`
- **Arketype:** G — Other (morgen-rapport, sekvensielt narrativ)
- **Tier-gating:** Ikke relevant
- **HTML-referanse:** `wireframe/screen-deck/coachhq/daglig-brief.html`
- **Audit:** finnes ikke ennå
- **Tilhørende modaler:** `BriefSettingsModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Daglig brief er Anders' morgen-rapport. Genereres automatisk hver morgen kl 06:30 og sendes som e-post + tilgjengelig i CoachHQ. Forskjellig fra dashboard (live-data) — brief er en **statisk øyeblikks-rapport** for *i dag*: hvilke spillere har trent i går, hva agentene anbefaler, dagens timeplan, hva som krever oppmerksomhet.

## Layout — UNIKT for denne skjermen

### Header

- Hero italic: *"Onsdag 11. mai. 6 økter på timeplanen."*
- Subtitle: `Brief generert kl 06:32 · Oppdatert nå`
- Aksjons-rad: `Send som e-post →`, `Skriv ut`, `Settings →`

### Sekvensielt narrativ (vertikalt stablet)

#### Seksjon 1: I går
- "5 spillere trente i går (Markus R, Emma S, Lina H, Joachim T, Mads R)"
- "1 hoppet over: Lise S (skadet, fortsatt restitusjon)"
- Pyramide-summary for gårsdagen som donut: TEK 38% / SLAG 22% / FYS 18% / SPILL 12% / TURN 10%
- "Beste prestasjon: Markus R fikk +2,4 SG-tot på simulator-økt"

#### Seksjon 2: Dagens timeplan
- Timeline-bar (06:00–22:00) med dagens 6 events som blokker
- Liste under: Klokkeslett + spiller + type + lokasjon
- "Travleste vindu: 14:00–17:00 (3 økter samtidig — sjekk Studio 1+2 belegg)"

#### Seksjon 3: Agentenes anbefalinger
- 3 venter på godkjenning (lenke til `/admin/approvals`)
- "Periodiserings-agent foreslår pauseuke for Markus R før Sørlandsåpent"
- "Deload-agent: 2 spillere viser tegn på overbelastning"

#### Seksjon 4: Krever oppmerksomhet
- 2 oppgaver i oppfølgings-køen er nye
- 1 faktura forfalt (Joachim T, 2 400 kr)
- Snart utløper: 2 treningsplaner (Emma S 14. mai, Lina H 18. mai)

#### Seksjon 5: Ukens prioritet (hvis mandag)
- Periodiserings-status: "Uke 19/26 i sommer-makrosyklus. Fokus: tek-volum opp 12%"
- Dropdown for å se neste ukers fokus

#### Seksjon 6: Tall i går (KPI-strip)
- 4 kort: Inntekt i går / Antall økter / Belegg / Nye approvals

## Filter-bar — IKKE for denne (statisk rapport)

## Klikkbare elementer

| Element | States |
|---|---|
| Send som e-post | default, hover, loading, success (toast "Sendt til {epost}") |
| Skriv ut | default, hover, klikk → window.print() |
| Settings | default, hover, klikk → `BriefSettingsModal` |
| Approvals-link | default, hover, klikk → `/admin/approvals` |
| Faktura-link | default, hover, klikk → `/admin/finance/invoices/:id` |
| Donut-pyramide | hover (per-segment tooltip) |
| Timeline-event | hover (tooltip), klikk → `/admin/sessions/:id` |

## Empty / loading / error

- **Empty (helt ny coach):** "Brief genereres etter første dag med data. Tom brief: 'Velkommen — i morgen begynner det'"
- **Loading (genererer):** Skeleton-seksjoner med pulserende
- **Generation-error:** "Kunne ikke generere brief. Prøv igjen kl 07:00 →"

## Ønsket output fra Claude Design

1. Lyst tema, full brief
2. Mørkt tema, samme
3. Print-vennlig variant (lyst, ingen sidebar, mer luft)
4. Empty (ny coach uten data)
5. Mobil ≤640px — alle seksjoner stables 1-kolonne, ingen sticky

## Ikke-mål

- Ikke designe `BriefSettingsModal` (egen batch)
- Ikke designe e-post-template-rendering (egen design-fase)
- Ikke designe historikk-view over brief

---

## Pakke 2/5: Fasiliteter

# AK Golf Platform — CoachHQ — Fasiliteter (utvidet detail)

## Identitet

- **Produkt:** CoachHQ
- **URL:** `/admin/facilities`
- **Arketype:** G — Other (master-detail med utvidet konfig)
- **Tier-gating:** Admin
- **HTML-referanse:** `wireframe/screen-deck/coachhq/facilities.html`
- **Audit:** finnes ikke ennå
- **Tilhørende modaler:** `NewFacilityModal`, `EditOpeningHoursModal`, `PriceMatrixModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Fasiliteter er den utvidede admin-flaten for hver bookbar enhet under en lokasjon. Eksempler: Mulligan Studio 1, 2, 3, 4 (alle under lokasjon `Mulligan Indoor Golf`), GFGK Range (under lokasjon `Gamle Fredrikstad GK`). Hver fasilitet har egen åpningstid, pris-matrise (peak/off-peak), kapasitet (antall samtidige bookinger), utstyrsliste, og koblet kalender.

Forskjellig fra batch-1 facilities-card (som er KPI på dashboard) — dette er full konfig.

## Layout — UNIKT for denne skjermen

Master-detail med 30/70-split:

### Master (venstre, 30%)

- Filter-bar: chip Lokasjon (Mulligan / GFGK / Bossum / WANG), søk
- Liste over fasiliteter, hver med:
  - Navn (Geist 14px)
  - Lokasjon (muted 12px)
  - Status-prikk (aktiv accent / inaktiv muted / vedlikehold gold)
  - Belegg-prosent (sparkline siste 7 dager)
- CTA bunn: `+ Ny fasilitet` → `NewFacilityModal`

### Detail (høyre, 70%)

For valgt fasilitet, vertikalt stablet:

#### Header
- Stort fasilitet-navn (italic Instrument Serif 36px)
- Subtitle: `Mulligan Indoor Golf · Studio 1 · Aktiv`
- Aksjons-rad: `Rediger`, `Dupliser`, `Arkiver` (destructive)

#### Seksjon 1: Grunnopplysninger
- Felter (read-only med "Endre →"):
  - Type: Trackman-simulator
  - Kapasitet: 4 personer
  - Areal: 24 m²
  - Utstyr: Trackman 4, Mevo+ launch monitor, 3 putters, …

#### Seksjon 2: Åpningstider
- Visuell uke-bar (Mandag–Søndag)
- Hver dag viser åpningstid (`08:00–22:00`) + lukket-dager med diagonal stripes
- `Endre →` → `EditOpeningHoursModal`

#### Seksjon 3: Pris-matrise
- Tabell:
  | Tidsslot | Hverdag | Helg |
  |---|---|---|
  | Off-peak (08–15) | 450 kr/t | 550 kr/t |
  | Peak (15–22) | 650 kr/t | 750 kr/t |
- Toggle: Member-pris / Standard-pris
- `Endre →` → `PriceMatrixModal`

#### Seksjon 4: Belegg (siste 30d)
- Stacked bar chart per uke
- Snitt: 67%, peak: 94% (onsdag 17:00)

#### Seksjon 5: Inntekt (MTD)
- Stort tall: `47 200 kr`
- Sparkline 30 dager
- Drill-down-link til Finance med fasilitet-filter

## KPI-strip (4 kort, øverst)

1. Aktive fasiliteter: 7
2. Snitt-belegg: 67%
3. Inntekt MTD (alle): 142 800 kr
4. Vedlikehold påkrevd: 1 (Studio 3 — Trackman re-kalibrering)

## Klikkbare elementer

| Element | States |
|---|---|
| Master-rad | default, hover (bg-shift), selected (accent-border + bg-shift) |
| Endre-link per seksjon | default, hover, klikk → modal |
| Status-prikk | default, hover (tooltip "Aktiv siden 2025-09-12") |
| Aksjons-rad-knapp | default, hover, destructive for Arkiver |
| Belegg-bar | hover (tooltip per uke) |

## Empty / loading / error

- **Empty (ingen fasiliteter):** "Ingen fasiliteter registrert. Lag din første →" CTA
- **Detail-empty (ingen valgt):** "Velg en fasilitet i listen for å se detaljer"
- **Loading detail:** Skeleton-seksjoner
- **Endre-error:** Inline rød tekst per modal

## Ønsket output fra Claude Design

1. Lyst tema, master-detail åpent på Studio 1
2. Mørkt tema, samme
3. Master-rad hover-state
4. Detail-empty (ingen valgt)
5. Mobil ≤640px — master blir top-liste, detail under (1-kolonne flow)

## Ikke-mål

- Ikke designe `NewFacilityModal`, `EditOpeningHoursModal`, `PriceMatrixModal` (egen batch)
- Ikke designe Trackman-konfig
- Ikke designe vedlikeholds-sjekkliste

---

## Pakke 3/5: Analytics V2

# AK Golf Platform — CoachHQ — Analytics V2 (stallen samlet)

## Identitet

- **Produkt:** CoachHQ
- **URL:** `/admin/analytics-v2`
- **Arketype:** G — Other (multi-pane analytics-dashboard)
- **Tier-gating:** Pro+ (Free får begrenset)
- **HTML-referanse:** `wireframe/screen-deck/coachhq/analytics-v2.html`
- **Audit:** finnes ikke ennå
- **Tilhørende modaler:** `MetricDetailModal`, `CompareModal`, `ExportAnalyticsModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Analytics V2 er Anders' aggregerte spiller-stallens-utvikling. Forskjellig fra individuell spiller-progresjon — dette er **stallen samlet**: snitt-HCP-utvikling, totalt treningsvolum, agent-effektivitet (godkjenningsrate), pyramide-balanse på tvers av alle spillere. Brukes til ledermøter og styrerapporter.

## Layout — UNIKT for denne skjermen

Multi-pane med 4 kvadranter + global filter:

### Global filter-bar (sticky øverst)

- Periode: dropdown + datepicker (`Siste 30d / 90d / 6 mnd / 12 mnd / Egendefinert`)
- Spiller-segment: chip (Alle / Pro+ / Elite / Kategori A-K / WANG)
- Sammenligne med: dropdown ("Forrige periode" / "Samme periode i fjor" / "Ingen")

### Kvadrant 1: HCP-utvikling (top-left)

- Linje-chart, hver spiller som en linje (semi-transparent), snitt som tykk lime-linje
- Y-akse: HCP, X-akse: dato
- Hover → tooltip per linje (spillernavn + HCP)

### Kvadrant 2: Treningsvolum (top-right)

- Stacked bar chart per uke
- Stacks: Coaching / Selvtrening / Gruppe / Runder
- Snitt per spiller som overlay-linje

### Kvadrant 3: Pyramide-balanse (bottom-left)

- Stacked area chart over tid
- Stacks: FYS / TEK / SLAG / SPILL / TURN
- Viser hvordan pyramide-fokus har endret seg over perioden
- Toggle: "Volum" (timer) eller "Andel" (%)

### Kvadrant 4: Agent-effektivitet (bottom-right)

- Tabell:
  | Agent | Anbefalinger | Godkjent | Avslått | Snitt-respons |
  |---|---|---|---|---|
  | Periodiserings | 47 | 38 (81%) | 9 | 1t 24m |
  | Deload | 23 | 19 (83%) | 4 | 2t 8m |
  | Escalation | 5 | 5 (100%) | 0 | 14m |

### Compare-overlay (når aktivert)

Hvert chart får en sekundær linje/bar i secondary-farge for sammenligningsperioden, samt delta-pill øverst-høyre: `+12,4% vs forrige periode` (success) eller `-3,2%` (destructive).

## KPI-strip (4 kort, øverst over kvadranter)

1. Snitt-HCP: 12,4 (`-1,2 vs samme periode i fjor`, success)
2. Total treningsvolum: 482t (`+18,2%`, success)
3. Agent-godkjenning: 84% (`+4 pp`, success)
4. Pyramide-balanse-score: 7,8/10 (`+0,4`, success)

## Filter-bar (UNIKT, allerede beskrevet over)

CTA: `Eksporter →` → `ExportAnalyticsModal` (PDF-rapport eller CSV-rådata)

## Klikkbare elementer

| Element | States |
|---|---|
| KPI-kort | default, hover (lift), klikk → drill-down |
| Chart-linje | hover (highlight + tooltip), klikk → spiller-profil |
| Stack-segment | hover (zoom + tooltip), klikk → `MetricDetailModal` |
| Compare-toggle | default, active (overlay synlig) |
| Periode-velger | default, open (dropdown med datepicker) |
| Eksporter | default, hover, loading (spinner), success (download) |

## Empty / loading / error

- **Empty (for kort periode):** "Velg periode med minst 7 dager med data"
- **Loading:** Skeleton-charts med pulserende streker
- **Compare-error:** "Ingen data for sammenligningsperiode"

## Ønsket output fra Claude Design

1. Lyst tema, full multi-pane "Siste 90d", uten compare
2. Mørkt tema, samme
3. Med compare-overlay aktivert ("Forrige 90d")
4. Hover-state på et chart med tooltip
5. Mobil ≤640px — kvadranter stables 1-kolonne, hvert chart full bredde, filter blir bottom-sheet

## Ikke-mål

- Ikke designe `MetricDetailModal`, `CompareModal`, `ExportAnalyticsModal` (egen batch)
- Ikke designe per-spiller-drill-down (det er sin egen flate)
- Ikke designe scheduling av automatiske rapporter (i Reports)

---

## Pakke 4/5: Revisjonslogg (audit)

# AK Golf Platform — CoachHQ — Revisjonslogg (audit)

## Identitet

- **Produkt:** CoachHQ
- **URL:** `/admin/audit`
- **Arketype:** G — Other (timeline + filter)
- **Tier-gating:** Admin (capability `audit.read`)
- **HTML-referanse:** `wireframe/screen-deck/coachhq/audit.html`
- **Audit:** finnes ikke ennå
- **Tilhørende modaler:** `AuditEventDetailModal`, `ExportAuditModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Revisjonslogg er complience- og sikkerhetsverktøyet — viser **alle endringer** i systemet (hvem gjorde hva, når). Eksempler: ny spiller registrert, plan publisert, fakturafritak gitt, agent-konfig endret, rolle endret. Brukes når Anders må undersøke "hvem endret denne fakturaen?" eller når GDPR-forespørsel kommer ("vis alt om denne brukeren").

## Layout — UNIKT for denne skjermen

### Vertikal timeline

- Sentral 2px linje (border-color)
- Hver event som card til venstre/høyre alternerende (på desktop), eller alle venstre (mobil)
- Sticky dato-header per dag: `11. mai 2026` (sticky bar over events fra den dagen)

### Event-card

Hver card:
- **Event-ikon** (Lucide, 24px) i sirkel på timeline-linja:
  - Create — `Plus` (accent)
  - Update — `Pencil` (primary)
  - Delete — `Trash2` (destructive)
  - Auth — `KeyRound` (gold)
  - Agent — `Bot` (secondary)
- **Klokkeslett** (Geist Mono): `14:32:18`
- **Action-tekst** (1 linje): `Anders Kristiansen oppdaterte plan "Sommer-toppform" for Markus Roinaas Pedersen`
- **Diff-snippet** (collapsed by default, "Vis endring →" til highlight):
  ```
  - varighet: 6 uker
  + varighet: 8 uker
  ```
- **Meta-rad nederst:** IP-adresse · enhet (Mac · Chrome 134) · CBAC-rolle (Hovedcoach)

### Right-rail: filter-summary

- "Viser 47 events siste 7 dager"
- "Top aktører: Anders K (28), Sara P (12), Periodiserings-agent (7)"
- "Top entiteter: Plan (18), Spiller (12), Booking (10)"

## KPI-strip (4 kort)

1. Events siste 7d: 1 247
2. Aktive aktører: 8 (5 mennesker, 3 agenter)
3. Slett-events: 12 (alle med årsak loggført)
4. Sikkerhets-events: 3 (mislyktede login)

## Filter-bar — UNIKT

- Søk: "Søk aktør, entitet eller action"
- Chip: Action-type (Create / Update / Delete / Auth / Agent)
- Chip: Aktør (Anders / Sara / Tom / Agent X / API)
- Chip: Entitet (Spiller / Plan / Booking / Faktura / Konfig)
- Periode-velger: dropdown + datepicker
- Primary CTA: `Eksporter →` → `ExportAuditModal` (CSV / JSON for GDPR)

## Klikkbare elementer

| Element | States |
|---|---|
| Event-card | default, hover (ring), klikk → `AuditEventDetailModal` (full diff + raw JSON) |
| Vis endring-link | default, hover, expanded (diff synlig) |
| Aktør-link | default, hover, klikk → filter til kun den aktøren |
| Entitet-link | default, hover, klikk → åpne entiteten i sin egen view |
| Eksporter-CTA | default, hover, loading, success (download) |

## Empty / loading / error

- **Empty (ingen events i periode):** "Ingen events i denne perioden. Prøv et bredere tidsvindu."
- **Loading:** Skeleton timeline med pulserende cards
- **Error (tilgang nektet):** "Du har ikke tilgang til revisjonslogg. Be admin om `audit.read`-capability."

## Ønsket output fra Claude Design

1. Lyst tema, timeline med ~10 events fra 2 dager
2. Mørkt tema, samme
3. En event med diff-snippet expanded
4. Filter aktivt: Action=Delete (viser kun slett-events)
5. Mobil ≤640px — alle events venstre-justert, ikoner mindre, diff-snippet mer kompakt

## Ikke-mål

- Ikke designe `AuditEventDetailModal`, `ExportAuditModal` (egen batch)
- Ikke designe GDPR-data-export-flyten (egen sub-flow)
- Ikke designe alarms/alerts på audit-events

---

## Pakke 5/5: Rapporter

# AK Golf Platform — CoachHQ — Rapporter

## Identitet

- **Produkt:** CoachHQ
- **URL:** `/admin/reports`
- **Arketype:** G — Other (rapport-katalog med generator)
- **Tier-gating:** Hovedcoach + admin
- **HTML-referanse:** `wireframe/screen-deck/coachhq/reports.html`
- **Audit:** finnes ikke ennå
- **Tilhørende modaler:** `ReportConfigModal`, `ScheduleReportModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Rapporter er katalogen over alle pre-byggede rapport-maler — månedsoppsummering for foreldre, kvartalsrapport til styret, spillerprogresjon-rapport, finance-rapport, agent-effektivitet-rapport. Anders kan generere ad-hoc, planlegge automatisk leveranse (e-post hver 1. i måneden), og sende til mottakere.

## Layout — UNIKT for denne skjermen

### Header

- Hero italic: *"Hva trenger du å rapportere?"*
- Subtitle: `12 maler tilgjengelig · 4 planlagte leveranser`

### Rapport-katalog (3-kolonne grid)

Hver mal som en card:
- Stort ikon øverst (Lucide: `FileText`, `BarChart3`, `Users`, `DollarSign`, `Bot`)
- Tittel (Geist 16px medium)
- 1-setning beskrivelse (muted 13px)
- Meta-rad: `PDF · 3 sider · Tar ~30 sek`
- Aksjons-rad: `Generer →` (primary), `Planlegg →` (ghost), `Forhåndsvis` (link)

12 maler i 5 kategorier:
1. **For foreldre (3):** Månedsrapport spiller, Kvartalsrapport spiller, Sesongoppsummering
2. **For spillere (2):** Min progresjon (PDF), Test-historikk
3. **For styret (3):** Måned-finance, Kvartal-strategisk, Årsrapport
4. **For coaches (2):** Agent-effektivitet, Plan-godkjennings-rate
5. **For klubber (2):** Belegg-rapport, Inntekt-per-tjeneste

### Right-rail: Planlagte leveranser

320px sidebar:
- "4 planlagte leveranser" header
- Liste:
  - "Månedsrapport — alle foreldre · Hver 1. kl 08:00 · Neste: 1. juni"
  - "Kvartal-finance — styret · Hver 1. apr/jul/okt/jan · Neste: 1. juli"
  - …
- Hver med: pause/edit/slett-aksjoner

## KPI-strip (4 kort)

1. Maler tilgjengelig: 12
2. Generert siste 30d: 47
3. Planlagte leveranser: 4 (neste: 1. juni)
4. Snitt-genereringstid: 28 sek

## Filter-bar — UNIKT

- Søk: "Søk rapport-mal"
- Chip: Kategori (Foreldre / Spillere / Styret / Coaches / Klubber)
- Chip: Format (PDF / CSV / Excel)
- Sort: Mest brukt / Nyeste / A-Å

## Klikkbare elementer

| Element | States |
|---|---|
| Mal-card | default, hover (lift + ring), klikk → forhåndsvis-modal |
| Generer-CTA | default, hover, loading (spinner + "Genererer…"), success (download) |
| Planlegg-CTA | default, hover, klikk → `ScheduleReportModal` |
| Right-rail-rad | default, hover, klikk → edit-mode |
| Right-rail pause-aksjon | default, hover, success (toast "Pauset") |

## Empty / loading / error

- **Empty (ingen planlagte):** Right-rail viser "Ingen planlagte leveranser. Planlegg din første →"
- **Loading (genererer):** Inline progress-bar i card + "Genererer rapport…"
- **Error (genererings-feil):** "Kunne ikke generere. Prøv igjen →" inline i card

## Ønsket output fra Claude Design

1. Lyst tema, full katalog 12 maler + right-rail med 4 planlagte
2. Mørkt tema, samme
3. Card-hover med "Generer →" highlighted
4. Loading-state på en card (genererer)
5. Mobil ≤640px — 1-kolonne grid, right-rail blir collapse-able bottom-sheet

## Ikke-mål

- Ikke designe `ReportConfigModal`, `ScheduleReportModal` (egen batch)
- Ikke designe selve PDF-output (egen design-fase)
- Ikke designe ad-hoc-rapport-builder
