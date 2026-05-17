# AK Golf Platform — PlayerHQ — Abonnement

## Identitet

- **Produkt:** PlayerHQ
- **URL:** `/meg/abonnement`
- **Arketype:** F — Settings + profile (billing-variant)
- **Tier-gating:** Free/Pro/Elite — alle har tilgang, men UI varierer
- **HTML-referanse:** `wireframe/screen-deck/playerhq/meg-abonnement.html`
- **Audit:** `wireframe/audit/playerhq-meg-abonnement.md`
- **Tilhørende modaler:** `UpgradePlanModal`, `CancelSubscriptionModal`, `UpdatePaymentModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Markus ser her hvilket tier han har, hva som er inkludert, neste fakturadato, betalingskort, og kan oppgradere/nedgradere/kansellere. Foreldre (Anne/Tor) har egen tilgang som ser samme info hvis de har "Kun fakturaer"-relasjon. Stripe-integrasjon i bakgrunnen — denne skjermen er front.

## Layout — UNIKT for denne skjermen

Bruker arketype-F-felles-spec. Tre hoved-blokker stablet:

### Blokk 1: Nåværende plan (hero-kort)

Stort kort med:
- Tier-badge (Pro / Elite / Free) — accent eller primary farge
- Tittel: "Pro" (Geist 32px italic display)
- Pris: "299 kr/mnd" (JetBrains Mono 24px) eller "Gratis" hvis Free
- Status-pill: "Aktiv" (accent) / "Pause" (muted) / "Kansellerer 30. mai" (warning) / "Forfalt" (destructive)
- Neste belastning: "1. juni 2026 — 299 kr"
- Inkludert (3 første features med checkmarks):
  - "Ubegrenset coaching-historikk"
  - "AI-anbefalinger"
  - "TrackMan-import"
- "Se alle features →" link (åpner expand)

Knapper:
- `Endre plan →` (secondary)
- `Pause i 1 mnd →` (ghost) — tilgjengelig kun Pro/Elite
- `Kanseller →` (destructive ghost)

### Blokk 2: Sammenligning av planer

Tre kolonner side ved side: **Free** | **Pro (nåværende)** | **Elite**

Hver kolonne:
- Pris (eller "Gratis")
- 6 features med checkmark eller X
- CTA: "Velg →" / "Du har denne" / "Velg →"

Pro-kolonne har subtil accent-border for å markere "current".

| Feature | Free | Pro | Elite |
|---|---|---|---|
| Antall planer samtidig | 1 | 3 | Ubegrenset |
| Coaching-historikk | 30 dager | Ubegrenset | Ubegrenset |
| AI-anbefalinger | – | ✓ | ✓ + prio |
| TrackMan-import | – | ✓ | ✓ |
| Helse + restitusjon | – | ✓ | ✓ |
| 1:1 coach-melding | 5/mnd | 50/mnd | Ubegrenset |
| Pris | 0 kr | 299 kr/mnd | 599 kr/mnd |

### Blokk 3: Betaling + faktura

**Betalingsmetode:**
- Visa **** 4242 — utløper 09/2027
- "Endre kort →" → `UpdatePaymentModal`

**Faktura-historikk:**

| Dato | Beskrivelse | Beløp | Status | PDF |
|---|---|---|---|---|
| 1. mai 2026 | Pro — månedlig | 299 kr | Betalt | ↓ |
| 1. apr 2026 | Pro — månedlig | 299 kr | Betalt | ↓ |
| 1. mar 2026 | Pro — månedlig | 299 kr | Betalt | ↓ |
| 1. feb 2026 | Pro — oppgradering | 299 kr | Betalt | ↓ |

"Se alle fakturaer →" link.

### Blokk 4: Foreldre-betaler (junior)

Vises kun hvis junior + forelder har "Kun fakturaer"-tilgang:
- "Tor Pedersen (far) får alle fakturaer på e-post"
- "Endre forelder-tilgang →" (link til /meg/profil)

### Farezone

- "Kanseller abonnement" — destructive → `CancelSubscriptionModal` (med retention-tilbud)
- "Slett alle data ved oppsigelse" — toggle (av default — data beholdes 30 dager)

## KPI-strip

Ikke relevant — info ligger i hero-kortet.

## Klikkbare elementer

UNIKT:

| Element | States |
|---|---|
| Tier-velger-kort | default, hover (lift + accent border), klikk "Velg" → `UpgradePlanModal` |
| "Pause i 1 mnd" | default, hover, klikk → confirm "Pause til 10. juni — du beholder data men mister funksjoner" |
| "Endre kort" | default, hover, klikk → `UpdatePaymentModal` (Stripe Elements) |
| Faktura-rad PDF-ikon | default, hover, klikk → download PDF |
| "Kanseller" | default, hover (mørkere destructive), klikk → modal med retention |
| Sammenlikning-kolonne (current) | accent-border + "Du har denne"-pill |

## Empty / loading / error

Felles arketype-F + UNIKT:
- **Free-tier:** Hero-kort viser "Free — Gratis", store CTAs til Pro/Elite
- **Forfalt:** Destructive-banner øverst "Betaling feilet 1. mai. Oppdater kort innen 14. mai →"
- **Pause-aktiv:** Warning-banner "Pro er pauset til 10. juni. Du har Free-funksjoner inntil da. Aktiver nå →"
- **Empty fakturaer (ny Pro):** "Ingen fakturaer ennå. Første belastning er 1. juni."
- **Stripe-loading:** Skeleton-kort under "Betalingsmetode"

## Ønsket output fra Claude Design

1. Lyst tema, Pro-tier aktiv, full data
2. Mørkt tema, Free-tier (med store oppgrader-CTAs)
3. Forfalt-banner aktiv (betaling feilet)
4. Sammenligning med Pro-kolonne uthevet
5. Pause-state (warning-banner + grayed-out features)
6. Mobil ≤640px — sammenligning blir 1 kolonne med tier-toggle øverst, stacked

## Ikke-mål

- Ikke designe `UpgradePlanModal`, `CancelSubscriptionModal` (egen pakke 22), `UpdatePaymentModal` (egen batch-9)
- Ikke designe Stripe Elements selv (vi bruker default)
- Ikke designe coach-tier (CoachHQ har egen abonnement-skjerm — egen sub)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
