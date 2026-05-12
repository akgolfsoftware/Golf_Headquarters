# Redesign: PlayerHQ Agent Pipeline (player-side)

**Last opp før prompten:** `wireframe/screen-deck/playerhq/agent-pipeline.html` (IA-referanse)

---

## ANTI-MØNSTER

Forrige levering var 5 captioned mini-mockups med overlappende tekst og linjer som routet gjennom labels. **ÉN fullbleed produksjons-skjerm uten visuelle bugs.**

---

## MÅL

Spillerens innsyn i hvordan agentene jobber for dem. Tillit-bygger og debugging-flate. Viser: hvilke signaler systemet leser, hvilke skills som tolker dem, hvilke agenter som anbefaler. Player-versjon — mindre detaljer enn admin-overview.

**Canvas: 1440×900.** PlayerHQ-shell med LYS sidebar (220px hvit) til venstre, hovedinnhold til høyre.

---

## LAYOUT (eksakte mål)

### Sidebar (220px, lys `#FFFFFF`)

Standard PlayerHQ-sidebar med 5 nav-items: Hjem, Tren, Mål, Coach, Meg. "Agent-pipeline" er ikke en hovedfane — denne skjermen er en sub-route under Coach eller en admin-link. Vis sidebar med "Coach" aktivt.

### Topp-bar i hovedinnhold (64px)

- **Breadcrumb:** "Coach → Agent-pipeline" Inter 13px muted
- **Tittel:** "Agent-pipeline" Inter Tight 28px bold, tabular -0.02em
- **Sub:** "Hvordan systemet leser deg" Inter 14px muted

### Hovedinnhold — Pipeline-board (resterende plass)

3-kolonne grid med GENERØS vertikal spacing mellom nodene:

#### Kolonne 1 — Signaler (320px bredde, venstre)

- **Kolonne-label:** "SIGNALER · 6" Inter 12px uppercase letterspacing 0.10em opacity 0.50

- **6 signal-noder** vertikalt stablet (gap 24px mellom hver):
  - Hver node: 280px bredde, 80px høyde, radius 16px, border 1px `#E5E3DD`, bg hvit
  - Inni: ikon-sirkel 32px venstre, så navn + sub
  - Eksempler:
    1. ikon `Trending-up` · "HCP-utvikling" · "12,4 → 11,8 på 30d"
    2. ikon `Target` · "Mål-status" · "70 % mot sesongmål"
    3. ikon `Activity` · "Trenings-frekvens" · "4 økter denne uka"
    4. ikon `MapPin` · "Bane-data" · "5 nye runder logget"
    5. ikon `Award` · "Test-resultater" · "NGF-batch oppdatert"
    6. ikon `Heart` · "Helse" · "Søvn-score 76"

- **Aktiv-prikk:** lime prikk øverst-høyre på noder som "fyrer" nå (kun 2-3 av 6 har dette)

#### Kolonne 2 — Skills (320px bredde, midten)

- **Kolonne-label:** "SKILLS · 4"

- **4 skill-noder** vertikalt stablet (gap 32px):
  - Hver node: 280×100px, radius 16px, bg `#FAFAF7` (litt mørkere enn signaler)
  - Eksempler:
    1. "Plan-analyse" · "Vurderer fremdrift"
    2. "Volum-analyse" · "Sjekker rep-tetthet"
    3. "Talent-projeksjon" · "Estimerer 6mnd HCP"
    4. "Konkurranse-vekting" · "Topp-form-timing"

#### Kolonne 3 — Agenter (320px bredde, høyre)

- **Kolonne-label:** "ANBEFALINGER · 3"

- **3 agent-noder** vertikalt stablet (gap 40px):
  - Hver node: 280×120px, radius 16px, bg `#FFFFFF`, border 2px lime `#D1F843` (HVIS aktiv anbefaling)
  - Eksempler:
    1. Plan-justering: "Øk putte-volum 20 % neste uke"
    2. Test-påminnelse: "NGF-test forfaller om 3 dager"
    3. Coaching-input: "Spør Anders om driver-tipp"

#### Linjer mellom kolonner

- SVG-paths som forbinder signaler → skills → agenter
- Stroke: 1.5px
- Inaktive: rgba(0,0,0,0.10)
- Aktive (de som "fyrer"): lime `#D1F843` med pulserende stroke-animasjon
- **VIKTIG:** Lines må gå BAK nodene (z-index: -1 eller SVG før nodene i DOM)

### Footer (40px)

Liten kontekst-tekst: "Sist oppdatert 14:32 · Live · Spørsmål? Snakk med Anders →"

---

## DEFAULT-STATE

Konkret innhold:

- **Spiller:** Markus Roinaas Pedersen (HCP 12,4 → 11,8)
- **Sist oppdatert:** 14:32
- **Aktive signaler:** HCP-utvikling + Trenings-frekvens fyrer nå
- **Aktive anbefalinger:** Plan-justering (lime border) + Test-påminnelse (lime border)

---

## STATES SOM SEPARATE FILER

- `05-playerhq-agent-pipeline-default.html` — DENNE (live aktivitet)
- `05-playerhq-agent-pipeline-empty.html` — "Pipeline er rolig nå" — alle noder 30 % opacity, sentrert melding
- `05-playerhq-agent-pipeline-popover.html` — Agent-node klikket, popover med detalj
- `05-playerhq-agent-pipeline-gated.html` — Free-tier blur-overlay med "Pro for full pipeline"

---

## ANTI-MØNSTER-LISTE

❌ Captioned mini-states på samme side
❌ Tekst som overlapper (sjekk at hver label har eget rom)
❌ Linjer som går GJENNOM nodene
❌ For komplisert visualisering — kanonisk format er 3 kolonner med klart hierarki
❌ Manglende kolonne-labels

---

## OUTPUT

Ett HTML-dokument 1440×900+. Lim design-link tilbake.
