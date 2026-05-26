# CoachHQ — Inviter teammedlem (modal)

**Trigger:** "Inviter medlem" på `/admin/team`.

## Kontekst
Anders inviterer ny assistent-coach.

## Formål
- Sende invitasjon via e-post
- Tildele rolle og tilganger
- Default-spillere som skal følges

## Layout
Modal 560px bredde.

**Header:**
- "Inviter teammedlem" Inter Tight 600 22px
- X høyre

**Form:**
- E-post (validering)
- Fornavn + Etternavn
- Rolle dropdown:
  - Hovedcoach (kun én)
  - Coach
  - Assistent-coach
  - Fysisk-trener
  - Sportspsykolog
  - Admin
- Tilgangs-toggles (basert på rolle):
  - Se alle spillere / Bare tildelte
  - Endre planer (toggle)
  - Se økonomi (toggle, default off)
  - Godkjenne på vegne av Anders (toggle, default off)
- Tildel spillere (multi-select): "0 valgt" (kan settes senere)
- Personlig melding-felt (tekstområde, valgfri)

**Footer:**
- "Avbryt" outline
- "Send invitasjon" forest fill

## Bekreftelse
Toast "Invitasjon sendt til [navn] · Lenken er gyldig i 7 dager"

## Branding
Cream modal, hvit innhold, forest CTA, lime aktive toggles.
