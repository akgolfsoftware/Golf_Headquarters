# Audit: PlayerHQ — Øvelser (bibliotek)

**HTML:** `screen-deck/playerhq/ovelser.html`
**URL:** `/portal/tren/ovelser`
**Tier:** Alle (men favoritt + coach-anbefalt Pro)
**Antall klikkbare elementer:** 26

## Klikkbare elementer

| Element | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| Sidebar-nav (5) | Skjerm | /portal/* | OK |
| Action-strip-items (4) | Inline | Filter/tooltips | OK |
| Søke-input | Inline | Filter | OK |
| Sort-select dropdown | Dropdown | Native | OK |
| Filter-chips (5: Alle/FYS/TEK/SLAG/SPILL/TURN) | State-change | Inline filter | OK |
| Star/favoritt-knapp på cards (9) | State-change | Toggle | OK |
| "★ Favoritter" / "Anbefalt" filter-chips | State-change | Inline filter | OK |
| Hele øvelse-card (klikkbar?) | Modal | DrillDetailModal | NEI - ny modal |

## States som må designes (utenom default)
- Empty-state per filter
- Loading skeleton
- Tier-locked-state (Free ser kun gratis-øvelser)
- Favoritt aktiv vs inaktiv (★ vs ☆)
- "Anbefalt av coach" highlight
- "Aldri gjort" vs "Sist gjort dato"
- DrillDetailModal (full beskrivelse + video + utstyrsliste + start-knapp)
- DrillChallengeModal (allerede i tracker — for grupper)
- ChallengeDetailModal (allerede i tracker — leaderboard)
