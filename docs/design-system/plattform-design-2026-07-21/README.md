# Plattform-design 2026-07-21

Komplett designforslag for AK Golf HQ (wireframe + hi-fi + inventar).

## Åpne dette

```bash
open docs/design-system/plattform-design-2026-07-21/index.html
```

Eller dobbeltklikk `index.html` i Finder.

## Filer

| Fil | Hva |
|---|---|
| `index.html` | Start her |
| `wireframes.html` | 8 familier + alle skjermer som wireframe-kort |
| `hifi.html` | Hi-fi kjerne + mal for alle kombinasjoner |
| `inventar.html` | Filtrerbar liste over alle ruter |
| `flyter.html` | End-to-end stier |
| `INVENTAR.md` | Samme liste i markdown |
| `inventar.json` | Maskinlesbar |

## Metode

1. Hver rute tilhører **én familie** (Hub, Liste, Detalj, Wizard, Live, Analyse, Kalender).
2. Familien har **wireframe + hi-fi-mal**.
3. Unike skjermer er spesifisert med **5-sekunders jobb** + **primær CTA**.
4. Kjerne-skjermer (hjem, analyse, workbench, live, stall, 360, forelder) har **full hi-fi mockup**.

## Ikke i denne leveransen

- Pixel-port til React for alle 361 (gjør bølgevis etter GO)
- Open Design / Claude Design-synk (kan lastes opp senere)
- Endring av tokens (fasiten står)

## Neste steg for Anders

1. Åpne `index.html`
2. Si hva som er feil / mangler på familiene
3. GO på bølge 1 kode (Workbench + bro + live) eller juster design først
