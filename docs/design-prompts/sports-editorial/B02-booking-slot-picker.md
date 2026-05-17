# Prompt: Booking Calendar / Slot-picker — Sports Editorial × 3 enheter

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
6. Lagre som `_outputs/B02-booking-slot-picker.html`

---

## PROMPT (kopier alt under denne linjen)

Du er senior visuell designer som spesialiserer seg på Sports Editorial design
— magasin-redaksjon kombinert med performance-data for elite-coaching. Du
designer nå **Booking Slot-picker** — siden hvor en ekstern kunde, som
allerede har valgt "Privat-coaching 60 min", skal **velge tid hos Anders de
neste 2-3 ukene**. Tonen er **konsiert reservasjonsguide møter redaksjonell
tidsplan**: tenk *"Programside i et golfmagasin — datoer som faste spalter,
klokkeslett som setlister"* snarere enn ren bookings-widget.

Du har akkurat fått hele design-systemet (over). Følg det strengt:
- Italic Instrument Serif er hovedstemme (dato-headlines, "*Mandag 18. mai*",
  marginalia, periode-overganger)
- Typografi-glyfer som ikoner (ikke SVG-tegninger). Klokkeslett settes som
  rene tall i JetBrains Mono, opptatt/borte vises som tekst-glyfer
- Workshop-arketypen er sentral (trinn-for-trinn boking) kombinert med en
  Atlas-light tidsplan (dato-spalter som referansetabell)
- Cream Cool #EEF0EC som spread-bakgrunn for selve slot-grid-en (Workshop-
  flate). Cream Standard på resten
- Forest green som signatur — valgt slot, accent-strek på sticky-summary,
  primær CTA. Lime KUN på "Få ledige plasser igjen"-markering for kveldsslot
  på populær dag (maks 1/skjerm)
- Norsk locale (komma desimal, ikke-brytbar mellomrom, "kl 09:00",
  "1 500 kr", "18. mai")
- Editorial tone — observerende italic-fragmenter ("*Mandag 18. mai*",
  "*Anders er på Norges Cup denne helgen*"), aldri "Select a date" eller
  "Available times"

# SKJERM: Booking Slot-picker (3 enheter)

URL: `/booking/privat-coaching-60/velg-tid`

## Demo-bruker (faktiske data)

**Ekstern kunde** — ikke innlogget i PlayerHQ, kommer fra `akgolf.no` etter
å ha valgt "Privat-coaching 60 min" fra tjeneste-katalogen.

Brukerspørsmål når kunden lander på siden:
*"Når har Anders ledig tid de neste 2 ukene som passer meg?"*

Tone: Dette er ikke en kunde Anders kjenner. Tonen skal være **innbydende +
kompetent + tydelig**: kunden skal føle at de booker en time hos en
eliteatlet-coach, ikke fyller ut et OpenTable-skjema. Editorial-DNA-en gjør
at bookingen føles som å bla i en spalte, ikke som å klikke i et grid.

## Realistiske data å bruke

- **I dag:** Søndag 17. mai 2026, kl 14:32
- **Valgt tjeneste:** Privat-coaching 60 min · 1 500 kr · GFGK Range
- **Bookings-vindu:** Neste 14 dager (man 18.05 → søn 31.05)
- **Default lokasjon:** GFGK Range
- **Alternativ lokasjon:** Mulligan Indoor Golf (Fredrikstad sentrum)
- **Filtre:** Tid på dagen (morgen <12, ettermiddag 12-17, kveld 17+),
  ukedager/weekend

### Ledige slots dag-for-dag (14-dagers vindu)

| Dato | Ukedag | Status | Ledige slots | Spesial |
|---|---|---|---|---|
| 17.05 | Søn | I DAG | — | Grunnlovsdag — borte |
| 18.05 | Man | Ledig | 09:00, 11:00, 13:30, 16:00 | — |
| 19.05 | Tir | Knapt | 10:00, 14:30 | Kun 2 ledige |
| 20.05 | Ons | Ledig | 09:00, 11:30, 14:00, 17:00 | — |
| 21.05 | Tor | BORTE | — | *Norges Cup-prep med Øyvind* |
| 22.05 | Fre | Ledig | 10:00, 13:00, 15:30 | — |
| 23.05 | Lør | BORTE | — | *Norges Cup R1, Hauger GK* |
| 24.05 | Søn | Ledig | 11:00, 14:00, 16:30 | — |
| 25.05 | Man | Ledig | 09:00, 11:30, 14:00, 16:30 | — |
| 26.05 | Tir | Ledig | 10:00, 13:00, 15:30, 18:00 | 18:00 = siste kveldsslot (LIME-markering) |
| 27.05 | Ons | Knapt | 09:00, 14:00 | Kun 2 ledige |
| 28.05 | Tor | Ledig | 10:00, 12:30, 15:00, 17:30 | — |
| 29.05 | Fre | Ledig | 09:00, 11:00, 14:00 | — |
| 30.05 | Lør | BORTE | — | *Junior-camp GFGK* |
| 31.05 | Søn | Ledig | 11:00, 14:30 | — |

**Slot-varighet:** 60 min · slots starter på kvarter (00, 15, 30, 45)
**Default valgt slot ved load:** ingen (Anders aktiv "Velg en tid" tilstand)
**Eksempel valgt slot for visning:** Man 18.05 · 11:00 (vises som valgt
state — forest-fyll, hvit tekst)

### Tjeneste-oppsummering (sticky topp)

```
PRIVAT-COACHING 60 MIN · 1 500 KR · GFGK RANGE · STEG 2 AV 4
```

### Editorial tone — booking-perspektiv (åpningslinjer)

- *"Mandag 18. mai. Anders første ledige time."*
- *"En kvarter igjen kveldsslot tirsdag."*
- *"Anders er på Norges Cup denne helgen."*
- *"To uker frem. Når passer det deg?"*

---

## STRUKTUR — 4 spreads kombinert

Booking-tonen er **trinn + program + kuratert**. Workshop-arketypen
(Cream Cool, trinn-for-trinn-stemning) er ankeret, men tilpasset slot-grid.
Atlas-light brukes for dato-spalter (uten gridlines, hairline-rader).

Bruk **4 spread-arketyper** fra design.md seksjon 12:

1. **Cover (Arketype A, variant Hverdag, kompakt)** — italic-tittel
   "*Når passer det deg?*" + steg-indikator
2. **Stat-strip (sticky topp under steg)** — tjeneste-oppsummering med
   pris, lokasjon, varighet
3. **Workshop — Slot-grid (Arketype F, sentral)** — 14 dager × klokkeslett-
   kolonner, dato-headlines i italic
4. **Field Notes (Arketype E)** — italic-fragmenter om hvorfor noen dager
   er borte ("*Anders er på Norges Cup denne helgen*") + valgt-slot-summary

Footer/kolofon nederst med "Steg 2 av 4" + "Fortsett →" sticky CTA.

---

## DESKTOP 1440×900

### Layout

12-col uten sidebar (booking-flow tar full bredde — kunden er fokusert på
ÉN ting). Logo-masthead øverst, steg-indikator under, sticky tjeneste-
oppsummering, Workshop slot-grid sentralt.

**Masthead (full-bredde, 64px):**

```
AK GOLF ACADEMY                                      Logg inn  ·  Hjelp
```

- Logo venstre (Geist 500 14px caps tracking 0.12em, ink-farge)
- "Logg inn" + "Hjelp" høyre (Geist 400 13px muted-fg, hairline mellom)
- Hairline-border bunn

**Steg-indikator (sticky, 56px):**

```
01  TJENESTE ────●──── 02  TID ────○──── 03  KONTAKT ────○──── 04  BEKREFT
    ✓ Privat-coaching      Du er her       
```

- 4 trinn separert av hairlines, full-bredde, padding 32px hver side
- Trinn 1 (TJENESTE): forest-prikk fylt + checkmark + label "✓ Privat-
  coaching" som italic Instrument Serif 13px
- Trinn 2 (TID): forest-prikk solid + label "Du er her" italic forest
- Trinn 3-4: muted prikk + label muted-fg
- Mellom trinn: 1px hairline forest fra trinn 1 til trinn 2, så hairline
  border etter

**Spread 1 — Cover (12-col, kompakt)**

- Eyebrow: `● AK GOLF · BOOKING · STEG 2 AV 4 · SØN 17.05 · 14:32`
  pulserende grønn live-prikk
- Cover-tittel (Instrument Serif italic, 72px — kompakt for ref-spread):
  ```
  Velg tid.
  *Når passer det deg?*
  ```
- Lead-paragraf (Geist 17px, max-width 560px):
  *"Anders' ledige timer de neste to ukene. Mandag til fredag, noen
  helgesøndager. Filtrer på tid på dagen hvis du har faste preferanser."*
- Høyre 4-col: editorial mini-stempel (i stedet for foto)
  ```
  14
  DAGER FREM I TID
  *17 ledige timer fordelt på 10 dager.*
  ```

**Spread 2 — Sticky tjeneste-oppsummering (12-col, sticky 64px under steg)**

Bakgrunn cream-warm #F5EFE2 med hairline-border bunn. Sticky position
under steg-indikator.

```
┌───────────────────────────────────────────────────────────────────────┐
│  PRIVAT-COACHING 60 MIN                            GFGK RANGE  ▾      │
│  *Anders Kristiansen · 1-1 tek-økt*                                   │
│                                              [Endre tjeneste]  1 500 kr │
└───────────────────────────────────────────────────────────────────────┘
```

- Venstre: Tjeneste-tittel Geist 500 16px + italic 13px sub-tag
- Midt: Lokasjons-velger som dropdown-knapp (Geist 500 13px tracking 0.08em
  caps + lucide chevron). Klikk åpner popover med 2 lokasjoner:
  - **GFGK Range** (default) — italic *"Driving range · Fredrikstad"*
  - **Mulligan Indoor Golf** — italic *"Trackman-bay · Fredrikstad sentrum"*
- Høyre: Pris JBM 500 18px + "Endre tjeneste"-link Geist 400 13px italic
  underline

**Spread 3 — Workshop Slot-grid (12-col, hovedinnhold)**

Bakgrunn: Cream Cool #EEF0EC (Workshop-arketype). Padding 48px topp/bunn.

**Filtre (over grid, 12-col):**

```
TIDSPUNKTER       [ALLE ●] [Morgen ○] [Ettermiddag ○] [Kveld ○]
DAGER             [ALLE ●] [Hverdager ○] [Weekend ○]
```

- 2 filter-rader: label venstre (Geist 500 11px caps tracking 0.1em
  muted-fg), segmented controls høyre med 4 (eller 3) chip-knapper
- Aktiv chip: forest fyll + bone tekst
- Inaktiv chip: cream border + ink tekst + hover cream-warm

**Slot-grid (Atlas-light, 12-col, full-bredde):**

Layout: **7 dato-kolonner per rad** (uke-rad), 2 uke-rader stables. Hver
dato-kolonne ca 160px bred. 24px gutter.

```
UKE 21 · 18. → 24. MAI
┌────────────┬────────────┬────────────┬────────────┬────────────┬────────────┬────────────┐
│ *Mandag*   │ *Tirsdag*  │ *Onsdag*   │ *Torsdag*  │ *Fredag*   │ *Lørdag*   │ *Søndag*   │
│ 18. mai    │ 19. mai    │ 20. mai    │ 21. mai    │ 22. mai    │ 23. mai    │ 24. mai    │
│            │            │            │            │            │            │            │
│ 09:00      │ 10:00      │ 09:00      │            │ 10:00      │            │ 11:00      │
│ ●11:00 ✓   │ 14:30      │ 11:30      │   BORTE    │ 13:00      │   BORTE    │ 14:00      │
│ 13:30      │            │ 14:00      │            │ 15:30      │            │ 16:30      │
│ 16:00      │            │ 17:00      │ *Norges*   │            │ *Norges*   │            │
│            │ *Knapt 2*  │            │ *Cup-*     │            │ *Cup R1*   │            │
│            │            │            │ *prep*     │            │            │            │
└────────────┴────────────┴────────────┴────────────┴────────────┴────────────┴────────────┘

UKE 22 · 25. → 31. MAI
┌────────────┬────────────┬────────────┬────────────┬────────────┬────────────┬────────────┐
│ *Mandag*   │ *Tirsdag*  │ *Onsdag*   │ *Torsdag*  │ *Fredag*   │ *Lørdag*   │ *Søndag*   │
│ 25. mai    │ 26. mai    │ 27. mai    │ 28. mai    │ 29. mai    │ 30. mai    │ 31. mai    │
│            │            │            │            │            │            │            │
│ 09:00      │ 10:00      │ 09:00      │ 10:00      │ 09:00      │            │ 11:00      │
│ 11:30      │ 13:00      │ 14:00      │ 12:30      │ 11:00      │   BORTE    │ 14:30      │
│ 14:00      │ 15:30      │            │ 15:00      │ 14:00      │            │            │
│ 16:30      │ ◆18:00     │ *Knapt 2*  │ 17:30      │            │ *Junior-*  │            │
│            │ *Siste*    │            │            │            │ *camp*     │            │
│            │ *kveld*    │            │            │            │ *GFGK*     │            │
└────────────┴────────────┴────────────┴────────────┴────────────┴────────────┴────────────┘
```

**Dato-kolonne specs:**
- Dato-header (italic Instrument Serif 22px): *"Mandag"*
- Sub-header (JBM 12px tabular caps tracking 0.05em): `18. MAI`
- Hairline mellom header og slots
- Slots stables vertikalt med 8px gap
- Slot-knapp: pill-form (radius-pill), 88px bred × 36px høy
- Slot-default: cream-warm bg + ink tekst, JBM 500 14px, hover scale(1.02)
  + forest border 1px
- Slot-valgt: forest-fyll + bone tekst + checkmark-glyf (●11:00 ✓)
- Slot-LIME-special (siste kveldsslot 26.05 18:00): lime-fyll + ink tekst +
  diamant-glyf før (◆18:00)
- "BORTE"-dag: ingen slots, italic sub-tag i muted-fg forklarer hvorfor
  ("*Norges Cup-prep*", "*Junior-camp GFGK*")
- "Knapt"-tag (Tir 19.05 + Ons 27.05): italic muted-fg under siste slot,
  "*Knapt 2 igjen*"

**Ingen vertikale gridlines mellom kolonner** — Atlas-prinsipp. 1px hairline
horisontalt under dato-header. Hver kolonne får cream bg-flate (subtilt
hover-state: cream-cool 50% alpha)

**Spread 4 — Field Notes (Kollisjons-marginalia, 8+4)**

Bakgrunn cream-warm #F5EFE2 (Field Notes-arketype). Bare hvis kunden har
valgt en slot — ellers vises tom-state istedet.

**Venstre 8-col — Valgt slot-summary (hvis slot valgt):**

```
DU HAR VALGT

*Mandag 18. mai · kl 11:00*
Privat-coaching 60 min · GFGK Range · Anders Kristiansen

  Klokkeslett        11:00 → 12:00
  Lokasjon           GFGK Range, Skogstrand 1, Fredrikstad
  Coach              Anders Kristiansen
  Pris               1 500 kr (faktureres etter timen)
  Avbestilling       Gratis frem til 24 t før

*Vi sender bekreftelse på e-post når booking er fullført. Ingen kortbetaling
nå — Anders fakturerer etter timen.*

  [Endre tid]                                 [Fortsett til kontaktinfo →]
```

- Italic Instrument Serif 32px på dato+klokkeslett
- Body 15px Geist på sub-info
- Metadata som dl/dt/dd-stil med JBM på alle tall
- Italic-sub i 14px om avbestilling

**Høyre 4-col — Caddie-marginalia:**

```
        ↘
   *Anders observerer:*

   *Mandag morgen er typisk*
   *roligst — vi får god tid*
   *til oppvarming.*

   *Bytt til Mulligan Indoor*
   *hvis været spår regn —*
   *vi tilpasser i forkant.*

   ──

   *Privat-coaching 60 min*
   *passer best hvis du har*
   *en konkret problemstilling.*

   *For helhetlig økt: vurder*
   *90 min (1 800 kr).*
```

Med SVG-pil (stroke-dashoffset 1200ms) fra teksten ned mot valgt slot i
grid-spread over.

**Tom-state (hvis ingen slot valgt):**

```
                  *Velg en tid for å fortsette.*

                  Klikk på et klokkeslett over for å se
                  full info om bookingen din.
```

Centered, italic Instrument Serif 24px + Geist 15px body.

**Kolofon nederst:**

```
AK GOLF ACADEMY · Booking · 2026 · Skogstrand 1, 1606 Fredrikstad
Avbestillingsregler · Personvern · Kontakt · post@akgolf.no
```

---

## IPAD 1024×768 (landscape)

### Layout

Top-tab nav (48px), ingen sidebar. Padding 32px hver side. Slot-grid får
**1 uke i bredden + scroll horisontalt for uke 2** (alternativ: scroll
vertikalt for stacking — vi velger horisontal scroll-snap fordi det
beholder uke-headeren synlig).

**Strategi:** 7 dato-kolonner per uke = ca 130px per kolonne på iPad
(7 × 130 + 6 × 16 gutter = 1006px, passer akkurat). 2 uke-rader stables
vertikalt.

```
┌──────────────────────────────────────────────────────────┐
│ AK GOLF ACADEMY                       Logg inn · Hjelp  │ ← 56px masthead
├──────────────────────────────────────────────────────────┤
│ 01 ●── 02 ●── 03 ○── 04 ○                              │ ← 48px steg-indikator
│ Tjeneste   Tid    Kontakt  Bekreft                       │
├──────────────────────────────────────────────────────────┤
│                                                            │
│ COVER (52px italic "Velg tid. Når passer det deg?")      │
│                                                            │
│ STICKY OPPSUMMERING (kompakt: tjeneste + pris + lokasjon)│
│ ─ PRIVAT-COACHING 60 MIN · 1 500 kr · GFGK Range ▾      │
│                                                            │
│ FILTRE (segmented controls, kompakt)                      │
│ [Alle] [Morgen] [Ettermid.] [Kveld]                       │
│                                                            │
│ SLOT-GRID UKE 21 (7 kolonner, 130px hver)                │
│ Man 18  Tir 19  Ons 20  Tor 21  Fre 22  Lør 23  Søn 24  │
│ 09:00   10:00   09:00   BORTE   10:00   BORTE   11:00   │
│ ●11:00  14:30   11:30   *Norges 13:00   *Norges 14:00   │
│ 13:30           14:00   *Cup*   15:30   *Cup R1 16:30   │
│ 16:00           17:00                                     │
│                                                            │
│ SLOT-GRID UKE 22 (7 kolonner)                            │
│ Man 25  Tir 26  Ons 27  Tor 28  Fre 29  Lør 30  Søn 31  │
│ 09:00   10:00   09:00   10:00   09:00   BORTE   11:00   │
│ 11:30   13:00   14:00   12:30   11:00           14:30   │
│ ...                                                       │
│                                                            │
│ FIELD NOTES (kompakt 2-col, hvis slot valgt)              │
│                                                            │
│ KOLOFON                                                   │
│                                                            │
├──────────────────────────────────────────────────────────┤
│ Valgt: Man 18.05 · 11:00 · 1 500 kr  [Fortsett →]       │ ← Sticky CTA 64px
└──────────────────────────────────────────────────────────┘
```

**Tilpasninger fra desktop:**
- Cover-tittel: 52px (var 72)
- Sticky-oppsummering: kompakt en linje (tittel + pris + lokasjon)
- Slot-grid: 130px kolonner (var 160), gutter 16px (var 24)
- Slot-knapp: 80px bred (var 88)
- Steg-indikator: forenklet (4 prikker + label under)
- Field Notes: vises kun hvis slot valgt, 2-col komprimert
- **Sticky bunn-CTA (64px):** vises hele tiden — venstre side "Valgt: Man
  18.05 · 11:00 · 1 500 kr" (eller "Ingen tid valgt"), høyre side primary
  pull-tab "Fortsett →" (disabled hvis ingen slot)
- Touch-targets min 44px (slot-knapp = 44px høy)

---

## IPHONE 393×852 (iPhone 15)

### Layout

Bottom tab-bar erstattes med **sticky bunn-CTA** (booking-flow har ingen
hjem-navigasjon — kunden er i én oppgave). Single column. Padding 16-20px
hver side.

**Strategi for slot-grid på iPhone:** 7 kolonner × 4-5 slots blir for trangt
(393 / 7 = 56px per kolonne — ikke nok plass til "09:00"-knapp). Vi velger
**liste-stil scroll med dato-grupper** istedet:

- Hver dato får en **dato-header** (italic Instrument Serif 22px)
- Slots stables horisontalt under headeren (2-3 per rad, wrap)
- Borte-dager kollapses til en kompakt italic-stripe
- Hele lista scroller vertikalt — kunden ser én dag av gangen i fokus

```
┌─────────────────────────┐
│ ← AK GOLF · BOOKING    │ ← 44px masthead
├─────────────────────────┤
│ ● ●── ○── ○            │ ← Mini steg-indikator
│ 1  2   3   4            │
├─────────────────────────┤
│                          │
│ ● BOOKING · STEG 2/4   │
│   SØN 17.05 · 14:32    │
│                          │
│ Velg tid.                │ ← Cover 40px
│ *Når passer det deg?*    │
│                          │
│ 14 dager frem.           │
│ *17 ledige timer.*       │
│                          │
├─────────────────────────┤
│ PRIVAT-COACHING 60 MIN  │ ← Sticky tjeneste-strip (cream-warm)
│ *1 500 kr · GFGK Range* │   Tap for å endre tjeneste/lokasjon
├─────────────────────────┤
│                          │
│ FILTRE                   │
│ ┌─────────────────────┐  │
│ │[Alle][AM][PM][Kveld]│  │ ← Tids-filter, scrollable horisontalt
│ └─────────────────────┘  │
│                          │
│ ─────                    │
│                          │
│ *Mandag*                 │ ← Dato-header italic 22px
│ 18. mai · *Anders'*      │
│ *første ledige time*     │
│                          │
│  [09:00] [●11:00 ✓]     │ ← Slot-pills, valgt i forest
│  [13:30] [16:00]         │
│                          │
│ ─────                    │
│                          │
│ *Tirsdag*                │
│ 19. mai · *Knapt 2*      │
│                          │
│  [10:00] [14:30]         │
│                          │
│ ─────                    │
│                          │
│ *Onsdag*                 │
│ 20. mai                  │
│                          │
│  [09:00] [11:30]         │
│  [14:00] [17:00]         │
│                          │
│ ─────                    │
│                          │
│ *Torsdag 21. mai*        │ ← Kompakt borte-stripe
│ *Anders på Norges Cup-*  │
│ *prep med Øyvind*        │
│                          │
│ ─────                    │
│                          │
│ *Fredag*                 │
│ 22. mai                  │
│                          │
│  [10:00] [13:00]         │
│  [15:30]                 │
│                          │
│ ─────                    │
│                          │
│ *Lørdag 23. mai*         │ ← Kompakt borte-stripe
│ *Norges Cup R1, Hauger*  │
│                          │
│ ─────                    │
│                          │
│ *Søndag*                 │
│ 24. mai                  │
│                          │
│  [11:00] [14:00] [16:30] │
│                          │
│ ━━━━━ UKE 22 ━━━━━       │ ← Uke-skille hairline
│                          │
│ *Mandag*                 │
│ 25. mai                  │
│                          │
│  [09:00] [11:30]         │
│  [14:00] [16:30]         │
│                          │
│ ─────                    │
│                          │
│ *Tirsdag*                │
│ 26. mai                  │
│                          │
│  [10:00] [13:00]         │
│  [15:30] [◆18:00]        │ ← LIME-markering på siste kveld
│  *Siste kveldsslot*      │
│                          │
│ ─────                    │
│                          │
│ ... (resten av uke 22)   │
│                          │
│ ─────                    │
│                          │
│ FELTNOTATER · CADDIE     │
│                          │
│ *Anders observerer:*     │
│                          │
│ *Mandag morgen er typisk*│
│ *roligst — god tid til*  │
│ *oppvarming.*            │
│                          │
│ *Bytt til Mulligan*      │
│ *Indoor hvis regn.*      │
│                          │
│ KOLOFON                  │
│                          │
├─────────────────────────┤
│ Man 18.05 · 11:00       │ ← Sticky bunn-CTA 72px
│ 1 500 kr                 │   To linjer: valgt slot + pris
│ [Fortsett til kontakt →] │   Primary pull-tab full-bredde
└─────────────────────────┘
```

**Slot-pill specs på iPhone:**
- Bredde: minst 88px, opp til 120px (auto-fit i 16px gap)
- Høyde: 44px (touch-target minimum)
- 2-3 pills per rad (wrap automatisk)
- JBM 500 15px på klokkeslett
- Valgt: forest-fyll + bone tekst + ●checkmark-glyf foran
- LIME-spesial: lime-fyll + ink tekst + ◆diamant-glyf foran
- Tap-feedback: scale(0.96) på press

**Borte-stripe specs:**
- Bare italic Instrument Serif 16px tittel ("*Torsdag 21. mai*")
- Sub-tag italic 14px muted-fg forklaring
- Ingen knapper, ingen interaksjon
- Hairline hver side

**Tilpasninger fra desktop:**
- Cover-tittel: 40px (var 72)
- Lead body: 15px (var 17)
- Ingen 7-kolonne grid — liste-stil med dato-grupper
- Filtre: horisontal scroll-row med segmented chips
- Sticky tjeneste-strip under masthead (kompakt)
- Sticky bunn-CTA (72px): viser valgt slot + pris + Fortsett-CTA
- Field Notes: kompakt en kolonne, kun vises hvis slot valgt
- Borte-dager: kollapses til italic-stripe (sparer skjermplass)

---

## INTERAKTIVITET (alle 3 enheter)

- **Page-load koreografi** (sekvensiell, 0-2000ms, se design.md seksjon 9):
  1. Eyebrow + steg-indikator (0-200ms)
  2. Cover-tittel italic (200-600ms, opacity 0→1 + y -8 → 0)
  3. Sticky-oppsummering (400-700ms)
  4. Filtre (600-900ms, stagger 50ms per chip)
  5. Slot-grid (800-1600ms, stagger 30ms per dato-kolonne venstre→høyre)
  6. Field Notes (1400-1800ms)
- **Count-up** på "17 ledige timer"-stat (0 → 17, 800ms)
- **Slot-pill hover (desktop/iPad):** scale(1.02) + forest border 1px
  fade-in 200ms
- **Slot-pill klikk:** scale(0.96) press, 200ms ease-out, deretter fill-
  animation forest 300ms + checkmark-glyf scale-pop 0.4 → 1.0
- **Tidligere valgt slot deselekteres:** fade-out forest fill 200ms
- **Filter-bytte:** slots som ikke matcher får opacity 0.3 + grayscale,
  matchende slots forblir fulle
- **Lokasjons-popover:** fade + scale-pop 0.96 → 1.0 (200ms)
- **Caddie-marginalia pil:** SVG stroke-dashoffset tegner pilen inn
  (1200ms ease-out, etter slot-valg)
- **LIME-spesial-slot (◆18:00 onsdag):** pulserende ring (2s loop) for å
  tegne oppmerksomhet til at det er siste kveldsslot
- **Sticky bunn-CTA (iPad/iPhone):** slide-up 300ms når slot velges
- **Tap-feedback** på iPhone: scale(0.96) på press
- **Pulserende live-prikk** i eyebrow (2s loop)

---

## COMMAND PALETTE ⌘K (desktop + iPad)

På iPhone erstattes med søke-overlay (full screen) som åpner via søke-ikon
i masthead.

**20+ BOOKING-spesifikke kommandoer** i kategorier:

**Naviger dato**
- Hopp til denne uka
- Hopp til neste uke
- Hopp til uke 22
- Hopp til 25. mai (mandag uke 22)
- Vis kun denne uka (kompakt visning)
- Vis 4 uker frem (utvid vindu)
- Vis bare ledige dager (skjul borte)

**Filtrer tid**
- Vis kun morgen (før 12:00)
- Vis kun ettermiddag (12-17)
- Vis kun kveld (etter 17:00)
- Vis kun hverdager
- Vis kun weekend
- Reset filtre

**Skift tjeneste**
- Bytt til Privat-coaching 90 min (+ 300 kr)
- Bytt til Gruppe-coaching 60 min (− 800 kr)
- Bytt til Trackman-analyse 45 min
- Tilbake til tjeneste-katalog

**Skift lokasjon**
- Bytt til Mulligan Indoor Golf
- Sammenlign GFGK Range vs Mulligan
- Vis kjørerute til GFGK Range
- Vis kjørerute til Mulligan

**Handlinger**
- Eksporter valgt tid til kalender (.ics)
- Eksporter alle Anders ledige tider denne uka som .ics
- Send link til denne bookingen
- Sett varsel om ny ledig morgentid
- Sett varsel om avbestilling 19.05

**Spørsmål**
- Hva inkluderer Privat-coaching 60 min?
- Hva er avbestillingsreglene?
- Kan jeg endre tid etter booking?
- Hvor er GFGK Range?
- Snakk med Anders før jeg booker

**Hjelp & innstillinger**
- Snarveier
- Bytt språk (NO/EN)
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
- Lucide inline SVG der det trengs (kun UI-utility: chevron, check, x,
  map-pin, calendar — ikke shot-icons)
- CSS-variabler øverst (design.md seksjon 29)
- Norsk locale gjennomgående
- All interaktivitet fungerer (slot-valg, filter-bytte, sticky CTA, lime-
  spesial pulserende ring, caddie-marginalia pil)
- iPhone-versjon viser slot Man 18.05 · 11:00 som valgt, slik at sticky
  bunn-CTA og Field Notes-summary er aktivert i visningen

---

## ETTER LEVERING

Gi kort oppsummering (under 200 ord):

1. **3 designvalg som styrker Booking Slot-picker-en** — hvordan
   Workshop-arketypen bevares uten å bli "kalender-widget", hvordan dato-
   headlines i italic løfter slot-grid-en, hvordan borte-dager forklares
   editorialt
2. **Hva du ville løftet i neste iterasjon** — én konkret ting per enhet
   (særlig: hvordan kan vi løse iPad uten å oppleves som komprimert?
   trenger iPhone uke-skille bedre forankring?)
3. **Hva du er usikker på** — hvor trenger du Anders' input?
