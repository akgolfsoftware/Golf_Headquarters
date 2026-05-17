# Prompt: CoachHQ Spillere — Sports Editorial × 3 enheter

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
6. Lagre som `_outputs/08-coachhq-spillere.html`

---

## PROMPT (kopier alt under denne linjen)

Du er senior visuell designer som spesialiserer seg på Sports Editorial design
— magasin-redaksjon kombinert med performance-data for elite-coaching. Du
designer nå **Spillere-skjermen i CoachHQ** — Anders' portefølje-oversikt
over de 12 aktive spillerne. Tonen er **operativ og redaksjonell, ikke
SaaS-tabellarisk**. Tenk *"redaksjons-pulje på sportsavdelingen i en
storavis"* — hvor hver utøver er en sak, og redaktøren scanner pulja for
hva som krever oppmerksomhet i dag.

Du har akkurat fått hele design-systemet (over). Følg det strengt:
- Italic Instrument Serif er hovedstemme (også i tabell-headere og kolonne-titler)
- Typografi-glyfer som ikoner (HCP-tall i JBM ER ikonet — ingen avatar-fyll)
- Magazine spread-feel, ikke uniform dashboard-grid — men info-tett
- Forest green sparsomt som signatur, lime maks ÉN flate per skjerm
- Norsk locale (komma desimal, ikke-brytbar mellomrom, +/− fortegn)
- Editorial tone — observerende italic-fragmenter, aldri "Velkommen tilbake"
- Tabellrader er redaksjonelle linjer, ikke datarader — italic-fragment per spiller

# SKJERM: CoachHQ Spillere (3 enheter)

URL: `/admin/spillere`

## Demo-bruker

**Anders Kristiansen** — Head Coach, AK Golf Academy, 12+ års erfaring, NGF
A-lisens. Han har 12 aktive spillere i porteføljen.

Brukerspørsmål når Anders åpner skjermen:
*"Hvem av de 12 spillerne mine trenger oppmerksomhet, og hvor står hver av dem?"*

Tone: Pulje-redaktør. Han skal se hele rekka på 5 sekunder, og umiddelbart
identifisere de 3 som krever ham nå. Resten er status quo — viktig, men
ikke akutt.

## Realistiske data — 12 spillere

| Spiller | HCP nå | Trend 12 mnd | Siste runde | SG-total | Status |
|---|---|---|---|---|---|
| Øyvind Rohjan | +3,5 | ↗ +1,7 | 69 (−3) · 13.05 | +1,34 | Stiger |
| Sofie Larsen | +0,8 | ↗ +0,4 | 71 (−1) · 14.05 | +0,82 | Stiger |
| Lars Hansen | +1,2 | → 0,0 | 72 (E) · 11.05 | +0,91 | Stabil |
| Tora Eriksen | 1,8 | ↗ +0,9 | 73 (+1) · 10.05 | +0,42 | Stiger |
| Ida Bjørklund | 5,5 | → +0,1 | 78 (+6) · 12.05 | −0,18 | Stabil |
| Markus R. Pedersen | 4,2 | ↗ +2,1 | 69 (−3) · 11.05 | +0,93 | Stiger |
| Emil Strand | 8,4 | ↘ −0,3 | 82 (+10) · 08.05 | −1,2 | Stagnerer |
| Henrik Olsen | 6,8 | → +0,1 | 79 (+7) · 14.05 | −0,8 | Stabil |
| Sondre Pettersen | 12,1 | ↗ +1,8 | 86 (+14) · 06.05 | −2,1 | Stiger |
| Marius Berg | 9,2 | ↘ −0,5 | 84 (+12) · 05.05 | −1,4 | Stagnerer |
| Aksel Holmen | 14,5 | → 0,0 | 89 (+17) · 09.05 | −2,8 | Stabil |
| Vetle Sørensen | 3,1 | ↗ +0,6 | 73 (+1) · 13.05 | +0,32 | Stiger |

**3 spillere krever oppfølging i dag:**
1. **Emil Strand** — HCP stagnerer, tester forfaller (urgent)
2. **Marius Berg** — HCP nedover, ingen plan (urgent)
3. **Ida Bjørklund** — utestående faktura 8 400 kr (warning)

### Aggregerte tall

- **Total spillere:** 12 (4 Pro-tier, 8 Gratis)
- **Snitt HCP-trend:** +0,6 over 12 mnd (porteføljen forbedrer seg)
- **Total runder denne uka:** 28 (snitt 2,3 per spiller)
- **Oppfølgings-kø:** 3 spillere

### Grupperinger (filtre)

- **Kategori:** Pro-tier (Øyvind, Sofie, Lars, Markus) / Gratis (resten)
- **Gruppe:** WANG (Lars, Tora, Henrik, Vetle) / Wille (Sofie, Ida, Emma) /
  Andre (Øyvind, Markus, Emil, Sondre, Marius, Aksel)
- **Status:** Aktiv (11) / Pause (1: Aksel)

### Hjemmebaner (for kart)

- GFGK: Øyvind, Sofie, Lars, Markus, Vetle
- Borre: Tora, Emil, Sondre
- Larvik: Ida, Henrik
- Halden: Marius, Aksel

### Cover-tonen

Cover-tittelen skal være *editorial og diagnostisk*: ikke "12 spillere",
men en setning som fortolker pulja. Bruk denne nøyaktig:

> 12 spillere.
> *Tre stiger.*
> *To stagnerer.*

(Tre korte setninger, italic på de to siste. "12 spillere." står i regular
Instrument Serif. Resten i italic.)

### Editorial åpningslinjer (eksempler)

- *"Pulja stiger samlet. Men Emil og Marius drar tyngst."*
- *"Tre på podiet. To som har stoppet opp."*
- *"+0,6 i snitt-trend. Tolv individuelle historier."*

---

## STRUKTUR — 5 spreads kombinert

Spillere-skjermen blander Cover, Stat-strip, Toggle-bar, Hovedflate
(tabell/tavle/kart) og en Field Notes-bunn med varslede oppfølginger.

Bruk **5 spread-arketyper** fra design.md seksjon 12:

1. **Cover (Arketype A, variant Hverdag)** — italic-tittel + lead
2. **KPI-strip (Atlas-modifisert)** — 4 nøkkeltall asymmetrisk
3. **Toggle-bar + Hovedflate** — Tabell (default) / Tavle / Kart, med
   filterskinne over
4. **Oppfølgings-rad (Lead Spread)** — 3 spillere som krever handling nå
5. **Kolofon**

Footer/kolofon nederst.

---

## DESKTOP 1440×900

### Layout

12-col med sidebar TOC permanent venstre (280px). Spillere er aktiv
sidebar-rad.

**Sidebar TOC:**
```
AK GOLF HQ · COACH
Utgave 048 · 17.05

01  Hub
02  Spillere      ●     ← aktiv
03  Bookinger
04  Stripe
05  Caddie
06  Sportsplan-lab
07  Tester

PORTALER
↳ PlayerHQ (som spiller)
↳ Booking
↳ Marketing

  Anders Kristiansen
  Head Coach · A-lisens
```

**Main content (max 1080px):**

### Spread 1 — Cover (12-col, kompakt)

Operativ cover. Asymmetrisk fordelt 8+4.

**Venstre 8-col:**
- Eyebrow: `● COACHHQ · SPILLERE · SØNDAG 17. MAI 2026 · 08:14`
  (med pulserende grønn live-prikk)
- Cover-tittel (Instrument Serif, blandet regular+italic, 80px):
  ```
  12 spillere.
  *Tre stiger.*
  *To stagnerer.*
  ```
- Lead-paragraf (Geist 17px, max-width 540px):
  *"Pulja stiger samlet — +0,6 slag snitt-trend siste 12 måneder. Men
  Emil og Marius drar tyngst, og Ida har en faktura 8 dager forfalt.
  Tre saker krever deg i dag."*

**Høyre 4-col — micro-status:**
```
3
KREVER OPPFØLGING
*Emil, Marius, Ida.*

[Hopp til kø →]
```
Tall i JBM 64px. Pull-tab tertiary størrelse S.

### Spread 2 — KPI-strip (4 stat-blocks, asymmetrisk: 3+3+3+3)

```
─────────────────────────────────────────────────────────

12             +0,6           28              3
SPILLERE       SNITT-TREND    RUNDER UKA      OPPFØLGING
TOTALT         12 MND                          KØ
*4 Pro,*       *Porteføljen*  *Snitt 2,3*     *1 urgent,*
*8 Gratis.*    *forbedres.*   *per spiller.*  *2 warning.*

─────────────────────────────────────────────────────────
```

Tall i JBM 56px, varierende vekt. Annotation italic 13px under hver.
Subtil hairline-divider over og under hele striperaden. Den siste
("Oppfølging-kø") har en lime-prikk venstre for tallet for å markere
at det krever handling.

### Spread 3 — Toggle-bar + Filter + Hovedflate

**Toggle-bar (segmented control, editorial-stil):**

```
[ TABELL ]   [ TAVLE ]   [ KART ]
─────────
   ●
```

Aktiv tab har 2px forest hairline under. Inaktive er Geist 500 13px caps
muted-fg. Bredde ca 380px, left-aligned. Plassert 32px under KPI-strip.

**Filter-skinne (under toggle, 16px luft):**

```
KATEGORI  [ Alle ] [ Pro-tier ] [ Gratis ]    GRUPPE  [ Alle ] [ WANG ] [ Wille ] [ Andre ]    STATUS  [ Aktiv ] [ Pause ]
```

Filter-label i Tiny caps (10px Geist tracking 0.1em), filter-chips som
pills (pill-radius 999). Aktiv chip har bg forest, cream tekst. Inaktiv
har muted bg, muted-fg tekst. 8px gap mellom chips, 24px gap mellom
filter-grupper.

#### Default-visning — TABELL (full bredde, 12-col)

Editorial-tabell uten vertikale gridlines. Header-rad i Tiny caps,
border-bottom 1px ink. Datarader har 1px var(--ak-border) hairline,
hover-state med bg var(--ak-muted) 50% alpha + translateY(-1px).

```
SPILLER                    HCP NÅ    TREND 12 MND        SISTE RUNDE       SG       NESTE       VARSEL
─────────────────────────────────────────────────────────────────────────────────────────────────────────
*Øyvind Rohjan*            +3,5      ↗  +1,7             69 (−3) · 13.05   +1,34    Eur. Am.    —
PRO · GFGK                                                                            28 d

*Sofie Larsen*             +0,8      ↗  +0,4             71 (−1) · 14.05   +0,82    Norges Cup  —
PRO · Wille                                                                          i morgen

*Markus R. Pedersen*       4,2       ↗  +2,1             69 (−3) · 11.05   +0,93    GFGK kval.  —
PRO · GFGK                                                                           14 d

*Lars Hansen*              1,2       →  0,0              72 (E) · 11.05    +0,91    NM jr.       —
PRO · WANG                                                                            42 d

*Tora Eriksen*             1,8       ↗  +0,9             73 (+1) · 10.05   +0,42    Borre Cup   —
GRATIS · WANG                                                                        21 d

*Vetle Sørensen*           3,1       ↗  +0,6             73 (+1) · 13.05   +0,32    GFGK kval.  —
GRATIS · WANG                                                                        14 d

*Ida Bjørklund*            5,5       →  +0,1             78 (+6) · 12.05   −0,18    —           ●●●●○ faktura 8d
GRATIS · Wille

*Henrik Olsen*             6,8       →  +0,1             79 (+7) · 14.05   −0,8     —           —
GRATIS · WANG

*Emil Strand*              8,4       ↘  −0,3             82 (+10) · 08.05  −1,2     —           ●●●●● test forfaller
GRATIS · Borre

*Marius Berg*              9,2       ↘  −0,5             84 (+12) · 05.05  −1,4     —           ●●●●● ingen plan
GRATIS · Halden

*Sondre Pettersen*         12,1      ↗  +1,8             86 (+14) · 06.05  −2,1     —           —
GRATIS · Borre

*Aksel Holmen*             14,5      →  0,0              89 (+17) · 09.05  −2,8     —           Pause
GRATIS · Halden                                                                                  siden 02.05
─────────────────────────────────────────────────────────────────────────────────────────────────────────
```

**Tabell-spec:**
- Hver rad har **to linjer**: linje 1 er hovedrad med tall, linje 2 er
  metadata (tier + gruppe + hjemmebane) i Tiny caps muted-fg.
- **SPILLER-kolonne:** italic Instrument Serif 17px. Klikkbar — åpner
  spiller-profil. Hover: forest underline glir inn fra venstre.
- **HCP NÅ:** JBM 16px tabular-nums. Plus-handikap viser med + prefix.
- **TREND 12 MND:** Mini-sparkline 80px bred × 24px høy + JBM-verdi med
  ↗ → ↘-glyfer. Stigende = forest stroke, stabil = muted, fallende =
  destructive.
- **SISTE RUNDE:** Score (E for even) + ± vs par + dato. JBM 14px.
- **SG:** JBM 16px tabular-nums med fortegn (typografisk minustegn).
  Plusverdier forest, minusverdier muted/destructive avhengig av om
  innenfor terskel.
- **NESTE:** Turnering + dager til. Tiny caps for turneringsnavn,
  JBM for dager.
- **VARSEL:** Severity-prikker + italic-tekst. Tom = "—".

**Sortable headers:** Klikk på header sorterer. Aktiv kolonne har
ChevronUp/Down ikon. Default: sortert på HCP NÅ stigende.

**Tabellrad 7 (Ida) og 9 (Emil) og 10 (Marius)** har subtil destructive
border-left 2px for å signalere at de krever oppfølging — men kun en
3px stripe, ikke full bg-shift.

#### Tavle-visning (toggle 2) — vises i miniatyr nederst som "preview"

Vis en miniatyr-versjon av Tavle-visningen under tabellen i en kollapsbar
seksjon med tittel *"Tavle-visning — klikk for å skifte"*. Eller (anbefalt):
vis Tavle-visningen i en `<details>`-blokk under tabellen, slik at Anders
ser at det finnes uten å forlate tabellen.

Tavle-spec for desktop:

```
TAVLE — 12 SPILLERE I 4 KOLONNER

STIGER (5)                  STABIL (4)              STAGNERER (2)           KREVER OPPFØLGING (3)
─────────────               ─────────────           ─────────────           ─────────────────────

┌──────────────┐            ┌──────────────┐        ┌──────────────┐        ┌──────────────┐
│ ØYVIND R.    │            │ LARS H.      │        │ EMIL STRAND  │        │ ●●●●●        │
│ +3,5  ↗+1,7  │            │ 1,2   → 0,0  │        │ 8,4   ↘ −0,3 │        │ EMIL STRAND  │
│ *Eur.Am 28d* │            │ *NM jr 42d*  │        │ *test 9d*    │        │ Test forfaller│
└──────────────┘            └──────────────┘        └──────────────┘        └──────────────┘

┌──────────────┐            ┌──────────────┐        ┌──────────────┐        ┌──────────────┐
│ SOFIE L.     │            │ IDA B.       │        │ MARIUS BERG  │        │ ●●●●●        │
│ +0,8  ↗+0,4  │            │ 5,5   → +0,1 │        │ 9,2   ↘ −0,5 │        │ MARIUS BERG  │
│ *Cup i morg* │            │ *—*          │        │ *ingen plan* │        │ Ingen plan   │
└──────────────┘            └──────────────┘        └──────────────┘        └──────────────┘

(...resterende kort...)                                                     ┌──────────────┐
                                                                            │ ●●●●○        │
                                                                            │ IDA B.       │
                                                                            │ Faktura 8d   │
                                                                            └──────────────┘
```

Hver kort har:
- Border-left i status-farge (forest / muted / destructive / warn)
- Spillernavn i Tiny caps + italic Instrument Serif
- HCP + trend som hovedlinje
- Italic-fragment nederst som beskriver "hvorfor her"
- Klikkbar — åpner spiller-profil

Kolonne-overskriftene er Subhead 24px Instrument Serif italic + (antall) i
JBM. 24px luft mellom kort i samme kolonne, 24px gutter mellom kolonner.

#### Kart-visning (toggle 3) — også som `<details>`-preview

```
KART — GEOGRAFISK FORDELING

[Norge-kart-SVG, asymmetrisk plassert venstre 8-col]
  ● GFGK (5 spillere) — Fredrikstad
  ● Borre (3) — Horten
  ● Larvik (2) — Larvik
  ● Halden (2) — Halden

Pins som forest sirkler 12-18px, størrelse proporsjonal med antall.
Tooltip på hover viser spillernavn-liste.

Høyre 4-col: Liste over baner med spillertall, gruppert.
```

For desktop-rammen: vis kun en visuell antydning av kartet (placeholder
med pen-and-ink-stil med banenavn-pins) — ikke et fullt utviklet kart.

### Spread 4 — Oppfølgings-rad (Lead Spread, full bredde)

Bakgrunn: cream-warm #F5EFE2 (Field Notes-arketype). 8+4-fordeling.

**Venstre 8-col — oppfølgings-liste:**

```
SUBHEAD 28PX ITALIC:
*Krever oppfølging i dag.*

───────────────────────────────────────────────────────

●●●●●  URGENT       EMIL STRAND · HCP 8,4 ↘
                    *HCP stagnerer fjerde måned på rad. Tester forfaller om 9 dager.*
                    Forrige Trackman: 8. februar. Sportsplan krever test hver 90 dag.
                    GRATIS · Borre · siste runde 82 (+10)

                    [Book Trackman →] [Skriv plan-revisjon] [Åpne profil →]

───────────────────────────────────────────────────────

●●●●●  URGENT       MARIUS BERG · HCP 9,2 ↘
                    *HCP nedover, ingen aktiv sportsplan.*
                    Siste plan utløp 12. april. Han har ingenting å gå mot.
                    GRATIS · Halden · siste runde 84 (+12)

                    [Skriv ny sportsplan →] [Book intro-økt] [Åpne profil →]

───────────────────────────────────────────────────────

●●●●○  WARNING      IDA BJØRKLUND · faktura #2026-082
                    *Utestående 8 400 kr. 8 dager forfalt.*
                    Andre påminnelse anbefalt. HCP er stabil — kun økonomi.
                    GRATIS · Wille · Larvik

                    [Send påminnelse →] [Se faktura] [Åpne profil →]

───────────────────────────────────────────────────────
```

Severity-prikker forest for aktive, muted for inaktive. Pull-tabs er
S-size (32px). Første er primary, andre secondary, tredje tertiary.

**Høyre 4-col — Marginalia:**
```
        ↘
   *Tre saker, tre forskjellige*
   *typer arbeid.*

   *Caddie har lagt frem*
   *forslag på alle tre i Hub.*

   [Gå til Caddie-kø →]
```
Med SVG-pil (stroke-dashoffset animasjon) som peker fra teksten ned
mot første rad.

### Kolofon nederst:
```
COACHHQ · SPILLERE · Utgave 048 · Søndag 17. mai 2026 · Trykket digitalt fra Fredrikstad
Redaktør: Anders Kristiansen · Head Coach · A-lisens NGF · AK Golf Group AS
```

---

## IPAD 1024×768 (landscape)

### Layout

Top-tab nav (48px), ingen sidebar. Main padding 32px hver side. Tabell
komprimeres til 5 kolonner.

```
┌──────────────────────────────────────────────────────────┐
│ COACHHQ · SPILLERE · 17.05 · 08:14              🔍 ⌘   │ ← 56px masthead
├──────────────────────────────────────────────────────────┤
│ [HUB] [SPILLERE●] [BOOKING] [STRIPE] [CADDIE] [MER]    │ ← 48px tabs
├──────────────────────────────────────────────────────────┤
│                                                            │
│ COVER (72px italic-tittel "12 spillere. Tre stiger.")     │
│ — lead-paragraf + micro-status til høyre                  │
│                                                            │
│ KPI-STRIP (4 stat-blocks, fortsatt 3+3+3+3)              │
│                                                            │
│ TOGGLE-BAR [TABELL ●] [TAVLE] [KART]                     │
│ FILTER-SKINNE (kompakt, 2 rader hvis nødvendig)          │
│                                                            │
│ TABELL — 5 kolonner: SPILLER · HCP · TREND · SG · VARSEL │
│ (siste runde + neste turnering skjules på iPad)          │
│                                                            │
│ OPPFØLGINGS-RAD (Lead Spread, 8+4 fortsatt OK)           │
│ — 3 spillere med pull-tabs                               │
│                                                            │
│ KOLOFON                                                   │
└──────────────────────────────────────────────────────────┘
```

**Tilpasninger fra desktop:**
- Cover-tittel: 72px (var 80)
- Stat hero i KPI-strip: 44-48px (var 56)
- Tabell komprimeres til 5 kolonner — SISTE RUNDE og NESTE TURNERING
  flyttes inn i andre-linjen (metadata) under spillernavnet
- Sparkline i TREND-kolonne kortes til 60px bred
- Touch-targets min 44px (pull-tabs L-size)
- ⌘K erstattes med søke-ikon (forstørrelsesglass) topp høyre
- Filter-chips kan ligge i to rader hvis nødvendig
- Tavle/Kart-preview kollapses til single `<details>` med subtil chevron

---

## IPHONE 393×852 (iPhone 15)

### Layout — card-stack, ikke tabell

På iPhone er tabell for trangt. Vi bruker **card-stack** som default.
Hver spiller er et editorial-card med to rader info. Filter-chips
øverst som horisontal scroll.

Bottom tab-bar (56px). Padding 16-20px hver side.

```
┌─────────────────────────┐
│ SPILLERE · ANDERS   🔍 │ ← 44px running head
├─────────────────────────┤
│                          │
│ ● COACHHQ · SPILLERE    │
│   SØN 17.05 · 08:14     │
│                          │
│ 12 spillere.             │ ← Cover-tittel 40px
│ *Tre stiger.*            │
│ *To stagnerer.*          │
│                          │
│ Pulja stiger samlet —    │
│ +0,6 snitt-trend. Men    │
│ tre saker krever deg     │
│ i dag.                   │
│                          │
│ ─────                    │
│                          │
│ 12     +0,6              │
│ TOT.   TREND             │
│                          │
│ 28     3                 │
│ UKA    OPPFØLGING        │
│                          │
│ ─────                    │
│                          │
│ ◀ Pro-tier · WANG · Wille · Andre · Aktiv ▶
│   (filter-chips, horisontal scroll)
│                          │
│ ─────                    │
│                          │
│ SORTERING: ▾ HCP stigende│
│                          │
│ ┌─────────────────────┐ │
│ │ ●●●●● URGENT        │ │ ← rød border-left 3px
│ │                     │ │
│ │ EMIL STRAND         │ │
│ │ *test forfaller 9d* │ │
│ │                     │ │
│ │ HCP   8,4   ↘ −0,3  │ │
│ │ Siste 82 (+10)      │ │
│ │ SG    −1,2          │ │
│ │ GRATIS · Borre      │ │
│ │                     │ │
│ │ [Book test →]       │ │
│ └─────────────────────┘ │
│                          │
│ ┌─────────────────────┐ │
│ │ ●●●●● URGENT        │ │
│ │                     │ │
│ │ MARIUS BERG         │ │
│ │ *ingen plan*        │ │
│ │                     │ │
│ │ HCP   9,2   ↘ −0,5  │ │
│ │ Siste 84 (+12)      │ │
│ │ SG    −1,4          │ │
│ │ GRATIS · Halden     │ │
│ │                     │ │
│ │ [Skriv plan →]      │ │
│ └─────────────────────┘ │
│                          │
│ ┌─────────────────────┐ │
│ │ ●●●●○ WARNING       │ │ ← gul border-left 2px
│ │                     │ │
│ │ IDA BJØRKLUND       │ │
│ │ *faktura 8d*        │ │
│ │                     │ │
│ │ HCP   5,5   → +0,1  │ │
│ │ Siste 78 (+6)       │ │
│ │ SG    −0,18         │ │
│ │ GRATIS · Wille      │ │
│ │ 8 400 kr forfalt    │ │
│ │                     │ │
│ │ [Send påminnelse →] │ │
│ └─────────────────────┘ │
│                          │
│ ─────                    │
│                          │
│ STIGER (5)               │
│                          │
│ ┌─────────────────────┐ │
│ │ ØYVIND ROHJAN       │ │
│ │ *Eur. Amateur 28d*  │ │
│ │ HCP +3,5  ↗ +1,7    │ │
│ │ SG +1,34 · GFGK     │ │
│ └─────────────────────┘ │
│                          │
│ ┌─────────────────────┐ │
│ │ SOFIE LARSEN        │ │
│ │ *Norges Cup i morg* │ │
│ │ HCP +0,8  ↗ +0,4    │ │
│ │ SG +0,82 · Wille    │ │
│ └─────────────────────┘ │
│                          │
│ ┌─────────────────────┐ │
│ │ MARKUS R. PEDERSEN  │ │
│ │ *69 i går*          │ │
│ │ HCP 4,2   ↗ +2,1    │ │
│ │ SG +0,93 · GFGK     │ │
│ └─────────────────────┘ │
│                          │
│ ┌─────────────────────┐ │
│ │ TORA ERIKSEN        │ │
│ │ *Borre Cup 21d*     │ │
│ │ HCP 1,8   ↗ +0,9    │ │
│ │ SG +0,42 · WANG     │ │
│ └─────────────────────┘ │
│                          │
│ ┌─────────────────────┐ │
│ │ VETLE SØRENSEN      │ │
│ │ *GFGK kval. 14d*    │ │
│ │ HCP 3,1   ↗ +0,6    │ │
│ │ SG +0,32 · WANG     │ │
│ └─────────────────────┘ │
│                          │
│ ─────                    │
│                          │
│ STABIL (4)               │
│ [Lars Hansen-card]       │
│ [Henrik Olsen-card]      │
│ [Aksel Holmen-card]      │
│                          │
│ ─────                    │
│                          │
│ STAGNERER (2)            │
│ [Emil og Marius vises    │
│  også her i lett-vekt    │
│  med pekepil til topp]   │
│                          │
│ ─────                    │
│                          │
│ KOLOFON                  │
│                          │
├─────────────────────────┤
│ [Filtrer · Sortér ⌃]   │ ← Sticky bunn-CTA
├─────────────────────────┤
│ 🏠 👥 📅 💳 🤖          │ ← Bottom tab-bar 56px
└─────────────────────────┘
```

**Sorterings-/grupperingslogikk på iPhone:**
1. **Oppfølgings-kø øverst** (3 cards med severity-border) — disse 3 er
   "lifted" til topp uansett sortering, og merket med URGENT/WARNING-pill.
2. **Deretter gruppert etter status** — STIGER (5), STABIL (4),
   STAGNERER (2) — som seksjons-overskrifter med antall i parentes.
3. **Innenfor hver gruppe:** sortert på HCP stigende (default), men
   sticky CTA nederst lar Anders endre.
4. **Stagnerer-gruppa har duplikater** av Emil + Marius som "lett-vekt"
   cards — med en pekepil-glyf opp til oppfølgings-kø øverst, slik at
   Anders forstår at samme spiller står begge steder.

**Tilpasninger fra desktop:**
- Cover-tittel: 40px (var 80)
- Lead body: 16px (var 17)
- KPI-strip: 2×2 grid kompakt (vs 4 side ved side)
- Tabell → card-stack: ingen kolonner side-by-side
- Toggle Tabell/Tavle/Kart erstattes med implicit Tavle (status-grupper)
- Filter-chips i horisontal scroll-rad
- Hver card har tap-feedback (scale 0.98)
- Sticky bunn-CTA: åpner bottom-sheet med sortering + filtrering
- Bottom tab-bar: Hub, Spillere, Bookinger, Stripe, Caddie
- Skip Kart-visning på iPhone (for trangt — link i bottom-sheet i stedet)

---

## INTERAKTIVITET (alle 3 enheter)

- **Page-load koreografi** (sekvensiell, 0-2000ms, se design.md seksjon 9)
- **Count-up** på "12" total spillere (0 → 12, 600ms)
- **Count-up** på "+0,6" snitt-trend (count-up med decimal, 600ms)
- **Count-up** på "28" runder uka (0 → 28, 600ms)
- **Count-up** på "3" oppfølgings-kø (0 → 3, 400ms — kort, vi er på jobb)
- **Sparkline-trender** i tabell tegnes inn med stroke-dashoffset
  (1200ms total, 50ms stagger per spiller-rad)
- **Severity-prikker** fade-in stagger venstre→høyre (50ms delay/prikk)
- **Tabellrader** fade-up stagger (30ms delay/rad, 12 rader = 360ms total)
- **Pulserende live-prikk** i eyebrow (2s loop)
- **Hover på rad/card:** subtil bg-shift til var(--ak-muted) 50% alpha
  + translateY(-1px)
- **Hover på spillernavn:** forest underline glir inn fra venstre (300ms)
- **Tap-feedback** på iPhone: lett scale(0.98) på press
- **Toggle-skift** (Tabell ↔ Tavle ↔ Kart): aktiv-marker glir 300ms,
  innholds-fade 200ms
- **Filter-chip-aktivering:** fade + scale(1.02), 200ms

---

## COMMAND PALETTE ⌘K (desktop + iPad)

På iPhone erstattes med søke-overlay (full screen) som åpner via
søke-ikon eller bottom-CTA "Filtrer · Sortér".

**20+ Spillere-spesifikke kommandoer** i kategorier:

**Spillere — direkte**
- Åpne Øyvind Rohjan
- Åpne Sofie Larsen
- Åpne Markus R. Pedersen
- Åpne Emil Strand (urgent)
- Åpne Marius Berg (urgent)
- Åpne Ida Bjørklund (warning)
- Søk spiller på navn

**Filtrering**
- Filtrer: kun Pro-tier
- Filtrer: kun Gratis
- Filtrer: kun WANG-gruppen
- Filtrer: kun Wille-gruppen
- Filtrer: kun Andre
- Filtrer: kun stigende trend
- Filtrer: kun stagnerende
- Filtrer: kun krever oppfølging
- Tilbakestill filtre

**Sortering**
- Sortér: HCP stigende
- Sortér: HCP fallende
- Sortér: 12-mnd-trend
- Sortér: SG total
- Sortér: siste runde
- Sortér: status (oppfølging først)

**Visning**
- Bytt til Tabell-visning
- Bytt til Tavle-visning
- Bytt til Kart-visning
- Vis kun Pro-tier i Tavle
- Eksporter pulje-rapport (PDF)

**Handlinger (på oppfølgings-kø)**
- Book Trackman Emil
- Skriv ny sportsplan Marius
- Send påminnelse Ida (8 400 kr)
- Marker Emil som «under oppfølging»
- Marker Marius som «under oppfølging»

**Pulje-handlinger**
- Legg til ny spiller
- Skriv fellesmelding til alle 12
- Skriv fellesmelding til Pro-tier
- Generer pulje-rapport mai
- Sammenlign denne uka med forrige

**Hjelp**
- Snarveier
- Bytt til Hub
- Send tilbakemelding

⌘K åpner med fade + scale-pop. Fuzzy search på tittel + kategori.
↑↓ Enter for å velge, Esc for å lukke. Vis "Sist brukt"-seksjon øverst
med Anders' 3 mest brukte kommandoer (typisk: Åpne Øyvind, Filtrer
oppfølging, Sortér på trend).

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

1. **3 designvalg som styrker Spillere-skjermen** — hva som gjør en
   pulje-oversikt redaksjonell uten å miste skanne-effektiviteten
2. **Hva du ville løftet i neste iterasjon** — én konkret ting per enhet
   (særlig: hvordan håndtere 24+ spillere uten å miste editorial-DNA)
3. **Hva du er usikker på** — hvor trenger du Anders' input?
