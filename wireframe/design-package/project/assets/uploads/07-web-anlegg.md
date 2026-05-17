# AK Golf Web — Anlegg-liste

## Identitet

- **Produkt:** Web
- **URL:** `/anlegg`
- **Arketype:** Web — kart + liste
- **HTML-referanse:** `wireframe/screen-deck/web/anlegg.html`
- **Audit:** `wireframe/audit/web-anlegg.md`

## Designsystem

Bruk `branding-style-guide.html` + `design-system-v2.md` + `web/_shared.css`.

## Spec — hva siden er for

Anlegg-listen viser hvor AK Golf opererer. Lar besøkende velge nærmeste
anlegg eller se alle tilbud. Hjelper geografisk kvalifisering — folk på
Vestlandet skal ikke booke på Bossum.

## Layout — UNIKT

### 1. Subhero (#0A1F18 gradient, 80px)

- Eyebrow: `VÅRE ANLEGG`
- H1: `Tren der *du er*.`
- Sub: `Fire anlegg i Østfold-regionen. Innendørs hele året, utendørs i sesong.`

### 2. Kart-seksjon (lys, 96px, asymmetrisk 60/40)

Venstre (60%): Norges-kart med 4 markører rundt Fredrikstad-Drobak (zoom-inn på Østfold)
- Pin Mulligan Indoor (Fredrikstad sentrum)
- Pin GFGK Range (Onsoy)
- Pin Bossum (Drobak)
- Pin Drobak GK (Drobak)

Klikk pa pin -> liste-rad scroller til, fremhever den

Hoyre (40%): Anlegg-liste, kompakt
- Mulligan Indoor — Fredrikstad — Innendors hele aret
- GFGK Range — Onsoy — Range + 18-hulls bane
- Bossum — Drobak — 18-hulls bane (sommer)
- Drobak GK — Drobak — 18-hulls bane (sommer)

### 3. Anlegg-grid (lys, 96px, grid-2)

4 store anlegg-cards. Hver card:
- Stort foto eller illustrasjon (16:9, 320px hoyde)
- Eyebrow (mono): adresse
- H3: Anlegg-navn
- 2-linje-beskrivelse
- Specs-row (3 stk):
  - Type (Innendors/Utendors/Begge)
  - Apent (Hele aret/Apr-Okt)
  - Coaching (Anders/Markus/...)
- CTA: `Se detaljer →`

**Cards:**
1. **Mulligan Indoor** — Storgata 12, Fredrikstad — 4 TrackMan-sim, kafe, lounge — Apent hele aret
2. **GFGK Range** — Onsoyveien 90, Onsoy — Range + 18-hulls bane Apr-Okt
3. **Bossum** — Bossumveien, Drobak — 18-hulls Apr-Okt — Coach: Julie Solem
4. **Drobak GK** — Drobakveien, Drobak — 18-hulls Apr-Okt — Coach: Julie Solem

### 4. Mørkt CTA-band

`Vil du se alt?` -> `Bestill omvisning →` + `+47 482 35 700`

### 5. Footer

## Klikkbare elementer

| Element | States |
|---|---|
| Kart-pin | default, hover (lime ring), klikk -> highlight liste-rad |
| Anlegg-card | default, hover (lift + ring), klikk -> /anlegg/[slug] |
| Liste-rad (kompakt) | default, hover (subtle bg), klikk -> kart pan |

## Empty / loading / error

- **Kart-loading:** Skeleton-kart med dempet bg, 4 placeholder-pins
- **Loading anlegg-cards:** Skeleton 16:9 + tekst-bars

## Ønsket output fra Claude Design

1. Full side i lyst tema med kart + 4 cards
2. Mobil <=640px — kart over liste, cards stables
3. Hover på Mulligan-card
4. Hover på Bossum-pin (kart-state)

## Ikke-mål

- Ikke designe anlegg-detalj (egen 08)
- Ikke include live ledig-kapasitet

## Når du er ferdig

Lim design-link tilbake.
