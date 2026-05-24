# CoachHQ — Økt-detalj (coach-modal)

**Trigger:** Klikk på økt i kalender, fra spiller-profil eller godkjenninger-kø.

## Kontekst
Anders ser detaljene på en planlagt eller utført økt for Markus. Kan godkjenne, redigere, kommentere, eller markere fullført.

## Formål
- Coach-versjon av økt-detalj (mer enn spilleren ser)
- Redigere før spilleren får varsel
- Logge observasjoner etter live-økt

## Layout
Modal 720px bredde, høyde 80vh.

**Header:**
- "Putt 4×8 · Tirsdag 21. mai 16:00" Inter Tight 600 22px
- Status-pille: "VENTER GODKJENNING" lime / "PLANLAGT" / "GJENNOMFØRT"
- X høyre

**Innhold scrollbar:**

### Plan-blokk
- Type: Teknisk · Putt
- Varighet: 60 min
- Lokasjon: Performance Studio bay 2
- Spiller: Markus avatar + navn

### Drilrer (3 stk)
Hver drill-card:
- Navn "8 puttinger fra 3m"
- Antall sett · tid
- Suksesskriterier mono
- Hover: "Bytt drill"-link

### Anders' notat-felt
Tekstområde "Hva skal vi fokusere på"

### Etter-økt-felt (hvis gjennomført)
Markus' selvrapport (rate 1-5, tekstkommentar) + Anders' tilbakemelding-felt.

### Trackman-data-knapp
"Importer Trackman" hvis økt er gjort

**Footer:**
- Slett-link destructive venstre
- "Avvis" outline + "Godkjenn" forest (hvis venter godkjenning)
- Eller "Marker fullført" / "Rediger"

## Branding
Cream modal, hvite paneler, lime status-pill, forest knapper.
