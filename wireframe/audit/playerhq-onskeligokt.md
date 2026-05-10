# Audit: PlayerHQ — Be om økt (ønskelig økt)

**HTML:** `screen-deck/playerhq/onskeligokt.html`
**URL:** `/portal/coach/request`
**Tier:** Pro
**Antall klikkbare elementer:** 18

## Klikkbare elementer

| Element | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| Sidebar-nav (5) | Skjerm | /portal/* | OK |
| Action-strip-items (4) | Inline / popover | Tooltips | OK |
| Tabs (3: Forespørsel/Mine forespørsler/Coach-tilgjengelighet) | State-change | Inline | OK |
| Område-knapper (5: FYS/TEK/SLAG/SPILL/TURN) | State-change | Inline (velg) | OK |
| Begrunnelse textarea | Inline | Tekst-input | OK |
| Foreslåtte tider (3 stk) | State-change | Velg tid | OK |
| "Foreslå annen tid →" | Modal | DatetimePickerModal | NEI - ny modal |
| Lengde-knapper (3: 30/60/90) | State-change | Inline | OK |
| "Send forespørsel til Anders" primær | Modal | RequestConfirmationModal | NEI - ny modal |
| "Lagre utkast" | State-change | Inline (toast) | OK |
| Mini-cal dager (7) | Popover | DayAvailabilityPopover | NEI - ny popover |
| Tidligere forespørsler-rader (3) | Modal | RequestDetailModal | NEI - ny modal |

## States som må designes (utenom default)
- Ingen område valgt (validering)
- Ingen tid valgt (validering)
- Sendt-state (lock + bekreftelse)
- Empty-state for "Mine forespørsler"-tab
- Tier-locked-state (Free-bruker — ingen coach-tilgang) → UpgradeToProModal
- DatetimePickerModal (kalender + tid)
- RequestConfirmationModal (oppsummering før send)
- DayAvailabilityPopover (timer i dag)
- RequestDetailModal (status + svar fra coach)
