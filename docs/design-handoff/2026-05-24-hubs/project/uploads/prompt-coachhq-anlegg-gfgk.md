# Prompt — CoachHQ Anlegg-side (GFGK)

> **Bruk:** Lim inn `00-design.md` FØRST i Claude Design (eller v3-bundlens design-system). Deretter lim inn alt etter linjen nedenfor.

---

Lag én komplett, standalone HTML-fil for **AK Golf CoachHQ — Anlegg-side for Gamle Fredrikstad Golfklubb (GFGK)**. Desktop-skjerm 1600×variabel høyde. Single self-contained `.html` med inline `<style>`, Google Fonts via `<link>`, alle ikoner inline SVG (Lucide-stil stroke 1.75).

**Følg AK Golf design system STRENGT** (cream `#FAFAF7`, forest `#005840`, lime `#D1F843`, Inter Tight + Inter + JetBrains Mono + Instrument Serif italic, Lucide-ikoner, INGEN emojier, norsk bokmål).

## Hva skjermen er

CoachHQ Anlegg-side for **Gamle Fredrikstad Golfklubb (GFGK)** — én side som kombinerer:

1. **Visuell oversikt** over hele anlegget (interaktivt kart)
2. **Kalender per fasilitet** (hvem trener hvor og når)
3. **Booking-flyt** for coach-økter (gruppe + privat)
4. **Aktivitetsoversikt** for daglig leder (DL) i klubben

**Tilgang:**
- Coach Anders Kristiansen (eier av AK Golf Academy)
- Daglig leder i GFGK
- Andre coacher i akademiet (read-only på andres bookinger)
- Spillere ser kun sin egen booking (i PlayerHQ — egen visning)

**Rute:** `/admin/anlegg/gfgk` (eller dynamisk `/admin/anlegg/[clubSlug]` om flere klubber)

## Anleggs-fasiliteter

GFGK har 7 bookbare fasiliteter:

| # | Fasilitet | Type | Kapasitet | Default-bruk |
|---|---|---|---|---|
| 1 | **Performance Studio** | Innendørs, TrackMan + lærings-utstyr | 1-2 spillere | Default for coach Anders' private timer |
| 2 | **Driving Range 1. etg** | Utendørs, dekket | 6 matter | Gruppe-trening, kortere innspill |
| 3 | **Driving Range 2. etg** | Utendørs, åpent | 4 matter | Distanse-trening, full swing |
| 4 | **Putting Green** | Utendørs | 8-10 spillere | Putting-praksis, kort spill |
| 5 | **Nærspillsområde** | Utendørs, kombinert chip/pitch/bunker | 4-6 spillere | Around-green-trening |
| 6 | **9-hullsbanen** | Hovedbane (9 hull) | 8 spillere / time | Spillsimulering, runde-trening |
| 7 | **Hull 4/5 (9-hullsbanen)** | Spesifikke hull med praksis-tilrettelegging | 4 spillere | Konkurrans-simulering, scenario-trening |

## Layout

Følger AK Golf-mønsteret med sidebar + topbar + main + sticky footer.

### Chrome
- **Sidebar 220px** (forest bg): "AK GOLF / COACHHQ · PRO" + Anders-profil + nav-grupper (DAGLIG / OPERASJON [Anlegg aktiv] / INNSIKT)
- **Topbar 56px**: ⌘K + breadcrumb "Operasjon / Anlegg / GFGK"

### Hero (80px)
- Eyebrow JetBrains Mono uppercase: `ANLEGG · GAMLE FREDRIKSTAD GOLFKLUBB · 7 FASILITETER`
- Title Inter Tight 32px: `GFGK ` + Instrument Serif italic `*anlegg*` + ` — kalender, booking og aktivitet`
- 4 actions rounded-pill høyre:
  1. `+ Ny booking` (lime, primary)
  2. `Eksporter kalender` (forest)
  3. `Filtre` (outline)
  4. `Daglig-leder-visning` (outline, toggle)

### Mode-bar (40px)
2 tabs (samme stil som workbench v2 Status/Plan):
- **KART** (default) — interaktivt visuelt anleggskart
- **KALENDER** — kalender-grid per fasilitet

---

## TAB 1: KART (interaktivt visuelt anleggskart)

### Layout
Full bredde-canvas (~800-1000px høyde) med SVG/CSS-tegning av GFGK-anlegget.

### Visuelt anleggskart
SVG-basert top-down kart. Mente å se OUT som en stilisert fugleperspektiv-illustrasjon av anlegget. Bruk AK Golf-fargene:
- Greener: lime `#D1F843`-tone (Putting Green, Nærspillsområde-greener)
- Fairways: forest `#005840` (med litt opacity for bakgrunn)
- Driving range: rektangulær matte-form, forest med lime tee-markører
- Bygninger: cream/border med tydelig kontur (Performance Studio, klubbhus)
- Tre/skog: muted forest (#3a5a40 eller lignende)
- Vann: subtil blå (#2A6FDB med opacity)
- Tee-områder: lime sirkler
- Greens: lime fyll med forest border
- Sand-bunkere: cream-prikker

### Klikkbare hotspots
Hver av de 7 fasilitetene = klikkbar marker med:
- **Sirkel-marker** (24-32px) med fasilitet-nummer (1-7) sentralt
- **Tooltip on hover**: fasilitet-navn + status (Ledig / Opptatt nå / Reservert)
- **Klikk** → åpner side-drawer (fra høyre, 400px) med:
  - Fasilitet-navn (Inter Tight 20px)
  - Foto (placeholder cream-tinted gradient)
  - Beskrivelse 2-3 setninger
  - **Dagens aktivitet** — liste over bookinger i dag (start-tid · spiller/gruppe · coach · varighet)
  - **+ Ny booking på denne fasiliteten** lime CTA
  - **Se i kalenderen** outline-knapp

### Marker-farger på kartet (real-time status)
- **Lime (aktiv puls)** — Opptatt akkurat NÅ
- **Forest fyllt** — Reservert senere i dag
- **Cream + border** — Ledig
- **Rød pulserende** — Konflikt eller venter på godkjenning

### Status-strip øverst på kart-canvas
Mono 11px label-rad horisontalt:
- `7 FASILITETER · 4 OPPTATT NÅ · 12 RESERVERT I DAG · 3 KONFLIKTER`

### Bunn-strip på kart
- "Klikk på en fasilitet for detaljer" + small Lucide MapPin-ikon
- "Sist oppdatert: 12:34" mono small høyre

---

## TAB 2: KALENDER (grid per fasilitet)

### Layout
- **Filter-rad** øverst (60px): Tid-zoom (Dag · UKE · Måned · Sesong) + coach-filter + fasilitet-filter + zone-filter
- **Hovedgrid**: 7 rader (én per fasilitet) × tidsblokker 06:00–22:00
- Hver rad har:
  - **Venstre kolonne 200px**: Fasilitet-navn + ikon + status-prikk + kapasitet ("3/6 booket")
  - **Tid-grid resten av bredden**: blokker per booking

### Booking-blokker
Hver booking i kalenderen:
- Klikkbar rektangel som dekker varighet
- Farge basert på type:
  - **Forest** — Privat coach-time (Anders)
  - **Lime** — Gruppe-trening
  - **Forest dark** — Drop-in / open booking
  - **Cream + dashed border** — Foreldre-medbestemt
  - **Rød** — Konflikt
- Innhold (komprimert):
  - Klokkeslett mono small `09:00–10:00`
  - Spiller/gruppe-navn Inter Tight 12px
  - Coach-avatar (initialer)
  - Discipline-pill (FYS/TEK/SLAG/SPILL/TURN)
- Hover: skygge + tooltip med full info

### Drag-and-drop
- Drag en booking til ny tid eller fasilitet
- Konflikt-detektor: hvis ny posisjon kolliderer, rød highlight + tooltip "Overlapping med Markus' time 14:00"
- Auto-snap til 30-min-intervaller

### Tomme slots
- Klikkbare lyse cream-celler
- Hover: "Klikk for å booke"
- Klikk: åpner ny-booking-modal

### Today-pin
Vertikal lime linje på dagens dato (i uke/måned-visning) eller tid-markør (i dag-visning).

### Eksempel-data (Mandag 20. mai 2026)

**Performance Studio:**
- 09:00–10:00: Markus R.P. (privat, Anders) — TEK iron-progresjon
- 10:30–11:30: Joachim T. (privat, Anders) — SLAG putting
- 14:00–15:00: Emma S. (privat, Anders) — SPILL strategi
- 16:00–17:30: Gruppe-trening A1 (Anders + 3 spillere)

**Driving Range 1. etg:**
- 12:00–13:00: Henrik V., Ida M. (par-time, Anders) — TEK swing

**Driving Range 2. etg:**
- 09:00–10:00: Drop-in driving (10 spillere)

**Putting Green:**
- 11:00–12:00: Putting-klinikk (gruppe, instruktør Erik)
- 18:00–19:00: Junior-gruppe

**Nærspillsområde:**
- 15:00–16:00: Sigrid B., Nora L. (gruppe-time, instruktør Maja)

**9-hullsbanen:**
- 17:00–19:00: Junior turnerings-simulering (8 spillere)

**Hull 4/5:**
- 19:00–20:00: A1-spillere scenario-trening (Anders + 4)

---

## Daglig-leder-visning (toggle)

Når Daglig-leder-toggle aktiveres (eller bruker logger inn som DL):
- Skjul Anders-spesifikke detaljer
- Vis **utnyttelses-grader** per fasilitet:
  - Total tid booket / total åpningstid (siste uke + denne uke)
  - Inntekt per fasilitet (hvis tilgjengelig)
  - Antall unike spillere per fasilitet siste 30 dager
- Vis **konflikt-rapport**: overlappende bookinger
- Eksportere: PDF-rapport for klubbstyret
- Read-only på alle bookinger (kan ikke endre andres)

---

## Booking-modal (åpnes fra "+ Ny booking" eller klikk på tom celle)

### Felt
1. **Spiller(e) / Gruppe** — søk + multiselect (chips), eller velg gruppe fra dropdown
2. **Type** — Privat / Gruppe / Drop-in / Klinikk (radio)
3. **Coach** — Anders default (også Erik, Maja, etc.) — dropdown
4. **Fasilitet** — dropdown. **DEFAULT: Performance Studio** når coach = Anders
5. **Dato** — datovelger
6. **Tid** — fra-til (kalender-piker eller mono input)
7. **Varighet** — auto-beregnet fra fra/til
8. **Discipline** — multiselect pill (FYS/TEK/SLAG/SPILL/TURN)
9. **Notat** — fritekst (Markus skal jobbe med iron-progresjon)
10. **Send melding til spiller** — checkbox (default på)

### Konflikt-validering
Live mens bruker fyller ut:
- Hvis tid+fasilitet konflikter med eksisterende booking → vis varsel rødt: "Performance Studio er booket 09:00–10:00 av Joachim T."
- Foreslå alternativer: "Driving Range 1. etg er ledig 09:00" eller "Performance Studio er ledig 10:30"

### CTA
- **Bekreft booking** (lime) — primary
- **Bekreft + send forberedelse til spiller** (lime + checkmark) — alternativ
- **Avbryt** (outline)

### Kobling til treningsplanlegging
Hvis booking opprettes som del av en treningsplan:
- Vis liten link "Fra plan: Spesialisering vår, økt 7 av 17"
- Auto-fyll discipline + notat fra plan-mal
- Etter bekreft: oppdater plan-progresjon

## Sticky footer (64px)
- **Venstre**: "Anders' planlagte timer denne uka: 28 av 35 (80% kapasitet)" mono
- **Senter**: 4 mini-KPI-bobler: "9 økter i dag · 18 spillere · 2 konflikter · MTD-inntekt 47k"
- **Høyre**: 2 buttons: "Eksporter dag" (outline) + "+ Ny booking" (lime, primary)

## Branding (følger AK Golf design system)

- BG cream `#FAFAF7`
- Card hvit `#FFFFFF` med border `#E5E3DD`
- Primary forest `#005840`, accent lime `#D1F843`
- Discipline-pills bruker FYS/TEK/SLAG/SPILL/TURN-farger
- Inter Tight (titler), Inter (UI), JetBrains Mono (alle tall og klokkeslett)
- Instrument Serif italic sparsomt — `Instrument Serif italic på "anlegg"` i hero
- 16px radius cards, 12px buttons, 999px pills
- INGEN emojier, kun Lucide-ikoner stroke 1.75
- Norsk bokmål gjennomgående

## Eksempel-personas

- **Anders Kristiansen** — Head coach AK Golf Academy, 38 aktive spillere, default Performance Studio
- **Erik Solli** — Putting-spesialist, leier Putting Green tirsdager
- **Maja Hagen** — Junior-coach, holder klinikker på Nærspillsområdet
- **Tone Berg** — Daglig leder GFGK, har read-only-tilgang

## Eksempel-spillere (default-data)
- Markus Røinås Pedersen (HCP +3,5, A1, default booket 09:00)
- Joachim Tangen (+1,2, A1)
- Emma Sundsdal (4,8, A2)
- Øyvind Røhjan (+3,5, A1)
- Sigrid Berg (8,2, B1)
- Nora Lillevold (12,4, B2)
- Henrik Vorli (+0,4, A1)
- Ida Mathisen (3,1, A2)

## Tekniske krav

- Single self-contained `.html`
- Inline `<style>` block
- Google Fonts via `<link>`
- All icons inline Lucide SVG (stroke 1.75)
- Interaktivt SVG-kart med klikkbare regioner
- ~1500–2000 linjer HTML

## Constraints

- INGEN emojier
- ALL UI på norsk bokmål
- Diskipliner uppercase: FYS, TEK, SLAG, SPILL, TURN
- Tall norsk format: `+3,5`, `47 250 kr`
- Klokkeslett 24h: `09:00`, `14:30`
- Dato: `20. mai 2026`
- Standardisert Performance Studio = Anders' default-fasilitet (vis dette eksplisitt med subtil "default"-badge eller mono-tekst i booking-modal)

Output: én komplett HTML-fil. Begin `<!DOCTYPE html>`, end `</html>`. Ingen forklaring utenfor kode-blokken.
