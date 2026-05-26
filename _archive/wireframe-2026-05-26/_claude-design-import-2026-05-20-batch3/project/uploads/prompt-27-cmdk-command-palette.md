# Prompt 27 — Cmd+K command palette (PlayerHQ-tilpasset)

## Hensikt

Speilet fra CoachHQ-palette (`feat(playerhq): global Cmd+K command palette mirrored from CoachHQ`). Designer-prompt for å skjerpe PlayerHQ-spesifikt innhold, kategorier og snarveier.

## Trigger

Tastetrykk `Cmd+K` / `Ctrl+K`, eller klikk søke-ikon i header.

## Layout

- Modal sentrert øverst (`top-[15%]`), 640 × auto, cream, `rounded-2xl`, drop-shadow stor.
- Søkeinput: stor 56 px høy, font-size 18 px Inter, ikon Search venstre, hint "Søk eller naviger…", `Esc` lukker.
- Resultat-liste maks-h 480 px, scrollable, virtualisert:
  - Section-headers JetBrains Mono 10 px uppercase
  - Rader: ikon venstre + tittel + breadcrumb høyre + kbd-shortcut
  - Hover/aktiv: lime-tint bakgrunn
- Bunn-bar muted:
  - "↑↓ Naviger · ↵ Velg · Esc Lukk · ⌘K åpne"
  - Tier-badge høyre

## Seksjoner (PlayerHQ-spesifikt)

1. **Hurtighandlinger** — "Logg runde", "Ny økt", "Send melding til coach", "Be om coach-time"
2. **Mine sider** — Hjem, Plan, Tren, Mål, Coach, Profil, Bookinger, Abonnement
3. **Søk i dataene mine** — runder, økter, drills, baner, mål, milepæler
4. **Spør AI-coach** — direkte spørsmål-prefiks "?"
5. **Innstillinger** — sikkerhet, varsler, foreldre

## Komponenter

- `cmdk` (eller egen), `Dialog`, virtualisert liste
- Lucide: Search, Command, ArrowUp, ArrowDown, CornerDownLeft, ChevronRight

## Eksempel-data

```
Søk: "iron"
Treff:
  - Hurtig: Ny økt med iron drills
  - Drills: "Iron contact half-swing", "Long iron carry"
  - Runder: 14. mai - hvor iron-snitt var bedre
  - TrackMan: sessions filtrert 7-iron
  - AI: Spør "Hvorfor er iron-spillet mitt off?"
```

## Branding-krav

- Cream + lime-tint aktiv rad.
- JetBrains Mono for shortcuts og kbd.
- Norsk bokmål.

## Tilstander

- **Tom søk**: vis populære handlinger.
- **Ingen treff**: empty-state med Lucide Search og forslag.
- **Tier-låst**: lime "Pro"-badge på låste valg + paywall ved klikk.
