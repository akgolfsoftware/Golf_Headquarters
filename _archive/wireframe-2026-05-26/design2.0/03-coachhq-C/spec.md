# Mini-batch coachhq-C - Kalender + lister

**5 skjermer i denne mini-batchen.** Felles moenster: tids- og kommunikasjons-
flater -- kalender-overblikk, kapasitets-heatmap, lag-sammenligning, meldings-
chat og oppfoelgings-koe. Anders Kristiansen er hovedaktoer.

**Generer alle 5 skjermer i denne sesjonen.** Foelg anti-state-katalog-regel
fra `felles-instruks.md` (last opp foerst) -- EEN produksjons-skjerm per HTML,
ikke captioned mini-mockups.

---

## Felles for CoachHQ-skjermer

- **Sidebar:** TO-LAGS. Smal moerk rail (56px, #061210) ytterst venstre + lys nav-kolonne (200px, #FAFAF7). Total bredde 256px. Active item i nav: rgba(209,248,67,0.30) bg + #0A1F18 tekst. ALDRI enkelt-lag lys sidebar.
- **Hero:** Italic Instrument Serif 36px observasjons-fragment (aldri "God morgen, Anders" eller "Welcome back"). Eksempler: *"Uke 19. 38 events paa timeplanen."* / *"Hvem leverer, hvem henger etter."*
- **Referanse-personer:**
  - Hovedcoach: Anders Kristiansen (NGF Trener IV)
  - Spillere: Markus Roinaas Pedersen, Henrik Nilsen, Anna Karlsen, Mads Roenning, Lise Sandberg, Joachim Tangen
- **Pyramide-farger:** FYS `#16A34A`, TEK `#005840`, SLAG `#D1F843`, SPILL `#F4C430`, TURN `#5E5C57`.
- **Lower-is-better metrics** (HCP, score): Nedgang = success-groenn.
- **Higher-is-better metrics** (SG, distanse, belegg, antall oekter): Motsatt.
- **Tabular nums** (JetBrains Mono) paa alle score-, dato-, prosent- og inntekts-kolonner.
- **Komma som desimal** (12,4), **mellomrom som tusenseparator** (1 600 kr, ikke 1.600).
- **Maks 3 lime-elementer** synlig per skjerm. **Maks 1 italic** Instrument Serif per skjerm.
- 8pt-grid (8/16/24/32/40/48/64), Lucide-ikoner stroke 1.75.

---

## Pakker i denne mini-batchen

---

## Pakke 1/5: Kalender

# AK Golf Platform — CoachHQ — Kalender

## Identitet

- **Produkt:** CoachHQ
- **URL:** `/admin/kalender`
- **Arketype:** G — Other (uke/måned-kalender med pyramide-stripes)
- **Tier-gating:** Pro+ for parallelle coaches
- **HTML-referanse:** `wireframe/screen-deck/coachhq/kalender.html`
- **Audit:** finnes ikke ennå
- **Tilhørende modaler:** `NewSessionModal`, `BookSessionModal`, `EventDetailPopover`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Kalender er Anders' fugleperspektiv på alt han har på timeplanen — coaching-økter, bookinger, gruppe-økter, turneringer, og personlige sperre-blokker. Forskjellig fra `/admin/sessions` (kun trenings-økter) og `/admin/bookings` (kun bookinger): denne aggregerer alt, inkludert eksterne kalendere (Google Calendar via OAuth). Anders bruker den hver morgen for å se "hva har jeg i dag".

## Layout — UNIKT for denne skjermen

### Toggle øverst-høyre

Segmentert kontroll: `Dag / Uke / Måned / Agenda`. Uke er default.

### Uke-view (default)

- 7 kolonner (Mandag–Søndag), datoer i header med ukenummer (`Uke 19, 11.–17. mai 2026`)
- Tidsblokker fra 06:00 til 22:00, 30-min slots
- Event-blokker fargekodet etter type:
  - **1:1 coaching** (lime accent) — pyramide-stripe venstre
  - **Gruppe-økt** (primary green) — pyramide-stripe venstre
  - **Booking** (gold) — ikke pyramide
  - **Turnering** (secondary) — full bredde, høyere blokk
  - **Sperret** (muted, diagonal stripes) — "ikke tilgjengelig"
  - **Ekstern (Google)** (border-only, dashed) — leses fra Google Calendar
- "Naa"-linje (rød horisontal, 1px) på dagens dato
- Klikk event → `EventDetailPopover` med 3 aksjoner: `Åpne` / `Omplanlegg` / `Avlys`
- Klikk tom slot → `NewSessionModal` eller `BookSessionModal` (basert på event-type-velger i popover)

### Måned-view

- Standard kalender-grid (6 uker × 7 dager)
- Hver dag-celle viser maks 3 events som pills + `+N flere`
- Klikk dag → bytter til Dag-view for den datoen

### Agenda-view

- Vertikal liste, gruppert per dato med sticky dato-header
- Hver event som en rad med tid + type-pill + tittel + spiller/gruppe + lokasjon

### Sidebar-panel (collapse-able)

Høyre side, 280px bredt:
- **Mini-kalender** (måned-overview) for navigering
- **Kalender-toggles** (checkbox per kalender): "Coaching" / "Bookinger" / "Turneringer" / "Privat" / "Google Calendar"
- **Knapp:** `Synk Google Calendar` (loading-spinner ved klikk)

## KPI-strip (4 kort)

1. Events i dag: 6 (3 coaching, 2 bookinger, 1 gruppe)
2. Events denne uka: 38
3. Free-tid i kveld: 2t 30m
4. Konflikter: 0 (eller "1 — Markus R 14:00 dobbel-booket")

## Filter-bar — UNIKT

Liten filter-rad over kalender:
- Chip: Type (Coaching / Booking / Gruppe / Turnering / Privat)
- Chip: Coach (Anders / Sara / Tom) — kun for hovedcoach
- Naviger-knapper: `← Forrige / I dag / Neste →` + datepicker

## Klikkbare elementer

| Element | States |
|---|---|
| Day/Uke/Måned/Agenda-toggle | default, hover, active per visning |
| Event-blokk | default, hover (lift + ring), klikk → popover, drag (omplanlegg) |
| Pyramide-stripe | tooltip på hover (viser fokus-fordeling) |
| Tom slot | default, hover (dotted accent border + "+"), klikk → modal-velger |
| "Naa"-linje | static, alltid synlig på dagens dato |
| Sidebar collapse-knapp | default, hover, expanded/collapsed states |
| Mini-kalender dag-celle | default, hover, today (accent ring), selected |
| Synk Google Calendar | default, hover, loading (spinner), success (toast), error |

## Empty / loading / error

- **Empty (ingen events i visning):** Subtil tekst sentrert "Ingen events denne uka. Klikk en slot for å lage en →"
- **Loading:** Skeleton tids-grid med pulserende blokker
- **Sync-error:** Toast bunn "Kunne ikke synke Google Calendar. Prøv igjen →"
- **Konflikt-state:** Event-blokken får destructive-border + tooltip "Konflikt: Markus R har samtidig booking på Studio 1"

## Ønsket output fra Claude Design

1. Uke-view lyst tema (uke 19, 11.–17. mai 2026, ~38 events)
2. Mørkt tema, samme
3. Måned-view lyst tema (mai 2026)
4. Agenda-view lyst tema
5. EventDetailPopover åpen på en gruppe-økt
6. Mobil ≤640px — 1-dag-view, sidebar blir bottom-sheet, events stables vertikalt

## Ikke-mål

- Ikke designe `NewSessionModal`, `BookSessionModal` (egen batch)
- Ikke designe Google Calendar OAuth-flyten
- Ikke designe sperre-blokk-editor (egen sub-flow)

---

## Pakke 2/5: Kapasitet

# AK Golf Platform — CoachHQ — Kapasitet

## Identitet

- **Produkt:** CoachHQ
- **URL:** `/admin/kapasitet`
- **Arketype:** G — Other (kapasitets-grid: fasilitet × tid)
- **Tier-gating:** Ikke relevant (admin-only)
- **HTML-referanse:** `wireframe/screen-deck/coachhq/kapasitet.html`
- **Audit:** finnes ikke ennå
- **Tilhørende modaler:** `BulkBlockModal`, `CapacityDetailModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Kapasitet er Anders' admin-verktøy for å se **belegg** på alle fasiliteter samtidig — Mulligan Studio 1–4, GFGK Range, Bossum Driving, WANG-hallen. Hver celle viser hvor mange prosent av tilgjengelig tid som er booket. Brukes for: identifisere flaskehalser, planlegge åpningstid-justering, blokkere tider for vedlikehold/private events.

## Layout — UNIKT for denne skjermen

### Heatmap-grid

- **Rader:** Fasiliteter (én rad per: Studio 1, Studio 2, Studio 3, Studio 4, GFGK Range, Bossum Driving, WANG-hallen) — typisk 7 rader
- **Kolonner:** Timer i døgnet (06:00–22:00), 1-times-bredde
- **Celler:** Fargekodet etter belegg-prosent:
  - 0–20% — `#F1EEE5` (muted, "lite belegg")
  - 21–50% — `#D1F843 / 0.3` (lime/30%, "moderat")
  - 51–80% — `#D1F843 / 0.6` (lime/60%, "godt")
  - 81–95% — `#D1F843 / 1.0` (lime full, "fullt")
  - 96–100% — `#005840` (primary, "overbooket-risiko")
  - Sperret — diagonal stripes på muted-bakgrunn
- Hver celle viser tall i midten: `73%` (Geist Mono, 11px)

### Tids-toggle

Segmentert kontroll øverst: `I dag / Denne uka / Denne mnd / Snitt 90d`

### Right-rail aggregert visning

Høyre side, 320px bredt:
- **Topp 3 mest brukte tider** (f.eks. "Onsdag 17:00–20:00 — 94% belegg")
- **Topp 3 minst brukte tider** (f.eks. "Tirsdag 09:00–11:00 — 12%")
- **Foreslåtte tiltak** (AI-generert): "Senk pris med 15% på onsdag 09–11 for å øke belegg"
- **Inntekts-summary:** "Inntekt MTD: 142 800 kr. Snitt-belegg: 67%"

## KPI-strip (4 kort)

1. Snitt-belegg alle fasiliteter: 67%
2. Overbookede slots (>95%): 4
3. Underbookede (<20%): 11
4. Inntekt MTD: 142 800 kr (+12% vs forrige mnd)

## Filter-bar — UNIKT

- Chip: Fasilitet (multi: Studio 1-4 / Range / Bossum / WANG)
- Chip: Dag-type (Hverdag / Helg / Alle)
- Sort/visning: Belegg-prosent / Inntekt / Variasjon
- Primary CTA: `Bulk-blokker tider →` → `BulkBlockModal`

## Klikkbare elementer

| Element | States |
|---|---|
| Celle | default, hover (ring + tooltip "Studio 1, ons 17:00 — 8/10 booket, 1 600 kr"), klikk → `CapacityDetailModal` |
| Rad-header (fasilitet-navn) | default, hover, klikk → filter til kun den fasiliteten |
| Tids-toggle | default, hover, active per periode |
| Foreslått tiltak | default, klikk → "Apply" (åpner pris-editor) eller "Avvis" |

## Empty / loading / error

- **Empty (ingen booking-data ennå):** Heatmap viser kun grå celler + tekst "Belegg-data vises etter første booking. Inviter spillere →"
- **Loading:** Skeleton-grid med pulserende celler
- **Error:** "Kunne ikke laste belegg-data. Prøv igjen →"

## Ønsket output fra Claude Design

1. Lyst tema, "Denne uka", full heatmap med varierte farger
2. Mørkt tema, samme
3. Hover-state på en celle (tooltip + ring)
4. "I dag"-view (kun ett døgn, mer detaljert)
5. Empty
6. Mobil ≤640px — fasiliteter blir tabs, heatmap kollapses til en rad-per-fasilitet med horisontal scroll

## Ikke-mål

- Ikke designe `BulkBlockModal`, `CapacityDetailModal` (egen batch)
- Ikke designe pris-editor (egen sub-flow)
- Ikke designe AI-tiltaks-konfig

---

## Pakke 3/5: Lag-sammenligning (snitt)

# AK Golf Platform — CoachHQ — Lag-sammenligning

## Identitet

- **Produkt:** CoachHQ
- **URL:** `/admin/lag-snitt`
- **Arketype:** C — Detail + tabs (5 tabs, sammenligningsmatrise)
- **Tier-gating:** Ikke relevant
- **HTML-referanse:** `wireframe/screen-deck/coachhq/lag-snitt.html`
- **Audit:** `wireframe/audit/coachhq-lag-snitt.md`
- **Tilhørende modaler:** `GroupCompareDrawer`, `MembersPopover`, `AddCompareGroupPopover`, `ExportMenu`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Sammenligning på tvers av grupper — hvordan ligger WANG Toppidrett vs GFGK Junior vs Elite-laget på pyramide-fokus, SG, tester, plan-adherence og demografi. Coach bruker dette i kvartalsreviews og når de skal forklare foreldre eller styret hvordan en gruppe utvikler seg.

## Header-blokk — UNIKT

- **H1:** `Lag-sammenligning` (Geist 32px)
- **Subtittel:** *"Q2 2026. Hvem leverer, hvem henger etter."*
- **Stat-pills (3):** `6 grupper` · `Periode: jan – mai 2026` · `Sist oppdatert: i dag`
- **Primary CTA:** `Eksporter rapport` (popover: PDF / CSV / Excel)
- **Sekundær:** Date-range-picker for periode-velger

## Tab-strip (5 tabs)

| Tab | Innhold |
|---|---|
| **Pyramide** (default) | 5×6 matrise: 5 fokus-områder × 6 grupper |
| **SG** | 5×6 matrise med SG per kategori |
| **Tester** | Test-snitt per gruppe |
| **Plan-adherence** | % gjennomførte økter per gruppe |
| **Demografi** | Alder, kjønn, HCP-snitt, kategorifordeling |

## Layout — Pyramide-tab (default)

### Matrise (kolonner: gruppe, rader: fokus)

| Fokus | Elite | A-lag | WANG | GFGK Jr | Akademi | Snitt |
|---|---|---|---|---|---|---|
| **FYS** | 18 % | 22 % | 24 % | 30 % | 16 % | 22 % |
| **TEK** | 32 % | 28 % | 26 % | 32 % | 38 % | 31 % |
| **SLAG** | 24 % | 22 % | 20 % | 18 % | 24 % | 22 % |
| **SPILL** | 14 % | 16 % | 18 % | 12 % | 12 % | 14 % |
| **TURN** | 12 % | 12 % | 12 % | 8 % | 10 % | 11 % |

Hver celle har:
- Verdien (JetBrains Mono)
- Fargestripe under (intensitet basert på distanse fra snitt)
- Hover → tooltip `Eksakt verdi: 24,3 % · Δ +1,2 % vs snitt`

Rad er klikkbar → GroupCompareDrawer.

### Avatar-stack per gruppe-header

Topp-3 medlemmer (avatar 24px, overlap), klikk → MembersPopover med full liste.

## GroupCompareDrawer (åpen på "WANG Toppidrett")

- Header med gruppe-navn + 12-medlems-stack
- Donut: pyramide for gruppen (klikk-segment → PyramidTierDetailDrawer)
- Top-3-spillerrad (tabell): Markus, Mia, Anders — klikk → 360-profil
- Sammenlign-chips: 4 grupper aktive + `+ Legg til` (popover med søk)
- Primary: `Åpne gruppe-detalj →` (link til `/admin/groups/:id`)
- Sekundær: `Eksporter sammenligning`

## Klikkbare elementer

| Element | States |
|---|---|
| Tab-strip | default, hover, active |
| Matrise-rad (gruppe) | default, hover, selected (3px accent-border), klikk → drawer |
| Matrise-celle | default, hover (tooltip) |
| Sort-toggle på kolonne-header | default, hover, sort-asc, sort-desc |
| Avatar-stack | default, hover, klikk → MembersPopover |
| Sammenlign-chip | default, removable (×), `+ Legg til` |
| `Eksporter rapport` | default, hover, popover-open |

## Empty / loading / error

- **Empty (<2 grupper):** "Trenger minst 2 grupper for sammenligning. Lag en →"
- **Tooltip-hover på celle:** Eksakt verdi + delta vs snitt
- **Loading:** Skeleton matrise med pulserende celler

## Eksempel-data

- **Grupper (6):** Elite, A-lag, WANG Toppidrett, GFGK Junior, Akademi, Snitt-rad
- **Periode:** januar – mai 2026
- **WANG-fokus:** TEK 26 % · FYS 24 % · SLAG 20 % (FYS-tunge sammenlignet med snitt)

## Ønsket output fra Claude Design

1. Lyst tema, Pyramide-tab matrise default
2. Mørkt tema, samme
3. Drawer åpen på WANG Toppidrett
4. Tooltip-hover på en celle
5. Tab-bytte til SG
6. Empty: <2 grupper
7. Mobil ≤640px — matrise konverterer til stablet liste per gruppe

## Ikke-mål

- Ikke designe `GroupCompareDrawer` som standalone (vises i denne pakken)
- Ikke designe gruppe-detalj-skjerm (egen pakke)

---

## Pakke 4/5: Meldinger

# AK Golf Platform — CoachHQ — Meldinger

## Identitet

- **Produkt:** CoachHQ
- **URL:** `/admin/meldinger`
- **Arketype:** G — Other (chat-interface, 2-kolonne)
- **Tier-gating:** Pro+ for foreldre-gruppe-tråder
- **HTML-referanse:** `wireframe/screen-deck/coachhq/meldinger.html`
- **Audit:** finnes ikke ennå
- **Tilhørende modaler:** `NewMessageModal`, `MessageTemplateModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Meldinger er Anders' direkte-kommunikasjon med spillere og foreldre — i-app-meldinger som speiles til e-post (mottaker velger preferanse). Forskjellig fra Notes (coaching-feedback i plan-detalj) og e-post-templates (settings). Dette er sanntid-tråder.

## Layout — UNIKT for denne skjermen

Klassisk 2-kolonne chat-layout:

### Venstre: Tråd-liste (320px)

- Søk: "Søk mottaker eller melding"
- Filter-chips: `Uleste (3)` `Spillere` `Foreldre` `Grupper`
- Liste over tråder, hver:
  - Avatar (32px) + navn
  - Siste melding (1 linje, muted)
  - Tidsstempel (Mono, høyre): `14:32` (i dag) eller `gårdag` eller `12. mai`
  - Ulest-prikk (accent) hvis ulest
  - Mute-ikon (gjennomstreket bjelle) hvis muted
- CTA bunn: `+ Ny melding` → `NewMessageModal`

### Høyre: Aktiv tråd

#### Header
- Avatar + navn + status-prikk (online/offline) + "Online for 5 min siden"
- Aksjons-rad høyre: `Mute`, `Søk i tråd`, `Vis profil →`

#### Meldings-vindu
- Vertikal scroll, nyeste nederst
- Meldinger gruppert per dag med dato-sticky
- Coach-meldinger høyre (primary-bakgrunn, hvit tekst)
- Spiller-meldinger venstre (muted-bakgrunn, foreground-tekst)
- Avatar kun på første melding i en sekvens
- Hver melding: tekst + tidsstempel + read-receipt (`Sett 14:32`)
- Vedlegg: bildet rendret inline, dokument som card med ikon + filnavn + last ned

#### Komponer-bar (sticky bunn)
- Tekstfelt (auto-grow opp til 5 linjer)
- Vedlegg-knapp (paperclip)
- Mal-knapp (åpner `MessageTemplateModal`)
- Send-knapp (primary, lime accent)
- Hurtigvalg-pills over tekstfeltet: `Bra jobba!`, `Husk pyramide-fokus`, `Sjekk plan-detalj →`

## KPI-strip — IKKE for denne (rolig chat-side)

## Klikkbare elementer

| Element | States |
|---|---|
| Tråd-listerad | default, hover (bg-shift), active (accent-bg + border-left), ulest (bold + prikk) |
| Søk-tråd | default, focus, with-text |
| Filter-chip | default, hover, selected (count-badge) |
| Mute-aksjon | default, hover, klikk → toast "Tråd mutet" |
| Komponer-tekstfelt | default, focus, with-text, auto-grow |
| Send-knapp | disabled (tom), default, hover, loading (spinner), success (fade-out + ny melding) |
| Hurtigvalg-pill | default, hover, klikk → fyll inn tekst |
| Mal-knapp | default, hover, klikk → `MessageTemplateModal` |

## Empty / loading / error

- **Empty (ingen tråder):** "Ingen meldinger ennå. Send din første →"
- **Empty (ingen tråd valgt):** Sentrert ikon `MessageSquare` + "Velg en tråd til venstre"
- **Loading meldinger:** Skeleton-bobler
- **Send-error:** Inline rød tekst + retry-link, melding markert med rødt utropstegn

## Ønsket output fra Claude Design

1. Lyst tema, tråd-liste med 8 tråder + aktiv tråd med 12 meldinger
2. Mørkt tema, samme
3. Komponer-bar med tekst og vedlegg
4. Empty (ingen tråd valgt)
5. Hurtigvalg-pills synlige
6. Mobil ≤640px — kun tråd-liste eller kun aktiv tråd (back-arrow), full bredde

## Ikke-mål

- Ikke designe `NewMessageModal`, `MessageTemplateModal` (egen batch)
- Ikke designe gruppe-chat-administrasjon (egen sub-flow)
- Ikke designe e-post-fallback-flyten

---

## Pakke 5/5: Oppfølgings-kø

# AK Golf Platform — CoachHQ — Oppfølgings-kø

## Identitet

- **Produkt:** CoachHQ
- **URL:** `/admin/oppfolgingsko`
- **Arketype:** G — Other (board / kanban-style triage)
- **Tier-gating:** Ikke relevant
- **HTML-referanse:** `wireframe/screen-deck/coachhq/oppfolgingsko.html`
- **Audit:** finnes ikke ennå
- **Tilhørende modaler:** `MarkDoneModal`, `SnoozeModal`, `EscalateModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Oppfølgings-kø er Anders' "ting jeg må følge opp"-køen. Forskjellig fra Godkjenninger (agent-anbefalinger) — dette er ad-hoc-oppgaver: spillere som ikke har trent på 14 dager, foreldre som har spurt om noe, fakturaer som mangler oppfølging, leads som har spurt om coaching. Hver oppgave kan markeres ferdig, snoozes, eller eskaleres.

## Layout — UNIKT for denne skjermen

Board-style med 4 kolonner:

### Kolonner

1. **Nytt** (innkommende) — count-badge accent
2. **I gang** (jeg jobber med dette nå)
3. **Venter på svar** (ekstern blokkering)
4. **Snoozed** (collapsed by default)

### Oppgave-card

Hver oppgave:
- **Type-ikon** øverst-venstre (Lucide):
  - Inaktiv-spiller — `UserMinus`
  - Foreldre-spørsmål — `MessageCircle`
  - Faktura-oppfølging — `Receipt`
  - Lead — `Sparkles`
- **Tittel** (Geist 14px medium): `"Markus Roinaas P har ikke trent på 14 dager"`
- **Subtitle** (muted 12px): `"Sist økt: 27. april · Plan utløper 15. mai"`
- **Spiller/lead-avatar** (24px) nederst-venstre
- **Severity-pill** høyre-bunn: `Lav` (muted) / `Middels` (gold) / `Høy` (destructive) / `Kritisk` (destructive + pulse)
- **Aksjons-rad** (kun ved hover): `Markert ferdig`, `Snooze`, `Eskaler`

### Drag-drop

Cards kan dras mellom kolonner. Drop-zone: accent-border + bg ved hover.

### Right-rail: oppsummering

- "Snitt-tid å løse: 2 dager"
- "Mest forsinket: 'Lead Kari Olsen' — 8 dager"
- "Oppgaver siste 30d: 47 (43 løst, 3 eskalert, 1 droppet)"

## KPI-strip (4 kort, øverst)

1. Nytt: 7
2. I gang: 4
3. Venter: 3
4. Snoozed: 12 (kommer tilbake når snooze-tid er ute)

## Filter-bar — UNIKT

- Søk: "Søk oppgave eller spiller"
- Chip: Type (Inaktiv / Foreldre / Faktura / Lead / Annet)
- Chip: Severity (Lav / Middels / Høy / Kritisk)
- Chip: Tilordnet (Anders / Sara / Tom / Ingen)
- Sort: Severity / Eldste / Nyeste
- Primary CTA: `+ Ny oppgave` → quick-modal

## Klikkbare elementer

| Element | States |
|---|---|
| Oppgave-card | default, hover (lift + aksjons-rad synlig), drag-active (rotert 2deg), drop-target |
| Markert ferdig | default, hover, klikk → `MarkDoneModal` (med valgfri kommentar) |
| Snooze | default, hover, klikk → `SnoozeModal` (1d/3d/1uke/egendefinert) |
| Eskaler | default, hover, klikk → `EscalateModal` (velg mottaker + årsak) |
| Kolonne-header | default, count-badge, klikk → filter til kun den kolonnen |
| Spiller-avatar | default, hover, klikk → `/admin/elever/:id` |

## Empty / loading / error

- **Empty per kolonne:** "Ingen oppgaver i {kolonne}" + dempet ikon
- **Empty totalt:** "Tom kø — bra jobba!" med Lucide `CheckCircle2` accent
- **Loading:** 3 skeleton cards per kolonne
- **Drag-error:** Toast "Kunne ikke flytte oppgaven. Prøv igjen."

## Ønsket output fra Claude Design

1. Lyst tema, alle 4 kolonner med oppgaver
2. Mørkt tema, samme
3. Hover på en card med aksjons-rad synlig
4. Drag-state — kort midt i flytting fra "Nytt" → "I gang"
5. Empty totalt
6. Mobil ≤640px — 1 kolonne av gangen, swipe mellom (chip-bar øverst)

## Ikke-mål

- Ikke designe `MarkDoneModal`, `SnoozeModal`, `EscalateModal` (egen batch)
- Ikke designe oppgave-historikk-view
- Ikke designe automatiske oppgave-genererings-regler
