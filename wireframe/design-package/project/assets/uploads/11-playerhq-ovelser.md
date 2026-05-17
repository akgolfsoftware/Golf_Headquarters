# AK Golf Platform — PlayerHQ — Øvelses-bibliotek

## Identitet

- **Produkt:** PlayerHQ
- **URL:** `/portal/tren/ovelser`
- **Arketype:** B — List + filter (grid-variant)
- **Tier-gating:** Alle ser. «Lagre i favoritter» og «Lag egen øvelse» er Pro-låst.
- **HTML-referanse:** `wireframe/screen-deck/playerhq/ovelser.html`
- **Audit:** `wireframe/audit/playerhq-ovelser.md`
- **Tilhørende modaler:** `DrillChallengeModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst. PlayerHQ-sidebar er LYS (`#FFFFFF`, høyre-border `#F0EDE5`). Maks 3 lime per skjerm. Markus er referanse-spilleren. Eksakte token-navn — ikke hardkode hex.

## Spec — hva skjermen er for

Øvelses-biblioteket er Markus' verktøy-skuff for selvstendig trening. Han bla'r gjennom 24 forhåndsbygde øvelser organisert etter pyramide-kategori og vanskelighetsgrad. Hver øvelse kan startes som drill-challenge eller legges i favoritter. Skjermen er primært en utforsknings-flate, ikke en logg.

## Layout — UNIKT for denne skjermen

Bruker arketype-B-felles-spec fra `README.md` (sidebar, hero, filter-bar). I tillegg:

- **Hero italic Instrument Serif 36px:** *«Velg din neste øvelse, Markus.»* Sub: «24 øvelser · 5 kategorier»
- **Ingen KPI-strip** — direkte til filter-bar
- **Grid-layout:** 4 kolonner × 6 rader = 24 cards (desktop). Tablet: 3×8. Mobil: 1×24.
- **Card-spec (260×280px):**
  - Topp-thumbnail (aspect-ratio 16:9): pyramide-farget bg + sentrert lucide-ikon (`Target`/`Flag`/`CircleDot`/`MoveHorizontal`/`Zap`)
  - Pyramide-stripe (4px) langs venstre kant — kategori-farge
  - Tittel (Inter Tight 16px semibold): f.eks. «3-meters putte-grid»
  - Kategori-pill: «Putte» (pyramide-farge bg, 11px tekst)
  - Meta-rad: lucide `Clock` 14px + «15 min» (JetBrains Mono) · lucide `BarChart3` + 3-prikks vanskelighet
  - Hjerte-ikon (lucide `Heart`) øverst-høyre — Pro-låst (lock-tooltip for Free)
- **Hover-state:** lift 2px + accent-border 1px

## Filter-bar — UNIKT

- Søk: «Søk øvelser …»
- Chip-rad (multi-select):
  - **Kategori:** Putte (8) · Chip (4) · Iron (5) · Driver (4) · Wedge (3)
  - **Vanskelighet:** Lett · Moderat · Krevende
  - **Varighet:** ≤15 min · 16–25 min · 26+ min
- Sort: Populært (default) · Nyeste · A–Å · Varighet
- Primary CTA: `+ Lag egen øvelse` → Pro-låst, viser tooltip ved hover for Free

## Klikkbare elementer

Se `wireframe/audit/playerhq-ovelser.md`. UNIKT:

| Element | States |
|---|---|
| Øvelses-card | default, hover (lift + accent-border), active, klikk → `DrillChallengeModal` |
| Hjerte-ikon (favoritt) | default, hover, filled (favorisert), Pro-låst (40% opacity + lucide `Lock`) |
| Kategori-pill på card | default, klikk → toggle filter-chip |
| Filter-chip | default, hover, selected (accent-bg + count-badge), disabled |
| `+ Lag egen øvelse`-CTA | Pro-låst med tooltip «Pro-feature — oppgrader →» |
| Sort-dropdown | default, open, item-hover, item-selected |

## Empty / loading / error / tier-låst-states

Bruker arketype-B-felles. UNIKT:
- **Empty filter:** «Ingen øvelser matcher filteret. Tilbakestill →»
- **Loading:** 8 grå skeleton-cards i grid
- **Error:** Per-grid retry-card
- **Tier-låst (Free):** Hjerte-ikon på alle cards demper til 40% opacity + lucide `Lock` overlay. Tooltip ved hover: «Lagre øvelser med Pro»

## Ønsket output fra Claude Design

1. Hovedskjerm lyst tema (Pro-bruker)
2. Hovedskjerm lyst tema (Free-bruker — lock-overlay på favoritt + CTA)
3. Mørkt tema
4. Hover-state på ett card
5. Filter aktivt (3 chips valgt, viser 7 av 24)
6. Empty (filter gir 0)
7. Mobil ≤640px (1 kolonne, kort stables)

## Ikke-mål

- Ikke designe `DrillChallengeModal` (egen pakke senere)
- Ikke designe individuell øvelse-detalj (`/portal/tren/ovelser/:id` — egen batch)
- Ikke endre antall kategorier (5 er fast — pyramidens lag)
