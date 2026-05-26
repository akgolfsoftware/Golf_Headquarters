# Prompt 17 — Mål rediger (modal)

## Hensikt
La spilleren endre detaljer på et eksisterende mål: tittel, frist, måltall, beskrivelse.

## Trigger
Tre-prikker-meny på mål-kort → "Rediger". URL/modal: `/portal/mal/goal/[id]/redigér`.

## Layout
Sentrert modal 560px. Header med mål-tittel + "Rediger mål". Body: form med felter. Footer: Avbryt + Lagre + Slett mål (destructive ghost, langt til venstre).

## Komponenter
- Type-badge øverst: "Resultat-mål" eller "Prosess-mål" (read-only)
- Felter:
  - Tittel (text)
  - Beskrivelse (textarea 200 tegn)
  - Måltall (number) + enhet-select (slag, % FIR, %-greens, dager, økter)
  - Nåværende verdi (number, read-only — synkes auto)
  - Frist (date)
  - Synlighet (radio: privat / coach / team / offentlig)
- Progress-bar visning øverst: nåværende vs mål med prosent
- Footer: Slett mål (destructive ghost venstre), Avbryt + Lagre (høyre)

## Eksempel-data
- Mål-ID: g_4471
- Type: Resultat-mål
- Tittel: "Få handicap til +5,0"
- Beskrivelse: "Senke HCP fra +3,5 til +5,0 før sommerferien."
- Måltall: 5,0 (HCP)
- Nåværende: +3,5
- Frist: 30. juni 2026
- Synlighet: coach
- Opprettet: 12. januar 2026
- Progress: 60%

## Branding
- AK Golf design system (cream #FAFAF7, forest #005840, lime #D1F843, destructive #A32D2D)
- Fonter: Inter Tight (titler), Inter (UI), JetBrains Mono (tall/dato), Instrument Serif italic (sparsom)
- Lucide-ikoner stroke 1.75
- Norsk bokmål, ingen emojier

## Form-felter
- `tittel` text required min 3 max 80
- `beskrivelse` text optional max 200
- `mal_verdi` number required
- `enhet` enum required
- `frist` date required (må være i fremtiden)
- `synlighet` enum required

## Submit / actions
- Lagre: PATCH `/api/portal/goals/[id]` → toast → modal lukkes
- Slett mål: åpner mini-bekreftelses-modal "Slette dette målet?" → DELETE `/api/portal/goals/[id]`
- Avbryt: hvis dirty, "Forkast endringer?"-mini-modal

## Tekniske krav
- Single HTML, inline CSS, Google Fonts
- Inline SVG Lucide
- Norsk datoformat
- A11y: form har required-validation + aria-invalid på feil
- Trap focus i modal
