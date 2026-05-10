# Audit: PlayerHQ — Live Tapper

**HTML:** `screen-deck/playerhq/live-tapper.html`
**URL:** `/portal/live/:id/tapper`
**Tier:** Pro
**Antall klikkbare elementer:** 7

## Klikkbare elementer

| Element | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| "Avslutt" (rød) | Modal | ConfirmEndSessionModal | NEI - ny modal |
| "TREFF +1" stor knapp | State-change | Inline (counter ++) | OK |
| "MISS +1" stor knapp | State-change | Inline (counter ++) | OK |
| "PERFEKT +1" stor knapp | State-change | Inline (counter ++) | OK |
| "← Angre siste" | State-change | Inline (decrement) | OK |
| "Pause" footer | State-change | Inline (timer pause) | OK |
| "Bytt kølle" footer | Popover | ClubPickerPopover | NEI - ny popover |
| "Lagre og avslutt" footer | Modal | LiveSessionSummaryModal | OK (i tracker) |

## States som må designes (utenom default)
- Pause-state (timer stoppet, overlay)
- Klikk-feedback på knapper (scale + flash)
- Counter-animasjon ved +1
- Empty-state (0 slag — første tap)
- ConfirmEndSessionModal med "Vil du lagre eller forkaste?"
- ClubPickerPopover med bag-velger
