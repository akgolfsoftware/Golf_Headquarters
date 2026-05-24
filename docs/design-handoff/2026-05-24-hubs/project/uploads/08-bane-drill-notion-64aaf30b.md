# Prompt — Bane, Drill og Notion (5 skjermer)

> **Bruk:** Lim inn `00-design.md` FØRST i Claude Design (eller v3-bundlens design-system). Deretter lim inn alt etter linjen nedenfor.

---

Lag én komplett, standalone HTML-fil for **AK Golf — Bane-, Drill- og Notion-skjermer (5 skjermer i én fil)**. Desktop-skjerm 1600×variabel høyde. Single self-contained `.html` med inline `<style>`, Google Fonts via `<link>`, alle ikoner inline SVG (Lucide-stil stroke 1.75).

**Følg AK Golf design system STRENGT** (cream `#FAFAF7`, forest `#005840`, lime `#D1F843`, Inter Tight + Inter + JetBrains Mono + Instrument Serif italic, Lucide-ikoner, INGEN emojier, norsk bokmål).

## Hva skjermen er

Dette er en samle-prompt for fem skjermer som dekker bane-kunnskap, drill-bibliotek og Notion-integrasjon i AK Golf-plattformen. Hver skjerm vises som egen `<section>` i samme HTML-fil, separert med en mono-uppercase label-strip mellom seksjonene (`SKJERM 1 / 5 · /portal/mal/baner` osv.). Felles sidebar + topbar gjenbrukes — kun hovedinnholdet bytter.

De fem skjermene:

| # | Rute | Navn | Persona |
|---|---|---|---|
| 1 | `/portal/mal/baner` | Bane-bibliotek | Markus (spiller) |
| 2 | `/portal/mal/baner/[id]` | Bane-detalj (Mandalkrysset GK) | Markus (spiller) |
| 3 | `/portal/drills` | Drill-bibliotek | Markus (spiller) |
| 4 | `/admin/notion/prosjekter` | Notion-prosjekt-board | Anders (coach) |
| 5 | `/admin/notion/oppgaver` | Notion-oppgave-board | Anders (coach) |

**Personas:**
- Markus Røinås Pedersen — HCP +3,5, kategori A1, hjemmebane GFGK
- Anders Kristiansen — Head coach AK Golf Academy, akgolfgroup@gmail.com

## Layout (felles)

Følger TPK05-mønster: Linear sidebar + topbar + hero per skjerm + innhold + sticky footer.

### Chrome
- **Sidebar 220px** (forest bg): "AK GOLF / PLAYERHQ · PRO" (skjerm 1-3) eller "AK GOLF / COACHHQ · PRO" (skjerm 4-5)
  - Avatar + navn (Markus / Anders) øverst
  - Nav-grupper med aktiv-state per skjerm: HJEM / TRENING / TURNERINGER / **BANER** / **DRILLS** / INNSIKT (spiller) eller DAGLIG / OPERASJON / **NOTION** / INNSIKT (coach)
- **Topbar 56px**: ⌘K + breadcrumb dynamisk per skjerm + role-toggle (kun spiller-skjermene)

### Skjerm-separator (mellom hver section)
Forest-stripe 32px med mono uppercase: `SKJERM 1 / 5 · /portal/mal/baner · BANE-BIBLIOTEK`

---

## SKJERM 1 — `/portal/mal/baner` — Bane-bibliotek

### Hero (80px)
- Eyebrow JetBrains Mono uppercase: `BANE-BIBLIOTEK · 24 BANER · 8 SPILT 2026 · HJEMMEBANE GFGK`
- Title Inter Tight 32px: `Mine ` + Instrument Serif italic `*baner*` + ` — kunnskap, kart og strategi`
- 4 actions rounded-pill høyre:
  1. `+ Legg til bane` (lime, primary)
  2. `Importer fra GolfBox` (forest)
  3. `Filtre` (outline)
  4. `Sortering` (outline)

### Filter-bar (50px)
4 grupper:
1. **Status**: Alle · Spilt 2026 · Kommende turnering · Hjemmebane (segmented)
2. **Region**: Alle · Østland · Sørland · Vestland · Trøndelag · Utland (pills)
3. **Type**: Alle · Parkland · Links · Heath · Resort (pills)
4. **SG-snitt**: Sortering Best → Verst (dropdown)

### Bane-grid (1/2/3 col responsiv, 3-col default på 1600)
Hvert banekort (16px radius, hvit bg, border `#E5E3DD`):

**Topp 160px**: Hovedbilde (cream/forest gradient placeholder med stilisert SVG-banekontur øverst i ramme)

**Body 140px**:
- Banenavn Inter Tight 18px: "Mandalkrysset GK"
- Sub mono 11px: "Mandal · Parkland · par 71 · 6 423m"
- Discipline-pill rad: TEK · SPILL · TURN (de jeg trener mest mot her)
- SG-rad mono: `SG-Total +0,8 · 3 runder · sist 16. juni 2025`
- Hjemmebane-badge (lime, kun GFGK)
- Turnerings-badge (forest "Sørlandsåpent 16. juni", kun hvis kommende)

**Footer 40px**:
- Venstre: `Sist spilt: 16. juni 2025` mono
- Høyre: `Åpne` (outline) + `Strategi` (forest)

### Eksempel-data (12 baner synlig)
1. **Gamle Fredrikstad GK** — Hjemmebane · 47 runder · SG-Total +1,4 · par 72 · 6 280m
2. **Mandalkrysset GK** — Kommende: Sørlandsåpent 16. juni · 3 runder · +0,8
3. **Bærum GK** — Kommende: NM Slag 22. juli · 2 runder · −0,2
4. **Borre GK** — Srixon Tour stop · 4 runder · +0,5
5. **Bossum GK** — 2 runder · +0,3
6. **Onsoy GK** — 6 runder · +1,1
7. **Asker GK** — 1 runde · −0,4
8. **Oslo GK** — 2 runder · +0,1
9. **Miklagard GK** — 1 runde · −0,8
10. **St. Andrews Old Course** — 0 runder · drømmer
11. **Holtsmark GK** — 1 runde · E
12. **Tyrifjord GK** — 2 runder · +0,2

### Footer på skjerm 1 (sticky)
- Venstre: `24 baner totalt · 8 spilt i år · SG-snitt på hjemmebane: +1,4`
- Høyre: `+ Legg til bane` (lime)

---

## SKJERM 2 — `/portal/mal/baner/[id]` — Bane-detalj (Mandalkrysset GK)

### Hero (80px)
- Eyebrow JetBrains Mono uppercase: `MANDALKRYSSET GK · MANDAL · PARKLAND · PAR 71`
- Title Inter Tight 32px: `Mandalkrysset ` + Instrument Serif italic `*course strategy*` + ` for Sørlandsåpent`
- 4 actions: `Tilbake til bibliotek` (outline) · `+ Notat` (lime) · `Print baneguide` (outline) · `Del med coach` (outline)

### Top-rad: Hovedinfo (120px)
3-col grid:
1. **Bane-meta** (cream card): par 71 · 6 423m · 18 hull · stimp 11+ · greens A1 bent · etablert 1978
2. **Min historikk** (forest card): 3 runder · SG-Total +0,8 · best 68 (−3) · snitt 71,3
3. **Kommende** (lime card): Sørlandsåpent · 16. juni 2026 · 21 dager · 78% forberedt

### Hovedseksjon: Top-down SVG-bane-kart (700px høyde)
Stor SVG-illustrasjon av hele banen, top-down view:
- 18 hull synlig samtidig, stilisert som forest-fairways med lime-greens og cream-bunkere
- Hver hull-marker er en klikkbar sirkel (28px) med hull-nummer
- Tee-bokser markert med små lime-firkanter
- Greens med fyll lime, border forest
- Sand-bunkere som cream-prikker
- Vann (hull 7, 14) som subtil blå #2A6FDB med opacity
- Vind-rose nederst venstre (kompass + piler for vanlig vindretning sør-sørøst)
- Nord-pil oppe høyre

**Hover hull-marker**: tooltip med par, lengde og min snitt-score
**Klikk hull-marker**: scroll til hull-detalj nedenfor + highlight på kartet

### Hull-detalj-panel (under kart, sticky til høyre når hull valgt)
Når et hull klikkes (default hull 4):
- **Hull 4 — par 4 · 412m** Inter Tight 24px
- **Mini-kart av hullet** (250px SVG, top-down detaljkart)
- **Min historikk**: 3 forsøk: par · birdie · bogey (mono small)
- **SG-historikk per hull**: SG-OTT −0,2 · SG-APP +0,4 · SG-ARG E · SG-PUTT +0,1
- **Anbefalt strategi** (fra Anders): "Driver mot venstre side av fairway — unngå bunker høyre 240m. Approach med 8-jern til midten av greenen. Pinplassering bakre høyre = unngå."
- **Vind-tilpasning**: "Med sør-sørøst 4-6 m/s: vurder hybrid fra tee"
- **Nøkkelhull-markør**: lime hvis hull 4, 11, 17 (Anders' notat: "Disse er nøkkelhullene")

### Sammenligning forrige runder (collapsible card, full bredde)
Tabell 18 rader (én per hull) × kolonner: hull · par · R1 (16.06.2025) · R2 (15.06.2024) · R3 (10.06.2023) · snitt · SG
- Mono small for alle tall
- Negativ score grønn, positiv rød, par muted
- Sortert hull 1 → 18
- Bunn-rad: Totalsum mono large

### Vind-rose-detalj (200×200px card)
- Sirkulær kompass-rose med N/Ø/S/V markering
- Piler/segmenter som viser vindretnings-fordeling siste 5 år samme uke
- Mono-label: `Sør-sørøst 62% · 4-6 m/s typisk · 3 dager-prognose snart`
- CTA: `Hent dagsprognose` (outline)

### Coach-notater (lime accent card)
- Lucide Sparkles-ikon
- "Anders sier:" + sitat
- "Mandalkrysset er en ærlig parkland-bane. Greenene er små men jevne. Putting <3m er kritisk — du står typisk for 28-32 putter per runde her. Fokuser på iron-presisjon: hullene 4, 11 og 17 avgjør runden."
- CTA: `Be om bane-spesifikk plan` (forest)

### Footer skjerm 2 (sticky)
- Venstre: mini-strip: `Sørlandsåpent · 21 dager · 78% forberedt`
- Senter: `Hull 4 valgt · par 4 · 412m`
- Høyre: `Åpne baneguide PDF` (outline) + `Strategi-modus` (lime)

---

## SKJERM 3 — `/portal/drills` — Drill-bibliotek

### Hero (80px)
- Eyebrow JetBrains Mono uppercase: `DRILL-BIBLIOTEK · 142 DRILLS · 38 BRUKT · 8 ANBEFALT NÅ`
- Title Inter Tight 32px: `Mine ` + Instrument Serif italic `*drills*` + ` — øvelser, video, progresjon`
- 4 actions: `+ Legg til drill` (lime) · `Importer fra coach` (forest) · `Filtre` (outline) · `Min progresjon` (outline)

### Filter-bar (60px)
5 grupper:
1. **Disiplin**: Alle · FYS · TEK · SLAG · SPILL · TURN (pills med farge per disiplin)
2. **Varighet**: Alle · <5 min · 5-15 min · 15-30 min · 30+ min (pills)
3. **Vanskelighet**: Alle · Lett · Middels · Hard · Pro (pills)
4. **Status**: Alle · Anbefalt nå (lime) · Brukt sist · Aldri prøvd (segmented)
5. **Søk**: tekst-input med Lucide Search-ikon

### Anbefalt-strip (80px, lime accent over hovedgrid)
Horisontal scroll med 4-6 anbefalte drill-cards (mini-versjon, 240px bred):
- Lucide Sparkles + "Anbefalt for Sørlandsåpent" mono uppercase
- Hver kort: video-thumb (60×60), tittel, varighet, "Anders foreslår"

### Drill-grid (3-col default, 4-col på 1600+)
Hvert drill-kort (16px radius, hvit bg, border):

**Topp 160px**: Video-thumbnail (forest gradient + Lucide Play-ikon sentralt, 56px)
- Varighet-pill (mono "8 min") nederst venstre i thumb
- Disiplin-pill nederst høyre i thumb (TEK / SLAG / osv.)

**Body 120px**:
- Tittel Inter Tight 16px: "Iron-progresjon 5-PW"
- Sub mono 11px: "TEK · 8 min · Middels · 12 ganger brukt"
- 3-stjerners vanskelighet-indikator (Lucide Star, fyllt lime/outline)
- Liten beskrivelse 2 linjer: "Progresjon gjennom hele iron-bag for konsistens og distance gapping."

**Footer 40px**:
- Venstre: `Sist brukt: 18. mai` mono
- Høyre: `Start` (lime) + `Detaljer` (outline)

### AI-anbefaling-badge på relevante kort
Lime stripe i hjørnet: "ANBEFALT" + Sparkles-ikon
Tooltip on hover: "Anders anbefaler denne basert på din forberedelse til Sørlandsåpent"

### Eksempel-data (12 drills synlig)
1. **Iron-progresjon 5-PW** (TEK · 8 min · Middels · 12 brukt · ANBEFALT)
2. **Putting <2,5m konsistens** (SLAG · 12 min · Middels · 8 brukt · ANBEFALT)
3. **Chip-stige** (SLAG · 15 min · Lett · 6 brukt)
4. **Tempo-trening med metronom** (TEK · 5 min · Lett · 18 brukt)
5. **Bunkerflukt fra dårlig lie** (SLAG · 10 min · Hard · 3 brukt)
6. **Course management Mandalkrysset** (SPILL · 25 min · Pro · 1 brukt · ANBEFALT)
7. **Pre-shot rutine** (TUR · 5 min · Lett · 24 brukt)
8. **Distance gapping 7i-PW** (TEK · 15 min · Middels · 9 brukt)
9. **Mental warm-up 9 hull** (TURN · 20 min · Middels · 4 brukt)
10. **Stabilitet på ujevnt underlag** (FYS · 12 min · Middels · 7 brukt)
11. **Lag-putt 10-20m** (SLAG · 10 min · Middels · 5 brukt)
12. **Pressure-putt simulering** (TURN · 15 min · Hard · 2 brukt)

### Drill-detalj modal (åpnes ved klikk "Detaljer")
- Video-spiller stor (16:9, embedded)
- Tittel + alle metadata
- Beskrivelse fri-tekst
- Sett · reps · varighet
- Utstyr-liste
- Min historikk: graf med ganger brukt over tid + min vurdering (1-5 stjerner)
- CTA: `Start nå` (lime) · `Legg i ukens plan` (forest) · `Be om feedback fra Anders` (outline)

### Footer skjerm 3 (sticky)
- Venstre: `142 drills · 38 brukt · 8 anbefalt nå`
- Senter: `Sist trent: i går 14:00 · Iron-progresjon`
- Høyre: `+ Legg til drill` (lime)

---

## SKJERM 4 — `/admin/notion/prosjekter` — Notion-prosjekt-board (CoachHQ)

### Hero (80px)
- Eyebrow JetBrains Mono uppercase: `NOTION · PROSJEKTER · 14 AKTIVE · 6 I REVIEW · SISTE SYNC 12:34`
- Title Inter Tight 32px: `AK Golf ` + Instrument Serif italic `*prosjekter*` + ` — Notion-synkronisert`
- 4 actions: `+ Nytt prosjekt` (lime) · `Sync nå` (forest med Lucide RefreshCw) · `Åpne i Notion` (outline + ExternalLink) · `Filtre` (outline)

### Status-strip (40px under hero)
4 mini-KPI mono:
- `14 AKTIVE PROSJEKTER`
- `6 I REVIEW`
- `38 OPPGAVER ÅPNE`
- `SISTE SYNC 12:34 · ALT OK`

### Filter-bar (50px)
4 grupper:
1. **Område**: Alle · Coaching · Anlegg · Marketing · Produkt · Drift (pills med farge)
2. **Eier**: Alle · Anders · Erik · Maja · DL GFGK (avatar-pills)
3. **Tags**: Alle · sportsplan · merkevare · tech · turnering (pills)
4. **Tidshorisont**: Denne uka · Måneden · Kvartalet · Året (segmented)

### Kanban-board (full bredde, 4 kolonner)
Horisontal scroll om nødvendig. Hver kolonne 380px bred, separert med 24px gap.

**Kolonne 1 — BACKLOG (cream bg, 12 kort)**
- Tittel-strip øverst: `BACKLOG · 12` mono uppercase, forest tekst
- Kort eksempler:
  - "Coachfilosofi-dokument v2" · Coaching · Anders · høst 2026
  - "GFGK kameraoppsett til Performance Studio" · Anlegg · DL · Q3
  - "Brand guide for AK Golf Junior Academy" · Marketing · Anders · Q3
  - "Foreldre-onboarding e-postserie" · Marketing · Anders · vår
  - "Drill-bibliotek 100 nye drills" · Coaching · Maja · sommer
  - "Booking-integrasjon Stripe" · Produkt · Anders · Q4
  - "AK Golf-podcast pilot" · Marketing · Anders · 2027

**Kolonne 2 — I GANG (lime svak bg, 5 kort)**
- Tittel: `I GANG · 5`
- Kort eksempler:
  - "Sportsplan GFGK Junior 2026-2028" · Coaching · Anders · 73% · due 30. mai
  - "AK Golf Academy ny nettside" · Produkt · Anders · 52% · due 15. juni
  - "Sponsor-pakke Junior Academy" · Marketing · Anders · 84% · due 28. mai
  - "Mac O'Grady kunnskaps-database" · Coaching · Anders · 35% · due 30. juni
  - "Stripe-integrasjon Mulligan" · Produkt · Anders · 61% · due 10. juni

**Kolonne 3 — REVIEW (forest svak bg, 6 kort)**
- Tittel: `REVIEW · 6`
- Kort eksempler:
  - "Markus' årsplan 2026" · Coaching · Anders · venter på Markus + Tone
  - "GFGK prislister 2026" · Drift · DL · venter på styret
  - "Junior-rekruttering Q2-kampanje" · Marketing · Anders · venter på sponsor-svar
  - "TrackMan-data eksport-flyt" · Produkt · Anders · venter på Trackman support
  - "PlayerHQ v2 designsystem" · Produkt · Anders · venter på review
  - "Coach-utviklingsplan Erik+Maja" · Coaching · Anders · venter på Erik

**Kolonne 4 — FERDIG (muted bg, 8 kort, kun siste 30 dager)**
- Tittel: `FERDIG · 8`
- Kort eksempler:
  - "Vår-kampanje akgolf.no" · Marketing · Anders · 12. mai
  - "Performance Studio offisiell åpning" · Anlegg · DL · 5. mai
  - "Drift-rutiner GFGK skrevet" · Drift · DL · 28. april
  - "Coachfilosofi-dokument v1" · Coaching · Anders · 20. april
  - "Junior-camp påske" · Coaching · Maja · 18. april
  - "Nye GFGK-medlemmer onboarding-flyt" · Drift · DL · 15. april
  - "Booking-system pilot" · Produkt · Anders · 10. april
  - "Sponsor Sparebanken1" · Marketing · Anders · 8. april

### Prosjekt-kort-struktur
Hvert kort (12px radius, hvit bg, border):
- **Topp**: Område-pill liten (farget) + drag-handle (Lucide GripVertical)
- **Tittel** Inter Tight 14px (2-3 linjer maks)
- **Tags-rad** mono 10px: "#sportsplan #junior"
- **Eier-avatar** + initialer + due-dato mono "30. mai"
- **Progress-bar** (kun "I gang"-kort): gradient lime→forest med prosent
- **Status-badge** (kun "Review"): "venter på Markus" mono small
- Hover: skygge + lime venstre-border (3px)
- Klikk: åpner side-drawer (400px fra høyre) med full Notion-side embedded

### Side-drawer (400px, åpnes ved klikk på kort)
- Header: tittel + område-pill + due-dato
- "Åpne i Notion" knapp (outline + ExternalLink)
- Embedded preview: properties-tabell + første 3 paragraphs av Notion-body
- Tilknyttede oppgaver-liste (3-5 stk med checkbox)
- Aktivitet-feed mono small: "Anders endret status til 'I gang' i går 16:23"
- CTA: `Endre status` (forest) · `Tilordne ny eier` (outline)

### Footer skjerm 4 (sticky)
- Venstre: `Siste sync 12:34 · ingen konflikter`
- Senter: `14 aktive prosjekter · 5 i gang · 6 i review`
- Høyre: `Sync nå` (outline) + `+ Nytt prosjekt` (lime)

---

## SKJERM 5 — `/admin/notion/oppgaver` — Notion-oppgave-board (CoachHQ)

### Hero (80px)
- Eyebrow JetBrains Mono uppercase: `NOTION · OPPGAVER · 38 ÅPNE · 12 DENNE UKA · 4 OVER DUE`
- Title Inter Tight 32px: `Mine ` + Instrument Serif italic `*oppgaver*` + ` — fra Notion`
- 4 actions: `+ Ny oppgave` (lime) · `Sync nå` (forest) · `Eksporter uke-rapport` (outline) · `Filtre` (outline)

### Mode-toggle (40px)
2 tabs (segmented control sentrert):
- **TABELL** (default)
- **KANBAN**

### Filter-bar (50px)
5 grupper:
1. **Status**: Alle · Ikke startet · I gang · Blokkert · Ferdig (pills med farge)
2. **Prioritet**: Alle · Høy (rød) · Middels (forest) · Lav (cream) (pills)
3. **Assignee**: Alle · Anders · Erik · Maja · DL (avatar-pills)
4. **Prosjekt**: Alle · 14 prosjekter (dropdown)
5. **Due**: I dag · Denne uka · Kommende · Over due (segmented)

### TABELL-modus (default)
Tabell full bredde med kolonner:
| ✓ | Oppgave | Prosjekt | Assignee | Prioritet | Due | Status | |
|---|---|---|---|---|---|---|---|

Eksempel-rader (15 synlig):
| ☐ | "Skriv coachfilosofi kapittel 3" | Coachfilosofi v2 | AK | Høy | 22. mai | I gang | ⋯ |
| ☐ | "Be Tone om signering av Markus-plan" | Sportsplan GFGK Junior | AK | Høy | 21. mai | Blokkert | ⋯ |
| ☐ | "Bestille TrackMan-lisens 2026" | Drift | AK | Høy | **18. mai (OVER DUE)** | Ikke startet | ⋯ |
| ☐ | "Filme drill-bibliotek 10 nye drills" | Drill-bibliotek | Maja | Middels | 25. mai | I gang | ⋯ |
| ☐ | "Sponsor-møte Sparebanken1 oppfølging" | Sponsor-pakke | AK | Høy | 23. mai | Ikke startet | ⋯ |
| ☐ | "Booking-flyt UX-test med 3 spillere" | Booking-integrasjon | AK | Middels | 28. mai | Ikke startet | ⋯ |
| ☐ | "Tone-of-voice guide PlayerHQ" | PlayerHQ v2 | AK | Lav | 5. juni | Ikke startet | ⋯ |
| ✓ | "Skrive ferdig vår-kampanje" | Vår-kampanje | AK | Høy | 12. mai | Ferdig | ⋯ |
| ✓ | "Onboarde Erik som putting-coach" | Coach-utvikling | AK | Middels | 10. mai | Ferdig | ⋯ |
| ☐ | "GFGK 9-hullsbane utstyr-sjekk" | Drift GFGK | DL | Middels | 24. mai | I gang | ⋯ |
| ☐ | "Junior-camp sommer påmelding åpne" | Junior-rekruttering | Maja | Høy | 1. juni | Ikke startet | ⋯ |
| ☐ | "AK Golf-podcast intro-jingle" | AK Golf-podcast | AK | Lav | 30. juni | Ikke startet | ⋯ |
| ☐ | "Stripe webhook-flyt teste" | Stripe-integrasjon | AK | Høy | 26. mai | I gang | ⋯ |
| ☐ | "Markus mai-review skrive" | Markus' årsplan | AK | Høy | 25. mai | I gang | ⋯ |
| ☐ | "GFGK-styret kvartalspresentasjon" | Drift | DL | Høy | 30. mai | Ikke startet | ⋯ |

Rader med over due dato har rød venstre-border (4px) og rød due-dato tekst.

### Tabell-kontroller
- Sortering per kolonne (klikk header)
- Bulk-select med checkbox-kolonne
- Bulk-actions-bar dukker opp når 1+ selected: "Endre status" · "Tilordne" · "Slett" · "Eksporter"

### KANBAN-modus (toggle)
4 kolonner: IKKE STARTET (cream) · I GANG (lime) · BLOKKERT (rød svak) · FERDIG (muted)
Hver kort: tittel + prosjekt-pill + assignee-avatar + due-dato + prioritets-prikk

### Side-drawer (åpnes ved klikk på rad/kort)
- Tittel + checkbox status
- Prosjekt-link (klikkbar)
- Beskrivelse fri-tekst
- Sub-tasks (3-5 sjekkbokser)
- Aktivitet-feed
- Kommentar-felt
- CTA: `Åpne i Notion` · `Marker ferdig` (lime) · `Endre due-dato` (outline)

### Footer skjerm 5 (sticky)
- Venstre: `38 oppgaver åpne · 4 over due (krever handling)`
- Senter: `Anders har 22 · Maja 8 · DL 6 · Erik 2`
- Høyre: `Sync` (outline) + `+ Ny oppgave` (lime)

---

## Felles modaler

### Modal: + Ny booking (skjerm 3 drill → ukens plan)
Som referert i Anlegg-prompten — standard booking-modal med spiller, fasilitet, drill-kobling.

### Modal: + Ny oppgave (skjerm 5)
- Tittel (fritekst)
- Prosjekt (dropdown, 14 prosjekter)
- Assignee (avatar-picker)
- Prioritet (radio: Høy/Middels/Lav)
- Due-dato (datovelger)
- Beskrivelse (fritekst)
- Tags (multiselect)
- CTA: `Opprett` (lime) · `Opprett + tilordne neste oppgave` (forest) · `Avbryt` (outline)

### Modal: + Nytt prosjekt (skjerm 4)
- Tittel
- Område (radio: Coaching/Anlegg/Marketing/Produkt/Drift)
- Eier
- Due-dato
- Beskrivelse
- Initielle oppgaver (kan legges til etter opprettelse)
- CTA: `Opprett prosjekt` (lime) · `Opprett + åpne i Notion` (forest)

---

## Sticky footer (felles, 64px) — kun siste skjerm

- **Venstre**: `5 skjermer · bane-bibliotek, bane-detalj, drill, prosjekter, oppgaver`
- **Senter**: Mini-status: `Anders har 22 åpne oppgaver · Markus har 8 anbefalte drills`
- **Høyre**: `Sync alt` (outline) + `Spør AI` (lime + Sparkles)

---

## Tilstander å vise

For demo-formål: alle skjermer rendres som default-state (data fylt inn, ingen modaler åpne). Hver skjerm har minst én "edge case" synlig:
- Skjerm 1: et bane-kort med "Hjemmebane"-badge + et med "Kommende turnering"-badge
- Skjerm 2: hull 4 valgt (nøkkelhull-markør lime)
- Skjerm 3: AI-anbefalt-badge synlig på 3 drill-kort
- Skjerm 4: ett "Review"-kort har "venter på Markus" status
- Skjerm 5: én oppgave med rød "OVER DUE" markering

---

## Branding (følger AK Golf design system)

- BG cream `#FAFAF7`
- Card hvit `#FFFFFF` med border `#E5E3DD`
- Primary forest `#005840`, accent lime `#D1F843`
- Discipline-pills bruker FYS/TEK/SLAG/SPILL/TURN-farger
- Inter Tight (titler), Inter (UI), JetBrains Mono (alle tall, dato, klokkeslett, score, SG-data)
- Instrument Serif italic sparsomt — én italic-frase per hero
- 16px radius cards, 12px buttons, 999px pills
- INGEN emojier, kun Lucide-ikoner stroke 1.75
- Norsk bokmål gjennomgående

## Tekniske krav

- Single self-contained `.html`
- Inline `<style>` block
- Google Fonts via `<link>`
- All icons inline Lucide SVG (stroke 1.75)
- Skjerm 2: top-down SVG-bane-kart med 18 klikkbare hull-markører
- Skjerm 3: video-thumbnail-placeholder med Lucide Play-ikon
- Skjerm 4: kanban-board med drag-handle-indikatorer
- ~2800–3400 linjer HTML totalt (5 skjermer i samme fil)

## Constraints

- INGEN emojier
- ALL UI på norsk bokmål
- Diskipliner uppercase: FYS, TEK, SLAG, SPILL, TURN
- SG-metrikker: SG-Total, SG-OTT, SG-APP, SG-ARG, SG-PUTT (alltid med bindestrek og uppercase prefix)
- Tall norsk format: `+3,5`, `T12`, `−3` (minus-tegn ikke bindestrek)
- Klokkeslett 24h: `09:00`, `14:30`
- Dato: `16. juni 2026`
- Score relativt til par: `−3`, `E`, `+1`
- Skjerm-separator mellom hver section: forest-stripe 32px med mono `SKJERM N / 5 · /rute · NAVN`

Output: én komplett HTML-fil med alle 5 skjermer i samme dokument. Begin `<!DOCTYPE html>`, end `</html>`. Ingen forklaring utenfor kode-blokken.
