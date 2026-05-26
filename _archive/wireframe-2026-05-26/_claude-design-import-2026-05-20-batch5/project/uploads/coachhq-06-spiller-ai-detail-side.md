# CoachHQ — AI-Caddie for spiller (coach-view)

**Rute:** `/admin/elever/[id]/ai`.

## Kontekst
Anders ser AI-Caddiens samtaler og anbefalinger for Markus. Kan godkjenne forslag, redigere, lære AI-en hvilke retninger som er riktige.

## Formål
- Vise hva AI har foreslått til Markus
- Anders kan godkjenne/avvise/redigere før spilleren får det
- Trene AI-en på Anders' coaching-stil

## Layout

**Header:**
- "AI-Caddie for Markus" Inter Tight 700 28px
- "23 forslag siste 30 dager · 18 godkjent · 5 avvist" mono
- Toggle "Auto-godkjenn lavrisiko" høyre

**To-kolonne layout:**

### Venstre — Samtale-strom
Chronologisk liste av AI-Markus-samtaler. Hver entry:
- Tidsstempel mono
- Avatar (AI vs Markus)
- Innhold-blokk
- Hvis AI-forslag: "Venter godkjenning"-pill lime + Godkjenn/Avvis/Rediger-knapper

### Høyre — Anbefalinger-panel
- "Aktive forslag · 5"
- Kort for hver:
  - Type: "Ny drill: chipping low-flight"
  - Begrunnelse fra AI: "Markus mister 0.4 SG på chipping fra 15-25m"
  - Forventet impact mono: "+0.2 SG over 4 uker"
  - 3 knapper: Godkjenn (forest), Rediger (outline), Avvis (destructive light)

**Coach-tilbakemelding-felt:**
Bunn: "Lær AI-en din coaching-stil" tekstområde
Eksempel: "Foretrekk volum fremfor intensitet for hcp <5"

## Branding
Cream bg, hvit chat-bobler venstre, forest-light card for AI-bobler, lime aksent på "venter godkjenning".
