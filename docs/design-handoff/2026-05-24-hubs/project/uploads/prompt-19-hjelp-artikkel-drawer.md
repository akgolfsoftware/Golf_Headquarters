# Prompt 19 — Hjelp-artikkel drawer

## Hensikt

Når Markus klikker en populær artikkel eller kategori-card i `/portal/meg/help`, åpnes en høyre-drawer (i stedet for full-page redirect) som viser artikkelinnholdet, med inline-søk og "Var dette nyttig?"-feedback.

## Trigger

Klikk på artikkel-rad eller kategori-card.

## Layout

- Drawer høyre 640 px bred, cream, `p-8`, sticky topp.
- Topp: eyebrow `PLAYERHQ · HJELP · TRENING`, X-ikon.
- Breadcrumb JetBrains Mono "Trening / Pyramide-systemet"
- Tittel Inter Tight 28 px italic "*Hva er pyramide-systemet?*"
- Meta-rad: lesetid (5 min · JetBrains Mono), forfatter Anders K, dato.
- TOC-collapse "I denne artikkelen": liste med headings.
- Prose-body: prose-styling, paragrafer Inter 15 px, headings Inter Tight, kode JetBrains Mono.
- Embeded illustrasjoner med bildetekst Instrument Serif italic.
- Nederst:
  - "Var dette nyttig?" — Thumbs Up/Down knapper med count
  - Relaterte artikler 3 stk listet
  - CTA "Snakk med coach" forest pill

## Komponenter

- `Sheet`, `Collapsible`, `Button`, prose-renderer
- Lucide: X, Clock, User, ThumbsUp, ThumbsDown, ArrowUpRight, MessageSquare

## Eksempel-data

```
Artikkel: "Hva er pyramide-systemet?"
Kategori: Trening
Lesetid: 5 min
Forfatter: Anders K
Sist oppdatert: 12. mai 2026
Helpful: 142 ja, 8 nei
Related: "Slik logger du første økt", "Hva betyr TEK?", "Forskjellen TEK og SLAG"
```

## Branding-krav

- Cream bakgrunn, forest lenker, lime aksent ved hover.
- Instrument Serif italic kun for hero-tittel og bildetekster.
- JetBrains Mono for metadata.
- Norsk bokmål.

## Tilstander

- **Lastet**: vis innhold.
- **Loading**: skeleton 4 paragrafer.
- **Ikke funnet**: empty-state med søk.
