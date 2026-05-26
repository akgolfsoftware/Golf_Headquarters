# AK Golf Platform — PlayerHQ — Runder

## Identitet

- **Produkt:** PlayerHQ
- **URL:** `/portal/mal/runder`
- **Arketype:** B — List + filter
- **Tier-gating:** Alle ser grunndata. SG-kolonne er Pro-låst (vises som blur for Free).
- **HTML-referanse:** `wireframe/screen-deck/playerhq/runder.html`
- **Audit:** `wireframe/audit/playerhq-runder.md`
- **Tilhørende modaler:** `RoundDetailModal`, `RoundInsightModal`, `LogRoundModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst. PlayerHQ-sidebar er LYS. Tabular nums (JetBrains Mono) på alle score-kolonner. Eksakte token-navn — ikke hardkode hex. Markus er referanse-spilleren.

## Spec — hva skjermen er for

Runde-historikken er Markus' egen score-loggbok. Hver rad er en fullført 18-hulls runde med totalsum, vs par, og nøkkel-statistikk. Brukes ukentlig for å logge nye runder og månedlig for trendanalyse. SG (Strokes Gained) er Pro-features som demonstrerer oppgrader-verdi.

## Layout — UNIKT for denne skjermen

Bruker arketype-B-felles-spec fra `README.md`. I tillegg:

- **Hero italic Instrument Serif 36px:** *«14 runder denne sesongen, Markus.»* Sub: «Snitt: 79,3 · Beste: 74 (Borre, 22. apr)»
- **KPI-strip (4 kort):**
  - Snitt score 2026: «79,3» (JetBrains Mono 32px)
  - Vs par snitt: «+7,3»
  - Beste runde: «74 (–1)»
  - Trend siste 5: «↓ 2,1»
- **Tabell-rader:** 14 runder, 56px høy, JetBrains Mono på alle tall
  - Kol 1: Dato (JetBrains Mono 12px, f.eks. «8. mai 2026»)
  - Kol 2: Bane (Inter Tight 14px) + sub (tee-pill «Gul»)
  - Kol 3: Score: «78» (JetBrains Mono 16px tabular)
  - Kol 4: Vs par: «+6» (farget — under par grønn, par muted, over par destructive subtil)
  - Kol 5: SG total: «+0,4» (Pro-låst — for Free vises blur + lucide `Lock`)
  - Kol 6: FIR: «9/14» (JetBrains Mono)
  - Kol 7: GIR: «11/18»
  - Kol 8: Putts: «32»
  - Kol 9: «Detaljer →»-link → `RoundDetailModal`
- **Insight-pin:** Hver 4. rad har lucide `Sparkles`-ikon i kol 9 → klikk åpner `RoundInsightModal` (AI-genererte funn)

## Filter-bar — UNIKT

- Søk: «Søk bane …»
- Chip: **Bane** (autocomplete) — Borre · GFGK · Onsøy · Larvik
- Chip: **Periode** — Sesongen · Siste 30 dager · Siste 90 dager · Alt
- Chip: **Tee** — Hvit · Gul · Rød
- Sort: Dato (nyeste først, default) · Score · Vs par · Bane
- Primary CTA: `+ Logg runde` → åpner `LogRoundModal`. Sekundær: `Importer fra GolfBox →`

## Klikkbare elementer

Se `wireframe/audit/playerhq-runder.md`. UNIKT:

| Element | States |
|---|---|
| Runde-rad | default, hover (subtil bg-shift), klikk → `RoundDetailModal` |
| «Detaljer →»-link | default, hover, focus |
| Insight-pin (lucide `Sparkles`) | default, hover (tooltip «AI-funn tilgjengelig»), klikk → `RoundInsightModal` |
| SG-kolonne for Free | blur(4px) + lucide `Lock` overlay + tooltip «SG-analyse er Pro-feature» |
| Vs par-pill | grønn (under par), muted (par), warning (+1 til +3), destructive subtil (+4+) |
| `+ Logg runde`-CTA | default, hover, active, focus, loading |
| Sort-pil i kolonne-header | default, hover, sort-asc, sort-desc |
| Tee-pill | farger: hvit (subtil border), gul (accent), rød (destructive subtil) |

## Empty / loading / error / tier-låst-states

Bruker arketype-B-felles. UNIKT:
- **Empty (ny bruker):** «Ingen runder logget ennå. Logg din første →» + sekundær «eller importer fra GolfBox →»
- **Tier-låst (Free):** SG-kolonne vises blurret med lucide `Lock` på første rad og CTA-link «Lås opp SG-analyse →»
- **Loading:** 5 grå skeleton-rader
- **Error:** Per-tabell retry

## Ønsket output fra Claude Design

1. Hovedskjerm lyst tema (Pro-bruker — alle kolonner synlige)
2. Hovedskjerm lyst tema (Free-bruker — SG-kolonne blurret med lock)
3. Mørkt tema
4. Hover-state på rad
5. Insight-pin tooltip + hover
6. Empty (ny bruker)
7. Mobil ≤640px — kort-layout (én rad per kort, alle kolonner stables)

## Ikke-mål

- Ikke designe `RoundDetailModal`, `RoundInsightModal` (egne pakker senere)
- `LogRoundModal` designes som pakke 21 — ikke design her
- Ikke designe rundedetalj-skjerm (`/portal/mal/runder/:id` — egen batch)
