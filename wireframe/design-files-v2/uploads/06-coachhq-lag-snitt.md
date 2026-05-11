# AK Golf Platform — CoachHQ — Lag-sammenligning

## Identitet

- **Produkt:** CoachHQ
- **URL:** `/admin/lag-snitt`
- **Arketype:** C — Detail + tabs (5 tabs, sammenligningsmatrise)
- **Tier-gating:** Ikke relevant
- **HTML-referanse:** `wireframe/screen-deck/coachhq/lag-snitt.html`
- **Audit:** `wireframe/audit/coachhq-lag-snitt.md`
- **Tilhørende modaler:** `GroupCompareDrawer`, `MembersPopover`, `AddCompareGroupPopover`, `ExportMenu`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Sammenligning på tvers av grupper — hvordan ligger WANG Toppidrett vs GFGK Junior vs Elite-laget på pyramide-fokus, SG, tester, plan-adherence og demografi. Coach bruker dette i kvartalsreviews og når de skal forklare foreldre eller styret hvordan en gruppe utvikler seg.

## Header-blokk — UNIKT

- **H1:** `Lag-sammenligning` (Geist 32px)
- **Subtittel:** *"Q2 2026. Hvem leverer, hvem henger etter."*
- **Stat-pills (3):** `6 grupper` · `Periode: jan – mai 2026` · `Sist oppdatert: i dag`
- **Primary CTA:** `Eksporter rapport` (popover: PDF / CSV / Excel)
- **Sekundær:** Date-range-picker for periode-velger

## Tab-strip (5 tabs)

| Tab | Innhold |
|---|---|
| **Pyramide** (default) | 5×6 matrise: 5 fokus-områder × 6 grupper |
| **SG** | 5×6 matrise med SG per kategori |
| **Tester** | Test-snitt per gruppe |
| **Plan-adherence** | % gjennomførte økter per gruppe |
| **Demografi** | Alder, kjønn, HCP-snitt, kategorifordeling |

## Layout — Pyramide-tab (default)

### Matrise (kolonner: gruppe, rader: fokus)

| Fokus | Elite | A-lag | WANG | GFGK Jr | Akademi | Snitt |
|---|---|---|---|---|---|---|
| **FYS** | 18 % | 22 % | 24 % | 30 % | 16 % | 22 % |
| **TEK** | 32 % | 28 % | 26 % | 32 % | 38 % | 31 % |
| **SLAG** | 24 % | 22 % | 20 % | 18 % | 24 % | 22 % |
| **SPILL** | 14 % | 16 % | 18 % | 12 % | 12 % | 14 % |
| **TURN** | 12 % | 12 % | 12 % | 8 % | 10 % | 11 % |

Hver celle har:
- Verdien (JetBrains Mono)
- Fargestripe under (intensitet basert på distanse fra snitt)
- Hover → tooltip `Eksakt verdi: 24,3 % · Δ +1,2 % vs snitt`

Rad er klikkbar → GroupCompareDrawer.

### Avatar-stack per gruppe-header

Topp-3 medlemmer (avatar 24px, overlap), klikk → MembersPopover med full liste.

## GroupCompareDrawer (åpen på "WANG Toppidrett")

- Header med gruppe-navn + 12-medlems-stack
- Donut: pyramide for gruppen (klikk-segment → PyramidTierDetailDrawer)
- Top-3-spillerrad (tabell): Markus, Mia, Anders — klikk → 360-profil
- Sammenlign-chips: 4 grupper aktive + `+ Legg til` (popover med søk)
- Primary: `Åpne gruppe-detalj →` (link til `/admin/groups/:id`)
- Sekundær: `Eksporter sammenligning`

## Klikkbare elementer

| Element | States |
|---|---|
| Tab-strip | default, hover, active |
| Matrise-rad (gruppe) | default, hover, selected (3px accent-border), klikk → drawer |
| Matrise-celle | default, hover (tooltip) |
| Sort-toggle på kolonne-header | default, hover, sort-asc, sort-desc |
| Avatar-stack | default, hover, klikk → MembersPopover |
| Sammenlign-chip | default, removable (×), `+ Legg til` |
| `Eksporter rapport` | default, hover, popover-open |

## Empty / loading / error

- **Empty (<2 grupper):** "Trenger minst 2 grupper for sammenligning. Lag en →"
- **Tooltip-hover på celle:** Eksakt verdi + delta vs snitt
- **Loading:** Skeleton matrise med pulserende celler

## Eksempel-data

- **Grupper (6):** Elite, A-lag, WANG Toppidrett, GFGK Junior, Akademi, Snitt-rad
- **Periode:** januar – mai 2026
- **WANG-fokus:** TEK 26 % · FYS 24 % · SLAG 20 % (FYS-tunge sammenlignet med snitt)

## Ønsket output fra Claude Design

1. Lyst tema, Pyramide-tab matrise default
2. Mørkt tema, samme
3. Drawer åpen på WANG Toppidrett
4. Tooltip-hover på en celle
5. Tab-bytte til SG
6. Empty: <2 grupper
7. Mobil ≤640px — matrise konverterer til stablet liste per gruppe

## Ikke-mål

- Ikke designe `GroupCompareDrawer` som standalone (vises i denne pakken)
- Ikke designe gruppe-detalj-skjerm (egen pakke)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
