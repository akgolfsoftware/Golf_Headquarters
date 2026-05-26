# AK Golf Platform — Modal — CancelSubscriptionModal

## Identitet

- **Produkt:** PlayerHQ (primært) + CoachHQ (sekundært)
- **URL:** Modal — åpnes fra `/meg/abonnement` og `/admin/settings/bruker`
- **Arketype:** F — Settings + profile (retention-modal)
- **Tier-gating:** Pro/Elite (Free har ingenting å kansellere)
- **HTML-referanse:** `wireframe/screen-deck/shared/modals/cancel-subscription.html` (lag ny)
- **Audit:** finnes ikke ennå

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Kanseller-modalen er **retention-flow** — vi gir spilleren bevisst friksjon for å hindre impulsiv oppsigelse, samtidig som vi respekterer valget. Mønster: 3 steg (årsak → tilbud → bekreft). Etter aksept: abonnement kjører ut perioden, deretter downgrades til Free.

## Layout — UNIKT for denne modalen

Modal centrert, max-bredde 560px. 3-stegs wizard inni modalen (progress-bar øverst).

### Step 1 av 3: Årsak

- Tittel: "Vi blir lei oss for å se deg gå"
- Sub-tittel: "Si hvorfor — så kan vi bli bedre"
- Radio-gruppe (én må velges):
  - "For dyrt"
  - "Bruker det ikke nok"
  - "Mangler funksjoner jeg trenger"
  - "Bytter til konkurrent"
  - "Skader / midlertidig pause"
  - "Annet"
- Hvis "Annet" valgt: textarea åpnes "Fortell oss kort hva"
- Hvis "Mangler funksjoner": dropdown "Hva mangler?"
- Action-bar: `Avbryt` (ghost) | `Neste →` (primary)

### Step 2 av 3: Personlig tilbud (basert på årsak)

Innhold tilpasses årsak fra Step 1:

**Hvis "For dyrt":**
- "Vi tilbyr 30% rabatt i 3 måneder — 209 kr/mnd i stedet for 299 kr"
- Knapp: `Aksepter rabatt-tilbud →` (accent CTA)
- Eller: `Nei takk, fortsett kansellering →` (ghost link)

**Hvis "Bruker det ikke nok":**
- "Pause i stedet — du beholder data og funksjoner kommer tilbake automatisk"
- Knapp: `Pause i 1 mnd` / `Pause i 3 mnd`
- Eller: `Nei takk, kanseller →`

**Hvis "Skader":**
- "Vi pauser gratis så lenge du trenger. Coach Anders får varsel."
- Knapp: `Aksepter gratis pause →`
- Eller: `Nei takk, kanseller →`

**Hvis "Mangler funksjoner" / "Bytter":**
- "Send oss en mail om hva som mangler — vi tar feedback alvorlig"
- Knapp: `Send feedback →` (åpner pre-fyllt mail)
- Eller: `Fortsett kansellering →`

**Hvis "Annet":**
- "Skip dette steget — vi forstår ikke kontekst"
- Action-bar: `Tilbake` (ghost) | `Fortsett →` (primary)

### Step 3 av 3: Bekreft

- Tittel: "Bekreft kansellering"
- Sammendrag-kort:
  - "Plan: Pro (299 kr/mnd)"
  - "Aktiv til: 1. juni 2026 (21 dager til)"
  - "Etter det: Du blir Free-bruker"
- "Du mister tilgang til:" (3-punkts liste, dynamisk):
  - Ubegrenset coaching-historikk
  - AI-anbefalinger
  - TrackMan-import
- "Du beholder:"
  - All data i 30 dager (kan reaktiveres uten tap)
  - Alle profilen og runde-historikk
- Toggle: "Slett alle data umiddelbart i stedet for 30 dager" (av default — destructive)
- Tekst-bekreftelse-input: "Skriv 'KANSELLER' for å bekrefte"
- Action-bar: `Tilbake` (ghost) | `Bekreft kansellering` (destructive primary, disabled inntil "KANSELLER" skrevet)

### Suksess-state

Etter bekreft:
- Stor checkmark + "Kansellert"
- Tekst: "Pro går ut 1. juni. Vi sender bekreftelse på mail."
- Knapp: `Tilbake til abonnement →`

## Klikkbare elementer

UNIKT:

| Element | States |
|---|---|
| Progress-bar (3 steps) | step 1/2/3 active |
| Radio-årsak | unchecked, checked, hover |
| Tilbud-CTA (accent) | default, hover (lift), klikk → success-toast + lukker |
| "Fortsett kansellering" link | ghost (mindre prominent enn aksepter-tilbud) |
| Toggle "Slett umiddelbart" | av (default), på (warning farezone) |
| Tekst-bekreftelse | input, valid (når "KANSELLER" matches) |
| Bekreft-knapp | disabled, enabled (destructive), loading, success |

## Empty / loading / error

- **Stripe-error:** "Kunne ikke kansellere mot Stripe. Prøv igjen eller kontakt support."
- **Allerede kansellert:** Hvis bruker prøver igjen: "Abonnement er allerede kansellert. Aktiver på nytt? →"
- **Pause-tilbud akseptert:** Toast "Pro pauset til 10. juni" + lukker modal
- **Rabatt-tilbud akseptert:** Toast "Rabatt aktivert — neste belastning 1. juni: 209 kr"

## Tekniske noter (for kontekst)

- Trigger Stripe `subscriptions.update({ cancel_at_period_end: true })`
- Etter periode-ut: webhook `customer.subscription.deleted` → downgrade til Free
- Hvis "Slett umiddelbart": GDPR-jobb scheduled (hard-delete etter 30 dager grace)
- Audit-log alle steg

## Ønsket output fra Claude Design

1. Step 1 (årsak-radio) lyst tema
2. Step 2 (rabatt-tilbud for "For dyrt") med accent-CTA prominent
3. Step 2 (gratis pause for "Skader") — empati-design
4. Step 3 (bekreft) med farezone-toggle og tekst-bekreftelse
5. Suksess-state etter kansellering
6. Mobil ≤640px — modal full bredde, action-bar sticky bunn

## Ikke-mål

- Ikke designe `UpgradePlanModal` (egen)
- Ikke designe tilbake-aktivering-flyt (separat — bruker går til `/meg/abonnement` igjen)
- Ikke designe coach-side-kansellering (CoachHQ-tier — egen modal i Fase 6+)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
