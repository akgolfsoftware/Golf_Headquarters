# AK Golf Platform — Modal — ChangePasswordModal

## Identitet

- **Produkt:** Shared (CoachHQ + PlayerHQ)
- **URL:** Modal — åpnes fra `/admin/settings/bruker`, `/admin/settings/sikkerhet`, `/meg/profil`
- **Arketype:** F — Settings + profile (sikkerhets-modal)
- **Tier-gating:** Ikke relevant
- **HTML-referanse:** `wireframe/screen-deck/shared/modals/change-password.html` (lag ny)
- **Audit:** finnes ikke ennå

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

ChangePassword er sentral sikkerhets-modal. Krever 3 ting: nåværende passord (re-auth), nytt passord (med live styrke-validering), og bekreftelse. Etter suksess: alle andre sesjoner logges ut, bruker bes om å logge inn på nytt på denne enheten (eller velg "Hold meg innlogget her").

## Layout — UNIKT for denne modalen

Modal centrert, max-bredde 480px.

### Header
- Tittel: "Endre passord"
- Close-X (med confirm hvis dirty)

### Body

**Felt 1: Nåværende passord**
- Label + input (type=password)
- "Vis"-toggle (eye-ikon)
- Helper-tekst: "Bekreft hvem du er"

**Felt 2: Nytt passord**
- Label + input
- "Vis"-toggle
- **Styrke-meter** under input (live):
  - 4-segment-bar (rød / oransje / gul / grønn)
  - Tekst-label: "Svakt" / "Middels" / "Bra" / "Sterkt"
- **Krav-sjekkliste** (live, hver linje får checkmark når oppfylt):
  - ✓ Min 12 tegn
  - ✓ Minst 1 stor bokstav
  - ✓ Minst 1 tall
  - ✓ Minst 1 spesialtegn
  - ✓ Ikke samme som tidligere passord
  - ✓ Ikke et vanlig passord (sjekk mot liste)

**Felt 3: Bekreft nytt passord**
- Label + input
- Live-validering: "Match" (grønn) eller "Stemmer ikke" (rød)

**Toggle: "Hold meg innlogget på denne enheten"**
- Default: på
- Tekst-forklaring: "Andre enheter logges ut for sikkerhet"

### Footer (action-bar)

- `Avbryt` (ghost)
- `Lagre nytt passord` (primary, disabled inntil alle krav oppfylt + match)

## States

### State 1: Tom (default)
Alle felter tomme, alle krav muted (ingen check), Lagre-knapp disabled.

### State 2: Skriver
- Krav får checkmarks live
- Styrke-meter oppdaterer
- Match-status vises

### State 3: Lagrer
- Lagre-knapp viser spinner + "Lagrer…"
- Felter disablet

### State 4: Suksess
- Modal-content fader til check + "Passord endret"
- Etter 2 sek: Modal lukkes + redirect til /login (eller toast hvis "Hold meg innlogget" på)

### State 5: Feil
- Inline rød tekst over relevante felt:
  - "Nåværende passord stemmer ikke" (mest vanlig)
  - "Nytt passord oppfyller ikke kravene"
  - "Server-feil. Prøv igjen."
- Lagre-knapp re-aktiveres

## Klikkbare elementer

UNIKT:

| Element | States |
|---|---|
| Vis-toggle (eye) | default, active (eye-off), klikk → toggle type=text/password |
| Krav-sjekkliste | hver linje: muted (default), accent + checkmark (oppfylt) |
| Styrke-meter | 0-segments (rød), 1-2 (oransje/gul), 3-4 (grønn) |
| "Hold meg innlogget" toggle | av/på (accent) |
| "Lagre" | disabled (default), enabled, hover, loading, success |

## Empty / loading / error

- **Tom (initial):** Lagre-knapp disabled, helper-text under hver input
- **Server-error 401 (feil nåværende):** Inline rød "Stemmer ikke" + auto-fokus tilbake
- **Server-error 422 (passord brukt før):** "Du har brukt dette passordet før. Velg et annet."
- **Network-error:** Toast "Nettverksfeil — prøv igjen"

## Sikkerhets-noter (kontekst)

- Submit kaller Supabase `updateUser({password})` server-side
- Etter suksess: kall `auth.signOut({ scope: 'others' })` for å revoke andre sesjoner
- Audit-log skriver "Passord endret av {userId} fra {ip}"

## Ønsket output fra Claude Design

1. State 1 (tom modal) lyst tema
2. State 2 (skriver, 4/6 krav oppfylt, styrke "Bra")
3. State 4 (suksess-state)
4. State 5 (feil — feil nåværende passord)
5. State 1 mørkt tema
6. Mobil ≤640px — modal full bredde, action-bar sticky bunn

## Ikke-mål

- Ikke designe "glemt passord"-flyt (egen — `/auth/forgot-password`, batch-9)
- Ikke implementere have-i-been-pwned-sjekk (kode-jobb)
- Ikke designe SSO-utløsing av passord-endring (Pro+)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
