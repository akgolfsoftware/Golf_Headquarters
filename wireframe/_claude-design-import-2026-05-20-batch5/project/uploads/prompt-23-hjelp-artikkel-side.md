# Prompt 23 — Hjelp-artikkel full-page side

## Hensikt

`/portal/meg/help/[slug]` — full-page versjon (komplement til drawer i prompt 19). Brukes når man kommer fra direkte lenke (e-post, deling).

## Trigger

Routing direkte til `/portal/meg/help/pyramide-systemet` etc.

## Layout

- Container max-width 760 px, cream, `py-16 px-6`.
- Topp-bar: tilbake-pil til hjelp-hub + breadcrumb.
- Hero-sektion `py-10`:
  - Eyebrow JetBrains Mono "TRENING · ARTIKKEL"
  - Tittel Inter Tight 40 px italic Instrument Serif "*Hva er pyramide-systemet?*"
  - Meta-rad: avatar Anders K + navn + lesetid + sist oppdatert
- TOC sticky høyre (på bred skjerm): liste med headings, aktiv lime.
- Prose-body: 
  - Headings Inter Tight
  - Paragrafer Inter 16 px line-height 1.7
  - Lister, callouts (lime-tint card), code JetBrains Mono
  - Illustrasjoner full-bredde med italic bildetekst
- "Var dette nyttig?"-bunn:
  - Thumbs Up/Down store knapper
  - Tekstfelt for feedback
- Relaterte artikler 3 cards.
- CTA-blokk forest-mørk gradient nederst: "Trenger du mer hjelp? Snakk med coach"

## Komponenter

- Server component, prose-renderer (MDX), `Card`, `Button`
- Lucide: ArrowLeft, Clock, User, ThumbsUp, ThumbsDown, ArrowUpRight, MessageSquare, Sparkles

## Eksempel-data

```
Slug: pyramide-systemet
Tittel: Hva er pyramide-systemet?
Kategori: Trening
Forfatter: Anders K
Lesetid: 5 min
Sist oppdatert: 12. mai 2026
Innhold: 4 headings, 2 illustrasjoner, 1 callout
```

## Branding-krav

- Cream, forest, lime + Inter Tight + Instrument Serif italic på hero.
- JetBrains Mono for metadata.
- Norsk bokmål.

## Tilstander

- **Loading**: skeleton hero + 4 paragrafer.
- **404**: empty-state med søk.
- **Innlogget vs anonym**: anonym ser CTA "Logg inn for å spørre coach".
