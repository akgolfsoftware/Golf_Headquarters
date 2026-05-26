# AK Golf Platform — PlayerHQ — Mål-detalj (HCP-trend)

## Identitet

- **Produkt:** PlayerHQ
- **URL:** `/portal/mal/:id`
- **Arketype:** C — Detail + tabs (3 tabs, mål-detalj med projeksjon)
- **Tier-gating:** **Pro** for trend + projeksjon. Free ser kun current HCP.
- **HTML-referanse:** `wireframe/screen-deck/playerhq/mal-detalj.html`
- **Audit:** `wireframe/audit/playerhq-mal-detalj.md`
- **Tilhørende modaler:** `EditGoalModal`, `ShareWithParentModal`, `DataPointPopover`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Spilleren ser sitt HCP-mål med historikk siste 6 måneder + projeksjon 7 måneder fremover (basert på trend). Delmål er sub-komponenter (f.eks. "Score < 75 i 3 runder på rad"). Foresatte kan dele rapporten.

## Header-blokk — UNIKT

- **Avatar/ikon:** rounded-lg 64px med Lucide `TrendingDown` (HCP er lower-is-better — ned er bra → grønn)
- **H1:** `HCP-mål: 0,0` (Geist 28px)
- **Subtittel:** `Nåværende: +2,4 · Mål-dato: 31. desember 2026 · Forventet truffet: ja`
- **Stat-pills (4):** `Δ -1,8 siste 6m` · `Sist runde: +1,2` · `Beste: -2,8 (4. mai)` · `Peer-snitt: +3,1`
- **Primary CTA:** `Del med foresatte` (åpner ShareWithParentModal)
- **Sekundær:** `Endre mål` (åpner EditGoalModal) · `Eksporter rapport (PDF)`

## Tab-strip (3 tabs)

| Tab | Innhold |
|---|---|
| **Trend** (default) | SVG-graf: 6m historikk + 7m projeksjon |
| **Delmål** | 5 delmål-cards |
| **Sammenlikning** | Vs peer-gruppe (percentil-bar) |

## Layout — Trend-tab (default)

### Hero-graf (12-col)
SVG linje-graf:
- X-akse: 13 måneder (6 historikk + 7 projeksjon)
- Y-akse: HCP (lower-is-better — invertert akse)
- Faktisk linje (mørk, solid) for 6 måneder
- Projeksjon (lime accent, stiplet) for 7 måneder
- Mål-linje horisontal (gold) på 0,0
- 13 datapunkter klikkbare → DataPointPopover

### Status-banner (12-col)
Grønn banner: "✓ Forventet truffet — 31. desember 2026 (basert på trend siste 12 uker)"
Eller rød: "⚠ I fare — du må forbedre 0,3 HCP/mnd for å nå mål"

### Delmål-mini (12-col)
5 delmål-cards horisontalt med progress (3/5 = ferdig, 2/5 = pågår).

## Layout — Delmål-tab

5 delmål-cards (full bredde stack):

| Delmål | Status |
|---|---|
| Score < 75 i 3 runder på rad | 2 av 3 ✓ |
| TrackMan: Driver carry > 270m | Ferdig (5. mai) ✓ |
| Sand-test 30m: 8,0 | 6,8 (på rute) |
| 18-hulls SG-Total > 1,0 | 0,8 (i fare) |
| Vinne klubbmesterskap juni | Pågår |

## Klikkbare elementer

| Element | States |
|---|---|
| Tab-strip | default, hover, active |
| `Endre mål` | default, hover, klikk → EditGoalModal |
| `Del med foresatte` CTA | default, hover, modal-trigger |
| SVG-datapunkt | default, hover (utvid + tooltip), klikk → popover |
| Mål-linje | static, hover viser "Mål: 0,0 innen 31. des 2026" |
| Delmål-card | default, hover (lift), klikk → sub-mål-skjerm |

## Free-tier lock-overlay

- Trend-tab: graf-projeksjon dimmet, "Pro for å se projeksjon →"
- Sammenlikning-tab: helt låst med lock-overlay
- Delmål-tab: synlig, men `Endre mål` disabled

## Empty / loading / error

- **Empty (mål ikke satt):** "Sett ditt HCP-mål for å spore fremgang →" CTA `Sett mål`
- **Forsinket-state:** Rød banner "I fare — siste 4 ukers trend feil retning"
- **Loading:** Skeleton graf med pulserende strek

## Eksempel-data

- **Spiller:** Markus Roinås Pedersen
- **Mål:** HCP 0,0 innen 31. desember 2026
- **Nåværende:** +2,4
- **Δ siste 6m:** -1,8
- **Status:** Forventet truffet (på rute)

## Ønsket output fra Claude Design

1. Lyst tema, Trend-tab default (på rute, grønn banner)
2. Mørkt tema, samme
3. I-fare-state (rød banner)
4. Tab-bytte til Delmål
5. DataPointPopover åpen på 4. mai (-2,8 beste runde)
6. Free-tier lock-state
7. Mobil ≤640px — graf full bredde

## Ikke-mål

- Ikke designe `EditGoalModal`, `ShareWithParentModal` (egne pakker)
- Ikke designe sub-delmål-skjerm

## Når du er ferdig

Lim design-link tilbake til Claude Code.
