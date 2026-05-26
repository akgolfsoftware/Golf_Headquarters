# Audit: PlayerHQ — Tester (bibliotek)

**HTML:** `screen-deck/playerhq/tester.html`
**URL:** `/portal/tren/tester`
**Tier:** Alle (men test-historikk Pro)
**Antall klikkbare elementer:** 22

## Klikkbare elementer

| Element | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| Sidebar-nav (5) | Skjerm | /portal/* | OK |
| Action-strip-items (4) | Inline | Tooltips | OK |
| Søke-input | Inline | Filter | OK |
| Sort-select | Dropdown | Native select | OK |
| Filter-chips (3: Alle/NGF/Egne) | State-change | Inline filter | OK |
| Kategori-chips (4: FYS/TEK/SLAG/SPILL) | State-change | Inline filter | OK |
| Test-cards (8 stk) | Skjerm | /portal/tren/tester/:id | OK |
| "Start test" CTA på hver card (8) | Skjerm | /portal/tren/tester/:id (start-mode) | OK |
| "+ Egen test" (mangler — bør legges til) | Modal | NewTestModal | NEI - ny modal |

## States som må designes (utenom default)
- Empty-state (ingen tester i kategori)
- Loading skeleton (cards)
- "Forfaller om Xd" warning-pill
- "Best snitt" highlight
- Tier-locked-state (Free ser kun gratis-tester)
- NewTestModal (lag egen test — protokoll-builder)
- TestProtocolPopover (hover viser oppsett)
