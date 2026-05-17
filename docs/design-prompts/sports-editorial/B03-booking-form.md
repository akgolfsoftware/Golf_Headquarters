# Prompt: Booking Skjema — Sports Editorial × 3 enheter

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
6. Lagre som `_outputs/B03-booking-form.html`

---

## PROMPT (kopier alt under denne linjen)

Du er senior visuell designer som spesialiserer seg på Sports Editorial design
— magasin-redaksjon kombinert med performance-data for elite-atleter. Nå skal
du designe et **transaksjonelt skjema** uten å miste editorial-DNA-en.

Du har akkurat fått hele design-systemet (over). Følg det strengt:
- Italic Instrument Serif er hovedstemme (bruk OFTE — også her i skjemaet)
- Typografi-glyfer som ikoner (ikke SVG-tegninger)
- Magazine spread-feel, ikke uniform "checkout-form-grid"
- Forest green sparsomt som signatur, lime maks ÉN flate per skjerm
- Norsk locale (komma desimal, ikke-brytbar mellomrom mellom tall og enhet, +/− fortegn)
- Editorial tone — observerende italic-fragmenter, aldri "Fyll inn opplysninger"
- 8pt-grid håndheves
- Følg seksjon 19 (Skjemaer & inputs) for alle felter, spesielt 19.10 Form layout

# SKJERM: Booking Skjema — Steg 3 av 4

URL: `/booking/privat-coaching-60-min/skjema`

## Brukerkontekst

Brukeren er en **ekstern kunde** (ikke innlogget elite-atlet). Hun har:
1. Valgt tjeneste (Privat-coaching 60 min)
2. Valgt tid (tirsdag 19. mai 2026, kl 10:00 på GFGK Range)
3. Skal nå fylle inn kontaktinfo og betale
4. Etter betaling: bekreftelses-side + e-post

Brukerspørsmål når hun åpner skjemaet:
*"Hva trenger Anders fra meg, og hvordan betaler jeg?"*

Tone: **kvitterende, profesjonell, ikke-byråkratisk**. Selv et skjema er
redaksjonelt — italic på seksjons-titler, kuratorisk-instruks-tekst i
italic ("*Vi bruker fødselsdato kun for å validere HCP-data.*"), aldri
"Vennligst fyll inn"-mekanisk språk.

Dette er **ikke** Stripe Checkout. Det er et magasin som tilfeldigvis tar
imot betaling.

## Demo-data (faktiske felter)

**Valgt tjeneste:**
- Navn: Privat-coaching 60 min
- Coach: Anders Kristiansen
- Sted: GFGK Range (Gamle Fredrikstad GK)
- Tid: Tirsdag 19. mai 2026, kl 10:00 → 11:00
- Pris: kr 1 500 inkl. MVA
- MVA: 25% = kr 300 av prisen
- Netto: kr 1 200

**Skjult metadata til betaling:**
- Order ID: AK-2026-05-0847
- Mottakerkonto: AK Golf Group AS (Org.nr 932 145 678)

**Kunde fyller inn:**

Kontaktinfo:
- Fornavn (påkrevd)
- Etternavn (påkrevd)
- E-post (påkrevd, validert)
- Mobil (påkrevd, norsk format +47 4XX XX XXX)
- Fødselsdato (påkrevd for HCP-tjenester)

HCP og spillerinfo:
- Nåværende HCP (tall, kan være plus eller minus, f.eks. 12,4 eller +2,5)
- Hovedklubb / hjemmebane (text input med autocomplete-hint)
- Erfaringsnivå (radio: Begynner / Mellom / Avansert / Elite)

Notater til Anders:
- Fritekst (textarea, valgfri, max 500 tegn)
- Placeholder italic: *"Hva vil du fokusere på? Slag, putting, runde-strategi?"*

Markedsføring:
- Checkbox: "Send meg månedlig nyhetsbrev fra AK Golf Academy" (default av)

Betalingsmetode:
- Radio:
  - Vipps (default, anbefalt for nordmenn)
  - Kort (Visa / Mastercard via Stripe)
  - Faktura (kun B2B, viser ekstra felt: Org.nr)

Pris-oppsummering:
- Subtotal (eks. MVA): kr 1 200
- MVA 25%: kr 300
- **Total: kr 1 500**

Vilkår:
- Checkbox påkrevd: "Jeg har lest og godtar [Vilkår] og [Personvern]"
- Lenker åpner modal (seksjon 21.1)

CTA:
- Primary: "Betal kr 1 500 og bekreft" (full bredde på mobil)
- Secondary tekst-lenke: "Avbryt og gå tilbake"

**Editorial fragmenter å bruke:**
- *"Tirsdag morgen på GFGK. Klar."*
- *"Vi sees 19. mai."*
- *"Anders bekrefter innen en time."*
- *"Tre felter og betaling. Ikke mer."*
- *"Fødselsdato kun for HCP-validering — aldri delt videre."*
- *"Vipps er raskest. To trykk og du er ferdig."*

---

## STRUKTUR — 4 redaksjonelle blokker

Bruk **4 spread-arketyper light**, ikke 5 fulle:

1. **Cover (light)** — Steg-indikator + italic-tittel + lead
2. **Booking-sammendrag (sticky)** — Tjeneste, tid, sted, pris (alltid synlig)
3. **Skjema (3 seksjoner)** — Kontakt, Spiller, Betaling
4. **Bekreftelses-blokk** — Total + vilkår + CTA + kolofon

---

## DESKTOP 1440×900

### Layout

12-col, **ingen permanent sidebar**. Centered max-width 1200px.
Booking-sammendrag er **sticky høyre kolonne** (4-col, 360px).
Skjema venstre 8-col.

**Masthead (64px):**
```
● AK GOLF HQ · BOOKING · STEG 3 AV 4 · TIRSDAG 19. MAI 2026         🔍 ⌘
```

**Cover (12-col, 120px topp-luft):**

Eyebrow (Tiny caps tracking 0.1em, muted-fg):
```
● STEG 03 / 04  ·  DINE OPPLYSNINGER  ·  ANSLÅTT TID: 90 SEK
```
(Pulserende grønn prikk venstre)

Cover-tittel (Instrument Serif italic, 88px, max-width 720px):
```
Tre felter
og betaling.
*Ikke mer.*
```

Lead (Geist 18px, max-width 560px):
*"Vi trenger navn, kontakt og HCP. Anders bekrefter innen en time
etter at betalingen er gjennomført. Du får både e-post og kalender-
invitt."*

96px luft.

---

**Skjema-spread (8+4):**

### Venstre 8-col — Skjemaet

Tre seksjoner med 64px luft mellom.

**Seksjon 1 — *Dine opplysninger.***

Subhead (28px IS italic): *"Dine opplysninger."*
Kuratorisk instruks (13px IS italic, muted-fg):
*"Hvor vi når deg, og hvem du er. Standard kontaktinfo."*

Grid 2-col innen seksjonen (24px gap):
```
FORNAVN                          ETTERNAVN
[ Camilla              ]         [ Sørensen              ]

E-POST (12-col full bredde)
[ camilla.sorensen@gmail.com                                  ]
*Bekreftelse og kalender-invitt sendes hit.*

MOBIL                            FØDSELSDATO
[ +47 482 91 305      ]          [ 📅 14.08.1984         ]
                                  *Brukes kun for HCP-validering.*
```

64px luft.

**Seksjon 2 — *Spiller-info.***

Subhead (28px IS italic): *"Spiller-info."*
Kuratorisk instruks: *"For å forberede økten — Anders justerer drillene
etter ditt nivå."*

```
NÅVÆRENDE HCP                    HOVEDKLUBB
[ 12,4              ]            [ Gamle Fredrikstad GK    ]
*Plus-HCP? Skriv +2,5.*          *Skriv klubben din.*

ERFARINGSNIVÅ
○ Begynner   ● Mellom   ○ Avansert   ○ Elite
*Vi tilpasser tempoet etter dette.*

NOTATER TIL ANDERS
┌──────────────────────────────────────────────┐
│ *Hva vil du fokusere på? Slag, putting,*     │
│ *runde-strategi?*                             │
│                                                │
└──────────────────────────────────────────────┘
0 / 500 tegn
```

64px luft.

**Seksjon 3 — *Betaling.***

Subhead (28px IS italic): *"Betaling."*
Kuratorisk instruks: *"Vipps er raskest. To trykk og du er ferdig."*

Betalingsmetode (radio-tre stk som horisontale cards, ikke små radioknapper):

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ ● Vipps         │  │ ○ Kort          │  │ ○ Faktura       │
│                  │  │                  │  │                  │
│ *Anbefalt*       │  │ *Visa / MC*     │  │ *Kun B2B*       │
│ Bekreft i appen │  │ Stripe sikker   │  │ +14 dager       │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

Aktivt-kortet har 2px forest border, andre 1px border.
Hvis "Faktura" velges: ekstra felt under fader inn:
```
ORG.NR (kun B2B)
[ 932 145 678         ]
*Faktura sendes som EHF til Brønnøysund-registrert adresse.*
```

48px luft.

**Markedsføring-checkbox:**
```
☐  Send meg månedlig nyhetsbrev fra AK Golf Academy.
   *Tre runde-tips og en kortspill-drill per måned. Aldri spam.*
```

---

### Høyre 4-col (sticky) — Booking-sammendrag

Posisjon: `position: sticky; top: 96px;`, bredde 360px, padding 32px,
bg var(--ak-card), 1px hairline border, radius-xl (16px).

```
TJENESTEN

*Privat-coaching*
*60 minutter.*               ← IS italic 32px

Med Anders Kristiansen
AK Golf Academy

───── hairline ─────

NÅR
Tirsdag 19. mai 2026         ← Geist 16px
10:00 → 11:00                ← JBM tabular 16px

HVOR
GFGK Range                   ← Geist 16px
*Gamle Fredrikstad GK*       ← IS italic 13px muted

───── hairline ─────

PRIS                         ← Tiny caps

Subtotal           kr 1 200  ← JBM 14px
MVA 25%            kr   300  ← JBM 14px muted
─────────────────────────
*Total*           kr 1 500   ← IS italic 24px + JBM 24px

───── hairline ─────

☐ *Jeg har lest og godtar*
  *[Vilkår] og [Personvern].*

[  Betal kr 1 500 og bekreft  →  ]   ← Primary CTA, full bredde

*Avbryt og gå tilbake*               ← Tekst-lenke under, muted
```

CTA er disabled (50% opacity) til vilkår-checkbox er huket av.

---

**Kolofon (12-col, 96px topp-luft):**
```
AK GOLF HQ · Booking · Org.nr 932 145 678 · Trygg betaling via Stripe og Vipps
Spørsmål? anders@akgolf.no · +47 482 91 305
```

---

## IPAD 1024×768 (landscape)

### Layout

Top-tab nav (48px). 2-kolonne med skjema venstre (60%) og sammendrag
høyre (40%). Padding 32px hver side.

```
┌──────────────────────────────────────────────────────────┐
│ AK GOLF HQ · BOOKING · STEG 3/4              🔍 ⌘      │ ← 56px masthead
├──────────────────────────────────────────────────────────┤
│ [TJENESTE] [TID] [● OPPLYSNINGER] [BEKREFT]             │ ← Progress tabs 48px
├──────────────────────────────────────────────────────────┤
│                                                            │
│ COVER (full bredde, 72px italic tittel)                  │
│ "Tre felter og betaling. *Ikke mer.*"                    │
│                                                            │
│ ┌─────────────────────┬──────────────────────┐           │
│ │ SKJEMA (60%)        │ SAMMENDRAG (40%)     │           │
│ │                      │                       │           │
│ │ *Dine opplysninger.*│ TJENESTEN            │           │
│ │ [grid 2-col felter] │ *Privat-coaching 60* │           │
│ │                      │                       │           │
│ │ *Spiller-info.*     │ NÅR / HVOR           │           │
│ │ [felter]            │                       │           │
│ │                      │ PRIS                  │           │
│ │ *Betaling.*         │ Subtotal / MVA / Total│           │
│ │ [3 cards]           │                       │           │
│ │                      │ ☐ Vilkår              │           │
│ │ ☐ Nyhetsbrev        │ [Betal kr 1 500 →]   │           │
│ │                      │                       │           │
│ └─────────────────────┴──────────────────────┘           │
│                                                            │
│ KOLOFON (kompakt)                                         │
└──────────────────────────────────────────────────────────┘
```

**Tilpasninger fra desktop:**
- Cover-tittel: 72px (var 88)
- Subheads: 24px (var 28)
- Top-tabs viser 4-stegs progress visuelt (steg 3 aktiv, forest underline)
- Sammendrag er IKKE sticky her — naturlig flyt høyre
- Betalings-cards: 3-col blir trangt → vurder vertikal stabling hvis nødvendig
- Touch-targets min 44px på alle inputs og checkboxes
- ⌘K → søke-ikon
- Kolofon: én linje

---

## IPHONE 393×852 (iPhone 15)

### Layout

Single column. Bottom: **sticky CTA-bar** med pris + knapp.
Toppen har komprimert sammendrag som collapser når man scroller.

```
┌─────────────────────────┐
│ ←  BOOKING · 3/4    🔍 │ ← 44px running head
├─────────────────────────┤
│ ●━━━━━●━━━━━●━━━━━○    │ ← Progress dots 32px
│ Tjeneste · Tid · DU · ✓│
├─────────────────────────┤
│                          │
│ STICKY-SAMMENDRAG       │ ← 88px sammenklappet
│ *Privat-coaching 60 min*│
│ Tir 19. mai · 10:00     │
│ GFGK Range · kr 1 500   │
│ ▾ Vis detaljer          │
├─────────────────────────┤ ← Skjema scroller under
│                          │
│ ● STEG 03 / 04          │
│   DINE OPPLYSNINGER     │
│                          │
│ Tre felter               │
│ og betaling.             │
│ *Ikke mer.*              │ ← 44px cover-tittel
│                          │
│ Vi trenger navn,         │
│ kontakt og HCP.          │
│ Anders bekrefter innen   │
│ en time.                 │
│                          │
│ ─────                    │
│                          │
│ *Dine opplysninger.*     │ ← 22px IS italic
│ *Hvor vi når deg.*       │ ← 13px IS italic muted
│                          │
│ FORNAVN                  │
│ [ Camilla            ]   │ ← Full bredde, 48px høy
│                          │
│ ETTERNAVN                │
│ [ Sørensen           ]   │
│                          │
│ E-POST                   │
│ [ camilla@gmail.com  ]   │
│ *Bekreftelse hit.*       │
│                          │
│ MOBIL                    │
│ [ +47 482 91 305     ]   │
│                          │
│ FØDSELSDATO              │
│ [ 📅 14.08.1984      ]   │
│ *Kun for HCP-validering.*│
│                          │
│ ─────                    │
│                          │
│ *Spiller-info.*          │
│ *For å forberede økten.* │
│                          │
│ NÅVÆRENDE HCP            │
│ [ 12,4               ]   │
│ *Plus-HCP? Skriv +2,5.*  │
│                          │
│ HOVEDKLUBB               │
│ [ Gamle Fredrikstad  ]   │
│                          │
│ ERFARINGSNIVÅ            │
│ ○ Begynner               │
│ ● Mellom                 │
│ ○ Avansert               │
│ ○ Elite                  │
│ *Vi tilpasser tempoet.*  │
│                          │
│ NOTATER TIL ANDERS       │
│ ┌──────────────────────┐ │
│ │ *Hva vil du fokusere*│ │
│ │ *på?*                │ │
│ │                       │ │
│ └──────────────────────┘ │
│ 0 / 500 tegn             │
│                          │
│ ─────                    │
│                          │
│ *Betaling.*              │
│ *Vipps er raskest.*      │
│                          │
│ ● Vipps                  │ ← Hele rad er klikkbar
│   *Anbefalt. Bekreft i*  │
│   *appen.*               │
│                          │
│ ○ Kort                   │
│   *Visa / Mastercard*    │
│                          │
│ ○ Faktura                │
│   *Kun B2B · +14 dager*  │
│                          │
│ ─────                    │
│                          │
│ ☐ *Send meg månedlig*    │
│   *nyhetsbrev fra AK*    │
│   *Golf Academy.*        │
│                          │
│ ─────                    │
│                          │
│ PRIS                     │
│ Subtotal     kr 1 200    │
│ MVA 25%      kr   300    │
│ ─────────                │
│ *Total*      kr 1 500    │ ← IS italic + JBM
│                          │
│ ☐ *Jeg har lest og*      │
│   *godtar [Vilkår] og*   │
│   *[Personvern].*        │
│                          │
│ KOLOFON                  │
│ AK Golf Group AS         │
│ Org.nr 932 145 678       │
│                          │
│ (96px luft til CTA)      │
│                          │
├─────────────────────────┤
│ kr 1 500 · *inkl. MVA*  │
│ [ Betal og bekreft  → ] │ ← Sticky CTA 88px
└─────────────────────────┘
```

**Tilpasninger fra desktop:**
- Cover-tittel: 44px (var 88)
- Subheads: 22px (var 28)
- Lead body: 16px (var 18)
- Alle felter full bredde, stacket
- Input høyde: 48px minimum (touch)
- Font-size på input: 16px (forhindrer iOS-zoom)
- Betalings-cards bytter til vertikal radio-rad (hele rad klikkbar)
- Sticky CTA-bar nederst: pris venstre, knapp høyre/full
- Sticky-sammendrag på toppen kan kollapsere/ekspandere
- Progress vises som 4 prikker, ikke tab-bar
- Drop ⌘K → bytt med søke-ikon i header (eller skjul helt)
- Marginalia inline under hvert felt
- Felt-validering vises inline under feltet, ikke i toast

---

## INTERAKTIVITET (alle 3 enheter)

- **Page-load koreografi** (sekvensiell, 0-2000ms, se design.md seksjon 9)
- **Steg-prikker** animerer inn fra venstre, en og en (100ms delay)
- **Cover-tittel** fade-up med 50px translateY (600ms)
- **Subheads** ramler inn med italic-letter-spacing-shift (400ms)
- **Felter** fade-up stagger (40ms delay per felt)
- **Sammendrag** sliding-in fra høyre (desktop) eller fade-up (mobile)
- **Live-validering** med 300ms debounce — e-post viser grønt forest hake når valid, italic *"Ser bra ut."* under
- **Betalings-card** hover: translateY(-2px) + shadow-1
- **Aktiv card**: 2px forest border anim 200ms
- **Faktura-felt** fader inn med height-transition 300ms når valgt
- **CTA-state**: disabled grå når vilkår ikke huket, scale-pulse 200ms når aktiv
- **Total-tall** count-up når siden laster (0 → 1 500, 600ms, JBM tabular)
- **Tegnteller** på textarea: når 450+ tegn, italic *"50 tegn igjen."* vises i muted
- **iPhone tap-feedback**: scale(0.98) på alle clickable elementer
- **Sticky CTA på iPhone**: bg fader inn med backdrop-blur(12px) når scrollet forbi
- **Pulserende live-prikk** i eyebrow (2s loop)

### Form-stater (vis alle som hover-states i artifact)

| State | Visuell |
|---|---|
| Default | 1px hairline border |
| Focus | 2px forest border, no shadow, italic helper under |
| Filled valid | 1px border, liten lime-prikk høyre + italic *"OK."* |
| Filled invalid | 2px destructive border, italic-feilmelding under |
| Disabled | 50% opacity, bg muted |

---

## COMMAND PALETTE ⌘K (desktop + iPad)

På iPhone erstattes med søke-overlay (full screen) som åpner via søke-ikon.

22+ kommandoer i kategorier:

**Skjema-handlinger**
- Lagre som utkast (sende lenke til e-post)
- Tøm hele skjemaet
- Auto-fyll fra forrige booking (hvis cookie)
- Kopier ordre-ID

**Endre booking**
- Endre tid
- Endre tjeneste
- Endre coach
- Endre sted
- Gå tilbake til steg 2 (Tid)
- Gå tilbake til steg 1 (Tjeneste)

**Betaling**
- Skift betalingsmetode til Vipps
- Skift betalingsmetode til Kort
- Skift betalingsmetode til Faktura
- Anvend rabattkode
- Spør om gavekort
- Be om bedrifts-faktura

**Hjelp**
- Hva er Vipps?
- Hvordan virker faktura-betaling?
- Avbestillings-vilkår
- Hvem er Anders?
- Kontakt support
- Send tilbakemelding på skjemaet

**Snarveier**
- Snarveier (vis alle)
- Esc lukker

⌘K åpner med fade + scale-pop. Fuzzy search på tittel + kategori.
↑↓ Enter for å velge, Esc for å lukke.

---

## NORSK LOCALE — sjekkliste

- Penger: `kr 1 500` med NBSP mellom tall og "kr"
- MVA-prosent: `25 %` med NBSP, eller `25%` uten — vær konsistent
- Telefon: `+47 482 91 305` med mellomrom
- Dato: `19. mai 2026` (lang) eller `19.05.2026` (kort)
- Tid: `10:00 → 11:00` med typografisk pil
- HCP: `12,4` med komma, plus-HCP `+2,5`
- Org.nr: `932 145 678` med mellomrom
- Minustegn: typografisk `−` (U+2212), aldri hyphen

---

## OUTPUT-FORMAT

Lever **ÉN HTML-fil** med tre viewport-seksjoner stablet vertikalt:

```html
<section class="device device--desktop">
  <header class="device-label">Desktop · 1440 × 900</header>
  <div class="frame" style="width:1440px; min-height:900px; overflow:hidden;">
    <!-- Desktop layout -->
  </div>
</section>

<section class="device device--ipad">
  <header class="device-label">iPad · 1024 × 768</header>
  <div class="frame" style="width:1024px; min-height:768px; overflow:hidden;">
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
*"— iPad-utgave —"* centered.

Inkluder:
- Tailwind CDN inline
- Google Fonts CDN (Instrument Serif italic, Geist variable, JetBrains Mono)
- Lucide inline SVG der det trengs (kun UI-utility: Calendar, ChevronDown, Search, Check, ArrowRight)
- CSS-variabler øverst (design.md seksjon 29)
- Norsk locale gjennomgående
- All interaktivitet fungerer (form-felt skal være ekte input/textarea med fokus-state, ikke statisk SVG)
- Validering vises som hover-/focus-states på minst ett felt per device

---

## ETTER LEVERING

Gi kort oppsummering (under 200 ord):

1. **3 designvalg som gjør skjemaet editorial uten å bryte konvertering**
   — hva som skiller dette fra Stripe Checkout / generisk form
2. **Hva du ville løftet i neste iterasjon** — én konkret ting per enhet
3. **Hva du er usikker på** — hvor trenger du Anders' input?
   (f.eks. real-time HCP-validering mot GolfBox-API, om Vipps-flyt
   skal åpne modal eller redirect, B2B-detektering)
