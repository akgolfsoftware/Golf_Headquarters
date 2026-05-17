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

## Demo-bruker (faktiske data)

**Øyvind Rohjan**
- Alder: 19 år
- HCP: **+3,5** (plus-handikap — 3,5 slag bedre enn scratch)
- Snittscore: **71,3** (på par-72 baner)
- Hjemmebane: Gamle Fredrikstad GK (GFGK)
- Status: Senior elite-amateur, WAGR-rangert, tour-aspirant
- Coach: Anders Kristiansen, AK Golf Academy

Brukerspørsmål når Øyvind åpner dashboardet:
*"Hvor står jeg akkurat nå, og hva må jeg gjøre for å bryte gjennom?"*

Tone: Ikke "nesten i mål" — han er allerede tour-kvalitet. Tonen er
**marginal-gains, tour-kvalifisering, nivå-løft**. Han er ikke et talent
som utvikler seg — han er en eliteatlet som finjusterer for å bryte
gjennom siste 5%.

## Realistiske data å bruke

- **I dag:** Søndag 17. mai 2026, kl 08:14 (Norges grunnlovsdag)
- **Forrige uke:** Tre runder GFGK — 69 (−3), 70 (−2), 70 (−2). Snitt 69,7.
- **Strakk:** 47 dager med planlagt trening fullført
- **Form:** Stigende — siste 30 dager +0,8 i SG total vs PGA-baseline
- **WAGR-rangering:** #487 globalt, opp 142 plasser siste 6 mnd
- **Olyo Cup:** 27 dager unna (13.-15. juni 2026, Bossum)
- **European Amateur Qualifier:** 4 uker unna (15.-18. juni, Halmstad)

**HCP-trend siste 12 mnd:** +1,8 → +2,0 → +2,2 → +2,3 → +2,5 → +2,6 → +2,8 → +3,0 → +3,1 → +3,3 → +3,4 → +3,5

(Steady improvement på 1,7 slag — for en elite-spiller er det enormt)

**SG total breakdown siste 90 dager (vs PGA-tour-baseline):**
- OTT: +0,42 (over tour-snitt)
- APP: −0,18 (rom å vokse — eneste minus)
- ARG: +0,67 (sterk)
- PUTT: +0,43 (solid)
- TOTAL: +1,34

(Anchor — +1,34 vs PGA-tour er enormt sterkt. Tour-pros snitt rundt 0,0.
Øyvind er statistisk på tour-nivå.)

**I dag — 17. mai (hvile-tema):** Ingen planlagt økt (grunnlovsdag).
Status-oversikt + valgfri ettermiddags-runde med far.

**I morgen (mandag 18. mai):**
- 09:00 — TEK Approach 150-180m · 75 min · GFGK Range

**Denne ukens plan:**
- Søn 17. mai: HVILE — grunnlovsdag
- Man 18. mai: TEK Approach · 75 min
- Tir 19. mai: FYS Styrke + Mobilitet · 60 min
- Ons 20. mai: SLAG Range-blokk · 90 min
- Tor 21. mai: SPILL 18 hull GFGK · 4t
- Fre 22. mai: TEK Putt-drill · 45 min
- Lør 23. mai: Konkurranse: Garmin Norges Cup R1, Hauger GK

**Siste coach-melding** (fra Anders, sendt i går kl 19:42):
*"Øyvind — så på Trackman-økta di. APP 150-200 er flat. Vi tar smal
grønn-drill mandag, så ser vi om vi kan dra opp den ene metrikken
før European Amateur."*

**Topp 3 milepæler:**
1. WAGR-stigning: +142 plasser siste 6 mnd, nå #487 globalt
2. Tre under par i påfølgende runder (11.-13. mai, GFGK)
3. Kvalifisert European Amateur Qualifier — første internasjonale event

**Editorial tone (eksempler på åpningslinjer):**
- *"Øyvind — på vippen."*
- *"Tre under par i går. Nesten kjedelig."*
- *"Fire av fem metrikker på tour-nivå."*
- *"WAGR-stigningen fortsetter."*
- *"En måned igjen til European Amateur."*

---

## STRUKTUR — 5 spreads kombinert

Bruk **5 spread-arketyper** fra design.md seksjon 12:

1. **Cover** (Arketype A) — hero-tittel + lead
2. **Stat block + photo** (Arketype B Lead Spread) — 47 dagers strakk + portrait
3. **The Quote** (Arketype D) — Anders' melding
4. **Data Story** (Arketype C) — HCP-trend graf + SG breakdown vs tour
5. **TOC-stil ukeplan** + milepæl-cards

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
  Øyvind —
  *på vippen.*
  ```
- Lead-paragraf (Geist 19px, max-width 560px):
  *"17. mai. Hviledag etter tre runder under par. HCP +3,5 i dag —
  ditt beste 12-måneders trekk noensinne. Fire av fem metrikker på
  tour-nivå. En måned til European Amateur."*
- Photo til høyre (4:5, golden-hour portrait, hvis ikke ekte foto:
  solid forest-flate med liten italic "*Øyvind Rohjan, GFGK, mai 2026*")

**Spread 2 — Lead Spread (8+4):**
- Venstre 8-col: Stat block
  - JetBrains Mono 128px: `47`
  - Tiny label: `DAGER PÅ RAD I TRENING`
  - Italic annotation: *"Lengste strakk noensinne. Forberedelsen frem
    mot European Amateur er i rute."*
- Høyre 4-col: editorial portrait-photo

**Spread 3 — The Quote (10-col centered):**
- Forest accent-strek venstre (3-4px, 96px høy)
- Pull quote (Instrument Serif italic 44px):
  *"Øyvind — APP 150-200 er flat. Vi tar smal grønn-drill mandag.
  Får vi dratt opp den ene metrikken før European Amateur, er du
  statistisk på tour-nivå overalt."*
- Attribusjon: `— ANDERS KRISTIANSEN, COACH · 16. MAI 19:42`

**Spread 4 — Data Story (6+6):**

Venstre 6-col: HCP-trend graf
- SVG line-graph (12 datapunkter, +1,8 → +3,5)
- Linje tegnes inn med stroke-dashoffset på load
- I dag-punkt: stor sirkel + label "+3,5 I DAG"
- Y-akse: bare start (+1,8) og slutt (+3,5)
- X-akse: månedsforkortelser
- Annotasjons-pil: *"+1,7 slag på 12 mnd. Beste trekk i karrieren."*

Høyre 6-col: SG breakdown vs PGA-tour
- 4 horisontale bars (OTT, APP, ARG, PUTT)
- Verdier i JetBrains Mono: `+0,42` `−0,18` `+0,67` `+0,43`
- Annotation-pil på APP-baren: *"Eneste rom for vekst. Tour-nivå
  hvis dette løftes."*
- Total nederst: `+1,34` (32px JBM)
- Sub-label: "*vs PGA-tour-snitt*"

**Spread 5 — Ukeplan (8-col + 4-col milepæler):**

Venstre 8-col: Denne uka som TOC-stil:
```
DENNE UKA — 17. → 23. MAI

01  Søn 17. mai     *Hvile* — grunnlovsdag           —
02  Man 18. mai     *TEK Approach 150-180m*           09:00 · 75 min
03  Tir 19. mai     *FYS Styrke + Mobilitet*          16:00 · 60 min
04  Ons 20. mai     *SLAG Range-blokk*                10:00 · 90 min
05  Tor 21. mai     *18 hull, GFGK*                   08:00 · 4 t
06  Fre 22. mai     *TEK Putt-drill*                  17:00 · 45 min
07  Lør 23. mai     *Garmin Norges Cup R1, Hauger*    07:30 · turnering
```

Hver rad har pyramide-prikk (4px) i pyramide-fargen til venstre.

Høyre 4-col: 3 editorial-cards stablet:
- Card 1: WAGR #487 (italic glyph "*487*") — opp 142 plasser
- Card 2: 3 under par på rad (11.-13. mai)
- Card 3: European Amateur om 28 dager

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
│ COVER (med 96px italic-tittel "Øyvind — på vippen.",      │
│        8-col tekst + 4-col foto)                           │
│                                                            │
│ STAT BLOCK + PHOTO (8+4 fortsatt OK)                     │
│ — 47 dager strakk                                         │
│                                                            │
│ PULL QUOTE (centered, 36px)                              │
│ — Anders om APP 150-200                                   │
│                                                            │
│ DATA STORY (6+6 graf+bars)                               │
│ — HCP-trend + SG vs PGA-tour                             │
│                                                            │
│ UKEPLAN TOC (8-col)                                      │
│                                                            │
│ MILEPÆL CARDS (3 stk horisontalt, mindre)                │
│ — WAGR #487, 3 under par, European Amateur               │
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
│ ØYVIND · DASH       🔍 │ ← 44px running head
├─────────────────────────┤
│                          │
│ ● AK GOLF HQ ·          │
│   UTGAVE 047            │
│   17.05 · 08:14         │
│                          │
│ Øyvind —                 │
│ på vippen.               │
│ *Tour-nivå på fire av*   │ ← Cover-tittel 56px
│ *fem metrikker.*         │
│                          │
│ HCP +3,5 i dag. WAGR     │
│ #487 globalt — opp 142   │
│ plasser. European        │
│ Amateur om 28 dager.     │
│                          │
│ [Photo 4:5]              │
│                          │
│ ─────                    │
│                          │
│  47                      │
│  DAGER PÅ RAD I TRENING  │
│                          │
│  *Lengste strakk*        │
│  *noensinne. I rute*     │
│  *mot European Amateur.* │
│                          │
│ ─────                    │
│                          │
│ │                        │
│ │ *"APP 150-200 er flat.*│
│ │ *Smal grønn-drill*     │
│ │ *mandag. Får vi dratt* │
│ │ *opp den ene, er du*   │
│ │ *på tour-nivå overalt."│
│ │                        │
│ │ — ANDERS KRISTIANSEN   │
│ │   COACH · 16. MAI      │
│                          │
│ ─────                    │
│                          │
│ HCP-TREND 12 MND         │
│ [+1,8 → +3,5 linje-graf] │
│                          │
│ SG vs PGA-TOUR · 90 D    │
│ OTT  ████████ +0,42      │
│ APP  ███      −0,18 ←*   │
│ ARG  ████████████ +0,67  │
│ PUTT ████████ +0,43      │
│ ───                      │
│ TOTAL          +1,34     │
│ *Tour-statistikk*        │
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
│ ● Lør  *Norges Cup R1*   │
│        07:30 · Hauger    │
│                          │
│ ─────                    │
│                          │
│ MILEPÆLER                │
│ [Card 1: WAGR #487]      │
│ [Card 2: 3 under par]    │
│ [Card 3: Eur. Amateur]   │
│                          │
│ ─────                    │
│                          │
│ Anders, head coach:      │
│ *"APP 150-200 mandag.*   │
│ *Smal grønn-drill."*     │
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
- **Count-up** på "47 dager"-stat (0 → 47, 800ms)
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
- Eksporter HCP-graf som PDF
- Registrer European Amateur prep

**Navigasjon**
- Gå til Trening
- Gå til Mål
- Gå til Coach
- Gå til Meg
- Åpne årsplan
- Se kalender denne uka

**Sammenlign**
- Øyvind vs PGA-tour-snitt
- Denne uka vs forrige uke
- Form-trend 30/90/365 dager
- Sammenlign med Hovland (samme alder)
- Sammenlign med tour Q-school-kvalifiserere

**Analyse**
- Vis full SG-breakdown vs tour
- Per-kølle Trackman-data
- WAGR-historikk og trend
- APP 150-200 dypdykk (svakeste område)

**Coach**
- Ping Anders
- Be om tilbakemelding på siste runde
- Se Anders' planer for neste 4 uker
- Sett opp prep-økt før European Amateur

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
