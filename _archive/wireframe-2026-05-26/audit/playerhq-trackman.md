# Audit: PlayerHQ — TrackMan-økter

**HTML:** `screen-deck/playerhq/trackman.html`
**URL:** `/portal/mal/trackman`
**Tier:** Pro (TrackMan låst opp på Pro)
**Antall klikkbare elementer:** 25

## Klikkbare elementer

| Element | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| Sidebar-nav (5) | Skjerm | /portal/* | OK |
| Action-strip-items (3) | Inline | Tooltips | OK |
| "+ Last opp video" primær | Modal | VideoUploadModal | OK (i tracker) |
| Filter-chips (6: Denne mnd/30d/90d/Sesong/Per kølle/Per fasilitet) | State-change | Inline filter | OK |
| TrackMan-økt cards (8) — klikkbare | Modal | TrackManSessionModal | NEI - ny modal |
| "Eksporter CSV →" lenker per card (8) | Skjerm | CSV-download | OK |
| Drawer: "×" lukk | State-change | Inline | OK |
| Drawer: per-kølle stats-rader (3) | Popover | ClubStatPopover | NEI - ny popover |
| Drawer: "Eksporter CSV til Strokes Gained" | Skjerm | CSV-download | OK |
| Drawer: "Del med coach" | Modal | ShareWithCoachModal | NEI - ny modal |
| Drawer: "Last opp video" | Modal | VideoUploadModal | OK (i tracker) |

## States som må designes (utenom default)
- Empty-state (ingen TrackMan-økter)
- Loading skeleton
- Tier-locked-state — kritisk: Free ser blurry preview + UpgradeToProModal
- "Mål truffet" vs "Utenfor target"-pill
- Trajectory-mini SVG (per kølle-fargelegging)
- TrackManImportModal (i tracker — CSV/OCR-import)
- TrackManSessionModal (full per-økt rapport)
- ClubStatPopover (hover for benchmark)
- VideoUploadModal (i tracker)
