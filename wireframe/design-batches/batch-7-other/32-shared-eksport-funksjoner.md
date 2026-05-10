# AK Golf Platform — Shared — Eksport-funksjoner

## Identitet

- **Produkt:** Shared / cross-cutting (designer-referanse + admin-flate)
- **URL:** `/admin/exports`
- **Arketype:** G — Other (katalog + historikk)
- **Tier-gating:** Pro+ for noen typer
- **HTML-referanse:** `wireframe/screen-deck/shared/cross-cutting/eksport-funksjoner.html`
- **Audit:** finnes ikke ennå
- **Tilhørende modaler:** `ExportConfigModal`, `ScheduleExportModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Eksport-katalogen samler alle eksport-funksjoner i plattformen — fra finance-CSV til full GDPR-data-export, fra runde-historikk-PDF til calendar-iCal. Brukes både som referanse (designer/dev) og som sentral admin-flate hvor Anders kan kjøre eksporter eller planlegge automatiske leveranser.

## Layout — UNIKT for denne skjermen

### Header
- Italic: *"Få data ut."*
- Subtitle: `14 eksport-typer · 5 formater · 4 planlagte leveranser`

### Top-seksjon: Eksport-katalog (2-kolonne grid)

Hvert kort:
- **Ikon** + **Tittel** (Geist 14px): "Finance MTD CSV"
- **Format-pill**: CSV / PDF / Excel / iCal / JSON
- **1-setning**: "Alle transaksjoner denne måneden, sortert etter dato"
- **Tier-gate** (hvis relevant): "Pro+"
- **CTAs**: `Generer nå →` + `Planlegg →`

14 typer:
1. Finance MTD CSV
2. Finance YTD Excel
3. Spiller-progresjon PDF (per spiller)
4. Stallens-rapport PDF (alle spillere)
5. GDPR-data-export JSON (per bruker)
6. Calendar iCal (Pro+)
7. Runde-historikk CSV
8. Booking-historikk Excel
9. Audit-log CSV (admin-only)
10. Plan-arkiv PDF
11. Foreldre-månedsrapport PDF
12. Tilbud-historikk PDF
13. Spillerliste CSV (kontaktinfo)
14. Eksport av agent-anbefalinger CSV

### Bottom-seksjon: Historikk-tabell

Tabell:
| Dato | Type | Format | Bruker | Status | Last ned |
|---|---|---|---|---|---|
| 11. mai 14:32 | Finance MTD | CSV | Anders K | Klar | ↓ |
| 10. mai 09:15 | GDPR-export | JSON | Auto | Klar | ↓ |
| ... | ... | ... | ... | Genererer (47%) | – |

Status-prikker: Klar (accent), Genererer (gold), Feilet (destructive).

## KPI-strip (4 kort)

1. Eksport-typer: 14
2. Genererte siste 30d: 47
3. Planlagte leveranser: 4
4. Snitt-genereringstid: 28 sek

## Klikkbare elementer

| Element | States |
|---|---|
| Eksport-card | default, hover (lift) |
| Generer nå | default, hover, loading (progress), success (download) |
| Planlegg | default, hover, klikk → `ScheduleExportModal` |
| Historikk-rad | hover, klikk → `ExportConfigModal` (vis konfig + re-kjør) |
| Last ned | default, hover, klikk → blob-download |

## Empty / loading / error

- **Empty historikk:** "Ingen tidligere eksporter. Kjør din første →"
- **Generation-error:** "Kunne ikke generere. Prøv igjen →"

## Ønsket output fra Claude Design

1. Lyst tema, full katalog + historikk-tabell
2. Mørkt tema, samme
3. Generer-loading med progress-bar
4. Mobil ≤640px — katalog 1-kolonne, historikk kort-layout

## Ikke-mål

- Ikke designe `ExportConfigModal`, `ScheduleExportModal` (egen batch)
- Ikke designe selve PDF-templates

## Når du er ferdig

Lim design-link tilbake til Claude Code.
