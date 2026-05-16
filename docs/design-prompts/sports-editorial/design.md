# Sports Editorial — Design System for AK Golf HQ

> Lim inn hele denne filen som "design system"-kontekst i Claude Design før du
> sender en skjerm-prompt. Den er selvstendig — alt Claude Design trenger for
> å bygge en pixel-presis HTML-mockup.
>
> Versjon 3 · Sports Editorial · AK Golf Group · 17. mai 2026

---

## Innholdsfortegnelse

0. Redaksjonell filosofi
1. Utgavekonsept (temporal design)
2. Tone & språk
3. Farger
4. Typografi
5. Spacing & rytme
6. Grid & layout
7. Border & radius
8. Elevation & skygge
9. Motion
10. Ikonografi
11. Fotografi
12. Spread-arketyper (8)
13. Cover-varianter (5)
14. Komponentbibliotek — atomer
15. Komponentbibliotek — molekyler
16. Komponentbibliotek — organismer
17. Tabeller & data-display
18. Chart-bibliotek
19. Skjemaer & inputs
20. Navigasjon
21. Modaler & overlays
22. Empty / loading / error
23. Marginalia & annotasjoner
24. Microcopy-bibliotek
25. Numerisk formatering
26. Responsiv tenkning
27. Accessibility
28. Anti-patterns
29. Code-konvensjoner
30. Output-spec & sjekkliste

---

## 0. Redaksjonell filosofi

AK Golf HQ er ikke en app. Det er **et magasin om elite-golf som oppdaterer
seg basert på din egen prestasjon.**

Hver gang en spiller åpner plattformen, **utgir vi en ny utgave**. Den har:
- En **forsidetittel** som fortolker dagens situasjon
- Et **innholdsregister**
- **Features**, **fotografier**, **pull-quotes**, **data-artikler**
- En **kolofon** nederst

Spørsmålet du alltid stiller: *"Hadde dette stått i et magasin om elite-golf,
eller hadde det stått i en SaaS-app?"* Vi velger alltid magasinet.

### De 5 prinsippene

1. **Tall er typografi.** Ikke charts. Tall fortelles store, med italic-annotasjon.
2. **Tekst er aldri label.** Tekst er observasjon, fortolkning, kuratorvalg.
3. **Layout er aldri grid.** Layout er asymmetrisk spread.
4. **Coach er gjestespalte.** Coach signerer. Coach er ikke "system".
5. **Knapper er verb.** Pull-tab-er, ikke "buttons". "Sett i gang →", ikke "Start".

### Anti-mood

| Mood | Hvorfor avvist |
|---|---|
| Bloomberg Terminal pur | Kald, mister atletens menneskelighet |
| Whoop / Strava | "Performance machine" — vi er publikasjon |
| Stripe / Notion landing | For polished marketing-hero |
| Crypto neon | Aldri |
| Dribbble-dekorativt | Vi forteller historier, ikke pynter |

### Pinterest-referanser

- https://www.pinterest.com/ideas/sports-editorial-design/926893147076/
- https://www.pinterest.com/ideas/sports-editorial-layout/946618950923/
- https://www.pinterest.com/martinryan94/sports-magazine-pages/
- https://www.pinterest.com/josephpandesign/espn-magazine/
- https://www.pinterest.com/btmaccount/asymmetrical-editorial-layouts/
- https://www.pinterest.com/alisaaronson/typographic-spreads-publication-design/

---

## 1. Utgavekonsept (temporal design)

Hver besøk er en **utgave**:

```
AK GOLF HQ · Utgave 047 · Lørdag 17. mai 2026 · 08:14
```

### Plassering

| Element | Hvor | Stil |
|---|---|---|
| **Eyebrow** | Cover-arketype topp | Geist 11px uppercase, tracking 0.1em |
| **Running head** | Toppen av hver spread (sticky) | Geist 10px uppercase, tracking 0.12em |
| **Folio** | Bunn av hver spread, høyre | JetBrains Mono 10px |
| **Kolofon** | Bunn av siden | Geist 10-11px, muted-fg |

### Utgavetema (valgfritt, men løfter)

| Tema | Når | Visuell signatur |
|---|---|---|
| `Hverdag` | Vanlig dag | Cream Standard #FAFAF7, forest accent |
| `Turnering` | Turneringsuke | TURN-lime subtilt, urgent dato-stempel |
| `Hvile` | Restitusjon | Cream Cool #EEF0EC, mer whitespace, blå accent |
| `Milepæl` | Ny PR, første under par | Pull-quote-større, foto-tyngre |
| `Reform` | Etter dårlig periode | Newsprint #ECE9DF, feltnotater-stil |
| `Mørk` | Live-økt på iPad i sol | Forest Deep #0F2A22 bakgrunn |

Tema vises ikke som etikett — det former tonen og rytmen.

---

## 2. Tone & språk

### Grunnregel

Vi skriver som et magasin, ikke som en app. Hver tekstflate er en redaksjonell
beslutning.

### De 5 stemmeprinsippene

1. **Observerende, ikke instruerende.** Ikke "Klikk her", ja *"Start når du er klar →"*
2. **Tall fortelles.** Ikke "HCP: 4,2", ja *"HCP 4,2 i dag. Ned 1,8 siden januar."*
3. **Fragmenter er italic.** Bruk italic for følelsesladde øyeblikk.
4. **Aldri smiley-tone.** Ingen "Velkommen tilbake!", ingen 👋, ingen 🎉.
5. **Coach signerer.** Coach er gjestespalte med navn + dato.

### Åpningslinjer per kontekst

| Kontekst | Åpningslinje |
|---|---|
| Morgenbesøk hverdag | *"Lørdag morgen. To dager siden sist."* |
| Etter PR | *"Markus — 69 i går. Første under par."* |
| Turneringsuke | *"Tre dager til Olyo. Slipper du eller setter du i gang?"* |
| Etter hvile | *"Tilbake. Hvile er ikke fravær."* |
| Lang fravær | *"Det er fjorten dager siden sist. Ingen krav."* |
| Milepæl | *"WAGR #1247. Du er på kartet."* |
| Live-økt start | *"Drill 1 av 8. Tempo."* |
| Coach åpner spillerprofil | *"Markus. Sytten år. Form stiger."* |

### CTA-formuleringer

| Default UI | Sports Editorial |
|---|---|
| "Start" | *"Sett i gang →"* |
| "Submit" | *"Send →"* |
| "View details" | *"Les hele utgaven →"* |
| "Cancel" | *"Avbryt"* |
| "Delete" | *"Slett"* |
| "Save" | *"Bevar"* |
| "Continue" | *"Fortsett →"* |
| "Try again" | *"Prøv igjen →"* |
| "Sign up" | *"Tegn abonnement →"* |
| "Log in" | *"Logg inn"* |

---

## 3. Farger

### Brand-tokens (uendret palett)

| Token | Lyst | Mørkt | Bruk |
|---|---|---|---|
| `--ak-cream` | #FAFAF7 | — | Side-bakgrunn lyst tema |
| `--ak-cream-warm` | #F5EFE2 | — | Field Notes-spread |
| `--ak-cream-cool` | #EEF0EC | — | Workshop-spread |
| `--ak-newsprint` | #ECE9DF | — | Atlas-spread, referanse |
| `--ak-ink` | #0A1F17 | — | All tekst lyst tema |
| `--ak-forest` | #005840 | — | Primær, accent-strek, signatur |
| `--ak-forest-deep` | #003B2A | #0F2A22 | Mørk bakgrunn |
| `--ak-bone` | #F5F4EE | — | Tekst på mørk |
| `--ak-lime` | #D1F843 | — | Accent, "live now", maks 1/skjerm |
| `--ak-muted` | #F1EEE5 | #1B3B30 | Sekundær flate |
| `--ak-muted-fg` | #5E5C57 | #9D9C95 | Metadata, bildetekst |
| `--ak-border` | #E5E3DD | #2B4F42 | Hairline |
| `--ak-card` | #FFFFFF | #163027 | Card-flate (innenfor spread) |

### Pyramide-farger

| Pyramide | Hex | Tekst på flate |
|---|---|---|
| FYS | #003B2A | #FAFAF7 |
| TEK | #005840 | #FAFAF7 |
| SLAG | #2A7D5A | #FAFAF7 |
| SPILL | #B7C97D | #0A1F17 |
| TURN | #D1F843 | **#0A1F18** (aldri hvit) |

### Status-farger

| Status | Hex | Bruk |
|---|---|---|
| Success | #16A34A | Positiv delta, "live"-prikk |
| Warn | #B8852A | Varsel, tester forfaller |
| Danger | #A32D2D | Slett, kritisk avvik |
| Info | #2563EB | Sjelden brukt, kun info-callouts |

### Farge-regler

1. **Cream er magasin-papir.** Aldri rent #FFFFFF på side-nivå.
2. **Forest green er signatur.** Accent-strek, primær CTA, drop cap-emphasis.
3. **Lime KUN som tilfeldig vekkelse.** Maks ÉN lime-flate per skjerm.
4. **TURN-tekst alltid mørk** (#0A1F18, aldri hvit på lime).
5. **Status-farger sparsomt** — én status-prikk per spread, ikke flere.

---

## 4. Typografi

### Fonter

| Font | Rolle | Vekt-bruk |
|---|---|---|
| **Instrument Serif** | Display, editorial | Regular + italic. Aldri bold. |
| **Geist** | UI, brødtekst | 300, 400, 500. Aldri 600/700 i body. |
| **JetBrains Mono** | Alle tall, datoer, ankertekst | 400, 500. Tabular-nums alltid. |

Google Fonts CDN:
```
https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300..700&family=JetBrains+Mono:wght@400;500&display=swap
```

### Full skala

| Klasse | Px (D) | Px (M) | LH | Font | Bruk |
|---|---|---|---|---|---|
| Cover | 112 | 56 | 1.0 | IS italic | Forside-tittel |
| Cover Lead | 128 | 64 | 0.95 | IS italic | XL-cover på milepæl-utgave |
| Display 1 | 72 | 44 | 1.05 | IS italic | Spread-tittel |
| Display 2 | 56 | 36 | 1.05 | IS italic | Section-tittel |
| Headline | 40 | 32 | 1.1 | IS italic | Underseksjon |
| Subhead | 28 | 24 | 1.2 | IS italic | Lead Spread subhead |
| Pull Quote | 44 | 32 | 1.15 | IS italic | The Quote |
| Pull Quote XL | 56 | 40 | 1.1 | IS italic | Milestone-quote |
| Lead Body | 19 | 17 | 1.55 | Geist 400 | Lead-paragraf |
| Body | 16 | 15 | 1.6 | Geist 400 | Brødtekst |
| Body Small | 14 | 13 | 1.55 | Geist 400 | Sekundær brødtekst |
| Caption | 12 | 11 | 1.4 | Geist 500 caps 0.08em | Bildetekst |
| Tiny | 10 | 10 | 1.3 | Geist 500 caps 0.1em | Kolofon, folio |
| Stat Hero | 128 | 80 | 1.0 | JBM 500 | Hovedtall (HCP, SG-total) |
| Stat Large | 72 | 56 | 1.0 | JBM 500 | Sekundære tall |
| Stat Medium | 32 | 28 | 1.1 | JBM 500 | Inline-tall |
| Stat Small | 18 | 16 | 1.2 | JBM 500 | Tabell-tall |
| Annotation | 14 | 13 | 1.4 | IS italic | Pen-and-ink-markeringer |
| Drop Cap | 5× body | 4× body | 0.9 | IS regular | Første bokstav Lead Body |

### Regler

1. **Italic Instrument Serif er hovedstemmen.** Minst 3 steder per skjerm.
2. **Mix italic + regular Instrument Serif** i samme tittel:
   `Markus — *nesten i mål.*`
3. **Drop cap** på Lead Body. Forest green for emphasis, ink for default.
4. **Geist body aldri over 500.** Bold reserveres for pull-tab CTAs.
5. **JetBrains Mono med tabular-nums + slashed-zero** alltid:
   ```css
   font-variant-numeric: tabular-nums slashed-zero;
   ```
6. **Norsk locale strengt:**
   - Komma desimal: `4,2`
   - Ikke-brytbar mellomrom som tusenskille: `13 188`
   - SG: `+2,92` eller `−0,93` (typografisk minustegn)
   - Datoer: `17. mai 2026` eller `17.05.2026`
   - Klokkeslett: `08:14` (24-timers)
   - Penger: `12 500 kr` eller `kr 12 500`

---

## 5. Spacing & rytme

### Skala (8pt-grid)

| Token | Px | Bruk |
|---|---|---|
| `--space-0` | 0 | — |
| `--space-1` | 4 | Hairline, ikon-padding |
| `--space-2` | 8 | Inline-elementer |
| `--space-3` | 12 | Tett gruppering |
| `--space-4` | 16 | Standard padding |
| `--space-5` | 24 | Card-padding |
| `--space-6` | 32 | Innenfor spread |
| `--space-8` | 48 | Mellom block-elementer |
| `--space-10` | 64 | Spread-internal break |
| `--space-12` | 96 | Mellom spreads |
| `--space-16` | 128 | Mellom hovedspreads |
| `--space-20` | 160 | Cover-margin topp |
| `--space-24` | 192 | Magasin-spread-pause |

### Baseline grid

Vertikal rytme: **24px baseline**. All body-tekst legger seg på baselinje.
Whitespace mellom paragrafer er multiplum av 24 (24, 48, 72, 96).

### Vertikal rytme per kontekst

| Kontekst | Spacing |
|---|---|
| Mellom hovedspreads | 96-128px |
| Mellom subspreads | 64px |
| Innen en spread | 32-48px |
| Mellom paragrafer | 24px |
| Mellom linjer (body) | 1.6 line-height |
| Mellom linjer (display) | 1.05 line-height |

---

## 6. Grid & layout

### Container

| Bredde | Maks-bredde | Margin |
|---|---|---|
| Desktop 1440px+ | 1280px | 80px hver side |
| Tablet 768-1023 | 720px | 24px hver side |
| Mobile <768 | 100% | 16px hver side |

### 12-col grid

- Gutter desktop: 24px
- Gutter mobile: 16px
- Aldri 4×3 dashboard-grid

### Spread-bredder

| Spread | Venstre | Høyre | Notater |
|---|---|---|---|
| Cover | 12 | — | Full-bredde |
| Lead Spread | 8 | 4 | Eller 7+5 for variasjon |
| Data Story | 6 | 6 | Eller 7+5 |
| The Quote | 10 (centered) | — | 1-col gutter hver side |
| Field Notes | 8 | 4 | Marginalia høyre |
| Workshop | 8 | 4 | Trinn venstre |
| Interview | 10 (centered) | — | Stor luft mellom replikker |
| Atlas | 12 | — | Full-bredde tabell |

### Anti-AI-varianter

Per skjerm SKAL spread-breddene variere. Hvis 3 spreads:
- 12 / 8+4 / 10-centered (eksempel)
- 12 / 7+5 / 6+6 (eksempel)

ALDRI alle 12-col eller alle 8+4.

---

## 7. Border & radius

### Borders

| Token | Bruk |
|---|---|
| 1px solid var(--ak-border) | Hairline mellom seksjoner |
| 1px solid var(--ak-ink) | Sharp editorial accent (sparsomt) |
| 3-4px solid var(--ak-forest) | Pull-quote accent-strek (vertikal) |
| 2px solid var(--ak-lime) | Live-økt-indikator |
| 2px solid var(--status-warn) | 7-dagerslås (gul border-left) |

### Border-radius skala

Editorial = mindre rundet enn typisk SaaS.

| Token | Px | Bruk |
|---|---|---|
| `--radius-none` | 0 | Hairline-felt, tabeller |
| `--radius-xs` | 2 | Tags, badges |
| `--radius-sm` | 4 | Chips, små knapper |
| `--radius-md` | 8 | Inputs |
| `--radius-lg` | 12 | Editorial cards |
| `--radius-xl` | 16 | Hero-cards, modals |
| `--radius-pill` | 999 | Pull-tabs (CTA), avatar |
| `--radius-circle` | 50% | Avatar, ikoner i sirkel |

**Default kort-radius: 12px.** Pull-tab: pill (999). Tags: 4px.

---

## 8. Elevation & skygge

Editorial = SUBTILE skygger. Aldri "lifted card with big shadow" SaaS-feel.

| Token | Shadow | Bruk |
|---|---|---|
| `--shadow-0` | none | Default — vi unngår skygger |
| `--shadow-1` | 0 1px 2px rgba(10, 31, 23, 0.04) | Hover på editorial card |
| `--shadow-2` | 0 2px 8px rgba(10, 31, 23, 0.06) | Pull-tab hover |
| `--shadow-3` | 0 8px 24px rgba(10, 31, 23, 0.08) | Modal, dropdown |
| `--shadow-4` | 0 16px 48px rgba(10, 31, 23, 0.12) | Command palette |

Aldri:
- Stack 3 skygger på samme element
- Spread-shadow > 24px utenfor modal-kontekst
- Skygger med farge utenom ink

---

## 9. Motion

### Easing

| Token | Curve | Bruk |
|---|---|---|
| `--ease-out` | cubic-bezier(0.16, 1, 0.3, 1) | Default, alle entries |
| `--ease-in` | cubic-bezier(0.4, 0, 1, 1) | Exits |
| `--ease-in-out` | cubic-bezier(0.4, 0, 0.2, 1) | Toggles, smooth |
| `--ease-out-slow` | cubic-bezier(0.22, 1, 0.36, 1) | Hero-entries |

### Durations

| Token | Ms | Bruk |
|---|---|---|
| `--duration-instant` | 100 | Hover-respons |
| `--duration-fast` | 200 | Modal close, dropdown |
| `--duration-medium` | 400 | Page transitions, fade |
| `--duration-slow` | 800 | Count-up, stagger |
| `--duration-cinema` | 1200 | Stroke-dashoffset draw-in |

### Page-load koreografi (sekvensiell)

| Tid | Hva | Easing |
|---|---|---|
| 0ms | Eyebrow fade-in | ease-out 200ms |
| 200ms | Cover-tittel fade + translateY(8px → 0) | ease-out-slow 500ms |
| 500ms | Lead body fade | ease-out 400ms |
| 700ms | Photo fade + scale(1.02 → 1.0) | ease-out 600ms |
| 1000ms | Stat numbers count-up | ease-out 800ms |
| 1100ms | Annotation-piler tegnes (stroke-dashoffset) | ease-out 1200ms |
| 1300ms | Editorial cards stagger fade-up (50ms delay/kort) | ease-out 400ms |
| 1800ms | Pull-quote scale-up (0.96 → 1.0) | ease-out 600ms |
| 2000ms | Footer fade | ease-out 300ms |

### Hover

| Element | Effekt | Duration |
|---|---|---|
| Editorial card | translateY(-2px) + shadow-1 | 200ms |
| Pull-tab | scale(1.02) + shadow-2 | 200ms |
| Lenke | forest underline glir inn fra venstre | 300ms |
| Photo | inner scale(1.04), overflow-hidden | 600ms |
| Stat block | annotation-pil fader inn | 300ms |

### Aldri

- Bounce / spring easing
- Auto-roterende karusell
- Glitter / partikler
- Loading-spinner (bruk skeleton)
- Toast notifications (inline editorial callouts)

---

## 10. Ikonografi

### Eneste bibliotek: Lucide

Stroke 1.5px, `currentColor`. Aldri farget direkte.

### Størrelser

| Token | Px | Bruk |
|---|---|---|
| `--icon-xs` | 12 | Inline med caption |
| `--icon-sm` | 16 | Inline med body |
| `--icon-md` | 20 | UI default |
| `--icon-lg` | 24 | Pull-tab, header |
| `--icon-xl` | 32 | Hero, large stat |

### Forbudte ikoner

- Emoji (aldri 🎉 👋 ⭐ 🔥 etc.)
- Custom dekorative SVG
- Filled-style ikoner (kun outline)
- Multi-color ikoner

### Tillatte Lucide-ikoner (most-used)

Navigation: `ArrowLeft`, `ArrowRight`, `ArrowUp`, `ArrowDown`, `ChevronRight`,
`ChevronLeft`, `ExternalLink`
Status: `Check`, `X`, `AlertTriangle`, `AlertCircle`, `Info`
Data: `TrendingUp`, `TrendingDown`, `Minus`, `Activity`, `BarChart2`
Time: `Calendar`, `Clock`, `CalendarDays`
Place: `MapPin`, `Globe`
Person: `User`, `Users`, `UserCircle2`
Communication: `MessageCircle`, `Send`, `Mail`
Object: `Target`, `Crosshair`, `Zap`, `Pin`, `Lightbulb`, `Sparkles`
Action: `Plus`, `Edit`, `Trash2`, `Download`, `Share`, `Settings`

---

## 11. Fotografi

### 8 godkjente bildetyper

| Type | Aspect | Bruk |
|---|---|---|
| Mid-swing | 4:5 | Cover, milestone |
| Pre-shot | 3:2 | Lead spread |
| Course landscape | 16:9 | Cover, atmosphere break |
| Equipment still-life | 1:1 / 3:4 | Workshop, marginalia |
| Trackman screen | 3:2 | Data Story |
| Coach session | 3:2 / 4:5 | Interview |
| Hands close-up | 1:1 | Field Notes |
| Locker / range | 16:9 | Atmosphere break |

### Treatment

- Kontrast +10-15%
- Lett varm temperatur
- Ingen Instagram-filtre, ingen B&W (default)
- Premium men ekte (foto-journalisme)

### Caption-disiplin

Museum-tekst-stil, italic Instrument Serif 13-14px:

```
*Markus releaser 7-jern, drilling smal grønn.*
*GFGK, golden hour, 14. mai 2026.*
```

### Placeholder (når ekte foto mangler)

1. **Typografisk hero** — stor Instrument Serif italic fyller plassen
2. **Solid forest-flate** med liten italic-caption
3. **Data-tegning** — SVG av relevant data (heatmap, dispersion plot)

ALDRI: grå "image-placeholder.jpg".

### Photo overlay-mønstre

#### Cover med overlay
```
[Photo 16:9 full-bredde]
   Linear gradient overlay: forest-deep → transparent (mørk i bunn)
   Cover-tittel hvit eller bone, plassert 64px fra bunn-venstre
```

#### Photo + sidetekst
```
[Photo 4:5 venstre]   |   Sidebar tekst-spalte høyre
   Caption italic     |   Bryllup-feature-stil
```

#### Full-bredde-foto med pull-tab over
```
[Photo 16:9 full-bredde]
   Pull-tab "Les hele utgaven →" plassert 32px fra bunn-høyre
```

---

## 12. Spread-arketyper (8)

Hver skjerm er sammensetning av 3-5 spreads stablet vertikalt.

### A. Cover

Magasin-forside. Full-bredde, generøs whitespace.

```
EYEBROW · UTGAVE NR · DATO · TID                              ● live

Markus —
Nesten i mål.
*Men ikke helt ennå.*

Lead-paragraf i Geist 19px, max-width 540px.

[Photo eller typografi-hero til høyre eller bak]
```

**Specs:**
- Cover-tittel: Display 1 (72-112px Instrument Serif italic, blandet
  regular/italic)
- Lead body maks 60 ord
- Min 192px luft topp/bunn

### B. Lead Spread

Hovedfortellingen. 8+4-kolonne.

```
┌──────────────────────────────┬───────────────────┐
│  SUBHEAD ITALIC              │  [PHOTO 4:5]      │
│                              │  Caption italic   │
│  D Brødtekst-spalte i Geist  │                   │
│  16px, line-height 1.6.      │                   │
│  Drop cap på første bokstav. │                   │
└──────────────────────────────┴───────────────────┘
```

**Specs:**
- Subhead: Subhead 28px Instrument Serif italic
- Drop cap: 5× body, Instrument Serif regular, forest emphasis (valgfritt)
- Photo aspect 4:5, caption italic 13-14px

### C. Data Story

Magasinets "infographic feature".

```
EYEBROW

    +1,84                    *Best på fire år.*
    SG TOTAL                 *Her ligger det:*
                                  ↘
    ●─────●────●─●─●────●         (linje + annotasjons-pil)
    OTT   APP  ARG  PUTT
```

**Specs:**
- Hovedtall: Stat Hero (128px JetBrains Mono)
- Pil-annotasjon med italic-tekst
- Linje-graf med pen-and-ink-stil

### D. The Quote

Pull-quote-spread. Pust rundt.

```
│
│   *"Du må slutte å treffe putt med hendene.*
│    *Det er hofta som styrer."*
│
│   — ANDERS KRISTIANSEN, COACH · 16. MAI
```

**Specs:**
- Forest accent-strek 3-4px vertikal
- Pull Quote 32-44px Instrument Serif italic
- Min 96px luft topp/bunn
- Attribusjon i Geist 10px uppercase tracking 0.1em

### E. Field Notes

Notatbok-spread.

```
FELTNOTATER                          16. MAI · GFGK

*Stod på range 18:30. Glemte vannflaske.*

  Drill 1 — 7-jern, smal grønn
  8/12 godkjent  ← *en bedring fra forrige gang*

  Drill 2 — pitch fra 30m
  6/12 godkjent
        ↘ *trøtt mot slutten. fix hvile.*

Total økt-tid: 1t 47min.
*Bra dag. Ikke perfekt. Bedre.*
```

**Specs:**
- Bakgrunn: Cream Warm #F5EFE2
- Italic-marginalia obligatorisk
- Dato + sted som tagging

### F. The Workshop

Instruktiv spread, trinn-for-trinn.

```
WORKSHOP — DRILL: SMAL GRØNN, 150M

01  *Sett opp 4 baller i en linje.*
    Hver ball symboliserer ett slag.

02  *Velg en smal sone (12m bredde).*
    Vinduet er trang. Det er meningen.

03  *Slå hver av de fire med samme kølle.*
    7-jern. Samme oppsett. Samme tempo.

04  *Logg hvor mange som lander i sonen.*
    Målet er 3/4 før du går videre.
```

**Specs:**
- Bakgrunn: Cream Cool #EEF0EC
- Trinn-nummer: JetBrains Mono 32px
- Trinn-tittel: Italic Instrument Serif 20px
- Body: Geist 15-16px

### G. The Interview

Q&A i magasin-stil.

```
INTERVJUET

ANDERS    Hva tenkte du på 18. tee i dag?

MARKUS    Jeg trodde jeg skulle bommet på driveren.
          *Det fikk meg til å overkompensere.*

ANDERS    Hva tror du du burde gjort?

MARKUS    Bare svinget normalt. Trust the setup.
```

**Specs:**
- Initialer: Geist 11px uppercase tracking 0.1em
- Replikk: Geist 16-18px med italic-fragmenter
- Spacing mellom replikker: 32-48px

### H. Atlas

Referansetabell editorial-stil.

```
KØLLE-ATLAS — PER-KØLLE DISTANSE

  Driver     ─────────────  263m   ± 8m
  3W         ──────────     240m   ± 7m
  5W         ─────────      225m   ± 6m
  4i         ────────       201m   ± 9m
```

**Specs:**
- Bakgrunn: Newsprint #ECE9DF
- Tabell uten gridlines, kun hairline-rader
- JetBrains Mono på tall, Geist på rad-label
- Inline-bar tegnet som forest-strek

---

## 13. Cover-varianter (5)

### Variant 1 — `Hverdag`

```
AK GOLF HQ · UTGAVE 047 · LØRDAG 17. MAI 2026 · 08:14

Markus —
*nesten i mål.*

HCP 4,2 i dag. Ned 1,8 siden januar. En måned igjen
til Olyo Cup. Her er hva som teller nå.

[Photo 4:5 til høyre, golden-hour på rangen]
```

Cream Standard. Forest accent på live-prikk.

### Variant 2 — `Turnering`

```
AK GOLF HQ · UTGAVE 049 · TORSDAG 11. JUNI 2026 · 06:00
                                         3 DAGER TIL OLYO

Markus —
*To dager til.*
*Hva må sitte?*

Olyo Cup i Bossum starter fredag. Tre dager igjen til
første tee-tid. Her er status og fokus.

[Photo 16:9 over hele bredden, Bossum-bane]
```

Cream Standard med lime-accent på "OLYO"-tagging. Urgent dato-stempel.

### Variant 3 — `Hvile`

```
AK GOLF HQ · UTGAVE 048 · SØNDAG 18. MAI 2026 · 10:42

Hviledag.
*Hvile er ikke fravær.*

Etter to ukers stigende belastning er det helt riktig
å bryte i dag. Restitusjon er en del av treningen.

[Photo 1:1 av tom range eller course-landscape]
```

Cream Cool #EEF0EC bakgrunn. Mer whitespace (160px topp). Blå accent
i stedet for forest.

### Variant 4 — `Milepæl`

```
AK GOLF HQ · UTGAVE 050 · MANDAG 12. JUNI 2026 · 19:48

Markus —
*69 i går.*
*Første under par.*

GFGK, søndag. Tre birdier på de første ni. Solid runde
hele veien. Her er hva som skjedde.

[Photo 4:5 av Markus etter runden, signing scorecard]
```

Cream Warm #F5EFE2. Pull Quote XL (56px) tilgjengelig. Foto-tyngre.

### Variant 5 — `Reform`

```
AK GOLF HQ · UTGAVE 052 · TIRSDAG 20. JUNI 2026 · 08:22

Resett.
*Etter Olyo.*

To bomma cuts, en topp-10. Ujevn uke. Her er hva vi
endrer for de neste fire ukene — og hvorfor.

[Ingen photo. Stor typografi-hero fyller plassen.]
```

Newsprint #ECE9DF bakgrunn. Feltnotater-tunge. Marginalia overalt.

---

## 14. Komponentbibliotek — atomer

### 14.1 Eyebrow

```
LIVE · UTGAVE 047 · LØRDAG 17. MAI 2026 · 08:14
```

**Specs:**
- Font: Geist 500
- Size: 11px (10px mobile)
- Tracking: 0.1em
- Uppercase
- Color: var(--ak-muted-fg)
- Min-height: 16px

**Variants:**
- `live` — `●` (4px pulserende grønn) som første tegn
- `urgent` — Color: var(--status-danger)
- `quiet` — Opacity 0.7

### 14.2 Drop Cap

Første bokstav i Lead Body, float left.

**Specs:**
- Font: Instrument Serif regular
- Size: 5× body (M body 16px → drop cap 80px)
- Line-height: 0.9
- Padding-right: 8px
- Padding-top: 4px
- Color: var(--ak-forest) (emphasis) eller var(--ak-ink) (default)

```html
<p>
  <span class="drop-cap" aria-hidden="true">D</span>
  <span class="sr-only">D</span>et er fjorten dager siden sist. Ingen krav.
</p>
```

### 14.3 Pull-tab (CTA button)

#### Varianter

| Variant | Bruk | Bakgrunn | Tekst |
|---|---|---|---|
| Primary | Hoved-CTA | var(--ak-forest) | var(--ak-cream) |
| Secondary | Sekundær | transparent + border 1px forest | var(--ak-forest) |
| Tertiary | Tekst-knapp | transparent | var(--ak-forest) |
| Destructive | Slett | var(--ak-destructive) | var(--ak-cream) |
| Lime | Spesial (TURN, milestone) | var(--ak-lime) | var(--ak-ink) |

#### Størrelser

| Size | Height | Padding | Font |
|---|---|---|---|
| S | 32px | 12px hor | Geist 500 13px |
| M | 40px | 20px hor | Geist 500 14px |
| L | 48px | 28px hor | Geist 500 15px |

#### States

| State | Visuell |
|---|---|
| Default | Som spec |
| Hover | scale(1.02), shadow-2 |
| Active | scale(0.98), shadow-1 |
| Focus | 2px forest outline offset 2px |
| Disabled | Opacity 0.4, cursor not-allowed |
| Loading | Spinner inline + tekst "Sender..." |

**Border-radius:** pill (999) — alltid.

**Med ikon:** ikon-md (20px) til høyre, 8px gap. Lucide `ArrowRight` typisk.

```html
<button class="pull-tab pull-tab--primary pull-tab--m">
  Sett i gang
  <svg><!-- ArrowRight --></svg>
</button>
```

### 14.4 Tag / Pill / Badge

#### Tag (pyramide)

```
[ TEK ]   [ FYS ]   [ TURN ]
```

**Specs:**
- Padding: 4px 10px
- Radius: var(--radius-xs) = 2px
- Font: Geist 500 10px uppercase tracking 0.08em
- Background: pyramide-fargen
- Color: pyramide-tekst-farge

#### Status pill

```
[ AKTIV ]   [ FORFALT ]   [ I MORGEN ]
```

**Specs:**
- Padding: 4px 12px
- Radius: var(--radius-pill) = 999
- Font: Geist 500 11px uppercase tracking 0.06em
- Variants:
  - `success` — bg var(--status-success), 12% alpha, text full
  - `warn` — bg var(--status-warn), 12% alpha
  - `danger` — bg var(--status-danger), 12% alpha
  - `neutral` — bg var(--ak-muted), text var(--ak-muted-fg)

#### Severity dot

`● ● ● ● ●` — 5 prikker, sevreitet 1-5 fyller venstre→høyre.
8px hver, 4px mellomrom, forest fyll på aktive, muted på ikke-aktive.

### 14.5 Avatar

| Size | Px |
|---|---|
| `--avatar-xs` | 20 |
| `--avatar-sm` | 24 |
| `--avatar-md` | 32 |
| `--avatar-lg` | 48 |
| `--avatar-xl` | 64 |

**Specs:**
- Radius: circle (50%)
- Border: 1px solid var(--ak-border) (valgfritt)
- Fallback (ingen photo): Instrument Serif initials, forest bakgrunn,
  cream tekst

```
[MK]    ← Initials "Markus Kristiansen"
```

### 14.6 Live-prikk

`●` pulserende grønn:
- 8px diameter
- bg: var(--status-success)
- Animation: opacity 0.4 → 1.0 over 2s, infinite loop

```css
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.92); }
}
```

### 14.7 Accent stroke

Vertikal forest-green strek for pull-quotes og coach-blokker.

**Specs:**
- Bredde: 3-4px
- Høyde: 48-96px (matcher content-høyde)
- Color: var(--ak-forest)
- Position: absolute left, offset -16-24px fra tekst

### 14.8 Hairline divider

```
─────────────────────────
```

**Specs:**
- 1px solid var(--ak-border)
- Margin: 48-64px hor.
- Brukes til å separere spreads/seksjoner

### 14.9 Folio

Sidetall-stil-element nederst på spread:

```
AK Golf HQ · 047       —       side 02
```

**Specs:**
- Font: JetBrains Mono 10px
- Color: var(--ak-muted-fg)
- Position: bunn, full-bredde mellom margin

### 14.10 Running head

Sticky topp på hver spread:

```
MARKUS · DASHBOARD                                17.05.2026
```

**Specs:**
- Font: Geist 500 10px uppercase tracking 0.12em
- Padding: 12px 0
- Border-bottom: 1px solid var(--ak-border)
- Sticky position

---

## 15. Komponentbibliotek — molekyler

### 15.1 Stat Block

Med obligatorisk italic-annotasjon.

```
4,2
HCP 17. MAI

*Ned 1,8 slag siden januar.
Beste 12-måneders progresjon på fire år.*
```

**Specs:**
- Tall: Stat Hero (96-128px JBM)
- Label: Tiny (10px Geist caps tracking 0.1em)
- Annotation: Annotation (13-14px IS italic, max-width 280px)
- Spacing: 8px tall→label, 24px label→annotation

**Variants:**
- `vertical` (default) — tall over label
- `horizontal` — tall venstre, label/annotation høyre
- `with-delta` — liten +/− badge ved siden av tall

### 15.2 Pull Quote

```
│
│   *"Sitatet her, italic 32-44px."*
│
│   — ANDERS KRISTIANSEN, COACH · 16. MAI
```

**Specs:**
- Forest accent-strek 3-4px venstre, 96px høy
- Quote: Pull Quote (32-44px IS italic)
- Attribusjon: Tiny (10px Geist caps tracking 0.1em)
- Min luft topp/bunn: 96px

**Variants:**
- `standard` — venstre-aligned med strek
- `centered` — centered tekst, ingen strek
- `xl` — 56px font for milepæl-utgaver

### 15.3 Editorial Card

```
EYEBROW

*Italic headline 24-32px*

Body i Geist 14-15px.
Kort, oppsummerende.

[Photo eller stat]
```

**Specs:**
- Padding: 24-32px
- Background: var(--ak-card) = #FFFFFF
- Radius: var(--radius-lg) = 12px
- Border: 1px solid var(--ak-border) (subtil)
- Hover: translateY(-2px), shadow-1
- Varieres i bredde/høyde

**Variants:**
- `feature` — stor, med photo
- `compact` — kort, tekst-only
- `pyramide` — med pyramide-tag øverst

### 15.4 Coach Voice

```
[AVATAR 32px] ANDERS KRISTIANSEN, HEAD COACH

*"Selve coachens kommentar, italic Instrument Serif
16-18px. Med — sitat-dash hvis flere setninger."*

—

[Send-melding →]    [Se Anders' planer]
```

**Specs:**
- Avatar-md (32px)
- Navn: Tiny (10px Geist caps tracking 0.1em)
- Sitat: Body Lead (18px IS italic)
- Sitat-dash separator (Geist 14px ink color, 24px margin)
- 2 pull-tabs nederst (primary + secondary)

### 15.5 Data Annotation (pen-and-ink)

```
        (*"her oppdaget vi*
        *hofta begynte å lukke seg"*)
                  ↘
   ●────────●────●─●─●──────●
   jan      feb   mar  apr   mai
```

**Specs:**
- SVG-pil med stroke 1.5px, currentColor
- Animeres inn med stroke-dashoffset (1000-1200ms ease-out)
- Annotation-tekst: Annotation (13-14px IS italic)
- Pil-vinkel: 30-40° åpning, ikke 90°
- Tekst plasseres 8-12px fra pilens start

### 15.6 Pyramide Bar (volum-fordeling)

```
[FYS 12%][TEK 28%][SLAG 31%][SPILL 19%][TURN 10%]
```

**Specs:**
- Høyde: 32-48px
- 5 segmenter med pyramide-fargene
- Tekst: prosent inni hvis segmentet er bred nok (min 60px), ellers utenfor
- Tekst-farge: pyramide-tekst-farge
- Hover på segment: tooltip med antall min + drills

### 15.7 Mini Sparkline

7-30 datapunkter i en linje, 60-120px bred, 24px høy.

**Specs:**
- Stroke 1.5px forest
- Ingen aksetekst
- Siste punkt markert med 4px sirkel (forest fyll)
- Brukes inline med tall (HCP-trend, MRR-mini, etc.)

### 15.8 Date Stamp

```
17.05.2026 · 08:14 · GFGK
```

**Specs:**
- JetBrains Mono 10-11px
- Color: var(--ak-muted-fg)
- Separator: · (middot)

### 15.9 Filter Chip

Aktiv/inaktiv toggle.

```
[ Område × Pyramide ]   [ Område × Miljø ]   [ L-fase × Komponent ]
```

**Specs:**
- Inaktiv: bg var(--ak-muted), text var(--ak-muted-fg), Geist 500 12px
- Aktiv: bg var(--ak-forest), text var(--ak-cream)
- Radius: var(--radius-pill)
- Padding: 8px 16px
- Hover: scale(1.02)

### 15.10 Severity Indicator

```
●●●○○
```

**Specs:**
- 5 prikker, 8px hver, 4px gap
- Aktive: var(--status-warn) eller forest
- Inaktive: var(--ak-muted)
- Brukes i Caddie-rader, insights-liste

---

## 16. Komponentbibliotek — organismer

### 16.1 Cover Spread

Se Variant 1-5 (seksjon 13).

### 16.2 Masthead (app-header)

```
┌─────────────────────────────────────────────────────────┐
│  AK GOLF HQ          [TREN] [MÅL] [COACH] [MEG]   [⌘K] │
│  Utgave 047 · 17.05.2026                                │
└─────────────────────────────────────────────────────────┘
```

**Specs:**
- Høyde: 64-80px
- Padding: 16px 24px
- Border-bottom: 1px solid var(--ak-border)
- Logo wordmark: Geist 500 14px uppercase tracking 0.15em
- Sub-info: Tiny (10px JBM)
- Nav-items: Geist 400 14px, hover forest underline
- ⌘K-knapp til høyre

### 16.3 Sidebar TOC

```
AK GOLF HQ
UTGAVE 047 — 17.05.2026

01  *Status*
02  *Treningsplan*
03  *Statistikk*
04  *Coach-melding*
05  *Milepæler*

PORTALER
↳ Tren
↳ Mål
↳ Coach
↳ Meg
```

**Specs:**
- Bredde: 240-280px
- Padding: 32px 24px
- Background: var(--ak-cream) eller transparent
- Border-right: 1px solid var(--ak-border)
- Utgave-header: Tiny + numerik
- Toc-items: Geist 14px med italic Instrument Serif på titler
- Hover: forest underline glir inn fra venstre
- Aktiv: forest bullet til venstre

### 16.4 Footer / Kolofon

```
─────────────────────────────────────────────────────────
AK GOLF HQ · Utgave 047 · Lørdag 17. mai 2026
Trykket digitalt fra Fredrikstad

Redaktør: Anders Kristiansen   Kolofon: AK Golf Group AS
Versjon 4.2.1   ·   2025–2026   ·   Personvern   ·   Vilkår
```

**Specs:**
- Padding: 48px 0 24px
- Border-top: 1px solid var(--ak-border)
- Font: Geist 10-11px, muted-fg
- Tre-spaltet layout (info venstre, lenker midt, versjon høyre)

### 16.5 Command Palette (⌘K)

```
┌─────────────────────────────────────────────────┐
│  Søk handlinger, navigasjon, analyser...     ⌘K │
├─────────────────────────────────────────────────┤
│  HANDLINGER                                     │
│  ▸ Start live-økt nå                            │
│  ▸ Logg runde                                   │
│  ▸ Send melding til Anders                      │
│                                                 │
│  NAVIGASJON                                     │
│  ▸ Gå til Trening                               │
│  ▸ Gå til Mål                                   │
│                                                 │
│  ANALYSE                                        │
│  ▸ Vis full SG-breakdown                        │
└─────────────────────────────────────────────────┘
```

**Specs:**
- Modal overlay med backdrop-blur
- Bredde: 640px
- Maks-høyde: 60vh
- Radius: var(--radius-xl) = 16px
- Shadow: shadow-4
- Søkeinput: Geist 16px, italic placeholder
- Kategorier: Tiny (10px Geist caps)
- Items: Geist 14px, fuzzy-match highlight
- Tastatur: ↑↓ navigation, Enter aktiver, Esc lukk
- Animasjon: scale-pop fra 0.96, fade-in 200ms

### 16.6 Live-økt Banner

Sticky topp på portal når aktiv økt pågår.

```
●  LIVE · Drill 4 av 8 · TEK Approach 150m       [Fortsett →]
```

**Specs:**
- Bakgrunn: var(--ak-forest-deep)
- Tekst: var(--ak-cream)
- Live-prikk: lime, pulserende
- Pull-tab høyre: lime-variant
- Sticky position top: 0
- Z-index: 50

### 16.7 Notification Stream (inline editorial callout)

Aldri toast. Inline-callout som fader inn:

```
─ *Runden er lagt til. Statistikken er oppdatert.*
```

**Specs:**
- Forest accent-strek venstre
- Body Lead italic
- Fade-in 300ms, dwell 3s, fade-out
- Plasseres i flow, ikke fixed

### 16.8 Empty State

Editorial-empty (se seksjon 22).

---

## 17. Tabeller & data-display

### Editorial-tabell

```
KØLLE         CARRY        TOTAL        ±σ
─────────────────────────────────────────────
Driver        242m         263m         8m
3W            220m         240m         7m
5W            205m         225m         6m
4i            183m         201m         9m
```

**Specs:**
- Ingen vertikale gridlines
- Header: Tiny (10px Geist caps tracking 0.1em), border-bottom 1px ink
- Row: Geist 15px, border-bottom 1px var(--ak-border) (subtilt)
- Numeric celler: JetBrains Mono tabular-nums, right-aligned
- Text celler: Geist 400, left-aligned
- Padding: 12px 16px per celle
- Hover row: bg var(--ak-muted) 50% alpha

### Sortable header

```
KØLLE ▲       CARRY ↕       TOTAL ↕       ±σ ↕
```

**Specs:**
- Sort-ikon: ChevronUp/ChevronDown ved aktiv kolonne
- Inaktiv kolonne: dempet ChevronsUpDown
- Hover header: forest text color

### Filterable

Filter-chips over tabellen (se 15.9).

### Empty rows

```
─ *Ingen runder logget enda.*
```

I tabell-stil men italic.

---

## 18. Chart-bibliotek

Alle charts har **pen-and-ink-stil** — håndtegnet feel, ikke perfekt geometrisk.

### 18.1 Line chart

```
4,5 ●
    ╲
    ●─●
       ╲
        ●────●─●
              ╲
               ●────●
                     ╲
                      ●─●  4,2
```

**Specs:**
- Stroke 2px forest, stroke-linecap round, stroke-linejoin round
- Punkter: 6px sirkel forest fyll
- Y-akse: kun start/slutt-verdier, ingen full akse
- X-akse: månedsforkortelser i JetBrains Mono caption
- Ingen gridlines
- Hover: tooltip med dato + verdi
- Animation: stroke-dashoffset draw-in 1200ms

### 18.2 Bar chart (vertikal)

Brukes sjelden — vi foretrekker horizontal bars.

### 18.3 Bar chart (horizontal)

```
OTT    ████████████  +0,42
APP    ███          −0,18
ARG    ████████████████  +0,67
PUTT   ██████████████████████  +0,93
```

**Specs:**
- Bar høyde: 24-32px
- Bar fyll: pyramide-farge eller forest gradient
- Label venstre: Tiny (10px Geist caps)
- Verdi høyre: JBM 14-16px tabular-nums
- Spacing mellom bars: 12px
- P50 midt-linje (valgfritt): hairline ink-stroke

### 18.4 Stacked bar (pyramide-volum)

```
[FYS 12%][TEK 28%][SLAG 31%][SPILL 19%][TURN 10%]
```

Se 15.6 Pyramide Bar.

### 18.5 Donut chart

Brukes sparsomt — kun for kategori-fordeling.

**Specs:**
- Donut-tykkelse: 24-32px (innerRadius 60% av outerRadius)
- 5 segmenter med pyramide-farger
- Senter: Stat Hero med totaltall
- Legend over/under, ikke i sirkel

### 18.6 Heatmap (krysstabell)

```
         FYS   TEK   SLAG  SPILL TURN
TEE      ▓░░   ▓▓▓   ████  ▓▓░   ░░░
INN200   ▓░░   ▓▓░   ▓▓▓   ▓░░   ░░░
INN150   ░░░   ▓▓▓   ████  ▓▓░   ░░░
...
```

**Specs:**
- Celle: 40-56px firkant
- 6 fargesteg: cream → lime → olive → forest → forest-deep
- 0-minutter celle: cream (ingen data-feel)
- 180+ minutter celle: forest-deep med hvit tekst
- Hover: scale(1.02), tooltip
- Click: åpne detalj-panel

### 18.7 Sparkline

7-30 punkter, 60-120px bred, 24px høy. Se 15.7.

### 18.8 Scatter plot (Trackman dispersion)

```
        ●
     ●    ●
   ●  ●●  ●
   ●  ●●●● ●
     ●●●●●
       ●●●●
         ●
```

**Specs:**
- Punkter: 4px sirkel forest fyll
- Tetthet: hot-spots med radial-gradient (forest fade)
- Akser: kun verdier på ekstremene
- Optional: PGA-baseline som backdrop (lyseblå 12% alpha)

### 18.9 Fatigue curve

Linje + 5-slag rolling average overlay + inflection-markør.

**Specs:**
- Råpunkter: 4px sirkler, dempet forest
- Rolling-avg: 2px forest solid
- Inflection-punkt: vertikal lime-strek + label "slag 35"
- Target-linje: hairline ink stroke horisontal

### 18.10 Tooltip på chart

Fade + scale-pop animasjon.

```
┌─────────────────────────┐
│  *15. mai 2026*         │
│  HCP 4,3                │
│  12 økter denne uka     │
└─────────────────────────┘
```

**Specs:**
- Bakgrunn: var(--ak-ink)
- Tekst: var(--ak-cream)
- Padding: 12px 16px
- Radius: var(--radius-md) = 8px
- Shadow: shadow-3
- Pil under tooltip: 6px ink trekant
- Animasjon: scale(0.96) → 1.0, fade 200ms
- Posisjon: follow-mouse med offset +18, -72

---

## 19. Skjemaer & inputs

### 19.1 Text input

```
NAVN
┌────────────────────────────────────┐
│  Markus Røinås Pedersen            │
└────────────────────────────────────┘
*Helst fullt navn — vi viser fornavn i UI.*
```

**Specs:**
- Label: Tiny (10px Geist caps tracking 0.1em)
- Input padding: 12px 16px
- Input font: Geist 16px (forhindrer iOS-zoom)
- Border: 1px solid var(--ak-border)
- Background: var(--ak-card)
- Radius: var(--radius-md) = 8px
- Focus: border 2px forest, no other change
- Helper: Annotation (13px IS italic) under input

#### States

| State | Visuell |
|---|---|
| Default | 1px border |
| Focus | 2px forest border |
| Filled | Same as default, value present |
| Error | 2px destructive border, error-tekst i italic |
| Disabled | 50% opacity, bg var(--ak-muted) |
| Loading | Spinner inline høyre + "Sjekker..." |

### 19.2 Select / Dropdown

```
PYRAMIDE
┌────────────────────────────────────┐
│  TEK                          ▾   │
└────────────────────────────────────┘
```

**Specs:**
- Samme som text input + ChevronDown 16px høyre
- Dropdown-meny: shadow-3, radius-md, max-h 320px scrollable
- Items: Geist 14px, padding 12px 16px, hover bg muted

### 19.3 Søkefelt

```
┌────────────────────────────────────┐
│  🔍  *Søk drills, økter, spillere...*  │
└────────────────────────────────────┘
```

**Specs:**
- Lucide `Search` 16px venstre
- Placeholder italic Instrument Serif (unik for søk)
- Clear-knapp (`X` 14px) når tekst er skrevet
- Esc lukker, Enter aktiverer

### 19.4 Date input

```
DATO
┌────────────────────────────────────┐
│  📅  17.05.2026                    │
└────────────────────────────────────┘
```

**Specs:**
- Lucide `Calendar` 16px venstre
- Value: JetBrains Mono 14px tabular-nums
- Klikk åpner kalender-popup (se 21.2)

### 19.5 Toggle / Switch

```
SIMPLE         ●─────○        AVANSERT
```

**Specs:**
- Track: 44px bred, 24px høy, radius pill
- Thumb: 20px sirkel
- Off: track bg var(--ak-muted), thumb venstre
- On: track bg var(--ak-forest), thumb høyre
- Animation: 200ms ease-in-out
- Labels på siden i Geist 13px

### 19.6 Checkbox

```
☐  Godkjenn vilkår
☑  Godkjenn vilkår
```

**Specs:**
- Box: 18px × 18px, 1px border, radius-sm
- Active: bg forest, check-ikon cream
- Label: Geist 14px, 12px gap

### 19.7 Radio

```
●  Pro 300 kr/mnd
○  Gratis
```

**Specs:**
- Sirkel: 18px, 1px border
- Active: indre 8px forest dot

### 19.8 Slider

```
Distanse: 150m
[──────●──────────]
50m              250m
```

**Specs:**
- Track: 4px høy, bg muted
- Aktiv-spor: forest
- Thumb: 20px sirkel, forest fyll, 2px cream ring
- Verdi over thumb: JBM 14px
- Endpoints: Tiny (10px Geist caps)

### 19.9 Textarea

Som text input men min-h 96px, max-h 240px scrollable.

### 19.10 Form layout

```
SEKSJON-TITTEL ITALIC

  Felt 1
  Felt 2

SEKSJON-TITTEL ITALIC

  Felt 3
  Felt 4

  [Avbryt]    [Send →]
```

**Specs:**
- Seksjon-tittel: Subhead (24-28px IS italic)
- Felt-spacing: 24px mellom felter
- Seksjons-spacing: 64px
- CTA-rad: høyre-aligned, primary + secondary

---

## 20. Navigasjon

### 20.1 Top nav (masthead)

Se 16.2.

### 20.2 Sidebar TOC

Se 16.3.

### 20.3 Breadcrumbs

```
SG Hub  /  Markus  /  7-jern
```

**Specs:**
- Font: Tiny (10px Geist caps tracking 0.1em)
- Separator: `/` med 8px padding
- Hover: forest underline
- Aktiv (siste): full color, ingen lenke

### 20.4 Tab bar (segmented control)

```
[ Oversikt ]  [ Krysstabell ]  [ Trender ]  [ SG ]
```

**Specs:**
- Pill-form container med 4px padding
- Background: var(--ak-muted)
- Aktiv tab: bg forest, text cream
- Inaktiv: ingen bg, text muted-fg
- Padding: 8px 16px per tab
- Animation: aktiv-marker glir 300ms

### 20.5 Tab bar (editorial)

```
OVERSIKT    KRYSSTABELL    TRENDER    SG-KOBLING
─────────   ──────────     ──────     ──────────
   ●
```

**Specs:**
- Tabs: Geist 500 13px uppercase tracking 0.08em
- Hairline under aktiv tab (2px forest)
- Spacing: 32px mellom tabs

### 20.6 Pagination (magazine-style)

```
← Forrige utgave   ·   Utgave 047 av 052   ·   Neste utgave →
```

**Specs:**
- Font: Tiny + JBM for nummer
- Pull-tab venstre/høyre med ArrowLeft/Right

---

## 21. Modaler & overlays

### 21.1 Modal (page-flip)

```
[Backdrop blur]
   ┌─────────────────────────────────────┐
   │  [×]                                │
   │                                     │
   │  HEADLINE ITALIC                    │
   │                                     │
   │  Body content...                    │
   │                                     │
   │  [Avbryt]            [Bekreft →]    │
   └─────────────────────────────────────┘
```

**Specs:**
- Backdrop: var(--ak-ink) 60% alpha + backdrop-blur(8px)
- Modal: bg var(--ak-card), radius-xl (16px), shadow-3
- Max-bredde: 480-640px (S/M), 768px (L)
- Padding: 32-48px
- Close: ChevronLeft eller X 24px top-left
- Animation: scale(0.96 → 1.0), fade 300ms

### 21.2 Date picker popup

```
        MAI 2026
   ┌─────────────────────────┐
   │  M T O T F L S          │
   │           1 2 3 4       │
   │  5 6 7 8 9 10 11        │
   │  12 13 14 15 16 ●17 18  │   (i dag highlighted)
   │  19 20 21 22 23 24 25   │
   │  26 27 28 29 30 31      │
   └─────────────────────────┘
```

**Specs:**
- Container: bg card, radius-md, shadow-3
- Header: måned + ←→ nav
- Grid: 7 col, 32px hver dag
- Aktiv dag: forest fyll, cream tekst
- Today: lime-prikk markør
- Hover: bg muted

### 21.3 Sliding side-panel

For detalj-paneler (Krysstabell-klikk på celle):

**Specs:**
- Slide fra høyre med transform translateX
- Bredde: 400-480px
- Padding: 32-48px
- Shadow: shadow-3 venstre
- Esc lukker
- Animation: 300ms ease-out

### 21.4 Dropdown menu (kontekstmeny)

**Specs:**
- Container: bg card, radius-md, shadow-3
- Min-bredde: 200px
- Items: padding 10px 16px, Geist 14px
- Separator: 1px hairline mellom grupper
- Aktiv item: bg muted
- Animation: scale(0.96 → 1.0), fade 200ms

---

## 22. Empty / loading / error

### Empty state

```
┌──────────────────────────────────────┐
│                                      │
│  STATISTIKK                          │
│                                      │
│  *Ingen runder enda.*                │
│                                      │
│  Når du logger den første runden,    │
│  åpner statistikken seg.             │
│                                      │
│  [Logg første runde →]               │
│                                      │
└──────────────────────────────────────┘
```

### Loading (skeleton)

```
┌──────────────────────────────────────┐
│   ██████████                         │
│                                      │
│   ████████████████████               │
│   *████████ ███████████.*            │
│                                      │
│   ███████████████████ ████████       │
│   ██████████ ██████ ████████.        │
└──────────────────────────────────────┘
```

**Specs:**
- Cream rektangler med opacity 0.6 → 1.0 i 1200ms loop
- Bredder varierer per linje (autentisk content-skeleton)
- Aldri spinner

### Error 500

```
*Noe har sviktet i trykkeriet.*

Vi jobber med saken. Prøv igjen om et øyeblikk.

[Last på nytt →]    [Meld feil]
```

### 404

```
404 — UTGAVE FANT IKKE

*Siden eksisterer ikke i denne utgaven.*

Kanskje du leter etter:
↳ Dashboard
↳ Trening
↳ Mål
```

### Success / confirmation

Aldri toast. Inline editorial-callout (se 16.7).

---

## 23. Marginalia & annotasjoner

Se seksjon 15.5 for Data Annotation-spec.

### 4 typer marginalia

1. **Pen-and-ink annotation** — italic-tekst med pil til datapunkt
2. **Dato-stempel** — Tiny Geist caps i margen
3. **Kolofon-fragment** — utgave-info ved siden av spread
4. **Coach-hånd** — kort italic ved siden av datablokk, som om coach noterte

### SVG-pil eksempel

```html
<svg viewBox="0 0 200 100" stroke="currentColor" stroke-width="1.5" fill="none">
  <path d="M 20 20 Q 50 35 100 50 L 105 45 M 100 50 L 92 48"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-dasharray="200"
        stroke-dashoffset="200">
    <animate attributeName="stroke-dashoffset" to="0" dur="1200ms" fill="freeze" />
  </path>
  <text x="20" y="14" font-family="Instrument Serif" font-style="italic" font-size="13">
    her er flyttreknningen
  </text>
</svg>
```

---

## 24. Microcopy-bibliotek

Standardiserte formuleringer for vanlige situasjoner.

### Bekreftelser

| Default | Editorial |
|---|---|
| "Are you sure?" | *"Helt sikker?"* |
| "Confirm deletion" | *"Slett — det går ikke å angre"* |
| "Saved successfully" | *"Bevart. Innholdet er oppdatert."* |
| "Changes discarded" | *"Avbrutt. Ingenting endret."* |

### Tomme states

| Kontekst | Tekst |
|---|---|
| Ingen runder | *"Ingen runder enda. Når du logger den første, åpner statistikken."* |
| Ingen meldinger | *"Innboksen er tom. Anders kommer tilbake."* |
| Ingen turneringer | *"Ingen kommende turneringer registrert."* |
| Ingen drills i økt | *"Ingen drills lagt til ennå."* |
| Ingen utstyr | *"Bag-en er tom. Legg til kølla di for å få fitting-anbefalinger."* |
| Ingen coach | *"Du har ingen tilknyttet coach ennå."* |

### Loading

| Kontekst | Tekst |
|---|---|
| Generic | *"Henter utgaven."* |
| Saving | *"Lagrer..."* |
| Sending | *"Sender..."* |
| Uploading photo | *"Laster opp..."* |
| Generating PDF | *"Trykker PDF..."* |

### Errors

| Kontekst | Tekst |
|---|---|
| Network | *"Mistet kontakt med server. Sjekk internett."* |
| 500 | *"Noe har sviktet i trykkeriet."* |
| 404 | *"Siden eksisterer ikke i denne utgaven."* |
| 403 | *"Du har ikke tilgang til denne utgaven."* |
| Validation | *"Sjekk feltene — noe må endres."* |

### Notifications (inline)

| Hendelse | Tekst |
|---|---|
| Runde lagt til | *"Runden er lagt til. Statistikken er oppdatert."* |
| Økt fullført | *"Økt fullført. 4 drills loggført."* |
| Coach-melding | *"Anders har lagt igjen en kommentar."* |
| Plan oppdatert | *"Planen er justert. Neste økt: i morgen 16:00."* |

---

## 25. Numerisk formatering

### Locale: nb-NO

```js
new Intl.NumberFormat("nb-NO", { ... })
```

### Formater

| Type | Format | Eksempel |
|---|---|---|
| HCP | 1 desimal komma | `4,2` |
| SG-verdi | Fortegn + 2 desimal komma | `+2,92` `−0,93` |
| Prosent | Heltall + % | `78%` |
| Penger | Tusenskille NBSP + " kr" | `12 500 kr` |
| Avstand (m) | Heltall + "m" | `150m` `13 188m` |
| Avstand (yds) | Heltall + "y" | `175y` |
| Tid (min) | Heltall + "min" | `75 min` |
| Tid (h+min) | "Xt Ymin" | `1t 47min` |
| Dato (kort) | DD.MM.YYYY | `17.05.2026` |
| Dato (lang) | "DD. mnd YYYY" | `17. mai 2026` |
| Tid | HH:MM 24-t | `08:14` |
| Datointervall | "kort → kort" | `17.05 → 22.05` |
| Tall stort | NBSP-tusenskille | `13 188` |

### Minustegn

Bruk typografisk minustegn `−` (U+2212), ikke hyphen `-`.

```js
const minustegn = "−";
const formatted = value < 0 ? `${minustegn}${Math.abs(value)}` : `+${value}`;
```

---

## 26. Responsiv tenkning

### Breakpoints

| Bredde | Navn | Kontekst |
|---|---|---|
| <768px | Mobile | Spilleren mellom slag |
| 768-1023px | Tablet | Spilleren etter økt |
| 1024-1439px | Laptop | Coach på kontor |
| 1440px+ | Desktop | Stort skjerm |

### Mobile-tilpasninger

- Cover-tittel: 56-72px (var 112)
- Body: 17px (var 19)
- Spreads stables vertikalt (8+4 → 12, 12)
- Marginalia flyttes inline under elementet
- Drop caps: 4× body (var 5×)
- Photo aspect: prefer 4:5 over 3:2
- Pull-tabs: full-width hvis primary

### Aldri

- Hamburger-meny som primær desktop-nav
- "View in app"-banner på mobil
- Hide critical info bak "see more"

---

## 27. Accessibility

### Kontrast (minimum 4.5:1)

| Kombinasjon | Ratio |
|---|---|
| Ink #0A1F17 på cream #FAFAF7 | 16:1 (AAA) |
| Muted-fg #5E5C57 på cream | 5.7:1 (AA) |
| Cream #FAFAF7 på forest #005840 | 9.5:1 (AAA) |
| **Ink #0A1F18 på lime #D1F843** | **11:1 (AAA)** — NB mørk tekst på lime alltid |
| Cream på forest-deep #0F2A22 | 14:1 (AAA) |

### Semantisk hierarki

- `<h1>` = Cover-tittel (én per skjerm)
- `<h2>` = Spread-tittel
- `<h3>` = Undertittel innen spread
- `<blockquote>` med `<cite>` = pull quote
- `<dl>` med `<dt>` (label) + `<dd>` (tall) = stat block
- `<figure>` + `<figcaption>` = photo med caption
- `<aside>` = marginalia og annotasjoner

### Tastatur

- Alle interaktive `tab`-fokuserbare
- Focus-ring: 2px forest, offset 2px (ikke default-blå)
- ⌘K åpner palette globalt
- Esc lukker palette/modaler
- Pull-tab og card-lenker: Enter aktiverer

### Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
  /* Count-up viser sluttverdi direkte */
  /* Stroke-dashoffset starter på 0 */
}
```

### Skjermlesere

- Drop cap har `aria-hidden="true"` og første bokstav dupliseres som
  `.sr-only` i selve paragrafen
- Decorative ikoner: `aria-hidden="true"`
- Funksjonelle ikoner: `aria-label="..."`

---

## 28. Anti-patterns

| Mønster | Hvorfor feil |
|---|---|
| 4×3 dashboard-grid | Sterilt, AI-feel, ingen hierarki |
| Centered hero med subtitle | For SaaS-marketing |
| "Welcome back, [Name] 👋" | Chummy, generic |
| Toast notifications | Magasiner har ikke popups |
| Hamburger på desktop | Gjemmer struktur |
| Gradient på alle kort | Visual noise |
| Stack 3 skygger | Editorial = subtilt |
| Generic stock photos | Brytes umiddelbart |
| Smiley-fjes ikoner | Aldri |
| Confetti / celebration-anim | Consumer-app |
| Auto-roterende karusell | Magasin-lesning er ikke slik |
| "Get started" CTA | Generic — vi sier "Sett i gang →" |
| Light grey placeholder-bokser | Bruk typografi eller forest |
| Spinner-loading | Skeleton i editorial-form |
| Pure black dark mode | Vi har deep forest |
| Italic på alt | Italic er reservert |
| Geist bold i body | Body aldri over 500 |
| Lime på 3 ting | Lime maks 1/skjerm |
| Default-blå focus-ring | Forest, alltid |
| Decimal punktum (4.2) | Komma alltid (4,2) |

---

## 29. Code-konvensjoner

### CSS-variabler øverst

```css
:root {
  /* Brand */
  --ak-cream: #FAFAF7;
  --ak-cream-warm: #F5EFE2;
  --ak-cream-cool: #EEF0EC;
  --ak-newsprint: #ECE9DF;
  --ak-ink: #0A1F17;
  --ak-forest: #005840;
  --ak-forest-deep: #003B2A;
  --ak-bone: #F5F4EE;
  --ak-lime: #D1F843;
  --ak-muted: #F1EEE5;
  --ak-muted-fg: #5E5C57;
  --ak-border: #E5E3DD;
  --ak-card: #FFFFFF;
  --ak-destructive: #A32D2D;

  /* Pyramide */
  --pyramide-fys: #003B2A;
  --pyramide-tek: #005840;
  --pyramide-slag: #2A7D5A;
  --pyramide-spill: #B7C97D;
  --pyramide-turn: #D1F843;

  /* Status */
  --status-success: #16A34A;
  --status-warn: #B8852A;
  --status-danger: #A32D2D;
  --status-info: #2563EB;

  /* Typografi */
  --font-display: "Instrument Serif", Georgia, serif;
  --font-body: "Geist", -apple-system, sans-serif;
  --font-mono: "JetBrains Mono", "SF Mono", monospace;

  /* Radius */
  --radius-xs: 2px;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-pill: 999px;

  /* Shadow */
  --shadow-1: 0 1px 2px rgba(10, 31, 23, 0.04);
  --shadow-2: 0 2px 8px rgba(10, 31, 23, 0.06);
  --shadow-3: 0 8px 24px rgba(10, 31, 23, 0.08);
  --shadow-4: 0 16px 48px rgba(10, 31, 23, 0.12);

  /* Motion */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out-slow: cubic-bezier(0.22, 1, 0.36, 1);
  --duration-instant: 100ms;
  --duration-fast: 200ms;
  --duration-medium: 400ms;
  --duration-slow: 800ms;
  --duration-cinema: 1200ms;
}
```

### Body baseline

```css
body {
  background: var(--ak-cream);
  color: var(--ak-ink);
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.6;
  font-variant-numeric: oldstyle-nums;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.tabular {
  font-variant-numeric: tabular-nums slashed-zero;
  font-family: var(--font-mono);
}

.italic {
  font-family: var(--font-display);
  font-style: italic;
}
```

### Tailwind-utility-eksempler

```html
<!-- Eyebrow -->
<p class="font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--ak-muted-fg)]">
  AK GOLF HQ · UTGAVE 047 · LØRDAG 17. MAI 2026 · 08:14
</p>

<!-- Cover-tittel -->
<h1 class="font-display text-[112px] leading-none">
  Markus — <em class="font-normal italic">nesten i mål.</em>
</h1>

<!-- Stat block -->
<div>
  <p class="font-mono text-[112px] leading-none tabular-nums slashed-zero">4,2</p>
  <p class="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--ak-muted-fg)] mt-2">
    HCP 17. MAI
  </p>
  <p class="font-display italic text-[14px] mt-6 max-w-xs">
    Ned 1,8 slag siden januar. Beste 12-måneders progresjon på fire år.
  </p>
</div>

<!-- Pull quote -->
<blockquote class="relative pl-8 my-24">
  <span class="absolute left-0 top-2 h-24 w-1 bg-[var(--ak-forest)]"></span>
  <p class="font-display italic text-[44px] leading-tight">
    "Du må slutte å treffe putt med hendene. Det er hofta som styrer."
  </p>
  <cite class="not-italic block mt-6 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--ak-muted-fg)]">
    — ANDERS KRISTIANSEN, COACH · 16. MAI
  </cite>
</blockquote>

<!-- Pull-tab primary -->
<button class="inline-flex items-center gap-2 h-10 px-5 rounded-full
               bg-[var(--ak-forest)] text-[var(--ak-cream)]
               font-medium text-[14px]
               hover:scale-[1.02] hover:shadow-[var(--shadow-2)]
               transition-all duration-[var(--duration-fast)]
               focus:outline-none focus:ring-2 focus:ring-[var(--ak-forest)] focus:ring-offset-2">
  Sett i gang
  <svg class="w-4 h-4" stroke="currentColor"><!-- ArrowRight --></svg>
</button>
```

---

## 30. Output-spec & sjekkliste

### Per skjerm, lever:

1. **Komplett HTML-fil**
   - Inline CSS (Tailwind CDN OK)
   - Inline Lucide-ikoner som SVG
   - Google Fonts CDN-import
   - CSS-variabler øverst (seksjon 29)

2. **Viewport 1440×900** (eller 375×812 hvis mobile spesifisert)

3. **Realistiske data:**
   - Markus Røinås Pedersen, 16 år, HCP 4,2
   - Anders Kristiansen, coach
   - GFGK (hjemmebane), Bossum (Olyo Cup-bane)
   - Olyo Cup 13.-15. juni 2026
   - Onsdag 17. mai 2026, kl 08:14

4. **Norsk locale** — alle tall, datoer, locale-spesifikke patterns

5. **Page-load koreografi** fungerer (sekvensiell fade-in seksjon 9)

6. **Command palette ⌘K** med 20+ kommandoer i kategorier

7. **Spread-arketyper kombinert** — minst 3 ulike per skjerm

8. **Marginalia på minst 2 steder** — dato-stempel, annotation, coach-hånd

9. **Etter levering** — kort oppsummering (<200 ord):
   - 3 designvalg som styrker skjermen
   - Hva ville blitt løftet i neste iterasjon
   - Hva du er usikker på

### Akseptanse-sjekkliste

#### Struktur
- [ ] Cover øverst (eyebrow + italic-tittel + lead)
- [ ] Min 3 ulike spread-arketyper
- [ ] Min 1 pull-quote (The Quote)
- [ ] Asymmetrisk layout (ikke 4×3 grid)
- [ ] Footer/kolofon nederst

#### Typografi
- [ ] Instrument Serif italic på min 3 steder
- [ ] Drop cap på Lead Body
- [ ] Geist body aldri over 500
- [ ] JBM tabular-nums slashed-zero på alle tall
- [ ] Norsk komma + NBSP-tusenskille
- [ ] +/− med typografisk minustegn

#### Farge
- [ ] Cream-bakgrunn (ikke pure white)
- [ ] Forest green som signatur
- [ ] Maks 1 lime-flate
- [ ] TURN-tekst alltid mørk (#0A1F18)

#### Innhold
- [ ] Eyebrow med utgave + dato + tid
- [ ] Lead-paragraf maks 60 ord
- [ ] Editorial tone — ingen "Velkommen tilbake!"
- [ ] Pull-tab med editorial-verb

#### Foto
- [ ] Min 1 photo eller typografi-hero
- [ ] Caption italic museum-stil

#### Interaktivitet
- [ ] Page-load koreografi sekvensiell
- [ ] Count-up på primær-KPI
- [ ] Stagger fade-up på cards
- [ ] Annotation-piler tegnes inn
- [ ] Hover-states på alle klikkbare
- [ ] ⌘K palette med 20+ kommandoer

#### Marginalia
- [ ] Min 1 av: dato-stempel / annotation / coach-hånd

#### Empty/error
- [ ] Hvis empty: editorial-tekst
- [ ] Hvis loading: skeleton i editorial-form

#### A11y
- [ ] Kontrast min 4.5:1 på all tekst
- [ ] Headings i logisk hierarki
- [ ] Focus-ring forest (ikke default-blå)
- [ ] Reduced-motion respektert
- [ ] ⌘K + Esc tastatur fungerer

#### Anti-AI
- [ ] Spread-bredder varierer
- [ ] Padding varierer per seksjon
- [ ] Ikke centered alt
- [ ] Ikke symmetrisk venstre/høyre

---

**Slutten av design.md.**

Velg spread-arketyper, hent realistisk data, bygg en utgave. Hvis du er i
tvil — spør: *"Hadde dette stått i et magasin om elite-golf?"*
