# Audit: PlayerHQ — Live Session

**HTML:** `screen-deck/playerhq/live-session.html`
**URL:** `/portal/live/:id`
**Tier:** Pro
**Antall klikkbare elementer:** 9

## Klikkbare elementer

| Element | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| "Avslutt økt" (rød topp) | Modal | ConfirmEndSessionModal | NEI - ny modal |
| Stasjon-rad (5 stk i sidebar) | State-change | Inline (bytt aktiv stasjon) | OK |
| "+1 SLAG" stor sirkel | State-change | Inline (counter ++) | OK |
| "−1 ANGRE" liten knapp | State-change | Inline (decrement) | OK |
| "BIRDIE ±5m carry" | State-change | Inline (logg birdie-treff) | OK |
| "GREEN treff" | State-change | Inline (logg green-treff) | OK |
| "Pause" footer | State-change | Inline | OK |
| "← Forrige stasjon" | State-change | Inline | OK |
| "Neste stasjon →" (primær) | Modal | LiveSessionBetweenModal | OK (i tracker) |
| "Avslutt og lagre" | Modal | LiveSessionSummaryModal | OK (i tracker) |

## States som må designes (utenom default)
- Pause-overlay
- Stasjon-progress (done/active/pending)
- Counter-animasjon
- Pre-økt: LiveSessionIntroModal (i tracker)
- Mellom stasjoner: LiveSessionBetweenModal (i tracker)
- Avslutning: LiveSessionSummaryModal (i tracker)
- ConfirmEndSessionModal (lagre/forkaste)
