# Prompt: Booking Bekreftelse — Sports Editorial × 3 enheter

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
6. Lagre som `_outputs/B04-booking-confirmation.html`

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
- Editorial tone — observerende italic-fragmenter, aldri "Thank you!"

# SKJERM: Booking Bekreftelse (3 enheter)

URL: `/booking/privat-coaching-60/bekreftelse`

## Kontekst

Ekstern kunde har akkurat betalt med Vipps. Skal få bekreftelse + neste-steg.
Dette er **det første magasin-øyeblikket** kunden får etter betaling — det
skal føles som å motta en eksklusiv invitasjon, ikke en auto-respons.

**Brukerspørsmål:** *"Er bookingen min ferdig? Hva skjer nå?"*

Tone: **Rolig bekreftelse, ikke jubel.** Som et brev fra redaktøren:
"Bekreftet. Vi sees onsdag." Aldri "Tusen takk for din booking!" eller
"Vellykket betaling!" eller "🎉".

Utgavetema: **`Milepæl`** (pull-quote-større, foto-tyngre, mer whitespace).

## Realistiske data

**Kunde**
- Navn: Henrik Solberg
- E-post: henrik.solberg@gmail.com
- Telefon: +47 922 11 304
- Status: Førstegangs-kunde hos AK Golf Academy

**Booking**
- Booking-nummer: `#AKG-2026-04891`
- Tjeneste: Privat-coaching, 60 minutter
- Når: Tirsdag 19. mai 2026, kl 10:00 (i overmorgen)
- Hvor: GFGK Range, Onsøyveien 412, 1640 Råde
- Med: Anders Kristiansen
- Pris: 1 500 kr betalt via Vipps · 17. mai 2026 kl 08:14
- Vipps-referanse: `2026-051708142387`

**Anders' velkomsthilsen** (italic editorial fra coach):
*"Henrik — takk for booking. Se på din egen Trackman-data før vi møtes
hvis du har det, så kan vi fokusere fra første minutt. Møt meg ved
flagget bak driving-range-skuret kl 09:55. Ha med clubs du normalt
spiller med — vi bytter ikke utstyr."*

— Anders Kristiansen, 17. mai 08:15

**Forberedelse**
- Egne golfkøller (driver til wedge)
- 20+ baller for oppvarming (vi har på range hvis du mangler)
- Vannflaske og solbriller (sol-meldt)
- Behagelige sko — gress kan være vått om morgenen
- Parkering: gratis ved klubbhuset, 200 m fra range
- Møtested: bak driving-range-skuret, ved flagget med AK Golf-logo

**Anbefalinger** (relaterte tjenester):
- Trackman-analyse-økt — 1 time før første runde · 1 800 kr
- Pakke 5 økter — 6 750 kr (10 % rabatt mot enkeltkjøp)
- Vinter-abonnement Performance — 2 økter/mnd, fra september

**Avlysning-policy**
- Gratis avbestilling senest 24 timer før (mandag kl 10:00)
- Senere avbestilling: 50 % refusjon
- No-show: ingen refusjon

**Editorial åpningslinjer (eksempler):**
- *"Bekreftet. Vi sees onsdag."*
- *"Tirsdag 19. mai, kl 10:00. Notert."*
- *"Booking AKG-2026-04891 er signert."*

---

## STRUKTUR — 5 spreads kombinert

Bruk **5 spread-arketyper** fra design.md seksjon 12:

1. **Cover** (Arketype A) — bekreftelses-tittel + lead
2. **Booking-detaljer** (Arketype B Lead Spread) — stat block + kart
3. **The Quote** (Arketype D) — Anders' velkomsthilsen
4. **Field Notes** — forberedelse-instruks som redaksjonell liste
5. **TOC-stil neste-steg** + relaterte tjenester

Footer/kolofon nederst med utgave-info.

---

## DESKTOP 1440×900

### Layout

12-col med sidebar TOC permanent venstre (280px).

**Sidebar TOC:**
```
AK GOLF HQ
Utgave bekreftet · 17.05

01  Status
02  Detaljer
03  Møtested
04  Forberedelse
05  Fra coach
06  Neste

HANDLINGER
↳ Legg til i kalender
↳ Send melding
↳ Vis kvittering
↳ Avlys booking
```

**Main content (max 1080px):**

**Spread 1 — Cover (12-col):**
- Eyebrow: `● BEKREFTET · AKG-2026-04891 · 17. MAI 2026 · 08:14` med pulserende forest live-prikk
- Cover-tittel (Instrument Serif italic, 112px):
  ```
  Bekreftet.
  *Vi sees onsdag.*
  ```
- Lead-paragraf (Geist 19px, max-width 560px):
  *"Privat-coaching 60 min er reservert til Henrik Solberg, tirsdag
  19. mai kl 10:00 på GFGK Range. Vipps-betalingen er gjennomført.
  Kvittering er på vei til e-post."*
- Photo til høyre (4:5, GFGK landscape — early-morning range med dugg
  på gresset): solid forest-flate som fallback med liten italic
  "*GFGK Range, Råde · foto Anders Kristiansen*"

**Spread 2 — Lead Spread (8+4):**

Venstre 8-col: Booking-detaljer som editorial stat block
```
TIRSDAG               19. MAI
*Kl 10:00 · 60 min*

         GFGK Range
         Onsøyveien 412, 1640 Råde

         Med Anders Kristiansen
         Privat-coaching 60 min

         1 500 kr · Vipps · betalt 08:14
         #AKG-2026-04891
```

Stort dato-tall: JetBrains Mono 128px `19`
Tiny label under: `MAI 2026 · TIRSDAG`
Italic annotasjon: *"To dager fra nå. Møt 5 minutter før."*

Høyre 4-col: Mapbox-stil kart-utsnitt 4:5
- GFGK Range markert med forest pin
- Subtilt nett av nærliggende veier
- Under: italic *"Gratis parkering ved klubbhuset, 200 m fra range."*
- CTA-pill under kartet: `Åpne i Apple Maps →` (forest border, italic)

**Spread 3 — The Quote (10-col centered):**

- Forest accent-strek venstre (3-4px, 96px høy)
- Pull quote (Instrument Serif italic 44px):
  *"Henrik — takk for booking. Se på din egen Trackman-data før vi
  møtes hvis du har det, så kan vi fokusere fra første minutt. Ha
  med clubs du normalt spiller med — vi bytter ikke utstyr."*
- Attribusjon: `— ANDERS KRISTIANSEN, COACH · 17. MAI 08:15`
- Under quote: liten knapp-rad
  - `Send melding til Anders →` (forest fill)
  - `Se Anders' profil` (tekst-knapp italic)

**Spread 4 — Field Notes (Forberedelse, 6+6):**

Venstre 6-col: **Ha med deg** (som redaksjonell liste, ikke sjekkliste)
```
HA MED DEG

—  Egne golfkøller (driver → wedge)
—  20+ baller for oppvarming
   *Vi har baller på range hvis du mangler.*
—  Vannflaske
—  Solbriller (sol-meldt 19. mai)
—  Behagelige sko
   *Gresset kan være vått om morgenen.*
```

Hvert punkt: em-dash (—) i forest, ikke checkbox. Italic-fragmenter
under når kontekst trengs.

Høyre 6-col: **Møtested & parkering** (mini-spread)
```
MØTESTED

09:55  Bak driving-range-skuret
       Ved flagget med AK Golf-logo

PARKERING
       Gratis ved klubbhuset
       200 m fra range
       Følg skilt mot "Range"

VÆR
       18°C · sol · lett vind sørvest
       *Trackman fungerer optimalt.*
```

**Spread 5 — Neste-steg + Relaterte (8-col + 4-col):**

Venstre 8-col: **Neste handlinger** som TOC-stil
```
NESTE

01  Legg til i kalender              Apple · Google · Outlook
02  *Kvittering på e-post*           Sendt 08:14 til henrik.solberg@…
03  Send melding til Anders          Hvis du har spørsmål før timen
04  Vis full booking-kvittering      Print- eller PDF-vennlig
05  Avlys booking                    *Senest mandag kl 10:00*
```

Hver rad har pyramide-prikk (4px) i forest til venstre. Linje 02 er
allerede gjort (subtilt muted), linje 05 har destructive-rød prikk.

Høyre 4-col: **Anbefalt videre** (3 editorial-cards stablet):
- Card 1: Trackman-analyse-økt
  - Italic glyph "*1 t*"
  - Tittel: Trackman-analyse før første runde
  - Pris: 1 800 kr
- Card 2: Pakke 5 økter
  - Italic glyph "*×5*"
  - Tittel: Privat-coaching pakke
  - Pris: 6 750 kr · *10 % rabatt*
- Card 3: Performance vinter-abonnement
  - Italic glyph "*∞*"
  - Tittel: 2 økter/mnd, fra september
  - Pris: fra 3 000 kr/mnd

**Avlysning-policy** (footnote-stil under spread 5, muted-fg):
```
*Avlysning: gratis senest 24 t før. Senere: 50 %. No-show: ingen refusjon.*
```

**Kolofon nederst:**
```
AK GOLF HQ · Utgave bekreftet · 17. mai 2026 · 08:14 · Råde
Redaktør: Anders Kristiansen · AK Golf Group AS · org 925 174 982
Booking-system signert av Vipps · ref 2026-051708142387
```

**Sticky bottom-bar (desktop):**
- Venstre: `Booking #AKG-2026-04891 · Bekreftet`
- Høyre: `Legg til i kalender →` (forest pill, primær CTA)

---

## IPAD 1024×768 (landscape)

### Layout

Top-masthead (56px) + tab-bar (48px), ingen sidebar. Main padding 32-48px hver side.

2-kolonne strategi:
- **Venstre 6-col:** Detaljer (cover → booking-info → quote → forberedelse → neste)
- **Høyre 6-col:** Kart (sticky) + relaterte tjenester + Anders-kort

```
┌──────────────────────────────────────────────────────────┐
│ AK GOLF HQ · BEKREFTET · AKG-2026-04891 · 17.05  🔍 ⌘ │ ← 56px masthead
├──────────────────────────────────────────────────────────┤
│ [HJEM] [MINE BOOKINGER] [PROFIL]                        │ ← 48px tabs
├──────────────────────────────────────────────────────────┤
│                                                            │
│  COVER (8-col tekst + 4-col foto)                         │
│  "Bekreftet. Vi sees onsdag."                             │
│                                                            │
│ ┌─────────────────────────┬──────────────────────────┐  │
│ │ BOOKING-DETALJER         │  KART (sticky)            │  │
│ │ 19. MAI · 10:00 · 60 MIN │  [Mapbox-utsnitt 4:5]    │  │
│ │ GFGK Range               │  *Pin: GFGK Range*       │  │
│ │ Anders Kristiansen       │  [Åpne i Apple Maps →]   │  │
│ │ 1 500 kr · Vipps         │                            │  │
│ │                          │                            │  │
│ │ PULL QUOTE               │  ANBEFALT VIDERE          │  │
│ │ Anders' velkomst         │  [Card: Trackman]         │  │
│ │                          │  [Card: Pakke 5]          │  │
│ │ FORBEREDELSE             │  [Card: Performance]      │  │
│ │ Ha med deg + Møtested    │                            │  │
│ │                          │                            │  │
│ │ NESTE-STEG (TOC)         │                            │  │
│ │ 5 linjer                 │                            │  │
│ └─────────────────────────┴──────────────────────────┘  │
│                                                            │
│ KOLOFON                                                    │
├──────────────────────────────────────────────────────────┤
│ #AKG-2026-04891 · Bekreftet      [Legg til i kalender →]│ ← Sticky CTA
└──────────────────────────────────────────────────────────┘
```

**Tilpasninger fra desktop:**
- Cover-tittel: 96px (var 112)
- Pull quote: 36px (var 44)
- Stat dato-tall: 96px (var 128)
- Kart sticker til høyre kolonne ved scroll
- Touch-targets min 44px
- ⌘K erstattes med søke-ikon topp høyre
- Kolofon: kompakt en linje

---

## IPHONE 393×852 (iPhone 15)

### Layout

Bottom tab-bar (56px). Single column. Padding 16-20px hver side.
**Fokus på iPhone:** kalender-link og kart skal være umiddelbart tilgjengelig.

```
┌─────────────────────────┐
│ BEKREFTET           🔍 │ ← 44px running head
├─────────────────────────┤
│                          │
│ ● AK GOLF HQ ·          │
│   BEKREFTET             │
│   17.05 · 08:14         │
│                          │
│ Bekreftet.               │
│ *Vi sees onsdag.*        │ ← Cover-tittel 56px
│                          │
│ Privat-coaching 60 min   │
│ er reservert til Henrik  │
│ Solberg, tirsdag         │
│ 19. mai kl 10:00 på      │
│ GFGK Range. Vipps-       │
│ betalingen er gjennom-   │
│ ført. Kvittering er på   │
│ vei til e-post.          │
│                          │
│ ─────                    │
│                          │
│  19                      │ ← 80px JBM
│  MAI 2026 · TIRSDAG      │
│                          │
│  *Kl 10:00 · 60 min*     │
│                          │
│  GFGK Range              │
│  Onsøyveien 412,         │
│  1640 Råde               │
│                          │
│  Med Anders Kristiansen  │
│  1 500 kr · Vipps        │
│  #AKG-2026-04891         │
│                          │
│ ─────                    │
│                          │
│ [Mapbox-kart 16:10]      │ ← Stor og dominerende
│ *Pin: GFGK Range*        │
│                          │
│ [Åpne i Apple Maps →]    │ ← Primær handling
│ [Åpne i Google Maps]     │
│                          │
│ *Gratis parkering ved*   │
│ *klubbhuset, 200 m fra*  │
│ *range.*                 │
│                          │
│ ─────                    │
│                          │
│ [+ Legg til i kalender]  │ ← Stor primær-CTA forest
│                          │
│ Apple · Google · Outlook │
│ *Hendelse: 19. mai 10:00*│
│                          │
│ ─────                    │
│                          │
│ │                        │
│ │ *"Henrik — takk for*   │
│ │ *booking. Se på din*   │
│ │ *egen Trackman-data*   │
│ │ *før vi møtes hvis du* │
│ │ *har det. Ha med clubs*│
│ │ *du normalt spiller*   │
│ │ *med — vi bytter ikke* │
│ │ *utstyr."*             │
│ │                        │
│ │ — ANDERS KRISTIANSEN   │
│ │   COACH · 17. MAI      │
│                          │
│ [Send melding →]         │
│                          │
│ ─────                    │
│                          │
│ HA MED DEG               │
│ —  Egne golfkøller       │
│ —  20+ baller            │
│    *Vi har på range*     │
│ —  Vannflaske            │
│ —  Solbriller            │
│ —  Behagelige sko        │
│                          │
│ MØTESTED                 │
│ 09:55 · bak range-skuret │
│        ved AK-flagget    │
│                          │
│ VÆR                      │
│ 18°C · sol · sørvest     │
│                          │
│ ─────                    │
│                          │
│ NESTE                    │
│ ● *Kvittering sendt*     │
│   til henrik.solberg@…   │
│ ● Send melding til       │
│   Anders                 │
│ ● Vis full kvittering    │
│ ● Avlys booking          │
│   *Senest mandag 10:00*  │
│                          │
│ ─────                    │
│                          │
│ ANBEFALT VIDERE          │
│ [Card: Trackman 1 800]   │
│ [Card: Pakke 5 · 6 750]  │
│ [Card: Performance ∞]    │
│                          │
│ ─────                    │
│                          │
│ *Avlysning: gratis*      │
│ *senest 24 t før.*       │
│ *Senere: 50 %.*          │
│                          │
│ KOLOFON                  │
│ AK Golf HQ · 17.05.26    │
│ Vipps-ref:               │
│ 2026-051708142387        │
│                          │
├─────────────────────────┤
│ [Legg til i kalender →] │ ← Sticky CTA over tab-bar
├─────────────────────────┤
│ 🏠 📅 💬 👤 ⋯           │ ← Bottom tab-bar 56px
└─────────────────────────┘
```

**Tilpasninger fra desktop:**
- Cover-tittel: 56px (var 112)
- Lead body: 17px (var 19)
- Pull quote: 28px (var 44)
- Stat dato-tall: 80px (var 128)
- ALLE spreads stables vertikalt — null kolonner
- **Kart og kalender-CTA er PRIMÆR fokus** — plasseres tidlig
- Photo: dropp cover-photo til fordel for typografi-hero
- Bottom tab-bar: Hjem, Bookinger, Meldinger, Profil, Mer
- Sticky primær-CTA "Legg til i kalender →" over tab-bar
- Marginalia inline (under elementet)
- ⌘K → søke-ikon i header

---

## INTERAKTIVITET (alle 3 enheter)

- **Page-load koreografi** (sekvensiell, 0-2000ms, se design.md seksjon 9)
- **Eyebrow-fade-in** først (0-300ms)
- **Cover-tittel** stagger word-by-word reveal (300-900ms)
- **Stat dato `19`** count-up (1 → 19, 600ms) eller fade-in
- **Kart** fades inn med subtil zoom 1.02 → 1.0 (800ms)
- **Pull-quote** scale-up 0.96 → 1.0 (600ms)
- **Forberedelse-liste** stagger fade-up (50ms delay, 400ms hver)
- **Editorial cards** fade-up stagger
- **Hover på rad/card:** translateY(-2px) + shadow-1 (desktop/iPad)
- **Tap-feedback** på iPhone: lett scale(0.98) på press
- **Pulserende live-prikk** i eyebrow (2s loop, forest)
- **"Legg til i kalender"-CTA** har subtil hover-glow forest

**Mikro-detalj:** Når "Send melding"-knappen klikkes, en liten italic
tekst fader inn under: *"Anders får meldingen din direkte. Han svarer
oftest innen 2 timer."*

---

## COMMAND PALETTE ⌘K (desktop + iPad)

På iPhone erstattes med søke-overlay (full screen) som åpner via søke-ikon.

20+ kommandoer i kategorier:

**Kalender & deling**
- Legg til i Apple Calendar
- Legg til i Google Calendar
- Legg til i Outlook
- Last ned .ics-fil
- Del booking-detaljer via e-post
- Del via SMS

**Kvittering**
- Vis full kvittering
- Print booking-bekreftelse
- Last ned kvittering som PDF
- Send kvittering på nytt til e-post
- Vis Vipps-transaksjon

**Kontakt coach**
- Send melding til Anders
- Spør om forberedelse
- Spør om utstyr
- Spør om parkering
- Ring AK Golf Academy

**Endring**
- Endre tidspunkt (krever bekreftelse fra Anders)
- Avlys booking
- Be om refusjon
- Legg til ekstra tid (+30 min)

**Navigasjon**
- Tilbake til hjemmesiden
- Se mine bookinger (krever innlogging)
- Bestill flere økter
- Se Anders' profil
- Se GFGK Range info

**Hjelp**
- Snarveier
- FAQ om coaching
- Avlysning-policy
- Kontakt support

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
- Lucide inline SVG der det trengs (kun UI-utility: calendar, map-pin,
  message-circle, share — ikke dekorativt)
- CSS-variabler øverst (design.md seksjon 29)
- Norsk locale gjennomgående (1 500 kr med ikke-brytbar mellomrom)
- All interaktivitet fungerer

---

## ETTER LEVERING

Gi kort oppsummering (under 200 ord):

1. **3 designvalg som gjør bekreftelsen til et redaksjonelt øyeblikk** —
   hva som skiller dette fra generisk "Thank you for your booking"
2. **Hva du ville løftet i neste iterasjon** — én konkret ting per enhet
3. **Hva du er usikker på** — hvor trenger du Anders' input?
