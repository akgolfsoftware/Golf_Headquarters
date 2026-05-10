# Audit: CoachHQ — E-postmaler

**HTML:** `screen-deck/coachhq/email-templates.html`
**URL:** `/admin/email-templates`
**Antall klikkbare elementer:** 24

## Klikkbare elementer

| Element (label/ikon) | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| Sidebar-nav (12 lenker) | Navigasjon | Ny skjerm | OK |
| Action-strip-items (3 stk) | Popover | StatusFilterPopover | NEI |
| "+ Ny mal" primary | Modal | NewEmailTemplateModal | NEI - ny modal |
| Søk-input | Inline filter | Live-search | OK |
| Sort-select dropdown | Dropdown | SortDropdown | NEI (native) |
| Kategori-chips (Alle / Onboarding / Påminnelser / Faktura / Kampanjer / Booking) | State-change | Inline | OK |
| Mal-card (~9 stk) | Modal eller skjerm | EmailTemplateEditModal eller `/admin/email-templates/:id` | NEI - ny modal |
| Trigger-pill (Auto/Manuell på card) | Popover | TriggerInfoPopover | NEI |

## States som må designes (utenom default)
- Hover på cards (lift, kant)
- Loading skeleton for grid
- Empty-state: ingen maler i kategori
- Preview-modal (vis full e-post med variabler ekspandert)
- Send-test-modal (sender til egen e-post)
- Variabel-validering ved redigering
- Versjonshistorikk for mal
