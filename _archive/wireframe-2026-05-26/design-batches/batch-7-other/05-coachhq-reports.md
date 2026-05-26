# AK Golf Platform — CoachHQ — Rapporter

## Identitet

- **Produkt:** CoachHQ
- **URL:** `/admin/reports`
- **Arketype:** G — Other (rapport-katalog med generator)
- **Tier-gating:** Hovedcoach + admin
- **HTML-referanse:** `wireframe/screen-deck/coachhq/reports.html`
- **Audit:** finnes ikke ennå
- **Tilhørende modaler:** `ReportConfigModal`, `ScheduleReportModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Rapporter er katalogen over alle pre-byggede rapport-maler — månedsoppsummering for foreldre, kvartalsrapport til styret, spillerprogresjon-rapport, finance-rapport, agent-effektivitet-rapport. Anders kan generere ad-hoc, planlegge automatisk leveranse (e-post hver 1. i måneden), og sende til mottakere.

## Layout — UNIKT for denne skjermen

### Header

- Hero italic: *"Hva trenger du å rapportere?"*
- Subtitle: `12 maler tilgjengelig · 4 planlagte leveranser`

### Rapport-katalog (3-kolonne grid)

Hver mal som en card:
- Stort ikon øverst (Lucide: `FileText`, `BarChart3`, `Users`, `DollarSign`, `Bot`)
- Tittel (Geist 16px medium)
- 1-setning beskrivelse (muted 13px)
- Meta-rad: `PDF · 3 sider · Tar ~30 sek`
- Aksjons-rad: `Generer →` (primary), `Planlegg →` (ghost), `Forhåndsvis` (link)

12 maler i 5 kategorier:
1. **For foreldre (3):** Månedsrapport spiller, Kvartalsrapport spiller, Sesongoppsummering
2. **For spillere (2):** Min progresjon (PDF), Test-historikk
3. **For styret (3):** Måned-finance, Kvartal-strategisk, Årsrapport
4. **For coaches (2):** Agent-effektivitet, Plan-godkjennings-rate
5. **For klubber (2):** Belegg-rapport, Inntekt-per-tjeneste

### Right-rail: Planlagte leveranser

320px sidebar:
- "4 planlagte leveranser" header
- Liste:
  - "Månedsrapport — alle foreldre · Hver 1. kl 08:00 · Neste: 1. juni"
  - "Kvartal-finance — styret · Hver 1. apr/jul/okt/jan · Neste: 1. juli"
  - …
- Hver med: pause/edit/slett-aksjoner

## KPI-strip (4 kort)

1. Maler tilgjengelig: 12
2. Generert siste 30d: 47
3. Planlagte leveranser: 4 (neste: 1. juni)
4. Snitt-genereringstid: 28 sek

## Filter-bar — UNIKT

- Søk: "Søk rapport-mal"
- Chip: Kategori (Foreldre / Spillere / Styret / Coaches / Klubber)
- Chip: Format (PDF / CSV / Excel)
- Sort: Mest brukt / Nyeste / A-Å

## Klikkbare elementer

| Element | States |
|---|---|
| Mal-card | default, hover (lift + ring), klikk → forhåndsvis-modal |
| Generer-CTA | default, hover, loading (spinner + "Genererer…"), success (download) |
| Planlegg-CTA | default, hover, klikk → `ScheduleReportModal` |
| Right-rail-rad | default, hover, klikk → edit-mode |
| Right-rail pause-aksjon | default, hover, success (toast "Pauset") |

## Empty / loading / error

- **Empty (ingen planlagte):** Right-rail viser "Ingen planlagte leveranser. Planlegg din første →"
- **Loading (genererer):** Inline progress-bar i card + "Genererer rapport…"
- **Error (genererings-feil):** "Kunne ikke generere. Prøv igjen →" inline i card

## Ønsket output fra Claude Design

1. Lyst tema, full katalog 12 maler + right-rail med 4 planlagte
2. Mørkt tema, samme
3. Card-hover med "Generer →" highlighted
4. Loading-state på en card (genererer)
5. Mobil ≤640px — 1-kolonne grid, right-rail blir collapse-able bottom-sheet

## Ikke-mål

- Ikke designe `ReportConfigModal`, `ScheduleReportModal` (egen batch)
- Ikke designe selve PDF-output (egen design-fase)
- Ikke designe ad-hoc-rapport-builder

## Når du er ferdig

Lim design-link tilbake til Claude Code.
