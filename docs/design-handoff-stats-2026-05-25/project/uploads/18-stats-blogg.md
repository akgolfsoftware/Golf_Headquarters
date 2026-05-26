# Design-prompt 18 — `/stats/blogg` + `/stats/blogg/[slug]` — Datadrevne artikler

> Les `00-master-brief.md`.

**Side:** Stats-blogg — datadrevne editorial-artikler
**Bruker:** SEO-trafikk · Returbesøkende som vil ha "dypere" innhold
**Hovedoppdrag:** SEO-magnet + tankelederskap. Artikkel av typen "Hvorfor norske 17-åringer er dårligere på putt enn deres svenske jevnaldrende" gir nyhetsbrev-signups og SEO.

---

## Datakilder

Markdown-baserte artikler i `content/stats-blogg/`:

```typescript
const ARTIKKEL = {
  slug: "norske-vs-svenske-juniorer-putt-2026",
  tittel: "Hvorfor norske 17-åringer er dårligere på putt",
  undertittel: "En analyse av 14 000 putt-data fra Srixon Tour og Sverige Junior Open",
  forfatter: "Anders Kristiansen",
  publisert: Date,
  oppdatert: Date,
  kategori: "Analyse",
  lestid: 6,                        // minutter

  hero: {
    bilde: string | null,
    kicker: "Junior-golf · Putt-statistikk",
  },

  // Markdown med custom MDX-komponenter:
  // <Chart>, <Stat>, <Sammendrag>, <Quote>
  innhold: string,

  // Relaterte
  relaterte: Array<{ slug, tittel, kategori }>,
};

// Liste-side
const ARTIKLER: Array<Pick<ARTIKKEL, "slug" | "tittel" | "undertittel" | "publisert" | "kategori" | "lestid">>;
```

---

## Designoppdrag

### DEL A — `/stats/blogg` (artikkel-liste)

### 1. Hero — magazine-stil header

- Eyebrow: "AK GOLF STATS · ANALYSE"
- Headline: "Tall som *betyr noe*."
- Sub: "Datadrevne artikler om norsk og internasjonal golf. Skrevet av folk som faktisk forstår SG."

### 2. Featured artikkel — stor hero-card

Toppen av liste, en featured artikkel:

```
┌────────────────────────────────────────────┐
│ [Stort hovedbilde / illustrasjon]          │
│                                            │
│                                            │
└────────────────────────────────────────────┘

DENNE UKEN · ANALYSE                  6 min

Hvorfor norske 17-åringer 
er dårligere på putt
En analyse av 14 000 putt-data...

Av Anders Kristiansen · 23. mai 2026
```

### 3. Kategori-filter

Pills:
- [Alle] [Analyse] [Junior] [PGA Tour] [Norske spillere] [Banedata]

### 4. Artikkel-grid

3-kolonne grid på desktop, hver card:

```
┌──────────────────────────┐
│ [Bilde 16:9]             │
│                          │
│ ANALYSE · 23. mai        │
│ Hvorfor norske 17-       │
│ åringer er dårligere     │
│ på putt                  │
│                          │
│ 6 min lesetid →          │
└──────────────────────────┘
```

- Bilde øverst
- Mono kicker (kategori + dato)
- Tittel (font-display, italic på key-word)
- Lesetid + pil
- Hele klikkbart

### 5. Nyhetsbrev-CTA

Mid-side:

```
Få analysene direkte i innboksen.

[ din@email.com    ] [ Meld på → ]
1-2 artikler per måned. Vi spammer ikke.
```

### 6. "Mest leste denne måneden"

Sidebar eller bunn-strip med 5 mest-leste artikler.

---

### DEL B — `/stats/blogg/[slug]` (artikkel-detalj)

### 1. Hero — editorial magazine-spread

```
ANALYSE · JUNIOR · PUTT-STATISTIKK

Hvorfor norske 17-åringer
er dårligere på putt

En analyse av 14 000 putt-data fra Srixon Tour og 
Sverige Junior Open.

Av Anders Kristiansen · 23. mai 2026 · 6 min lesetid
```

- Eyebrow med kategorier (kommadelt)
- Hovedtittel: Inter Tight 56px+, italic på key-word
- Undertittel: 24px muted
- Forfatter-byline + dato + lesetid

### 2. Eventuelt hovedbilde (16:9)

Hvis vi har bilde/illustrasjon. Hvis ikke, vis en SVG-illustrasjon av "putt-data" (4 puttavstander med fargede sirkler).

### 3. Brødtekst-design

Tett "longform"-typografi:

- **Inter** for brødtekst, 18-20px
- Line-height 1.7
- Max-width 680px (lesbarhet)
- Sentrert på siden
- Tilstrekkelig whitespace mellom paragraphs
- Headings: Inter Tight med italic på key-words
- Bold: `font-semibold`
- Italics: `italic`
- Links: forest underline, lime hover

### 4. MDX-komponenter

Innenfor artikkel-flow kan forfatter sette inn:

**`<Chart>`** — embedded grafikk
```
┌─────────────────────────────────┐
│                                  │
│   [Linjegraf med tre linjer]    │
│                                  │
└─────────────────────────────────┘
SOURCE: AK Golf Stats database
```

**`<Stat>`** — pull-out stat
```
82%
av PGA Tour-putter fra 3m går inn.
Norsk junior-snitt: 45%.
```

Lime/forest pille midt i flow. Stor mono tall.

**`<Sammendrag>`** — TL;DR-box
```
KORT FORTALT
• Norske 17-åringer synker 12% færre 5m-putter enn svenske
• Forskjellen er størst på 8-10m
• Trolig forskjell i treningsmetodikk
```

**`<Quote>`** — pull-quote
```
"En 5-meter er ikke en birdie-mulighet — den er en 
forsvarsslag. Norske juniorer behandler den feil."

— Mark Broadie, Columbia Business School
```

Italic Inter Tight, 24px, sentrert max-width-500.

**`<Spiller>`** — inline spiller-link
```
Anders Halvorsen (Oslo GK)
```

Klikkbart, lenker til `/stats/spillere/[slug]`.

### 5. Forfatter-box (etter artikkel)

```
─────────────────────────────────────
[Avatar] Anders Kristiansen
        Grunnlegger av AK Golf · 20+ års coaching

        Skrevet av Anders, som har trent norske
        juniorer siden 2003. Hans bok "Strokes
        Gained for Coaches" publiseres i 2027.

        [Se alle artiklene mine →]
─────────────────────────────────────
```

### 6. Relaterte artikler

```
LES OGSÅ

• Hvilken klubb produserer flest pro-spillere?
• Bedre svette enn forsøke: hvorfor amatører skal trene speed-control
• Norske college-spillere: hvem er ute, og hvem kommer hjem?
```

3 cards lik liste-siden.

### 7. Nyhetsbrev-CTA

Etter artikkel, før footer.

### 8. Kommentarer (optional)

Hvis vi vil ha det: lette kommentarfelt med moderering. Ellers: dropp.

### 9. Sosial-deling

Sticky høyre-side eller bunn-bar:
- Kopier-lenke
- X / Twitter (auto-tekst med artikkel-tittel)
- LinkedIn (for faglig-treffende artikler)

---

## Mobile-tilpasning

- Featured artikkel: bilde 16:9 i topp, tekst under
- Grid blir 1-kolonne
- Artikkel-sider: max-width fjernes, hele bredden brukes
- MDX-komponenter: full-width, mindre paddding
- Sticky social-bar: blir bunn-strip

## Mikrointeraksjoner

- Artikkel-card: hover gir 4px lift + lime border-glow
- Lesetid-indikator (i artikkel-detalj): subtil progress-bar øverst som fylles ettersom du scroller
- Pull-quotes: fade in når i view
- "Mest leste"-tags: trending-icon med subtil pulse

---

## Inspirasjon

1. **The Athletic articles** — sport-data + editorial typografi
2. **stratechery.com** — single-author tech analyse
3. **fivethirtyeight.com features** — data + prose + interaktiv chart
4. **dataviz.theathletic.com** — sport-spesifikk datavis-blogg

## Output

- Liste-side komplett sketch
- Artikkel-detalj-side komplett sketch
- MDX-komponent-bibliotek (Chart, Stat, Sammendrag, Quote, Spiller)
- Forfatter-box-pattern
- Mobile-flow

---

## Implementasjon-notater

- Artikler skrives i `content/stats-blogg/*.mdx`
- Frontmatter: slug, tittel, undertittel, forfatter, publisert, kategori, lestid, hero
- ISR med revalidate: 3600
- RSS-feed på `/stats/blogg/rss.xml`
- Sitemap auto-genereres
- OpenGraph image per artikkel via `next/og`
