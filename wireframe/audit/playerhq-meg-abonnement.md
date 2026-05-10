# Audit: PlayerHQ — Meg Abonnement

**HTML:** `screen-deck/playerhq/meg-abonnement.html`
**URL:** `/portal/meg/sub`
**Tier:** Alle (men selve oppgradering trigger tier-flow)
**Antall klikkbare elementer:** 16

## Klikkbare elementer

| Element | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| Sidebar-nav (5) | Skjerm | /portal/* | OK |
| Settings-nav (6) | Skjerm | /portal/meg/* | OK |
| "Oppgrader til Elite · 599 kr/mnd" CTA | Modal | UpgradeToEliteModal / PaymentModal | PaymentModal OK, UpgradeToEliteModal NEI |
| Tier-card "Gratis" (klikkbar) | Modal | DowngradeConfirmModal | NEI - ny modal |
| Tier-card "Pro" (current) | Inline | Ingen aksjon | OK |
| Tier-card "Elite" | Modal | UpgradeToEliteModal | NEI - ny modal |
| "PDF →" per faktura-rad (6 stk) | Skjerm/Download | PDF-fil | OK |
| "Endre kort" øverst | Modal | PaymentMethodModal | NEI - ny modal |
| "Avslutt abonnement" (rød) | Modal | CancelSubscriptionModal | NEI - ny modal |
| "Endre kort" nederst (duplikat) | Modal | PaymentMethodModal | NEI - ny modal |

## States som må designes (utenom default)
- Tier-locked-state (Pro-bruker ser Elite-features med lock-ikon)
- Current-tier-highlight ("Du er her" pill)
- Failed-payment-state (rød banner)
- Trial/grace-period-state
- Cancelled-state (sub avsluttes om X dager)
- UpgradeToProModal — for Free-brukere som klikker Pro-features andre steder
- UpgradeToEliteModal — for Pro-brukere som klikker Elite-features
- PaymentMethodModal — Stripe-elements
- CancelSubscriptionModal — bekreftelse + årsak
