# Audit: CoachHQ — Innstillinger · API

**HTML:** `screen-deck/coachhq/settings-api.html`
**URL:** `/admin/settings/api`
**Antall klikkbare elementer:** 32

## Klikkbare elementer

| Element (label/ikon) | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| Sidebar-nav (12 lenker) | Navigasjon | Ny skjerm | OK |
| Settings-undernav (9 lenker) | Navigasjon | Sub-skjermer | Delvis |
| Action-item statuser (3 stk) | Popover/inline | StatusFilterPopover | NEI |
| "+ Ny nøkkel" primary | Modal | CreateApiKeyModal | NEI - ny modal |
| "Roter" per nøkkel (3 stk) | Modal | ConfirmRotateKeyModal | NEI - confirm |
| "Scope" per nøkkel (3 stk) | Modal | EditApiKeyScopeModal | NEI - ny modal |
| "Slett" per nøkkel (3 stk) | Modal | ConfirmDelete (destruktiv) | OK (confirm-delete katalog) |
| Maskert nøkkel (sk_live_••••••a4f2) | Popover | RevealKeyPopover (one-time) | NEI |
| "+ Nytt endepunkt" | Modal | CreateWebhookModal | NEI - ny modal |
| Webhook-rad (4 stk) | Modal | WebhookDetailModal (logs/retries) | NEI - ny modal |

## States som må designes (utenom default)
- Hover på nøkkelrader
- Empty-state: ingen API-nøkler
- Loading skeleton for tabell
- Pill-status varianter (Aktiv/3 retries/utløper)
- Toast: kopiert til utklippstavle
- Confirmation flow for sletting (krever skriving av nøkkelnavn)
- Webhook test-modal (send test-event)
