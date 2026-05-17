# Prompt: PlayerHQ Dashboard — Sports Editorial × 3 enheter

> Lim inn `design.md` (Sports Editorial design system) FØRST som kontekst.
> Deretter denne prompten. Claude Design leverer én HTML-fil med desktop,
> iPad og iPhone stablet vertikalt.

---

## Slik bruker du dette i Claude Design

1. Åpne https://claude.ai/new (Sonnet 4.6 eller Opus, design-mode/artifacts aktivert)
2. Lim inn HELE innholdet av `design.md` (Sports Editorial design system)
3. Trykk Enter to ganger
4. Lim inn prompten under (alt fra og med `---` til slutten)
5. Claude Design leverer komplett HTML
6. Lagre som `_outputs/01-playerhq-dashboard.html`

---

## PROMPT (kopier alt under denne linjen)

Du er senior visuell designer som spesialiserer seg på Sports Editorial design
— magasin-redaksjon kombinert med performance-data for elite-atleter.

Du har akkurat fått hele design-systemet (over). Følg det strengt:
- Italic Instrument Serif er hovedstemme (bruk OFTE)
- Typografi-glyfer som ikoner (ikke SVG-tegninger)
- Magazine spread-feel, ikke uniform dashboard-grid
- Forest green sparsomt som signatur, lime maks ÉN flate per skjerm
- Norsk locale (komma desimal, ikke-brytbar mellomrom, +/− fortegn)
- Editorial tone — observerende italic-fragmenter, aldri "Velkommen tilbake"

# SKJERM: PlayerHQ Dashboard (3 enheter)

URL: `/portal`
Bruker: **Markus Røinås Pedersen**, 16 år, HCP 4,2, A1-spiller på WANG
Toppidrett Fredrikstad. Hjemmebane: Gamle Fredrikstad GK (GFGK).

Brukerspørsmål når Markus åpner dashboardet:
*"Hvor står jeg akkurat nå, og hva trenger jeg å gjøre i dag?"*

## Realistiske data å bruke

- **I dag:** Søndag 17. mai 2026, kl 08:14 (Norges grunnlovsdag)
- **Forrige uke:** Tre runder på GFGK, beste 69 (−3), HCP fra 4,4 → 4,2
- **Strakk:** 12 dager med planlagt trening fullført
- **Form:** Stigende — siste 30 dager +1,8 i SG total
- **Olyo Cup:** 27 dager unna (13.-15. juni 2026, Bossum)

**HCP-trend siste 12 mnd:** 6,1 → 5,8 → 5,5 → 5,2 → 4,9 → 5,1 → 4,8 → 4,6 → 4,5 → 4,4 → 4,3 → 4,2

**SG total breakdown siste 90 dager:**
- OTT: +0,42
- APP: −0,18 (svakeste)
- ARG: +0,67
- PUTT: +0,93 (sterkeste)
- TOTAL: +1,84

**I dag — 17. mai (hvile-tema):** Ingen planlagt økt (grunnlovsdag).
Markus får i stedet status-oversikt + valgfri ettermiddags-runde.

**I morgen (mandag 18. mai):**
- 09:00 — TEK Approach 150-180m · 75 min · GFGK Range

**Denne ukens plan:**
- Søn 17. mai: HVILE — grunnlovsdag
- Man 18. mai: TEK Approach · 75 min
- Tir 19. mai: FYS Styrke + Mobilitet · 60 min
- Ons 20. mai: SLAG Range-blokk · 90 min
- Tor 21. mai: SPILL 18 hull GFGK · 4t
- Fre 22. mai: TEK Putt-drill · 45 min
- Lør 23. mai: Konkurranse: GFGK klubbmesterskap

**Siste coach-melding** (fra Anders, sendt i går kl 19:42):
*"Markus — så på Trackman-økta di. Hofta er fortsatt rask på toppen.
La oss gjøre slow-motion mandag. Bra arbeid i går."*

**Topp 3 milepæler:**
1. WAGR-rangering: #1247 globalt, opp 89 plasser siden januar
2. Første runde under par: 69 (−3) på GFGK, 11. mai 2026
3. Olyo Cup-kvalifisering: bekreftet 14. mai

---

## STRUKTUR — 5 spreads kombinert

Bruk **5 spread-arketyper** fra design.md seksjon 12:

1. **Cover** (Arketype A) — hero-tittel + lead
2. **Stat block + photo** (Arketype B Lead Spread) — 12 dagers strakk + portrait
3. **The Quote** (Arketype D) — Anders' melding
4. **Data Story** (Arketype C) — HCP-trend graf + SG breakdown
5. **TOC-stil ukeplan** + milepæl-cards (Arketype F-aktig)

Footer/kolofon nederst.

---

## DESKTOP 1440×900

### Layout

12-col med sidebar TOC permanent venstre (280px).

**Sidebar TOC:**
```
AK GOLF HQ
Utgave 047 · 17.05

01  Status
02  Denne uka
03  Statistikk
04  Coach
05  Milepæler

PORTALER
↳ Tren
↳ Mål
↳ Coach
↳ Meg
```

**Main content (max 1080px):**

**Spread 1 — Cover (12-col):**
- Eyebrow: `● AK GOLF HQ · UTGAVE 047 · SØNDAG 17. MAI 2026 · 08:14` med pulserende grønn live-prikk
- Cover-tittel (Instrument Serif italic, 112px):
  ```
  Markus —
  *nesten i mål.*
  ```
- Lead-paragraf (Geist 19px, max-width 560px):
  *"17. mai. Hviledag etter tre runder under par. HCP 4,2 i dag — ditt
  beste 12-måneders trekk på fire år. En måned igjen til Olyo Cup."*
- Photo til høyre (4:5, golden-hour portrait, hvis ikke ekte foto:
  solid forest-flate med liten italic "*Markus, GFGK, mai 2026*")

**Spread 2 — Lead Spread (8+4):**
- Venstre 8-col: Stat block
  - JetBrains Mono 128px: `12`
  - Tiny label: `DAGER PÅ RAD I TRENING`
  - Italic annotation: *"Lengste strakk siden i fjor sommer. Ikke bryt nå."*
- Høyre 4-col: editorial portrait-photo

**Spread 3 — The Quote (10-col centered):**
- Forest accent-strek venstre (3-4px, 96px høy)
- Pull quote (Instrument Serif italic 44px):
  *"Markus har truffet et plateauet på 150-180m approach. Vi prøver smal
  grønn-drill neste uke for å bryte gjennom."*
- Attribusjon: `— ANDERS KRISTIANSEN, COACH · 16. MAI 19:42`

**Spread 4 — Data Story (6+6):**

Venstre 6-col: HCP-trend graf
- SVG line-graph (12 datapunkter)
- Linje tegnes inn med stroke-dashoffset på load
- I dag-punkt: stor sirkel + label "4,2 I DAG"
- Y-akse: bare start (6,1) og slutt (4,2)
- X-akse: månedsforkortelser
- Annotasjons-pil: *"Ned 1,8 slag. Beste 12-måneders trekk på fire år."*

Høyre 6-col: SG breakdown
- 4 horisontale bars (OTT, APP, ARG, PUTT)
- Verdier i JetBrains Mono: `+0,42` `−0,18` `+0,67` `+0,93`
- Annotation-pil på APP-baren: *"Her ligger forbedrings-rommet."*
- Total nederst: `+1,84` (32px JBM)

**Spread 5 — Ukeplan (8-col + 4-col milepæler):**

Venstre 8-col: Denne uka som TOC-stil:
```
DENNE UKA — 17. → 23. MAI

01  Søn 17. mai     *Hvile* — grunnlovsdag       —
02  Man 18. mai     *TEK Approach 150-180m*       09:00 · 75 min
03  Tir 19. mai     *FYS Styrke + Mobilitet*      16:00 · 60 min
04  Ons 20. mai     *SLAG Range-blokk*            10:00 · 90 min
05  Tor 21. mai     *18 hull, GFGK*               08:00 · 4 t
06  Fre 22. mai     *TEK Putt-drill*              17:00 · 45 min
07  Lør 23. mai     *Klubbmesterskap GFGK*        09:00 · turnering
```

Hver rad har pyramide-prikk (4px) i pyramide-fargen til venstre.

Høyre 4-col: 3 editorial-cards stablet:
- Card 1: WAGR #1247 (italic glyph "*1247*")
- Card 2: 69 (−3) første under par
- Card 3: Olyo Cup om 27 dager

**Kolofon nederst:**
```
AK GOLF HQ · Utgave 047 · Søndag 17. mai 2026 · Trykket digitalt fra Fredrikstad
Redaktør: Anders Kristiansen · AK Golf Group AS
```

---

## IPAD 1024×768 (landscape)

### Layout

Top-tab nav (48px), ingen sidebar. Main padding 32-48px hver side.

```
┌──────────────────────────────────────────────────────────┐
│ AK GOLF HQ · UTGAVE 047 · 17.05 · 08:14         🔍 ⌘  │ ← 56px masthead
├──────────────────────────────────────────────────────────┤
│ [HJEM] [TREN] [MÅL] [COACH] [MEG]                       │ ← 48px tabs
├──────────────────────────────────────────────────────────┤
│                                                            │
│ COVER (med 96px italic-tittel, 8-col tekst + 4-col foto) │
│                                                            │
│ STAT BLOCK + PHOTO (8+4 fortsatt OK)                     │
│                                                            │
│ PULL QUOTE (centered, 36px)                              │
│                                                            │
│ DATA STORY (6+6 graf+bars)                               │
│                                                            │
│ UKEPLAN TOC (8-col)                                      │
│                                                            │
│ MILEPÆL CARDS (3 stk horisontalt, mindre)                │
│                                                            │
│ KOLOFON                                                   │
└──────────────────────────────────────────────────────────┘
```

**Tilpasninger fra desktop:**
- Cover-tittel: 96px (var 112)
- Pull quote: 36px (var 44)
- Photo aspects: prefer 4:5 og 1:1
- Stat hero: 96px (var 128)
- Touch-targets min 44px
- ⌘K erstattes med søke-ikon (forstørrelsesglass) topp høyre
- Kolofon: kompakt en linje

---

## IPHONE 393×852 (iPhone 15)

### Layout

Bottom tab-bar (56px). Single column. Padding 16-20px hver side.

```
┌─────────────────────────┐
│ MARKUS · DASH       🔍 │ ← 44px running head
├─────────────────────────┤
│                          │
│ ● AK GOLF HQ ·          │
│   UTGAVE 047            │
│   17.05 · 08:14         │
│                          │
│ Markus —                 │
│ nesten i mål.            │
│ *Men ikke helt ennå.*    │ ← Cover-tittel 56px
│                          │
│ HCP 4,2 i dag. Ned 1,8   │
│ siden januar. En måned   │
│ til Olyo Cup.            │
│                          │
│ [Photo 4:5]              │
│                          │
│ ─────                    │
│                          │
│  12                      │
│  DAGER PÅ RAD I TRENING  │
│                          │
│  *Lengste strakk siden   │
│   i fjor sommer.*        │
│                          │
│ ─────                    │
│                          │
│ │                        │
│ │ *"Markus har truffet*  │
│ │ *et plateauet på*      │
│ │ *150-180m approach."*  │
│ │                        │
│ │ — ANDERS KRISTIANSEN   │
│ │   COACH · 16. MAI      │
│                          │
│ ─────                    │
│                          │
│ HCP-TREND 12 MND         │
│ [linje-graf, full bredde]│
│                          │
│ SG-BREAKDOWN 90 DAGER    │
│ OTT  ████████ +0,42      │
│ APP  ███      −0,18 ←*   │
│ ARG  ████████████ +0,67  │
│ PUTT ███████████████ +0,93│
│ ───                      │
│ TOTAL          +1,84     │
│                          │
│ ─────                    │
│                          │
│ DENNE UKA                │
│ ● Søn  *Hvile*           │
│ ● Man  *TEK Approach*    │
│        09:00 · 75 min    │
│ ● Tir  *FYS Styrke*      │
│        16:00 · 60 min    │
│ ● Ons  *SLAG Range*      │
│        10:00 · 90 min    │
│ ● Tor  *18 hull GFGK*    │
│        08:00 · 4 t       │
│ ● Fre  *TEK Putt-drill*  │
│        17:00 · 45 min    │
│ ● Lør  *Klubbmesterskap* │
│        09:00 · turnering │
│                          │
│ ─────                    │
│                          │
│ MILEPÆLER                │
│ [Card 1: WAGR #1247]     │
│ [Card 2: 69 (−3)]        │
│ [Card 3: Olyo om 27 d]   │
│                          │
│ ─────                    │
│                          │
│ Anders, head coach:      │
│ *"Bra arbeid i går.*     │
│ *Slow-motion mandag."*   │
│                          │
│ [Send melding →]         │
│                          │
│ KOLOFON                  │
│                          │
├─────────────────────────┤
│ [Start i morgen-økt →]  │ ← Sticky CTA over tab-bar
├─────────────────────────┤
│ 🏠 ⏱️ 🎯 💬 ⋯           │ ← Bottom tab-bar 56px
└─────────────────────────┘
```

**Tilpasninger fra desktop:**
- Cover-tittel: 56px (var 112)
- Lead body: 17px (var 19)
- Pull quote: 28px (var 44)
- Stat hero: 64-80px (var 128)
- ALLE spreads stables vertikalt — null kolonner
- Photo: 4:5 portrait
- Drop caps: 4× body (40-56px)
- Bottom tab-bar: 4 hoved + 1 mer-knapp
- Sticky primær-CTA over tab-bar når relevant
- Marginalia inline (under elementet)
- ⌘K → søke-ikon i header
- Skip pyramide-fordeling-detalj (vis aggregert)

---

## INTERAKTIVITET (alle 3 enheter)

- **Page-load koreografi** (sekvensiell, 0-2000ms, se design.md seksjon 9)
- **Count-up** på "12 dager"-stat (0 → 12, 800ms)
- **HCP-linje** tegnes inn med stroke-dashoffset (1200ms)
- **SG bars** stagger fade-up (50ms delay, 400ms hver)
- **Pull-quote** scale-up 0.96 → 1.0 (600ms)
- **Editorial cards** fade-up stagger
- **Hover på rad/card:** translateY(-2px) + shadow-1 (desktop/iPad)
- **Tap-feedback** på iPhone: lett scale(0.98) på press
- **Pulserende live-prikk** i eyebrow (2s loop)

---

## COMMAND PALETTE ⌘K (desktop + iPad)

På iPhone erstattes med søke-overlay (full screen) som åpner via søke-ikon.

20+ kommandoer i kategorier:

**Handlinger**
- Start i morgen-økt
- Logg runde
- Send melding til Anders
- Pause dagens plan
- Eksporter HCP-graf som PDF

**Navigasjon**
- Gå til Trening
- Gå til Mål
- Gå til Coach
- Gå til Meg
- Åpne årsplan
- Se kalender denne uka

**Sammenlign**
- Markus vs HCP-mål 3,5
- Denne uka vs forrige uke
- Form-trend 30/90/365 dager
- Sammenlign med Hovland-data
- Sammenlign med Olyo Cup-vinnere

**Analyse**
- Vis full SG-breakdown
- Per-kølle Trackman-data
- WAGR-historikk

**Coach**
- Ping Anders
- Be om tilbakemelding på siste runde
- Se Anders' planer for neste 4 uker

**Hjelp**
- Snarveier
- Om tier (Pro 300 kr/mnd)
- Send tilbakemelding

⌘K åpner med fade + scale-pop. Fuzzy search på tittel + kategori.
↑↓ Enter for å velge, Esc for å lukke.

---

## OUTPUT-FORMAT

Lever **ÉN HTML-fil** med tre viewport-seksjoner stablet vertikalt:

```html
<section class="device device--desktop">
  <header class="device-label">Desktop · 1440 × 900</header>
  <div class="frame" style="width:1440px; height:900px; overflow:hidden;">
    <!-- Desktop layout -->
  </div>
</section>

<section class="device device--ipad">
  <header class="device-label">iPad · 1024 × 768</header>
  <div class="frame" style="width:1024px; height:768px; overflow:hidden;">
    <!-- iPad layout -->
  </div>
</section>

<section class="device device--iphone">
  <header class="device-label">iPhone 15 · 393 × 852</header>
  <div class="frame" style="width:393px; min-height:852px; overflow:hidden;">
    <!-- iPhone layout -->
  </div>
</section>
```

Hver `device-label` er Tiny (10px Geist caps tracking 0.1em).
Hver `frame` har subtil 1px border + 4px radius for å antyde device-mockup.

Mellom hver seksjon: 96px luft + en hairline-separator med italic label
"*— iPad-utgave —*" centered.

Inkluder:
- Tailwind CDN inline
- Google Fonts CDN (Instrument Serif italic, Geist variable, JetBrains Mono)
- Lucide inline SVG der det trengs (kun UI-utility, ikke shot-icons)
- CSS-variabler øverst (design.md seksjon 29)
- Norsk locale gjennomgående
- All interaktivitet fungerer

---

## ETTER LEVERING

Gi kort oppsummering (under 200 ord):

1. **3 designvalg som styrker dashboardet** — hva som skiller dette fra
   generisk dashboard-grid
2. **Hva du ville løftet i neste iterasjon** — én konkret ting per enhet
3. **Hva du er usikker på** — hvor trenger du Anders' input?
