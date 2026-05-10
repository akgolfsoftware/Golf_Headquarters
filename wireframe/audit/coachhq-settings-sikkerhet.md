# Audit: CoachHQ — Innstillinger · Sikkerhet

**HTML:** `screen-deck/coachhq/settings-sikkerhet.html`
**URL:** `/admin/settings/security`
**Antall klikkbare elementer:** 24

## Klikkbare elementer

| Element (label/ikon) | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| Sidebar-nav (12 lenker) | Navigasjon | Ny skjerm | OK |
| Settings-undernav (9 lenker) | Navigasjon | Sub-skjermer | Delvis |
| "Endre passord" | Modal | ChangePasswordModal | NEI - ny modal |
| "Reset 2FA →" | Modal | Reset2FAModal | NEI - ny modal |
| "Logg ut" på 3 sesjons-rader | Modal | ConfirmLogoutSessionModal | NEI - ny confirm |
| "Administrer →" (API-tilgang) | Ny skjerm | `/admin/settings/api` | OK |
| "Se full logg →" | Ny skjerm | `/admin/audit` | OK |
| "Reset →" (Glemt passord) | Ny skjerm | `/forgot-password` | OK |

## States som må designes (utenom default)
- Hover på rader i aktive sesjoner
- Loading skeleton for sesjons-tabell
- Error-state: feilet API-call
- Logget-ut-bekreftelse toast
- Mini-graph hover (tooltip per dag)
- Markert dag (rød prikk for failure) — popover med IP/info
