# Workbench-handover — 20.09.2026

Kilde: Claude Design, master `Workbench WB-05-11.dc.html` + 16 PNG i `workbench-handover/`.
Master, 16 PNG-er i 2×, manifest, SKILL, logoer og designverdier er importert til
[`docs/design/workbench-handover/`](design/workbench-handover/manifest.md).
Kilden er [Workbench uke-kroppen](https://claude.ai/design/p/830e7bce-eaba-465b-848c-26f73bd0f2d3).
Importen 20.09 inkluderer Anders' avklaring: grafitt på øktkort og fordelinger,
rust bare på Publiser / Godkjenn / START ØKT. Periode har «Valgt periode».
Se [importkontroll og gjenstående arbeid](design-audit/workbench-handover-import-2026-09-20.md).
Import er ikke visuell godkjenning av appen. `selectedForBuilding` er ikke endret.

## Chrome (låst)

- topp 56 · seks nav: Hjem · Innboks · Kalender · Stall · Workbench · Godkjenninger
- logo-ak-golf-hq.svg 30 px
- 8 piller én rad, radius 2, treff 44: År · Periode · Måned · Uke · Økt · Stall · Live · Min kalender
- kilde 236 bare der tabellen sier ja
- inspector 340
- sand #F2F1ED · mørkt kun Live `[data-surface=live]` + negativ logo
- rust #9B2415 kun Publiser / Godkjenn / START ØKT

## Piller

| Pille | Inspector | Kilde 236 | Merknad |
| --- | --- | --- | --- |
| År | Valgt periode | ja | båndklikk velger; Åpne periode bytter pille |
| Periode | Valgt periode | ja | tidslinje, volum i timer |
| Måned | Valgt dag | ja | 7 kolonner, maks 3 linjer + «+N mer» |
| Uke | Valgt uke | ja | 05:00–22:00 / 60 min / timerad 32 / chip min 44 |
| Økt | Valgt øvelse | ja | formel 8 + ? |
| Stall | Valgt økt | nei | liste + 340, Godkjenn økt rust |
| Live | Neste i planen | nei | mørk, START ØKT |
| Min kalender | Valgt økt | ja | ingen Publiser, Åpne økt grafitt |

## Kode pushet 20.09.2026

- `src/components/workbench/WeekGrid.tsx` — `startHour=5`, `endHour=22`, `hourPx=32`
- Øvrige piller venter på portering. Master-HTML og PNG-er finnes nå i mappen over.
