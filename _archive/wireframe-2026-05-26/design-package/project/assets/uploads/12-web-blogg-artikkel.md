# AK Golf Web — Blogg-artikkel (long-form)

## Identitet

- **Produkt:** Web
- **URL:** `/blogg/[slug]`
- **Arketype:** Web — long-form editorial
- **HTML-referanse:** `wireframe/screen-deck/web/blogg-artikkel.html`
- **Audit:** `wireframe/audit/web-blogg-artikkel.md`

## Designsystem

Bruk `branding-style-guide.html` + `design-system-v2.md` + `web/_shared.css`.

## Spec — hva siden er for

Long-form artikkel-side. Optimert for lesing — narrow content-kolonne,
generos linje-hoyde, reading-progress-bar. Reading-tid: 5-15 min.

## Layout — UNIKT

### 1. Article-hero (lys, 96px, sentrert max 720px)

- Eyebrow (mono): `COACHING · 12. MAI 2026`
- H1 (Inter Tight 56px): `Hvorfor *AoA* er viktigere enn klubbhastighet for amatorer.`
- Lede (Inter 20px italic): `Vi har analysert 1 200 amatorer pa TrackMan, og funnet at angle of attack predikerer score bedre enn noe annet enkelt-tall.`
- Meta-rad:
  - Avatar Anders (40px)
  - `Anders Kristiansen` (link til /coaches/anders-kristiansen)
  - Sub: `8 min lesning · Oppdatert 14. mai 2026`
- Sosiale share-knapper (LinkedIn, X/Twitter, Facebook, kopier link)

### 2. Featured-bilde (lys, full bredde 1200px max, 16:9)

Stor bilde med caption under (italic Instrument Serif 14px).

### 3. Reading-progress-bar (sticky toppen, 3px)

Lime fyll som vokser nar man scroller.

### 4. Article-body (lys, 96px, narrow 720px sentrert)

Long-form content med korrekt typografi:
- Body (Inter 18px, line-height 1.7)
- H2 sub-headers (Inter Tight 32px italic)
- H3 (Inter Tight 22px)
- Block-quote (Instrument Serif italic 24px med venstre-border lime 3px)
- Bilder med caption
- Lister (ul/ol)
- Tabeller (sammen-style som pris-tabell)
- Code/data-blokker hvis relevant (mono)
- TrackMan-data-grafer hvis relevant (embed)

5-7 seksjoner med h2-headers. Eksempel-struktur:
1. Hva er AoA?
2. Datasettet
3. Hvorfor predikerer AoA score?
4. 3 oevelser for aa fikse AoA
5. Konklusjon

### 5. Forfatter-card (lys-sand, 64px, narrow 720px)

Bio-card etter artikkel:
- Avatar Anders (80px)
- Navn + tittel
- 2-linje-bio
- CTAs: `Se min profil →` + `Book intro →`

### 6. Relaterte artikler (lys, 96px)

`Les mer:` 3 relaterte artikkel-cards (samme stil som blogg-grid).

### 7. Newsletter-CTA (mørkt band)

`Faa neste artikkel i innboksen.` -> Email-input + Abonner.

### 8. Footer

## Klikkbare elementer

| Element | States |
|---|---|
| Reading-progress-bar | scrubs as user scrolls |
| Sosiale share-knapper | default, hover (lime), klikk -> open share |
| Inline lenker i body | default, hover (lime underline), visited |
| Bilde i body | klikk -> lightbox |
| Forfatter-CTA | default, hover, active |
| Relatert-card | default, hover, klikk -> artikkel |

## Empty / loading / error

- **404 ukjent slug:** redirect til /blogg
- **Loading:** SSR — minimal loading-state

## Ønsket output fra Claude Design

1. Full artikkel i lyst tema, scrolled til midt-pa
2. Mobil <=640px — narrow blir full bredde, h1 blir 36px
3. Reading-progress 50%
4. Sosial-share knapp i hover-state
5. Block-quote i artikkel-body

## Ikke-mål

- Ikke include kommentarer
- Ikke include "lest av X"-counter
- Ikke designe paywall (alle artikler er gratis)

## Når du er ferdig

Lim design-link tilbake.
