# PlayerHQ — Bytt/velg coach-modal

**Trigger:** "Bytt coach"-link i profil eller "Velg coach" i onboarding.

## Kontekst
Markus er tilkoblet Anders Kristiansen. AK Golf Academy har flere coacher (Anders + 2 til). Markus kan bytte hvis han vil. Krever bekreftelse fra ny coach.

## Formål
- Vise tilgjengelige coacher i klubben
- Tillate forespørsel om bytte (kreves godkjenning)
- Forklare hva som skjer med eksisterende plan/historikk

## Layout
Modal 720px bredde.

**Header:**
- Tittel "Velg din coach"
- Underlinje "Forespørsel sendes til ny coach for godkjenning"

**Coach-kort (3 stk, grid 3 kolonner):**
Hvert kort:
- Avatar 80px topp-senter
- Navn (Inter Tight 600 18px)
- Tittel under (muted, mono small caps "HOVEDCOACH")
- Spesialfelt-pills: "Drive", "Putt", "Junior"
- "12 aktive spillere · 4.9 ★"
- "Les mer"-link

Aktiv coach markert med lime border + "Din coach"-badge.

**Bunn-info-card:**
Forest-bg light, ikon Lucide InfoCircle:
"Hva skjer ved bytte? Treningsplanen din følger med. Historikken beholdes. Ny coach godkjenner i løpet av 24 timer."

**Footer:**
- Outline "Avbryt" venstre
- Filled forest "Send forespørsel" høyre (disabled før ny coach valgt)

## Interaksjon
- Klikk coach-kort: lime ring rundt, "Send forespørsel"-knapp aktiveres
- Send → loader 1s → toast "Forespørsel sendt til [navn]"

## Branding
Cream modal-bg, hvite coach-kort, forest CTA, lime accent på aktiv.
