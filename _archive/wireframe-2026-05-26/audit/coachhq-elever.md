# Audit: CoachHQ — Elever (spillerliste)

**HTML:** `screen-deck/coachhq/elever.html`
**URL:** `/admin/elever`
**Antall klikkbare elementer:** 32

## Klikkbare elementer

| Element (label/ikon) | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| Sidebar-nav (12 lenker) | Navigasjon | Ny skjerm | OK |
| Action-strip-items (4 stk) | Popover | StatusFilterPopover | NEI |
| "+ Ny spiller" primary | Modal | NewPlayerModal | NEI - ny modal (onboarding-wizard) |
| Søk-input | Inline | Live-search | OK |
| Sort-select dropdown | Dropdown | SortDropdown | NEI (native) |
| A-kategori-chips (6 stk: Alle/A1-A5) | State-change | Inline | OK |
| Tier-chips (3 stk: Pro/Elite/Gratis) | State-change | Inline | OK |
| Player-row (12 stk synlige) | Drawer-toggle | PlayerProfileDrawer + ny skjerm `/admin/elever/:id` | OK |
| Mini-pyr per rad (klikkbar tooltip) | Tooltip | PyramidQuickView | NEI |
| Pill status (På plan/SLAG henger/Skadet osv) | Tooltip | StatusInfoPopover | NEI |
| "Vis alle 38 →" knapp | State-change | Load-more / paginering | OK |
| Drawer-close × | State-change | Inline | OK |
| Drawer "Send melding" / "Book økt" | Modal | SendMessageModal / BookSessionModal | NEI / OK |
| Drawer "Se 360-profil →" | Ny skjerm | `/admin/elever/:id` | OK |
| "Akkurat nå" rader i drawer (3 stk) | Modal/skjerm | (relaterte) | OK |

## States som må designes (utenom default)
- Hover på rad (background)
- Active/selected rad (currently styled)
- Loading skeleton
- Empty: ingen treff i søk
- Bulk-select (multi-velg for batch-handling)
- Skadet-tilstand visuell markør
- Tier-low-state for Free-spillere (graue ut features)
- Avatar-status-dot (online/offline)
