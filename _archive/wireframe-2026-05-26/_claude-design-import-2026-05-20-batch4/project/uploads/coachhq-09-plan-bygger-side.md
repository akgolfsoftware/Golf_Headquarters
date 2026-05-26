# CoachHQ — Plan-bygger (side)

**Rute:** `/admin/plans/new` eller `/admin/plans/[planId]`.

## Kontekst
Anders bygger en ny treningsplan for Markus (eller for en gruppe). Plan kan være 4 uker, 12 uker, eller helsesong. Drag-and-drop økter fra mal-bibliotek inn i kalenderen.

## Formål
- Visuell plan-bygger
- Mal-bibliotek venstre kolonne
- Kalender høyre
- Auto-populate basert på AI-forslag

## Layout

**Header:**
- "Ny plan for Markus" Inter Tight 700 28px
- "4 uker · 20. mai → 16. juni" mono
- Auto-save indikator "Lagret 14:23" mono muted
- Høyre: "AI-forslag", "Forhåndsvis", "Publiser plan" filled forest

**Trekolonne-layout:**

### Venstre (240px) — Mal-bibliotek
Søk + filter chips. Liste over mal-økter, hver:
- Ikon (Lucide Activity for fysisk, Target for teknisk)
- Navn ("Putt 4×8")
- Varighet mono "45 min"
- Draggable handle

### Midt — Plan-kalender (4-uker-grid)
4 rader (uker), 7 kolonner (dager). Hver celle 120×100px.
- Drop-zone som lyser opp lime ved drag-over
- Plasserte økter vises som lime/forest blokker med tittel + tid
- Klikk blokk: redigerings-popover
- Tom celle: liten "+"-knapp midt
- Markert "i dag"-celle med lime border

### Høyre (300px) — Konfigurering
- Plan-tittel input
- Mål-felt (tekstområde)
- KPI-mål (3 input: f.eks. SG-Putt +0.3)
- Periode-velger (start + slutt)
- Volum-fordeling visuell: Teknisk 60%, Fysisk 30%, Mental 10% (sliders)

**Footer (sticky):**
"Forrige steg" outline + "Lagre som mal" outline + "Publiser plan" forest

## Branding
Cream bg, hvit kalender-grid, lime drop-zone, forest blokker. Mono i tider.
