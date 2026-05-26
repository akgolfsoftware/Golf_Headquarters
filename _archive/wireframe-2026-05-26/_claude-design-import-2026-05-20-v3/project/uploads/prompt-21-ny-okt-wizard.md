# Prompt 21 — Ny økt-wizard (full-page redesign)

## Hensikt

`/portal/ny-okt` er i dag 57 linjer stub. Lag full 4-stegs wizard for å opprette en egen treningsøkt: type → drills → tid/sted → bekreft.

## Trigger

Klikk "Ny økt" i hjem, kalender, eller workbench.

## Layout (full-page, ikke modal)

- Container max-width 960 px, cream, `py-12 px-6`.
- Header: eyebrow "PLAYERHQ · NY ØKT", tittel Inter Tight 36 px italic "*Lag en økt*"
- Progress-bar 4 steg (JetBrains Mono): "1 Type · 2 Drills · 3 Tid · 4 Bekreft", aktiv lime.

### Steg 1 — Type

- 4 store pyramide-cards i 2×2 grid:
  - TEK · teknikk · forest
  - SLAG · slag-trening · lime accent
  - SPILL · banespill · forest dark
  - FYS · fysisk · cream-grey
- Hver card: ikon (Dumbbell/Target/Flag/HeartPulse), beskrivelse, antall drills tilgjengelig
- Tittel-input "Navn på økten" Inter Tight
- Varighet-pills "30 / 45 / 60 / 75 / 90 min"

### Steg 2 — Drills

- Søke-input + filter-piller
- 2-kol grid drill-cards (klikk for å legge til)
- Sidekolonne høyre: "Valgte drills" — drag-to-reorder, tid pr drill JetBrains Mono
- Totalt-bar nederst: total tid + advarsel hvis avvik fra steg 1

### Steg 3 — Tid/sted

- Dato + tidspunkt-velger
- Fasilitet Select (GFGK Performance Studio, Mulligan, etc.)
- Coach Select (valgfritt)
- Notat textarea

### Steg 4 — Bekreft

- Stor sammendrag-card: alle valg
- Knapper: "Lag og lukk", "Lag og start live"

## Komponenter

- `Stepper`, `Card`, `Input`, `Select`, `DatePicker`, `Tabs`
- Lucide: Dumbbell, Target, Flag, HeartPulse, Search, Filter, GripVertical, Clock, MapPin, User, Check, ArrowRight, ArrowLeft

## Eksempel-data

```
Type: TEK
Navn: "Iron contact morgen"
Varighet: 60 min
Drills: Half-swing 10×, Impact-bag 15×, Towel-drill 8×
Dato: 21. mai, 09:00
Fasilitet: GFGK Performance Studio
Coach: ingen
```

## Branding-krav

- Pyramide-fargene konsekvent.
- JetBrains Mono for varighet/tid.
- Inter Tight italic for "Lag en økt"-hero.
- Norsk bokmål.

## Tilstander

- **Tier-låst**: GRATIS får kun TEK + 30 min. Paywall-modal ved forsøk.
- **Lagrer**: spinner i CTA.
- **Suksess**: redirect til `/portal/tren/[sessionId]`.
